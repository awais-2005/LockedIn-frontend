# RoadmapAI — Frontend

The desktop-focused Next.js frontend for RoadmapAI: upload a course document, get a
locked day-by-day roadmap with AI lessons, a scoped tutor, coding/theory challenges,
and checkpoint quizzes.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, with a small custom design system (see `app/globals.css` / `tailwind.config.ts`)
- TanStack Query for all backend data fetching/caching (`lib/queries.ts`)
- `next-themes` for light/dark/system theming
- `@monaco-editor/react` for the code challenge editor
- `react-hook-form` + `zod` for every form (signup, login, OTP, course confirm)
- `react-dropzone` for the course upload step
- `sonner` for toasts
- `react-markdown` + `remark-gfm` for lesson content

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev
```

Open http://localhost:3000 — you'll land on `/dashboard`, and the middleware will
bounce you to `/login` if there's no valid `rm_session` cookie yet.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend, e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID used by the "Sign in with Google" button (Google Identity Services) |

## Auth model

The backend issues an **httpOnly session cookie** (`rm_session`) — the frontend never
sees or stores a token. Every request in `lib/api.ts` is sent with
`credentials: "include"`, and nothing auth-related touches `localStorage`.

- `middleware.ts` guards every `/dashboard/**` route. It does a fast check for the
  presence of the `rm_session` cookie, then confirms with the real backend via
  `GET /api/auth/me`, forwarding the request's cookie header. A `401` (or no cookie)
  redirects to `/login?next=<original path>`.
- `Navbar.tsx` also calls `GET /api/auth/me` (via `useMe()`) to show the signed-in
  user and drive logout.

## How the app maps to the backend contract

Every endpoint in the contract has a single typed wrapper in `lib/api.ts`, grouped by
resource (`authApi`, `coursesApi`, `daysApi`, `checkpointsApi`, `progressApi`), and a
matching TanStack Query hook in `lib/queries.ts`. Nothing calls `fetch` directly from
a component — everything goes through these two files, so the contract only needs to
be correct in one place.

| Route | What it calls |
|---|---|
| `/login`, `/signup`, `/verify-otp` | `authApi.login/signup/verifyOtp/resendOtp`, plus `authApi.google` via the Google Identity Services button |
| `/dashboard` | `coursesApi.list`, `coursesApi.remove` |
| `/dashboard/courses/new` | `coursesApi.analyze` (step 1) → `coursesApi.confirm` (step 2) |
| `/dashboard/courses/[courseId]` | `coursesApi.get`, `progressApi.get` |
| `/dashboard/courses/[courseId]/day/[dayNumber]` | `daysApi.get/chat/submitChallenge/complete` |
| `/dashboard/courses/[courseId]/checkpoint/[checkpointDay]` | `checkpointsApi.get/submit` |

A couple of implementation notes worth knowing about:

- **Completing a day**: `POST .../complete` returns `200 {status:"completed"}` on
  success. A `403` is treated as an error by the fetch wrapper (see `ApiError` in
  `lib/api.ts`) and its JSON body — `{reason, checkpoint_day?}` — is read back out in
  the day page's `catch` block to show why the day can't be completed yet.
- **Challenges without structured options**: the day-detail contract's
  `challenges[]` shape (`id, type, prompt, language, difficulty`) doesn't include an
  `options` array the way the checkpoint quiz does. So `mcq`/`scenario` challenges on
  a day render as a free-text answer box rather than an invented multiple-choice UI —
  this matches the contract exactly rather than guessing a new field.
- **The trail line** on the course board (`components/DayGrid.tsx`) is drawn by
  measuring each day card's position after render and connecting them with an SVG
  path — it's purely decorative and never affects layout or data.

## Folder structure

```
frontend/
  app/
    (auth)/login, signup, verify-otp
    dashboard/page.tsx                                  — course list
    dashboard/courses/new/page.tsx                       — upload + confirm wizard
    dashboard/courses/[courseId]/page.tsx                — day grid / trail board
    dashboard/courses/[courseId]/day/[dayNumber]/page.tsx        — Learn / Ask AI / Challenge
    dashboard/courses/[courseId]/checkpoint/[checkpointDay]/page.tsx — full-screen quiz
    layout.tsx, providers.tsx, fonts.ts, globals.css
  components/                — one file per component described in the spec, plus
                                a couple of small shared pieces (AuthShell, ui/*)
  lib/
    api.ts        — typed fetch wrappers, one per endpoint
    queries.ts    — TanStack Query hooks wrapping api.ts
    types.ts      — shapes shared across the app, matching the contract exactly
    useGoogleIdentity.ts, utils.ts
  middleware.ts   — auth guard for /dashboard/**
```

## Known limitations / TODOs

- The code editor's paste-blocking (`components/CodeEditor.tsx`) and the checkpoint
  quiz's copy/paste + tab-switch detection (`components/QuizRunner.tsx`) are
  client-side deterrents, not real security. Both are commented in place as such.
- Nothing in this repo invents a backend endpoint or field. Anywhere the UI needed
  something the contract doesn't provide (see the challenge-options note above), it's
  flagged with a `TODO` rather than guessed.
