import { prisma } from '../db/client';
import { NotFoundError } from '../errors';
import { getConstituencyOrThrow } from './constituencies.service';
import {
  computeTurnoutPercentage,
  pickLeadingCandidate,
  sumVotes,
  type CandidateVoteTally,
} from '../utils/turnout';

const boothWithVotesSelect = {
  id: true,
  name: true,
  number: true,
  location: true,
  registeredVoters: true,
  voteRecords: {
    select: {
      votes: true,
      candidate: { select: { id: true, name: true, party: true } },
    },
  },
} as const;

interface BoothWithVotes {
  id: string;
  name: string;
  number: number;
  location: string;
  registeredVoters: number;
  voteRecords: { votes: number; candidate: { id: string; name: string; party: string } }[];
}

function shapeBooth(booth: BoothWithVotes) {
  const candidates: CandidateVoteTally[] = booth.voteRecords.map((record) => ({
    id: record.candidate.id,
    name: record.candidate.name,
    party: record.candidate.party,
    votes: record.votes,
  }));
  const totalVotesCast = sumVotes(candidates);

  return {
    id: booth.id,
    name: booth.name,
    number: booth.number,
    location: booth.location,
    registeredVoters: booth.registeredVoters,
    totalVotesCast,
    turnoutPercentage: computeTurnoutPercentage(totalVotesCast, booth.registeredVoters),
    leadingCandidate: pickLeadingCandidate(candidates),
    candidates,
  };
}

export async function listBoothsByConstituency(constituencyId: string) {
  const constituency = await getConstituencyOrThrow(constituencyId);

  const booths = await prisma.booth.findMany({
    where: { constituencyId },
    select: boothWithVotesSelect,
    orderBy: { number: 'asc' },
  });

  return {
    constituency,
    booths: booths.map(shapeBooth),
  };
}

export async function getBoothById(id: string) {
  const booth = await prisma.booth.findUnique({
    where: { id },
    select: {
      ...boothWithVotesSelect,
      constituency: { select: { id: true, name: true, code: true } },
    },
  });

  if (!booth) {
    throw new NotFoundError(`Booth ${id} not found`);
  }

  const { constituency, ...boothFields } = booth;
  return {
    ...shapeBooth(boothFields),
    constituency,
  };
}

interface BoothSearchRow {
  id: string;
  name: string;
  number: number;
  location: string;
  constituencyId: string;
  constituencyName: string;
}

export async function searchBooths(q: string) {
  const pattern = `%${q}%`;
  const rows = await prisma.$queryRaw<BoothSearchRow[]>`
    SELECT b.id, b.name, b.number, b.location, b."constituencyId", c.name AS "constituencyName"
    FROM "Booth" b
    JOIN "Constituency" c ON c.id = b."constituencyId"
    WHERE b.name ILIKE ${pattern} OR CAST(b.number AS TEXT) ILIKE ${pattern}
    ORDER BY c.name ASC, b.number ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    number: row.number,
    location: row.location,
    constituency: { id: row.constituencyId, name: row.constituencyName },
  }));
}
