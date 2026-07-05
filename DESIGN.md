# DESIGN.md -- Communify

> **Sync Rule:** This file exists in two locations and must stay identical.
> - **Repo:** `/Users/imam/Documents/stellar-communify/DESIGN.md` (lives next to the code)
> - **CTX project:** `products/communify/DESIGN.md` (lives in PM context)
>
> When editing, update BOTH files. If they diverge, the repo copy is canonical.

> **Read this file before editing ANY UI code in this project.**
> This is the single source of truth for visual patterns.
> If your edit contradicts this file, your edit is wrong.

Communify is a community subscription payments dApp on Stellar (hackathon MVP). One subscription unlocks partner-community benefits, a Soroban contract splits revenue between partners, and an on-chain dashboard shows traction. PRD by Faris. Team spelling vote pending: Communify vs Komunify.

Token structure and component taxonomy are adapted from the **AGENTIC DESIGN SYSTEM v1.1** by agenticui.net (Figma community file): semantic BACKGROUND / CONTENT / BORDER / INPUT / BUTTON token groups, primitive ramps to be added later.

---

## 0. Design System First -- The Rule

Before implementing **any** UI element (input, button, card, pill, form, stat, badge, modal, etc.), check the system in this order:

1. **CSS custom properties + named classes in `src/App.css`.** If a token or class matches, use it.
2. **Section 4 of this file.** If a component spec exists, follow it exactly.
3. **`/docs.html` live specimen.** The visual reference, including the three `data-theme` candidate palette preview blocks.
4. **`grep` across the `src/` tree.** If an inline pattern is reused in 2+ places, flag it for promotion to `App.css`.

### When a match is found: STOP and ask

> "We already have [X] in [location]. Use that pattern, or create a new variant?"

Do NOT silently pull in an external kit (Tailwind template, Shadcn, a random dApp UI, another hackathon repo) as a default. External patterns are input, not source of truth.

### When no match exists: propose as new

> "No existing match. I'll add this as a new [X]. It should go in: [App.css named class / component-local style]."

After implementing:
- Add a live demo to `/docs.html`
- Add a spec entry to Section 4 of this file
- If reusable, promote it to a named class in `src/App.css`

### When modifying an existing component: flag propagation scope

- **Named class in `App.css`:** change once, every usage in `App.jsx` (and future screens) updates.
- **Component-local pattern:** `grep` the `src/` tree for the pattern, show the list, ask "Apply to all N instances?" Better: promote to a named class first.

### After implementing: propose hierarchy propagation

Every new or modified component ripples across the atomic hierarchy: **tokens > atoms > molecules > organisms**. Before declaring a task done, walk the hierarchy and surface impact at every level.

**1. Token level (colors, radius, spacing, typography):**
Does this introduce a new raw value that should become a token?
> "The new partner-benefit card wants a 10px radius. Our radius scale is 6 / 9 / 14 / 999. Snap to `--radius-md` (9px) or `--radius-lg` (14px), or is a new step really justified?"

**2. Atom level (single elements: button, input, pill, label, code chip):**
Does this affect the atom itself as a reusable element?
> "The unlocked-state badge is a new pill variant. Options: add `.pill.accent` (accent tint background) globally, or keep it one-off in the benefit card."

**3. Molecule level (small combos: wallet row, balance block, send form, split row):**
Which molecules use this atom today? What changes for them?
> "Changing `--content-accent` touches: primary button fill, logo first letter, input focus border, and the planned Pay CTA and unlocked badge. N molecules affected."

**4. Organism level (full cards and screens: connect card, balance card, contribution card, dashboard):**
Which larger sections contain these molecules? Any layout side effects?
> "The split-allocation row lives inside the planned Subscription card and the Dashboard. Adding a progress cell changes row height in both."

**Ask explicitly, offer choices. Do NOT propagate silently.** The team decides scope.

**If propagating:** update tokens in `App.css` + Section 2-3 of this file, then atoms in `App.css`, then molecule usage in JSX, then verify against `/docs.html`.

