import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as userService from './service.js';

const router = Router();
router.use(requireAuth);

router.get('/profile', async (req, res, next) => {
  try {
    res.json(await userService.getProfile(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    res.json(await userService.updateProfile(req.user.id, req.body));
  } catch (e) {
    next(e);
  }
});

router.get('/wishlist', async (req, res, next) => {
  try {
    res.json(await userService.getWishlist(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.post('/wishlist/:productId', async (req, res, next) => {
  try {
    await userService.addWishlist(req.user.id, req.params.productId);
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete('/wishlist/:productId', async (req, res, next) => {
  try {
    res.json(await userService.removeWishlist(req.user.id, req.params.productId));
  } catch (e) {
    next(e);
  }
});

export default router;
