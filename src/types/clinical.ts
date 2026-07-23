import type { Patient, PatientVitals, TriageAssessment, TaskPriority } from './emergency';

// ============================================================
// MCGM Clinical Domain Types
// ============================================================

export type EncounterStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SCRIBING'
  | 'REVIEW'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type EncounterType = 'EMERGENCY' | 'OPD' | 'IPD' | 'FOLLOWUP' | 'TELECONSULT';

export type DiagnosisType = 'PROVISIONAL' | 'DIFFERENTIAL' | 'CONFIRMED';

export type DispositionType =
  | 'DISCHARGE'
  | 'OBSERVATION'
  | 'ADMIT'
  | 'TRANSFER'
  | 'REFER'
  | 'AMA'
  | 'DEATH';

export type MedicationRoute = 'PO' | 'IV' | 'IM' | 'SC' | 'TOPICAL' | 'INHALATION' | 'NG' | 'PR';

export type MedicationFrequency =
  | 'OD'
  | 'BD'
  | 'TDS'
  | 'QID'
  | 'HS'
  | 'SOS'
  | 'PRN'
  | 'STAT';

export type MedicationStatus = 'DRAFT' | 'ORDERED' | 'APPROVED' | 'ADMINISTERED' | 'STOPPED' | 'CANCELLED';

export type InvestigationCategory = 'LABORATORY' | 'RADIOLOGY' | 'CARDIOLOGY' | 'PATHOLOGY' | 'MICROBIOLOGY';

export type InvestigationStatus =
  | 'ORDERED'
  | 'COLLECTED'
  | 'IN_PROGRESS'
  | 'RESULT_AVAILABLE'
  | 'VERIFIED'
  | 'CANCELLED';

export type ProcedureType =
  | 'IV_FLUIDS'
  | 'OXYGEN'
  | 'NEBULIZATION'
  | 'DRESSING'
  | 'CATHETERIZATION'
  | 'NG_TUBE'
  | 'BLOOD_TRANSFUSION'
  | 'WOUND_CARE'
  | 'DIALYSIS'
  | 'PHYSIOTHERAPY'
  | 'OTHER';

export type ProcedureStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type NursingCategory =
  | 'VITALS'
  | 'MONITORING'
  | 'DIET'
  | 'POSITIONING'
  | 'WOUND_CARE'
  | 'FALL_PRECAUTION'
  | 'IO_MONITORING'
  | 'OTHER';

export type NursingStatus = 'ACTIVE' | 'COMPLETED' | 'STOPPED';

export type DietType =
  | 'NPO'
  | 'LIQUID'
  | 'SOFT'
  | 'DIABETIC'
  | 'LOW_SALT'
  | 'RENAL'
  | 'CARDIAC'
  | 'NORMAL';

export type WardType =
  | 'GENERAL_MALE'
  | 'GENERAL_FEMALE'
  | 'SURGICAL'
  | 'PEDIATRIC'
  | 'MATERNITY'
  | 'ICU'
  | 'HDU'
  | 'CCU'
  | 'NICU'
  | 'PICU'
  | 'ISOLATION'
  | 'EMERGENCY_OBS';

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'RESERVED';

export type WarningType = 'ALLERGY' | 'DUPLICATE' | 'AGE' | 'INTERACTION' | 'DOSE' | 'OTHER';

export type WarningSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ============================================================
// Safety Warning
// ============================================================
export interface SafetyWarning {
  id: string;
  type: WarningType;
  severity: WarningSeverity;
  message: string;
  acknowledged: boolean;
}

// ============================================================
// Clinical Encounter
// ============================================================
export interface ClinicalEncounter {
  id: string;
  patient_id: string;
  encounter_no: string;
  registration_id?: string;
  hospital_id?: string;
  encounter_type: EncounterType;
  status: EncounterStatus;
  consulting_doctor_name: string;
  department: string;

  // SOAP
  chief_complaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;

  // History
  past_medical_history?: string;
  family_history?: string;
  social_history?: string;
  raw_transcript?: string;

  // Vitals & triage (linked)
  vitals?: PatientVitals;
  triage?: TriageAssessment;

  // Disposition
  disposition?: DispositionType;
  disposition_notes?: string;

  // Relations (resolved in service)
  patient?: Patient;
  diagnoses?: DiagnosisEntry[];
  medications?: MedicationOrder[];
  investigations?: InvestigationOrder[];
  procedures?: ProcedureOrder[];
  nursing_orders?: NursingInstruction[];
  referrals?: ReferralOrder[];
  follow_ups?: FollowUpOrder[];
  diet_order?: DietOrder;
  admission_request?: AdmissionRequest;
  timeline?: ClinicalTimelineEvent[];

