import React from 'react';

export const SkeletonText = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg ${className}`}></div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <SkeletonText className="h-4 w-1/3" />
        <SkeletonText className="h-8 w-8 rounded-full" />
      </div>
      <SkeletonText className="h-8 w-1/2" />
      <SkeletonText className="h-3 w-3/4" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonText key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 pt-2">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonText key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};
