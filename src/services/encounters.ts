// ============================================================
// MCGM Encounter Service — CRUD + Cross-Module Routing
// Follows patients.ts pattern (demo mode + Supabase)
// ============================================================

import type {
  ClinicalEncounter, MedicationOrder, InvestigationOrder, ProcedureOrder,
  DiagnosisEntry, NursingInstruction, DietOrder, ReferralOrder, FollowUpOrder,
  AdmissionRequest, ClinicalTimelineEvent, WardBed, EncounterStatus,
} from '../types/clinical';
import type { EmergencyRegistration, Patient } from '../types/emergency';

// ============================================================
// IN-MEMORY STORES (demo mode)
// ============================================================
const ENCOUNTERS: ClinicalEncounter[] = [];
const TIMELINE_EVENTS: ClinicalTimelineEvent[] = [];
const WARD_BEDS: WardBed[] = generateDemoWardBeds();

function generateDemoWardBeds(): WardBed[] {
  const beds: WardBed[] = [];
  const wards = [
    { name: 'General Male Ward', type: 'GENERAL_MALE' as const, beds: 20, occupied: 14 },
    { name: 'General Female Ward', type: 'GENERAL_FEMALE' as const, beds: 20, occupied: 16 },
    { name: 'Surgical Ward', type: 'SURGICAL' as const, beds: 16, occupied: 11 },
    { name: 'Pediatric Ward', type: 'PEDIATRIC' as const, beds: 12, occupied: 7 },
    { name: 'Maternity Ward', type: 'MATERNITY' as const, beds: 10, occupied: 6 },
    { name: 'ICU', type: 'ICU' as const, beds: 24, occupied: 19 },
    { name: 'HDU', type: 'HDU' as const, beds: 8, occupied: 5 },
    { name: 'CCU', type: 'CCU' as const, beds: 6, occupied: 4 },
    { name: 'NICU', type: 'NICU' as const, beds: 8, occupied: 5 },
    { name: 'PICU', type: 'PICU' as const, beds: 6, occupied: 3 },
    { name: 'Isolation Ward', type: 'ISOLATION' as const, beds: 6, occupied: 2 },
    { name: 'Emergency Observation', type: 'EMERGENCY_OBS' as const, beds: 10, occupied: 7 },
  ];
  for (const w of wards) {
    for (let i = 1; i <= w.beds; i++) {
      const statuses: Array<WardBed['status']> = i <= w.occupied ? ['OCCUPIED'] : ['AVAILABLE', 'AVAILABLE', 'CLEANING', 'RESERVED'];
      beds.push({
        id: `BED-${w.type}-${i}`,
        ward_name: w.name,
        ward_type: w.type,
        bed_number: `${w.name.substring(0, 3).toUpperCase()}-${String(i).padStart(2, '0')}`,
        status: i <= w.occupied ? 'OCCUPIED' : statuses[Math.floor(Math.random() * statuses.length)],
        patient_name: i <= w.occupied ? `Patient ${w.type}-${i}` : undefined,
      });
    }
  }
  return beds;
}

// ============================================================
// ENCOUNTER CRUD
// ============================================================

