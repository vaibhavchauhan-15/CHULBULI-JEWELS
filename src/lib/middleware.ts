import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { adminRateLimiter } from '@/lib/rateLimit'

/**
 * Enhanced auth middleware with rate limiting and better security
 */
export function authMiddleware(handler: Function, requireAdmin: boolean = true) {
  return async (request: NextRequest, ...args: any[]) => {
    // Apply rate limiting for admin routes
    const rateLimitResponse = adminRateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Try to get token from cookie first (preferred), then fallback to Authorization header
    let token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      // Fallback to Authorization header for backward compatibility
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check admin role if required
    if (requireAdmin && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Attach user info to request for handler to use
    (request as any).user = payload

    // Call the original handler
    return handler(request, ...args)
  }
}

/**
 * Optional auth middleware (doesn't require token but validates if present)
 */
export function optionalAuthMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Try cookie first, then Authorization header
    let token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        (request as any).user = payload
      }
    }

    return handler(request, ...args)
  }
}
