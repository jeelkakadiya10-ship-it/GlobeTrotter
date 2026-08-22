import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Compass } from 'lucide-react';

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white animate-spin">
          <Compass className="w-7 h-7" />
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
