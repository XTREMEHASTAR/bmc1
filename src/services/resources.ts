import { supabase, HOSPITAL_ID, isSupabaseConfigured } from '../lib/supabase';
import { TraumaBay, Ambulance, Resource, Incident } from '../types/emergency';

// ============================================================
// DEMO DATA
// ============================================================
export const DEMO_BAYS: TraumaBay[] = [
  { id: 'BAY-1', hospital_id: HOSPITAL_ID, bay_number: 1, status: 'OCCUPIED', has_ventilator: true, has_monitor: true, has_defib: true, updated_at: new Date().toISOString() },
  { id: 'BAY-2', hospital_id: HOSPITAL_ID, bay_number: 2, status: 'OCCUPIED', has_ventilator: false, has_monitor: true, has_defib: true, updated_at: new Date().toISOString() },
  { id: 'BAY-3', hospital_id: HOSPITAL_ID, bay_number: 3, status: 'OCCUPIED', has_ventilator: true, has_monitor: true, has_defib: false, updated_at: new Date().toISOString() },
  { id: 'BAY-4', hospital_id: HOSPITAL_ID, bay_number: 4, status: 'AVAILABLE', has_ventilator: true, has_monitor: true, has_defib: true, updated_at: new Date().toISOString() },
  { id: 'BAY-5', hospital_id: HOSPITAL_ID, bay_number: 5, status: 'CLEANING', has_ventilator: false, has_monitor: false, has_defib: false, notes: 'Deep clean in progress, 6 mins remaining', updated_at: new Date().toISOString() },
  { id: 'BAY-6', hospital_id: HOSPITAL_ID, bay_number: 6, status: 'MAINTENANCE', has_ventilator: false, has_monitor: false, has_defib: false, notes: 'Monitor calibration', updated_at: new Date().toISOString() },
];

export const DEMO_AMBULANCES: Ambulance[] = [
  {
    id: 'AMB-03', hospital_id: HOSPITAL_ID, vehicle_no: 'MH-01-EF-0312', call_sign: 'AMB-MCGM-03',
    type: 'ALS', status: 'TRANSPORTING', fuel_pct: 85,
    has_ventilator: true, has_aed: true, oxygen_pct: 92, has_ecg: true,
    lat: 19.033, lng: 72.854, updated_at: new Date().toISOString(),
    driver: { id: 'DR-1', hospital_id: HOSPITAL_ID, role: 'AMBULANCE_STAFF', name: 'Vijay Salunkhe', phone: '9820011223', is_active: true, created_at: '', updated_at: '' },
    paramedic: { id: 'PM-1', hospital_id: HOSPITAL_ID, role: 'DOCTOR', name: 'Dr. Alok Mehta', is_active: true, created_at: '', updated_at: '' },
    active_mission: { id: 'MSN-1', ambulance_id: 'AMB-03', patient_id: 'P-801', pickup_location: 'WEH Bandra', eta_minutes: 4, dispatched_at: new Date(Date.now() - 10 * 60000).toISOString(), is_active: true },
  },
  {
    id: 'AMB-09', hospital_id: HOSPITAL_ID, vehicle_no: 'MH-01-EF-0901', call_sign: 'AMB-MCGM-09',
    type: 'ALS', status: 'TRANSPORTING', fuel_pct: 62,
    has_ventilator: false, has_aed: true, oxygen_pct: 88, has_ecg: true,
    lat: 19.041, lng: 72.863, updated_at: new Date().toISOString(),
    driver: { id: 'DR-2', hospital_id: HOSPITAL_ID, role: 'AMBULANCE_STAFF', name: 'Ganesh Shinde', is_active: true, created_at: '', updated_at: '' },
    paramedic: { id: 'PM-2', hospital_id: HOSPITAL_ID, role: 'NURSE', name: 'Nisha Kamble', is_active: true, created_at: '', updated_at: '' },
    active_mission: { id: 'MSN-2', ambulance_id: 'AMB-09', patient_id: 'P-802', pickup_location: 'Sion Circle Flyover', eta_minutes: 9, dispatched_at: new Date(Date.now() - 6 * 60000).toISOString(), is_active: true },
  },
  {
    id: 'AMB-12', hospital_id: HOSPITAL_ID, vehicle_no: 'MH-01-EF-1204', call_sign: 'AMB-MCGM-12',
    type: 'BLS', status: 'AVAILABLE', fuel_pct: 98,
    has_ventilator: true, has_aed: true, oxygen_pct: 95, has_ecg: false,
    lat: 19.037, lng: 72.860, updated_at: new Date().toISOString(),
    driver: { id: 'DR-3', hospital_id: HOSPITAL_ID, role: 'AMBULANCE_STAFF', name: 'Suresh Naik', is_active: true, created_at: '', updated_at: '' },
    paramedic: { id: 'PM-3', hospital_id: HOSPITAL_ID, role: 'NURSE', name: 'Milind Sawant', is_active: true, created_at: '', updated_at: '' },
  },
];

