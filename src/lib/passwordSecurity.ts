/**
 * Common weak passwords list
 * Source: Most common passwords from data breach compilations
 */
export const COMMON_PASSWORDS = new Set([
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  '111111',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
  'welcome',
  'jesus',
  'ninja',
  'mustang',
  'password1',
  '123456789',
  'admin',
  'root',
  'toor',
  'pass',
  'test',
  'guest',
  'info',
  'administrator',
  'changeme',
  'default',
])

/**
 * Check if password is commonly used
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase())
}

/**
 * Calculate password strength score (0-5)
 */
export function calculatePasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
    feedback.push('✓ Mixed case')
  } else {
    feedback.push('✗ Add both uppercase and lowercase letters')
  }

  if (/\d/.test(password)) {
    score++
    feedback.push('✓ Contains numbers')
  } else {
    feedback.push('✗ Add numbers')
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
    feedback.push('✓ Contains special characters')
  } else {
    feedback.push('Consider adding special characters')
  }

  // Common password check
  if (isCommonPassword(password)) {
    score = Math.max(0, score - 3)
    feedback.push('✗ This is a commonly used password')
  }

  // Sequential characters check
  if (/012|123|234|345|456|567|678|789|890/.test(password) ||
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    score = Math.max(0, score - 1)
    feedback.push('✗ Avoid sequential characters')
  }

  // Repeated characters check
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1)
    feedback.push('✗ Avoid repeated characters')
  }

  return {
    score: Math.min(5, score),
    feedback,
  }
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): {
  label: string
  color: string
} {
  if (score <= 1) return { label: 'Very Weak', color: 'red' }
  if (score === 2) return { label: 'Weak', color: 'orange' }
  if (score === 3) return { label: 'Fair', color: 'yellow' }
  if (score === 4) return { label: 'Strong', color: 'lightgreen' }
  return { label: 'Very Strong', color: 'green' }
}
