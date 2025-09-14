import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address of the user who forgot their password.',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
