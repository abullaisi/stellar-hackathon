# CLAUDE.md — komunify

This file provides guidance to Claude Code when working in this monorepo.

## Project Overview

**komunify** is a TypeScript monorepo generated with create-monorepo.

Packages:
- `packages/api/` — Hono backend API (port 3001)
- `packages/web/` — Next.js frontend (port 3000)
- `packages/shared/` — Shared Zod schemas and TypeScript types

## Stack

- **Backend**: Hono, TypeScript, Zod, Prisma (postgres), better-auth
- **Frontend**: Next.js 15 App Router, TanStack Query, Tailwind CSS, shadcn/ui, better-auth client
- **Shared**: Zod schemas, inferred TypeScript types
- **Package Manager**: bun
- **Monorepo**: pnpm workspaces

## Development Commands

```bash
# Run everything
bun dev                         # Start all packages in parallel

# Individual packages
bun --filter api dev            # Backend only
bun --filter web dev            # Frontend only

# Build
bun build                       # Build all packages
bun --filter shared build       # Build shared first if types changed

# Quality
bun typecheck                   # Type-check all packages
bun lint                        # Lint all packages
bun format                      # Format all packages
```

## Package Dependency

```
packages/shared  ←  packages/api
                  ←  packages/web
```

> Always build `packages/shared` first after schema changes: `bun --filter shared build`

## Database

- **Provider**: PostgreSQL via Prisma
- Schema: `packages/api/prisma/schema.prisma`

```bash
bun --filter api prisma:generate   # Regenerate Prisma client
bun --filter api prisma:migrate    # Run migrations
bun --filter api prisma:studio     # Open Prisma Studio
```

## Authentication

Powered by [better-auth](https://better-auth.com).

- Sessions stored in database, sent as HTTP-only cookies
- Auth routes handled at `/api/auth/**` on the backend
- Frontend uses `lib/auth-client.ts` — no manual token management
- Required env vars: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

See `packages/api/CLAUDE.md` for protecting routes.
See `packages/web/CLAUDE.md` for frontend usage.

## Environment Setup

```bash
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env
```

Edit the `.env` files before running `bun dev`.

## Key Files

- `packages/api/src/index.ts` — Hono app entry point
- `packages/api/src/lib/errors.ts` — Custom error classes
- `packages/api/src/lib/response.ts` — Response helpers
- `packages/web/services/api/client.ts` — HTTP client
- `packages/web/services/api/endpoints.ts` — API endpoint constants
- `packages/web/lib/auth-client.ts` — better-auth client
- `packages/shared/src/index.ts` — All shared type exports

## Per-Package Guidance

Each package has its own `CLAUDE.md` with detailed patterns:
- `packages/api/CLAUDE.md` — routes, services, middleware, error handling
- `packages/web/CLAUDE.md` — services, hooks, auth, components
- `packages/shared/CLAUDE.md` — adding schemas and types
