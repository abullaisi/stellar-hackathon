# Komunify

**One subscription. Every community.** Komunify is a consumer payments dApp on Stellar: members pay one subscription to unlock benefits across partner communities, a Soroban contract auto-splits the revenue between platform, project owner, and community manager, and an on-chain dashboard proves the traction.

> Status: building. Started at Build on Stellar Bootcamp Bandung (July 4-5, 2026) as "Communify", a community-pool concept; refined into Komunify (PRD v2.0) for the APAC Stellar Hackathon.

**Track:** Payment Consumer Applications

## Problem

Community members juggle separate subscriptions and memberships across every community they join, so payment friction piles up and the value of belonging gets hard to see. On the other side, community managers and project owners have no simple way to monetize their resources, share partner revenue transparently, or show verifiable traction. Indonesia especially runs on community finance culture (koperasi, patungan, kas komunitas), but the money flows live in notebooks and chat groups: opaque, manual, unverifiable.

## Why Stellar

- **Transactions cost near zero and settle in seconds**, so consumer-scale subscription payments stay economical.
- **Soroban adds programmable payout logic**: subscription records, entitlements, and automated revenue splits run on-chain instead of in a spreadsheet.
- **Anchors bridge rupiah to the network**, so members can think in IDR, not crypto.
- **Asset issuance and a DEX are built into the protocol**, so tokenized partner items and benefits need no custom infrastructure.

## Target Users

1. **Community members** who want one payment flow for bundled perks, premium resources, and discounts across the communities they already belong to.
2. **Community managers** who want to package benefits and receive automated revenue share without manual reconciliation.
3. **Project owners** who want partner-led growth with transparent payout logic and on-chain proof of engagement.

## Proposed Solution

One subscription on Soroban:

1. A member connects a Stellar wallet and pays one subscription on testnet.
2. The contract records the subscription and activates the member's entitlement.
3. The same payment triggers an automated revenue split between platform, project owner, and community manager.
4. Partner benefits (including tokenized items at subscriber discounts) unlock in the member dashboard.
5. A traction dashboard reads subscriber count, payment volume, and payout events straight from the chain.

## Core Features (MVP)

- Unified subscription with multi-benefit access (wallet connect + one testnet payment)
- Automated fee and reward disbursement (Soroban split contract)
- Tokenized digital listing layer (one or two partner items, subscriber pricing)
- On-chain traction dashboard (subscribers, volume, payouts, via Horizon)

## North Star Metric

**Monthly Active Subscribing Members (MASM)** engaging with at least one community benefit or marketplace transaction, reflecting the core value loop: unified access driving real usage and recurring revenue.

Supporting metrics: active community partners onboarded, subscription renewal rate, GMV of tokenized items sold, total automated disbursement volume on-chain.

## What's in this repo now (Level 1: White Belt)

The first working slice: a Stellar testnet dApp where a member connects their wallet and completes a payment. This flow is the foundation of the subscription payment (Feature 1 above).

- Connect and disconnect any major Stellar wallet (Freighter, xBull, Albedo, Lobstr, Hana, and more) via a wallet-selection modal
- Fetch and display the connected wallet's XLM balance
- Fund an unactivated account via Friendbot with one click
- Send an XLM payment on testnet with clear feedback: pending, success with transaction hash (linked to Stellar Expert), or failure state

**Tech stack:** React + Vite · Stellar Wallets Kit (multi-wallet) · `@stellar/stellar-sdk` (Horizon testnet)

## Setup (run locally)

1. Install [Node.js 18+](https://nodejs.org) and a Stellar wallet (e.g. [Freighter](https://www.freighter.app/), xBull, or Albedo)
2. Set your wallet's network to **Testnet**
3. Clone and run:

```bash
git clone https://github.com/yoms07/stellar-hackathon.git
cd stellar-hackathon
npm install
npm run dev
```

4. Open http://localhost:5173, connect Freighter, fund with Friendbot if needed, and send a testnet payment

## Smart Contract: CommunityPool (Soroban)

The first Komunify contract, in [`contract/src/lib.rs`](contract/src/lib.rs), written at the bootcamp. An on-chain contribution ledger; it is the code base that the subscription-record + revenue-split contract evolves from:

| Function | What it does |
|---|---|
| `contribute(member, amount, note)` | Record a member's contribution to the pool |
| `get_contributions()` | List every contribution |
| `get_total()` | Current pool total |
| `get_count()` | Number of contributions recorded |

Built with the Stellar CLI (via [soroban.studio](https://soroban.studio)) at Build on Stellar Bootcamp Bandung:

```bash
stellar keys generate walletpertama --fund   # funded testnet identity
stellar contract build
stellar contract deploy --source-account walletpertama
```

- **Testnet contract ID:** coming with the Level 2 (Yellow Belt) submission, together with a verifiable contract-call transaction hash
- Invocable on [Stellar Lab](https://lab.stellar.org) → Smart contracts → Contract explorer

## Screenshots

| State | Screenshot |
|---|---|
| Wallet connected | ![Wallet connected](screenshots/wallet-connected.png) |
| Balance displayed | ![Balance displayed](screenshots/balance.png) |
| Successful testnet transaction | ![Transaction success](screenshots/tx-success.png) |
| Transaction result shown to user | ![Transaction result](screenshots/tx-result.png) |

## Team

- **Imam**: product and design
- **Jason**: engineering
- **Faris**: engineering
- **Nada**: business and partnerships

## Roadmap

- **MVP:** subscription + entitlement + revenue-split contract on testnet, one guided payment flow, traction dashboard
- **User acquisition:** pilot with whitelisted Bandung communities via Dev Web3 Bandung and each team member's own community
- **Mainnet vision:** IDR anchor integration, self-serve partner onboarding, fuller tokenized benefits marketplace

## Version 1.0 Scope (post-hackathon)

Multi-tier subscriptions with per-community benefit bundling, full tokenized RWA and digital product marketplace with discovery, multiple revenue-share rules, historical traction dashboard with exportable reports, self-service partner onboarding, and renewal/drop notifications.
