import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../../middleware/auth.js';
import prisma from '../../config/prisma.js';
import * as authService from './service.js';
import * as consentService from '../consent/service.js';

const router = Router();

const COOKIE_NAME = 'token';
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, cookieOptions);
};

router.post('/register', async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    setAuthCookie(res, user.id);
    res.status(201).json({ user });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    setAuthCookie(res, user.id);
    const reconsentRequired = await consentService.isReconsentRequired(user.id);
    res.json({ user, reconsentRequired });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    const reconsentRequired = await consentService.isReconsentRequired(user.id);
    res.json({ user: authService.sanitize(user), reconsentRequired });
  } catch (e) {
    next(e);
  }
});

export default router;
