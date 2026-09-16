import { Router } from 'express';
import { xjkde2 } from '../../middleware/efc67v.js';
import { p51czl } from '../../middleware/un78z3.js';
import * as tvniin from './yu5pb7.js';

const tnfaa9 = Router();

tnfaa9.post(
  '/events',
  xjkde2,
  p51czl('device_analytics'),
  async (fohg2s, rjdxl6, vv3hwd) => {
    try {
      await tvniin.pm75c6(fohg2s.user.id, fohg2s.body);
      rjdxl6.status(201).json({ ok: true });
    } catch (o5fm3w) {
      vv3hwd(o5fm3w);
    }
  }
);

export default tnfaa9;
