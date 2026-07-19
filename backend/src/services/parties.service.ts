import { prisma } from '../db/client';

export async function listParties() {
  return prisma.party.findMany({
    select: { id: true, name: true, symbol: true, color: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
}
