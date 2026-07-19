import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Heart } from 'lucide-react';
import type { ProcedureOrder, ProcedureType, NursingInstruction, NursingCategory } from '../../types/clinical';
import type { TaskPriority } from '../../types/emergency';

interface ProcedureBuilderProps {
  procedures: ProcedureOrder[];
  nursingOrders: NursingInstruction[];
  onAddProcedure: (proc: Omit<ProcedureOrder, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => void;
  onRemoveProcedure: (id: string) => void;
  onAddNursingOrder: (order: Omit<NursingInstruction, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => void;
  onRemoveNursingOrder: (id: string) => void;
  onToggleApproveProcedure: (id: string) => void;
  onToggleApproveNursing: (id: string) => void;
}

export const ProcedureBuilder: React.FC<ProcedureBuilderProps> = ({
  procedures,
  nursingOrders,
  onAddProcedure,
  onRemoveProcedure,
  onAddNursingOrder,
  onRemoveNursingOrder,
  onToggleApproveProcedure,
  onToggleApproveNursing,
}) => {
  // Procedure form states
  const [procType, setProcType] = useState<ProcedureType>('IV_FLUIDS');
  const [procName, setProcName] = useState('');
  const [procDetails, setProcDetails] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');

  // Nursing order form states
  const [nursCategory, setNursCategory] = useState<NursingCategory>('VITALS');
  const [nursInstruction, setNursInstruction] = useState('');
  const [nursFrequency, setNursFrequency] = useState('Q4H');

  const handleAddProcedure = () => {
    if (!procName.trim()) return;
    onAddProcedure({
      procedure_type: procType,
      procedure_name: procName.trim(),
      details: procDetails.trim(),
      priority,
      status: 'PENDING',
      is_voice_order: false,
      is_approved: true,
    });
    setProcName('');
    setProcDetails('');
  };

  const handleAddNursingOrder = () => {
    if (!nursInstruction.trim()) return;
    onAddNursingOrder({
      category: nursCategory,
      instruction: nursInstruction.trim(),
      frequency: nursFrequency,
      is_voice_order: false,
      is_approved: true,
      status: 'ACTIVE',
    });
    setNursInstruction('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Procedures Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h3 className="font-bold text-slate-800 dark:text-white">Active Procedures & Fluids</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
            <select
              value={procType}
              onChange={(e) => {
                const val = e.target.value as ProcedureType;
                setProcType(val);
                // Auto-fill template names
                if (val === 'IV_FLUIDS') setProcName('IV Normal Saline 1L');
                else if (val === 'OXYGEN') setProcName('Oxygen Therapy (2L/min)');
                else if (val === 'NEBULIZATION') setProcName('Duolin Nebulization');
                else if (val === 'DRESSING') setProcName('Surgical Dressing');
                else setProcName('');
              }}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="IV_FLUIDS">IV Fluids</option>
              <option value="OXYGEN">Oxygen Therapy</option>
              <option value="NEBULIZATION">Nebulization</option>
              <option value="DRESSING">Dressing</option>
              <option value="CATHETERIZATION">Catheterization</option>
              <option value="NG_TUBE">NG Tube</option>
              <option value="BLOOD_TRANSFUSION">Blood Transfusion</option>
              <option value="WOUND_CARE">Wound Care</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Procedure Title</label>
            <input
              type="text"
              value={procName}
              onChange={(e) => setProcName(e.target.value)}
              placeholder="e.g. IV Normal Saline 1L"
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Details / Rate / Administration</label>
            <input
              type="text"
              value={procDetails}
              onChange={(e) => setProcDetails(e.target.value)}
              placeholder="e.g. Run at 100 ml/hr over 10 hours"
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddProcedure}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Fluid/Procedure
          </button>
        </div>

        <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
          {procedures.map((proc) => (
            <div key={proc.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850">
              <div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                  {proc.procedure_type}
                </span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-1 text-sm">{proc.procedure_name}</div>
                {proc.details && <div className="text-xs text-slate-400 mt-0.5">{proc.details}</div>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleApproveProcedure(proc.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    proc.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {proc.is_approved ? 'Approved' : 'Approve'}
                </button>
                <button onClick={() => onRemoveProcedure(proc.id)} className="text-slate-400 hover:text-red-500 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {procedures.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">No active procedures/fluids ordered.</div>
          )}
        </div>
      </div>

      {/* Nursing Instructions Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
          <h3 className="font-bold text-slate-800 dark:text-white">Nursing Instructions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={nursCategory}
              onChange={(e) => setNursCategory(e.target.value as NursingCategory)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="VITALS">Vitals monitoring</option>
              <option value="MONITORING">Clinical monitoring</option>
              <option value="DIET">Diet order</option>
              <option value="POSITIONING">Patient positioning</option>
              <option value="WOUND_CARE">Wound care</option>
              <option value="FALL_PRECAUTION">Fall precautions</option>
              <option value="IO_MONITORING">I/O strict monitoring</option>
              <option value="OTHER">Other instruction</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Instruction Details</label>
            <input
              type="text"
              value={nursInstruction}
              onChange={(e) => setNursInstruction(e.target.value)}
              placeholder="e.g. Elevate head end of bed 30 degrees"
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddNursingOrder}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Instruction
          </button>
        </div>

        <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
          {nursingOrders.map((nurs) => (
            <div key={nurs.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-855">
              <div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {nurs.category}
                </span>
                <div className="font-semibold text-slate-850 dark:text-slate-200 mt-1 text-sm">{nurs.instruction}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleApproveNursing(nurs.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    nurs.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {nurs.is_approved ? 'Approved' : 'Approve'}
                </button>
                <button onClick={() => onRemoveNursingOrder(nurs.id)} className="text-slate-400 hover:text-red-500 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {nursingOrders.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">No active nursing instructions recorded.</div>
          )}
        </div>
      </div>

    </div>
  );
};
