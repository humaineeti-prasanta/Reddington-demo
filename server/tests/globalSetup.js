import 'dotenv/config';
import { execSync } from 'node:child_process';

// Point the whole test run at the Neon TEST database, then apply migrations.
export default async function globalSetup() {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL is not set — configure it in server/.env');
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  });
}
