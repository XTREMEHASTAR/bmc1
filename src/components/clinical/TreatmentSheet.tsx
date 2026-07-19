import React, { useState, useEffect } from 'react';
import { ShieldCheck, HelpCircle, FileText, CheckSquare, Sparkles, HeartPulse, RefreshCw } from 'lucide-react';
import type { Patient, EmergencyRegistration } from '../../types/emergency';
import type {
  ClinicalEncounter, DiagnosisEntry, MedicationOrder, InvestigationOrder,
  ProcedureOrder, NursingInstruction, ExtractedClinicalData, DispositionType,
} from '../../types/clinical';
import {
  createEncounter, updateEncounterClinicalNotes, addMedication, removeMedication,
  addInvestigation, removeInvestigation, addProcedure, removeProcedure, addDiagnosis,
  addNursingOrder, getTimeline, approveAndRouteEncounter, removeNursingOrder,
} from '../../services/encounters';
import { PatientBanner } from './PatientBanner';
import { LiveScribePanel } from './LiveScribePanel';
import { ClinicalAssessmentCard, DiagnosisCard } from './ClinicalCards';
import { PrescriptionBuilder } from './PrescriptionBuilder';
import { InvestigationBuilder } from './InvestigationBuilder';
import { ProcedureBuilder } from './ProcedureBuilder';
import { AdmissionDecision } from './AdmissionDecision';
import { ClinicalTimeline } from './ClinicalTimeline';
import { ClinicalDocumentEngine } from './ClinicalDocumentEngine';

interface TreatmentSheetProps {
  registration: EmergencyRegistration;
  patient: Patient;
  onClose: () => void;
  isInline?: boolean;
}

