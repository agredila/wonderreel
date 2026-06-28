# WonderReel — Product Requirements Document (PRD)

> **Tagline:** *Little Films, Big Lessons.*
> A web app where parents turn their own story ideas into safe, AI-generated short films for their children.

| Field | Value |
|---|---|
| **Product** | WonderReel |
| **Document type** | Engineering build specification |
| **Version** | 1.2 (revised) |
| **Status** | Draft for build |
| **Last updated** | 2026-05-31 |
| **Owner** | _[You / Founder]_ |
| **Origin** | 2nd-place winner — TRAE × PixVerse Video Generation Track |
| **Built with** | TRAE (development + orchestration) · Gemini (language + prompt-building + moderation) · PixVerse V6 (video generation) |

> **v1.1 changes:** Core pivoted to parent-generated live creation; languages → EN / ID / Mandarin / Arabic + RTL; added Gemini Story-to-Prompt engine, layered moderation, multi-part stories, per-account quotas.
> **v1.2 changes:** **Accounts & login are now required and foundational (multi-tenant).** Added an Accounts & Authentication requirement group, the Account / Parental-gate / Kid-Mode distinction, an onboarding flow, and tenancy isolation in the data model.

---

## 1. Overview

### 1.1 Vision
Every child deserves screen time that *teaches* — and every parent deserves to be the storyteller. WonderReel lets a parent describe a story in their own words and turns it into a short, cinematic, age-appropriate film for their child, in a safe, ad-free space.

### 1.2 Problem
- Quality, **personalized** children's video is impossible to make at home.
- The open web is an **unmoderated, ad-filled rabbit hole** parents can't trust.
- Good content is rarely **multilingual** — leaving many households underserved.

### 1.3 Solution
A responsive, **account-based** web app with two strictly separated surfaces:

1. **Kid Mode (watch-only, locked).** A calm library of *that child's* films. **No creation, prompt, or settings UI is visible to the child.**
2. **Parent Studio (behind login + a parental gate).** A parent writes a story idea in their own language → WonderReel safely turns it into a film via **Gemini → PixVerse**, the parent previews and approves it, and it lands in the child's library.

Each parent account is a **private tenant**. Children **only ever watch** films that automated moderation **and** their parent have approved.

### 1.4 Goals (v1)
- **Secure parent accounts** with private, isolated content (multi-tenant); children never log in.
- Parents generate a ~30s film from a **natural-language** story in any of **4 languages**, optionally **split into ~3 parts**.
- **Full auto-switching i18n** across all UI text: **EN / ID / Mandarin / Arabic**, including **RTL** for Arabic.
- **Layered safety:** input moderation + brand-safe prompt construction + output moderation + mandatory parent approval.
- Free for end users (founder funds PixVerse credits), protected by per-account generation quotas.

### 1.5 Non-Goals (v1)
- ❌ **No creation/prompt surface exposed to children** — generation is parent-only, always.
- ❌ **No child logins** — children use the parent's authenticated session in locked Kid Mode.
- ❌ No payments/subscriptions yet (free for now; quota-limited).
- ❌ No native iOS/Android apps (responsive web + PWA).
- ❌ No social features, comments, chat, or sharing of films between accounts.

---

## 2. Success Metrics

| Category | Metric | v1 Target |
|---|---|---|
| **Safety** | Unsafe films reaching a child | **0** |
| **Safety** | Films viewed by a child that passed auto-moderation **and** parent approval | **100%** |
| **Privacy** | Cross-account data leaks | **0** |
| **Creation** | Story → finished film success rate | ≥ 90% |
| **Creation** | Median time-to-film | < 5 min |
| **Activation** | New parents who sign up **and** generate ≥ 1 approved film | ≥ 50% |
| **Engagement** | Films watched per child per week | ≥ 3 |
| **Engagement** | Film completion rate | ≥ 70% |
| **Retention** | Returning parents (D30) | ≥ 25% |
| **Performance** | Watch start time (p75, from CDN) | < 2.0s |
| **Cost guardrail** | Avg. PixVerse generations per parent / month | within funded quota |

> All analytics are **aggregate and PII-free** (see §10).

---

## 3. Target Users & Personas

### 3.1 The Child (ages 2–7) — *watcher only*
Pre/early reader → **audio-first, icon-driven**, touch-first (often iPad). Never logs in; never sees creation tools.

