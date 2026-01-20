# Deploying Chulbuli Jewels to Vercel

This guide will help you deploy your Chulbuli Jewels e-commerce website to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A PostgreSQL database (Supabase, Neon, or Railway recommended)
- A Cloudinary account for image hosting

## Step 1: Prepare Your Database

1. **Create a PostgreSQL database** using one of these providers:
   - [Supabase](https://supabase.com) (Recommended)
   - [Neon](https://neon.tech)
   - [Railway](https://railway.app)

2. **Get your database connection string** in this format:
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```

## Step 2: Setup Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Generate Secrets

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated string - you'll need it for the JWT_SECRET.

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Push your code to GitHub** (if not already done)

2. **Go to [vercel.com](https://vercel.com)** and click "Add New Project"

3. **Import your repository**

4. **Configure Environment Variables** - Add these in the Vercel dashboard:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your_64_character_hex_string_from_step_3
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

5. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Add environment variables:**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add NODE_ENV
```

5. **Deploy to production:**
```bash
vercel --prod
```

## Step 5: Run Database Migrations

After deployment, you need to run Prisma migrations:

1. **Install Prisma CLI** (if not already installed):
```bash
npm install -g prisma
```

2. **Run migrations** against your production database:
```bash
DATABASE_URL="your_production_database_url" npx prisma migrate deploy
```

3. **Generate Prisma Client:**
```bash
DATABASE_URL="your_production_database_url" npx prisma generate
```

## Step 6: Seed the Database (Optional)

If you want to add sample data:

```bash
DATABASE_URL="your_production_database_url" npx prisma db seed
```

## Step 7: Verify Deployment

1. Visit your deployed site (e.g., `https://your-project.vercel.app`)
2. Test the following:
   - ✅ Homepage loads
   - ✅ Products page displays
   - ✅ User signup/login works
   - ✅ Cart functionality
   - ✅ Checkout process
   - ✅ Admin login (if you created an admin user)

## Important Security Notes

⚠️ **Never commit `.env` files to version control**

✅ **Use different credentials for development and production**

✅ **Rotate your JWT_SECRET periodically**

✅ **Enable 2FA on your Vercel account**

✅ **Set up proper database backups**

## Custom Domain (Optional)

To add a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your domain and follow DNS configuration instructions

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | 64-character hex string for JWT tokens | ✅ Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ Yes |
| `NODE_ENV` | Set to "production" | ✅ Yes |

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Verify database connection string is valid
- Check Vercel build logs for specific errors

### Database Connection Issues

- Ensure your database allows connections from Vercel's IP addresses
- Most providers whitelist Vercel automatically, but check your database settings
- Verify connection string includes `?sslmode=require` for PostgreSQL

### Images Not Loading

- Verify Cloudinary credentials are correct
- Check that image domains are configured in `next.config.js`
- Ensure images were uploaded to your Cloudinary account

### Authentication Issues

- Verify JWT_SECRET is at least 32 characters
- Check that cookies are being set correctly (HTTPS required in production)

## Redeploying

To redeploy after making changes:

```bash
git push origin main
```

Vercel will automatically rebuild and redeploy your site.

## Support

For issues with:
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Cloudinary**: [cloudinary.com/support](https://cloudinary.com/support)

## Next Steps

- Set up monitoring and analytics
- Configure email notifications for orders
- Set up automatic database backups
- Add payment gateway integration (if needed)
- Configure CDN for better performance

---

**Congratulations! Your Chulbuli Jewels website is now live! 🎉**
