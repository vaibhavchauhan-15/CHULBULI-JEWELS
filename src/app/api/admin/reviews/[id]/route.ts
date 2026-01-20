import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

async function handlePUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { approved } = await request.json()

    const review = await prisma.review.update({
      where: { id: params.id },
      data: { approved },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Review update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleDELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.review.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Review deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = authMiddleware(handlePUT)
export const DELETE = authMiddleware(handleDELETE)
