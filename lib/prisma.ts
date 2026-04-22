import { PrismaClient } from '@prisma/client';

// Next.js dev 환경에서 HMR이 PrismaClient 인스턴스를 무제한 생성하는 것을 방지.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
