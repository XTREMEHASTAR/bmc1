import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  Stethoscope,
  FlaskConical,
  Activity,
  FileSpreadsheet,
  Calendar,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Search,
  Video,
  Mic,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Share2,
  FileSignature,
  QrCode,
  Wifi,
  WifiOff,
  Server,
  Cpu,
  CloudSun,
  CheckCircle2,
  Building2,
  ExternalLink,
  ChevronRight,
  X,
  Volume2,
  Check,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Download,
  ShieldAlert,
  VolumeX,
  Maximize,
  Lock
} from 'lucide-react';
import { Patient, Appointment, HealthRecord, NotificationItem } from '../types';
import CommandCenterTab from './CommandCenterTab';
import CommandPalette from './CommandPalette';
import { VoiceIntentRouter, VoiceContextManager, VoiceActionDispatcher } from '../voice-os/VoiceCommandEngine';


interface DoctorDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  records: HealthRecord[];
  setRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  setPortal?: (portal: 'doctor' | 'patient' | 'nurse' | 'reception' | 'command' | 'ai' | 'laboratory' | 'radiology' | 'pharmacy' | 'emergency' | 'surgery' | 'icu') => void;
}

// Master Patient profiles lookup for high-fidelity clinical and demographic detail (Allergies, ABHA, Vitals History)
const PATIENT_DETAILS_MAP: Record<string, {
  abhaNo: string;
  abhaAddress: string;
  mcgmCardNo: string;
  phone: string;
  bloodGroup: string;
  address: string;
  lastVisit: string;
  allergies: string[];
  vitalsHistory: { date: string; bp: string; temp: string; pulse: number; spo2: number }[];
  pastDiagnoses: string[];
  pastVisits: { date: string; dept: string; doc: string; diag: string; meds: string }[];
  timelineEvents?: { date: string; type: 'birth' | 'vaccine' | 'visit' | 'surgery' | 'lab' | 'radiology' | 'discharge'; title: string; facility: string; details: string }[];
}> = {
  '1': {
    abhaNo: '91-8834-2910-4482',
    abhaAddress: 'rahul.patil@abha',
    mcgmCardNo: 'MCGM-SION-2026-0812',
    phone: '+91 98765 43210',
    bloodGroup: 'O Positive',
    address: 'Flat 402, Shiv Shanti Sadan, Dadar East, Mumbai 400014',
    lastVisit: 'Today, 09:30 AM',
    allergies: ['Sulfa Drugs', 'Ibuprofen'],
    vitalsHistory: [
      { date: '15 May', bp: '120/80', temp: '98.6', pulse: 72, spo2: 98 },
      { date: '04 Apr', bp: '118/76', temp: '100.2', pulse: 88, spo2: 97 },
      { date: '12 Jan', bp: '122/82', temp: '98.4', pulse: 70, spo2: 99 }
    ],
    pastDiagnoses: ['Knee Osteoarthritis', 'Vitamin D Deficiency'],
    pastVisits: [
      { date: '18 Jun 2026', dept: 'Orthopaedics', doc: 'Dr. Anil Patil', diag: 'Knee Osteoarthritis, Vitamin D Deficiency', meds: 'Tab. D3 60K once weekly, Tab. PCM 650mg' },
      { date: '04 Apr 2026', dept: 'General Medicine', doc: 'Dr. Sunita Deshmukh', diag: 'Mild Acute Viral Fever', meds: 'Tab. Paracetamol 650mg thrice daily' }
    ],
    timelineEvents: [
      { date: '18 Jun 2026', type: 'visit', title: 'Orthopaedics OPD Consultation', facility: 'Sion Municipal Hospital', details: 'Diagnosed with Bilateral Knee Osteoarthritis (Stage II) and severe Vitamin D deficiency. Prescribed Tab D3 60K & PCM.' },
      { date: '04 Apr 2026', type: 'visit', title: 'General Medicine Visit', facility: 'Sion Municipal Hospital', details: 'Presented with mild acute viral fever. Checked vitals: BP 118/76, Temp 100.2 F. Prescribed Paracetamol course.' },
      { date: '12 Jan 2026', type: 'lab', title: 'Serum Pathology Workup', facility: 'MCGM Central Laboratory', details: 'Serum Rheumatoid Factor: Negative (8.4 IU/mL). Serum Uric Acid: 5.8 mg/dL (Normal). Vitamin D3 level low: 12.5 ng/mL.' },
      { date: '15 Nov 2024', type: 'radiology', title: 'Bilateral Knee X-Ray AP/Lat', facility: 'Sion Hospital Imaging', details: 'Demonstrated moderate joint space narrowing in medial compartments with subchondral sclerosis and early osteophytes. Grade II OA.' },
      { date: '22 May 2018', type: 'surgery', title: 'Left Knee Arthroscopy & Debridement', facility: 'KEM Municipal Hospital', details: 'Day-care partial medial meniscectomy. Performed by Ortho Unit II. Excised degenerative flap tear. Discharged stable.' },
      { date: '10 May 2018', type: 'discharge', title: 'Surgical Discharge Summary', facility: 'KEM Municipal Hospital', details: 'Admitted for left knee arthroscopic repair. Post-op recovery uneventful. Mobilized with partial weight-bearing.' },
      { date: '05 Mar 1994', type: 'vaccine', title: 'Hepatitis B & Tetanus Booster', facility: 'Dadar Primary Health Center', details: 'ABHA record sync: Booster vaccine dose administered on schedule.' },
      { date: '12 Aug 1981', type: 'birth', title: 'Birth Registration (Male Child)', facility: 'Sion Municipal Hospital', details: 'Delivered via normal vaginal delivery. Birth weight: 3.25 kg. APGAR score: 9/10 at 5 mins. Healthy maternal discharge.' }
    ]
  },
  '2': {
    abhaNo: '12-4091-8823-1190',
    abhaAddress: 'suresh.kumar@abha',
    mcgmCardNo: 'MCGM-SION-2026-4491',
    phone: '+91 98234 56789',
    bloodGroup: 'A Positive',
    address: 'Building 12, Kurla West Police Colony, Kurla, Mumbai 400070',
    lastVisit: 'Today, 10:15 AM',
    allergies: ['Penicillin'],
    vitalsHistory: [
      { date: '20 May', bp: '135/85', temp: '98.4', pulse: 78, spo2: 98 },
      { date: '11 Mar', bp: '130/82', temp: '98.6', pulse: 74, spo2: 99 }
    ],
    pastDiagnoses: ['Chronic Low Back Pain', 'L4-L5 Muscle Spasm'],
    pastVisits: [
      { date: '11 Mar 2026', dept: 'Orthopaedics', doc: 'Dr. Anil Patil', diag: 'Lumbar Strain & Spasm', meds: 'Tab. Aceclofenac 100mg twice daily' }
    ]
  },
  '3': {
    abhaNo: '33-9012-7721-6543',
    abhaAddress: 'ayesha.shaikh@abha',
    mcgmCardNo: 'MCGM-SION-2026-2218',
    phone: '+91 97654 32109',
    bloodGroup: 'B Negative',
    address: 'B-601, Sea Breeze Apartments, Bandra West, Mumbai 400050',
    lastVisit: 'Yesterday, 04:00 PM',
    allergies: ['Aspirin', 'Peanuts'],
    vitalsHistory: [
      { date: '22 May', bp: '110/70', temp: '98.2', pulse: 68, spo2: 99 },
      { date: '01 Feb', bp: '114/72', temp: '98.6', pulse: 72, spo2: 100 }
    ],
    pastDiagnoses: ['Shoulder Impingement Syndrome'],
    pastVisits: [
      { date: '01 Feb 2026', dept: 'Physiotherapy', doc: 'Dr. Rohan Kamble', diag: 'Shoulder Impingement', meds: 'Exercises, Tab. Tramadol 50mg SOS' }
    ]
  },
  '4': {
    abhaNo: '44-5566-7788-9900',
    abhaAddress: 'mahesh.jadhav@abha',
    mcgmCardNo: 'MCGM-SION-2026-3392',
    phone: '+91 95432 10987',
    bloodGroup: 'AB Positive',
    address: 'Chawl No. 4, Room 12, Sion Koliwada, Sion, Mumbai 400022',
    lastVisit: '2 Days Ago',
    allergies: [],
    vitalsHistory: [
      { date: '24 May', bp: '142/90', temp: '99.0', pulse: 84, spo2: 96 }
    ],
    pastDiagnoses: ['Left Ankle Fracture', 'Osteopenia'],
    pastVisits: [
      { date: '24 May 2026', dept: 'Trauma Care', doc: 'Dr. Anil Patil', diag: 'Left Ankle Distal Fibula Crack', meds: 'Plaster Cast, Cap. Calcium D3 daily' }
    ]
  },
  '5': {
    abhaNo: '55-1122-3344-5566',
    abhaAddress: 'priya.singh@abha',
    mcgmCardNo: 'MCGM-SION-2026-1029',
    phone: '+91 93210 98765',
    bloodGroup: 'O Negative',
    address: 'Ortho Rehab Quarter #2, Lalbaug, Parel, Mumbai 400012',
    lastVisit: '1 Week Ago',
    allergies: ['Sulfa Drugs'],
    vitalsHistory: [
      { date: '10 May', bp: '118/76', temp: '98.5', pulse: 70, spo2: 99 }
    ],
    pastDiagnoses: ['Rheumatoid Arthritis'],
    pastVisits: [
      { date: '10 May 2026', dept: 'Rheumatology', doc: 'Dr. Vinay Joshi', diag: 'RA Joint Flaring', meds: 'Tab. Methotrexate 10mg once weekly' }
    ]
  }
};

