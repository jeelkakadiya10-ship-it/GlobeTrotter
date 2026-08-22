import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Compass,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Share2,
  Edit3,
  Copy,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  ListFilter,
  LayoutGrid,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const ItineraryViewPage = () => {
  const { id: tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'timeline'
  const [toastMessage, setToastMessage] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isCopyingTrip, setIsCopyingTrip] = useState(false);

  const fetchTrip = async () => {
    try {
      const res = await api.getTrip(tripId);
      setTrip(res.trip);
    } catch (err) {
      console.error('Failed to load trip view:', err);
      setError(err.message || 'Unable to load trip.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleShare = async () => {
    try {
      const res = await api.toggleShare(trip.id, !trip.is_public);
      setTrip({ ...trip, is_public: res.is_public });
      showToast(res.is_public ? 'Trip is now public!' : 'Trip is now private.');
    } catch (err) {
      showToast(err.message || 'Failed to toggle share.');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/share/${trip.public_slug}`;
    navigator.clipboard.writeText(url);
    showToast('Public itinerary link copied to clipboard!');
  };

  const handleCopyTripToAccount = async () => {
    setIsCopyingTrip(true);
    try {
      const res = await api.copyTrip(trip.id);
      showToast('Trip copied to your account!');
      navigate(`/trips/${res.trip.id}/builder`);
    } catch (err) {
      showToast(err.message || 'Failed to copy trip.');
    } finally {
      setIsCopyingTrip(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white animate-spin">
          <Compass className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Preparing your itinerary view...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Trip Not Available</h2>
        <p className="text-sm text-slate-500">{error || 'Trip was not found.'}</p>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm"
        >
          Return to Trips
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === trip.user_id;

  // Aggregate stats
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.trip_activities.length, 0);
  const totalBudgetSpent = trip.budget_entries.reduce((sum, b) => sum + b.amount, 0) +
    trip.stops.reduce(
      (sum, s) =>
        sum +
        s.trip_activities.reduce(
          (actSum, a) => actSum + (a.custom_cost || a.activity?.estimated_cost || 0),
          0
        ),
      0
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 text-white min-h-[320px] flex flex-col justify-between p-6 sm:p-10">
        <img
          src={trip.cover_image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

        {/* Top Badges & Actions */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow">
              {trip.stops?.length || 0} Cities Itinerary
            </span>
            {trip.is_public ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold flex items-center gap-1 shadow backdrop-blur">
                <Share2 className="w-3 h-3" /> Public
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-black/50 text-slate-300 text-xs font-semibold backdrop-blur">
                Private
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {isOwner && (
              <>
                <Link
                  to={`/trips/${trip.id}/builder`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Builder</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </>
            )}

            {!isOwner && user && (
              <button
                type="button"
                onClick={handleCopyTripToAccount}
                disabled={isCopyingTrip}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopyingTrip ? 'Copying...' : 'Copy to My Trips'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur transition-colors"
              title="Print Itinerary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Title & Creator */}
        <div className="relative z-10 space-y-3 mt-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {trip.title}
          </h1>
          {trip.description && (
            <p className="text-slate-200 text-sm sm:text-base max-w-3xl leading-relaxed">
              {trip.description}
            </p>
          )}

          {/* Quick Details Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
            {trip.user && (
              <div className="flex items-center gap-2">
                <img
                  src={trip.user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${trip.user.name}`}
                  alt={trip.user.name}
                  className="w-6 h-6 rounded-full bg-teal-100 object-cover"
                />
                <span className="font-semibold text-white">Curated by {trip.user.name}</span>
              </div>
            )}
            {trip.start_date && (
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-teal-400" />
                <span>
                  {trip.start_date} {trip.end_date ? `to ${trip.end_date}` : ''}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-400" />
              <span>Est. Cost: ${totalBudgetSpent.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{totalActivities} Activities</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Controls */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Chronological Stops</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'timeline'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Timeline / Daily Schedule</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/trips/${trip.id}/budget`}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-50"
          >
            Budget Overview →
          </Link>
        </div>
      </div>

      {/* View Mode 1: Chronological Stops List */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {trip.stops.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Stop Banner */}
              <div className="relative p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div
                  className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url(${stop.city?.image_url})` }}
                />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 font-black text-lg flex items-center justify-center shadow">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {stop.city?.name}, {stop.city?.country}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {stop.arrival_date && stop.departure_date
                        ? `${stop.arrival_date} — ${stop.departure_date}`
                        : stop.arrival_date
                        ? `Arriving ${stop.arrival_date}`
                        : 'Dates flexible'}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 text-xs text-slate-300">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur font-semibold">
                    {stop.trip_activities?.length || 0} Activities Scheduled
                  </span>
                </div>
              </div>

              {/* Stop Notes */}
              {stop.notes && (
                <div className="px-6 py-3 bg-teal-50/70 border-b border-slate-100 text-xs text-teal-900 font-medium">
                  📝 {stop.notes}
                </div>
              )}

              {/* Activities Grid */}
              <div className="p-6 space-y-4">
                {stop.trip_activities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No activities scheduled for this stop.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stop.trip_activities.map((act) => {
                      const title = act.custom_title || act.activity?.title;
                      const image = act.activity?.image_url;
                      const cost = act.custom_cost ?? act.activity?.estimated_cost ?? 0;
                      const category = act.activity?.category || 'Custom';
                      const desc = act.activity?.description || act.notes;

                      return (
                        <div
                          key={act.id}
                          className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 transition-all shadow-sm"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="w-20 h-20 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                              <Compass className="w-8 h-8" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{title}</h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 shrink-0">
                                {category}
                              </span>
                            </div>

                            {desc && (
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {desc}
                              </p>
                            )}

                            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/50">
                              <div className="flex items-center gap-2">
                                {act.scheduled_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {act.scheduled_time}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-slate-900">
                                {cost > 0 ? `$${cost} USD` : 'Free'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode 2: Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="border-l-2 border-teal-500 ml-4 pl-6 space-y-10">
            {trip.stops.map((stop, sIndex) => (
              <div key={stop.id} className="relative">
                {/* Marker */}
                <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow">
                  {sIndex + 1}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      {stop.city?.name}, {stop.city?.country}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800">
                      {stop.arrival_date || 'Day 1'} {stop.departure_date ? `to ${stop.departure_date}` : ''}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stop.trip_activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-1 rounded-lg">
                            {act.scheduled_time || 'All Day'}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {act.custom_title || act.activity?.title}
                            </p>
                            <p className="text-xs text-slate-500">{act.activity?.location_name || stop.city.name}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-900">
                          {(act.custom_cost || act.activity?.estimated_cost || 0) > 0
                            ? `$${act.custom_cost || act.activity?.estimated_cost}`
                            : 'Free'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Your Travel Itinerary"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Share this link with fellow travelers, friends, and family. When public, anyone can view this itinerary with zero login required.
          </p>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">Public Visibility</p>
              <p className="text-[11px] text-slate-500">
                {trip.is_public ? 'Anyone with the link can view' : 'Only you can view this trip'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleShare}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                trip.is_public
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {trip.is_public ? 'Public (Active)' : 'Make Public'}
            </button>
          </div>

          {trip.is_public && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Public Share URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/share/${trip.public_slug}`}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShareModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
