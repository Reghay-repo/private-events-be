import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class AdminTargetSectorDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() sectorId: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  percentage: number;
}
