import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { authRateLimiter } from '@/lib/rateLimit'
import { validateEmail, validatePassword, sanitizeText } from '@/lib/validation'
import { logAuthEvent, AuditAction } from '@/lib/auditLog'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = authRateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()
    
    // Explicitly only accept these fields (prevent role injection)
    const allowedFields = ['name', 'email', 'password']
    const providedFields = Object.keys(body)
    const extraFields = providedFields.filter(field => !allowedFields.includes(field))
    
    if (extraFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields provided: ${extraFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    const { name, email, password } = body

    // Validate all required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required (name, email, password)' },
        { status: 400 }
      )
    }

    // Sanitize and validate name
    const sanitizedName = sanitizeText(name)
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      )
    }

    // Validate and sanitize email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailValidation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password with secure algorithm
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: emailValidation.email,
        password: hashedPassword,
        role: 'customer',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate secure JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create response without token in body
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )

    // Set httpOnly cookie for security (XSS protection)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    // Log successful signup
    logAuthEvent(AuditAction.SIGNUP, user.email, request, true, user.id)

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    )
  }
}
