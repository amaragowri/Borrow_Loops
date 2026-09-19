import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, count, showNumber = true, size = 16, interactive = false, onRatingChange }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            } ${interactive ? 'cursor-pointer transition hover:scale-110' : ''}`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
