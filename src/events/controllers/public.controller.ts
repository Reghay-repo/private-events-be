import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from '../events.service';
import { PublicQueryDto } from '../dto/public-query.dto';
import { PublicEventDto, mapPublic } from '../dto/public-event.dto';

@ApiTags('Public/Events')
@Controller('public/events')
export class PublicEventsController {
  constructor(private readonly svc: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List upcoming public events' })
  @ApiOkResponse({ description: 'Wrapped list of events with pagination meta' })
  async findAll(@Query() q: PublicQueryDto) {
    const { data, total, page, limit } = await this.svc.listPublic(q);
    return { data: data.map(mapPublic), meta: { total, page, limit } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public event details' })
  @ApiOkResponse({ description: 'Public event', type: PublicEventDto })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const e = await this.svc.getPublic(id);
    return mapPublic(e);
  }
}
