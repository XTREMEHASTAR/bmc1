import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, HelpCircle, FileText, CheckSquare, Sparkles, HeartPulse, RefreshCw, 
  Activity, Thermometer, Droplet, User, AlertTriangle, Clock, Plus, Trash2, Printer, 
  Check, FileSignature, ArrowRight, UserPlus, Clipboard, ShieldAlert, Award, Compass, 
  MapPin, CheckCircle, Flame, Battery, Eye, Stethoscope, ChevronRight, X
} from 'lucide-react';
import type { Patient, EmergencyRegistration } from '../../types/emergency';
import type { 
  ClinicalEncounter, DiagnosisEntry, MedicationOrder, InvestigationOrder, 
  ProcedureOrder, NursingInstruction, ExtractedClinicalData, DispositionType,
  MedicationRoute, MedicationFrequency, DietType, NursingCategory, ProcedureType
} from '../../types/clinical';
import { 
  addMedication, removeMedication, addInvestigation, removeInvestigation,
  addProcedure, removeProcedure, addDiagnosis, addNursingOrder, removeNursingOrder,
  addReferral, addFollowUp, updateEncounterClinicalNotes, getWardBeds
} from '../../services/encounters';

interface ClinicalDocumentEngineProps {
  registration: EmergencyRegistration;
  patient: Patient;
  encounter: ClinicalEncounter;
  onUpdateEncounter: (updated: ClinicalEncounter) => void;
  onClose: () => void;
}

// Sub-document definitions
type SubDocType = 
  | 'CASUALTY_CASE_PAPER'
  | 'TRIAGE_SHEET'
  | 'INITIAL_ASSESSMENT'
  | 'TREATMENT_SHEET'
  | 'PRESCRIPTION_ORDER'
  | 'MAR'
  | 'INVESTIGATIONS'
  | 'VITALS_CHART'
  | 'NURSING_IV_FLUIDS'
  | 'INTAKE_OUTPUT'
  | 'PROCEDURE_LOGS'
  | 'CONSULTATION_REFERRAL'
  | 'PROGRESS_NOTES'
  | 'REASSESSMENT'
  | 'RESUSCITATION'
  | 'TRANSFERS'
  | 'DISCHARGE_SUMMARY'
  | 'MLC_LOGS'
  | 'CONSENTS'
  | 'PRINTABLE_FORMATS'
  | 'FINAL_CHECKLIST';

interface SubDocItem {
  id: SubDocType;
  title: string;
  category: 'INTAKE' | 'ASSESSMENT' | 'ORDERS' | 'CHARTS' | 'TRANSITION';
  badge?: string;
  badgeColor?: string;
}

const SUB_DOCS: SubDocItem[] = [
  { id: 'CASUALTY_CASE_PAPER', title: '1. Master Casualty Case Paper', category: 'INTAKE', badge: 'Alerts', badgeColor: 'bg-red-500/10 text-red-500' },
  { id: 'TRIAGE_SHEET', title: '2. Digital Triage Sheet', category: 'INTAKE' },
  { id: 'CONSENTS', title: '19. Consent Documents', category: 'INTAKE' },
  { id: 'MLC_LOGS', title: '18. Medico-Legal Case (MLC)', category: 'INTAKE', badge: 'Police', badgeColor: 'bg-orange-500/10 text-orange-500' },
  
  { id: 'INITIAL_ASSESSMENT', title: '3. Doctor Initial SOAP', category: 'ASSESSMENT' },
  { id: 'PROGRESS_NOTES', title: '13. Continuation / Progress Feed', category: 'ASSESSMENT', badge: 'Append-Only', badgeColor: 'bg-blue-500/10 text-blue-500' },
  { id: 'CONSULTATION_REFERRAL', title: '12. Specialist Referrals', category: 'ASSESSMENT' },
  
  { id: 'TREATMENT_SHEET', title: '4. Digital Treatment Sheet', category: 'ORDERS' },
  { id: 'PRESCRIPTION_ORDER', title: '5. Medication Prescription', category: 'ORDERS' },
  { id: 'MAR', title: '6. MAR Execution Log', category: 'ORDERS', badge: 'Nurse', badgeColor: 'bg-purple-500/10 text-purple-500' },
  { id: 'INVESTIGATIONS', title: '7. Investigation Orders', category: 'ORDERS' },
  { id: 'PROCEDURE_LOGS', title: '11. Procedure Sheet', category: 'ORDERS' },
  
  { id: 'VITALS_CHART', title: '8. Vitals Chart & Scribe', category: 'CHARTS', badge: 'Voice', badgeColor: 'bg-green-500/10 text-green-500' },
  { id: 'NURSING_IV_FLUIDS', title: '9. IV Fluids & Nebs', category: 'CHARTS' },
  { id: 'INTAKE_OUTPUT', title: '10. Intake / Output Chart', category: 'CHARTS' },
  { id: 'REASSESSMENT', title: '14. Observation Bay Timer', category: 'CHARTS', badge: 'Timer', badgeColor: 'bg-yellow-500/10 text-yellow-500' },
  { id: 'RESUSCITATION', title: '15. Resuscitation Record', category: 'CHARTS', badge: 'CRITICAL', badgeColor: 'bg-red-650 text-white animate-pulse' },
  
  { id: 'TRANSFERS', title: '16. Admissions & Transfers', category: 'TRANSITION' },
  { id: 'DISCHARGE_SUMMARY', title: '17. Discharge Summary', category: 'TRANSITION' },
  { id: 'FINAL_CHECKLIST', title: '22. Disposition Checklist', category: 'TRANSITION', badge: 'Gate', badgeColor: 'bg-indigo-500/10 text-indigo-500' },
  { id: 'PRINTABLE_FORMATS', title: '21. Printable A4 Formats', category: 'TRANSITION', badge: 'PDF', badgeColor: 'bg-slate-500/10 text-slate-500' },
];

