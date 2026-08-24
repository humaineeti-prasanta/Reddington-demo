import prisma from '../../config/prisma.js';
import * as consentService from '../consent/service.js';
import logger from '../../lib/logger.js';

const log = logger.child({ module: 'dsar-processor' });

const CORRECTABLE_USER_FIELDS = ['name', 'phone'];

const VENDOR_DISCLOSURE = [
  { vendor: 'paymentGateway', purpose: 'order_processing', fields: ['name', 'email', 'phone', 'orderAmount', 'locationLat', 'locationLng'] },
  { vendor: 'logisticsPartner', purpose: 'order_processing', fields: ['name', 'phone', 'address', 'locationLat', 'locationLng'] },
  { vendor: 'crmService', purpose: 'privacy_policy', fields: ['name', 'email', 'phone'] },
  { vendor: 'analyticsForwarder', purpose: 'device_analytics', fields: ['userId', 'eventType', 'page', 'device_info'] },
];

const buildAccessBundle = async (userId) => {
  const [
    user,
    addresses,
    consentStates,
    consentEvents,
    wishlist,
    cart,
    orders,
    notifications,
    emailLogs,
    analyticsEvents,
    viewEvents,
    purposes,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, updatedAt: true, lastConsentedNoticeVersion: true },
    }),
    prisma.address.findMany({ where: { userId } }),
    prisma.consentState.findMany({ where: { userId } }),
    prisma.consentEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.wishlistItem.findMany({ where: { userId }, include: { product: { select: { id: true, title: true, brand: true } } } }),
    prisma.cartItem.findMany({ where: { userId }, include: { product: { select: { id: true, title: true, brand: true } } } }),
    prisma.order.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: 'desc' } }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.emailLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.analyticsEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.viewEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { product: { select: { id: true, title: true } } } }),
    prisma.consentPurpose.findMany({ orderBy: { displayOrder: 'asc' } }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    identity: user,
    addresses,
    consents: {
      purposes,
      currentState: consentStates,
      history: consentEvents,
    },
    activity: {
      wishlist,
      cart,
      viewEvents,
      analyticsEvents,
    },
    orders,
    communications: {
      notifications,
      emailLogs,
    },
    thirdPartySharing: VENDOR_DISCLOSURE,
  };
};

const runAccess = async (request) => {
  const bundle = await buildAccessBundle(request.userId);
  return { resultData: bundle };
};

const runPortability = async (request) => {
  const bundle = await buildAccessBundle(request.userId);
  return {
    resultData: {
      schemaVersion: 1,
      format: 'application/json',
      exportedAt: bundle.generatedAt,
      subject: bundle.identity,
      data: bundle,
    },
  };
};

const runCorrection = async (request) => {
  const payload = request.requestData || {};
  const patch = {};
  for (const field of CORRECTABLE_USER_FIELDS) {
    if (typeof payload[field] === 'string' && payload[field].trim()) {
      patch[field] = payload[field].trim();
    }
  }

  const addressChanges = Array.isArray(payload.addresses) ? payload.addresses : null;

  if (Object.keys(patch).length === 0 && !addressChanges) {
    return { status: 'rejected', rejectionNote: 'no_correctable_fields_supplied' };
  }

  await prisma.$transaction(
    async (tx) => {
      if (Object.keys(patch).length) {
        await tx.user.update({ where: { id: request.userId }, data: patch });
      }
      if (addressChanges) {
        await tx.address.deleteMany({ where: { userId: request.userId } });
        if (addressChanges.length) {
          await tx.address.createMany({
            data: addressChanges.map((a) => ({
              userId: request.userId,
              label: a.label || 'Home',
              line1: a.line1 || '',
              line2: a.line2 || null,
              city: a.city || '',
              state: a.state || '',
              pincode: a.pincode || '',
            })),
          });
        }
      }
    },
    { timeout: 20000, maxWait: 15000 }
  );

  return { resultData: { applied: patch, addressesReplaced: !!addressChanges } };
};

