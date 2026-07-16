export const notFound = (req, res) => {
  res.status(404).json({ error: 'not_found' });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.publicMessage || err.message || 'server_error' });
};
