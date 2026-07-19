import React, { useState } from 'react';
import { Microscope, Plus, Trash2, ShieldAlert } from 'lucide-react';
import type { InvestigationOrder, InvestigationCategory } from '../../types/clinical';
import type { TaskPriority } from '../../types/emergency';

interface InvestigationBuilderProps {
  investigations: InvestigationOrder[];
  onAddInvestigation: (inv: Omit<InvestigationOrder, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => void;
  onRemoveInvestigation: (id: string) => void;
  onToggleApprove: (id: string) => void;
}

export const InvestigationBuilder: React.FC<InvestigationBuilderProps> = ({
  investigations,
  onAddInvestigation,
  onRemoveInvestigation,
  onToggleApprove,
}) => {
  const [test, setTest] = useState('');
  const [category, setCategory] = useState<InvestigationCategory>('LABORATORY');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleTestChange = (val: string) => {
    setTest(val);
    if (val.trim()) {
      const isDuplicate = investigations.some(
        (i) => i.test_name.toLowerCase() === val.trim().toLowerCase() && i.category === category
      );
      if (isDuplicate) {
        setDuplicateWarning(`⚠️ Duplicate Order Prevention: ${val} is already in the order basket.`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleAdd = () => {
    if (!test.trim()) return;

    // Check duplicate
    const isDuplicate = investigations.some(
      (i) => i.test_name.toLowerCase() === test.trim().toLowerCase() && i.category === category
    );

    if (isDuplicate) {
      setDuplicateWarning(`⚠️ Cannot place order: ${test} is already in the basket.`);
      return;
    }

    onAddInvestigation({
      test_name: test.trim(),
      category,
      priority,
      status: 'ORDERED',
      is_voice_order: false,
      is_approved: true,
    });

    setTest('');
    setDuplicateWarning(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <Microscope className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
        <h3 className="font-bold text-slate-800 dark:text-white">Investigation Order Builder</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Diagnostic Test Name</label>
          <input
            type="text"
            value={test}
            onChange={(e) => handleTestChange(e.target.value)}
            placeholder="e.g. CBC, Serum Lipase, USG Abdomen"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="LABORATORY">Laboratory</option>
            <option value="RADIOLOGY">Radiology</option>
            <option value="CARDIOLOGY">Cardiology</option>
            <option value="PATHOLOGY">Pathology</option>
            <option value="MICROBIOLOGY">Microbiology</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="LOW">Routine (Low)</option>
            <option value="MEDIUM">Urgent (Medium)</option>
            <option value="HIGH">STAT (High)</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {duplicateWarning && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Order
        </button>
      </div>

      {/* Ordered items list */}
      <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
              <th className="p-3">Test Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {investigations.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{inv.test_name}</td>
                <td className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{inv.category}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inv.priority === 'CRITICAL' || inv.priority === 'HIGH'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : inv.priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}>
                    {inv.priority}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{inv.status}</span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggleApprove(inv.id)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        inv.is_approved
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/50'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-250 dark:bg-indigo-950/30 dark:text-indigo-450 dark:border-indigo-900/50'
                      }`}
                    >
                      {inv.is_approved ? 'Approved' : 'Approve'}
                    </button>
                    <button onClick={() => onRemoveInvestigation(inv.id)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {investigations.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">
                  No diagnostic investigations ordered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
