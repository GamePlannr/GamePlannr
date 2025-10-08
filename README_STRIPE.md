# Stripe + Supabase functions

## Required Secrets (Edge Functions → Secrets)
- STRIPE_SECRET_KEY = sk_live_... (or sk_test_... for testing)
- SITE_URL = https://gameplannr.com
- STRIPE_WEBHOOK_SECRET = whsec_... (Dashboard → Developers → Webhooks)
- SUPABASE_URL = https://<project-ref>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY = <service-role-key>

## Deploy
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

## Stripe Webhook
Create a webhook endpoint in Stripe:
https://<project-ref>.functions.supabase.co/stripe-webhook
Event: checkout.session.completed
