import prisma from '../../config/prisma.js';

const PROMOS = [
  { title: 'Flat 40% off this weekend', body: 'Refresh your wardrobe — limited-time deals across categories.' },
  { title: 'New arrivals just dropped', body: 'Be the first to shop the latest styles handpicked for you.' },
  { title: 'Your favourites are on sale', body: 'Items you love are now at their best prices.' },
];

export const orderPlaced = (order, tx = prisma) =>
  tx.notification.create({
    data: {
      userId: order.userId,
      type: 'order',
      title: 'Order placed successfully',
      body: `Your order ${order.id} for ₹${order.amount} has been placed and is being processed.`,
    },
  });

// Promo notifications are created ONLY when promotional_notifications consent is granted.
export const maybePromo = (userId, granted, tx = prisma) => {
  if (!granted) return null;
  const promo = PROMOS[Math.floor((Date.now() / 1000) % PROMOS.length)];
  return tx.notification.create({
    data: { userId, type: 'promo', title: promo.title, body: promo.body },
  });
};

// Reading your own notifications is never consent-gated (gate is at promo creation).
export const listByUser = (userId) =>
  prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export const markRead = async (userId, id) => {
  await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
  return { ok: true };
};

export const unreadCount = async (userId) => {
  const count = await prisma.notification.count({ where: { userId, read: false } });
  return { count };
};
