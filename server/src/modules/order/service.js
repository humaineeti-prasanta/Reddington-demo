import prisma from '../../config/prisma.js';
import * as emailService from '../email/service.js';
import * as notificationService from '../notification/service.js';

const DAY = 24 * 60 * 60 * 1000;

// ---------- Delivery service logic ----------
export const estimateDelivery = (from = new Date()) => new Date(from.getTime() + 4 * DAY);

const STEPS = [
  { key: 'placed', label: 'Order Placed', offsetDays: 0 },
  { key: 'packed', label: 'Packed', offsetDays: 1 },
  { key: 'shipped', label: 'Shipped', offsetDays: 2 },
  { key: 'delivered', label: 'Delivered', offsetDays: 4 },
];

export const deliveryTimeline = (order) => {
  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  return STEPS.map((s) => {
    const at = new Date(new Date(order.createdAt).getTime() + s.offsetDays * DAY);
    return { key: s.key, label: s.label, at, reached: elapsed >= s.offsetDays * DAY };
  });
};

const genTxnId = () => 'TXN' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0');

// ---------- Checkout ----------
export const checkout = async (userId, payload, consentStatuses = {}) => {
  const { shipping = {}, includeLocation, locationLat, locationLng } = payload;

  const [user, cartItems] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.cartItem.findMany({ where: { userId }, include: { product: true } }),
  ]);

  if (!cartItems.length) {
    const err = new Error('cart_empty');
    err.status = 400;
    err.publicMessage = 'cart_empty';
    throw err;
  }

  const amount = cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  // Server-side location gate — never trust the client flag alone.
  const locationGranted = consentStatuses.location_offers === 'granted';
  const persistLocation = !!includeLocation && locationGranted;
  const lat = persistLocation && locationLat != null ? Number(locationLat) : null;
  const lng = persistLocation && locationLng != null ? Number(locationLng) : null;

  const marketingGranted = consentStatuses.marketing_emails === 'granted';
  const promoGranted = consentStatuses.promotional_notifications === 'granted';

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        amount,
        shippingName: shipping.name || user.name,
        shippingPhone: shipping.phone || user.phone,
        addrLine1: shipping.line1 || '',
        addrLine2: shipping.line2 || null,
        city: shipping.city || '',
        state: shipping.state || '',
        pincode: shipping.pincode || '',
        locationLat: lat,
        locationLng: lng,
        paymentMethod: 'fake_card',
        paymentStatus: 'paid',
        txnId: genTxnId(),
        expectedDelivery: estimateDelivery(),
        items: {
          create: cartItems.map((i) => ({
            productId: i.productId,
            title: i.product.title,
            price: i.product.price,
            qty: i.qty,
            size: i.size || null,
          })),
        },
      },
      include: { items: true },
    });

    // Side effects — order-side consent enforcement (design doc §5.1).
    await notificationService.orderPlaced(created, tx);
    await notificationService.maybePromo(userId, promoGranted, tx);
    await emailService.orderConfirmation(user, created, tx);
    await emailService.marketing(user, created, marketingGranted, tx);

    await tx.cartItem.deleteMany({ where: { userId } });

    return created;
  });

  return order;
};

export const listByUser = (userId) =>
  prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

export const getById = (userId, orderId) =>
  prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
