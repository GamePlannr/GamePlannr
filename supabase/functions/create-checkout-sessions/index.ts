import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('Request received:', req.method, req.url)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request')
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    // Get Stripe secret key from environment or use a valid test key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') // You need to replace this with your actual Stripe test key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321'
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000'

    if (!stripeSecretKey) {
      throw new Error('Please set a valid Stripe secret key. Get one from https://dashboard.stripe.com/test/apikeys')
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
    const { sessionId, amount, mentorName, sessionDate, sessionTime } = await req.json()

    if (!sessionId || !amount || !mentorName) {
      throw new Error('Missing required parameters')
    }

    // Create Stripe checkout session following the official docs
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Booking Session Fee',
              description: `Session with ${mentorName} on ${sessionDate} at ${sessionTime}`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&gameplannr_session_id=${sessionId}`,
      cancel_url: `${siteUrl}/payment-cancelled?session_id=${sessionId}`,
      metadata: {
        sessionId: sessionId,
        mentorName: mentorName,
        sessionDate: sessionDate,
        sessionTime: sessionTime,
      },
    })

    console.log('Stripe checkout session created:', session.id)

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 200 
      },
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      },
    )
  }
})
