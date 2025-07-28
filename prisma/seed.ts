// prisma/seed.ts
import { PrismaClient, Role, UserSeniority } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create sectors
  const fintech = await prisma.sector.upsert({
    where: { name: 'Fintech' },
    update: {},
    create: { name: 'Fintech' },
  });

  const saas = await prisma.sector.upsert({
    where: { name: 'SaaS' },
    update: {},
    create: { name: 'SaaS' },
  });

  // Create users
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: 'hashed-password', // Make sure to hash in prod
      firstName: 'Alice',
      lastName: 'Smith',
      companyName: 'Acme Inc.',
      jobTitle: 'CEO',
      seniority: UserSeniority.C_LEVEL,
      role: Role.PRO_USER,
      sectorId: fintech.id,
    },
  });

  // Create event
  const event = await prisma.event.create({
    data: {
      title: 'Fintech Networking',
      description: 'Exclusive event for fintech leaders.',
      city: 'Paris',
      eventDateTime: new Date('2025-12-01T18:00:00.000Z'),
      maxParticipants: 100,
      price: 199.99,
      targetDirectorPercentage: 30,
      targetSectors: {
        create: [
          { sectorId: fintech.id, percentage: 60 },
          { sectorId: saas.id, percentage: 40 },
        ],
      },
    },
  });

  // Create participation request
  await prisma.participationRequest.create({
    data: {
      userId: user.id,
      eventId: event.id,
    },
  });

  console.log('Seeded database with initial data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
