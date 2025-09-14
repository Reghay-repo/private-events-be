import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Role, UserSeniority } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user.',
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account.',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "The user's first name.",
    example: 'John',
    required: false,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "The user's last name.",
    example: 'Doe',
    required: false,
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'The name of the company the user works for.',
    example: 'Acme Inc.',
    required: false,
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    description: "The user's job title.",
    example: 'Software Engineer',
    required: false,
  })
  @IsString()
  jobTitle: string;

  @ApiProperty({
    description: "The user's role.",
    enum: Role,
    example: 'PRO_USER',
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: "The user's seniority level.",
    enum: UserSeniority,
    example: 'C_LEVEL',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserSeniority)
  seniority?: UserSeniority;

  @ApiProperty({
    description: "A description of the user's job title.",
    example: 'Develops and maintains software applications.',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString()
  jobTitleDescription?: string;

  @ApiProperty({
    description: 'The ID of the sector the user belongs to.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  sectorId: string;
}
