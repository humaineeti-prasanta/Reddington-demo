# @dpdp/consent-sdk — Integration Knowledge Base

Version: 1.0 · For LLM ingestion + human developers.

Feed this document to your LLM alongside the SDK source (`sdk/src/index.js`).
Everything an integrator needs to know is in this file — no other document is
required.

---

## 0. Elevator pitch

`@dpdp/consent-sdk` is a **zero-dependency JavaScript widget** that any
web application embeds to:

1. **Show a consent screen** (modal / banner / preference center /
   embedded form) authored on the DPDP admin panel.
2. **Capture the user's decision per purpose** (granted / rejected /
   withdrawn) and post it as an immutable receipt to the DPDP server.
3. **Let the host app gate processing** on those decisions
   (`hasConsent('marketing') ? enableTracking() : null`).
4. **Handle withdrawal** through the preference center.

It solves India's **Digital Personal Data Protection Act, 2023 (DPDP)**
consent requirements: affirmative action (no pre-ticked boxes), one purpose
per line (S.6(1)), withdrawal as easy as giving (S.6(4)), notice presence
(S.5), and a durable audit chain.

**Comparable to:** OneTrust CMP, Osano, Cookiebot — but keyed to a
server-verified secret API key (not a public site ID) and identity-first
(receipts require `identify()` before persistence).

---

## 1. Prerequisites (on the DPDP admin panel, before writing code)

The host developer cannot skip these — the SDK will not function without
them.

### 1.1 A published Consent Screen

1. Sign in to the DPDP admin panel.
2. **Consent manager → New purpose** — create at least one purpose per
   consent line. Every purpose has:
   - `key` (machine identifier, `[a-z0-9_]{2,40}`, unique per application).
   - `title` (user-facing).
   - `pii_types` (subset of the PII universe — see §12).
   - `retention_text` (human-readable retention window).
   - `ropa_activity` (optional link to a Records of Processing Activity).
3. **Screens → New screen** — pick a widget type (modal / banner / form /
   prefcenter), an accent color (teal / indigo / rose / amber), enable
   languages (`en` is required; `hi` and `bn` optional), and add
   purpose blocks.
4. **Publish** the screen. Only published screens are served to the SDK.

Every screen has a `code` (e.g. `SCR-001`) — the SDK identifies screens
by this code.

### 1.2 An API key

Settings → Applications → your app → **API keys → Create key**.

- Choose an `expires_at` — the key's expiry is also its retention.
- **The secret is shown exactly once**. Copy it into your host app's
  config immediately.
- Rotation policy: deploy the new key **before** rotating in the panel.
  The old key is revoked instantly at rotation, so hosts need the new
  key in production first.

### 1.3 (Optional) Webhook endpoint

Settings → Webhooks → Create endpoint. If your support tooling wants
notifications on DSAR lifecycle events (`dsar.created`,
`dsar.status_changed`, `dsar.responded`, `dsar.overdue`), configure a
receiver here and verify the `X-DPDP-Signature` HMAC-SHA256.
**This is not required for the consent SDK to work.**

---

## 2. Install

### 2.1 CDN (drop-in `<script>` tag)

```html
<script src="https://<your-dpdp-host>/sdk/v1/dpdp-sdk.min.js"></script>
<!-- Exposes global: window.DpdpConsent -->
```

### 2.2 npm (SPA / bundler)

```bash
npm install @dpdp/consent-sdk
```

```js
import { DpdpConsent } from '@dpdp/consent-sdk';
```

Requirements: zero runtime dependencies, ships as ESM + IIFE, bundle
budget ≤30 KB gzip, supports last-2 evergreen browsers + Safari 15+.

---

## 3. Initialize

Call `DpdpConsent.init(config)` **once per page** at bootstrap:

```js
const dpdp = DpdpConsent.init({
  tenantId: 'org_65f...',           // required — your Organization id
  applicationId: 'app_66a...',      // required — your Application id
  apiKey: 'dpdp_live_...',          // required — secret from Settings
  baseUrl: 'https://app.dpdp.example', // optional — production origin
  language: 'en',                   // optional — 'en' | 'hi' | 'bn'
  theme: {                          // optional — overrides published branding
    accent: '#0f766e',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
    zIndex: 2147483000,
    logoUrl: null
  },
  onReady: (ctx) => {},             // fires after screens are cached
  onError: (err) => {},             // fires ONCE per page-load on halted errors
  onConsentChange: (state) => {}    // fires after any decision / withdrawal
});
```

