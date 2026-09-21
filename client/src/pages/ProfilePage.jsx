import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Calendar, Star, ShieldCheck, Mail, Phone, Package } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import RatingStars from '../components/RatingStars';
import { getImageUrl, DEFAULT_AVATAR } from '../utils/imageUtils';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // If no ID passed, show currentUser
  const targetId = id || currentUser?._id;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!targetId) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/${targetId}`);
        if (res.data.success) {
          setProfileUser(res.data.user);
          setUserListings(res.data.listings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [targetId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-sm text-slate-400">
        Loading user profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-sm text-slate-400">
        User profile not found.
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profileUser._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={getImageUrl(profileUser.avatar?.url, DEFAULT_AVATAR)}
            alt=""
            className="w-24 h-24 rounded-full object-cover border-4 border-brand-500/20 shadow-md"
          />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {profileUser.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-slate-400" />
                {profileUser.location || 'India'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                Joined {new Date(profileUser.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <RatingStars rating={profileUser.rating || 5.0} count={profileUser.ratingsCount || 0} size={15} />
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <Link
            to="/dashboard?tab=settings"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* User Bio */}
      {profileUser.bio && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-subtle">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">About</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {profileUser.bio}
          </p>
        </div>
      )}

      {/* User's Listings */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Package size={20} className="text-brand-600" />
          <span>Items Listed by {profileUser.name} ({userListings.length})</span>
        </h2>

        {userListings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No active listings published right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userListings.map((listing, idx) => (
              <ListingCard key={listing._id} listing={listing} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
