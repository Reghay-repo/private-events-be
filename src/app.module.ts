import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SectorsModule } from './sectors/sectors.module';
import { EventsModule } from './events/events.module';
import { ParticipationModule } from './participation/participation.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SectorsModule,
    EventsModule,
    ParticipationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
