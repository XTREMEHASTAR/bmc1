import React, { useState } from 'react';
import { Pill, Plus, Trash2, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import type { MedicationOrder, MedicationRoute, MedicationFrequency } from '../../types/clinical';
import { checkMedicationSafety } from '../../services/ai/clinicalExtractor';

interface PrescriptionBuilderProps {
  medications: MedicationOrder[];
  patientAllergies: string[];
  activeMeds: string[];
  patientAge?: number;
  onAddMedication: (med: Omit<MedicationOrder, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => void;
  onRemoveMedication: (id: string) => void;
  onToggleApprove: (id: string) => void;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  medications,
  patientAllergies,
  activeMeds,
  patientAge,
  onAddMedication,
  onRemoveMedication,
  onToggleApprove,
}) => {
  const [drug, setDrug] = useState('');
  const [strength, setStrength] = useState('');
  const [dose, setDose] = useState('');
  const [route, setRoute] = useState<MedicationRoute>('PO');
  const [frequency, setFrequency] = useState<MedicationFrequency>('OD');
  const [duration, setDuration] = useState('');
  const [timing, setTiming] = useState('After food');
  const [instructions, setInstructions] = useState('');
  const [warnings, setWarnings] = useState<Array<{ type: string; severity: string; message: string }>>([]);

  const handleDrugChange = (val: string) => {
    setDrug(val);
    if (val.trim().length > 2) {
      const safetyWarnings = checkMedicationSafety(val, patientAllergies, activeMeds, patientAge);
      setWarnings(safetyWarnings);
    } else {
      setWarnings([]);
    }
  };

  const handleAdd = () => {
    if (!drug.trim()) return;
    
    const safetyWarnings = checkMedicationSafety(drug, patientAllergies, activeMeds, patientAge);
    
    onAddMedication({
      drug_name: drug,
      strength,
      dose,
      route,
      frequency,
      duration,
      timing,
      special_instructions: instructions,
      status: 'DRAFT',
      is_voice_order: false,
      is_approved: safetyWarnings.every(w => w.severity !== 'CRITICAL'), // auto-approve only if no critical alerts
      safety_warnings: safetyWarnings.map(w => ({
        id: `WARN-${Date.now()}-${Math.random()}`,
        type: w.type as any,
        severity: w.severity as any,
        message: w.message,
        acknowledged: false
      }))
    });

    setDrug('');
    setStrength('');
    setDose('');
    setDuration('');
    setInstructions('');
    setWarnings([]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <Pill className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-slate-800 dark:text-white">Prescription Builder</h3>
      </div>

      {/* Manual Entry Form */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="col-span-2 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Drug / Medicine Name</label>
          <input
            type="text"
            value={drug}
            onChange={(e) => handleDrugChange(e.target.value)}
            placeholder="e.g. Amoxicillin Clavulanate"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Strength</label>
          <input
            type="text"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            placeholder="e.g. 625 mg"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Route</label>
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value as any)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="PO">PO (Oral)</option>
            <option value="IV">IV (Intravenous)</option>
            <option value="IM">IM (Intramuscular)</option>
            <option value="SC">SC (Subcutaneous)</option>
            <option value="TOPICAL">Topical</option>
            <option value="INHALATION">Inhalation</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="OD">OD (Once Daily)</option>
            <option value="BD">BD (Twice Daily)</option>
            <option value="TDS">TDS (Three Times Daily)</option>
            <option value="QID">QID (Four Times Daily)</option>
            <option value="HS">HS (Bedtime)</option>
            <option value="SOS">SOS (As Needed)</option>
            <option value="PRN">PRN (As Needed)</option>
            <option value="STAT">STAT (Immediately)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 5 days"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Timing</label>
          <select
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="After food">After food</option>
            <option value="Before food">Before food</option>
            <option value="With food">With food</option>
            <option value="Empty stomach">Empty stomach</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Special Instructions</label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Dissolve in warm water"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleAdd}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Rx
          </button>
        </div>
      </div>

      {/* Safety Layer Alert Panel */}
      {warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm ${
                w.severity === 'CRITICAL'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300'
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300'
              }`}
            >
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-xs">{w.type} Safety Warning</span>
                <p className="mt-0.5 font-medium">{w.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription List */}
      <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
              <th className="p-3">Drug Info</th>
              <th className="p-3">Route</th>
              <th className="p-3">Frequency</th>
              <th className="p-3">Duration & Timing</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {medications.map((med) => (
              <tr key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{med.drug_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{med.strength || 'No strength specified'}</div>
                  {med.safety_warnings && med.safety_warnings.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {med.safety_warnings.map((w) => (
                        <span key={w.id} className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          ⚠️ {w.message}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-600 dark:text-slate-400">
                    {med.route}
                  </span>
                </td>
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{med.frequency}</td>
                <td className="p-3">
                  <div className="font-medium text-slate-700 dark:text-slate-300">{med.duration}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{med.timing}</div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggleApprove(med.id)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        med.is_approved
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/50'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-250 dark:bg-indigo-950/30 dark:text-indigo-450 dark:border-indigo-900/50'
                      }`}
                    >
                      {med.is_approved ? 'Approved' : 'Approve'}
                    </button>
                    <button onClick={() => onRemoveMedication(med.id)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {medications.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">
                  No medications prescribed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
