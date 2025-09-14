// src/payments/payments.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, ParticipationStatus } from '../generated/prisma';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create (or reuse) a simple checkout "session" for an APPROVED request.
   * Returns a URL containing a reference token (not for production security).
   */
  async createCheckoutForRequest(
    participationRequestId: string,
    userId: string,
  ) {
    const pr = await this.prisma.participationRequest.findUnique({
      where: { id: participationRequestId },
      include: { event: true, user: true, payment: true },
    });
    if (!pr) throw new NotFoundException('Request not found');
    if (pr.userId !== userId)
      throw new BadRequestException('Not your request.');
    if (pr.status !== ParticipationStatus.APPROVED) {
      throw new BadRequestException(
        `Request must be APPROVED to pay (current: ${pr.status}).`,
      );
    }

    // Reuse existing pending session if any; else create a new reference
    const ref = pr.payment?.stripePaymentIntentId ?? randomUUID();

    await this.prisma.payment.upsert({
      where: { participationRequestId: participationRequestId },
      update: {
        amount: pr.event.price,
        stripePaymentIntentId: ref,
        status: PaymentStatus.PENDING,
      },
      create: {
        participationRequestId,
        amount: pr.event.price,
        stripePaymentIntentId: ref,
        status: PaymentStatus.PENDING,
      },
    });

    const baseUrl = process.env.CHECKOUT_BASE_URL ?? 'http://localhost:3000';
    const url = `${baseUrl}/pay?ref=${encodeURIComponent(ref)}`; // your frontend route

    return { reference: ref, url };
  }

  /**
   * Complete a session by reference.
   * - Re-check capacity transactionally
   * - Mark Payment -> SUCCEEDED
   * - Mark ParticipationRequest -> PAID
   */
  async completeByReference(ref: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { stripePaymentIntentId: ref },
        include: { participationRequest: { include: { event: true } } },
      });
      if (!payment) throw new NotFoundException('Payment session not found');

      const pr = payment.participationRequest;
      if (pr.userId !== userId)
        throw new BadRequestException('Not your payment session.');
      if (payment.status === PaymentStatus.SUCCEEDED) return payment; // idempotent

      // Capacity check
      const taken = await tx.participationRequest.count({
        where: {
          eventId: pr.eventId,
          status: {
            in: [
              ParticipationStatus.APPROVED,
              ParticipationStatus.PAID,
              ParticipationStatus.CONFIRMED,
            ],
          },
        },
      });
      if (taken >= pr.event.maxParticipants) {
        await tx.payment.update({
          where: { participationRequestId: pr.id },
          data: { status: PaymentStatus.FAILED },
        });
        throw new BadRequestException('Event is full');
      }

      await tx.payment.update({
        where: { participationRequestId: pr.id },
        data: { status: PaymentStatus.SUCCEEDED },
      });

      await tx.participationRequest.update({
        where: { id: pr.id },
        data: { status: ParticipationStatus.PAID },
      });

      return { ok: true };
    });
  }

  /**
   * Cancel/Fail a session by reference.
   */
  async cancelByReference(ref: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: ref },
      include: { participationRequest: true },
    });
    if (!payment) throw new NotFoundException('Payment session not found');
    if (payment.participationRequest.userId !== userId) {
      throw new BadRequestException('Not your payment session.');
    }
    if (payment.status === PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Payment already succeeded.');
    }

    await this.prisma.payment.update({
      where: { participationRequestId: payment.participationRequestId },
      data: { status: PaymentStatus.FAILED },
    });

    return { ok: true };
  }

  /**
   * Optional helper to get payment status for a request.
   */
  async getStatusByRequestId(requestId: string, userId: string) {
    const pr = await this.prisma.participationRequest.findUnique({
      where: { id: requestId },
      include: { payment: true },
    });
    if (!pr) throw new NotFoundException('Request not found');
    if (pr.userId !== userId)
      throw new BadRequestException('Not your request.');

    return {
      requestStatus: pr.status,
      paymentStatus: pr.payment?.status ?? 'NONE',
      reference: pr.payment?.stripePaymentIntentId ?? null,
    };
  }
}
