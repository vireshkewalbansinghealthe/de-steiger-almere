# ✅ Stripe Setup Complete!

## What I've Done

### 1. ✅ Created Stripe Products (LIVE MODE)

**Account**: VVS Projecten B.V. (acct_1RxkkV8RxvcaD1x9)

- **Bedrijfsunit Reservation**
  - Product ID: `prod_TURJ4cMzDCFHLI`
  - Price ID: `price_1SXSRI8RxvcaD1x9ircCmxJP`
  - Amount: **€1.00**

- **Opslagbox Reservation**
  - Product ID: `prod_TURJ8QKPkeTcBp`
  - Price ID: `price_1SXSRJ8RxvcaD1x9cbGJhcM3`
  - Amount: **€1.00**

### 2. ✅ Updated Backend Code

- Changed reservation fee from €15.00 to **€1.00** (100 cents)
- Added environment variable support for flexible pricing
- Code now uses `RESERVATION_FEE_AMOUNT=100` (in cents)

## 🔧 Required Environment Variables

Add these to your Vercel deployment:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...  # Your live secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Your live publishable key
STRIPE_WEBHOOK_SECRET=whsec_...  # Get this after creating webhook (see below)

# Stripe Price IDs (Already created for you)
STRIPE_BEDRIJFSUNIT_PRICE_ID=price_1SXSRI8RxvcaD1x9ircCmxJP
STRIPE_OPSLAGBOX_PRICE_ID=price_1SXSRJ8RxvcaD1x9cbGJhcM3

# Reservation Fee
RESERVATION_FEE_AMOUNT=100  # €1.00 in cents

# Email (Still needs setup)
RESEND_API_KEY=re_...  # Get from https://resend.com
FROM_EMAIL=noreply@desteiger.nl

# Cron Security
CRON_SECRET=  # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SUCCESS_URL=https://yourdomain.com/profiel?reservation=success
NEXT_PUBLIC_CANCEL_URL=https://yourdomain.com/profiel?reservation=cancelled
```

## 🪝 Create Stripe Webhook (5 minutes)

Your webhook endpoint is already built. Now connect it to Stripe:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. **Click "Add endpoint"**
3. **Enter your endpoint URL**:
   ```
   https://your-domain.vercel.app/api/webhooks/stripe
   ```
4. **Select these events**:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
5. **Click "Add endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_...`)
7. **Add to Vercel**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 🧪 Test Payment Flow

### Using Test Mode (Recommended for initial testing)

1. Switch Stripe keys to test mode in your `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

3. Test the flow:
   - Go to `/bedrijfsunits` or `/opslagboxen`
   - Click "Reserveer Deze Unit"
   - Fill in details and pay with test card
   - Check `/profiel` for confirmation

### Using Live Mode (Production)

Once testing is complete, switch to live keys:
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

⚠️ **IMPORTANT**: Live mode charges real money!

## 📧 Email Setup (Required)

Your reservation system sends these emails:
- ✅ Confirmation after payment
- ✅ Reminders (35, 28, 21, 14, 7 days before expiry)
- ✅ Expiration notification

### Setup Resend:

1. Go to: https://resend.com
2. Create account and verify **desteiger.nl** domain
3. Get API key
4. Add to environment variables:
   ```bash
   RESEND_API_KEY=re_your_key
   FROM_EMAIL=noreply@desteiger.nl
   ```

## 🎯 What Happens Now

### Customer Journey:
1. Customer browses units on `/bedrijfsunits` or `/opslagboxen`
2. Clicks "Reserveer Deze Unit"
3. System creates 15-minute payment lock
4. Customer enters details (auto-filled from profile)
5. Signs terms & conditions
6. Pays **€1.00** reservation fee via Stripe
7. Stripe webhook confirms payment
8. Unit status → "Reserved"
9. Reservation appears in `/profiel`
10. Customer has **6 weeks** to pay full amount
11. Gets reminder emails
12. After full payment: status → "Transferred"
13. If not paid in 6 weeks: reservation expires, unit becomes available again

### Admin Journey:
1. View all units at `/admin/units`
2. View all reservations at `/admin/reservations`
3. Update statuses manually if needed
4. Track revenue and expirations

## 🤖 Automated Tasks

Your cron job (`/api/cron/process-reservations`) runs daily to:
- ✅ Send reminder emails (35, 28, 21, 14, 7 days before)
- ✅ Expire old reservations (after 6 weeks)
- ✅ Make units available again
- ✅ Send expiration notifications

Configured in `vercel.json` to run at 9:00 AM daily.

## 🔐 Security Checklist

- [x] Stripe webhook signature verification (implemented)
- [x] 15-minute payment locks prevent double bookings
- [ ] CRON_SECRET environment variable (generate and add)
- [ ] STRIPE_WEBHOOK_SECRET (add after creating webhook)
- [x] User authentication required for reservations
- [x] Payment intent metadata includes user_id
- [x] Supabase RLS policies protect data

## 📊 Stripe Dashboard

Monitor everything in your dashboard:
- **Payments**: https://dashboard.stripe.com/payments
- **Customers**: https://dashboard.stripe.com/customers
- **Products**: https://dashboard.stripe.com/products
- **Webhooks**: https://dashboard.stripe.com/webhooks

## 🚀 Ready to Go!

✅ **Done**:
- Stripe products created (€1.00 fee)
- Backend code updated
- API endpoints ready
- Webhook handler built
- Email system ready
- Cron jobs configured
- Admin CMS built

⚠️ **To Do**:
1. Create Stripe webhook endpoint (5 min)
2. Add STRIPE_WEBHOOK_SECRET to Vercel
3. Setup Resend for emails (10 min)
4. Generate and add CRON_SECRET
5. Test payment flow
6. Add your units via admin panel
7. Go live! 🎉

**Total setup time remaining**: ~20 minutes

---

Need help? Check:
- `IMPLEMENTATION_GUIDE.md` - Complete documentation
- `QUICK_START.md` - Fast setup guide
- Stripe Dashboard - Monitor payments


