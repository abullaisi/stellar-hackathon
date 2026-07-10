#![no_std]

//! `komunify` — subscriptions, content registry, read accounting, payouts.
//!
//! Attribution model: per-member (D-009), not shared-pool. Each subscription's
//! post-fee revenue is a budget owned by that member for that epoch, split only
//! across the content that member read. See docs/CONTRACT_SPEC.md §2-3.
//!
//! STUB: types, signatures, storage keys, and the error enum are frozen per
//! CONTRACT_SPEC.md. Bodies are `unimplemented!()` until Lane A (Phase 1) fills
//! them in.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub admin: Address,
    pub token: Address,
    pub platform: Address,
    pub platform_bps: u32,
    pub price: i128,
    pub epoch_secs: u64,
    pub genesis: u64,
}
// NOTE: no period_secs. The epoch IS the billing period (D-009). Subscribing in
// epoch e grants access for epoch e only.

#[contracttype]
#[derive(Clone)]
pub struct Content {
    pub id: u64,
    pub creator: Address,
    pub managers: Vec<Address>,
    pub sha256: BytesN<32>,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct Stats {
    pub total_subs: u64,
    pub total_volume: i128,
    pub total_claimed: i128,
    pub content_count: u64,
    pub manager_count: u32,
}

#[contracttype]
pub enum DataKey {
    Config,
    Stats,
    NextContentId,
    Manager(Address),
    Content(u64),
    Sub(Address),
    Budget(u32, Address),
    MemberReads(u32, Address),
    MemberContents(u32, Address),
    Read(u32, u64, Address),
    ContentReads(u32, u64),
    Settled(u32, Address),
    Accrued(Address),
    Dust,
}

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAdmin = 3,
    NotManager = 4,
    NotContentCreator = 5,
    SubExpired = 6,
    ContentNotFound = 7,
    ContentInactive = 8,
    EpochNotClosed = 9,
    AlreadySettled = 10,
    NothingToClaim = 11,
    InvalidBps = 12,
    InvalidAmount = 13,
    FaucetCooldown = 14, // usdc crate
    AlreadySubscribed = 15,
}

#[contract]
pub struct KomunifyContract;

#[contractimpl]
impl KomunifyContract {
    // ----- mutating -----

    /// One-time. Sets Config, zeroes Stats, NextContentId = 1, genesis = now.
    pub fn init(env: Env, cfg: Config) {
        let _ = (env, cfg);
        unimplemented!()
    }

    /// Admin-gated whitelist. require_auth(admin). Adjusts Stats.manager_count.
    pub fn set_manager(env: Env, who: Address, enabled: bool) {
        let _ = (env, who, enabled);
        unimplemented!()
    }

    /// Manager-gated. require_auth(caller). caller must be a whitelisted manager.
    /// Creates Content { id: next, creator: caller, managers: vec![caller], sha256, active: true }.
    /// Returns the new content id.
    pub fn register_content(env: Env, caller: Address, sha256: BytesN<32>) -> u64 {
        let _ = (env, caller, sha256);
        unimplemented!()
    }

    /// require_auth(creator). Only the content's creator may add co-managers.
    /// `who` must be a whitelisted manager. No-op if already present.
    pub fn add_content_manager(env: Env, creator: Address, content_id: u64, who: Address) {
        let _ = (env, creator, content_id, who);
        unimplemented!()
    }

    /// require_auth(creator). Sets Content.active. Inactive content cannot be read.
    /// Already-recorded reads still settle normally.
    pub fn set_content_active(env: Env, creator: Address, content_id: u64, active: bool) {
        let _ = (env, creator, content_id, active);
        unimplemented!()
    }

    /// require_auth(member). Errors AlreadySubscribed if Sub(member) == current_epoch().
    /// NOTE: no shared pool. Each member's budget is theirs alone (D-009).
    /// Emits `subscribed`.
    pub fn subscribe(env: Env, member: Address) {
        let _ = (env, member);
        unimplemented!()
    }

