// prisma/seed.events.ts
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// --- 1) Sectors you want in the system ---
const sectorNames = [
  'Fintech',
  'SaaS',
  'AI/ML',
  'DevTools',
  'Cybersecurity',
  'Cloud & Infrastructure',
  'HealthTech',
  'Biotech',
  'CleanTech',
  'Energy',
  'Mobility',
  'E-commerce',
  'Logistics',
  'PropTech',
  'ConstructionTech',
  'Gaming',
  'Media & Entertainment',
  'AdTech/MarTech',
  'AgriTech',
  'FoodTech',
  'Web3/Blockchain',
  'RegTech',
];

// --- 2) Events to seed (targets by sector NAME; we’ll map to IDs) ---
const eventsSeed = [
  {
    title: 'AI & Fintech Leaders Night',
    description: 'C-level and directors across fintech + AI',
    city: 'Paris',
    eventDateTime: '2025-11-20T18:00:00.000Z',
    maxParticipants: 120,
    price: 219,
    targetDirectorPercentage: 35,
    targets: [
      { name: 'Fintech', percentage: 40 },
      { name: 'SaaS', percentage: 30 },
      { name: 'AI/ML', percentage: 30 },
    ],
  },
  {
    title: 'SaaS Founders Breakfast',
    description: 'Early-morning tactical session',
    city: 'London',
    eventDateTime: '2025-10-15T08:30:00.000Z',
    maxParticipants: 60,
    price: 59,
    targetDirectorPercentage: 25,
    targets: [
      { name: 'SaaS', percentage: 60 },
      { name: 'DevTools', percentage: 25 },
      { name: 'Cybersecurity', percentage: 15 },
    ],
  },
  {
    title: 'HealthTech & Bio Forum',
    description: 'Clinical, biotech and data leaders',
    city: 'Berlin',
    eventDateTime: '2025-09-25T17:30:00.000Z',
    maxParticipants: 100,
    price: 180,
    targetDirectorPercentage: 40,
    targets: [
      { name: 'HealthTech', percentage: 50 },
      { name: 'Biotech', percentage: 30 },
      { name: 'AI/ML', percentage: 20 },
    ],
  },
  {
    title: 'Cyber & Cloud Executive Roundtable',
    description: 'Security leaders and cloud architects',
    city: 'New York',
    eventDateTime: '2025-11-05T17:00:00.000Z',
    maxParticipants: 80,
    price: 250,
    targetDirectorPercentage: 45,
    targets: [
      { name: 'Cybersecurity', percentage: 40 },
      { name: 'Cloud & Infrastructure', percentage: 40 },
      { name: 'SaaS', percentage: 20 },
    ],
  },
  {
    title: 'Climate & CleanTech Summit',
    description: 'Scaling climate tech commercialization',
    city: 'Amsterdam',
    eventDateTime: '2025-10-28T09:00:00.000Z',
    maxParticipants: 150,
    price: 199,
    targetDirectorPercentage: 30,
    targets: [
      { name: 'CleanTech', percentage: 60 },
      { name: 'Energy', percentage: 25 },
      { name: 'Mobility', percentage: 15 },
    ],
  },
  {
    title: 'E-commerce & Retail Ops Meetup',
    description: 'Commerce leaders on ops and CX',
    city: 'Dubai',
    eventDateTime: '2025-12-10T18:30:00.000Z',
    maxParticipants: 120,
    price: 120,
    targetDirectorPercentage: 20,
    targets: [
      { name: 'E-commerce', percentage: 50 },
      { name: 'Logistics', percentage: 30 },
      { name: 'Fintech', percentage: 20 },
    ],
  },
  {
    title: 'PropTech After Hours',
    description: 'Built world software and marketplaces',
    city: 'Singapore',
    eventDateTime: '2025-11-12T18:30:00.000Z',
    maxParticipants: 90,
    price: 140,
    targetDirectorPercentage: 30,
    targets: [
      { name: 'PropTech', percentage: 60 },
      { name: 'ConstructionTech', percentage: 25 },
      { name: 'SaaS', percentage: 15 },
    ],
  },
  {
    title: 'Media, Gaming & Creator Economy',
    description: 'Content, engines, monetization',
    city: 'Los Angeles',
    eventDateTime: '2025-09-18T19:00:00.000Z',
    maxParticipants: 130,
    price: 85,
    targetDirectorPercentage: 25,
    targets: [
      { name: 'Gaming', percentage: 40 },
      { name: 'Media & Entertainment', percentage: 40 },
      { name: 'AdTech/MarTech', percentage: 20 },
    ],
  },
  {
    title: 'Agri & FoodTech Mixer',
    description: 'Yield, supply chain, and sustainability',
    city: 'Barcelona',
    eventDateTime: '2025-11-26T18:00:00.000Z',
    maxParticipants: 80,
    price: 95,
    targetDirectorPercentage: 20,
    targets: [
      { name: 'AgriTech', percentage: 50 },
      { name: 'FoodTech', percentage: 30 },
      { name: 'CleanTech', percentage: 20 },
    ],
  },
  {
    title: 'Web3 & FinServ Roundtable',
    description: 'Digital assets, custody, and compliance',
    city: 'Zurich',
    eventDateTime: '2025-10-09T17:30:00.000Z',
    maxParticipants: 70,
    price: 170,
    targetDirectorPercentage: 35,
    targets: [
      { name: 'Web3/Blockchain', percentage: 60 },
      { name: 'Fintech', percentage: 30 },
      { name: 'RegTech', percentage: 10 },
    ],
  },
];

