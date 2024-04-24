import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '@prisma/client';

export const RequiredRole = (role: UserRoles) => SetMetadata('role', role);
