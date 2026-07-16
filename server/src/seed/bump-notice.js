import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Publish a new active notice version (N+1) and deactivate the current one.
// This makes every existing user "stale" → forced re-consent at next login.
async function main() {
  const current = await prisma.notice.findFirst({ orderBy: { version: 'desc' } });
  const nextVersion = (current?.version ?? 0) + 1;

  await prisma.notice.updateMany({ where: { active: true }, data: { active: false } });

  const notice = await prisma.notice.create({
    data: {
      version: nextVersion,
      title: 'Reddington Privacy Notice',
      content: `Reddington Privacy Notice (version ${nextVersion}).

This revision clarifies how your GPS location and device analytics are used and adds detail on withdrawing consent. Please review and re-confirm your choices.

We continue to process account, order and (with your consent) recommendation, notification, marketing, analytics and location data strictly for the stated purposes.`,
      active: true,
    },
  });

  console.log(`Bumped notice: v${current?.version ?? '-'} → v${notice.version} (active).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
