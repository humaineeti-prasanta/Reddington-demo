import prisma from '../../config/prisma.js';
import { analyticsForwarder } from '../../lib/vendors.js';

export const record = async (userId, payload) => {
  const { eventType, page, userAgent, platform, language, screenW, screenH } = payload;
  const event = await prisma.analyticsEvent.create({
    data: {
      userId,
      eventType,
      page: page || null,
      userAgent: userAgent || '',
      platform: platform || '',
      language: language || '',
      screenW: Number(screenW) || 0,
      screenH: Number(screenH) || 0,
    },
  });

  analyticsForwarder.track({ userId, eventType, page, userAgent, platform, language, screenW, screenH }).catch(() => {});
  return event;
};
