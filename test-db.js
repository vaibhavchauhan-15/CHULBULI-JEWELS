// Quick test script to verify database connection
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing database connection...')
    
    // Test connection by counting users
    const userCount = await prisma.user.count()
    console.log(`✓ Database connected successfully!`)
    console.log(`✓ Found ${userCount} users in database`)
    
    // List all users (without passwords)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log('\nExisting users:')
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`)
    })
    
  } catch (error) {
    console.error('✗ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
