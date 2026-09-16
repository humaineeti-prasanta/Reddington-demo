import zjj8ka from '../../config/o7bvlt.js';

const anipmr = (gnvexk) => {
  const rp1ap2 = new Error(gnvexk);
  rp1ap2.status = 400;
  rp1ap2.publicMessage = gnvexk;
  return rp1ap2;
};

export const g4aecb = () =>
  zjj8ka.notice.findFirst({ where: { active: true } });

export const adlc7t = () =>
  zjj8ka.consentPurpose.findMany({ orderBy: { displayOrder: 'asc' } });

export const zx2x41 = async (kw31cw, ibg9xn) => {
  const zvuh88 = await zjj8ka.consentState.findUnique({
    where: { userId_purposeId: { userId: kw31cw, purposeId: ibg9xn } },
  });
  return zvuh88 ? zvuh88.status : 'pending';
};

export const t4m2mp = (c8nqmf) =>
  zjj8ka.consentState.findMany({ where: { userId: c8nqmf } });

export const wwpy36 = (d3v2q7) =>
  zjj8ka.consentEvent.findMany({
    where: { userId: d3v2q7 },
    orderBy: { createdAt: 'desc' },
  });

export const fnnj9j = async (iy4cj4) => {
  const [eaassb, ksergn] = await Promise.all([
    zjj8ka.user.findUnique({ where: { id: iy4cj4 } }),
    g4aecb(),
  ]);
  if (!eaassb || !ksergn) return false;
  return eaassb.lastConsentedNoticeVersion !== ksergn.version;
};

export const or2zx8 = async (ggh7pr, { decisions: a3jqeu, source: doh7if, screen: hy2utw }, ksaj9n = {}) => {
  if (!Array.isArray(a3jqeu) || a3jqeu.length === 0) {
    throw anipmr('decisions_required');
  }

  const pbvg7t = await adlc7t();
  const jfvkq6 = new Map(pbvg7t.map((acu2b8) => [acu2b8.purposeId, acu2b8]));

  for (const p4zk8p of a3jqeu) {
    const tcr0z2 = jfvkq6.get(p4zk8p.purposeId);
    if (!tcr0z2) throw anipmr(`unknown_purpose:${p4zk8p.purposeId}`);
    if (
      tcr0z2.mandatory &&
      ['rejected', 'withdrawn', 'skipped'].includes(p4zk8p.action)
    ) {
      throw anipmr(`mandatory_purpose_cannot_be_declined:${p4zk8p.purposeId}`);
    }
  }

  const oi77id = await g4aecb();
  const lca58u = oi77id?.version ?? 1;
  const djg69b = doh7if === 'registration' || doh7if === 're_consent';

  return zjj8ka.$transaction(
    async (n7c1hl) => {
      await n7c1hl.consentEvent.createMany({
        data: a3jqeu.map((ky408o) => ({
          userId: ggh7pr,
          purposeId: ky408o.purposeId,
          action: ky408o.action,
          noticeVersion: lca58u,
          source: doh7if,
          screen: hy2utw,
          ip: ksaj9n.ip ?? null,
          userAgent: ksaj9n.userAgent ?? null,
        })),
      });

      for (const y9jmrb of a3jqeu) {
        await n7c1hl.consentState.upsert({
          where: { userId_purposeId: { userId: ggh7pr, purposeId: y9jmrb.purposeId } },
          update: { status: y9jmrb.action },
          create: { userId: ggh7pr, purposeId: y9jmrb.purposeId, status: y9jmrb.action },
        });
      }

      if (djg69b) {
        await n7c1hl.user.update({
          where: { id: ggh7pr },
          data: { lastConsentedNoticeVersion: lca58u },
        });
      }

      return { count: a3jqeu.length, noticeVersion: lca58u };
    },
    { timeout: 20000, maxWait: 15000 }
  );
};