export const DEMO_INCIDENTS: Incident[] = [
  { id: 'INC-1', hospital_id: HOSPITAL_ID, incident_no: 'INC-MCI-01', title: 'Commercial Complex Fire Outbreak', location: 'Saki Naka Metro Junction', lat: 19.094, lng: 72.891, severity: 'CRITICAL', type: 'FIRE_INCIDENT', status: 'OPEN', victims_count: 14, critical_count: 4, reported_at: new Date(Date.now() - 20 * 60000).toISOString(), is_mci: true },
  { id: 'INC-2', hospital_id: HOSPITAL_ID, incident_no: 'INC-TRAF-09', title: 'Double Taxi Rear-End Collision', location: 'Western Express Highway (Bandra)', lat: 19.059, lng: 72.836, severity: 'MEDIUM', type: 'ROAD_ACCIDENT', status: 'OPEN', victims_count: 3, critical_count: 1, reported_at: new Date(Date.now() - 10 * 60000).toISOString(), is_mci: false },
];

export const DEMO_RESOURCES: Resource[] = [
  { id: 'R-1', hospital_id: HOSPITAL_ID, name: 'ICU Beds', type: 'ICU_BED', total: 24, available: 3, in_use: 19, maintenance: 2, unit: 'beds', location: 'ICU Floor 3', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'R-2', hospital_id: HOSPITAL_ID, name: 'High-Flow Ventilators', type: 'VENTILATOR', total: 12, available: 4, in_use: 7, maintenance: 1, unit: 'units', location: 'ICU / ER', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'R-3', hospital_id: HOSPITAL_ID, name: 'O Negative Blood Units', type: 'BLOOD_UNIT', total: 20, available: 12, in_use: 6, maintenance: 0, unit: 'units', location: 'Blood Bank', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'R-4', hospital_id: HOSPITAL_ID, name: 'OT Suites', type: 'OT_SUITE', total: 6, available: 2, in_use: 3, maintenance: 1, unit: 'suites', location: 'Floor 4', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'R-5', hospital_id: HOSPITAL_ID, name: 'Wheelchairs', type: 'WHEELCHAIR', total: 30, available: 18, in_use: 12, maintenance: 0, unit: 'units', location: 'ER Reception', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'R-6', hospital_id: HOSPITAL_ID, name: 'Stretchers', type: 'STRETCHER', total: 20, available: 8, in_use: 11, maintenance: 1, unit: 'units', location: 'ER', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'R-7', hospital_id: HOSPITAL_ID, name: 'Oxygen Cylinders', type: 'OXYGEN_CYLINDER', total: 50, available: 28, in_use: 20, maintenance: 2, unit: 'cylinders', location: 'Central Store', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'R-8', hospital_id: HOSPITAL_ID, name: 'Cardiac Monitors', type: 'MONITOR', total: 18, available: 5, in_use: 12, maintenance: 1, unit: 'units', location: 'ER / ICU', last_checked: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ============================================================
// REAL-TIME EVENT STREAMING (OFFLINE / DEMO EMULATION)
// ============================================================
import { DEMO_REGISTRATIONS, notifyRegistrationListeners } from './patients';

const bayListeners = new Set<() => void>();
const ambulanceListeners = new Set<() => void>();
const resourceListeners = new Set<() => void>();

function notifyBayListeners() {
  bayListeners.forEach(cb => cb());
}

function notifyAmbulanceListeners() {
  ambulanceListeners.forEach(cb => cb());
}

function notifyResourceListeners() {
  resourceListeners.forEach(cb => cb());
}

// ============================================================
// TRAUMA BAYS
// ============================================================
export async function fetchTraumaBays(): Promise<TraumaBay[]> {
  if (!isSupabaseConfigured()) return DEMO_BAYS;
  const { data, error } = await supabase
    .from('trauma_bays')
    .select('*, active_assignment:bay_assignments(*, patient:patients(*))')
    .eq('hospital_id', HOSPITAL_ID)
    .order('bay_number');
  if (error) throw error;
  return data as TraumaBay[];
}

export async function updateBayStatus(bayId: string, status: TraumaBay['status'], notes?: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const bay = DEMO_BAYS.find(b => b.id === bayId);
    if (bay) {
      bay.status = status;
      if (notes !== undefined) bay.notes = notes;
      bay.updated_at = new Date().toISOString();
      notifyBayListeners();
    }
    return;
  }
  const { error } = await supabase
    .from('trauma_bays')
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq('id', bayId);
  if (error) throw error;
}

export async function assignPatientToBay(bayId: string, registrationId: string, patientId: string, doctorId?: string, nurseId?: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const bay = DEMO_BAYS.find(b => b.id === bayId);
    const reg = DEMO_REGISTRATIONS.find(r => r.id === registrationId);
    
    if (bay && reg) {
      // 1. Release previous active assignments for this bay
      DEMO_BAYS.forEach(b => {
        if (b.active_assignment?.bay_id === bayId) {
          b.active_assignment = undefined;
          if (b.status === 'OCCUPIED') b.status = 'AVAILABLE';
        }
      });

      // 2. Set new assignment
      const assignmentId = `BA-${Date.now()}`;
      const newAssignment = {
        id: assignmentId,
        bay_id: bayId,
        registration_id: registrationId,
        patient_id: patientId,
        assigned_doctor: doctorId || 'Dr. Vikram Deshmukh',
        assigned_nurse: nurseId || 'Sister Sneha Shinde',
        assigned_at: new Date().toISOString(),
        is_active: true,
        patient: reg.patient,
      };

      bay.status = 'OCCUPIED';
      bay.active_assignment = newAssignment;
      bay.updated_at = new Date().toISOString();

      // 3. Update active_bay on the patient registration
      reg.active_bay = {
        id: assignmentId,
        bay_id: bayId,
        registration_id: registrationId,
        patient_id: patientId,
        assigned_at: new Date().toISOString(),
        is_active: true,
        bay: {
          id: bay.id,
          hospital_id: bay.hospital_id,
          bay_number: bay.bay_number,
          status: 'OCCUPIED',
          has_ventilator: bay.has_ventilator,
          has_monitor: bay.has_monitor,
          has_defib: bay.has_defib,
          updated_at: new Date().toISOString()
        }
      };

      // 4. Update status to resuscitating if was arrived
      if (reg.status === 'ARRIVED' || reg.status === 'EN_ROUTE') {
        reg.status = 'RESUSCITATING';
      }

      notifyBayListeners();
      notifyRegistrationListeners();
    }
    return;
  }

  await supabase.from('bay_assignments').update({ is_active: false, released_at: new Date().toISOString() }).eq('bay_id', bayId).eq('is_active', true);
  const { error } = await supabase.from('bay_assignments').insert({ bay_id: bayId, registration_id: registrationId, patient_id: patientId, assigned_doctor: doctorId, assigned_nurse: nurseId });
  if (error) throw error;
  await supabase.from('trauma_bays').update({ status: 'OCCUPIED', updated_at: new Date().toISOString() }).eq('id', bayId);
}

