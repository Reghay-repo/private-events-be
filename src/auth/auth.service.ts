import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // 1. Import ConfigService
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User, Role } from '../generated/prisma/client';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // 2. Inject ConfigService
  ) {}

  /**
   * Creates a new user and immediately generates a JWT for them.
   */
  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.createUser(createUserDto);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * The main login method. It takes user credentials, validates them,
   * and returns a token and user info if successful.
   * @param loginDto The user's login credentials (email and password).
   * @throws {UnauthorizedException} If credentials are invalid.
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
    // 1. Find the user by email and verify their password
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // 2. If validation fails, throw a standard 401 Unauthorized error
    if (!user) {
      throw new UnauthorizedException('Invalid credentials. Please try again.');
    }

    // 3. If validation succeeds, generate the token and response
    return this.generateTokenResponse(user);
  }

  /**
   * Generates a signed JWT with user details in the payload.
   * @param userId The user's ID.
   * @param email The user's email.
   * @param role The user's role.
   * @returns A promise that resolves to the signed JWT string.
   */
  private async signToken(
    userId: string,
    email: string,
    role: Role,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.signAsync(payload); // Uses global secret & expiry
  }

  /**
   * A private helper to generate the final response object (user DTO + token).
   * This avoids code duplication between login and register methods.
   */
  private async generateTokenResponse(
    user: User,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
    const accessToken = await this.signToken(user.id, user.email, user.role);
    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      user: userResponse,
      accessToken,
    };
  }

  /**
   * Finds a user by email and verifies their password.
   * This is intended for use by Passport's LocalStrategy.
   */
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordMatching = await argon2.verify(user.password, pass);
    if (isPasswordMatching) {
      return user;
    }

    return null;
  }
}
