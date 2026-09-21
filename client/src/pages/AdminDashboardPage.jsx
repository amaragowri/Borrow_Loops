import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Package,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Check,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, getImageUrl, DEFAULT_AVATAR } from '../utils/imageUtils';
import InteractiveCard from '../components/InteractiveCard';

const AdminDashboardPage = () => {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, listingsRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/reports'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (listingsRes.data.success) setListings(listingsRes.data.listings || []);
      if (reportsRes.data.success) setReports(reportsRes.data.reports || []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlockUser = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-block`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleModerateListing = async (listingId, status) => {
    try {
      const res = await api.put(`/admin/listings/${listingId}/status`, { status });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setListings((prev) =>
          prev.map((l) => (l._id === listingId ? { ...l, status } : l))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update listing', 'error');
    }
  };

  const handleResolveReport = async (reportId, actionTaken) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}/resolve`, { actionTaken });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status: 'resolved' } : r))
        );
      }
    } catch (err) {
      showToast('Failed to resolve report', 'error');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white flex items-center justify-center shadow-lg">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Admin Governance & Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            BorrowLoop Platform Administration • Real-Time Health & Escrow Insights
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Platform Metrics' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'listings', label: `Listings Moderation (${listings.length})` },
          { id: 'reports', label: `Reports (${reports.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading admin metrics...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <InteractiveCard
                  index={0}
                  onClick={() => setActiveTab('users')}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  aria-label="View Users"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalUsers}</h3>
                </InteractiveCard>

                <InteractiveCard
                  index={1}
                  onClick={() => setActiveTab('listings')}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  aria-label="View Listings"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Listings</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalListings}</h3>
                  <span className="text-xs text-emerald-500 font-semibold">{stats.activeListings} active</span>
                </InteractiveCard>

                <InteractiveCard
                  index={2}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalBookings}</h3>
                </InteractiveCard>

                <InteractiveCard
                  index={3}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Revenue (5%)</span>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(stats.platformEarnings)}
                  </h3>
                  <span className="text-[11px] text-slate-400">Volume: {formatCurrency(stats.grossVolume)}</span>
                </InteractiveCard>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-subtle animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={getImageUrl(u.avatar?.url, DEFAULT_AVATAR)}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                        <td className="p-4 text-slate-500">{u.location || 'India'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {u.isBlocked ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBlock(u._id)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                u.isBlocked
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              }`}
                            >
                              {u.isBlocked ? 'Reactivate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LISTINGS MODERATION */}
          {activeTab === 'listings' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-subtle animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">Listing</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Rate</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Approval</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {listings.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {l.title}
                        </td>
                        <td className="p-4 text-slate-500">{l.category}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(l.pricing?.perDay)}/day
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{l.owner?.name}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              l.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {l.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleApproval(l._id)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                          >
                            {l.isApproved ? 'Revoke' : 'Approve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-fade-in">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No open community reports. Everything is running smoothly!
                </div>
              ) : (
                reports.map((r) => (
                  <div
                    key={r._id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-rose-500">{r.reason}</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                        Item: {r.listing?.title || 'Reported item'}
                      </p>
                      <p className="text-xs text-slate-500">{r.description || 'No detailed comment'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
