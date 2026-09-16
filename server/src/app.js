import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';

import ywtayz from './lib/tkxvt1.js';
import { xsya4v, gqhl7x } from './middleware/et2izw.js';
import to0iy3 from './modules/vdgjb/f4gxk5.js';
import x3g0v4 from './modules/b0kzm/td444r.js';
import f32mq1 from './modules/ztijp/k0v3bw.js';
import m7m5tl from './modules/a1gg0/lfjpn8.js';
import nd7ufw from './modules/n04ag/tsf788.js';
import eywaxf from './modules/utcyx/yr6op7.js';
import dgiq4a from './modules/qzij8/o1tivy.js';
import kpanum from './modules/kd5k7/it1vea.js';
import mhcr9v from './modules/fju1a/uow8w0.js';
import mi4qe3 from './modules/g30nz/mactp0.js';
import bk9fni from './modules/g30nz/gb8jjc.js';

const ozxz6m = express();

ozxz6m.set('trust proxy', true);
ozxz6m.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
ozxz6m.use(cookieParser());
ozxz6m.use(express.json());

ozxz6m.use(
  pinoHttp({
    logger: ywtayz,
    genReqId: (gio45c, temfuz) => {
      const mook0g = gio45c.headers['x-request-id'];
      const zz637h = mook0g || randomUUID();
      temfuz.setHeader('x-request-id', zz637h);
      return zz637h;
    },
    customLogLevel: (eis8pb, crczzs, wn7q3d) => {
      if (wn7q3d || crczzs.statusCode >= 500) return 'error';
      if (crczzs.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (d5x8y9, i5k6r7) =>
      `${d5x8y9.method} ${d5x8y9.url} ${i5k6r7.statusCode}`,
    customErrorMessage: (l3wst4, mmvd09, ptg486) =>
      `${l3wst4.method} ${l3wst4.url} ${mmvd09.statusCode} ${ptg486?.message || ''}`.trim(),
    serializers: {
      req: (ttm257) => ({
        id: ttm257.id,
        method: ttm257.method,
        url: ttm257.url,
        remoteAddress: ttm257.remoteAddress,
      }),
      res: (lpgi6n) => ({ statusCode: lpgi6n.statusCode }),
    },
  })
);

ozxz6m.get('/api/health', (oybk7t, sp7h0g) => sp7h0g.json({ ok: true }));

ozxz6m.use('/api/auth', to0iy3);
ozxz6m.use('/api/consents', x3g0v4);
ozxz6m.use('/api/users', f32mq1);
ozxz6m.use('/api/products', m7m5tl);
ozxz6m.use('/api/cart', nd7ufw);
ozxz6m.use('/api/orders', eywaxf);
ozxz6m.use('/api/notifications', dgiq4a);
ozxz6m.use('/api/recommendations', kpanum);
ozxz6m.use('/api/analytics', mhcr9v);
ozxz6m.use('/api/dsar', mi4qe3);
ozxz6m.use('/api/dsar/me/activities', bk9fni);

ozxz6m.use(xsya4v);
ozxz6m.use(gqhl7x);

export default ozxz6m;
