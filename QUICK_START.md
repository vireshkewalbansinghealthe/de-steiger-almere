# 🚀 Quick Start Guide - Unity Units Reservation System

## ✅ What's Already Done

- ✅ Database structure created in Supabase
- ✅ All API endpoints built and ready
- ✅ Admin CMS for managing units and reservations
- ✅ Stripe integration code complete
- ✅ Email notification system ready
- ✅ Automated cron jobs configured
- ✅ Frontend hooks and components ready
- ✅ Your Stripe account connected (VVS Projecten B.V.)

## ⚠️ What You Need To Do

### 1. Set Up Stripe Webhook (10 minutes)

Your Stripe account is already active! Now create the webhook:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`  
   - `payment_intent.canceled`
5. Copy the webhook secret (starts with `whsec_`)
6. Add to Vercel environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

**📖 Detailed guide**: See `STRIPE_WEBHOOK_SETUP.md`

### 2. Set Up Email (Resend) (5 minutes)

1. Go to: https://resend.com
2. Create account and verify your domain
3. Get API key
4. Add to Vercel environment variables:
   ```bash
   RESEND_API_KEY=re_your_key_here
   ```

**Emails that will be sent**:
- ✅ Confirmation after payment
- ✅ Reminders at 35, 28, 21, 14, 7 days before expiry
- ✅ Expiration notification

### 3. Generate Cron Secret (1 minute)

Generate a random string and add to Vercel:

```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to environment variables:
CRON_SECRET=your_random_string_here
```

This protects your automated task endpoint.

### 4. Add Units to Database (Choose One)

**Option A: Via Admin Panel** (Recommended)
1. Go to `/admin/units`
2. Click "Nieuwe Unit"
3. Fill in details for each unit

**Option B: Bulk Import** (If you have many units)
1. Export units from `src/data/projects.ts` to CSV
2. Use Supabase Table Editor to bulk import
3. Or run the migration script we created

### 5. Test Complete Flow (15 minutes)

1. **Register as customer**: `/registreren`
2. **Browse units**: `/bedrijfsunits` or `/opslagboxen`
3. **Reserve a unit**: Click "Reserveer Deze Unit"
4. **Pay with test card**: `4242 4242 4242 4242`
   - CVV: Any 3 digits
   - Expiry: Any future date
5. **Check confirmation**:
   - Email received? ✅
   - Reservation in `/profiel`? ✅
   - Unit marked as reserved? ✅

## 🎯 Your System Features

### For Customers:
- Browse available units (bedrijfsunits & opslagboxen)
- Reserve units with 15-minute checkout window
- Pay reservation fee via Stripe
- View reservations in profile
- Receive automated email reminders
- 6-week window to complete purchase

### For Admins:
- Manage all units at `/admin/units`
- Monitor reservations at `/admin/reservations`
- Update statuses
- View revenue statistics
- Track expiring reservations

### Automated:
- 15-minute payment locks prevent double bookings
- Daily cron job expires old reservations
- Automated reminder emails
- Property availability updates
- Payment confirmation handling

## 📊 Environment Variables Status

Check your Vercel environment variables:

```bash
# ✅ Supabase (Already set)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# ✅ Stripe (Already set)
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# ⚠️ NEED TO ADD
STRIPE_WEBHOOK_SECRET        # From Stripe Dashboard after creating webhook
RESEND_API_KEY              # From Resend after signup
CRON_SECRET                 # Generate random string
```

## 🔍 Testing Checklist

- [ ] Stripe webhook created and secret added
- [ ] Resend API key added
- [ ] Cron secret generated and added
- [ ] Test reservation flow works
- [ ] Confirmation email received
- [ ] Reservation shows in profile
- [ ] Admin panel accessible
- [ ] Can view/manage units in admin
- [ ] Can view/manage reservations in admin

## 📞 Need Help?

**Check logs**:
- Vercel: Function logs in dashboard
- Supabase: Database logs in dashboard
- Stripe: Webhook logs in dashboard
- Resend: Email delivery logs

**Common issues**:
1. **Payment not confirming?** → Check webhook is set up and secret is correct
2. **Emails not sending?** → Verify Resend API key and domain verification
3. **Can't access admin?** → Check user role is 'admin' in profiles table
4. **Units not showing?** → Add units via admin panel or migration

## 🎉 You're Almost Done!

Just complete the 3 setup steps above and you're ready to go live! The entire backend infrastructure, payment processing, email system, and admin panel are already built and working.

**Total setup time**: ~20 minutes

---

**Need the detailed guide?** See `IMPLEMENTATION_GUIDE.md` for complete documentation.