export function createEncounter(
  registration: EmergencyRegistration,
  doctorName: string,
  department: string,
): ClinicalEncounter {
  const id = `ENC-${Date.now()}`;
  const totalGCS = registration.triage 
    ? (Number(registration.triage.gcs_eye || 4) + Number(registration.triage.gcs_verbal || 5) + Number(registration.triage.gcs_motor || 6)) 
    : 15;
  const encounter: ClinicalEncounter = {
    id,
    patient_id: registration.patient_id,
    registration_id: registration.id,
    hospital_id: registration.hospital_id,
    encounter_no: `ENC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    encounter_type: 'EMERGENCY',
    status: 'ACTIVE',
    consulting_doctor_name: doctorName,
    department,
    chief_complaint: registration.chief_complaint,
    subjective: registration.chief_complaint ? `Patient presented with chief complaint of: ${registration.chief_complaint}.` : '',
    objective: registration.latest_vitals 
      ? `Vitals recorded at intake:\n- Temperature: ${registration.latest_vitals.temperature || '98.6'} °F\n- Pulse / HR: ${registration.latest_vitals.heart_rate || '80'} bpm\n- Blood Pressure: ${registration.latest_vitals.systolic_bp && registration.latest_vitals.diastolic_bp ? `${registration.latest_vitals.systolic_bp}/${registration.latest_vitals.diastolic_bp}` : '120/80'} mmHg\n- SpO2: ${registration.latest_vitals.spo2 || '98'}%\n- Respiratory Rate: ${registration.latest_vitals.respiratory_rate || '18'} bpm\n- Consciousness / GCS: ${registration.triage?.gcs_verbal ? `Conscious (GCS ${totalGCS})` : 'Alert & Oriented'}`
      : 'Vitals pending formal nurse triage.',
    raw_transcript: registration.chief_complaint ? `Scribed at intake: ${registration.chief_complaint}` : '',
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    patient: registration.patient,
    vitals: registration.latest_vitals,
    triage: registration.triage,
    diagnoses: [],
    medications: [],
    investigations: [],
    procedures: [],
    nursing_orders: [],
    referrals: [],
    follow_ups: [],
    timeline: [],
  };
  ENCOUNTERS.push(encounter);
  addTimelineEvent(encounter.id, registration.patient_id, 'ENCOUNTER_STARTED', 'Doctor Consultation Started', `${doctorName} began clinical encounter`, '🩺', '#0A5BFF');
  return encounter;
}

export function getEncounter(encounterId: string): ClinicalEncounter | undefined {
  return ENCOUNTERS.find(e => e.id === encounterId);
}

export function getEncounterByPatient(patientId: string): ClinicalEncounter | undefined {
  return ENCOUNTERS.find(e => e.patient_id === patientId && (e.status === 'ACTIVE' || e.status === 'SCRIBING' || e.status === 'REVIEW'));
}

export function updateEncounterStatus(encounterId: string, status: EncounterStatus): void {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (enc) {
    enc.status = status;
    enc.updated_at = new Date().toISOString();
    if (status === 'APPROVED') enc.approved_at = new Date().toISOString();
    if (status === 'COMPLETED') enc.completed_at = new Date().toISOString();
  }
}

export function updateEncounterClinicalNotes(encounterId: string, updates: Partial<ClinicalEncounter>): void {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (enc) {
    Object.assign(enc, updates, { updated_at: new Date().toISOString() });
  }
}

// ============================================================
// ORDER MANAGEMENT
// ============================================================

export function addMedication(encounterId: string, med: Omit<MedicationOrder, 'id' | 'encounter_id' | 'created_at'>): MedicationOrder {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  const order: MedicationOrder = { ...med, id: `MED-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, encounter_id: encounterId, created_at: new Date().toISOString() };
  if (enc) {
    if (!enc.medications) enc.medications = [];
    enc.medications.push(order);
    addTimelineEvent(encounterId, med.patient_id, 'MEDICATION_ORDERED', `${med.drug_name} ordered`, `${med.dose || ''} ${med.route || ''} ${med.frequency || ''}`.trim(), '💊', '#7C3AED');
  }
  return order;
}

export function addInvestigation(encounterId: string, inv: Omit<InvestigationOrder, 'id' | 'encounter_id' | 'created_at'>): InvestigationOrder {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  const order: InvestigationOrder = { ...inv, id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, encounter_id: encounterId, created_at: new Date().toISOString() };
  if (enc) {
    if (!enc.investigations) enc.investigations = [];
    enc.investigations.push(order);
    addTimelineEvent(encounterId, inv.patient_id, 'INVESTIGATION_ORDERED', `${inv.test_name} ordered`, `Category: ${inv.category} | Priority: ${inv.priority}`, '🔬', '#059669');
  }
  return order;
}

