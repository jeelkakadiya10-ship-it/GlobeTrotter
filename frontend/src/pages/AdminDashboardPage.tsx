import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AdminStats, User } from '../types';
import { ShieldAlert, Users, Compass, Activity, BarChart2, CheckCircle2, XCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<Array<User & { is_disabled: boolean; _count?: { trips: number } }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleDisable = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/disable`);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle disable user:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Platform Analytics & Administration</h1>
          <p className="text-slate-500 text-sm">Server-enforced administrative oversight and usage metrics.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <p className="text-3xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Trips Created</span>
            <p className="text-3xl font-black text-slate-900">{stats?.totalTrips || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Users (30 Days)</span>
            <p className="text-3xl font-black text-slate-900">{stats?.activeUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* Trips Over Time Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Trips Created Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.tripsOverTime || []}>
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="trips" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Cities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Top 10 Cities Added to Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="pb-3">City</th>
                  <th className="pb-3">Country</th>
                  <th className="pb-3 text-right">Stops Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats?.topCities.map((city, idx) => (
                  <tr key={city.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 text-slate-400 text-xs">{idx + 1}.</span>
                      {city.name}
                    </td>
                    <td className="py-3 text-slate-500">{city.country}</td>
                    <td className="py-3 text-right font-black text-brand-600">{city.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Activities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Top 10 Activities Picked</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="pb-3">Activity</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3 text-right">Times Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stats?.topActivities.map((act, idx) => (
                  <tr key={act.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 text-slate-400 text-xs">{idx + 1}.</span>
                      <span className="truncate max-w-[180px]">{act.name}</span>
                    </td>
                    <td className="py-3 text-slate-500">{act.city}</td>
                    <td className="py-3 text-right font-black text-brand-600">{act.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <th className="pb-3">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Trips Created</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-700 font-bold">{u._count?.trips || 0}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                      u.is_disabled ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {u.is_disabled ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {u.is_disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleDisable(u.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        u.is_disabled
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {u.is_disabled ? 'Enable' : 'Disable'}
                    </button>
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