### 3.2 The Parent (account owner + storyteller + approver) — *primary creator*
Owns the account; writes story ideas in their own language; previews and approves films; controls the child's experience. The human-in-the-loop for safety.

### 3.3 Educators / Daycares — *future*, out of scope for v1.

---

## 4. Content & Safety Model — *Parent-Generated, Child-Consumed*

> Live parent-generation is the core. The model below keeps it safe through layered defense + a hard Kid/Parent wall.

### 4.1 The model
**Parents create. Automated moderation screens. Parents approve. Children only watch approved films.**

```
PARENT STUDIO (behind login + parental gate — hidden from kids)
  1. Parent writes a story idea in EN / ID / Mandarin / Arabic
  2. INPUT MODERATION (Gemini): screen the story → warn or block if unsafe
  3. STORY-TO-PROMPT ENGINE (Gemini): translate → strip brand names →
     build brand-safe structured PixVerse prompt(s) in WonderReel's locked style
     (single film, or split into ~3 parts)
  4. GENERATION (PixVerse V6): render shot(s) → assemble (stitch, captions, narration, overlays)
  5. OUTPUT MODERATION (Gemini vision): scan frames/thumbnail → auto-flag/hold if questionable
  6. PARENT PREVIEW + APPROVE  ← mandatory human-in-the-loop
        → publish to THIS child's library (private to the account)
KID MODE (watch-only, locked, inside the parent's session)
  7. Child watches only approved films
```

### 4.2 How children are kept away from creation ("hide the prompt box")
- **Two hard-separated modes.** Kid Mode is the default and is **locked**: it renders only the child's library + player. The prompt/creation UI **does not exist** in the Kid Mode route/DOM.
- **Parental gate** (adult-only challenge) is required to enter Parent Studio. Not solvable by random tapping.
- **Kid Lock.** Exiting Kid Mode requires the gate again. Optional PIN.
- **Result:** the only path to a prompt box is through the gate inside a logged-in session; a child cannot reach it.

### 4.3 Automatic warning on creation
- **Real-time input check** as the parent submits: Gemini flags unsafe content → **automatic warning + block**. Brand names trigger a softer warning + auto-rewrite (§4.4).
- **Standing disclaimer:** "AI-generated — please preview before sharing with your child," reinforced by the mandatory preview/approve step.

### 4.4 Brand-safe, style-locked generation ("no Pixar/Disney/Ghibli/DreamWorks")
The Story-to-Prompt engine **never** passes brand/studio/character names to PixVerse. It strips/replaces banned terms (Appendix A), always injects WonderReel's **locked visual style + camera + lighting + subject/action** scaffold, so output is consistently on-brand and original. The parent supplies only the *story*.

### 4.5 Residual risk (honest)
Automated moderation isn't perfect. The defense is **layered**: input screen + style-locked prompts + output screen + **mandatory parent approval** + watch-only kid mode + per-account audit log. No single layer is trusted alone.

---

## 5. Scope

### 5.1 In scope (v1)
Accounts & login (multi-tenant) · Parent Studio (gate, story input, multi-part, Gemini engine, moderation, generation, preview/approve, library mgmt) · Kid Mode (locked watch + player + recap) · 4-language auto i18n + RTL · responsive web + PWA · per-account quotas.

### 5.2 Out of scope (later)
Native apps · monetization · sharing/social · classroom tools · offline downloads · cross-account discovery.

---

## 6. Functional Requirements

> Priorities: **P0** = MVP-critical · **P1** = important · **P2** = nice-to-have. Each includes acceptance criteria (AC).

### 6.1 Accounts & Authentication (P0 — foundational)
> Because every parent has their own private stories and films, WonderReel is **multi-tenant**; an account is mandatory.

- **FR-A1 (P0) Parent sign-up & login.** Adults create an account with **name, email, invitation code, and password** (invitation-only beta; default code `TRYWONDERREEL`). Login is **email + password** via Supabase. Sign-up is validated server-side before account creation. Children never log in.
  - *AC:* Guest tapping Create sees sign-up modal; valid invitation + credentials create account and resume create flow in < 2 min; invalid code rejected; duplicate email rejected.
- **FR-A2 (P0) Private, isolated tenancy.** All stories, films, child profiles, settings, and quota belong to the account and are **never** visible to any other account.
  - *AC:* Every read/write is scoped by `accountId` (row-level); no cross-account access possible.
