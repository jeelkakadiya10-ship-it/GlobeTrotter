import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  Search,
  Filter,
  Clock,
  DollarSign,
  Star,
  PlusCircle,
  Sparkles,
  MapPin,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { ActivityCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';

const CATEGORIES = ['All', 'Sightseeing', 'Food & Dining', 'Adventure', 'Culture & History', 'Relaxation'];

export const ActivitySearchPage = () => {
  const { id: cityId } = useParams();
  const [searchParams] = useSearchParams();
  const tripStopId = searchParams.get('stopId');

  const [city, setCity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Add to trip modal (if not directly on a stop)
  const [userTrips, setUserTrips] = useState([]);
  const [selectTripModalOpen, setSelectTripModalOpen] = useState(false);
  const [selectedActivityToSchedule, setSelectedActivityToSchedule] = useState(null);
  const [targetStopId, setTargetStopId] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.getCityActivities(cityId, {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        maxCost: maxCost || undefined,
        maxDuration: maxDuration || undefined,
        search: searchQuery.trim() || undefined
      });
      setCity(res.city);
      setActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to load city activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities();
    }, 150);
    return () => clearTimeout(timer);
  }, [cityId, selectedCategory, maxCost, maxDuration, searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open modal to choose which trip/stop to add this activity to
  const handleScheduleClick = async (activity) => {
    setSelectedActivityToSchedule(activity);
    if (tripStopId) {
      // If direct stop was passed in query param, add directly!
      try {
        await api.addTripActivity(tripStopId, {
          activity_id: activity.id,
          custom_cost: activity.estimated_cost
        });
        showToast(`Added "${activity.title}" to your itinerary stop!`);
      } catch (err) {
        showToast(err.message || 'Failed to add activity.');
      }
      return;
    }

    // Otherwise fetch trips to let user choose
    try {
      const res = await api.getTrips();
      setUserTrips(res.trips || []);
      setSelectTripModalOpen(true);
    } catch (err) {
      console.error('Failed to load user trips:', err);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!targetStopId || !selectedActivityToSchedule) return;
    setIsScheduling(true);
    try {
      await api.addTripActivity(targetStopId, {
        activity_id: selectedActivityToSchedule.id,
        custom_cost: selectedActivityToSchedule.estimated_cost
      });
      setSelectTripModalOpen(false);
      setSelectedActivityToSchedule(null);
      showToast(`Added "${selectedActivityToSchedule.title}" to your trip!`);
    } catch (err) {
      showToast(err.message || 'Failed to schedule activity.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* City Hero Header */}
      {city && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 shadow-xl">
          <img
            src={city.image_url}
            alt={city.name}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

          <div className="relative z-10 space-y-3">
            <Link
              to="/cities/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-teal-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all cities</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-500 text-slate-950 text-xs font-bold uppercase tracking-wider">
                {city.region}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-300">Currency: {city.currency}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Things to do in {city.name}, {city.country}
            </h1>
            <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
              {city.description}
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search Control Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activities by name or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Max Cost Filter */}
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              placeholder="Max cost ($ USD)..."
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Max Duration Filter */}
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              placeholder="Max duration (minutes)..."
              value={maxDuration}
              onChange={(e) => setMaxDuration(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActivityCardSkeleton />
          <ActivityCardSkeleton />
          <ActivityCardSkeleton />
          <ActivityCardSkeleton />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No activities found"
          description="Try loosening your filters (e.g. increase max budget or select All categories) to discover more attractions."
          actionText="Reset All Filters"
          onActionClick={() => {
            setSelectedCategory('All');
            setMaxCost('');
            setMaxDuration('');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col sm:flex-row"
            >
              <div className="sm:w-48 h-48 sm:h-auto overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={activity.image_url}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 uppercase tracking-wider">
                      {activity.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {activity.rating}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                    {activity.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {activity.description}
                  </p>

                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {activity.location_name}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {activity.estimated_cost > 0 ? `$${activity.estimated_cost}` : 'Free'}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      • {activity.estimated_duration_min} mins
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleScheduleClick(activity)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Select Trip & Stop Modal */}
      <Modal
        isOpen={selectTripModalOpen}
        onClose={() => setSelectTripModalOpen(false)}
        title="Schedule Activity into a Trip"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select which trip and city stop to add{' '}
            <strong className="text-slate-900">{selectedActivityToSchedule?.title}</strong> to:
          </p>

          {userTrips.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
              You don’t have any trips created yet.
              <div className="mt-2">
                <Link
                  to="/trips/new"
                  className="font-bold text-teal-600 hover:text-teal-700 underline"
                >
                  Create a new trip first
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {userTrips.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-900 mb-2">{t.title}</p>
                  {t.stops?.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No stops in this trip yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {t.stops.map((s) => (
                        <label
                          key={s.id}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            targetStopId === s.id
                              ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                              : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="targetStop"
                              value={s.id}
                              checked={targetStopId === s.id}
                              onChange={() => setTargetStopId(s.id)}
                              className="text-teal-600 focus:ring-teal-500"
                            />
                            <span>
                              Stop {s.stop_order}: {s.city?.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{s.arrival_date || 'Flexible'}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectTripModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSchedule}
              disabled={!targetStopId || isScheduling}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {isScheduling ? 'Adding...' : 'Add Activity to Itinerary'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
