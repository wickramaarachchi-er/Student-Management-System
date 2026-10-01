/**
 * config/prisma.js
 * Singleton Prisma client instance shared across the application.
 * Do not instantiate PrismaClient elsewhere – import from here.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;
