import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';

export const prisma = new PrismaClient();
export const adapter = new PrismaAdapter(prisma.session, prisma.user);
