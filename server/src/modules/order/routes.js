import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as orderService from './service.js';
import * as consentService from '../consent/service.js';

const router = Router();
router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Read the consent statuses the checkout side effects depend on.
    const [location_offers, marketing_emails, promotional_notifications] = await Promise.all([
      consentService.getStatus(userId, 'location_offers'),
      consentService.getStatus(userId, 'marketing_emails'),
      consentService.getStatus(userId, 'promotional_notifications'),
    ]);
    const order = await orderService.checkout(userId, req.body, {
      location_offers,
      marketing_emails,
      promotional_notifications,
    });
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const orders = await orderService.listByUser(req.user.id);
    res.json(orders.map((o) => ({ ...o, timeline: orderService.deliveryTimeline(o) })));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getById(req.user.id, req.params.id);
    if (!order) return res.status(404).json({ error: 'not_found' });
    res.json({ ...order, timeline: orderService.deliveryTimeline(order) });
  } catch (e) {
    next(e);
  }
});

export default router;
