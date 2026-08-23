import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { City, Trip } from '../types';
import { Search, MapPin, Sparkles, Plus, Bookmark, Check, ArrowRight } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useCurrency } from '../context/CurrencyContext';

const REGIONS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Middle East', 'Africa', 'Oceania'];

export const CitySearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const tripIdParam = searchParams.get('tripId');

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Add to trip modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [targetTripId, setTargetTripId] = useState<string>(tripIdParam || '');
  const [addingLoading, setAddingLoading] = useState(false);

  const { currency, getSymbol } = useCurrency();
  const navigate = useNavigate();

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cities', {
        params: {
          search: searchTerm,
          region: selectedRegion
        }
      });
      setCities(res.data);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedRegion]);

  useEffect(() => {
    const loadUserTrips = async () => {
      try {
        const res = await api.get('/trips');
        setTrips(res.data);
        if (!targetTripId && res.data.length > 0) {
          setTargetTripId(String(res.data[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadUserTrips();
  }, []);

  const handleAddToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !targetTripId) return;

    setAddingLoading(true);
    try {
      await api.post(`/trips/${targetTripId}/stops`, {
        city_id: selectedCity.id
      });
      setAddModalOpen(false);
      navigate(`/trips/${targetTripId}/builder`);
    } catch (err) {
      console.error('Failed to add stop to trip:', err);
    } finally {
      setAddingLoading(false);
    }
  };

  const getCostIndexLabel = (costIndex: number | null) => {
    const symbol = getSymbol(currency);
    const count = costIndex || 2;
    return symbol.repeat(count);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Explore Cities & Destinations</h1>
        <p className="text-slate-500 text-sm mt-1">Discover popular travel destinations and add them to your itineraries.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by city or country (e.g. Paris, Japan, Rome)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {REGIONS.map(r => (
              <option key={r} value={r}>{r} Region</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse p-4 flex flex-col justify-between">
              <div className="h-32 bg-slate-200 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-semibold">No destinations matched your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div
              key={city.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-bold text-white">
                  {getCostIndexLabel(city.cost_index)}
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold leading-tight">{city.name}</h3>
                  <p className="text-xs text-slate-300">{city.country} • {city.region}</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Popularity: {city.popularity_score}/100
                  </span>
                  <span>{city._count?.activities || 0} Activities</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (tripIdParam) {
                        api.post(`/trips/${tripIdParam}/stops`, { city_id: city.id }).then(() => {
                          navigate(`/trips/${tripIdParam}/builder`);
                        });
                      } else {
                        setSelectedCity(city);
                        setAddModalOpen(true);
                      }
                    }}
                    className="py-2 px-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Trip
                  </button>
                  <button
                    onClick={() => navigate(`/cities/${city.id}/activities`)}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Activities
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add City to Trip Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={`Add ${selectedCity?.name} to Trip`}
      >
        {trips.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-600 text-sm mb-4">You have no active trips. Create a new trip first!</p>
            <button
              onClick={() => navigate('/trips/new')}
              className="px-6 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-sm"
            >
              Plan New Trip
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddToTrip} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Itinerary:
              </label>
              <select
                value={targetTripId}
                onChange={(e) => setTargetTripId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.display_currency || 'USD'})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingLoading}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow transition-all"
              >
                {addingLoading ? 'Adding...' : 'Add Stop'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};