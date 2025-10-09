import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  // Get Stripe session_id from URL
  const stripeSessionId = searchParams.get('session_id');

  useEffect(() => {
    console.log('✅ PaymentSuccessPage loaded');
    console.log('Stripe Session ID:', stripeSessionId);

    // Ensure user is logged in
    if (!user) {
      navigate('/signin');
      return;
    }

    // Small delay before showing success message
    const loadTimer = setTimeout(() => setLoading(false), 1000);

    // Redirect back to dashboard after a short delay
    const redirectTimer = setTimeout(() => {
      setRedirecting(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    }, 4000);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(redirectTimer);
    };
  }, [user, navigate, stripeSessionId]);

  if (loading) {
    return (
      <div className="payment-success-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Processing your payment...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <Navbar />

      <main className="success-main">
        <div className="success-container">
          <div className="success-header">
            <div className="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p>Your session booking has been confirmed.</p>
            {redirecting && <p className="redirect-message">Redirecting to your dashboard...</p>}
          </div>

          <div className="success-actions">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigate('/mentors')}
              className="btn btn-secondary"
            >
              Find More Mentors
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;