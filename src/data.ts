import { Hospital, Department, Doctor, Appointment, HealthRecord, Transaction, NotificationItem } from './types';

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Sion Hospital',
    location: 'Sion, Mumbai',
    distance: '0.8 KM AWAY',
    openInfo: 'OPEN 24/7'
  },
  {
    id: 'h2',
    name: 'KEM Hospital',
    location: 'Parel, Mumbai',
    distance: '2.4 KM AWAY',
    openInfo: 'OPEN 24/7'
  },
  {
    id: 'h3',
    name: 'Nair Hospital',
    location: 'Mumbai Central, Mumbai',
    distance: '4.1 KM AWAY',
    openInfo: 'OPEN 24/7'
  },
  {
    id: 'h4',
    name: 'Cooper Hospital',
    location: 'Juhu, Mumbai',
    distance: '6.5 KM AWAY',
    openInfo: 'OPEN 24/7'
  }
];

export const DEPARTMENTS: Department[] = [
  {
    id: 'd1',
    name: 'Cardiology',
    category: 'Heart & Vascular',
    icon: 'HeartPulse',
    description: 'Expert diagnostics and therapies for cardiovascular conditions and disease prevention.'
  },
  {
    id: 'd2',
    name: 'General Medicine',
    category: 'Primary Care',
    icon: 'BriefcaseMedical',
    description: 'General OPD health assessments, diagnostic triage, chronic care, and specialist referral.'
  },
  {
    id: 'd3',
    name: 'Orthopaedics',
    category: 'Bones & Joints',
    icon: 'Activity',
    description: 'Bone, joint, ligament, and bone density specialists for structural and physical rehabilitation.'
  },
  {
    id: 'd4',
    name: 'ENT',
    category: 'Ear, Nose, Throat',
    icon: 'Ear',
    description: 'Comprehensive audiological and airway care, throat therapies, and ENT procedures.'
  },
  {
    id: 'd5',
    name: 'Ophthalmology',
    category: 'Eye Care',
    icon: 'Eye',
    description: 'Advanced vision screening, prescription corrective wear, glaucoma management, and surgery.'
  },
  {
    id: 'd6',
    name: 'Paediatrics',
    category: 'Child Health',
    icon: 'Smile',
    description: 'Dedicated newborn development, wellness, immunizations, and paediatric care.'
  },
  {
    id: 'd7',
    name: 'Neurology',
    category: 'Brain & Nerves',
    icon: 'Brain',
    description: 'Advanced neural diagnostic systems, cognitive assessments, and neuropathic therapeutics.'
  },
  {
    id: 'd8',
    name: 'Dermatology',
    category: 'Skin Specialist',
    icon: 'Sparkles',
    description: 'Acne, eczema, psoriasis treatments, cancer screenings, and specialized skin therapy.'
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Arvind Kulkarni',
    specialty: 'Cardiology',
    hospitalId: 'h2', // KEM
    fee: 500,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
    availableSlots: {
      morning: ['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      afternoon: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM']
    }
  },
  {
    id: 'doc2',
    name: 'Dr. S. Mehta',
    specialty: 'Orthopaedics',
    hospitalId: 'h1', // Sion
    fee: 350,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
    availableSlots: {
      morning: ['08:30 AM', '09:00 AM', '10:00 AM', '10:30 AM'],
      afternoon: ['02:00 PM', '03:00 PM', '04:00 PM']
    }
  },
  {
    id: 'doc3',
    name: 'Dr. Amit Shah',
    specialty: 'General Medicine',
    hospitalId: 'h1', // Sion
    fee: 200,
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200&h=200',
    availableSlots: {
      morning: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      afternoon: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM']
    }
  },
  {
    id: 'doc4',
    name: 'Dr. Priya Sharma',
    specialty: 'Paediatrics',
    hospitalId: 'h3', // Nair
    fee: 300,
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=200&h=200',
    availableSlots: {
      morning: ['10:00 AM', '10:30 AM', '11:00 AM'],
      afternoon: ['03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
    }
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt1',
    hospital: HOSPITALS[0], // Sion Hospital
    department: DEPARTMENTS[2], // Orthopaedics
    doctor: DOCTORS[1], // Dr. S. Mehta
    dateStr: 'Wednesday, May 21',
    timeStr: '10:30 AM',
    tokenNo: 'OPD1234',
    status: 'CONFIRMED',
    queueAhead: 12,
    waitTimeMinutes: 45,
    referenceId: '#MCGM-2023-882190'
  }
];

export const INITIAL_RECORDS: HealthRecord[] = [
  {
    id: 'rec1',
    title: 'Prescription',
    doctorName: 'Dr. S. Mehta',
    source: 'Sion Hospital',
    date: '21 MAY 2025',
    type: 'PDF'
  },
  {
    id: 'rec2',
    title: 'Blood Test Report',
    doctorName: 'Dr. S. Kulkarni',
    source: 'Metropolis Labs, Worli',
    date: '18 MAY 2025',
    type: 'PDF',
    isBloodReport: true,
    hematologyResults: [
      { parameter: 'Hemoglobin', result: 14.2, unit: 'g/dL', normalRange: '13.5 - 17.5', status: 'normal' },
      { parameter: 'RBC Count', result: 4.1, unit: 'million/µL', normalRange: '4.5 - 5.9', status: 'low' },
      { parameter: 'WBC Count', result: 7500, unit: 'cells/mm³', normalRange: '4000 - 11000', status: 'normal' },
      { parameter: 'Platelet Count', result: 460000, unit: 'cells/mm³', normalRange: '150000 - 450000', status: 'high' },
      { parameter: 'HCT', result: 42.5, unit: '%', normalRange: '41.0 - 50.0', status: 'normal' }
    ],
    clinicalInterpretation: `The report indicates a mild reduction in Red Blood Cell (RBC) count, which may be suggestive of early-stage iron deficiency or nutritional factors. Hemoglobin levels remain within the lower end of the normal range.

Platelet count is slightly elevated (Thrombocytosis), which can often be a reactive response to minor infections or inflammation. No immediate clinical emergency is indicated based on these parameters.`
  },
  {
    id: 'rec3',
    title: 'X-Ray (Left Knee)',
    doctorName: 'Dr. R. Patil',
    source: 'Nair Hospital Radiology',
    date: '15 MAY 2025',
    type: 'IMG'
  },
  {
    id: 'rec4',
    title: 'COVID-19 Booster',
    doctorName: 'KEM Vaccination Hub',
    source: 'KEM Vaccination Hub',
    date: '05 JAN 2024',
    type: 'CERT'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'debit',
    title: 'UPI Payment',
    dateStr: 'Today, 10:45 AM',
    amount: 450.00,
    status: 'SUCCESS'
  },
  {
    id: 't2',
    type: 'debit',
    title: 'OPD Consultation',
    dateStr: 'Yesterday, 02:15 PM',
    amount: 200.00,
    status: 'SUCCESS'
  },
  {
    id: 't3',
    type: 'credit',
    title: 'Wallet Refill',
    dateStr: '22 Oct, 09:00 AM',
    amount: 1000.00,
    status: 'COMPLETED'
  },
  {
    id: 't4',
    type: 'debit',
    title: 'Lab Test Payment',
    dateStr: '21 Oct, 11:30 AM',
    amount: 1250.00,
    status: 'SUCCESS'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'appointment',
    title: 'Appointment Reminder',
    desc: 'Your appointment at KEM Hospital is in 2 hours.',
    timeAgo: '2h ago',
    isRead: false
  },
  {
    id: 'n2',
    type: 'report',
    title: 'Lab Report Ready',
    desc: 'Your Blood Test results are now available for viewing.',
    timeAgo: '5h ago',
    isRead: false
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Payment Success',
    desc: 'Payment of ₹500 for consultation was successful.',
    timeAgo: 'Yesterday',
    isRead: true
  },
  {
    id: 'n4',
    type: 'feature',
    title: 'New Feature Available',
    desc: 'You can now book vaccinations for your family members through the Wallet tab.',
    timeAgo: '2 days ago',
    isRead: false
  }
];
