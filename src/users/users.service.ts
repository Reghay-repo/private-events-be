import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a user by their unique ID.
   * @param id The ID of the user to find.
   * @returns The found user object.
   * @throws {NotFoundException} If no user is found with the given ID.
   */
  async findOneOrFail(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID must be provided.');
    }

    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      throw e;
    }
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const hashed = await argon2.hash(dto.password);

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashed,
          firstName: dto.firstName,
          lastName: dto.lastName,
          companyName: dto.companyName,
          jobTitle: dto.jobTitle,
          role: dto.role,
          seniority: dto.seniority,
          sectorId: dto.sectorId,
          jobTitleDescription: dto.jobTitleDescription,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('A user with this email already exists');
      }
      throw error;
    }
  }
}
