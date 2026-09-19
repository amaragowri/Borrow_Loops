import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import { ListingGridSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { CATEGORIES, CITIES, CONDITIONS, SORT_OPTIONS } from '../utils/constants';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync state to URL and fetch listings
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'All') params.set('category', category);
    if (city !== 'All') params.set('city', city);
    if (condition !== 'All') params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());

    setSearchParams(params, { replace: true });

    const fetchListings = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(params);
        queryParams.set('limit', '12');

        const res = await api.get(`/listings?${queryParams.toString()}`);
        if (res.data.success) {
          setListings(res.data.listings);
          setTotalCount(res.data.total);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [search, category, city, condition, minPrice, maxPrice, sort, page, setSearchParams]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCity('All');
    setCondition('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    category !== 'All' ||
    city !== 'All' ||
    condition !== 'All' ||
    minPrice ||
    maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Available Items
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {totalCount} verified items ready for borrowing
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ArrowUpDown size={14} />
              <span>Sort by:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-subtle"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by gear name, description, brand, or location..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-subtle"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setCategory('All');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
              category === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setCategory(c.name);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                category === c.name
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid with Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside
          className={`${
            showFiltersMobile ? 'block' : 'hidden'
          } md:block md:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-6 sticky top-24`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Filter size={16} /> Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* City Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              City
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Price Range (₹/day)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Item Condition
            </label>
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="md:col-span-3 space-y-8">
          {loading ? (
            <ListingGridSkeleton count={9} />
          ) : listings.length === 0 ? (
            <EmptyState
              title="No items found"
              description="No listings match your current filters. Try changing keywords or resetting filters."
              actionLabel="Reset Filters"
              onActionClick={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 px-3">
                    <span>Page {page} of {totalPages}</span>
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExplorePage;
