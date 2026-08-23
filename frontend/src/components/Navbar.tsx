import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';
import { Plane, Compass, MapPin, Bookmark, User as UserIcon, ShieldAlert, LogOut, Menu, X, PlusCircle, Coins } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
              Globe<span className="text-brand-600">Trotter</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/trips"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/trips') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Plane className="w-4 h-4" />
                My Trips
              </Link>
              <Link
                to="/saved-trips"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/saved-trips') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved
              </Link>
              <Link
                to="/cities/search"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/cities/search') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Cities
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin') ? 'bg-amber-50 text-amber-700' : 'text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Right Section: Currency Selector + Profile/Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Currency Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <Coins className="w-3.5 h-3.5 text-brand-600" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                title="Select Display Currency"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <>
                <Link
                  to="/trips/new"
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Plan Trip
                </Link>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                  title="Profile & Settings"
                >
                  {user.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Currency selector mobile */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-slate-100 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-800 border border-slate-200"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 px-4 pt-3 pb-6 space-y-2 bg-white animate-fadeIn">
          {user ? (
            <>
              <Link
                to="/trips/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-500 text-white font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4" />
                Plan New Trip
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                  isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                }`}
              >
                <Compass className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/trips"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                  isActive('/trips') ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                }`}
              >
                <Plane className="w-5 h-5" />
                My Trips
              </Link>
              <Link
                to="/saved-trips"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                  isActive('/saved-trips') ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                Saved Trips
              </Link>
              <Link
                to="/cities/search"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                  isActive('/cities/search') ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                }`}
              >
                <MapPin className="w-5 h-5" />
                Cities
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-amber-600 bg-amber-50"
                >
                  <ShieldAlert className="w-5 h-5" />
                  Admin
                </Link>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 font-semibold"
                >
                  <UserIcon className="w-5 h-5 text-slate-500" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1 text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-2.5 bg-brand-500 text-white font-semibold rounded-xl"
            >
              Log In / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};