# Security Implementation Guide

## Overview
This document outlines the comprehensive security measures implemented in the Chulbuli Jewels e-commerce platform.

## Authentication & Authorization

### HTTP-Only Cookie Authentication
- **Implementation**: JWT tokens stored in secure HTTP-only cookies
- **Benefits**: Protection against XSS attacks, tokens not accessible to JavaScript
- **Cookie Settings**:
  - `httpOnly: true` - Prevents JavaScript access
  - `secure: true` (production) - HTTPS only
  - `sameSite: 'strict'` - CSRF protection
  - `maxAge: 7 days` - Session duration

### Password Security
- **Minimum Length**: 8 characters
- **Requirements**:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Special characters (recommended)
- **Common Password Prevention**: Blocks 40+ commonly used passwords
- **Hashing**: bcrypt with 12 salt rounds
- **Strength Scoring**: Real-time password strength calculation (0-5 scale)

### Rate Limiting
- **Authentication Routes**: 5 attempts per 15 minutes
- **API Routes**: 100 requests per minute
- **Admin Routes**: Enhanced rate limiting
- **Features**: Automatic cleanup, per-IP tracking, retry-after headers

## Cross-Site Request Forgery (CSRF) Protection

### CSRF Token System
- **Location**: `src/lib/csrf.ts`
- **Token Generation**: 32-byte cryptographically secure random tokens
- **Validation**: Constant-time comparison to prevent timing attacks
- **Storage**: Cookie + request header
- **Protected Methods**: POST, PUT, DELETE, PATCH
- **Exempt Methods**: GET, HEAD, OPTIONS

### Usage
```typescript
import { validateCsrfToken, generateCsrfToken } from '@/lib/csrf'

// Server-side validation
if (!validateCsrfToken(request)) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
}

// Client-side: Include in fetch requests
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCsrfToken(),
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})
```

## Request Origin Validation

### Implementation
- **Location**: `middleware.ts` (root level)
- **Validation**: Ensures request origin matches host for state-changing requests
- **Environment**: Enforced in production only
- **Protection**: Prevents unauthorized cross-origin requests

## Security Headers

### Configured Headers (next.config.js)
- **Strict-Transport-Security**: Forces HTTPS (63072000 seconds)
- **X-Frame-Options**: SAMEORIGIN (clickjacking protection)
- **X-Content-Type-Options**: nosniff (MIME sniffing protection)
- **X-XSS-Protection**: Enabled with blocking mode
- **Content-Security-Policy**: Restrictive CSP rules
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Blocks unnecessary permissions

### Runtime Headers (middleware.ts)
- **X-Request-ID**: Unique request tracking
- **X-DNS-Prefetch-Control**: Disabled
- **X-Download-Options**: noopen
- **X-Permitted-Cross-Domain-Policies**: none

## Input Validation & Sanitization

### Email Validation
- Format validation using regex
- Conversion to lowercase
- Maximum length: 255 characters
- XSS prevention via DOMPurify

### Phone Number Validation
- Format: 10-digit Indian numbers
- Regex: `/^[0-9]{10}$/`

### Text Sanitization
- HTML stripping using DOMPurify
- Whitespace trimming
- Length constraints enforced

### File Upload Security
- **Max Size**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Validation**: Server-side MIME type checking
- **Storage**: Cloudinary (external secure storage)

## Audit Logging

### Logged Events
**Authentication:**
- Login success/failure
- Signup
- Logout
- Invalid token attempts

**Admin Actions:**
- Product CRUD operations
- Order status updates
- Review approvals/rejections

**Security Events:**
- Rate limit exceeded
- CSRF token validation failures
- Unauthorized access attempts

### Log Format
```json
{
  "timestamp": "2026-01-20T10:30:00Z",
  "action": "LOGIN_FAILED",
  "level": "WARNING",
  "userId": "uuid",
  "email": "user@example.com",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "message": "Login attempt failed"
}
```

