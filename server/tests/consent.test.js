import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { prisma, truncateAll, seedBase, registerAndConsent } from './helpers.js';

beforeEach(async () => {
  await truncateAll();
  await seedBase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

const registerOnly = async (agent, email = `u_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.com`) => {
  await agent.post('/api/auth/register').send({ name: 'T', email, phone: '999', password: 'pass1234' }).expect(201);
  return email;
};

describe('consent engine', () => {
  test('1) registration set writes 7 events + states + lastConsentedNoticeVersion', async () => {
    const agent = request.agent(app);
    await registerAndConsent(agent, ['marketing_emails']);

    expect(await prisma.consentEvent.count()).toBe(7);
    const states = await prisma.consentState.findMany();
    expect(states).toHaveLength(7);

    const user = await prisma.user.findFirst();
    const notice = await prisma.notice.findFirst({ where: { active: true } });
    expect(user.lastConsentedNoticeVersion).toBe(notice.version);

    const marketing = states.find((s) => s.purposeId === 'marketing_emails');
    expect(marketing.status).toBe('granted');
    const analytics = states.find((s) => s.purposeId === 'device_analytics');
    expect(analytics.status).toBe('skipped');
  });

  test('2) mandatory purpose rejected → 400 and zero rows written', async () => {
    const agent = request.agent(app);
    await registerOnly(agent);
    const before = await prisma.consentEvent.count();

    const res = await agent
      .post('/api/consents/decisions')
      .send({ source: 'consent_page', screen: 'consent_management', decisions: [{ purposeId: 'privacy_policy', action: 'rejected' }] });

    expect(res.status).toBe(400);
    expect(await prisma.consentEvent.count()).toBe(before);
    expect(await prisma.consentState.count()).toBe(0);
  });

  test('3) gated route with skipped status → 403 consent_required', async () => {
    const agent = request.agent(app);
    await registerAndConsent(agent, []); // all optionals skipped

    const res = await agent.get('/api/recommendations');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'consent_required', purposeId: 'personalized_recommendations' });
  });

  test('4) JIT grant → 200; withdraw → 403 again', async () => {
    const agent = request.agent(app);
    await registerAndConsent(agent, []);

    await agent.get('/api/recommendations').expect(403);

    await agent
      .post('/api/consents/decisions')
      .send({ source: 'jit', screen: 'home', decisions: [{ purposeId: 'personalized_recommendations', action: 'granted' }] })
      .expect(201);
    await agent.get('/api/recommendations').expect(200);

    await agent
      .post('/api/consents/decisions')
      .send({ source: 'consent_page', screen: 'consent_management', decisions: [{ purposeId: 'personalized_recommendations', action: 'withdrawn' }] })
      .expect(201);
    await agent.get('/api/recommendations').expect(403);
  });

  test('5) ConsentEvent is append-only: count grows, rows never mutated', async () => {
    const agent = request.agent(app);
    await registerAndConsent(agent, []);

    const snap1 = await prisma.consentEvent.findMany({ orderBy: { createdAt: 'asc' } });
    expect(snap1).toHaveLength(7);

    await agent
      .post('/api/consents/decisions')
      .send({ source: 'jit', screen: 'home', decisions: [{ purposeId: 'device_analytics', action: 'granted' }] })
      .expect(201);
    await agent
      .post('/api/consents/decisions')
      .send({ source: 'consent_page', screen: 'consent_management', decisions: [{ purposeId: 'device_analytics', action: 'withdrawn' }] })
      .expect(201);

    const snap2 = await prisma.consentEvent.findMany({ orderBy: { createdAt: 'asc' } });
    expect(snap2.length).toBeGreaterThan(snap1.length);

    for (const original of snap1) {
      const still = snap2.find((r) => r.id === original.id);
      expect(still).toBeDefined();
      expect(still.action).toBe(original.action);
      expect(still.purposeId).toBe(original.purposeId);
      expect(still.noticeVersion).toBe(original.noticeVersion);
      expect(new Date(still.createdAt).getTime()).toBe(new Date(original.createdAt).getTime());
    }
  });

  test('6) bump notice → reconsentRequired true; re-consent → false; events carry v2', async () => {
    const agent = request.agent(app);
    await registerAndConsent(agent, []);

    await prisma.notice.updateMany({ where: { active: true }, data: { active: false } });
    await prisma.notice.create({ data: { version: 2, title: 'v2', content: 'v2 content', active: true } });

    const me = await agent.get('/api/auth/me');
    expect(me.body.reconsentRequired).toBe(true);

    const purposes = await prisma.consentPurpose.findMany();
    const decisions = purposes.map((p) => ({ purposeId: p.purposeId, action: 'granted' }));
    await agent.post('/api/consents/decisions').send({ source: 're_consent', screen: 'onboarding', decisions }).expect(201);

    const me2 = await agent.get('/api/auth/me');
    expect(me2.body.reconsentRequired).toBe(false);

    const reconsentEvents = await prisma.consentEvent.findMany({ where: { source: 're_consent' } });
    expect(reconsentEvents).toHaveLength(7);
    expect(reconsentEvents.every((e) => e.noticeVersion === 2)).toBe(true);
  });

  test('7) order with includeLocation but no location consent → location columns NULL', async () => {
    const agent = request.agent(app);
    await registerAndConsent(agent, []); // location_offers skipped

    const product = await prisma.product.findFirst();
    await agent.post('/api/cart/items').send({ productId: product.id, qty: 1, size: 'M' }).expect(201);

    const res = await agent.post('/api/orders').send({
      shipping: { name: 'T', phone: '9', line1: 'a', city: 'c', state: 's', pincode: '1' },
      includeLocation: true,
      locationLat: 19.0,
      locationLng: 72.0,
    });

    expect(res.status).toBe(201);
    expect(res.body.locationLat).toBeNull();
    expect(res.body.locationLng).toBeNull();
  });
});
