import type { Party } from '../types/party';

export function partyLabel(party: Party | null): string {
  return party?.name ?? 'Independent';
}
