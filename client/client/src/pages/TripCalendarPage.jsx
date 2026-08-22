import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DollarSign,
  Grid,
  List
} from 'lucide-react';

export const TripCalendarPage = () => {
  const { id: tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStopFilter, setSelectedStopFilter] = useState('All');
  const [displayMode, setDisplayMode] = useState('calendar'); // 'calendar' | 'schedule'

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.getTrip(tripId);
        setTrip(res.trip);
      } catch (err) {
        console.error('Failed to load trip for calendar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white animate-spin">
          <CalendarIcon className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Generating daily timeline calendar...</p>
      </div>
    );
  }

  // Aggregate all scheduled activities grouped by date
  const activitiesByDate = {};

  trip?.stops?.forEach((stop) => {
    if (selectedStopFilter !== 'All' && stop.id !== selectedStopFilter) return;

    stop.trip_activities?.forEach((act) => {
      const dateKey = act.scheduled_date || stop.arrival_date || 'Unscheduled';
      if (!activitiesByDate[dateKey]) {
        activitiesByDate[dateKey] = [];
      }
      activitiesByDate[dateKey].push({
        ...act,
        city: stop.city
      });
    });
  });

  const sortedDates = Object.keys(activitiesByDate).sort();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link to="/trips" className="hover:text-teal-600">My Trips</Link>
            <span>/</span>
            <Link to={`/trips/${tripId}/view`} className="hover:text-teal-600">{trip?.title}</Link>
            <span>/</span>
            <span className="text-teal-600">Timeline & Calendar</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip Calendar & Timeline
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Display Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setDisplayMode('calendar')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                displayMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Day Grid Mode"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayMode('schedule')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                displayMode === 'schedule'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Schedule List Mode"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={`/trips/${tripId}/builder`}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Itinerary Builder
          </Link>
        </div>
      </div>

      {/* Stop Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedStopFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedStopFilter === 'All'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Cities ({trip?.stops?.length || 0})
        </button>
        {trip?.stops?.map((stop) => (
          <button
            key={stop.id}
            type="button"
            onClick={() => setSelectedStopFilter(stop.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedStopFilter === stop.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {stop.city?.name}
          </button>
        ))}
      </div>

      {/* Calendar Grid View */}
      {displayMode === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDates.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No scheduled dates found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Add activities with assigned dates in the Itinerary Builder to populate your calendar.
              </p>
            </div>
          ) : (
            sortedDates.map((dateKey) => (
              <div
                key={dateKey}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Date Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-teal-400" />
                    <span className="font-bold text-sm">{dateKey}</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    {activitiesByDate[dateKey].length} Events
                  </span>
                </div>

                {/* Day Activities */}
                <div className="p-5 flex-1 space-y-3">
                  {activitiesByDate[dateKey].map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {act.scheduled_time || 'Flex Time'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                          {act.city?.name}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {act.custom_title || act.activity?.title}
                      </p>
                      {act.notes && (
                        <p className="text-xs text-slate-500 line-clamp-1">📌 {act.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Schedule List Mode */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="divide-y divide-slate-100">
            {sortedDates.map((dateKey) => (
              <div key={dateKey} className="py-6 first:pt-0 last:pb-0 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{dateKey}</h3>
                </div>

                <div className="space-y-2.5 pl-10">
                  {activitiesByDate[dateKey].map((act) => (
                    <div
                      key={act.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {act.scheduled_time || '10:00 AM'}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {act.custom_title || act.activity?.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {act.activity?.location_name || act.city?.name}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full self-start sm:self-auto">
                        {act.city?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
