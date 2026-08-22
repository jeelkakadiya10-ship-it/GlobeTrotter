import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, PlusCircle, ArrowRight } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Compass,
  title,
  description,
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto my-6 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all hover:shadow hover:-translate-y-0.5"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : onActionClick ? (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all hover:shadow hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      ) : null}
    </div>
  );
};
