# PROGRESS.md — living state

> **Fresh agent? Read this file top to bottom, then `PLAN.md`. Nothing else until you have.**
>
> Update this file **as you work**, not when you finish. An agent that crashes mid-task and left no
> trace here has cost the next agent an hour of rediscovery. A half-done task marked `WIP` with a
> one-line note is worth more than a perfect task marked nothing.

Last updated: 2026-07-10 — planning complete, no code written.

---

## Start here

**Current phase: Phase 0 — Foundation. Not started.**

Phase 0 is a single-agent, sequential, blocking phase. Do not spawn parallel lanes yet. Everything
in Phase 1 depends on Phase 0 freezing the interfaces and producing stub contract bindings.

Pick up the first unchecked box under Phase 0 below.

---

## Rules for agents

1. **Claim before you work.** Change a box from `[ ]` to `[~]` and put your lane letter and the
   date next to it. Change to `[x]` only when the exit criteria for that box are met.
2. **Stay in your lane's paths.** Phase 1 lanes own disjoint directories (`PLAN.md` §4). If you
   must touch another lane's path, write it under "Cross-lane requests" below and keep going on
   something else.
3. **Never edit `CONTRACT_SPEC.md` or `API_SPEC.md` in Phase 1.** Those are frozen. If the spec is
   wrong, add an entry to "Blocked / needs human" and stop that thread of work.
4. **Never reverse a `DECISIONS.md` entry.** Propose a new one; flag it below.
5. **Record what you learned**, not just what you did. Especially: exact library versions, exact
   error strings, encodings you had to discover empirically. That is the expensive knowledge.
6. **Verify with evidence.** "Tests pass" means you ran them and are pasting the count. A box
   checked without evidence is a box the next agent has to re-verify.

---

## Phase 0 — Foundation (blocking, one agent)

Exit criteria for the whole phase: `bun typecheck` clean, `cd contracts && cargo build` clean,
`packages/contract-client/dist` exports typed clients for `komunify` and `usdc`,
`git grep -in 'notes\|better-auth' -- ':!docs'` returns nothing.

- [ ] Delete the `notes` contract (`contracts/contracts/notes/`).
- [ ] Delete web notes feature: `services/notes/`, `components/notes/`, `lib/notes-client.ts`, and
      the notes UI in `app/page.tsx`. Leave `app/page.tsx` as a bare stub — landing page is out of
      scope and is being designed separately.
- [ ] Delete better-auth (D-001): `packages/web/lib/auth-client.ts`, the API's auth route + config,
      the `user` / `session` / `account` / `verification` Prisma models, `BETTER_AUTH_SECRET` and
      `BETTER_AUTH_URL` from both `.env.example` files, and the auth sections of
      `packages/api/CLAUDE.md` and `packages/web/CLAUDE.md`.
- [ ] Rewrite `packages/api/prisma/schema.prisma` to exactly the `Nonce` + `Content` models in
      `API_SPEC.md` §4. Generate the migration. Run it against a local Postgres to prove it applies.
- [ ] Generalise the `Makefile` for two contracts. Needs at minimum:
      `make build` (both), `make test` (both), `make bindings` (both, into
      `packages/contract-client/src/{komunify,usdc}.ts`), `make deploy-all` (usdc first, `init` it,
      then komunify with the usdc id as `Config.token`; write `.contract-id.usdc` and
      `.contract-id.komunify`). Mirror the changes into the root `package.json` scripts.
- [ ] Hand-write `packages/contract-client/src/index.ts` as a barrel re-exporting both generated
      clients under distinct namespaces. The generated files are overwritten by `make bindings` —
      never put hand-written code in them.
- [ ] Add Zod schemas to `packages/shared/src/schemas/` for every request and response body in
      `API_SPEC.md`. Remember: `i128` and `u64` are **strings** at the boundary, always.
- [ ] Replace `NEXT_PUBLIC_NOTES_CONTRACT_ID` with `NEXT_PUBLIC_KOMUNIFY_CONTRACT_ID` and
      `NEXT_PUBLIC_USDC_CONTRACT_ID` in `packages/web/lib/stellar.ts`. Add the unprefixed
      equivalents to a matching resolver for `packages/api`.
