import type { Candidate } from './candidate';
import type { ConstituencyDetail, ConstituencySummary } from './constituency';

export interface Booth {
  id: string;
  name: string;
  number: number;
  location: string;
  registeredVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
  leadingCandidate: Candidate;
  candidates: Candidate[];
}

export interface BoothDetail extends Booth {
  constituency: ConstituencyDetail;
}

export interface ConstituencyBoothsData {
  constituency: ConstituencyDetail;
  booths: Booth[];
}

export interface BoothSearchResult {
  id: string;
  name: string;
  number: number;
  location: string;
  constituency: ConstituencySummary;
}
