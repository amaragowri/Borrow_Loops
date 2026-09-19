import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Heart,
  Settings,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  Star,
  User,
  Loader2,
  Trash2,
  PauseCircle,
  PlayCircle,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ListingCard from '../components/ListingCard';
import RatingStars from '../components/RatingStars';
import EmptyState from '../components/EmptyState';
import { formatCurrency, getImageUrl, DEFAULT_AVATAR, DEFAULT_LISTING_IMAGE } from '../utils/imageUtils';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  // Data states
  const [borrowerBookings, setBorrowerBookings] = useState([]);
  const [lenderBookings, setLenderBookings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Settings State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileLocation, setProfileLocation] = useState(user?.location || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileLocation(user.location || '');
      setProfileBio(user.bio || '');
    }
  }, [user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [borrowerRes, lenderRes, listingsRes, favsRes] = await Promise.all([
        api.get('/bookings/my?role=borrower'),
        api.get('/bookings/my?role=lender'),
        api.get(`/listings?owner=${user?._id}&status=all`),
        api.get('/favorites'),
      ]);

      if (borrowerRes.data.success) setBorrowerBookings(borrowerRes.data.bookings || []);
      if (lenderRes.data.success) setLenderBookings(lenderRes.data.bookings || []);
      if (listingsRes.data.success) setMyListings(listingsRes.data.listings || []);
      if (favsRes.data.success) setFavorites(favsRes.data.listings || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Lender Actions: Approve / Reject / Active / Complete
  const handleUpdateBookingStatus = async (bookingId, status, reason = '') => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status, reason });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  // Borrower Cancel
  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (reason === null) return;

    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      if (res.data.success) {
        showToast(res.data.message, 'info');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  // Toggle Listing Status (Active <-> Paused)
  const handleToggleListingStatus = async (listing) => {
    const newStatus = listing.status === 'active' ? 'paused' : 'active';
    try {
      const res = await api.put(`/listings/${listing._id}`, { status: newStatus });
      if (res.data.success) {
        showToast(`Listing is now ${newStatus}.`, 'info');
        fetchDashboardData();
      }
    } catch (err) {
      showToast('Failed to update listing', 'error');
    }
  };

  // Delete Listing
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;

    try {
      const res = await api.delete(`/listings/${listingId}`);
      if (res.data.success) {
        showToast('Listing removed successfully', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast('Failed to remove listing', 'error');
    }
  };

  // Submit Review Modal
  const handleOpenReview = (bookingId) => {
    setReviewBookingId(bookingId);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please enter a comment for your review', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: reviewBookingId,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.data.success) {
        showToast('Review published! Thank you.', 'success');
        setReviewModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Save Settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('phone', profilePhone);
      formData.append('location', profileLocation);
      formData.append('bio', profileBio);
      if (profileAvatarFile) {
        formData.append('avatar', profileAvatarFile);
      }

      await updateProfile(formData);
      showToast('Profile settings updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile settings', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Compute stats
  const activeBorrowingsCount = borrowerBookings.filter(
    (b) => b.bookingStatus === 'active' || b.bookingStatus === 'confirmed'
  ).length;

  const totalSpent = borrowerBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

  const totalEarned = lenderBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.pricing?.basePrice || 0), 0);

  const pendingLenderRequests = lenderBookings.filter(
    (b) => b.bookingStatus === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={getImageUrl(user?.avatar?.url, DEFAULT_AVATAR)}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs text-slate-300">
              {user?.location || 'Bengaluru, India'} • Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Link
          to="/add-listing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold text-sm shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>List New Item</span>
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'borrower', label: `My Borrowings (${borrowerBookings.length})`, icon: ShoppingBag },
          {
            id: 'lender',
            label: `Lender Hub (${myListings.length} items)`,
            icon: Package,
            badge: pendingLenderRequests.length > 0 ? pendingLenderRequests.length : null,
          },
          { id: 'favorites', label: `Favorites (${favorites.length})`, icon: Heart },
          { id: 'settings', label: 'Profile & Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition whitespace-nowrap border-b-2 -mb-[2px] ${
                isActive
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Active Rentals
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {activeBorrowingsCount}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <ShoppingBag size={22} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pending Requests
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {pendingLenderRequests.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Lender Earnings
                    </span>
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {formatCurrency(totalEarned)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total Spent
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {formatCurrency(totalSpent)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-brand-600 flex items-center justify-center">
                    <ShoppingBag size={22} />
                  </div>
                </div>
              </div>

              {/* Pending Requests Alert for Lender */}
              {pendingLenderRequests.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      You have {pendingLenderRequests.length} incoming booking request(s) awaiting your approval!
                    </span>
                  </div>
                  <button
                    onClick={() => setTab('lender')}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition shrink-0"
                  >
                    Review Now
                  </button>
                </div>
              )}

              {/* Recent Activity: Latest Borrowings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Recent Bookings & Activity
                  </h3>
                  <button
                    onClick={() => setTab('borrower')}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {borrowerBookings.length === 0 ? (
                  <EmptyState
                    title="No bookings yet"
                    description="Browse items in your neighborhood and place your first reservation!"
                    actionLabel="Explore Items"
                    actionLink="/explore"
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-subtle">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {borrowerBookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking._id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={getImageUrl(booking.listing?.images?.[0]?.url, DEFAULT_LISTING_IMAGE)}
                              alt=""
                              className="w-14 h-14 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <Link
                                to={`/listing/${booking.listing?._id}`}
                                className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1"
                              >
                                {booking.listing?.title || 'Gear Listing'}
                              </Link>
                              <p className="text-xs text-slate-500">
                                {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                                {formatCurrency(booking.pricing?.totalAmount)} • {booking.paymentMethod.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                booking.bookingStatus === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : booking.bookingStatus === 'active'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                  : booking.bookingStatus === 'completed'
                                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {booking.bookingStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BORROWER HUB */}
          {activeTab === 'borrower' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                My Borrowing History & Reservations
              </h3>

              {borrowerBookings.length === 0 ? (
                <EmptyState
                  title="You haven't borrowed anything yet"
                  description="Find cameras, equipment, tools, and electronics available right near you."
                  actionLabel="Discover Items"
                  actionLink="/explore"
                />
              ) : (
                <div className="space-y-4">
                  {borrowerBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={getImageUrl(booking.listing?.images?.[0]?.url, DEFAULT_LISTING_IMAGE)}
                          alt=""
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm"
                        />
                        <div className="space-y-1">
                          <Link
                            to={`/listing/${booking.listing?._id}`}
                            className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1"
                          >
                            {booking.listing?.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            Lender: <span className="font-semibold text-slate-700 dark:text-slate-300">{booking.lender?.name}</span> ({booking.lender?.phone || 'Contact via app'})
                          </p>
                          <p className="text-xs text-slate-500">
                            Dates: {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()} ({booking.duration} {booking.durationUnit})
                          </p>
                          <div className="flex items-center gap-2 pt-1 text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">
                              Total: {formatCurrency(booking.pricing?.totalAmount)}
                            </span>
                            <span>•</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                booking.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              Payment: {booking.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            booking.bookingStatus === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : booking.bookingStatus === 'active'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : booking.bookingStatus === 'completed'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          Status: {booking.bookingStatus}
                        </span>

                        {/* Review button for completed bookings */}
                        {booking.bookingStatus === 'completed' && (
                          <button
                            onClick={() => handleOpenReview(booking._id)}
                            disabled={booking.reviewSubmitted}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                              booking.reviewSubmitted
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                            }`}
                          >
                            <Star size={13} className="fill-current" />
                            <span>{booking.reviewSubmitted ? 'Review Submitted' : 'Leave Review'}</span>
                          </button>
                        )}

                        {/* Cancel button if pending/confirmed */}
                        {(booking.bookingStatus === 'pending' || booking.bookingStatus === 'confirmed') && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LENDER HUB */}
          {activeTab === 'lender' && (
            <div className="space-y-8 animate-fade-in">
              {/* Incoming Booking Requests */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Incoming Booking Requests</span>
                  <span className="text-xs font-normal text-slate-500">
                    Approve or decline borrowing requests from local members
                  </span>
                </h3>

                {lenderBookings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500">
                    No borrowing requests yet. Once users reserve your gear, their requests will appear here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lenderBookings.map((b) => (
                      <div
                        key={b._id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={getImageUrl(b.listing?.images?.[0]?.url, DEFAULT_LISTING_IMAGE)}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {b.listing?.title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Borrower: <span className="font-semibold text-slate-800 dark:text-slate-200">{b.borrower?.name}</span> ({b.borrower?.phone || 'No phone'})
                            </p>
                            <p className="text-xs text-slate-500">
                              Dates: {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              Earnings: {formatCurrency(b.pricing?.basePrice)} (Total: {formatCurrency(b.pricing?.totalAmount)})
                            </p>
                          </div>
                        </div>

                        {/* Lender Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                          {b.bookingStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = window.prompt('Reason for declining:');
                                  handleUpdateBookingStatus(b._id, 'rejected', reason || '');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition flex items-center gap-1"
                              >
                                <XCircle size={14} /> Decline
                              </button>
                            </>
                          )}

                          {b.bookingStatus === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'active')}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                            >
                              Mark Handed Over (Active)
                            </button>
                          )}

                          {b.bookingStatus === 'active' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                            >
                              Mark Returned (Complete)
                            </button>
                          )}

                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {b.bookingStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Listed Items */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      My Published Listings ({myListings.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage rates, pause listings, or update equipment specs
                    </p>
                  </div>
                  <Link
                    to="/add-listing"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    <PlusCircle size={14} /> List Item
                  </Link>
                </div>

                {myListings.length === 0 ? (
                  <EmptyState
                    title="No listings yet"
                    description="Earn money by sharing your unused gear with trusted borrowers."
                    actionLabel="Publish First Listing"
                    actionLink="/add-listing"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map((listing) => (
                      <div
                        key={listing._id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-subtle flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
                          <img
                            src={getImageUrl(listing.images?.[0]?.url, DEFAULT_LISTING_IMAGE)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              listing.status === 'active'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {listing.status}
                          </span>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <Link
                              to={`/listing/${listing._id}`}
                              className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1"
                            >
                              {listing.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {listing.category} • {formatCurrency(listing.pricing?.perDay)}/day
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <button
                              onClick={() => handleToggleListingStatus(listing)}
                              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 flex items-center gap-1"
                            >
                              {listing.status === 'active' ? (
                                <>
                                  <PauseCircle size={14} /> Pause
                                </>
                              ) : (
                                <>
                                  <PlayCircle size={14} /> Activate
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteListing(listing._id)}
                              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Saved Favorite Items ({favorites.length})
              </h3>

              {favorites.length === 0 ? (
                <EmptyState
                  title="No favorites saved"
                  description="Click the heart icon on any listing card to save items for future borrowing."
                  actionLabel="Explore Gear"
                  actionLink="/explore"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((listing) => (
                    <ListingCard
                      key={listing._id}
                      listing={listing}
                      isFavorited={true}
                      onFavoriteToggle={(id, isFav) => {
                        if (!isFav) {
                          setFavorites((prev) => prev.filter((l) => l._id !== id));
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Profile & Account Settings
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Profile Photo Upload */}
                <div className="flex items-center gap-5">
                  <img
                    src={avatarPreview || getImageUrl(user?.avatar?.url, DEFAULT_AVATAR)}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border-2 border-brand-500/30 shadow-md"
                  />
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProfileAvatarFile(e.target.files[0]);
                          setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    City & Area
                  </label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    placeholder="e.g. Koramangala, Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Tell other borrowers and lenders about yourself..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updatingProfile ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Leave Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Leave a Review
            </h3>
            <p className="text-xs text-slate-500">
              How was your borrowing experience with this item and lender?
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <RatingStars
                  rating={reviewRating}
                  size={26}
                  interactive={true}
                  onRatingChange={(r) => setReviewRating(r)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Review & Comments
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about condition, handover experience, and performance..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
