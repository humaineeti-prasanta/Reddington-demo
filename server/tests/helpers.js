import prisma from '../src/config/prisma.js';

const TABLES = [
  'ViewEvent', 'AnalyticsEvent', 'EmailLog', 'Notification', 'OrderItem', 'Order',
  'CartItem', 'WishlistItem', 'ConsentEvent', 'ConsentState', 'Address', 'User',
  'Product', 'Notice', 'ConsentPurpose',
];

const PURPOSES = [
  { purposeId: 'privacy_policy', name: 'Privacy Policy & Terms', description: 'account', mandatory: true, dataCategories: ['account_email'], displayOrder: 1 },
  { purposeId: 'order_processing', name: 'Order Processing & Delivery', description: 'name/phone/address', mandatory: true, dataCategories: ['name', 'phone', 'address'], displayOrder: 2 },
  { purposeId: 'personalized_recommendations', name: 'Personalized Recommendations', description: 'browsing', mandatory: false, dataCategories: ['browsing_history'], displayOrder: 3 },
  { purposeId: 'promotional_notifications', name: 'Promotional Notifications', description: 'in-app activity', mandatory: false, dataCategories: ['in_app_activity'], displayOrder: 4 },
  { purposeId: 'marketing_emails', name: 'Marketing Emails', description: 'email', mandatory: false, dataCategories: ['email_address'], displayOrder: 5 },
  { purposeId: 'device_analytics', name: 'Device Analytics', description: 'device', mandatory: false, dataCategories: ['device_info'], displayOrder: 6 },
  { purposeId: 'location_offers', name: 'Location Based Offers', description: 'gps', mandatory: false, dataCategories: ['gps_location'], displayOrder: 7 },
];

// Safety net: never truncate anything but the dedicated test database.
export async function assertTestDb() {
  const rows = await prisma.$queryRawUnsafe('SELECT current_database() as db');
  const db = rows?.[0]?.db;
  if (db !== 'reddington_test') {
    throw new Error(`Refusing to run tests against "${db}" — expected reddington_test`);
  }
}

export async function truncateAll() {
  await assertTestDb();
  await prisma.$executeRawUnsafe(
    `TRUNCATE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`
  );
}

export async function seedBase() {
  for (const p of PURPOSES) await prisma.consentPurpose.create({ data: p });
  await prisma.notice.create({
    data: { version: 1, title: 'Reddington Privacy Notice', content: 'v1 notice content', active: true },
  });
  await prisma.product.create({
    data: {
      title: 'Test Tee', brand: 'TestBrand', description: 'A test product', category: 'men',
      price: 999, mrp: 1999, images: ['https://picsum.photos/seed/test/600/800'], sizes: ['M'], rating: 4.2, tags: ['tee'],
    },
  });
}

let counter = 0;
export async function registerAndConsent(agent, grants = [], overrides = {}) {
  const email = overrides.email || `user_${Date.now()}_${counter++}@test.com`;
  await agent
    .post('/api/auth/register')
    .send({ name: 'Test User', email, phone: '9990001111', password: 'pass1234' })
    .expect(201);
  const purposes = await prisma.consentPurpose.findMany();
  const decisions = purposes.map((p) => ({
    purposeId: p.purposeId,
    action: p.mandatory ? 'granted' : grants.includes(p.purposeId) ? 'granted' : 'skipped',
  }));
  await agent
    .post('/api/consents/decisions')
    .send({ source: 'registration', screen: 'onboarding', decisions })
    .expect(201);
  return { email };
}

export { prisma };
