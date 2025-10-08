import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    console.log('✅ Payment succeeded for session:', session.id);

    const { error } = await supabase
      .from('sessions')
      .update({
        status: 'paid',
        stripe_payment_intent: session.payment_intent,
        stripe_session_id: session.id,
        updated_at: new Date(),
      })
      .eq('id', session.metadata?.sessionId);

    if (error) {
      console.error('❌ Supabase update error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update Supabase.' }),
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