### 3.1 Configuration reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `tenantId` | string | ✅ | Organization id (defense-in-depth cross-check server-side). |
| `applicationId` | string | ✅ | Application id — every API call is scoped to this. |
| `apiKey` | string | ✅ | `dpdp_live_` + 40 base62 chars. Server rejects invalid. |
| `baseUrl` | string | — | Defaults to `https://app.dpdp.example`. Must be `https`; `http://localhost` and `http://127.0.0.1` accepted in dev. |
| `language` | `'en'` \| `'hi'` \| `'bn'` | — | Default `'en'`. Sets chrome text (button labels, close text). |
| `theme.accent` | CSS color | — | Overrides published screen accent. Applied as `--dpdp-accent` on the shadow host. |
| `theme.fontFamily` | CSS font stack | — | `--dpdp-font`. |
| `theme.borderRadius` | CSS length | — | `--dpdp-radius`. |
| `theme.zIndex` | number | — | `--dpdp-z`. |
| `theme.logoUrl` | URL string | — | Rendered as `--dpdp-logo`. |
| `onReady(ctx)` | fn | — | `ctx.screens` = published screens array. |
| `onError(err)` | fn | — | `{code, message}`. Fires at most once per halted error. |
| `onConsentChange(state)` | fn | — | `{persisted: bool, state: [...]}` — persisted:false when queued before `identify`. |

### 3.2 Validation

`init` throws a **synchronous** `DpdpConfigError` listing every failing
field if any of `tenantId`, `applicationId`, `apiKey`, `language`, or
`baseUrl` is invalid. Wrap the call if you can't recover:

```js
try {
  window.dpdp = DpdpConsent.init({ /* … */ });
} catch (e) {
  console.error('DPDP config invalid:', e.fields);
  // ship error to your telemetry
}
```

Network/auth failures do **not** throw from `init`. They surface later via
`onError` with one of the codes in §5.

---

## 4. Method reference

Every async method returns a `Promise`. Every rejection is a plain `Error`
with a `.code` field from the error set in §5. Handlers registered via
`on()` are isolated — one throwing handler doesn't break the SDK.

### 4.1 Identity

```js
await dpdp.identify({
  userId: 'hostapp-user-8841',   // required — your app's stable user id
  email: 'user@example.com',     // optional
  phone: '+91...',               // optional
  name: 'Meera Iyer',            // optional
  language: 'hi'                 // optional preference
});
```

Behavior:
- Calls `POST /sdk/v1/identify` — upserts a Principal keyed on
  `external_user_id`.
- Stores `principal_id` in `localStorage` under
  `dpdp:<applicationId>:principal`.
- **Flushes any queued decisions** made before identify (see §6).
- Must be called **after** your app's own auth completes.

```js
dpdp.reset();
```
- Clears identity + pending queue from `localStorage`.
- **Call on host-app logout.**

### 4.2 Rendering screens

```js
dpdp.showScreen({ screenCode: 'SCR-001' });   // by admin-panel code
dpdp.showBanner();                            // first published widget_type='banner'
dpdp.showPreferenceCenter();                  // first published widget_type='prefcenter'
dpdp.mount({ screenCode: 'SCR-004', el: '#slot' }); // inline (form widget)
dpdp.unmount();                               // remove any mounted widget
```

Rendering details:
- The widget renders into a **Shadow DOM** attached to a `<div>` appended
  to `document.body`. Style isolation is guaranteed.
- Production builds use `mode: 'closed'`; dev/test builds expose the root
  via `dpdp.__testRoot` for automation.
- **No pre-ticked boxes** — every purpose starts unchecked (DPDP
  affirmative-action rule, CTRL-001).
- Buttons: "Accept selected" (submits with current checkbox state),
  "Reject all" (submits every purpose as rejected).
- Chrome strings (button labels) are bundled for `en` / `hi` / `bn`;
  purpose content comes from the published screen payload.

