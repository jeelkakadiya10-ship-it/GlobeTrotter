import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
          <div className="h-48 bg-slate-200"></div>
          <div className="p-5 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-slate-200 rounded w-20"></div>
              <div className="h-8 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};