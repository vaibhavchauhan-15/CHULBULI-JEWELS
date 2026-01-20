import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sanitizeReviewData } from '@/lib/validation'
import { apiRateLimiter } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = apiRateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to submit a review' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Sanitize input to prevent XSS
    const sanitizedData = sanitizeReviewData(body)
    const { productId, rating, comment } = sanitizedData

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate comment length
    if (comment.length < 10 || comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be between 10 and 1000 characters' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user has purchased this product (verified buyer)
    const order = await prisma.order.findFirst({
      where: {
        userId: payload.userId,
        orderItems: {
          some: {
            productId,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'You can only review products you have purchased' },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: payload.userId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Create review with sanitized data
    const review = await prisma.review.create({
      data: {
        productId,
        userId: payload.userId,
        rating,
        comment,
        approved: false, // Requires admin approval to prevent spam
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully. It will be visible after admin approval.',
    })
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit review. Please try again.' },
      { status: 500 }
    )
  }
}
