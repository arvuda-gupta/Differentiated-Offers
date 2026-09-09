import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs animate-pulse space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
            <div className="h-6 bg-slate-100 rounded-full w-12"></div>
          </div>
          <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-slate-100 rounded-md w-full"></div>
            <div className="h-3 bg-slate-100 rounded-md w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
