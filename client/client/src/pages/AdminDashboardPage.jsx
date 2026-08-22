import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Shield,
  Users,
  Compass,
  MapPin,
  Sparkles,
  TrendingUp,
  Activity,
  Globe,
  Share2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [statsData, setStatsData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers()
      ]);
      setStatsData(statsRes);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setError(err.message || 'Access restricted. You must be an administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleDisableUser = async (user) => {
    setActionLoadingId(user.id);
    try {
      const res = await api.toggleDisableUser(user.id);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_disabled: res.user.is_disabled } : u));
      showToast(res.message);
    } catch (err) {
      showToast(err.message || 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white animate-spin">
          <Shield className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Querying platform database statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">403 Forbidden</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  const stats = statsData?.stats || {};
  const popularCities = statsData?.popular_cities || [];

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            Superadmin Management Console
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Analytics & Governance
          </h1>
        </div>
        <div className="text-xs text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-200">
          Database: <span className="font-mono text-slate-800 font-bold">PostgreSQL / SQLite Relational</span>
        </div>
      </div>

      {/* Live Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-black text-slate-900">{stats.total_users || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Trips</p>
          <p className="text-2xl font-black text-teal-600">{stats.total_trips || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Public Shared</p>
          <p className="text-2xl font-black text-emerald-600">{stats.public_trips || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">City Stops</p>
          <p className="text-2xl font-black text-slate-900">{stats.total_stops || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Acts</p>
          <p className="text-2xl font-black text-orange-600">{stats.total_scheduled_activities || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog Cities</p>
          <p className="text-2xl font-black text-purple-600">{stats.total_cities || 0}</p>
        </div>
      </div>

      {/* Popular Cities Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          Most Popular Destinations in Trip Itineraries
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {popularCities.map((c, i) => (
            <div
              key={c.city_id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                #{i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                <p className="text-[10px] text-slate-500">{c.count} stops planned</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Governance Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Registered Accounts & Moderation ({users.length})
            </h2>
            <p className="text-xs text-slate-500">Manage user status, roles, and platform permissions</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Trips Built</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-2.5">
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-7 h-7 rounded-lg bg-teal-100 object-cover"
                    />
                    <span className="font-bold text-slate-900">{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u._count?.trips || 0}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_disabled
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.is_disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {u.role === 'admin' ? (
                      <span className="text-[10px] text-slate-400 italic">Protected Superadmin</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleDisableUser(u)}
                        disabled={actionLoadingId === u.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          u.is_disabled
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.is_disabled ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Enable</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Disable</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
