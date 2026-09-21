import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import BorrowLoopLogo from '../components/BorrowLoopLogo';

export const ForgotPasswordPage = () => {
  const { showToast } = useNotifications();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setIsSent(true);
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error requesting reset', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <BorrowLoopLogo size="lg" layout="vertical" showTagline={true} interactive={true} animated={true} />
          </Link>
          <div className="space-y-1 pt-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>
        </div>

        {isSent ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              A password reset link has been dispatched to <strong>{email}</strong>.
            </p>
            <Link
              to="/login"
              className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500">
          Remember your credentials?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