### Exception

If the team explicitly says "copy the modal from Stellar Wallets Kit" or "use pattern X from Y", skip the check-first ask. External patterns become input by direction only, never by default. The propagation check still applies after implementation.

---

## 1. Visual Theme & Atmosphere

> ## BRAND VOTE PENDING: READ THIS FIRST
>
> The brand concept vote between **SPLIT** (dark + gold), **STEMPEL** (ivory + forest green + gold), and **RASI** (indigo + lilac) has NOT happened yet.
> Until the vote, v0 ships the SPLIT-leaning dark + gold theme that is already live in the app.
> **The entire theme layer is isolated in CSS custom properties.** When the vote lands, the winning palette is a variable swap in `:root`, not a refactor. Do not hardcode any hex value in a component. If you type a raw color outside the token block, you are creating vote debt.
> Candidate palette values live in Section 2 and render as `data-theme` preview blocks in `/docs.html`.

Communify handles other people's subscription money. The register is dark, calm, financial trust. A near-black blue-gray canvas, elevated card surfaces one step lighter, quiet borders, and exactly one accent (gold `#ffd23f`) doing all the work: the primary action, the logo mark's first letter, the input focus ring. Success, warning, and danger colors appear only as status feedback, never as decoration.

The app is a single centered 520px column (`.shell`) of stacked cards. Density is moderate: 20px card padding, 16px gaps, generous line-height. Hierarchy comes from type weight and the mono UPPERCASE label signature, not from extra colors or heavy shadows. Numbers (balances, amounts) always render tabular so digits align.

**Key characteristics:**

- Dark by default, `color-scheme: dark` set at `:root`
- One accent color; everything else is neutral or status feedback
- Mono uppercase micro-labels over clean sans body (Agentic DS signature; serif headings NOT adopted in v0, reconsider if STEMPEL wins the vote)
- Single-column card stack, no nav, no sidebar (hackathon MVP scope)
- Restrained motion: hover brightness only today, see Section 5

---

## 2. Color Palette & Roles

All tokens live in `:root` in `src/App.css`. The semantic names below are the canonical token names (Agentic DS naming). The "App.css var" column maps to the shorter legacy names currently in the file; when touching the token block, migrate legacy names toward the semantic names rather than adding new short names.

### Backgrounds

| Token | Value | App.css var | Role |
|-------|-------|-------------|------|
| `--bg-primary` | `#0c0f14` | `--bg` | Page background (`body`) |
| `--bg-elevated` | `#151a22` | `--card` | Card surfaces (`.card`) |
| `--bg-input` | `#0e1218` | (hardcoded on `input`, `code`) | Input fields and code chips. Promote to a named var when next touched. |
| `--bg-accent-tint` | `rgba(255,210,63,0.12)` | (not yet in file) | Accent-tinted fills (planned unlocked badge, accent pill variant) |
| `--bg-success-tint` | `rgba(62,207,142,0.14)` | (inline in `.pill.ok`) | Success pill background |
| `--bg-warning-tint` | `rgba(255,138,92,0.14)` | (inline in `.pill.warn`) | Warning pill background |

### Content

| Token | Value | App.css var | Role |
|-------|-------|-------------|------|
| `--content-primary` | `#e8ecf1` | `--text` | Body text, headings, ghost button labels |
| `--content-secondary` | `#8b95a3` | `--muted` | Labels, hints, tagline, footer, form label text |
| `--content-accent` | `#ffd23f` | `--accent` | Primary button fill, logo first letter, focus border |
| `--content-on-accent` | `#1a1400` | `--accent-text` | Text on accent surfaces (primary button label) |
| `--content-success` | `#3ecf8e` | `--ok` | Success text, success pill label |
| `--content-warning` | `#ff8a5c` | `--warn` | Warning text, warning pill label |
| `--content-danger` | `#ff6b6b` | `--err` | Error text (`.error`) |

### Border

