import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { logAuthEvent, AuditAction } from '@/lib/auditLog'

// Force Node.js runtime for compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Logout endpoint - clears the auth cookie
 */
export async function POST(request: NextRequest) {
  // Get user info before clearing token
  const token = request.cookies.get('auth_token')?.value
  let userId: string | undefined
  let email: string | undefined
  
  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      userId = payload.userId
      email = payload.email
    }
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })

  // Clear the auth cookie
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  })

  // Log logout event
  if (email) {
    logAuthEvent(AuditAction.LOGOUT, email, request, true, userId)
  }

  return response
}
