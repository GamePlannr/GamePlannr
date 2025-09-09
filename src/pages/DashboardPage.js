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
      
      // Check for recent status changes (accepted or declined in last 24 hours)
      const recentChanges = (data || []).filter(request => {
        if (request.status === 'accepted' || request.status === 'declined') {
          const updatedAt = new Date(request.updated_at);
          const now = new Date();
          const hoursDiff = (now - updatedAt) / (1000 * 60 * 60);
          return hoursDiff <= 24; // Show notices for changes in last 24 hours
        }
        return false;
      });
      
      // Filter out dismissed notices
      const visibleChanges = recentChanges.filter(change => !dismissedNotices.has(change.id));
      setRecentStatusChanges(visibleChanges);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setRequestsLoading(false);
    }
  }, [user.id, dismissedNotices]);

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

  const handleRateSession = (session) => {
    setSelectedSession(session);
    setRatingModalOpen(true);
  };

  const handleRatingSubmitted = () => {
    fetchRatings();
    fetchSessions();
  };

  const dismissNotice = (noticeId) => {
    setDismissedNotices(prev => new Set([...prev, noticeId]));
    // Also update the recentStatusChanges to remove the dismissed notice
    setRecentStatusChanges(prev => prev.filter(change => change.id !== noticeId));
  };

  useEffect(() => {
    // Redirect mentors to mentor dashboard
    if (profile?.role === 'mentor') {
      navigate('/mentor-dashboard');
      return;
    }

    // Check if user came from mentor search with selected mentor
    if (location.state?.selectedMentor) {
      setSelectedMentor(location.state.selectedMentor);
    }

    // Fetch session requests and sessions for parents
    if (profile?.role === 'parent') {
      fetchSessionRequests();
      fetchSessions();
      fetchRatings();
    }
  }, [profile, navigate, location.state, fetchSessionRequests, fetchSessions, fetchRatings]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="loading">Please sign in to access the dashboard.</div>;
  }

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
                {/* Recent Status Change Notices */}
                {recentStatusChanges.length > 0 && (
                  <div className="status-notices">
                    <h3>📢 Recent Updates</h3>
                    {recentStatusChanges.map(change => (
                      <div key={change.id} className={`status-notice ${change.status}`}>
                        <div className="notice-content">
                          {change.status === 'accepted' && (
                            <>
                              <span className="notice-icon">✅</span>
                              <div className="notice-text">
                                <strong>Great news!</strong> {change.mentor?.first_name} {change.mentor?.last_name} has accepted your {change.mentor?.sport} session request for {new Date(change.preferred_date).toLocaleDateString()}.
                                <br />
                                <small>Check your sessions below to complete payment.</small>
                              </div>
                            </>
                          )}
                          {change.status === 'declined' && (
                            <>
                              <span className="notice-icon">❌</span>
                              <div className="notice-text">
                                <strong>Update:</strong> {change.mentor?.first_name} {change.mentor?.last_name} is unable to accommodate your {change.mentor?.sport} session request for {new Date(change.preferred_date).toLocaleDateString()}.
                                <br />
                                <small>Don't worry! You can find other qualified mentors below.</small>
                              </div>
                            </>
                          )}
                          <button 
                            className="dismiss-btn"
                            onClick={() => dismissNotice(change.id)}
                            title="Dismiss this notice"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="dashboard-section">
                  <h2>Find a Mentor</h2>
                  <p>Search for local sports mentors in your area</p>
                  <Link to="/mentors" className="btn btn-primary">
                    Browse Mentors
                  </Link>
                </div>

                <div className="dashboard-section">
                  <h2>Your Session Requests</h2>
                  <p>View your submitted session requests and their status</p>
                  
                  {requestsLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading session requests...</p>
                    </div>
                  ) : sessionRequests.length === 0 ? (
                    <div className="sessions-placeholder">
                      <p>No session requests yet. Find a mentor to get started!</p>
                      <Link to="/mentors" className="btn btn-primary">
                        Find Mentors
                      </Link>
                    </div>
                  ) : (
                    <div className="requests-list">
                      {sessionRequests.map(request => (
                        <div key={request.id} className="request-item">
                          <div className="request-info">
                            <h4>{request.mentor?.first_name} {request.mentor?.last_name} - {request.mentor?.sport}</h4>
                            <p className="request-date">{new Date(request.preferred_date).toLocaleDateString()} at {formatTime12Hour(request.preferred_time)}</p>
                            <p className="request-location">{request.location}</p>
                          </div>
                          <div className="request-status">
                            <span className={`status-badge status-${request.status}`}>
                              {request.status === 'pending' && '⏳ Pending'}
                              {request.status === 'accepted' && '✓ Accepted'}
                              {request.status === 'declined' && '✕ Declined'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                            <p className="session-date">{new Date(session.scheduled_date).toLocaleDateString()} at {formatTime12Hour(session.scheduled_time)}</p>
                            <p className="session-location">{session.location}</p>
                          </div>
                          <div className="session-status">
                            <span className={`status-badge status-${session.status}`}>
                              {session.status === 'awaiting_payment' && '⏳ Awaiting Payment'}
                              {session.status === 'paid' && '✓ Paid'}
                              {session.status === 'confirmed' && '✓ Confirmed'}
                              {session.status === 'completed' && '✓ Completed'}
                            </span>
                            {session.status === 'awaiting_payment' && (
                              <Link 
                                to={`/payment/${session.id}`} 
                                className="btn btn-payment"
                              >
                                Complete Payment
                              </Link>
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

                <div className="dashboard-section">
                  <h2>Quick Actions</h2>
                  <div className="quick-actions">
                    <Link to="/profile" className="action-card">
                      <h3>Update Profile</h3>
                      <p>Keep your information current</p>
                    </Link>
                    <Link to="/mentors" className="action-card">
                      <h3>Find Mentors</h3>
                      <p>Search by sport and location</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {isMentor && (
              <div className="mentor-dashboard">
                <div className="dashboard-section">
                  <h2>Session Requests</h2>
                  <p>Review and respond to session requests from parents</p>
                  <div className="requests-placeholder">
                    <p>No pending requests at the moment.</p>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Your Sessions</h2>
                  <p>Manage your upcoming and completed sessions</p>
                  <div className="sessions-placeholder">
                    <p>No sessions scheduled yet.</p>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Quick Actions</h2>
                  <div className="quick-actions">
                    <Link to="/profile" className="action-card">
                      <h3>Update Profile</h3>
                      <p>Keep your mentor profile current</p>
                    </Link>
                    <Link to="/availability" className="action-card">
                      <h3>Set Availability</h3>
                      <p>Update when you're available</p>
                    </Link>
                  </div>
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
