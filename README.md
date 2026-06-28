# WonderReel

**Little Films, Big Lessons.**

Parent-owned, multi-tenant web app where parents turn story ideas into safe AI-generated short films for children (PRD v1.2).

## Architecture

| Path | Role |
|---|---|
| [`web/`](web/) | Next.js 16 PWA — Kid Mode, Parent Studio, auth, i18n (EN/ID/ZH/AR + RTL) |
| [`backend/`](backend/) | Express API — Gemini pipeline, PixVerse REST API, quotas, audit log |
| [`supabase/migrations/`](supabase/migrations/) | Postgres schema + RLS |
| [`legacy/`](legacy/) | Deprecated hackathon HTML demo (reference only) |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Founder defaults for open PRD questions |

## Product surfaces

- **Kid Mode** (`/{locale}/kid`) — locked watch-only library + player + tap-to-learn + recap
- **Parent Studio** (`/{locale}/studio`) — parental gate → story input → Gemini moderation → PixVerse → preview/approve
- **Onboarding** — child profiles + starter library seed

## Setup

### Requirements

- Node.js 20+
- PixVerse API key (`PIXVERSE_API_KEY` in backend `.env`)
- Supabase project (auth + Postgres) for production

### Quick start (local dev)

**Both servers must run.** From the project root:

```bash
npm install
npm run dev
```

Open **http://localhost:3005/en/onboarding**. Backend health: **http://localhost:3001/api/health**

### 1. Database

Run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in your Supabase SQL editor.

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill SUPABASE_*, PIXVERSE_API_KEY, GEMINI_API_KEY
npm install
npm run start          # http://localhost:3001
```

### 3. Frontend

```bash
cd web
cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_*, NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev -- -p 3005       # http://localhost:3005
```

**Dev without Supabase:** leave Supabase env vars empty — app runs in dev mode with local child profile flow.

## API (authenticated)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/stories/create` | Input mod → story-to-prompt → generate |
| GET | `/api/generate/:taskId` | Poll generation progress |
| GET | `/api/films` | List films (filter by childId, status) |
| POST | `/api/films/:id/approve` | Parent approve → Kid library |
| POST | `/api/films/:id/discard` | Discard film |
| GET | `/api/quota` | Per-account monthly quota |
| GET | `/api/admin/costs` | Cost dashboard (Phase 3) |

## Deployment

- **Frontend:** Vercel
- **Backend worker:** VM/container with PixVerse REST API + optional Redis for job queue

See [`docs/DECISIONS.md`](docs/DECISIONS.md) for quota (1 film/month default), gate style, and stack choices.

## License

MIT