  started_at?: string;
  approved_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Diagnosis
// ============================================================
export interface DiagnosisEntry {
  id: string;
  encounter_id: string;
  patient_id: string;
  diagnosis: string;
  type: DiagnosisType;
  icd10_code?: string;
  snomed_code?: string;
  is_ai_suggested: boolean;
  is_approved: boolean;
  noted_by?: string;
  created_at: string;
}

// ============================================================
// Medication Order
// ============================================================
export interface MedicationOrder {
  id: string;
  encounter_id: string;
  patient_id: string;
  drug_name: string;
  strength?: string;
  dose?: string;
  route: MedicationRoute;
  frequency: MedicationFrequency;
  duration?: string;
  timing?: string;
  special_instructions?: string;
  status: MedicationStatus;
  is_voice_order: boolean;
  is_approved: boolean;
  safety_warnings: SafetyWarning[];
  ordered_by?: string;
  ordered_at: string;
  created_at: string;
}

// ============================================================
// Investigation Order
// ============================================================
export interface InvestigationOrder {
  id: string;
  encounter_id: string;
  patient_id: string;
  test_name: string;
  category: InvestigationCategory;
  priority: TaskPriority;
  status: InvestigationStatus;
  is_voice_order: boolean;
  is_approved: boolean;
  result_value?: string;
  result_unit?: string;
  reference_range?: string;
  is_critical_result?: boolean;
  ordered_by?: string;
  ordered_at: string;
  resulted_at?: string;
  created_at: string;
}

// ============================================================
// Procedure Order
// ============================================================
export interface ProcedureOrder {
  id: string;
  encounter_id: string;
  patient_id: string;
  procedure_name: string;
  procedure_type: ProcedureType;
  details?: string;
  priority: TaskPriority;
  status: ProcedureStatus;
  is_voice_order: boolean;
  is_approved: boolean;
  performed_by?: string;
  performed_at?: string;
  complications?: string;
  ordered_by?: string;
  ordered_at: string;
  created_at: string;
}

// ============================================================
// Nursing Instruction
// ============================================================
export interface NursingInstruction {
  id: string;
  encounter_id: string;
  patient_id: string;
  category: NursingCategory;
  instruction: string;
  frequency?: string;
  status: NursingStatus;
  is_voice_order: boolean;
  is_approved: boolean;
  ordered_by?: string;
  ordered_at?: string;
  created_at: string;
}

// ============================================================
// Diet Order
// ============================================================
export interface DietOrder {
  id: string;
  encounter_id: string;
  patient_id: string;
  diet_type: DietType;
  instructions?: string;
  is_approved: boolean;
  ordered_by?: string;
  ordered_at: string;
  created_at: string;
}

// ============================================================
// Referral Order
// ============================================================
export interface ReferralOrder {
  id: string;
  encounter_id: string;
  patient_id: string;
  specialty: string;
  reason: string;
  clinical_summary?: string;
  priority: TaskPriority;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  is_voice_order: boolean;
  is_approved: boolean;
  responder_name?: string;
  response?: string;
  responded_at?: string;
  ordered_by?: string;
  ordered_at: string;
  created_at: string;
}

// ============================================================
// Follow-up Order
// ============================================================
export interface FollowUpOrder {
  id: string;
  encounter_id: string;
  patient_id: string;
  follow_up_in_days: number;
  department?: string;
  instructions?: string;
  tests_to_bring?: string[];
  is_voice_order: boolean;
  is_approved: boolean;
  scheduled_for?: string;
  ordered_by?: string;
  ordered_at: string;
  created_at: string;
}

// ============================================================
// Admission Request
// ============================================================
export interface AdmissionRequest {
  id: string;
  encounter_id: string;
  patient_id: string;
  ward_type: WardType;
  ward_name?: string;
  bed_id?: string;
  bed_number?: string;
  isolation_required: boolean;
  reason: string;
  status: 'REQUESTED' | 'ALLOCATED' | 'CONFIRMED' | 'CANCELLED';
  requested_by?: string;
  requested_at: string;
  allocated_at?: string;
  created_at: string;
}

// ============================================================
// Ward Bed
// ============================================================
export interface WardBed {
  id: string;
  ward_name: string;
  ward_type: WardType;
  bed_number: string;
  status: BedStatus;
  patient_id?: string;
  patient_name?: string;
  updated_at?: string;
}

// ============================================================
// Clinical Timeline Event
// ============================================================
export interface ClinicalTimelineEvent {
  id: string;
  patient_id: string;
  encounter_id: string;
  event_type: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  occurred_at: string;
}

// ============================================================
// Extracted Clinical Data (NLP output)
// ============================================================
export interface ExtractedMedication {
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  timing: string;
}

export interface ExtractedProcedure {
  name: string;
  details?: string;
  type: ProcedureType;
}

export interface ExtractedClinicalData {
  symptoms: string[];
  duration: string;
  examination_findings: string[];
  medications: ExtractedMedication[];
  lab_orders: string[];
  radiology_orders: string[];
  procedures: ExtractedProcedure[];
  diet: string;
  admission_department: string;
  admission_ward: string;
  nursing_orders: string[];
  referrals: string[];
  follow_up_days: number | null;
  follow_up_tests: string[];
  diagnosis_suggestions: string[];
  raw_segments: string[];
}
