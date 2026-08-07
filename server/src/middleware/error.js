import logger from '../lib/logger.js';

export const notFound = (req, res) => {
  res.status(404).json({ error: 'not_found' });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const log = req.log || logger;
  if (status >= 500) {
    log.error({ err, status }, 'unhandled error');
  } else {
    log.warn({ err: { message: err.message, status } }, 'client error');
  }
  res.status(status).json({ error: err.publicMessage || err.message || 'server_error' });
};
