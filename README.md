# Catholic Mass Hub

A modern Catholic companion web app — find Mass, daily USCCB readings, online streams, pilgrimages, classic teachings, local Catholic businesses, and voice search.

## Features

- **Find Mass** — Map + parish list powered by [MassTimes.org](https://masstimes.org/) API
- **Daily Readings** — USCCB daily Bible readings with official links
- **Watch Online** — Curated live Mass streams (EWTN, Vatican, shrines)
- **Pilgrimages** — Major shrines with travel and schedule info
- **Teachings** — Creed, Sacraments, Commandments, Prayer, Baltimore Catechism
- **Local Spots** — Catholic restaurants/pubs with owner registration + admin review
- **Voice Search** — English + Spanish; spoken replies (browser TTS); Hugging Face Whisper
- **Accounts** — Email/password signup & login (session cookie)
- **Accessibility** — Skip link, keyboard nav, screen-reader-friendly list views, reduced motion

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS v4
- shadcn/ui (New York) + Lucide icons
- MapLibre GL + OpenStreetMap
- Prisma + SQLite
- Framer Motion + next-themes
- jose + bcryptjs (auth)
- Hugging Face Inference (voice transcription)

## Getting Started

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to SQLite |
| `npm run db:seed` | Seed pilgrimages, streams, teachings, demo place |

## Environment

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="long-random-string"
HF_TOKEN="hf_..."   # voice transcription
ADMIN_KEY="optional-admin-key-for-production"
```

## Accounts

- Sign up: `/signup` (choose English or Español preference)
- Sign in: `/login`
- Header **Sign in** menu when logged in

## Voice (EN / ES)

Say e.g. “Find Mass in Wichita” or “Buscar Misa en Wichita” — the app replies out loud and navigates.

## Data Sources

- Parish data: [MassTimes API](https://apiv4.updateparishdata.org/) (attribution required)
- Readings: [USCCB](https://bible.usccb.org/daily-bible-reading) (link to official text)
- Geocoding: [Nominatim](https://nominatim.org/) / OpenStreetMap

## Admin

Review pending business listings at `/admin/places`
