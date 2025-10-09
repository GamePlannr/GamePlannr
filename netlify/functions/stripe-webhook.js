import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const signature = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Stripe signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook signature error: ${err.message}` }),
    };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const sessionId = session.metadata?.sessionId;

      console.log('✅ Stripe checkout.session.completed received');
      console.log('Metadata sessionId:', sessionId);
      console.log('Stripe Payment Intent ID:', session.payment_intent);
      console.log('Stripe Session ID:', session.id);

      if (!sessionId) {
        console.warn('⚠️ No sessionId found in metadata.');
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing sessionId in metadata' }),
        };
      }

      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent, // ✅ FIXED HERE
          stripe_session_id: session.id,
          updated_at: new Date(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('❌ Supabase update error:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: `Supabase update failed: ${error.message}` }),
        };
      }

      console.log(`✅ Supabase session ${sessionId} marked as paid.`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

export const config = {
  bodyParser: false,
};