- **FR-A3 (P0) Child profiles under the account.** A parent may create ≥ 1 child profile (optional nickname/avatar + age band + languages); films attach to a child profile. **Profiles are created lazily** — not required at sign-up (see Flow 0).
  - *AC:* Multiple children per account (via Settings); switching child swaps the library; a default viewer profile may be auto-provisioned on first create if none exists; parents may set a nickname at Kid handoff.
- **FR-A4 (P0) Multi-device sync.** Logging in on another device (phone ↔ iPad) shows the same content.
  - *AC:* Content follows the account, not the device.
- **FR-A5 (P0) Session + Kid Mode handoff.** Parent logs in once per device; **Kid Mode is a locked state inside that authenticated session.**
  - *AC:* Entering Kid Mode never logs out; leaving Kid Mode requires the **parental gate**, not a full re-login.
- **FR-A6 (P0) Account management.** Update email, log out, and **delete account** (erases all stories/films/child data — see §10).
  - *AC:* Deletion is irreversible and removes all associated content within the stated retention window.

> **Login vs Gate vs Kid Mode** — three distinct concepts: **Login** = adult identity owning private content (persists); **Parental gate** = quick adult challenge to leave Kid Mode / open Studio (every protected action); **Kid Mode** = locked watch-only state inside the parent's session.

### 6.2 Kid Mode (watch-only, locked)
- **FR-1 (P0) Child Library.** Show only this child's **approved** films as large tappable tiles with spoken labels.
  - *AC:* Unapproved/in-progress films never appear; no creation/settings UI present in Kid Mode.
- **FR-2 (P0) Safe Player.** Full-screen, distraction-free; large play/pause + 1-tap home; no external chrome/share/related surfaces.
- **FR-3 (P0) Kid Lock.** All exits to Parent Studio/settings require the parental gate.
- **FR-4 (P1) Tap-to-Learn + Gentle Recap.** Interactive moments + 2–3 audio-question recap; always encouraging, no blocking fail state.
- **FR-5 (P1) Safe "play next"** within the child's own library only (no autoplay elsewhere).

### 6.3 Parent Studio — Access & Creation (behind login + gate)
- **FR-6 (P0) Parental Gate.** Adult-only challenge before any Studio access or protected action.
- **FR-7 (P0) Natural-language story input.** Parent writes the story in any of the 4 languages; no prompt-engineering required.
  - *AC:* Accepts EN/ID/ZH/AR (incl. RTL entry for Arabic); examples shown.
- **FR-8 (P0) Story structure option.** Choose **single film** or **multi-part (~3 parts)**; multi-part decomposes the story into ~3 scenes/acts.
  - *AC:* Multi-part yields a coherent stitched film with consistent style/characters.
- **FR-9 (P0) Input moderation + auto-warning.** Screen the story (Gemini); warn + block unsafe content; warn + auto-rewrite brand names.
  - *AC:* Unsafe stories cannot proceed; the parent sees a clear, kind explanation.

### 6.4 Parent Studio — Generation & Approval
- **FR-10 (P0) Story-to-Prompt engine (Gemini).** Translate to English, sanitize, build the brand-safe, style-locked PixVerse prompt(s).
  - *AC:* No banned term reaches PixVerse; locked style/camera/lighting/subject always applied.
- **FR-11 (P0) Generation (PixVerse V6).** Generate shot(s), assemble the ~30s film; **async** with a clear "your film is being made" state + notify on ready.
  - *AC:* Keys server-side; jobs retryable.
- **FR-12 (P0) Output moderation.** Automated vision check on frames/thumbnail before approval.
  - *AC:* Flagged films are held; cannot publish without explicit handling.
- **FR-13 (P0) Parent preview + approve.** Parent watches the film, then **approve** (→ child library) or **discard / regenerate**.
  - *AC:* Reaches Kid Mode **only** after parent approval; decisions audit-logged.
