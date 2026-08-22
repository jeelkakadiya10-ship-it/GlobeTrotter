import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Clock,
  DollarSign,
  Share2,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
  X,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Modal, ConfirmDialog } from '../components/Modal';
import { ActivityCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';

export const ItineraryBuilderPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Add stop modal state
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [cityRegionFilter, setCityRegionFilter] = useState('All');
  const [selectedCityToAdd, setSelectedCityToAdd] = useState(null);
  const [stopArrivalDate, setStopArrivalDate] = useState('');
  const [stopDepartureDate, setStopDepartureDate] = useState('');
  const [stopNotes, setStopNotes] = useState('');
  const [stopBudgetAllocated, setStopBudgetAllocated] = useState('');
  const [isAddingStop, setIsAddingStop] = useState(false);

  // Add activity modal state
  const [activeStopForActivity, setActiveStopForActivity] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [cityCatalogActivities, setCityCatalogActivities] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('All');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [customActivityMode, setCustomActivityMode] = useState(false);

  // Custom activity form state
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customTime, setCustomTime] = useState('10:00');
  const [customDate, setCustomDate] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Stop delete confirm dialog
  const [stopToDelete, setStopToDelete] = useState(null);
  const [isDeletingStop, setIsDeletingStop] = useState(false);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  const fetchTripDetails = async () => {
    try {
      const res = await api.getTrip(tripId);
      setTrip(res.trip);
    } catch (err) {
      console.error('Failed to load trip:', err);
      setError(err.message || 'Failed to load trip.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open add stop dialog
  const handleOpenAddStopModal = async () => {
    setAddStopModalOpen(true);
    if (availableCities.length === 0) {
      try {
        const res = await api.getCities();
        setAvailableCities(res.cities || []);
      } catch (err) {
        console.error('Failed to load cities catalog:', err);
      }
    }
  };

  // Submit new stop
  const handleAddStop = async () => {
    if (!selectedCityToAdd) return;
    setIsAddingStop(true);
    try {
      await api.addStop(tripId, {
        city_id: selectedCityToAdd.id,
        arrival_date: stopArrivalDate || undefined,
        departure_date: stopDepartureDate || undefined,
        notes: stopNotes || undefined,
        budget_allocated: stopBudgetAllocated ? parseFloat(stopBudgetAllocated) : 0
      });
      await fetchTripDetails();
      setAddStopModalOpen(false);
      setSelectedCityToAdd(null);
      setStopArrivalDate('');
      setStopDepartureDate('');
      setStopNotes('');
      setStopBudgetAllocated('');
      showToast(`Added ${selectedCityToAdd.name} to itinerary!`);
    } catch (err) {
      showToast(err.message || 'Failed to add stop.');
    } finally {
      setIsAddingStop(false);
    }
  };

  // Move stop up or down (mobile friendly & accessible)
  const handleMoveStop = async (currentIndex, direction) => {
    const newIndex = currentIndex + direction;
    if (!trip?.stops || newIndex < 0 || newIndex >= trip.stops.length) return;

    const updatedStops = [...trip.stops];
    const [moved] = updatedStops.splice(currentIndex, 1);
    updatedStops.splice(newIndex, 0, moved);

    // Optimistic UI update
    setTrip({ ...trip, stops: updatedStops });

    try {
      const orderedIds = updatedStops.map(s => s.id);
      await api.reorderStops(tripId, orderedIds);
      showToast('Stops reordered.');
    } catch (err) {
      showToast('Failed to save stop order.');
      fetchTripDetails();
    }
  };

  // Drag & drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedStops = [...trip.stops];
    const [moved] = updatedStops.splice(draggedIndex, 1);
    updatedStops.splice(index, 0, moved);
    setDraggedIndex(index);
    setTrip({ ...trip, stops: updatedStops });
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const orderedIds = trip.stops.map(s => s.id);
      await api.reorderStops(tripId, orderedIds);
      showToast('Stops reordered.');
    } catch (err) {
      showToast('Failed to save stop order.');
      fetchTripDetails();
    }
  };

  // Delete stop
  const handleDeleteStop = async () => {
    if (!stopToDelete) return;
    setIsDeletingStop(true);
    try {
      await api.deleteStop(stopToDelete.id);
      await fetchTripDetails();
      setStopToDelete(null);
      showToast('Stop removed from itinerary.');
    } catch (err) {
      showToast(err.message || 'Failed to delete stop.');
    } finally {
      setIsDeletingStop(false);
    }
  };

  // Open activity catalog for a stop
  const handleOpenActivityModal = async (stop) => {
    setActiveStopForActivity(stop);
    setCustomDate(stop.arrival_date || '');
    setActivityModalOpen(true);
    setCatalogLoading(true);
    setCustomActivityMode(false);

    try {
      const res = await api.getCityActivities(stop.city_id);
      setCityCatalogActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to load city activities:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Add catalog activity to stop
  const handleAddCatalogActivity = async (activity) => {
    if (!activeStopForActivity) return;
    try {
      await api.addTripActivity(activeStopForActivity.id, {
        activity_id: activity.id,
        scheduled_date: activeStopForActivity.arrival_date || undefined,
        scheduled_time: '10:00',
        custom_cost: activity.estimated_cost
      });
      await fetchTripDetails();
      showToast(`Added "${activity.title}" to ${activeStopForActivity.city.name}!`);
    } catch (err) {
      showToast(err.message || 'Failed to add activity.');
    }
  };

  // Add custom activity to stop
  const handleAddCustomActivity = async (e) => {
    e.preventDefault();
    if (!activeStopForActivity || !customTitle.trim()) return;

    setIsAddingActivity(true);
    try {
      await api.addTripActivity(activeStopForActivity.id, {
        custom_title: customTitle.trim(),
        custom_cost: customCost ? parseFloat(customCost) : 0,
        scheduled_date: customDate || activeStopForActivity.arrival_date || undefined,
        scheduled_time: customTime || undefined,
        notes: customNotes || undefined
      });
      await fetchTripDetails();
      setCustomTitle('');
      setCustomCost('');
      setCustomNotes('');
      setCustomActivityMode(false);
      showToast('Custom activity added to stop!');
    } catch (err) {
      showToast(err.message || 'Failed to add custom activity.');
    } finally {
      setIsAddingActivity(false);
    }
  };

  // Remove activity from stop
  const handleDeleteActivity = async (activityId) => {
    try {
      await api.deleteTripActivity(activityId);
      await fetchTripDetails();
      showToast('Activity removed.');
    } catch (err) {
      showToast(err.message || 'Failed to delete activity.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white animate-spin">
          <Compass className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Loading Itinerary Builder...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Unable to load trip</h2>
        <p className="text-sm text-slate-500">{error || 'Trip could not be found.'}</p>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm shadow-sm"
        >
          Return to My Trips
        </Link>
      </div>
    );
  }

  // Filtered catalog activities
  const filteredCatalog = cityCatalogActivities.filter((act) => {
    const matchesCategory = activityCategoryFilter === 'All' || act.category === activityCategoryFilter;
    const matchesSearch =
      !activitySearchQuery.trim() ||
      act.title.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(activitySearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/trips" className="hover:text-teal-600">My Trips</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{trip.title}</span>
            <span>/</span>
            <span className="text-teal-600">Itinerary Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {trip.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/trips/${trip.id}/view`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Itinerary View</span>
          </Link>
          <Link
            to={`/trips/${trip.id}/budget`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Budget Breakdown</span>
          </Link>
          <Link
            to={`/trips/${trip.id}/calendar`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline</span>
          </Link>
          <button
            type="button"
            onClick={handleOpenAddStopModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add City Stop</span>
          </button>
        </div>
      </div>

      {/* Main Stops Column */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              City Stops & Scheduled Days ({trip.stops?.length || 0})
            </h2>
            <p className="text-xs text-slate-500">
              Drag stops to reorder your route, or use the up/down arrows on mobile.
            </p>
          </div>
        </div>

        {trip.stops?.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No destination stops added"
            description="Add your first city stop to begin building your personalized day-by-day itinerary."
            actionText="Add First City Stop"
            onActionClick={handleOpenAddStopModal}
          />
        ) : (
          <div className="space-y-6">
            {trip.stops.map((stop, index) => (
              <div
                key={stop.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all ${
                  draggedIndex === index ? 'opacity-40 ring-2 ring-teal-500' : 'hover:border-slate-300'
                }`}
              >
                {/* Stop Header Banner */}
                <div className="relative p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* City Background Thumbnail overlay */}
                  <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
                    style={{ backgroundImage: `url(${stop.city?.image_url})` }}
                  />

                  <div className="relative z-10 flex items-center gap-4">
                    {/* Stop Order Badge & Drag handle */}
                    <div className="flex items-center gap-2">
                      <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-white p-1">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 font-black text-base flex items-center justify-center shadow">
                        {stop.stop_order || index + 1}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{stop.city?.name}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
                          {stop.city?.country}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {stop.arrival_date && stop.departure_date
                          ? `${stop.arrival_date} — ${stop.departure_date}`
                          : stop.arrival_date
                          ? `Arriving ${stop.arrival_date}`
                          : 'Dates not set'}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Up/Down mobile arrows & Delete */}
                  <div className="relative z-10 flex items-center gap-2">
                    {/* Up button */}
                    <button
                      type="button"
                      onClick={() => handleMoveStop(index, -1)}
                      disabled={index === 0}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                      title="Move stop up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    {/* Down button */}
                    <button
                      type="button"
                      onClick={() => handleMoveStop(index, 1)}
                      disabled={index === trip.stops.length - 1}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                      title="Move stop down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenActivityModal(stop)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Activity</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStopToDelete(stop)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-colors"
                      title="Remove stop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stop Notes if any */}
                {stop.notes && (
                  <div className="px-6 py-3 bg-teal-50/50 border-b border-slate-100 text-xs text-teal-900 font-medium">
                    📌 {stop.notes}
                  </div>
                )}

                {/* Scheduled Activities for this Stop */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Scheduled Activities ({stop.trip_activities?.length || 0})
                    </h4>
                  </div>

                  {stop.trip_activities?.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 mb-3">
                        No activities scheduled yet for {stop.city?.name}.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenActivityModal(stop)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-700 text-xs font-bold shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>Browse {stop.city?.name} Activities</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stop.trip_activities.map((act) => {
                        const title = act.custom_title || act.activity?.title || 'Scheduled Activity';
                        const image = act.activity?.image_url;
                        const cost = act.custom_cost ?? act.activity?.estimated_cost ?? 0;
                        const category = act.activity?.category || 'Custom';

                        return (
                          <div
                            key={act.id}
                            className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {image ? (
                                <img
                                  src={image}
                                  alt={title}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                  <Compass className="w-6 h-6" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                                  {title}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span className="font-semibold text-teal-700">{category}</span>
                                  {act.scheduled_time && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" />
                                        {act.scheduled_time}
                                      </span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span className="font-semibold text-slate-700">
                                    {cost > 0 ? `$${cost}` : 'Free'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(act.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                              title="Delete activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      <Modal
        isOpen={addStopModalOpen}
        onClose={() => {
          setAddStopModalOpen(false);
          setSelectedCityToAdd(null);
        }}
        title="Add City Stop to Route"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Step 1: Select City */}
          <div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search destination cities..."
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Region Filter */}
              <select
                value={cityRegionFilter}
                onChange={(e) => setCityRegionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Regions</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Americas">Americas</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
                <option value="Middle East">Middle East</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
              {availableCities
                .filter((c) => {
                  const matchR = cityRegionFilter === 'All' || c.region === cityRegionFilter;
                  const matchQ =
                    !citySearchQuery ||
                    c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
                    c.country.toLowerCase().includes(citySearchQuery.toLowerCase());
                  return matchR && matchQ;
                })
                .map((city) => {
                  const isSelected = selectedCityToAdd?.id === city.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => setSelectedCityToAdd(city)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={city.image_url}
                        alt={city.name}
                        className="w-full h-16 rounded-lg object-cover mb-1.5"
                      />
                      <p className="text-xs font-bold text-slate-900 truncate">{city.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{city.country}</p>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Step 2: Stop Timing Details */}
          {selectedCityToAdd && (
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-3 animate-in fade-in">
              <p className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                Configuring Stop: {selectedCityToAdd.name}, {selectedCityToAdd.country}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={stopArrivalDate}
                    onChange={(e) => setStopArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={stopDepartureDate}
                    onChange={(e) => setStopDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Stop Notes / Hotel Info
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staying near Central Station. Book museums in advance."
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddStopModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddStop}
              disabled={!selectedCityToAdd || isAddingStop}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {isAddingStop ? 'Adding Stop...' : 'Confirm & Add Stop'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Activity Modal (Catalog + Custom) */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title={`Add Activity to ${activeStopForActivity?.city?.name}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          {/* Mode Switch: Catalog vs Custom Activity */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCustomActivityMode(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !customActivityMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Curated {activeStopForActivity?.city?.name} Catalog
            </button>
            <button
              type="button"
              onClick={() => setCustomActivityMode(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                customActivityMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Custom Activity
            </button>
          </div>

          {!customActivityMode ? (
            <div className="space-y-4">
              {/* Category Filter Chips & Search */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search curated activities..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {['All', 'Sightseeing', 'Food & Dining', 'Adventure', 'Culture & History', 'Relaxation'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActivityCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                          activityCategoryFilter === cat
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Activity Cards List */}
              {catalogLoading ? (
                <div className="space-y-3">
                  <ActivityCardSkeleton />
                  <ActivityCardSkeleton />
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl">
                  No activities found matching filters. Try switching categories or create a custom activity.
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                  {filteredCatalog.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={activity.image_url}
                          alt={activity.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {activity.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold shrink-0">
                              {activity.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                            <span className="font-semibold text-slate-800">
                              {activity.estimated_cost > 0 ? `$${activity.estimated_cost}` : 'Free'}
                            </span>
                            <span>•</span>
                            <span>{activity.estimated_duration_min} mins</span>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold">★ {activity.rating}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddCatalogActivity(activity)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Custom Activity Form */
            <form onSubmit={handleAddCustomActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner reservation at Le Jules Verne"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cost ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Booking References
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Confirmation #84920. Dress code is smart casual."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingActivity}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {isAddingActivity ? 'Adding...' : 'Save Activity to Stop'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Delete Stop Confirmation */}
      <ConfirmDialog
        isOpen={!!stopToDelete}
        onClose={() => setStopToDelete(null)}
        onConfirm={handleDeleteStop}
        title={`Remove ${stopToDelete?.city?.name}?`}
        message={`Are you sure you want to remove ${stopToDelete?.city?.name} from this trip? All activities scheduled for this city stop will be removed.`}
        confirmText="Remove Stop"
        isLoading={isDeletingStop}
        isDestructive={true}
      />
    </div>
  );
};
