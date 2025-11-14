import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './MentorSearchPage.css';

// ⭐ NEW — Format reviewer names (e.g., "Ryan K.")
const formatReviewerName = (first, last) => {
  if (!first) return '';
  if (!last) return first;
  const lastInitial = last.charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
};

const MentorSearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchFilters, setSearchFilters] = useState({
    city: '',
    state: '',
    sport: ''
  });

  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [mentorRatings, setMentorRatings] = useState({});
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

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

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

      setMentors(data || []);
      setFilteredMentors(data || []);
    } catch (err) {
      console.error('Unexpected error fetching mentors:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMentorRatings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          mentor_id,
          rating,
          comment,
          created_at,
          parent:parent_id (
            first_name,
            last_name
          )
        `);

      if (error) {
        console.error('Error fetching mentor ratings:', error);
        return;
      }

      const ratingsByMentor = {};
      data.forEach(rating => {
        if (!ratingsByMentor[rating.mentor_id]) {
          ratingsByMentor[rating.mentor_id] = [];
        }
        ratingsByMentor[rating.mentor_id].push(rating);
      });

      setMentorRatings(ratingsByMentor);
    } catch (err) {
      console.error('Error fetching mentor ratings:', err);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
    fetchMentorRatings();
  }, [fetchMentors, fetchMentorRatings]);

  useEffect(() => {
    let filtered = mentors;

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
        (mentor.sport && mentor.sport.toLowerCase() === searchFilters.sport.toLowerCase()) ||
        (mentor.additional_sport && mentor.additional_sport.toLowerCase() === searchFilters.sport.toLowerCase())
      );
    }

    setFilteredMentors(filtered);
  }, [searchFilters, mentors]);

  const handleFilterChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestSession = (mentorId) => {
    if (user) {
      navigate(`/request-session/${mentorId}`);
    } else {
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
                      {mentor.profile_picture_url ? (
                        <img 
                          src={mentor.profile_picture_url} 
                          alt={`${mentor.first_name} ${mentor.last_name}`}
                          className="mentor-avatar-image"
                        />
                      ) : (
                        <div className="default-avatar">
                          <span className="avatar-initials">
                            {mentor.first_name?.[0] || 'M'}{mentor.last_name?.[0] || 'M'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mentor-info">
                      <h3>{mentor.first_name} {mentor.last_name}</h3>
                      <p className="mentor-sport">
                        {mentor.sport}
                        {mentor.additional_sport && (
                          <span className="additional-sport">, {mentor.additional_sport}</span>
                        )}
                      </p>

                      <p className="mentor-location">{mentor.city}, {mentor.state}</p>
                      <p className="mentor-experience">{mentor.experience || 'Experienced mentor'}</p>

                      {mentor.hourly_rate && (
                        <p className="mentor-rate">${mentor.hourly_rate}/hour</p>
                      )}

                      {mentor.teaching_areas && mentor.teaching_areas.length > 0 && (
                        <div className="mentor-teaching-areas">
                          <span className="teaching-areas-label">Specializes in:</span>
                          <div className="teaching-areas-tags">
                            {mentor.teaching_areas.slice(0, 3).map((area, index) => (
                              <span key={index} className="teaching-area-tag">{area}</span>
                            ))}
                            {mentor.teaching_areas.length > 3 && (
                              <span className="teaching-area-tag more">+{mentor.teaching_areas.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ⭐ Mentor Rating Summary */}
                      {(() => {
                        const ratings = mentorRatings[mentor.id] || [];
                        const averageRating = ratings.length > 0 
                          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                          : null;

                        return (
                          <div className="mentor-rating">
                            {averageRating ? (
                              <>
                                <span className="stars">
                                  {'★'.repeat(Math.round(averageRating))}
                                  {'☆'.repeat(5 - Math.round(averageRating))}
                                </span>
                                <span className="rating-number">
                                  {averageRating} ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="stars">☆☆☆☆☆</span>
                                <span className="rating-number">No reviews yet</span>
                              </>
                            )}
                          </div>
                        );
                      })()}

                      <p className="mentor-bio">
                        {mentor.bio || 'Experienced mentor ready to help young athletes improve their skills.'}
                      </p>

                      {/* ⭐ Recent Reviews (UPDATED WITH NAME SHORTENER) */}
                      {(() => {
                        const ratings = mentorRatings[mentor.id] || [];
                        const recentReviews = ratings
                          .filter(r => r.comment)
                          .slice(0, 2);

                        return recentReviews.length > 0 && (
                          <div className="mentor-reviews">
                            <h4>Recent Reviews:</h4>
                            {recentReviews.map((review, index) => (
                              <div key={index} className="review-item">
                                <div className="review-header">
                                  
                                  {/* ⭐ UPDATED HERE */}
                                  <span className="reviewer-name">
                                    {formatReviewerName(
                                      review.parent?.first_name,
                                      review.parent?.last_name
                                    )}
                                  </span>

                                  <span className="review-rating">
                                    {'★'.repeat(review.rating)}
                                    {'☆'.repeat(5 - review.rating)}
                                  </span>
                                </div>

                                <p className="review-text">"{review.comment}"</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
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
                <h3>No mentors in your area yet</h3>
                <p>We’re growing every day—check back soon or adjust your search filters.</p>
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