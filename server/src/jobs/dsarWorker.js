import { processPending } from '../modules/dsar/processor.js';

// Periodic batch job that drains the DSAR pending queue.
// Default cadence: 30s in dev; override with DSAR_WORKER_INTERVAL_MS.
// Set DSAR_WORKER_ENABLED=false to disable (useful in tests).
let handle = null;
let running = false;

const tick = async () => {
  if (running) return;
  running = true;
  try {
    const result = await processPending({ limit: 10 });
    if (result.processed > 0) {
      console.log(`[DSAR worker] processed ${result.processed} request(s)`);
    }
  } catch (err) {
    console.error('[DSAR worker] tick failed', err);
  } finally {
    running = false;
  }
};

export const startDsarWorker = () => {
  if (process.env.DSAR_WORKER_ENABLED === 'false') {
    console.log('[DSAR worker] disabled via DSAR_WORKER_ENABLED=false');
    return;
  }
  if (handle) return;
  const interval = Number(process.env.DSAR_WORKER_INTERVAL_MS) || 30000;
  handle = setInterval(tick, interval);
  if (handle.unref) handle.unref();
  console.log(`[DSAR worker] started; interval=${interval}ms`);
};

export const stopDsarWorker = () => {
  if (handle) {
    clearInterval(handle);
    handle = null;
  }
};
