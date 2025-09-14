import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ParticipationStatus } from '../../generated/prisma/client';

export class AdminRequestsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit: number = 10;

  @ApiPropertyOptional({ enum: ParticipationStatus })
  @IsOptional()
  @IsEnum(ParticipationStatus)
  status?: ParticipationStatus;

  @ApiPropertyOptional({ description: 'Search email/title/city' })
  @IsOptional()
  @IsString()
  q?: string;
}
