import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class SectorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new sector.
   * @param createSectorDto The data for the new sector.
   * @returns The newly created sector object.
   * @throws {BadRequestException} If a sector with the same name already exists.
   */
  async create(createSectorDto: CreateSectorDto) {
    try {
      return await this.prisma.sector.create({
        data: createSectorDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' // Unique constraint violation
      ) {
        throw new BadRequestException(
          'A sector with this name already exists.',
        );
      }
      throw error;
    }
  }

  /**
   * Retrieves all sectors from the database.
   * @returns A promise that resolves to an array of all sector objects.
   */
  async findAll() {
    return this.prisma.sector.findMany();
  }

  async findOne(id: string) {
    try {
      return await this.prisma.sector.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Sector with ID "${id}" not found.`);
      }
      throw error;
    }
  }

  /**
   * Updates a sector's details by its unique ID.
   * @param id The ID of the sector to update.
   * @param updateSectorDto The data to update.
   * @returns The updated sector object.
   * @throws {NotFoundException} If no sector is found with the given ID.
   * @throws {BadRequestException} If the new name is already taken by another sector.
   */
  async update(id: string, updateSectorDto: UpdateSectorDto) {
    await this.findOne(id);

    try {
      return await this.prisma.sector.update({
        where: { id },
        data: updateSectorDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A sector with this name already exists.',
        );
      }
      throw error;
    }
  }

  /**
   * Deletes a sector by its unique ID.
   * @param id The ID of the sector to delete.
   * @returns The deleted sector object.
   * @throws {NotFoundException} If no sector is found with the given ID.
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.sector.delete({
      where: { id },
    });
  }
}
