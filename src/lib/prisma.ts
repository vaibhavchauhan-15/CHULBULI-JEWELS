import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Critical: Ensure DATABASE_URL has statement_cache_size=0 for serverless
// This prevents "prepared statement already exists" errors
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  // Verify critical parameters are present in production
  if (process.env.NODE_ENV === 'production') {
    if (!url.includes('statement_cache_size=0')) {
      console.warn(
        '⚠️  WARNING: DATABASE_URL missing statement_cache_size=0 parameter.\n' +
        'This may cause "prepared statement already exists" errors in serverless.\n' +
        'Add: &statement_cache_size=0 to your DATABASE_URL'
      )
    }
  }
  
  return url
}

// Optimized Prisma Client configuration for Vercel serverless
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Store in global to prevent creating new instances on hot reloads in dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
