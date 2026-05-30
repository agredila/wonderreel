# WonderReel

WonderReel — Little Films, Big Lessons.

WonderReel is a prompt-to-video demo built for the TRAE × PixVerse track. It turns early-learning topics into delightful AI-generated short films in a kid-safe interface.

It adds meaningful functionality beyond playback:
- My List (saved videos)
- Likes (voting)
- Comments
- Purchase (demo UI / personalization signal)
- Multi-language UI (EN / ID / ZH / AR)

## Repo

GitHub: https://github.com/agredila/wonderreel

## Architecture

- `wonderreel/web` — Next.js frontend (the app you show)
- `wonderreel/backend` — Express API + PixVerse CLI wrapper

The frontend calls the backend via:
- `POST /api/generate`
- `GET /api/generate/:taskId`

The backend serves generated videos under:
- `/assets/videos/<file>.mp4`

## Requirements

- Node.js 20+ (recommended)
- PixVerse CLI installed and authenticated on the machine running the backend
- macOS / Linux recommended for the PixVerse CLI workflow

## Setup (Local Development)

### 1) PixVerse CLI

```bash
npm i -g pixverse
pixverse auth login
pixverse auth status
```

### 2) Start the backend (API)

```bash
cd wonderreel/backend
npm install
npm run start
```

Backend default URL:
- http://localhost:3001

Health check:
- http://localhost:3001/api/health

### 3) Start the frontend (Next.js)

```bash
cd wonderreel/web
npm install
npm run dev -- -p 3005
```

Frontend URL:
- http://localhost:3005

## Environment Variables

### Frontend

The frontend needs the backend base URL:

```bash
# wonderreel/web/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Backend

```bash
# wonderreel/backend/.env (optional)
PORT=3001
NODE_ENV=development
```

## PixVerse Duration Note (Important)

PixVerse V6 create supports short clips (typically up to ~15 seconds per request).
For longer demos (30–60s), the backend uses a create + extend loop until the target duration is reached.

## Product Flow (Demo)

1) Write a prompt (16:9) in the Create tab.
2) Click Generate Video.
3) Wait for completion (polling progress).
4) Open the video page from My List.
5) Interact: Save, Like, Comment, Purchase.

Notes:
- “My List”, likes, comments, and purchase state are stored in localStorage (no database required for the demo).
- Videos are served by the backend as static files under `/assets/videos`.

## Deployment

### Recommended for hackathon demo: Vercel frontend + local backend via tunnel

Because the backend requires PixVerse CLI authentication, the fastest demo setup is:

1) Deploy `wonderreel/web` to Vercel.
2) Run the backend on your laptop (where PixVerse CLI is authenticated).
3) Expose the backend with a tunnel (e.g., ngrok).
4) Set `NEXT_PUBLIC_API_BASE_URL` in Vercel to the tunnel URL.

Example with ngrok:

```bash
# on your laptop
cd wonderreel/backend
npm run start

# in another terminal
ngrok http 3001
```

Then set in Vercel (Project Settings → Environment Variables):
- `NEXT_PUBLIC_API_BASE_URL = https://<your-ngrok-subdomain>.ngrok.io`

Redeploy after changing env vars.

### Alternative: Deploy backend to a server

You can deploy the backend to a VM/container where you can install PixVerse CLI and authenticate.
This is more work because PixVerse CLI auth must be present on the server.

## Push to GitHub (manual)

From the repository root:

```bash
git init
git add .
git commit -m "WonderReel demo"
git branch -M main
git remote add origin https://github.com/agredila/wonderreel.git
git push -u origin main
```

## Troubleshooting

### PixVerse not authenticated

```bash
pixverse auth status
pixverse auth login
```

### Generation failed / sensitive prompt

- Remove anything that looks like personal data.
- Keep prompts descriptive and generic (avoid names, addresses, emails, phone numbers).

### Frontend can’t reach backend

- Confirm backend is running: http://localhost:3001/api/health
- Confirm `NEXT_PUBLIC_API_BASE_URL` is set correctly.

## License

MIT
