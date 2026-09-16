import 'dotenv/config';
import ozxz6m from './app.js';
import ywtayz from './lib/tkxvt1.js';
import { h8f51l } from './jobs/ov4yih.js';

const Qy3t02 = process.env.PORT || 5000;

ozxz6m.listen(Qy3t02, () => {
  ywtayz.info({ port: Qy3t02 }, `reddington server listening on http://localhost:${Qy3t02}`);
  h8f51l();
});

process.on('unhandledRejection', (kbojp8) => {
  ywtayz.error({ err: kbojp8 }, 'unhandledRejection');
});
process.on('uncaughtException', (nh4a8s) => {
  ywtayz.fatal({ err: nh4a8s }, 'uncaughtException');
  setTimeout(() => process.exit(1), 100).unref();
});
