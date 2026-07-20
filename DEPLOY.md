# Deploy to Vercel (recommended) or Render

This app is Next.js 16 App Router. **Vercel + Neon Postgres** is ideal. **Render** works via `render.yaml` if the repo is on GitHub.

## Prerequisites

1. A **Postgres** database (Neon free tier, Supabase, or Render Postgres)
2. Env vars below set on the host

## Environment variables

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | `postgresql://…` (required in production) |
| `AUTH_SECRET` | Long random string |
| `ADMIN_EMAIL` | Seeded admin (default `admin@catholicmasshub.local`) |
| `ADMIN_PASSWORD` | Change after first login |
| `CRON_SECRET` | Bearer token for `/api/cron/verify-content` |
| `ADMIN_KEY` | Optional admin API key |
| `HF_TOKEN` | Optional voice transcription |

## Vercel

1. Create a Neon DB → copy connection string  
2. Push this project to GitHub (own repo under `mass/`, not your home folder)  
3. [Import project](https://vercel.com/new) → select the repo  
4. Set env vars → Deploy  

Build uses `npm run build:prod` (see `vercel.json`), which:
- switches Prisma to `postgresql` when `DATABASE_URL` is Postgres
- runs `prisma db push`
- builds Next.js

After first deploy, confirm seed ran (or run seed once with production `DATABASE_URL` locally).

Cron: daily `GET /api/cron/verify-content` (set `CRON_SECRET`; Vercel sends `Authorization: Bearer …`).

### CLI (after `npx vercel login`)

```bash
npx vercel link
npx vercel env add DATABASE_URL
npx vercel --prod
```

## Render (recommended when Vercel CLI is blocked)

### One-time setup on your machine

1. Fix GitHub CLI auth:
   ```bash
   gh auth login -h github.com
   ```
2. From `mass/`:
   ```bash
   git remote add origin https://github.com/YOUR_USER/catholic-mass-hub.git
   git push -u origin main
   ```
3. In [Render Dashboard](https://dashboard.render.com):
   - **New → Blueprint**
   - Select the repo (uses `render.yaml`)
   - Confirm Postgres + web service
4. After deploy, open the `.onrender.com` URL and clear cookies once to see the welcome chooser.

### Agent / MCP note

Render MCP needs an active **workspace** selected. If deploy from Cursor fails with “unauthorized” / “no workspace”, open the Render MCP auth flow again and tell the agent your workspace name.

## Vercel (alternative)

## Local (SQLite)

```bash
cp .env.example .env
# DATABASE_URL="file:./dev.db"
npm run db:push
npm run db:seed
npm run dev
```

Do **not** run `build:prod` locally unless `DATABASE_URL` is Postgres — it rewrites `prisma/schema.prisma`.
