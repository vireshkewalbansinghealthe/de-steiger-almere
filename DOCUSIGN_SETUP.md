# DocuSign Integration Setup Guide

## Overview
This guide will help you complete the DocuSign integration setup for De Steiger's enhanced reservation system.

## Current Configuration
Your DocuSign credentials have been configured in the `.env.local` file:

```bash
DOCUSIGN_CLIENT_ID=449cebca-acf2-4df3-b633-1a6f27595ccb
DOCUSIGN_CLIENT_SECRET=8fdc0e5a-2097-4843-b144-3e5a162abc26
DOCUSIGN_ACCOUNT_ID=4bfa0d50-8bda-418e-b7b0-2cb517f0d2dc
DOCUSIGN_USER_ID=4bfa0d50-8bda-418e-b7b0-2cb517f0d2dc
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_AUTH_SERVER=https://account-d.docusign.com
```

## ⚠️ Important: JWT Authentication Setup

The current implementation uses a temporary JWT setup with client secret. For production, you need to set up proper RSA key pair authentication.

### Step 1: Generate RSA Key Pair

1. Go to your DocuSign Developer Console: https://admindemo.docusign.com/
2. Navigate to "Apps and Keys"
3. Find your integration key (`449cebca-acf2-4df3-b633-1a6f27595ccb`)
4. Click "+ GENERATE RSA KEYPAIR"
5. Download the private key file

### Step 2: Update Environment Variables

Add the RSA private key to your `.env.local`:

```bash
# Add this to your .env.local
DOCUSIGN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END RSA PRIVATE KEY-----"
```

### Step 3: Update the JWT Implementation

Update the JWT token function in `/src/app/api/docusign/route.ts`:

```typescript
async function getDocuSignJWTToken(): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: DOCUSIGN_CONFIG.clientId,
      sub: DOCUSIGN_CONFIG.userId,
      aud: DOCUSIGN_CONFIG.authServer,
      iat: now,
      exp: now + 3600,
      scope: SCOPES
    };

    // Use RSA private key for JWT signing (recommended)
    const privateKey = process.env.DOCUSIGN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!privateKey) {
      throw new Error('DocuSign private key not configured');
    }

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // Rest of the function remains the same...
  }
}
```

## Grant Consent (One-time setup)

After setting up the RSA keys, you need to grant consent:

1. Visit this URL (replace with your client ID):
```
https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=449cebca-acf2-4df3-b633-1a6f27595ccb&redirect_uri=http://localhost:3000/auth/docusign/callback
```

2. Log in with your DocuSign developer account
3. Grant the requested permissions
4. This is a one-time setup - consent will be remembered

## Testing the Integration

### 1. Test Contract Generation
```bash
curl -X POST http://localhost:3000/api/docusign \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "+31612345678",
      "address": "Test Street 123",
      "city": "Amsterdam",
      "postalCode": "1234AB",
      "country": "Nederland"
    },
    "selectedUnits": [{
      "id": "unit-1",
      "unitNumber": 1,
      "name": "Bedrijfsunit",
      "price": "€ 500,000",
      "area": 100
    }],
    "totalPrice": 500000,
    "reservationFee": 1500
  }'
```

### 2. Verify Envelope Creation
Check the response for:
- `success: true`
- Valid `envelopeId`
- Working `signingUrl`

## Webhook Setup (Optional but Recommended)

Set up webhooks to automatically handle contract status updates:

1. In DocuSign Console, go to "Connect" → "Add Configuration"
2. Set webhook URL to: `https://yourdomain.com/api/docusign`
3. Enable events:
   - Envelope Sent
   - Envelope Completed
   - Envelope Declined
   - Envelope Voided

## Production Checklist

- [ ] RSA key pair generated and configured
- [ ] Consent granted for the integration
- [ ] Webhook endpoints configured
- [ ] Test contract generation working
- [ ] Error handling implemented
- [ ] Database integration for tracking envelopes
- [ ] Email notifications configured

## Environment Variables Summary

Make sure your `.env.local` contains:

```bash
# DocuSign (Required)
DOCUSIGN_CLIENT_ID=449cebca-acf2-4df3-b633-1a6f27595ccb
DOCUSIGN_CLIENT_SECRET=8fdc0e5a-2097-4843-b144-3e5a162abc26
DOCUSIGN_ACCOUNT_ID=4bfa0d50-8bda-418e-b7b0-2cb517f0d2dc
DOCUSIGN_USER_ID=4bfa0d50-8bda-418e-b7b0-2cb517f0d2dc
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_AUTH_SERVER=https://account-d.docusign.com
DOCUSIGN_REDIRECT_URI=http://localhost:3000/auth/docusign/callback
DOCUSIGN_PRIVATE_KEY="YOUR_RSA_PRIVATE_KEY_HERE"

# Email Service (Recommended)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@desteiger.nl

# Other required variables
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=your_secure_random_string
```

## Support

- DocuSign Developer Docs: https://developers.docusign.com/
- JWT Authentication Guide: https://developers.docusign.com/platform/auth/jwt/
- API Reference: https://developers.docusign.com/docs/esign-rest-api/

## Current Status ✅

- [x] DocuSign SDK installed
- [x] API route created with full integration
- [x] Contract template with professional HTML formatting
- [x] JWT authentication framework
- [x] Envelope creation with signature tabs
- [x] Completion callback page
- [x] Error handling and validation

## Next Steps

1. Complete RSA key setup (5 minutes)
2. Grant consent (1 minute)
3. Test the integration
4. Set up webhooks for production
5. Configure email service for notifications

Your DocuSign integration is almost ready! Just complete the RSA key setup and you'll have a fully functional digital contract system. 🎉
