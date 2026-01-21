import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized Prisma Client configuration for Vercel serverless
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Prevent too many database connections in serverless
  // Each serverless function should have minimal connection pool
})

// Store in global to prevent creating new instances on hot reloads in dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown for serverless - disconnect after idle
// This prevents prepared statement conflicts
if (process.env.NODE_ENV === 'production') {
  // Set a timeout to disconnect after the function is idle
  // This ensures clean state for next invocation
  const disconnectTimeout = 5000 // 5 seconds
  let timeoutId: NodeJS.Timeout

  const scheduleDisconnect = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(async () => {
      try {
        await prisma.$disconnect()
      } catch (error) {
        console.error('Prisma disconnect error:', error)
      }
    }, disconnectTimeout)
  }

  // Intercept Prisma queries to reset the disconnect timer
  const originalQuery = prisma.$queryRaw.bind(prisma)
  prisma.$queryRaw = ((...args: any[]) => {
    scheduleDisconnect()
    return originalQuery(...args)
  }) as any
}
