// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient, Role, UserSeniority } from '../src/generated/prisma';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // ------------------------------
  // 1) Ensure ADMIN user
  // ------------------------------
  const email = process.env.ADMIN_EMAIL ?? 'admin@gmail.com';
  const plain = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const firstName = process.env.ADMIN_FIRST_NAME ?? 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME ?? 'User';
  const resetAdminPassword =
    (process.env.RESET_ADMIN_PASSWORD ?? 'false') === 'true';
  const hashedAdmin = await argon2.hash(plain);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      firstName,
      lastName,
      ...(resetAdminPassword ? { password: hashedAdmin } : {}),
    },
    create: {
      email,
      password: hashedAdmin,
      firstName,
      lastName,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin ensured: ${email}`);

  // ------------------------------
  // 2) Ensure sectors (idempotent)
  // ------------------------------
  await prisma.sector.createMany({
    data: [{ name: 'Fintech' }, { name: 'SaaS' }],
    skipDuplicates: true,
  });

  const fintech = await prisma.sector.findUnique({
    where: { name: 'Fintech' },
  });
  const saas = await prisma.sector.findUnique({ where: { name: 'SaaS' } });
  if (!fintech || !saas) throw new Error('Failed to load sectors');

  // ------------------------------
  // 3) Ensure a sample PRO user
  // ------------------------------
  const sampleEmail = 'oussama.reghay@gmail.com';
  await prisma.user.upsert({
    where: { email: sampleEmail },
    update: {
      sectorId: fintech.id,
    },
    create: {
      email: sampleEmail,
      password: await argon2.hash('password'), // demo only
      firstName: 'Alice',
      lastName: 'Smith',
      companyName: 'Acme Inc.',
      jobTitle: 'CEO',
      seniority: UserSeniority.C_LEVEL,
      role: Role.PRO_USER,
      sectorId: fintech.id,
    },
  });
  const user = await prisma.user.findUnique({ where: { email: sampleEmail } });
  if (!user) throw new Error('Failed to ensure sample user');

  // ------------------------------
  // 4) Ensure event (idempotent by natural key)
  //    Prisma upsert needs a unique key, so we do findFirst → create/update.
  // ------------------------------
  const naturalKey = {
    title: 'Fintech Networking',
    city: 'Paris',
    eventDateTime: new Date('2025-12-01T18:00:00.000Z'),
  };

  let event = await prisma.event.findFirst({
    where: {
      title: naturalKey.title,
      city: naturalKey.city,
      eventDateTime: naturalKey.eventDateTime,
    },
  });

  if (event) {
    event = await prisma.event.update({
      where: { id: event.id },
      data: {
        description: 'Exclusive event for fintech leaders.',
        maxParticipants: 100,
        price: 199.99,
        targetDirectorPercentage: 30,
      },
    });
    console.log(`Event updated: ${event.title}`);
  } else {
    event = await prisma.event.create({
      data: {
        ...naturalKey,
        description: 'Exclusive event for fintech leaders.',
        maxParticipants: 100,
        price: 199.99,
        targetDirectorPercentage: 30,
      },
    });
    console.log(`Event created: ${event.title}`);
  }

  // ------------------------------
  // 5) Ensure participation request (unique by (userId,eventId) logically)
  // ------------------------------
  const existingReq = await prisma.participationRequest.findFirst({
    where: { userId: user.id, eventId: event.id },
  });
  if (!existingReq) {
    await prisma.participationRequest.create({
      data: { userId: user.id, eventId: event.id },
    });
    console.log(`ParticipationRequest created for ${user.email}`);
  } else {
    console.log(`ParticipationRequest already exists for ${user.email}`);
  }

  // ------------------------------
  // 6) Ensure event target sectors (composite upsert)
  // ------------------------------
  await prisma.eventTargetSector.upsert({
    where: { eventId_sectorId: { eventId: event.id, sectorId: fintech.id } },
    update: { percentage: 60 },
    create: { eventId: event.id, sectorId: fintech.id, percentage: 60 },
  });
  await prisma.eventTargetSector.upsert({
    where: { eventId_sectorId: { eventId: event.id, sectorId: saas.id } },
    update: { percentage: 40 },
    create: { eventId: event.id, sectorId: saas.id, percentage: 40 },
  });
  console.log('Event target sectors ensured (60% Fintech, 40% SaaS)');

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
