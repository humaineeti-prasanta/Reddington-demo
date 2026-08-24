import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';

import logger from './lib/logger.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './modules/auth/routes.js';
import consentRoutes from './modules/consent/routes.js';
import userRoutes from './modules/user/routes.js';
import productRoutes from './modules/product/routes.js';
import cartRoutes from './modules/cart/routes.js';
import orderRoutes from './modules/order/routes.js';
import notificationRoutes from './modules/notification/routes.js';
import recommendationRoutes from './modules/recommendation/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import dsarRoutes from './modules/dsar/routes.js';
import dsarActivityRoutes from './modules/dsar/activityRoutes.js';

const app = express();

app.set('trust proxy', true);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existing = req.headers['x-request-id'];
      const id = existing || randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} ${res.statusCode}`,
    customErrorMessage: (req, res, err) =>
      `${req.method} ${req.url} ${res.statusCode} ${err?.message || ''}`.trim(),
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dsar', dsarRoutes);
app.use('/api/dsar/me/activities', dsarActivityRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
