# Stripe Webhook Setup Guide

## Your Stripe Account
- **Account ID**: acct_1RxkkV8RxvcaD1x9
- **Display Name**: VVS Projecten B.V.
- **Status**: ✅ Active

## Webhook Configuration Required

Your backend is ready to receive Stripe webhooks at:
```
https://yourdomain.com/api/webhooks/stripe
```

### Events to Subscribe To:
1. `payment_intent.succeeded` - When payment completes successfully
2. `payment_intent.payment_failed` - When payment fails
3. `payment_intent.canceled` - When payment is canceled

## Setup Steps

### Option 1: Via Stripe Dashboard (Recommended for Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   - **Development**: `https://your-dev-domain.vercel.app/api/webhooks/stripe`
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add to your environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Option 2: Via Stripe CLI (For Local Testing)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret from the output
# Add it to your .env.local:
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing Your Webhook

### Test Payment Flow:

1. **Create a test reservation**:
   - Go to `/bedrijfsunits` or `/opslagboxen`
   - Select a unit and click "Reserveer Deze Unit"
   - Fill in customer details
   - Complete payment with test card: **4242 4242 4242 4242**

2. **Test cards for different scenarios**:
   ```
   Success: 4242 4242 4242 4242
   Decline: 4000 0000 0000 0002
   Requires authentication: 4000 0027 6000 3184
   ```

3. **Check webhook logs**:
   - Stripe Dashboard → Developers → Webhooks → Your endpoint
   - Click on events to see request/response

4. **Verify in your app**:
   - Check `/profiel` - reservation should show as "Bevestigd"
   - Check database - reservation status should be "confirmed"
   - Property status should be "reserved"

## Environment Variables Checklist

Ensure these are set in your deployment (Vercel):

```bash
# Supabase (✅ Should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://dsqzacajytrbhgmdrjgv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe (✅ Account active - VVS Projecten B.V.)
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_... (⚠️ ADD THIS AFTER CREATING WEBHOOK)

# Email - Resend (⚠️ NEEDS SETUP)
RESEND_API_KEY=re_...

# Cron Job Security (⚠️ GENERATE A RANDOM STRING)
CRON_SECRET=your_secure_random_string_here
```

## Webhook Handler Features

Your webhook handler automatically:

✅ **On payment_intent.succeeded**:
- Updates reservation status to "confirmed"
- Updates property status to "reserved"
- Removes 15-minute payment lock
- Sends confirmation email to customer

✅ **On payment_intent.payment_failed**:
- Updates payment status to "failed"
- Removes payment lock
- Adds error note to reservation

✅ **On payment_intent.canceled**:
- Updates reservation status to "cancelled"
- Removes payment lock
- Makes property available again

## Troubleshooting

### Webhook not receiving events?
1. Check endpoint URL is correct (HTTPS required)
2. Verify webhook secret matches in environment variables
3. Check Stripe Dashboard → Webhooks for error logs
4. Ensure your server is deployed and accessible

### Events received but not processing?
1. Check server logs in Vercel
2. Verify SUPABASE_SERVICE_ROLE_KEY is set
3. Check database permissions
4. Look for errors in `/api/webhooks/stripe` route

### Testing locally?
1. Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Use ngrok to expose local server: `ngrok http 3000`
3. Add ngrok URL to Stripe webhook endpoints (for temporary testing)

## Security Notes

🔒 **Important**:
- Never commit webhook secrets to Git
- Use different webhook endpoints for test/live modes
- Verify webhook signatures (already implemented in code)
- Monitor webhook attempts in Stripe Dashboard
- Set up alerts for failed webhooks

## Next Steps

1. ✅ Stripe account verified (VVS Projecten B.V.)
2. ⚠️ **Create webhook endpoint** in Stripe Dashboard
3. ⚠️ **Add STRIPE_WEBHOOK_SECRET** to environment variables
4. ⚠️ **Set up Resend** for email notifications
5. ⚠️ **Generate CRON_SECRET** for automated tasks
6. ✅ Test complete payment flow
7. ✅ Deploy to production

---

**Status**: Webhook handler code ✅ Ready | Webhook endpoint ⚠️ Needs configuration


