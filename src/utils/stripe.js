import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

let stripePromise = null;

const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export const getStripe = () => initializeStripe();

export const createCheckoutSession = async (sessionId, amount, mentorName, sessionDate, sessionTime) => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

  const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({
      sessionId,
      amount,
      mentorName,
      sessionDate,
      sessionTime,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  const { sessionId: stripeSessionId } = await response.json();
  return stripeSessionId;
};

export const redirectToCheckout = async (sessionId, amount, mentorName, sessionDate, sessionTime) => {
  const stripe = await getStripe();

  const stripeSessionId = await createCheckoutSession(
    sessionId,
    amount,
    mentorName,
    sessionDate,
    sessionTime
  );

  const { error } = await stripe.redirectToCheckout({ sessionId: stripeSessionId });

  if (error) {
    console.error('Error redirecting to checkout:', error);
    alert(`Checkout error: ${error.message}`);
  }
};