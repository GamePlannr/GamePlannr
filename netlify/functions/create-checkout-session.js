import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { mentorName, sessionDate, sessionTime, parentEmail, sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing session ID' }) };
    }

    const line_items = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `GamePlannr Booking Fee`,
            description: `${mentorName} - ${sessionDate} at ${sessionTime}`,
          },
          unit_amount: 400, // $4.00 USD
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: parentEmail,
      success_url: `${process.env.SITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&session_db_id=${sessionId}`,
      cancel_url: `${process.env.SITE_URL}/dashboard`,
      metadata: { sessionId },
    });

    // Update Supabase with the Stripe session ID
    const { error } = await supabase
      .from('sessions')
      .update({
        stripe_session_id: session.id,
        updated_at: new Date(),
      })
      .eq('id', sessionId);

    if (error) {
      console.error('❌ Supabase update error:', error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};