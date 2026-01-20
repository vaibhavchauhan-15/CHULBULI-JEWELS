/**
 * Audit Logging System
 * Tracks security-relevant events and admin actions
 */

import { NextRequest } from 'next/server'

export enum AuditAction {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SIGNUP = 'SIGNUP',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // Admin actions
  ADMIN_PRODUCT_CREATE = 'ADMIN_PRODUCT_CREATE',
  ADMIN_PRODUCT_UPDATE = 'ADMIN_PRODUCT_UPDATE',
  ADMIN_PRODUCT_DELETE = 'ADMIN_PRODUCT_DELETE',
  ADMIN_ORDER_UPDATE = 'ADMIN_ORDER_UPDATE',
  ADMIN_REVIEW_APPROVE = 'ADMIN_REVIEW_APPROVE',
  ADMIN_REVIEW_REJECT = 'ADMIN_REVIEW_REJECT',
  ADMIN_REVIEW_DELETE = 'ADMIN_REVIEW_DELETE',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface AuditLog {
  timestamp: Date
  action: AuditAction
  level: AuditLevel
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  resourceId?: string
  metadata?: Record<string, any>
  message?: string
}

/**
 * Log an audit event
 */
export function logAuditEvent(
  action: AuditAction,
  level: AuditLevel,
  details: {
    userId?: string
    email?: string
    ip?: string
    userAgent?: string
    resourceId?: string
    metadata?: Record<string, any>
    message?: string
  } = {}
): void {
  const log: AuditLog = {
    timestamp: new Date(),
    action,
    level,
    ...details,
  }

  // In production, send to logging service (e.g., CloudWatch, Datadog)
  // For now, log to console with structured format
  const logLevel = level === AuditLevel.ERROR || level === AuditLevel.CRITICAL ? 'error' : 
                   level === AuditLevel.WARNING ? 'warn' : 'info'

  console[logLevel]('[AUDIT]', JSON.stringify(log, null, 2))

  // TODO: In production, implement:
  // - Send to centralized logging service
  // - Store critical events in database
  // - Alert on critical security events
  // - Implement log rotation and retention
}

/**
 * Extract request metadata for audit logging
 */
export function getRequestMetadata(request: NextRequest): {
  ip?: string
  userAgent?: string
} {
  return {
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        request.ip ||
        'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  }
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  action: AuditAction,
  email: string,
  request: NextRequest,
  success: boolean,
  userId?: string
): void {
  const metadata = getRequestMetadata(request)
  
  logAuditEvent(
    action,
    success ? AuditLevel.INFO : AuditLevel.WARNING,
    {
      email,
      userId,
      ...metadata,
      message: success ? `${action} successful` : `${action} failed`,
    }
  )
}

/**
 * Log admin action
 */
export function logAdminAction(
  action: AuditAction,
  userId: string,
  email: string,
  request: NextRequest,
  resourceId?: string,
  metadata?: Record<string, any>
): void {
  const requestMetadata = getRequestMetadata(request)
  
  logAuditEvent(
    action,
    AuditLevel.INFO,
    {
      userId,
      email,
      resourceId,
      metadata,
      ...requestMetadata,
      message: `Admin action: ${action}`,
    }
  )
}

/**
 * Log security event
 */
export function logSecurityEvent(
  action: AuditAction,
  request: NextRequest,
  message: string,
  level: AuditLevel = AuditLevel.WARNING
): void {
  const metadata = getRequestMetadata(request)
  
  logAuditEvent(
    action,
    level,
    {
      ...metadata,
      message,
    }
  )
}