- [ ] Stub both contract crates: real function signatures from `CONTRACT_SPEC.md`, real types, real
      error enum, `unimplemented!()` bodies. They must compile to Wasm.
- [ ] Run `make bindings`. Commit `packages/contract-client/dist`. **This unblocks Lanes B and C.**
- [ ] Rewrite root `CLAUDE.md` for komunify: the two contracts, the wallet-auth flow, the new
      service domains. Delete the notes-contract section entirely.
- [ ] Fix the stale `src/App.css` / `src/App.jsx` paths throughout `DESIGN.md` (D-008). Token values
      and component specs stay exactly as they are — only paths change.

---

## Phase 1 — Parallel lanes (blocked on Phase 0)

### Lane A — Contracts · owns `contracts/`

- [ ] `usdc` crate: full `TokenInterface`, `init`, `mint`, `faucet` (500 USDC, 24h cooldown per
      address), `faucet_available_at`. 7 decimals, symbol `USDC`.
- [ ] `komunify` crate, step 1 — money only: `init`, `set_manager`, `subscribe`, `is_active`,
      `get_subscription`, `claim`, `get_accrued`, `get_stats`. Prove this before touching reads.
- [ ] `komunify` crate, step 2 — content registry: `register_content`, `add_content_manager`,
      `set_content_active`, `get_content`, `list_content`.
- [ ] `komunify` crate, step 3 — read accounting: `record_access` (idempotent per epoch/content/
      member; updates `MemberReads`, `MemberContents`, and display-only `ContentReads`), `has_read`,
      `get_content_reads`, `current_epoch`, `epoch_ends_at`.
- [ ] `komunify` crate, step 4 — settlement: `settle_member`, `claim_dust`, `is_settled`,
      `get_budget`, `get_member_reads`, `get_dust`. Read `CONTRACT_SPEC.md` §3 first. Per-member
      attribution (D-009): each subscriber's own budget splits across the content they read; idle
      budgets go to the platform. No shared pool, no `settle_content`, no `sweep_epoch`.
- [ ] `extend_ttl` on every persistent read and write. A shared `bump()` helper, called everywhere.
      This will not show up in tests. It will show up in the demo.
- [ ] All fourteen unit tests from `CONTRACT_SPEC.md` §3. **Tests 10 (conservation) and 11 (sybil
      property) are the acceptance gate for this lane.** Paste the passing test count here when done.
- [ ] Deploy both to testnet with `epoch_secs = 300`. `init` in order. Record the ids under
      "Deployed addresses" below.
- [ ] `make bindings` against the real Wasm. Commit the regenerated `dist`.
- [ ] `scripts/seed.ts`: 3 manager wallets, 5 contents, ~12 subscribers with uneven read
      distribution. The dashboard must not be empty on demo day.

### Lane B — API · owns `packages/api/`

- [ ] **First hour, before anything else:** determine the exact byte encoding that the installed
      `@stellar/freighter-api` `signMessage` returns, and how it verifies against
      `Keypair.fromPublicKey(addr).verify(...)`. Write the finding under "Discovered facts" below.
      This gates everything else in the lane (D-001).
- [ ] `POST /auth/challenge`, `POST /auth/verify`, `POST /auth/logout`, `GET /auth/me`.
      Session = `jose` HS256 JWT in an HTTP-only `SameSite=Lax` cookie named `kmf_session`.
- [ ] Soroban read helper: a thin module that simulates a contract view and returns a typed value.
      Every entitlement check in this package goes through it. No caching of `is_manager`.
- [ ] `POST /content/upload` — multipart, ≤20 MB, `application/pdf` only, stream-hash to sha256,
      reject duplicate hashes with `409`, push to Vercel Blob, write a `DRAFT` row.
- [ ] `POST /content/:draftId/confirm` — verify on-chain `get_content(contentId)` has a matching
      `sha256` and a `creator` equal to the session wallet before flipping to `REGISTERED`.
      Do not trust the client's `contentId`.
- [ ] `GET /content` — public list of `REGISTERED` rows, cursor-paginated, no URLs.
- [ ] `GET /content/:contentId/download` — the gate. Simulate `is_active`, then `current_epoch`,
      then `has_read`. Only then mint a 60-second signed blob URL. The `READ_NOT_RECORDED` 403 is a
      normal, expected response, not an error path.
