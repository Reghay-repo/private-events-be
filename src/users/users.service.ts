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
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
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

  /**
   * Updates a user's details by their unique ID.
   * @param id The ID of the user to update.
   * @param updateUserDto The data transfer object containing the fields to update.
   * @returns The updated user object.
   * @throws {NotFoundException} If no user is found with the given ID.
   * @throws {BadRequestException} If the new email is already taken.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // 2. Ensure the user exists before trying to update
    await this.findOneOrFail(id);

    const { password, ...data } = updateUserDto;

    // 3. If a new password is provided, hash it
    if (password) {
      data['password'] = await argon2.hash(password);
    }

    try {
      // 4. Use Prisma to update the user
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      // Handle potential unique constraint violations (e.g., email)
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('A user with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Finds a user by their email address.
   * @param email The email of the user to find.
   * @returns The found user object or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Deletes a user by their unique ID.
   * @param id The ID of the user to delete.
   * @returns A promise that resolves when the user has been deleted.
   * @throws {NotFoundException} If no user is found with the given ID.
   */
  async remove(id: string): Promise<void> {
    // First, confirm the user exists. This will throw an error if not found.
    await this.findOneOrFail(id);

    // If the user exists, proceed with deletion.
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
