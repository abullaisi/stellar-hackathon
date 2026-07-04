#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Env, String, Symbol, Vec,
};

// A member's contribution to the community pool
#[contracttype]
#[derive(Clone)]
pub struct Contribution {
    pub member: String,
    pub amount: i128,
    pub note: String,
}

// Storage key untuk data kontribusi
const CONTRIB: Symbol = symbol_short!("CONTRIB");

#[contract]
pub struct CommunityPoolContract;

#[contractimpl]
impl CommunityPoolContract {
    // Record a member's contribution to the pool
    pub fn contribute(env: Env, member: String, amount: i128, note: String) {
        let mut list: Vec<Contribution> = env
            .storage()
            .instance()
            .get(&CONTRIB)
            .unwrap_or(vec![&env]);
        list.push_back(Contribution {
            member,
            amount,
            note,
        });
        env.storage().instance().set(&CONTRIB, &list);
    }

    // List every contribution recorded in the pool
    pub fn get_contributions(env: Env) -> Vec<Contribution> {
        env.storage()
            .instance()
            .get(&CONTRIB)
            .unwrap_or(vec![&env])
    }

    // Current pool total across all contributions
    pub fn get_total(env: Env) -> i128 {
        let list: Vec<Contribution> = env
            .storage()
            .instance()
            .get(&CONTRIB)
            .unwrap_or(vec![&env]);
        let mut total: i128 = 0;
        for c in list.iter() {
            total += c.amount;
        }
        total
    }

    // Number of contributions recorded
    pub fn get_count(env: Env) -> u32 {
        let list: Vec<Contribution> = env
            .storage()
            .instance()
            .get(&CONTRIB)
            .unwrap_or(vec![&env]);
        list.len()
    }
}
