import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  Plus,
  Search,
  Calendar,
  MapPin,
  Share2,
  Trash2,
  Eye,
  Edit3,
  DollarSign,
  Copy,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { TripCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/Modal';

export const MyTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'upcoming' | 'past'

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / copy notice
  const [toastMessage, setToastMessage] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.getTrips({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });
      setTrips(res.trips || []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrips();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleShare = async (trip) => {
    try {
      const res = await api.toggleShare(trip.id, !trip.is_public);
      setTrips(trips.map(t => t.id === trip.id ? { ...t, is_public: res.is_public } : t));
      showToast(res.is_public ? 'Trip is now public! Share link ready.' : 'Trip marked private.');
    } catch (err) {
      showToast(err.message || 'Failed to toggle share status.');
    }
  };

  const handleCopyShareLink = (trip) => {
    const fullUrl = `${window.location.origin}/share/${trip.public_slug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Public share link copied to clipboard!');
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteTrip(tripToDelete.id);
      setTrips(trips.filter(t => t.id !== tripToDelete.id));
      setDeleteModalOpen(false);
      setTripToDelete(null);
      showToast('Trip deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Trips</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, edit, and share all your planned adventures</p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition-all hover:shadow hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Trip</span>
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trips by name, country, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past Trips' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TripCardSkeleton />
          <TripCardSkeleton />
          <TripCardSkeleton />
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={searchQuery ? 'No matching trips found' : 'No trips created yet'}
          description={
            searchQuery
              ? `We couldn't find any trips matching "${searchQuery}". Try a different search term or clear filters.`
              : 'You haven’t built any itineraries yet. Craft your next dream multi-city journey now!'
          }
          actionText={searchQuery ? 'Clear Search' : 'Create New Trip'}
          onActionClick={searchQuery ? () => setSearchQuery('') : undefined}
          actionLink={!searchQuery ? '/trips/new' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Cover Header */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={trip.cover_image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

                {/* Public / Private Badge */}
                <button
                  type="button"
                  onClick={() => handleToggleShare(trip)}
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur flex items-center gap-1 shadow transition-colors ${
                    trip.is_public
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-black/60 text-slate-200 hover:bg-black/80'
                  }`}
                  title={trip.is_public ? 'Trip is public. Click to make private.' : 'Trip is private. Click to make public.'}
                >
                  <Share2 className="w-3 h-3" />
                  <span>{trip.is_public ? 'Public' : 'Private'}</span>
                </button>

                {/* Cities Pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur text-white text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    {trip.stops?.length || 0} Cities
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {trip.description || 'No description provided.'}
                  </p>

                  {/* Stops List */}
                  {trip.stops && trip.stops.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {trip.stops.map((stop) => (
                        <span
                          key={stop.id}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          {stop.city?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dates & Budget info */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{trip.start_date || 'Flexible dates'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <DollarSign className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-700">
                      {trip.target_budget > 0 ? `$${trip.target_budget.toLocaleString()}` : 'Budget flex'}
                    </span>
                  </div>
                </div>

                {/* Quick Navigation Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <Link
                    to={`/trips/${trip.id}/view`}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>
                  <Link
                    to={`/trips/${trip.id}/builder`}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Builder</span>
                  </Link>
                  <Link
                    to={`/trips/${trip.id}/budget`}
                    className="flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Budget</span>
                  </Link>
                </div>

                {/* Footer Action Icons */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    {trip.is_public && (
                      <button
                        type="button"
                        onClick={() => handleCopyShareLink(trip)}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-600 font-semibold p-1 hover:bg-slate-50 rounded"
                        title="Copy public link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </button>
                    )}
                  </div>

                  {/* Delete Trip */}
                  <button
                    type="button"
                    onClick={() => {
                      setTripToDelete(trip);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTripToDelete(null);
        }}
        onConfirm={handleDeleteTrip}
        title={`Delete "${tripToDelete?.title}"?`}
        message="Are you sure you want to remove this trip? This will permanently delete all city stops, scheduled activities, and custom budget entries."
        confirmText="Yes, Delete Trip"
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
};
