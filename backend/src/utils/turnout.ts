export interface PartyInfo {
  id: string;
  name: string;
  symbol: string;
  color: string;
}

export interface CandidateVoteTally {
  id: string;
  name: string;
  party: PartyInfo | null;
  votes: number;
}

export function computeTurnoutPercentage(totalVotesCast: number, registeredVoters: number): number {
  if (registeredVoters <= 0) return 0;
  return Math.round((totalVotesCast / registeredVoters) * 1000) / 10;
}

export function sumVotes(candidates: CandidateVoteTally[]): number {
  return candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
}

/**
 * Ties broken by candidate id (not present in seeded data, but keeps the
 * result deterministic rather than depending on array/query order).
 */
export function pickLeadingCandidate(candidates: CandidateVoteTally[]): CandidateVoteTally {
  return candidates.reduce((leader, candidate) => {
    if (candidate.votes > leader.votes) return candidate;
    if (candidate.votes === leader.votes && candidate.id < leader.id) return candidate;
    return leader;
  });
}
