import React from 'react';
import { AlertCircle } from 'lucide-react';

const EmptyState = ({ title = 'No data found', description = 'Try adjusting your filters or search terms to find what you are looking for.', icon: Icon = AlertCircle, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl space-y-4 shadow-sm transition-colors duration-300">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full">
        <Icon size={36} />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">{description}</p>
      </div>
      {actionButton && (
        <div className="pt-2">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
