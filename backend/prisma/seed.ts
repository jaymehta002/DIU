import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';
import { hashPassword } from '../src/services/auth.service';

const prisma = new PrismaClient();

const DEMO_USERS = [
  { username: 'analyst', password: 'AnalystDemo123!' },
  { username: 'admin', password: 'AdminDemo123!' },
  { username: 'user01@gmail.com', password: 'User01@123' },
];

interface PartySeed {
  name: string;
  symbol: string;
  color: string;
  weight: number;
}

const PARTY_SEED_POOL: PartySeed[] = [
  { name: 'Bharat Nirman Morcha', symbol: 'BNM', color: '#2a78d6', weight: 5 },
  { name: 'Jan Shakti Dal', symbol: 'JSD', color: '#008300', weight: 4 },
  { name: 'Lok Kalyan Party', symbol: 'LKP', color: '#e87ba4', weight: 3 },
  { name: 'Samagra Vikas Manch', symbol: 'SVM', color: '#eda100', weight: 2 },
  { name: 'Rashtriya Ekta Front', symbol: 'REF', color: '#1baf7a', weight: 2 },
  { name: 'Nav Bharat Sena', symbol: 'NBS', color: '#eb6834', weight: 1 },
];

const CANDIDATE_NAME_POOL = [
  'Priya Deshmukh',
  'Mohammed Rizwan Sheikh',
  'Kavita Reddy',
  'Harpreet Singh Gill',
  'Arjun Iyer',
  'Sunita Yadav',
  'Vikram Chauhan',
  'Fatima Bano',
  'Ramesh Naidu',
  'Anjali Kulkarni',
  'Suresh Pillai',
  'Meenakshi Subramaniam',
  'Rajesh Khatri',
  'Nasreen Ansari',
  'Gurpreet Kaur',
  'Deepak Bhatt',
  'Lakshmi Venkataraman',
  'Imran Qureshi',
  'Sneha Joshi',
  'Ashok Gowda',
  'Karthik Rajan',
  'Poonam Chowdhury',
  'Aslam Khan',
  'Radha Krishnan',
  'Nitin Wagh',
  'Zainab Sayyed',
  'Baljeet Singh',
  'Divya Menon',
  'Ganesh Pawar',
  'Yasmin Mirza',
  'Ravindra Patil',
  'Chitra Balasubramanian',
  'Manpreet Kaur',
  'Abdul Wahab',
  'Shalini Nair',
  'Dinesh Solanki',
  'Rekha Mahajan',
  'Faisal Ahmed',
  'Geeta Shinde',
];

const BOOTH_PREFIXES = [
  'Govt. Primary School',
  'Zilla Parishad High School',
  'Municipal Corporation School',
  'Govt. Higher Secondary School',
  'Panchayat Union Middle School',
  'Govt. Girls High School',
  'Community Hall',
];

interface ConstituencySeed {
  name: string;
  code: string;
  district: string;
  areas: string[];
}

