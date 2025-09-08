import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://gameplannrmvp.netlify.app/',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('Verify request received:', req.method, req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request for verify')
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeSecretKey) {
      throw new Error('Please set a valid Stripe secret key. Get one from https://dashboard.stripe.com/test/apikeys')
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
    const { sessionId } = await req.json()

    if (!sessionId) {
      throw new Error('Missing session ID')
    }

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log('Retrieved Stripe session:', session.id, 'Status:', session.payment_status)

    // Check if payment was successful
    const paymentSuccessful = session.payment_status === 'paid'

    return new Response(
      JSON.stringify({ 
        payment_successful: paymentSuccessful,
        session_status: session.payment_status,
        session_id: session.id,
        amount_total: session.amount_total,
        currency: session.currency
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 200 
      },
    )
  } catch (error) {
    console.error('Error verifying Stripe session:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        payment_successful: false 
      }),
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
