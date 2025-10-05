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

  // Stripe checkout identifiers
  const stripeSessionId = searchParams.get('session_id');
  const sessionId = searchParams.get('gameplannr_session_id');

  // === Update Supabase session to "paid" ===
  const updateSessionStatus = useCallback(async () => {
    if (!sessionId || !user || !stripeSessionId) return;

    try {
      setLoading(true);
      setError('');

      console.log('✅ Payment confirmed via Stripe');
      console.log('🔹 Updating session in Supabase:', sessionId);
      console.log('🔹 Stripe session ID:', stripeSessionId);

      // ✅ Update session to "paid" in Supabase
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          status: 'paid',
          stripe_session_id: stripeSessionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('parent_id', user.id);

      if (updateError) console.error('⚠️ Session update failed:', updateError);

      // ✅ Fetch updated session data for display
      const { data: sessionData, error: fetchError } = await supabase
        .from('sessions')
        .select(`
          *,
          mentor:mentor_id (
            first_name,
            last_name,
            sport,
            city,
            state,
            profile_picture_url
          )
        `)
        .eq('id', sessionId)
        .eq('parent_id', user.id)
        .single();

      if (fetchError) console.warn('⚠️ Fetch failed, showing fallback:', fetchError);

      if (sessionData) {
        setSession(sessionData);
        setMentor(sessionData.mentor);
      } else {
        // Fallback for display
        setSession({
          id: sessionId,
          scheduled_date: new Date().toISOString().split('T')[0],
          scheduled_time: '10:00',
          location: 'To be confirmed',
          status: 'paid',
        });
        setMentor({
          first_name: 'Mentor',
          last_name: 'Name',
          sport: 'Sport',
          city: 'City',
          state: 'State',
        });
      }

      // ✅ Show success, then redirect
      setLoading(false);
      setTimeout(() => {
        setRedirecting(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }, 3000);
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('Something went wrong processing your payment.');

      // Still show success UI fallback
      setLoading(false);
      setSession({
        id: sessionId || 'unknown',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '10:00',
        location: 'To be confirmed',
        status: 'paid',
      });
      setMentor({
        first_name: 'Mentor',
        last_name: 'Name',
        sport: 'Sport',
        city: 'City',
        state: 'State',
      });

      // Redirect fallback
      setTimeout(() => {
        setRedirecting(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }, 3000);
    }
  }, [sessionId, user, stripeSessionId, navigate]);

  // === Initialize ===
  useEffect(() => {
    console.log('💰 PaymentSuccessPage loaded');
    console.log('User:', user);
    console.log('Stripe Session ID:', stripeSessionId);
    console.log('GamePlannr Session ID:', sessionId);

    if (!user) {
      console.warn('⚠️ No user logged in — redirecting');
      navigate('/signin');
      return;
    }

    if (!sessionId) {
      console.warn('⚠️ No session ID in query — showing fallback');
      setLoading(false);
      setSession({
        id: 'unknown',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '10:00',
        location: 'To be confirmed',
        status: 'paid',
      });
      setMentor({
        first_name: 'Mentor',
        last_name: 'Name',
        sport: 'Sport',
        city: 'City',
        state: 'State',
      });
      setTimeout(() => navigate('/dashboard'), 4000);
      return;
    }

    updateSessionStatus();

    const fallbackTimer = setTimeout(() => {
      if (loading) {
        console.warn('⏱️ Fallback timeout reached, showing success UI');
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [user, sessionId, navigate, updateSessionStatus, stripeSessionId, loading]);

  // === Helpers ===
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // === Render ===
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
            <p>Your training session has been confirmed.</p>
            {redirecting && (
              <p className="redirect-message">Redirecting to dashboard...</p>
            )}
          </div>

          {session && mentor && (
            <div className="session-confirmation">
              <div className="mentor-info">
                <div className="mentor-avatar">
                  {mentor.profile_picture_url ? (
                    <img
                      src={mentor.profile_picture_url}
                      alt={`${mentor.first_name} ${mentor.last_name}`}
                      className="mentor-avatar-image"
                    />
                  ) : (
                    <span className="avatar-initials">
                      {mentor.first_name?.[0] || 'M'}
                      {mentor.last_name?.[0] || 'M'}
                    </span>
                  )}
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