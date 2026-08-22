import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  DollarSign,
  PieChart,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  CreditCard,
  Plane,
  Building,
  Utensils,
  Ticket,
  HelpCircle
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export const TripBudgetPage = () => {
  const { id: tripId } = useParams();
  const [budgetData, setBudgetData] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Add custom budget entry modal
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Flights & Transport');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseType, setExpenseType] = useState('actual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchBudget = async () => {
    try {
      const [bRes, tRes] = await Promise.all([
        api.getTripBudget(tripId),
        api.getTrip(tripId)
      ]);
      setBudgetData(bRes);
      setTrip(tRes.trip);
    } catch (err) {
      console.error('Failed to load budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [tripId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim()) {
      setFormError('Please enter a description for this expense.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Please enter a valid positive expense amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addBudgetEntry(tripId, {
        category,
        description: description.trim(),
        amount: parseFloat(amount),
        date,
        expense_type: expenseType
      });
      await fetchBudget();
      setDescription('');
      setAmount('');
      setModalOpen(false);
      showToast('Custom expense entry recorded!');
    } catch (err) {
      setFormError(err.message || 'Failed to add budget entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await api.deleteBudgetEntry(entryId);
      await fetchBudget();
      showToast('Expense item removed.');
    } catch (err) {
      showToast(err.message || 'Failed to delete expense.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white animate-spin">
          <DollarSign className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Calculating trip financials...</p>
      </div>
    );
  }

  const categoryIcons = {
    'Flights & Transport': Plane,
    'Accommodation': Building,
    'Activities': Ticket,
    'Food & Dining': Utensils,
    'Other': HelpCircle
  };

  const categoryColors = {
    'Flights & Transport': 'bg-blue-500 text-blue-600 bg-blue-50 border-blue-200',
    'Accommodation': 'bg-purple-500 text-purple-600 bg-purple-50 border-purple-200',
    'Activities': 'bg-teal-500 text-teal-600 bg-teal-50 border-teal-200',
    'Food & Dining': 'bg-orange-500 text-orange-600 bg-orange-50 border-orange-200',
    'Other': 'bg-slate-500 text-slate-600 bg-slate-50 border-slate-200'
  };

  const targetBudget = budgetData?.target_budget || 0;
  const totalSpent = budgetData?.total_spent || 0;
  const remaining = targetBudget > 0 ? targetBudget - totalSpent : 0;
  const percentUsed = targetBudget > 0 ? Math.min(100, Math.round((totalSpent / targetBudget) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link to="/trips" className="hover:text-teal-600">My Trips</Link>
            <span>/</span>
            <Link to={`/trips/${tripId}/view`} className="hover:text-teal-600">{trip?.title}</Link>
            <span>/</span>
            <span className="text-teal-600">Budget</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip Budget & Cost Breakdown
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/trips/${tripId}/builder`}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Back to Builder
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Expense</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Budget</p>
          <p className="text-3xl font-extrabold text-slate-900">
            {targetBudget > 0 ? `$${targetBudget.toLocaleString()}` : 'Flexible'}
          </p>
          <p className="text-[11px] text-slate-500">Configured in trip settings</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Calculated Cost</p>
          <p className="text-3xl font-extrabold text-teal-600">
            ${totalSpent.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Activities + Custom expenses</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
          <p
            className={`text-3xl font-extrabold ${
              targetBudget > 0 && remaining < 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {targetBudget > 0 ? `$${remaining.toLocaleString()}` : '$0.00'}
          </p>
          <p className="text-[11px] text-slate-500">
            {targetBudget > 0
              ? remaining < 0
                ? '⚠️ You are over target budget'
                : `${100 - percentUsed}% budget remaining`
              : 'Target budget not set'}
          </p>
        </div>
      </div>

      {/* Budget Progress Meter */}
      {targetBudget > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Budget Utilization ({percentUsed}%)</span>
            <span className={remaining < 0 ? 'text-rose-600' : 'text-slate-500'}>
              ${totalSpent.toLocaleString()} / ${targetBudget.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                remaining < 0 ? 'bg-rose-500' : percentUsed > 85 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Breakdown Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Cost Breakdown by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(budgetData?.category_breakdown || {}).map(([catName, amount]) => {
            const Icon = categoryIcons[catName] || HelpCircle;
            const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

            return (
              <div
                key={catName}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{pct}%</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 truncate">{catName}</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">${amount.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Line Items (Custom + Activities) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Custom Expense Line Items */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Custom Expense Entries</h3>
              <p className="text-xs text-slate-500">Flights, hotels, transit, and general expenses</p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {budgetData?.budget_entries?.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 mb-2">No custom expenses logged yet.</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                + Add flight or accommodation
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {budgetData?.budget_entries?.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{entry.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-teal-700">{entry.category}</span>
                      <span>•</span>
                      <span>{entry.date || 'No date'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-900">${entry.amount}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Activities Expense Line Items */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Scheduled Activities Costs</h3>
            <p className="text-xs text-slate-500">Auto-synced from your city itinerary stops</p>
          </div>

          {budgetData?.activity_expenses?.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 mb-2">No activities scheduled yet.</p>
              <Link
                to={`/trips/${tripId}/builder`}
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Go to Itinerary Builder →
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {budgetData?.activity_expenses?.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{act.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{act.city}</span>
                      <span>•</span>
                      <span>{act.date || 'Planned'}</span>
                    </div>
                  </div>

                  <span className="font-bold text-sm text-slate-900">
                    {act.cost > 0 ? `$${act.cost}` : 'Free'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Budget Entry Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Custom Budget Line Item"
      >
        <form onSubmit={handleAddEntry} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="Flights & Transport">Flights & Transport</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Activities">Activities</option>
              <option value="Other">Other Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 3-Night Stay at Hotel Le Marais"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount ($ USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
