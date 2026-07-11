// ============================================================
// MCGM Emergency OS — Core Domain Types
// ============================================================

export type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK' | 'PENDING';
export type PatientStatus = 'EN_ROUTE' | 'DISPATCHED' | 'ARRIVED' | 'TRIAGED' | 'RESUSCITATING' | 'IN_SURGERY' | 'ICU' | 'ADMITTED' | 'DISCHARGED' | 'DECEASED';
export type GenderType = 'Male' | 'Female' | 'Other' | 'Unknown';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
export type AmbulanceStatus = 'AVAILABLE' | 'EN_ROUTE_INCIDENT' | 'TRANSPORTING' | 'MAINTENANCE' | 'OFFLINE';
export type BayStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'RESERVED';
export type UserRole = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'EMERGENCY_ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTION' | 'LAB' | 'RADIOLOGY' | 'BLOOD_BANK' | 'PHARMACY' | 'SECURITY' | 'AMBULANCE_STAFF' | 'CITIZEN' | 'RELATIVE' | 'POLICE' | 'FIRE_BRIGADE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'ESCALATED';
export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'CRITICAL';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentType = 'ROAD_ACCIDENT' | 'FIRE_INCIDENT' | 'BUILDING_COLLAPSE' | 'MEDICAL_OUTBREAK' | 'MCI' | 'OTHER';
export type ResourceType = 'BED' | 'ICU_BED' | 'VENTILATOR' | 'WHEELCHAIR' | 'STRETCHER' | 'OT_SUITE' | 'BLOOD_UNIT' | 'OXYGEN_CYLINDER' | 'DEFIBRILLATOR' | 'MONITOR' | 'IV_PUMP' | 'OTHER';
export type NotificationType = 'ALERT' | 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS' | 'VOICE' | 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH';

// ---- Hospital ----
export interface Hospital {
  id: string;
  name: string;
  code: string;
  address?: string;
  district?: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  beds_total: number;
  icu_total: number;
  ot_total: number;
  is_active: boolean;
  created_at: string;
}

// ---- Staff ----
export interface StaffProfile {
  id: string;
  hospital_id: string;
  department_id?: string;
  role: UserRole;
  employee_id?: string;
  name: string;
  phone?: string;
  email?: string;
  photo_url?: string;
  specialization?: string;
  license_no?: string;
  is_active: boolean;
  fcm_token?: string;
  created_at: string;
  updated_at: string;
}

// ---- Patient ----
export interface Patient {
  id: string;
  uhid?: string;
  temp_uhid?: string;
  abha_id?: string;
  name: string;
  name_as_per_id?: string;
  age?: number;
  date_of_birth?: string;
  gender: GenderType;
  blood_group: BloodType;
  phone?: string;
  phone_alt?: string;
  address?: string;
  district?: string;
  state?: string;
  aadhaar_no?: string;
  photo_url?: string;
  is_identified: boolean;
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  allergies?: PatientAllergy[];
  history?: PatientHistory[];
  family_contacts?: PatientFamilyContact[];
}

export interface PatientAllergy {
  id: string;
  patient_id: string;
  allergen: string;
  reaction?: string;
  severity?: string;
  noted_at: string;
}

export interface PatientHistory {
  id: string;
  patient_id: string;
  condition: string;
  diagnosed_at?: string;
  status: string;
  notes?: string;
}

export interface PatientFamilyContact {
  id: string;
  patient_id: string;
  name: string;
  relation: string;
  phone: string;
  is_primary: boolean;
  notified_at?: string;
}

// ---- Emergency Registration (the main ER entity) ----
export interface EmergencyRegistration {
  id: string;
  patient_id: string;
  hospital_id: string;
  registration_no: string;
  arrival_mode: string;
  arrival_time: string;
  chief_complaint?: string;
  injury_mechanism?: string;
  incident_id?: string;
  ambulance_id?: string;
  referred_from?: string;
  police_case: boolean;
  police_fir_no?: string;
  mlc_no?: string;
  status: PatientStatus;
  discharged_at?: string;
  discharge_summary?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  patient?: Patient;
  triage?: TriageAssessment;
  latest_vitals?: PatientVitals;
  active_bay?: BayAssignment & { bay?: TraumaBay };
  golden_hour?: GoldenHourTracking;
  ai_prediction?: AIPrediction;
}

