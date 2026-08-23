import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, List, LayoutGrid, Milestone, ChevronDown, ChevronUp } from 'lucide-react';
import { Trip, Stop, TripActivity } from '../types';
import { useCurrency } from '../context/CurrencyContext';

export type ViewMode = 'list' | 'timeline' | 'grid';

interface ItineraryDayViewProps {
  trip: Trip;
}

interface DayPlan {
  dayNumber: number;
  date: Date;
  dateStr: string;
  city: string;
  country: string;
  activities: TripActivity[];
}

export const ItineraryDayView: React.FC<ItineraryDayViewProps> = ({ trip }) => {
  const { formatPrice } = useCurrency();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('globetrotter_itinerary_view_mode');
    return (saved as ViewMode) || 'list';
  });

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('globetrotter_itinerary_view_mode', mode);
  };

  // Generate day-by-day structure
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const days: DayPlan[] = [];
  const stops = trip.stops || [];

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const currentDateStr = currentDate.toISOString().split('T')[0];

    // Find corresponding stop for this date
    let currentStop = stops.find((s) => {
      const arr = new Date(s.arrival_date).toISOString().split('T')[0];
      const dep = new Date(s.departure_date).toISOString().split('T')[0];
      return currentDateStr >= arr && currentDateStr <= dep;
    });

    if (!currentStop && stops.length > 0) {
      currentStop = stops[Math.min(i, stops.length - 1)];
    }

    // Find activities for this day or stop
    const dayActivities: TripActivity[] = [];
    if (currentStop && currentStop.trip_activities) {
      currentStop.trip_activities.forEach((ta) => {
        if (ta.scheduled_date) {
          const actDateStr = new Date(ta.scheduled_date).toISOString().split('T')[0];
          if (actDateStr === currentDateStr) {
            dayActivities.push(ta);
          }
        } else {
          // If unscheduled, distribute evenly
          dayActivities.push(ta);
        }
      });
    }

    days.push({
      dayNumber: i + 1,
      date: currentDate,
      dateStr: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      city: currentStop?.city?.name || 'Destination City',
      country: currentStop?.city?.country || 'Region',
      activities: dayActivities,
    });
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Day-by-Day Itinerary</h2>
          <p className="text-xs text-slate-500">{totalDays} days across {stops.length} destinations</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-slate-100 p-1 rounded-xl flex self-start sm:self-auto">
          <button
            onClick={() => handleSetViewMode('list')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List View
          </button>
          <button
            onClick={() => handleSetViewMode('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Milestone className="w-3.5 h-3.5" />
            Timeline View
          </button>
          <button
            onClick={() => handleSetViewMode('grid')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {days.map((day) => (
            <div
              key={day.dayNumber}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5 transition-all"
            >
              {/* City & Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 bg-brand-500 text-white font-black text-xs rounded-xl shadow-sm tracking-wide">
                    DAY {day.dayNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      <h3 className="text-xl font-bold text-slate-900">{day.city}</h3>
                      <span className="text-xs text-slate-400 font-medium">({day.country})</span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {day.dateStr}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full self-start sm:self-auto">
                  {day.activities.length} {day.activities.length === 1 ? 'Activity' : 'Activities'}
                </span>
              </div>

              {/* Activity blocks */}
              {day.activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Free day for exploration or travel transit.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {day.activities.map((ta) => (
                    <div
                      key={ta.id}
                      className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all shadow-sm"
                    >
                      <img
                        src={ta.activity.image_url}
                        alt={ta.activity.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="space-y-1 overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
                            {ta.activity.category}
                          </span>
                          <span className="text-xs font-black text-emerald-600">
                            {formatPrice(ta.cost_override ?? ta.activity.estimated_cost)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                          {ta.activity.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {ta.scheduled_time || '10:00 AM'}
                          </span>
                          <span>•</span>
                          <span>{ta.activity.estimated_duration_mins}m</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-brand-200">
          {days.map((day) => (
            <div key={day.dayNumber} className="relative space-y-4">
              {/* Timeline marker */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center shadow-md ring-4 ring-white">
                {day.dayNumber}
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{day.city}</h3>
                    <span className="text-xs text-slate-400 font-medium">({day.country})</span>
                  </div>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                    {day.dateStr}
                  </span>
                </div>

                {day.activities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No scheduled activities for Day {day.dayNumber}.</p>
                ) : (
                  <div className="space-y-3">
                    {day.activities.map((ta) => (
                      <div
                        key={ta.id}
                        className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 border border-slate-100"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={ta.activity.image_url}
                            alt={ta.activity.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {ta.scheduled_time || '10:00 AM'} • {ta.activity.category}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                              {ta.activity.name}
                            </h4>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600 flex-shrink-0">
                          {formatPrice(ta.cost_override ?? ta.activity.estimated_cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((day) => (
            <div
              key={day.dayNumber}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-extrabold text-[11px] rounded-lg">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{day.dateStr}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 truncate">{day.city}</h3>
                <p className="text-xs text-slate-400 mb-3">{day.country}</p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {day.activities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Free exploration</p>
                  ) : (
                    day.activities.map((ta) => (
                      <div key={ta.id} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate pr-2">{ta.activity.name}</span>
                        <span className="font-bold text-emerald-600 flex-shrink-0">
                          {formatPrice(ta.cost_override ?? ta.activity.estimated_cost)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-right">
                <span className="text-[11px] text-slate-400 font-bold">
                  {day.activities.length} {day.activities.length === 1 ? 'Activity' : 'Activities'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};