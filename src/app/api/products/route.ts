import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimiter } from '@/lib/rateLimit'
import { safeParseFloat } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting to prevent abuse
    const rateLimitResponse = apiRateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'latest'
    const featured = searchParams.get('featured')

    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        const min = safeParseFloat(minPrice, 0)
        if (isNaN(min) || min < 0) {
          return NextResponse.json(
            { error: 'Invalid minPrice parameter' },
            { status: 400 }
          )
        }
        where.price.gte = min
      }
      if (maxPrice) {
        const max = safeParseFloat(maxPrice, 0)
        if (isNaN(max) || max < 0) {
          return NextResponse.json(
            { error: 'Invalid maxPrice parameter' },
            { status: 400 }
          )
        }
        where.price.lte = max
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    let orderBy: any = { createdAt: 'desc' }

    if (sort === 'price-asc') {
      orderBy = { price: 'asc' }
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          where: { approved: true },
          select: { rating: true },
        },
      },
    })

    // Calculate average rating for each product
    const productsWithRating = products.map((product: any) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
          : 0

      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      }
    })

    return NextResponse.json(productsWithRating)
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
