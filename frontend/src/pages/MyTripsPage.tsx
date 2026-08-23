import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trip } from '../types';
import { PlusCircle, Calendar, MapPin, Trash2, Edit3, Eye, Compass, AlertCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useCurrency } from '../context/CurrencyContext';

export const MyTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/trips/${tripToDelete.id}`);
      setTrips(trips.filter(t => t.id !== tripToDelete.id));
      setDeleteModalOpen(false);
      setTripToDelete(null);
    } catch (err) {
      console.error('Failed to delete trip:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const today = new Date();
    const end = new Date(trip.end_date);
    if (filter === 'upcoming') return end >= today;
    if (filter === 'past') return end < today;
    return true;
  });

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Trips</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all your saved travel plans.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Past
            </button>
          </div>

          <Link
            to="/trips/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Plan New Trip
          </Link>
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={filter === 'all' ? 'No trips found' : `No ${filter} trips found`}
          description={filter === 'all' ? 'Start planning your next getaway by creating your first trip.' : `You have no ${filter} trips registered in your account.`}
          actionText="Plan a New Trip"
          onAction={() => navigate('/trips/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                  alt={trip.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                    new Date(trip.end_date) >= new Date() ? 'bg-emerald-500/80 text-white' : 'bg-slate-600/80 text-slate-100'
                  }`}>
                    {new Date(trip.end_date) >= new Date() ? 'Upcoming' : 'Past'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold truncate">{trip.name}</h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    {trip.stops?.length || 0} {(trip.stops?.length || 0) === 1 ? 'City Stop' : 'City Stops'}
                  </span>
                  {trip.target_budget && (
                    <span className="font-bold text-slate-800">
                      Budget: {formatPrice(trip.target_budget, { currency: trip.display_currency })}
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
                    onClick={() => { setTripToDelete(trip); setDeleteModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Trip Confirmation"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">This will permanently delete this trip and its itinerary.</p>
              <p className="text-xs text-red-600 mt-1">All associated stops, assigned activities, and budget entries will be removed.</p>
            </div>
          </div>

          <p className="text-slate-700 text-sm">
            Are you sure you want to delete <span className="font-bold">"{tripToDelete?.name}"</span>?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTrip}
              disabled={deleteLoading}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow transition-all"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Trip'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};