import React from 'react';
import { AlertCircle, ShieldAlert, Award, Compass, HeartPulse } from 'lucide-react';
import type { Patient } from '../../types/emergency';
import type { ClinicalEncounter } from '../../types/clinical';

interface PatientBannerProps {
  encounter: ClinicalEncounter;
  patient: Patient;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({ encounter, patient }) => {
  const allergies = patient.allergies || [];
  
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm sticky top-0 z-30">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Patient Demographics */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{patient.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {encounter.encounter_no}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span>UHID: <span className="font-semibold">{patient.uhid || patient.temp_uhid || 'N/A'}</span></span>
              <span>•</span>
              <span>{patient.age} yrs / {patient.gender}</span>
              <span>•</span>
              <span>Blood Group: <span className="font-semibold text-red-600 dark:text-red-400">{patient.blood_group}</span></span>
            </div>
          </div>
        </div>

        {/* Encounter Context */}
        <div className="flex items-center gap-6 text-sm border-l border-slate-200 dark:border-slate-800 pl-6">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Location / Dept</div>
            <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{encounter.department}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Consulting Doctor</div>
            <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{encounter.consulting_doctor_name}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Admission Status</div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
              encounter.status === 'APPROVED' 
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              {encounter.status}
            </span>
          </div>
        </div>

        {/* Critical Alerts / Allergies */}
        <div className="flex flex-col gap-2 max-w-sm">
          {allergies.length > 0 ? (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-2.5">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-red-700 dark:text-red-300">CRITICAL ALLERGIES</div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-0.5 font-medium">
                  {allergies.map(a => `${a.allergen} (${a.reaction || 'severe'})`).join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
              <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <span>No known allergies recorded</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
