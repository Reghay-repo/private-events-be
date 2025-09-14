import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParticipationService } from '../participation.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/types/role.enum';
import { AdminRequestsQueryDto } from '../dto/admin-requests-query.dto';
import { ReviewRequestDto } from '../dto/review-request.dto';

@ApiTags('Admin/participation-requests')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/participation-requests')
export class AdminParticipationController {
  constructor(private readonly svc: ParticipationService) {}

  @Get()
  @ApiOperation({ summary: 'List participation requests' })
  @ApiOkResponse({ description: 'Paginated list' })
  list(@Query() q: AdminRequestsQueryDto) {
    return this.svc.listAdmin(q);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Review a request (APPROVED/REJECTED)' })
  @ApiOkResponse({ description: 'Updated request' })
  review(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReviewRequestDto,
  ) {
    return this.svc.review(id, dto.status);
  }
}
