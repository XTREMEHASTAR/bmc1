import React from 'react';
import { ClipboardList, Stethoscope, Heart, ShieldAlert, Thermometer, Activity, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { ClinicalEncounter, DiagnosisEntry, ExtractedClinicalData } from '../../types/clinical';
import type { PatientVitals } from '../../types/emergency';

interface ClinicalAssessmentCardProps {
  encounter: ClinicalEncounter;
  onUpdateNotes: (notes: Partial<ClinicalEncounter>) => void;
}

export const ClinicalAssessmentCard: React.FC<ClinicalAssessmentCardProps> = ({ encounter, onUpdateNotes }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-slate-800 dark:text-white">Clinical Assessment (SOAP)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subjective (Chief Complaint & History)</label>
          <textarea
            className="w-full h-28 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            value={encounter.subjective || ''}
            onChange={(e) => onUpdateNotes({ subjective: e.target.value })}
            placeholder="Describe history of present illness..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Objective (Physical Exam / Findings)</label>
          <textarea
            className="w-full h-28 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            value={encounter.objective || ''}
            onChange={(e) => onUpdateNotes({ objective: e.target.value })}
            placeholder="Describe examination findings..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clinical Assessment</label>
          <textarea
            className="w-full h-20 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            value={encounter.assessment || ''}
            onChange={(e) => onUpdateNotes({ assessment: e.target.value })}
            placeholder="Document clinical assessment..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Management Plan</label>
          <textarea
            className="w-full h-20 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            value={encounter.plan || ''}
            onChange={(e) => onUpdateNotes({ plan: e.target.value })}
            placeholder="Document management plan..."
          />
        </div>
      </div>
    </div>
  );
};

interface DiagnosisCardProps {
  diagnoses: DiagnosisEntry[];
  onAddDiagnosis: (dx: string, type: 'PROVISIONAL' | 'DIFFERENTIAL' | 'CONFIRMED') => void;
  onRemoveDiagnosis: (id: string) => void;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ diagnoses, onAddDiagnosis, onRemoveDiagnosis }) => {
  const [newDx, setNewDx] = React.useState('');
  const [type, setType] = React.useState<'PROVISIONAL' | 'DIFFERENTIAL' | 'CONFIRMED'>('PROVISIONAL');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-slate-800 dark:text-white">Diagnosis Workspace</h3>
      </div>
      <div className="flex gap-2 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="PROVISIONAL">Provisional</option>
          <option value="DIFFERENTIAL">Differential</option>
          <option value="CONFIRMED">Confirmed</option>
        </select>
        <input
          type="text"
          value={newDx}
          onChange={(e) => setNewDx(e.target.value)}
          placeholder="Enter diagnosis (ICD-10/SNOMED ready)..."
          className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newDx.trim()) {
              onAddDiagnosis(newDx, type);
              setNewDx('');
            }
          }}
        />
        <button
          onClick={() => {
            if (newDx.trim()) {
              onAddDiagnosis(newDx, type);
              setNewDx('');
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition-colors"
        >
          Add
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {diagnoses.map((dx) => (
          <div key={dx.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                dx.type === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                dx.type === 'PROVISIONAL' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {dx.type}
              </span>
              <span className="text-sm font-medium text-slate-850 dark:text-slate-200">{dx.diagnosis}</span>
            </div>
            <button onClick={() => onRemoveDiagnosis(dx.id)} className="text-slate-400 hover:text-red-500 p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {diagnoses.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-450 dark:text-slate-500">No diagnoses documented. Use voice or type above.</div>
        )}
      </div>
    </div>
  );
};
