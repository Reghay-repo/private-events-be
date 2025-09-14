import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './controllers/participation.controller';
import { AdminParticipationController } from './controllers/admin-participation.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ParticipationController, AdminParticipationController],
  providers: [ParticipationService, PrismaService],
})
export class ParticipationModule {}
