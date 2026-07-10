export interface Hospital {
  id: string;
  name: string;
  location: string;
  distance: string;
  openInfo: string;
}

export interface Department {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  fee: number;
  image: string;
  availableSlots: {
    morning: string[];
    afternoon: string[];
  };
}

export interface Appointment {
  id: string;
  hospital: Hospital;
  department: Department;
  doctor: Doctor;
  dateStr: string; // e.g. "Wednesday, Oct 25"
  timeStr: string; // e.g. "10:30 AM"
  tokenNo: string; // e.g. "OPD1234"
  status: 'CONFIRMED' | 'COMPLETED' | 'PENDING';
  queueAhead: number;
  waitTimeMinutes: number;
  referenceId: string;
}

export interface HematologyResult {
  parameter: string;
  result: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'low' | 'high';
}

export interface HealthRecord {
  id: string;
  title: string;
  doctorName?: string;
  source: string;
  date: string;
  type: 'PDF' | 'IMG' | 'CERT';
  url?: string;
  isBloodReport?: boolean;
  hematologyResults?: HematologyResult[];
  clinicalInterpretation?: string;
}

export interface Transaction {
  id: string;
  type: 'debit' | 'credit';
  title: string;
  dateStr: string;
  amount: number;
  status: 'SUCCESS' | 'COMPLETED' | 'FAILED';
}

export interface NotificationItem {
  id: string;
  type: 'appointment' | 'report' | 'payment' | 'feature';
  title: string;
  desc: string;
  timeAgo: string;
  isRead: boolean;
}

export interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  waitTime: number;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  diagnosis: string;
  status: 'Waiting' | 'In Consultation' | 'Completed';
  photo: string;
}
