# CreateUp — Engineering Decisions

Concrete tech choices and any deviations from the defaults proposed in the brief / `.env.example`. Each entry: choice → rationale.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript. _Brief default._
- **Styling:** Tailwind CSS v4 + IBM Plex Mono / Sans (from mockups). _Brief default._
- **ORM:** Prisma 6 (latest stable on the 6.x line). _Deviation: not Prisma 7._ Prisma 7 dropped the `url` field from `schema.prisma` in favor of driver-adapter packages + `prisma.config.ts`. Adopting it would have required wiring `@prisma/adapter-better-sqlite3` (dev) and a separate Postgres adapter (prod) for no application benefit. v6 keeps the well-known config and migration story.
- **Auth:** Auth.js v5 (NextAuth beta) with the Prisma adapter, Credentials provider for email/password, and an optional Google OAuth provider gated by `ENABLE_GOOGLE_SSO`. _Brief default._
- **Validation:** Zod for all API input.
- **Background jobs:** in-memory queue for local dev; **BullMQ + Redis** when `JOB_BACKEND=redis` and `REDIS_URL` is set (matches `.env.example`).
- **Tests:** Vitest + React Testing Library + Playwright for E2E (added in a later phase).

## Deviations from defaults

### 1. SQLite for local development, Postgres for production

`.env.example` defaults to a local Postgres URL. **Local dev uses SQLite** (`file:./dev.db`) because:
- The user is hosting on Railway, which provisions Postgres via env injection — they will not run Postgres locally.
- SQLite + Prisma gives a zero-install dev loop and lets the app boot today.

Prisma's schema is written so that switching the `provider` from `sqlite` → `postgresql` requires only changing one line in `prisma/schema.prisma` and re-running migrations. JSON-heavy fields are stored as `String` (serialized JSON) for SQLite portability — Postgres can keep them as JSON or be migrated to a real `Json` column later without changing application code (the access layer always parses/stringifies).

**Action on first Railway deploy:** flip provider to `postgresql`, regenerate the initial migration against the Railway Postgres URL, and remove the `.db` SQLite file.

### 2. JSON fields stored as serialized strings

For SQLite portability (see above). Wrapper helpers in `src/lib/db/json.ts` parse/stringify so callers see typed objects.

### 3. Storage default = local filesystem (`./.data/uploads`)

Matches `.env.example`. On Railway, **persistent disk is not free on Postgres-only plans**, so we will swap to Cloudflare R2 (S3-compatible) when uploads become real. Already abstracted behind `src/lib/storage/`.

### 4. LLM router lives in `src/lib/llm/`

Single `LLMProvider` interface with `complete(prompt, opts)` and `stream(prompt, opts)`. Concrete implementations: `mock`, `anthropic`, `openai`, `google`, `deepseek`, `xai`, `moonshot`, `minimax`. Selected per call via a `model` string; routed by a small registry. Honors FR-MODEL-04 — adding a provider requires no UI/contract changes.

### 5. No billing code anywhere

The spec is unambiguous: no plans, credits, payments. Soft limits (FR-ADMIN-03) implemented as an admin-set integer column on `Workspace` checked at generation time.

## Open decisions (revisit before going live)

- Whether to use Railway Postgres for *both* dev and prod (public connection string), or keep SQLite for dev. Currently SQLite for dev.
- Image gen provider: not chosen — `USE_MOCK_IMAGES=true` until the user supplies a key.
- Real-time streaming: SSE via Next.js streaming responses (no WebSocket dep). Revisit if Agent Mode progress UI needs server-pushed updates beyond polling.