    /// require_auth(member). Errors SubExpired unless is_active(member).
    /// IDEMPOTENT per (epoch, content, member) — must not error on retry.
    /// Emits `accessed` only on the first read.
    pub fn record_access(env: Env, member: Address, content_id: u64) {
        let _ = (env, member, content_id);
        unimplemented!()
    }

    /// Permissionless. Distributes ONE member's budget for ONE past epoch.
    /// Errors EpochNotClosed if `epoch >= current_epoch()`. Errors AlreadySettled
    /// if Settled(epoch, m). See docs/CONTRACT_SPEC.md §3 for the settlement math.
    /// Emits `settled`.
    pub fn settle_member(env: Env, epoch: u32, m: Address) {
        let _ = (env, epoch, m);
        unimplemented!()
    }

    /// require_auth(caller). Errors NothingToClaim if Accrued(caller) == 0.
    /// Transfers Accrued(caller) from contract to caller, zeroes it.
    /// The platform address claims its fees through this same function.
    /// Emits `claimed`.
    pub fn claim(env: Env, caller: Address) {
        let _ = (env, caller);
        unimplemented!()
    }

    /// require_auth(admin). Transfers Dust to Config.platform, zeroes Dust.
    pub fn claim_dust(env: Env, admin: Address) {
        let _ = (env, admin);
        unimplemented!()
    }

    // ----- read-only -----

    pub fn get_config(env: Env) -> Config {
        let _ = env;
        unimplemented!()
    }

    pub fn get_stats(env: Env) -> Stats {
        let _ = env;
        unimplemented!()
    }

    /// (now - genesis) / epoch_secs
    pub fn current_epoch(env: Env) -> u32 {
        let _ = env;
        unimplemented!()
    }

    pub fn epoch_ends_at(env: Env, epoch: u32) -> u64 {
        let _ = (env, epoch);
        unimplemented!()
    }

    pub fn is_manager(env: Env, who: Address) -> bool {
        let _ = (env, who);
        unimplemented!()
    }

    /// Sub(member) == current_epoch()
    pub fn is_active(env: Env, member: Address) -> bool {
        let _ = (env, member);
        unimplemented!()
    }

    /// epoch_ends_at(Sub(member)); 0 if inactive
    pub fn get_subscription(env: Env, member: Address) -> u64 {
        let _ = (env, member);
        unimplemented!()
    }

    /// Errors ContentNotFound
    pub fn get_content(env: Env, content_id: u64) -> Content {
        let _ = (env, content_id);
        unimplemented!()
    }

    pub fn list_content(env: Env, start: u64, limit: u32) -> Vec<Content> {
        let _ = (env, start, limit);
        unimplemented!()
    }

    pub fn has_read(env: Env, epoch: u32, content_id: u64, member: Address) -> bool {
        let _ = (env, epoch, content_id, member);
        unimplemented!()
    }

    /// Display only, does not drive money.
    pub fn get_content_reads(env: Env, epoch: u32, content_id: u64) -> u32 {
        let _ = (env, epoch, content_id);
        unimplemented!()
    }

    pub fn get_budget(env: Env, epoch: u32, member: Address) -> i128 {
        let _ = (env, epoch, member);
        unimplemented!()
    }

    pub fn get_member_reads(env: Env, epoch: u32, member: Address) -> u32 {
        let _ = (env, epoch, member);
        unimplemented!()
    }

    pub fn is_settled(env: Env, epoch: u32, member: Address) -> bool {
        let _ = (env, epoch, member);
        unimplemented!()
    }

    pub fn get_accrued(env: Env, who: Address) -> i128 {
        let _ = (env, who);
        unimplemented!()
    }

    pub fn get_dust(env: Env) -> i128 {
        let _ = env;
        unimplemented!()
    }
}

// Unit tests land in Phase 1, Lane A (see docs/CONTRACT_SPEC.md §3).
