/**
 * Rate Limiting Utilities
 * Protects against brute force and DDoS attacks
 */

import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent, AuditAction, AuditLevel } from './auditLog'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}

/**
 * Clean up expired rate limit entries (runs periodically)
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}

// Cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}

/**
 * Get client identifier (IP address or fallback)
 */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  return ip
}

/**
 * Rate limit middleware
 */
export function rateLimit(options: {
  windowMs: number
  max: number
  message?: string
  keyPrefix?: string
}) {
  return (request: NextRequest): NextResponse | null => {
    const identifier = getClientIdentifier(request)
    const key = `${options.keyPrefix || 'rl'}:${identifier}`
    const now = Date.now()

    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + options.windowMs,
      }
      return null // Allow request
    }

    rateLimitStore[key].count++

    if (rateLimitStore[key].count > options.max) {
      const resetIn = Math.ceil((rateLimitStore[key].resetTime - now) / 1000)
      
      // Log rate limit exceeded
      logSecurityEvent(
        AuditAction.RATE_LIMIT_EXCEEDED,
        request,
        `Rate limit exceeded for ${key}. Attempts: ${rateLimitStore[key].count}`,
        AuditLevel.WARNING
      )
      
      return NextResponse.json(
        {
          error: options.message || 'Too many requests, please try again later',
          retryAfter: resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': options.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitStore[key].resetTime.toString(),
          },
        }
      )
    }

    return null // Allow request
  }
}

/**
 * Auth rate limiter (stricter limits)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  keyPrefix: 'auth',
})

/**
 * API rate limiter (general)
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  keyPrefix: 'api',
})

/**
 * Admin rate limiter (moderate limits)
 */
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many admin requests. Please slow down.',
  keyPrefix: 'admin',
})
