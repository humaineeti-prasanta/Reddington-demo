# server — reddington-v1 backend

Express 4 REST API. ESM (`type:module`). Node 24. PostgreSQL (Neon) via Prisma 6.

## Setup

```sh
cd server
npm install
# create .env with the required variables listed below
npm run migrate    # prisma migrate dev — applies schema migrations to dev DB
npm run db:seed    # seeds 7 consent purposes + notice v1 + 41 products
npm run dev        # node --watch src/server.js, serves on port 5000
```

## Environment Variables

Create `server/.env` (never commit this file — it is gitignored):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | HTTP port |
| `DATABASE_URL` | Yes | — | Neon PostgreSQL connection string (dev DB `neondb`) |
| `TEST_DATABASE_URL` | Yes (tests) | — | Neon connection string for the separate `reddington_test` DB |
| `JWT_SECRET` | Yes | — | Secret for signing / verifying JWTs |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | CORS allowed origin |

## npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `node --watch src/server.js` | Development with auto-reload |
| `start` | `node src/server.js` | Production start |
| `migrate` | `prisma migrate dev` | Create + apply schema migrations |
| `db:seed` | `prisma db seed` | Seed catalog and consent data |
| `bump-notice` | `node src/seed/bump-notice.js` | Publish a new notice version (forces re-consent on next login) |
| `studio` | `prisma studio` | Prisma data browser GUI at `:5555` |
| `test` | `cross-env NODE_ENV=test ... jest --runInBand` | Run Jest + Supertest test suite |

## API Routes

Base URL: `/api`

| Method | Path | Auth | Consent Gate | Description |
|--------|------|:----:|:------------:|-------------|
| GET | `/health` | | | Health check |
| **— AUTH —** | | | | |
| POST | `/auth/register` | | | Register user; sets httpOnly JWT cookie |
| POST | `/auth/login` | | | Login; sets httpOnly JWT cookie; returns `reconsentRequired` |
| POST | `/auth/logout` | | | Clears JWT cookie |
| GET | `/auth/me` | 🔒 | | Current user + `reconsentRequired` flag |
| **— CONSENT —** | | | | |
| GET | `/consents/purposes` | | | Purpose catalog + active notice (public) |
| GET | `/consents/me` | 🔒 | | User's current consent statuses |
| POST | `/consents/decisions` | 🔒 | | Record consent decisions — **the single write path** |
| GET | `/consents/history` | 🔒 | | Full append-only audit event history |
| **— USER —** | | | | |
| GET | `/users/profile` | 🔒 | | Get profile (name, email, phone) |
| PUT | `/users/profile` | 🔒 | | Update profile |
| GET | `/users/wishlist` | 🔒 | | Wishlist items |
| POST | `/users/wishlist/:productId` | 🔒 | | Add to wishlist |
| DELETE | `/users/wishlist/:productId` | 🔒 | | Remove from wishlist |
| **— PRODUCT —** | | | | |
| GET | `/products` | | | List products (query: `category`, `search`, `sort`, `page`, `limit`) |
| GET | `/products/categories` | | | Category enum values |
| GET | `/products/offers` | 🔒 | `location_offers` | Location-based discount offers (requires `lat` + `lng` query params) |
| GET | `/products/:id` | | | Single product |
| **— CART —** | | | | |
| GET | `/cart` | 🔒 | | Get cart |
| POST | `/cart/items` | 🔒 | | Add item (body: `productId`, `qty`, `size`) |
| PUT | `/cart/items/:productId` | 🔒 | | Update qty / size |
| DELETE | `/cart/items/:productId` | 🔒 | | Remove item |
| **— ORDERS —** | | | | |
| POST | `/orders` | 🔒 | | Checkout — consent-gated side effects (see Order Side Effects) |
| GET | `/orders` | 🔒 | | Order history |
| GET | `/orders/:id` | 🔒 | | Order detail |
| **— NOTIFICATIONS —** | | | | |
| GET | `/notifications` | 🔒 | | List notifications |
| GET | `/notifications/unread-count` | 🔒 | | Unread badge count |
| PUT | `/notifications/:id/read` | 🔒 | | Mark notification as read |
| **— RECOMMENDATIONS —** | | | | |
| GET | `/recommendations` | 🔒 | `personalized_recommendations` | Personalized product recs (based on ViewEvent history) |
| POST | `/recommendations/view` | 🔒 | `personalized_recommendations` | Record a product view event |
| **— ANALYTICS —** | | | | |
| POST | `/analytics/events` | 🔒 | `device_analytics` | Record `session_start` or `page_view` event |

**🔒** = `requireAuth` middleware (reads httpOnly cookie, verifies JWT, attaches `req.user.id`).  
**Consent Gate** = `requireConsent(purposeId)` middleware; returns `403 { error: 'consent_required', purposeId }` when the user's consent status is not `'granted'`.

## Module Architecture

