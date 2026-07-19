import React from 'react';
import { Clock } from 'lucide-react';
import type { ClinicalTimelineEvent } from '../../types/clinical';

interface ClinicalTimelineProps {
  events: ClinicalTimelineEvent[];
}

export const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({ events }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-slate-800 dark:text-white">Clinical Encounter Timeline</h3>
      </div>
      
      <div className="relative border-l border-slate-100 dark:border-slate-800 ml-3 pl-5 space-y-5 py-2">
        {events.map((evt) => (
          <div key={evt.id} className="relative">
            {/* Timeline Icon Marker */}
            <span
              className="absolute -left-[30px] top-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs shadow-sm bg-white dark:bg-slate-900 border"
              style={{ borderColor: evt.color || '#E2E8F0' }}
            >
              {evt.icon || '📍'}
            </span>
            
            {/* Event Content */}
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-sm text-slate-850 dark:text-slate-200">{evt.title}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">{evt.description}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 italic">
            Encounter timeline is empty. Document orders or start scribing to populate.
          </div>
        )}
      </div>
    </div>
  );
};
