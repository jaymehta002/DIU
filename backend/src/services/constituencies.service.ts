import { prisma } from '../db/client';
import { NotFoundError } from '../errors';
import { pickConstituencyWinner, type CandidateTotalVotes } from '../utils/winner';

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

export async function getConstituencyWinner(id: string) {
  const constituency = await getConstituencyOrThrow(id);

  const candidates = await prisma.candidate.findMany({
    where: { constituencyId: id },
    select: {
      id: true,
      name: true,
      party: { select: { id: true, name: true, symbol: true, color: true } },
      voteRecords: { select: { votes: true } },
    },
  });

  const totals: CandidateTotalVotes[] = candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    party: candidate.party,
    totalVotes: candidate.voteRecords.reduce((sum, record) => sum + record.votes, 0),
  }));

  return {
    constituency,
    winner: pickConstituencyWinner(totals),
  };
}
