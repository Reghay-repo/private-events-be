// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendPaymentLink(to: string, clientSecretOrUrl: string) {
    /* send */
  }

  async sendConfirmation(
    to: string,
    eventTitle: string,
    whenISO: string,
    venue?: string,
  ) {
    /* send */
  }
}
