import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignUpPage.css';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    age: '',
    city: '',
    state: '',
    sport: '',
    role: '',
    improvementAreas: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user came from mentor search with selected mentor
    if (location.state?.selectedMentor) {
      setSelectedMentor(location.state.selectedMentor);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImprovementAreaChange = (area) => {
    setFormData(prev => ({
      ...prev,
      improvementAreas: prev.improvementAreas.includes(area)
        ? prev.improvementAreas.filter(a => a !== area)
        : [...prev.improvementAreas, area]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.role || (formData.role !== 'parent' && formData.role !== 'mentor')) {
      setError('Please select a valid role');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.city || !formData.state || !formData.sport) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        city: formData.city,
        state: formData.state,
        sport: formData.sport,
        role: formData.role,
        improvementAreas: formData.improvementAreas
      });

      if (error) {
        console.error('SignUp error details:', error);
        setError(error.message || 'An error occurred during signup');
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        // Navigate to sign in with selected mentor info
        if (selectedMentor) {
          navigate('/signin', { state: { selectedMentor } });
        } else {
          navigate('/signin');
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred: ' + err.message);
    }

    setLoading(false);
  };

  const sports = [
    'Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'Swimming',
    'Track & Field', 'Volleyball', 'Golf', 'Hockey', 'Lacrosse', 'Wrestling',
    'Gymnastics', 'Martial Arts', 'Other'
  ];

  const improvementAreas = [
    'Offense',
    'Defense',
    'Footwork',
    'Conditioning / Fitness',
    'Confidence Building',
    'Teamwork / Communication',
    'Game IQ / Strategy'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
    'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
    'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
    'WI', 'WY'
  ];

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Join GamePlannr</h1>
          <p>Create your account to connect with sports mentors</p>
          {selectedMentor && (
            <div className="mentor-selection-notice">
              <p>You're signing up to request a session with a mentor!</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select a role</option>
              <option value="parent">Parent</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select a state</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sport">Sport *</label>
            <select
              id="sport"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              required
            >
              <option value="">Select a sport</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="improvement-label">What areas does your athlete want to improve in?</label>
            <div className="improvement-areas">
              {improvementAreas.map(area => (
                <div key={area} className="improvement-option">
                  <input
                    type="checkbox"
                    id={area}
                    checked={formData.improvementAreas.includes(area)}
                    onChange={() => handleImprovementAreaChange(area)}
                  />
                  <label htmlFor={area}>{area}</label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="signup-footer">
            <p>Already have an account? <Link to="/signin">Sign In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