// ---- Triage ----
export interface TriageAssessment {
  id: string;
  registration_id: string;
  patient_id: string;
  category: TriageCategory;
  assessed_by?: string;
  assessed_at: string;
  gcs_eye?: number;
  gcs_verbal?: number;
  gcs_motor?: number;
  gcs_total?: number;
  rts_score?: number;
  ai_risk_score?: number;
  ai_suggested_cat?: TriageCategory;
  ai_reasoning?: string;
  confirmed_by_doc?: string;
  confirmed_at?: string;
  notes?: string;
  is_mass_casualty: boolean;
}

// ---- Vitals ----
export interface PatientVitals {
  id: string;
  patient_id: string;
  registration_id?: string;
  recorded_by?: string;
  recorded_at: string;
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  respiratory_rate?: number;
  spo2?: number;
  temperature?: number;
  blood_glucose?: number;
  pain_score?: number;
  weight_kg?: number;
  height_cm?: number;
  is_critical: boolean;
  notes?: string;
}

// ---- Golden Hour ----
export interface GoldenHourTracking {
  id: string;
  registration_id: string;
  patient_id: string;
  door_time?: string;
  doctor_time?: string;
  ct_ordered_time?: string;
  ct_completed_time?: string;
  needle_time?: string;
  blood_time?: string;
  ot_decision_time?: string;
  ot_incision_time?: string;
  icu_decision_time?: string;
  icu_admission_time?: string;
  door_to_doctor_min?: number;
  door_to_ct_min?: number;
  door_to_needle_min?: number;
}

// ---- Trauma Bay ----
export interface TraumaBay {
  id: string;
  hospital_id: string;
  bay_number: number;
  status: BayStatus;
  has_ventilator: boolean;
  has_monitor: boolean;
  has_defib: boolean;
  notes?: string;
  updated_at: string;
  // Relations
  active_assignment?: BayAssignment;
}

export interface BayAssignment {
  id: string;
  bay_id: string;
  registration_id: string;
  patient_id: string;
  assigned_doctor?: string;
  assigned_nurse?: string;
  assigned_at: string;
  released_at?: string;
  is_active: boolean;
  // Relations
  patient?: Patient;
  doctor?: StaffProfile;
  nurse?: StaffProfile;
}

// ---- Ambulance ----
export interface Ambulance {
  id: string;
  hospital_id: string;
  vehicle_no: string;
  call_sign: string;
  type: string;
  status: AmbulanceStatus;
  fuel_pct: number;
  has_ventilator: boolean;
  has_aed: boolean;
  oxygen_pct: number;
  has_ecg: boolean;
  driver_id?: string;
  paramedic_id?: string;
  lat?: number;
  lng?: number;
  last_gps_at?: string;
  updated_at: string;
  // Relations
  driver?: StaffProfile;
  paramedic?: StaffProfile;
  active_mission?: AmbulanceMission;
}

export interface AmbulanceMission {
  id: string;
  ambulance_id: string;
  registration_id?: string;
  patient_id?: string;
  pickup_location?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_id?: string;
  eta_minutes?: number;
  dispatched_at: string;
  arrived_scene_at?: string;
  departed_scene_at?: string;
  arrived_hospital_at?: string;
  is_active: boolean;
}

// ---- Incident ----
export interface Incident {
  id: string;
  hospital_id: string;
  incident_no: string;
  title: string;
  location: string;
  lat?: number;
  lng?: number;
  severity: IncidentSeverity;
  type: IncidentType;
  status: 'OPEN' | 'RESOLVED' | 'ARCHIVED';
  victims_count: number;
  critical_count: number;
  reported_at: string;
  resolved_at?: string;
  reported_by?: string;
  notes?: string;
  is_mci: boolean;
}

// ---- Orders ----
export interface ClinicalOrder {
  id: string;
  registration_id: string;
  patient_id: string;
  order_type: string;
  description: string;
  priority: TaskPriority;
  status: OrderStatus;
  ordered_by?: string;
  ordered_at: string;
  completed_at?: string;
  result?: string;
  notes?: string;
  is_voice_order: boolean;
}

export interface LabOrder {
  id: string;
  order_id?: string;
  patient_id: string;
  registration_id?: string;
  test_name: string;
  specimen_type?: string;
  barcode?: string;
  loinc_code?: string;
  priority: TaskPriority;
  status: OrderStatus;
  result_value?: string;
  result_unit?: string;
  reference_range?: string;
  is_critical: boolean;
  collected_at?: string;
  resulted_at?: string;
  released_by?: string;
  released_at?: string;
  patient?: Patient;
}

