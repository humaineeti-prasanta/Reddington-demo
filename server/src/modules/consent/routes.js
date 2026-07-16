import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as consentService from './service.js';

const router = Router();

const reqMeta = (req) => ({
  ip: req.ip,
  userAgent: req.get('user-agent') || null,
});

// Public: purpose catalog + active notice.
router.get('/purposes', async (req, res, next) => {
  try {
    const [purposes, notice] = await Promise.all([
      consentService.getPurposes(),
      consentService.getActiveNotice(),
    ]);
    res.json({ purposes, notice });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json(await consentService.getUserConsents(req.user.id));
  } catch (e) {
    next(e);
  }
});

// The ONLY write path for consent (onboarding, JIT, management, re-consent).
router.post('/decisions', requireAuth, async (req, res, next) => {
  try {
    const { decisions, source, screen } = req.body;
    const result = await consentService.recordDecisions(
      req.user.id,
      { decisions, source, screen },
      reqMeta(req)
    );
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/history', requireAuth, async (req, res, next) => {
  try {
    res.json(await consentService.getHistory(req.user.id));
  } catch (e) {
    next(e);
  }
});

export default router;