export function subscribeToTraumaBays(callback: () => void) {
  if (!isSupabaseConfigured()) {
    bayListeners.add(callback);
    callback();
    return () => {
      bayListeners.delete(callback);
    };
  }
  const ch = supabase.channel('trauma_bays').on('postgres_changes', { event: '*', schema: 'public', table: 'trauma_bays' }, callback).subscribe();
  return () => supabase.removeChannel(ch);
}

// ============================================================
// AMBULANCES
// ============================================================
export async function fetchAmbulances(): Promise<Ambulance[]> {
  if (!isSupabaseConfigured()) return DEMO_AMBULANCES;
  const { data, error } = await supabase
    .from('ambulances')
    .select('*, driver:staff_profiles!driver_id(*), paramedic:staff_profiles!paramedic_id(*), active_mission:ambulance_missions(*, patient:patients(*))')
    .eq('hospital_id', HOSPITAL_ID);
  if (error) throw error;
  return data as Ambulance[];
}

export async function updateAmbulanceGPS(ambulanceId: string, lat: number, lng: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const amb = DEMO_AMBULANCES.find(a => a.id === ambulanceId);
    if (amb) {
      amb.lat = lat;
      amb.lng = lng;
      amb.last_gps_at = new Date().toISOString();
      notifyAmbulanceListeners();
    }
    return;
  }
  await supabase.from('ambulance_gps_log').insert({ ambulance_id: ambulanceId, lat, lng });
  await supabase.from('ambulances').update({ lat, lng, last_gps_at: new Date().toISOString() }).eq('id', ambulanceId);
}