```
server/src/
├── server.js              Entry point — binds to PORT
├── app.js                 Express app: CORS → cookie-parser → JSON → route mounts → error handlers
├── config/
│   └── prisma.js          PrismaClient singleton (globalThis guard prevents multiple instances)
├── middleware/
│   ├── auth.js            requireAuth — verifies JWT cookie → req.user = { id }; returns 401 otherwise
│   ├── requireConsent.js  requireConsent(purposeId) factory — checks ConsentState, returns 403 if not granted
│   └── error.js           notFound (404) + errorHandler (4-arg Express error middleware)
└── modules/
    ├── auth/              routes.js + service.js — register, login, logout, /me
    ├── consent/           routes.js + service.js — purposes, /me, /decisions (write path), history
    ├── user/              routes.js + service.js — profile CRUD, wishlist CRUD
    ├── product/           routes.js + service.js — catalog list/detail, offers
    ├── cart/              routes.js + service.js — cart CRUD
    ├── order/             routes.js + service.js — checkout, list, detail
    ├── notification/      routes.js + service.js — list, unread-count, mark-read
    ├── recommendation/    routes.js + service.js — recs GET, view POST
    ├── analytics/         routes.js + service.js — events POST
    └── email/             service.js only (no routes) — called from order service for EmailLog writes
```

Every module follows the same two-file pattern: `routes.js` handles HTTP (validation, calling service, sending response) and `service.js` contains business logic and all Prisma queries.

## Navigation Example — Finding a Module

> **Task:** "I want to understand how personalized recommendations work."

1. Open `src/modules/recommendation/routes.js` — two routes: `GET /` (gated by `requireConsent('personalized_recommendations')`) and `POST /view`
2. Each route delegates to `src/modules/recommendation/service.js` — this is where the actual DB queries live (reads `ViewEvent` history, returns ranked products)
3. The consent gate is `src/middleware/requireConsent.js` — it calls `consentService.getStatus(userId, purposeId)` and returns 403 if the status is not `'granted'`
4. View events that feed the algorithm are written by `POST /recommendations/view` → `service.recordView()` → `prisma.viewEvent.create()`

**Pattern:** `routes.js` (HTTP layer) → `service.js` (business logic + Prisma queries). Every module follows this two-file pattern.

## Consent Engine

The consent system uses two Prisma models in concert:

- **`ConsentEvent`** — append-only audit log. Rows are **never updated or deleted**. One row is created per user action (grant, reject, withdraw, skip).
- **`ConsentState`** — derived current state. Exactly one row per `(userId, purposeId)` pair (enforced by `@@unique`). Upserted on every decision. A missing row means the purpose is `pending`.

**Single write path:** `POST /consents/decisions` → `consent/service.js recordDecisions()`

```
recordDecisions(userId, decisions, source, screen, noticeVersion)
  └─ prisma.$transaction(fn, { timeout: 20000, maxWait: 15000 })
       ├─ ConsentEvent.createMany()         ← audit rows (append-only)
       ├─ ConsentState.upsert() × N         ← derived current state
       └─ User.update lastConsentedNoticeVersion   (only for registration / re_consent sources)
```

