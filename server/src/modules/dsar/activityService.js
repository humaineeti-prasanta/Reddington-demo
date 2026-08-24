import prisma from '../../config/prisma.js';
import * as userService from '../user/service.js';
import * as vendors from '../../lib/vendors.js';
import { getActivity } from './activityRegistry.js';

export class ActivityNotFoundError extends Error {
  constructor(activityId) {
    super(`unknown_activity:${activityId}`);
    this.status = 404;
    this.publicMessage = 'unknown_activity';
  }
}

export class RectificationNotSupportedError extends Error {
  constructor(activityId) {
    super(`rectification_not_supported:${activityId}`);
    this.status = 405;
    this.publicMessage = 'rectification_not_supported';
  }
}

export class RequiresFullAccountErasureError extends Error {
  constructor(activityId) {
    super(`requires_full_account_erasure:${activityId}`);
    this.status = 409;
    this.publicMessage = 'requires_full_account_erasure';
  }
}

export class RectifyPayloadError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
    this.publicMessage = message;
  }
}

const submitVendorReceipts = (activity, userId, right) =>
  Promise.all(
    (activity.vendors || []).map((name) => {
      const client = vendors[name];
      if (!client || typeof client.dsarRequest !== 'function') return null;
      return client.dsarRequest(userId, right);
    })
  ).then((r) => r.filter(Boolean));

const readProfileStores = async (userId) => {
  const [user, addresses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, updatedAt: true },
    }),
    prisma.address.findMany({ where: { userId } }),
  ]);
  return { User: user, Address: addresses };
};

const readNotificationStores = async (userId) => {
  const emailLogs = await prisma.emailLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, type: true, email: true, subject: true, sent: true, skippedReason: true, createdAt: true },
  });
  return { EmailLog: emailLogs };
};

const READERS = {
  'profile-management': readProfileStores,
  'notification-transactional': readNotificationStores,
};

export const accessActivity = async (userId, activityId) => {
  const activity = getActivity(activityId);
  if (!activity) throw new ActivityNotFoundError(activityId);
  if (!activity.rights.access) throw new RectificationNotSupportedError(activityId);

  const reader = READERS[activityId];
  const stores = reader ? await reader(userId) : {};
  const receipts = await submitVendorReceipts(activity, userId, 'access');

  return {
    activityId,
    generatedAt: new Date().toISOString(),
    stores,
    vendorDisclosures: activity.vendorDisclosures || [],
    vendorDsarReceipts: receipts,
    unrecoverable: activity.unrecoverable || [],
  };
};


export const exportActivity = async (userId, activityId) => {
  const bundle = await accessActivity(userId, activityId);
  return {
    schemaVersion: 1,
    format: 'application/json',
    exportedAt: bundle.generatedAt,
    activityId,
    data: bundle,
  };
};

export const rectifyActivity = async (userId, activityId, patch) => {
  const activity = getActivity(activityId);
  if (!activity) throw new ActivityNotFoundError(activityId);
  if (!activity.rights.rectify) throw new RectificationNotSupportedError(activityId);

  if (!patch || typeof patch !== 'object') {
    throw new RectifyPayloadError('patch_required');
  }

  const allowed = new Set(activity.rectifyFields || []);
  const applied = {};
  for (const [key, value] of Object.entries(patch)) {
    if (!allowed.has(key)) continue;
    applied[key] = value;
  }
  if (Object.keys(applied).length === 0) {
    throw new RectifyPayloadError('no_correctable_fields_supplied');
  }

  if (activityId === 'profile-management') {
    const updated = await userService.updateProfile(userId, applied);
    const receipts = await submitVendorReceipts(activity, userId, 'rectification');
    return {
      activityId,
      rectifiedAt: new Date().toISOString(),
      applied: Object.keys(applied),
      profile: updated,
      vendorDsarReceipts: receipts,
    };
  }

  throw new RectificationNotSupportedError(activityId);
};

const ERASERS = {
  'notification-transactional': async (userId) => {
    const { count } = await prisma.emailLog.deleteMany({ where: { userId } });
    return { EmailLog: count };
  },
};

export const eraseActivity = async (userId, activityId) => {
  const activity = getActivity(activityId);
  if (!activity) throw new ActivityNotFoundError(activityId);

  if (activity.mandatory && !activity.rights.erase) {
    throw new RequiresFullAccountErasureError(activityId);
  }

  const eraser = ERASERS[activityId];
  const storesErased = eraser ? await eraser(userId) : {};
  const receipts = await submitVendorReceipts(activity, userId, 'erasure');

  return {
    activityId,
    erasedAt: new Date().toISOString(),
    storesErased,
    vendorTakedownReceipts: receipts,
    unrecoverable: activity.unrecoverable || [],
  };
};
