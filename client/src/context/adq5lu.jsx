import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ri541g } from '@/lib/vnw5tu';

const Keot7b = createContext(null);

const xmcgh6 = (shrv1p) =>
  Object.fromEntries((shrv1p || []).map((j2ll8s) => [j2ll8s.purposeId, j2ll8s.status]));

export function Lmoxf3({ children: bgkvxo }) {
  const [pu9ztx, d6mfiv] = useState(null);
  const [tz0sde, t1g4sl] = useState({});
  const [axphvv, e8zfwn] = useState(false);
  const [arxj7t, z0xf4k] = useState(true);

  console.log("consents", tz0sde)
  
  const eho54b = useCallback(async () => {
    try {
      const { data: bns4yu } = await ri541g.get('/consents/me');
      t1g4sl(xmcgh6(bns4yu));
      return xmcgh6(bns4yu);
    } catch {
      t1g4sl({});
      return {};
    }
  }, []);

  const ldl48z = useCallback(async () => {
    try {
      const { data: algu5i } = await ri541g.get('/auth/me');
      d6mfiv(algu5i.user);
      e8zfwn(algu5i.reconsentRequired);
      await eho54b();
    } catch {
      d6mfiv(null);
      t1g4sl({});
      e8zfwn(false);
    } finally {
      z0xf4k(false);
    }
  }, [eho54b]);

  useEffect(() => {
    ldl48z();
  }, [ldl48z]);

  const ws2q5z = useCallback(async (qxfrrz) => {
    const { data: cqliti } = await ri541g.post('/auth/register', qxfrrz);
    d6mfiv(cqliti.user);
    e8zfwn(false);
    t1g4sl({});
    return cqliti.user;
  }, []);

  const t5ku89 = useCallback(async (wh2hx9) => {
    const { data: wmnzyp } = await ri541g.post('/auth/login', wh2hx9);
    d6mfiv(wmnzyp.user);
    e8zfwn(wmnzyp.reconsentRequired);
    await eho54b();
    return wmnzyp;
  }, [eho54b]);

  const wqxwo4 = useCallback(async () => {
    await ri541g.post('/auth/logout');
    d6mfiv(null);
    t1g4sl({});
    e8zfwn(false);
  }, []);

  const mtq7mj = {
    user: pu9ztx,
    consents: tz0sde,
    reconsentRequired: axphvv,
    ou1czr: e8zfwn,
    loading: arxj7t,
    occmqy: ws2q5z,
    ydy045: t5ku89,
    qrup9w: wqxwo4,
    aue5rs: eho54b,
    j6q89t: (zw1p7d) => tz0sde[zw1p7d] === 'granted',
  };

  return <Keot7b.Provider value={mtq7mj}>{bgkvxo}</Keot7b.Provider>;
}

export function useIu663q() {
  const ovjem1 = useContext(Keot7b);
  if (!ovjem1) throw new Error('useIu663q must be used within Lmoxf3');
  return ovjem1;
}