export const TreatmentSheet: React.FC<TreatmentSheetProps> = ({ registration, patient, onClose, isInline }) => {
  const [encounter, setEncounter] = useState<ClinicalEncounter | null>(null);
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'REVIEW' | 'CLINICAL_OS'>('CLINICAL_OS');
  const [timeline, setTimeline] = useState<any[]>([]);

  // Initialize or fetch clinical encounter
  useEffect(() => {
    const enc = createEncounter(registration, 'Dr. Amit Sharma', 'Emergency Medicine');
    setEncounter(enc);
    setTimeline(getTimeline(enc.id));
  }, [registration]);

  const refreshTimeline = () => {
    if (encounter) setTimeline(getTimeline(encounter.id));
  };

  const handleUpdateNotes = (notes: Partial<ClinicalEncounter>) => {
    if (!encounter) return;
    updateEncounterClinicalNotes(encounter.id, notes);
    setEncounter({ ...encounter, ...notes });
  };

  const handleAddDiagnosis = (dx: string, type: 'PROVISIONAL' | 'DIFFERENTIAL' | 'CONFIRMED') => {
    if (!encounter) return;
    const entry = addDiagnosis(encounter.id, {
      patient_id: patient.id,
      diagnosis: dx,
      type,
      is_ai_suggested: false,
      is_approved: true,
    });
    setEncounter({ ...encounter, diagnoses: [...(encounter.diagnoses || []), entry] });
    refreshTimeline();
  };

  const handleRemoveDiagnosis = (id: string) => {
    if (!encounter) return;
    const filtered = (encounter.diagnoses || []).filter((d) => d.id !== id);
    setEncounter({ ...encounter, diagnoses: filtered });
  };

  const handleAddMedication = (med: Omit<MedicationOrder, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => {
    if (!encounter) return;
    const order = addMedication(encounter.id, {
      ...med,
      patient_id: encounter.patient_id,
      ordered_at: new Date().toISOString()
    });
    setEncounter({ ...encounter, medications: [...(encounter.medications || []), order] });
    refreshTimeline();
  };

  const handleRemoveMedication = (id: string) => {
    if (!encounter) return;
    removeMedication(encounter.id, id);
    setEncounter({ ...encounter, medications: (encounter.medications || []).filter((m) => m.id !== id) });
    refreshTimeline();
  };

  const handleToggleApproveMed = (id: string) => {
    if (!encounter) return;
    const mapped = (encounter.medications || []).map((m) => (m.id === id ? { ...m, is_approved: !m.is_approved } : m));
    setEncounter({ ...encounter, medications: mapped });
  };

  const handleAddInvestigation = (inv: Omit<InvestigationOrder, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => {
    if (!encounter) return;
    const order = addInvestigation(encounter.id, {
      ...inv,
      patient_id: encounter.patient_id,
      ordered_at: new Date().toISOString()
    });
    setEncounter({ ...encounter, investigations: [...(encounter.investigations || []), order] });
    refreshTimeline();
  };

  const handleRemoveInvestigation = (id: string) => {
    if (!encounter) return;
    removeInvestigation(encounter.id, id);
    setEncounter({ ...encounter, investigations: (encounter.investigations || []).filter((i) => i.id !== id) });
    refreshTimeline();
  };

  const handleToggleApproveInv = (id: string) => {
    if (!encounter) return;
    const mapped = (encounter.investigations || []).map((i) => (i.id === id ? { ...i, is_approved: !i.is_approved } : i));
    setEncounter({ ...encounter, investigations: mapped });
  };

  const handleAddProcedure = (proc: Omit<ProcedureOrder, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => {
    if (!encounter) return;
    const order = addProcedure(encounter.id, {
      ...proc,
      patient_id: encounter.patient_id,
      ordered_at: new Date().toISOString()
    });
    setEncounter({ ...encounter, procedures: [...(encounter.procedures || []), order] });
    refreshTimeline();
  };

  const handleRemoveProcedure = (id: string) => {
    if (!encounter) return;
    removeProcedure(encounter.id, id);
    setEncounter({ ...encounter, procedures: (encounter.procedures || []).filter((p) => p.id !== id) });
    refreshTimeline();
  };

  const handleToggleApproveProc = (id: string) => {
    if (!encounter) return;
    const mapped = (encounter.procedures || []).map((p) => (p.id === id ? { ...p, is_approved: !p.is_approved } : p));
    setEncounter({ ...encounter, procedures: mapped });
  };

  const handleAddNursingOrder = (nursing: Omit<NursingInstruction, 'id' | 'encounter_id' | 'created_at' | 'patient_id' | 'ordered_at'>) => {
    if (!encounter) return;
    const order = addNursingOrder(encounter.id, {
      ...nursing,
      patient_id: encounter.patient_id,
      ordered_at: new Date().toISOString()
    });
    setEncounter({ ...encounter, nursing_orders: [...(encounter.nursing_orders || []), order] });
    refreshTimeline();
  };

  const handleRemoveNursingOrder = (id: string) => {
    if (!encounter) return;
    removeNursingOrder(encounter.id, id);
    setEncounter({ ...encounter, nursing_orders: (encounter.nursing_orders || []).filter((n) => n.id !== id) });
    refreshTimeline();
  };

  const handleToggleApproveNurs = (id: string) => {
    if (!encounter) return;
    const mapped = (encounter.nursing_orders || []).map((n) => (n.id === id ? { ...n, is_approved: !n.is_approved } : n));
    setEncounter({ ...encounter, nursing_orders: mapped });
  };

  const handleUpdateDisposition = (disposition: DispositionType, notes: string) => {
    if (!encounter) return;
    handleUpdateNotes({ disposition, disposition_notes: notes });
    refreshTimeline();
  };

  // Handle ambient voice parsing
  const handleExtraction = (data: ExtractedClinicalData) => {
    if (!encounter) return;

    // Batch append symptoms
    data.symptoms.forEach((sym) => {
      const exists = (encounter.diagnoses || []).some((d) => d.diagnosis.toLowerCase() === sym.toLowerCase());
      if (!exists) {
        handleAddDiagnosis(sym, 'PROVISIONAL');
      }
    });

    // Batch append medications
    data.medications.forEach((m) => {
      const exists = (encounter.medications || []).some((med) => med.drug_name.toLowerCase() === m.drug.toLowerCase());
      if (!exists) {
        handleAddMedication({
          drug_name: m.drug,
          dose: m.dose || '',
          route: (m.route || 'PO') as any,
          frequency: (m.frequency || 'OD') as any,
          duration: m.duration || '5 days',
          timing: m.timing || 'After food',
          status: 'DRAFT',
          is_voice_order: true,
          is_approved: false,
          safety_warnings: [],
        });
      }
    });

    // Batch append investigations
    data.lab_orders.forEach((l) => {
      const exists = (encounter.investigations || []).some((i) => i.test_name.toLowerCase() === l.toLowerCase());
      if (!exists) {
        handleAddInvestigation({
          test_name: l,
          category: 'LABORATORY',
          priority: 'MEDIUM',
          status: 'ORDERED',
          is_voice_order: true,
          is_approved: false,
        });
      }
    });

    data.radiology_orders.forEach((r) => {
      const exists = (encounter.investigations || []).some((i) => i.test_name.toLowerCase() === r.toLowerCase());
      if (!exists) {
        handleAddInvestigation({
          test_name: r,
          category: 'RADIOLOGY',
          priority: 'MEDIUM',
          status: 'ORDERED',
          is_voice_order: true,
          is_approved: false,
        });
      }
    });

    // Batch procedures
    data.procedures.forEach((p) => {
      const exists = (encounter.procedures || []).some((proc) => proc.procedure_name.toLowerCase() === p.name.toLowerCase());
      if (!exists) {
        handleAddProcedure({
          procedure_name: p.name,
          procedure_type: p.type,
          details: p.details,
          priority: 'MEDIUM',
          status: 'PENDING',
          is_voice_order: true,
          is_approved: false,
        });
      }
    });
  };

  const handleFinalApproval = () => {
    if (!encounter) return;
    
    // Auto-approve all orders in Review tab that doctor didn't manually reject
    const approvedMeds = (encounter.medications || []).map((m) => ({ ...m, is_approved: true }));
    const approvedInvs = (encounter.investigations || []).map((i) => ({ ...i, is_approved: true }));
    const approvedProcs = (encounter.procedures || []).map((p) => ({ ...p, is_approved: true }));
    const approvedNurs = (encounter.nursing_orders || []).map((n) => ({ ...n, is_approved: true }));

    const updated = {
      ...encounter,
      medications: approvedMeds,
      investigations: approvedInvs,
      procedures: approvedProcs,
      nursing_orders: approvedNurs,
    };

    setEncounter(updated);

    // Save and route
    approveAndRouteEncounter(encounter.id);
    onClose();
  };

  if (!encounter) return null;

  return (
    <div className={isInline ? "w-full bg-slate-50 dark:bg-slate-950 rounded-3xl flex flex-col border border-slate-250 dark:border-slate-800" : "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"}>
      <div className={isInline ? "w-full flex flex-col overflow-hidden" : "bg-slate-50 dark:bg-slate-950 w-full max-w-7xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"}>
        
        {/* Banner header */}
        <PatientBanner encounter={encounter} patient={patient} />

        {/* Tab Controls */}
        <div className="px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('CLINICAL_OS')}
              className={`py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'CLINICAL_OS'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HeartPulse className="h-4 w-4 text-rose-500" /> Universal Clinical Voice OS (22 Sheets)
            </button>
            <button
              onClick={() => setActiveTab('WORKSPACE')}
              className={`py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'WORKSPACE'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" /> Consultation Workspace
            </button>
            <button
              onClick={() => setActiveTab('REVIEW')}
              className={`py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'REVIEW'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckSquare className="h-4 w-4" /> Clinical Review & Approval
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-500 hover:bg-slate-100 text-sm font-semibold transition-all">
              Discard Consultation
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {activeTab === 'CLINICAL_OS' ? (
            <ClinicalDocumentEngine
              registration={registration}
              patient={patient}
              encounter={encounter}
              onUpdateEncounter={(updated) => {
                setEncounter(updated);
                refreshTimeline();
              }}
              onClose={onClose}
            />
          ) : activeTab === 'WORKSPACE' ? (
            <div className="space-y-6">
              
              {/* Voice ingestion */}
              <LiveScribePanel
                onExtractionChange={handleExtraction}
                onTranscriptUpdate={(text) => handleUpdateNotes({ raw_transcript: text })}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Clinical / Diagnostics */}
                <div className="lg:col-span-2 space-y-6">
                  <ClinicalAssessmentCard encounter={encounter} onUpdateNotes={handleUpdateNotes} />
                  <DiagnosisCard
                    diagnoses={encounter.diagnoses || []}
                    onAddDiagnosis={handleAddDiagnosis}
                    onRemoveDiagnosis={handleRemoveDiagnosis}
                  />
                  <PrescriptionBuilder
                    medications={encounter.medications || []}
                    patientAllergies={patient.allergies?.map((a) => a.allergen) || []}
                    activeMeds={[]}
                    patientAge={patient.age}
                    onAddMedication={handleAddMedication}
                    onRemoveMedication={handleRemoveMedication}
                    onToggleApprove={handleToggleApproveMed}
                  />
                  <InvestigationBuilder
                    investigations={encounter.investigations || []}
                    onAddInvestigation={handleAddInvestigation}
                    onRemoveInvestigation={handleRemoveInvestigation}
                    onToggleApprove={handleToggleApproveInv}
                  />
                  <ProcedureBuilder
                    procedures={encounter.procedures || []}
                    nursingOrders={encounter.nursing_orders || []}
                    onAddProcedure={handleAddProcedure}
                    onRemoveProcedure={handleRemoveProcedure}
                    onAddNursingOrder={handleAddNursingOrder}
                    onRemoveNursingOrder={handleRemoveNursingOrder}
                    onToggleApproveProcedure={handleToggleApproveProc}
                    onToggleApproveNursing={handleToggleApproveNurs}
                  />
                  <AdmissionDecision
                    currentDisposition={encounter.disposition}
                    dispositionNotes={encounter.disposition_notes}
                    onUpdateDisposition={handleUpdateDisposition}
                  />
                </div>

                {/* Timeline */}
                <div>
                  <ClinicalTimeline events={timeline} />
                </div>

              </div>

            </div>
          ) : (
            // REVIEW & APPROVAL SCREEN
            <div className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Clinical Review & Safety Checklist
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Verify all extracted draft medications and diagnostics before committing.</p>
                </div>
              </div>

              {/* Summary orders */}
              <div className="space-y-4">
                
                {/* Diagnoses */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnoses</h4>
                  <div className="flex flex-wrap gap-2">
                    {encounter.diagnoses?.map((d) => (
                      <span key={d.id} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
                        {d.diagnosis} ({d.type})
                      </span>
                    ))}
                    {!encounter.diagnoses?.length && <span className="text-xs text-slate-450 italic">No diagnoses selected.</span>}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medications & Rx</h4>
                  <div className="space-y-2">
                    {encounter.medications?.map((m) => (
                      <div key={m.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center text-sm font-semibold">
                        <div>
                          <span>{m.drug_name} {m.strength} ({m.route})</span>
                          <span className="text-xs text-slate-450 font-normal ml-2">{m.frequency} for {m.duration} ({m.timing})</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Approved
                        </span>
                      </div>
                    ))}
                    {!encounter.medications?.length && <span className="text-xs text-slate-450 italic">No medications prescribed.</span>}
                  </div>
                </div>

                {/* Investigations */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnostics & Investigations</h4>
                  <div className="space-y-2">
                    {encounter.investigations?.map((i) => (
                      <div key={i.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center text-sm font-semibold">
                        <span>{i.test_name} ({i.category})</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {i.priority}
                        </span>
                      </div>
                    ))}
                    {!encounter.investigations?.length && <span className="text-xs text-slate-450 italic">No investigations ordered.</span>}
                  </div>
                </div>

                {/* Nursing & Disposition */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nursing & Disposition</h4>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm space-y-2">
                    <div>
                      <span className="font-bold text-slate-500">Disposition:</span>
                      <span className="font-semibold ml-2 text-indigo-700">{encounter.disposition || 'DISCHARGE'}</span>
                    </div>
                    {encounter.disposition_notes && (
                      <div>
                        <span className="font-bold text-slate-500">Notes:</span>
                        <span className="ml-2">{encounter.disposition_notes}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Master Approval Trigger */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-end">
                <button
                  onClick={handleFinalApproval}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-650 to-indigo-700 hover:from-indigo-700 hover:to-indigo-850 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-950/20 flex items-center gap-2 transition-all"
                >
                  <ShieldCheck className="h-5 w-5" />
                  APPROVE & ROUTE CLINICAL ENCOUNTER
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
