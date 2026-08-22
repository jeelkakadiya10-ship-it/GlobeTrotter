import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { ItineraryViewPage } from './pages/ItineraryViewPage';
import { TripBudgetPage } from './pages/TripBudgetPage';
import { TripCalendarPage } from './pages/TripCalendarPage';
import { CitySearchPage } from './pages/CitySearchPage';
import { ActivitySearchPage } from './pages/ActivitySearchPage';
import { PublicSharePage } from './pages/PublicSharePage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Auth & Marketing */}
              <Route path="/" element={<AuthPage />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/new"
                element={
                  <ProtectedRoute>
                    <CreateTripPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <MyTripsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/builder"
                element={
                  <ProtectedRoute>
                    <ItineraryBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/view"
                element={<ItineraryViewPage />}
              />
              <Route
                path="/trips/:id/budget"
                element={
                  <ProtectedRoute>
                    <TripBudgetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/calendar"
                element={
                  <ProtectedRoute>
                    <TripCalendarPage />
                  </ProtectedRoute>
                }
              />

              {/* Destination & Activity Catalog */}
              <Route path="/cities/search" element={<CitySearchPage />} />
              <Route path="/cities/:id/activities" element={<ActivitySearchPage />} />

              {/* Public Share Itinerary (Zero Auth Required) */}
              <Route path="/share/:public_slug" element={<PublicSharePage />} />

              {/* User Profile & Preferences */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal (Admin Role Required Server & Client) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