async function ensureSectors() {
  await prisma.sector.createMany({
    data: sectorNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const sectors = await prisma.sector.findMany({
    where: { name: { in: sectorNames } },
  });

  const map = new Map<string, string>();
  sectors.forEach((s) => map.set(s.name, s.id));

  // sanity check
  for (const n of sectorNames) {
    if (!map.get(n)) throw new Error(`Sector missing after seed: ${n}`);
  }
  return map; // name -> id
}

function assertTargetsSum100(targets: { name: string; percentage: number }[]) {
  const sum = targets.reduce((a, t) => a + t.percentage, 0);
  if (sum !== 100) {
    throw new Error(`Targets must sum to 100; got ${sum}`);
  }
}

async function ensureEventAndTargets(
  e: (typeof eventsSeed)[number],
  sectorNameToId: Map<string, string>,
) {
  return prisma.$transaction(async (tx) => {
    // 1) find event by natural key
    const when = new Date(e.eventDateTime);
    let event = await tx.event.findFirst({
      where: { title: e.title, city: e.city, eventDateTime: when },
    });

    // 2) create/update event
    if (event) {
      event = await tx.event.update({
        where: { id: event.id },
        data: {
          description: e.description,
          maxParticipants: e.maxParticipants,
          price: e.price,
          targetDirectorPercentage: e.targetDirectorPercentage,
        },
      });
      // fallthrough
    } else {
      event = await tx.event.create({
        data: {
          title: e.title,
          description: e.description,
          city: e.city,
          eventDateTime: when,
          maxParticipants: e.maxParticipants,
          price: e.price,
          targetDirectorPercentage: e.targetDirectorPercentage,
        },
      });
    }

    // 3) validate and normalize targets
    assertTargetsSum100(e.targets);
    const targetIds = e.targets.map((t) => {
      const sectorId = sectorNameToId.get(t.name);
      if (!sectorId) throw new Error(`Unknown sector name: ${t.name}`);
      return { sectorId, percentage: t.percentage };
    });

    // 4) keep targets in sync:
    //    - remove any extra rows not in the new set
    //    - upsert (create or update) the desired rows
    const keepIds = targetIds.map((t) => t.sectorId);
    await tx.eventTargetSector.deleteMany({
      where: { eventId: event.id, NOT: { sectorId: { in: keepIds } } },
    });

    for (const t of targetIds) {
      await tx.eventTargetSector.upsert({
        where: {
          eventId_sectorId: { eventId: event.id, sectorId: t.sectorId },
        },
        update: { percentage: t.percentage },
        create: {
          eventId: event.id,
          sectorId: t.sectorId,
          percentage: t.percentage,
        },
      });
    }

    return event;
  });
}

async function main() {
  const sectorMap = await ensureSectors();
  for (const e of eventsSeed) {
    const ev = await ensureEventAndTargets(e, sectorMap);
    console.log(
      `Ensured event: ${ev.title} — ${ev.city} @ ${ev.eventDateTime.toISOString()}`,
    );
  }
  console.log('Events + sectors seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
