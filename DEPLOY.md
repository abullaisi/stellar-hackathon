# Deploy routes

Written 2026-07-15 after a deploy incident where an agent overwrote the wrong site, dropped a live route, and claimed URLs served things it had never checked. Follow this file literally. Verify, do not assume.

## Sites

| Site | What it serves | Source | Who deploys |
|---|---|---|---|
| `komunify-prototype.pages.dev` | The clickable prototype at `/`, and the merged Next.js landing at `/landing/` | `prototype/` folder in this repo | Imam, manual wrangler (commands below) |
| `komunify.pages.dev` | Jason's dApp (Vite build). Rolled back to the 2026-07-05 deployment on 2026-07-15. | `packages/web` is NOT currently deployed here | Jason. **Do NOT deploy here without his signoff.** |
| `komunify-slides.pages.dev` | Pitch deck | external slides folder, NOT in this repo | Imam, manual wrangler |

All three Pages projects live in Imam's Cloudflare account (`iabullaisi@gmail.com`), account id `04f2a27477cfd3c7032cedf47c428039`. None of them are in Jason's account. The Pages Edit token lives in Imam's credential store outside this repo, never commit it.

## Rebuilding `/landing/` (the merged Next.js landing)

`prototype/landing/` is a build artifact: the static export of `packages/web`, built with a base path so its assets resolve under the `/landing/` subpath. After any change to `packages/web`, regenerate it:

```
cd packages/web
rm -rf .next out
STATIC_EXPORT=1 BASE_PATH=/landing NEXT_PUBLIC_BASE_PATH=/landing bun run build
cd ../..
rm -rf prototype/landing
cp -r packages/web/out prototype/landing
```

Why each env var: `STATIC_EXPORT` turns on `output: 'export'` (gated so Jason's dev and build flow is untouched). `BASE_PATH` makes Next emit `/landing/_next/...` asset URLs. `NEXT_PUBLIC_BASE_PATH` is read at runtime by the two `<img src>` tags for the logo, which Next does not rewrite automatically. Skip either path var and the deployed page renders as a black screen with a broken logo.

Note: `packages/web/app/community/[address]/page.tsx` carries a placeholder `generateStaticParams()` returning one `demo` entry, because static export refuses to build a dynamic route without it. That ships one throwaway page at `/landing/community/demo.html`. Harmless, do not remove it or the export breaks.

## Deploying the prototype site

```
CLOUDFLARE_API_TOKEN=<Pages Edit token> \
CLOUDFLARE_ACCOUNT_ID=04f2a27477cfd3c7032cedf47c428039 \
npx wrangler pages deploy prototype --project-name=komunify-prototype --branch=main --commit-dirty=true
```

Run from the repo root. `prototype/` is the ONLY deploy source for this site.

## Route checklist

After EVERY prototype deploy, confirm all of these on `komunify-prototype.pages.dev` before calling it done:

- `/` returns 200, hero reads "Single subscription." / "Multiple benefits."
- `/landing/` returns 200, hero reads "One subscription for multiple community perks.", the split-ledger diagram shows three connector lines, and the K logo image loads (not a broken-image icon)
- `/landing/_next/static/css/*.css` returns 200 (proves BASE_PATH was set at build time)
- `/dashboard.html`, `/benefits.html`, `/traction.html`, `/subscribe.html`, `/partner.html`, `/content.html` all return 200
- `/styles.css` and `/app.js` return 200

A 200 on the HTML alone is not proof. Open `/landing/` in a browser and look at it.

## Rules

1. **Verify the live target before touching it.** Before deploying to, describing, or arguing about any URL: fetch the page and list the project's deployments. Never state what a URL serves from memory.
2. **Never deploy to `komunify.pages.dev`.** That domain is the team's dApp. Overwriting it with anything else needs Jason's explicit signoff.
3. **Inventory before replacing.** Before a deploy that replaces a site, check what routes the live site currently serves and make sure the new build still serves them. A deploy on 2026-07-14 silently deleted `/landing/` because this was skipped.
4. **The repo folder is the deploy source.** If a file is not committed under `prototype/`, it does not ship. No deploying from local-only folders.
5. **Deploy only after pushing,** so the live site always matches a commit on `main`.
6. **New page or route means a new checklist line,** in the same commit.
