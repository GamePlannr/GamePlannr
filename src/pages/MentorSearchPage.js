import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './MentorSearchPage.css';

const MentorSearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    state: '',
    sport: ''
  });
  
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sports = [
    'Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'Swimming',
    'Track & Field', 'Volleyball', 'Golf', 'Hockey', 'Lacrosse', 'Wrestling',
    'Gymnastics', 'Martial Arts', 'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
    'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
    'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
    'WI', 'WY'
  ];

  useEffect(() => {
    fetchMentors();
  }, [user]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch only mentors (role = 'mentor') from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentors:', error);
        setError('Failed to load mentors. Please try again.');
        return;
      }

      console.log('Fetched mentors from Supabase:', data);
      
      // Filter out the current user's profile if they are a mentor
      let mentorsData = data || [];
      if (user) {
        mentorsData = mentorsData.filter(mentor => mentor.id !== user.id);
        console.log('Filtered out current user, remaining mentors:', mentorsData);
      }
      
      setMentors(mentorsData);
      setFilteredMentors(mentorsData);
    } catch (err) {
      console.error('Unexpected error fetching mentors:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter mentors based on search criteria
    let filtered = mentors;
    
    // Always exclude the current user if they are logged in
    if (user) {
      filtered = filtered.filter(mentor => mentor.id !== user.id);
    }
    
    if (searchFilters.city) {
      filtered = filtered.filter(mentor => 
        mentor.city && mentor.city.toLowerCase().includes(searchFilters.city.toLowerCase())
      );
    }
    
    if (searchFilters.state) {
      filtered = filtered.filter(mentor => 
        mentor.state && mentor.state === searchFilters.state
      );
    }
    
    if (searchFilters.sport) {
      filtered = filtered.filter(mentor => 
        mentor.sport && mentor.sport.toLowerCase() === searchFilters.sport.toLowerCase()
      );
    }
    
    setFilteredMentors(filtered);
  }, [searchFilters, mentors, user]);

  const handleFilterChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestSession = (mentorId) => {
    if (user) {
      // User is logged in, redirect to session request page
      navigate(`/request-session/${mentorId}`);
    } else {
      // User not logged in, redirect to sign up with mentor info
      navigate('/signup', { state: { selectedMentor: mentorId } });
    }
  };

  const clearFilters = () => {
    setSearchFilters({
      city: '',
      state: '',
      sport: ''
    });
  };

  return (
    <div className="mentor-search-page">
      <Navbar />
      
      <main className="search-main">
        <div className="search-container">
          <div className="search-header">
            <h1>Find Your Perfect Mentor</h1>
            <p>Connect with experienced athletes who can help your child excel</p>
          </div>

          <div className="search-filters">
            <div className="filter-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter city name"
                value={searchFilters.city}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={searchFilters.state}
                onChange={handleFilterChange}
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sport">Sport</label>
              <select
                id="sport"
                name="sport"
                value={searchFilters.sport}
                onChange={handleFilterChange}
              >
                <option value="">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <button 
              type="button" 
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <div className="results-section">
            <div className="results-header">
              <h2>
                {loading ? 'Loading mentors...' : `${filteredMentors.length} mentors found`}
              </h2>
              {user && (
                <p className="mentor-note">
                  Note: Your own profile is not shown in search results.
                </p>
              )}
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button 
                  className="retry-btn"
                  onClick={fetchMentors}
                >
                  Try Again
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-mentors">
                <div className="loading-spinner"></div>
                <p>Finding the best mentors for you...</p>
              </div>
            ) : (
              <div className="mentors-grid">
                {filteredMentors.map(mentor => (
                  <div key={mentor.id} className="mentor-card">
                    <div className="mentor-photo">
                      <div className="default-avatar">
                        <span className="avatar-initials">
                          {mentor.first_name?.[0] || 'M'}{mentor.last_name?.[0] || 'M'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mentor-info">
                      <h3>{mentor.first_name} {mentor.last_name}</h3>
                      <p className="mentor-sport">{mentor.sport}</p>
                      <p className="mentor-location">{mentor.city}, {mentor.state}</p>
                      <p className="mentor-experience">{mentor.experience || 'Experienced mentor'}</p>
                      <div className="mentor-rating">
                        <span className="stars">★★★★★</span>
                        <span className="rating-number">4.8</span>
                      </div>
                      <p className="mentor-bio">{mentor.bio || 'Experienced mentor ready to help young athletes improve their skills.'}</p>
                    </div>
                    
                    <div className="mentor-actions">
                      <button 
                        className="request-session-btn"
                        onClick={() => handleRequestSession(mentor.id)}
                      >
                        Request Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredMentors.length === 0 && (
              <div className="no-results">
                <h3>No mentors found</h3>
                <p>Try adjusting your search filters to find more mentors.</p>
                <button 
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentorSearchPage;
