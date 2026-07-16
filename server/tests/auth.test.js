import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { prisma, truncateAll, seedBase } from './helpers.js';

beforeAll(async () => {
  await truncateAll();
  await seedBase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('auth', () => {
  const user = { name: 'Ada', email: 'ada@test.com', phone: '999', password: 'pass1234' };

  test('register returns 201 and sets cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.passwordHash).toBeUndefined();
    const cookie = res.headers['set-cookie']?.join(';') || '';
    expect(cookie).toMatch(/token=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  test('duplicate email returns 409', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('email_taken');
  });

  test('login with wrong password returns 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'WRONG' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');
  });

  test('login with correct password returns user + reconsentRequired', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body).toHaveProperty('reconsentRequired');
  });

  test('/auth/me returns 200 with cookie, 401 without', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: user.email, password: user.password }).expect(200);
    const withCookie = await agent.get('/api/auth/me');
    expect(withCookie.status).toBe(200);
    expect(withCookie.body.user.email).toBe(user.email);

    const withoutCookie = await request(app).get('/api/auth/me');
    expect(withoutCookie.status).toBe(401);
    expect(withoutCookie.body.error).toBe('unauthorized');
  });
});
