import { api } from './api';

const env = import.meta.env;

export const dpdpConfig = {
  tenantId: env.VITE_DPDP_TENANT_ID,
  applicationId: env.VITE_DPDP_APPLICATION_ID,
  apiKey: env.VITE_DPDP_API_KEY,
  baseUrl: env.VITE_DPDP_BASE_URL,
  sdkUrl: env.VITE_DPDP_SDK_URL,
  screens: {
    signup: env.VITE_DPDP_SIGNUP_SCREEN,
    banner: env.VITE_DPDP_BANNER_SCREEN,
    prefcenter: env.VITE_DPDP_PREFCENTER_SCREEN,
    jit: {
      personalized_recommendations: env.VITE_DPDP_JIT_RECS_SCREEN,
      promotional_notifications: env.VITE_DPDP_JIT_NOTIFS_SCREEN,
      marketing_emails: env.VITE_DPDP_JIT_EMAILS_SCREEN,
      location_offers: env.VITE_DPDP_JIT_LOCATION_SCREEN,
      device_analytics: env.VITE_DPDP_JIT_ANALYTICS_SCREEN,
    },
  },
};

export const isDpdpConfigured = () =>
  !!(dpdpConfig.tenantId && dpdpConfig.applicationId && dpdpConfig.apiKey && dpdpConfig.sdkUrl);

// Source hint used by the mirror handler. Callers set this immediately before
// invoking a widget so the mirrored ConsentEvent lands with the right `source`.
let sourceHint = 'consent_page';
export const setSourceHint = (s) => {
  if (['registration', 'jit', 'consent_page', 're_consent'].includes(s)) sourceHint = s;
};

let sdkPromise = null;
export const loadSdk = () => {
  if (!isDpdpConfigured()) return Promise.resolve(null);
  if (window.DpdpConsent) return Promise.resolve(window.DpdpConsent);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = dpdpConfig.sdkUrl;
    s.async = true;
    s.onload = () => resolve(window.DpdpConsent || null);
    s.onerror = () => reject(new Error('dpdp_sdk_load_failed'));
    document.head.appendChild(s);
  });
  return sdkPromise;
};

// Mirror an SDK-reported state to reddington's ledger. The SDK is the UI/audit
// source of truth on the DPDP side; reddington keeps its own append-only
// ConsentEvent + derived ConsentState so requireConsent middleware still works.
export const mirrorToReddington = async ({ persisted, state } = {}) => {
  if (!persisted || !Array.isArray(state) || state.length === 0) return;
  const decisions = state
    .filter((s) => s && s.purpose_key && s.current)
    .map((s) => ({ purposeId: s.purpose_key, action: s.current }));
  if (!decisions.length) return;
  try {
    await api.post('/consents/decisions', {
      decisions,
      source: sourceHint,
      screen: 'dpdp_sdk',
    });
  } catch (err) {
    console.warn('[dpdp] mirror to reddington failed', err?.response?.status);
  }
};

export const initDpdp = async ({ onConsentChange } = {}) => {
  const Sdk = await loadSdk();
  if (!Sdk) return null;
  let instance;
  try {
    instance = Sdk.init({
      tenantId: dpdpConfig.tenantId,
      applicationId: dpdpConfig.applicationId,
      apiKey: dpdpConfig.apiKey,
      baseUrl: dpdpConfig.baseUrl,
      language: (typeof document !== 'undefined' && document.documentElement.lang) || 'en',
      onError: (e) => console.warn('[dpdp]', e?.code || e),
      onConsentChange: (payload) => {
        mirrorToReddington(payload);
        onConsentChange?.(payload);
      },
    });
  } catch (e) {
    // Sync DpdpConfigError from the SDK lands here.
    console.warn('[dpdp] init failed', e);
    return null;
  }
  // Screens are fetched inside __ready. Wait for it so callers that trigger
  // showScreen({screenCode}) immediately (e.g. reconsent) don't race and throw
  // "screen not found".
  try { await instance.__ready; } catch { /* screens will be empty; SDK stays halted or degraded */ }
  return instance;
};
