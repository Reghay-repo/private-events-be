import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
}
