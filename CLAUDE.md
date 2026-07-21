# CLAUDE.md — reddington-v1

Instructions for Claude Code working in this repository.

## 1. Project Overview

AJIO-style fashion e-commerce app that doubles as a **DPDP (Digital Personal Data Protection Act, India) consent-mechanics demo**. All 4 phases are fully implemented and Playwright-verified. The app intentionally exposes every consent gate so the behaviour can be demonstrated and audited.

## 2. Stack

| Layer | Technology |
|-------|-----------|
| Database | PostgreSQL (Neon cloud, us-east-1) via Prisma 6 |
| Server | Node 24, Express 4, ESM (`type:module`) |
| Client | React 19 (JSX only), Vite 8, Tailwind v4, shadcn/ui new-york |
| Auth | JWT in httpOnly cookies (7-day expiry) |
| Testing | Jest + Supertest, separate Neon `reddington_test` database |

## 3. CRITICAL Constraints

- **NO TypeScript anywhere.** A downstream Python agent statically parses JS controller/service code to build a DPDP compliance graph. TypeScript would break that parser.
- **All consent writes go through ONE endpoint:** `POST /api/consents/decisions`. Never insert `ConsentEvent` rows directly in route handlers.
- **Never trust client-supplied consent flags server-side.** Always re-query `ConsentState` via the `requireConsent(purposeId)` middleware.
- **`ConsentEvent` rows are append-only.** Never run `update` or `delete` on that table.
- **`server/.env` must never be committed.** It contains live Neon credentials.

## 4. Dev Setup

```sh
npm install                          # root — installs concurrently
cd server && npm install
cd client && npm install
# create server/.env  (see server/README.md for required variables)
cd server && npm run migrate         # prisma migrate dev — applies schema to dev DB
cd server && npm run db:seed         # seeds 7 purposes + notice v1 + 41 products
cd ..
npm run dev                          # from root: starts server (:5000) + client (:5173)
```

## 5. Key npm Scripts

**Root**
- `npm run dev` — runs server + client concurrently via `concurrently`

**Server** (`cd server`)
- `dev` — `node --watch src/server.js` (auto-reload)
- `start` — `node src/server.js` (production)
- `migrate` — `prisma migrate dev`
- `db:seed` — `prisma db seed`
- `bump-notice` — publish a new notice version (triggers forced re-consent on next login)
- `studio` — Prisma GUI at `:5555`
- `test` — Jest + Supertest against the `reddington_test` DB

**Client** (`cd client`)
- `dev` — Vite dev server at `:5173`
- `build` — production build → `dist/`
- `preview` — serve `dist/` at `:5173` (use this for E2E tests, not `dev`)
- `lint` — oxlint

## 6. Architecture: Consent Engine

```
POST /api/consents/decisions
  └─ consent/service.js  recordDecisions()
       └─ prisma.$transaction(fn, { timeout: 20000, maxWait: 15000 })
            ├─ ConsentEvent.createMany()        ← append-only audit rows
            ├─ ConsentState.upsert() × N        ← derived current state
            └─ User.update lastConsentedNoticeVersion  (registration / re_consent only)
```

`requireConsent(purposeId)` middleware factory lives in `src/middleware/requireConsent.js`. It reads `ConsentState` at request time and returns `403 { error: 'consent_required', purposeId }` when the status is not `'granted'`. It always runs after `requireAuth`.

## 7. Known Gotchas

- **Neon latency ~256ms/RTT** (us-east-1, India): a 9-query transaction takes ~3 s. Never reduce `prisma.$transaction` timeout below 20 s.
- **Vite 8 HMR crash** (Windows, exit code `0xC0000409` / STATUS_STACK_BUFFER_OVERRUN): do **not** run Playwright or long E2E tests against `vite dev`. Always use `npm run build && npm run preview` + plain `node src/server.js`.
- **`preview.proxy` must be configured** in `client/vite.config.js` — `vite preview` does not inherit `server.proxy`. This is already set up; don't remove it.
- **Soft references in consent domain**: `ConsentEvent.purposeId`, `ConsentEvent.noticeVersion`, `User.lastConsentedNoticeVersion` have **no database FK**. This is intentional — it keeps the append-only audit log independent of catalog changes and readable by the Python DPDP-graph agent.

## 8. Testing

```sh
cd server && npm test
```

- Jest + Supertest, `--runInBand` (sequential; single shared Neon test DB)
- Requires `TEST_DATABASE_URL` in `server/.env` pointing at a separate `reddington_test` Neon database
- `tests/globalSetup.js` overrides `DATABASE_URL` → `TEST_DATABASE_URL`; runs `prisma migrate deploy`
- `tests/helpers.js` — `assertTestDb()` throws if the current database is not `reddington_test` (prevents accidental production truncation)
- 12 tests across `auth.test.js` (5) and `consent.test.js` (7)

## 9. File Structure

```
reddington-v1/
├── client/        React 19 + Vite 8 frontend
├── server/        Express 4 + Prisma 6 backend
├── docs/          Design docs (01–07); excluded from git via server/.gitignore
├── package.json   Root — concurrently dev script
└── CLAUDE.md      ← this file
```

## 10. Navigation Example — Finding a Module (Server)

> **Task:** "I want to understand how personalized recommendations work."

1. Open `server/src/modules/recommendation/routes.js` — two routes: `GET /` (gated by `requireConsent('personalized_recommendations')`) and `POST /view`
2. Each route delegates to `server/src/modules/recommendation/service.js` — DB queries live here (reads `ViewEvent` history, returns ranked products)
3. The consent gate is applied by `server/src/middleware/requireConsent.js` — returns 403 if `ConsentState.status !== 'granted'`
4. View events that feed the algorithm are written by `POST /recommendations/view` → `service.recordView()` → `prisma.viewEvent.create()`

**Pattern:** `routes.js` (HTTP layer) → `service.js` (business logic + Prisma queries). Every module follows this two-file pattern.

## 11. What NOT To Do

- Don't add `.ts` files or TypeScript anywhere
- Don't add a second consent write path — no direct `ConsentEvent` inserts in route handlers
- Don't `update` or `delete` `ConsentEvent` rows
- Don't commit `server/.env`
- Don't run Playwright against `vite dev` — use `vite preview`
- Don't lower the `prisma.$transaction` timeout below 20 s
