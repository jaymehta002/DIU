import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
