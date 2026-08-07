import 'dotenv/config';
import app from './app.js';
import logger from './lib/logger.js';
import { startDsarWorker } from './jobs/dsarWorker.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `reddington server listening on http://localhost:${PORT}`);
  startDsarWorker();
});

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'unhandledRejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  setTimeout(() => process.exit(1), 100).unref();
});
