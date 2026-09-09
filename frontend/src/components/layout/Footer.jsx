import React from 'react';
import { Sprout } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-700">Syngenta European Commercial Lifecycle</span>
        </div>
      </div>
    </footer>
  );
};
