import prisma from '../../config/prisma.js';

export const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: 'asc' },
  });
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  return { items, subtotal, count };
};

export const addItem = async (userId, { productId, qty = 1, size = '' }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    const err = new Error('product_not_found');
    err.status = 404;
    err.publicMessage = 'product_not_found';
    throw err;
  }
  const q = Math.max(1, Number(qty) || 1);
  await prisma.cartItem.upsert({
    where: { userId_productId_size: { userId, productId, size: size || '' } },
    update: { qty: { increment: q } },
    create: { userId, productId, size: size || '', qty: q },
  });
  return getCart(userId);
};

export const updateItem = async (userId, productId, { qty, size = '' }) => {
  const q = Math.max(1, Number(qty) || 1);
  await prisma.cartItem.updateMany({
    where: { userId, productId, size: size || '' },
    data: { qty: q },
  });
  return getCart(userId);
};

export const removeItem = async (userId, productId, size) => {
  const where = { userId, productId };
  if (size !== undefined) where.size = size || '';
  await prisma.cartItem.deleteMany({ where });
  return getCart(userId);
};

export const clearCart = (userId, tx = prisma) => tx.cartItem.deleteMany({ where: { userId } });
