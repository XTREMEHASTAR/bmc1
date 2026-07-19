import React, { useState } from 'react';
import { LogOut, ArrowRight, ShieldCheck, Compass, Check, AlertTriangle } from 'lucide-react';
import type { DispositionType, WardBed } from '../../types/clinical';
import { getWardBeds, getWardSummary } from '../../services/encounters';

interface AdmissionDecisionProps {
  currentDisposition?: DispositionType;
  dispositionNotes?: string;
  onUpdateDisposition: (dispo: DispositionType, notes: string) => void;
}

export const AdmissionDecision: React.FC<AdmissionDecisionProps> = ({
  currentDisposition,
  dispositionNotes,
  onUpdateDisposition,
}) => {
  const [dispo, setDispo] = useState<DispositionType>(currentDisposition || 'DISCHARGE');
  const [notes, setNotes] = useState(dispositionNotes || '');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBed, setSelectedBed] = useState<WardBed | null>(null);

  const wardSummary = getWardSummary();
  const allBeds = getWardBeds();
  const filteredBeds = selectedWard ? allBeds.filter(b => b.ward_name === selectedWard) : [];

  const handleSave = () => {
    let finalNotes = notes;
    if (dispo === 'ADMIT' && selectedBed) {
      finalNotes = `Admit to ${selectedBed.ward_name}, Bed: ${selectedBed.bed_number}. ${notes}`.trim();
    }
    onUpdateDisposition(dispo, finalNotes);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <LogOut className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-slate-800 dark:text-white">Disposition & Ward Bed Manager</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        
        {/* Disposition Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Patient Disposition</label>
          <select
            value={dispo}
            onChange={(e) => setDispo(e.target.value as DispositionType)}
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="DISCHARGE">Discharge Home</option>
            <option value="OBSERVATION">Move to Emergency Observation</option>
            <option value="ADMIT">Admit to General/ICU Ward</option>
            <option value="TRANSFER">Transfer to Tertiary Center</option>
            <option value="REFER">Outpatient Referral</option>
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Clinical Dispo Notes / Instructions</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Return if fever persists, follow-up in 5 days..."
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* Ward Capacity & Bed Selector (conditional) */}
      {dispo === 'ADMIT' && (
        <div className="border border-indigo-50/80 dark:border-indigo-950/20 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Ward selector */}
          <div>
            <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">Select Admission Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                setSelectedBed(null);
              }}
              className="w-full p-2 rounded-lg border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Choose Ward (Occupied / Total) --</option>
              {wardSummary.map((w, idx) => (
                <option key={idx} value={w.name}>
                  {w.name} ({w.occupied} / {w.total} Beds Occupied)
                </option>
              ))}
            </select>

            {/* Ward Summary Stats */}
            {selectedWard && (
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                  <div className="text-slate-500">Total</div>
                  <div className="text-slate-700 dark:text-slate-300 mt-0.5">{wardSummary.find(w => w.name === selectedWard)?.total}</div>
                </div>
                <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700">
                  <div className="text-emerald-500">Available</div>
                  <div className="text-emerald-700 dark:text-emerald-300 mt-0.5">{wardSummary.find(w => w.name === selectedWard)?.available}</div>
                </div>
                <div className="p-1 rounded bg-red-50 dark:bg-red-950 text-red-750">
                  <div className="text-red-500">Occupied</div>
                  <div className="text-red-700 dark:text-red-300 mt-0.5">{wardSummary.find(w => w.name === selectedWard)?.occupied}</div>
                </div>
                <div className="p-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-700">
                  <div className="text-amber-500">Reserved</div>
                  <div className="text-amber-700 dark:text-amber-300 mt-0.5">{wardSummary.find(w => w.name === selectedWard)?.reserved}</div>
                </div>
              </div>
            )}
          </div>

          {/* Bed Grid Selector */}
          <div>
            <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">Available Bed Grid</label>
            {selectedWard ? (
              <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredBeds.map((bed) => {
                  const isAvailable = bed.status === 'AVAILABLE';
                  const isSelected = selectedBed?.id === bed.id;
                  return (
                    <button
                      key={bed.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedBed(bed)}
                      className={`p-1.5 text-[10px] font-bold rounded border text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                          : isAvailable
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : bed.status === 'OCCUPIED'
                          ? 'bg-red-50 border-red-200 text-red-750 cursor-not-allowed opacity-60'
                          : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {bed.bed_number.split('-')[1]}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-450 italic mt-2">Select a ward to view available beds.</div>
            )}

            {selectedBed && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                <Check className="h-4 w-4 shrink-0" />
                <span>Selected Bed: {selectedBed.bed_number} ({selectedBed.ward_name})</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Action triggers */}
      <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          Confirm Disposition Decision
        </button>
      </div>

    </div>
  );
};
