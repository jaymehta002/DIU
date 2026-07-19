import type { Party } from './party';

export interface ConstituencyStat {
  id: string;
  name: string;
  code: string;
  boothCount: number;
  registeredVoters: number;
  votesCast: number;
  turnoutPercentage: number;
}

export interface CandidateLeaderboardEntry {
  id: string;
  name: string;
  party: Party | null;
  constituency: { id: string; name: string };
  totalVotes: number;
}

export interface Overview {
  totalConstituencies: number;
  totalBooths: number;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  averageTurnoutPercentage: number;
  constituencies: ConstituencyStat[];
  topCandidates: CandidateLeaderboardEntry[];
}
