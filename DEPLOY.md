# Deploy routes

| Site | Source | Deploy method | Owner notes |
|---|---|---|---|
| `komunify-prototype.pages.dev` | `prototype/` folder in this repo. `/landing/` = the merged Next.js landing, a static export of `packages/web` built with `STATIC_EXPORT=1 BASE_PATH=/landing NEXT_PUBLIC_BASE_PATH=/landing bun run build`, copied from `packages/web/out/` into `prototype/landing/`. | manual wrangler (command below) | Cloudflare account: Imam's (iabullaisi@gmail.com), account id `04f2a27477cfd3c7032cedf47c428039` |
| `komunify.pages.dev` | Jason's dApp (Vite build; rolled back to the 2026-07-05 deployment on 2026-07-15). Do NOT deploy here without Jason's signoff. | Jason / team decision | same Cloudflare account |
| `komunify-slides.pages.dev` | external slides folder, NOT in this repo | manual wrangler | same account, deployed 2026-07-09 |

## Prototype deploy

```
CLOUDFLARE_API_TOKEN=<Pages Edit token> \
CLOUDFLARE_ACCOUNT_ID=04f2a27477cfd3c7032cedf47c428039 \
npx wrangler pages deploy prototype --project-name=komunify-prototype --branch=main --commit-dirty=true
```

Note: the token lives outside this repo (Imam's credential store), never commit it.

## Route checklist

After EVERY prototype deploy, verify all of these return 200 on komunify-prototype.pages.dev before calling it done:

- `/` (hero shows "Single subscription." and "Multiple benefits.")
- `/landing/` (merged Next.js landing: hero says "One subscription for multiple community perks.", split diagram present)
- `/dashboard.html`, `/benefits.html`, `/traction.html`, `/subscribe.html`, `/partner.html`, `/content.html`
- `/styles.css` and `/app.js` load

## Rules

- The repo `prototype/` folder is the ONLY deploy source for the prototype site. If it is not in the folder, it does not ship. Local-only files must be committed before deploying.
- Deploy only after pushing, so the live site always matches a commit on main.
- If you add a new page or route, add it to the checklist above in the same commit.
