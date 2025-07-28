// src/users/dto/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { Role, UserSeniority } from '../../generated/prisma/client';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  companyName?: string;

  @Expose()
  jobTitle?: string;

  @Expose()
  role: Role;

  @Expose()
  seniority?: UserSeniority;

  @Expose()
  sectorId?: string;

  @Expose()
  jobTitleDescription?: string;

  // Convert DateTime to iso string or any formatting
  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  // Will be stripped out: safe-guarding password
  password: string;
}
