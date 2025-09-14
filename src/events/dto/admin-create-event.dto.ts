import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdminTargetSectorDto } from './admin-target-sector.dto';

export class AdminCreateEventDto {
  @ApiProperty() @IsString() @MinLength(1) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() @MinLength(1) city: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  eventDateTime: string;

  @ApiProperty({ minimum: 1 }) @IsInt() @Min(1) maxParticipants: number;

  @ApiProperty({ minimum: 0 }) @IsNumber() @Min(0) price: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  targetDirectorPercentage: number;

  @ApiProperty({ type: [AdminTargetSectorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminTargetSectorDto)
  targetSectors: AdminTargetSectorDto[];
}
