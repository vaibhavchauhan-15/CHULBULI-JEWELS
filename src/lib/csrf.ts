/**
 * CSRF Token Generation and Validation
 * Protects against Cross-Site Request Forgery attacks for cookie-based authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getConfig } from './config'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Set CSRF token as a cookie in the response
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to client JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

/**
 * Get CSRF token from request
 */
export function getCsrfToken(request: NextRequest): string | null {
  // Check header first (for fetch requests)
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (headerToken) return headerToken

  // Fallback to cookie (for form submissions)
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // GET, HEAD, OPTIONS requests don't need CSRF protection
  const method = request.method
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const requestToken = getCsrfToken(request)

  if (!cookieToken || !requestToken) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(requestToken)
  )
}

/**
 * CSRF validation middleware
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null
  }

  if (!validateCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token. Please refresh the page and try again.' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Add CSRF token to API response
 */
export function addCsrfToken(response: NextResponse): NextResponse {
  const token = generateCsrfToken()
  setCsrfCookie(response, token)
  
  // Also include in response body for convenience
  const responseData = response.json()
  responseData.then(data => {
    if (typeof data === 'object' && data !== null) {
      data.csrfToken = token
    }
  })
  
  return response
}
