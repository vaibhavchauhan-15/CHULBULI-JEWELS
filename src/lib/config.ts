/**
 * Environment Configuration & Validation
 * Validates all required environment variables on application startup
 */

interface EnvConfig {
  DATABASE_URL: string
  JWT_SECRET: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  NODE_ENV: string
  CSRF_SECRET?: string
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const

/**
 * Validates all required environment variables
 * @throws Error if any required variable is missing
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\n` +
        'Please create a .env file with all required variables.'
    )
  }

  // Additional validation for JWT_SECRET
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security.\n' +
        'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CSRF_SECRET: process.env.CSRF_SECRET,
  }
}

// Validate on module load (only on server)
let config: EnvConfig | null = null

export function getConfig(): EnvConfig {
  if (!config && typeof window === 'undefined') {
    config = validateEnv()
  }
  return config!
}

// Security configuration constants
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: false, // Keep false for MVP user-friendliness

  // JWT settings
  JWT_EXPIRY: '7d',
  JWT_REFRESH_THRESHOLD: '1d',

  // Rate limiting
  AUTH_RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX: 5, // 5 attempts per window
  API_RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  API_RATE_LIMIT_MAX: 100, // 100 requests per minute

  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  // Validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
} as const
