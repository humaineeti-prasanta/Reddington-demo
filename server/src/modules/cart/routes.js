import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as cartService from './service.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await cartService.getCart(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.post('/items', async (req, res, next) => {
  try {
    const { productId, qty, size } = req.body;
    res.status(201).json(await cartService.addItem(req.user.id, { productId, qty, size }));
  } catch (e) {
    next(e);
  }
});

router.put('/items/:productId', async (req, res, next) => {
  try {
    const { qty, size } = req.body;
    res.json(await cartService.updateItem(req.user.id, req.params.productId, { qty, size }));
  } catch (e) {
    next(e);
  }
});

router.delete('/items/:productId', async (req, res, next) => {
  try {
    const size = req.body?.size ?? req.query?.size;
    res.json(await cartService.removeItem(req.user.id, req.params.productId, size));
  } catch (e) {
    next(e);
  }
});

export default router;
