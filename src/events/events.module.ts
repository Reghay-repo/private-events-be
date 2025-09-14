import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PublicEventsController } from './controllers/public.controller';
import { AdminEventsController } from './controllers/admin.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PublicEventsController, AdminEventsController],
  providers: [EventsService, PrismaService],
})
export class EventsModule {}
