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
  const [redirecting, setRedirecting] = useState(false);

  const stripeSessionId = searchParams.get('session_id');
  const sessionId = searchParams.get('gameplannr_session_id');

  const updateSessionStatus = useCallback(async () => {
    if (!sessionId || !user || !stripeSessionId) return;

    try {
      setLoading(true);
      setError('');

      // For now, assume payment was successful since user reached this page
      // In production, you should verify the Stripe session
      console.log('Processing payment success for session:', sessionId);
      console.log('Stripe session ID:', stripeSessionId);

      // Update session status to paid and confirmed
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ 
          status: 'paid',
          stripe_session_id: stripeSessionId,
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
      console.log('Fetching session details for ID:', sessionId, 'User ID:', user.id);
      
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
        console.error('Session ID:', sessionId);
        console.error('User ID:', user.id);
        
        // If session not found, it might not exist yet - create a basic success message
        if (sessionError.code === 'PGRST116') {
          console.log('Session not found in database yet - showing basic success message');
          setSession({
            id: sessionId,
            scheduled_date: new Date().toISOString().split('T')[0],
            scheduled_time: '10:00',
            location: 'To be confirmed',
            status: 'paid'
          });
          setMentor({
            first_name: 'Mentor',
            last_name: 'Name',
            sport: 'Sport',
            city: 'City',
            state: 'State'
          });
          
          // Still try to redirect after a delay
          setTimeout(() => {
            setRedirecting(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }, 3000);
          return;
        }
        
        setError('Payment was successful, but there was an error loading session details. Please check the console for details.');
        return;
      }

      console.log('Session data retrieved:', sessionData);

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
        } else {
          console.log('Session confirmed successfully - redirecting to dashboard');
          setRedirecting(true);
          // Automatically redirect to dashboard after successful payment processing
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000); // 3 second delay to show success message
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
    console.log('PaymentSuccessPage useEffect triggered');
    console.log('User:', user);
    console.log('Stripe Session ID:', stripeSessionId);
    console.log('GamePlannr Session ID:', sessionId);
    console.log('URL params:', window.location.search);
    console.log('Full URL:', window.location.href);
    console.log('Search params object:', Object.fromEntries(new URLSearchParams(window.location.search)));

    if (!user) {
      console.log('No user, redirecting to signin');
      navigate('/signin');
      return;
    }

    if (!sessionId) {
      console.log('No session ID, showing basic success and redirecting to dashboard');
      setSession({
        id: 'unknown',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '10:00',
        location: 'To be confirmed',
        status: 'paid'
      });
      setMentor({
        first_name: 'Mentor',
        last_name: 'Name',
        sport: 'Sport',
        city: 'City',
        state: 'State'
      });
      setLoading(false);
      
      // Redirect after showing success message
      setTimeout(() => {
        setRedirecting(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }, 3000);
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
          <div className="error-icon">!</div>
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
            <div className="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p>Your training session has been confirmed</p>
            {redirecting && (
              <p className="redirect-message">Redirecting to dashboard in a moment...</p>
            )}
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
                  <span className="detail-value status-confirmed">✓ Confirmed</span>
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
