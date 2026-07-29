import prisma from '../../config/prisma.js';

const VALID_TYPES = ['access', 'correction', 'erasure', 'portability'];

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  err.publicMessage = message;
  return err;
};

const notFound = (message) => {
  const err = new Error(message);
  err.status = 404;
  err.publicMessage = message;
  return err;
};

// Public submission. Always creates a request when the email matches a live user.
// Returns a generic 202-shaped payload regardless of match so callers cannot enumerate emails.
export const submitPublic = async ({ email, type, requestData, reason }, reqMeta = {}) => {
  if (!email || typeof email !== 'string') throw badRequest('email_required');
  if (!VALID_TYPES.includes(type)) throw badRequest('invalid_type');
  if (type === 'correction' && (!requestData || typeof requestData !== 'object')) {
    throw badRequest('correction_requires_requestData');
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || user.deletedAt) {
    return { accepted: true, requestId: null };
  }

  const created = await prisma.dsarRequest.create({
    data: {
      userId: user.id,
      email: user.email,
      type,
      requestData: requestData ?? null,
      reason: reason || null,
      ip: reqMeta.ip ?? null,
      userAgent: reqMeta.userAgent ?? null,
    },
  });

  return { accepted: true, requestId: created.id };
};

export const submitAuthed = async (userId, { type, requestData, reason }, reqMeta = {}) => {
  if (!VALID_TYPES.includes(type)) throw badRequest('invalid_type');
  if (type === 'correction' && (!requestData || typeof requestData !== 'object')) {
    throw badRequest('correction_requires_requestData');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw notFound('user_not_found');

  return prisma.dsarRequest.create({
    data: {
      userId: user.id,
      email: user.email,
      type,
      requestData: requestData ?? null,
      reason: reason || null,
      ip: reqMeta.ip ?? null,
      userAgent: reqMeta.userAgent ?? null,
    },
  });
};

export const listForUser = (userId) =>
  prisma.dsarRequest.findMany({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
    select: {
      id: true,
      type: true,
      status: true,
      reason: true,
      rejectionNote: true,
      submittedAt: true,
      processedAt: true,
    },
  });

export const getForUser = async (userId, requestId) => {
  const row = await prisma.dsarRequest.findUnique({ where: { id: requestId } });
  if (!row || row.userId !== userId) throw notFound('dsar_not_found');
  return row;
};

// For the download endpoint — access/portability results only.
export const getResultForUser = async (userId, requestId) => {
  const row = await getForUser(userId, requestId);
  if (!['access', 'portability'].includes(row.type)) {
    throw badRequest('not_downloadable');
  }
  if (row.status !== 'completed') throw badRequest('not_ready');
  return row;
};
