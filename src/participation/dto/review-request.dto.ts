import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ReviewDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewRequestDto {
  @ApiProperty({ enum: ReviewDecision, example: ReviewDecision.APPROVED })
  @IsEnum(ReviewDecision)
  status!: ReviewDecision;
}
