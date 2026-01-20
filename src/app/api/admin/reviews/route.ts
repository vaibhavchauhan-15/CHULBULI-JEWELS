import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

async function handleGET(request: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        product: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Admin reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = authMiddleware(handleGET)
