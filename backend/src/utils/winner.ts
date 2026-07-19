import type { PartyInfo } from './turnout';

export interface CandidateTotalVotes {
  id: string;
  name: string;
  party: PartyInfo | null;
  totalVotes: number;
}

export function pickConstituencyWinner(candidates: CandidateTotalVotes[]): CandidateTotalVotes {
  return candidates.reduce((winner, candidate) => {
    if (candidate.totalVotes > winner.totalVotes) return candidate;
    if (candidate.totalVotes === winner.totalVotes && candidate.id < winner.id) return candidate;
    return winner;
  });
}

export function toPercentage(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}
