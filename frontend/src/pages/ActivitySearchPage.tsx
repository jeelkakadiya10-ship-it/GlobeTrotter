import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Activity, City } from '../types';
import { Search, Filter, Clock, DollarSign, ArrowLeft, Plus, Check } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORIES = ['all', 'sightseeing', 'food', 'adventure', 'culture', 'other'];

export const ActivitySearchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [category, setCategory] = useState('all');
  const [maxCost, setMaxCost] = useState<number>(200);
  const [maxDuration, setMaxDuration] = useState<number>(480);
  const [loading, setLoading] = useState(true);

  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCityAndActivities = async () => {
      setLoading(true);
      try {
        const [citiesRes, actsRes] = await Promise.all([
          api.get('/cities'),
          api.get(`/cities/${id}/activities`, {
            params: {
              category,
              maxCost,
              maxDuration
            }
          })
        ]);
        const matchedCity = citiesRes.data.find((c: City) => c.id === Number(id));
        setCity(matchedCity || null);
        setActivities(actsRes.data);
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCityAndActivities();
  }, [id, category, maxCost, maxDuration]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Things to Do in {city?.name || 'City'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{city?.country} • {city?.region}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                category === cat
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Max Budget per Person:</span>
              <span className="text-brand-600 font-extrabold">{formatPrice(maxCost)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={maxCost}
              onChange={(e) => setMaxCost(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Max Duration:</span>
              <span className="text-brand-600 font-extrabold">{Math.floor(maxDuration / 60)}h {maxDuration % 60}m</span>
            </div>
            <input
              type="range"
              min="30"
              max="480"
              step="30"
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-semibold">No activities match your selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={act.image_url}
                  alt={act.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-bold text-white uppercase tracking-wider">
                  {act.category}
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500/90 backdrop-blur-md rounded-full text-xs font-black text-white">
                  {formatPrice(act.estimated_cost)}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{act.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    {act.estimated_duration_mins} minutes
                  </span>
                  <span className="font-bold text-slate-800">
                    Est. {formatPrice(act.estimated_cost)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};