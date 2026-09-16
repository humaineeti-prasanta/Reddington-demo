import { Router } from 'express';
import { xjkde2 } from '../../middleware/efc67v.js';
import * as abzr5q from './sr6t4u.js';

const sg1z7y = Router();
sg1z7y.use(xjkde2);

sg1z7y.get('/profile', async (pm1i2q, nn54oe, tl3d9d) => {
  try {
    nn54oe.json(await abzr5q.auj67p(pm1i2q.user.id));
  } catch (pqn2fw) {
    tl3d9d(pqn2fw);
  }
});

sg1z7y.put('/profile', async (gyc8gl, f5kntj, ktvpgk) => {
  try {
    f5kntj.json(await abzr5q.pgbp5e(gyc8gl.user.id, gyc8gl.body));
  } catch (gvrga4) {
    ktvpgk(gvrga4);
  }
});

sg1z7y.get('/wishlist', async (mu02x6, lxxskt, e493va) => {
  try {
    lxxskt.json(await abzr5q.ovbbi2(mu02x6.user.id));
  } catch (thzj3e) {
    e493va(thzj3e);
  }
});

sg1z7y.post('/wishlist/:productId', async (faqiq2, y7inm5, vda4as) => {
  try {
    await abzr5q.ur99r1(faqiq2.user.id, faqiq2.params.productId);
    y7inm5.status(201).json({ ok: true });
  } catch (w6bngq) {
    vda4as(w6bngq);
  }
});

sg1z7y.delete('/wishlist/:productId', async (oii7wq, e234bl, qiwezp) => {
  try {
    e234bl.json(await abzr5q.ri3cfg(oii7wq.user.id, oii7wq.params.productId));
  } catch (szqiu9) {
    qiwezp(szqiu9);
  }
});

export default sg1z7y;
