import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// ✅ Require environment variable for Stripe publishable key
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
  throw new Error(
    'Stripe publishable key is missing or invalid. Make sure REACT_APP_STRIPE_PUBLISHABLE_KEY is set in your Netlify environment variables.'
  );
}

let stripePromise = null;

// Initialize Stripe.js
const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(stripePublishableKey);
    console.log('✅ Stripe.js initialized');
  }
  return stripePromise;
};

export const getStripe = () => initializeStripe();

/**
 * Call Supabase Edge Function to create a checkout session
 */
export const createCheckoutSession = async (
  amount,
  mentorName,
  sessionDate,
  sessionTime
) => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

  console.log('➡️ Creating checkout session with:', {
    amount,
    mentorName,
    sessionDate,
    sessionTime,
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-sessions`, {
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
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Failed to create checkout session:', errorData);
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  const { sessionId, url } = await response.json();
  console.log('✅ Got Stripe checkout response:', { sessionId, url });

  return { sessionId, url };
};

/**
 * Redirect to Stripe Checkout
 */
export const redirectToCheckout = async (
  amount,
  mentorName,
  sessionDate,
  sessionTime
) => {
  try {
    const stripe = await getStripe();

    const { sessionId, url } = await createCheckoutSession(
      amount,
      mentorName,
      sessionDate,
      sessionTime
    );

    if (url) {
      console.log('➡️ Redirecting directly to Stripe URL:', url);
      window.location.href = url; // ✅ Preferred way
      return;
    }

    if (sessionId) {
      console.log('➡️ Redirecting with sessionId:', sessionId);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('❌ Error redirecting to checkout:', error);
        alert(`Checkout error: ${error.message}`);
      }
    } else {
      throw new Error('No Stripe session or URL returned.');
    }
  } catch (err) {
    console.error('❌ redirectToCheckout failed:', err);
    alert('Unable to start checkout. Please try again.');
  }
};