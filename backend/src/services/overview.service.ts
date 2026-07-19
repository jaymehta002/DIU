import { prisma } from '../db/client';
import { computeTurnoutPercentage } from '../utils/turnout';

const TOP_CANDIDATE_COUNT = 10;

function sumBoothVotes(voteRecords: { votes: number }[]): number {
  return voteRecords.reduce((sum, record) => sum + record.votes, 0);
}

export async function getOverview() {
  const [constituencies, candidates] = await Promise.all([
    prisma.constituency.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        booths: {
          select: {
            registeredVoters: true,
            voteRecords: { select: { votes: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        party: { select: { id: true, name: true, symbol: true, color: true } },
        constituency: { select: { id: true, name: true } },
        voteRecords: { select: { votes: true } },
      },
    }),
  ]);

  const constituencyStats = constituencies.map((constituency) => {
    const registeredVoters = constituency.booths.reduce((sum, booth) => sum + booth.registeredVoters, 0);
    const votesCast = constituency.booths.reduce((sum, booth) => sum + sumBoothVotes(booth.voteRecords), 0);

    return {
      id: constituency.id,
      name: constituency.name,
      code: constituency.code,
      boothCount: constituency.booths.length,
      registeredVoters,
      votesCast,
      turnoutPercentage: computeTurnoutPercentage(votesCast, registeredVoters),
    };
  });

  const totalBooths = constituencyStats.reduce((sum, c) => sum + c.boothCount, 0);
  const totalRegisteredVoters = constituencyStats.reduce((sum, c) => sum + c.registeredVoters, 0);
  const totalVotesCast = constituencyStats.reduce((sum, c) => sum + c.votesCast, 0);

  const topCandidates = candidates
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      constituency: candidate.constituency,
      totalVotes: sumBoothVotes(candidate.voteRecords),
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, TOP_CANDIDATE_COUNT);

  return {
    totalConstituencies: constituencyStats.length,
    totalBooths,
    totalRegisteredVoters,
    totalVotesCast,
    averageTurnoutPercentage: computeTurnoutPercentage(totalVotesCast, totalRegisteredVoters),
    constituencies: constituencyStats,
    topCandidates,
  };
}