### 4.3 Reading state & withdrawal

```js
const state = await dpdp.getConsent();
// [{ purpose_key: 'marketing', current: 'granted', granted_on, withdrawn_on }, ...]

const ok = await dpdp.hasConsent('marketing');   // boolean; false when unidentified / unknown

await dpdp.withdraw({ purposeKeys: ['marketing'] });
// Posts to /sdk/v1/consents/withdraw. Ledger appends 'withdrawn'
// events; consent_states flips; onConsentChange fires.
```

`hasConsent` returns `false` (never throws) when the user is not identified
or the purpose has no state — safe to use inline: `if (await dpdp.hasConsent('marketing')) …`.

### 4.4 Events (subscribe/unsubscribe)

```js
dpdp.on('ready', (ctx) => {});           // ctx = { screens }
dpdp.on('error', (err) => {});           // err = { code, message }
dpdp.on('consentChange', (state) => {}); // state = { persisted, state }
dpdp.on('screenShown', ({ screenCode }) => {});
dpdp.on('screenClosed', ({ screenCode }) => {});

dpdp.off('consentChange', myHandler);
```

`onReady` / `onError` / `onConsentChange` passed to `init(config)` register
as the first listener for that event; `on()` adds additional handlers.

### 4.5 Miscellaneous

```js
dpdp.version;      // '1.0.0'
```

---

## 5. Error codes

| Code | Meaning | SDK behavior |
|---|---|---|
| `API_KEY_INVALID` | Server rejected the key (unknown / revoked / malformed). | Halts all network calls; fires `onError` once. |
| `API_KEY_EXPIRED` | Key past `expires_at`. | Halts all network calls; fires `onError` once. |
| `API_KEY_APP_MISMATCH` | Key belongs to a different application. | Halts all network calls; fires `onError` once. |
| `APP_ARCHIVED` | Target application is archived. | Halts. |
| `NETWORK_ERROR` | Fetch failed (offline, TLS, timeout). | Does not halt; retry on next call. |
| `SCREEN_NOT_FOUND` | `showScreen({screenCode})` referenced an unpublished / unknown code. | Rejects the call. |
| `NOT_IDENTIFIED` | Persistence attempted before `identify` succeeded. | Decisions are queued (see §6), not lost. |
| `VERSION_STALE` | Screen version bumped since the SDK cached it. | SDK refetches screens; does **not** silently resubmit. Ask user again. |
| `RATE_LIMITED` | Per-key rate limit exceeded. | Rejects the call; safe to retry after ~60s. |
| `VALIDATION_ERROR` | Server rejected request shape. | Rejects the call. |

**Halt semantics:** once halted, every subsequent network call rejects
immediately with `{code:'HALTED'}`. Reload the page after fixing the
API key.

---

## 6. Queue / idempotency semantics

### 6.1 Pre-identify decisions

If the user makes a consent decision **before** `identify()` has resolved,
the decision is stored in `localStorage` under
`dpdp:<applicationId>:pending` (max 20 entries, FIFO). It fires
`onConsentChange` with `{persisted: false, state: null}`. The UI closes as
if the submit succeeded — you never keep the user waiting on the network.

When `identify()` next completes, the queue is flushed automatically.

### 6.2 Idempotency-Key

Every `POST /sdk/v1/consents` and `POST /sdk/v1/consents/withdraw` request
carries an `Idempotency-Key: <uuid v4>` header the SDK generates. If the
network drops mid-flight and the SDK retries, the server returns the
original response body from a 24-hour window (compared at read time
against an injectable server clock). This prevents duplicate ledger
events.

### 6.3 VERSION_STALE handling

When the server returns 409 `STATE_TRANSITION_INVALID` with a
`details.latest_version` payload, the SDK:
1. Clears its screen cache.
2. Refetches `/sdk/v1/screens`.
3. Emits `onError` with code `VERSION_STALE`.
4. Does **not** resubmit silently — you must re-render the widget and
   ask the user again (the published copy may have changed).

---

## 7. Storage keys used

Every key is scoped to `applicationId` so multiple applications on the
same origin do not collide.

