import { prisma } from '../db/client';
import { NotFoundError } from '../errors';

export async function listConstituencies() {
  return prisma.constituency.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export async function getConstituencyOrThrow(id: string) {
  const constituency = await prisma.constituency.findUnique({
    where: { id },
    select: { id: true, name: true, code: true },
  });

  if (!constituency) {
    throw new NotFoundError(`Constituency ${id} not found`);
  }

  return constituency;
}
