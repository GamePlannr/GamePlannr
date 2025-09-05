import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

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
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setRequestsLoading(false);
    }
  }, [user.id]);

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
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
        console.error('Error fetching sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }, [user.id]);

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
    }
  }, [profile, navigate, location.state, fetchSessionRequests, fetchSessions]);

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
                            <p className="request-date">{new Date(request.preferred_date).toLocaleDateString()} at {request.preferred_time}</p>
                            <p className="request-location">{request.location}</p>
                          </div>
                          <div className="request-status">
                            <span className={`status-badge status-${request.status}`}>
                              {request.status === 'pending' && '◐ Pending'}
                              {request.status === 'accepted' && '● Accepted'}
                              {request.status === 'declined' && '○ Declined'}
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
                            <p className="session-date">{new Date(session.scheduled_date).toLocaleDateString()} at {session.scheduled_time}</p>
                            <p className="session-location">{session.location}</p>
                          </div>
                          <div className="session-status">
                            <span className={`status-badge status-${session.status}`}>
                              {session.status === 'awaiting_payment' && '◐ Awaiting Payment'}
                              {session.status === 'paid' && '● Paid'}
                              {session.status === 'confirmed' && '● Confirmed'}
                            </span>
                            {session.status === 'awaiting_payment' && (
                              <Link 
                                to={`/payment/${session.id}`} 
                                className="btn btn-payment"
                              >
                                Complete Payment
                              </Link>
                            )}
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
    </div>
  );
};

export default DashboardPage;