| Key | Purpose | Cleared by |
|---|---|---|
| `dpdp:<appId>:screens` | Cached published screens (JSON `{at, data}`, 10-min TTL). | Automatically after 10 min or on `VERSION_STALE`. |
| `dpdp:<appId>:principal` | The `principal_id` returned by `identify()`. | `dpdp.reset()`. |
| `dpdp:<appId>:pending` | Queued decisions posted before `identify()`. | Auto-flushed on next `identify()`; `dpdp.reset()`. |

**No cookies. No fingerprinting. No third-party requests other than the
DPDP server.**

---

## 8. Theming

Order of precedence (last wins):
1. **Application branding** (accent / logo / font from admin panel).
2. **Screen accent** (per-screen swatch).
3. **Host `theme` override** passed to `init(config)`.

All theme values are applied as **CSS custom properties on the shadow
host**:

| Property | From |
|---|---|
| `--dpdp-accent` | `theme.accent` \| screen accent \| brand accent_hex |
| `--dpdp-font` | `theme.fontFamily` \| brand font |
| `--dpdp-radius` | `theme.borderRadius` |
| `--dpdp-z` | `theme.zIndex` |
| `--dpdp-logo` | `theme.logoUrl` |

There is **no arbitrary CSS injection API in v1**. This is intentional —
the widget must be visually consistent enough for regulators to recognize
a compliant consent capture.

---

## 9. Integration workflow (recipe, in order)

Copy the following into your host app and adapt the identifiers.

### Step 1 — Load the SDK

```html
<!-- e.g. in your app shell / SSR layout -->
<script src="https://app.dpdp.example/sdk/v1/dpdp-sdk.min.js"></script>
```

### Step 2 — Init on page load

```html
<script>
  window.dpdp = DpdpConsent.init({
    tenantId: '<ORGANIZATION_ID>',
    applicationId: '<APPLICATION_ID>',
    apiKey: '<DPDP_LIVE_KEY>',
    language: document.documentElement.lang || 'en',
    onReady: () => {
      // If you show cookies to non-logged-in visitors:
      if (!localStorage.getItem('dpdp:<APP_ID>:principal')) {
        dpdp.showBanner();
      }
    },
    onError: (e) => console.warn('dpdp', e)
  });
</script>
```

### Step 3 — Identify after your own login

```js
// After your host app's auth completes:
await dpdp.identify({
  userId: currentUser.id,
  email: currentUser.email,
  phone: currentUser.phone,
  name: currentUser.name
});
```

Any decisions the user made before login are flushed to the server at
this moment.

### Step 4 — Show screens at the right moments

| Moment | Call |
|---|---|
| Signup completion (before enrolling the user in anything) | `dpdp.showScreen({screenCode: 'SCR-SIGNUP'})` |
| First visit (cookie banner) | `dpdp.showBanner()` |
| "Privacy & preferences" link | `dpdp.showPreferenceCenter()` |
| Inline embed on a settings page | `dpdp.mount({screenCode: 'SCR-INLINE', el: '#slot'})` |

**Critical ordering rule:** show the signup consent screen *before* your
signup handler enrolls the user in marketing, analytics, third-party
CRMs, etc. Doing it after is the exact violation the DPDP graph
validation flags as **V-2026-014** in the reference admin panel.

### Step 5 — Gate your processing on consent

```js
// Guard synchronous processor calls
if (await dpdp.hasConsent('marketing')) enableMarketingPixels();

// Or react to changes
dpdp.on('consentChange', (payload) => {
  const state = payload.state || [];
  const marketingOn = state.find((s) => s.purpose_key === 'marketing')?.current === 'granted';
  if (marketingOn) enableMarketingPixels(); else disableMarketingPixels();
});
```

**The SDK does not auto-block third-party scripts in v1.** Your app is
responsible for gating trackers, CRM enrollment, and analytics on
`getConsent()` results. (This is a deliberate simplification vs OneTrust;
auto-blocking is on the phase-3 roadmap.)

### Step 6 — Handle logout

```js
await yourAppLogout();
dpdp.reset();
```

### Step 7 — Wire the preference center from your privacy link

