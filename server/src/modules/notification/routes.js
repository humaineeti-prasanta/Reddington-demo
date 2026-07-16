import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as notificationService from './service.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await notificationService.listByUser(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    res.json(await notificationService.unreadCount(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    res.json(await notificationService.markRead(req.user.id, req.params.id));
  } catch (e) {
    next(e);
  }
});

export default router;
