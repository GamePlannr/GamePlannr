import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with your publishable key
const stripePublishableKey =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51S3mRoFUjUaFpWkc8NBUv8EUc03ME8ovMJ4gv7xHXtf8rJBtirhkKx47UMBOyCFgtwR8670fIgmsgUIxYiQPQSYN00qfk3PiOS';

// Debug logging
console.log(
  'Environment variable REACT_APP_STRIPE_PUBLISHABLE_KEY:',
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);
console.log('Using Stripe key:', stripePublishableKey);

// Validate the key format
if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
  console.error('Invalid Stripe publishable key:', stripePublishableKey);
}

let stripePromise = null;

// Initialize Stripe with error handling
const initializeStripe = async () => {
  try {
    if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
      throw new Error('Invalid Stripe publishable key');
    }

    stripePromise = await loadStripe(stripePublishableKey);
    console.log('Stripe initialized successfully');
    return stripePromise;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    stripePromise = null;
    return null;
  }
};

// Initialize Stripe immediately
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
      `${supabaseUrl}/functions/v1/create-checkout-sessions`
    );
    console.log('Request data:', {
      sessionId,
      amount,
      mentorName,
      sessionDate,
      sessionTime,
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-checkout-sessions`,
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

    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    // ✅ FIX: use `id` instead of `sessionId`
    const { id: stripeSessionId } = await response.json();
    return stripeSessionId;
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
    // Validate required parameters
    if (!sessionId || !amount || !mentorName) {
      throw new Error('Missing required parameters for checkout');
    }

    console.log('Creating Stripe Checkout session...');
    console.log('- Session ID:', sessionId);
    console.log('- Amount:', amount);
    console.log('- Mentor:', mentorName);
    console.log('- Date:', sessionDate);
    console.log('- Time:', sessionTime);

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

    // Ensure Stripe is initialized
    let stripe = await getStripe();

    if (!stripe) {
      console.log('Stripe not initialized, attempting to initialize...');
      stripe = await initializeStripe();
    }

    if (!stripe) {
      throw new Error('Stripe failed to initialize. Please check your publishable key.');
    }

    // Create checkout session via Supabase Edge Function
    console.log(
      'Making request to:',
      `${supabaseUrl}/functions/v1/create-checkout-sessions`
    );
    console.log('Request data:', {
      sessionId,
      amount,
      mentorName,
      sessionDate,
      sessionTime,
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-checkout-sessions`,
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

    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    // ✅ FIX: use `id` instead of `sessionId`
    const { id: stripeSessionId } = await response.json();

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: stripeSessionId,
    });

    if (error) {
      console.error('Error redirecting to checkout:', error);
      throw new Error(`Checkout error: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in redirectToCheckout:', error);
    throw error;
  }
};