The transaction timeout is raised to 20 s (from Prisma's 5 s default) to handle ~256 ms/RTT Neon latency from India to us-east-1.

**Seven canonical `purposeId` values:**

| purposeId | Mandatory | What it gates |
|-----------|:---------:|---------------|
| `privacy_policy` | Yes | Nothing — always accepted at registration |
| `order_processing` | Yes | Nothing — always accepted at registration |
| `personalized_recommendations` | No | `GET /recommendations`, `POST /recommendations/view` |
| `promotional_notifications` | No | Promo `Notification` creation at order checkout |
| `marketing_emails` | No | Marketing `EmailLog` with `sent: true` at order checkout |
| `device_analytics` | No | `POST /analytics/events` |
| `location_offers` | No | `GET /products/offers`; `locationLat`/`locationLng` written to `Order` |

**Notice versioning:** `npm run bump-notice` publishes a new `Notice` row (version N+1). On next `GET /auth/me`, `reconsentRequired: true` is returned when `user.lastConsentedNoticeVersion < activeNotice.version`. The client's `Protected` route guard then redirects to `/consent`.

## Order Side Effects

When a checkout completes (`POST /orders`), the order service reads consent from the DB (never trusts client-supplied flags) and performs:

| Side effect | Condition |
|-------------|-----------|
| `Notification` (type: `order`) | Always |
| `Notification` (type: `promo`) | Only if `promotional_notifications` is `granted` |
| `EmailLog` (type: `order_confirmation`, `sent: true`) | Always |
| `EmailLog` (type: `marketing`, `sent: true/false`) | Always written; `sent` = `marketing_emails` granted |
| `Order.locationLat` / `locationLng` populated | Only if `location_offers` is `granted` |

## Prisma Schema (`prisma/schema.prisma`)

Prisma is the ORM layer — it generates a type-safe Node client (`@prisma/client`), manages database migrations (`prisma migrate dev`), and provides `prisma.modelName.findMany / create / upsert / …` APIs consumed by service files.

### Enums (7)

| Enum | Values |
|------|--------|
| `ConsentAction` | `granted \| rejected \| skipped \| withdrawn` |
| `ConsentSource` | `registration \| jit \| consent_page \| re_consent` |
| `Category` | `men \| women \| kids \| footwear \| accessories \| beauty` |
| `OrderStatus` | `placed \| packed \| shipped \| delivered` |
| `NotificationType` | `order \| promo` |
| `EmailType` | `order_confirmation \| marketing` |
| `AnalyticsEventType` | `session_start \| page_view` |

### Models (15)

| Domain | Models |
|--------|--------|
| Identity | `User`, `Address` |
| Consent | `ConsentPurpose`, `Notice`, `ConsentEvent`, `ConsentState` |
| Catalog / Commerce | `Product`, `WishlistItem`, `CartItem` |
| Orders | `Order`, `OrderItem` |
| Activity / Logs | `Notification`, `EmailLog`, `AnalyticsEvent`, `ViewEvent` |

### Key schema patterns

- `@id @default(cuid())` — all primary keys are CUID strings (no auto-increment integers)
- `@@unique([userId, purposeId])` — composite unique on `ConsentState` (one row per user + purpose)
- `@@index([userId])` — explicit index on every `userId` FK column (Postgres does not auto-index FK columns)
- `@relation(fields: [userId], references: [id])` — 15 real DB foreign keys in total
- `ConsentEvent` has **no `updatedAt`** — it is append-only and must never be mutated
- `Order.locationLat?` / `Order.locationLng?` are nullable — populated only when `location_offers` is granted
- `ViewEvent.category` stores a **snapshot string** (not a FK to the `Category` enum) — intentional, keeps the row self-contained for DPDP graph parsing

For the full ER diagram, FK map, soft-reference map, and PII map see `docs/07-database-design.md`.

## Testing

```sh
cd server && npm test
```

- **Framework:** Jest + Supertest, `--runInBand` (tests run sequentially; they share a single Neon test DB)
- **Test database:** `reddington_test` — completely separate from the dev DB. Requires `TEST_DATABASE_URL` in `.env`.
- **`tests/globalSetup.js`** — overrides `DATABASE_URL` → `TEST_DATABASE_URL`; runs `prisma migrate deploy` to ensure schema is current
- **`tests/helpers.js`:**
  - `assertTestDb()` — throws if current Postgres database is not `reddington_test` (safety guard against accidental dev DB truncation)
  - `truncateAll()` — clears all 15 tables between tests
  - `seedBase()` — inserts 7 purposes + notice v1 + 1 test product
  - `registerAndConsent(agent, grants)` — registers a user and records the specified consent decisions
- **Test suites:** `auth.test.js` (5 tests), `consent.test.js` (7 tests)

## Third-Party Vendor Stubs (`src/lib/vendors.js`)

All vendor calls are **stubs** — no real HTTP requests are made. Each function logs what it would transmit (prefixed `[VENDOR:...]`) and returns a plausible success object. They exist so the DPDP compliance graph agent can statically trace personal data flowing out of the system to third parties.

| Stub | Simulates | Called from | Data sent |
|------|-----------|-------------|-----------|
| `paymentGateway.charge()` | Razorpay / Stripe | `order/service.js` after checkout | `orderId, amount, name, email, phone, card, locationLat, locationLng` |
| `logisticsPartner.schedulePickup()` | Delhivery / Shiprocket | `order/service.js` after checkout | `orderId, name, phone, addrLine1, city, pincode, locationLat, locationLng` |
| `crmService.enroll()` | Segment / Klaviyo | `auth/service.js` on register | `name, email, phone` |
| `analyticsForwarder.track()` | Mixpanel / Amplitude | `analytics/service.js` on every event | `userId, eventType, page, userAgent, platform, language, screenW, screenH` |

### Intentional DPDP violations in vendor call sites

These violations exist in code but do not affect visible app behavior. They are planted for DPDP compliance graph detection testing:

| # | Violation type | Location | Detail |
|---|---------------|----------|--------|
| A | Purpose mismatch | `order/service.js` → `paymentGateway.charge` | `user.email` shared with payment processor — no consent purpose covers this |
| B | Location without consent | `order/service.js` → `paymentGateway.charge` | Raw `locationLat/Lng` forwarded regardless of `location_offers` consent |
| C | Location without consent | `order/service.js` → `logisticsPartner.schedulePickup` | Same as B, second third party |
| D | Pre-consent transfer | `auth/service.js` → `crmService.enroll` | Fires before `POST /consents/decisions` is ever called; no CRM purpose in catalog |
| E | Undisclosed third party | `analytics/service.js` → `analyticsForwarder.track` | `device_analytics` consent exists but purpose text doesn't disclose forwarding to a vendor |

Client-side violations (F–J) are in `client/src/pages/` — see `client/README.md`.

## Known Issues

- **Neon latency ~256 ms/RTT** (India → us-east-1): all timing budgets account for this. Moving the DB to `ap-south-1` (Mumbai) would reduce round-trips to ~10–30 ms.
- **`prisma.$transaction` timeout is 20 s** — do not lower it. The default 5 s caused intermittent test failures with Neon.
- **`node --watch`** occasionally needs a manual restart after schema changes. Always run `npm run migrate` before restarting the dev server.