export interface RadiologyOrder {
  id: string;
  order_id?: string;
  patient_id: string;
  registration_id?: string;
  modality: string;
  body_part: string;
  study_name: string;
  priority: TaskPriority;
  status: OrderStatus;
  ai_finding?: string;
  ai_confidence?: number;
  radiologist_report?: string;
  pacs_url?: string;
  acquired_at?: string;
  reported_at?: string;
  reported_by?: string;
  patient?: Patient;
}

export interface BloodRequest {
  id: string;
  patient_id: string;
  registration_id?: string;
  blood_group: BloodType;
  units_requested: number;
  units_issued: number;
  reason?: string;
  urgency: TaskPriority;
  status: OrderStatus;
  requested_by?: string;
  requested_at: string;
  issued_at?: string;
  cross_match_done: boolean;
  patient?: Patient;
}

// ---- Resources ----
export interface Resource {
  id: string;
  hospital_id: string;
  name: string;
  type: ResourceType;
  total: number;
  available: number;
  in_use: number;
  maintenance: number;
  unit: string;
  location?: string;
  last_checked: string;
  updated_at: string;
}

// ---- Communication ----
export interface Message {
  id: string;
  hospital_id: string;
  from_id: string;
  to_id?: string;
  department?: string;
  body: string;
  is_voice: boolean;
  audio_url?: string;
  read_at?: string;
  created_at: string;
  from_staff?: StaffProfile;
  to_staff?: StaffProfile;
}

export interface Broadcast {
  id: string;
  hospital_id: string;
  title: string;
  body: string;
  priority: TaskPriority;
  target_roles?: UserRole[];
  sent_by?: string;
  expires_at?: string;
  created_at: string;
  sender?: StaffProfile;
}

export interface AppNotification {
  id: string;
  user_id: string;
  hospital_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url?: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  read_at?: string;
  delivered_at?: string;
  created_at: string;
}

// ---- Tasks ----
export interface Task {
  id: string;
  hospital_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to?: string;
  assigned_by?: string;
  patient_id?: string;
  registration_id?: string;
  due_at?: string;
  completed_at?: string;
  escalated_at?: string;
  escalated_to?: string;
  created_at: string;
  updated_at: string;
  assignee?: StaffProfile;
}

// ---- AI ----
export interface AIPrediction {
  id: string;
  patient_id: string;
  registration_id?: string;
  model: string;
  prediction_type: string;
  input_data?: Record<string, unknown>;
  output?: Record<string, unknown>;
  risk_score?: number;
  confidence?: number;
  created_at: string;
}

export interface CopilotMessage {
  sender: 'AI' | 'User';
  text: string;
  timestamp?: string;
  action?: string;
}

// ---- Voice ----
export interface VoiceLog {
  id: string;
  staff_id: string;
  hospital_id: string;
  transcript: string;
  intent?: string;
  action?: string;
  confidence?: number;
  executed: boolean;
  error?: string;
  created_at: string;
}

// ---- Patient Timeline ----
export interface TimelineEvent {
  id: string;
  patient_id: string;
  registration_id?: string;
  event_type: string;
  title: string;
  description?: string;
  actor_id?: string;
  actor_name?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  occurred_at: string;
}

// ---- Dashboard KPIs ----
export interface EmergencyKPIs {
  incoming_count: number;
  critical_count: number;
  golden_hour_count: number;
  waiting_count: number;
  door_to_doctor_min: number;
  bays_available: number;
  bays_total: number;
  icu_available: number;
  icu_total: number;
  ot_available: number;
  ot_total: number;
  o_neg_units: number;
  doctors_on_duty: number;
  ambulances_active: number;
  er_occupancy_pct: number;
}

// ---- AI Insight ----
export interface AIInsight {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'RECOMMENDATION';
  title: string;
  body: string;
  action?: string;
  patient_id?: string;
  created_at: string;
  icon?: string;
}

// ---- Form types ----
export interface RegisterPatientForm {
  name: string;
  age?: number;
  gender: GenderType;
  phone?: string;
  abha_id?: string;
  blood_group?: BloodType;
  arrival_mode: string;
  chief_complaint: string;
  injury_mechanism?: string;
  allergies?: string;
  hr?: number;
  bp?: string;
  rr?: number;
  spo2?: number;
  temperature?: number;
  gcs?: number;
  triage_category?: TriageCategory;
}

export interface TriageFormInputs {
  gcs_eye: number;
  gcs_verbal: number;
  gcs_motor: number;
  rr_rate: number;
  sys_bp: number;
  heart_rate: number;
  spo2: number;
}
