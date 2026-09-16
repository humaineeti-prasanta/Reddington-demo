import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import pino from 'pino';

const k1lj6t = path.dirname(fileURLToPath(import.meta.url));
const awcw2q = path.resolve(k1lj6t, '../../logs');
if (!fs.existsSync(awcw2q)) fs.mkdirSync(awcw2q, { recursive: true });

const mxocm1 = process.env.NODE_ENV === 'production';
const axv1ls = process.env.NODE_ENV === 'test';
const vjxku4 = process.env.LOG_LEVEL || (mxocm1 ? 'info' : 'debug');

const gfp4dp = [
  {
    target: 'pino-roll',
    level: vjxku4,
    options: {
      file: path.join(awcw2q, 'app.log'),
      frequency: 'daily',
      size: '20m',
      mkdir: true,
      dateFormat: 'yyyy-MM-dd',
      limit: { count: 14 },
    },
  },
];

if (!axv1ls) {
  gfp4dp.push(
    mxocm1
      ? { target: 'pino/file', level: vjxku4, options: { destination: 1 } }
      : {
          target: 'pino-pretty',
          level: vjxku4,
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
  );
}

const htkjkg = pino.transport({ targets: gfp4dp });

const eyfe5l = [
  'req.headers.authorization',
  'req.headers.cookie',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  'body.password',
];

const ywtayz = pino(
  {
    level: vjxku4,
    base: {
      service: 'reddington-server',
      env: process.env.NODE_ENV || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: eyfe5l, censor: '[REDACTED]' },
  },
  htkjkg
);

export default ywtayz;
