import { PrismaClient } from '@prisma/client';

/** Single shared Prisma instance (imported by the app and the admin router). */
export const prisma = new PrismaClient();
