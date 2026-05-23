# CreateUp

AI-powered YouTube research & scripting platform. Implements the spec in `CreateUp_Requirements.docx` against the mockups in `CreateUp_Mockups.html`. Tracking against `BUILD_PLAN.md` (172 FRs).

## Quick start

```powershell
# 1. Install deps
npm install

# 2. Prepare the database (SQLite for local dev)
npm run db:push
npm run db:seed

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>. The app boots in **mock mode** — every external integration (LLM, YouTube, images, search, email, storage) is faked. Flip the corresponding `USE_MOCK_*` flag in `.env` and supply a key to turn each one real.

The first user to sign in matching `BOOTSTRAP_ADMIN_EMAIL` is promoted to Admin automatically.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run prod build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Prisma schema to dev DB |
| `npm run db:migrate` | Generate + run a new migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## What to supply when you want to turn off the mocks

See `SETUP.md`. Short version:

- **LLM:** set `ANTHROPIC_API_KEY` (or another provider) + `USE_MOCK_LLM=false`.
- **YouTube:** `YOUTUBE_API_KEY` from Google Cloud Console.
- **Google SSO:** OAuth client ID/secret + register `${APP_URL}/api/auth/callback/google`.
- **Email:** Resend API key (recommended).
- **Storage:** swap `STORAGE_BACKEND` to `s3` or `gdrive`.

## Deploy (Railway)

Repo: <https://github.com/igrant9679/CreateUp>
Railway: deploy from that repo.

Steps:

1. In Railway project → **+ New** → **Database** → **PostgreSQL**. Railway auto-injects `DATABASE_URL` into every service in the project.
2. **+ New** → **GitHub repo** → pick `igrant9679/CreateUp`.
3. In the service → **Variables**: paste the values from your local `.env` **except** `DATABASE_URL` (Railway sets it). Required at minimum:
   - `AUTH_SECRET` (run `openssl rand -base64 32`)
   - `APP_URL` and `AUTH_URL` (Railway assigns a domain on first deploy — set these to that URL, then redeploy)
   - `BOOTSTRAP_ADMIN_EMAIL`
   - Leave every `USE_MOCK_*=true` to start.
4. First deploy will run automatically. Build = `npm ci && npx prisma generate && npm run build`; start = `npx prisma migrate deploy && npm run start` (see `railway.json`). Migrations apply on every boot — safe because `migrate deploy` is idempotent.
5. (Later, when you need background jobs for Agent Mode) Add the **Redis** plugin and set `JOB_BACKEND=redis`.

## Docs

- `BUILD_PLAN.md` — the 172-FR checklist.
- `DECISIONS.md` — tech choices and deviations.
- `SETUP.md` — what *you* need to provide.
