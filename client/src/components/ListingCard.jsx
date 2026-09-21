import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, Shield, ArrowRight } from 'lucide-react';
import { getImageUrl, handleImageError, formatCurrency, DEFAULT_LISTING_IMAGE, DEFAULT_AVATAR } from '../utils/imageUtils';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import InteractiveCard from './InteractiveCard';

const ListingCard = ({ listing, index = 0, isFavorited: initialFav = false, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [isFavorited, setIsFavorited] = useState(initialFav);
  const [favLoading, setFavLoading] = useState(false);

  // Find main image or fallback to first
  const mainImage =
    listing.images?.find((img) => img.isMain) ||
    listing.images?.[0] ||
    { url: DEFAULT_LISTING_IMAGE };

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please log in to save items to your favorites', 'warning');
      return;
    }

    try {
      setFavLoading(true);
      const res = await api.post(`/favorites/${listing._id}`);
      setIsFavorited(res.data.isFavorited);
      showToast(res.data.message, res.data.isFavorited ? 'success' : 'info');
      if (onFavoriteToggle) {
        onFavoriteToggle(listing._id, res.data.isFavorited);
      }
    } catch (err) {
      showToast('Failed to update favorite', 'error');
    } finally {
      setFavLoading(false);
    }
  };

  const handleCardClick = (e) => {
    // If clicking on favorite button or link, don't trigger duplicate navigate
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/listing/${listing._id}`);
  };

  return (
    <InteractiveCard
      index={index}
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-subtle hover:border-brand-300 dark:hover:border-slate-700 flex flex-col justify-between"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!e.target.closest('button')) {
            e.preventDefault();
            navigate(`/listing/${listing._id}`);
          }
        }
      }}
      role="article"
      aria-label={`${listing.title} - ${formatCurrency(listing.pricing?.perDay)} per day`}
    >
      <div>
        {/* Image Banner */}
        <div className="card-image-wrap aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
          <img
            src={getImageUrl(mainImage.url)}
            alt={listing.title}
            loading="lazy"
            onError={(e) => handleImageError(e, DEFAULT_LISTING_IMAGE)}
            className="w-full h-full object-cover card-image-zoom"
          />

          {/* Category Badge */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/75 text-white backdrop-blur-md shadow-sm">
              {listing.category}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleHeartClick}
            disabled={favLoading}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-rose-500 transition shadow-sm hover:scale-110 active:scale-90 z-10"
          >
            <Heart
              size={16}
              className={`${
                isFavorited
                  ? 'text-rose-500 fill-rose-500'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            />
          </button>

          {/* Condition tag */}
          {listing.rules?.condition && (
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md">
                {listing.rules.condition}
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              {listing.location?.city || 'Bengaluru'}
              {listing.location?.area ? `, ${listing.location.area}` : ''}
            </span>
            <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
              <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
              <span>{Number(listing.rating || 5.0).toFixed(1)}</span>
              <span className="text-slate-400 text-[11px]">({listing.reviewsCount || 0})</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/listing/${listing._id}`}
            className="block text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug"
          >
            {listing.title}
          </Link>
        </div>
      </div>

      {/* Pricing & Footer Bar */}
      <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
        <div>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(listing.pricing?.perDay)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400"> / day</span>
          {listing.pricing?.perHour > 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              or {formatCurrency(listing.pricing?.perHour)}/hr
            </p>
          )}
        </div>

        <Link
          to={`/listing/${listing._id}`}
          tabIndex={-1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-950/40 dark:group-hover:text-brand-400 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          <span>Borrow</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </InteractiveCard>
  );
};

export default ListingCard;

