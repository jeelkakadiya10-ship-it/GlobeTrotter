import React from 'react';

export const CityCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
      <div className="h-48 bg-slate-200 w-full" />
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-200 rounded-md w-1/2" />
          <div className="h-5 bg-slate-200 rounded-full w-16" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-9 bg-slate-200 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
};

export const ActivityCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex gap-4 animate-pulse">
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-200 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-2/3" />
          <div className="h-5 bg-slate-200 rounded-full w-12" />
        </div>
        <div className="h-3.5 bg-slate-200 rounded w-full" />
        <div className="h-3.5 bg-slate-200 rounded w-4/5" />
        <div className="flex items-center gap-3 pt-1">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export const TripCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-44 bg-slate-200 w-full" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 rounded-full w-20" />
          <div className="h-6 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
};
