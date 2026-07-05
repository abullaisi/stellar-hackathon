#![cfg(test)]

use crate::{Error, KomunifyContract, KomunifyContractClient};
use soroban_sdk::{testutils::Address as _, token, Address, Env};

const XLM: i128 = 10_000_000; // 1 XLM in stroops

struct Setup {
    env: Env,
    client_addr: Address,
    member: Address,
    owner: Address,
    manager: Address,
    platform: Address,
    token: token::Client<'static>,
}

fn setup() -> Setup {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let owner = Address::generate(&env);
    let manager = Address::generate(&env);
    let platform = Address::generate(&env);

    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_client = token::Client::new(&env, &sac.address());
    let token_admin = token::StellarAssetClient::new(&env, &sac.address());
    token_admin.mint(&member, &(100 * XLM));

    let contract_id = env.register(
        KomunifyContract,
        (
            sac.address(),
            owner.clone(),
            manager.clone(),
            platform.clone(),
            7_000u32,
            2_000u32,
            1_000u32,
        ),
    );

    Setup {
        env,
        client_addr: contract_id,
        member,
        owner,
        manager,
        platform,
        token: token_client,
    }
}

#[test]
fn subscribe_splits_70_20_10() {
    let s = setup();
    let client = KomunifyContractClient::new(&s.env, &s.client_addr);

    client.subscribe(&s.member, &(10 * XLM));

    assert_eq!(s.token.balance(&s.owner), 7 * XLM);
    assert_eq!(s.token.balance(&s.manager), 2 * XLM);
    assert_eq!(s.token.balance(&s.platform), 1 * XLM);
    assert_eq!(s.token.balance(&s.member), 90 * XLM);
    assert_eq!(client.get_count(), 1);
    assert_eq!(client.get_volume(), 10 * XLM);
    assert_eq!(client.get_subscribers().len(), 1);

    let config = client.get_config();
    assert_eq!(config.owner_bps, 7_000);
    assert_eq!(config.manager_bps, 2_000);
    assert_eq!(config.platform_bps, 1_000);
}

#[test]
fn rounding_dust_goes_to_platform() {
    let s = setup();
    let client = KomunifyContractClient::new(&s.env, &s.client_addr);

    // 1.0000001 XLM: owner floor 7_000_000, manager floor 2_000_000,
    // platform takes the remainder so the cuts sum exactly to the amount
    let amount: i128 = 10_000_001;
    client.subscribe(&s.member, &amount);

    let owner_cut = s.token.balance(&s.owner);
    let manager_cut = s.token.balance(&s.manager);
    let platform_cut = s.token.balance(&s.platform);
    assert_eq!(owner_cut, 7_000_000);
    assert_eq!(manager_cut, 2_000_000);
    assert_eq!(platform_cut, 1_000_001);
    assert_eq!(owner_cut + manager_cut + platform_cut, amount);
}

#[test]
fn subscribe_below_minimum_fails() {
    let s = setup();
    let client = KomunifyContractClient::new(&s.env, &s.client_addr);

    let result = client.try_subscribe(&s.member, &(XLM / 2));
    assert_eq!(result, Err(Ok(Error::AmountTooLow)));
    assert_eq!(client.get_count(), 0);
    assert_eq!(client.get_volume(), 0);
}

#[test]
#[should_panic]
fn constructor_rejects_bad_split() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let c = Address::generate(&env);

    // 70 + 20 + 20 != 100 → constructor must panic
    env.register(
        KomunifyContract,
        (sac.address(), a, b, c, 7_000u32, 2_000u32, 2_000u32),
    );
}
