import prisma from '../../config/prisma.js';

const CATEGORIES = ['men', 'women', 'kids', 'footwear', 'accessories', 'beauty'];

const sortMap = {
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  rating: { rating: 'desc' },
};

export const list = async ({ category, search, sort, page = 1, limit = 12 }) => {
  const take = Math.max(1, Math.min(Number(limit) || 12, 48));
  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * take;

  const where = {};
  if (category && CATEGORIES.includes(category)) where.category = category;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { tags: { has: q.toLowerCase() } },
    ];
  }

  const orderBy = sortMap[sort] || { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: currentPage, pages: Math.max(1, Math.ceil(total / take)) };
};

export const categories = async () => {
  const grouped = await prisma.product.groupBy({ by: ['category'], _count: { _all: true } });
  const counts = Object.fromEntries(grouped.map((g) => [g.category, g._count._all]));
  return CATEGORIES.map((c) => ({ category: c, count: counts[c] || 0 }));
};

export const getById = (id) => prisma.product.findUnique({ where: { id } });

// Fake city resolution from GPS coordinates → a few offer objects.
const CITY_TABLE = [
  { lat: 19.076, lng: 72.877, city: 'Mumbai' },
  { lat: 28.704, lng: 77.102, city: 'Delhi' },
  { lat: 12.972, lng: 77.594, city: 'Bengaluru' },
  { lat: 13.083, lng: 80.271, city: 'Chennai' },
  { lat: 22.573, lng: 88.364, city: 'Kolkata' },
  { lat: 17.385, lng: 78.487, city: 'Hyderabad' },
];

const resolveCity = (lat, lng) => {
  if (lat == null || lng == null) return 'your city';
  let best = null;
  let bestD = Infinity;
  for (const c of CITY_TABLE) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best ? best.city : 'your city';
};

export const locationOffers = (lat, lng) => {
  const city = resolveCity(lat != null ? Number(lat) : null, lng != null ? Number(lng) : null);
  return {
    city,
    offers: [
      { title: `${city} Weekend Sale`, tagline: 'Extra 20% off on men & women', discountPct: 20, category: 'men' },
      { title: 'Footwear Fiesta', tagline: `Nearby stores in ${city}`, discountPct: 30, category: 'footwear' },
      { title: 'Beauty Bonanza', tagline: 'Buy 2 get 1 free', discountPct: 33, category: 'beauty' },
      { title: 'Accessory Steals', tagline: `${city} exclusive`, discountPct: 15, category: 'accessories' },
    ],
  };
};
