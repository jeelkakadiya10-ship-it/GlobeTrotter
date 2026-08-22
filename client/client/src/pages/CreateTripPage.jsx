import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const CURATED_COVERS = [
  {
    title: 'Parisian Elegance',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Tokyo Neon & Temples',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Mediterranean Coast',
    url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Alpine Vista & Nature',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Tropical Beach Haven',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Manhattan Skyline',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80'
  }
];

export const CreateTripPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    target_budget: '',
    cover_image_url: CURATED_COVERS[0].url,
    is_public: false
  });

  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.getCities();
        setCities(res.cities || []);
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  const toggleCity = (cityId) => {
    if (selectedCities.includes(cityId)) {
      setSelectedCities(selectedCities.filter(id => id !== cityId));
    } else {
      setSelectedCities([...selectedCities, cityId]);
    }
  };

  const randomizeCover = () => {
    const random = CURATED_COVERS[Math.floor(Math.random() * CURATED_COVERS.length)];
    setFormData(prev => ({ ...prev, cover_image_url: random.url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a name for your trip.');
      return;
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      setError('Trip departure date cannot be after the return date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        target_budget: formData.target_budget ? parseFloat(formData.target_budget) : 0,
        initial_cities: selectedCities
      };

      const res = await api.createTrip(payload);
      // Immediately navigate to the itinerary builder
      navigate(`/trips/${res.trip.id}/builder`);
    } catch (err) {
      console.error('Failed to create trip:', err);
      setError(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Step 1: Trip Blueprint
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Create New Itinerary
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Set up your journey details, pick a cover photo, and choose initial cities. You can customize stops and activities next.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-600" />
            General Information
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 2-Week Autumn in Japan & Korea"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe your travel goals, highlights you want to see, or who is joining you..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
            />
          </div>

          {/* Dates & Target Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Target Budget ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 2500"
                value={formData.target_budget}
                onChange={(e) => setFormData({ ...formData, target_budget: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Cover Photo Picker */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-teal-600" />
              Cover Photography
            </h2>
            <button
              type="button"
              onClick={randomizeCover}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Random Cover
            </button>
          </div>

          {/* Current Cover Preview */}
          <div className="relative h-56 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
            <img
              src={formData.cover_image_url}
              alt="Trip Cover Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur">
                Cover Photo Preview
              </span>
            </div>
          </div>

          {/* Quick Select Presets */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Or pick from curated themes:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {CURATED_COVERS.map((cover) => (
                <button
                  key={cover.url}
                  type="button"
                  onClick={() => setFormData({ ...formData, cover_image_url: cover.url })}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    formData.cover_image_url === cover.url
                      ? 'border-teal-600 ring-2 ring-teal-500/30 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={cover.url} alt={cover.title} className="w-full h-full object-cover" />
                  {formData.cover_image_url === cover.url && (
                    <div className="absolute inset-0 bg-teal-600/40 flex items-center justify-center text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Custom Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Initial Destinations Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Choose Starting Cities (Optional)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any cities you know you want to visit. You can easily add more, reorder, or remove stops in the builder later.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
            {cities.map((city) => {
              const isSelected = selectedCities.includes(city.id);
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => toggleCity(city.id)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="relative w-full h-20 rounded-xl overflow-hidden">
                    <img
                      src={city.image_url}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-teal-600/50 flex items-center justify-center text-white">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center">
                    <p className="text-xs font-bold text-slate-900 truncate">{city.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{city.country}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Link
            to="/trips"
            className="px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Creating Itinerary...' : 'Continue to Itinerary Builder'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
