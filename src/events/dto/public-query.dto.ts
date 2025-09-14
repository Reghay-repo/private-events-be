import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class PublicQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;

  // Filter by time window on a single eventDateTime field
  @ApiPropertyOptional({ example: '2025-08-11T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit = 10;
}
