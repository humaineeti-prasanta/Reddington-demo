import prisma from '../../config/prisma.js';

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  err.publicMessage = message;
  return err;
};

export const getActiveNotice = () =>
  prisma.notice.findFirst({ where: { active: true } });

export const getPurposes = () =>
  prisma.consentPurpose.findMany({ orderBy: { displayOrder: 'asc' } });

// ConsentState lookup via the [userId, purposeId] unique key; no row → 'pending'.
export const getStatus = async (userId, purposeId) => {
  const row = await prisma.consentState.findUnique({
    where: { userId_purposeId: { userId, purposeId } },
  });
  return row ? row.status : 'pending';
};

export const getUserConsents = (userId) =>
  prisma.consentState.findMany({ where: { userId } });

export const getHistory = (userId) =>
  prisma.consentEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

export const isReconsentRequired = async (userId) => {
  const [user, notice] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    getActiveNotice(),
  ]);
  if (!user || !notice) return false;
  return user.lastConsentedNoticeVersion !== notice.version;
};

// The single write path for consent (design doc §6 derived-state rule).
export const recordDecisions = async (userId, { decisions, source, screen }, reqMeta = {}) => {
  if (!Array.isArray(decisions) || decisions.length === 0) {
    throw badRequest('decisions_required');
  }

  const purposes = await getPurposes();
  const byId = new Map(purposes.map((p) => [p.purposeId, p]));

  for (const d of decisions) {
    const purpose = byId.get(d.purposeId);
    if (!purpose) throw badRequest(`unknown_purpose:${d.purposeId}`);
    if (
      purpose.mandatory &&
      ['rejected', 'withdrawn', 'skipped'].includes(d.action)
    ) {
      throw badRequest(`mandatory_purpose_cannot_be_declined:${d.purposeId}`);
    }
  }

  const notice = await getActiveNotice();
  const noticeVersion = notice?.version ?? 1;
  const isFullSet = source === 'registration' || source === 're_consent';

  return prisma.$transaction(
    async (tx) => {
      await tx.consentEvent.createMany({
        data: decisions.map((d) => ({
          userId,
          purposeId: d.purposeId,
          action: d.action,
          noticeVersion,
          source,
          screen,
          ip: reqMeta.ip ?? null,
          userAgent: reqMeta.userAgent ?? null,
        })),
      });

      for (const d of decisions) {
        await tx.consentState.upsert({
          where: { userId_purposeId: { userId, purposeId: d.purposeId } },
          update: { status: d.action },
          create: { userId, purposeId: d.purposeId, status: d.action },
        });
      }

      if (isFullSet) {
        await tx.user.update({
          where: { id: userId },
          data: { lastConsentedNoticeVersion: noticeVersion },
        });
      }

      return { count: decisions.length, noticeVersion };
    },
    // Full-set onboarding/re-consent writes many rows sequentially; the default
    // 5s interactive-transaction window is tight over Neon's network latency.
    { timeout: 20000, maxWait: 15000 }
  );
};