### Future Enhancements
- Integration with CloudWatch/Datadog
- Database storage for critical events
- Real-time alerting for security incidents
- Log retention policies

## API Security

### Protected Routes
All routes under `/api/admin/*` require:
1. Valid authentication token (HTTP-only cookie)
2. Admin role verification
3. Rate limiting
4. CSRF token (for state-changing requests)

### Middleware Stack
```typescript
Request → Rate Limiter → CSRF Validator → Auth Middleware → Route Handler
```

## Database Security

### Prisma Best Practices
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **Password Storage**: Never stored in plain text (bcrypt hashing)
- **Selective Field Queries**: Only fetch necessary fields
- **Transaction Safety**: Atomic operations for critical updates
- **Connection Security**: Encrypted PostgreSQL connection

### Data Sanitization
- All user inputs sanitized before database operations
- XSS prevention via DOMPurify
- Type validation via Zod schemas

## Environment Variables

### Required Variables
```env
DATABASE_URL=            # PostgreSQL connection string
JWT_SECRET=              # Minimum 32 characters (256 bits)
CLOUDINARY_CLOUD_NAME=   # For image uploads
CLOUDINARY_API_KEY=      # Cloudinary authentication
CLOUDINARY_API_SECRET=   # Cloudinary authentication
NODE_ENV=                # development | production
```

### Security Requirements
- JWT_SECRET minimum 32 characters
- All secrets stored in .env (never committed)
- Production secrets rotated regularly

## Frontend Security

### XSS Prevention
- React's automatic escaping
- DOMPurify for user-generated content
- No `dangerouslySetInnerHTML` usage
- Sanitized data from API responses

### Secure Communication
- All API calls use `credentials: 'include'`
- HTTPS enforced in production
- No sensitive data in localStorage
- Secure cookie handling

## Deployment Security Checklist

### Pre-Production
- [ ] All environment variables set
- [ ] HTTPS certificate configured
- [ ] JWT_SECRET is 32+ characters
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] CSRF protection active

### Production
- [ ] NODE_ENV=production
- [ ] Secure cookies enabled
- [ ] Error messages generic (no stack traces)
- [ ] Audit logging to external service
- [ ] Security headers verified
- [ ] CORS properly configured

### Monitoring
- [ ] Failed login attempt tracking
- [ ] Rate limit violation alerts
- [ ] Unusual activity detection
- [ ] Regular security audits
- [ ] Dependency vulnerability scans

## Incident Response

### Security Breach Protocol
1. **Immediate Actions**:
   - Rotate all secrets (JWT_SECRET, API keys)
   - Force logout all users
   - Review audit logs
   
2. **Investigation**:
   - Identify attack vector
   - Assess data exposure
   - Document timeline
   
3. **Remediation**:
   - Patch vulnerabilities
   - Notify affected users (if required)
   - Update security measures
   
4. **Post-Mortem**:
   - Root cause analysis
   - Process improvements
   - Team training

## Security Testing

### Recommended Tools
- **OWASP ZAP**: Automated security testing
- **npm audit**: Dependency vulnerability scanning
- **Snyk**: Continuous security monitoring
- **Lighthouse**: Security audit

### Regular Testing
- Weekly: `npm audit`
- Monthly: Penetration testing
- Quarterly: Security code review
- Annually: Third-party security audit

## Compliance

### Data Protection
- User passwords never stored in plain text
- PII encrypted at rest (database level)
- Secure data transmission (HTTPS)
- Right to data deletion implemented

### Best Practices Followed
- OWASP Top 10 protections
- PCI DSS guidelines (if handling cards)
- GDPR considerations (if EU users)
- Industry standard authentication

## Contact

For security concerns or to report vulnerabilities:
- Email: security@chulbulijewels.com
- Response Time: Within 24 hours
- Bug Bounty: [If applicable]

---

**Last Updated**: January 20, 2026
**Version**: 1.0
**Maintained By**: Development Team