export function addProcedure(encounterId: string, proc: Omit<ProcedureOrder, 'id' | 'encounter_id' | 'created_at'>): ProcedureOrder {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  const order: ProcedureOrder = { ...proc, id: `PROC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, encounter_id: encounterId, created_at: new Date().toISOString() };
  if (enc) {
    if (!enc.procedures) enc.procedures = [];
    enc.procedures.push(order);
    addTimelineEvent(encounterId, proc.patient_id, 'PROCEDURE_ORDERED', `${proc.procedure_name} ordered`, proc.details || '', '⚕️', '#DC2626');
  }
  return order;
}

export function addDiagnosis(encounterId: string, dx: Omit<DiagnosisEntry, 'id' | 'encounter_id' | 'created_at'>): DiagnosisEntry {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  const entry: DiagnosisEntry = { ...dx, id: `DX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, encounter_id: encounterId, created_at: new Date().toISOString() };
  if (enc) {
    if (!enc.diagnoses) enc.diagnoses = [];
    enc.diagnoses.push(entry);
  }
  return entry;
}

export function addNursingOrder(encounterId: string, order: Omit<NursingInstruction, 'id' | 'encounter_id' | 'created_at'>): NursingInstruction {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  const inst: NursingInstruction = { ...order, id: `NRS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, encounter_id: encounterId, created_at: new Date().toISOString() };
  if (enc) {
    if (!enc.nursing_orders) enc.nursing_orders = [];
    enc.nursing_orders.push(inst);
  }
  return inst;
}

export function addReferral(encounterId: string, ref: Omit<ReferralOrder, 'id' | 'encounter_id' | 'created_at'>): ReferralOrder {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  const order: ReferralOrder = { ...ref, id: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, encounter_id: encounterId, created_at: new Date().toISOString() };
  if (enc) {
    if (!enc.referrals) enc.referrals = [];
    enc.referrals.push(order);
  }
  return order;
}

export function addFollowUp(encounterId: string, fu: Omit<FollowUpOrder, 'id' | 'encounter_id' | 'created_at'>): FollowUpOrder {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  const order: FollowUpOrder = { ...fu, id: `FU-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, encounter_id: encounterId, created_at: new Date().toISOString() };
  if (enc) {
    if (!enc.follow_ups) enc.follow_ups = [];
    enc.follow_ups.push(order);
  }
  return order;
}

// Remove helpers
export function removeMedication(encounterId: string, medId: string): void {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (enc?.medications) enc.medications = enc.medications.filter(m => m.id !== medId);
}

export function removeInvestigation(encounterId: string, invId: string): void {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (enc?.investigations) enc.investigations = enc.investigations.filter(i => i.id !== invId);
}

export function removeProcedure(encounterId: string, procId: string): void {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (enc?.procedures) enc.procedures = enc.procedures.filter(p => p.id !== procId);
}

export function removeNursingOrder(encounterId: string, orderId: string): void {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (enc?.nursing_orders) enc.nursing_orders = enc.nursing_orders.filter(n => n.id !== orderId);
}

// ============================================================
// TIMELINE
// ============================================================

