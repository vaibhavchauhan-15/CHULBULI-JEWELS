import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized Prisma Client configuration for Vercel serverless
// Using direct connection to Supabase (port 5432) for reliable serverless performance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Store in global to prevent creating new instances on hot reloads in dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
