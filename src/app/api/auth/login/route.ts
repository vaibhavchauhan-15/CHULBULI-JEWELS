import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { authRateLimiter } from '@/lib/rateLimit'
import { validateEmail } from '@/lib/validation'
import { logAuthEvent, AuditAction } from '@/lib/auditLog'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent brute force attacks
    const rateLimitResponse = authRateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      // Use generic error message to prevent email enumeration
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Find user - only select necessary fields
    const user = await prisma.user.findUnique({
      where: { email: emailValidation.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    })

    // Use same error message for both cases to prevent user enumeration
    if (!user) {
      logAuthEvent(AuditAction.LOGIN_FAILED, emailValidation.email, request, false)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password using constant-time comparison
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      logAuthEvent(AuditAction.LOGIN_FAILED, user.email, request, false, user.id)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate secure JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create response without password and without token in body
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set httpOnly cookie for security (XSS protection)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    // Log successful login
    logAuthEvent(AuditAction.LOGIN_SUCCESS, user.email, request, true, user.id)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    )
  }
}
