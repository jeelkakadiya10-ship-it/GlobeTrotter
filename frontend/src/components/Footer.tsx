import React from 'react';
import { Plane, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/60 bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-brand-600 transform -rotate-45" />
          <span className="font-bold text-slate-800">GlobeTrotter</span>
          <span className="text-slate-400 text-sm">© 2026</span>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          Turn your travel dreams into day-by-day itineraries in under 5 minutes.
        </p>
        <div className="flex gap-6 text-sm text-slate-500">
          <Link to="/cities/search" className="hover:text-brand-600 transition-colors">Destinations</Link>
          <Link to="/trips" className="hover:text-brand-600 transition-colors">Trips</Link>
          <Link to="/profile" className="hover:text-brand-600 transition-colors">Profile</Link>
        </div>
      </div>
    </footer>
  );
};