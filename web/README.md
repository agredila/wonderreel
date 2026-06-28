# WonderReel Web (Next.js)

This is the WonderReel frontend. See the main README for the full project (backend + deployment options):

../README.md

## Run locally

```bash
npm install
npm run dev -- -p 3005
```

## Environment variable

The frontend calls the Express backend:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
