import { PrismaClient } from '@prisma/client';

const vcdkov = new PrismaClient();

async function rx5t7b() {
  const a9fvia = await vcdkov.notice.findFirst({ orderBy: { version: 'desc' } });
  const t9lkdj = (a9fvia?.version ?? 0) + 1;

  await vcdkov.notice.updateMany({ where: { active: true }, data: { active: false } });

  const jmivzh = await vcdkov.notice.create({
    data: {
      version: t9lkdj,
      title: 'Reddington Privacy Notice',
      content: `Reddington Privacy Notice (version ${t9lkdj}).

This revision clarifies how your GPS location and device analytics are used and adds detail on withdrawing consent. Please review and re-confirm your choices.

We continue to process account, order and (with your consent) recommendation, notification, marketing, analytics and location data strictly for the stated purposes.`,
      active: true,
    },
  });

  console.log(`Bumped notice: v${a9fvia?.version ?? '-'} → v${jmivzh.version} (active).`);
}

rx5t7b()
  .catch((yl91zk) => {
    console.error(yl91zk);
    process.exit(1);
  })
  .finally(() => vcdkov.$disconnect());
