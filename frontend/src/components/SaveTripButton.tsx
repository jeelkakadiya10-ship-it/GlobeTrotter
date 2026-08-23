import React, { useState } from 'react';
import { Bookmark, Check, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Trip } from '../types';

interface SaveTripButtonProps {
  trip: Trip;
  className?: string;
}

export const SaveTripButton: React.FC<SaveTripButtonProps> = ({ trip, className = '' }) => {
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();

  const handleSaveTrip = () => {
    try {
      const storageKey = 'globetrotter_saved_trips';
      const existing = localStorage.getItem(storageKey);
      let savedList: any[] = existing ? JSON.parse(existing) : [];

      // Add or update
      const tripSnapshot = {
        ...trip,
        savedAt: new Date().toISOString(),
      };

      savedList = [tripSnapshot, ...savedList.filter((t) => t.id !== trip.id)];
      localStorage.setItem(storageKey, JSON.stringify(savedList));

      setSaved(true);
      showToast(`Trip "${trip.name}" saved to My Saved Trips! ✨`, 'success');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save trip locally:', err);
      showToast('Could not save trip locally', 'error');
    }
  };

  return (
    <button
      onClick={handleSaveTrip}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
        saved
          ? 'bg-emerald-500 text-white'
          : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm'
      } ${className}`}
      title="Save Trip to My Saved Trips"
    >
      {saved ? <Check className="w-4 h-4 text-white" /> : <Bookmark className="w-4 h-4 text-brand-600" />}
      <span>{saved ? 'Saved!' : 'Save Trip'}</span>
    </button>
  );
};