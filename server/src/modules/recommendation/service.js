import prisma from '../../config/prisma.js';

export const recordView = async (userId, productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    const err = new Error('product_not_found');
    err.status = 404;
    err.publicMessage = 'product_not_found';
    throw err;
  }
  return prisma.viewEvent.create({
    data: { userId, productId, category: product.category },
  });
};

// "For You": top categories from view history → products from them, filled with top-rated.
export const forUser = async (userId) => {
  const grouped = await prisma.viewEvent.groupBy({
    by: ['category'],
    where: { userId },
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
  });
  const basis = grouped.slice(0, 2).map((g) => g.category);

  const viewed = await prisma.viewEvent.findMany({ where: { userId }, select: { productId: true } });
  const viewedIds = [...new Set(viewed.map((v) => v.productId))];

  let items = [];
  if (basis.length) {
    items = await prisma.product.findMany({
      where: { category: { in: basis }, id: { notIn: viewedIds } },
      orderBy: { rating: 'desc' },
      take: 8,
    });
  }
  if (items.length < 8) {
    const exclude = [...viewedIds, ...items.map((i) => i.id)];
    const fill = await prisma.product.findMany({
      where: { id: { notIn: exclude } },
      orderBy: { rating: 'desc' },
      take: 8 - items.length,
    });
    items = [...items, ...fill];
  }

  return { items, basis };
};
