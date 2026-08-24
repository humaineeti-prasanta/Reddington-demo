import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as dsarService from './service.js';
import * as dsarProcessor from './processor.js';

const router = Router();

const reqMeta = (req) => ({
  ip: req.ip,
  userAgent: req.get('user-agent') || null,
});

router.post('/requests', async (req, res, next) => {
  try {
    const { email, type, requestData, reason } = req.body || {};
    const result = await dsarService.submitPublic(
      { email, type, requestData, reason },
      reqMeta(req)
    );
    res.status(202).json({
      message: 'If an account matches, a Data Subject Access Request has been recorded and will be processed.',
      requestId: result.requestId,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/me/requests', requireAuth, async (req, res, next) => {
  try {
    const { type, requestData, reason } = req.body || {};
    const created = await dsarService.submitAuthed(
      req.user.id,
      { type, requestData, reason },
      reqMeta(req)
    );
    res.status(201).json({
      id: created.id,
      type: created.type,
      status: created.status,
      submittedAt: created.submittedAt,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me/requests', requireAuth, async (req, res, next) => {
  try {
    res.json(await dsarService.listForUser(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.get('/me/requests/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await dsarService.getForUser(req.user.id, req.params.id);
    res.json({
      id: row.id,
      type: row.type,
      status: row.status,
      reason: row.reason,
      rejectionNote: row.rejectionNote,
      submittedAt: row.submittedAt,
      processedAt: row.processedAt,
      hasResult: !!row.resultData,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me/requests/:id/download', requireAuth, async (req, res, next) => {
  try {
    const row = await dsarService.getResultForUser(req.user.id, req.params.id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reddington-dsar-${row.id}.json"`
    );
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(row.resultData, null, 2));
  } catch (e) {
    next(e);
  }
});

router.post('/admin/process', async (req, res, next) => {
  try {
    const secret = req.get('x-admin-token');
    if (!process.env.DSAR_ADMIN_TOKEN || secret !== process.env.DSAR_ADMIN_TOKEN) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const result = await dsarProcessor.processPending({ limit: Number(req.query.limit) || 10 });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
