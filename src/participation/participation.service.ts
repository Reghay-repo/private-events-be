import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ParticipationStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewDecision } from './dto/review-request.dto';

@Injectable()
export class ParticipationService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- PRO USER ----------
  async apply(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    // prevent duplicate active requests; allow re-apply only if previous was REJECTED
    const existing = await this.prisma.participationRequest.findFirst({
      where: { userId, eventId },
      orderBy: { createdAt: 'desc' },
    });
    if (existing && existing.status !== ParticipationStatus.REJECTED) {
      throw new BadRequestException(
        `You already have a ${existing.status} request for this event.`,
      );
    }

    return this.prisma.participationRequest.create({
      data: {
        userId,
        eventId,
        status: ParticipationStatus.PENDING,
      },
      include: {
        event: true,
      },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.participationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        payment: true,
      },
    });
  }

  // ---------- ADMIN ----------
  async listAdmin(query: {
    page: number;
    limit: number;
    status?: ParticipationStatus;
    q?: string;
  }) {
    const { page, limit, status, q } = query;

    const where: Prisma.ParticipationRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { user: { email: { contains: q, mode: 'insensitive' } } },
              { event: { title: { contains: q, mode: 'insensitive' } } },
              { event: { city: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.participationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
              jobTitle: true,
            },
          },
          event: true,
          payment: true,
        },
      }),
      this.prisma.participationRequest.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async review(requestId: string, decision: ReviewDecision) {
    const req = await this.prisma.participationRequest.findUnique({
      where: { id: requestId },
      include: { event: true, user: true },
    });
    if (!req) throw new NotFoundException('Participation request not found');

    const next =
      decision === ReviewDecision.APPROVED
        ? ParticipationStatus.APPROVED
        : ParticipationStatus.REJECTED;

    // NOTE: later you can trigger MailService and scoring here
    return this.prisma.participationRequest.update({
      where: { id: requestId },
      data: { status: next },
      include: { event: true, user: true },
    });
  }
}
