import React from 'react';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { Compass, Lightbulb, Boxes, CheckCircle2, Clock, Activity, Zap } from 'lucide-react';

export const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No lifecycle events recorded for this workspace yet.
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'discovery_execution_completed':
        return Compass;
      case 'concept_evaluation_completed':
        return Lightbulb;
      case 'prototype_blueprint_generated':
        return Boxes;
      default:
        return Activity;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((evt, idx) => {
        const Icon = getEventIcon(evt.event_type);
        return (
          <div key={evt.event_id || idx} className="relative flex items-start gap-4 group">
            <div className="absolute -left-6 top-0.5 p-1.5 rounded-full bg-white border-2 border-indigo-600 text-indigo-600 shadow-2xs group-hover:scale-110 transition-transform">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 capitalize">
                  {evt.event_type?.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatRelativeTime(evt.created_at)}
                </span>
              </div>
              {evt.payload && (
                <pre className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg overflow-x-auto border border-slate-100 max-h-32">
                  {JSON.stringify(evt.payload, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
