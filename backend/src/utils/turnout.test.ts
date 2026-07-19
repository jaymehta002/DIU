import { describe, expect, it } from 'vitest';
import { computeTurnoutPercentage, pickLeadingCandidate, sumVotes } from './turnout';

describe('computeTurnoutPercentage', () => {
  it('rounds to one decimal place', () => {
    expect(computeTurnoutPercentage(1406, 2027)).toBe(69.4);
  });

  it('returns 0 when registeredVoters is 0', () => {
    expect(computeTurnoutPercentage(0, 0)).toBe(0);
  });

  it('returns 0 when registeredVoters is negative', () => {
    expect(computeTurnoutPercentage(100, -5)).toBe(0);
  });
});

describe('sumVotes', () => {
  it('sums votes across candidates', () => {
    const candidates = [
      { id: 'a', name: 'A', party: null, votes: 100 },
      { id: 'b', name: 'B', party: null, votes: 50 },
    ];
    expect(sumVotes(candidates)).toBe(150);
  });

  it('returns 0 for an empty candidate list', () => {
    expect(sumVotes([])).toBe(0);
  });
});

describe('pickLeadingCandidate', () => {
  it('picks the candidate with the most votes', () => {
    const candidates = [
      { id: 'a', name: 'A', party: null, votes: 100 },
      { id: 'b', name: 'B', party: null, votes: 250 },
      { id: 'c', name: 'C', party: null, votes: 50 },
    ];
    expect(pickLeadingCandidate(candidates).id).toBe('b');
  });

  it('breaks ties deterministically by lowest candidate id', () => {
    const candidates = [
      { id: 'zzz', name: 'A', party: null, votes: 100 },
      { id: 'aaa', name: 'B', party: null, votes: 100 },
    ];
    expect(pickLeadingCandidate(candidates).id).toBe('aaa');
  });

  it('returns the only candidate in a single-candidate race', () => {
    const candidates = [{ id: 'solo', name: 'Solo', party: null, votes: 42 }];
    expect(pickLeadingCandidate(candidates).id).toBe('solo');
  });
});
