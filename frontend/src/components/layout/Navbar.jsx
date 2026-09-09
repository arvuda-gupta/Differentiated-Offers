import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';

export const Navbar = ({ isPublic = false, onToggleMobileSidebar, isMobileSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle Button */}
          {!isPublic && onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label={isMobileSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer" aria-label="Syngenta Platform Home">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-indigo-200 shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base group-hover:text-indigo-600 transition-colors">
                  Syngenta
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        {isPublic ? (
          <nav className="hidden md:flex items-center gap-8" aria-label="Public Navigation">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Platform Features
            </a>
            <a href="#architecture" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Stage Gate Lifecycle
            </a>
            <a href="#ecosystem" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Institutional Banks
            </a>
          </nav>
        ) : null}
      </div>
    </header>
  );
};
