import prisma from '../../config/prisma.js';

const sanitize = (user) => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });
  return { ...sanitize(user), addresses: user?.addresses ?? [] };
};

// Updates name/phone and replaces the address list when provided.
export const updateProfile = async (userId, { name, phone, addresses }) => {
  const data = {};
  if (typeof name === 'string' && name.trim()) data.name = name.trim();
  if (typeof phone === 'string' && phone.trim()) data.phone = phone.trim();

  await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length) await tx.user.update({ where: { id: userId }, data });
    if (Array.isArray(addresses)) {
      await tx.address.deleteMany({ where: { userId } });
      if (addresses.length) {
        await tx.address.createMany({
          data: addresses.map((a) => ({
            userId,
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
  });

  return getProfile(userId);
};

export const getWishlist = (userId) =>
  prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

export const addWishlist = (userId, productId) =>
  prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });

export const removeWishlist = async (userId, productId) => {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  return { ok: true };
};
