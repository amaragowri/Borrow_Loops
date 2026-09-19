import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle,
  AlertCircle,
  Share2,
  Heart,
  Truck,
  FileText,
  User,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ImageGallery from '../components/ImageGallery';
import RatingStars from '../components/RatingStars';
import PriceBreakdown from '../components/PriceBreakdown';
import PaymentModal from '../components/PaymentModal';
import { formatCurrency, getImageUrl, DEFAULT_AVATAR } from '../utils/imageUtils';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Booking Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(dayAfter.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [durationUnit, setDurationUnit] = useState('days');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [handoverNotes, setHandoverNotes] = useState('');

  // Availability & Calculation state
  const [isCheckingAvail, setIsCheckingAvail] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null); // { available: bool, reason: string }
  const [pricingCalculation, setPricingCalculation] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/reviews/${id}/reviews`),
        ]);

        if (listingRes.data.success) {
          setListing(listingRes.data.listing);
          setBookedRanges(listingRes.data.bookedRanges || []);
        }

        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch (err) {
        showToast('Listing not found or unavailable', 'error');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [id, navigate]);

  // Recalculate frontend price estimate whenever dates/times change
  useEffect(() => {
    if (!listing || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      setPricingCalculation(null);
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    let duration;
    let basePrice = 0;

    if (durationUnit === 'hours') {
      const hours = Math.ceil(diffMs / (1000 * 60 * 60)) || 1;
      duration = hours;
      const hourlyRate = listing.pricing.perHour || Math.round(listing.pricing.perDay / 8);
      basePrice = hours * hourlyRate;
    } else {
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;
      duration = days;
      if (days >= 7 && listing.pricing.perWeek > 0) {
        const weeks = Math.floor(days / 7);
        const rem = days % 7;
        basePrice = weeks * listing.pricing.perWeek + rem * listing.pricing.perDay;
      } else {
        basePrice = days * listing.pricing.perDay;
      }
    }

    const securityDeposit = listing.pricing?.securityDeposit || 0;
    const serviceFee = Math.round(basePrice * 0.05);
    const totalAmount = basePrice + serviceFee + securityDeposit;

    setPricingCalculation({
      duration,
      durationUnit,
      basePrice,
      securityDeposit,
      serviceFee,
      totalAmount,
    });
  }, [listing, startDate, endDate, durationUnit]);

  // Check Availability
  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      showToast('Please select both start date and end date', 'warning');
      return;
    }

    setIsCheckingAvail(true);
    setAvailabilityStatus(null);

    try {
      const res = await api.get(`/listings/${id}/availability?startDate=${startDate}&endDate=${endDate}`);
      setAvailabilityStatus(res.data);
      if (res.data.available) {
        showToast('Great! These dates are available for borrowing.', 'success');
      } else {
        showToast(res.data.reason || 'Dates are unavailable.', 'error');
      }
    } catch (err) {
      setAvailabilityStatus({
        available: false,
        reason: err.response?.data?.message || 'Conflict detected for selected range.',
      });
      showToast(err.response?.data?.message || 'Date selection conflict.', 'error');
    } finally {
      setIsCheckingAvail(false);
    }
  };

  // Submit Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please log in or register to book this item', 'warning');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (listing.owner?._id === user._id) {
      showToast('You cannot borrow your own listing', 'error');
      return;
    }

    try {
      setIsCheckingAvail(true);

      const bookingPayload = {
        listingId: listing._id,
        startDate,
        endDate,
        startTime,
        endTime,
        durationUnit,
        paymentMethod,
        handoverNotes,
      };

      const res = await api.post('/bookings', bookingPayload);
      if (res.data.success) {
        setCreatedBooking(res.data.booking);
        setPaymentModalOpen(true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create booking', 'error');
    } finally {
      setIsCheckingAvail(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      showToast('Please log in to add to favorites', 'warning');
      return;
    }
    try {
      const res = await api.post(`/favorites/${listing._id}`);
      setIsFavorited(res.data.isFavorited);
      showToast(res.data.message, res.data.isFavorited ? 'success' : 'info');
    } catch (err) {
      showToast('Failed to toggle favorite', 'error');
    }
  };

  if (loading || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const isOwner = user && listing.owner?._id === user._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to={`/explore?category=${listing.category}`} className="hover:underline">{listing.category}</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 truncate max-w-xs">{listing.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              {Number(listing.rating || 5.0).toFixed(1)} ({listing.reviewsCount || 0} reviews)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-slate-400" />
              {listing.location.city}, {listing.location.area || ''}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
              {listing.rules?.condition || 'Like New'}
            </span>
          </div>
        </div>

        {/* Favorite & Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Heart size={16} className={isFavorited ? 'text-rose-500 fill-rose-500' : ''} />
            <span>{isFavorited ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Listing link copied to clipboard!', 'success');
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            aria-label="Share listing"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Content: Gallery (Left) & Booking Widget (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Side: Media Gallery & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Image Gallery */}
          <ImageGallery images={listing.images} title={listing.title} />

          {/* Description & Overview */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Item Overview & Description
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Rules & Guidelines */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Rules, Delivery & Requirements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Truck size={16} className="text-brand-600" />
                  <span>Handover Mode</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                  {listing.rules?.pickupOrDelivery === 'both' ? 'Pickup & Delivery Available' : `${listing.rules?.pickupOrDelivery} Only`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Cancellation Policy</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {listing.rules?.cancellationPolicy || 'Flexible refund policy.'}
                </p>
              </div>
            </div>

            {listing.rules?.usageInstructions && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Usage Instructions:</span>
                <p>{listing.rules.usageInstructions}</p>
              </div>
            )}
          </div>

          {/* Lender Profile Card */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Meet the Lender
            </h2>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={getImageUrl(listing.owner?.avatar?.url, DEFAULT_AVATAR)}
                  alt={listing.owner?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-500/20"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {listing.owner?.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {listing.owner?.location || 'Verified Lender'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={listing.owner?.rating || 5.0} count={listing.owner?.ratingsCount || 0} size={14} />
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                {listing.owner?.bio || 'Passionate community member sharing high quality gear.'}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-brand-600" />
                <span>Borrower Reviews ({reviews.length})</span>
              </h2>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No reviews yet. Be the first to rent and review this item!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getImageUrl(rev.reviewer?.avatar?.url, DEFAULT_AVATAR)}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {rev.reviewer?.name || 'Borrower'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} showNumber={false} size={13} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sticky Interactive Booking Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
            {/* Rates Header */}
            <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(listing.pricing?.perDay)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> / day</span>
              </div>
              {listing.pricing?.perHour > 0 && (
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {formatCurrency(listing.pricing.perHour)} / hr
                </span>
              )}
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Duration Unit Choice */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDurationUnit('days')}
                  className={`py-1.5 rounded-lg transition ${
                    durationUnit === 'days'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  By Day
                </button>
                <button
                  type="button"
                  onClick={() => setDurationUnit('hours')}
                  className={`py-1.5 rounded-lg transition ${
                    durationUnit === 'hours'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  By Hour
                </button>
              </div>

              {/* Date Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setAvailabilityStatus(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setAvailabilityStatus(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Time Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Check Availability Button */}
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={isCheckingAvail}
                className="w-full py-2.5 rounded-xl border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30 hover:bg-brand-100 dark:hover:bg-brand-900/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Calendar size={14} />
                <span>{isCheckingAvail ? 'Checking Overlap...' : 'Verify Real-time Availability'}</span>
              </button>

              {/* Availability Notice */}
              {availabilityStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    availabilityStatus.available
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {availabilityStatus.available ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{availabilityStatus.reason}</span>
                </div>
              )}

              {/* Payment Mode Selection */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Payment Option
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'online'
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="hidden"
                    />
                    <span>💳 Pay Online</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'offline'
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="offline"
                      checked={paymentMethod === 'offline'}
                      onChange={() => setPaymentMethod('offline')}
                      className="hidden"
                    />
                    <span>🤝 Pay Offline</span>
                  </label>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <PriceBreakdown calculation={pricingCalculation} pricingRule={listing.pricing} />

              {/* Submit CTA */}
              {isOwner ? (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-500">
                  This is your listing. You cannot borrow your own item.
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isCheckingAvail || (availabilityStatus && !availabilityStatus.available)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-sm shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Request to Borrow</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </form>

            <div className="text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                You won't be charged until the lender approves your request.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        booking={createdBooking}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={() => {
          setPaymentModalOpen(false);
          navigate('/dashboard?tab=borrower');
        }}
      />
    </div>
  );
};

export default ListingDetailPage;
