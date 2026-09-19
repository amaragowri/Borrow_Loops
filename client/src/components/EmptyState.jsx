import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Try adjusting your search criteria or explore other categories.',
  actionLabel,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition shadow-sm"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onActionClick && !actionLink && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
