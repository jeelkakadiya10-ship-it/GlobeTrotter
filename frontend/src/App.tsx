import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { SavedTripsPage } from './pages/SavedTripsPage';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { ItineraryViewPage } from './pages/ItineraryViewPage';
import { CitySearchPage } from './pages/CitySearchPage';
import { ActivitySearchPage } from './pages/ActivitySearchPage';
import { TripBudgetPage } from './pages/TripBudgetPage';
import { TripCalendarPage } from './pages/TripCalendarPage';
import { PublicSharePage } from './pages/PublicSharePage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/" element={<AuthPage />} />

          {/* Public Read-Only Share Link Route */}
          <Route path="/share/:slug" element={<PublicSharePage />} />

          {/* Protected Logged-in User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
            <Route path="/saved-trips" element={<SavedTripsPage />} />
            <Route path="/trips/new" element={<CreateTripPage />} />
            <Route path="/trips/:id/builder" element={<ItineraryBuilderPage />} />
            <Route path="/trips/:id/view" element={<ItineraryViewPage />} />
            <Route path="/trips/:id/budget" element={<TripBudgetPage />} />
            <Route path="/trips/:id/calendar" element={<TripCalendarPage />} />
            <Route path="/cities/search" element={<CitySearchPage />} />
            <Route path="/cities/:id/activities" element={<ActivitySearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Role Only Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;