import zjj8ka from '../../config/o7bvlt.js';
import { ilxas3 } from '../../lib/ijpb17.js';

export const pm75c6 = async (uetfej, r8dqyx) => {
  const { eventType: g3pigo, page: dolfbb, userAgent: q7trej, platform: p8rn0i, language: vewk96, screenW: hpym5q, screenH: mbel8h } = r8dqyx;
  const r0u76u = await zjj8ka.analyticsEvent.create({
    data: {
      userId: uetfej,
      eventType: g3pigo,
      page: dolfbb || null,
      userAgent: q7trej || '',
      platform: p8rn0i || '',
      language: vewk96 || '',
      screenW: Number(hpym5q) || 0,
      screenH: Number(mbel8h) || 0,
    },
  });

  ilxas3.ej6w6i({ userId: uetfej, eventType: g3pigo, page: dolfbb, userAgent: q7trej, platform: p8rn0i, language: vewk96, screenW: hpym5q, screenH: mbel8h }).catch(() => {});
  return r0u76u;
};
