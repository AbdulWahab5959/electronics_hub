// src/components/common/RatingStars.jsx
import React, { useState } from 'react';

export const RatingStars = ({ 
  rating = 0, 
  totalReviews = 0,
  size = 'md',
  readonly = true,
  onRate,
  showCount = true,
  showAverage = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const stars = [1, 2, 3, 4, 5];

  const handleClick = (star) => {
    if (readonly) return;
    setCurrentRating(star);
    onRate?.(star);
  };

  const getStarType = (star) => {
    const value = readonly ? rating : (hoverRating || currentRating);
    
    if (star <= Math.floor(value)) return 'full';
    if (star === Math.ceil(value) && value % 1 >= 0.5) return 'half';
    return 'empty';
  };

  const StarIcon = ({ type }) => {
    if (type === 'full') {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    if (type === 'half') {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2v15.27z"/>
          <path d="M12 2v15.27L5.82 21l1.64-7.03L2 9.24l7.19-.61L12 2z" fillOpacity="0.3"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    );
  };

  const sizeConfig = {
    sm: { star: 16, gap: 2, fontSize: 12 },
    md: { star: 20, gap: 4, fontSize: 14 },
    lg: { star: 28, gap: 6, fontSize: 16 },
  };

  const config = sizeConfig[size];

  return (
    <div className="rating-stars-premium">
      <div className="stars-row">
        {stars.map((star) => (
          <button
            key={star}
            className={`star-button ${!readonly ? 'interactive' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            style={{ width: config.star, height: config.star }}
          >
            <StarIcon type={getStarType(star)} />
          </button>
        ))}
      </div>
      
      <div className="rating-info">
        {showAverage && rating > 0 && (
          <span className="rating-average">{rating.toFixed(1)}</span>
        )}
        {showCount && totalReviews > 0 && (
          <span className="rating-total">
            {totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>
    </div>
  );
};