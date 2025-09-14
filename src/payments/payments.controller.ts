// src/payments/payments.controller.ts
import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard'; // adjust your path
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('participation/requests/:id/checkout')
  @ApiOperation({
    summary: 'Create/reuse a simple checkout session (no provider)',
  })
  startCheckout(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: JwtPayload,
  ) {
    return this.svc.createCheckoutForRequest(id, req.sub);
  }

  @Post('payments/sessions/complete')
  @ApiOperation({ summary: 'Complete a simple checkout session by reference' })
  complete(@Query('ref') ref: string, @Req() req: JwtPayload) {
    return this.svc.completeByReference(ref, req.sub);
  }

  @Post('payments/sessions/cancel')
  @ApiOperation({
    summary: 'Cancel/fail a simple checkout session by reference',
  })
  cancel(@Query('ref') ref: string, @Req() req: JwtPayload) {
    return this.svc.cancelByReference(ref, req.sub);
  }

  @Get('participation/requests/:id/payment')
  @ApiOperation({ summary: 'Get payment status for a participation request' })
  status(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: JwtPayload) {
    return this.svc.getStatusByRequestId(id, req.sub);
  }
}
