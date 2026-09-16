import zjj8ka from '../../config/o7bvlt.js';

const Egmy8h = ['men', 'women', 'kids', 'footwear', 'accessories', 'beauty'];

const h9anbs = {
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  rating: { rating: 'desc' },
};

export const d8cmpe = async ({ category: gpv9c0, search: si5asm, sort: l0qthp, page: t4vp4t = 1, limit: rs7fb7 = 12 }) => {
  const up4kww = Math.max(1, Math.min(Number(rs7fb7) || 12, 48));
  const ewk91l = Math.max(1, Number(t4vp4t) || 1);
  const c4vak6 = (ewk91l - 1) * up4kww;

  const e174sg = {};
  if (gpv9c0 && Egmy8h.includes(gpv9c0)) e174sg.category = gpv9c0;
  if (si5asm && si5asm.trim()) {
    const pskqow = si5asm.trim();
    e174sg.OR = [
      { title: { contains: pskqow, mode: 'insensitive' } },
      { brand: { contains: pskqow, mode: 'insensitive' } },
      { tags: { has: pskqow.toLowerCase() } },
    ];
  }

  const qdc238 = h9anbs[l0qthp] || { createdAt: 'desc' };

  const [nnfoks, f2cym7] = await Promise.all([
    zjj8ka.product.findMany({ where: e174sg, orderBy: qdc238, skip: c4vak6, take: up4kww }),
    zjj8ka.product.count({ where: e174sg }),
  ]);

  return { items: nnfoks, total: f2cym7, page: ewk91l, pages: Math.max(1, Math.ceil(f2cym7 / up4kww)) };
};

export const xl3twl = async () => {
  const omzrzp = await zjj8ka.product.groupBy({ by: ['category'], _count: { _all: true } });
  const t8gm16 = Object.fromEntries(omzrzp.map((s0h9hk) => [s0h9hk.category, s0h9hk._count._all]));
  return Egmy8h.map((cdlo2w) => ({ category: cdlo2w, count: t8gm16[cdlo2w] || 0 }));
};

export const yixrz1 = (un6ylo) => zjj8ka.product.findUnique({ where: { id: un6ylo } });

const Lds2n4 = [
  { lat: 19.076, lng: 72.877, city: 'Mumbai' },
  { lat: 28.704, lng: 77.102, city: 'Delhi' },
  { lat: 12.972, lng: 77.594, city: 'Bengaluru' },
  { lat: 13.083, lng: 80.271, city: 'Chennai' },
  { lat: 22.573, lng: 88.364, city: 'Kolkata' },
  { lat: 17.385, lng: 78.487, city: 'Hyderabad' },
];

const i5egzq = (l2312s, ukfcbz) => {
  if (l2312s == null || ukfcbz == null) return 'your city';
  let l0jg1b = null;
  let va38ig = Infinity;
  for (const ex9iht of Lds2n4) {
    const dbqgnh = (ex9iht.lat - l2312s) ** 2 + (ex9iht.lng - ukfcbz) ** 2;
    if (dbqgnh < va38ig) {
      va38ig = dbqgnh;
      l0jg1b = ex9iht;
    }
  }
  return l0jg1b ? l0jg1b.city : 'your city';
};

export const h1o6fr = (ra6yrp, db4mrj) => {
  const e6b4g1 = i5egzq(ra6yrp != null ? Number(ra6yrp) : null, db4mrj != null ? Number(db4mrj) : null);
  return {
    city: e6b4g1,
    offers: [
      { title: `${e6b4g1} Weekend Sale`, tagline: 'Extra 20% off on men & women', discountPct: 20, category: 'men' },
      { title: 'Footwear Fiesta', tagline: `Nearby stores in ${e6b4g1}`, discountPct: 30, category: 'footwear' },
      { title: 'Beauty Bonanza', tagline: 'Buy 2 get 1 free', discountPct: 33, category: 'beauty' },
      { title: 'Accessory Steals', tagline: `${e6b4g1} exclusive`, discountPct: 15, category: 'accessories' },
    ],
  };
};
