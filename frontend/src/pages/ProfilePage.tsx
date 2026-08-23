import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';
import api from '../services/api';
import { User, City } from '../types';
import { User as UserIcon, Mail, Globe, Trash2, Bookmark, AlertTriangle, Check, Shield, Coins } from 'lucide-react';
import { Modal } from '../components/Modal';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, deleteAccount } = useAuth();
  const { setCurrency } = useCurrency();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.profile_photo_url || '');
  const [languagePref, setLanguagePref] = useState(user?.language_pref || 'en');
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(
    (user?.preferred_currency as CurrencyCode) || 'USD'
  );
  const [newPassword, setNewPassword] = useState('');
  const [savedCities, setSavedCities] = useState<Array<{ id: number; city: City }>>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete Account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setName(res.data.name);
        setEmail(res.data.email);
        setPhotoUrl(res.data.profile_photo_url || '');
        setLanguagePref(res.data.language_pref || 'en');
        if (res.data.preferred_currency && res.data.preferred_currency in CURRENCIES) {
          setPreferredCurrency(res.data.preferred_currency as CurrencyCode);
        }
        setSavedCities(res.data.saved_destinations || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload: any = {
        name,
        email,
        profile_photo_url: photoUrl,
        language_pref: languagePref,
        preferred_currency: preferredCurrency,
      };
      if (newPassword) payload.password = newPassword;

      const res = await api.patch('/users/me', payload);
      updateUser(res.data);
      setCurrency(preferredCurrency);
      setNewPassword('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSaved = async (cityId: number) => {
    try {
      await api.post('/users/save-city', { cityId });
      setSavedCities(savedCities.filter(sc => sc.city.id !== cityId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account. Verify password.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900">User Profile & Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences, default currency, and saved destinations.</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Profile and default currency updated successfully!</span>
        </div>
      )}

      {/* Account Settings Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Account Details</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Profile Photo URL
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Language Preference
              </label>
              <select
                value={languagePref}
                onChange={(e) => setLanguagePref(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-brand-600" />
                Preferred Currency (Profile Default)
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code} - {c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Change Password (optional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Destinations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Saved Destinations</h2>
        {savedCities.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No saved destinations yet. Explore cities and bookmark your favorites!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCities.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 border border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={item.city.image_url} alt={item.city.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.city.name}</h4>
                    <p className="text-xs text-slate-400">{item.city.country}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSaved(item.city.id)}
                  className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-200/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-slate-600">
          Permanently delete your account and all associated itineraries, stops, and expenses. This action cannot be undone.
        </p>
        <button
          onClick={() => { setDeleteError(null); setDeletePassword(''); setDeleteModalOpen(true); }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          {deleteError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-semibold">
              {deleteError}
            </div>
          )}
          <p className="text-sm text-slate-600">
            Please enter your password to confirm permanent deletion of your GlobeTrotter account.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteLoading}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow"
            >
              {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};