import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { User } from '../../generated/prisma/client';
import { JwtPayload } from '../types/jwt-payload.type';
import { UsersService } from '../../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UsersService,
  ) {
    const secret: string = config.get<string>('JWT_SECRET') as string;
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    };
    super(options);
  }

  /**
   * This method is called by the guard after the token has been verified.
   * It should return the user object to be attached to the request.
   * @param payload The decoded JWT payload.
   */
  async validate(payload: JwtPayload) {
    const user = await this.userService.findOneOrFail(payload.sub);

    return {
      id: user.id,
      role: user.role,
    };
  }
}
