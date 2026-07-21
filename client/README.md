# client — reddington-v1 frontend

React 19 + Vite 8 frontend for the reddington-v1 DPDP consent-mechanics demo. **JSX only — no TypeScript.**

## Stack & Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react + react-dom | ^19.2.7 | UI framework |
| vite | ^8.1.1 | Build tool (rolldown-based) |
| tailwindcss + @tailwindcss/vite | ^4.3.2 | Utility CSS — v4 config-free API |
| @tanstack/react-query | ^5.101.2 | Server state / data fetching + caching |
| react-router-dom | ^7.18.1 | Client-side routing |
| axios | ^1.18.1 | HTTP client (`withCredentials` for JWT cookies) |
| sonner | ^2.0.7 | Toast notifications |
| lucide-react | ^1.24.0 | Icon set |
| @fontsource-variable/inter | ^5.2.8 | Inter variable font (self-hosted) |
| radix-ui | ^1.6.2 | Headless component primitives (used by shadcn) |
| class-variance-authority | ^0.7.1 | Variant-based component styling (shadcn) |

## Setup

```sh
cd client
npm install
npm run dev        # dev server at http://localhost:5173 — proxies /api → :5000
npm run build      # production build → dist/
npm run preview    # serve dist/ at :5173 — use this for E2E tests, not dev
npm run lint       # oxlint
```

The server must be running on port 5000 (see `server/README.md`).

## File Structure

```
client/src/
├── main.jsx                    Entry point — mounts App into #root
├── App.jsx                     QueryClientProvider + AuthProvider + BrowserRouter + route table
├── index.css                   Tailwind v4 @import + Reddington theme tokens (CSS custom properties)
├── App.css                     Minimal global resets
│
├── context/
│   └── AuthContext.jsx         user, consents map, reconsentRequired state
│                               login / logout / register / refreshConsents / hasConsent()
│
├── hooks/
│   └── commerce.js             useCart, useCartMutations, useWishlist, useToggleWishlist
│
├── lib/
│   ├── api.js                  axios instance (baseURL '/api', withCredentials)
│   │                           isConsentError(err) — detects 403 consent_required responses
│   ├── analytics.js            track(eventType, page) — posts to POST /api/analytics/events
│   ├── constants.js            CATEGORIES array
│   └── utils.js                cn() helper (clsx + tailwind-merge)
│
├── components/
│   ├── Layout.jsx              Sticky header: logo, search, categories bar,
│   │                           bell (unread badge), cart (count badge), avatar dropdown
│   │                           Analytics tracking: session_start + page_view via useRef guard
│   ├── ConsentPrompt.jsx       Reusable JIT consent card — fetches purpose meta,
│   │                           posts /consents/decisions, calls onGranted() prop
│   ├── ProductCard.jsx         Product tile with image, price, wishlist heart button
│   ├── AnalyticsBanner.jsx     Pending device_analytics nudge shown on Home page
│   └── ui/                     14 shadcn/ui components (new-york style)
│       ├── avatar.jsx
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── checkbox.jsx
│       ├── dialog.jsx
│       ├── dropdown-menu.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── separator.jsx
│       ├── sheet.jsx
│       ├── skeleton.jsx
│       ├── sonner.jsx          theme hardcoded to "light" — next-themes removed
│       └── switch.jsx
│
└── pages/                      15 page components (see Routes table below)
```

## Routes

| Route | Page File | Guard | Description |
|-------|-----------|-------|-------------|
| `/` | Landing.jsx | public | Marketing landing — links to register/login |
| `/register` | Register.jsx | public | Registration form; on success → `/consent` |
| `/login` | Login.jsx | public | Login form |
| `/consent` | ConsentOnboarding.jsx | AuthedOnly | 7-purpose consent form (post-register and re-consent) |
| `/home` | Home.jsx | Protected | Hero strip, OffersStrip, ForYou recs, AnalyticsBanner |
| `/products` | Products.jsx | Protected | Catalog with category / search / sort filters |
| `/products/:id` | ProductDetail.jsx | Protected | Product detail page; records ViewEvent for recs |
| `/wishlist` | Wishlist.jsx | Protected | Saved products |
| `/cart` | Cart.jsx | Protected | Shopping cart |
| `/checkout` | Checkout.jsx | Protected | Address + fake payment |
| `/order-success/:id` | OrderSuccess.jsx | Protected | Post-order confirmation with delivery timeline |
| `/orders` | Orders.jsx | Protected | Order history list |
| `/profile` | Profile.jsx | Protected | Edit name / phone / email |
| `/notifications` | Notifications.jsx | Protected | In-app notification list with mark-read |
| `/consent-management` | ConsentManagement.jsx | Protected | Toggle 7 purposes + full audit history timeline |

