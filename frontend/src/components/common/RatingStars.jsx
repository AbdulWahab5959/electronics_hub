// src/components/common/RatingStars.jsx
import { useState } from 'react';
import { Star } from '@phosphor-icons/react/dist/csr/Star';
import { StarHalf } from '@phosphor-icons/react/dist/csr/StarHalf';

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
      return <Star size={config.star} weight="fill" aria-hidden="true" />;
    }
    if (type === 'half') {
      return <StarHalf size={config.star} weight="fill" aria-hidden="true" />;
    }
    return <Star size={config.star} weight="regular" aria-hidden="true" />;
  };

  const sizeConfig = {
    sm: { star: 16, gap: 2, fontSize: 12 },
    md: { star: 20, gap: 4, fontSize: 14 },
    lg: { star: 28, gap: 6, fontSize: 16 },
  };

  const config = sizeConfig[size];

  return (
    <div className="rating-stars-premium">
      <div className="stars-row" role={readonly ? 'img' : undefined} aria-label={readonly ? `Rated ${Number(rating).toFixed(1)} out of 5` : undefined}>
        {stars.map((star) => (
          readonly ? <span key={star} aria-hidden="true" className="star-button" style={{ width: config.star, height: config.star }}><StarIcon type={getStarType(star)} /></span> : <button
            type="button"
            aria-label={`Rate ${star} out of 5`}
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
          <span className="rating-average">{Number(rating).toFixed(1)}</span>
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
