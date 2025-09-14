// src/events/events.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path if needed
import { Prisma } from '../generated/prisma/client';

import { PublicQueryDto } from './dto/public-query.dto';
import { AdminCreateEventDto } from './dto/admin-create-event.dto';
import { AdminUpdateEventDto } from './dto/admin-update-event.dto';
import { AdminTargetSectorDto } from './dto/admin-target-sector.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- helpers / validations ----------
  private ensureValidTargets(targets?: AdminTargetSectorDto[]) {
    if (!targets || targets.length === 0) return;
    const sum = targets.reduce((acc, t) => acc + t.percentage, 0);
    if (sum !== 100) {
      throw new BadRequestException(
        'Sum of targetSectors percentages must equal 100.',
      );
    }
    const ids = new Set(targets.map((t) => t.sectorId));
    if (ids.size !== targets.length) {
      throw new BadRequestException('Duplicate sectorId in targetSectors.');
    }
    for (const t of targets) {
      if (t.percentage < 0 || t.percentage > 100) {
        throw new BadRequestException(
          'Each target sector percentage must be between 0 and 100.',
        );
      }
    }
  }

  // ---------- PUBLIC ----------
  async listPublic(q: PublicQueryDto) {
    const where: Prisma.EventWhereInput = {
      ...(q.city ? { city: { equals: q.city, mode: 'insensitive' } } : {}),
      ...(q.from
        ? { eventDateTime: { gte: new Date(q.from) } }
        : { eventDateTime: { gte: new Date() } }),
      ...(q.to ? { eventDateTime: { lte: new Date(q.to) } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { eventDateTime: 'asc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        // public list does not need targetSectors
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, total, page: q.page, limit: q.limit };
  }

  async getPublic(id: string) {
    const ev = await this.prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException('Event not found');
    return ev;
  }

  // ---------- ADMIN ----------
  async listAdmin(params: { page: number; limit: number; q?: string }) {
    const { page, limit, q } = params;

    const where: Prisma.EventWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { targetSectors: { include: { sector: true } } },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getAdmin(id: string) {
    const ev = await this.prisma.event.findUnique({
      where: { id },
      include: { targetSectors: { include: { sector: true } } },
    });
    if (!ev) throw new NotFoundException('Event not found');
    return ev;
  }

  async createAdmin(dto: AdminCreateEventDto) {
    this.ensureValidTargets(dto.targetSectors);

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        city: dto.city,
        eventDateTime: new Date(dto.eventDateTime),
        maxParticipants: dto.maxParticipants,
        price: dto.price,
        targetDirectorPercentage: dto.targetDirectorPercentage,
        targetSectors: dto.targetSectors?.length
          ? {
              create: dto.targetSectors.map((t) => ({
                percentage: t.percentage,
                sector: { connect: { id: t.sectorId } },
              })),
            }
          : undefined,
      },
      include: { targetSectors: { include: { sector: true } } },
    });
  }

  async updateAdmin(id: string, dto: AdminUpdateEventDto) {
    const prev = await this.prisma.event.findUnique({ where: { id } });
    if (!prev) throw new NotFoundException('Event not found');

    if (dto.targetSectors) this.ensureValidTargets(dto.targetSectors);

    const updateData: Prisma.EventUpdateInput = {
      title: dto.title ?? undefined,
      description: dto.description ?? undefined,
      city: dto.city ?? undefined,
      eventDateTime: dto.eventDateTime
        ? new Date(dto.eventDateTime)
        : undefined,
      maxParticipants: dto.maxParticipants ?? undefined,
      price: dto.price ?? undefined,
      targetDirectorPercentage: dto.targetDirectorPercentage ?? undefined,
      ...(Array.isArray(dto.targetSectors)
        ? {
            targetSectors: {
              deleteMany: {}, // replace fully
              create: dto.targetSectors.map((t) => ({
                percentage: t.percentage,
                sector: { connect: { id: t.sectorId } },
              })),
            },
          }
        : {}),
    };

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: { targetSectors: { include: { sector: true } } },
    });
  }

  async deleteAdmin(id: string) {
    // NOTE: if you later want to prevent deletion with existing paid requests,
    // add a check here before deleting.
    return this.prisma.event.delete({ where: { id } });
  }
}
