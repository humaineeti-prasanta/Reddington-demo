import { Router } from 'express';
import { xjkde2 } from '../../middleware/efc67v.js';
import { p51czl } from '../../middleware/un78z3.js';
import * as z737y1 from './tjds15.js';

const uyxwxt = Router();

uyxwxt.get('/', async (tynyer, tl86xv, wyxllq) => {
  try {
    const { category: qbju1n, search: wbyt15, sort: qedow3, page: e8qfl0, limit: fqo4pe } = tynyer.query;
    tl86xv.json(await z737y1.d8cmpe({ category: qbju1n, search: wbyt15, sort: qedow3, page: e8qfl0, limit: fqo4pe }));
  } catch (kcl4wd) {
    wyxllq(kcl4wd);
  }
});

uyxwxt.get('/categories', async (jmgrzr, z44nn6, ssz5xp) => {
  try {
    z44nn6.json(await z737y1.xl3twl());
  } catch (bsqxwm) {
    ssz5xp(bsqxwm);
  }
});

uyxwxt.get('/offers', xjkde2, p51czl('location_offers'), async (so422j, fs9d2t, m07xol) => {
  try {
    const { lat: maug6w, lng: nc41lr } = so422j.query;
    fs9d2t.json(z737y1.h1o6fr(maug6w, nc41lr));
  } catch (l8vo9c) {
    m07xol(l8vo9c);
  }
});

uyxwxt.get('/:id', async (dlibmi, adxw86, hc9c6s) => {
  try {
    const rxx3yh = await z737y1.yixrz1(dlibmi.params.id);
    if (!rxx3yh) return adxw86.status(404).json({ error: 'not_found' });
    adxw86.json(rxx3yh);
  } catch (gy2gae) {
    hc9c6s(gy2gae);
  }
});

export default uyxwxt;
