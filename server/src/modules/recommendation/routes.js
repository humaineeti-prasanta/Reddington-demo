import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireConsent } from '../../middleware/requireConsent.js';
import * as recommendationService from './service.js';

const router = Router();
router.use(requireAuth, requireConsent('personalized_recommendations'));

router.get('/', async (req, res, next) => {
  try {
    res.json(await recommendationService.forUser(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.post('/view', async (req, res, next) => {
  try {
    await recommendationService.recordView(req.user.id, req.body.productId);
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