export const ClinicalDocumentEngine: React.FC<ClinicalDocumentEngineProps> = ({ 
  registration, patient, encounter, onUpdateEncounter, onClose 
}) => {
  const [activeSubDoc, setActiveSubDoc] = useState<SubDocType>('CASUALTY_CASE_PAPER');

  // Unified, cross-sheet synced states (in addition to encounter properties)
  const [painScore, setPainScore] = useState<number>(registration.latest_vitals?.pain_score || 0);
  const [gcsEye, setGcsEye] = useState<number>(Number(registration.triage?.gcs_eye || 4));
  const [gcsVerbal, setGcsVerbal] = useState<number>(Number(registration.triage?.gcs_verbal || 5));
  const [gcsMotor, setGcsMotor] = useState<number>(Number(registration.triage?.gcs_motor || 6));
  const [mobilityStatus, setMobilityStatus] = useState<string>('Ambulatory');
  const [bleedingActive, setBleedingActive] = useState<boolean>(false);
  const [bleedingDetails, setBleedingDetails] = useState<string>('');

  // Medical histories
  const [pastHistory, setPastHistory] = useState<string>(encounter.past_medical_history || '');
  const [familyHistory, setFamilyHistory] = useState<string>(encounter.family_history || '');
  const [socialHistory, setSocialHistory] = useState<string>(encounter.social_history || '');
  const [positiveFindings, setPositiveFindings] = useState<string>('Chest tenderness, crepitations in left base.');
  const [negativeFindings, setNegativeFindings] = useState<string>('No abdominal tenderness. Pupils reactive. No focal neurological deficits.');

  // Vitals Time-Series Log
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([
    { time: '10:00 AM', temp: '98.6', hr: '80', bp: '120/80', spo2: '98', rr: '16' },
    { time: '10:15 AM', temp: '99.1', hr: '84', bp: '125/82', spo2: '97', rr: '18' },
    { time: '10:30 AM', temp: '99.5', hr: '90', bp: '130/85', spo2: '96', rr: '20' }
  ]);
  const [voiceVitalsText, setVoiceVitalsText] = useState<string>('');
  const [newVitalTemp, setNewVitalTemp] = useState<string>('98.6');
  const [newVitalHR, setNewVitalHR] = useState<string>('80');
  const [newVitalBP, setNewVitalBP] = useState<string>('120/80');
  const [newVitalSpO2, setNewVitalSpO2] = useState<string>('98');
  const [newVitalRR, setNewVitalRR] = useState<string>('16');

  // MAR log state (derived from approved medications + Nurse execution logs)
  const [marRecords, setMarRecords] = useState<any[]>([
    { id: '1', time: '10:15 AM', drug: 'Paracetamol 650 mg', route: 'PO', administrator: 'Sister Varsha', status: 'VERIFIED_GIVEN' }
  ]);

  // sliding scale insulin & blood sugar logs
  const [bloodSugars, setBloodSugars] = useState<any[]>([
    { time: '10:00 AM', rbs: 180, insulinDose: '0 units' },
    { time: '11:00 AM', rbs: 260, insulinDose: '4 units Regular Insulin SC' }
  ]);
  const [newRBS, setNewRBS] = useState<string>('');

  // nebulizer log
  const [nebsLog, setNebsLog] = useState<any[]>([
    { time: '10:05 AM', medicine: 'Salbutamol + Budesonide', state: 'Completed', nurse: 'Sister Varsha' }
  ]);

  // IV Fluid balance sheet
  const [ivFluids, setIvFluids] = useState<any[]>([
    { time: '10:00 AM', fluidName: 'Normal Saline (NS)', rate: '100 ml/hr', volumeGiven: 200, cumulative: 200 }
  ]);
  const [newFluidName, setNewFluidName] = useState<string>('Normal Saline (NS)');
  const [newFluidRate, setNewFluidRate] = useState<string>('100 ml/hr');
  const [newFluidVolume, setNewFluidVolume] = useState<string>('200');

  // Intake/Output hourly chart
  const [ioChart, setIoChart] = useState<any[]>([
    { hour: '10:00 AM', intakeIv: 100, intakeOral: 50, outputUrine: 120, outputNg: 0 },
    { hour: '11:00 AM', intakeIv: 100, intakeOral: 0, outputUrine: 80, outputNg: 0 }
  ]);

  // Procedure documentation logs
  const [procedureLogs, setProcedureLogs] = useState<any[]>([
    { id: '1', procedureName: 'NG Tube Insertion', insertedAt: '10:15 AM', operator: 'Dr. Amit Sharma', complication: 'None', status: 'Checked' }
  ]);
  const [newProcName, setNewProcName] = useState<string>('Foley Catheterization');
  const [newProcOperator, setNewProcOperator] = useState<string>('Sister Varsha');
  const [newProcDetails, setNewProcDetails] = useState<string>('Inserted 16Fr catheter, clear urine draining.');
  const [procComplication, setProcComplication] = useState<string>('None');

  // Specialist referrals
  const [referralOrders, setReferralOrders] = useState<any[]>([
    { id: '1', specialty: 'Cardiology', question: 'Evaluate chest pain; ECG showing transient ST depressions.', responder: 'Dr. R. K. Gupta', response: 'Agreed. Start dual antiplatelets. Clear for coronary angiography.', status: 'COMPLETED' }
  ]);
  const [refSpecialty, setRefSpecialty] = useState<string>('Orthopedics');
  const [refQuestion, setRefQuestion] = useState<string>('Evaluate left ankle swelling and rule out fracture.');

  // Continuation sheet progress notes (append-only)
  const [progressNotes, setProgressNotes] = useState<any[]>([
    { time: '10:00 AM', author: 'Dr. Amit Sharma (ED)', text: 'Patient admitted to emergency department in stable condition. Scribe activated.' },
    { time: '10:30 AM', author: 'Dr. Amit Sharma (ED)', text: 'Vitals stable. Normal saline IV started. Responding well to paracetamol.' }
  ]);
  const [newProgressNote, setNewProgressNote] = useState<string>('');

  // Observation Bay reassessment timer
  const [obsTimerValue, setObsTimerValue] = useState<number>(3600); // 1 hour countdown in seconds
  const [obsStatus, setObsStatus] = useState<string>('Stable - Awaiting laboratory results');
  const timerRef = useRef<any>(null);

  // Resuscitation log timeline
  const [resusLog, setResusLog] = useState<any[]>([]);
  const [isResusActive, setIsResusActive] = useState<boolean>(false);
  const [resusTime, setResusTime] = useState<number>(0);
  const resusIntervalRef = useRef<any>(null);

  // Admission request bed settings
  const [selectedWard, setSelectedWard] = useState<string>('ICU');
  const [bedSelection, setBedSelection] = useState<string>('');
  const [isolationRequired, setIsolationRequired] = useState<boolean>(false);

  // MLC police log
  const [isMLC, setIsMLC] = useState<boolean>(false);
  const [mlcNumber, setMlcNumber] = useState<string>('MLC-MCGM-2026-08492');
  const [mlcType, setMlcType] = useState<string>('Road Traffic Accident (RTA)');
  const [policeStation, setPoliceStation] = useState<string>('Sion Police Station');
  const [policeOfficer, setPoliceOfficer] = useState<string>('Sub-Inspector S. B. Mane');
  const [badgeNumber, setBadgeNumber] = useState<string>('SI-84931');
  const [policeCustody, setPoliceCustody] = useState<string>('No');

  // Consent Documents
  const [surgeryConsent, setSurgeryConsent] = useState<boolean>(false);
  const [procedureConsent, setProcedureConsent] = useState<boolean>(false);
  const [bloodConsent, setBloodConsent] = useState<boolean>(false);

  // Final Review checklist checklist items
  const [reviewChecklist, setReviewChecklist] = useState({
    vitalsStable: true,
    mlcCleared: false,
    consentSigned: false,
    dischargeMedsExplained: false,
    referralBooked: false,
    nursingNoteCompleted: true,
    samplesSent: true
  });

  // Start Observation reassessment timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setObsTimerValue(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Format countdown
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Resuscitation log timer
  const handleToggleResus = () => {
    if (isResusActive) {
      clearInterval(resusIntervalRef.current);
      setIsResusActive(false);
    } else {
      setIsResusActive(true);
      setResusTime(0);
      setResusLog([{ time: '00:00', event: 'Resuscitation Protocol Initiated. Code Blue Team called.' }]);
      resusIntervalRef.current = setInterval(() => {
        setResusTime(prev => prev + 1);
      }, 1000);
    }
  };

  const handleAddResusEvent = (eventText: string) => {
    const m = Math.floor(resusTime / 60);
    const s = resusTime % 60;
    const stamp = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    setResusLog(prev => [...prev, { time: stamp, event: eventText }]);
  };

  // Natural Speech Vitals Parser Logic
  const handleParseVitalsSpeech = () => {
    if (!voiceVitalsText.trim()) return;
    
    // Parse: temp, heart rate/pulse, BP, SpO2, rr
    let parsed: any = {};
    const text = voiceVitalsText.toLowerCase();
    
    // BP matches like "120 over 80", "120/80", "blood pressure is 115 by 75"
    const bpMatch = text.match(/(\d{2,3})\s*(?:\/|over|by)\s*(\d{2,3})/);
    if (bpMatch) parsed.bp = `${bpMatch[1]}/${bpMatch[2]}`;
    
    // Pulse/Heart rate matches like "pulse is 88", "heart rate of 90"
    const hrMatch = text.match(/(?:pulse|heart rate)(?:\s+is|\s+of)?\s*(\d{2,3})/);
    if (hrMatch) parsed.hr = hrMatch[1];
    
    // Temp matches like "temp is 98.6", "temperature 101"
    const tempMatch = text.match(/(?:temp|temperature)(?:\s+is|\s+of)?\s*(\d{2,3}(?:\.\d+)?)/);
    if (tempMatch) parsed.temp = tempMatch[1];

    // SpO2 matches like "spo2 is 98", "oxygen saturation is 95"
    const spo2Match = text.match(/(?:spo2|oxygen|saturation)(?:\s+is|\s+of)?\s*(\d{2,3})/);
    if (spo2Match) parsed.spo2 = spo2Match[1];

    // RR matches like "respiratory rate is 18", "breathing rate 20"
    const rrMatch = text.match(/(?:respiratory rate|respiration|rr)(?:\s+is|\s+of)?\s*(\d{1,2})/);
    if (rrMatch) parsed.rr = rrMatch[1];

    if (Object.keys(parsed).length > 0) {
      const newEntry = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: parsed.temp || newVitalTemp,
        hr: parsed.hr || newVitalHR,
        bp: parsed.bp || newVitalBP,
        spo2: parsed.spo2 || newVitalSpO2,
        rr: parsed.rr || newVitalRR
      };
      setVitalsHistory(prev => [...prev, newEntry]);
      
      // Update clinical notes/vitals automatically
      const nextVitals = {
        ...encounter.vitals,
        heart_rate: Number(newEntry.hr),
        systolic_bp: Number(newEntry.bp.split('/')[0]),
        diastolic_bp: Number(newEntry.bp.split('/')[1]),
        spo2: Number(newEntry.spo2),
        temperature: Number(newEntry.temp),
        respiratory_rate: Number(newEntry.rr)
      };
      
      onUpdateEncounter({
        ...encounter,
        vitals: nextVitals as any
      });

      setVoiceVitalsText('');
      window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
        detail: {
          title: 'Speech Vitals Extracted',
          message: `Successfully parsed: Temp: ${newEntry.temp}°F, HR: ${newEntry.hr}bpm, BP: ${newEntry.bp}, SpO2: ${newEntry.spo2}%, RR: ${newEntry.rr}bpm. Synced across charts.`,
          type: 'success'
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
        detail: {
          title: 'Extraction Alert',
          message: 'Could not automatically identify vitals values. Check the phrasing (e.g. "BP is 120 over 80, temperature is 98.4").',
          type: 'warning'
        }
      }));
    }
  };

  const handleManualAddVitals = () => {
    const newEntry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: newVitalTemp,
      hr: newVitalHR,
      bp: newVitalBP,
      spo2: newVitalSpO2,
      rr: newVitalRR
    };
    setVitalsHistory(prev => [...prev, newEntry]);
    
    // Update encounter vitals
    const nextVitals = {
      ...encounter.vitals,
      heart_rate: Number(newVitalHR),
      systolic_bp: Number(newVitalBP.split('/')[0]),
      diastolic_bp: Number(newVitalBP.split('/')[1]),
      spo2: Number(newVitalSpO2),
      temperature: Number(newVitalTemp),
      respiratory_rate: Number(newVitalRR)
    };
    onUpdateEncounter({ ...encounter, vitals: nextVitals as any });
  };

  // Add diagnosis
  const handleAddNewDiagnosis = (dx: string, type: 'PROVISIONAL' | 'DIFFERENTIAL' | 'CONFIRMED') => {
    const entry = addDiagnosis(encounter.id, {
      patient_id: patient.id,
      diagnosis: dx,
      type,
      is_ai_suggested: false,
      is_approved: true
    });
    onUpdateEncounter({ ...encounter, diagnoses: [...(encounter.diagnoses || []), entry] });
  };

  const handleRemoveDx = (id: string) => {
    onUpdateEncounter({ ...encounter, diagnoses: (encounter.diagnoses || []).filter(d => d.id !== id) });
  };

  // Add prescription medication order
  const [medDrug, setMedDrug] = useState<string>('Pantoprazole');
  const [medStrength, setMedStrength] = useState<string>('40 mg');
  const [medDose, setMedDose] = useState<string>('1 tablet');
  const [medRoute, setMedRoute] = useState<MedicationRoute>('PO');
  const [medFreq, setMedFreq] = useState<MedicationFrequency>('OD');
  const [medDuration, setMedDuration] = useState<string>('5 Days');
  const [medTiming, setMedTiming] = useState<string>('Before food');

  const handleAddMed = () => {
    const order = addMedication(encounter.id, {
      patient_id: patient.id,
      drug_name: medDrug,
      strength: medStrength,
      dose: medDose,
      route: medRoute,
      frequency: medFreq,
      duration: medDuration,
      timing: medTiming,
      status: 'APPROVED',
      is_voice_order: false,
      is_approved: true,
      safety_warnings: [],
      ordered_at: new Date().toISOString()
    });

    onUpdateEncounter({ ...encounter, medications: [...(encounter.medications || []), order] });
    
    // Automatically populate MAR administration schedule to eliminate duplicate data entry
    const times = medFreq === 'OD' ? ['08:00 AM'] : medFreq === 'BD' ? ['08:00 AM', '08:00 PM'] : medFreq === 'TDS' ? ['08:00 AM', '02:00 PM', '08:00 PM'] : ['08:00 AM'];
    times.forEach(t => {
      setMarRecords(prev => [
        ...prev,
        {
          id: `MAR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          time: t,
          drug: `${medDrug} ${medStrength}`,
          route: medRoute,
          administrator: 'Pending Verification',
          status: 'PENDING'
        }
      ]);
    });
  };

  const handleAdministerMed = (marId: string, nurseName: string) => {
    setMarRecords(prev => prev.map(m => m.id === marId ? { ...m, administrator: nurseName, status: 'VERIFIED_GIVEN', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m));
  };

  // Add lab or rad investigation
  const [invName, setInvName] = useState<string>('CBC');
  const [invCategory, setInvCategory] = useState<'LABORATORY' | 'RADIOLOGY' | 'CARDIOLOGY'>('LABORATORY');
  const [invPriority, setInvPriority] = useState<'STAT' | 'HIGH' | 'MEDIUM' | 'LOW'>('STAT');

  const handleAddInv = () => {
    const order = addInvestigation(encounter.id, {
      patient_id: patient.id,
      test_name: invName,
      category: invCategory as any,
      priority: invPriority as any,
      status: 'ORDERED',
      is_voice_order: false,
      is_approved: true,
      ordered_at: new Date().toISOString()
    });
    onUpdateEncounter({ ...encounter, investigations: [...(encounter.investigations || []), order] });
  };

  const handlePostMockResult = (id: string, value: string, range: string, unit: string) => {
    const isCritical = value.toLowerCase().includes('critical') || parseFloat(value) < 7.0 || parseFloat(value) > 400;
    const mapped = (encounter.investigations || []).map(i => i.id === id ? {
      ...i,
      status: 'RESULT_AVAILABLE' as const,
      result_value: value,
      reference_range: range,
      result_unit: unit,
      is_critical_result: isCritical,
      resulted_at: new Date().toISOString()
    } : i);
    onUpdateEncounter({ ...encounter, investigations: mapped });
  };

  // Add blood sugar check log
  const handleAddRbs = () => {
    if (!newRBS) return;
    const val = parseInt(newRBS);
    let insulin = '0 units';
    if (val > 250) insulin = '8 units Regular Insulin SC';
    else if (val > 200) insulin = '4 units Regular Insulin SC';
    else if (val > 150) insulin = '2 units Regular Insulin SC';
    
    setBloodSugars(prev => [...prev, {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rbs: val,
      insulinDose: insulin
    }]);
    setNewRBS('');
  };

  // Add Nursing IV Fluid Fluid
  const handleAddIvFluid = () => {
    const vol = parseFloat(newFluidVolume) || 0;
    const prevCum = ivFluids.length > 0 ? ivFluids[ivFluids.length - 1].cumulative : 0;
    setIvFluids(prev => [...prev, {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fluidName: newFluidName,
      rate: newFluidRate,
      volumeGiven: vol,
      cumulative: prevCum + vol
    }]);
  };

  // Add Procedure Log
  const handleAddProcedureLog = () => {
    setProcedureLogs(prev => [...prev, {
      id: String(prev.length + 1),
      procedureName: newProcName,
      insertedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: newProcOperator,
      complication: procComplication,
      status: 'Completed'
    }]);

    // Also auto-add into encounter procedures order to keep sync
    const order = addProcedure(encounter.id, {
      patient_id: patient.id,
      procedure_name: newProcName,
      procedure_type: 'OTHER',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      is_voice_order: false,
      is_approved: true,
      details: `${newProcDetails} | Complications: ${procComplication}`,
      ordered_at: new Date().toISOString()
    });
    onUpdateEncounter({ ...encounter, procedures: [...(encounter.procedures || []), order] });
  };

  // Add Specialist consultation referral request
  const handleAddRef = () => {
    const order = addReferral(encounter.id, {
      patient_id: patient.id,
      specialty: refSpecialty,
      reason: refQuestion,
      priority: 'HIGH',
      clinical_summary: 'Referred from digital casualty workspace.',
      is_voice_order: false,
      is_approved: true,
      status: 'SENT',
      ordered_at: new Date().toISOString()
    });
    onUpdateEncounter({ ...encounter, referrals: [...(encounter.referrals || []), order] });
    
    setReferralOrders(prev => [...prev, {
      id: order.id,
      specialty: refSpecialty,
      question: refQuestion,
      responder: 'Awaiting Specialist Acceptance',
      response: 'Pending Review...',
      status: 'SENT'
    }]);
  };

  const handleUpdateSoap = (notes: Partial<ClinicalEncounter>) => {
    updateEncounterClinicalNotes(encounter.id, notes);
    onUpdateEncounter({ ...encounter, ...notes });
  };

  // Add progress notes
  const handleAddProgressNote = () => {
    if (!newProgressNote.trim()) return;
    const note = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Dr. Amit Sharma (ED)',
      text: newProgressNote
    };
    setProgressNotes(prev => [...prev, note]);
    
    // Concat to encounter transcript or subjective
    const updatedSub = encounter.subjective 
      ? `${encounter.subjective}\n[Progress Note ${note.time}]: ${newProgressNote}`
      : `[Progress Note ${note.time}]: ${newProgressNote}`;
    
    onUpdateEncounter({
      ...encounter,
      subjective: updatedSub
    });
    setNewProgressNote('');
  };

  // Admissions bed request confirmation
  const handleBedAssignment = () => {
    const beds = getWardBeds();
    const availableBed = beds.find(b => b.ward_type === selectedWard && b.status === 'AVAILABLE');
    if (availableBed) {
      availableBed.status = 'OCCUPIED';
      availableBed.patient_name = patient.name;
      availableBed.patient_id = patient.id;
      setBedSelection(availableBed.bed_number);
      
      window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
        detail: {
          title: 'Bed Allocated Successfully',
          message: `${patient.name} assigned to Bed ${availableBed.bed_number} in ${availableBed.ward_name}.`,
          type: 'success'
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
        detail: {
          title: 'Bed Allocation Pending',
          message: `No immediate beds available in ${selectedWard}. Request placed in priority queue.`,
          type: 'warning'
        }
      }));
    }
  };

  return (
    <div className="flex flex-1 h-[82vh] overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* SIDEBAR: navigation list of all 22 sheets grouped by category */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Clinical Documents (22 Modules)</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Unified EHR workspace - zero duplicate entries</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin">
          
          {/* INTAKE / REGISTRATION SECTION */}
          <div>
            <div className="px-3 py-1 text-[9px] font-black uppercase text-indigo-500 tracking-wider">Triage & Registration</div>
            <div className="space-y-1 mt-1">
              {SUB_DOCS.filter(d => d.category === 'INTAKE').map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setActiveSubDoc(doc.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeSubDoc === doc.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                      : 'text-slate-650 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{doc.title}</span>
                  {doc.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CLINICAL ASSESSMENT SECTION */}
          <div>
            <div className="px-3 py-1 text-[9px] font-black uppercase text-indigo-500 tracking-wider">Clinical Assessment</div>
            <div className="space-y-1 mt-1">
              {SUB_DOCS.filter(d => d.category === 'ASSESSMENT').map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setActiveSubDoc(doc.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeSubDoc === doc.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                      : 'text-slate-650 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{doc.title}</span>
                  {doc.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ORDERS & MAR SECTION */}
          <div>
            <div className="px-3 py-1 text-[9px] font-black uppercase text-indigo-500 tracking-wider">Prescriptions & Orders</div>
            <div className="space-y-1 mt-1">
              {SUB_DOCS.filter(d => d.category === 'ORDERS').map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setActiveSubDoc(doc.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeSubDoc === doc.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                      : 'text-slate-650 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{doc.title}</span>
                  {doc.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CHARTS & MONITORING SECTION */}
          <div>
            <div className="px-3 py-1 text-[9px] font-black uppercase text-indigo-500 tracking-wider">Charts & Monitoring</div>
            <div className="space-y-1 mt-1">
              {SUB_DOCS.filter(d => d.category === 'CHARTS').map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setActiveSubDoc(doc.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeSubDoc === doc.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                      : 'text-slate-650 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{doc.title}</span>
                  {doc.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TRANSITIONS & DISPOSITION SECTION */}
          <div>
            <div className="px-3 py-1 text-[9px] font-black uppercase text-indigo-500 tracking-wider">Disposition & Print</div>
            <div className="space-y-1 mt-1">
              {SUB_DOCS.filter(d => d.category === 'TRANSITION').map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setActiveSubDoc(doc.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeSubDoc === doc.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                      : 'text-slate-650 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{doc.title}</span>
                  {doc.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* CONTENT WORKSPACE VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        
        {/* Module 1: Master Digital Casualty Case Paper */}
        {activeSubDoc === 'CASUALTY_CASE_PAPER' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4 flex gap-4 items-center">
              <ShieldAlert className="h-10 w-10 text-red-500 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-red-700 dark:text-red-300">MASTER CLINICAL ALERTS & RISK FACTOR PROFILE</h4>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ⚠️ <strong>ALLERGIES:</strong> {patient.allergies?.map(a => `${a.allergen} (${a.reaction})`).join(', ') || 'No known allergies'}<br/>
                  🛑 <strong>TRIAGE LEVEL:</strong> RED - Trauma Triage Alert | 🚓 <strong>MLC:</strong> YES - Police logs active.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3 flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-indigo-500" /> Patient Demographics Profile
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block">Full Name</span>
                  <span className="text-slate-800 dark:text-slate-250 mt-1 block">{patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gender / Age</span>
                  <span className="text-slate-800 dark:text-slate-250 mt-1 block">{patient.gender} / {patient.age} yrs</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Blood Group</span>
                  <span className="text-red-500 mt-1 block">{patient.blood_group || 'O Positive'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">UHID ID</span>
                  <span className="text-slate-800 dark:text-slate-250 mt-1 block">{patient.uhid || patient.temp_uhid || 'UHID-2026-98421'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ABHA Card Number</span>
                  <span className="text-[#003F8A] mt-1 block">9841-2490-4821@sbx</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Encounter No</span>
                  <span className="text-slate-800 dark:text-slate-250 mt-1 block">{encounter.encounter_no}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Registration Time</span>
                  <span className="text-slate-800 dark:text-slate-250 mt-1 block">{new Date(registration.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Primary Consultant</span>
                  <span className="text-slate-800 dark:text-slate-250 mt-1 block">{encounter.consulting_doctor_name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 2: Digital Triage Sheet */}
        {activeSubDoc === 'TRIAGE_SHEET' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Digital Triage Assessment Sheet</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-500 block mb-1">Pain Score Slider: <span className="text-red-500 font-extrabold text-sm">{painScore} / 10</span></label>
                <input 
                  type="range" min="0" max="10" value={painScore} 
                  onChange={(e) => setPainScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">GCS Eye Response</label>
                  <select 
                    value={gcsEye} onChange={(e) => setGcsEye(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                  >
                    <option value={4}>4 - Spontaneous</option>
                    <option value={3}>3 - To Sound</option>
                    <option value={2}>2 - To Pressure</option>
                    <option value={1}>1 - None</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">GCS Verbal Response</label>
                  <select 
                    value={gcsVerbal} onChange={(e) => setGcsVerbal(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                  >
                    <option value={5}>5 - Oriented</option>
                    <option value={4}>4 - Confused</option>
                    <option value={3}>3 - Inappropriate Words</option>
                    <option value={2}>2 - Incomprehensible Sounds</option>
                    <option value={1}>1 - None</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">GCS Motor Response</label>
                  <select 
                    value={gcsMotor} onChange={(e) => setGcsMotor(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                  >
                    <option value={6}>6 - Obeys Commands</option>
                    <option value={5}>5 - Localizing Pain</option>
                    <option value={4}>4 - Normal Flexion</option>
                    <option value={3}>3 - Abnormal Flexion (Decorticate)</option>
                    <option value={2}>2 - Extension (Decerebrate)</option>
                    <option value={1}>1 - None</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-slate-850 border border-indigo-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                <span>Calculated GCS Score:</span>
                <span className="font-extrabold text-sm text-indigo-700 dark:text-indigo-400">
                  {gcsEye + gcsVerbal + gcsMotor} / 15 ({gcsEye + gcsVerbal + gcsMotor >= 13 ? 'Mild' : gcsEye + gcsVerbal + gcsMotor >= 9 ? 'Moderate' : 'Severe Injury'})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Mobility / Ambulation</label>
                  <input 
                    type="text" value={mobilityStatus} onChange={(e) => setMobilityStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Active External Bleeding</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" checked={bleedingActive} onChange={(e) => setBleedingActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active bleed noted at intake</span>
                  </div>
                </div>
              </div>

              {bleedingActive && (
                <div>
                  <label className="text-slate-400 block mb-1">Bleeding Details & Direct Pressure Applied</label>
                  <textarea 
                    value={bleedingDetails} onChange={(e) => setBleedingDetails(e.target.value)}
                    placeholder="E.g., Left forearm laceration, controlled with pressure dressing."
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 h-20 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Module 3: Doctor Initial Assessment SOAP */}
        {activeSubDoc === 'INITIAL_ASSESSMENT' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Doctor Initial Assessment (SOAP)</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Chief Complaint</label>
                  <input 
                    type="text" value={encounter.chief_complaint || ''} 
                    onChange={(e) => handleUpdateSoap({ chief_complaint: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duration of Complaints</label>
                  <input 
                    type="text" value={encounter.past_medical_history || 'Since last night'} 
                    onChange={(e) => handleUpdateSoap({ past_medical_history: e.target.value })}
                    placeholder="E.g. 2 hours, 3 days"
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subjective notes (HPI / Patient Statement)</label>
                <textarea 
                  value={encounter.subjective || ''} 
                  onChange={(e) => handleUpdateSoap({ subjective: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 h-24 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Objective notes (Vitals summary & Exam findings)</label>
                <textarea 
                  value={encounter.objective || ''} 
                  onChange={(e) => handleUpdateSoap({ objective: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 h-24 outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Positive Examination Findings</label>
                  <textarea 
                    value={positiveFindings} onChange={(e) => setPositiveFindings(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 h-20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Negative / Normal Findings</label>
                  <textarea 
                    value={negativeFindings} onChange={(e) => setNegativeFindings(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 h-20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Past Medical History</label>
                  <input 
                    type="text" value={pastHistory} onChange={(e) => setPastHistory(e.target.value)}
                    placeholder="Hypertension, Type-2 Diabetes"
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Family Medical History</label>
                  <input 
                    type="text" value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)}
                    placeholder="Ischemic heart disease in father"
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Social / Personal History</label>
                  <input 
                    type="text" value={socialHistory} onChange={(e) => setSocialHistory(e.target.value)}
                    placeholder="Non-smoker, occasional alcohol"
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 4: Digital Treatment Sheet */}
        {activeSubDoc === 'TREATMENT_SHEET' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Digital Treatment & Order Sheet</h3>
            
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold">Chronological view of all active, pending, and completed orders for patient.</p>
              
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs font-semibold">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">Order ID / Time</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Details / Instructions</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {encounter.medications?.map(m => (
                      <tr key={m.id}>
                        <td className="p-3 text-slate-400">{m.id.substring(0, 8)}<br/>{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-650 dark:text-purple-400 font-extrabold">Prescription</span></td>
                        <td className="p-3"><strong>{m.drug_name} {m.strength}</strong> - {m.dose} {m.route} {m.frequency} for {m.duration} ({m.timing})</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase">{m.status}</span></td>
                      </tr>
                    ))}
                    {encounter.investigations?.map(i => (
                      <tr key={i.id}>
                        <td className="p-3 text-slate-400">{i.id.substring(0, 8)}<br/>{new Date(i.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-extrabold">{i.category}</span></td>
                        <td className="p-3"><strong>{i.test_name}</strong> - Priority: {i.priority}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 uppercase">{i.status}</span></td>
                      </tr>
                    ))}
                    {encounter.procedures?.map(p => (
                      <tr key={p.id}>
                        <td className="p-3 text-slate-400">{p.id.substring(0, 8)}<br/>{new Date(p.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-extrabold">Procedure</span></td>
                        <td className="p-3"><strong>{p.procedure_name}</strong> - {p.details || 'Routine administration'}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Module 5: Prescription/Medication Order Sheet */}
        {activeSubDoc === 'PRESCRIPTION_ORDER' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Prescription & Medication Orders</h3>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-black uppercase text-[10px]">Verify Drug safety checks</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">Drug Name</label>
                <select 
                  value={medDrug} onChange={(e) => setMedDrug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="Pantoprazole">Pantoprazole</option>
                  <option value="Ondansetron">Ondansetron</option>
                  <option value="Paracetamol">Paracetamol</option>
                  <option value="Ibuprofen">Ibuprofen</option>
                  <option value="Aspirin">Aspirin (Children warning)</option>
                  <option value="Metformin">Metformin (Elderly warning)</option>
                  <option value="Ceftriaxone">Ceftriaxone</option>
                  <option value="Metronidazole">Metronidazole</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Strength</label>
                <input 
                  type="text" value={medStrength} onChange={(e) => setMedStrength(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Dose</label>
                <input 
                  type="text" value={medDose} onChange={(e) => setMedDose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Route</label>
                <select 
                  value={medRoute} onChange={(e) => setMedRoute(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="PO">Oral (PO)</option>
                  <option value="IV">Intravenous (IV)</option>
                  <option value="IM">Intramuscular (IM)</option>
                  <option value="SC">Subcutaneous (SC)</option>
                  <option value="INHALATION">Inhalation</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Frequency</label>
                <select 
                  value={medFreq} onChange={(e) => setMedFreq(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="OD">Once daily (OD)</option>
                  <option value="BD">Twice daily (BD)</option>
                  <option value="TDS">Three times daily (TDS)</option>
                  <option value="QID">Four times daily (QID)</option>
                  <option value="HS">At Bedtime (HS)</option>
                  <option value="SOS">As Needed (SOS)</option>
                  <option value="STAT">Immediately (STAT)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Duration</label>
                <input 
                  type="text" value={medDuration} onChange={(e) => setMedDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Timing</label>
                <input 
                  type="text" value={medTiming} onChange={(e) => setMedTiming(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 outline-none font-bold"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleAddMed}
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="h-4 w-4" /> Add Med Order
                </button>
              </div>
            </div>

            {/* Active Prescription items */}
            <div className="space-y-2 mt-4 text-xs font-semibold">
              <h4 className="text-slate-450 uppercase tracking-wider text-[10px]">Active Orders</h4>
              {encounter.medications?.map(m => (
                <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-white">{m.drug_name} {m.strength}</span>
                    <span className="text-slate-400 ml-2 font-semibold">({m.route} • {m.frequency} for {m.duration} • {m.timing})</span>
                  </div>
                  <button 
                    onClick={() => removeMedication(encounter.id, m.id)}
                    className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 6: Medication Administration Record (MAR) */}
        {activeSubDoc === 'MAR' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Nurse Medication Administration Record (MAR)</h3>
            
            <div className="space-y-3 text-xs font-semibold">
              {marRecords.map(rec => (
                <div key={rec.id} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{rec.time} Scheduled Dose</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">{rec.drug}</span>
                    <span className="text-[10px] text-slate-450 block">Route: {rec.route} | Executor: {rec.administrator}</span>
                  </div>
                  
                  {rec.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleAdministerMed(rec.id, 'Sister Varsha')}
                      className="px-3 py-1.5 bg-purple-650 hover:bg-purple-750 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Verify & Administer
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg font-bold flex items-center gap-1 text-[10px] uppercase">
                      ✓ Given (Verified)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 7: Investigation Order & Result Sheets */}
        {activeSubDoc === 'INVESTIGATIONS' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Investigation Orders & Diagnostic Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">Test Name</label>
                <select 
                  value={invName} onChange={(e) => setInvName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="CBC">CBC (Complete Blood Count)</option>
                  <option value="LFT">LFT (Liver Function Test)</option>
                  <option value="RFT">RFT (Renal Function Test)</option>
                  <option value="Serum Electrolytes">Serum Electrolytes (Na, K, Ca)</option>
                  <option value="Chest X-Ray">Chest X-Ray (AP/Lateral)</option>
                  <option value="CT Brain">CT Brain (Plain)</option>
                  <option value="USG Abdomen">USG Abdomen & Pelvis</option>
                  <option value="Cross Match">Blood Group & Cross Match</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select 
                  value={invCategory} onChange={(e) => setInvCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="LABORATORY">Laboratory (Pathology)</option>
                  <option value="RADIOLOGY">Radiology (Imaging)</option>
                  <option value="CARDIOLOGY">Cardiology (ECG/Echo)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Priority</label>
                <select 
                  value={invPriority} onChange={(e) => setInvPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-lg p-2 font-bold outline-none"
                >
                  <option value="STAT">STAT / Critical</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Routine</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleAddInv}
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Place Diagnostic Order
                </button>
              </div>
            </div>

            {/* Active investigation reports & results */}
            <div className="space-y-4 mt-6 text-xs font-semibold">
              <h4 className="text-slate-450 uppercase tracking-wider text-[10px]">Active Orders & Results</h4>
              {encounter.investigations?.map(inv => (
                <div key={inv.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-sm text-slate-800 dark:text-white">{inv.test_name}</span>
                      <span className="text-slate-400 ml-2">({inv.category} • Priority: {inv.priority})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      inv.status === 'RESULT_AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                    }`}>
                      {inv.status === 'RESULT_AVAILABLE' ? 'Result Available' : 'Ordered'}
                    </span>
                  </div>

                  {inv.status === 'RESULT_AVAILABLE' ? (
                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-lg grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Extracted Value</span>
                        <span className={`font-extrabold text-sm ${inv.is_critical_result ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-slate-200'}`}>
                          {inv.result_value} {inv.result_unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Reference Range</span>
                        <span className="text-slate-600 dark:text-slate-350">{inv.reference_range}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        {inv.is_critical_result && (
                          <span className="px-2 py-0.5 bg-red-500 text-white rounded font-black text-[9px] uppercase animate-pulse">
                            🚨 CRITICAL VALUE ALERT
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePostMockResult(inv.id, '13.8', '12.0 - 15.0', 'g/dL')}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold"
                      >
                        Mock Normal Result (Hb 13.8)
                      </button>
                      <button 
                        onClick={() => handlePostMockResult(inv.id, '5.2 (CRITICAL LOW)', '12.0 - 15.0', 'g/dL')}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[10px] font-bold"
                      >
                        Mock Critical Result (Hb 5.2)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 8: Vitals Chart */}
        {activeSubDoc === 'VITALS_CHART' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Patient Vitals Chart & Trend Log</h3>
              <span className="px-2.5 py-0.5 rounded bg-green-500/10 text-green-500 font-extrabold text-[10px]">NATURAL SPEECH PARSER ACTIVE</span>
            </div>

            {/* Speech vitals parser */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-white">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">🗣️ Vitals Voice Input Dictation box</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={voiceVitalsText} 
                  onChange={(e) => setVoiceVitalsText(e.target.value)}
                  placeholder='Speak or type: "Temperature is 101.4, blood pressure 130 over 85, heart rate 92."'
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none font-bold"
                />
                <button 
                  onClick={handleParseVitalsSpeech}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                >
                  Parse Vitals
                </button>
              </div>
            </div>

            {/* Manual vitals logger */}
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">Temp (°F)</label>
                <input type="text" value={newVitalTemp} onChange={e => setNewVitalTemp(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold text-center" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">HR (bpm)</label>
                <input type="text" value={newVitalHR} onChange={e => setNewVitalHR(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold text-center" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">BP (mmHg)</label>
                <input type="text" value={newVitalBP} onChange={e => setNewVitalBP(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold text-center" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">SpO2 (%)</label>
                <input type="text" value={newVitalSpO2} onChange={e => setNewVitalSpO2(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold text-center" />
              </div>
              <div className="flex items-end">
                <button onClick={handleManualAddVitals} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold">Log Vitals</button>
              </div>
            </div>

            {/* Vitals Trend logs */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs font-semibold">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Time Stamp</th>
                    <th className="p-3">Temp</th>
                    <th className="p-3">Pulse / Heart Rate</th>
                    <th className="p-3">BP</th>
                    <th className="p-3">SpO2</th>
                    <th className="p-3">RR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {vitalsHistory.map((v, i) => (
                    <tr key={i}>
                      <td className="p-3 text-slate-450 font-bold">{v.time}</td>
                      <td className="p-3">{v.temp} °F</td>
                      <td className="p-3">{v.hr} bpm</td>
                      <td className="p-3 font-mono">{v.bp}</td>
                      <td className="p-3 font-extrabold text-blue-600">{v.spo2}%</td>
                      <td className="p-3">{v.rr || '16'} bpm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Module 9: Nursing Treatment & IV Fluid Charts */}
        {activeSubDoc === 'NURSING_IV_FLUIDS' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Nursing Treatment & IV Fluid Infusion Sheet</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Blood Sugar Sliding Scale */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-indigo-500 uppercase tracking-wider">Insulin Sliding Scale & RBS Logs</h4>
                <div className="flex gap-2">
                  <input 
                    type="number" value={newRBS} onChange={e => setNewRBS(e.target.value)} 
                    placeholder="Enter Random Blood Sugar (mg/dL)"
                    className="flex-1 bg-slate-50 border p-2 rounded-lg text-xs font-bold outline-none"
                  />
                  <button onClick={handleAddRbs} className="px-3 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs">Record RBS</button>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  {bloodSugars.map((bs, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-850 border rounded-lg flex justify-between">
                      <span>{bs.time} - RBS: <strong>{bs.rbs} mg/dL</strong></span>
                      <span className="text-purple-650 font-extrabold">{bs.insulinDose}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nebulizer tracking */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-indigo-500 uppercase tracking-wider">Nebulizer Log</h4>
                <div className="space-y-2 text-xs font-semibold">
                  {nebsLog.map((neb, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-850 border rounded-lg flex justify-between">
                      <span>{neb.time} - {neb.medicine}</span>
                      <span className="text-green-500 font-extrabold">{neb.state} ({neb.nurse})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* IV Fluids Log */}
            <div className="space-y-3 border-t pt-4 mt-4">
              <h4 className="font-extrabold text-xs text-indigo-500 uppercase tracking-wider">IV Fluids Fluid Administration Log</h4>
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                <input type="text" value={newFluidName} onChange={e=>setNewFluidName(e.target.value)} className="bg-slate-50 border p-2 rounded-lg font-bold" />
                <input type="text" value={newFluidRate} onChange={e=>setNewFluidRate(e.target.value)} className="bg-slate-50 border p-2 rounded-lg font-bold" />
                <input type="number" value={newFluidVolume} onChange={e=>setNewFluidVolume(e.target.value)} className="bg-slate-50 border p-2 rounded-lg font-bold" />
                <button onClick={handleAddIvFluid} className="bg-indigo-600 text-white rounded-lg font-bold">Record Fluid</button>
              </div>

              <div className="border rounded-xl overflow-hidden text-xs font-semibold">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Fluid Name</th>
                      <th className="p-3">Infusion Rate</th>
                      <th className="p-3">Volume Given</th>
                      <th className="p-3">Cumulative Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ivFluids.map((fluid, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3">{fluid.time}</td>
                        <td className="p-3">{fluid.fluidName}</td>
                        <td className="p-3">{fluid.rate}</td>
                        <td className="p-3">{fluid.volumeGiven} ml</td>
                        <td className="p-3 font-extrabold text-indigo-650">{fluid.cumulative} ml</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Module 10: Intake/Output Chart */}
        {activeSubDoc === 'INTAKE_OUTPUT' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Hourly Intake & Output Chart</h3>
            
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs font-semibold">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-850 border-b text-slate-400">
                    <tr>
                      <th className="p-3" rowSpan={2}>Hour</th>
                      <th className="p-3 text-center border-b" colSpan={2}>Intake (ml)</th>
                      <th className="p-3 text-center border-b" colSpan={2}>Output (ml)</th>
                      <th className="p-3 text-center" rowSpan={2}>Net Balance</th>
                    </tr>
                    <tr>
                      <th className="p-2 border-r text-center">IV Fluid</th>
                      <th className="p-2 border-r text-center">Oral / Ryle's</th>
                      <th className="p-2 border-r text-center">Urine</th>
                      <th className="p-2 border-r text-center">NG / Drain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-center">
                    {ioChart.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 text-left">{row.hour}</td>
                        <td className="p-3 border-r">{row.intakeIv} ml</td>
                        <td className="p-3 border-r">{row.intakeOral} ml</td>
                        <td className="p-3 border-r">{row.outputUrine} ml</td>
                        <td className="p-3 border-r">{row.outputNg} ml</td>
                        <td className="p-3 font-extrabold text-indigo-750">
                          {row.intakeIv + row.intakeOral - (row.outputUrine + row.outputNg)} ml
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Automatic daily totals */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border flex justify-between items-center text-xs font-extrabold">
                <span>Shift Totals Summary:</span>
                <div className="space-x-6 text-slate-700 dark:text-slate-300">
                  <span>Total Intake: <strong className="text-green-500">{ioChart.reduce((acc, r)=> acc + r.intakeIv + r.intakeOral, 0)} ml</strong></span>
                  <span>Total Output: <strong className="text-red-500">{ioChart.reduce((acc, r)=> acc + r.outputUrine + r.outputNg, 0)} ml</strong></span>
                  <span>Cumulative Balance: <strong className="text-indigo-650">{ioChart.reduce((acc, r)=> acc + r.intakeIv + r.intakeOral - (r.outputUrine + r.outputNg), 0)} ml</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 11: Procedure Sheet */}
        {activeSubDoc === 'PROCEDURE_LOGS' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Procedure Documentation logs</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">Procedure Name</label>
                <select 
                  value={newProcName} onChange={e => setNewProcName(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg font-bold outline-none"
                >
                  <option value="Foley Catheterization">Foley Catheterization</option>
                  <option value="NG Tube Insertion">NG Tube Insertion</option>
                  <option value="Wound Care / Dressing">Wound Care / Dressing</option>
                  <option value="Blood Transfusion">Blood Transfusion (Consent Required)</option>
                  <option value="Central Line Insertion">Central Line Insertion</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Operator Name</label>
                <input type="text" value={newProcOperator} onChange={e=>setNewProcOperator(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Complication check</label>
                <select value={procComplication} onChange={e=>setProcComplication(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold">
                  <option value="None">None</option>
                  <option value="Minor Bleeding">Minor Bleeding</option>
                  <option value="Infection Risk">Infection Risk</option>
                  <option value="Spasm / Discomfort">Spasm / Discomfort</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleAddProcedureLog} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold">Log Execution</button>
              </div>
            </div>

            {/* Log list */}
            <div className="space-y-2 mt-4 text-xs font-semibold">
              <h4 className="text-slate-450 uppercase tracking-wider text-[10px]">Procedure Execution History</h4>
              {procedureLogs.map((p, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 border rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-850 dark:text-slate-200">{p.procedureName}</span>
                    <span className="text-slate-400 ml-2">({p.insertedAt} • Operator: {p.operator} • Complications: {p.complication})</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[9px] uppercase font-bold">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 12: Specialist Consultation Sheet */}
        {activeSubDoc === 'CONSULTATION_REFERRAL' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Specialist Referrals & Consultations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">Referral Department</label>
                <select 
                  value={refSpecialty} onChange={e=>setRefSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-lg font-bold"
                >
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-slate-400 block mb-1">Clinical Question / Advice requested</label>
                  <input type="text" value={refQuestion} onChange={e=>setRefQuestion(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold outline-none" />
                </div>
                <button onClick={handleAddRef} className="py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shrink-0 cursor-pointer">Submit Consult</button>
              </div>
            </div>

            <div className="space-y-3 mt-6 text-xs font-semibold">
              {referralOrders.map((ref, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-extrabold text-indigo-650">{ref.specialty} Consultation Request</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      ref.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>{ref.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Advice Requested</span>
                      <span>{ref.question}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Specialist Response ({ref.responder})</span>
                      <span className="text-slate-700 dark:text-slate-350">{ref.response}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 13: Continuation / Progress Feed */}
        {activeSubDoc === 'PROGRESS_NOTES' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Continuation Sheet & Progress Feed</h3>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-black uppercase text-[10px]">EHR Secure Append-Only</span>
            </div>

            <div className="flex gap-3">
              <input 
                type="text" value={newProgressNote} onChange={e=>setNewProgressNote(e.target.value)}
                placeholder="Type progress note: e.g. Abdominal pain resolved. Soft on examination."
                className="flex-1 bg-slate-50 border p-2.5 rounded-lg text-xs font-bold outline-none"
              />
              <button onClick={handleAddProgressNote} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Append Note</button>
            </div>

            <div className="space-y-3 mt-4 text-xs font-semibold">
              {progressNotes.map((note, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <span className="text-slate-450 block text-[9px] uppercase font-bold">{note.time} • Author: {note.author}</span>
                    <p className="text-slate-850 dark:text-slate-200 mt-1">{note.text}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-bold">✓ Saved</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 14: Reassessment & Observation Charts */}
        {activeSubDoc === 'REASSESSMENT' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Observation Bay Timer & Reassessment Sheet</h3>
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-black uppercase text-[10px]">Observation Desk</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Time Remaining for Reassessment</span>
                <span className="text-2xl font-black text-yellow-500">{formatTimer(obsTimerValue)}</span>
                <span className="text-[9px] text-slate-400">Countdown resets hourly</span>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold text-slate-400 block">Current Patient Bay Status</label>
                <input 
                  type="text" value={obsStatus} onChange={e=>setObsStatus(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs font-bold outline-none"
                />
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setObsTimerValue(3600); setObsStatus('Patient stable. Observation time extended.'); }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                  >
                    Extend Timer (+1 Hr)
                  </button>
                  <button 
                    onClick={() => { setObsTimerValue(0); setObsStatus('REASSESSMENT DUE: Please examine vitals and log progress.'); }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold"
                  >
                    Force Reassessment Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 15: Resuscitation Record */}
        {activeSubDoc === 'RESUSCITATION' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-650 animate-pulse" /> Resuscitation Record (Cardiac Arrest Log)
              </h3>
              <button 
                onClick={handleToggleResus}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                  isResusActive ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-950 text-white'
                }`}
              >
                {isResusActive ? 'Stop Resus Log' : 'Start Resus Session'}
              </button>
            </div>

            {isResusActive && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-xl text-center text-white">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Resuscitation Duration</span>
                  <span className="text-3xl font-black text-red-500 font-mono">
                    {String(Math.floor(resusTime / 60)).padStart(2, '0')}:{String(resusTime % 60).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold justify-center">
                  <button onClick={() => handleAddResusEvent('CPR cycle initiated (2 minutes)')} className="px-3 py-2 bg-indigo-650 text-white rounded-lg">Start CPR Cycle</button>
                  <button onClick={() => handleAddResusEvent('Epinephrine 1mg IV administered')} className="px-3 py-2 bg-purple-650 text-white rounded-lg">Give Epinephrine 1mg</button>
                  <button onClick={() => handleAddResusEvent('Amiodarone 300mg IV administered')} className="px-3 py-2 bg-purple-650 text-white rounded-lg">Give Amiodarone 300mg</button>
                  <button onClick={() => handleAddResusEvent('Defibrillation shock 200J delivered')} className="px-3 py-2 bg-red-600 text-white rounded-lg">Deliver Shock 200J</button>
                  <button onClick={() => handleAddResusEvent('ROSC (Return of Spontaneous Circulation) achieved. Blood pressure 98/60, pulse 110.')} className="px-3 py-2 bg-emerald-600 text-white rounded-lg">ROSC Achieved</button>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs font-semibold">
              <h4 className="text-slate-450 uppercase tracking-wider text-[10px]">Cardiac Arrest log timeline</h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-850 h-48 overflow-y-auto space-y-2 font-mono">
                {resusLog.map((log, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-red-500 font-extrabold">[{log.time}]</span>
                    <span>{log.event}</span>
                  </div>
                ))}
                {resusLog.length === 0 && <span className="text-slate-400 italic">No active resuscitation recorded.</span>}
              </div>
            </div>
          </div>
        )}

        {/* Module 16: Admission, Handover, ICU/OT Transfer Sheets */}
        {activeSubDoc === 'TRANSFERS' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Ward Admissions & Transfers Workspace</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-3">
                <h4 className="text-indigo-500 uppercase tracking-wider text-[10px]">Bed Request & Allocation Form</h4>
                <div>
                  <label className="text-slate-400 block mb-1">Target Ward / Unit</label>
                  <select 
                    value={selectedWard} onChange={e=>setSelectedWard(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-lg font-bold outline-none"
                  >
                    <option value="GENERAL_MALE">General Male Ward</option>
                    <option value="GENERAL_FEMALE">General Female Ward</option>
                    <option value="ICU">Intensive Care Unit (ICU)</option>
                    <option value="HDU">High Dependency Unit (HDU)</option>
                    <option value="SURGICAL">Surgical Ward</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={isolationRequired} onChange={e=>setIsolationRequired(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                  <span>Isolation protocol required</span>
                </div>
                <button onClick={handleBedAssignment} className="px-4 py-2 bg-indigo-650 text-white font-bold rounded-lg">Check & Assign Bed</button>
                {bedSelection && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-200 rounded-lg">
                    allocated bed: <strong>{bedSelection}</strong>
                  </div>
                )}
              </div>

              {/* Handover checklist */}
              <div className="space-y-2 border-l pl-4">
                <h4 className="text-indigo-500 uppercase tracking-wider text-[10px]">Bedside nurse shift handover report</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Encounter dossier compiled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Pre-transfer vitals logged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>IV lines and dressings checked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Emergency medications administered & logged in MAR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 17: Discharge Summary & Referral/Transfer Documentation */}
        {activeSubDoc === 'DISCHARGE_SUMMARY' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Discharge Summary & Referral Document</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-1">Patient Name</span>
                  <span className="font-extrabold block">{patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Admission Date</span>
                  <span>{new Date(registration.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Diagnoses / Summary of Case</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border">
                  {encounter.diagnoses?.map((d, i) => (
                    <div key={i}>• {d.diagnosis} ({d.type})</div>
                  ))}
                  {encounter.diagnoses?.length === 0 && <span className="text-slate-400 italic">No diagnoses logged.</span>}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Discharge Medications Advice</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border space-y-1">
                  {encounter.medications?.map((m, i) => (
                    <div key={i}>• {m.drug_name} {m.strength} - {m.dose} {m.frequency} for {m.duration}</div>
                  ))}
                  {encounter.medications?.length === 0 && <span className="text-slate-400 italic">No active prescription.</span>}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Discharge Vitals Status</span>
                <div className="p-2.5 bg-emerald-500/5 text-emerald-700 border border-emerald-250 rounded-lg">
                  ✓ Pulse: 78 bpm | BP: 118/76 mmHg | Temp: 98.4 °F | SpO2: 99% - Clinically stable for discharge.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 18: Medico-Legal Case (MLC) Documentation */}
        {activeSubDoc === 'MLC_LOGS' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Medico-Legal Case (MLC) Registry Log</h3>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={isMLC} onChange={e=>setIsMLC(e.target.checked)} className="h-4 w-4 rounded" />
                <span className="text-xs font-bold text-slate-500">Flag as MLC</span>
              </div>
            </div>

            {isMLC ? (
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="text-slate-400 block mb-1">MLC Number</label>
                  <input type="text" value={mlcNumber} onChange={e=>setMlcNumber(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Type of Accident / Injury</label>
                  <input type="text" value={mlcType} onChange={e=>setMlcType(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Police Station Notified</label>
                  <input type="text" value={policeStation} onChange={e=>setPoliceStation(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Officer Name & Badge ID</label>
                  <input type="text" value={policeOfficer} onChange={e=>setPoliceOfficer(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Custody Status</label>
                  <select value={policeCustody} onChange={e=>setPoliceCustody(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg font-bold">
                    <option value="No">No - Released on bail</option>
                    <option value="Under Police Escort">Under Police Escort</option>
                    <option value="Awaiting Magistrate Arrival">Awaiting Magistrate Arrival</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 text-xs italic font-semibold">
                This encounter has not been flagged as Medico-Legal. Check "Flag as MLC" to activate police logs.
              </div>
            )}
          </div>
        )}

        {/* Module 19: Consent Documents */}
        {activeSubDoc === 'CONSENTS' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Patient Consent Checklist</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm block">Consent for Surgical Washout / Debridement</span>
                  <span className="text-[10px] text-slate-450 block">Requires signatures of patient/relative and witnessing nurse.</span>
                </div>
                <input type="checkbox" checked={surgeryConsent} onChange={e=>setSurgeryConsent(e.target.checked)} className="h-5 w-5 rounded text-indigo-600" />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm block">Consent for Blood Transfusion</span>
                  <span className="text-[10px] text-slate-450 block">Acknowledges risks of allergic transfusion reactions.</span>
                </div>
                <input type="checkbox" checked={bloodConsent} onChange={e=>setBloodConsent(e.target.checked)} className="h-5 w-5 rounded text-indigo-600" />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm block">Consent for NG Tube Insertion & Procedures</span>
                  <span className="text-[10px] text-slate-450 block">Standard clinical procedure authorization form.</span>
                </div>
                <input type="checkbox" checked={procedureConsent} onChange={e=>setProcedureConsent(e.target.checked)} className="h-5 w-5 rounded text-indigo-600" />
              </div>
            </div>
          </div>
        )}

        {/* Module 21: Printable Hospital Formats */}
        {activeSubDoc === 'PRINTABLE_FORMATS' && (
          <div className="space-y-6 max-w-4xl bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm text-slate-900 font-serif">
            <div className="flex justify-between items-center border-b pb-4 mb-4 font-sans">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-650 text-white rounded-full flex items-center justify-center font-bold text-lg">M</div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase">MUNICIPAL CORPORATION OF GREATER MUMBAI</h4>
                  <p className="text-[10px] text-slate-500 font-bold">K.E.M. DIGITAL HOSPITAL & TRAUMA CENTER</p>
                </div>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-850 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer font-sans"
              >
                <Printer className="h-4 w-4" /> Print Document (A4)
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <h2 className="text-center text-lg font-black underline uppercase">CASUALTY CASE SHEET & TREATMENT LOG</h2>
              
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <strong>PATIENT NAME:</strong> {patient.name}<br/>
                  <strong>UHID:</strong> {patient.uhid || 'UHID-984210'}<br/>
                  <strong>GENDER/AGE:</strong> {patient.gender} / {patient.age}<br/>
                  <strong>BLOOD GROUP:</strong> {patient.blood_group}
                </div>
                <div>
                  <strong>ENCOUNTER NO:</strong> {encounter.encounter_no}<br/>
                  <strong>ADMISSION TIME:</strong> {new Date(registration.created_at).toLocaleString()}<br/>
                  <strong>CONSULTANT:</strong> {encounter.consulting_doctor_name}<br/>
                  <strong>DEPT:</strong> Emergency Medicine
                </div>
              </div>

              <div>
                <h3 className="font-bold underline uppercase">I. CLINICAL ASSESSMENT</h3>
                <p className="mt-1">
                  <strong>CHIEF COMPLAINT:</strong> {encounter.chief_complaint || 'Chest pain and breathlessness'}<br/>
                  <strong>SOAP DRAFT NOTES:</strong><br/>
                  {encounter.subjective || 'Scribed from voice translation.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold underline uppercase">II. TREATMENT ORDERED & ADMINISTERED</h3>
                <div className="mt-2 space-y-1">
                  {encounter.medications?.map((m, idx) => (
                    <div key={idx}>
                      • Rx: <strong>{m.drug_name} {m.strength}</strong> - Dose: {m.dose} Route: {m.route} Frequency: {m.frequency} Duration: {m.duration}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10 flex justify-between font-sans text-xs">
                <div className="text-center">
                  <div className="w-40 border-b border-black h-10"></div>
                  <p className="mt-1">Dr. Amit Sharma, MBBS MD<br/>Reg No. 84931-A</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-black h-10"></div>
                  <p className="mt-1">Sister Varsha, Nurse In-Charge<br/>Reg No. 94821</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module 22: Final Casualty Review Checklist */}
        {activeSubDoc === 'FINAL_CHECKLIST' && (
          <div className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white border-b pb-3">Final Casualty Review Checklist (Disposition Gate)</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <p className="text-slate-500">All checklist gates must be reviewed and checked before the patient can be discharged or transferred.</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border">
                  <span>1. Vitals Stable for last 2 hours</span>
                  <input 
                    type="checkbox" checked={reviewChecklist.vitalsStable} 
                    onChange={e=>setReviewChecklist(prev=>({...prev, vitalsStable: e.target.checked}))}
                    className="h-5 w-5 rounded text-indigo-650"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border">
                  <span>2. Medico-legal Case cleared by Police</span>
                  <input 
                    type="checkbox" checked={reviewChecklist.mlcCleared} 
                    onChange={e=>setReviewChecklist(prev=>({...prev, mlcCleared: e.target.checked}))}
                    className="h-5 w-5 rounded text-indigo-650"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border">
                  <span>3. Consents signed for procedures</span>
                  <input 
                    type="checkbox" checked={reviewChecklist.consentSigned} 
                    onChange={e=>setReviewChecklist(prev=>({...prev, consentSigned: e.target.checked}))}
                    className="h-5 w-5 rounded text-indigo-650"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border">
                  <span>4. Discharge Medications explained to patient</span>
                  <input 
                    type="checkbox" checked={reviewChecklist.dischargeMedsExplained} 
                    onChange={e=>setReviewChecklist(prev=>({...prev, dischargeMedsExplained: e.target.checked}))}
                    className="h-5 w-5 rounded text-indigo-650"
                  />
                </div>
              </div>

              {reviewChecklist.vitalsStable && reviewChecklist.consentSigned ? (
                <div className="p-4 bg-emerald-500/10 text-emerald-700 border border-emerald-250 rounded-xl text-center">
                  🚀 DISPOSITION GATE READY: All major safety criteria met. Ready for final approval and dispatch!
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 text-red-500 border border-red-200 rounded-xl text-center">
                  ⚠️ DISPOSITION GATE LOCKED: Please verify vitals stability and sign necessary procedure consents.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
