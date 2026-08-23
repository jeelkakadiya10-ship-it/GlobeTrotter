import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Trip, TripActivity } from '../types';
import { Calendar, Clock, DollarSign, ArrowLeft, Edit3, X, Check } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useCurrency } from '../context/CurrencyContext';

export const TripCalendarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Activity state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<TripActivity | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCostInput, setEditCostInput] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const { formatPrice, convertPrice, convertToUsd, getSymbol } = useCurrency();

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.error('Failed to load trip calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const activeTripCurrency = trip?.display_currency || 'USD';
  const currencySymbol = getSymbol(activeTripCurrency);

  const handleOpenEdit = (ta: TripActivity) => {
    setSelectedActivity(ta);
    setEditDate(ta.scheduled_date ? ta.scheduled_date.split('T')[0] : '');
    setEditTime(ta.scheduled_time || '10:00');
    if (ta.cost_override !== null && ta.cost_override !== undefined) {
      const converted = convertPrice(ta.cost_override, activeTripCurrency);
      setEditCostInput(String(Math.round(converted * 100) / 100));
    } else {
      setEditCostInput('');
    }
    setEditModalOpen(true);
  };

  const handleSaveActivityEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    setSavingEdit(true);
    try {
      const costOverrideUsd = editCostInput
        ? convertToUsd(Number(editCostInput), activeTripCurrency)
        : null;

      await api.patch(`/trip-activities/${selectedActivity.id}`, {
        scheduled_date: editDate || null,
        scheduled_time: editTime || null,
        cost_override: costOverrideUsd
      });
      setEditModalOpen(false);
      fetchTrip();
    } catch (err) {
      console.error('Failed to update activity:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
      </div>
    );
  }

  if (!trip) {
    return <div className="p-8 text-center text-slate-500">Trip not found.</div>;
  }

  const allActivities = trip.stops?.flatMap(s => s.trip_activities || []) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/trips/${trip.id}/view`}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Trip Calendar & Timeline</h1>
            <p className="text-slate-500 text-sm">{trip.name} • {new Date(trip.start_date).toLocaleDateString()} to {new Date(trip.end_date).toLocaleDateString()} ({activeTripCurrency})</p>
          </div>
        </div>

        <Link
          to={`/trips/${trip.id}/builder`}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          Back to Builder
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Timeline & Scheduled Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allActivities.map((ta) => (
            <div
              key={ta.id}
              onClick={() => handleOpenEdit(ta)}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 cursor-pointer transition-all hover:scale-[1.02] shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  {ta.scheduled_date ? new Date(ta.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unscheduled'}
                </span>
                <span className="text-brand-600 font-extrabold">{ta.scheduled_time || '10:00'}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{ta.activity.name}</h4>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                <span>{ta.activity.estimated_duration_mins} mins</span>
                <span className="font-bold text-emerald-600">
                  {formatPrice(ta.cost_override ?? ta.activity.estimated_cost, { currency: activeTripCurrency })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Activity Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Activity Schedule & Cost"
      >
        <form onSubmit={handleSaveActivityEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Activity
            </label>
            <p className="text-sm font-bold text-slate-900">{selectedActivity?.activity.name}</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Scheduled Time
            </label>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Cost Override ({currencySymbol} {activeTripCurrency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                value={editCostInput}
                onChange={(e) => setEditCostInput(e.target.value)}
                placeholder={`Default: ${formatPrice(selectedActivity?.activity.estimated_cost, { currency: activeTripCurrency })}`}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Entered in {activeTripCurrency}, stored in USD base (~${editCostInput ? convertToUsd(Number(editCostInput), activeTripCurrency).toFixed(2) : '0.00'} USD)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow"
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};