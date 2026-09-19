import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Heart, Mail, Phone, MapPin, ShieldCheck, Globe, Share2, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-400 flex items-center justify-center text-white shadow-md">
                <Repeat size={20} />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-brand-800 dark:from-brand-400 dark:to-accent-300 bg-clip-text text-transparent">
                BorrowLoop
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Borrow what you need. Share what you have. A trusted community marketplace enabling smart, sustainable resource sharing across your neighborhood.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#website"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
                aria-label="Website"
              >
                <Globe size={16} />
              </a>
              <a
                href="#share"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
                aria-label="Share"
              >
                <Share2 size={16} />
              </a>
              <a
                href="#community"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
                aria-label="Community"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Explore Gear
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore?category=Cameras" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Cameras & Video
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Electronics" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Drones & Laptops
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Tools" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  DIY & Power Tools
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Musical Instruments" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Musical Gear
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Sports" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Camping & Trekking
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              BorrowLoop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/add-listing" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Become a Lender
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  User Dashboard
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <ShieldCheck size={14} /> Lender Protection Guarantee
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Community & Help
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>Koramangala, Bengaluru</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span>support@borrowloop.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>+91 80 4567 8900</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BorrowLoop Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#terms" className="hover:underline">Terms of Service</a>
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#trust" className="hover:underline">Trust & Safety</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
