import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

const PARTY_POOL = [
  'National Unity Party',
  "People's Progressive Front",
  'Democratic Alliance',
  'Green Future Party',
  'Citizens Congress',
  'Freedom Coalition',
  'Workers Solidarity Party',
  'Reform Movement',
];

/**
 * Leader weight range (1.8-2.6) always exceeds the non-leader range (0.5-1.0),
 * so the leading candidate is guaranteed the most votes, not just likely to be.
 */
function distributeVotes(candidateCount: number, totalVotes: number): number[] {
  const leaderIndex = faker.number.int({ min: 0, max: candidateCount - 1 });
  const weights = Array.from({ length: candidateCount }, (_, i) =>
    i === leaderIndex
      ? faker.number.float({ min: 1.8, max: 2.6 })
      : faker.number.float({ min: 0.5, max: 1.0 }),
  );
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  return weights.map((w) => Math.max(1, Math.round((w / weightSum) * totalVotes)));
}

async function main() {
  await prisma.$transaction([
    prisma.voteRecord.deleteMany(),
    prisma.candidate.deleteMany(),
    prisma.booth.deleteMany(),
    prisma.constituency.deleteMany(),
  ]);

  const constituencies = Array.from({ length: 5 }, (_, i) => ({
    id: randomUUID(),
    name: `${faker.location.county()} Constituency`,
    code: `PC-${String(i + 1).padStart(2, '0')}`,
  }));
  await prisma.constituency.createMany({ data: constituencies });

  for (const constituency of constituencies) {
    const candidateCount = faker.number.int({ min: 3, max: 4 });
    const parties = faker.helpers.arrayElements(PARTY_POOL, candidateCount);
    const candidates = Array.from({ length: candidateCount }, (_, i) => ({
      id: randomUUID(),
      name: faker.person.fullName(),
      party: parties[i],
      constituencyId: constituency.id,
    }));
    await prisma.candidate.createMany({ data: candidates });

    const boothCount = faker.number.int({ min: 30, max: 50 });
    const boothPlans = Array.from({ length: boothCount }, (_, i) => {
      const totalVotesCast = faker.number.int({ min: 800, max: 2000 });
      const turnoutRatio = faker.number.float({ min: 0.6, max: 0.9 });
      return {
        id: randomUUID(),
        name: `${faker.location.street()} Polling Station`,
        number: i + 1,
        location: `${faker.location.streetAddress()}, ${faker.location.city()}`,
        registeredVoters: Math.round(totalVotesCast / turnoutRatio),
        constituencyId: constituency.id,
        totalVotesCast,
      };
    });
    await prisma.booth.createMany({
      data: boothPlans.map(({ totalVotesCast, ...booth }) => booth),
    });

    const voteRecords = boothPlans.flatMap((booth) => {
      const votes = distributeVotes(candidates.length, booth.totalVotesCast);
      return candidates.map((candidate, i) => ({
        id: randomUUID(),
        boothId: booth.id,
        candidateId: candidate.id,
        votes: votes[i],
      }));
    });
    await prisma.voteRecord.createMany({ data: voteRecords });

    console.log(
      `Seeded ${constituency.name}: ${boothPlans.length} booths, ${candidates.length} candidates, ${voteRecords.length} vote records`,
    );
  }

  const [constituencyCount, boothCount, candidateCount, voteRecordCount] = await Promise.all([
    prisma.constituency.count(),
    prisma.booth.count(),
    prisma.candidate.count(),
    prisma.voteRecord.count(),
  ]);

  console.log('\nSeed complete:');
  console.log({ constituencyCount, boothCount, candidateCount, voteRecordCount });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
