// src/auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../types/role.enum';
import type { Request } from 'express';

interface AppRequest extends Request {
  user?: { id?: string; role?: Role };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<AppRequest>();
    const userRole = req.user?.role;
    console.log('required:', required, 'user:', req.user);
    return userRole !== undefined && required.includes(userRole);
  }
}