export function subscribeToAmbulances(callback: () => void) {
  if (!isSupabaseConfigured()) {
    ambulanceListeners.add(callback);
    callback();
    return () => {
      ambulanceListeners.delete(callback);
    };
  }
  const ch = supabase.channel('ambulances').on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, callback).subscribe();
  return () => supabase.removeChannel(ch);
}

// ============================================================
// INCIDENTS
// ============================================================
export async function fetchIncidents(): Promise<Incident[]> {
  if (!isSupabaseConfigured()) return DEMO_INCIDENTS;
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('hospital_id', HOSPITAL_ID)
    .eq('status', 'OPEN')
    .order('reported_at', { ascending: false });
  if (error) throw error;
  return data as Incident[];
}

export async function createIncident(incident: Partial<Incident>): Promise<Incident> {
  if (!isSupabaseConfigured()) {
    const demo = { ...incident, id: `INC-${Date.now()}`, incident_no: `INC-${Date.now()}`, hospital_id: HOSPITAL_ID, victims_count: 1, critical_count: 0, reported_at: new Date().toISOString(), status: 'OPEN', is_mci: false } as Incident;
    DEMO_INCIDENTS.unshift(demo);
    // Notify bay/ambulance/resource listeners since incident status is critical
    notifyAmbulanceListeners();
    return demo;
  }
  const { data, error } = await supabase.from('incidents').insert({ ...incident, hospital_id: HOSPITAL_ID, incident_no: `INC-${Date.now()}` }).select().single();
  if (error) throw error;
  return data as Incident;
}

// ============================================================
// RESOURCES
// ============================================================
export async function fetchResources(): Promise<Resource[]> {
  if (!isSupabaseConfigured()) return DEMO_RESOURCES;
  const { data, error } = await supabase.from('resources').select('*').eq('hospital_id', HOSPITAL_ID).order('type');
  if (error) throw error;
  return data as Resource[];
}

export async function updateResourceAvailability(resourceId: string, available: number, inUse: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const res = DEMO_RESOURCES.find(r => r.id === resourceId);
    if (res) {
      res.available = available;
      res.in_use = inUse;
      res.updated_at = new Date().toISOString();
      notifyResourceListeners();
    }
    return;
  }
  const { error } = await supabase.from('resources').update({ available, in_use: inUse, updated_at: new Date().toISOString() }).eq('id', resourceId);
  if (error) throw error;
}

export function subscribeToResources(callback: () => void) {
  if (!isSupabaseConfigured()) {
    resourceListeners.add(callback);
    callback();
    return () => {
      resourceListeners.delete(callback);
    };
  }
  const ch = supabase.channel('resources').on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, callback).subscribe();
  return () => supabase.removeChannel(ch);
}
