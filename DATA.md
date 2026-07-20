# Where data is stored

| Data | Storage | How it updates |
|------|---------|----------------|
| **Users / login / favorites** | SQLite `prisma/dev.db` (local) or **Postgres** (Vercel) → `User`, `FavoriteParish` | Signup, login, Save parish |
| **Local spots** | DB → `LocalPlace` | Owner submit + `/admin/places` |
| **Pilgrimages** | DB → `PilgrimageSite` | Seed JSON, `/admin/pilgrimages`, cron stamp |
| **Watch Online streams** | DB → `OnlineStream` | Seed JSON, `/admin/streams`, daily cron link check |
| **Teachings** | DB → `TeachingSection` | Seed; Home “Teaching of the day” rotates |
| **Find Mass parishes** | **Not stored** — MassTimes.org API | Fresh on each search (favorites copy metadata) |
| **Geocoding** | Nominatim / Photon | Fresh on each search |
| **Daily readings** | USCCB | Fresh per date |
| **Auth sessions** | HTTP-only cookie (JWT) | Login/logout |
| **Locale** | Cookie `mass_locale` (+ user.locale) | Header EN/ES toggle |
| **Voice audio** | Not stored — HF Whisper | — |

## Production

See **[DEPLOY.md](./DEPLOY.md)** — Vercel + Neon/Supabase Postgres.

## Refresh curated content

```bash
npm run db:push
npm run db:seed    # also ensures ADMIN_EMAIL user exists
```

Or use admin UI at `/admin/streams` and `/admin/pilgrimages`.

Cron: `GET /api/cron/verify-content` (daily via `vercel.json`).
