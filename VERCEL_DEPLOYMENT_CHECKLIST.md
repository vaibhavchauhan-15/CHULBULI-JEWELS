# 🚀 VERCEL DEPLOYMENT CHECKLIST - DATABASE FIX

## ✅ Local Changes Complete

The following files have been updated and tested:

1. ✅ [.env](.env) - Updated with working direct connection + statement_cache_size=0
2. ✅ [src/lib/prisma.ts](src/lib/prisma.ts) - Simplified Prisma client configuration
3. ✅ Database connectivity - **TESTED AND WORKING** ✅

---

## 🎯 **CRITICAL: Update Vercel Environment Variables**

### **Step 1: Go to Vercel Dashboard**

1. Open https://vercel.com/dashboard
2. Select your project: **chulbuli-jewels**
3. Go to **Settings** → **Environment Variables**

### **Step 2: Update DATABASE_URL**

Find the existing `DATABASE_URL` variable and update it to:

```
postgresql://postgres:Khushi%4012353@db.piqjlpxozrwfilkpiomg.supabase.co:5432/postgres?sslmode=require&connect_timeout=10&statement_cache_size=0
```

**Key changes:**
- ✅ Uses direct connection (port 5432) - proven to work
- ✅ Adds `statement_cache_size=0` - prevents prepared statement conflicts
- ✅ Includes `connect_timeout=10` - prevents hanging connections

### **Step 3: Verify DIRECT_URL**

Make sure `DIRECT_URL` is set to:

```
postgresql://postgres:Khushi%4012353@db.piqjlpxozrwfilkpiomg.supabase.co:5432/postgres?sslmode=require
```

### **Step 4: Redeploy**

After updating the environment variables:

1. Click **"Redeploy"** button in Vercel (or push a new commit)
2. Wait for deployment to complete
3. Check deployment logs for any errors

---

## 🧪 **Testing Your Deployed App**

### Test 1: Signup Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Expected response:**
- ✅ Status 200: User created successfully
- ❌ Status 400: User already exists (if testing with same email)
- ❌ Status 500: Check logs - database connection issue

### Test 2: Via Browser

1. Go to: `https://your-app.vercel.app/signup`
2. Fill in the signup form
3. Submit
4. Open browser console (F12) and check for errors

### Test 3: Check Vercel Logs

1. Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Click **"View Function Logs"**
4. Look for any Prisma or database errors

---

## 🔍 **Troubleshooting**

### If signup still fails:

#### Error: "Can't reach database server"
- ❌ Environment variables not updated in Vercel
- ❌ Didn't click "Redeploy" after updating variables
- **Fix**: Double-check Vercel environment variables and redeploy

#### Error: "prepared statement already exists"
- ❌ Missing `statement_cache_size=0` in DATABASE_URL
- **Fix**: Ensure the DATABASE_URL in Vercel includes `statement_cache_size=0`

#### Error: "Connection timeout"
- ❌ Database is paused (Supabase free tier)
- **Fix**: Go to Supabase dashboard and resume the database

#### Error: "Authentication failed"
- ❌ Wrong password in DATABASE_URL
- **Fix**: Verify password is correctly URL-encoded (@ → %40)

---

## 📊 **What Changed and Why**

### Before (Not Working):
```env
# Missing statement_cache_size parameter
DATABASE_URL=postgresql://...?sslmode=require&connect_timeout=10
```

### After (Working):
```env
# Added statement_cache_size=0 for serverless compatibility
DATABASE_URL=postgresql://...?sslmode=require&connect_timeout=10&statement_cache_size=0
```

### Why `statement_cache_size=0` is Critical:

Vercel serverless functions reuse execution contexts, which can cause PostgreSQL prepared statements to conflict. Setting `statement_cache_size=0` disables prepared statement caching, preventing the error:

```
prepared statement "s1" already exists
```

---

## ✨ **Success Indicators**

You'll know it's working when:

1. ✅ No Prisma errors in Vercel function logs
2. ✅ Signup creates users successfully
3. ✅ Login works without connection errors
4. ✅ No "Can't reach database server" errors

---

## 📝 **Next Steps After Success**

Once everything is working:

1. ✅ Test all auth endpoints (signup, login, logout)
2. ✅ Test product endpoints
3. ✅ Test order creation
4. ✅ Monitor Vercel logs for any issues

### Optional: Upgrade to Connection Pooler

For better performance with high traffic:

1. Get Transaction Pooler URL from Supabase dashboard
2. Update DATABASE_URL to use pooler (port 6543)
3. Test thoroughly before deploying to production

---

## 🆘 **Need Help?**

If you encounter issues:

1. Check Vercel function logs first
2. Verify environment variables are exactly as specified
3. Ensure you clicked "Redeploy" after updating variables
4. Check that Supabase database is not paused

**Common mistake**: Forgetting to redeploy after updating environment variables!
