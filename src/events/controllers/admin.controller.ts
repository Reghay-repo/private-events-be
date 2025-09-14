import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { EventsService } from '../events.service';
import { AdminCreateEventDto } from '../dto/admin-create-event.dto';
import { AdminUpdateEventDto } from '../dto/admin-update-event.dto';

// Adjust these imports to your project's auth paths
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/types/role.enum';
import { AdminListQueryDto } from '../dto/admin-list-query.dto';

@ApiTags('Admin/Events')
@ApiBearerAuth('JWT-auth')
@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminEventsController {
  constructor(private readonly svc: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin list of events (includes targets)' })
  @ApiOkResponse({ description: 'Wrapped list with pagination meta' })
  async list(@Query() query: AdminListQueryDto) {
    return this.svc.listAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin event details (includes targets)' })
  @ApiOkResponse({ description: 'Event with targetSectors + sector' })
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.getAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiCreatedResponse({ description: 'Created event (includes targets)' })
  async create(@Body() dto: AdminCreateEventDto) {
    return this.svc.createAdmin(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiOkResponse({ description: 'Updated event (includes targets)' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminUpdateEventDto,
  ) {
    return this.svc.updateAdmin(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiOkResponse({ description: 'Deleted event' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.deleteAdmin(id);
  }
}
