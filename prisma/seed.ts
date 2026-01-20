import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await hashPassword('Admin@123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chulbulijewels.com' },
    update: {},
    create: {
      email: 'admin@chulbulijewels.com',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create sample customer
  const customerPassword = await hashPassword('customer123')
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Doe',
      password: customerPassword,
      role: 'customer',
    },
  })
  console.log('✅ Sample customer created:', customer.email)

  // Create sample products
  const products = [
    {
      name: 'Golden Hoop Earrings',
      description: 'Beautiful golden hoop earrings perfect for daily wear. Lightweight and comfortable.',
      price: 899,
      discount: 10,
      category: 'earrings',
      stock: 50,
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'],
      material: 'Gold Plated Brass',
      featured: true,
    },
    {
      name: 'Pearl Drop Earrings',
      description: 'Elegant pearl drop earrings that add sophistication to any outfit.',
      price: 1299,
      discount: 15,
      category: 'earrings',
      stock: 30,
      images: ['https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=500'],
      material: 'Sterling Silver with Pearls',
      featured: true,
    },
    {
      name: 'Delicate Chain Necklace',
      description: 'Minimalist gold chain necklace, perfect for layering or wearing alone.',
      price: 1599,
      discount: 0,
      category: 'necklaces',
      stock: 40,
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'],
      material: 'Gold Plated',
      featured: true,
    },
    {
      name: 'Statement Pendant Necklace',
      description: 'Bold and beautiful pendant necklace for special occasions.',
      price: 2499,
      discount: 20,
      category: 'necklaces',
      stock: 25,
      images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'],
      material: 'Rose Gold Plated',
      featured: true,
    },
    {
      name: 'Diamond-Cut Ring',
      description: 'Sparkling diamond-cut ring that catches the light beautifully.',
      price: 1799,
      discount: 10,
      category: 'rings',
      stock: 35,
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'],
      material: 'Sterling Silver',
      featured: true,
    },
    {
      name: 'Stackable Rings Set',
      description: 'Set of 3 delicate stackable rings that can be worn together or separately.',
      price: 1999,
      discount: 15,
      category: 'rings',
      stock: 45,
      images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500'],
      material: 'Mixed Metals',
      featured: false,
    },
    {
      name: 'Traditional Bangles Set',
      description: 'Set of 4 traditional bangles with intricate patterns.',
      price: 2999,
      discount: 10,
      category: 'bangles',
      stock: 20,
      images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'],
      material: 'Gold Plated Brass',
      featured: true,
    },
    {
      name: 'Complete Jewelry Set',
      description: 'Complete set including necklace, earrings, and bracelet.',
      price: 4999,
      discount: 25,
      category: 'sets',
      stock: 15,
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'],
      material: 'Rose Gold Plated',
      featured: true,
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }
  console.log(`✅ Created ${products.length} sample products`)

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
