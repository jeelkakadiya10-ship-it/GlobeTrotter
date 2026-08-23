import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, MapPin, Trash2, Edit3, Eye, Compass, Clock, ArrowRight } from 'lucide-react';
import { Trip } from '../types';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { EmptyState } from '../components/EmptyState';

export const SavedTripsPage: React.FC = () => {
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const loadSavedTrips = () => {
    const raw = localStorage.getItem('globetrotter_saved_trips');
    if (raw) {
      try {
        setSavedTrips(JSON.parse(raw));
      } catch (e) {
        setSavedTrips([]);
      }
    } else {
      setSavedTrips([]);
    }
  };

  useEffect(() => {
    loadSavedTrips();
  }, []);

  const handleRemoveSavedTrip = (id: number) => {
    const updated = savedTrips.filter((t) => t.id !== id);
    setSavedTrips(updated);
    localStorage.setItem('globetrotter_saved_trips', JSON.stringify(updated));
    showToast('Removed from saved trips', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Saved Trips</h1>
            <p className="text-slate-500 text-sm">Quick access to all locally saved and bookmarked travel itineraries.</p>
          </div>
        </div>

        <Link
          to="/trips/new"
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          + Plan New Trip
        </Link>
      </div>

      {savedTrips.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved trips yet"
          description="Use the 'Save Trip' button in any itinerary to store your trips offline for quick access anytime."
          actionText="Explore Your Trips"
          onAction={() => navigate('/trips')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                  alt={trip.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[11px] font-extrabold text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-300" />
                  Saved {new Date(trip.savedAt || trip.created_at).toLocaleDateString()}
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold truncate">{trip.name}</h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    {trip.stops?.length || 0} {(trip.stops?.length || 0) === 1 ? 'City Stop' : 'City Stops'}
                  </span>
                  {trip.target_budget && (
                    <span className="font-bold text-slate-800">
                      Budget: {formatPrice(trip.target_budget)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/trips/${trip.id}/view`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                  <Link
                    to={`/trips/${trip.id}/builder`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleRemoveSavedTrip(trip.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove from saved trips"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};