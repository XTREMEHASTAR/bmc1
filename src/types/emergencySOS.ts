// Emergency SOS Module Types (Citizen App)

export type EmergencyPerson = 'myself' | 'family' | 'someone';

export type EmergencyType = 
  | 'Road Accident' | 'Chest Pain' | 'Stroke' | 'Breathing Difficulty'
  | 'Fall' | 'Burn' | 'Poisoning' | 'Pregnancy' | 'Heart Attack'
  | 'Unconscious' | 'Other';

export type ArrivalMode = 'ambulance' | 'taxi' | 'private' | 'walkin';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  relation: string;
  bloodGroup: string;
  conditions: string;
  phone: string;
  photo: string;
}

export type EmergencySOSStatus = 
  | 'sos_sent' | 'hospital_accepted' | 'ambulance_assigned'
  | 'ambulance_arriving' | 'patient_picked' | 'hospital_reached'
  | 'registration_complete' | 'doctor_assigned' | 'treatment_started'
  | 'icu' | 'ward' | 'discharged';

export interface SOSTimelineEvent {
  id: string;
  status: EmergencySOSStatus;
  label: string;
  time: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  icon: string;
  color: string;
}

export interface NearbyHospital {
  id: string;
  name: string;
  distance: string;
  eta: string;
  beds: number;
  erStatus: 'Available' | 'Busy' | 'Full';
  departments: string[];
  phone: string;
  image: string;
}

export interface SOSRequest {
  id: string;
  emergencyId: string;
  person: EmergencyPerson;
  type: EmergencyType;
  description: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  bloodGroup: string;
  knownDiseases: string;
  status: EmergencySOSStatus;
  hospitalName: string;
  doctorName: string;
  ambulanceId: string;
  driverName: string;
  paramedicName: string;
  eta: number;
  uhid: string;
  createdAt: string;
  timeline: SOSTimelineEvent[];
  arrivalMode: ArrivalMode;
}

export type SOSFlowStep = 'home' | 'who' | 'what' | 'where' | 'patient' | 'confirm' | 'tracking' | 'history' | 'family' | 'contacts' | 'hospitals' | 'voice';