- [ ] `GET /stats` — `get_stats` + epoch views + RPC `getEvents` on the `"kmf"` topic prefix.
      10-second in-process cache. No database involvement.
- [ ] Garbage-collect `DRAFT` rows and their blobs after 24 hours.
- [ ] Integration tests for the download gate: no session, inactive sub, active sub without a
      recorded read, active sub with a recorded read. Four cases, four assertions.

### Lane C — Web · owns `packages/web/`

Build against Phase 0's stub bindings with mocked React Query data. Do not wait for Lane A.

- [ ] Verify `providers/wallet-provider.tsx` still works; make the wallet address the query key
      prefix for every React Query call, so a Freighter account switch invalidates all state.
- [ ] Generate the shadcn primitives the panels need, and re-skin every one of them to the
      `DESIGN.md` token set. A component rendering default shadcn colours is a bug (D-007).
- [ ] `/dashboard` shell. Simulate `is_manager(wallet)` → manager panel or member panel. One route,
      no separate build (D-006).
- [ ] Member panel: subscription status card, "Get test USDC" faucet button, subscribe button,
      content grid with locked/unlocked state.
- [ ] The download flow (`PLAN.md` §2): `has_read` check → `record_access` signature → retry
      `GET /download` → open the PDF. Handle the 403 `READ_NOT_RECORDED` as a prompt-to-sign, not
      as an error toast.
- [ ] Manager panel: PDF upload → `POST /content/upload` → sign `register_content` →
      `POST /content/:id/confirm`. Show the three steps as a stepper (`DESIGN.md` §4.2).
- [ ] Manager panel: my-content list with this-epoch read counts, accrued balance, `claim()` button,
      `settle_member()` buttons for members who read the manager's content in a closed epoch.
- [ ] Traction panel: stat chips, recent-event list from `GET /stats`, epoch countdown.
      Every number `tabular-nums` (`DESIGN.md` §3).
- [ ] `app/page.tsx` stays a stub. Landing page is out of scope.

---

## Phase 2 — Integration (blocked on all of Phase 1)

- [ ] Real contract ids into every `.env` / Vercel env.
- [ ] Walk the demo script (`PLAN.md` §1) end to end on testnet with two real Freighter wallets, a
      member and a manager. Log every break here.
- [ ] Confirm TTL bumping held: re-check contract state 24h after deployment.

## Phase 3 — Submission (blocked on Phase 2)

- [ ] README: architecture, setup, Stellar usage, **the mock-USDC disclaimer (D-002)**, **the sybil
      limitation (D-004)**, the `epoch_secs = 300` demo note.
- [ ] Web deployed to Vercel. API deployed (target still undecided — see `PLAN.md` §5).
- [ ] Pitch deck.
- [ ] 2–3 minute demo video, following `PLAN.md` §1 verbatim.

---

## Deployed addresses

| What | Network | Id | Deployed |
|---|---|---|---|
| `usdc` | testnet | _not deployed_ | — |
| `komunify` | testnet | _not deployed_ | — |

Config used at `init` (fill in when Lane A deploys): `platform_bps`, `price`, `epoch_secs`
(= billing period; 300 for demo), `admin`, `platform`. No `period_secs` (D-009).

---

## Discovered facts

Empirical findings that cost someone time. Append, never delete.

- _(none yet)_

---

## Cross-lane requests

A lane needing a change in another lane's paths. Requesting lane writes it; owning lane picks it up.

- _(none yet)_

---

## Blocked / needs human

Spec errors, decision reversals, anything an agent must not decide alone.

- _(none yet)_

---

## Changelog

| Date | Agent | What |
|---|---|---|
| 2026-07-10 | planning | Scoped the MVP, wrote `PLAN.md`, `DECISIONS.md`, `CONTRACT_SPEC.md`, `API_SPEC.md`, this file. No code written. |
| 2026-07-10 | planning | Replaced shared-pool attribution (D-004) with per-member attribution (D-009) to close a sybil hole; rewrote `CONTRACT_SPEC.md` §2–3, adjusted `API_SPEC.md`, `PLAN.md`, and Lane A tasks. Still no code. |
