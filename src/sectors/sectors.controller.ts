import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Sectors')
@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @ApiOperation({ summary: 'Create a new sector' })
  @ApiBody({ type: CreateSectorDto })
  @ApiResponse({
    status: 201,
    description: 'Sector successfully created.',
    schema: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Fintech' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorsService.create(createSectorDto);
  }

  @ApiOperation({ summary: 'Get all sectors' })
  @ApiResponse({
    status: 200,
    description: 'List of all sectors.',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Fintech' },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get()
  findAll() {
    return this.sectorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sector by ID' })
  @ApiParam({ name: 'id', description: 'Sector UUID' })
  @ApiResponse({
    status: 200,
    description: 'Sector found.',
    schema: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Fintech' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sector not found.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.sectorsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sector by ID' })
  @ApiParam({ name: 'id', description: 'Sector UUID' })
  @ApiBody({ type: UpdateSectorDto })
  @ApiResponse({
    status: 200,
    description: 'Sector successfully updated.',
    schema: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'SaaS' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sector not found.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  update(@Param('id') id: string, @Body() dto: UpdateSectorDto) {
    return this.sectorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sector by ID' })
  @ApiParam({ name: 'id', description: 'Sector UUID' })
  @ApiResponse({
    status: 200,
    description: 'Sector successfully deleted.',
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sector not found.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.sectorsService.remove(id);
  }
}