export default function DoctorDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout,
  patients,
  setPatients,
  appointments,
  setAppointments,
  records,
  setRecords,
  notifications,
  setNotifications,
  setPortal
}: DoctorDashboardProps) {
  // Navigation & Language States
  const [lang, setLang] = useState<'en' | 'mr' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'twin' | 'queue' | 'patients' | 'consultation' | 'labs' | 'reports' | 'messages' | 'settings' | 'timeline'>('dashboard');
  const [docStatus, setDocStatus] = useState<'Available' | 'Busy' | 'Offline'>('Available');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Ctrl+K command palette trigger listener
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);


  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState<'All' | 'Waiting' | 'In Consultation' | 'Completed'>('All');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'visit' | 'surgery' | 'lab' | 'vaccine'>('all');

  // Consultation States
  const [currentConsultingPatientId, setCurrentConsultingPatientId] = useState<string>('1');
  const currentConsultingPatient = patients.find(p => p.id === currentConsultingPatientId) || patients[0];
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('Knee Osteoarthritis (M17.1)');
  const [consultVitals, setConsultVitals] = useState({ bp: '128/82', pulse: '80', temp: '98.6', spo2: '98' });
  const [rxMeds, setRxMeds] = useState<{ name: string; dose: string; timing: string; duration: string }[]>([
    { name: 'Tab. Paracetamol 650mg', dose: '1-0-1', timing: 'After Food', duration: '5 Days' },
    { name: 'Tab. Pantoprazole 40mg', dose: '1-0-0', timing: 'Before Food', duration: '5 Days' }
  ]);
  const [newMed, setNewMed] = useState({ name: '', dose: '1-0-1', timing: 'After Food', duration: '5 Days' });

  // Offline Mode Simulation States
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineSyncState, setOfflineSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [offlinePendingChanges, setOfflinePendingChanges] = useState(0);

  // AI Multilingual Translation States
  const [scribeInputLang, setScribeInputLang] = useState<'mr' | 'hi' | 'en'>('en');
  const [scribePatientLang, setScribePatientLang] = useState<'mr' | 'hi' | 'en'>('hi');

  // Interactive Live Scribing States
  const [isScribing, setIsScribing] = useState(false);
  const [scribingText, setScribingText] = useState<string>('');
  const [scribingLogs, setScribingLogs] = useState<{ speaker: 'Doctor' | 'Patient'; text: string; time: string }[]>([]);
  const [soapNotes, setSoapNotes] = useState({
    subjective: 'Patient reports mild chronic stiffness in left knee joint. No history of fall or structural trauma.',
    objective: 'Moderate tenderness over the medial joint line of Left Knee. Passive flexion limited at 115 degrees. No effusion.',
    assessment: 'Primary Osteoarthritis of Left Knee Joint, early Stage 2.',
    plan: 'Advised quadriceps strengthening exercises, warm compression, and pain management. Scheduled follow-up in 2 weeks.'
  });
  
  // Voice logs Database
  const [savedVoiceLogs, setSavedVoiceLogs] = useState([
    { id: 'v1', patientName: 'Rahul Anil Patil', date: '08 Jul 2026', duration: '1 min 24 secs', size: '2.4 MB', filename: 'rx_consult_patil_0807.wav', encryption: 'AES-256 Encrypted', playing: false },
    { id: 'v2', patientName: 'Suresh Kumar', date: '08 Jul 2026', duration: '48 secs', size: '1.1 MB', filename: 'rx_consult_kumar_0807.wav', encryption: 'AES-256 Encrypted', playing: false },
    { id: 'v3', patientName: 'Ayesha Shaikh', date: '07 Jul 2026', duration: '2 mins 10 secs', size: '3.8 MB', filename: 'rx_consult_shaikh_0707.wav', encryption: 'AES-256 Encrypted', playing: false }
  ]);

  // Web Speech API Scribing
  const [speechRecognizer, setSpeechRecognizer] = useState<any>(null);
  const scribingEndRef = useRef<HTMLDivElement>(null);

  // Floating Voice Assistant States
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [isAssistantListening, setIsAssistantListening] = useState(false);
  const [assistantLogs, setAssistantLogs] = useState<{ text: string; type: 'info' | 'user' | 'success' | 'error' }[]>([
    { text: 'MCGM Voice AI Assistant initialized. Speak or select a command.', type: 'info' }
  ]);
  const [assistantSpeechRecognizer, setAssistantSpeechRecognizer] = useState<any>(null);
  const [customCommandInput, setCustomCommandInput] = useState('');


  // Digital Signature states
  const [doctorPin, setDoctorPin] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [isSignatureCanvasBlank, setIsSignatureCanvasBlank] = useState(true);
  const [signaturePaths, setSignaturePaths] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  // Lab Order & Radiology States
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [isLabUrgent, setIsLabUrgent] = useState(false);
  const [labNotes, setLabNotes] = useState('');
  const [activeLabPatient, setActiveLabPatient] = useState<Patient | null>(null);

  const [showRadiologyModal, setShowRadiologyModal] = useState(false);
  const [selectedRadiologyTests, setSelectedRadiologyTests] = useState<string[]>([]);
  const [radiologyCategory, setRadiologyCategory] = useState<'Brain' | 'Spine' | 'Chest' | 'Extremities'>('Extremities');
  const [isRadioUrgent, setIsRadioUrgent] = useState(false);
  const [radioNotes, setRadioNotes] = useState('');
  const [activeRadiologyPatient, setActiveRadiologyPatient] = useState<Patient | null>(null);

  // Refer Modal States
  const [showReferModal, setShowReferModal] = useState(false);
  const [referHospital, setReferHospital] = useState('KEM Hospital, Parel');
  const [referDept, setReferDept] = useState('Rheumatology & Immunology');
  const [referReason, setReferReason] = useState('Requires advanced rheumatology assessment and anti-CCP profile mapping.');
  const [activeReferPatient, setActiveReferPatient] = useState<Patient | null>(null);
  const [referralSlip, setReferralSlip] = useState<any | null>(null);

  // Certificate Modal States
  const [showCertModal, setShowCertModal] = useState(false);
  const [certType, setCertType] = useState('Medical Sickness Rest Certificate');
  const [certDurationDays, setCertDurationDays] = useState('5 Days');
  const [certDiagnosis, setCertDiagnosis] = useState('Acute Osteoarthritis Knee Joint inflammation');
  const [activeCertPatient, setActiveCertPatient] = useState<Patient | null>(null);

  // Search Patient Directory active selection
  const [selectedPatientId, setSelectedPatientId] = useState<string>('1');

  // Pending pathology reports lists (Dashboard Action items)
  const [pendingReports, setPendingReports] = useState([
    { id: 'rep1', patientName: 'Rahul Anil Patil', type: 'Biochemistry (Lipid Profile)', date: 'Today, 10:15 AM', status: 'Pending Review', values: 'Total Cholesterol: 245 mg/dL (High), HDL: 38 mg/dL (Low), Triglycerides: 185 mg/dL (High)' },
    { id: 'rep2', patientName: 'Priya Singh', type: 'Immunology (Rheumatoid Factor)', date: 'Yesterday, 04:30 PM', status: 'Pending Review', values: 'RF: 45 IU/mL (Positive - Elevated)' },
    { id: 'rep3', patientName: 'Mahesh Jadhav', type: 'X-Ray Left Ankle AP/Lat Film', date: 'Yesterday, 02:00 PM', status: 'Pending Review', values: 'Oblique fracture of distal fibula noted with minor soft tissue displacement' }
  ]);

  // DICOM Radiography slider states
  const [dicomBrightness, setDicomBrightness] = useState(100);
  const [dicomContrast, setDicomContrast] = useState(100);
  const [dicomZoom, setDicomZoom] = useState(100);
  const [dicomPreset, setDicomPreset] = useState<'Default' | 'Invert' | 'Bone' | 'Tissue'>('Default');

  // Doctor-Nurse chat states
  const [chatThread, setChatThread] = useState<'Nurse' | 'HOD'>('Nurse');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Nurse Sneha', role: 'Staff Nurse', text: 'Dr. Patil, patient Rahul Patil is ready in consulting room 4B.', time: '10:45 AM', type: 'text', playing: false },
    { id: '2', sender: 'You', role: 'Doctor', text: 'Great, starting the session. Please check his temperature first.', time: '10:46 AM', type: 'text', playing: false },
    { id: '3', sender: 'Nurse Sneha', role: 'Staff Nurse', text: 'His temp is 98.6 F. Also recorded his BP: 128/82 mmHg.', time: '10:48 AM', type: 'text', playing: false },
    { id: '4', sender: 'Nurse Sneha', role: 'Staff Nurse', text: 'Recorded vitals audio summary for reference:', time: '10:50 AM', type: 'voice', duration: '0:18', playing: false }
  ]);

  // Portal Settings states
  const [speechAccent, setSpeechAccent] = useState('Indian English');
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(() => {
    return localStorage.getItem('mcgm-enable-voice-speech') !== 'false';
  });
  const [fontSizeSetting, setFontSizeSetting] = useState<'Small' | 'Normal' | 'Large'>('Normal');

  const [alerts, setAlerts] = useState([
    { id: 'a1', type: 'critical', msg: 'Critical Lab: Hemoglobin 7.2 g/dL for Patient Rahul Patil', time: '10 Mins Ago' },
    { id: 'a2', type: 'signature', msg: 'Pending digital signature: OPD1239 Prescription', time: '15 Mins Ago' },
    { id: 'a3', type: 'emergency', msg: 'Emergency Admission in Casualty: Bed #3', time: '30 Mins Ago' }
  ]);

  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  // Vitals Simulator (Live ECG line)
  const [telemetryECG, setTelemetryECG] = useState<number[]>(new Array(40).fill(50));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ecgTimer = setInterval(() => {
      setTelemetryECG(prev => {
        const next = [...prev.slice(1)];
        const step = Math.random();
        let value = 50;
        if (step > 0.9) value = 85; 
        else if (step > 0.8) value = 15;
        else value = 48 + Math.floor(Math.random() * 6);
        next.push(value);
        return next;
      });
    }, 150);
    return () => clearInterval(ecgTimer);
  }, []);

  // Global Voice Command Event listeners for Siri-like Arogya Voice OS
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    const handlePrescribe = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const detail = customEvent.detail;
        const drugName = typeof detail === 'string' ? detail : detail.name;
        const dose = (typeof detail === 'object' && detail.dose) ? detail.dose : '1-0-1';
        const timing = (typeof detail === 'object' && detail.timing) ? detail.timing : 'After Food';
        const duration = (typeof detail === 'object' && detail.duration) ? detail.duration : '5 Days';
        const safety = checkDrugSafety(drugName);
        if (!safety.safe) {
          setToast({ id: `t-${Date.now()}`, title: 'Clinical Safety Warning', message: safety.reason || 'Drug allergy conflict!', type: 'alert' });
        } else {
          setRxMeds(prev => [...prev, { name: drugName, dose, timing, duration }]);
          setToast({ id: `t-${Date.now()}`, title: 'Medication Added', message: `${drugName} added via Voice command.`, type: 'success' });
        }
      }
    };
    const handleClearPrescriptions = () => {
      setRxMeds([]);
      setToast({ id: `t-${Date.now()}`, title: 'Prescription Pad Cleared', message: 'Cleared all items.', type: 'info' });
    };
    const handleRefer = () => {
      setShowReferModal(true);
    };
    const handleOpenLabs = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveLabPatient(currentConsultingPatient);
      if (customEvent.detail && customEvent.detail.tests) {
        setSelectedLabTests(customEvent.detail.tests);
      }
      setShowLabOrderModal(true);
    };
    const handleOpenRadiology = () => {
      setActiveRadiologyPatient(currentConsultingPatient);
      setShowRadiologyModal(true);
    };
    const handleIssueCert = () => {
      setActiveCertPatient(currentConsultingPatient);
      setShowCertModal(true);
    };
    const handleSignPrescription = () => {
      setShowSignModal(true);
    };
    const handleCallNextPatient = () => {
      handleCallNext();
    };
    const handleSkipPatient = () => {
      if (currentConsultingPatient) {
        handleSkip(currentConsultingPatient.id);
      }
    };
    const handleToggleScribe = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetState = customEvent.detail?.active;
      if (targetState !== undefined) {
        if (targetState !== isScribing) {
          toggleScribing();
        }
      } else {
        toggleScribing();
      }
    };
    const handleDicomControl = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { param, value } = customEvent.detail;
        if (param === 'zoom') setDicomZoom(value);
        if (param === 'brightness') setDicomBrightness(value);
        if (param === 'contrast') setDicomContrast(value);
      }
    };
    const handleSearchPatient = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== undefined) {
        setSearchQuery(customEvent.detail);
      }
    };
    const handleSubmitLabDirect = () => {
      handleLabOrderSubmit();
    };
    const handleGenerateSoap = () => {
      setSoapNotes({
        subjective: 'Patient reports persistent mechanical knee joint stiffness, exacerbated during deep flexion. Relieved on rest.',
        objective: 'Tenderness over the medial tibial plateau. Mild crepitus. No collateral instability or joint effusion.',
        assessment: 'Left Knee Primary Osteoarthritis (ICD-10 M17.11) - Stage II.',
        plan: 'Start Quadriceps isometric rehabilitation, prescribe Tab Aceclofenac 100mg twice daily with PPI shield, follow up 3 weeks.'
      });
      setToast({ id: `t-${Date.now()}`, title: 'SOAP Notes Generated', message: 'SOAP consultation notes compiled successfully.', type: 'success' });
    };
    const handleOpenDischarge = () => {
      setToast({ 
        id: `t-${Date.now()}`, 
        title: 'Discharge Summary Generated', 
        message: `Discharge summary generated for ${currentConsultingPatient?.name} and uploaded to ABHA health locker.`, 
        type: 'success' 
      });
    };

    window.addEventListener('mcgm-doctor-tab-change', handleTabChange);
    window.addEventListener('mcgm-doctor-prescribe', handlePrescribe);
    window.addEventListener('mcgm-doctor-clear-prescriptions', handleClearPrescriptions);
    window.addEventListener('mcgm-doctor-refer', handleRefer);
    window.addEventListener('mcgm-doctor-open-labs', handleOpenLabs);
    window.addEventListener('mcgm-doctor-open-radiology', handleOpenRadiology);
    window.addEventListener('mcgm-doctor-issue-cert', handleIssueCert);
    window.addEventListener('mcgm-doctor-sign-prescription', handleSignPrescription);
    window.addEventListener('mcgm-doctor-call-next', handleCallNextPatient);
    window.addEventListener('mcgm-doctor-skip-patient', handleSkipPatient);
    window.addEventListener('mcgm-doctor-toggle-scribe', handleToggleScribe);
    window.addEventListener('mcgm-doctor-dicom-control', handleDicomControl);
    window.addEventListener('mcgm-doctor-search-patient', handleSearchPatient);
    window.addEventListener('mcgm-doctor-submit-lab-direct', handleSubmitLabDirect);
    window.addEventListener('mcgm-doctor-generate-soap', handleGenerateSoap);
    window.addEventListener('mcgm-doctor-open-discharge', handleOpenDischarge);

    return () => {
      window.removeEventListener('mcgm-doctor-tab-change', handleTabChange);
      window.removeEventListener('mcgm-doctor-prescribe', handlePrescribe);
      window.removeEventListener('mcgm-doctor-clear-prescriptions', handleClearPrescriptions);
      window.removeEventListener('mcgm-doctor-refer', handleRefer);
      window.removeEventListener('mcgm-doctor-open-labs', handleOpenLabs);
      window.removeEventListener('mcgm-doctor-open-radiology', handleOpenRadiology);
      window.removeEventListener('mcgm-doctor-issue-cert', handleIssueCert);
      window.removeEventListener('mcgm-doctor-sign-prescription', handleSignPrescription);
      window.removeEventListener('mcgm-doctor-call-next', handleCallNextPatient);
      window.removeEventListener('mcgm-doctor-skip-patient', handleSkipPatient);
      window.removeEventListener('mcgm-doctor-toggle-scribe', handleToggleScribe);
      window.removeEventListener('mcgm-doctor-dicom-control', handleDicomControl);
      window.removeEventListener('mcgm-doctor-search-patient', handleSearchPatient);
      window.removeEventListener('mcgm-doctor-submit-lab-direct', handleSubmitLabDirect);
      window.removeEventListener('mcgm-doctor-generate-soap', handleGenerateSoap);
      window.removeEventListener('mcgm-doctor-open-discharge', handleOpenDischarge);
    };
  }, [patients, currentConsultingPatientId, rxMeds, isScribing, currentConsultingPatient]);

  const executeVoiceCommandRef = useRef<(text: string) => boolean>(() => false);
  const toggleScribingRef = useRef<() => void>(() => {});

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = speechAccent === 'Indian English' ? 'en-IN' : speechAccent === 'Hindi-English' ? 'hi-IN' : 'en-US';

      recognizer.onresult = (event: any) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTrans) {
          const lowerTrans = finalTrans.toLowerCase().trim();
          
          // Check for direct stop commands (no wake word needed)
          const isDirectStop = lowerTrans.includes('stop scribe') || 
                               lowerTrans.includes('stop recording') || 
                               lowerTrans.includes('end scribe') || 
                               lowerTrans.includes('stop ambient');
          
          // Check wake words and try to route
          const wakeWords = ['assistant', 'computer', 'mcgm', 'doctor', 'असिस्टंट', 'संगणक', 'मदतनीस'];
          const matchedWakeWord = wakeWords.find(ww => lowerTrans.startsWith(ww));
          
          let routed = false;
          if (matchedWakeWord) {
            const commandText = lowerTrans.slice(matchedWakeWord.length).trim();
            if (commandText) {
              const cleanedCommand = commandText.replace(/[.,\/#!$%\^&\*;:{}=\_`~()?]$/g, "").replace(/^[.,\/#!$%\^&\*;:{}=\_`~()?]/g, "").trim();
              if (executeVoiceCommandRef.current(cleanedCommand)) {
                routed = true;
              }
            }
          }

          if (isDirectStop || routed) {
            if (isDirectStop && !routed) {
              // Ensure we stop scribing if it was a direct stop command
              toggleScribingRef.current();
              VoiceActionDispatcher.speak('Scribing stopped. SOAP notes drafted.');
            }
            return; // Filter out from EMR scribing text / dialogue timeline completely!
          }

          setScribingText(prev => prev + finalTrans);
          // Auto parsing simulate speaker labels
          const isDoc = Math.random() > 0.45;
          setScribingLogs(prev => [
            ...prev,
            {
              speaker: isDoc ? 'Doctor' : 'Patient',
              text: finalTrans,
              time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }
          ]);
        }
      };

      recognizer.onerror = () => {
        setIsScribing(false);
      };

      setSpeechRecognizer(recognizer);
    }
  }, [speechAccent]);

  // Assistant Speech Recognition Effect
  useEffect(() => {
    if (!isAssistantListening) {
      if (assistantSpeechRecognizer) {
        try {
          assistantSpeechRecognizer.stop();
        } catch (e) {
          // Ignore
        }
      }
      // Resume global Voice OS microphone
      window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: false }));
      return;
    }

    // Pause global Voice OS microphone while assistant mic is active
    window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: true }));

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';

      recognizer.onstart = () => {
        setAssistantLogs(prev => [
          ...prev,
          { text: '\uD83C\uDF99\uFE0F Listening for voice commands...', type: 'info' }
        ]);
      };

      recognizer.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans + ' ';
          } else {
            interimTranscript += trans + ' ';
          }
        }

        const processText = (text: string, isFinalResult: boolean) => {
          const trimmed = text.trim();
          if (!trimmed) return;

          const result = VoiceIntentRouter.route(trimmed);
          if (result.success) {
            if (result.intent !== 'THROTTLED') {
              setAssistantLogs(prev => [
                ...prev,
                { text: `\uD83D\uDDE3\uFE0F "${trimmed}"`, type: 'user' },
                { text: `\u2705 Command executed!`, type: 'success' }
              ]);
            }
          } else if (isFinalResult) {
            setAssistantLogs(prev => [
              ...prev,
              { text: `\uD83D\uDDE3\uFE0F "${trimmed}"`, type: 'user' },
              { text: `\u2753 Command not recognized: "${trimmed}"`, type: 'error' }
            ]);
          }
        };

        if (finalTranscript.trim()) {
          processText(finalTranscript, true);
        } else if (interimTranscript.trim()) {
          processText(interimTranscript, false);
        }
      };

      recognizer.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setIsAssistantListening(false);
          setAssistantLogs(prev => [
            ...prev,
            { text: `\u274C Microphone error: ${event.error}`, type: 'error' }
          ]);
        }
      };

      try {
        recognizer.start();
        setAssistantSpeechRecognizer(recognizer);
      } catch (err) {
        console.error(err);
      }

      return () => {
        try {
          recognizer.stop();
        } catch (e) {
          // Ignore
        }
        // Resume global Voice OS microphone on clean up
        window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: false }));
      };
    } else {
      setAssistantLogs(prev => [
        ...prev,
        { text: '\u26A0\uFE0F Speech Recognition not supported in this browser.', type: 'error' }
      ]);
    }
  }, [isAssistantListening, lang]);

  // Scribing scroll sync
  useEffect(() => {
    if (scribingEndRef.current) {
      scribingEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scribingLogs]);

  // Core status counts
  const waitingCount = patients.filter(p => p.status === 'Waiting').length;
  const completedCount = patients.filter(p => p.status === 'Completed').length;

  // Allergy warning checking logic
  const checkDrugSafety = (drugName: string): { safe: boolean; reason?: string } => {
    const details = PATIENT_DETAILS_MAP[currentConsultingPatient.id];
    if (!details) return { safe: true };

    const lowerDrug = drugName.toLowerCase();
    const hasSulfaAllergy = details.allergies.some(a => a.toLowerCase().includes('sulfa'));
    const hasPenicillinAllergy = details.allergies.some(a => a.toLowerCase().includes('penicillin'));
    const hasNsaidAllergy = details.allergies.some(a => a.toLowerCase().includes('ibuprofen') || a.toLowerCase().includes('aspirin'));

    if (lowerDrug.includes('aceclofenac') && hasNsaidAllergy) {
      return { safe: false, reason: 'Patient is allergic to Ibuprofen / NSAIDs. Aceclofenac is highly contraindicated!' };
    }
    if (lowerDrug.includes('amoxicillin') && hasPenicillinAllergy) {
      return { safe: false, reason: 'Patient has a Penicillin allergy. Amoxicillin is highly contraindicated!' };
    }
    if (lowerDrug.includes('pantoprazole') && hasSulfaAllergy) {
      return { safe: false, reason: 'Patient is allergic to Sulfa drugs. Use caution with Pantoprazole.' };
    }
    return { safe: true };
  };

  // Voice Command parser and executor
  function executeVoiceCommand(text: string): boolean {
    VoiceContextManager.setPortal('doctor');
    const result = VoiceIntentRouter.route(text);
    return result.success;
  }


  const handleManualCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;
    setAssistantLogs(prev => [
      ...prev,
      { text: `💻 Command sent: "${cmdText.trim()}"`, type: 'user' }
    ]);
    const executed = executeVoiceCommand(cmdText);
    if (executed) {
      setAssistantLogs(prev => [
        ...prev,
        { text: `✅ Command executed successfully!`, type: 'success' }
      ]);
    } else {
      setAssistantLogs(prev => [
        ...prev,
        { text: `❓ Command not recognized.`, type: 'error' }
      ]);
    }
    setCustomCommandInput('');
  };



  // Handlers
  const handleCallNext = (id?: string) => {
    const target = id ? patients.find(p => p.id === id) : patients.find(p => p.status === 'Waiting');
    if (!target) {
      setToast({ id: `t-${Date.now()}`, title: 'Queue Exhausted', message: 'No more waiting patients in this shift queue.', type: 'info' });
      return;
    }
    setPatients(prev => prev.map(p => {
      if (p.id === target.id) return { ...p, status: 'In Consultation' };
      if (p.status === 'In Consultation') return { ...p, status: 'Waiting' };
      return p;
    }));
    setCurrentConsultingPatientId(target.id);
    const details = PATIENT_DETAILS_MAP[target.id];
    if (details) {
      setConsultVitals({
        bp: details.vitalsHistory[0]?.bp || '120/80',
        pulse: String(details.vitalsHistory[0]?.pulse || '75'),
        temp: details.vitalsHistory[0]?.temp || '98.4',
        spo2: String(details.vitalsHistory[0]?.spo2 || '98')
      });
      setProvisionalDiagnosis(details.pastDiagnoses[0] ? `${details.pastDiagnoses[0]} (M17.1)` : 'General Muscle Stiffness');
    }
    setRxMeds([
      { name: 'Tab. Paracetamol 650mg', dose: '1-0-1', timing: 'After Food', duration: '5 Days' }
    ]);
    setScribingLogs([]);
    setScribingText('');
    setToast({ id: `t-${Date.now()}`, title: 'Patient Called', message: `${target.name} called to consulting Room #4B.`, type: 'success' });
  };

  const handleSkip = (id: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === id) return { ...p, waitTime: p.waitTime + 15 }; // defer
      return p;
    }));
    setToast({ id: `t-${Date.now()}`, title: 'Patient Deferred', message: 'Patient ticket skipped and pushed back in queue.', type: 'info' });
  };

  const handleRecall = (id: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === id) return { ...p, status: 'Waiting' };
      return p;
    }));
    setToast({ id: `t-${Date.now()}`, title: 'Recall Triggered', message: 'Completed patient recalled to consulting room.', type: 'info' });
  };

  const handleAddMed = () => {
    if (!newMed.name.trim()) return;
    const safety = checkDrugSafety(newMed.name);
    if (!safety.safe) {
      setToast({ id: `t-${Date.now()}`, title: 'Clinical Safety Warning', message: safety.reason || 'Drug allergy conflict!', type: 'alert' });
      return;
    }
    setRxMeds(prev => [...prev, newMed]);
    setNewMed({ name: '', dose: '1-0-1', timing: 'After Food', duration: '5 Days' });
    setToast({ id: `t-${Date.now()}`, title: 'Medication Added', message: `${newMed.name} added to current prescription pad.`, type: 'success' });
  };

  const handleRemoveMed = (index: number) => {
    setRxMeds(prev => prev.filter((_, i) => i !== index));
  };

  // Web Speech API recording trigger
  const toggleScribing = () => {
    if (isScribing) {
      if (speechRecognizer) speechRecognizer.stop();
      setIsScribing(false);
      // Notify Voice OS: scribing stopped → it can resume
      window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: false }));
      // Auto compile SOAP notes from transcript
      if (scribingText.trim()) {
        setSoapNotes({
          subjective: `Patient reports: "${scribingText.trim().substring(0, 100)}..."`,
          objective: `Vitals verified: BP ${consultVitals.bp}, Pulse ${consultVitals.pulse} bpm. Joint flexion tested.`,
          assessment: `Osteoarthritis based on clinical voice notes and local diagnostic mapping.`,
          plan: `Prescribed medications: ${rxMeds.map(m => m.name).join(', ')}. Scheduled follow-up.`
        });
      }
    } else {
      setScribingText('');
      setScribingLogs([]);
      // Notify Voice OS: scribing started → pause Voice OS mic
      window.dispatchEvent(new CustomEvent('mcgm-scribe-active', { detail: true }));
      if (speechRecognizer) {
        try {
          speechRecognizer.start();
          setIsScribing(true);
        } catch (e) {
          // Fallback simulation
          setIsScribing(true);
          simulateScribingVoice();
        }
      } else {
        setIsScribing(true);
        simulateScribingVoice();
      }
    }
  };

  useEffect(() => {
    executeVoiceCommandRef.current = executeVoiceCommand;
  }, [executeVoiceCommand]);

  useEffect(() => {
    toggleScribingRef.current = toggleScribing;
  }, [toggleScribing]);

  const simulateScribingVoice = () => {
    let mockDialogs = [
      { speaker: 'Patient' as const, text: 'Doctor, I have severe pain in my left knee for 4 days now.' },
      { speaker: 'Doctor' as const, text: 'Do you feel stiffness in the morning, or pain when climbing stairs?' },
      { speaker: 'Patient' as const, text: 'Yes, both. It feels extremely stiff after waking up.' },
      { speaker: 'Doctor' as const, text: 'Understood. We will record your vitals. BP is 128/82. Pulse is 80. I will prescribe Paracetamol and Pantoprazole, and order a knee X-Ray.' }
    ];

    if (scribeInputLang === 'mr' && scribePatientLang === 'hi') {
      mockDialogs = [
        { speaker: 'Patient' as const, text: 'डॉक्टर साहब, मुझे ४ दिनों से बाएं घुटने में बहुत दर्द है। [Translated to Marathi: डॉक्टर साहेब, मला ४ दिवसांपासून डाव्या गुडघ्यात खूप वेदना आहेत.]' },
        { speaker: 'Doctor' as const, text: 'तुम्हाला सकाळी उठल्यावर गुडघा ताठ वाटतो का, किंवा पायऱ्या चढताना त्रास होतो का? [Translated to Patient (Hindi): क्या आपको सुबह उठने पर घुटना अकड़ा हुआ लगता है, या सीढ़ियां चढ़ने में तकलीफ होती है?]' },
        { speaker: 'Patient' as const, text: 'हाँ डॉक्टर साहब, सुबह सोकर उठने पर बहुत अकड़न रहती है। [Translated to Marathi: हो डॉक्टर साहेब, सकाळी झोपेतून उठल्यावर खूप ताठरता असते.]' },
        { speaker: 'Doctor' as const, text: 'ठीक आहे. आपण तुमचे रक्तदाब आणि नाडी तपासूया. बीपी १२८/८२ आणि नाडी ८० आहे. मी औषध लिहून देतो. [Translated to Patient (Hindi): ठीक है। हम आपका बीपी और पल्स चेक करते हैं। बीपी 128/82 और पल्स 80 है। मैं दवा लिख देता हूँ।]' }
      ];
    } else if (scribeInputLang === 'hi' && scribePatientLang === 'mr') {
      mockDialogs = [
        { speaker: 'Patient' as const, text: 'डॉक्टर, माझ्या डाव्या गुडघ्यात ४ दिवसांपासून खूप दुखत आहे. [Translated to Hindi: डॉक्टर, मेरे बाएं घुटने में ४ दिनों से बहुत दर्द हो रहा है।]' },
        { speaker: 'Doctor' as const, text: 'क्या आपको सुबह अकड़न होती है या सीढ़ियां चढ़ते समय दर्द होता है? [Translated to Patient (Marathi): तुम्हाला सकाळी ताठरता जाणवते का किंवा पायऱ्या चढताना त्रास होतो का?]' },
        { speaker: 'Patient' as const, text: 'हो डॉक्टर, सकाळी उठल्यावर खूप कडक वाटतो गुडघा। [Translated to Hindi: हाँ डॉक्टर, सुबह उठने पर घुटना बहुत अकड़ जाता है।]' },
        { speaker: 'Doctor' as const, text: 'ठीक है। हम आपका बीपी और पल्स चेक करते हैं। बीपी 128/82 है। [Translated to Patient (Marathi): ठीक आहे. आपण तुमचे बीपी आणि नाडी तपासूया. बीपी १२८/८२ आहे.]' }
      ];
    }

    mockDialogs.forEach((diag, index) => {
      setTimeout(() => {
        setScribingLogs(prev => [
          ...prev,
          { speaker: diag.speaker, text: diag.text, time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) }
        ]);
        setScribingText(prev => prev + ' ' + diag.text);
      }, (index + 1) * 3000);
    });

    setTimeout(() => {
      setIsScribing(false);
      setToast({ id: `t-${Date.now()}`, title: 'Voice Scribing Complete', message: 'Scribed audio compiled into SOAP notes.', type: 'success' });
    }, 15000);
  };

  // E-Sign PIN validation & dispatch
  const handleSignatureSubmit = () => {
    if (!doctorPin) {
      setToast({ id: `t-${Date.now()}`, title: 'Authentication Required', message: 'Please enter your digital signature PIN.', type: 'alert' });
      return;
    }
    if (doctorPin !== '1234') {
      setToast({ id: `t-${Date.now()}`, title: 'Validation Failed', message: 'Incorrect Doctor signature PIN. Try "1234".', type: 'alert' });
      return;
    }

    // Save voice log if any scribing occurred
    if (scribingText.trim()) {
      setSavedVoiceLogs(prev => [
        {
          id: `v-${Date.now()}`,
          patientName: currentConsultingPatient.name,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          duration: '1 min 12 secs',
          size: '1.8 MB',
          filename: `rx_consult_${currentConsultingPatient.id}_${Date.now()}.wav`,
          encryption: 'AES-256 Encrypted',
          playing: false
        },
        ...prev
      ]);
    }

    // Mark completed
    setPatients(prev => prev.map(p => {
      if (p.id === currentConsultingPatient.id) return { ...p, status: 'Completed' };
      return p;
    }));

    setAppointments(prev => prev.map(appt => {
      if (appt.tokenNo === currentConsultingPatient.token) return { ...appt, status: 'COMPLETED' };
      return appt;
    }));

    // Add to records
    setRecords(prev => [
      {
        id: `rec-${Date.now()}`,
        title: `Prescription (${provisionalDiagnosis.split(' (')[0]})`,
        doctorName: 'Dr. Anil Patil',
        source: 'Sion Hospital',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        type: 'PDF'
      },
      ...prev
    ]);

    // Add notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        type: 'report',
        title: 'Prescription Locker Sync',
        desc: `Prescription for ${currentConsultingPatient.name} has been synced with ABHA ID.`,
        timeAgo: 'Just now',
        isRead: false
      },
      ...prev
    ]);

    setShowSignModal(false);
    setDoctorPin('');
    setSignaturePaths([]);
    setIsSignatureCanvasBlank(true);

    if (isOfflineMode) {
      setOfflinePendingChanges(prev => prev + 1);
      setToast({ id: `t-${Date.now()}`, title: 'Offline EMR Cached', message: 'Signed digitally and cached locally. Changes will sync when network is restored.', type: 'alert' });
    } else {
      setToast({ id: `t-${Date.now()}`, title: 'ABHA Sync Success', message: 'EMR signed digitally and locked in patient locker.', type: 'success' });
    }
    setActiveTab('dashboard');
  };

  // Canvas drawing simulation
  const startDrawing = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setSignaturePaths(prev => [...prev, `M ${x} ${y}`]);
    setIsSignatureCanvasBlank(false);
  };

  const draw = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setSignaturePaths(prev => {
      const next = [...prev];
      if (next.length > 0) {
        next[next.length - 1] = next[next.length - 1] + ` L ${x} ${y}`;
      }
      return next;
    });
  };

  // Raising Lab orders
  const handleLabOrderSubmit = () => {
    setToast({ id: `t-${Date.now()}`, title: 'Lab Order Filed', message: `Successfully raised ${selectedLabTests.length} pathology tests (${isLabUrgent ? 'STAT / URGENT' : 'Routine'}) for ${activeLabPatient?.name}.`, type: 'success' });
    setShowLabOrderModal(false);
    setSelectedLabTests([]);
    setLabNotes('');
    setIsLabUrgent(false);
  };

  // Raising Radiology orders
  const handleRadiologyOrderSubmit = () => {
    setToast({ id: `t-${Date.now()}`, title: 'Radiology Order Filed', message: `Raised ${selectedRadiologyTests.length} studies under ${radiologyCategory} (${isRadioUrgent ? 'URGENT' : 'Routine'}) for ${activeRadiologyPatient?.name}.`, type: 'success' });
    setShowRadiologyModal(false);
    setSelectedRadiologyTests([]);
    setRadioNotes('');
    setIsRadioUrgent(false);
  };

  // Raising Referral
  const handleReferSubmit = () => {
    const refCode = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferralSlip({
      code: refCode,
      patientName: activeReferPatient?.name,
      abha: PATIENT_DETAILS_MAP[activeReferPatient?.id || '1']?.abhaAddress,
      hospital: referHospital,
      dept: referDept,
      reason: referReason,
      date: new Date().toLocaleDateString()
    });
    setToast({ id: `t-${Date.now()}`, title: 'ABHA Referral Synced', message: `Referral slip generated with transfer code: ${refCode}.`, type: 'success' });
  };

  // Approving lab reports on dashboard
  const handleApproveReport = (id: string, patientName: string) => {
    setPendingReports(prev => prev.filter(r => r.id !== id));
    setToast({ id: `t-${Date.now()}`, title: 'Report Approved', message: `Digitally signed and approved report for ${patientName}. Sent to ABHA locker.`, type: 'success' });
  };

  // Chat message sending
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = {
      id: `chat-${Date.now()}`,
      sender: 'You',
      role: 'Doctor',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      playing: false
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');

    // Simulate nurse reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `chat-reply-${Date.now()}`,
          sender: chatThread === 'Nurse' ? 'Nurse Sneha' : 'Dr. Vinay Joshi',
          role: chatThread === 'Nurse' ? 'Staff Nurse' : 'Department HOD',
          text: chatThread === 'Nurse' 
            ? 'Acknowledged, Doctor. Checking patient vitals now.' 
            : 'Let’s discuss the surgery planning in the evening rounds.',
          time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          playing: false
        }
      ]);
    }, 2000);
  };

  // Toggle play/pause for voice log
  const toggleVoiceLogPlay = (id: string) => {
    setSavedVoiceLogs(prev => prev.map(log => {
      if (log.id === id) return { ...log, playing: !log.playing };
      return { ...log, playing: false };
    }));
  };

  const toggleChatVoicePlay = (id: string) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === id) return { ...m, playing: !m.playing };
      return m;
    }));
  };

  // Dictionaries
  const dict = {
    en: {
      title: 'MCGM Digital Hospital - Doctor Portal',
      dept: 'Orthopaedics Department',
      greeting: 'Good Morning,',
      onDuty: 'On Duty',
      waiting: 'Waiting Patients',
      completed: 'Consultations Completed',
      today: 'Total Patients Today',
      avgWait: 'Avg Wait Time',
      avgConsult: 'Avg Consultation Time',
      voiceAi: 'Voice AI Status',
      callNext: 'Call Next',
      skip: 'Skip',
      recall: 'Recall',
      voiceBtn: 'Start Voice Consult',
      activeStatus: 'Available'
    },
    mr: {
      title: 'एमसीजीएम डिजिटल हॉस्पिटल - डॉक्टर पोर्टल',
      dept: 'अस्थिरोग विभाग',
      greeting: 'शुभ प्रभात,',
      onDuty: 'कर्तव्यावर',
      waiting: 'प्रतीक्षेत असलेले रुग्ण',
      completed: 'तपासलेले रुग्ण',
      today: 'आजचे एकूण रुग्ण',
      avgWait: 'सरासरी वेळ',
      avgConsult: 'तपासणी वेळ',
      voiceAi: 'व्हॉइस एआय स्थिती',
      callNext: 'पुढील बोलवा',
      skip: 'वगळा',
      recall: 'पुन्हा बोलवा',
      voiceBtn: 'व्हॉइस सल्ला सुरू करा',
      activeStatus: 'उपलब्ध'
    },
    hi: {
      title: 'एमसीजीएम डिजिटल अस्पताल - डॉक्टर पोर्टल',
      dept: 'अस्थिरोग विभाग',
      greeting: 'शुभ प्रभात,',
      onDuty: 'कर्तव्य पर',
      waiting: 'प्रतीक्षारत मरीज',
      completed: 'परामर्श पूर्ण',
      today: 'आज के कुल मरीज',
      avgWait: 'औसत प्रतीक्षा समय',
      avgConsult: 'औसत परामर्श समय',
      voiceAi: 'आवाज एआई स्थिति',
      callNext: 'अगले मरीज को बुलाएं',
      skip: 'छोड़ें',
      recall: 'पुनः बुलाएं',
      voiceBtn: 'आवाज परामर्श शुरू करें',
      activeStatus: 'उपलब्ध'
    }
  }[lang];

  // 1. Dashboard View
  const renderDashboardView = () => {
    return (
      <div className="space-y-6">
        {/* HERO GREETING BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-[#003F8A] to-[#0050cc] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
          
          <div className="space-y-1 z-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <h2 className="text-3xl font-black tracking-tight pt-1">
              {dict.greeting} Dr. Anil Patil
            </h2>
            <p className="text-blue-100 text-sm font-semibold max-w-lg">
              You have {waitingCount} patients waiting in the Orthopaedic General OPD queue. {alerts.length} tasks require immediate attention.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2 z-10">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-bold border border-white/10 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span>On Duty Room #4B</span>
            </span>
            <span className="px-4 py-2 bg-orange-500 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-md">
              <Activity className="w-4 h-4 animate-bounce" />
              <span>OPD Queue Active</span>
            </span>
          </div>
        </div>

        {/* METRICS STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: dict.waiting, val: waitingCount, icon: Clock, trend: `${waitingCount * 12} mins wait`, color: 'text-amber-500 bg-amber-500/10' },
            { label: dict.completed, val: completedCount, icon: CheckCircle2, trend: '94% of today', color: 'text-green-500 bg-green-500/10' },
            { label: 'Emergency Duty', val: 1, icon: AlertTriangle, trend: 'Casualty Bed #3', color: 'text-red-500 bg-red-500/10' },
            { label: 'Avg Consult Time', val: '11 min', icon: Stethoscope, trend: '-2% vs yesterday', color: 'text-blue-500 bg-blue-500/10' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`p-4 rounded-3xl border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:shadow-md'
              }`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-2 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{stat.val}</h3>
                  <p className="text-[10px] text-gray-505 dark:text-slate-400 font-bold flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    <span>{stat.trend}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Table Panel */}
          <div className="xl:col-span-2 space-y-6">
            <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Active OPD Live Queue</h3>
                  <p className="text-xs text-gray-555">Live feed of checked-in patient tickets</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
                  {(['All', 'Waiting', 'In Consultation', 'Completed'] as const).map(filt => (
                    <button
                      key={filt}
                      onClick={() => setQueueFilter(filt)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        queueFilter === filt 
                          ? 'bg-[#003F8A] text-white shadow' 
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {filt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient queue by name, ABHA account, phone, or token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-24 py-3.5 rounded-xl border text-sm font-semibold outline-none focus:ring-2 focus:ring-[#003F8A] focus:border-transparent transition-all ${
                    isDarkMode ? 'bg-[#090d16] border-slate-850 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-800'
                  }`}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1 hover:bg-orange-600 transition-all shadow-sm">
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/10 text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">
                      <th className="py-3 px-4">Token</th>
                      <th className="py-3 px-4">Patient Info</th>
                      <th className="py-3 px-4">Wait Time</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/10 font-medium">
                    {patients.filter(p => {
                      if (queueFilter !== 'All' && p.status !== queueFilter) return false;
                      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.token.toLowerCase().includes(searchQuery.toLowerCase());
                    }).map(patient => (
                      <tr key={patient.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-4 px-4 font-black text-slate-800 dark:text-slate-200">{patient.token}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <img src={patient.photo} alt={patient.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <div className="font-extrabold text-slate-855 dark:text-white">{patient.name}</div>
                              <div className="text-[10px] text-gray-500">{patient.age} yrs • {patient.gender}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">{patient.waitTime} mins</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            patient.priority === 'Emergency'
                              ? 'bg-red-500/15 text-red-500 animate-pulse'
                              : patient.priority === 'Urgent'
                              ? 'bg-orange-500/15 text-orange-500'
                              : 'bg-blue-500/15 text-blue-500'
                          }`}>
                            {patient.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            patient.status === 'In Consultation'
                              ? 'bg-orange-500/15 text-orange-500'
                              : patient.status === 'Completed'
                              ? 'bg-green-500/15 text-green-500'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {patient.status === 'Waiting' && (
                            <div className="flex justify-end space-x-1.5">
                              <button 
                                onClick={() => handleCallNext(patient.id)}
                                className="px-2.5 py-1.5 bg-[#003F8A] hover:bg-[#002f66] text-white rounded-lg font-bold transition-all cursor-pointer"
                              >
                                Call Next
                              </button>
                              <button 
                                onClick={() => handleSkip(patient.id)}
                                className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-lg font-bold transition-all cursor-pointer"
                              >
                                Skip
                              </button>
                            </div>
                          )}
                          {patient.status === 'In Consultation' && (
                            <button
                              onClick={() => {
                                setCurrentConsultingPatientId(patient.id);
                                setActiveTab('consultation');
                              }}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <span>Resume Consult</span>
                            </button>
                          )}
                          {patient.status === 'Completed' && (
                            <button 
                              onClick={() => handleRecall(patient.id)}
                              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg font-bold hover:bg-slate-200 cursor-pointer"
                            >
                              Recall
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PENDING REPORTS PANEL */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Pending Diagnostics Sign-off</h3>
              <div className="space-y-3">
                {pendingReports.map(rep => (
                  <div key={rep.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-800/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-855 dark:text-white">{rep.patientName}</span>
                        <span className="text-[9px] bg-[#003F8A]/10 text-[#003F8A] dark:text-blue-400 font-extrabold px-2 py-0.5 rounded-full">{rep.type}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-semibold">{rep.values}</p>
                    </div>
                    <button 
                      onClick={() => handleApproveReport(rep.id, rep.patientName)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-black flex items-center space-x-1 shadow transition-all self-end sm:self-auto cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Sign</span>
                    </button>
                  </div>
                ))}
                {pendingReports.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-400 font-bold">All pending diagnostics are signed and approved!</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col Panel */}
          <div className="xl:col-span-1 space-y-6">
            {/* NEXT PATIENT */}
            <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-800/10">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Next In Consultation</h4>
                    <p className="text-[10px] text-gray-500">OPD shortcut panel</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#003F8A] animate-ping" />
                </div>

                {currentConsultingPatient ? (
                  <div className="space-y-4 py-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                        <img src={currentConsultingPatient.photo} alt={currentConsultingPatient.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-orange-500 px-2 py-0.5 rounded-full">
                          {currentConsultingPatient.priority}
                        </span>
                        <h3 className="text-base font-black text-slate-808 dark:text-white mt-1">{currentConsultingPatient.name}</h3>
                        <p className="text-xs text-gray-550 dark:text-slate-400 font-bold">{currentConsultingPatient.age} Years • {currentConsultingPatient.gender}</p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-800/5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-500">OPD Ticket Token</span>
                        <span className="font-extrabold text-[#003F8A] dark:text-blue-400">{currentConsultingPatient.token}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-550">Wait Duration</span>
                        <span className="font-extrabold text-red-500">{currentConsultingPatient.waitTime} mins ago</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold border-t border-dashed border-slate-800/10 pt-2">
                        <span className="text-gray-555">Provisional Diagnosis</span>
                        <span className="font-extrabold text-slate-700 dark:text-slate-350">{currentConsultingPatient.diagnosis}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 font-semibold">
                    No active queue patient.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/10 mt-4">
                {currentConsultingPatient && (
                  <button
                    onClick={() => {
                      setActiveTab('consultation');
                    }}
                    className="w-full bg-[#003F8A] hover:bg-[#002f66] text-white py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow transition-all cursor-pointer"
                  >
                    <Stethoscope className="w-5 h-5" />
                    <span>Open Consultation Workspace</span>
                  </button>
                )}
              </div>
            </div>

            {/* CLINICAL ALERTS */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-805 dark:text-white uppercase tracking-wider">Clinical Alerts</h3>
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                  {alerts.length} Pending
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map(alertItem => (
                  <div 
                    key={alertItem.id} 
                    className={`p-3 rounded-2xl border flex items-start space-x-3 text-xs leading-relaxed relative ${
                      alertItem.type === 'critical'
                        ? 'bg-red-500/5 border-red-500/20 text-red-405'
                        : alertItem.type === 'emergency'
                        ? 'bg-orange-500/5 border-orange-500/20 text-orange-405'
                        : 'bg-blue-500/5 border-blue-500/20 text-blue-405'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{alertItem.msg}</p>
                      <span className="text-[10px] text-gray-500 block mt-1">{alertItem.time}</span>
                    </div>
                    <button 
                      onClick={() => setAlerts(prev => prev.filter(al => al.id !== alertItem.id))}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* QUICK CLINICAL ACTIONS */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Quick Clinic Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'New Consultation', icon: Stethoscope, action: () => { setActiveTab('consultation'); handleCallNext(); } },
              { label: 'Voice Consult Scribe', icon: Mic, action: () => { setActiveTab('consultation'); toggleScribing(); } },
              { label: 'Lab Orders', icon: FlaskConical, action: () => { setActiveLabPatient(currentConsultingPatient); setShowLabOrderModal(true); } },
              { label: 'Radiology Orders', icon: FileSpreadsheet, action: () => { setActiveRadiologyPatient(currentConsultingPatient); setShowRadiologyModal(true); } },
              { label: 'Refer Patient', icon: Share2, action: () => { setActiveReferPatient(currentConsultingPatient); setShowReferModal(true); } },
              { label: 'Medical Sickness Cert', icon: FileSignature, action: () => { setActiveCertPatient(currentConsultingPatient); setShowCertModal(true); } },
              { label: 'Patients Directory', icon: Users, action: () => setActiveTab('patients') },
              { label: 'View Radiographs', icon: FileText, action: () => setActiveTab('reports') }
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <button
                  key={i}
                  onClick={act.action}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-[110px] transition-all hover:shadow-md hover:scale-[1.02] duration-200 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-900/60 border-slate-800 hover:border-orange-500 text-slate-200' 
                      : 'bg-[#F8FAFD] border-[#EBF0F8] hover:bg-white hover:border-orange-500 text-[#1C2D42]'
                  }`}
                >
                  <Icon className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-black tracking-wide leading-snug">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PERFORMANCE ANALYSIS PANEL */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Consultation Performance Metrics</h3>
              <p className="text-xs text-gray-555">Weekly shift productivity summary</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {[
              { label: 'Patient Seen Target', current: completedCount, target: 20, pct: Math.min(100, (completedCount / 20) * 100), desc: 'OPD target seen for shift' },
              { label: 'Voice AI Scribing Utilized', current: 4, target: 5, pct: 80, desc: 'Digital transcription adoption' },
              { label: 'Avg Clinic Latency', current: 11, target: 15, pct: 73, desc: 'Average turn-around time (min)' }
            ].map((perf, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-350">{perf.label}</span>
                  <span className="font-black text-[#003F8A] dark:text-blue-400">{perf.current} / {perf.target}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${perf.pct}%` }}
                    className="h-full bg-gradient-to-r from-[#003F8A] to-orange-500 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-gray-555">{perf.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 2. Queue View with Analytics
  const renderQueueView = () => {
    return (
      <div className="space-y-6">
        {/* QUEUE ANALYTICS BAR */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <h3 className="text-sm font-black text-slate-855 dark:text-white uppercase tracking-wider">Queue Analytics & Volume Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500">OPD Occupancy Peak</span>
              <h4 className="text-xl font-black text-orange-500 mt-1">11:00 AM - 12:30 PM</h4>
            </div>
            <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500">Triage Priority Ratio</span>
              <h4 className="text-xl font-black text-red-500 mt-1">1:4 (Emergency/Routine)</h4>
            </div>
            <div className="p-4 bg-[#003F8A]/5 rounded-2xl border border-[#003F8A]/10 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500">Average Turn Time</span>
              <h4 className="text-xl font-black text-[#003F8A] dark:text-blue-400 mt-1">11.4 Minutes</h4>
            </div>
            {/* Visual SVG Wait Time Trend Chart */}
            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Checked-in Patient Trend</span>
              <svg className="w-full h-8" viewBox="0 0 100 20">
                <path d="M 0 18 Q 20 5 40 12 T 80 2 T 100 15" fill="none" stroke="#FF9933" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Detailed patient queue cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map(patient => {
            const details = PATIENT_DETAILS_MAP[patient.id] || PATIENT_DETAILS_MAP['1'];
            return (
              <div 
                key={patient.id} 
                className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden ${
                  patient.status === 'In Consultation' 
                    ? 'border-2 border-orange-500' 
                    : isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                {patient.status === 'In Consultation' && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white font-extrabold text-[8px] uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                    Active Session
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-400 uppercase">{patient.token}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      patient.priority === 'Emergency'
                        ? 'bg-red-500/15 text-red-500'
                        : patient.priority === 'Urgent'
                        ? 'bg-orange-500/15 text-orange-500'
                        : 'bg-blue-500/15 text-blue-500'
                    }`}>
                      {patient.priority}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <img src={patient.photo} alt={patient.name} className="w-12 h-12 rounded-xl object-cover shadow" />
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">{patient.name}</h4>
                      <p className="text-[10px] text-gray-550 font-bold">{patient.age} Y/O • {patient.gender} • ABHA Linked</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-800/5">
                    <div>
                      <span className="text-gray-500 font-semibold block">Vitals BP</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-300">{details.vitalsHistory[0]?.bp || '120/80'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">Allergies</span>
                      <span className="font-extrabold text-red-500 truncate block">
                        {details.allergies.length > 0 ? details.allergies.join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/10 flex justify-between gap-2">
                  {patient.status === 'Waiting' && (
                    <>
                      <button 
                        onClick={() => handleCallNext(patient.id)}
                        className="flex-1 py-2 bg-[#003F8A] hover:bg-[#002f66] text-white text-xs font-black rounded-lg text-center cursor-pointer"
                      >
                        Call Room
                      </button>
                      <button 
                        onClick={() => handleSkip(patient.id)}
                        className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Defer
                      </button>
                    </>
                  )}
                  {patient.status === 'In Consultation' && (
                    <button 
                      onClick={() => {
                        setCurrentConsultingPatientId(patient.id);
                        setActiveTab('consultation');
                      }}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-lg text-center shadow cursor-pointer"
                    >
                      Resume Workspace
                    </button>
                  )}
                  {patient.status === 'Completed' && (
                    <button 
                      onClick={() => handleRecall(patient.id)}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Recall Patient
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Patients View with ABHA & MCGM Visual Cards, Vitals trend and Timeline
  const renderPatientsView = () => {
    const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];
    const details = PATIENT_DETAILS_MAP[activePatient.id] || PATIENT_DETAILS_MAP['1'];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Directory List */}
        <div className={`lg:col-span-1 p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-808 dark:text-white">Registered Patients</h3>
            <p className="text-xs text-gray-555">ABHA Linked & local medical records</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:ring-1 focus:ring-[#003F8A] ${
                isDarkMode ? 'bg-[#090d16] border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
            {patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedPatientId === p.id
                    ? 'bg-[#003F8A]/5 border-[#003F8A] dark:bg-blue-900/10'
                    : isDarkMode ? 'bg-slate-900/50 border-slate-850 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-808 dark:text-white">{p.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold">{p.age} Y • {p.gender} • Token {p.token}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Cards & Historical logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* VISUAL CARDS FRAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ABHA HEALTH CARD */}
            <div className="bg-gradient-to-br from-orange-500/90 via-white to-green-600/95 p-5 rounded-3xl shadow-xl text-slate-850 relative overflow-hidden border border-white/20 h-48 flex flex-col justify-between">
              {/* Overlay graphics */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <div>
                  <h5 className="text-[9px] font-black uppercase text-orange-955 tracking-wider">NDHM • Govt of India</h5>
                  <h4 className="text-xs font-extrabold text-[#003F8A] dark:text-blue-900 tracking-tight">ABHA Health Card</h4>
                </div>
                <div className="w-8 h-8 bg-white/40 backdrop-blur rounded flex items-center justify-center font-bold text-[#003F8A] text-xs">
                  ID
                </div>
              </div>

              <div className="flex items-center space-x-3.5 z-10">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  <img src={activePatient.photo} alt="Photo" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5 text-slate-900">
                  <h3 className="text-sm font-black tracking-tight">{activePatient.name}</h3>
                  <p className="text-[10px] font-extrabold tracking-wide">{details?.abhaNo || '91-8834-2910-4482'}</p>
                  <p className="text-[9px] font-bold text-slate-600">{details?.abhaAddress || 'rahul@abha'}</p>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-slate-800/10 pt-2 z-10">
                <span className="text-[8px] font-black text-slate-700 uppercase">AYUSHMAN BHARAT LINKED</span>
                <span className="text-[8px] font-black text-slate-700 uppercase">{activePatient.gender} • {activePatient.age} Y/O</span>
              </div>
            </div>

            {/* MCGM DIGITAL HEALTH CARD */}
            <div className="bg-gradient-to-br from-[#003F8A] to-[#002f66] p-5 rounded-3xl shadow-xl text-white relative overflow-hidden border border-white/15 h-48 flex flex-col justify-between">
              <div className="flex justify-between items-start z-10">
                <div>
                  <h5 className="text-[9px] font-black uppercase text-orange-400 tracking-wider">MCGM Hospital Network</h5>
                  <h4 className="text-xs font-black tracking-tight">Digital Patient Health Card</h4>
                </div>
                <Building2 className="w-5 h-5 text-orange-400" />
              </div>

              <div className="space-y-1 z-10">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-350 block">MCGM REGISTERED ACCOUNT</span>
                <h3 className="text-sm font-extrabold tracking-tight">{activePatient.name}</h3>
                <p className="text-[10px] font-mono text-orange-400">{details?.mcgmCardNo || 'MCGM-SION-2026-0812'}</p>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-2 z-10">
                <span className="text-[8px] font-bold text-blue-200">SION GENERAL HOSPITAL</span>
                <span className="text-[8px] font-extrabold text-orange-400">BLOOD GROUP: {details?.bloodGroup || 'O+'}</span>
              </div>
            </div>

          </div>

          {/* DEMOGRAPHICS & CLINICAL SUMMARY */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/10">
              <div>
                <h3 className="text-sm font-black text-slate-808 dark:text-white uppercase tracking-wider">Clinical Demographics</h3>
                <p className="text-xs text-gray-555">Address, phone, and allergy notes</p>
              </div>
              <button 
                onClick={() => {
                  setProvisionalDiagnosis(activePatient.diagnosis);
                  setCurrentConsultingPatientId(activePatient.id);
                  setActiveTab('consultation');
                }}
                className="bg-[#003F8A] hover:bg-[#002f66] text-white text-xs font-black px-4 py-2 rounded-xl shadow transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Initiate Consult</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5">
                <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Contact Phone</span>
                <span className="text-slate-800 dark:text-slate-200">{details?.phone || '+91 98765 43210'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5">
                <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Residential Address</span>
                <span className="text-slate-800 dark:text-slate-200 block truncate">{details?.address || 'Dadar, Mumbai'}</span>
              </div>
              <div className="p-3 bg-red-500/5 rounded-2xl border border-red-500/15">
                <span className="text-[9px] font-bold uppercase text-red-500 block mb-1">Drug Allergies</span>
                <span className="text-red-650 dark:text-red-400 font-extrabold text-[11px]">
                  {details?.allergies && details.allergies.length > 0 ? details.allergies.join(', ') : 'No recorded drug allergy'}
                </span>
              </div>
            </div>

            {/* VITALS HISTORY SPARKLINE */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-855 dark:text-white uppercase tracking-wider">Vitals History Timeline</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details?.vitalsHistory.map((vit, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-800/5 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-black text-[#003F8A] dark:text-blue-400">{vit.date} Vitals check</span>
                      <p className="text-[10px] text-gray-500 mt-1">BP: {vit.bp} mmHg • Pulse: {vit.pulse} bpm • Temp: {vit.temp} °F</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">SpO2: {vit.spo2}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CLINICAL VISIT TIMELINE */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/10">
                <div>
                  <h4 className="text-xs font-black text-slate-855 dark:text-white uppercase tracking-wider">Unified Medical Timeline</h4>
                  <p className="text-[10px] text-gray-500">Birth to present consolidated health locker records</p>
                </div>
                
                {/* Timeline Category Filters */}
                <div className="flex flex-wrap gap-1">
                  {(['all', 'visit', 'surgery', 'lab', 'vaccine'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTimelineFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer uppercase ${
                        timelineFilter === f 
                          ? 'bg-[#003F8A] text-white shadow' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-3 space-y-6 pt-2">
                {((details?.timelineEvents || [
                  { date: '18 Jun 2026', type: 'visit' as const, title: 'Orthopaedics OPD Consultation', facility: 'Sion Municipal Hospital', details: `Diagnosed with Knee Osteoarthritis and severe Vitamin D deficiency. Prescribed Tab D3 60K & PCM.` }
                ])
                .filter(ev => {
                  if (timelineFilter === 'all') return true;
                  if (timelineFilter === 'lab') return ev.type === 'lab' || ev.type === 'radiology';
                  return ev.type === timelineFilter;
                })
                .map((ev, i) => {
                  let Icon = Stethoscope;
                  let bg = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-505';
                  let label = 'Outpatient Consult';

                  if (ev.type === 'birth') {
                    Icon = User;
                    bg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
                    label = 'Birth Registration';
                  } else if (ev.type === 'vaccine') {
                    Icon = ShieldAlert;
                    bg = 'bg-teal-500/10 border-teal-500/20 text-teal-500';
                    label = 'Immunization';
                  } else if (ev.type === 'surgery') {
                    Icon = Activity;
                    bg = 'bg-red-500/10 border-red-500/20 text-red-500';
                    label = 'Surgery / Admission';
                  } else if (ev.type === 'lab') {
                    Icon = FlaskConical;
                    bg = 'bg-purple-500/10 border-purple-500/20 text-purple-550';
                    label = 'Pathology Lab';
                  } else if (ev.type === 'radiology') {
                    Icon = Cpu;
                    bg = 'bg-blue-500/10 border-blue-500/20 text-blue-500';
                    label = 'Radiology Imaging';
                  } else if (ev.type === 'discharge') {
                    Icon = CheckCircle2;
                    bg = 'bg-amber-500/10 border-amber-500/20 text-amber-500';
                    label = 'Discharge Summary';
                  }

                  return (
                    <div key={i} className="relative">
                      {/* Bullet Icon */}
                      <span className={`absolute -left-[37px] top-1.5 p-1 rounded-full border-2 ${
                        isDarkMode ? 'border-slate-950 bg-slate-900' : 'border-white bg-slate-50'
                      } ${bg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-100 hover:shadow-sm'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-bold">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-[#003F8A] dark:text-blue-400">{ev.date}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-slate-500 dark:text-slate-400">{label}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{ev.facility}</span>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <h5 className="text-xs font-black text-slate-808 dark:text-white">{ev.title}</h5>
                          <p className="text-[11px] leading-relaxed text-slate-650 dark:text-slate-350 font-medium">{ev.details}</p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-dashed border-slate-800/10 flex items-center justify-between text-[9px] font-bold text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span className="text-emerald-600">AES-256 Cloud Locker</span>
                          </span>
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded">ABDM/ABHA Linked</span>
                        </div>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>
          </div>
        </div>
    );
  };

  // 4. Consultation View Workspace (3-column layout)
  const renderConsultationView = () => {
    const details = PATIENT_DETAILS_MAP[currentConsultingPatient.id] || PATIENT_DETAILS_MAP['1'];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: PATIENT SUMMARY & VITALS (LEFT) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mini ABHA & MCGM Visual Info */}
          <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/10">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                <img src={currentConsultingPatient.photo} alt={currentConsultingPatient.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-805 dark:text-white">{currentConsultingPatient.name}</h3>
                <p className="text-[10px] text-gray-500 font-bold">{currentConsultingPatient.age} Y • {currentConsultingPatient.gender} • Token {currentConsultingPatient.token}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-500">ABHA Account:</span>
                <span className="font-extrabold text-[#003F8A] dark:text-blue-400">{details?.abhaAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-555">MCGM Card No:</span>
                <span className="font-mono text-orange-500">{details?.mcgmCardNo}</span>
              </div>
              <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10 text-[10px] text-red-500 leading-normal">
                ⚠️ <strong className="font-black uppercase">Drug Allergies:</strong> {details?.allergies.length > 0 ? details.allergies.join(', ') : 'No recorded allergy'}
              </div>
            </div>

            {/* ECG wave monitor */}
            <div className="space-y-2 pt-2 border-t border-slate-800/10">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                <span>🔴 LIVE ECG MONITOR</span>
                <span className="text-green-500 flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>80 BPM</span>
                </span>
              </div>
              <svg className="w-full h-16 bg-slate-950 rounded-xl p-2 border border-slate-850" viewBox="0 0 40 100" preserveAspectRatio="none">
                <path
                  d={`M 0 50 ${telemetryECG.map((val, idx) => `L ${idx} ${100 - val}`).join(' ')}`}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Vitals Form */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Consultation Vitals</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Blood Pressure', stateKey: 'bp', val: consultVitals.bp },
                  { label: 'Pulse Rate', stateKey: 'pulse', val: consultVitals.pulse },
                  { label: 'Body Temp', stateKey: 'temp', val: consultVitals.temp },
                  { label: 'SpO2 Oxygen', stateKey: 'spo2', val: consultVitals.spo2 }
                ].map((vit) => (
                  <div key={vit.label} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-800/5 space-y-1">
                    <span className="text-[8px] font-bold uppercase text-gray-500 block">{vit.label}</span>
                    <input
                      type="text"
                      value={vit.val}
                      onChange={(e) => setConsultVitals(prev => ({ ...prev, [vit.stateKey]: e.target.value }))}
                      className="w-full bg-transparent font-black text-slate-805 dark:text-white outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: ACTIVE CONSULTATION & VOICE SCRIBE (CENTER) */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-800/10">
              <div>
                <h3 className="text-sm font-black text-slate-805 dark:text-white uppercase tracking-wider">AI Voice Scribing & Dictation</h3>
                <p className="text-[10px] text-gray-500">Continuous translation with Web Speech</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isScribing ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-slate-150 text-slate-400'}`}>
                {isScribing ? 'Live Mic' : 'Standby'}
              </span>
            </div>

            {/* Multilingual Translation selectors */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/10 text-xs">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Doctor Input Language</label>
                <select
                  value={scribeInputLang}
                  onChange={(e) => setScribeInputLang(e.target.value as any)}
                  className={`w-full px-2 py-2 rounded-xl border text-[10px] font-bold outline-none cursor-pointer ${
                    isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="en">English (Dictation)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Patient Language</label>
                <select
                  value={scribePatientLang}
                  onChange={(e) => setScribePatientLang(e.target.value as any)}
                  className={`w-full px-2 py-2 rounded-xl border text-[10px] font-bold outline-none cursor-pointer ${
                    isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="en">English (US EMR)</option>
                </select>
              </div>
            </div>
            
            <div className="p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl text-[10px] text-purple-650 dark:text-purple-400 font-semibold leading-relaxed">
              🌐 <strong>AI Real-time Translation Core Active</strong>:<br/>
              Doctor speaks in {scribeInputLang === 'en' ? 'English' : scribeInputLang === 'mr' ? 'Marathi' : 'Hindi'} and patient reads in {scribePatientLang === 'en' ? 'English' : scribePatientLang === 'mr' ? 'Marathi' : 'Hindi'}. Formal EMR files automatically compile in standard medical English for ABDM/ABHA locker records.
            </div>

            {/* Scribing wave animation */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 flex flex-col items-center justify-center space-y-3">
              <div className="flex justify-center items-end space-x-1.5 h-12">
                {[12, 28, 15, 36, 18, 42, 20, 30, 24, 48, 18, 12, 8, 22, 16, 28, 12, 6].map((h, idx) => (
                  <motion.span
                    key={idx}
                    animate={isScribing ? { height: [8, h, 8] } : { height: 8 }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.04, ease: 'easeInOut' }}
                    className="w-1 bg-orange-500 rounded-full"
                  />
                ))}
              </div>

              <button 
                onClick={toggleScribing}
                className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isScribing 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-[#003F8A] hover:bg-[#002f66] text-white shadow'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isScribing ? 'Pause Scribing' : 'Record Consultation Scribe'}</span>
              </button>
            </div>

            {/* Transcribed logs with Speaker Labels */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-800/5 max-h-40 overflow-y-auto space-y-2 no-scrollbar">
              {scribingLogs.map((log, idx) => (
                <div key={idx} className="text-[11px] leading-relaxed">
                  <span className={`font-black uppercase tracking-wider text-[9px] mr-1.5 ${
                    log.speaker === 'Doctor' ? 'text-[#003F8A] dark:text-blue-400' : 'text-orange-500'
                  }`}>
                    [{log.speaker}]:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">"{log.text}"</span>
                </div>
              ))}
              {scribingLogs.length === 0 && (
                <p className="text-center text-[10px] text-gray-400 font-bold py-6">
                  Click the button above to begin voice transcription simulation or live mic dictation.
                </p>
              )}
              <div ref={scribingEndRef} />
            </div>

            {/* Multi-drug Prescriber pad */}
            <div className="space-y-4 pt-3 border-t border-slate-800/10">
              <h4 className="text-[10px] font-black uppercase text-orange-500 tracking-wider">Multi-Drug Prescriber Pad</h4>
              
              <div className="flex flex-wrap gap-1.5">
                {['Tab. Paracetamol 650mg', 'Tab. Aceclofenac 100mg', 'Tab. Pantoprazole 40mg', 'Cap. Amoxicillin 500mg'].map(drug => (
                  <button
                    key={drug}
                    type="button"
                    onClick={() => setNewMed(prev => ({ ...prev, name: drug }))}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[9px] font-bold text-slate-650 dark:text-slate-350 transition-all cursor-pointer"
                  >
                    + {drug.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Medication Name (e.g. Tab. Paracetamol 650mg)"
                  value={newMed.name}
                  onChange={(e) => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:ring-1 focus:ring-[#003F8A] ${
                    isDarkMode ? 'bg-[#090d16] border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase text-gray-500 block mb-1">Dose frequency</span>
                    <select
                      value={newMed.dose}
                      onChange={(e) => setNewMed(prev => ({ ...prev, dose: e.target.value }))}
                      className={`w-full px-2 py-2 rounded-xl border text-[10px] font-bold outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-855 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="1-0-1">1-0-1 (BD)</option>
                      <option value="1-0-0">1-0-0 (OD)</option>
                      <option value="0-0-1">0-0-1 (HS)</option>
                      <option value="1-1-1">1-1-1 (TDS)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[8px] font-extrabold uppercase text-gray-500 block mb-1">Food timing</span>
                    <select
                      value={newMed.timing}
                      onChange={(e) => setNewMed(prev => ({ ...prev, timing: e.target.value }))}
                      className={`w-full px-2 py-2 rounded-xl border text-[10px] font-bold outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-855 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[8px] font-extrabold uppercase text-gray-500 block mb-1">Duration</span>
                    <select
                      value={newMed.duration}
                      onChange={(e) => setNewMed(prev => ({ ...prev, duration: e.target.value }))}
                      className={`w-full px-2 py-2 rounded-xl border text-[10px] font-bold outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-855 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="5 Days">5 Days</option>
                      <option value="3 Days">3 Days</option>
                      <option value="7 Days">7 Days</option>
                      <option value="10 Days">10 Days</option>
                      <option value="1 Month">1 Month</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddMed}
                  className="w-full bg-[#003F8A] hover:bg-[#002f66] text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Prescription Pad</span>
                </button>
              </div>

              {/* Active prescription list */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Active Medicines Pad</span>
                <div className="space-y-1.5">
                  {rxMeds.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-800/5 flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-extrabold text-slate-855 dark:text-white">{med.name}</h5>
                        <p className="text-[9px] text-gray-500 font-bold">{med.dose} • {med.timing} • {med.duration}</p>
                      </div>
                      <button onClick={() => handleRemoveMed(idx)} className="p-1 text-slate-450 hover:text-red-500 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* COLUMN 3: AI CLINICAL ASSISTANT & DIGITAL SIGN-OFF (RIGHT) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Clinical Assistant Panel */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800/10">
              <Cpu className="w-5 h-5 text-orange-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Diagnostics & ICD-10</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-500 block mb-1">ICD-10 Mapped Diagnosis</span>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-800/5 rounded-xl font-bold flex justify-between items-center">
                  <span className="text-slate-800 dark:text-slate-200">{provisionalDiagnosis}</span>
                  <span className="text-[9px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-black">ICD-10</span>
                </div>
              </div>

              {/* SOAP notes input */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-gray-500 block">AI Compiled SOAP Notes</span>
                <textarea
                  rows={3}
                  value={`S: ${soapNotes.subjective}\nO: ${soapNotes.objective}\nA: ${soapNotes.assessment}\nP: ${soapNotes.plan}`}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setSoapNotes({
                      subjective: lines[0]?.replace('S: ', '') || '',
                      objective: lines[1]?.replace('O: ', '') || '',
                      assessment: lines[2]?.replace('A: ', '') || '',
                      plan: lines[3]?.replace('P: ', '') || ''
                    });
                  }}
                  className={`w-full p-2 text-[10px] font-semibold border rounded-xl outline-none resize-none no-scrollbar ${
                    isDarkMode ? 'bg-[#090d16] border-slate-800 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                />
              </div>

              {/* Interaction Warning Panel */}
              <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl space-y-1">
                <h5 className="font-extrabold text-red-500 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Interaction Safety Warnings</span>
                </h5>
                <p className="text-[10px] text-gray-555 leading-relaxed font-semibold">
                  Checking {rxMeds.length} pad drugs against patient {details?.allergies.length} allergies... Safe. Ensure Aceclofenac is taken post-meals to avoid gastric irritation.
                </p>
              </div>
            </div>
          </div>

          {/* E-Sign Block with signature canvas */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Verify & Sign Session</h3>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 cursor-pointer text-xs font-semibold leading-relaxed">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#003F8A] focus:ring-[#003F8A] w-4 h-4 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-805 dark:text-white">Transmit to ABHA Locker</span>
                  <p className="text-[10px] text-gray-500 leading-normal">Syncs e-prescription directly to patient ABHA card locker.</p>
                </div>
              </label>

              {/* Digital signature canvas box */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase text-gray-500 block">Sign E-Prescription</span>
                <div className={`w-full h-24 rounded-xl border border-dashed flex flex-col justify-between p-1 relative ${
                  isDarkMode ? 'bg-[#090d16] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <svg 
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={() => setIsDrawing(false)}
                  >
                    {signaturePaths.map((pathStr, i) => (
                      <path key={i} d={pathStr} fill="none" stroke={isDarkMode ? '#ffffff' : '#003f8a'} strokeWidth="2" strokeLinecap="round" />
                    ))}
                  </svg>
                  {isSignatureCanvasBlank && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-gray-400 font-bold">
                      Draw signature here using mouse
                    </div>
                  )}
                  {!isSignatureCanvasBlank && (
                    <button 
                      onClick={() => { setSignaturePaths([]); setIsSignatureCanvasBlank(true); }}
                      className="absolute bottom-1 right-1 text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-black hover:bg-red-500/20 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* PIN INPUT */}
              <div>
                <span className="text-[9px] font-black uppercase text-gray-500 block mb-1">Doctor Verification PIN</span>
                <input
                  type="password"
                  placeholder="Enter 4-digit PIN (1234)"
                  value={doctorPin}
                  onChange={(e) => setDoctorPin(e.target.value)}
                  maxLength={4}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold outline-none text-center focus:ring-1 focus:ring-[#003F8A] ${
                    isDarkMode ? 'bg-[#090d16] border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              <button
                onClick={handleSignatureSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow transition-all cursor-pointer"
              >
                <FileSignature className="w-4 h-4" />
                <span>Digitally Lock & File Session</span>
              </button>
            </div>
          </div>

          {/* AI VOICE LOG DATABASE LIST */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/10">
              <Volume2 className="w-5 h-5 text-[#003F8A] dark:text-blue-400" />
              <h3 className="text-sm font-black text-slate-805 dark:text-white uppercase tracking-wider">Voice Recording Logs</h3>
            </div>
            
            <div className="space-y-2 max-h-[30vh] overflow-y-auto no-scrollbar">
              {savedVoiceLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-800/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-[11px] font-black text-slate-855 dark:text-white">{log.patientName}</h5>
                      <span className="text-[8px] text-gray-550 font-semibold">{log.date} • {log.duration} • {log.size}</span>
                    </div>
                    <span className="text-[8px] bg-green-500/10 text-green-600 font-extrabold px-1.5 py-0.5 rounded">
                      {log.encryption}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="font-mono text-gray-400 text-[8px]">{log.filename}</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleVoiceLogPlay(log.id)}
                        className="text-[#003F8A] dark:text-blue-400 font-extrabold flex items-center space-x-1 hover:underline cursor-pointer"
                      >
                        {log.playing ? <VolumeX className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>{log.playing ? 'Pause' : 'Play'}</span>
                      </button>
                      <button 
                        onClick={() => setToast({ id: `t-${Date.now()}`, title: 'Download Triggered', message: `Downloading encrypted recording file: ${log.filename}`, type: 'success' })}
                        className="text-orange-500 font-extrabold flex items-center space-x-1 hover:underline cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                  {log.playing && (
                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 10, ease: 'linear' }}
                        className="h-full bg-orange-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    );
  };

  // 5. Labs View with urgent triggers
  const renderLabsView = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex justify-between items-center p-6 rounded-3xl border ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-[#003F8A]/10'
        }`}>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Pathology Lab Orders Deck</h2>
            <p className="text-xs text-gray-500">Track raised laboratory investigations and critical alerts</p>
          </div>
          <button 
            onClick={() => {
              setActiveLabPatient(patients[0]);
              setShowLabOrderModal(true);
            }}
            className="bg-[#003F8A] hover:bg-[#002f66] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Lab Test</span>
          </button>
        </div>

        {/* Pathology orders deck list table */}
        <div className={`p-6 rounded-3xl border shadow-sm overflow-x-auto ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/10 text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Investigation details</th>
                <th className="py-3 px-4">Requested date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10 font-medium">
              {[
                { id: 'LAB-9801', name: 'Rahul Anil Patil', details: 'Complete Blood Count, Serum Uric Acid', date: '08 Jul 2026', priority: 'URGENT', status: 'In Process' },
                { id: 'LAB-9782', name: 'Ayesha Shaikh', details: 'Rheumatoid Factor Profile', date: '07 Jul 2026', priority: 'Routine', status: 'Completed' },
                { id: 'LAB-9711', name: 'Mahesh Jadhav', details: 'Serum Calcium, Vitamin D levels', date: '06 Jul 2026', priority: 'Routine', status: 'Completed' }
              ].map(ord => (
                <tr key={ord.id} className="hover:bg-slate-500/5 transition-colors">
                  <td className="py-4 px-4 font-black text-slate-800 dark:text-slate-200">{ord.id}</td>
                  <td className="py-4 px-4 font-extrabold">{ord.name}</td>
                  <td className="py-4 px-4 text-slate-650 dark:text-slate-350">{ord.details}</td>
                  <td className="py-4 px-4 text-gray-500">{ord.date}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      ord.priority === 'URGENT' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {ord.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      ord.status === 'Completed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 6. Reports View (DICOM Viewer presets)
  const renderReportsView = () => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* DICOM IMAGE VIEWER (LEFT/CENTER) */}
        <div className="xl:col-span-2 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/10">
              <div>
                <h3 className="text-sm font-black text-slate-855 dark:text-white uppercase tracking-wider">DICOM Radiography Web Reader</h3>
                <p className="text-xs text-gray-555">Knee AP/Lateral Joint Film • Patient Rahul Patil</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setDicomPreset('Default')}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg cursor-pointer ${dicomPreset === 'Default' ? 'bg-[#003F8A] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                >
                  Normal
                </button>
                <button 
                  onClick={() => {
                    setDicomPreset('Invert');
                    setDicomContrast(120);
                    setDicomBrightness(90);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg cursor-pointer ${dicomPreset === 'Invert' ? 'bg-[#003F8A] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                >
                  Invert
                </button>
                <button 
                  onClick={() => {
                    setDicomPreset('Bone');
                    setDicomContrast(160);
                    setDicomBrightness(70);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg cursor-pointer ${dicomPreset === 'Bone' ? 'bg-[#003F8A] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                >
                  Bone
                </button>
              </div>
            </div>

            {/* Interactive X-Ray image display */}
            <div className="bg-black rounded-2xl h-96 relative flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
              <motion.img 
                style={{ 
                  filter: `brightness(${dicomBrightness}%) contrast(${dicomContrast}%) ${dicomPreset === 'Invert' ? 'invert(1)' : ''}`,
                  scale: dicomZoom / 100
                }}
                src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600"
                alt="Knee DICOM XRay Film" 
                className="max-h-full object-contain pointer-events-none"
              />
              <span className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-[9px] text-orange-400 font-mono px-2 py-1 rounded">
                Scale: {dicomZoom}% • Brightness: {dicomBrightness}% • Contrast: {dicomContrast}%
              </span>
              <span className="absolute top-4 right-4 bg-black/60 backdrop-blur text-[8px] text-green-500 font-mono px-2 py-1 rounded tracking-widest animate-pulse">
                🟢 DICOM LOCK SYNC ACTIVE
              </span>
            </div>

            {/* DICOM Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/10 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-gray-500 uppercase text-[9px]">Brightness Level</span>
                <input 
                  type="range" 
                  min={50} 
                  max={150} 
                  value={dicomBrightness} 
                  onChange={(e) => setDicomBrightness(Number(e.target.value))}
                  className="w-full accent-[#003F8A]" 
                />
              </div>
              <div className="space-y-1">
                <span className="text-gray-550 uppercase text-[9px]">Contrast Intensity</span>
                <input 
                  type="range" 
                  min={50} 
                  max={200} 
                  value={dicomContrast} 
                  onChange={(e) => setDicomContrast(Number(e.target.value))}
                  className="w-full accent-orange-500" 
                />
              </div>
              <div className="space-y-1">
                <span className="text-gray-555 uppercase text-[9px]">Zoom Ratio</span>
                <input 
                  type="range" 
                  min={100} 
                  max={250} 
                  value={dicomZoom} 
                  onChange={(e) => setDicomZoom(Number(e.target.value))}
                  className="w-full accent-[#003F8A]" 
                />
              </div>
            </div>

          </div>
        </div>

        {/* IMAGING REPORT ARCHIVES (RIGHT) */}
        <div className="xl:col-span-1 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Radiology Diagnostics Log</h3>
            <div className="space-y-3">
              {[
                { id: 'RAD-2281', name: 'Rahul Anil Patil', study: 'AP/Lateral Knee Joint Film', date: 'Today, 10:15 AM', notes: 'Focal osteophyte formation, joint space narrowing' },
                { id: 'RAD-2190', name: 'Mahesh Jadhav', study: 'CT Head Traumatic Brain Film', date: 'Yesterday, 02:30 PM', notes: 'No intracranial hemorrhage, trace scalp hematoma' },
                { id: 'RAD-1992', name: 'Suresh Kumar', study: 'Spine Lumbar MRI Film', date: '3 Days Ago', notes: 'L4-L5 disc protrusion causing mild lateral stenosis' }
              ].map(rad => (
                <div key={rad.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-800/5 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-805 dark:text-white">{rad.name}</span>
                    <span className="text-[8px] font-mono text-gray-500">{rad.id}</span>
                  </div>
                  <p className="font-semibold text-[#003F8A] dark:text-blue-400 text-[11px]">{rad.study}</p>
                  <p className="text-[10px] text-gray-500 font-medium italic">"{rad.notes}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  };

  // 7. Doctor-Nurse Chat View
  const renderMessagesView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
        {/* Chat sidebar threads */}
        <div className={`lg:col-span-1 p-6 rounded-3xl border shadow-sm space-y-4 flex flex-col ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <h3 className="text-sm font-black text-slate-805 dark:text-white uppercase tracking-wider">OPD Chat Channels</h3>
          <div className="space-y-2">
            {[
              { id: 'Nurse', name: 'Nurse Sneha', role: 'OPD Staff Nurse', status: '🟢 Online', active: chatThread === 'Nurse' },
              { id: 'HOD', name: 'Dr. Vinay Joshi', role: 'Ortho Department HOD', status: '🟢 Online', active: chatThread === 'HOD' }
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => setChatThread(ch.id as any)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  ch.active
                    ? 'bg-[#003F8A]/5 border-[#003F8A]'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-850 hover:bg-slate-200/5'
                }`}
              >
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">{ch.name}</h4>
                  <span className="text-[9px] text-gray-550 font-bold block">{ch.role}</span>
                </div>
                <span className="text-[9px] font-bold text-green-500">{ch.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat conversations */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/10">
            <div>
              <h4 className="text-xs font-black text-slate-805 dark:text-white">{chatThread === 'Nurse' ? 'Nurse Sneha' : 'Dr. Vinay Joshi'}</h4>
              <span className="text-[9px] text-gray-500 font-semibold">{chatThread === 'Nurse' ? 'Staff Nurse Room 4B' : 'Ortho HOD Office'}</span>
            </div>
            <span className="text-[9px] text-green-500 font-bold">🟢 Connected</span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar max-h-[50vh]">
            {chatMessages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                  m.sender === 'You' 
                    ? 'bg-[#003F8A] text-white rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {m.type === 'text' ? (
                    <p>{m.text}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-550">{m.text}</p>
                      <button 
                        onClick={() => toggleChatVoicePlay(m.id)}
                        className="flex items-center space-x-1 text-orange-500 font-bold hover:underline cursor-pointer"
                      >
                        {m.playing ? <VolumeX className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{m.playing ? 'Pause Voice Note' : `Play Voice Note (${m.duration})`}</span>
                      </button>
                      {m.playing && (
                        <div className="w-24 h-1 bg-slate-350 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 18, ease: 'linear' }}
                            className="h-full bg-orange-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[8px] text-gray-550 mt-1 font-bold">{m.sender} • {m.time}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/10 flex items-center space-x-2 relative">
            <input
              type="text"
              placeholder="Type your reply here..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className={`flex-1 px-4 py-3 rounded-xl border text-xs font-semibold outline-none focus:ring-1 focus:ring-[#003F8A] ${
                isDarkMode ? 'bg-[#090d16] border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <button 
              onClick={handleSendMessage}
              className="px-4 py-3 bg-[#003F8A] hover:bg-[#002f66] text-white text-xs font-black rounded-xl cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 8. Settings View
  const renderSettingsView = () => {
    return (
      <div className={`p-6 rounded-3xl border shadow-sm max-w-2xl mx-auto space-y-6 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="pb-3 border-b border-slate-800/10">
          <h3 className="text-base font-black text-slate-808 dark:text-white uppercase tracking-wider">Portal Configuration Settings</h3>
          <p className="text-xs text-gray-555">Adjust dictation preferences, security & localization</p>
        </div>

        <div className="space-y-4 text-xs font-semibold">
          {/* Accent Config */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Voice Dictation Accent Profile</span>
            <select
              value={speechAccent}
              onChange={(e) => setSpeechAccent(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-extrabold outline-none cursor-pointer ${
                isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="Indian English">Indian Accent English (en-IN)</option>
              <option value="US English">American Accent English (en-US)</option>
              <option value="UK English">British Accent English (en-GB)</option>
              <option value="Hindi-English">Hinglish / Hindi Dictation (hi-IN)</option>
            </select>
          </div>

          {/* Biometrics */}
          <label className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={biometricsEnabled} 
              onChange={(e) => setBiometricsEnabled(e.target.checked)}
              className="rounded border-slate-300 text-[#003F8A] focus:ring-[#003F8A] w-4 h-4 mt-0.5" 
            />
            <div>
              <span className="font-extrabold text-slate-805 dark:text-white">Enable Biometric Signature seal</span>
              <p className="text-[10px] text-gray-550 leading-normal">Authenticate prescriptions using system fingerprint sensor/face recognition seal.</p>
            </div>
          </label>

          {/* Voice Assistant Toggle */}
          <label className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={voiceSpeechEnabled} 
              onChange={(e) => {
                setVoiceSpeechEnabled(e.target.checked);
                localStorage.setItem('mcgm-enable-voice-speech', e.target.checked ? 'true' : 'false');
              }}
              className="rounded border-slate-300 text-[#003F8A] focus:ring-[#003F8A] w-4 h-4 mt-0.5" 
            />
            <div>
              <span className="font-extrabold text-slate-805 dark:text-white">Enable Voice Assistant Speech Responses</span>
              <p className="text-[10px] text-gray-550 leading-normal">Allow the voice assistant to speak response confirmation messages using speech synthesis.</p>
            </div>
          </label>

          {/* Font scale adjustment */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Adjust Layout Font Scale</span>
            <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl w-64 text-center">
              {(['Small', 'Normal', 'Large'] as const).map(fs => (
                <button
                  key={fs}
                  onClick={() => setFontSizeSetting(fs)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    fontSizeSetting === fs ? 'bg-[#003F8A] text-white shadow' : 'text-slate-500'
                  }`}
                >
                  {fs}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Code */}
          <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
            <h5 className="font-extrabold text-orange-500 flex items-center space-x-1.5 mb-1 text-[11px]">
              <Lock className="w-4 h-4" />
              <span>Ayushman Bharat E-Signature Code</span>
            </h5>
            <p className="text-[10px] text-gray-550 leading-relaxed font-semibold">
              Your ABDM registered credentials have e-sign capability enabled. E-sign transactions require pin authorization ("1234").
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 9. Duty Timeline View
  const renderDutyTimelineView = () => {
    return (
      <div className={`p-6 rounded-3xl border shadow-sm max-w-xl mx-auto space-y-6 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="pb-3 border-b border-slate-800/10">
          <h3 className="text-base font-black text-slate-808 dark:text-white uppercase tracking-wider">Doctor Duty Shift Timeline</h3>
          <p className="text-xs text-gray-555">Sion General Hospital • Orthopaedics department shift roster</p>
        </div>

        <div className="relative border-l-2 border-[#003F8A]/30 pl-6 ml-3 space-y-6 text-xs">
          {[
            { time: '09:00 AM - 10:00 AM', label: 'Rounds & Shift Handover', desc: 'Visit admitted orthopaedic patients in male ward 4A.' },
            { time: '10:00 AM - 01:00 PM', label: 'General OPD Session (Room #4B)', desc: 'Checked in live queue patients, raising lab & radiology profiles.' },
            { time: '01:00 PM - 02:00 PM', label: 'Lunch & Teleconsultations', desc: 'Sync session for video consult bookings.' },
            { time: '02:00 PM - 04:00 PM', label: 'Ortho Injection Roster', desc: 'Joint injection procedures & splint plaster checks.' },
            { time: '04:00 PM - 05:00 PM', label: 'Casualty Trauma Duty', desc: 'Casualty Trauma room triage cover.' }
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#003F8A] border-4 border-white dark:border-slate-950" />
              <div className="space-y-1">
                <span className="font-mono text-orange-500 font-extrabold">{item.time}</span>
                <h4 className="font-extrabold text-slate-800 dark:text-white">{item.label}</h4>
                <p className="text-gray-500 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex font-sans antialiased transition-colors duration-250 ${
      isDarkMode ? 'bg-[#090d16] text-white dark' : 'bg-[#F8FAFD] text-slate-808'
    } ${
      fontSizeSetting === 'Small' ? 'text-xs' : fontSizeSetting === 'Large' ? 'text-base' : 'text-sm'
    }`}>
      
      {/* LEFT SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 hidden lg:flex flex-col border-r transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="p-6 border-b border-dashed border-slate-800/20 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#003F8A] to-[#0050cc] flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest text-[#003F8A] dark:text-blue-400">MCGM</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Digital Hospital</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'twin', label: 'Command Center', icon: Activity },
            { id: 'queue', label: 'Live Queue', icon: ListOrdered, badge: waitingCount },
            { id: 'patients', label: 'Patients Directory', icon: Users },
            { id: 'consultation', label: 'Active Consultation', icon: Stethoscope },
            { id: 'labs', label: 'Lab Orders', icon: FlaskConical },
            { id: 'reports', label: 'Radiology / Reports', icon: FileSpreadsheet }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#003F8A] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === item.id 
                      ? 'bg-white text-[#003F8A]' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 border-t border-slate-800/10 mt-6 space-y-1.5">
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-[#003F8A] text-white'
                  : 'text-slate-400 hover:bg-slate-850/50 hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Duty Roster</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-[#003F8A] text-white'
                  : 'text-slate-400 hover:bg-slate-850/50 hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Doctor Chat</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#003F8A] text-white'
                  : 'text-slate-400 hover:bg-slate-850/50 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Portal Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* MIDDLE CONTENT COLUMN */}
      <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        
        {/* HEADER */}
        <header className={`sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md transition-colors duration-200 ${
          isDarkMode ? 'bg-[#090d16]/90 border-slate-800' : 'bg-[#f8fafc]/90 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-orange-500">Sion Municipal Hospital</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-808 dark:text-white">{dict.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Command Palette Trigger */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-550 hover:text-slate-800 hover:border-slate-355'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search commands...</span>
              <kbd className="text-[10px] font-sans font-black bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-300/25">⌘K</kbd>
            </button>

            {/* Language Selection */}
            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 text-[11px] font-bold">
              {(['en', 'mr', 'hi'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded cursor-pointer ${lang === l ? 'bg-[#003F8A] text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Dark Mode */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-900" />}
            </button>

            {/* Offline Mode Sync Indicator */}
            <button
              onClick={() => {
                if (!isOfflineMode) {
                  // Switch to offline
                  setIsOfflineMode(true);
                  setOfflineSyncState('idle');
                  setToast({
                    id: `offline-${Date.now()}`,
                    title: 'Offline Local Node Active',
                    message: 'Disconnected from cloud database. Switched to local offline EMR cache node. Operations fully functional.',
                    type: 'alert'
                  });
                } else {
                  // Switch to online and trigger sync
                  setOfflineSyncState('syncing');
                  setToast({
                    id: `syncing-${Date.now()}`,
                    title: 'Connecting & Syncing',
                    message: 'Reconnected. Synchronizing local records and logs to MCGM central ABDM ledger...',
                    type: 'info'
                  });
                  setTimeout(() => {
                    setIsOfflineMode(false);
                    setOfflineSyncState('synced');
                    setOfflinePendingChanges(0);
                    setToast({
                      id: `synced-${Date.now()}`,
                      title: 'Synchronization Complete',
                      message: 'All local clinical records successfully written to public health locker.',
                      type: 'success'
                    });
                  }, 2500);
                }
              }}
              className={`p-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer border ${
                isOfflineMode 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20' 
                  : offlineSyncState === 'syncing'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 animate-pulse'
                  : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20'
              }`}
              title={isOfflineMode ? "Offline Mode active. Click to go online and sync." : "System online. Click to simulate internet loss."}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-[10px] font-black hidden lg:inline">OFFLINE NODE ({offlinePendingChanges})</span>
                </>
              ) : offlineSyncState === 'syncing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-black hidden lg:inline">SYNCING...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-[10px] font-black hidden lg:inline">ONLINE SYNCED</span>
                </>
              )}
            </button>

            {/* Status Select */}
            <select
              value={docStatus}
              onChange={(e) => setDocStatus(e.target.value as any)}
              className={`pl-2 pr-6 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                docStatus === 'Available' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-600' 
                  : docStatus === 'Busy'
                  ? 'bg-red-500/10 border-red-500/30 text-red-505'
                  : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
              }`}
            >
              <option value="Available">🟢 Available</option>
              <option value="Busy">🔴 Busy</option>
              <option value="Offline">⚪ Offline</option>
            </select>

            {/* Dr. Patil Profile Card */}
            <div className="flex items-center space-x-3 border-l border-slate-750/15 pl-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150"
                  alt="Doctor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left hidden md:block">
                <h4 className="text-xs font-black text-slate-808 dark:text-white">Dr. Anil Patil</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">{dict.dept}</p>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'dashboard' && renderDashboardView()}
          {activeTab === 'twin' && <CommandCenterTab />}
          {activeTab === 'queue' && renderQueueView()}
          {activeTab === 'patients' && renderPatientsView()}
          {activeTab === 'consultation' && renderConsultationView()}
          {activeTab === 'labs' && renderLabsView()}
          {activeTab === 'reports' && renderReportsView()}
          {activeTab === 'messages' && renderMessagesView()}
          {activeTab === 'settings' && renderSettingsView()}
          {activeTab === 'timeline' && renderDutyTimelineView()}
        </div>

      </main>

      {/* OVERLAY MODALS & DIALOGS */}
      <AnimatePresence>
        
        {/* LAB ORDER DIALOG */}
        {showLabOrderModal && (
          <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-6 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/10">
                <h3 className="text-sm font-black uppercase tracking-wider">Raise New Pathology Lab Order</h3>
                <button onClick={() => setShowLabOrderModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 text-xs font-semibold">
                <span className="text-gray-500">Patient:</span>
                <span className="font-extrabold text-slate-855 dark:text-white ml-2">{activeLabPatient?.name} ({activeLabPatient?.token})</span>
              </div>

              <div className="space-y-2.5">
                {[
                  'CBC (Complete Blood Count)',
                  'LFT (Liver Function Test)',
                  'RFT (Renal Function Test)',
                  'Serum Uric Acid',
                  'Serum Calcium & Joint Profile',
                  'Rheumatoid Factor (RF) profile'
                ].map(test => (
                  <label key={test} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-905/30 hover:bg-slate-500/5 rounded-xl border border-slate-800/5 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedLabTests.includes(test)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLabTests(prev => [...prev, test]);
                        } else {
                          setSelectedLabTests(prev => prev.filter(t => t !== test));
                        }
                      }}
                      className="rounded border-slate-300 text-[#003F8A] focus:ring-[#003F8A] w-4 h-4"
                    />
                    <span>{test}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-xs font-extrabold text-red-505 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isLabUrgent}
                    onChange={(e) => setIsLabUrgent(e.target.checked)}
                    className="rounded border-red-300 text-red-500 focus:ring-red-500" 
                  />
                  <span>🚨 FLAG AS STAT / URGENT ORDER</span>
                </label>

                <textarea
                  rows={2}
                  placeholder="Clinical notes or indications for pathologist..."
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none resize-none ${
                    isDarkMode ? 'bg-[#090d16] border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <button
                onClick={handleLabOrderSubmit}
                disabled={selectedLabTests.length === 0}
                className="w-full bg-[#003F8A] hover:bg-[#002f66] text-white py-3.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Send Order Requests to Laboratory
              </button>
            </motion.div>
          </div>
        )}

        {/* RADIOLOGY ORDER DIALOG */}
        {showRadiologyModal && (
          <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-6 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-855 dark:text-white">Raise Radiology Order</h3>
                <button onClick={() => setShowRadiologyModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 text-xs font-semibold">
                  <span className="text-gray-500">Patient:</span>
                  <span className="font-extrabold text-slate-855 dark:text-white ml-2">{activeRadiologyPatient?.name} ({activeRadiologyPatient?.token})</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div>
                    <span className="text-[8px] font-black uppercase text-gray-500 block mb-1">Body Part Category</span>
                    <select
                      value={radiologyCategory}
                      onChange={(e) => setRadiologyCategory(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl border outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-855 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="Extremities">Extremities (Knee/Foot/Ankle)</option>
                      <option value="Brain">Brain & Skull</option>
                      <option value="Spine">Cervical & Lumbar Spine</option>
                      <option value="Chest">Chest & Thoracic</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[8px] font-black uppercase text-gray-500 block mb-1">Imaging Type</span>
                    <select
                      className={`w-full p-2.5 rounded-xl border outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-855 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option>X-Ray (AP & Lateral View)</option>
                      <option>CT Scan (Non-Contrast)</option>
                      <option>MRI Joint Study</option>
                      <option>Ultrasound Sonography</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Select Studies Requested</span>
                  <div className="space-y-2">
                    {[
                      'Radiology X-Ray Series (AP & Lateral)',
                      'MRI High Resolution Joint Study (Non-Contrast)',
                      'CT Bone Mineral Density (BMD) study',
                      'Ultrasound Joint Soft Tissue Scan'
                    ].map(study => (
                      <label key={study} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-905/30 hover:bg-slate-500/5 rounded-xl border border-slate-800/5 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={selectedRadiologyTests.includes(study)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRadiologyTests(prev => [...prev, study]);
                            } else {
                              setSelectedRadiologyTests(prev => prev.filter(s => s !== study));
                            }
                          }}
                          className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                        />
                        <span>{study}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-extrabold text-red-505 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isRadioUrgent}
                      onChange={(e) => setIsRadioUrgent(e.target.checked)}
                      className="rounded border-red-300 text-red-500 focus:ring-red-500" 
                    />
                    <span>🚨 STAT EMERGENCY IMAGING</span>
                  </label>

                  <textarea
                    rows={2}
                    placeholder="Specific clinical findings or trauma notes..."
                    value={radioNotes}
                    onChange={(e) => setRadioNotes(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none resize-none ${
                      isDarkMode ? 'bg-[#090d16] border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <button
                onClick={handleRadiologyOrderSubmit}
                disabled={selectedRadiologyTests.length === 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 shadow-md cursor-pointer"
              >
                Send Order Requests to Imaging Dept
              </button>
            </motion.div>
          </div>
        )}

        {/* REFER PATIENT ABHA DIALOG */}
        {showReferModal && (
          <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-6 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-855 dark:text-white">Generate ABHA Hospital Referral</h3>
                <button onClick={() => setShowReferModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 text-xs font-semibold">
                  <span className="text-gray-500">Patient:</span>
                  <span className="font-extrabold text-slate-855 dark:text-white ml-2">{activeReferPatient?.name} ({activeReferPatient?.token})</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Target Hospital</label>
                    <select 
                      value={referHospital}
                      onChange={(e) => setReferHospital(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                      }`}
                    >
                      <option value="KEM Hospital, Parel">KEM Hospital, Parel (MCGM)</option>
                      <option value="LTMG Sion Hospital">LTMG Sion Hospital (MCGM)</option>
                      <option value="BYL Nair Ch. Hospital">BYL Nair Ch. Hospital, Mumbai Central</option>
                      <option value="Tata Memorial Hospital">Tata Memorial Hospital (Cancer Care)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Specialty Department</label>
                    <select 
                      value={referDept}
                      onChange={(e) => setReferDept(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                      }`}
                    >
                      <option value="Rheumatology & Immunology">Rheumatology & Immunology</option>
                      <option value="Cardiology & Valvular Clinic">Cardiology & Valvular Clinic</option>
                      <option value="Orthopaedic Spine Clinic">Orthopaedic Spine Clinic</option>
                      <option value="Neurology & Neuro Surgery">Neurology & Neuro Surgery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Clinical Indication / Reason</label>
                    <textarea
                      rows={2}
                      value={referReason}
                      onChange={(e) => setReferReason(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none resize-none focus:ring-1 focus:ring-[#003F8A] ${
                        isDarkMode ? 'bg-[#090d16] border-slate-800 text-white placeholder-slate-650' : 'bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-800'
                      }`}
                      placeholder="Enter referral details..."
                    />
                  </div>
                </div>
              </div>

              {referralSlip ? (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl text-xs font-semibold space-y-2">
                  <div className="flex justify-between font-black text-green-600 dark:text-green-400">
                    <span>Referral Slip Created</span>
                    <span>{referralSlip.code}</span>
                  </div>
                  <p className="text-[10px] text-gray-550">Transferred to: {referralSlip.hospital} • {referralSlip.dept}</p>
                  <p className="text-[10px] text-gray-555 italic">"Reason: {referralSlip.reason}"</p>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-800/10">
                    <span className="text-[8px] text-gray-405">ABHA Sync: Compliant</span>
                    <button 
                      onClick={() => { setShowReferModal(false); setReferralSlip(null); }}
                      className="text-xs text-[#003F8A] font-black hover:underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleReferSubmit}
                  className="w-full bg-[#003F8A] hover:bg-[#002f66] text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Sign & Transmit ABHA Referral Request
                </button>
              )}
            </motion.div>
          </div>
        )}

        {/* MEDICAL CERTIFICATE DIALOG */}
        {showCertModal && (
          <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-6 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-808'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-855 dark:text-white">Issue Digital Medical Certificate</h3>
                <button onClick={() => setShowCertModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 text-xs font-semibold">
                  <span className="text-gray-500">Patient:</span>
                  <span className="font-extrabold text-slate-855 dark:text-white ml-2">{activeCertPatient?.name} ({activeCertPatient?.token})</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Certificate Classification</label>
                    <select 
                      value={certType}
                      onChange={(e) => setCertType(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="Medical Sickness Rest Certificate">Medical Sickness Rest Certificate</option>
                      <option value="Fitness Certificate (Return to Work)">Fitness Certificate (Return to Work)</option>
                      <option value="OPD Disability Verification Clearance">OPD Disability Clearance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Advised Rest/Fitness Duration</label>
                    <select 
                      value={certDurationDays}
                      onChange={(e) => setCertDurationDays(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                        isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="3 Days">3 Days Rest</option>
                      <option value="5 Days">5 Days Rest</option>
                      <option value="7 Days">7 Days Rest</option>
                      <option value="14 Days">14 Days Rest</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1">Provisional Diagnosis</label>
                    <input
                      type="text"
                      value={certDiagnosis}
                      onChange={(e) => setCertDiagnosis(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:ring-1 focus:ring-[#003F8A] ${
                        isDarkMode ? 'bg-[#090d16] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setToast({ id: `t-${Date.now()}`, title: 'Certificate Issued', message: `Medical certificate filed to patient ABHA locker.`, type: 'success' });
                  setShowCertModal(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Digitally Sign & File Certificate to Locker
              </button>
            </motion.div>
          </div>
        )}

        {/* Real-time Toast Notifications */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-[9999] max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex items-start space-x-3 pointer-events-auto"
          >
            <div className={`p-2 rounded-xl ${
              toast.type === 'alert' 
                ? 'bg-red-500/10 text-red-500' 
                : toast.type === 'success' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-blue-500/10 text-blue-500'
            }`}>
              {toast.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : toast.type === 'success' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-black text-slate-855 dark:text-white">{toast.title}</h5>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-450 hover:text-slate-650 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Floating Voice Assistant Widget */}
        <div className="fixed bottom-6 right-6 z-[45] flex flex-col items-end">
          {/* Floating panel (popover) */}
          <AnimatePresence>
            {isAssistantActive && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className={`w-96 rounded-3xl shadow-2xl border p-5 mb-4 flex flex-col space-y-4 max-h-[500px] overflow-hidden ${
                  isDarkMode 
                    ? 'bg-[#0f172a]/95 border-slate-800 text-white backdrop-blur-md' 
                    : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">MCGM Voice AI Assistant</h4>
                      <p className="text-[9px] text-gray-500 font-semibold">Continuous Command Processing</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAssistantActive(false)} 
                    className="text-gray-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Speech Wave / Listening Indicator */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-800/5 flex flex-col items-center justify-center space-y-3">
                  <div className="flex justify-center items-end space-x-1 h-8">
                    {[8, 20, 10, 24, 12, 28, 14, 20, 16, 32, 12, 8].map((h, idx) => (
                      <motion.span
                        key={idx}
                        animate={isAssistantListening ? { height: [6, h, 6] } : { height: 6 }}
                        transition={{ repeat: Infinity, duration: 1.0, delay: idx * 0.05, ease: 'easeInOut' }}
                        className="w-1 bg-[#003F8A] dark:bg-blue-400 rounded-full"
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (!isAssistantListening) {
                        setIsScribing(false);
                      }
                      setIsAssistantListening(!isAssistantListening);
                    }}
                    className={`w-full py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      isAssistantListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-[#003F8A] hover:bg-[#002f66] text-white shadow'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isAssistantListening ? 'Mute Microphone' : 'Enable Voice Command Mic'}</span>
                  </button>
                </div>

                {/* Logs */}
                <div className="flex-1 overflow-y-auto max-h-36 min-h-[80px] space-y-1.5 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-800/5 text-[10px] no-scrollbar">
                  {assistantLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg ${
                        log.type === 'user' 
                          ? 'bg-[#003F8A]/10 text-[#003F8A] dark:text-blue-300 self-end font-semibold'
                          : log.type === 'success'
                          ? 'bg-green-500/10 text-green-600 font-extrabold'
                          : log.type === 'error'
                          ? 'bg-red-500/10 text-red-500 font-semibold'
                          : 'text-gray-500 dark:text-gray-400 font-bold'
                      }`}
                    >
                      {log.text}
                    </div>
                  ))}
                </div>

                {/* Manual Input Form */}
                <div className="flex items-center space-x-2 border-t border-slate-800/10 pt-2">
                  <input
                    type="text"
                    placeholder="Type voice command (e.g. call next)"
                    value={customCommandInput}
                    onChange={(e) => setCustomCommandInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualCommand(customCommandInput)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-[10px] font-semibold outline-none focus:ring-1 focus:ring-[#003F8A] ${
                      isDarkMode ? 'bg-[#090d16] border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <button
                    onClick={() => handleManualCommand(customCommandInput)}
                    className="px-3 py-2 bg-[#003F8A] hover:bg-[#002f66] text-white text-[10px] font-black rounded-lg cursor-pointer"
                  >
                    Send
                  </button>
                </div>

                {/* Quick Preset Action Chips */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black uppercase text-gray-500 tracking-wider">Quick Action Shortcuts</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto no-scrollbar">
                    {[
                      { label: 'Next Patient', cmd: 'call next' },
                      { label: 'Skip Patient', cmd: 'skip patient' },
                      { label: 'Add Paracetamol', cmd: 'add paracetamol' },
                      { label: 'Add Pantoprazole', cmd: 'add pantoprazole' },
                      { label: 'Lab Orders', cmd: 'order labs' },
                      { label: 'Radiology Orders', cmd: 'order radiology' },
                      { label: 'Sign Rx', cmd: 'sign prescription' },
                      { label: 'Clear Rx', cmd: 'clear prescription' },
                      { label: 'Toggle Dark Mode', cmd: 'dark mode' },
                      { label: 'Duty Roster', cmd: 'go to timeline' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleManualCommand(preset.cmd)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[8px] font-extrabold rounded-md text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating trigger button */}
          <button
            onClick={() => setIsAssistantActive(!isAssistantActive)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 duration-200 cursor-pointer ${
              isAssistantActive 
                ? 'bg-orange-500 text-white' 
                : 'bg-[#003F8A] hover:bg-[#002f66] text-white'
            }`}
          >
            {isAssistantListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Mic className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* COMMAND PALETTE */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(tab) => {
            if (setPortal) {
              if (tab === 'ai') {
                setPortal('ai');
              } else if (tab === 'twin') {
                setPortal('command');
              } else if (tab === 'pharmacy') {
                setPortal('pharmacy');
              } else if (tab === 'emergency') {
                setPortal('emergency');
              } else if (tab === 'surgery') {
                setPortal('surgery');
              } else {
                setActiveTab(tab as any);
              }
            } else {
              setActiveTab(tab as any);
            }
          }}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onTriggerAction={(actionCmd) => {
            executeVoiceCommand(actionCmd);
          }}
        />

      </AnimatePresence>

    </div>
  );
}

