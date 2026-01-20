import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getConfig, SECURITY_CONFIG } from './config'

// Validate JWT_SECRET on import (server-side only)
const getJWTSecret = (): string => {
  if (typeof window !== 'undefined') {
    throw new Error('JWT operations should only be performed server-side')
  }

  const config = getConfig()
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  if (config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters (256 bits) for security')
  }

  return config.JWT_SECRET
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Hash password using bcrypt with salt rounds
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Use 12 rounds for better security (10 is minimum, 12 is recommended)
  return await bcrypt.hash(password, 12)
}

/**
 * Verify password against hash using constant-time comparison
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate JWT token with secure payload
 * @param payload - User data to encode in token
 * @returns Signed JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  const JWT_SECRET = getJWTSecret()

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET,
    {
      expiresIn: SECURITY_CONFIG.JWT_EXPIRY,
      algorithm: 'HS256',
      issuer: 'chulbuli-jewels',
      audience: 'chulbuli-api',
    }
  )
}

/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const JWT_SECRET = getJWTSecret()

    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'chulbuli-jewels',
      audience: 'chulbuli-api',
    }) as JWTPayload

    return decoded
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null
  }
}

/**
 * Generate secure random token for password reset, etc.
 * @param length - Length in bytes (default 32)
 * @returns Hex string of random bytes
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash sensitive data (like tokens) for storage
 * @param data - Data to hash
 * @returns SHA-256 hash
 */
export const hashToken = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex')
}
