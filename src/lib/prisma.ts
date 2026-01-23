import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized Prisma Client configuration for Vercel serverless
// Using direct connection with statement_cache_size=0 to prevent prepared statement conflicts
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Graceful disconnect helper for serverless
// Helps prevent connection leaks in serverless environments
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Store in global to prevent creating new instances on hot reloads in dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
