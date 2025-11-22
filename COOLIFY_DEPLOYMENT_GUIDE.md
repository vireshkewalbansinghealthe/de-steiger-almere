# Coolify Deployment Guide - Unity Units

## 🚨 Payment Error Fix

If you're getting the error: **"Betaling kan niet worden geladen - Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**

This means your Stripe environment variables are not properly configured in Coolify.

## 🔧 Quick Fix Steps

### 1. Check Environment Variables in Coolify

Go to your Coolify dashboard and verify these environment variables are set:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Debug Environment Variables

Visit this URL to check if your environment variables are properly set:
```
https://your-domain.com/api/debug
```

This will show you which environment variables are missing.

### 3. Get Your Stripe Keys

If you don't have your Stripe keys:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy the **Publishable key** (starts with `pk_test_`)
4. Copy the **Secret key** (starts with `sk_test_`)

### 4. Update Coolify Environment Variables

1. In Coolify dashboard, go to your Unity Units application
2. Navigate to **Environment Variables**
3. Add/Update the missing variables
4. **Redeploy** your application

## 🔄 Complete Deployment Steps

### Step 1: Prepare Your Repository
```bash
# Make sure your code is pushed to your Git repository
git add .
git commit -m "Fix payment API and add environment variable debugging"
git push origin main
```

### Step 2: Create Application in Coolify
1. **New Resource** → **Application**
2. **Source**: Select your Git repository
3. **Branch**: main (or your default branch)
4. **Build Pack**: Docker (it will auto-detect Dockerfile)

### Step 3: Configure Environment Variables
Add these in Coolify dashboard under **Environment Variables**:

```env
# Required for Production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
HOSTNAME=0.0.0.0

# Stripe Configuration (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_if_needed

# Supabase Configuration (REQUIRED for authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL (Update with your actual domain)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 4: Configure Domain & SSL
1. **Domains** → Add your domain
2. **SSL** → Enable Let's Encrypt
3. **Deploy**

### Step 5: Test Deployment
1. Visit your domain
2. Test the reservation flow
3. Check `/api/debug` endpoint for environment variables
4. Try making a payment

## 🐛 Troubleshooting

### Payment Not Working
1. **Check environment variables**: Visit `/api/debug`
2. **Check logs**: Look at application logs in Coolify
3. **Verify Stripe keys**: Make sure they're test keys (start with `sk_test_` and `pk_test_`)

### API Routes Returning HTML Instead of JSON
This usually means:
- Environment variables are missing
- API route is crashing and returning error page
- Check application logs for specific errors

### Build Failures
1. **Check Dockerfile**: Make sure it's properly configured
2. **Dependencies**: Ensure all npm packages are in package.json
3. **Environment**: Make sure NODE_ENV is set correctly

## 📋 Environment Variables Checklist

Copy this checklist and verify each item in your Coolify dashboard:

- [ ] `NODE_ENV=production`
- [ ] `HOSTNAME=0.0.0.0`
- [ ] `STRIPE_SECRET_KEY` (starts with sk_test_ or sk_live_)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with pk_test_ or pk_live_)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (your actual domain)

## 🚀 After Deployment

1. **Test the full reservation flow**
2. **Verify payments work**
3. **Check email confirmations**
4. **Test admin panel**

## 📞 Support

If you're still having issues:
1. Check the `/api/debug` endpoint
2. Look at Coolify application logs
3. Verify all environment variables are set correctly
4. Make sure Stripe is in test mode initially


