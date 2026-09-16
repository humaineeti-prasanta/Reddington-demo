import { Router } from 'express';
import { xjkde2 } from '../../middleware/efc67v.js';
import * as eizzdh from './l8mbwl.js';

const njof6m = Router();

const r1qecg = (p5wmst) => ({
  ip: p5wmst.ip,
  userAgent: p5wmst.get('user-agent') || null,
});

njof6m.get('/purposes', async (g6uv1v, f3u8dy, tvap5b) => {
  try {
    const [if68km, la07et] = await Promise.all([
      eizzdh.adlc7t(),
      eizzdh.g4aecb(),
    ]);
    f3u8dy.json({ purposes: if68km, notice: la07et });
  } catch (sn6vk2) {
    tvap5b(sn6vk2);
  }
});

njof6m.get('/me', xjkde2, async (ncvsdv, lkdrmo, i0c7g3) => {
  try {
    lkdrmo.json(await eizzdh.t4m2mp(ncvsdv.user.id));
  } catch (avw9fs) {
    i0c7g3(avw9fs);
  }
});

njof6m.post('/decisions', xjkde2, async (eusgoh, kv2ig1, py44bw) => {
  try {
    const { decisions: od7kmw, source: re5ads, screen: uzugwb } = eusgoh.body;
    const f1d0ly = await eizzdh.or2zx8(
      eusgoh.user.id,
      { decisions: od7kmw, source: re5ads, screen: uzugwb },
      r1qecg(eusgoh)
    );
    kv2ig1.status(201).json(f1d0ly);
  } catch (oix6xv) {
    py44bw(oix6xv);
  }
});

njof6m.get('/history', xjkde2, async (s253j4, c2fezc, tfxv0e) => {
  try {
    c2fezc.json(await eizzdh.wwpy36(s253j4.user.id));
  } catch (mb3bfb) {
    tfxv0e(mb3bfb);
  }
});

export default njof6m;
