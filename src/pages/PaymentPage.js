import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { redirectToCheckout } from '../utils/stripe';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PaymentPage.css';

const PaymentPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [session, setSession] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchSessionDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          mentor:mentor_id (
            first_name,
            last_name,
            sport,
            city,
            state
          )
        `)
        .eq('id', sessionId)
        .eq('parent_id', user.id)
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        setError('Session not found or you do not have permission to view it.');
        return;
      }

      if (!sessionData) {
        setError('Session not found.');
        return;
      }

      if (sessionData.status !== 'awaiting_payment') {
        setError('This session is not awaiting payment.');
        return;
      }

      setSession(sessionData);
      setMentor(sessionData.mentor);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load session details.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, user.id]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (profile?.role !== 'parent') {
      navigate('/dashboard');
      return;
    }

    fetchSessionDetails();
  }, [user, profile, navigate, fetchSessionDetails]);

  const handlePayment = async () => {
    if (!session || !mentor) return;

    try {
      setPaymentLoading(true);
      setError('');

      // Set session price (you can make this configurable)
      const sessionPrice = 5; // $5 per session
      const amount = sessionPrice * 100; // Convert to cents

      const mentorName = `${mentor.first_name} ${mentor.last_name}`;
      const sessionDate = new Date(session.scheduled_date).toLocaleDateString();
      const sessionTime = session.scheduled_time;

      console.log('Initiating payment process...');
      await redirectToCheckout(sessionId, amount, mentorName, sessionDate, sessionTime);
    } catch (err) {
      console.error('Payment error:', err);
      setError(`Payment failed: ${err.message || 'Please try again.'}`);
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading session details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="error-container">
          <div className="error-icon">⚠</div>
          <h2>Payment Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session || !mentor) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="error-container">
          <div className="error-icon">⚠</div>
          <h2>Session Not Found</h2>
          <p>The session you're looking for could not be found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />
      
      <main className="payment-main">
        <div className="payment-container">
          <div className="payment-header">
            <h1>Complete Your Payment</h1>
            <p>Secure payment powered by Stripe</p>
          </div>

          <div className="payment-content">
            <div className="session-summary">
              <div className="mentor-info">
                <div className="mentor-avatar">
                  <span className="avatar-initials">
                    {mentor.first_name?.[0] || 'M'}{mentor.last_name?.[0] || 'M'}
                  </span>
                </div>
                <div className="mentor-details">
                  <h3>{mentor.first_name} {mentor.last_name}</h3>
                  <p className="mentor-sport">{mentor.sport}</p>
                  <p className="mentor-location">{mentor.city}, {mentor.state}</p>
                </div>
              </div>

              <div className="session-details">
                <h4>Session Details</h4>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(session.scheduled_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{formatTime(session.scheduled_time)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{session.location}</span>
                </div>
              </div>
            </div>

            <div className="payment-section">
              <div className="price-breakdown">
                <h4>Price Breakdown</h4>
                <div className="price-item">
                  <span>Training Session</span>
                  <span>$5.00</span>
                </div>
                <div className="price-item total">
                  <span>Total</span>
                  <span>$5.00</span>
                </div>
              </div>

              <div className="payment-actions">
                <button 
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="btn btn-payment"
                >
                  {paymentLoading ? 'Processing Payment...' : 'Pay $5.00 with Stripe'}
                </button>
                <p className="payment-note">
                  For this MVP demo, payment will be simulated. In production, you would be redirected to Stripe's secure checkout page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;
