# Stripe Checkout Integration Setup

This guide explains how to set up Stripe Checkout integration with Supabase Edge Functions.

## Prerequisites

1. **Supabase CLI** installed
2. **Stripe account** with test mode enabled
3. **Environment variables** configured

## Setup Steps

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Set up environment variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51S3mRoFUjUaFpWkc8NBUv8EUc03ME8ovMJ4gv7xHXtf8rJBtirhkKx47UMBOyCFgtwR8670fIgmsgUIxYiQPQSYN00qfk3PiOS

# Site URL for Stripe redirects
SITE_URL=http://localhost:3000
```

### 5. Set up Supabase Edge Function secrets

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_51S3mRoFUjUaFpWkcEG7XBuSwlJkngTLPki0qDqu59DE6LX8gALJRmDKercFrwnWCksdGZvFMfKGdlHt82u4lsrOy00P5H7KS3Y

# Set Supabase URL
supabase secrets set SUPABASE_URL=your-supabase-project-url

# Set Supabase Anon Key
supabase secrets set SUPABASE_ANON_KEY=your-supabase-anon-key

# Set Site URL
supabase secrets set SITE_URL=http://localhost:3000
```

### 6. Deploy the Edge Function

```bash
supabase functions deploy create-checkout-session
```

### 7. Test the integration

1. Start your React app: `npm start`
2. Navigate to a session that needs payment
3. Click "Pay with Stripe"
4. You should be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`

## Test Card Details

- **Card Number**: `4242 4242 4242 4242`
- **Expiry Date**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP Code**: Any 5 digits (e.g., `12345`)

## Production Setup

For production deployment:

1. Update `SITE_URL` to your production domain
2. Use production Stripe keys
3. Redeploy the Edge Function with production secrets

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the Edge Function has proper CORS headers
2. **Authentication errors**: Ensure the user is logged in and has a valid session
3. **Stripe errors**: Check that your Stripe keys are correct and in test mode

### Debugging

Check the Supabase Edge Function logs:

```bash
supabase functions logs create-checkout-session
```

## File Structure

```
supabase/
├── functions/
│   └── create-checkout-session/
│       └── index.js
└── config.toml
```

The Edge Function handles:
- Creating Stripe checkout sessions
- Validating session data
- Setting up proper redirect URLs
- Handling CORS for frontend requests
