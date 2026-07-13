import type { FamilyMember, EmergencyContact, NearbyHospital, SOSTimelineEvent, SOSRequest } from '../types/emergencySOS';

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'fm1', name: 'Sangeeta Patil', age: 27, gender: 'Female', relation: 'Wife', bloodGroup: 'A+', conditions: 'None', phone: '+91 98765 43210', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 'fm2', name: 'Anil Patil', age: 58, gender: 'Male', relation: 'Father', bloodGroup: 'O+', conditions: 'Hypertension, Diabetes', phone: '+91 91234 56789', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 'fm3', name: 'Shaila Patil', age: 55, gender: 'Female', relation: 'Mother', bloodGroup: 'B+', conditions: 'Arthritis', phone: '+91 90123 45678', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150' },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'ec1', name: 'Ambulance (108)', number: '108', icon: '🚑', color: 'bg-red-50 text-red-600' },
  { id: 'ec2', name: 'Police (100)', number: '100', icon: '🚔', color: 'bg-blue-50 text-blue-600' },
  { id: 'ec3', name: 'Fire Brigade (101)', number: '101', icon: '🚒', color: 'bg-orange-50 text-orange-600' },
  { id: 'ec4', name: 'Women Helpline (1091)', number: '1091', icon: '👩', color: 'bg-pink-50 text-pink-600' },
  { id: 'ec5', name: 'Child Helpline (1098)', number: '1098', icon: '👶', color: 'bg-purple-50 text-purple-600' },
  { id: 'ec6', name: 'Poison Control (1066)', number: '1066', icon: '☠️', color: 'bg-amber-50 text-amber-600' },
  { id: 'ec7', name: 'Disaster Mgmt (1078)', number: '1078', icon: '⚠️', color: 'bg-yellow-50 text-yellow-700' },
];

export const NEARBY_HOSPITALS: NearbyHospital[] = [
  { id: 'h1', name: 'Sion Hospital (LTMGH)', distance: '1.2 km', eta: '8 mins', beds: 12, erStatus: 'Available', departments: ['Trauma', 'Ortho', 'General'], phone: '022-24071234', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'h2', name: 'KEM Hospital', distance: '3.8 km', eta: '15 mins', beds: 8, erStatus: 'Available', departments: ['Cardiology', 'Neuro', 'Trauma'], phone: '022-24107000', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'h3', name: 'Nair Hospital', distance: '5.1 km', eta: '22 mins', beds: 3, erStatus: 'Busy', departments: ['General', 'Pediatrics'], phone: '022-23027000', image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=300&h=200' },
];

export const MOCK_TIMELINE: SOSTimelineEvent[] = [
  { id: 't1', status: 'sos_sent', label: 'SOS Alert Sent', time: '10:21 AM', isCompleted: true, isActive: false },
  { id: 't2', status: 'hospital_accepted', label: 'Hospital Accepted', time: '10:22 AM', isCompleted: true, isActive: false },
  { id: 't3', status: 'ambulance_assigned', label: 'Ambulance Assigned', time: '10:23 AM', isCompleted: true, isActive: false },
  { id: 't4', status: 'ambulance_arriving', label: 'Ambulance Arriving', time: '10:28 AM', isCompleted: false, isActive: true },
  { id: 't5', status: 'patient_picked', label: 'Patient Picked Up', time: '--', isCompleted: false, isActive: false },
  { id: 't6', status: 'hospital_reached', label: 'Hospital Reached', time: '--', isCompleted: false, isActive: false },
  { id: 't7', status: 'registration_complete', label: 'Registration Done', time: '--', isCompleted: false, isActive: false },
  { id: 't8', status: 'doctor_assigned', label: 'Doctor Assigned', time: '--', isCompleted: false, isActive: false },
  { id: 't9', status: 'treatment_started', label: 'Treatment Started', time: '--', isCompleted: false, isActive: false },
];

export const PAST_EMERGENCIES: SOSRequest[] = [
  {
    id: 'pe1', emergencyId: 'EID2025050100001', person: 'family', type: 'Fall',
    description: 'Father fell at home',
    patientName: 'Anil Patil', patientAge: 58,
    patientGender: 'Male', bloodGroup: 'O+', knownDiseases: 'Hypertension',
    status: 'discharged', hospitalName: 'Sion Hospital', doctorName: 'Dr. Mehta',
    ambulanceId: 'MH-01-AB-1234', driverName: 'Raju', paramedicName: 'Sunil',
    eta: 0, uhid: 'UHID-TMP-88201', createdAt: '21 May 2025 • 10:15 AM',
    arrivalMode: 'ambulance',
    timeline: [
      { id: 'pt1', status: 'sos_sent', label: 'SOS Sent', time: '10:15 AM', isCompleted: true, isActive: false },
      { id: 'pt2', status: 'hospital_accepted', label: 'Hospital Accepted', time: '10:17 AM', isCompleted: true, isActive: false },
      { id: 'pt3', status: 'discharged', label: 'Discharged', time: '4:30 PM', isCompleted: true, isActive: false },
    ]
  },
];

export const SAFETY_TIPS = [
  { id: 'st1', title: 'Keep Calm', desc: 'Stay calm and assess the situation before calling.' },
  { id: 'st2', title: 'Share Location', desc: 'Enable GPS for faster ambulance dispatch.' },
  { id: 'st3', title: 'First Aid', desc: 'Apply basic first aid if trained. Do not move spinal injury patients.' },
  { id: 'st4', title: 'Medical ID', desc: 'Keep your ABHA card and blood group info updated.' },
];