const CONSTITUENCY_POOL: ConstituencySeed[] = [
  {
    name: 'Baramati',
    code: 'AC-01',
    district: 'Pune, Maharashtra',
    areas: ['Katraj', 'Loni Kalbhor', 'Malegaon', 'Indapur Road', 'Someshwarwadi', 'Vidya Nagar'],
  },
  {
    name: 'Chandni Chowk',
    code: 'AC-02',
    district: 'Central Delhi',
    areas: ['Karol Bagh', 'Sadar Bazaar', 'Kamla Nagar', 'Sabzi Mandi', 'Daryaganj', 'Paharganj'],
  },
  {
    name: 'Nagpur South',
    code: 'AC-03',
    district: 'Nagpur, Maharashtra',
    areas: ['Dharampeth', 'Sitabuldi', 'Manewada', 'Wardha Road', 'Trimurti Nagar', 'Hingna'],
  },
  {
    name: 'Yeshwanthpur',
    code: 'AC-04',
    district: 'Bengaluru, Karnataka',
    areas: ['Rajajinagar', 'Peenya', 'Malleshwaram', 'Jalahalli', 'Nandini Layout', 'Laggere'],
  },
  {
    name: 'Sivaganga',
    code: 'AC-05',
    district: 'Sivaganga, Tamil Nadu',
    areas: ['Karaikudi', 'Manamadurai', 'Devakottai', 'Ilayangudi', 'Tirupathur', 'Kalayarkoil'],
  },
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

function pickWeightedPartyId(parties: { id: string; weight: number }[]): string {
  const totalWeight = parties.reduce((sum, party) => sum + party.weight, 0);
  let roll = faker.number.float({ min: 0, max: totalWeight });
  for (const party of parties) {
    if (roll < party.weight) return party.id;
    roll -= party.weight;
  }
  return parties[parties.length - 1].id;
}

async function main() {
  await prisma.$transaction([
    prisma.voteRecord.deleteMany(),
    prisma.candidate.deleteMany(),
    prisma.party.deleteMany(),
    prisma.booth.deleteMany(),
    prisma.constituency.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  await prisma.user.createMany({
    data: await Promise.all(
      DEMO_USERS.map(async (demoUser) => ({
        id: randomUUID(),
        username: demoUser.username,
        passwordHash: await hashPassword(demoUser.password),
      })),
    ),
  });
  console.log(`Seeded ${DEMO_USERS.length} demo user(s) — see backend/README.md for credentials.`);

  const parties = PARTY_SEED_POOL.map((seed) => ({
    id: randomUUID(),
    name: seed.name,
    symbol: seed.symbol,
    color: seed.color,
    weight: seed.weight,
  }));
  await prisma.party.createMany({
    data: parties.map(({ weight: _weight, ...party }) => party),
  });
  console.log(`Seeded ${parties.length} parties.`);

  const constituencies = CONSTITUENCY_POOL.map((seed) => ({
    id: randomUUID(),
    name: seed.name,
    code: seed.code,
  }));
  await prisma.constituency.createMany({ data: constituencies });

  for (const [index, constituency] of constituencies.entries()) {
    const seed = CONSTITUENCY_POOL[index];
    const candidateCount = faker.number.int({ min: 3, max: 4 });
    const independentIndex = faker.number.int({ min: 0, max: candidateCount - 1 });
    const names = faker.helpers.arrayElements(CANDIDATE_NAME_POOL, candidateCount);
    const candidates = Array.from({ length: candidateCount }, (_, i) => ({
      id: randomUUID(),
      name: names[i],
      partyId: i === independentIndex ? null : pickWeightedPartyId(parties),
      constituencyId: constituency.id,
    }));
    await prisma.candidate.createMany({ data: candidates });

    const boothCount = faker.number.int({ min: 30, max: 50 });
    const boothPlans = Array.from({ length: boothCount }, (_, i) => {
      const totalVotesCast = faker.number.int({ min: 800, max: 2000 });
      const turnoutRatio = faker.number.float({ min: 0.6, max: 0.9 });
      const prefix = faker.helpers.arrayElement(BOOTH_PREFIXES);
      const area = faker.helpers.arrayElement(seed.areas);
      return {
        id: randomUUID(),
        name: `${prefix}, ${area}, Booth No. ${i + 1}`,
        number: i + 1,
        location: `${area}, ${seed.district}`,
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

    const independentCount = candidates.filter((c) => c.partyId === null).length;
    console.log(
      `Seeded ${constituency.name}: ${boothPlans.length} booths, ${candidates.length} candidates ` +
        `(${independentCount} independent), ${voteRecords.length} vote records`,
    );
  }

  const [constituencyCount, boothCount, candidateCount, independentCount, voteRecordCount, userCount, partyCount] =
    await Promise.all([
      prisma.constituency.count(),
      prisma.booth.count(),
      prisma.candidate.count(),
      prisma.candidate.count({ where: { partyId: null } }),
      prisma.voteRecord.count(),
      prisma.user.count(),
      prisma.party.count(),
    ]);

  console.log('\nSeed complete:');
  console.log({ constituencyCount, boothCount, candidateCount, independentCount, voteRecordCount, userCount, partyCount });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
