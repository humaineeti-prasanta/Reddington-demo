import { api } from './api';

// Builds the flat device payload and posts it. Silently ignores 403 (the server
// is the real enforcement point); callers should also short-circuit when not consented.
export async function track(eventType, page) {
  try {
    await api.post('/analytics/events', {
      eventType,
      page: page || null,
      userAgent: navigator.userAgent,
      platform: navigator.platform || '',
      language: navigator.language,
      screenW: window.screen?.width || 0,
      screenH: window.screen?.height || 0,
    });
  } catch {
    /* not consented / offline — ignore */
  }
}
