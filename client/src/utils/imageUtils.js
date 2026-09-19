const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const DEFAULT_LISTING_IMAGE =
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

/**
 * Resolves an image URL whether it is a local relative upload or external URL
 */
export const getImageUrl = (url, fallback = DEFAULT_LISTING_IMAGE) => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${SERVER_URL}${url.startsWith('/') ? url : '/' + url}`;
};

/**
 * Standard image error event handler to prevent broken-image icon
 */
export const handleImageError = (e, fallback = DEFAULT_LISTING_IMAGE) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};

/**
 * Format currency to INR style
 */
export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
