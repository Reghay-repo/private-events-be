// src/auth/types/jwt-payload.type.ts
import { Role } from '../../generated/prisma/client';

export type JwtPayload = {
  sub: string; // The user's ID
  email?: string;
  role: Role;
  // iat and exp are automatically added by JWT service
  iat?: number;
  exp?: number;
};