function addTimelineEvent(encounterId: string, patientId: string, eventType: string, title: string, description: string, icon: string, color: string): void {
  const evt: ClinicalTimelineEvent = {
    id: `TL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    patient_id: patientId,
    encounter_id: encounterId,
    event_type: eventType,
    title,
    description,
    occurred_at: new Date().toISOString(),
    icon,
    color,
  };
  TIMELINE_EVENTS.push(evt);
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (enc) {
    if (!enc.timeline) enc.timeline = [];
    enc.timeline.push(evt);
  }
}

export function getTimeline(encounterId: string): ClinicalTimelineEvent[] {
  return TIMELINE_EVENTS.filter(e => e.encounter_id === encounterId).sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
}

// ============================================================
// WARD/BED DATA
// ============================================================

export function getWardBeds(): WardBed[] {
  return WARD_BEDS;
}

export function getWardSummary(): Array<{ name: string; type: string; total: number; available: number; occupied: number; reserved: number; cleaning: number }> {
  const map = new Map<string, { name: string; type: string; total: number; available: number; occupied: number; reserved: number; cleaning: number }>();
  for (const bed of WARD_BEDS) {
    if (!map.has(bed.ward_name)) {
      map.set(bed.ward_name, { name: bed.ward_name, type: bed.ward_type, total: 0, available: 0, occupied: 0, reserved: 0, cleaning: 0 });
    }
    const w = map.get(bed.ward_name)!;
    w.total++;
    if (bed.status === 'AVAILABLE') w.available++;
    else if (bed.status === 'OCCUPIED') w.occupied++;
    else if (bed.status === 'RESERVED') w.reserved++;
    else if (bed.status === 'CLEANING') w.cleaning++;
  }
  return Array.from(map.values());
}

// ============================================================
// CROSS-MODULE ROUTING (Approval → Downstream)
// ============================================================

export function approveAndRouteEncounter(encounterId: string): void {
  const enc = ENCOUNTERS.find(e => e.id === encounterId);
  if (!enc) return;
  
  enc.status = 'APPROVED';
  enc.approved_at = new Date().toISOString();
  enc.updated_at = new Date().toISOString();

  // Route Medications → Pharmacy
  if (enc.medications?.length) {
    enc.medications.forEach(m => { m.is_approved = true; });
    const approvedMeds = enc.medications.filter(m => m.is_approved);
    approvedMeds.forEach(m => { m.status = 'APPROVED'; });
    window.dispatchEvent(new CustomEvent('mcgm-pharmacy-order', { detail: { encounterId, patientId: enc.patient_id, patientName: enc.patient?.name, medications: approvedMeds } }));
    addTimelineEvent(encounterId, enc.patient_id, 'PHARMACY_ROUTED', 'Prescription sent to Pharmacy', `${approvedMeds.length} medication(s) routed`, '💊', '#7C3AED');
  }

  // Route Labs → Laboratory
  if (enc.investigations?.length) {
    enc.investigations.forEach(i => { i.is_approved = true; });
  }
  const labs = enc.investigations?.filter(i => i.is_approved && i.category === 'LABORATORY') || [];
  if (labs.length) {
    window.dispatchEvent(new CustomEvent('mcgm-lab-order', { detail: { encounterId, patientId: enc.patient_id, patientName: enc.patient?.name, orders: labs } }));
    addTimelineEvent(encounterId, enc.patient_id, 'LAB_ROUTED', 'Lab orders sent', `${labs.length} test(s) ordered`, '🔬', '#059669');
  }

  // Route Radiology → PACS/RIS
  const rads = enc.investigations?.filter(i => i.is_approved && i.category === 'RADIOLOGY') || [];
  if (rads.length) {
    window.dispatchEvent(new CustomEvent('mcgm-radiology-order', { detail: { encounterId, patientId: enc.patient_id, patientName: enc.patient?.name, orders: rads } }));
    addTimelineEvent(encounterId, enc.patient_id, 'RADIOLOGY_ROUTED', 'Imaging orders sent', `${rads.length} study(ies) ordered`, '📡', '#2563EB');
  }

  // Route Nursing → Nurse Portal
  if (enc.nursing_orders?.length) {
    enc.nursing_orders.forEach(n => { n.is_approved = true; });
    window.dispatchEvent(new CustomEvent('mcgm-nursing-order', { detail: { encounterId, patientId: enc.patient_id, patientName: enc.patient?.name, orders: enc.nursing_orders.filter(n => n.is_approved), diet: enc.diet_order } }));
    addTimelineEvent(encounterId, enc.patient_id, 'NURSING_ROUTED', 'Nursing orders sent', `${enc.nursing_orders.length} instruction(s)`, '👩‍⚕️', '#DB2777');
  }

  // Route Follow-up → Appointment
  if (enc.follow_ups?.length) {
    window.dispatchEvent(new CustomEvent('mcgm-followup-created', { detail: { encounterId, patientId: enc.patient_id, patientName: enc.patient?.name, follow_ups: enc.follow_ups.filter(f => f.is_approved) } }));
  }

  // Global notification
  window.dispatchEvent(new CustomEvent('mcgm-system-notification', {
    detail: {
      title: '✅ Clinical Encounter Approved',
      message: `Encounter ${enc.encounter_no} for ${enc.patient?.name || 'Patient'} has been approved. All orders routed to respective departments.`,
      type: 'success',
    },
  }));

  addTimelineEvent(encounterId, enc.patient_id, 'ENCOUNTER_APPROVED', 'Encounter Approved & Routed', `All clinical orders dispatched by ${enc.consulting_doctor_name}`, '✅', '#059669');
}
