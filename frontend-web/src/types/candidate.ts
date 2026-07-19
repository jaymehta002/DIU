import type { Party } from './party';

export interface Candidate {
  id: string;
  name: string;
  party: Party | null;
  votes: number;
}
