import React from 'react';

export const ListingCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-subtle flex flex-col skeleton-shimmer">
      <div className="aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800"></div>
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export const ListingGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ListingCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default ListingCardSkeleton;
