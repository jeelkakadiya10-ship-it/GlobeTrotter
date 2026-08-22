import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Globe,
  PlusCircle,
  Tag
} from 'lucide-react';
import { CityCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East'];

export const CitySearchPage = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await api.getCities({
        search: search.trim() || undefined,
        region: region !== 'All' ? region : undefined
      });
      setCities(res.cities || []);
    } catch (err) {
      console.error('Failed to search cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCities();
    }, 150);
    return () => clearTimeout(timer);
  }, [search, region]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" />
          Global Destination Hub
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore World Cities & Curated Sights
        </h1>
        <p className="text-sm text-slate-500">
          Discover top rated attractions, culinary hotspots, and cultural treasures in 15+ world-famous destinations.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city name, country, or description (e.g. Paris, Japan, Beaches)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                region === r
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CityCardSkeleton />
          <CityCardSkeleton />
          <CityCardSkeleton />
          <CityCardSkeleton />
        </div>
      ) : cities.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No destinations match your query"
          description={`We couldn't find any destination matching "${search}". Try adjusting your search query or reset region filters.`}
          actionText="Clear Filters"
          onActionClick={() => {
            setSearch('');
            setRegion('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div
              key={city.id}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Photo */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur text-white text-[11px] font-semibold">
                  {city.region}
                </span>

                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-xl font-bold">{city.name}</h3>
                  <p className="text-xs text-slate-200">{city.country}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {city.description}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Currency: {city.currency}</span>
                    <span>{city._count?.activities || 5}+ Curated Activities</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/cities/${city.id}/activities`}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
                    >
                      <span>Activities</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      to={`/trips/new`}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Start Trip</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
