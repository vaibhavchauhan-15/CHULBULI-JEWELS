import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { sanitizeProductData, safeParseFloat, safeParseInt } from '@/lib/validation'

async function handleGET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reviews: true },
        },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Admin products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeProductData(body)
    const { name, description, price, discount, category, stock, images, material, featured } = sanitizedData

    // Validate required fields
    if (!name || !description || price === undefined || !category || stock === undefined || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, category, stock, and at least one image' },
        { status: 400 }
      )
    }

    // Validate price
    if (price <= 0 || price > 1000000) {
      return NextResponse.json(
        { error: 'Price must be between 0 and 1,000,000' },
        { status: 400 }
      )
    }

    // Validate discount
    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        { error: 'Discount must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Validate stock
    if (stock < 0 || stock > 100000) {
      return NextResponse.json(
        { error: 'Stock must be between 0 and 100,000' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['earrings', 'necklaces', 'rings', 'bangles', 'sets']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate images
    if (images.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed per product' },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        discount,
        category,
        stock,
        images,
        material: material || null,
        featured: featured || false,
      },
    })

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export const GET = authMiddleware(handleGET)
export const POST = authMiddleware(handlePOST)
