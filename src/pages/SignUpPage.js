import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import './SignUpPage.css';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    age: null,
    city: '',
    state: '',
    sport: '',
    additionalSport: '',
    role: '',
    improvementAreas: [],
    teachingAreas: [],
    profilePictureUrl: '',
    hourlyRate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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

  const handleTeachingAreaChange = (area) => {
    setFormData(prev => ({
      ...prev,
      teachingAreas: prev.teachingAreas.includes(area)
        ? prev.teachingAreas.filter(a => a !== area)
        : [...prev.teachingAreas, area]
    }));
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: imageUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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

    if (!formData.firstName || !formData.lastName || !formData.city || !formData.state || !formData.sport || !formData.profilePictureUrl) {
      setError('Please fill in all required fields including profile picture');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age,
        city: formData.city,
        state: formData.state,
        sport: formData.sport,
        additionalSport: formData.additionalSport || null,
        role: formData.role,
        improvementAreas: formData.improvementAreas,
        teachingAreas: formData.teachingAreas,
        profilePictureUrl: formData.profilePictureUrl,
        hourlyRate: formData.hourlyRate
      });

      if (error) {
        console.error('SignUp error details:', error);
        setError(error.message || 'An error occurred during signup');
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account before signing in.');
        setTimeout(() => {
          if (selectedMentor) {
            navigate('/signin', { state: { selectedMentor } });
          } else {
            navigate('/signin');
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred: ' + err.message);
    }

    setLoading(false);
  };

  // ✅ UPDATED SPORTS LIST (alphabetical)
  const sports = [
    'Baseball',
    'Basketball',
    'Football',
    'Golf',
    'Gymnastics',
    'Soccer',
    'Softball',
    'Track & Field',
    'Volleyball',
    'Wrestling'
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

  const teachingAreas = [
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
            <label htmlFor="profilePicture">Profile Picture *</label>
            <ImageUpload
              userId="signup-temp"
              onImageUploaded={handleImageUpload}
              required={true}
            />
          </div>

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
            <label htmlFor="additionalSport">Additional Sport (Optional)</label>
            <select
              id="additionalSport"
              name="additionalSport"
              value={formData.additionalSport}
              onChange={handleChange}
            >
              <option value="">Select an additional sport</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            <small className="field-help">
              {formData.role === 'mentor' 
                ? 'Select another sport you can coach if applicable' 
                : 'Select another sport your child is interested in'
              }
            </small>
          </div>

          {formData.role === 'mentor' && (
            <div className="form-group">
              <label htmlFor="hourlyRate">Your Hourly Rate ($) (Optional)</label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 50.00"
              />
              <small className="field-help">
                This rate will be displayed on your profile. Parents will see this when browsing mentors.
              </small>
            </div>
          )}

          {formData.role === 'parent' && (
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
          )}

          {formData.role === 'mentor' && (
            <div className="form-group">
              <label className="improvement-label">What areas do you feel confident teaching? (Select all that apply)</label>
              <div className="improvement-areas">
                {teachingAreas.map(area => (
                  <div key={area} className="improvement-option">
                    <input
                      type="checkbox"
                      id={`teaching-${area}`}
                      checked={formData.teachingAreas.includes(area)}
                      onChange={() => handleTeachingAreaChange(area)}
                    />
                    <label htmlFor={`teaching-${area}`}>{area}</label>
                  </div>
                ))}
              </div>
              <small className="field-help">
                This helps us match you with parents looking for specific areas of improvement.
              </small>
            </div>
          )}

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