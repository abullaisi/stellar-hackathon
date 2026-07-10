#![no_std]

//! `usdc` — mock SEP-41 token for Komunify testnet demos (D-002).
//!
//! Implements `soroban_sdk::token::TokenInterface` in full, plus an open testnet
//! `faucet()` rate-limited to once per 24h per address. See docs/CONTRACT_SPEC.md §1.
//!
//! STUB: signatures and types are frozen per CONTRACT_SPEC.md. Bodies are
//! `unimplemented!()` until Lane A (Phase 1) fills them in.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token::TokenInterface, Address, Env,
    MuxedAddress, String,
};

/// Fixed faucet payout: 500 USDC at 7 decimal places.
pub const FAUCET_AMOUNT: i128 = 500_0000000;
/// Faucet cooldown, in seconds.
pub const FAUCET_COOLDOWN_SECS: u64 = 86_400;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    FaucetCooldown = 14,
}

#[contracttype]
pub enum DataKey {
    Admin,
    FaucetAt(Address),
}

#[contract]
pub struct UsdcContract;

#[contractimpl]
impl UsdcContract {
    /// One-time setup. admin may mint freely.
    pub fn init(env: Env, admin: Address) {
        let _ = (env, admin);
        unimplemented!()
    }

    /// Admin mint. require_auth(admin).
    pub fn mint(env: Env, to: Address, amount: i128) {
        let _ = (env, to, amount);
        unimplemented!()
    }

    /// Open testnet faucet. require_auth(caller).
    /// Mints FAUCET_AMOUNT (500_0000000 = 500 USDC at 7dp) to caller.
    /// Panics with Error::FaucetCooldown if called again within 86400 seconds.
    pub fn faucet(env: Env, caller: Address) {
        let _ = (env, caller);
        unimplemented!()
    }

    /// Unix seconds when `who` may next call faucet(). 0 if never used.
    pub fn faucet_available_at(env: Env, who: Address) -> u64 {
        let _ = (env, who);
        unimplemented!()
    }
}

#[contractimpl]
impl TokenInterface for UsdcContract {
    fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let _ = (env, from, spender);
        unimplemented!()
    }

    fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        let _ = (env, from, spender, amount, expiration_ledger);
        unimplemented!()
    }

    fn balance(env: Env, id: Address) -> i128 {
        let _ = (env, id);
        unimplemented!()
    }

    fn transfer(env: Env, from: Address, to: MuxedAddress, amount: i128) {
        let _ = (env, from, to, amount);
        unimplemented!()
    }

    fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        let _ = (env, spender, from, to, amount);
        unimplemented!()
    }

    fn burn(env: Env, from: Address, amount: i128) {
        let _ = (env, from, amount);
        unimplemented!()
    }

    fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        let _ = (env, spender, from, amount);
        unimplemented!()
    }

    fn decimals(env: Env) -> u32 {
        let _ = env;
        unimplemented!()
    }

    fn name(env: Env) -> String {
        let _ = env;
        unimplemented!()
    }

    fn symbol(env: Env) -> String {
        let _ = env;
        unimplemented!()
    }
}

// Unit tests land in Phase 1, Lane A (see docs/CONTRACT_SPEC.md §3).
