import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S3mRoFUjUaFpWkc8NBUv8EUc03ME8ovMJ4gv7xHXtf8rJBtirhkKx47UMBOyCFgtwR8670fIgmsgUIxYiQPQSYN00qfk3PiOS';

// Debug logging
console.log('Environment variable REACT_APP_STRIPE_PUBLISHABLE_KEY:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
console.log('Using Stripe key:', stripePublishableKey);

// Validate the key format
if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
  console.error('Invalid Stripe publishable key:', stripePublishableKey);
}

let stripePromise;

try {
  stripePromise = loadStripe(stripePublishableKey);
} catch (error) {
  console.error('Error initializing Stripe:', error);
  stripePromise = null;
}

export const getStripe = () => stripePromise;

// Create a checkout session
export const createCheckoutSession = async (sessionId, amount, mentorName, sessionDate, sessionTime) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error('Failed to create checkout session');
    }

    const { sessionId: stripeSessionId } = await response.json();
    return stripeSessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (sessionId, amount, mentorName, sessionDate, sessionTime) => {
  try {
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize. Please check your publishable key and try again.');
    }

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

    // For MVP: Use Stripe Elements or redirect to a simple payment form
    // Since we don't have a backend to create checkout sessions, we'll simulate the flow
    console.log('Simulating Stripe Checkout for MVP...');
    console.log('In production, you would need a backend to create checkout sessions.');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to success page for MVP demo
    window.location.href = `${window.location.origin}/payment-success?session_id=${sessionId}`;

  } catch (error) {
    console.error('Error in redirectToCheckout:', error);
    throw error;
  }
};
