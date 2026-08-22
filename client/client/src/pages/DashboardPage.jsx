import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Compass,
  Calendar,
  MapPin,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  Share2,
  ChevronRight,
  Globe2
} from 'lucide-react';
import { TripCardSkeleton, CityCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [recommendedCities, setRecommendedCities] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          api.getTrips(),
          api.getCities()
        ]);
        setTrips(tripsRes.trips || []);
        // Pick 4 curated featured cities
        setRecommendedCities((citiesRes.cities || []).slice(0, 4));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingTrips(false);
        setLoadingCities(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute dashboard metrics
  const totalTrips = trips.length;
  const totalStops = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const nextTrip = trips.find(t => t.start_date && new Date(t.start_date) >= new Date(new Date().setHours(0,0,0,0))) || trips[0];

  // Calculate days until next trip
  let daysUntilNext = null;
  if (nextTrip?.start_date) {
    const diffTime = new Date(nextTrip.start_date) - new Date();
    daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-teal-900/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome back, {user?.name?.split(' ')[0]}!
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Where will your passport take you next?
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {nextTrip
                ? `You have "${nextTrip.title}" upcoming${daysUntilNext !== null && daysUntilNext > 0 ? ` in ${daysUntilNext} days` : ''}. Review your itinerary, schedule activities, or plan a new escape.`
                : 'Turn your travel dreams into detailed day-by-day itineraries with auto budget tracking and seamless sharing.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Link
              to="/trips/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 transition-all hover:scale-105 active:scale-100"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Trip</span>
            </Link>
            <Link
              to="/cities/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur transition-colors"
            >
              <Globe2 className="w-4 h-4" />
              <span>Explore Cities</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur border border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trips</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{totalTrips}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur border border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destinations Planned</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-400 mt-1">{totalStops}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur border border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Departure</p>
            <p className="text-lg sm:text-xl font-bold text-orange-400 mt-1 truncate">
              {daysUntilNext !== null && daysUntilNext > 0 ? `${daysUntilNext} Days` : nextTrip ? 'Ready' : 'None'}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur border border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Ready
            </p>
          </div>
        </div>
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Trips</h2>
            <p className="text-sm text-slate-500">Your active and saved travel itineraries</p>
          </div>
          {trips.length > 0 && (
            <Link
              to="/trips"
              className="inline-flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700"
            >
              <span>View All ({trips.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loadingTrips ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TripCardSkeleton />
            <TripCardSkeleton />
            <TripCardSkeleton />
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No trips planned yet"
            description="You haven't built any itineraries yet. Start planning your dream multi-city adventure today!"
            actionText="Plan Your First Trip"
            actionLink="/trips/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Cover Photo */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={trip.cover_image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Public badge */}
                  {trip.is_public && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-sm backdrop-blur flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      Public
                    </span>
                  )}

                  {/* Stop count pill */}
                  <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>{trip.stops?.length || 0} Cities</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {trip.description || 'No description provided.'}
                    </p>

                    {/* Stops List */}
                    {trip.stops && trip.stops.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {trip.stops.map((stop) => (
                          <span
                            key={stop.id}
                            className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-100"
                          >
                            {stop.city?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.start_date ? trip.start_date : 'Dates flexible'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/trips/${trip.id}/builder`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Builder
                      </Link>
                      <Link
                        to={`/trips/${trip.id}/view`}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        View Itinerary
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Curated Destinations Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curated Destinations</h2>
            <p className="text-sm text-slate-500">Popular cities to jumpstart your next itinerary</p>
          </div>
          <Link
            to="/cities/search"
            className="inline-flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700"
          >
            <span>Explore All 15+ Cities</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingCities ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CityCardSkeleton />
            <CityCardSkeleton />
            <CityCardSkeleton />
            <CityCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCities.map((city) => (
              <div
                key={city.id}
                className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur text-white text-xs font-semibold">
                    {city.region}
                  </span>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <p className="text-xs text-slate-200">{city.country}</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {city.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {city._count?.activities || 5}+ top activities
                    </span>
                    <Link
                      to={`/cities/${city.id}/activities`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