- **FR-14 (P1) Library management.** Organize, rename, hide, delete films; manage child profiles.
- **FR-15 (P1) Numbers/letters accuracy.** Overlay **clean** digits/letters as real text (don't trust AI render).

### 6.5 Internationalization (auto-switching, 4 languages)
- **FR-16 (P0) Full UI i18n.** Switching language **instantly updates ALL website text** (no hard-coded strings): EN / ID / Mandarin / Arabic.
  - *AC:* 100% of UI strings localized; default follows device locale; fallback EN; choice persists per account/device.
- **FR-17 (P0) RTL support (Arabic).** Full right-to-left layout: mirrored nav, alignment, icons, bidirectional text.
  - *AC:* No clipped/mis-mirrored elements on AR; verified on phone + iPad.
- **FR-18 (P0) Indonesian Bilingual Safety Flow.** Parents input prompts in Bahasa Indonesia (`id`). The generated video plays clear English audio/narration (sound video) for language learning, but displays Bahasa Indonesia subtitles/captions on-screen so the parent can fully audit the safety.

### 6.7 Landing & Activation (P0)
- **FR-L1 (P0) Public landing.** Unauthenticated visitors see a colorful landing with a story prompt box and a browsable catalog of sample films (thumbnail, title, one-line description). Sample films playable in a modal without an account.
  - *AC:* Guest can browse and watch samples; no child data collected on landing.
- **FR-L2 (P0) Sign-up on create intent.** Tapping **Create** while logged out opens a sign-up modal (name, email, invitation code, password); the prompt text is preserved across auth.
  - *AC:* After auth, parent returns to creation with prompt intact; no full-page redirect required.
- **FR-L3 (P0) Mobile-first landing.** Phone layout: prompt accessible without excessive scroll; film cards in a responsive grid; touch targets ≥ 48px; bottom nav when logged in.
  - *AC:* Verified at ≤ 480px width; PWA installable on iPad.

### 6.6 Platform & Accessibility
- **FR-19 (P0) Responsive + PWA.** Phone / iPad / desktop; installable, full-screen on iPad.
- **FR-20 (P0) Accessibility.** Audio-first; WCAG 2.1 AA contrast; large touch targets; reduced-motion; localized fonts incl. Arabic.
- **FR-21 (P1) Per-account generation quota.** Configurable monthly generation limit per parent (cost guardrail; default locked to 3-5 films per month for beta).
- **FR-22 (P1) IP & Anti-Cheat Protection.** To prevent users from bulk downloading generated videos and uploading/monetizing them on YouTube:
  - Automatically overlay a semi-transparent "WonderReel" watermark onto the video via FFmpeg.
  - Stitch a short 2-second branded outro bumper to the end of every approved video.
  - Serve files via secure, expiring signed URLs.
- **FR-23 (P1) Bandwidth Optimization.** To support families on limited mobile data (especially under Option B):
  - Cap video resolution at `540p` with efficient h.264 encoding.
  - Leverage PWA caching and service workers so repeat views of child's favorite videos use zero extra cellular data.

---

## 7. Key User Flows

**Flow 0 — Parent activation (v2):** Land on **public landing** (browse sample films + prompt) → tap **Create** → **sign-up modal** if logged out (prompt preserved) → write story → **parental gate** → generate → **review & approve** → optional **viewer nickname** at Kid handoff → **Kid Mode**.

> **Child profile timing:** No child PII at sign-up. A default viewer may be provisioned silently on first create; parents set or change a nickname at **Kid handoff** (real names not required).

**Flow A — Child watches (locked):** Kid Mode → tap a film → plays (narration + captions) → tap-to-learn → gentle recap → "play next" within own library. *No creation visible.*

**Flow B — Parent creates a film:** Parent → **gate** → write story (own language) → single / 3-part → **input moderation** → generate (async; "being made") → **output moderation** → **preview → approve** → film appears in child's library.

**Flow C — Switch language:** Pick EN/ID/ZH/AR → all UI text updates instantly; Arabic flips layout to RTL.

---

## 8. Non-Functional Requirements

- **NFR-1 Tenancy isolation.** All content scoped by `accountId`; enforced server-side (row-level), not just in UI.
- **NFR-2 Mode isolation.** Kid Mode and Parent Studio separately routed/guarded; creation code never loads in Kid Mode.
- **NFR-3 Responsive + PWA.** Breakpoints: phone ≤ 480px, tablet/iPad 481–1024px, desktop > 1024px; touch-first; tested on iPad Safari.
- **NFR-4 RTL/bidi.** First-class RTL for Arabic (logical CSS properties, `dir` handling, mirrored components).
- **NFR-5 Async generation UX.** Generation takes minutes — handle pending/ready/failed states; notify parent on completion.
- **NFR-6 Watch performance.** Approved films from CDN; start < 2.0s (p75).
- **NFR-7 Security.** PixVerse + Gemini keys server-side; session security (secure cookies, CSRF protection); rate limits + quotas; prompt-injection-resistant sanitization.
- **NFR-8 Localization.** 4 languages incl. Arabic fonts + RTL; locale-aware formatting; no hard-coded strings.
- **NFR-9 Observability.** Error monitoring; PII-free analytics; full generation + approval + auth audit log.

---

## 9. Technical Architecture

### 9.1 High-level
```
[ Kid Mode (PWA, locked) ] ──reads──> [ Approved-films catalog + Video CDN ]
        ▲ (no model calls, no creation; runs in parent's session)
        │
[ Auth + Parent Studio (gated) ] ──> [ Backend API ] ──> [ Postgres (multi-tenant) + Object storage/CDN ]
            │                              │
            │                              ├── Gemini: input moderation
            │                              ├── Gemini: translate + Story-to-Prompt (brand-safe, style-locked)
            │                              ├── PixVerse V6: generate shots (founder's credits)
            │                              ├── assemble: stitch + captions + narration + overlays
            │                              └── Gemini Vision: output moderation
            └── preview → parent approve → publish (scoped to account)
```

### 9.2 Suggested stack
- **Frontend:** Next.js (React) + TypeScript + Tailwind; PWA; i18n (e.g., next-intl) with **RTL**; built in **TRAE**.
- **Backend:** Next.js API routes / small Node service; REST/JSON; async job queue for generation.
- **DB:** PostgreSQL (multi-tenant, row-level scoping by `accountId`); object storage + CDN (videos, thumbnails, audio, captions).
- **Auth:** **parent accounts via email magic-link and/or Google OAuth**; secure sessions; role/mode guards; **children never authenticate**. (Consider an auth provider like Auth.js/Clerk/Supabase Auth.)
- **AI services (server-side only):** **Gemini** (input moderation, translation, Story-to-Prompt, output vision moderation) · **PixVerse V6** (generation via founder's credits).

### 9.3 Data model (core entities)
| Entity | Key fields |
|---|---|
| **ParentAccount** | id, email, authProvider, locale, generationQuotaUsed, lastLoginAt, createdAt |
| **ChildProfile** | id, **accountId**, displayName (first-name/avatar only), ageBand, allowedLanguages |
| **Story** | id, **accountId**, childId, rawText, language, structure(`single`/`three_part`) |
| **ModerationResult** | id, targetType(`input`/`output`), decision(`pass`/`warn`/`block`), reasons[], model |
| **PromptBuild** | id, storyId, englishPrompt(s), styleString, parts[], bannedTermsStripped[] |
| **GenerationJob** | id, promptBuildId, pixverseJobIds[], status, resultAssetId, error |
| **Film** | id, **accountId**, childId, title{en,id,zh,ar}, durationSec, thumbnailUrl, status(`generating`/`needs_review`/`approved`/`hidden`), approvedByParentAt |
| **FilmAsset** | id, filmId, language, videoUrl, captionsUrl, audioUrl, overlayMeta |
| **Recap** | id, filmId, type(`tap`/`quiz`), items[], i18n |
| **ProgressEvent** | id, childId, filmId, event(`started`/`completed`/`recap_done`), ts |
| **AuditLog** | id, accountId, actor, action(`login`/`generate`/`approve`/`delete`…), entity, ts |

> **Tenancy rule:** every content row carries `accountId`; all queries filter by the authenticated account. No endpoint returns another account's data.

---

## 10. Privacy, Compliance & Legal (Children's Product)

Targets children under 13 (core 2–7) → **COPPA (US)**, **GDPR / GDPR-K (EU)**, **Indonesia UU PDP No. 27/2022**. Also accounts for **third-party AI processing** and **personal data inside stories**.

- **No personal data collected from children.** Accounts are adults-only; child profiles use first name/avatar only; children never log in.
- **Stories may contain personal details** (e.g., the child's name) → treat as personal data: encrypt, minimize, parent-owned, deletable; **never used for advertising or model training**.
- **Third-party processors.** Story text/prompts go to Gemini; prompts go to PixVerse → disclose processors in the privacy policy; pursue data-processing terms; prefer no-training settings.
- **No ad/tracking SDKs.** First-party, aggregate analytics only.
- **Parental control.** Parents can view, export, and delete all their/their child's data; manage the gate/PIN; delete the account entirely.
- **Transparency.** Plain-language privacy policy + a parent-facing "Our Safety Promise."

---

## 11. Release Plan / Roadmap

| Phase | Focus | Key deliverables |
|---|---|---|
| **Phase 0 — Foundation** | Plumbing | Repo, responsive shell + PWA, **auth + multi-tenant DB**, i18n + RTL scaffold (4 langs), CDN, job queue, CI |
| **Phase 1 — Create & Watch (MVP)** | The core loop | Login + child profiles, parental gate, story input, **Gemini Story-to-Prompt**, **input+output moderation**, PixVerse generation, **preview/approve**, locked Kid Mode + player |
| **Phase 2 — Learn & polish** | Beyond playback | Multi-part stories, tap-to-learn + recap, library mgmt, parent progress view |
| **Phase 3 — Scale & guardrails** | Sustainability | Per-account quotas, caching, cost dashboards, abuse/jailbreak hardening |
| **Phase 4 — Monetize** | Unit economics | Freemium (free tier + paid generation packs/subscription) — pulled earlier; live generation has real per-film cost |

---

## 12. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Unsafe film reaches a child | Critical | Layered: input mod + style-locked prompts + output mod + **mandatory parent approval** + watch-only Kid Mode |
| **Cross-account data leak** | Critical | Server-side `accountId` scoping on every query; tenancy tests; no client-trusted filters |
| Moderation false-negative | High | Defense-in-depth; parent approval is final gate; parent "report/hide"; tune thresholds |
| Live-generation cost (founder-funded "free") | High | Per-account quotas; cache/reuse; monetization in Phase 4; monitor cost/parent |
| Child reaches the prompt box | High | Hard mode isolation; gate on every exit; creation code absent from Kid Mode |
| Prompt-injection to bypass safety | Medium | Server-enforced sanitization + style scaffold; banned-term filter independent of user text |
| Generation latency hurts UX | Medium | Async "being made" + notify-on-ready; encourage pre-making films |
| Arabic RTL defects | Medium | RTL designed in from Phase 0; logical CSS; QA on AR + iPad |
| Account/auth abuse (spam signups) | Medium | OAuth/magic-link, rate limits, email verification, quota caps |

---

## 13. Open Questions
1. **Auth provider** preference — magic-link only, Google OAuth, or both? Managed (Clerk/Supabase/Auth.js) or self-rolled?
2. **Per-account generation quota** for v1 (films/month) given your PixVerse budget?
3. **Arabic + Mandarin narration/TTS** source — which voice/provider?
4. Keep a small **curated starter library** for cold-start before a parent creates?
5. Target age skew (2–4 vs 5–7) and **final brand name** lock?

> **Resolved in v1.2 build:** Q4 yes (starter library); Q5 balanced 2–7, brand WonderReel. **v1.3 UX:** child profile deferred to handoff; landing-first activation (Flow 0 v2).

---

## Appendix A — Story-to-Prompt Engine & Generation Standards

**Engine job (Gemini):** `natural-language story (any of 4 langs)` → `safety screen` → `translate to EN` → `strip banned terms` → `inject locked style scaffold` → `structured PixVerse prompt(s)` (1 or ~3 parts).

**Locked visual style (brand-safe — never name a studio):**
```
soft 3D animated-movie style, rounded friendly character design, big expressive sparkly eyes,
smooth glossy surfaces with subtle subsurface scattering, warm cinematic global illumination,
bright cheerful pastel palette, polished wholesome family-film CGI, kawaii
```

**Prompt scaffold the engine fills (PixVerse V6):**
```
Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational film.
Subject & action: [from parent's story]. Camera: [engine-chosen gentle move].
Lighting: [warm, soft]. Visual style: [locked style above]. Scene purpose: [from story].
```

**Multi-part (~3 parts):** decompose into 3 beats (beginning / middle / happy ending); a shot per beat; stitch into one ~30–45s film (PixVerse caps at 15s/clip) with consistent style + characters.

**Banned in prompts (auto-stripped):** studio/brand names (Pixar, Disney, Ghibli, DreamWorks, Illumination…), copyrighted characters (Mickey, Elsa, Peppa…), celebrity/real-person names, logos.

**Numbers & Alphabet accuracy:** generate the scene + objects with PixVerse, then **overlay clean digits/letters as real text** in assembly.

**Language handling:** build the PixVerse prompt in **English** for best results. The user inputs the story in **Bahasa Indonesia**. The engine translates to **English** for PixVerse prompts, and generates **English audio/narration** for children's learning, but renders **Bahasa Indonesia subtitles/captions** to assist the non-fluent parent in auditing the content.

---

*Built with TRAE · Gemini · PixVerse V6 — "Little Films, Big Lessons."*
