import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParticipationService } from '../participation.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { JwtPayload } from '../../auth/types/jwt-payload.type';

@ApiTags('participation-requests')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('participation-requests')
export class ParticipationController {
  constructor(private readonly svc: ParticipationService) {}

  @Post('events/:eventId/participate')
  @ApiOperation({ summary: 'Apply to an event' })
  @ApiOkResponse({ description: 'Created participation request (PENDING)' })
  apply(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Req() req: JwtPayload,
  ) {
    return this.svc.apply(req.sub, eventId);
  }

  @Get('me/requests')
  @ApiOperation({ summary: 'List my participation requests' })
  @ApiOkResponse({ description: 'My requests' })
  getMine(@Req() req: JwtPayload) {
    return this.svc.getMyRequests(req.sub);
  }
}
