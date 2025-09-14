import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSectorDto {
  @ApiProperty({
    description:
      'The unique name of the sector (e.g., "Fintech", "Healthcare").',
    example: 'Saas',
    minLength: 2,
  })
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  name: string;
}
