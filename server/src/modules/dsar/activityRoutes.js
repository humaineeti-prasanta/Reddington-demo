import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as activityService from './activityService.js';
import { listActivities } from './activityRegistry.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  res.json({ activities: listActivities() });
});


router.get('/:activityId', requireAuth, async (req, res, next) => {
  try {
    const bundle = await activityService.accessActivity(req.user.id, req.params.activityId);
    res.json(bundle);
  } catch (e) {
    next(e);
  }
});

router.get('/:activityId/export', requireAuth, async (req, res, next) => {
  try {
    const bundle = await activityService.exportActivity(req.user.id, req.params.activityId);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reddington-dsar-${req.params.activityId}-${req.user.id}.json"`
    );
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(bundle, null, 2));
  } catch (e) {
    next(e);
  }
});


router.patch('/:activityId', requireAuth, async (req, res, next) => {
  try {
    const result = await activityService.rectifyActivity(
      req.user.id,
      req.params.activityId,
      req.body?.patch
    );
    res.json(result);
  } catch (e) {
    if (e instanceof activityService.RequiresFullAccountErasureError) {
      return res.status(409).json({
        error: 'requires_full_account_erasure',
        message: 'Rectifying this activity would leave your account unusable.',
        hint: 'POST /api/dsar/me/requests { "type": "erasure" } for full account erasure',
      });
    }
    next(e);
  }
});


router.delete('/:activityId', requireAuth, async (req, res, next) => {
  try {
    const result = await activityService.eraseActivity(req.user.id, req.params.activityId);
    res.json(result);
  } catch (e) {
    if (e instanceof activityService.RequiresFullAccountErasureError) {
      return res.status(409).json({
        error: 'requires_full_account_erasure',
        message: 'Erasing this activity would leave your account unusable.',
        hint: 'POST /api/dsar/me/requests { "type": "erasure" } for full account erasure',
      });
    }
    next(e);
  }
});

export default router;
