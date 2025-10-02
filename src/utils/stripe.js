import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// ✅ Always require environment variable for Stripe key
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
  throw new Error(
    'Stripe publishable key is missing or invalid. Make sure REACT_APP_STRIPE_PUBLISHABLE_KEY is set in your environment variables.'
  );
}

let stripePromise = null;

// Initialize Stripe
const initializeStripe = async () => {
  try {
    stripePromise = await loadStripe(stripePublishableKey);
    console.log('Stripe initialized successfully with key:', stripePublishableKey);
    return stripePromise;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    stripePromise = null;
    return null;
  }
};

// Initialize Stripe immediately on load
initializeStripe();

export const getStripe = () => stripePromise;

// Create a checkout session via Supabase Edge Function
export const createCheckoutSession = async (
  sessionId,
  amount,
  mentorName,
  sessionDate,
  sessionTime
) => {
  try {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
      throw new Error(
        'Supabase URL not configured. Please set REACT_APP_SUPABASE_URL in your environment variables.'
      );
    }

    console.log(
      'Making request to:',
      `${supabaseUrl}/functions/v1/create-checkout-session`
    );
    console.log('Request data:', {
      sessionId,
      amount,
      mentorName,
      sessionDate,
      sessionTime,
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            (await supabase.auth.getSession()).data.session?.access_token
          }`,
        },
        body: JSON.stringify({
          sessionId,
          amount,
          mentorName,
          sessionDate,
          sessionTime,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    // Stripe function returns { url: ... }
    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (
  sessionId,
  amount,
  mentorName,
  sessionDate,
  sessionTime
) => {
  try {
    if (!sessionId || !amount || !mentorName) {
      throw new Error('Missing required parameters for checkout');
    }

    console.log('Creating Stripe Checkout session...');
    console.log('- Session ID:', sessionId);
    console.log('- Amount:', amount);
    console.log('- Mentor:', mentorName);
    console.log('- Date:', sessionDate);
    console.log('- Time:', sessionTime);

    const checkoutUrl = await createCheckoutSession(
      sessionId,
      amount,
      mentorName,
      sessionDate,
      sessionTime
    );

    if (!checkoutUrl) {
      throw new Error('No checkout URL returned from function');
    }

    // Redirect browser to Stripe Checkout
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error('Error in redirectToCheckout:', error);
    alert('Unable to start payment. Please try again.');
  }
};