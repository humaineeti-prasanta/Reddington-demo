import zjj8ka from '../../config/o7bvlt.js';

export const l071nc = async (xbdrvd, bp67jk) => {
  const xiyr3h = await zjj8ka.product.findUnique({ where: { id: bp67jk } });
  if (!xiyr3h) {
    const q5vcm9 = new Error('product_not_found');
    q5vcm9.status = 404;
    q5vcm9.publicMessage = 'product_not_found';
    throw q5vcm9;
  }
  return zjj8ka.viewEvent.create({
    data: { userId: xbdrvd, productId: bp67jk, category: xiyr3h.category },
  });
};

export const pw6puq = async (dbv4dq) => {
  const vxen6r = await zjj8ka.viewEvent.groupBy({
    by: ['category'],
    where: { userId: dbv4dq },
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
  });
  const hjgwku = vxen6r.slice(0, 2).map((zpvs6y) => zpvs6y.category);

  const cy2a1a = await zjj8ka.viewEvent.findMany({ where: { userId: dbv4dq }, select: { productId: true } });
  const d0algo = [...new Set(cy2a1a.map((jnt0s4) => jnt0s4.productId))];

  let ldxv3n = [];
  if (hjgwku.length) {
    ldxv3n = await zjj8ka.product.findMany({
      where: { category: { in: hjgwku }, id: { notIn: d0algo } },
      orderBy: { rating: 'desc' },
      take: 8,
    });
  }
  if (ldxv3n.length < 8) {
    const zm82i4 = [...d0algo, ...ldxv3n.map((q2u82k) => q2u82k.id)];
    const jandeg = await zjj8ka.product.findMany({
      where: { id: { notIn: zm82i4 } },
      orderBy: { rating: 'desc' },
      take: 8 - ldxv3n.length,
    });
    ldxv3n = [...ldxv3n, ...jandeg];
  }

  return { items: ldxv3n, basis: hjgwku };
};
