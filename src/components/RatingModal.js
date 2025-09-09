import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { formatTime12Hour } from '../utils/timeFormat';
import StarRating from './StarRating';
import './RatingModal.css';

const RatingModal = ({ isOpen, onClose, session, mentor, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Debug logging
  console.log('RatingModal props:', { session, mentor });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('Submitting rating with data:', {
        session_id: session.id,
        mentor_id: mentor.id,
        parent_id: session.parent_id,
        rating: rating,
        comment: review.trim() || null
      });
      
      const { error: insertError } = await supabase
        .from('ratings')
        .insert([
          {
            session_id: session.id,
            mentor_id: mentor.id,
            parent_id: session.parent_id,
            rating: rating,
            comment: review.trim() || null,
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      // Call the callback to refresh data
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <div className="rating-modal-header">
          <h2>Rate Your Session</h2>
          <button className="close-button" onClick={handleClose}>✕</button>
        </div>

        <div className="rating-modal-content">
          <div className="mentor-info">
            <h3>Session with {mentor?.first_name} {mentor?.last_name}</h3>
            <p>{new Date(session?.scheduled_date).toLocaleDateString()} at {formatTime12Hour(session?.scheduled_time)}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>How would you rate this session?</label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="large"
              />
            </div>

            <div className="review-section">
              <label htmlFor="review">
                Write a review (optional)
                <span className="review-note">Help other parents by sharing your experience</span>
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this mentor... What did you like? How did the session go? Any tips for other parents?"
                rows="4"
                maxLength="500"
              />
              <div className="character-count">
                {review.length}/500 characters
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || rating === 0}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