| Token | Value | App.css var | Role |
|-------|-------|-------------|------|
| `--border-medium` | `#262d38` | `--border` | Card borders, input borders, ghost button borders, code chip borders |
| `--border-accent` | `#ffd23f` | (via `--accent` on `input:focus`) | Focus state border |

### Candidate palettes (PENDING VOTE)

Documented for the vote. `split` is the live default. Each renders as a `data-theme` preview block in `/docs.html`. Only the winning column ever lands in `:root`.

| Token | split (current default) | stempel (light) | rasi (dark indigo) |
|-------|------------------------|-----------------|--------------------|
| `--bg-primary` | `#0c0f14` | `#F4EFE6` | `#0E0C1E` |
| `--bg-elevated` | `#151a22` | `#FDFBF7` | `#171432` |
| `--content-primary` | `#e8ecf1` | `#1F2A24` | `#EEEBFF` |
| `--content-secondary` | `#8b95a3` | `#5C685F` | `#8E88B0` |
| `--content-accent` | `#ffd23f` | `#1F4D3A` (forest green) | `#A78BFA` (lilac) |
| `--content-on-accent` | `#1a1400` | `#F4EFE6` | `#14102A` |
| Detail | gold IS the accent | gold detail `#B08D3E` | none |

**DO NOT:**

- Hardcode any hex from these tables in a component. Always go through the custom property.
- Use the accent for decorative fills, borders-for-borders'-sake, or body text. It marks the primary action and focus, nothing else.
- Use success/warning/danger colors outside genuine status feedback.

---

## 3. Typography, Spacing & Radius

### Font stacks

