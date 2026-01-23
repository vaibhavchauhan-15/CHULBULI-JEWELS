/**
 * Database Connection Test Script
 * Tests both pooled and direct database connections
 */

const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n')
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn', 'info'],
  })

  try {
    console.log('📡 Attempting to connect to database...')
    
    // Test connection with a simple query
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Test query execution
    console.log('\n📊 Testing query execution...')
    const userCount = await prisma.user.count()
    console.log(`✅ Query successful! Found ${userCount} users in database`)
    
    // Test database write
    console.log('\n📝 Testing database write capability...')
    const testWrite = await prisma.$executeRaw`SELECT 1 as test`
    console.log('✅ Database is writable!')
    
    console.log('\n🎉 All database tests passed!')
    console.log('✅ Database is fully operational')
    
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    console.error('Error details:', error.message)
    console.error('\nFull error:', error)
    
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Check if DATABASE_URL is correctly set in .env')
    console.log('2. Verify Supabase project is not paused (check Supabase dashboard)')
    console.log('3. Ensure you\'re using the Transaction Pooler URL (port 6543)')
    console.log('4. Check if your IP is allowed in Supabase (disable "Restrict to trusted IPs" or add your IP)')
    console.log('5. Verify the password is URL-encoded (@ becomes %40)')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Disconnected from database')
  }
}

testConnection()