const runErasure = async (request) => {
  const userId = request.userId;

  const purposes = await prisma.consentPurpose.findMany();
  const optional = purposes.filter((p) => !p.mandatory);
  if (optional.length) {
    await consentService.recordDecisions(
      userId,
      {
        decisions: optional.map((p) => ({ purposeId: p.purposeId, action: 'withdrawn' })),
        source: 'consent_page',
        screen: 'dsar_erasure',
      },
      { ip: request.ip, userAgent: request.userAgent }
    );
  }

  const anonEmail = `deleted-${userId}@reddington.local`;

  await prisma.$transaction(
    async (tx) => {
      await tx.viewEvent.deleteMany({ where: { userId } });
      await tx.analyticsEvent.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.emailLog.deleteMany({ where: { userId } });
      await tx.cartItem.deleteMany({ where: { userId } });
      await tx.wishlistItem.deleteMany({ where: { userId } });
      await tx.address.deleteMany({ where: { userId } });

      await tx.order.updateMany({
        where: { userId },
        data: {
          shippingName: 'REDACTED',
          shippingPhone: 'REDACTED',
          addrLine1: 'REDACTED',
          addrLine2: null,
          city: 'REDACTED',
          state: 'REDACTED',
          pincode: 'REDACTED',
          locationLat: null,
          locationLng: null,
        },
      });

      // Anonymise the identity row. Keep the row so ConsentEvent FKs remain valid.
      await tx.user.update({
        where: { id: userId },
        data: {
          name: 'Deleted User',
          email: anonEmail,
          phone: 'REDACTED',
          passwordHash: 'REDACTED',
          deletedAt: new Date(),
        },
      });
    },
    { timeout: 20000, maxWait: 15000 }
  );

  return { resultData: { anonymisedAt: new Date().toISOString(), retained: ['orders', 'consentEvents'] } };
};

const HANDLERS = {
  access: runAccess,
  portability: runPortability,
  correction: runCorrection,
  erasure: runErasure,
};

export const processOne = async (requestId) => {
  const request = await prisma.dsarRequest.findUnique({ where: { id: requestId } });
  if (!request) return { ok: false, reason: 'not_found' };
  if (request.status === 'completed' || request.status === 'rejected') {
    return { ok: true, reason: 'already_terminal' };
  }
  if (!request.userId) {
    await prisma.dsarRequest.update({
      where: { id: requestId },
      data: { status: 'rejected', rejectionNote: 'no_matching_user', processedAt: new Date() },
    });
    return { ok: true, reason: 'no_user' };
  }

  await prisma.dsarRequest.update({
    where: { id: requestId },
    data: { status: 'in_progress' },
  });

  const handler = HANDLERS[request.type];
  if (!handler) {
    await prisma.dsarRequest.update({
      where: { id: requestId },
      data: { status: 'failed', rejectionNote: `unknown_type:${request.type}`, processedAt: new Date() },
    });
    return { ok: false, reason: 'unknown_type' };
  }

  try {
    const outcome = await handler(request);
    await prisma.dsarRequest.update({
      where: { id: requestId },
      data: {
        status: outcome.status || 'completed',
        rejectionNote: outcome.rejectionNote || null,
        resultData: outcome.resultData ?? null,
        processedAt: new Date(),
      },
    });
    return { ok: true };
  } catch (err) {
    log.error({ err, requestId }, 'processOne failed');
    await prisma.dsarRequest.update({
      where: { id: requestId },
      data: {
        status: 'failed',
        rejectionNote: (err && err.message) ? err.message.slice(0, 500) : 'processing_error',
        processedAt: new Date(),
      },
    });
    return { ok: false, reason: 'exception' };
  }
};

export const processPending = async ({ limit = 10 } = {}) => {
  const pending = await prisma.dsarRequest.findMany({
    where: { status: 'pending' },
    orderBy: { submittedAt: 'asc' },
    take: limit,
    select: { id: true },
  });

  const results = [];
  for (const row of pending) {
    results.push({ id: row.id, ...(await processOne(row.id)) });
  }
  return { processed: results.length, results };
};
