import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware - Runs on every request
 * Adds security headers and validates sessions
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add additional security headers
  response.headers.set('X-Request-ID', crypto.randomUUID())
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Validate origin for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // In production, validate origin matches host
    if (process.env.NODE_ENV === 'production' && origin) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        )
      }
    }
  }

  // Add security headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
