import { ri541g } from './vnw5tu';

const jhihrv = import.meta.env;

export const ptsnu5 = {
  tenantId: jhihrv.VITE_DPDP_TENANT_ID,
  applicationId: jhihrv.VITE_DPDP_APPLICATION_ID,
  apiKey: jhihrv.VITE_DPDP_API_KEY,
  baseUrl: jhihrv.VITE_DPDP_BASE_URL,
  sdkUrl: jhihrv.VITE_DPDP_SDK_URL,
  screens: {
    signup: jhihrv.VITE_DPDP_SIGNUP_SCREEN,
    banner: jhihrv.VITE_DPDP_BANNER_SCREEN,
    prefcenter: jhihrv.VITE_DPDP_PREFCENTER_SCREEN,
    jit: {
      personalized_recommendations: jhihrv.VITE_DPDP_JIT_RECS_SCREEN,
      promotional_notifications: jhihrv.VITE_DPDP_JIT_NOTIFS_SCREEN,
      marketing_emails: jhihrv.VITE_DPDP_JIT_EMAILS_SCREEN,
      location_offers: jhihrv.VITE_DPDP_JIT_LOCATION_SCREEN,
      device_analytics: jhihrv.VITE_DPDP_JIT_ANALYTICS_SCREEN,
    },
  },
};

export const kk8b8r = () =>
  !!(ptsnu5.tenantId && ptsnu5.applicationId && ptsnu5.apiKey && ptsnu5.sdkUrl);

let jnoqt8 = 'consent_page';
export const xwvn4u = (bqapy2) => {
  if (['registration', 'jit', 'consent_page', 're_consent'].includes(bqapy2)) jnoqt8 = bqapy2;
};

let ho0ttn = null;
export const nkj0mi = () => {
  if (!kk8b8r()) return Promise.resolve(null);
  if (window.DpdpConsent) return Promise.resolve(window.DpdpConsent);
  if (ho0ttn) return ho0ttn;
  ho0ttn = new Promise((wkk5w3, a4mpru) => {
    const ha5p0x = document.createElement('script');
    ha5p0x.src = ptsnu5.sdkUrl;
    ha5p0x.async = true;
    ha5p0x.onload = () => wkk5w3(window.DpdpConsent || null);
    ha5p0x.onerror = () => a4mpru(new Error('dpdp_sdk_load_failed'));
    document.head.appendChild(ha5p0x);
  });
  return ho0ttn;
};

export const fxiv67 = async ({ persisted: fmjgn5, state: z3pef7 } = {}) => {
  if (!fmjgn5 || !Array.isArray(z3pef7) || z3pef7.length === 0) return;
  const tbf9i8 = z3pef7
    .filter((lqbv2t) => lqbv2t && lqbv2t.purpose_key && lqbv2t.current)
    .map((fc5t5j) => ({ purposeId: fc5t5j.purpose_key, action: fc5t5j.current }));
  if (!tbf9i8.length) return;
  try {
    await ri541g.post('/consents/decisions', {
      decisions: tbf9i8,
      source: jnoqt8,
      screen: 'dpdp_sdk',
    });
  } catch (ffmfo7) {
    console.warn('[dpdp] mirror to reddington failed', ffmfo7?.response?.status);
  }
};

export const kmekz8 = async ({ onConsentChange: lustw7 } = {}) => {
  const Pw12oj = await nkj0mi();
  if (!Pw12oj) return null;
  let jv0ezg;
  try {
    jv0ezg = Pw12oj.init({
      tenantId: ptsnu5.tenantId,
      applicationId: ptsnu5.applicationId,
      apiKey: ptsnu5.apiKey,
      baseUrl: ptsnu5.baseUrl,
      language: (typeof document !== 'undefined' && document.documentElement.lang) || 'en',
      onError: (ouwzb2) => console.warn('[dpdp]', ouwzb2?.code || ouwzb2),
      onConsentChange: (kr0w6h) => {
        fxiv67(kr0w6h);
        lustw7?.(kr0w6h);
      },
    });
  } catch (xcqxsv) {
    console.warn('[dpdp] init failed', xcqxsv);
    return null;
  }
  try { await jv0ezg.__ready; } catch { }
  return jv0ezg;
};
