import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Synthesizing radar & satellite nowcast...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className="w-8 h-8 text-sky-600 dark:text-sky-400 animate-spin" />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
