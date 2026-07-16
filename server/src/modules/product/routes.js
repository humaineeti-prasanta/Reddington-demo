import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireConsent } from '../../middleware/requireConsent.js';
import * as productService from './service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, search, sort, page, limit } = req.query;
    res.json(await productService.list({ category, search, sort, page, limit }));
  } catch (e) {
    next(e);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    res.json(await productService.categories());
  } catch (e) {
    next(e);
  }
});

// Gated: processing GPS coordinates requires location_offers consent.
router.get('/offers', requireAuth, requireConsent('location_offers'), async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    res.json(productService.locationOffers(lat, lng));
  } catch (e) {
    next(e);
  }
});

// Must come after /categories and /offers.
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'not_found' });
    res.json(product);
  } catch (e) {
    next(e);
  }
});

export default router;
