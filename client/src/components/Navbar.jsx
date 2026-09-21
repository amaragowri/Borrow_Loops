import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Repeat,
  PlusCircle,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  Shield,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { getImageUrl, DEFAULT_AVATAR } from '../utils/imageUtils';
import BorrowLoopLogo from './BorrowLoopLogo';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <BorrowLoopLogo size="md" showTagline={true} interactive={true} animated={true} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick List Item CTA */}
          <Link
            to="/add-listing"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition transform hover:-translate-y-0.5"
          >
            <PlusCircle size={16} />
            <span>List an Item</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>

          {/* Notifications Dropdown (when authenticated) */}
          {isAuthenticated && <NotificationDropdown />}

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-brand-400 transition"
              >
                <img
                  src={getImageUrl(user?.avatar?.url, DEFAULT_AVATAR)}
                  alt={user?.name || 'User avatar'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <LayoutDashboard size={16} />
                    <span>My Dashboard</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <User size={16} />
                    <span>Profile & Settings</span>
                  </Link>

                  <Link
                    to="/dashboard?tab=favorites"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Heart size={16} />
                    <span>Favorites</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition font-medium"
                    >
                      <Shield size={16} />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 text-sm font-semibold shadow-sm transition"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 bg-white dark:bg-slate-900 animate-slide-up space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/add-listing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30"
            >
              + List an Item
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-amber-600 dark:text-amber-400"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
