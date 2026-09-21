import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import { ListingGridSkeleton } from '../components/SkeletonLoader';
import { CATEGORIES, CITIES } from '../utils/constants';
import BorrowLoopLogo, { BorrowLoopIcon3D } from '../components/BorrowLoopLogo';
import InteractiveCard from '../components/InteractiveCard';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/listings?limit=6&sort=rating');
        if (res.data.success) {
          setFeaturedListings(res.data.listings);
        }
      } catch (err) {
        console.error('Failed to load featured listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedCity !== 'All') params.append('city', selectedCity);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden glow-mesh border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* 3D Brand Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-lg shadow-brand-500/5 animate-fade-in hover:shadow-xl transition-all">
            <BorrowLoopIcon3D size={26} interactive={false} animated={true} />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
              <Sparkles size={14} className="text-brand-500" />
              <span>The Smart Peer-to-Peer Sharing Economy</span>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Borrow what you need.{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-accent-500 bg-clip-text text-transparent">
                Share what you have.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover high-end cameras, power tools, camping gear, instruments, and electronics from verified lenders in your local community.
            </p>
          </div>

          {/* Interactive Search Bar Box */}
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2 md:gap-3"
            >
              {/* Keyword Input */}
              <div className="flex items-center gap-2.5 px-3 py-2 w-full md:flex-1 text-left border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                <Search size={18} className="text-slate-400 shrink-0" />
                <div className="w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    What are you looking for?
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g. Sony A7IV, Drone, Tent, Drill..."
                    className="w-full text-sm font-medium bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2.5 px-3 py-2 w-full md:w-48 text-left border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                <div className="w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-sm font-medium bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name} className="dark:bg-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City Dropdown */}
              <div className="flex items-center gap-2.5 px-3 py-2 w-full md:w-44 text-left">
                <MapPin size={18} className="text-slate-400 shrink-0" />
                <div className="w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full text-sm font-medium bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city} className="dark:bg-slate-900">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Search</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Hero Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Trending:</span>
              {['Sony Mirrorless', 'Camping Tent', 'Cordless Drill', 'Projector', 'Bicycle'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchTerm(tag);
                    navigate(`/explore?search=${encodeURIComponent(tag)}`);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/explore"
              className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm shadow-md hover:opacity-90 transition"
            >
              Explore All Items
            </Link>
            <Link
              to="/add-listing"
              className="px-6 py-3 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-bold text-sm hover:bg-brand-100 dark:hover:bg-brand-900/50 transition flex items-center gap-2"
            >
              <span>Become a Lender</span>
              <DollarSign size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Popular Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse top-rented gear, tools, and lifestyle equipment.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <InteractiveCard
              key={cat.name}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              index={idx}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:border-brand-300 dark:hover:border-slate-700 card-image-wrap block"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover card-image-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-3.5 pointer-events-none">
                <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-300 line-clamp-1">
                  {cat.description}
                </span>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
              <Award size={14} /> Top Verified Gear
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Listings Near You
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View All Listings</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <ListingGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing, idx) => (
              <ListingCard key={listing._id} listing={listing} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* How BorrowLoop Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How BorrowLoop Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Frictionless borrowing and reliable peer-to-peer sharing in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Discover Item',
              desc: 'Search nearby listings, check real photos, lender ratings, and verified specs.',
              icon: Search,
              color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
            },
            {
              step: '02',
              title: 'Check Availability',
              desc: 'Choose your desired dates and times. Our engine verifies there are zero booking clashes.',
              icon: Calendar,
              color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
            },
            {
              step: '03',
              title: 'Book & Pay',
              desc: 'Choose online payment with instant escrow or offline cash upon item pickup.',
              icon: Zap,
              color: 'text-accent-500 bg-accent-50 dark:bg-accent-950/40',
            },
            {
              step: '04',
              title: 'Borrow & Return',
              desc: 'Meet your neighbor, borrow the gear, return it safely, and leave a community review.',
              icon: CheckCircle2,
              color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
            },
          ].map((item, idx) => {
            const StepIcon = item.icon;
            return (
              <InteractiveCard
                key={idx}
                index={idx}
                interactive={false}
                enableReveal={true}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <StepIcon size={22} />
                  </div>
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </InteractiveCard>
            );
          })}
        </div>
      </section>

      {/* Why BorrowLoop Trust Points */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Users & ID Checks',
                desc: 'Borrow and lend with confidence. Every member completes identity and phone verification.',
                color: 'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400',
              },
              {
                icon: Clock,
                title: 'Zero Double-Booking Guarantee',
                desc: 'Our real-time backend calendar engine guarantees items are strictly locked during reserved slots.',
                color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
              },
              {
                icon: Users,
                title: 'Flexible Online & Offline Pay',
                desc: 'Pay securely via card/UPI or choose in-person cash handover upon inspecting the item.',
                color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
              },
            ].map((point, idx) => {
              const PointIcon = point.icon;
              return (
                <InteractiveCard
                  key={idx}
                  index={idx}
                  interactive={false}
                  enableReveal={true}
                  className="flex items-start gap-4 p-2 rounded-2xl"
                >
                  <div className={`w-12 h-12 rounded-2xl ${point.color} flex items-center justify-center shrink-0 shadow-sm`}>
                    <PointIcon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {point.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {point.desc}
                    </p>
                  </div>
                </InteractiveCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Become a Lender CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-semibold border border-accent-500/30">
              <DollarSign size={14} /> Turn Idle Items Into Income
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Have unused cameras, tools, or gear sitting at home?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join hundreds of lenders on BorrowLoop. List your items in 2 minutes, set your own rental rates and availability rules, and earn an extra ₹15,000–₹40,000 every month safely.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/add-listing"
                className="px-6 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold text-sm shadow-lg transition"
              >
                List Your Item Now
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition border border-white/20"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Decorative background glow circles */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
