# Security Quick Reference

## For Developers

### Making Authenticated API Calls

```typescript
// Always include credentials to send HTTP-only cookie
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Required!
  body: JSON.stringify(data),
})
```

### Adding CSRF Protection (Optional - For Enhanced Security)

```typescript
// Client-side: Get CSRF token from cookie
function getCsrfToken() {
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? match[1] : null
}

// Include in requests
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken(), // Add CSRF token
  },
  credentials: 'include',
  body: JSON.stringify(data),
})
```

### Password Validation

```typescript
import { validatePassword } from '@/lib/validation'

const result = validatePassword(password)
if (!result.valid) {
  // Show error: result.error
}
// Password strength score: result.strength (0-5)
```

### Adding Audit Logs

```typescript
import { logAdminAction, AuditAction } from '@/lib/auditLog'

// Log admin actions
logAdminAction(
  AuditAction.ADMIN_PRODUCT_DELETE,
  userId,
  email,
  request,
  productId
)
```

## Common Security Pitfalls to Avoid

### ❌ DON'T
```typescript
// Don't store tokens in localStorage
localStorage.setItem('token', token) // XSS vulnerability!

// Don't use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Don't skip credentials in fetch
fetch('/api/auth/endpoint') // Cookie won't be sent!

// Don't expose sensitive errors
throw new Error(\`User not found: \${email}\`) // User enumeration!
```

### ✅ DO
```typescript
// Use HTTP-only cookies (set by server)
response.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})

// Sanitize user input
import { sanitizeText } from '@/lib/validation'
const clean = sanitizeText(userInput)

// Always include credentials
fetch('/api/endpoint', { credentials: 'include' })

// Use generic error messages
return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
```

## Security Checklist for New Features

- [ ] Input validation on both client and server
- [ ] Rate limiting for sensitive endpoints
- [ ] Authentication required for protected routes
- [ ] CSRF token validation for state-changing operations
- [ ] Audit logging for sensitive actions
- [ ] Error messages don't leak information
- [ ] SQL injection prevented (use Prisma)
- [ ] XSS prevented (sanitize inputs)
- [ ] Proper authorization checks (user/admin)

## Testing Security

### Test Authentication
```bash
# Should fail without cookie
curl http://localhost:3000/api/orders

# Should succeed with valid session
curl http://localhost:3000/api/orders --cookie "auth_token=..."
```

### Test Rate Limiting
```bash
# Rapid requests should get rate limited
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Test CSRF Protection
```bash
# Should fail without CSRF token
curl -X POST http://localhost:3000/api/admin/products \\
  --cookie "auth_token=..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test"}'
```

## Emergency Procedures

### If JWT_SECRET is Compromised
1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update .env file with new JWT_SECRET
3. Restart application (all users logged out)
4. Notify users to login again

### If Rate Limit Attack Detected
- Check audit logs for attacker IP
- Consider temporary IP blocking
- Reduce rate limits if needed
- Monitor for distributed attacks

### If XSS Vulnerability Found
1. Identify the vulnerable input field
2. Add sanitization: `sanitizeText(input)`
3. Test thoroughly
4. Deploy immediately
5. Review similar code patterns

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/authentication)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
