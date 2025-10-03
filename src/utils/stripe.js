import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
  throw new Error(
    'Stripe publishable key is missing or invalid. Make sure REACT_APP_STRIPE_PUBLISHABLE_KEY is set in Netlify.'
  );
}

let stripePromise = null;
const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(stripePublishableKey);
    console.log('✅ Stripe.js initialized');
  }
  return stripePromise;
};
export const getStripe = () => initializeStripe();

export const createCheckoutSession = async (
  amount,
  mentorName,
  sessionDate,
  sessionTime
) => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

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
    const errorData = await response.json();
    console.error('❌ Failed to create checkout session:', errorData);
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  const { sessionId, url } = await response.json();
  return { sessionId, url };
};

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

    // ✅ If Stripe returns a URL, go directly there
    if (url) {
      window.location.href = url;
      return;
    }

    // ✅ Otherwise, fallback to Stripe.js redirect
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