import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { sanitizeProductData } from '@/lib/validation'

async function handlePUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeProductData(body)
    const { name, description, price, discount, category, stock, images, material, featured } = sanitizedData

    // Validate stock cannot be negative
    if (stock < 0 || stock > 100000) {
      return NextResponse.json(
        { error: 'Stock must be between 0 and 100,000' },
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = await prisma.product.update({
      where: { id: params.id },
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
    })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

async function handleDELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if product has existing orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: params.id },
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete product. It exists in ${orderCount} order(s). Consider marking it as out of stock instead.`,
          orderCount,
          suggestion: 'Set stock to 0 instead of deleting'
        },
        { status: 400 }
      )
    }

    // Delete product (cascade will handle reviews automatically)
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    })
  } catch (error) {
    console.error('Product deletion error:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

export const PUT = authMiddleware(handlePUT)
export const DELETE = authMiddleware(handleDELETE)
