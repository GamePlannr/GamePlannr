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
  // Stripe requires the raw body, not parsed JSON
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
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        console.log('✅ Checkout completed for session:', session.id);

        const sessionId = session.metadata?.sessionId;
        if (!sessionId) {
          console.warn('⚠️ No sessionId found in metadata.');
          break;
        }

        // Update Supabase session record
        const { error } = await supabase
          .from('sessions')
          .update({
            status: 'paid',
            stripe_payment_intent: session.payment_intent,
            stripe_session_id: session.id,
            updated_at: new Date(),
          })
          .eq('id', sessionId);

        if (error) {
          console.error('❌ Supabase update error:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update Supabase.' }),
          };
        }

        console.log(`✅ Supabase session ${sessionId} marked as paid.`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed.' }),
    };
  }
};

// ✅ Ensure Netlify doesn't parse JSON automatically
export const config = {
  bodyParser: false,
};