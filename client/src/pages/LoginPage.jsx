import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import BorrowLoopLogo from '../components/BorrowLoopLogo';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Logged in successfully! Welcome back.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'lender') {
      setEmail('lender@borrowloop.com');
      setPassword('lender123');
    } else if (role === 'borrower') {
      setEmail('borrower@borrowloop.com');
      setPassword('borrower123');
    } else if (role === 'admin') {
      setEmail('admin@borrowloop.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header with 3D Logo */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <BorrowLoopLogo size="lg" layout="vertical" showTagline={true} interactive={true} animated={true} />
          </Link>
          <div className="space-y-1 pt-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access your active borrowings, listings, and incoming requests
            </p>
          </div>
        </div>

        {/* Demo Quick Fill Buttons */}
        <div className="p-3.5 bg-brand-50/60 dark:bg-brand-950/30 rounded-2xl border border-brand-200/60 dark:border-brand-900 space-y-2">
          <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1">
            <Sparkles size={12} /> Instant Demo Logins:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('lender')}
              className="py-1 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:text-brand-600 transition"
            >
              Lender
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('borrower')}
              className="py-1 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:text-brand-600 transition"
            >
              Borrower
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:text-brand-600 transition"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
