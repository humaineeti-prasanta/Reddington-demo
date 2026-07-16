import prisma from '../../config/prisma.js';

export const record = (userId, payload) => {
  const { eventType, page, userAgent, platform, language, screenW, screenH } = payload;
  return prisma.analyticsEvent.create({
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
};
