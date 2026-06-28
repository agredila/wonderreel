# WonderReel — Implementation Plan (Flow v2)

Step-by-step checklist. Follow in order; each step has a verification gate.

---

## Phase A — Product & docs ✅

| Step | Task | Verify |
|------|------|--------|
| A1 | Update PRD §7 Flow 0, FR-A3, FR-L1/L2/L3 | PRD reflects landing-first + lazy child profile |
| A2 | Add `docs/USER-FLOW-v2.md` | Journey map + persona table |
| A3 | Update `docs/DECISIONS.md` | Child profile deferred decision logged |
| A4 | This file (`IMPLEMENTATION-PLAN.md`) | Team has ordered checklist |

---

## Phase B — Domain & application layer

| Step | Task | Files | Verify |
|------|------|-------|--------|
| B1 | Prompt persistence across auth | `web/src/lib/pendingPrompt.ts` | Prompt survives sign-up modal |
| B2 | Default viewer provisioning | `web/src/application/ensureViewer.ts` | First create works without onboarding page |
| B3 | Viewer display name constants | `web/src/shared/viewerDefaults.ts` | No magic strings in UI |

**Invariant:** `childId` required for API — provision default server-side via existing `POST /api/children`, never skip tenancy.

---

## Phase C — Presentation (landing + modals)

| Step | Task | Files | Verify |
|------|------|-------|--------|
| C1 | Film catalog grid (thumb, title, description) | `FilmCatalogGrid.tsx` | Guest sees 6 samples on landing |
| C2 | Landing hero: Video / Story tags | `DashboardPageClient.tsx` | Tags map to single vs three_part |
| C3 | Sign-up modal on Create (guest) | `SignUpModal.tsx` | Modal opens; no redirect to `/login` |
| C4 | Viewer setup at handoff | `ViewerSetupScreen.tsx` | Nickname optional; no `/onboarding` block |
| C5 | i18n strings | `messages/en.json` | New keys for modal, catalog, viewer |

---

## Phase D — Routing & access control

| Step | Task | Files | Verify |
|------|------|-------|--------|
| D1 | `useParentAccess` — login modal not redirect | `useParentAccess.ts` | `requireLogin()` returns boolean |
| D2 | Create page: no auto-redirect login | `CreatePageClient.tsx` | Guest redirected to dashboard only |
| D3 | KidShell: viewer setup not onboarding | `KidShell.tsx` | `/kid` never sends to onboarding |
| D4 | Auth callback resume prompt | `auth/callback/route.ts` or client | Post-login lands on create with prompt |
| D5 | Onboarding route → dashboard redirect | `onboarding/page.tsx` | Legacy URL still works |

---

## Phase D-auth — Invitation signup (backend + UI)

| Step | Task | Files | Verify |
|------|------|-------|--------|
| D6 | DB migration: invitations + display_name | `002_invitation_auth.sql` | `TRYWONDERREEL` seeded |
| D7 | Backend signup route | `authService.js`, `routes/auth.js` | Invalid code → 403; valid → 201 |
| D8 | Sign-up modal + login page | `ParentSignUpForm.tsx`, `SignUpModal.tsx`, `LoginPageClient.tsx` | 4 fields; password login |
| D9 | Supabase dashboard | Email/password enabled | `signInWithPassword` works |

**Supabase config:** Authentication → Providers → Email → enable Email provider with password sign-up. Disable Google OAuth for Phase 1. Run migration `002_invitation_auth.sql` on project.

---

## Phase E — Mobile & CSS

| Step | Task | Files | Verify |
|------|------|-------|--------|
| E1 | Landing grid responsive | `wonderreel.css` | 2-col phone, 3+ desktop |
| E2 | Sign-up / viewer modals | `wonderreel.css` | Full-screen sheet on mobile |
| E3 | Touch targets ≥ 48px on cards | CSS | DevTools audit |

---

## Phase F — Verification

| Step | Task | Verify |
|------|------|--------|
| F1 | `npm run build` in `web/` | Zero TS errors |
| F2 | Guest flow manual test | Browse → Create → modal → (dev skip auth) |
| F3 | Parent flow | Create → review → handoff with nickname |
| F4 | Security | Kid route has no create UI; unapproved films hidden |

---

## Phase G — Follow-up (not this sprint)

| Item | RICE | Notes |
|------|------|-------|
| Image generation tag | Low | Needs new pipeline; use Video/Story for v1 |
| i18n id/zh/ar for new strings | Medium | deepMerge fallback to EN today |
| Settings: multi-child | Medium | FR-A3 multi-child via Settings |
| Phase 2 motion polish | Medium | emil-design-eng + motion-design |

---

## Architecture note (senior-engineering)

```
web/src/
  application/ensureViewer.ts   ← use case: ensure default child exists
  shared/viewerDefaults.ts      ← constants
  lib/pendingPrompt.ts          ← session persistence (presentation helper)
  components/SignUpModal.tsx    ← presentation
  components/FilmCatalogGrid.tsx
  components/ViewerSetupScreen.tsx
```

Business rules stay in `application/`; pages orchestrate only.
