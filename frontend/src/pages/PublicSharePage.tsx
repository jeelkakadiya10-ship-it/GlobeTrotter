import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trip } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Calendar, MapPin, Copy, Clock, Share2, Check, Lock, Plane, MessageCircle, Twitter, Facebook } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ItineraryDayView } from '../components/ItineraryDayView';

export const PublicSharePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        const res = await api.get(`/share/${slug}`);
        setTrip(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'This trip is private or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicTrip();
  }, [slug]);

  const handleCopyTrip = async () => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }

    if (!trip) return;
    setCopying(true);
    try {
      const res = await api.post(`/trips/${trip.id}/copy`);
      navigate(`/trips/${res.data.id}/builder`);
    } catch (err) {
      console.error('Failed to copy trip:', err);
    } finally {
      setCopying(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">This Trip is Private</h2>
        <p className="text-slate-500 max-w-md text-sm mb-6">
          The creator has not shared this itinerary publicly, or the link is invalid.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all"
        >
          Return to GlobeTrotter
        </button>
      </div>
    );
  }

  const pageUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out my trip itinerary for "${trip.name}" on GlobeTrotter! ✈️🌍`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Public Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] flex flex-col justify-end p-8 text-white">
        <img
          src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-white">
                Public Shared Itinerary
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                By {trip.user?.name || 'Fellow Traveler'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{trip.name}</h1>
            {trip.description && <p className="text-slate-200 text-sm max-w-2xl">{trip.description}</p>}
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
              <Calendar className="w-4 h-4 text-brand-400" />
              {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
            {/* Social Share Group */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl">
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}%20${pageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all"
                title="Share on X / Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
                title="Share on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={handleCopyTrip}
              disabled={copying}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded-2xl flex items-center gap-2 transition-all shadow-xl hover:scale-105"
            >
              <Copy className="w-4 h-4" />
              {copying ? 'Copying...' : 'Copy This Trip'}
            </button>
          </div>
        </div>
      </div>

      {/* Day-Wise View Component */}
      <ItineraryDayView trip={trip} />

      {/* Guest Login Prompt Modal */}
      <Modal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        title="Sign in to Copy Trip"
      >
        <div className="text-center py-4 space-y-4">
          <p className="text-slate-600 text-sm">
            Create an account or log in to clone this itinerary into your personal trip planner!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm shadow transition-all"
            >
              Log In / Sign Up
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};