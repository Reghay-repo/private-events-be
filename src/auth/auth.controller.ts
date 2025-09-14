import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user registration.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered and logged in.',
    schema: {
      properties: {
        user: { $ref: '#/components/schemas/UserResponseDto' },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., email already exists).',
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /**
   * Handles user Login.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in.',
    schema: {
      properties: {
        user: { $ref: '#/components/schemas/UserResponseDto' },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (invalid credentials).',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate password reset' })
  @ApiResponse({
    status: 200,
    description:
      'If an account with this email exists, a reset link will be sent.',
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    // This will be implemented later in the AuthService
    // return this.authService.forgotPassword(forgotPasswordDto);
    return {
      dto: forgotPasswordDto,
      message:
        'If an account with this email exists, a password reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password successfully reset.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., invalid token).',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    // This will be implemented later in the AuthService
    // return this.authService.resetPassword(resetPasswordDto);
    return {
      message: 'Password has been successfully reset.',
      dto: resetPasswordDto,
    };
  }

  // @Get('profile')
  // @UseGuards(AuthGuard('jwt')) // Protect this route with the JWT strategy
  // @ApiBearerAuth() // Tells Swagger that this endpoint needs a bearer token
  // @ApiOperation({ summary: 'Get the current logged-in user profile' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The user profile.',
  // })
  // @ApiResponse({ status: 401, description: 'Unauthorized.' })
  // getProfile(@Request() req) {
  //   // The JWT strategy will validate the token and attach the user payload
  //   // to the request object.
  //   return req.user;
  // }
}
