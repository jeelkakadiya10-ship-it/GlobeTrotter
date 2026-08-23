import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trip } from '../types';
import { Calendar as CalendarIcon, Share2, Edit3, PieChart, Check, Copy, ArrowLeft } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ItineraryDayView } from '../components/ItineraryDayView';
import { FlightStaySection } from '../components/FlightStaySection';
import { SaveTripButton } from '../components/SaveTripButton';
import { useCurrency } from '../context/CurrencyContext';

export const ItineraryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);

  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.error('Failed to load trip view:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleToggleShare = async () => {
    if (!trip) return;
    setSharingLoading(true);
    try {
      const res = await api.patch(`/trips/${trip.id}/share`);
      setTrip({ ...trip, is_public: res.data.is_public, public_slug: res.data.public_slug });
    } catch (err) {
      console.error(err);
    } finally {
      setSharingLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!trip?.public_slug) return;
    const url = `${window.location.origin}/share/${trip.public_slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Trip not found.</p>
      </div>
    );
  }

  const shareUrl = trip.public_slug ? `${window.location.origin}/share/${trip.public_slug}` : '';
  const stopCityNames = (trip.stops || []).map((s) => s.city?.name).filter(Boolean);
  const tripCurrency = trip.display_currency || 'USD';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Trip Hero Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[280px] flex flex-col justify-end p-8 text-white">
        <img
          src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider text-teal-200">
                Itinerary Review
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white">
                Currency: {tripCurrency}
              </span>
              {trip.target_budget && (
                <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-full text-xs font-black text-white">
                  Target: {formatPrice(trip.target_budget, { currency: tripCurrency })}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black">{trip.name}</h1>
            {trip.description && <p className="text-slate-200 text-sm max-w-2xl">{trip.description}</p>}
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
              <CalendarIcon className="w-4 h-4 text-brand-400" />
              {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
            </p>
          </div>

          {/* Action toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Save Trip Button */}
            <SaveTripButton trip={trip} />

            <Link
              to={`/trips/${trip.id}/builder`}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Edit3 className="w-4 h-4 text-brand-600" />
              Edit Builder
            </Link>

            <Link
              to={`/trips/${trip.id}/budget`}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <PieChart className="w-4 h-4" />
              Budget
            </Link>

            <button
              onClick={() => setShareModalOpen(true)}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Day-Wise Itinerary Component with View Mode Toggle */}
      <ItineraryDayView trip={trip} />

      {/* Flights & Stays Section with Goibibo booking links */}
      <FlightStaySection tripId={trip.id} tripCurrency={tripCurrency} availableCities={stopCityNames} />

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Your Trip Itinerary"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">Public Link Access</p>
              <p className="text-xs text-slate-500 mt-0.5">Allow anyone with the link to view this itinerary.</p>
            </div>
            <button
              onClick={handleToggleShare}
              disabled={sharingLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                trip.is_public
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {trip.is_public ? 'Public' : 'Private'}
            </button>
          </div>

          {trip.is_public && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Shareable URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};