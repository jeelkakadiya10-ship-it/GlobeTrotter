import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowRight, AlertCircle } from 'lucide-react';

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
];

export const CreateTripPage: React.FC = () => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(COVER_PRESETS[0]);
  const [targetBudget, setTargetBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a trip name.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Both start and end dates are required.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/trips', {
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        description: description.trim() || null,
        cover_photo_url: coverPhotoUrl,
        target_budget: targetBudget ? Number(targetBudget) : null
      });

      navigate(`/trips/${res.data.id}/builder`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Plan a New Trip</h1>
        <p className="text-slate-500 text-sm mt-1">Set your trip dates, name, and estimated budget to get started.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Trip Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer in Southern Italy, Japan Autumn Tour"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Target Budget (USD, optional)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={targetBudget}
              onChange={(e) => setTargetBudget(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about the purpose of this trip or what you want to achieve..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Cover Photo (URL or Preset)
            </label>
            <input
              type="url"
              value={coverPhotoUrl}
              onChange={(e) => setCoverPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm mb-3"
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              {COVER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverPhotoUrl(preset)}
                  className={`w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    coverPhotoUrl === preset ? 'border-brand-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Save & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};