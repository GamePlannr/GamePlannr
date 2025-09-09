import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SessionRequestPage.css';

const SessionRequestPage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [mentor, setMentor] = useState(null);
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: '',
    location: '',
    duration: 60, // Default to 1 hour
    notes: '',
    paymentMethod: '',
    otherPaymentMethod: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMentorDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', mentorId)
        .eq('role', 'mentor')
        .single();

      if (error) {
        console.error('Error fetching mentor:', error);
        setError('Mentor not found');
        return;
      }

      setMentor(data);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load mentor details');
    }
  }, [mentorId]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (profile?.role !== 'parent') {
      navigate('/dashboard');
      return;
    }

    fetchMentorDetails();
  }, [user, profile, mentorId, navigate, fetchMentorDetails]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.preferredDate || !formData.preferredTime || !formData.location) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Create session request
      const { error } = await supabase
        .from('session_requests')
        .insert([
          {
            parent_id: user.id,
            mentor_id: mentorId,
            preferred_date: formData.preferredDate,
            preferred_time: formData.preferredTime,
            location: formData.location,
            duration_minutes: formData.duration,
            notes: formData.notes || null,
            payment_method: formData.paymentMethod,
            other_payment_method: formData.paymentMethod === 'other' ? formData.otherPaymentMethod : null,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating session request:', error);
        setError('Failed to submit request. Please try again.');
        return;
      }

      // No email sent when session request is made - only when mentor responds

      setSuccess('Session request submitted successfully! The mentor will review your request and get back to you soon.');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!mentor) {
    return (
      <div className="session-request-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading mentor details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="session-request-page">
      <Navbar />
      
      <main className="request-main">
        <div className="request-container">
          <div className="request-header">
            <h1>Request a Session</h1>
            <p>Fill out the details below to request a training session</p>
          </div>

          <div className="request-content">
            <div className="mentor-summary">
              <div className="mentor-avatar">
                {mentor.profile_picture_url ? (
                  <img 
                    src={mentor.profile_picture_url} 
                    alt={`${mentor.first_name} ${mentor.last_name}`}
                    className="mentor-avatar-image"
                  />
                ) : (
                  <span className="avatar-initials">
                    {mentor.first_name?.[0] || 'M'}{mentor.last_name?.[0] || 'M'}
                  </span>
                )}
              </div>
              <div className="mentor-details">
                <h3>{mentor.first_name} {mentor.last_name}</h3>
                <p className="mentor-sport">{mentor.sport}, {mentor.additional_sport}</p>
                <p className="mentor-location">{mentor.city}, {mentor.state}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="request-form">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-section">
                <h3>Session Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredDate">Preferred Date *</label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="preferredTime">Preferred Time *</label>
                    <input
                      type="time"
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Local park, Sports facility, Your home"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Session Duration *</label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any specific skills you'd like to focus on, special requirements, or other details..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="paymentMethod">Preferred Way to Pay Mentor *</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="venmo">Venmo</option>
                    <option value="paypal">PayPal</option>
                    <option value="zelle">Zelle</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                  
                  {formData.paymentMethod === 'other' && (
                    <input
                      type="text"
                      name="otherPaymentMethod"
                      value={formData.otherPaymentMethod}
                      onChange={handleChange}
                      placeholder="Please specify your preferred payment method"
                      className="other-payment-input"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate('/mentors')}
                >
                  Back to Mentors
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SessionRequestPage;
