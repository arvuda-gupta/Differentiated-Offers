import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6 bg-white border border-slate-200/80 rounded-2xl p-10 shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Page Not Found</h1>
          <p className="text-sm text-slate-500">
            The requested surface or route does not exist in the Syngenta Platform.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button icon={Home}>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
