import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { formatTime12Hour } from '../utils/timeFormat';
import Navbar from '../components/Navbar';
import RatingModal from '../components/RatingModal';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [recentStatusChanges, setRecentStatusChanges] = useState([]);
  const [dismissedNotices, setDismissedNotices] = useState(new Set());

  // === Fetch Session Requests ===
  const fetchSessionRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const { data, error } = await supabase
        .from('session_requests')
        .select(`
          *,
          mentor:mentor_id (
            first_name,
            last_name,
            sport
          )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching session requests:', error);
        return;
      }

      setSessionRequests(data || []);

      // Check for recent status changes
      const recentChanges = (data || []).filter(request => {
        if (request.status === 'accepted' || request.status === 'declined') {
          const updatedAt = new Date(request.updated_at);
          const now = new Date();
          const hoursDiff = (now - updatedAt) / (1000 * 60 * 60);
          return hoursDiff <= 24;
        }
        return false;
      });

      const visibleChanges = recentChanges.filter(change => !dismissedNotices.has(change.id));
      setRecentStatusChanges(visibleChanges);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setRequestsLoading(false);
    }
  }, [user.id, dismissedNotices]);

  // === Fetch Sessions ===
  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          mentor:mentor_id (
            id,
            first_name,
            last_name,
            sport
          )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }, [user.id]);

  // === Fetch Ratings ===
  const fetchRatings = useCallback(async () => {
    if (!user || profile?.role !== 'parent') return;

    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          session:sessions(*)
        `)
        .eq('parent_id', user.id);

      if (error) {
        console.error('Error fetching ratings:', error);
        return;
      }

      setRatings(data || []);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  }, [user, profile]);

  // === Handle Rating Modal ===
  const handleRateSession = (session) => {
    setSelectedSession(session);
    setRatingModalOpen(true);
  };

  const handleRatingSubmitted = () => {
    fetchRatings();
    fetchSessions();
  };

  // === Handle Stripe Payment (Updated for Netlify) ===
  const handleCompletePayment = async (session) => {
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: session.mentor_id,
          parentEmail: user.email,
          sessionId: session.id,
          amount: session.amount || 50, // fallback for safety
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        console.error('Stripe response error:', data);
        alert(data.error || 'Unable to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Something went wrong while starting checkout. Please try again.');
    }
  };

  // === Handle Notices ===
  const dismissNotice = (noticeId) => {
    setDismissedNotices(prev => new Set([...prev, noticeId]));
    setRecentStatusChanges(prev => prev.filter(change => change.id !== noticeId));
  };

  // === Page Initialization ===
  useEffect(() => {
    if (profile?.role === 'mentor') {
      navigate('/mentor-dashboard');
      return;
    }

    if (location.state?.selectedMentor) {
      setSelectedMentor(location.state.selectedMentor);
    }

    if (profile?.role === 'parent') {
      fetchSessionRequests();
      fetchSessions();
      fetchRatings();
    }
  }, [profile, navigate, location.state, fetchSessionRequests, fetchSessions, fetchRatings]);

  // === Loading States ===
  if (loading) return <div className="loading">Loading...</div>;

  if (!user) return <div className="loading">Please sign in to access the dashboard.</div>;

  if (!profile) {
    return (
      <div className="loading">
        <p>Loading your profile...</p>
        <p>If this takes too long, please check the browser console for errors.</p>
      </div>
    );
  }

  const isParent = profile.role === 'parent';
  const isMentor = profile.role === 'mentor';

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Welcome back, {profile.first_name}!</h1>
            <p>Role: {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
            {selectedMentor && (
              <div className="mentor-selection-notice">
                <p>Great! You're now ready to request a session with the mentor you selected.</p>
                <Link to="/mentors" className="btn btn-primary">
                  Continue to Mentor Search
                </Link>
              </div>
            )}
          </div>

          <div className="dashboard-content">
            {isParent && (
              <div className="parent-dashboard">
                {/* Session lists and payment */}
                <div className="dashboard-section">
                  <h2>Your Sessions</h2>
                  <p>View your confirmed and upcoming sessions</p>

                  {sessions.length === 0 ? (
                    <div className="sessions-placeholder">
                      <p>No confirmed sessions yet. Your accepted requests will appear here.</p>
                    </div>
                  ) : (
                    <div className="sessions-list">
                      {sessions.map(session => (
                        <div key={session.id} className="session-item">
                          <div className="session-info">
                            <h4>{session.mentor?.first_name} {session.mentor?.last_name} - {session.mentor?.sport}</h4>
                            <p className="session-date">
                              {new Date(session.scheduled_date).toLocaleDateString()} at {formatTime12Hour(session.scheduled_time)}
                            </p>
                            <p className="session-location">{session.location}</p>
                          </div>

                          <div className="session-status">
                            <span className={`status-badge status-${session.status}`}>
                              {session.status === 'awaiting_payment' && '⏳ Awaiting Payment'}
                              {session.status === 'paid' && '✓ Paid'}
                              {session.status === 'confirmed' && '✓ Confirmed'}
                              {session.status === 'completed' && '✓ Completed'}
                            </span>

                            {/* ✅ Stripe Payment */}
                            {session.status === 'awaiting_payment' && (
                              <button
                                className="btn btn-payment"
                                onClick={() => handleCompletePayment(session)}
                              >
                                Complete Payment
                              </button>
                            )}

                            {session.status === 'completed' && (() => {
                              const existingRating = ratings.find(r => r.session?.id === session.id);
                              return existingRating ? (
                                <div className="rating-submitted">
                                  <span className="rating-badge">
                                    ✓ Rated ({existingRating.rating}/5)
                                  </span>
                                  {existingRating.comment && (
                                    <div className="rating-review">
                                      <p className="review-text">"{existingRating.comment}"</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  className="btn btn-rate"
                                  onClick={() => handleRateSession(session)}
                                >
                                  Rate Session
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        session={selectedSession}
        mentor={selectedSession?.mentor}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};

export default DashboardPage;
