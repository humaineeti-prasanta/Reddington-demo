import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import pino from 'pino';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const level = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

const targets = [
  {
    target: 'pino-roll',
    level,
    options: {
      file: path.join(logsDir, 'app.log'),
      frequency: 'daily',
      size: '20m',
      mkdir: true,
      dateFormat: 'yyyy-MM-dd',
      limit: { count: 14 },
    },
  },
];

if (!isTest) {
  targets.push(
    isProd
      ? { target: 'pino/file', level, options: { destination: 1 } }
      : {
          target: 'pino-pretty',
          level,
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
  );
}

const transport = pino.transport({ targets });

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  'body.password',
];

const logger = pino(
  {
    level,
    base: {
      service: 'reddington-server',
      env: process.env.NODE_ENV || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: redactPaths, censor: '[REDACTED]' },
  },
  transport
);

export default logger;
