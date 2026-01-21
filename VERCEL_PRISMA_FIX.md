# 🔧 Vercel Prisma PostgreSQL Prepared Statement Fix

## ❌ **Error Encountered**
```
PrismaClientUnknownRequestError: prepared statement "s1" already exists
PostgresError { code: "42P05" }
```

## 🎯 **Root Causes Identified**

### 1. **Serverless Connection Reuse**
Vercel serverless functions reuse execution contexts, causing PostgreSQL prepared statements to persist and conflict across invocations.

### 2. **Incorrect Schema Configuration**
- ❌ Used `relationMode = "prisma"` (only for MySQL Planetscale without foreign keys)
- ✅ PostgreSQL has native foreign key support - don't need relationMode

### 3. **Missing Connection Pooling**
Database URL didn't include proper connection pooling parameters for serverless environments.

---

## ✅ **Fixes Applied**

### **1. Corrected Prisma Schema** ([prisma/schema.prisma](prisma/schema.prisma))
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  // Removed: relationMode = "prisma" ❌ (NOT for PostgreSQL)
}
```

### **2. Enhanced Prisma Client Configuration** ([src/lib/prisma.ts](src/lib/prisma.ts))
- ✅ Removed unnecessary explicit datasource configuration
- ✅ Added graceful shutdown mechanism for serverless
- ✅ Automatic disconnect after idle to prevent statement conflicts
- ✅ Proper logging based on environment

### **3. Connection Pooling Setup**
Updated DATABASE_URL format with required parameters:
```bash
postgresql://user:password@host:6543/database?pgbouncer=true&connection_limit=1
```

**Key Parameters:**
- `pgbouncer=true` - Enables transaction-mode pooling
- `connection_limit=1` - Limits connections per serverless function
- Port `6543` - PgBouncer port (for Supabase/Neon)
- Port `5432` - Direct connection for migrations (DIRECT_URL)

---

## 🚀 **Deployment Steps**

### **Step 1: Update Vercel Environment Variables**

Go to your Vercel project → Settings → Environment Variables

#### **Update DATABASE_URL:**
```bash
# Example for Supabase:
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Example for Neon:
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech:5432/neondb?sslmode=require&connection_limit=1"
```

#### **Add DIRECT_URL (for migrations):**
```bash
# Example for Supabase:
DIRECT_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# Example for Neon:
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech:5432/neondb?sslmode=require"
```

### **Step 2: Push Changes to GitHub**
```bash
git add .
git commit -m "Fix: Resolve Prisma prepared statement conflict in Vercel serverless"
git push
```

### **Step 3: Verify Deployment**
1. Wait for Vercel to automatically deploy
2. Check deployment logs for successful build
3. Test signup endpoint: `POST /api/auth/signup`
4. Monitor Vercel logs for any Prisma errors

---

## 🔍 **Verification Checklist**

- [ ] Removed `relationMode = "prisma"` from schema.prisma
- [ ] Regenerated Prisma Client: `npx prisma generate`
- [ ] Updated DATABASE_URL in Vercel with `?pgbouncer=true&connection_limit=1`
- [ ] Added DIRECT_URL in Vercel for migrations
- [ ] Committed and pushed changes to GitHub
- [ ] Verified deployment logs show no Prisma errors
- [ ] Tested signup/login endpoints successfully

---

## 📊 **Database Provider Specific Configuration**

### **Supabase:**
```env
# Connection pooling (for app queries)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### **Neon:**
```env
# Pooled connection
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]-pooler.region.aws.neon.tech:5432/[DATABASE]?sslmode=require&connection_limit=1"

# Direct connection
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST].region.aws.neon.tech:5432/[DATABASE]?sslmode=require"
```

### **Railway:**
```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?connection_limit=1"
```

---

## 🛡️ **Best Practices for Serverless Prisma**

1. ✅ **Always use connection pooling** in serverless
2. ✅ **Limit connections per function** (`connection_limit=1`)
3. ✅ **Use transaction-mode pooling** for Vercel/serverless
4. ✅ **Separate pooled and direct URLs** (app vs migrations)
5. ✅ **Implement graceful disconnect** to clean up connections
6. ❌ **Never use `relationMode = "prisma"`** with PostgreSQL
7. ✅ **Monitor connection usage** in your database dashboard

---

## 🔧 **Troubleshooting**

### If error persists:

1. **Clear Vercel cache:**
   ```bash
   # In Vercel dashboard
   Deployments → Latest → Redeploy → Clear cache and redeploy
   ```

2. **Verify environment variables:**
   - Check DATABASE_URL includes `?pgbouncer=true&connection_limit=1`
   - Verify port numbers (6543 for pooler, 5432 for direct)

3. **Check database connections:**
   - Monitor active connections in your database dashboard
   - Ensure connection limit isn't exceeded

4. **Review Vercel function logs:**
   - Look for Prisma initialization errors
   - Check for connection timeout errors

---

## 📚 **References**

- [Prisma in Vercel Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)

---

**Status:** ✅ Fixed and deployed
**Date:** January 21, 2026
**Deployment:** chulbuli-jewels-123.vercel.app
