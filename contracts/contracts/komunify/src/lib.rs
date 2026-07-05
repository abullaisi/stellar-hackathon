#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, vec, Address, Env,
    Symbol, Vec,
};

// One recorded subscription payment
#[contracttype]
#[derive(Clone)]
pub struct Subscription {
    pub member: Address,
    pub amount: i128,
    pub paid_at: u64, // ledger timestamp
}

// Where the money goes, in basis points (sum must be 10_000)
#[contracttype]
#[derive(Clone)]
pub struct SplitConfig {
    pub token: Address,    // payment asset (XLM SAC on testnet/mainnet)
    pub owner: Address,    // project owner
    pub manager: Address,  // community manager
    pub platform: Address, // Komunify
    pub owner_bps: u32,
    pub manager_bps: u32,
    pub platform_bps: u32,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    InvalidSplit = 2,
    AmountTooLow = 3,
}

const CONFIG: Symbol = symbol_short!("CONFIG");
const SUBS: Symbol = symbol_short!("SUBS");
const VOLUME: Symbol = symbol_short!("VOLUME");

// Minimum subscription: 1 XLM (7 decimals). Placeholder until pricing is modeled.
const MIN_AMOUNT: i128 = 10_000_000;

#[contract]
pub struct KomunifyContract;

#[contractimpl]
impl KomunifyContract {
    // Deploy-time setup: payment token, three payout addresses, shares in bps.
    // Shares are constructor args (not constants) because 70/20/10 is a
    // placeholder until the team models real economics.
    pub fn __constructor(
        env: Env,
        token: Address,
        owner: Address,
        manager: Address,
        platform: Address,
        owner_bps: u32,
        manager_bps: u32,
        platform_bps: u32,
    ) {
        if owner_bps + manager_bps + platform_bps != 10_000 {
            soroban_sdk::panic_with_error!(&env, Error::InvalidSplit);
        }
        let config = SplitConfig {
            token,
            owner,
            manager,
            platform,
            owner_bps,
            manager_bps,
            platform_bps,
        };
        env.storage().instance().set(&CONFIG, &config);
    }

    // One payment in, three transfers out, one subscription recorded.
    pub fn subscribe(env: Env, member: Address, amount: i128) -> Result<(), Error> {
        member.require_auth();

        if amount < MIN_AMOUNT {
            return Err(Error::AmountTooLow);
        }
        let config: SplitConfig = env
            .storage()
            .instance()
            .get(&CONFIG)
            .ok_or(Error::NotInitialized)?;

        let owner_cut = amount * (config.owner_bps as i128) / 10_000;
        let manager_cut = amount * (config.manager_bps as i128) / 10_000;
        // Platform absorbs rounding dust so the three cuts always sum to amount
        let platform_cut = amount - owner_cut - manager_cut;

        let asset = token::Client::new(&env, &config.token);
        asset.transfer(&member, &config.owner, &owner_cut);
        asset.transfer(&member, &config.manager, &manager_cut);
        asset.transfer(&member, &config.platform, &platform_cut);

        let sub = Subscription {
            member: member.clone(),
            amount,
            paid_at: env.ledger().timestamp(),
        };
        let mut subs: Vec<Subscription> =
            env.storage().instance().get(&SUBS).unwrap_or(vec![&env]);
        subs.push_back(sub);
        env.storage().instance().set(&SUBS, &subs);

        let volume: i128 = env.storage().instance().get(&VOLUME).unwrap_or(0);
        env.storage().instance().set(&VOLUME, &(volume + amount));

        env.events().publish(
            (symbol_short!("subscribe"), member),
            (amount, owner_cut, manager_cut, platform_cut),
        );
        Ok(())
    }

    // Every subscription recorded
    pub fn get_subscribers(env: Env) -> Vec<Subscription> {
        env.storage().instance().get(&SUBS).unwrap_or(vec![&env])
    }

    // Number of subscriptions
    pub fn get_count(env: Env) -> u32 {
        let subs: Vec<Subscription> = env.storage().instance().get(&SUBS).unwrap_or(vec![&env]);
        subs.len()
    }

    // Total volume paid through the contract
    pub fn get_volume(env: Env) -> i128 {
        env.storage().instance().get(&VOLUME).unwrap_or(0)
    }

    // Split configuration (addresses + bps), for the frontend dashboard.
    // Returns Result, not Option: stellar-sdk 13.x in the dapp cannot parse
    // Option<struct> spec entries, and the constructor guarantees CONFIG anyway.
    pub fn get_config(env: Env) -> Result<SplitConfig, Error> {
        env.storage()
            .instance()
            .get(&CONFIG)
            .ok_or(Error::NotInitialized)
    }
}

#[cfg(test)]
mod test;
