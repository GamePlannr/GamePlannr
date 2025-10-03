import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// ✅ Require publishable key from environment
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
  throw new Error(
    'Stripe publishable key is missing or invalid. ' +
    'Set REACT_APP_STRIPE_PUBLISHABLE_KEY in your Netlify environment variables.'
  );
}

let stripePromise = null;

// ✅ Initialize Stripe.js once
const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(stripePublishableKey);
    console.log('✅ Stripe.js initialized');
  }
  return stripePromise;
};

export const getStripe = () => initializeStripe();

/**
 * 🔹 Call Supabase Edge Function to create a Checkout Session
 */
export const createCheckoutSession = async (
  amount,
  mentorName,
  sessionDate,
  sessionTime
) => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('Missing REACT_APP_SUPABASE_URL in environment variables.');
  }

  console.log('➡️ Creating checkout session with:', {
    amount,
    mentorName,
    sessionDate,
    sessionTime,
  });

  // Get the current user's auth token
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  // Call Supabase Edge Function
  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-checkout-sessions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        amount,
        mentorName,
        sessionDate,
        sessionTime,
      }),
    }
  );

  if (!response.ok) {
    let errorMessage = 'Failed to create checkout session';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // ignore if body not JSON
    }
    console.error('❌ Checkout session error:', errorMessage);
    throw new Error(errorMessage);
  }

  // ✅ Get sessionId from Supabase function
  const { sessionId } = await response.json();
  if (!sessionId) {
    throw new Error('No sessionId returned from Supabase function.');
  }

  console.log('✅ Got Stripe sessionId:', sessionId);
  return sessionId;
};

/**
 * 🔹 Redirect user to Stripe Checkout
 */
export const redirectToCheckout = async (
  amount,
  mentorName,
  sessionDate,
  sessionTime
) => {
  try {
    const stripe = await getStripe();

    const sessionId = await createCheckoutSession(
      amount,
      mentorName,
      sessionDate,
      sessionTime
    );

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('❌ Error redirecting to checkout:', error);
      alert(`Checkout error: ${error.message}`);
    }
  } catch (err) {
    console.error('❌ redirectToCheckout failed:', err);
    alert('Unable to start checkout. Please try again.');
  }
};