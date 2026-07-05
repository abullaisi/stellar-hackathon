# Komunify Design System Rules (auto-loaded every session)

Read `DESIGN.md` at the repo root before creating or editing ANY UI element. It is the single source of truth; if your edit contradicts it, your edit is wrong.

## Non-negotiables

1. **Tokens only, no raw values.** Every color, spacing, and radius comes from the CSS custom properties in `src/App.css` (`--color-*`, `--space-*`, `--radius-*`). Never hardcode a hex or px value that a token already expresses. Three-tier plan: semantic tier is live; primitive ramps land after the brand vote; component tokens only when semantics cannot express a value.
2. **Check order before building anything:** (1) tokens + classes in `src/App.css`, (2) DESIGN.md Section 4 specs, (3) `/docs.html` live specimen, (4) grep `src/`. Match found: STOP and ask whether to reuse or variant. No match: propose before building.
3. **Variant axes use the DESIGN.md 4.3 vocabulary:** `State` (interaction: Default/Hover/Focus/Active/Filled/Disabled/Loading), `Behavior` (Selected/Unselected/Indeterminate), `Type` (semantic tone: Info/Success/Warning/Destructive), `Style`, `Size`. Never mix State with Type or Behavior. React props use these names lowercased.
4. **Named slots** for composite components: `header`, `footer`, `actions`, `leading-visual`, `trailing-actions`, `children`. Match slot names between markup structure and props.
5. **Atomic composition:** build atoms, compose molecules. No monolith components.
6. **Motion:** 150-200ms ease-out, opacity/transform only. Respect `prefers-reduced-motion`.
7. **Accessibility floor:** WCAG AA contrast on every text/background pair; visible focus state (`--color-border-accent` ring); native elements over div-buttons.
8. **Brand vote pending (SPLIT/STEMPEL/RASI):** the theme layer is isolated in `:root` custom properties. Never scatter palette decisions outside the token block.

## Propagation ladder

Any new or changed component ripples token > atom > molecule > organism. Walk the ladder, surface impact, ask before propagating. Details: DESIGN.md Section 0.

Lineage: token structure and component axes adapted from Agentic Design System v1.1 (agenticui.net); working rules per the Design Systems Manual (CTX `research/frameworks-ux-product-design/design-systems-manual/`).
