# WonderReel — Founder Decisions (defaults for build)

These defaults unblock implementation per PRD §13. Update when founder confirms.

| Question | Decision |
|---|---|
| Per-account quota | **1 film/month** (configurable via `GENERATION_QUOTA_MONTHLY`) |
| Target age skew | **2–7 balanced**; UI touch targets sized for 3–5 |
| Brand name | **WonderReel** (locked) |
| Parental gate | **Math challenge** (adult-only) + **optional 4-digit PIN** |
| Deployment | **Vercel** (Next.js) + **VM/container worker** (Express + PixVerse REST API) |
| Auth provider | **Supabase Auth** — invitation code + email/password (default code `TRYWONDERREEL`); backend validates signup via `POST /api/auth/signup` |
| Starter library | **Yes** — 5 curated films seeded per new child profile |
| Child profile timing | **Deferred** — no PII at sign-up; default viewer on first create; nickname at Kid handoff |
| Landing activation | **Public landing** — browse samples + prompt; sign-up modal on Create |
| TTS (Phase 2) | **Google Cloud TTS** primary; EN-only fallback in Phase 1 |
| Video download (Phase 1) | **Blocked in UI** — no right-click menu, `controlsList=nodownload`, no PiP; MP4 URLs still reachable via devtools (Phase 2+: signed HLS / DRM) |
| Invitation signup (Phase 1) | **Backend-gated** — `invitation_codes` table seeded with `TRYWONDERREEL`; name + email + code + password; rate-limited auth routes |
