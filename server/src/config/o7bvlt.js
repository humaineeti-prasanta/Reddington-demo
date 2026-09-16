import { PrismaClient } from '@prisma/client';

const ubylxj = globalThis;

export const zjj8ka =
  ubylxj.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') ubylxj.prisma = zjj8ka;

export default zjj8ka;
