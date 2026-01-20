import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sanitizeOrderData, validateEmail, validatePhoneNumber, validatePincode } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      userId,
    } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'All address fields are required' },
        { status: 400 }
      )
    }

    // Sanitize input data
    const sanitizedData = sanitizeOrderData({
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      items,
      userId,
    })

    // Validate email and phone format
    const emailValidation = validateEmail(sanitizedData.customerEmail)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const phoneValidation = validatePhoneNumber(sanitizedData.customerPhone)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      )
    }

    const pincodeValidation = validatePincode(sanitizedData.pincode)
    if (!pincodeValidation.valid) {
      return NextResponse.json(
        { error: pincodeValidation.error },
        { status: 400 }
      )
    }

    // Use database transaction to prevent race conditions
    const order = await prisma.$transaction(async (tx) => {
      let totalPrice = 0
      const orderItemsData = []

      // Validate stock and calculate prices atomically
      for (const item of items) {
        // Lock the product row for update to prevent race conditions
        // This ensures no other transaction can read/modify this row until we commit
        const product = await tx.$queryRaw<Array<{
          id: string;
          name: string;
          price: number;
          discount: number;
          stock: number;
        }>>`
          SELECT id, name, price, discount, stock
          FROM "Product"
          WHERE id = ${item.productId}
          FOR UPDATE
        `

        if (!product || product.length === 0) {
          throw new Error(`Product ${item.productId} not found`)
        }

        const productData = product[0]

        if (productData.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${productData.name}. Available: ${productData.stock}, Requested: ${item.quantity}`)
        }

        // Calculate price from current database values (prevent manipulation)
        const itemPrice = productData.price - (productData.price * productData.discount) / 100
        totalPrice += itemPrice * item.quantity

        orderItemsData.push({
          productId: productData.id,
          quantity: item.quantity,
          price: itemPrice,
        })

        // Decrement stock atomically with additional safety check
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }, // Double-check stock availability
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        // Verify the update succeeded
        if (updateResult.count === 0) {
          throw new Error(`Failed to update stock for ${productData.name}. Stock may have changed.`)
        }
      }

      // Round to 2 decimal places
      totalPrice = Math.round(totalPrice * 100) / 100

      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          userId: sanitizedData.userId || null,
          totalPrice,
          customerName: sanitizedData.customerName,
          customerEmail: emailValidation.email,
          customerPhone: sanitizedData.customerPhone,
          addressLine1: sanitizedData.addressLine1,
          addressLine2: sanitizedData.addressLine2,
          city: sanitizedData.city,
          state: sanitizedData.state,
          pincode: sanitizedData.pincode,
          status: 'placed',
          paymentMethod: 'cod',
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      })

      return newOrder
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Order creation error:', error)

    // Handle specific errors
    if (error.message?.includes('Insufficient stock')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: payload.userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
