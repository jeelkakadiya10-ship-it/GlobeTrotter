import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trip, Stop, Activity } from '../types';
import { Calendar, MapPin, Plus, Trash2, ArrowUp, ArrowDown, Search, Eye, PieChart, Clock, DollarSign, GripVertical, AlertCircle, Save, Coins } from 'lucide-react';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { FlightStaySection } from '../components/FlightStaySection';
import { SaveTripButton } from '../components/SaveTripButton';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';

export const ItineraryBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingTrip, setSavingTrip] = useState(false);

  // Edit in place state
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');

  // Delete stop modal state
  const [deleteStopModalOpen, setDeleteStopModalOpen] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<Stop | null>(null);

  // Search activities modal state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activeStop, setActiveStop] = useState<Stop | null>(null);
  const [cityActivities, setCityActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const { formatPrice, getSymbol } = useCurrency();
  const navigate = useNavigate();

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data);
      setTripName(res.data.name);
      setStartDate(res.data.start_date.split('T')[0]);
      setEndDate(res.data.end_date.split('T')[0]);
      if (res.data.display_currency && res.data.display_currency in CURRENCIES) {
        setDisplayCurrency(res.data.display_currency as CurrencyCode);
      }
    } catch (err) {
      console.error('Failed to load trip builder:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleUpdateTripHeader = async (newCurrency?: CurrencyCode) => {
    if (!trip) return;
    setSavingTrip(true);
    try {
      const updatedCurrency = newCurrency || displayCurrency;
      await api.patch(`/trips/${trip.id}`, {
        name: tripName,
        start_date: startDate,
        end_date: endDate,
        display_currency: updatedCurrency
      });
      if (newCurrency) setDisplayCurrency(newCurrency);
      fetchTrip();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTrip(false);
    }
  };

  const handleMoveStop = async (index: number, direction: 'up' | 'down') => {
    if (!trip || !trip.stops) return;
    const stops = [...trip.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const [moved] = stops.splice(index, 1);
    stops.splice(targetIndex, 0, moved);

    const orderedStopIds = stops.map(s => s.id);
    try {
      const res = await api.patch(`/trips/${trip.id}/stops/reorder`, { orderedStopIds });
      setTrip({ ...trip, stops: res.data });
    } catch (err) {
      console.error('Failed to reorder stops:', err);
    }
  };

  const handleDeleteStop = async () => {
    if (!stopToDelete) return;
    try {
      await api.delete(`/stops/${stopToDelete.id}`);
      setDeleteStopModalOpen(false);
      setStopToDelete(null);
      fetchTrip();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenActivitySearch = async (stop: Stop) => {
    setActiveStop(stop);
    setActivityModalOpen(true);
    setActivitiesLoading(true);
    try {
      const res = await api.get(`/cities/${stop.city_id}/activities`);
      setCityActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleToggleActivity = async (activity: Activity, stop: Stop) => {
    const existing = stop.trip_activities?.find(ta => ta.activity_id === activity.id);
    try {
      if (existing) {
        await api.delete(`/trip-activities/${existing.id}`);
      } else {
        await api.post(`/stops/${stop.id}/activities`, {
          activity_id: activity.id,
          scheduled_date: stop.arrival_date
        });
      }
      fetchTrip();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateStopSubtotal = (stop: Stop) => {
    return (stop.trip_activities || []).reduce((acc, ta) => {
      const cost = ta.cost_override !== null && ta.cost_override !== undefined
        ? Number(ta.cost_override)
        : (ta.activity?.estimated_cost ? Number(ta.activity.estimated_cost) : 0);
      return acc + cost;
    }, 0);
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
      <div className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-center text-slate-500">Trip not found.</p>
      </div>
    );
  }

  const stopCityNames = (trip.stops || []).map((s) => s.city?.name).filter(Boolean);
  const activeTripCurrency = trip.display_currency || displayCurrency || 'USD';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Trip Header (Edit-in-place) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              onBlur={() => handleUpdateTripHeader()}
              className="text-2xl sm:text-3xl font-black text-slate-900 w-full border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none transition-colors"
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-brand-600" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={() => handleUpdateTripHeader()}
                  className="bg-transparent focus:outline-none"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onBlur={() => handleUpdateTripHeader()}
                  min={startDate}
                  className="bg-transparent focus:outline-none"
                />
              </div>

              {/* Per-trip currency selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                <Coins className="w-3.5 h-3.5 text-brand-600" />
                <span>Trip Currency:</span>
                <select
                  value={displayCurrency}
                  onChange={(e) => {
                    const newC = e.target.value as CurrencyCode;
                    setDisplayCurrency(newC);
                    handleUpdateTripHeader(newC);
                  }}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SaveTripButton trip={trip} />

            <Link
              to={`/trips/${trip.id}/view`}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              Review Itinerary
            </Link>
            <Link
              to={`/trips/${trip.id}/budget`}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PieChart className="w-4 h-4" />
              Budget
            </Link>
          </div>
        </div>
      </div>

      {/* Stops list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Trip Itinerary Stops</h2>
            <p className="text-slate-500 text-sm">Add cities, adjust stay dates, and pick activities for each destination.</p>
          </div>
          <Link
            to={`/cities/search?tripId=${trip.id}`}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add City Stop
          </Link>
        </div>

        {trip.stops?.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No stops added yet"
            description="Your itinerary is empty. Click below to explore destinations and add your first city stop."
            actionText="Browse Destinations"
            onAction={() => navigate(`/cities/search?tripId=${trip.id}`)}
          />
        ) : (
          <div className="space-y-6">
            {trip.stops.map((stop, idx) => {
              const subtotal = calculateStopSubtotal(stop);
              return (
                <div
                  key={stop.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all"
                >
                  {/* Stop header */}
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveStop(idx, 'up')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Stop Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === (trip.stops.length - 1)}
                          onClick={() => handleMoveStop(idx, 'down')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Stop Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                        <img src={stop.city.image_url} alt={stop.city.name} className="w-full h-full object-cover" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900">{stop.city.name}</h3>
                          <span className="text-xs text-slate-400">({stop.city.country})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>Arrival: {new Date(stop.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>•</span>
                          <span>Departure: {new Date(stop.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stop Cost</p>
                        <p className="text-base font-black text-emerald-600">
                          {formatPrice(subtotal, { currency: activeTripCurrency })}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenActivitySearch(stop)}
                        className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Search Activities
                      </button>

                      <button
                        onClick={() => { setStopToDelete(stop); setDeleteStopModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove Stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stop activities list */}
                  <div className="p-6">
                    {stop.trip_activities?.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-xs text-slate-400 font-medium">No activities added for {stop.city.name} yet.</p>
                        <button
                          onClick={() => handleOpenActivitySearch(stop)}
                          className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-bold"
                        >
                          + Pick activities in {stop.city.name}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {stop.trip_activities.map((ta) => (
                          <div
                            key={ta.id}
                            className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 hover:border-slate-200 transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img
                                src={ta.activity.image_url}
                                alt={ta.activity.name}
                                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                              />
                              <div className="truncate">
                                <h4 className="text-xs font-bold text-slate-800 truncate">{ta.activity.name}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    {ta.activity.estimated_duration_mins}m
                                  </span>
                                  <span>•</span>
                                  <span className="font-bold text-emerald-600">
                                    {formatPrice(ta.cost_override ?? ta.activity.estimated_cost, { currency: activeTripCurrency })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={async () => {
                                await api.delete(`/trip-activities/${ta.id}`);
                                fetchTrip();
                              }}
                              className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg transition-colors flex-shrink-0"
                              title="Remove activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Flights & Stays Section */}
      <FlightStaySection tripId={trip.id} tripCurrency={activeTripCurrency} availableCities={stopCityNames} />

      {/* Delete Stop Modal */}
      <Modal
        isOpen={deleteStopModalOpen}
        onClose={() => setDeleteStopModalOpen(false)}
        title="Remove City Stop"
      >
        <div className="space-y-4">
          <p className="text-slate-700 text-sm">
            Are you sure you want to remove <span className="font-bold">{stopToDelete?.city.name}</span> from your trip?
            All activities planned for this stop will also be removed.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteStopModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteStop}
              className="px-5 py-2 bg-red-600 text-white font-bold text-sm rounded-xl shadow"
            >
              Remove Stop
            </button>
          </div>
        </div>
      </Modal>

      {/* Search Activities Modal */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title={`Activities in ${activeStop?.city.name}`}
        maxWidth="max-w-2xl"
      >
        {activitiesLoading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {cityActivities.map((act) => {
              const isAdded = activeStop?.trip_activities?.some(ta => ta.activity_id === act.id);
              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={act.image_url}
                      alt={act.name}
                      className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                          {act.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          {formatPrice(act.estimated_cost, { currency: activeTripCurrency })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{act.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{act.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => activeStop && handleToggleActivity(act, activeStop)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex-shrink-0 ${
                      isAdded
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                    }`}
                  >
                    {isAdded ? 'Remove' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};