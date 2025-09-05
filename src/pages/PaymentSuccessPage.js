import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [session, setSession] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  const updateSessionStatus = useCallback(async () => {
    if (!sessionId || !user) return;

    try {
      setLoading(true);
      setError('');

      // Update session status to paid and confirmed
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('parent_id', user.id);

      if (updateError) {
        console.error('Error updating session status:', updateError);
        setError('Payment was successful, but there was an error updating the session status. Please contact support.');
        return;
      }

      // Fetch updated session details
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
        setError('Payment was successful, but there was an error loading session details.');
        return;
      }

      setSession(sessionData);
      setMentor(sessionData.mentor);

      // Update session status to confirmed after a short delay
      setTimeout(async () => {
        const { error: confirmError } = await supabase
          .from('sessions')
          .update({ 
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .eq('parent_id', user.id);

        if (confirmError) {
          console.error('Error confirming session:', confirmError);
        }
      }, 2000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please contact support.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    updateSessionStatus();
  }, [user, sessionId, navigate, updateSessionStatus]);

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

  if (error) {
    return (
      <div className="payment-success-page">
        <Navbar />
        <div className="error-container">
          <div className="error-icon">⚠</div>
          <h2>Payment Processing Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Return to Dashboard
          </button>
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
            <div className="success-icon">●</div>
            <h1>Payment Successful!</h1>
            <p>Your training session has been confirmed</p>
          </div>

          {session && mentor && (
            <div className="session-confirmation">
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
                <h4>Session Confirmed</h4>
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
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-confirmed">● Confirmed</span>
                </div>
              </div>
            </div>
          )}

          <div className="success-actions">
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              View All Sessions
            </button>
            <button onClick={() => navigate('/mentors')} className="btn btn-secondary">
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
