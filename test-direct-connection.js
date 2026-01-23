/**
 * Test Direct Database Connection (Port 5432)
 */

const { PrismaClient } = require('@prisma/client')

async function testDirectConnection() {
  console.log('🔍 Testing DIRECT Database Connection (Port 5432)...\n')
  
  // Use DIRECT_URL from .env
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DIRECT_URL,
      },
    },
  })

  try {
    console.log('📡 Attempting direct connection...')
    console.log(`URL: ${process.env.DIRECT_URL?.split('@')[1]?.split('?')[0]}`)
    
    await prisma.$connect()
    console.log('✅ Direct connection successful!')
    
    const userCount = await prisma.user.count()
    console.log(`✅ Found ${userCount} users in database`)
    
    console.log('\n✅ Database is accessible via direct connection!')
    console.log('⚠️  However, this is NOT recommended for Vercel serverless')
    console.log('💡 Next step: Configure Transaction Pooler correctly')
    
  } catch (error) {
    console.error('\n❌ Direct connection also failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 Database server is unreachable. Possible causes:')
      console.log('1. ⏸️  Database is PAUSED (Supabase free tier pauses after 7 days of inactivity)')
      console.log('2. 🔒 IP restriction is enabled (check Supabase project settings)')
      console.log('3. 🌐 Network/firewall issue')
      console.log('\n📱 Action required:')
      console.log('   → Go to https://supabase.com/dashboard')
      console.log('   → Find your project: piqjlpxozrwfilkpiomg')
      console.log('   → Check if it\'s paused and click "Resume" if needed')
      console.log('   → Go to Settings → Database → Connection Pooling to get correct URLs')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDirectConnection()
