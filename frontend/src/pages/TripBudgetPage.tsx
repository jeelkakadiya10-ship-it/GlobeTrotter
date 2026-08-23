import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { BudgetBreakdown, Trip } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, Plus, Trash2, AlertTriangle, ArrowLeft, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useCurrency } from '../context/CurrencyContext';
import { FlightItem, StayItem } from '../components/FlightStaySection';

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3b82f6',
  stay: '#8b5cf6',
  activities: '#14b8a6',
  meals: '#f97316',
  other: '#64748b'
};

export const TripBudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetBreakdown | null>(null);
  const [targetBudgetInput, setTargetBudgetInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Expense modal state
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('transport');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseLoading, setExpenseLoading] = useState(false);

  const { formatPrice, convertPrice, currencyConfig } = useCurrency();

  const fetchBudgetAndTrip = async () => {
    try {
      const [tripRes, budgetRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/budget`)
      ]);
      setTrip(tripRes.data);

      // Also merge local flights and stays into breakdown if present
      const flightsRaw = localStorage.getItem(`globetrotter_flights_${id}`);
      const staysRaw = localStorage.getItem(`globetrotter_stays_${id}`);
      const localFlights: FlightItem[] = flightsRaw ? JSON.parse(flightsRaw) : [];
      const localStays: StayItem[] = staysRaw ? JSON.parse(staysRaw) : [];

      const initialBudget: BudgetBreakdown = budgetRes.data;

      let extraTransport = 0;
      localFlights.forEach((f) => {
        extraTransport += f.price || 0;
        initialBudget.lineItems.push({
          id: `flight-${f.id}`,
          type: 'flight',
          name: `Flight: ${f.from} → ${f.to} (${f.airline})`,
          category: 'transport',
          amount: f.price || 0,
          date: f.date,
          rawId: 0
        });
      });

      let extraStay = 0;
      localStays.forEach((s) => {
        const stayTotal = (s.pricePerNight || 0) * (s.totalNights || 1);
        extraStay += stayTotal;
        initialBudget.lineItems.push({
          id: `stay-${s.id}`,
          type: 'stay',
          name: `Hotel: ${s.hotelName} (${s.city})`,
          category: 'stay',
          amount: stayTotal,
          date: s.checkIn,
          rawId: 0
        });
      });

      initialBudget.breakdown.transport += extraTransport;
      initialBudget.breakdown.stay += extraStay;
      initialBudget.totalCost += extraTransport + extraStay;
      initialBudget.avgCostPerDay = Number((initialBudget.totalCost / (initialBudget.days || 1)).toFixed(2));
      initialBudget.isOverBudget = initialBudget.targetBudget !== null && initialBudget.totalCost > initialBudget.targetBudget;

      setBudgetData(initialBudget);
      setTargetBudgetInput(tripRes.data.target_budget ? String(tripRes.data.target_budget) : '');
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetAndTrip();
  }, [id]);

  const handleUpdateTargetBudget = async () => {
    if (!trip) return;
    try {
      await api.patch(`/trips/${trip.id}`, {
        target_budget: targetBudgetInput ? Number(targetBudgetInput) : null
      });
      fetchBudgetAndTrip();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || isNaN(Number(expenseAmount))) return;

    setExpenseLoading(true);
    try {
      await api.post(`/trips/${id}/budget-entries`, {
        category: expenseCategory,
        amount: Number(expenseAmount),
        note: expenseNote
      });
      setAddExpenseModalOpen(false);
      setExpenseAmount('');
      setExpenseNote('');
      fetchBudgetAndTrip();
    } catch (err) {
      console.error(err);
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      await api.delete(`/budget-entries/${entryId}`);
      fetchBudgetAndTrip();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
      </div>
    );
  }

  if (!budgetData || !trip) {
    return <div className="p-8 text-center text-slate-500">Trip budget data not available.</div>;
  }

  const chartData = Object.entries(budgetData.breakdown)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: convertPrice(value),
      color: CATEGORY_COLORS[name] || '#64748b'
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to={`/trips/${trip.id}/builder`}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Trip Budget & Cost Breakdown</h1>
            <p className="text-slate-500 text-sm">{trip.name}</p>
          </div>
        </div>

        <button
          onClick={() => setAddExpenseModalOpen(true)}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Over-budget Warning Banner */}
      {budgetData.isOverBudget && (
        <div className="p-5 bg-red-50 border-2 border-red-200 rounded-3xl flex items-center gap-4 text-red-800 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Budget Warning: Over Planned Limit</h3>
            <p className="text-xs text-red-700 mt-0.5">
              Current total ({formatPrice(budgetData.totalCost)}) exceeds your target budget ({formatPrice(budgetData.targetBudget)}) by {formatPrice(budgetData.totalCost - (budgetData.targetBudget || 0))}.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Estimated Cost</span>
          <p className="text-3xl font-black text-slate-900">{formatPrice(budgetData.totalCost)}</p>
          <p className="text-xs text-slate-400">Includes flights, stays, activities & expenses</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Cost / Day</span>
          <p className="text-3xl font-black text-brand-600">{formatPrice(budgetData.avgCostPerDay)}</p>
          <p className="text-xs text-slate-400">Across {budgetData.days} days duration</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Budget (USD)</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">$</span>
            <input
              type="number"
              value={targetBudgetInput}
              onChange={(e) => setTargetBudgetInput(e.target.value)}
              onBlur={handleUpdateTargetBudget}
              placeholder="Set limit..."
              className="text-2xl font-black text-slate-900 w-full focus:outline-none border-b border-dashed border-slate-300 focus:border-brand-500 pb-0.5"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {targetBudgetInput ? `Converted: ${formatPrice(Number(targetBudgetInput))}` : 'Auto-saves on blur'}
          </p>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown visual */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <h2 className="text-xl font-bold text-slate-900">Spending by Category ({currencyConfig.code})</h2>

          {chartData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No expenses recorded yet.</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${currencyConfig.symbol}${Number(value).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            {Object.entries(budgetData.breakdown).map(([category, amount]) => (
              <div key={category} className="p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }}></span>
                  <span className="text-xs font-bold uppercase text-slate-600">{category}</span>
                </div>
                <p className="text-sm font-black text-slate-900">{formatPrice(amount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Line Items ({budgetData.lineItems.length})</h2>
          </div>

          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
            {budgetData.lineItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl flex items-center justify-between gap-4 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category.toLowerCase()] || '#64748b' }}
                  ></span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-black text-slate-900">{formatPrice(item.amount)}</span>
                  {item.type === 'manual' && (
                    <button
                      onClick={() => handleDeleteEntry(item.rawId)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={addExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
        title="Add Manual Expense"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Category
            </label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="transport">Transport (Flight, Train, Rental)</option>
              <option value="stay">Stay (Hotel, Airbnb)</option>
              <option value="activities">Activities & Tours</option>
              <option value="meals">Meals & Dining</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Amount (in USD base) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="e.g. 150.00"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Note / Description
            </label>
            <input
              type="text"
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
              placeholder="e.g. Flight Paris to Rome, Hotel Deposit"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddExpenseModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={expenseLoading}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow transition-all"
            >
              {expenseLoading ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};