- **Body (sans):** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif`. Set globally on `body`.
- **Mono (labels + code):** `ui-monospace, SFMono-Regular, Menlo, monospace`.

### The mono-uppercase-label signature

Micro-labels (`.label`) are 12px UPPERCASE with 0.06em tracking in `--content-secondary`, set in the mono stack. This mono-label-over-sans-body pairing is the Communify type signature, inherited from the Agentic DS (which pairs mono UPPERCASE labels with a clean sans body; its serif headings are NOT adopted in v0, revisit only if STEMPEL wins).

> **Drift resolved (2026-07-05):** `.label` in `src/App.css` now carries the mono stack. Do not add new labels in sans.

### Hierarchy

| Role | Size / Weight | Details | Where |
|------|---------------|---------|-------|
| Display / balance | 30px / 700 | `font-variant-numeric: tabular-nums`, margin 6px 0 10px | `.balance` |
| Logo | 28px / 800 | letter-spacing -0.02em, `::first-letter` in `--content-accent` | `.logo` |
| H2 (card titles) | 16px / 600 | margin 0 0 10px | `.card h2` |
| Body md | 14px / 400 | line-height 1.5 | `body`, `.tagline`, inputs, buttons |
| Body sm | 13px / 400 | hints, helper text, error/success messages, form label text | `.hint`, `.error`, `.success`, `label` |
| Label | 12px / 400 | UPPERCASE, letter-spacing 0.06em, `--content-secondary`, mono stack | `.label` |
| Pill label | 11px / 700 | inside `.pill` | `.pill` |
| Code | 13px mono | on `--bg-input` chip, `--radius-sm` | `code` |
| Footer | 12px | `--content-secondary`, centered | `footer` |

### Number display

Always apply `font-variant-numeric: tabular-nums` to balances, amounts, percentages, and any number that can appear in a column (split-allocation rows, dashboard stats). `.balance` already does this; every planned numeric cell must too.

### Spacing scale

Base steps: **4, 8, 12, 16, 20, 32, 48** (px) as `--space-1` through `--space-7`. Current usage: `.row` gap 12, `.shell` gap 16, `.card` padding 20, `.shell` padding 48 / 20 / 32 (top / sides / bottom). New spacing values must snap to this scale; if a design wants an off-scale value, raise it at token level per Section 0.

| Token | Value | Current use |
|-------|-------|-------------|
| `--space-1` | 4px | `.row.tight` margin-top |
| `--space-2` | 8px | `.row.tight` gap, header margin-bottom |
| `--space-3` | 12px | `.row` gap, form gap |
| `--space-4` | 16px | `.shell` gap |
| `--space-5` | 20px | `.card` padding, `.shell` side padding |
| `--space-6` | 32px | `.shell` bottom padding |
| `--space-7` | 48px | `.shell` top padding |

### Radius scale (Agentic DEFAULT-mode shape)

| Token | Value | Where |
|-------|-------|-------|
| `--radius-sm` | 6px | code chips |
| `--radius-md` | 9px | buttons, inputs |
| `--radius-lg` | 14px | cards |
| `--radius-full` | 999px | pills |

Four steps, no additions without a token-level discussion. The scale reads: chip < control < surface < pill.

---

## 4. Component Stylings

### 4.1 Existing atoms and classes (live in `src/App.css`, used in `src/App.jsx`)

**`.shell`** (layout root)
```
max-width: 520px; margin: 0 auto;
padding: 48px 20px 32px;
display: flex; flex-direction: column; gap: 16px;
```
The single column everything lives in. One `.shell` per page, applied to `<main>`. Do not widen it for new features; dashboard content stacks vertically inside it.

**`.logo` + `.tagline`** (header)
- `.logo`: 28px / 800, letter-spacing -0.02em. `::first-letter` colored `--content-accent`. This IS the v0 logo treatment; no image mark.
- `.tagline`: 14px `--content-secondary`, margin 6px 0 0.
- `header`: centered, margin-bottom 8px.

**`.card`** (surface)
```
background: --bg-elevated; border: 1px solid --border-medium;
border-radius: 14px (--radius-lg); padding: 20px;
```
The only surface in the app. Every feature is a card in the shell stack. Variant `.card.center`: text-align center, padding 36px 20px, used for the empty/connect state. Card titles are `h2` (16px / 600).

**`.row` / `.row.tight`** (horizontal layout)
- `.row`: flex, space-between, align center, gap 12. Used for the connected-wallet card (info left, Disconnect right).
- `.row.tight`: justify flex-start, gap 8, margin-top 4. Used for address + pill, and button pairs.

**`.label`** (micro label)
12px UPPERCASE, letter-spacing 0.06em, `--content-secondary`. Mono stack per Section 3. Used above the wallet address and the XLM balance. Every stat and field group in planned components gets one.

**`.balance`** (display number)
30px / 700, tabular-nums, margin 6px 0 10px. The pattern for any hero number (subscription price, dashboard volume).

**`.pill` / `.pill.ok` / `.pill.warn`** (status pill)
11px / 700, radius 999px, padding 3px 9px. `.ok`: `--bg-success-tint` bg + `--content-success` text (used for the TESTNET badge). `.warn`: `--bg-warning-tint` bg + `--content-warning` text. Planned accent variant for unlocked states uses `--bg-accent-tint` + `--content-accent` (propose per Section 0 before adding).

**`button`** (primary) and **`button.ghost`** (secondary)
- Primary: `--content-accent` bg, `--content-on-accent` label, radius 9px, padding 10px 18px, 14px / 700, no border. Hover: `filter: brightness(1.06)`. Disabled: opacity 0.55, `cursor: not-allowed`. One primary action per card maximum (Connect Wallet, Fund with Friendbot, Send XLM today; Pay CTA next).
- Ghost: transparent bg, `--content-primary` label, 1px `--border-medium` border, weight 600. For secondary actions: Disconnect, Refresh.

**`input` + `label` wrapper** (form field)
- `label`: flex column, gap 5px, 13px `--content-secondary`. Wraps the field, label text first.
- `input`: `--bg-input` bg, 1px `--border-medium`, radius 9px, padding 10px 12px, `--content-primary` text, 14px. Focus: outline none, border-color `--content-accent` (`--border-accent`).
- `form`: flex column, gap 12.

**`code`** (code chip)
13px mono on `--bg-input`, 1px `--border-medium`, radius 6px, padding 2px 7px. For wallet addresses (shortened) and tx hashes. Always give full values via `title` when truncating.

**`.hint` / `.error` / `.success`** (feedback text)
All 13px. `.hint`: `--content-secondary`, margin 8px 0 12px. `.error`: `--content-danger`, margin 10px 0 0. `.success`: `--content-success`, margin 12px 0 0, links inherit color. Feedback text sits inside the card it belongs to, directly under the triggering control.

**`footer`**
12px `--content-secondary`, centered, margin-top 12px, links inherit color. Credits + GitHub link.

### 4.2 Planned components (from Faris PRD, mapped to Agentic DS taxonomy)

Statuses: **live** (in App.css/App.jsx today), **planned** (build per this table, propose per Section 0), **n/a** (Agentic category explicitly out of MVP scope).

| Component | Agentic taxonomy | Status | One-line spec |
|-----------|------------------|--------|---------------|
| Connect / balance / contribution cards | CARD | live | `.card` stack in `.shell`, see 4.1 |
| Status pill | BADGE | live | `.pill.ok` / `.pill.warn`, accent variant pending |
| Subscription card | CARD | planned | `.card` with `.label` ("SUBSCRIPTION"), `.balance`-style price (tabular), one primary Pay CTA |
| Entitlement / benefit card | CARD + BADGE | planned | `.card` per partner benefit; unlocked state = accent-tint BADGE (`--bg-accent-tint` + `--content-accent`) |
| Split-allocation row | TABLE (cell-type-progress + cell-type-numeric) | planned | `.row` per partner: name (body md), % + amount as numeric cells (13-14px, tabular-nums), progress cell for share |
| Dashboard stat chips | CHIP / stat pattern | planned | `.label` over `.balance`-style number (subscriber count, volume), grouped in a `.card` |
| Partner communities cluster | AVATAR GROUP | planned | Overlapping partner avatars on the subscription and dashboard cards |
| Subscribe flow indicator | STEPPER | planned | connect > pay > unlocked; active step in `--content-accent`, done in `--content-success`, pending in `--content-secondary` |
| Tx status notice | TOAST | planned | pending / success / fail; reuses `.hint` / `.success` / `.error` colors on a `--bg-elevated` surface, radius `--radius-md` |
| Tx pending placeholder | SKELETON | planned | Loading blocks on `--bg-input`, radius matching the element they replace |
| Wallet select | MODAL | planned | Comes themed from Stellar Wallets Kit; only reconcile its accent with `--content-accent`, do not rebuild |
| Funding / traction bar | PROGRESS | planned | Track `--bg-input`, fill `--content-accent`, radius `--radius-full` |
| Chat | CHAT | n/a | Out of MVP scope |
| AI thinking states | AI STATES | n/a | Out of MVP scope |
| Breadcrumbs | BREADCRUMBS | n/a | Single screen, nothing to crumb |
| Pagination | PAGINATION | n/a | Out of MVP scope |
| File upload | FILE UPLOAD | n/a | Out of MVP scope |

Every planned component, once built: demo in `/docs.html`, spec promoted from this table into a full 4.1-style entry, class in `App.css` if reused.

---

## 5. Motion

Current state: the only motion in the app is `button:hover { filter: brightness(1.06); }`. That is intentional, not an omission.

Rules for all future motion:

- **Duration:** 150-200ms.
- **Easing:** ease-out.
- **Properties:** opacity and transform only. No animating width, height, colors, or layout properties.
- **No bounce, no pulse, no spring overshoot.** This app moves money; motion must read as confirmation, not celebration.
- Skeleton and progress animations follow the same rule set (opacity shimmer, transform-based fills).
- Anything beyond these bounds is a Section 0 proposal, not a default.

---

## Attribution

Token structure (BACKGROUND / CONTENT / BORDER / INPUT / BUTTON semantic groups) and the component taxonomy in Section 4.2 are adapted from the **AGENTIC DESIGN SYSTEM v1.1** by **agenticui.net** (Figma community file). The mono-uppercase-label signature and the DEFAULT-mode radius shape follow the same system; serif headings from the source system are not adopted in v0.
