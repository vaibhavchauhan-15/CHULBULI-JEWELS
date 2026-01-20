import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

async function handleGET(request: NextRequest) {
  try {
    // Get total sales
    const orders = await prisma.order.findMany({
      select: { totalPrice: true, createdAt: true },
    })

    const totalSales = orders.reduce((sum: number, order: { totalPrice: number }) => sum + order.totalPrice, 0)
    const totalOrders = orders.length

    // Get today's sales
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = orders.filter((order: { createdAt: Date }) => order.createdAt >= today)
    const todaySales = todayOrders.reduce((sum: number, order: { totalPrice: number }) => sum + order.totalPrice, 0)

    // Get this month's sales
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthOrders = orders.filter((order: { createdAt: Date }) => order.createdAt >= firstDayOfMonth)
    const monthSales = monthOrders.reduce((sum: number, order: { totalPrice: number }) => sum + order.totalPrice, 0)

    // Get best selling products
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { productId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const bestSellingProducts = await Promise.all(
      orderItems.map(async (item: { productId: string; _sum: { quantity: number | null } }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, images: true, price: true },
        })
        return {
          ...product,
          totalSold: item._sum.quantity,
        }
      })
    )

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 10 } },
      select: { id: true, name: true, stock: true, images: true },
      orderBy: { stock: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      totalSales,
      totalOrders,
      todaySales,
      monthSales,
      bestSellingProducts,
      lowStockProducts,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = authMiddleware(handleGET)
