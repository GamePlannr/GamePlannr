import React from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, onRatingChange, size = 'medium', readOnly = false }) => {
  const handleStarClick = (starValue) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const renderStars = () => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      const isFilled = i <= rating;
      stars.push(
        <span
          key={i}
          className={`star ${isFilled ? 'filled' : 'empty'} ${size} ${!readOnly ? 'clickable' : ''}`}
          onClick={() => handleStarClick(i)}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  return (
    <div className={`star-rating ${size}`}>
      {renderStars()}
    </div>
  );
};

export default StarRating;