**Guards:**
- `Protected` — user must be logged in **and** `reconsentRequired` must be `false`; otherwise redirects to `/login` or `/consent`
- `AuthedOnly` — user logged in only (used for `/consent` itself so re-consent flow isn't blocked)
- `public` — no auth required

## Theme Tokens (Reddington Brand)

Defined in `src/index.css` as CSS custom properties and mapped to Tailwind color utilities via `@theme inline`:

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#e8630a` | CTAs, active states, icons |
| `--secondary` | `#f7f5f0` | Hero background, secondary surfaces |
| `--foreground` | `#111111` | Primary text |
| `--muted-foreground` | `#6b6b6b` | Secondary / helper text |
| `--border` | `#e5e1da` | Warm grey borders |
| `--accent` | `#fdeee2` | Light peach — pills, highlights |
| `--accent-foreground` | `#7c3206` | Dark brown — text on accent surfaces |

## Consent Gating Pattern

Every optional feature that needs consent follows this pattern:

```jsx
// 1. Query — set retry:false so a 403 surfaces as an error immediately
const recs = useQuery({
  queryKey: ['recommendations'],
  queryFn: () => api.get('/recommendations').then(r => r.data),
  retry: false,
});
const consentBlocked = recs.isError && isConsentError(recs.error);

// 2. Show ConsentPrompt when the server returns 403 consent_required
{consentBlocked && (
  <ConsentPrompt
    purposeId="personalized_recommendations"
    screen="home"
    title="Enable personalization to see picks for you"
    description="We'll use your browsing history to recommend products you'll love."
    grantLabel="Enable personalization"
    onGranted={async () => {
      await refreshConsents();   // sync consents map in AuthContext
      recs.refetch();            // re-hit the route — now returns 200
    }}
  />
)}
```

`isConsentError(err)` from `src/lib/api.js` returns `true` when the server responds with `403 { error: 'consent_required' }`.

## Analytics Tracking Pattern

```js
// src/lib/analytics.js
track('page_view', '/products');   // silently ignored if device_analytics not granted
```

The client always calls `track()` freely — the server enforces `requireConsent('device_analytics')` and returns 403, which `track()` catches and silently ignores. This keeps the client code clean; enforcement stays server-side.

Layout.jsx fires `session_start` once using a `useRef sessionFired` guard (prevents duplicate fires) when analytics first becomes enabled, then fires `page_view` on every `pathname` change.

## Commerce Hooks (`src/hooks/commerce.js`)

| Hook | Endpoint | Description |
|------|----------|-------------|
| `useCart()` | `GET /api/cart` | Cart query; enabled only when user is logged in |
| `useCartMutations()` | `POST/PUT/DELETE /api/cart/items` | Returns `{ add, update, remove }` mutation objects |
| `useWishlist()` | `GET /api/users/wishlist` | Wishlist query; enabled only when user is logged in |
| `useToggleWishlist()` | `POST/DELETE /api/users/wishlist/:id` | Single mutation that adds or removes based on current state |

All mutations invalidate their respective query cache key on success.

## Navigation Example — Finding a Feature

> **Task:** "I want to understand how the JIT consent prompt works on the Home page."

1. Open `src/pages/Home.jsx` → find the `ForYou` component. It checks `isConsentError(recs.error)` and renders `<ConsentPrompt purposeId="personalized_recommendations" ... />`
2. Open `src/components/ConsentPrompt.jsx` — it fetches purpose metadata from `GET /api/consents/purposes` (cached via React Query), then posts `POST /api/consents/decisions` with `[{ purposeId, action: 'granted', source: 'jit', screen }]` when the user clicks the grant button
3. On success it fires `onGranted()` → in Home.jsx that runs `await refreshConsents()` then `recs.refetch()` — the query now gets a 200 instead of a 403
4. `refreshConsents` lives in `src/context/AuthContext.jsx` — it GETs `/api/consents/me` and updates the in-memory `consents` map

**Pattern:** page detects 403 → `ConsentPrompt` handles the grant POST → `AuthContext.refreshConsents` syncs local state → `query.refetch` re-triggers the gated route.

## Dev Notes

- **Vite 8 crash:** Vite 8 (rolldown) can crash on Windows (exit code `0xC0000409`) under prolonged HMR. For E2E or Playwright tests always use `npm run build && npm run preview` instead of `npm run dev`.
- **Proxy config:** Both `server.proxy` and `preview.proxy` are configured in `vite.config.js` to forward `/api → http://localhost:5000`. Both must be present — `preview` does not inherit `server` proxy settings.
- **shadcn sonner:** `src/components/ui/sonner.jsx` has `theme` hardcoded to `"light"` because `next-themes` was removed (incompatible with a plain Vite setup). Do not re-add `next-themes`.
