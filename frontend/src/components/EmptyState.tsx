import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6 text-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};