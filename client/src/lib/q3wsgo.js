import { ri541g } from './vnw5tu';

export async function nt5smw(ii0gwp, t6orw5) {
  try {
    await ri541g.post('/analytics/events', {
      eventType: ii0gwp,
      page: t6orw5 || null,
      userAgent: navigator.userAgent,
      platform: navigator.platform || '',
      language: navigator.language,
      screenW: window.screen?.width || 0,
      screenH: window.screen?.height || 0,
    });
  } catch {
  }
}
