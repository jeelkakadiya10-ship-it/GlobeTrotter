import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';
import { Trip, City } from '../types';
import { PlusCircle, Calendar, MapPin, DollarSign, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [recommendedCities, setRecommendedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          api.get('/trips'),
          api.get('/cities')
        ]);
        setTrips(tripsRes.data);
        setRecommendedCities(citiesRes.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingTrips = trips.filter(t => new Date(t.end_date) >= new Date());
  const totalPlannedSpend = trips.reduce((acc, t) => acc + (Number(t.target_budget) || 0), 0);

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 via-teal-600 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-teal-200">Travel Command Center</span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Explorer'}! 👋
          </h1>
          <p className="text-teal-100 text-sm max-w-xl">
            Ready for your next adventure? Organize stops, customize activities, and track budgets with ease.
          </p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-900 hover:bg-teal-50 font-bold rounded-2xl shadow-lg hover:scale-105 transition-all text-sm whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5 text-brand-600" />
          Plan New Trip
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Trips</p>
            <p className="text-2xl font-black text-slate-900">{trips.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Trips</p>
            <p className="text-2xl font-black text-slate-900">{upcomingTrips.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Spend (Total)</p>
            <p className="text-2xl font-black text-slate-900">{formatPrice(totalPlannedSpend)}</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Trips</h2>
            <p className="text-sm text-slate-500">Your recently planned and ongoing itineraries</p>
          </div>
          {trips.length > 0 && (
            <Link to="/trips" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              See all ({trips.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {trips.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No trips planned yet"
            description="You haven't planned any trips so far. Create your first itinerary and start adding destinations and activities!"
            actionText="Plan Your First Trip"
            onAction={() => window.location.href = '/trips/new'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold truncate">{trip.name}</h3>
                    <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateRange(trip.start_date, trip.end_date)}
                    </p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {trip.stops?.length || 0} {(trip.stops?.length || 0) === 1 ? 'City' : 'Cities'}
                    </span>
                    {trip.target_budget && (
                      <span className="font-bold text-slate-800">
                        Budget: {formatPrice(trip.target_budget)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <Link
                      to={`/trips/${trip.id}/view`}
                      className="text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      to={`/trips/${trip.id}/builder`}
                      className="text-center py-2 px-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                      Edit Plan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-bold text-slate-900">Recommended Destinations</h2>
            </div>
            <p className="text-sm text-slate-500">Popular travel hotspots based on community itineraries</p>
          </div>
          <Link to="/cities/search" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Explore all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendedCities.map((city) => (
            <Link
              key={city.id}
              to={`/cities/search?search=${encodeURIComponent(city.name)}`}
              className="group relative rounded-2xl overflow-hidden h-44 shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={city.image_url}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white">
                {'$'.repeat(city.cost_index || 2)}
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-bold text-sm leading-tight truncate">{city.name}</h4>
                <p className="text-[11px] text-slate-300 truncate">{city.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};