```html
<a href="#" id="privacy-prefs">Privacy & preferences</a>
<script>
  document.getElementById('privacy-prefs').addEventListener('click', (e) => {
    e.preventDefault();
    dpdp.showPreferenceCenter();
  });
</script>
```

### Step 8 — Verify in the admin panel

1. Consent Vault → search the principal by email / name / external id.
2. You should see the exact decisions ("granted marketing", "rejected
   analytics", …) with timestamp, screen version, channel.
3. That record is your **audit evidence chain** for DPB inspections.

---

## 10. Backend contract the SDK depends on

An LLM helping debug should know exactly what the SDK calls. All five
endpoints live under `<baseUrl>/api/v1/sdk/v1/*` and require the
`X-Api-Key` header + `application_id` in body or query.

### 10.1 `GET /sdk/v1/screens?application_id=<id>`

Returns published screens for the application:

```json
{ "data": [
  {
    "id": "…", "code": "SCR-001", "name": "Signup consent",
    "widget_type": "modal", "accent": "teal",
    "languages": { "en": true, "hi": true, "bn": false },
    "version": 3,
    "purpose_blocks": [
      {
        "purpose_key": "marketing", "title": "Marketing communications",
        "activity": "PromoEnrolment", "items": ["EmailAddress", "BehavioralData"],
        "retention_text": "24 months from last interaction",
        "notice": { "title": "…", "body": "…" }
      }
    ],
    "branding": { "accent_hex": "#2e6e60", "logo_url": null, "font": null }
  }
] }
```

Errors: 401 `API_KEY_INVALID` / `API_KEY_EXPIRED`, 403 `API_KEY_APP_MISMATCH`,
403 `FORBIDDEN` (app archived).

### 10.2 `POST /sdk/v1/identify`

Body:
```json
{
  "application_id": "…",
  "user": {
    "external_user_id": "hostapp-user-8841",  // required
    "email": "user@example.com", "phone": null,
    "name": "Meera Iyer", "language": "hi"
  }
}
```
Response: `{ "data": { "principal_id": "…" } }` — upsert on
`external_user_id` per (`tenant_id`, `application_id`).

### 10.3 `POST /sdk/v1/consents`

Body:
```json
{
  "application_id": "…",
  "external_user_id": "hostapp-user-8841",
  "screen_id": "…", "screen_version": 3,
  "decisions": [
    { "purpose_key": "marketing", "decision": "granted", "items": ["EmailAddress"] },
    { "purpose_key": "analytics", "decision": "rejected", "items": [] }
  ],
  "occurred_at": "2026-08-08T10:12:03Z",
  "context": { "channel": "web", "user_agent": "…" }
}
```

Header: `Idempotency-Key: <uuid v4>` (SDK-generated).

Response: `201 { "data": { "event_ids": ["…", "…"], "state": [...] } }` —
one ledger event per decision.

Errors: 409 with `details.latest_version` on `VERSION_STALE`; 429
`RATE_LIMITED`.

### 10.4 `GET /sdk/v1/consents/status?application_id=<id>&external_user_id=<uid>`

Response:
```json
{ "data": [
  { "purpose_key": "marketing", "current": "granted", "granted_on": "…", "withdrawn_on": null }
] }
```
Errors: 404 unknown principal.

### 10.5 `POST /sdk/v1/consents/withdraw`

Body:
```json
{
  "application_id": "…",
  "external_user_id": "hostapp-user-8841",
  "purpose_keys": ["marketing"],
  "occurred_at": "2026-08-08T10:15:11Z"
}
```
Response: `{ "data": { "state": [...] } }`. Errors: 409 if nothing was granted.

Idempotency-Key supported.

### 10.6 Ledger schema (what the server persists per event)

```json
{
  "principal_id": "…", "screen_id": "…", "screen_version": 3,
  "purpose_key": "marketing", "items": ["EmailAddress", "BehavioralData"],
  "decision": "granted", "channel": "web",
  "occurred_at": "2026-08-08T10:12:03Z",
  "ip": "<server-captured>", "user_agent": "<server-captured>",
  "sdk_version": "1.0.0"
}
```

Append-only. Never updated, never deleted before retention.

---

## 11. Rate limits

- Per API key: `SDK_RATE_LIMIT_PER_MIN` (default 120) — a sliding 60-second
  window enforced in-process on the DPDP server. Exceeding returns
  429 `RATE_LIMITED`.
- Practical guidance: init once per page-load; call `identify` once per
  session; `showScreen` on user action. A well-integrated app posts <5
  requests per visit.

---

## 12. PII universe (closed set)

Purpose `items` values must come from this list — anything else is
rejected 400 `VALIDATION_ERROR`:

```
BehavioralData, DeviceIdentifier, DeviceInfo, EmailAddress,
GeoLocation, IPAddress, Name, Password,
PaymentCardInfo, PhoneNumber, PostalAddress
```

---

## 13. Security & privacy

- The API key is a **publishable client credential** scoped to consent
  operations only. It grants no admin reads. Server rate-limits per key.
  Rotate on a schedule (Settings → API keys → Rotate).
- The SDK **never reads host cookies**, **never fingerprints**, and only
  sends what `identify()` and screen interactions provide.
- All traffic HTTPS. SDK refuses to run on `http:` origins except
  `localhost` / `127.0.0.1`.
- No third-party requests. No CDN pixels. No fonts loaded from external
  hosts (the widget's chrome uses `-apple-system` fallbacks).

---

## 14. Complete host-app integration checklist

Copy this into your project ticket:

- [ ] Application created in DPDP admin panel; branding set.
- [ ] Purposes defined (one per consent line); retention text reviewed by DPO.
- [ ] Screens published for signup / cookies / preference center;
      lint passing; languages enabled.
- [ ] API key issued; stored in host config (env var, not hardcoded);
      expiry calendared with a rotation-2-weeks-early reminder.
- [ ] `DpdpConsent.init(...)` called in app bootstrap on all pages needing consent.
- [ ] `dpdp.identify(...)` wired after login; `dpdp.reset()` after logout.
- [ ] `dpdp.showBanner()` on first visit / no-principal.
- [ ] `dpdp.showScreen({...})` triggered *before* signup enrols the user in downstream services.
- [ ] `/privacy/preferences` route calls `dpdp.showPreferenceCenter()`.
- [ ] All third-party trackers/CRM/analytics enrolments gated on `hasConsent(...)`.
- [ ] Vault record verified end-to-end for a test principal in staging.
- [ ] (Optional) Webhook endpoint added; signature verification unit-tested.

---

## 15. Common patterns / snippets for an LLM to reproduce

### 15.1 React — init once at app bootstrap

```jsx
import { useEffect, useRef } from 'react';
import { DpdpConsent } from '@dpdp/consent-sdk';

export function DpdpProvider({ children, currentUser }) {
  const dpdpRef = useRef(null);
  useEffect(() => {
    dpdpRef.current = DpdpConsent.init({
      tenantId: import.meta.env.VITE_DPDP_TENANT_ID,
      applicationId: import.meta.env.VITE_DPDP_APP_ID,
      apiKey: import.meta.env.VITE_DPDP_API_KEY,
      onReady: () => {
        const hasPrincipal = !!localStorage.getItem(
          `dpdp:${import.meta.env.VITE_DPDP_APP_ID}:principal`
        );
        if (!hasPrincipal) dpdpRef.current.showBanner();
      }
    });
    return () => dpdpRef.current?.unmount?.();
  }, []);
  useEffect(() => {
    if (!currentUser) { dpdpRef.current?.reset(); return; }
    dpdpRef.current?.identify({
      userId: currentUser.id, email: currentUser.email,
      name: currentUser.name, phone: currentUser.phone
    });
  }, [currentUser?.id]);
  return children;
}
```

### 15.2 Next.js app router — client component + env vars

```jsx
'use client';
import { useEffect } from 'react';

export function DpdpBootstrap({ user }) {
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://app.dpdp.example/sdk/v1/dpdp-sdk.min.js';
    s.async = true;
    s.onload = () => {
      const dpdp = window.DpdpConsent.init({
        tenantId: process.env.NEXT_PUBLIC_DPDP_TENANT_ID,
        applicationId: process.env.NEXT_PUBLIC_DPDP_APP_ID,
        apiKey: process.env.NEXT_PUBLIC_DPDP_API_KEY,
        onReady: () => user ? dpdp.identify({ userId: user.id, email: user.email }) : dpdp.showBanner()
      });
      window.__dpdp = dpdp;
    };
    document.head.appendChild(s);
  }, [user?.id]);
  return null;
}
```

### 15.3 Vanilla — gate analytics on consentChange

```js
window.dpdp = DpdpConsent.init({ /* … */ });
dpdp.on('consentChange', ({ state }) => {
  const on = (key) => state?.find((s) => s.purpose_key === key)?.current === 'granted';
  window.gtag && window.gtag('consent', 'update', {
    ad_storage: on('marketing') ? 'granted' : 'denied',
    analytics_storage: on('analytics') ? 'granted' : 'denied'
  });
});
```

### 15.4 Server-side: verify a DPDP DSAR webhook

```js
import crypto from 'node:crypto';

export function verifyDpdpSignature(rawBody, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}

// In your Express receiver:
app.post('/dpdp-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.header('X-DPDP-Signature');
  if (!verifyDpdpSignature(req.body, sig, process.env.DPDP_WEBHOOK_SECRET)) {
    return res.status(401).send('bad signature');
  }
  const event = JSON.parse(req.body.toString());
  // event = { event: 'dsar.created', timestamp, data: { dsar: {...} } }
  // handle...
  res.status(200).send('ok');
});
```

---

## 16. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `onError` fires with `API_KEY_INVALID` on init | Wrong key / key from different application / typo | Recopy from Settings → API keys; ensure `applicationId` matches the key's app. |
| `onError` fires with `API_KEY_EXPIRED` | Past `expires_at` | Rotate the key on the admin panel, redeploy the new value. |
| `onError` fires with `API_KEY_APP_MISMATCH` | `applicationId` in config points at a different app than the key. | Fix the config. |
| `showScreen` throws "screen not found" | The screen isn't published, or was archived, or the `code` is wrong. | Check the admin panel: status must be `published`. |
| Widget appears but nothing posts on Accept | Called before `identify()`. Check `localStorage['dpdp:<appId>:pending']` — decisions queued. | Call `dpdp.identify(...)` after auth succeeds; queue flushes automatically. |
| `VERSION_STALE` after Publish | Screen was republished after the SDK cached it. | Reload the page or trigger `dpdp.showScreen` again — the SDK auto-refetches. |
| No cookie banner appears for logged-out users | You didn't call `dpdp.showBanner()` yourself. | The SDK does not auto-show anything. Call `showBanner()` in `onReady` (see §15.1). |
| Consent shows in vault but `hasConsent` returns false | Missing / stale `identify` (SDK doesn't have `principal_id` yet). | Ensure `identify()` awaited before the check. |
| CORS error from `sdk/v1/*` | Server `CORS_ORIGINS` doesn't include your app's origin. | Ask DPDP admin to add your origin to CORS_ORIGINS env var. |
| Widget style leaks into your app | Should not happen (Shadow DOM isolation). | Verify no browser extension is disabling Shadow DOM; confirm the widget's host `<div>` exists in `document.body`. |
| Widget invisible / behind other content | Your app uses a higher z-index. | Pass `theme.zIndex: 2147483000` in config. |

---

## 17. What is intentionally not in v1

- **Auto-blocking of third-party scripts/cookies** — the host app must gate.
- **Native mobile SDKs** — planned for phase-3.
- **DSAR intake through the SDK** — v1 SDK only handles consent; DSARs are
  created via the admin panel or REST API.
- **Downloadable consent receipts by principals** — planned for phase-3.
- **Server-side (backend-to-backend) consent posting** — planned for phase-3.

---

## 18. Getting help

- SDK source: `sdk/src/index.js` (~370 lines, zero dependencies — read it).
- Server contracts: `specs/api_contracts.md §14` (SDK surface) and
  `specs/data_model.md §9` (consent_events schema).
- Product context: `specs/sdk_spec.md` (the frozen SDK spec) and
  `specs/sdk_integration_and_roadmap.md`.

When asking an LLM for help with an integration, paste this file and the
`sdk/src/index.js` file. Everything the LLM needs to answer correctly is
in these two artifacts.
