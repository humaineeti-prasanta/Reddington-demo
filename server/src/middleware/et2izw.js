import ywtayz from '../lib/tkxvt1.js';

export const xsya4v = (y5beld, g50r0l) => {
  g50r0l.status(404).json({ error: 'not_found' });
};

export const gqhl7x = (xim8dd, u6x5iw, u3tki1, dupdfg) => {
  const sun7cs = xim8dd.status || 500;
  const oo1fui = u6x5iw.log || ywtayz;
  if (sun7cs >= 500) {
    oo1fui.error({ err: xim8dd, status: sun7cs }, 'unhandled error');
  } else {
    oo1fui.warn({ err: { message: xim8dd.message, status: sun7cs } }, 'client error');
  }
  u3tki1.status(sun7cs).json({ error: xim8dd.publicMessage || xim8dd.message || 'server_error' });
};
