import { processPending } from '../modules/dsar/processor.js';
import logger from '../lib/logger.js';

const log = logger.child({ module: 'dsar-worker' });


let handle = null;
let running = false;

const tick = async () => {
  if (running) return;
  running = true;
  try {
    const result = await processPending({ limit: 10 });
    if (result.processed > 0) {
      log.info({ processed: result.processed }, 'processed DSAR requests');
    }
  } catch (err) {
    log.error({ err }, 'tick failed');
  } finally {
    running = false;
  }
};

export const startDsarWorker = () => {
  if (process.env.DSAR_WORKER_ENABLED === 'false') {
    log.info('disabled via DSAR_WORKER_ENABLED=false');
    return;
  }
  if (handle) return;
  const interval = Number(process.env.DSAR_WORKER_INTERVAL_MS) || 30000;
  handle = setInterval(tick, interval);
  if (handle.unref) handle.unref();
  log.info({ intervalMs: interval }, 'started');
};

export const stopDsarWorker = () => {
  if (handle) {
    clearInterval(handle);
    handle = null;
  }
};
