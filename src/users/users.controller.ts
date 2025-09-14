import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  findAll(): Promise<User[] | null> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a single user by their unique ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'User found and returned.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOneOrFail(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates and returns a new user.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id') // 3. Use @Patch decorator for partial updates
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto, // 4. Use the new DTO
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(id, updateUserDto); // 5. Call the service method
    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Deletes a user by their unique ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
