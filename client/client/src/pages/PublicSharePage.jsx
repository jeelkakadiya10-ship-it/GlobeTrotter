import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Copy,
  Sparkles,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Globe,
  Star
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const PublicSharePage = () => {
  const { public_slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [promptLoginModal, setPromptLoginModal] = useState(false);

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        const res = await api.getPublicTrip(public_slug);
        setTrip(res.trip);
        setTotalCost(res.total_cost || 0);
      } catch (err) {
        console.error('Failed to fetch public trip:', err);
        setError(err.message || 'This trip is private or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrip();
  }, [public_slug]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Share link copied to clipboard!');
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      setPromptLoginModal(true);
      return;
    }

    setIsCopying(true);
    try {
      const res = await api.copyTrip(trip.id);
      showToast('Trip cloned to your account successfully!');
      navigate(`/trips/${res.trip.id}/builder`);
    } catch (err) {
      showToast(err.message || 'Failed to copy trip.');
    } finally {
      setIsCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white animate-spin">
          <Compass className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Loading public travel itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Trip is Private or Unavailable</h2>
        <p className="text-sm text-slate-500">
          The creator of this trip has set it to private or the link is invalid.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-md hover:bg-teal-700 transition-colors"
        >
          Explore GlobeTrotter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Public Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 text-white min-h-[340px] flex flex-col justify-between p-6 sm:p-10 border border-slate-200">
        <img
          src={trip.cover_image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow">
              <Globe className="w-3 h-3" />
              Shared Public Itinerary
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold">
              {trip.stops?.length || 0} Cities
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTrip}
              disabled={isCopying}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-100 disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopying ? 'Cloning Itinerary...' : 'Copy to My Account'}</span>
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

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
            {trip.user && (
              <div className="flex items-center gap-2">
                <img
                  src={trip.user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${trip.user.name}`}
                  alt={trip.user.name}
                  className="w-7 h-7 rounded-full bg-teal-100 object-cover border border-white/20"
                />
                <span className="font-bold text-white">Curated by {trip.user.name}</span>
              </div>
            )}
            {trip.start_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>
                  {trip.start_date} {trip.end_date ? `to ${trip.end_date}` : ''}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-400" />
              <span>Est. Total Budget: ${totalCost.toLocaleString()} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Day-by-Day Journey Stops</h2>

        <div className="space-y-6">
          {trip.stops?.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="relative p-6 bg-slate-900 text-white flex items-center justify-between">
                <div
                  className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url(${stop.city?.image_url})` }}
                />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 font-black text-base flex items-center justify-center shadow">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{stop.city?.name}, {stop.city?.country}</h3>
                    <p className="text-xs text-slate-300">
                      {stop.arrival_date && stop.departure_date
                        ? `${stop.arrival_date} — ${stop.departure_date}`
                        : stop.arrival_date || 'Dates flexible'}
                    </p>
                  </div>
                </div>

                <span className="relative z-10 text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur font-semibold">
                  {stop.trip_activities?.length || 0} Activities
                </span>
              </div>

              {stop.notes && (
                <div className="px-6 py-3 bg-teal-50/60 border-b border-slate-100 text-xs text-teal-900 font-medium">
                  📌 {stop.notes}
                </div>
              )}

              {/* Scheduled Activities */}
              <div className="p-6">
                {stop.trip_activities?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">
                    No scheduled activities listed.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stop.trip_activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200"
                      >
                        {act.activity?.image_url ? (
                          <img
                            src={act.activity.image_url}
                            alt={act.custom_title || act.activity?.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold">
                            <Compass className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {act.custom_title || act.activity?.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {act.activity?.description || act.notes || act.activity?.location_name}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                            <span>{act.scheduled_time || 'Morning'}</span>
                            <span className="font-bold text-slate-800">
                              {(act.custom_cost || act.activity?.estimated_cost || 0) > 0
                                ? `$${act.custom_cost || act.activity?.estimated_cost}`
                                : 'Free'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Login / Signup Modal for Visitors wishing to copy */}
      <Modal
        isOpen={promptLoginModal}
        onClose={() => setPromptLoginModal(false)}
        title="Sign in to copy this itinerary"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Copy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Save & customize this trip in your account
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Create a free GlobeTrotter account or sign in to clone "{trip.title}" into your personal itinerary planner.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow transition-colors"
            >
              Sign In / Sign Up
            </Link>
            <button
              type="button"
              onClick={() => setPromptLoginModal(false)}
              className="text-xs text-slate-500 hover:text-slate-700 py-1"
            >
              Continue viewing without account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
