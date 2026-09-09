import React from 'react';

export const Badge = ({
  children,
  variant = 'indigo',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const variants = {
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-100/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100/80',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100/80',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100/80',
    rose: 'bg-rose-50 text-rose-700 border border-rose-100/80',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200/60',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
