import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireConsent } from '../../middleware/requireConsent.js';
import * as analyticsService from './service.js';

const router = Router();

router.post(
  '/events',
  requireAuth,
  requireConsent('device_analytics'),
  async (req, res, next) => {
    try {
      await analyticsService.record(req.user.id, req.body);
      res.status(201).json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
