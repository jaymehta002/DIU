import { prisma } from '../db/client';
import { pickConstituencyWinner, toPercentage, type CandidateTotalVotes } from '../utils/winner';
import type { PartyInfo } from '../utils/turnout';

interface PartyBucket {
  party: PartyInfo | null;
  totalVotes: number;
  constituenciesWon: number;
}

export async function getPartyPerformance() {
  const [parties, candidates] = await Promise.all([
    prisma.party.findMany({
      select: { id: true, name: true, symbol: true, color: true },
      orderBy: { name: 'asc' },
    }),
    prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        constituencyId: true,
        party: { select: { id: true, name: true, symbol: true, color: true } },
        voteRecords: { select: { votes: true } },
      },
    }),
  ]);

  const candidateTotals = candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    party: candidate.party,
    constituencyId: candidate.constituencyId,
    totalVotes: candidate.voteRecords.reduce((sum, record) => sum + record.votes, 0),
  }));

  const buckets = new Map<string, PartyBucket>();
  const bucketKey = (party: PartyInfo | null) => party?.id ?? 'independent';

  for (const party of parties) {
    buckets.set(party.id, { party, totalVotes: 0, constituenciesWon: 0 });
  }
  buckets.set('independent', { party: null, totalVotes: 0, constituenciesWon: 0 });

  for (const candidate of candidateTotals) {
    const bucket = buckets.get(bucketKey(candidate.party));
    if (bucket) bucket.totalVotes += candidate.totalVotes;
  }

  const candidatesByConstituency = new Map<string, CandidateTotalVotes[]>();
  for (const candidate of candidateTotals) {
    const list = candidatesByConstituency.get(candidate.constituencyId) ?? [];
    list.push(candidate);
    candidatesByConstituency.set(candidate.constituencyId, list);
  }

  for (const constituencyCandidates of candidatesByConstituency.values()) {
    const winner = pickConstituencyWinner(constituencyCandidates);
    const bucket = buckets.get(bucketKey(winner.party));
    if (bucket) bucket.constituenciesWon += 1;
  }

  const overallTotalVotes = candidateTotals.reduce((sum, candidate) => sum + candidate.totalVotes, 0);

  return Array.from(buckets.values())
    .map((bucket) => ({
      party: bucket.party,
      totalVotes: bucket.totalVotes,
      voteSharePercentage: toPercentage(bucket.totalVotes, overallTotalVotes),
      constituenciesWon: bucket.constituenciesWon,
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);
}
