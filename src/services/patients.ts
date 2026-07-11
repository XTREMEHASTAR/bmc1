import { supabase, HOSPITAL_ID, isSupabaseConfigured } from '../lib/supabase';
import { EmergencyRegistration, Patient, PatientVitals, TriageAssessment, RegisterPatientForm, TriageCategory } from '../types/emergency';

// ============================================================
// DEMO DATA — used when Supabase is not configured
// ============================================================
export const DEMO_REGISTRATIONS: EmergencyRegistration[] = [
  {
    id: 'ER-2026-801', patient_id: 'P-801', hospital_id: HOSPITAL_ID,
    registration_no: 'ER-2026-800801', arrival_mode: 'AMBULANCE',
    arrival_time: new Date().toISOString(), police_case: false,
    injury_mechanism: 'High-velocity motorcycle collision vs truck on WEH. Deforming left femur fracture, chest contusion, suspected tension pneumothorax.',
    chief_complaint: 'Polytrauma', status: 'EN_ROUTE',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    patient: {
      id: 'P-801', name: 'Santosh Harishchandra Patil', age: 42, gender: 'Male',
      blood_group: 'O-', abha_id: '91-8273-0912-99', phone: '9820001122',
      is_identified: true, is_emergency: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    triage: {
      id: 'T-801', registration_id: 'ER-2026-801', patient_id: 'P-801',
      category: 'RED', assessed_at: new Date().toISOString(),
      gcs_eye: 2, gcs_verbal: 2, gcs_motor: 5, gcs_total: 9,
      rts_score: 5.24, ai_risk_score: 91, ai_suggested_cat: 'RED',
      ai_reasoning: 'GCS 9, tension pneumothorax, hemorrhagic shock. Immediate resuscitation required.',
      is_mass_casualty: false,
    },
    latest_vitals: {
      id: 'V-801', patient_id: 'P-801', recorded_at: new Date().toISOString(),
      heart_rate: 124, systolic_bp: 88, diastolic_bp: 54, respiratory_rate: 28,
      spo2: 89, temperature: 97.8, is_critical: true,
    },
    active_bay: {
      id: 'BA-1', bay_id: 'BAY-1', registration_id: 'ER-2026-801', patient_id: 'P-801',
      assigned_at: new Date().toISOString(), is_active: true,
      bay: { id: 'BAY-1', hospital_id: HOSPITAL_ID, bay_number: 1, status: 'OCCUPIED', has_ventilator: true, has_monitor: true, has_defib: true, updated_at: new Date().toISOString() },
    },
    ai_prediction: { id: 'AI-801', patient_id: 'P-801', model: 'gpt-4o', prediction_type: 'RISK', risk_score: 91, confidence: 0.88, created_at: new Date().toISOString() },
  },
  {
    id: 'ER-2026-802', patient_id: 'P-802', hospital_id: HOSPITAL_ID,
    registration_no: 'ER-2026-800802', arrival_mode: 'AMBULANCE',
    arrival_time: new Date(Date.now() - 6 * 60000).toISOString(), police_case: false,
    injury_mechanism: 'Sudden onset crushing substernal chest pain radiating to left arm. Associated diaphoresis and mild dyspnea.',
    chief_complaint: 'Chest Pain / Possible STEMI', status: 'EN_ROUTE',
    created_at: new Date(Date.now() - 6 * 60000).toISOString(), updated_at: new Date().toISOString(),
    patient: {
      id: 'P-802', name: 'Sunita Ravindra Deshmukh', age: 58, gender: 'Female',
      blood_group: 'A+', abha_id: '12-9982-8811-04',
      is_identified: true, is_emergency: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    triage: {
      id: 'T-802', registration_id: 'ER-2026-802', patient_id: 'P-802',
      category: 'YELLOW', assessed_at: new Date().toISOString(),
      gcs_total: 15, rts_score: 7.84, ai_risk_score: 68,
      ai_suggested_cat: 'YELLOW', ai_reasoning: 'Possible ACS. Troponin pending. ECG ordered.',
      is_mass_casualty: false,
    },
    latest_vitals: {
      id: 'V-802', patient_id: 'P-802', recorded_at: new Date().toISOString(),
      heart_rate: 98, systolic_bp: 142, diastolic_bp: 88, respiratory_rate: 18,
      spo2: 95, temperature: 98.6, is_critical: false,
    },
  },
  {
    id: 'ER-2026-803', patient_id: 'P-803', hospital_id: HOSPITAL_ID,
    registration_no: 'ER-2026-800803', arrival_mode: 'WALK_IN',
    arrival_time: new Date(Date.now() - 15 * 60000).toISOString(), police_case: false,
    injury_mechanism: 'Fall from scaffolding ~12 feet. Axial loading injury to lumbar spine, wrist deformity.',
    chief_complaint: 'Back and wrist injury after fall', status: 'ARRIVED',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(), updated_at: new Date().toISOString(),
    patient: {
      id: 'P-803', name: 'Rohan Satish Shinde', age: 26, gender: 'Male',
      blood_group: 'B+', is_identified: true, is_emergency: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    triage: {
      id: 'T-803', registration_id: 'ER-2026-803', patient_id: 'P-803',
      category: 'PENDING', assessed_at: new Date().toISOString(),
      gcs_total: 14, ai_risk_score: 44, is_mass_casualty: false,
    },
    latest_vitals: {
      id: 'V-803', patient_id: 'P-803', recorded_at: new Date().toISOString(),
      heart_rate: 110, systolic_bp: 118, diastolic_bp: 76, respiratory_rate: 20,
      spo2: 97, temperature: 98.2, is_critical: false,
    },
  },
  {
    id: 'ER-2026-804', patient_id: 'P-804', hospital_id: HOSPITAL_ID,
    registration_no: 'ER-2026-800804', arrival_mode: 'AMBULANCE',
    arrival_time: new Date(Date.now() - 25 * 60000).toISOString(), police_case: false,
    injury_mechanism: 'Acute severe asthma exacerbation unresponsive to home albuterol nebulizer. In extremis, cyanosis noted.',
    chief_complaint: 'Respiratory Failure', status: 'RESUSCITATING',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(), updated_at: new Date().toISOString(),
    patient: {
      id: 'P-804', name: 'Priya Rajan Singh', age: 30, gender: 'Female',
      blood_group: 'AB+', is_identified: true, is_emergency: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    triage: {
      id: 'T-804', registration_id: 'ER-2026-804', patient_id: 'P-804',
      category: 'RED', assessed_at: new Date().toISOString(),
      gcs_total: 12, ai_risk_score: 87, ai_suggested_cat: 'RED', is_mass_casualty: false,
    },
    latest_vitals: {
      id: 'V-804', patient_id: 'P-804', recorded_at: new Date().toISOString(),
      heart_rate: 135, systolic_bp: 130, diastolic_bp: 80, respiratory_rate: 32,
      spo2: 84, temperature: 99.1, is_critical: true,
    },
    active_bay: {
      id: 'BA-3', bay_id: 'BAY-3', registration_id: 'ER-2026-804', patient_id: 'P-804',
      assigned_at: new Date(Date.now() - 25 * 60000).toISOString(), is_active: true,
      bay: { id: 'BAY-3', hospital_id: HOSPITAL_ID, bay_number: 3, status: 'OCCUPIED', has_ventilator: true, has_monitor: true, has_defib: false, updated_at: new Date().toISOString() },
    },
  },
  {
    id: 'ER-2026-805', patient_id: 'P-805', hospital_id: HOSPITAL_ID,
    registration_no: 'ER-2026-800805', arrival_mode: 'AMBULANCE',
    arrival_time: new Date(Date.now() - 45 * 60000).toISOString(), police_case: true,
    mlc_no: 'MLC-2026-1042', injury_mechanism: 'Pedestrian struck by high-speed local train at Dadar station. Traumatic amputation of right lower extremity. Massive hemorrhage.',
    chief_complaint: 'Traumatic Amputation', status: 'IN_SURGERY',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(), updated_at: new Date().toISOString(),
    patient: {
      id: 'P-805', name: 'Unknown Male (Trauma #4)', age: 35, gender: 'Male',
      abha_id: 'PENDING-BIOMETRIC', blood_group: 'Unknown',
      is_identified: false, is_emergency: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    triage: {
      id: 'T-805', registration_id: 'ER-2026-805', patient_id: 'P-805',
      category: 'RED', assessed_at: new Date().toISOString(),
      gcs_total: 7, ai_risk_score: 96, ai_suggested_cat: 'RED', is_mass_casualty: false,
    },
    latest_vitals: {
      id: 'V-805', patient_id: 'P-805', recorded_at: new Date().toISOString(),
      heart_rate: 145, systolic_bp: 70, diastolic_bp: 40, respiratory_rate: 36,
      spo2: 78, temperature: 96.2, is_critical: true,
    },
    active_bay: {
      id: 'BA-4', bay_id: 'BAY-4', registration_id: 'ER-2026-805', patient_id: 'P-805',
      assigned_at: new Date(Date.now() - 45 * 60000).toISOString(), is_active: true,
      bay: { id: 'BAY-4', hospital_id: HOSPITAL_ID, bay_number: 4, status: 'OCCUPIED', has_ventilator: true, has_monitor: true, has_defib: true, updated_at: new Date().toISOString() },
    },
  },
];

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/** Fetch all active emergency registrations for this hospital */
export async function fetchRegistrations(): Promise<EmergencyRegistration[]> {
  if (!isSupabaseConfigured()) return DEMO_REGISTRATIONS;

  const { data, error } = await supabase
    .from('emergency_registrations')
    .select(`
      *,
      patient:patients(*),
      triage:triage_assessments(*)
    `)
    .eq('hospital_id', HOSPITAL_ID)
    .not('status', 'in', '(DISCHARGED,DECEASED)')
    .order('arrival_time', { ascending: false });

  if (error) throw error;
  return data as EmergencyRegistration[];
}

export const registrationListeners = new Set<(registrations: EmergencyRegistration[]) => void>();

export function notifyRegistrationListeners() {
  const current = [...DEMO_REGISTRATIONS];
  registrationListeners.forEach(cb => cb(current));
}

/** Register a new emergency patient */
export async function registerEmergencyPatient(form: RegisterPatientForm): Promise<EmergencyRegistration> {
  if (!isSupabaseConfigured()) {
    // demo mode — add to in-memory store
    const registrationId = `ER-${Date.now()}`;
    const patientId = `P-${Date.now()}`;
    const demo: EmergencyRegistration = {
      id: registrationId, patient_id: patientId, hospital_id: HOSPITAL_ID,
      registration_no: `ER-2026-${Math.floor(800000 + Math.random() * 100000)}`,
      arrival_mode: form.arrival_mode, arrival_time: new Date().toISOString(),
      chief_complaint: form.chief_complaint, injury_mechanism: form.injury_mechanism,
      police_case: false, status: 'ARRIVED',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      patient: {
        id: patientId, name: form.name, age: form.age, gender: form.gender,
        blood_group: form.blood_group || 'Unknown', abha_id: form.abha_id,
        phone: form.phone, is_identified: Boolean(form.abha_id || form.phone),
        is_emergency: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      triage: form.triage_category ? {
        id: `T-${Date.now()}`, registration_id: registrationId, patient_id: patientId,
        category: form.triage_category, assessed_at: new Date().toISOString(), is_mass_casualty: false,
      } : undefined,
      latest_vitals: (form.hr || form.spo2) ? {
        id: `V-${Date.now()}`, patient_id: patientId, recorded_at: new Date().toISOString(),
        heart_rate: form.hr, systolic_bp: form.bp ? parseInt(form.bp.split('/')[0]) : undefined,
        diastolic_bp: form.bp ? parseInt(form.bp.split('/')[1]) : undefined,
        respiratory_rate: form.rr, spo2: form.spo2, temperature: form.temperature,
        is_critical: (form.spo2 || 100) < 90 || (form.hr || 80) > 120,
      } : undefined,
    };
    DEMO_REGISTRATIONS.unshift(demo);
    notifyRegistrationListeners();
    return demo;
  }

  // 1. Create patient
  const { data: patient, error: patErr } = await supabase
    .from('patients')
    .insert({
      name: form.name, age: form.age, gender: form.gender,
      phone: form.phone, abha_id: form.abha_id || null,
      blood_group: form.blood_group || 'Unknown',
      is_identified: Boolean(form.abha_id || form.phone),
      is_emergency: true,
    })
    .select()
    .single();

  if (patErr) throw patErr;

  // 2. Create registration
  const { data: reg, error: regErr } = await supabase
    .from('emergency_registrations')
    .insert({
      patient_id: patient.id, hospital_id: HOSPITAL_ID,
      arrival_mode: form.arrival_mode, chief_complaint: form.chief_complaint,
      injury_mechanism: form.injury_mechanism,
    })
    .select()
    .single();

  if (regErr) throw regErr;

  // 3. Record vitals if provided
  if (form.hr || form.spo2) {
    await supabase.from('patient_vitals').insert({
      patient_id: patient.id, registration_id: reg.id,
      heart_rate: form.hr,
      systolic_bp: form.bp ? parseInt(form.bp.split('/')[0]) : null,
      diastolic_bp: form.bp ? parseInt(form.bp.split('/')[1]) : null,
      respiratory_rate: form.rr, spo2: form.spo2, temperature: form.temperature,
      is_critical: (form.spo2 || 100) < 90 || (form.hr || 80) > 120,
    });
  }

  // 4. Create initial triage
  if (form.triage_category) {
    await supabase.from('triage_assessments').insert({
      registration_id: reg.id, patient_id: patient.id,
      category: form.triage_category,
      gcs_eye: form.gcs ? 4 : null, gcs_verbal: 5, gcs_motor: 6,
    });
  }

  return { ...reg, patient } as EmergencyRegistration;
}

/** Update patient status */
export async function updatePatientStatus(registrationId: string, status: EmergencyRegistration['status']): Promise<void> {
  if (!isSupabaseConfigured()) {
    const reg = DEMO_REGISTRATIONS.find(r => r.id === registrationId);
    if (reg) {
      reg.status = status;
      reg.updated_at = new Date().toISOString();
      notifyRegistrationListeners();
    }
    return;
  }
  const { error } = await supabase
    .from('emergency_registrations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', registrationId);
  if (error) throw error;
}

/** Confirm triage category */
export async function confirmTriage(registrationId: string, category: TriageCategory, doctorId?: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const reg = DEMO_REGISTRATIONS.find(r => r.id === registrationId);
    if (reg) {
      if (reg.triage) {
        reg.triage.category = category;
        reg.triage.confirmed_by_doc = doctorId;
        reg.triage.confirmed_at = new Date().toISOString();
      } else {
        reg.triage = {
          id: `T-${Date.now()}`,
          registration_id: registrationId,
          patient_id: reg.patient_id,
          category,
          assessed_at: new Date().toISOString(),
          confirmed_by_doc: doctorId,
          confirmed_at: new Date().toISOString(),
          is_mass_casualty: false
        };
      }
      reg.updated_at = new Date().toISOString();
      notifyRegistrationListeners();
    }
    return;
  }
  const { error } = await supabase
    .from('triage_assessments')
    .update({ category, confirmed_by_doc: doctorId, confirmed_at: new Date().toISOString() })
    .eq('registration_id', registrationId);
  if (error) throw error;
}

/** Record new vitals */
export async function recordVitals(patientId: string, registrationId: string, vitals: Partial<PatientVitals>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const reg = DEMO_REGISTRATIONS.find(r => r.id === registrationId);
    if (reg) {
      const isCritical = (vitals.spo2 || 100) < 90 || (vitals.heart_rate || 80) > 130 || (vitals.heart_rate || 80) < 40;
      reg.latest_vitals = {
        id: `V-${Date.now()}`,
        patient_id: patientId,
        registration_id: registrationId,
        recorded_at: new Date().toISOString(),
        is_critical: isCritical,
        ...vitals
      };
      reg.updated_at = new Date().toISOString();
      notifyRegistrationListeners();
    }
    return;
  }
  const isCritical = (vitals.spo2 || 100) < 90 || (vitals.heart_rate || 80) > 130 || (vitals.heart_rate || 80) < 40;
  const { error } = await supabase.from('patient_vitals').insert({
    patient_id: patientId, registration_id: registrationId,
    ...vitals, is_critical: isCritical, recorded_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Subscribe to real-time registration changes */
export function subscribeToRegistrations(callback: (registrations: EmergencyRegistration[]) => void) {
  if (!isSupabaseConfigured()) {
    registrationListeners.add(callback);
    callback([...DEMO_REGISTRATIONS]);
    return () => {
      registrationListeners.delete(callback);
    };
  }

  const channel = supabase
    .channel('emergency_registrations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_registrations' },
      async () => {
        const data = await fetchRegistrations();
        callback(data);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
