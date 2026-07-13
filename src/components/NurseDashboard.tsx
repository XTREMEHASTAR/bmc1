import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Calendar,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Search,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileSignature,
  QrCode,
  Wifi,
  WifiOff,
  CheckCircle2,
  ChevronRight,
  X,
  Check,
  RefreshCw,
  Plus,
  Play,
  Pause,
  ShieldAlert,
  Volume2,
  VolumeX,
  Send,
  Mic,
  Package,
  ClipboardList,
  Flame,
  UserCheck,
  Heart,
  Droplet,
  PlusCircle,
  FileText,
  Car
} from 'lucide-react';
import { Patient, Appointment, HealthRecord, NotificationItem } from '../types';
import { subscribeToRegistrations } from '../services/patients';
import { EmergencyRegistration } from '../types/emergency';

interface NurseDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

// Master Ward Patient dataset including Bed allocations, Vitals History, and medications
interface WardPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bedNo: string;
  roomNo: string;
  diagnosis: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  doctorName: string;
  allergies: string[];
  vitals: { bp: string; pulse: number; temp: number; spo2: number; resp: number; gcs: number; pain: number };
  medications: { name: string; dose: string; route: string; time: string; status: 'Pending' | 'Administered' | 'Delayed' | 'Skipped' }[];
  tasks: { id: string; title: string; due: string; priority: 'High' | 'Medium' | 'Low'; completed: boolean }[];
  notes: string;
  status: 'Occupied' | 'Isolation' | 'Triage';
}

export default function NurseDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout,
  patients,
  setPatients,
  appointments,
  notifications,
  setNotifications
}: NurseDashboardProps) {
  // Emergency OS sync state
  const [emergencyRegistrations, setEmergencyRegistrations] = useState<EmergencyRegistration[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToRegistrations((data) => {
      setEmergencyRegistrations(data);
    });
    return () => unsubscribe();
  }, []);

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ward' | 'patients' | 'vitals' | 'medication' | 'orders' | 'tasks' | 'handover' | 'inventory' | 'messages' | 'settings'>('dashboard');
  const [lang, setLang] = useState<'en' | 'mr' | 'hi'>('en');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Ward Configuration & Toggles
  const [selectedPatientId, setSelectedPatientId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Nurse state info
  const nurseName = "Sister Sneha Shinde";
  const nurseShift = "Morning Shift (07:00 AM - 03:00 PM)";
  const assignedWard = "Orthopedic Male Ward - Unit 4B";

  // Telemetry Heartbeat simulation
  const [ecgLine, setEcgLine] = useState<number[]>(new Array(40).fill(50));
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ecgTimer = setInterval(() => {
      setEcgLine(prev => {
        const next = [...prev.slice(1)];
        const step = Math.random();
        let value = 50;
        if (step > 0.9) value = 82;
        else if (step > 0.8) value = 18;
        else value = 48 + Math.floor(Math.random() * 5);
        next.push(value);
        return next;
      });
    }, 180);
    return () => clearInterval(ecgTimer);
  }, []);

  // Ward Patients local database
  const [wardPatients, setWardPatients] = useState<WardPatient[]>([
    {
      id: '1',
      name: 'Rahul Anil Patil',
      age: 32,
      gender: 'Male',
      bedNo: 'Bed 401',
      roomNo: 'Room 4',
      diagnosis: 'Bilateral Knee Osteoarthritis - Post-Op Day 2',
      priority: 'Routine',
      doctorName: 'Dr. Anil Patil',
      allergies: ['Sulfa Drugs', 'Ibuprofen'],
      vitals: { bp: '128/82', pulse: 80, temp: 98.6, spo2: 98, resp: 18, gcs: 15, pain: 4 },
      medications: [
        { name: 'Tab. Paracetamol 650mg', dose: '1 tab', route: 'Oral', time: '08:00 AM', status: 'Administered' },
        { name: 'Inj. Tramadol 50mg', dose: '1 ampoule', route: 'IV Infusion', time: '12:00 PM', status: 'Pending' },
        { name: 'Tab. Pantoprazole 40mg', dose: '1 tab', route: 'Oral', time: '08:00 AM', status: 'Administered' }
      ],
      tasks: [
        { id: 't1', title: 'Check bilateral knee range of motion exercises', due: '11:00 AM', priority: 'Medium', completed: false },
        { id: 't2', title: 'Knee dressing change and surgical wound check', due: '01:30 PM', priority: 'High', completed: false },
        { id: 't3', title: 'Foley Catheter Care & output measurement', due: '02:00 PM', priority: 'Low', completed: false }
      ],
      notes: 'Recovering well. Complains of mild stiffness. Checked surgical drainage, clean.',
      status: 'Occupied'
    },
    {
      id: '2',
      name: 'Suresh Kumar',
      age: 45,
      gender: 'Male',
      bedNo: 'Bed 402',
      roomNo: 'Room 4',
      diagnosis: 'Lumbar Strain with Severe Muscle Spasm',
      priority: 'Routine',
      doctorName: 'Dr. Anil Patil',
      allergies: ['Penicillin'],
      vitals: { bp: '135/85', pulse: 78, temp: 98.4, spo2: 98, resp: 16, gcs: 15, pain: 6 },
      medications: [
        { name: 'Tab. Aceclofenac 100mg', dose: '1 tab', route: 'Oral', time: '09:00 AM', status: 'Administered' },
        { name: 'Tab. Thiocolchicoside 4mg', dose: '1 tab', route: 'Oral', time: '01:00 PM', status: 'Pending' }
      ],
      tasks: [
        { id: 't4', title: 'Apply hot compress to lumbar region', due: '11:30 AM', priority: 'Low', completed: false },
        { id: 't5', title: 'Physiotherapy mobility assistance', due: '02:30 PM', priority: 'Medium', completed: false }
      ],
      notes: 'Bed rest advised. Restrict physical strain. Assisted to commode.',
      status: 'Occupied'
    },
    {
      id: '3',
      name: 'Ramesh Joshi',
      age: 62,
      gender: 'Male',
      bedNo: 'Bed 403 (ISO)',
      roomNo: 'Room 5',
      diagnosis: 'Left Knee Septic Arthritis - Post-Op Washout',
      priority: 'Urgent',
      doctorName: 'Dr. Sunita Deshmukh',
      allergies: [],
      vitals: { bp: '105/65', pulse: 94, temp: 101.2, spo2: 93, resp: 22, gcs: 14, pain: 8 },
      medications: [
        { name: 'Inj. Piperacillin-Tazobactam 4.5g', dose: '1 vial', route: 'IV Slow Push', time: '10:00 AM', status: 'Administered' },
        { name: 'Inj. Paracetamol 1g IV', dose: '100ml Infusion', route: 'IV Infusion', time: '11:00 AM', status: 'Pending' }
      ],
      tasks: [
        { id: 't6', title: 'Strict vitals logging & fever charting (Q2H)', due: '12:00 PM', priority: 'High', completed: false },
        { id: 't7', title: 'Draw blood cultures if temp spikes > 101 F', due: 'Immediate', priority: 'High', completed: false }
      ],
      notes: 'Spiking high-grade fevers. Placed on active cooling blankets. SpO2 dipping slightly on room air.',
      status: 'Isolation'
    },
    {
      id: '4',
      name: 'Mahesh Jadhav',
      age: 50,
      gender: 'Male',
      bedNo: 'Bed 404',
      roomNo: 'Room 5',
      diagnosis: 'Distal Fibula Fracture - Plaster Cast Applied',
      priority: 'Emergency',
      doctorName: 'Dr. Anil Patil',
      allergies: [],
      vitals: { bp: '142/90', pulse: 84, temp: 99.0, spo2: 96, resp: 19, gcs: 15, pain: 7 },
      medications: [
        { name: 'Tab. Tramadol + Acetaminophen', dose: '1 tab', route: 'Oral', time: '11:30 AM', status: 'Pending' },
        { name: 'Cap. Calcium D3', dose: '1 cap', route: 'Oral', time: '08:00 AM', status: 'Administered' }
      ],
      tasks: [
        { id: 't8', title: 'Check extremity perfusion, capillary refill, and sensation', due: '12:30 PM', priority: 'High', completed: false },
        { id: 't9', title: 'Elevate left leg on pillows', due: 'Immediate', priority: 'Medium', completed: true }
      ],
      notes: 'Cast applied today morning. Perfusion checks: Normal. Pink toes, warm cap refill < 2s.',
      status: 'Occupied'
    }
  ]);

  const activePatient = wardPatients.find(p => p.id === selectedPatientId) || wardPatients[0];

  const admitEmergencyPatient = (reg: EmergencyRegistration, bedNo: string) => {
    const newWardPatient: WardPatient = {
      id: reg.patient?.id || `P-${Date.now()}`,
      name: reg.patient?.name || 'Unknown Patient',
      age: reg.patient?.age || 35,
      gender: reg.patient?.gender || 'Male',
      bedNo: bedNo,
      roomNo: 'Room 6',
      diagnosis: reg.chief_complaint || 'Emergency Intake',
      priority: reg.triage?.category === 'RED' ? 'Emergency' : reg.triage?.category === 'YELLOW' ? 'Urgent' : 'Routine',
      doctorName: 'Dr. Anil Patil',
      allergies: [],
      vitals: {
        bp: reg.latest_vitals?.systolic_bp ? `${reg.latest_vitals.systolic_bp}/${reg.latest_vitals.diastolic_bp}` : '120/80',
        pulse: reg.latest_vitals?.heart_rate || 80,
        temp: reg.latest_vitals?.temperature || 98.6,
        spo2: reg.latest_vitals?.spo2 || 98,
        resp: reg.latest_vitals?.respiratory_rate || 16,
        gcs: reg.triage?.gcs_total || 15,
        pain: 0
      },
      medications: [],
      tasks: [
        { id: `t-intake-${Date.now()}`, title: 'Initial post-admission vitals check', due: 'Immediate', priority: 'High', completed: false }
      ],
      notes: reg.injury_mechanism || 'Admitted from Emergency SOS Intake.',
      status: 'Occupied'
    };

    setWardPatients(prev => [...prev, newWardPatient]);
    setSelectedPatientId(newWardPatient.id);
    addTimelineEvent(newWardPatient.id, 'Emergency Admission Sync', `Transferred from Emergency Triage Room to Orthopedic Ward ${bedNo}.`);
    logFamilyCommunication(newWardPatient.id, `MCGM Hospital Alert: Emergency admission sync completed for ${newWardPatient.name}. Patient has been safely transferred to ${newWardPatient.bedNo} (${assignedWard}).`);
    triggerToast('Patient Admitted', `${newWardPatient.name} assigned to ${bedNo}.`, 'success');
  };

  // Inventory Levels state with daily usage for stockout forecasting
  const [inventory, setInventory] = useState([
    { name: 'Surgical Nitrile Gloves (M)', type: 'Consumable', stock: 12, minStock: 25, unit: 'Boxes', status: 'Low Stock', dailyUsage: 8 },
    { name: 'Sterile IV Infusion Sets', type: 'Consumable', stock: 48, minStock: 30, unit: 'Units', status: 'Good', dailyUsage: 12 },
    { name: 'N95 Respirator Masks', type: 'Consumable', stock: 8, minStock: 15, unit: 'Boxes', status: 'Low Stock', dailyUsage: 4 },
    { name: 'Disposable Syringes 5ml', type: 'Consumable', stock: 110, minStock: 50, unit: 'Units', status: 'Good', dailyUsage: 25 },
    { name: 'Sterile Gauze Roll 10cm', type: 'Consumable', stock: 15, minStock: 20, unit: 'Rolls', status: 'Reorder Pending', dailyUsage: 6 }
  ]);

  // Secure nurse messenger threads
  const [activeChatThread, setActiveChatThread] = useState<'Dr. Patil' | 'Pharmacy' | 'Duty Sister'>('Dr. Patil');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', thread: 'Dr. Patil', sender: 'You', text: 'Dr. Patil, patient Ramesh Joshi (Bed 403) temperature is spiking again at 101.2 F. Should I administer emergency antipyretic?', time: '10:15 AM' },
    { id: '2', thread: 'Dr. Patil', sender: 'Dr. Anil Patil', text: 'Yes, please start Inj. Paracetamol 1g IV immediately and draw repeat blood cultures if it spikes above 102 F.', time: '10:18 AM' },
    { id: '3', thread: 'Pharmacy', sender: 'Pharmacist', text: 'Orthopedic Ward Unit 4B: Your requisition for IV Paracetamol and dressing kits is processed. Please collect from central supply.', time: '09:45 AM' }
  ]);

  // Vitals entry fields
  const [vitalInputs, setVitalInputs] = useState({
    bp: '',
    pulse: '',
    temp: '',
    spo2: '',
    resp: '',
    gcs: '15',
    pain: '0',
    bloodSugar: ''
  });

  // Enterprise Nurse OS States
  const [nurses, setNurses] = useState([
    { id: 'n1', name: 'Sister Sneha Shinde', shift: 'Morning Shift (07:00 - 15:00)', beds: ['Bed 401', 'Bed 402'], icuCertified: true, workloadScore: 65, status: 'Active' },
    { id: 'n2', name: 'Sister Varsha Kadam', shift: 'Morning Shift (07:00 - 15:00)', beds: ['Bed 403 (ISO)', 'Bed 404'], icuCertified: false, workloadScore: 85, status: 'Active' },
    { id: 'n3', name: 'Sister Pranali Sawant', shift: 'Afternoon Shift (15:00 - 23:00)', beds: [], icuCertified: true, workloadScore: 0, status: 'On Break' }
  ]);
  const [isAcuityRebalanced, setIsAcuityRebalanced] = useState(false);

  const [activeCodes, setActiveCodes] = useState([
    { id: 'c1', codeType: 'Sepsis Alert', location: 'Bed 403 (ISO)', time: '11:15 AM', status: 'Attended by Dr. Sunita Deshmukh' }
  ]);

  const [escalations, setEscalations] = useState([
    { id: 'e1', patientId: '3', itemType: 'Medication', itemName: 'Inj. Paracetamol 1g IV', status: 'Escalated to Charge Nurse', timestamp: '11:45 AM', level: 'Charge Nurse' }
  ]);

  const [patientTimelines, setPatientTimelines] = useState<Record<string, { time: string; dept: string; action: string; remark: string }[]>>({
    '1': [
      { time: '07:30 AM', dept: 'Orthopedic Ward', action: 'Admission Registration Sync', remark: 'Synced from Emergency OS. UHID-40291-MCGM assigned.' },
      { time: '08:00 AM', dept: 'Orthopedic Ward', action: 'Medication Administered', remark: 'Tab. Paracetamol 650mg & Tab. Pantoprazole 40mg given by Sister Sneha.' },
      { time: '08:30 AM', dept: 'Orthopedic Ward', action: 'Vitals Logged', remark: 'BP: 128/82, HR: 80, SpO2: 98%.' }
    ],
    '2': [
      { time: '07:30 AM', dept: 'Orthopedic Ward', action: 'Admission Registration Sync', remark: 'Admission details populated from central EMR.' },
      { time: '09:00 AM', dept: 'Orthopedic Ward', action: 'Medication Administered', remark: 'Tab. Aceclofenac 100mg given.' }
    ],
    '3': [
      { time: '09:00 AM', dept: 'Triage Room 5', action: 'Emergency SOS Admission', remark: 'Patient admitted directly under isolation protocol.' },
      { time: '10:00 AM', dept: 'Triage Room 5', action: 'Medication Administered', remark: 'Inj. Piperacillin-Tazobactam 4.5g administered.' }
    ],
    '4': [
      { time: '08:00 AM', dept: 'Orthopedic Ward', action: 'Medication Administered', remark: 'Cap. Calcium D3 administered by Sister Varsha.' }
    ]
  });

  const [familyLogs, setFamilyLogs] = useState([
    { id: 'f1', patientId: '3', phone: '+91 98765 43210', message: 'MCGM Hospital: Ramesh Joshi (Bed 403) vitals logged: Temp 101.2F, SpO2 93%. Attending Dr. Sunita Deshmukh.', status: 'Sent' as const, time: '11:16 AM' }
  ]);

  const [voiceConfirmation, setVoiceConfirmation] = useState<{ command: string; confidence: number; action: () => void } | null>(null);

  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<{ id: string; actionType: string; data: any; timestamp: number }[]>([]);

  const [securityAudits, setSecurityAudits] = useState([
    { id: 'sa1', user: 'Sister Sneha Shinde', eventType: 'Biometric Authentication', ip: '10.21.4.15', status: 'Success', timestamp: '07:02 AM' },
    { id: 'sa2', user: 'Sister Sneha Shinde', eventType: 'ABHA Record Sync Access', ip: '10.21.4.15', status: 'Success', timestamp: '08:00 AM' }
  ]);
  const [abhaConsentLogs, setAbhaConsentLogs] = useState([
    { id: 'acl1', patientName: 'Rahul Anil Patil', actionType: 'Consent Handshake', gateway: 'ABHA-GW-02', status: 'Approved', timestamp: '08:00 AM' },
    { id: 'acl2', patientName: 'Ramesh Joshi', actionType: 'Emergency Profile Pull', gateway: 'ABHA-GW-01', status: 'Bypassed', timestamp: '09:02 AM' },
    { id: 'acl3', patientName: 'Suresh Kumar', actionType: 'EHR Data Push Sync', gateway: 'ABHA-GW-02', status: 'Success', timestamp: '09:15 AM' },
    { id: 'acl4', patientName: 'Mahesh Jadhav', actionType: 'Revoke Consent Request', gateway: 'ABHA-GW-04', status: 'Revoked', timestamp: '10:30 AM' }
  ]);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Helper functions
  const addTimelineEvent = (patientId: string, action: string, remark: string) => {
    const newEvent = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dept: 'Orthopedic Ward',
      action,
      remark
    };
    setPatientTimelines(prev => ({
      ...prev,
      [patientId]: [newEvent, ...(prev[patientId] || [])]
    }));
  };

  const logFamilyCommunication = (patientId: string, message: string) => {
    const newLog = {
      id: 'f_' + Date.now(),
      patientId,
      phone: '+91 98765 43210',
      message,
      status: 'Sent' as const,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setFamilyLogs(prev => [newLog, ...prev]);
  };

  const logSecurityAudit = (eventType: string, status: string) => {
    const newAudit = {
      id: 'sa_' + Date.now(),
      user: 'Sister Sneha Shinde',
      eventType,
      ip: '10.21.4.15',
      status,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setSecurityAudits(prev => [newAudit, ...prev]);
  };

  const triggerAutoRebalance = () => {
    // Rebalance based on patient acuity
    // Certified ICU nurse gets isolated/emergency patients
    // Rebalance Sister Sneha and Sister Varsha
    const updatedNurses = [
      { id: 'n1', name: 'Sister Sneha Shinde', shift: 'Morning Shift (07:00 - 15:00)', beds: ['Bed 401', 'Bed 403 (ISO)'], icuCertified: true, workloadScore: 70, status: 'Active' },
      { id: 'n2', name: 'Sister Varsha Kadam', shift: 'Morning Shift (07:00 - 15:00)', beds: ['Bed 402', 'Bed 404'], icuCertified: false, workloadScore: 60, status: 'Active' },
      { id: 'n3', name: 'Sister Pranali Sawant', shift: 'Afternoon Shift (15:00 - 23:00)', beds: [], icuCertified: true, workloadScore: 0, status: 'On Break' }
    ];
    setNurses(updatedNurses);
    setIsAcuityRebalanced(true);
    triggerToast('Workload Balanced', 'Redistributed beds based on patient EWS and isolation constraints.', 'success');
    logSecurityAudit('Smart Nurse Workload Rebalance', 'Success');
  };

  const toggleOfflineMode = () => {
    if (isOffline) {
      // Reconnecting, process queue
      setIsOffline(false);
      triggerToast('Online Mode', 'Synchronizing queued records to central ABHA registry...', 'success');
      logSecurityAudit('Central ABHA Database Reconnect', 'Success');
      if (offlineQueue.length > 0) {
        offlineQueue.forEach(item => {
          if (item.actionType === 'LOG_VITALS') {
            addTimelineEvent(item.data.patientId, 'Vitals Synced (Offline)', `Synced BP: ${item.data.bp}, HR: ${item.data.pulse}.`);
          } else if (item.actionType === 'GIVE_MED') {
            addTimelineEvent(item.data.patientId, 'Medication Synced (Offline)', `${item.data.medName} sync verified.`);
          }
        });
        setOfflineQueue([]);
        triggerToast('Sync Complete', 'Processed all queued offline actions successfully.', 'success');
      }
    } else {
      setIsOffline(true);
      triggerToast('Offline Mode Active', 'Nurse OS operating in localized local-first mode. Direct DB sync suspended.', 'alert');
      logSecurityAudit('Offline Mode Initiated', 'Success');
    }
  };


  // Global Voice Command Event listeners for Siri-like Arogya Voice OS
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };

    const handlePatientChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSelectedPatientId(customEvent.detail);
      }
    };

    const handleVitalsSubmit = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { bp, pulse, temp, spo2, resp } = customEvent.detail;
        setVitalInputs(prev => ({
          ...prev,
          bp: bp || prev.bp || '120/80',
          pulse: pulse || prev.pulse || '75',
          temp: temp || prev.temp || '98.4',
          spo2: spo2 || prev.spo2 || '98',
          resp: resp || prev.resp || '16'
        }));
      }
    };

    const handleSaveVitalsDirectly = () => {
      if (!vitalInputs.bp || !vitalInputs.pulse || !vitalInputs.temp) {
        triggerToast('Incomplete Vitals', 'Please input BP, Pulse, and Temp via voice first.', 'alert');
        return;
      }
      const newVitalsObj = {
        bp: vitalInputs.bp,
        pulse: parseInt(vitalInputs.pulse) || 75,
        temp: parseFloat(vitalInputs.temp) || 98.4,
        spo2: parseInt(vitalInputs.spo2) || 98,
        resp: parseInt(vitalInputs.resp) || 16,
        gcs: parseInt(vitalInputs.gcs) || 15,
        pain: parseInt(vitalInputs.pain) || 0
      };

      // Simulate a low-confidence voice confirmation step if confidence is simulated low
      const isLowConfidenceSimulated = Math.random() > 0.85; 
      if (isLowConfidenceSimulated) {
        setVoiceConfirmation({
          command: `Record BP: ${newVitalsObj.bp}, Pulse: ${newVitalsObj.pulse}, Temp: ${newVitalsObj.temp}F`,
          confidence: 72,
          action: () => {
            executeSaveVitals(newVitalsObj);
            setVoiceConfirmation(null);
          }
        });
        triggerToast('Voice Review Required', 'Voice command confidence is 72%. Please confirm action.', 'info');
        return;
      }

      executeSaveVitals(newVitalsObj);
    };

    const executeSaveVitals = (vitalsObj: any) => {
      if (isOffline) {
        setOfflineQueue(prev => [...prev, {
          id: 'off_' + Date.now(),
          actionType: 'LOG_VITALS',
          data: { patientId: activePatient.id, bp: vitalsObj.bp, pulse: vitalsObj.pulse },
          timestamp: Date.now()
        }]);
        triggerToast('Offline Saved', `Voice vitals saved locally. Central sync pending.`, 'info');
        setVitalInputs({ bp: '', pulse: '', temp: '', spo2: '', resp: '', gcs: '15', pain: '0', bloodSugar: '' });
        return;
      }

      setWardPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return { ...p, vitals: vitalsObj };
        }
        return p;
      }));
      addTimelineEvent(activePatient.id, 'Vitals Logged (Voice)', `BP: ${vitalsObj.bp}, Pulse: ${vitalsObj.pulse}, Temp: ${vitalsObj.temp}F.`);
      logFamilyCommunication(activePatient.id, `MCGM Hospital: ${activePatient.name} vitals logged via voice: BP ${vitalsObj.bp}, HR ${vitalsObj.pulse}, SpO2 ${vitalsObj.spo2}%.`);
      logSecurityAudit(`Voice Vitals Charted: Bed #${activePatient.bedNo}`, 'Success');
      triggerToast('Vitals Saved', `Logged vitals successfully for Bed #${activePatient.bedNo}.`, 'success');
      setVitalInputs({ bp: '', pulse: '', temp: '', spo2: '', resp: '', gcs: '15', pain: '0', bloodSugar: '' });
    };

    const handleVerifyMed = () => {
      const pendingMed = activePatient.medications.find(m => m.status === 'Pending');
      if (pendingMed) {
        setActiveScanMed(pendingMed);
        setScanState('scanning');
        setShowScanModal(true);

        setTimeout(() => {
          const allergyMatch = activePatient.allergies.some(al => 
            pendingMed.name.toLowerCase().includes(al.toLowerCase()) || 
            (al.toLowerCase() === 'sulfa drugs' && pendingMed.name.toLowerCase().includes('sulfa'))
          );

          const interactionMatch = pendingMed.name.toLowerCase().includes('tramadol') &&
            activePatient.medications.some(m => m.name.toLowerCase().includes('paracetamol') || m.name.toLowerCase().includes('aceclofenac'));

          if (allergyMatch) {
            setScanState('allergy_alert');
          } else if (interactionMatch) {
            setScanState('interaction_alert');
          } else {
            setScanState('verified');
            // Auto administration log
            setTimeout(() => {
              if (isOffline) {
                setOfflineQueue(prev => [...prev, {
                  id: 'off_' + Date.now(),
                  actionType: 'GIVE_MED',
                  data: { patientId: activePatient.id, medName: pendingMed.name },
                  timestamp: Date.now()
                }]);
                triggerToast('Offline Saved', 'Medication administration logged locally. Central sync pending.', 'info');
                setShowScanModal(false);
                setScanState('idle');
                return;
              }

              setWardPatients(prev => prev.map(p => {
                if (p.id === activePatient.id) {
                  return {
                    ...p,
                    medications: p.medications.map(m => {
                      if (m.name === pendingMed.name) return { ...m, status: 'Administered' };
                      return m;
                    })
                  };
                }
                return p;
              }));
              addTimelineEvent(activePatient.id, 'Medication Given (Voice)', `${pendingMed.name} administered & verified.`);
              logFamilyCommunication(activePatient.id, `MCGM Hospital: Medication ${pendingMed.name} administered to ${activePatient.name}.`);
              triggerToast('Medication Administered', `${pendingMed.name} administered to ${activePatient.name}.`, 'success');
              setShowScanModal(false);
              setScanState('idle');
            }, 1000);
          }
        }, 1500);
      } else {
        triggerToast('No Pending Meds', 'All medications already administered.', 'info');
      }
    };

    const handleShiftICU = () => {
      if (isOffline) {
        triggerToast('Central Connection Required', 'ICU transfer requests require active ABHA central connectivity.', 'alert');
        return;
      }
      setWardPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            priority: 'Urgent',
            notes: p.notes + ' [TRANSFER: Shifted to ICU requested by voice OS]'
          };
        }
        return p;
      }));
      addTimelineEvent(activePatient.id, 'ICU Transfer Request', 'Transfer request initiated via Voice OS to Central Registry.');
      logFamilyCommunication(activePatient.id, `MCGM Hospital: Critical alert: ICU transfer request initiated for ${activePatient.name}.`);
      triggerToast('ICU Transfer Sent', `Transfer request sent for ${activePatient.name}.`, 'success');
    };

    const handleSelectPatientVoice = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const query = customEvent.detail.toLowerCase();
        const match = wardPatients.find(p => 
          p.bedNo.toLowerCase().includes(query) || 
          p.name.toLowerCase().includes(query)
        );
        if (match) {
          setSelectedPatientId(match.id);
          triggerToast('Patient Selected', `Selected ${match.name} (Bed ${match.bedNo}).`, 'success');
        } else {
          triggerToast('Not Found', `Could not find patient matching "${query}".`, 'alert');
        }
      }
    };

    window.addEventListener('mcgm-nurse-tab-change', handleTabChange);
    window.addEventListener('mcgm-nurse-patient-change', handlePatientChange);
    window.addEventListener('mcgm-nurse-submit-vitals', handleVitalsSubmit);
    window.addEventListener('mcgm-nurse-save-vitals', handleSaveVitalsDirectly);
    window.addEventListener('mcgm-nurse-verify-med', handleVerifyMed);
    window.addEventListener('mcgm-nurse-shift-icu', handleShiftICU);
    window.addEventListener('mcgm-nurse-select-patient-voice', handleSelectPatientVoice);

    return () => {
      window.removeEventListener('mcgm-nurse-tab-change', handleTabChange);
      window.removeEventListener('mcgm-nurse-patient-change', handlePatientChange);
      window.removeEventListener('mcgm-nurse-submit-vitals', handleVitalsSubmit);
      window.removeEventListener('mcgm-nurse-save-vitals', handleSaveVitalsDirectly);
      window.removeEventListener('mcgm-nurse-verify-med', handleVerifyMed);
      window.removeEventListener('mcgm-nurse-shift-icu', handleShiftICU);
      window.removeEventListener('mcgm-nurse-select-patient-voice', handleSelectPatientVoice);
    };
  }, [activePatient, vitalInputs, wardPatients, isOffline]);

  // Calculate EWS (Early Warning Score) dynamically
  const calculateEWS = (vitals: any) => {
    let score = 0;
    const pulse = parseInt(vitals.pulse) || 80;
    const temp = parseFloat(vitals.temp) || 98.6;
    const spo2 = parseInt(vitals.spo2) || 98;
    const resp = parseInt(vitals.resp) || 16;
    
    // Pulse
    if (pulse < 40 || pulse > 130) score += 3;
    else if (pulse < 50 || (pulse > 110 && pulse <= 130)) score += 2;
    else if ((pulse >= 50 && pulse < 60) || (pulse > 100 && pulse <= 110)) score += 1;

    // Temp
    if (temp < 95.0 || temp > 102.2) score += 3;
    else if ((temp >= 95.0 && temp < 96.8) || (temp > 100.4 && temp <= 102.2)) score += 1;

    // SpO2
    if (spo2 < 91) score += 3;
    else if (spo2 >= 92 && spo2 <= 93) score += 2;
    else if (spo2 >= 94 && spo2 <= 95) score += 1;

    // Resp
    if (resp < 8 || resp > 25) score += 3;
    else if (resp >= 21 && resp <= 25) score += 2;
    else if ((resp >= 9 && resp <= 11) || (resp >= 18 && resp <= 20)) score += 1;

    return score;
  };

  // Barcode / Medication Scan verification simulation
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verified' | 'allergy_alert' | 'interaction_alert' | 'success'>('idle');
  const [activeScanMed, setActiveScanMed] = useState<any>(null);
  const [medChecks, setMedChecks] = useState({
    patient: false,
    drug: false,
    dose: false,
    route: false,
    time: false,
    allergies: false
  });

  // Voice Handover recording
  const [isRecordingHandover, setIsRecordingHandover] = useState(false);
  const [recordedHandoverText, setRecordedHandoverText] = useState('');
  const [handoverLogs, setHandoverLogs] = useState<{ id: string; date: string; summary: string; voiceDuration: string }[]>([
    { id: 'h1', date: '08 Jul 2026', summary: 'Orthopedic Ward Unit 4B - Night shift handover completed. 10 active beds. Ramesh Joshi post-op washout monitored closely.', voiceDuration: '2 mins 15s' }
  ]);

  // Digital Signature
  const [signaturePaths, setSignaturePaths] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  const startDrawing = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setSignaturePaths([`M ${x} ${y}`]);
    }
  };

  const draw = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setSignaturePaths(prev => [...prev, `L ${x} ${y}`]);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    setSignaturePaths([]);
  };

  // Toast Notification handler
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const triggerToast = (title: string, desc: string, type: 'success' | 'alert' | 'info') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Simulated Vitals Submission
  const submitVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitalInputs.bp || !vitalInputs.pulse || !vitalInputs.temp) {
      triggerToast('Incomplete Vitals', 'Please input mandatory vitals metrics.', 'alert');
      return;
    }

    const newVitalsObj = {
      bp: vitalInputs.bp,
      pulse: parseInt(vitalInputs.pulse),
      temp: parseFloat(vitalInputs.temp),
      spo2: parseInt(vitalInputs.spo2) || 98,
      resp: parseInt(vitalInputs.resp) || 16,
      gcs: parseInt(vitalInputs.gcs) || 15,
      pain: parseInt(vitalInputs.pain) || 0
    };

    if (isOffline) {
      setOfflineQueue(prev => [...prev, {
        id: 'off_' + Date.now(),
        actionType: 'LOG_VITALS',
        data: { patientId: activePatient.id, bp: vitalInputs.bp, pulse: vitalInputs.pulse },
        timestamp: Date.now()
      }]);
      triggerToast('Offline Saved', 'Vitals saved locally. Central sync pending.', 'info');
      setVitalInputs({ bp: '', pulse: '', temp: '', spo2: '', resp: '', gcs: '15', pain: '0', bloodSugar: '' });
      return;
    }

    setWardPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        return {
          ...p,
          vitals: newVitalsObj
        };
      }
      return p;
    }));

    addTimelineEvent(activePatient.id, 'Vitals Charted', `Recorded BP: ${newVitalsObj.bp}, Pulse: ${newVitalsObj.pulse}, Temp: ${newVitalsObj.temp}F.`);
    logFamilyCommunication(activePatient.id, `MCGM Hospital Alert: ${activePatient.name}'s vitals have been updated: BP ${newVitalsObj.bp}, Heart Rate ${newVitalsObj.pulse} bpm, SpO2 ${newVitalsObj.spo2}%.`);
    logSecurityAudit(`Vitals Charted: Bed #${activePatient.bedNo}`, 'Success');
    triggerToast('Vitals Saved', `Logged vitals successfully for Bed #${activePatient.bedNo}.`, 'success');
    setVitalInputs({ bp: '', pulse: '', temp: '', spo2: '', resp: '', gcs: '15', pain: '0', bloodSugar: '' });
  };

  // Barcode Scan Verification trigger with 6 safety checks
  const handleMedScanVerification = (med: any) => {
    setActiveScanMed(med);
    setScanState('scanning');
    setShowScanModal(true);
    setMedChecks({
      patient: false,
      drug: false,
      dose: false,
      route: false,
      time: false,
      allergies: false
    });

    setTimeout(() => {
      // Simulate checking patient allergies
      const allergyMatch = activePatient.allergies.some(al => 
        med.name.toLowerCase().includes(al.toLowerCase()) || 
        (al.toLowerCase() === 'sulfa drugs' && med.name.toLowerCase().includes('sulfa'))
      );

      const interactionMatch = med.name.toLowerCase().includes('tramadol') &&
        activePatient.medications.some(m => m.name.toLowerCase().includes('paracetamol') || m.name.toLowerCase().includes('aceclofenac'));

      if (allergyMatch) {
        setScanState('allergy_alert');
        addTimelineEvent(activePatient.id, 'Allergy Alert Triggered', `Scanned ${med.name} which contains active allergens.`);
        logSecurityAudit(`Medication Allergy Alert: ${med.name}`, 'Blocked');
      } else if (interactionMatch) {
        setScanState('interaction_alert');
        addTimelineEvent(activePatient.id, 'Drug Interaction Alert Triggered', `Scanned ${med.name} which has therapeutic duplication / interaction.`);
        logSecurityAudit(`Medication Interaction Alert: ${med.name}`, 'Blocked');
      } else {
        setScanState('verified');
      }
    }, 2000);
  };

  const confirmMedAdministration = () => {
    if (isOffline) {
      setOfflineQueue(prev => [...prev, {
        id: 'off_' + Date.now(),
        actionType: 'GIVE_MED',
        data: { patientId: activePatient.id, medName: activeScanMed.name },
        timestamp: Date.now()
      }]);
      triggerToast('Offline Saved', 'Medication logged locally. Central sync pending.', 'info');
      setShowScanModal(false);
      setScanState('idle');
      return;
    }

    setWardPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        return {
          ...p,
          medications: p.medications.map(m => {
            if (m.name === activeScanMed.name) {
              return { ...m, status: 'Administered' };
            }
            return m;
          })
        };
      }
      return p;
    }));

    addTimelineEvent(activePatient.id, 'Medication Given', `${activeScanMed.name} administered. Verified against ABHA prescription.`);
    logFamilyCommunication(activePatient.id, `MCGM Hospital Alert: Prescribed medication ${activeScanMed.name} has been administered to ${activePatient.name} successfully.`);
    logSecurityAudit(`Administered Medication: ${activeScanMed.name}`, 'Success');

    // Trigger Notification Sync to ABHA
    const newNotif: NotificationItem = {
      id: 'notif_med_' + Date.now(),
      type: 'appointment',
      title: 'Medication Administered & Synced',
      desc: `${activeScanMed.name} administered to ${activePatient.name}. Synced to ABHA locker.`,
      timeAgo: 'Just now',
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);

    triggerToast('Medication Administered', 'Dose logged & securely verified.', 'success');
    setShowScanModal(false);
    setScanState('idle');
  };

  // Voice Notes recording
  const toggleHandoverVoiceRecorder = () => {
    if (!isRecordingHandover) {
      setIsRecordingHandover(true);
      triggerToast('Microphone Active', 'Recording verbal handover summary...', 'info');
      // Mock Speech Scribing
      setTimeout(() => {
        setRecordedHandoverText("Ward Sister handover shift report. Total active count 4. Bed 403 Ramesh Joshi septicaemia post-op washout monitored closely. Last recorded vitals: temp 101.2, SpO2 93%, started IV Paracetamol. Bed 401 Rahul Patil stable recovery on post-op day 2. All morning medications administered and verified against ABHA profiles.");
      }, 5000);
    } else {
      setIsRecordingHandover(false);
      triggerToast('Recording Stopped', 'Verbal audio summarized by AI.', 'success');
    }
  };

  const submitHandoverReport = () => {
    if (!recordedHandoverText && signaturePaths.length === 0) {
      triggerToast('Verification Needed', 'Please provide a voice summary or sign off before handover completion.', 'alert');
      return;
    }

    const newHandoverLog = {
      id: 'h_' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      summary: recordedHandoverText || "Manual handover signed off by ward supervisor.",
      voiceDuration: '0:35'
    };

    setHandoverLogs([newHandoverLog, ...handoverLogs]);
    logSecurityAudit('Shift Handover Completed', 'Success');
    triggerToast('Handover Successful', 'Shift handover report saved and sent to Ward Sister.', 'success');
    setRecordedHandoverText('');
    setSignaturePaths([]);
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${isDarkMode ? 'bg-[#090d16] text-slate-200' : 'bg-[#F8FAFD] text-slate-850'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-72 flex flex-col justify-between border-r ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} p-4`}>
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-[#E8EDF5] dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-[#0A5BFF] flex items-center justify-center text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase">MCGM Care</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Nurse OS Workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ward Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('ward')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ward'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Ward Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Patient Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('vitals')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Vitals Module</span>
            </button>

            <button
              onClick={() => setActiveTab('medication')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'medication'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Medication Verification</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Doctor Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Task Management</span>
            </button>

            <button
              onClick={() => setActiveTab('handover')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'handover'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <FileSignature className="w-4 h-4" />
              <span>Shift Handover</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Ward Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Secure Messaging</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0A5BFF] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="space-y-4 pt-4 border-t border-[#E8EDF5] dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#0A5BFF]/30">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Nurse Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{nurseName}</h4>
              <p className="text-[10px] text-gray-400">{assignedWard}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-650/10 hover:bg-[#ba1a1a] text-[#ba1a1a] hover:text-white transition-all text-xs font-bold cursor-pointer border border-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'bg-[#0b0f1a] border-slate-800' : 'bg-white border-[#E8EDF5]'}`}>
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-black tracking-tight">{assignedWard}</h1>
              <p className="text-xs text-gray-400 font-semibold">{nurseShift}</p>
            </div>
            {isOffline ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 text-[10px] font-bold animate-pulse">
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span>LOCAL-FIRST OFFLINE MODE ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span>SECURE ABHA GATEWAY SYNCED</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Language Toggle */}
            <div className={`flex ${isDarkMode ? 'bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-0.5' : 'bg-slate-100 border border-[#E8EDF5] rounded-xl overflow-hidden p-0.5'}`}>
              {(['en', 'mr', 'hi'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    lang === l ? 'bg-[#0A5BFF] text-white shadow-sm' : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-850')
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-gray-300 hover:text-white' : 'bg-white border-[#E8EDF5] text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Clock display */}
            <div className={`text-right text-xs font-mono font-bold px-3 py-1.5 rounded-xl hidden sm:block border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-[#E8EDF5] text-slate-700'}`}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </header>

        {/* Inner Tab Controller */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-full pb-6">
              
              {/* Left / Middle Pane: Main Ward Status (3 cols on xl) */}
              <div className="xl:col-span-3 space-y-6">
                
                {/* Quick statistics row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  }`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assigned Beds</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-black text-emerald-500">4</span>
                      <span className="text-xs text-gray-400">/ 10 Occupied</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  }`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Meds</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-black text-orange-500">3</span>
                      <span className="text-xs text-gray-400">Doses Due Now</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  }`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Critical Alerts</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-black text-red-500">1</span>
                      <span className="text-xs text-gray-400">Active Warning</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  }`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tasks Pending</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl font-black text-blue-500">5</span>
                      <span className="text-xs text-gray-400">In Shift Checklist</span>
                    </div>
                  </div>
                </div>

                {/* Critical Alert Center */}
                <div className={`p-5 rounded-3xl border transition-all ${
                  isDarkMode ? 'bg-[#1e141d]/90 border-red-500/20' : 'bg-red-50/35 border-red-200 shadow-sm'
                } space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2.5">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                      </span>
                      <div>
                        <h3 className="font-extrabold text-sm text-red-600 dark:text-red-400 uppercase tracking-wider">Critical Alert Center (Emergency Codes & Lab Exceptions)</h3>
                        <p className="text-[10px] text-gray-400 font-semibold">Immediate medical intervention dashboard</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          triggerToast('CODE BLUE ACTIVATED', 'Code Blue Team dispatched to Ward 4B.', 'alert');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        🚨 Code Blue
                      </button>
                      <button 
                        onClick={() => {
                          triggerToast('CODE SEPSIS ACTIVATED', 'Sepsis protocol initiated.', 'alert');
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        ⚠️ Code Sepsis
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lab exception 1 */}
                    <div className={`p-3.5 rounded-2xl border text-xs flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-[#E8EDF5] text-slate-850 shadow-sm'}`}>
                      <div className="space-y-1">
                        <span className="text-[9px] bg-red-650/10 text-red-500 font-black px-1.5 py-0.5 rounded">CRITICAL LAB</span>
                        <h4 className="font-bold text-xs">Bed 403 - Ramesh Joshi</h4>
                        <p className="text-[10px] text-gray-400">Serum Potassium: <span className="text-red-500 font-bold">2.8 mEq/L</span> (Severe Hypokalemia)</p>
                      </div>
                      <button 
                        onClick={() => triggerToast('Alert Acknowledged', 'Attending physician notified of critical potassium level.', 'success')}
                        className="text-[9px] font-bold text-[#0A5BFF] bg-blue-500/10 px-2.5 py-1.5 rounded-xl hover:bg-blue-500/20 cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    </div>

                    {/* Lab exception 2 */}
                    <div className={`p-3.5 rounded-2xl border text-xs flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-[#E8EDF5] text-slate-850 shadow-sm'}`}>
                      <div className="space-y-1">
                        <span className="text-[9px] bg-red-650/10 text-red-500 font-black px-1.5 py-0.5 rounded">CRITICAL LAB</span>
                        <h4 className="font-bold text-xs">Bed 401 - Rahul Patil</h4>
                        <p className="text-[10px] text-gray-400">Troponin I: <span className="text-red-500 font-bold">0.45 ng/mL</span> (Elevated / Possible MI)</p>
                      </div>
                      <button 
                        onClick={() => triggerToast('Alert Acknowledged', 'Cardiology consulting physician alerted.', 'success')}
                        className="text-[9px] font-bold text-[#0A5BFF] bg-blue-500/10 px-2.5 py-1.5 rounded-xl hover:bg-blue-500/20 cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>

                {/* Emergency SOS & Intake Queue Panel */}
                {emergencyRegistrations.length > 0 && (
                  <div className={`p-5 rounded-3xl border transition-all ${
                    isDarkMode ? 'bg-[#0f1524]/90 border-red-500/20' : 'bg-red-50/50 border-red-200 shadow-sm'
                  } space-y-4`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2.5">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <div>
                          <h3 className="font-extrabold text-sm text-red-500">Emergency OS Live Sync: Active SOS & Arrivals</h3>
                          <p className="text-[10px] text-gray-400 font-semibold">Incoming/Arrived trauma patient intake queue</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-red-500/10 text-red-500 font-black px-2.5 py-1 rounded-full border border-red-500/20 tracking-wider">
                        {emergencyRegistrations.filter(r => r.status === 'EN_ROUTE' || r.status === 'ARRIVED').length} PENDING INTAKE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {emergencyRegistrations.map(reg => {
                        return (
                          <div
                            key={reg.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                              reg.assigned_ward === assignedWard
                                ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/50 hover:border-blue-400' : 'bg-blue-50/20 border-blue-200 hover:border-blue-300 shadow-md')
                                : (isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-red-500/30' : 'bg-white border-[#E8EDF5] hover:border-red-300 shadow-sm')
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-black truncate">{reg.patient?.name || 'Unknown Patient'}</h4>
                                <p className="text-[9px] text-gray-400">
                                  {reg.patient?.age} Y / {reg.patient?.gender} • Phone: {reg.patient?.phone || 'N/A'}
                                </p>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                reg.triage?.category === 'RED'
                                  ? 'bg-red-500/15 text-red-500 border border-red-500/20'
                                  : reg.triage?.category === 'YELLOW'
                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                                  : reg.triage?.category === 'GREEN'
                                  ? 'bg-emerald-500/15 text-[#0A5BFF] border border-emerald-500/20'
                                  : 'bg-slate-500/15 text-gray-400 border border-slate-500/20'
                              }`}>
                                {reg.triage?.category || 'PENDING'}
                              </span>
                            </div>

                            <div className="text-[10px] text-gray-400 line-clamp-2">
                              <span className="font-bold text-gray-300">Complaint: </span>
                              {reg.chief_complaint || reg.injury_mechanism || 'No detail provided.'}
                            </div>

                            {reg.assigned_ward && (
                              <div className={`p-2 rounded-xl text-[10px] flex flex-col space-y-1 ${
                                reg.assigned_ward === assignedWard
                                  ? (isDarkMode ? 'bg-[#0A5BFF]/20 text-blue-200 border border-[#0A5BFF]/30' : 'bg-blue-50 text-[#0A5BFF] border border-blue-100')
                                  : (isDarkMode ? 'bg-slate-800/40 text-gray-400 border border-slate-700/30' : 'bg-gray-50 text-gray-500 border border-gray-100')
                              }`}>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold flex items-center space-x-1">
                                    <span>📍</span>
                                    <span>{reg.assigned_ward === assignedWard ? 'Routed to Your Ward' : 'Routed to Ward'}</span>
                                  </span>
                                  <span className={`text-[8px] font-extrabold px-1.5 py-0.25 rounded ${
                                    reg.assigned_ward === assignedWard
                                      ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-[#0A5BFF] text-white')
                                      : (isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700')
                                  }`}>
                                    {reg.assigned_department}
                                  </span>
                                </div>
                                <span className="font-semibold text-[9px] truncate">{reg.assigned_ward}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] border-t border-slate-800/40 pt-2">
                              <span className="text-gray-400 flex items-center space-x-1">
                                <span className="font-bold text-gray-300">Via: </span>
                                <span>{reg.arrival_mode}</span>
                              </span>
                              <span className="text-red-400 font-bold">
                                {reg.status === 'EN_ROUTE' ? 'En-route' : 'Arrived'}
                              </span>
                            </div>

                            {/* Allocation actions */}
                            <div className="flex space-x-2 pt-1">
                              {!wardPatients.some(wp => wp.id === reg.patient?.id) ? (
                                <>
                                  <button
                                    onClick={() => admitEmergencyPatient(reg, 'Bed 405')}
                                    disabled={wardPatients.some(wp => wp.bedNo === 'Bed 405')}
                                    className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer text-center ${
                                      wardPatients.some(wp => wp.bedNo === 'Bed 405')
                                        ? 'bg-slate-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#0A5BFF] hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    Assign Bed 405
                                  </button>
                                  <button
                                    onClick={() => admitEmergencyPatient(reg, 'Bed 406')}
                                    disabled={wardPatients.some(wp => wp.bedNo === 'Bed 406')}
                                    className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer text-center ${
                                      wardPatients.some(wp => wp.bedNo === 'Bed 406')
                                        ? 'bg-slate-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#0A5BFF] hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    Assign Bed 406
                                  </button>
                                </>
                              ) : (
                                <span className="w-full text-center text-[10px] font-bold text-[#0A5BFF] bg-emerald-500/10 py-1.5 rounded-xl border border-emerald-500/20">
                                  Admitted to Ward 4B
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Left/Middle Column Grid layout split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Patients Live Telemetry Queue */}
                  <div className={`p-5 rounded-3xl border ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  } space-y-4`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-sm">Active Ward Patients</h3>
                        <p className="text-[11px] text-gray-400">Select to display profile</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-[#0A5BFF] px-2 py-0.5 rounded-full font-bold">
                        {wardPatients.length} Cases
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {wardPatients.map(wp => (
                        <div
                          key={wp.id}
                          onClick={() => setSelectedPatientId(wp.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                            selectedPatientId === wp.id
                              ? 'bg-[#0A5BFF]/10 border-[#0A5BFF] text-[#0A5BFF]'
                              : isDarkMode
                              ? 'bg-slate-950 border-slate-850 hover:bg-slate-900'
                              : 'bg-white border-[#E8EDF5] hover:bg-slate-50 shadow-sm text-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full overflow-hidden border ${
                              wp.priority === 'Emergency' ? 'border-red-500' : wp.priority === 'Urgent' ? 'border-orange-500' : 'border-emerald-500'
                            }`}>
                              <img
                                src={wp.name === 'Rahul Anil Patil' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'}
                                alt="avatar"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{wp.name}</h4>
                              <p className="text-[10px] text-gray-400">{wp.bedNo} • {wp.diagnosis.split(' - ')[0]}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              wp.priority === 'Emergency'
                                ? 'bg-red-500/10 text-red-500'
                                : wp.priority === 'Urgent'
                                ? 'bg-orange-500/10 text-orange-500'
                                : 'bg-emerald-500/10 text-[#0A5BFF]'
                            }`}>
                              {wp.priority}
                            </span>
                            <div className="text-[9px] font-mono font-bold text-gray-400 mt-1">
                              HR: {wp.vitals.pulse} | SpO2: {wp.vitals.spo2}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ward Grid layout */}
                  <div className={`p-5 rounded-3xl border ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  } space-y-4`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-sm">Ward 4B Bed Grid View</h3>
                        <p className="text-[11px] text-gray-400">Interactive live status monitor</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('ward')}
                        className="text-xs font-bold text-[#0A5BFF] hover:text-emerald-400 flex items-center space-x-1"
                      >
                        <span>Full map</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {wardPatients.map(wp => (
                        <div
                          key={wp.id}
                          onClick={() => setSelectedPatientId(wp.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-24 relative overflow-hidden ${
                            selectedPatientId === wp.id
                              ? 'bg-[#0A5BFF]/10 border-[#0A5BFF] text-[#0A5BFF]'
                              : wp.priority === 'Emergency'
                              ? (isDarkMode ? 'bg-red-650/10 border-red-500/30' : 'bg-red-50 border border-red-200 text-red-700')
                              : wp.priority === 'Urgent'
                              ? (isDarkMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border border-orange-200 text-orange-700')
                              : isDarkMode
                              ? 'bg-slate-900 border-slate-800'
                              : 'bg-white border-[#E8EDF5] text-slate-700 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black text-gray-400">{wp.bedNo}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              wp.priority === 'Emergency'
                                ? 'bg-red-500 animate-ping'
                                : wp.priority === 'Urgent'
                                ? 'bg-orange-500'
                                : 'bg-emerald-500'
                            }`} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black truncate">{wp.name}</h4>
                            <p className="text-[8px] text-gray-400 truncate">{wp.diagnosis}</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] font-bold text-[#0A5BFF]">{wp.vitals.pulse} BPM</span>
                            <span className="text-[9px] text-gray-400">{wp.vitals.spo2}% SpO2</span>
                          </div>
                        </div>
                      ))}

                      {/* Available Bed Placeholder */}
                      {!wardPatients.some(wp => wp.bedNo === 'Bed 405') && (
                        <div className={`p-3 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center h-24 ${
                          isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-dashed border-[#E8EDF5] bg-white'
                        }`}>
                          <Plus className="w-4 h-4 text-gray-500 mb-1" />
                          <span className="text-[10px] font-black text-gray-400">Bed 405</span>
                          <span className="text-[8px] text-[#0A5BFF] font-bold">AVAILABLE</span>
                        </div>
                      )}

                      {/* Cleaning Needed Placeholder */}
                      {!wardPatients.some(wp => wp.bedNo === 'Bed 406') && (
                        <div className={`p-3 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center h-24 ${
                          isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-dashed border-[#E8EDF5] bg-white'
                        }`}>
                          <RefreshCw className="w-4 h-4 text-amber-500 mb-1 animate-spin" />
                          <span className="text-[10px] font-black text-gray-400">Bed 406</span>
                          <span className="text-[8px] text-amber-500 font-bold">CLEANING</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* AI Assistant Feed + Tasks Checklist */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* AI Assistant Warnings */}
                  <div className={`p-5 rounded-3xl border ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  } space-y-4`}>
                    <div className="flex items-center space-x-2">
                      <Flame className="w-5 h-5 text-[#0A5BFF]" />
                      <div>
                        <h3 className="font-extrabold text-sm">AI Clinical Assistant Warnings</h3>
                        <p className="text-[10px] text-gray-400">Real-time telemetry scan</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className={`p-3.5 rounded-2xl p-3 rounded-2xl border text-xs ${isDarkMode ? 'bg-red-650/10 border-red-500/20' : 'bg-red-50 border-red-200 text-red-800'} space-y-1`}>
                        <div className="flex justify-between items-center text-red-500 font-black text-[10px]">
                          <span>DETERIORATION RISK ALERT</span>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <p className="text-gray-300">Ramesh Joshi (Bed 403-ISO) has an elevated Early Warning Score (EWS: 5) due to high fever (101.2 F) and dipping oxygen levels (93% SpO2).</p>
                        <button 
                          onClick={() => {
                            setSelectedPatientId('3');
                            setActiveTab('vitals');
                          }}
                          className={`text-[10px] font-black mt-2 flex items-center space-x-1 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                        >
                          <span>Update Vitals Log</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs space-y-1">
                        <div className="flex justify-between items-center text-orange-500 font-black text-[10px]">
                          <span>MEDICATION SCHEDULE REMINDER</span>
                          <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-gray-300">Inj. Tramadol 50mg due for Rahul Anil Patil (Bed 401) at 12:00 PM. Double Verification required due to recorded NSAID allergy warnings.</p>
                        <button 
                          onClick={() => {
                            setSelectedPatientId('1');
                            setActiveTab('medication');
                          }}
                          className={`text-[10px] font-black mt-2 flex items-center space-x-1 ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}
                        >
                          <span>Open Med verification</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tasks list preview */}
                  <div className={`p-5 rounded-3xl border ${
                    isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                  } space-y-4`}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm">Shift Task Management</h3>
                      <button 
                        onClick={() => setActiveTab('tasks')}
                        className="text-xs font-bold text-[#0A5BFF] hover:text-emerald-400"
                      >
                        View checklist
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activePatient.tasks.slice(0, 3).map(t => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setWardPatients(prev => prev.map(p => {
                              if (p.id === activePatient.id) {
                                return {
                                  ...p,
                                  tasks: p.tasks.map(task => {
                                    if (task.id === t.id) return { ...task, completed: !task.completed };
                                    return task;
                                  })
                                };
                              }
                              return p;
                            }));
                            triggerToast('Task State Updated', `"${t.title}" toggled.`, 'info');
                          }}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            t.completed 
                              ? (isDarkMode ? 'bg-slate-900/40 border-slate-800 text-gray-500 line-through' : 'bg-slate-50 border-[#E8EDF5] text-slate-400 line-through') 
                              : (isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-white' : 'bg-white border-[#E8EDF5] hover:bg-slate-50 text-slate-800 shadow-sm')
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                              t.completed ? 'bg-[#0A5BFF] border-[#0A5BFF] text-white' : (isDarkMode ? 'border-slate-700' : 'border-gray-300 bg-white')
                            }`}>
                              {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-xs">{t.title}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            t.priority === 'High' ? 'bg-red-500/10 text-red-500' : t.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-800 text-gray-400'
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Pane: Sticky Patient Profile Card (1 col on xl) */}
              <div className="xl:sticky xl:top-0 space-y-6">
                
                <div className={`p-5 rounded-3xl border ${
                  isDarkMode ? 'bg-[#0f1524] border-slate-800 text-white' : 'bg-white border-[#E8EDF5] text-slate-850 shadow-lg'
                } space-y-5`}>
                  
                  {/* Avatar / Identity header */}
                  <div className="flex items-center space-x-3.5 pb-4 border-b border-gray-100 dark:border-slate-850">
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
                      activePatient.priority === 'Emergency'
                        ? 'border-red-500'
                        : activePatient.priority === 'Urgent'
                        ? 'border-orange-500'
                        : 'border-emerald-500'
                    }`}>
                      <img 
                        src={activePatient.name === 'Rahul Anil Patil' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'}
                        alt="patient avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-sm font-black">{activePatient.name}</h4>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {activePatient.age} Y / {activePatient.gender} • {activePatient.bedNo}
                      </p>
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-mono font-bold mt-1 ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-gray-400' : 'bg-slate-100 border border-[#E8EDF5] text-slate-600'}`}>
                        UHID-40291-MCGM
                      </span>
                    </div>
                  </div>

                  {/* SVG ECG Telemetry Wave */}
                  <div className={`p-3 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-[#E8EDF5]'}`}>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={`font-black tracking-widest flex items-center space-x-1 ${isDarkMode ? 'text-emerald-400' : 'text-[#0A5BFF]'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                        <span>LIVE TELEMETRY MONITOR</span>
                      </span>
                      <span className="font-mono text-gray-500">ECG Lead II</span>
                    </div>
                    <div className="relative h-12 flex items-center">
                      <svg viewBox="0 0 100 40" className="w-full h-full text-[#0A5BFF] stroke-current stroke-2 fill-none">
                        <path d={"M " + ecgLine.map((val, idx) => `${idx * 2.5} ${val / 2.5}`).join(" L ")} />
                      </svg>
                      <div className="absolute right-2 top-1 flex items-center space-x-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850">
                        <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                        <span className={`text-[10px] font-black font-mono ${isDarkMode ? 'text-emerald-400' : 'text-[#0A5BFF]'}`}>{activePatient.vitals.pulse}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals grid cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-850 text-white' : 'bg-white border-[#E8EDF5] text-slate-800 shadow-sm'}`}>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">BLOOD PRESSURE</p>
                      <p className={`text-xs font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{activePatient.vitals.bp} mmHg</p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-850 text-white' : 'bg-white border-[#E8EDF5] text-slate-800 shadow-sm'}`}>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">HEART RATE</p>
                      <p className="text-xs font-black text-[#0A5BFF] mt-1">{activePatient.vitals.pulse} BPM</p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-850 text-white' : 'bg-white border-[#E8EDF5] text-slate-800 shadow-sm'}`}>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">OXYGEN SAT</p>
                      <p className={`text-xs font-black mt-1 ${
                        activePatient.vitals.spo2 < 94 ? 'text-red-500' : 'text-emerald-400'
                      }`}>{activePatient.vitals.spo2}% SpO2</p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-850 text-white' : 'bg-white border-[#E8EDF5] text-slate-800 shadow-sm'}`}>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">TEMPERATURE</p>
                      <p className={`text-xs font-black mt-1 ${
                        activePatient.vitals.temp > 100 ? 'text-red-500' : (isDarkMode ? 'text-white' : 'text-slate-850')
                      }`}>{activePatient.vitals.temp} °F</p>
                    </div>
                  </div>

                  {/* Allergies & Diagnostics warning bar */}
                  <div className={`p-3 rounded-2xl p-3 rounded-2xl border text-xs ${isDarkMode ? 'bg-red-650/10 border-red-500/20' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <span className="font-black text-[10px] text-red-500 block uppercase">Allergies & Warnings</span>
                    <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-red-800 font-semibold'}`}>{activePatient.allergies.length > 0 ? activePatient.allergies.join(', ') : 'No drug allergies reported.'}</p>
                  </div>

                  {/* Attending Team / Diagnosis info */}
                  <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${isDarkMode ? 'bg-slate-900/40 border-slate-850 text-white' : 'bg-slate-50 border-[#E8EDF5] text-slate-800'}`}>
                    <div className={`flex justify-between items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Attending Doctor:</span>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activePatient.doctorName}</span>
                    </div>
                    <div className={`flex justify-between items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Diagnosis:</span>
                      <span className={`font-bold truncate max-w-[150px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activePatient.diagnosis}</span>
                    </div>
                  </div>

                  {/* Medications schedule checklists */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-850">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-[10px] text-gray-400 uppercase">Medication Schedule</span>
                      <span className="text-[9px] text-orange-400 font-bold">
                        {activePatient.medications.filter(m => m.status === 'Pending').length} Due
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                      {activePatient.medications.map((m, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-white border-[#E8EDF5] text-slate-800 shadow-sm'}`}>
                          <div className="space-y-0.5">
                            <h5 className={`text-[11px] font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{m.name}</h5>
                            <p className="text-[9px] text-gray-400">{m.dose} • {m.time}</p>
                          </div>
                          {m.status === 'Pending' ? (
                            <button
                              onClick={() => handleMedScanVerification(m)}
                              className="bg-[#0A5BFF] hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold"
                            >
                              Verify & Give
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-[#0A5BFF] bg-emerald-600/10 px-2 py-0.5 rounded-full">
                              Given
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions panel */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button 
                      onClick={() => setActiveTab('vitals')}
                      className="bg-[#0A5BFF] hover:bg-blue-700 text-white py-2.5 rounded-xl text-[10px] font-bold text-center cursor-pointer"
                    >
                      Log Vitals
                    </button>
                    <button 
                      onClick={() => setActiveTab('handover')}
                      className={`border py-2.5 rounded-xl text-[10px] font-bold text-center cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-gray-300' : 'bg-white border-[#E8EDF5] hover:bg-slate-50 text-slate-700'}`}
                    >
                      Shift Handover
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: WARD OVERVIEW LAYOUT */}
          {activeTab === 'ward' && (
            <div className="space-y-6">
              {/* Header with occupancy bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black">Ward Layout Map</h2>
                  <p className="text-xs text-gray-400">Physical bed matrix and occupancy index • Unit 4B</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-4 px-4 py-2 rounded-2xl text-[10px] font-bold border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'}`}>
                    <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /><span>Occupied</span></span>
                    <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /><span>Isolation</span></span>
                    <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-[#0A5BFF] rounded-full" /><span>Available</span></span>
                    <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /><span>Cleaning</span></span>
                  </div>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ward Occupancy</span>
                  <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{wardPatients.length} / 6 Beds ({Math.round((wardPatients.length / 6) * 100)}%)</span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0A5BFF] to-emerald-500 transition-all duration-700"
                    style={{ width: `${(wardPatients.length / 6) * 100}%` }}
                  />
                </div>
              </div>

              {/* Smart Nurse Assignment & Workload Balancer */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#0a5bff]/10 text-[#0a5bff]' : 'bg-blue-50 text-blue-600'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Smart Nurse Assignment Engine</h3>
                      <p className="text-[10px] text-gray-400">Dynamic workload leveling based on patient EWS acuity & ICU certifications</p>
                    </div>
                  </div>
                  <button
                    onClick={triggerAutoRebalance}
                    className="flex items-center space-x-2 bg-[#0A5BFF] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAcuityRebalanced ? '' : 'animate-spin'}`} />
                    <span>Auto-Rebalance Ward</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {nurses.map(nurse => (
                    <div key={nurse.id} className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-[#F8FAFD] border-[#E8EDF5]'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{nurse.name}</h4>
                          <p className="text-[9px] text-gray-400 mt-0.5">{nurse.shift} • {nurse.status}</p>
                        </div>
                        {nurse.icuCertified && (
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>ICU-CERT</span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400 font-bold">Workload Score</span>
                          <span className={`font-black ${nurse.workloadScore > 80 ? 'text-red-500' : nurse.workloadScore > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {nurse.workloadScore}%
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-850' : 'bg-slate-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              nurse.workloadScore > 80 ? 'bg-red-500' : nurse.workloadScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${nurse.workloadScore}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {nurse.beds.map(bed => (
                            <span
                              key={bed}
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                                isDarkMode ? 'bg-slate-950 border border-slate-800 text-gray-400' : 'bg-white border border-[#E8EDF5] text-slate-650'
                              }`}
                            >
                              {bed}
                            </span>
                          ))}
                          {nurse.beds.length === 0 && (
                            <span className="text-[9px] text-gray-500 italic">No beds assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Floor Grid layout */}
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} grid grid-cols-1 md:grid-cols-3 gap-6`}>
                
                {/* Room 4 Card */}
                <div className={`border p-4 rounded-2xl space-y-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50 text-white' : 'border-[#E8EDF5] bg-[#F8FAFD] text-slate-850'}`}>
                  <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5]'}`}>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>Orthopedic Room 4</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>General Ward</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {wardPatients.filter(wp => wp.roomNo === 'Room 4').map(wp => {
                      const ews = calculateEWS(wp.vitals);
                      return (
                      <div 
                        key={wp.id}
                        onClick={() => { setSelectedPatientId(wp.id); setActiveTab('patients'); }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:translate-y-[-1px] ${isDarkMode ? 'hover:bg-slate-800' : 'hover:shadow-md'} ${
                          selectedPatientId === wp.id ? 'bg-[#0A5BFF]/8 border-[#0A5BFF]/40 ring-1 ring-[#0A5BFF]/20' : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{wp.bedNo}</span>
                            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            wp.priority === 'Emergency' ? (isDarkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600 border border-red-200')
                            : wp.priority === 'Urgent' ? (isDarkMode ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-600 border border-orange-200')
                            : (isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-slate-100 text-slate-600 border border-[#E8EDF5]')
                          }`}>{wp.priority}</span>
                        </div>
                        <h4 className={`text-xs font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{wp.name}</h4>
                        <p className={`text-[10px] mt-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{wp.diagnosis}</p>
                        
                        {/* Inline vitals strip */}
                        <div className={`mt-3 flex items-center justify-between text-[9px] font-mono font-bold px-2.5 py-1.5 rounded-lg ${isDarkMode ? 'bg-slate-900 text-gray-400' : 'bg-slate-50 text-slate-500 border border-[#E8EDF5]'}`}>
                          <span>HR {wp.vitals.pulse}</span>
                          <span className="text-gray-600">•</span>
                          <span className={wp.vitals.spo2 < 94 ? 'text-red-500' : ''}>SpO2 {wp.vitals.spo2}%</span>
                          <span className="text-gray-600">•</span>
                          <span className={wp.vitals.temp > 100 ? 'text-red-500' : ''}>T {wp.vitals.temp}°F</span>
                        </div>

                        {/* EWS badge */}
                        {ews >= 2 && (
                          <div className={`mt-2 flex items-center space-x-1.5 text-[9px] font-black px-2 py-1 rounded-lg ${
                            ews >= 5 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            <AlertTriangle className="w-3 h-3" />
                            <span>EWS: {ews} – {ews >= 5 ? 'Critical' : 'Monitor'}</span>
                          </div>
                        )}
                      </div>
                    );})}
                  </div>
                </div>

                {/* Room 5 (Isolation / High Risk Room) */}
                <div className={`border p-4 rounded-2xl space-y-4 relative overflow-hidden ${isDarkMode ? 'border-red-500/20 bg-slate-900/50 text-white' : 'border-red-200 bg-red-50/30 text-slate-850'}`}>
                  {/* Subtle red accent stripe */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />
                  <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-red-100'}`}>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>Room 5 (Isolation & Triage)</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1 ${isDarkMode ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>HIGH RISK</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {wardPatients.filter(wp => wp.roomNo === 'Room 5').map(wp => {
                      const ews = calculateEWS(wp.vitals);
                      return (
                      <div 
                        key={wp.id}
                        onClick={() => { setSelectedPatientId(wp.id); setActiveTab('patients'); }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:translate-y-[-1px] ${isDarkMode ? 'hover:bg-slate-800' : 'hover:shadow-md'} ${
                          selectedPatientId === wp.id 
                            ? 'bg-[#0A5BFF]/8 border-[#0A5BFF]/40 ring-1 ring-[#0A5BFF]/20' 
                            : wp.status === 'Isolation'
                            ? (isDarkMode ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50/60 border-red-200')
                            : wp.priority === 'Emergency' 
                            ? (isDarkMode ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50 border-red-200')
                            : (isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm')
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-black ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{wp.bedNo}</span>
                            {wp.status === 'Isolation' && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>ISO</span>}
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            wp.priority === 'Emergency' ? (isDarkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700 border border-red-200')
                            : wp.priority === 'Urgent' ? (isDarkMode ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-100 text-orange-700 border border-orange-200')
                            : (isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-slate-100 text-slate-600')
                          }`}>{wp.priority}</span>
                        </div>
                        <h4 className={`text-xs font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{wp.name}</h4>
                        <p className={`text-[10px] mt-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{wp.diagnosis}</p>
                        
                        {/* Inline vitals strip */}
                        <div className={`mt-3 flex items-center justify-between text-[9px] font-mono font-bold px-2.5 py-1.5 rounded-lg ${isDarkMode ? 'bg-slate-900 text-gray-400' : 'bg-white/80 text-slate-500 border border-[#E8EDF5]'}`}>
                          <span>HR {wp.vitals.pulse}</span>
                          <span className="text-gray-600">•</span>
                          <span className={wp.vitals.spo2 < 94 ? 'text-red-500 font-black' : ''}>SpO2 {wp.vitals.spo2}%</span>
                          <span className="text-gray-600">•</span>
                          <span className={wp.vitals.temp > 100 ? 'text-red-500 font-black' : ''}>T {wp.vitals.temp}°F</span>
                        </div>

                        {/* EWS + deterioration */}
                        {(ews >= 2 || wp.vitals.spo2 < 95) && (
                          <div className={`mt-2 flex items-center space-x-1.5 text-[9px] font-black px-2 py-1 rounded-lg ${
                            ews >= 5 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            <AlertTriangle className="w-3 h-3" />
                            <span>EWS: {ews} – {ews >= 5 ? 'Deterioration Risk' : 'Close Monitoring'}</span>
                          </div>
                        )}
                      </div>
                    );})}
                  </div>
                </div>

                {/* Room 6 (Empty Beds / Admission holding) */}
                <div className={`border p-4 rounded-2xl space-y-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50 text-white' : 'border-[#E8EDF5] bg-[#F8FAFD] text-slate-850'}`}>
                  <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5]'}`}>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>Room 6 (Holding Area)</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-[#0A5BFF]/10 text-blue-400' : 'bg-blue-50 text-[#0A5BFF] border border-blue-200'}`}>2 FREE BEDS</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className={`p-5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center h-32 transition-all hover:border-[#0A5BFF]/40 ${isDarkMode ? 'border-slate-700 bg-slate-950/20 hover:bg-slate-900/50' : 'border-[#E8EDF5] bg-white hover:bg-blue-50/30'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50 border border-blue-100'}`}>
                        <Plus className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-[#0A5BFF]'}`} />
                      </div>
                      <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Bed 405</span>
                      <span className="text-[9px] text-[#0A5BFF] font-bold mt-0.5">AVAILABLE FOR ADMISSION</span>
                    </div>

                    <div className={`p-5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center h-32 ${isDarkMode ? 'border-amber-500/20 bg-amber-950/10' : 'border-amber-200 bg-amber-50/30'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                      <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Bed 406</span>
                      <span className="text-[9px] text-amber-600 font-bold mt-0.5">SANITIZATION IN PROGRESS</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: PATIENT PROFILE DETAIL */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              {/* Patient header card */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${
                      activePatient.priority === 'Emergency' ? 'border-red-500' : activePatient.priority === 'Urgent' ? 'border-orange-500' : 'border-emerald-500'
                    }`}>
                      <img 
                        src={activePatient.name === 'Rahul Anil Patil' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'}
                        alt="Patient Avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activePatient.name}</h2>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          activePatient.priority === 'Emergency' ? (isDarkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600 border border-red-200')
                          : activePatient.priority === 'Urgent' ? (isDarkMode ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-600 border border-orange-200')
                          : (isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')
                        }`}>{activePatient.priority}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{activePatient.age} Y / {activePatient.gender} • {activePatient.bedNo} • {activePatient.roomNo}</p>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-gray-400' : 'bg-slate-100 border border-[#E8EDF5] text-slate-600'}`}>UHID-40291-MCGM</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-gray-400' : 'bg-blue-50 border border-blue-100 text-[#0A5BFF]'}`}>ABHA: {activePatient.name.toLowerCase().replace(/\s/g, '')}@abha</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Mini EWS ring */}
                    {(() => {
                      const ews = calculateEWS(activePatient.vitals);
                      return (
                        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 ${
                          ews >= 5 ? 'border-red-500 bg-red-500/10 text-red-500' : ews >= 2 ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                        }`}>
                          <span className="text-sm font-black leading-none">{ews}</span>
                          <span className="text-[7px] font-bold">EWS</span>
                        </div>
                      );
                    })()}
                    <button 
                      onClick={() => setActiveTab('vitals')}
                      className="bg-[#0A5BFF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Log Vitals
                    </button>
                    <button 
                      onClick={() => setActiveTab('medication')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-gray-200' : 'bg-white border-[#E8EDF5] hover:bg-slate-50 text-slate-700'}`}
                    >
                      Medication Pad
                    </button>
                  </div>
                </div>
              </div>

              {/* Allergy banner */}
              {activePatient.allergies.length > 0 && (
                <div className={`p-3.5 rounded-2xl border flex items-center space-x-3 ${isDarkMode ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-red-500 uppercase">Known Allergies</span>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{activePatient.allergies.join(' • ')}</p>
                  </div>
                </div>
              )}

              {/* Details sections columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Clinical Stats & vitals index */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-5`}>
                  <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Active Vitals Intake</h3>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'BLOOD PRESSURE', value: `${activePatient.vitals.bp} mmHg`, color: isDarkMode ? 'text-white' : 'text-slate-800' },
                      { label: 'HEART RATE', value: `${activePatient.vitals.pulse} BPM`, color: 'text-[#0A5BFF]' },
                      { label: 'OXYGEN SAT', value: `${activePatient.vitals.spo2}% SpO2`, color: activePatient.vitals.spo2 < 94 ? 'text-red-500' : 'text-emerald-500' },
                      { label: 'TEMPERATURE', value: `${activePatient.vitals.temp} °F`, color: activePatient.vitals.temp > 100 ? 'text-red-500' : (isDarkMode ? 'text-white' : 'text-slate-800') },
                      { label: 'RESPIRATION', value: `${activePatient.vitals.resp} /min`, color: isDarkMode ? 'text-white' : 'text-slate-800' },
                      { label: 'PAIN SCALE', value: `${activePatient.vitals.pain} / 10`, color: activePatient.vitals.pain >= 7 ? 'text-red-500' : activePatient.vitals.pain >= 4 ? 'text-orange-500' : 'text-emerald-500' },
                    ].map((v, i) => (
                      <div key={i} className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-[#F8FAFD] border-[#E8EDF5]'}`}>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{v.label}</p>
                        <p className={`text-sm font-black mt-1 ${v.color}`}>{v.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Clinical notes */}
                  <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-[#F8FAFD] border-[#E8EDF5]'}`}>
                    <span className="text-[10px] font-black text-gray-400 uppercase block">Attending: {activePatient.doctorName}</span>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>{activePatient.diagnosis}</p>
                    <p className={`text-[11px] mt-2 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{activePatient.notes}</p>
                  </div>
                </div>

                {/* Treatment plan & Medications */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-5 lg:col-span-2`}>
                  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: isDarkMode ? '#1e293b' : '#E8EDF5' }}>
                    <h3 className={`font-extrabold text-sm ${isDarkMode ? '' : 'text-slate-800'}`}>Active Prescribed Medications</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                      {activePatient.medications.filter(m => m.status === 'Pending').length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activePatient.medications.map((m, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#F8FAFD] border-[#E8EDF5]'}`}>
                        <div className="space-y-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            m.route === 'IV Infusion' || m.route === 'IV Slow Push' ? (isDarkMode ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600 border border-purple-200')
                            : (isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')
                          }`}>{m.route}</span>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{m.name}</h4>
                          <p className="text-[10px] text-gray-400">Dosage: {m.dose} • Due: {m.time}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            m.status === 'Administered' ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200') : (isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600 border border-orange-200')
                          }`}>
                            {m.status}
                          </span>
                          {m.status === 'Pending' && (
                            <button
                              onClick={() => handleMedScanVerification(m)}
                              className="bg-[#0A5BFF] hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Verify & Give
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>

          {/* Timeline & Family Communications Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
              {/* Complete Patient Timeline */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4`}>
                <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Complete Patient Care Timeline</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {(patientTimelines[activePatient.id] || []).map((evt, idx) => (
                    <div key={idx} className="flex space-x-3 text-xs">
                      <div className="flex flex-col items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0A5BFF] flex-shrink-0 mt-1" />
                        <span className="w-0.5 flex-1 bg-slate-800 dark:bg-slate-700 my-1" />
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-[#0A5BFF]">{evt.action}</span>
                          <span className="text-[9px] text-gray-500 font-mono">{evt.time}</span>
                        </div>
                        <p className="text-gray-400 text-[10px] mt-0.5">{evt.remark}</p>
                      </div>
                    </div>
                  ))}
                  {(patientTimelines[activePatient.id] || []).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-6">No care timeline logged yet for this shift.</p>
                  )}
                </div>
              </div>

              {/* Family Communication Logs */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4`}>
                <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Family Communication Updates (SMS/WhatsApp Gateway)</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {familyLogs.filter(log => log.patientId === activePatient.id).map(log => (
                    <div key={log.id} className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-[#E8EDF5] text-slate-800'}`}>
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-bold text-emerald-400 flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>DELIVERED TO NEXT-OF-KIN</span>
                        </span>
                        <span className="text-gray-500 font-mono">{log.time}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>{log.message}</p>
                    </div>
                  ))}
                  {familyLogs.filter(log => log.patientId === activePatient.id).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-6">No status updates dispatched yet.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

          {/* TAB 4: VITALS ENTRY MODULE */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              {/* Header with patient context */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black">Vitals Logging Panel</h2>
                  <p className="text-xs text-gray-400">Log vitals parameters for {activePatient.name} ({activePatient.bedNo})</p>
                </div>
                <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                    <Activity className="w-4 h-4 text-[#0A5BFF]" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>LAST READING</p>
                    <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>BP {activePatient.vitals.bp} • HR {activePatient.vitals.pulse} • SpO2 {activePatient.vitals.spo2}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form fields */}
                <form onSubmit={submitVitals} className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-5`}>
                  <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Record New Vitals</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center space-x-1">
                        <span>Blood Pressure (mmHg)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 120/80" 
                        value={vitalInputs.bp}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, bp: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]/30 focus:border-[#0A5BFF] transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F8FAFD] border-[#E8EDF5] text-slate-800'}`}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center space-x-1">
                        <span>Pulse Rate (BPM)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 72" 
                        value={vitalInputs.pulse}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, pulse: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]/30 focus:border-[#0A5BFF] transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F8FAFD] border-[#E8EDF5] text-slate-800'}`}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center space-x-1">
                        <span>Temperature (°F)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 98.6" 
                        value={vitalInputs.temp}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, temp: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]/30 focus:border-[#0A5BFF] transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F8FAFD] border-[#E8EDF5] text-slate-800'}`}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Oxygen Saturation (% SpO2)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 98" 
                        value={vitalInputs.spo2}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, spo2: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]/30 focus:border-[#0A5BFF] transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F8FAFD] border-[#E8EDF5] text-slate-800'}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Respiration Rate (breaths/min)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 16" 
                        value={vitalInputs.resp}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, resp: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]/30 focus:border-[#0A5BFF] transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F8FAFD] border-[#E8EDF5] text-slate-800'}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Glasgow Coma Scale (GCS)</label>
                      <select 
                        value={vitalInputs.gcs}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, gcs: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]/30 focus:border-[#0A5BFF] transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F8FAFD] border-[#E8EDF5] text-slate-800'}`}
                      >
                        <option value="15">15 - Fully Awake</option>
                        <option value="14">14 - Mild Confusion</option>
                        <option value="13">13 - Moderate Confusion</option>
                        <option value="9">9 - Severe Comatose State</option>
                      </select>
                    </div>
                  </div>

                  {/* Nurse notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Clinical Notes (Optional)</label>
                    <textarea
                      placeholder="Any observations during vitals recording..."
                      rows={2}
                      className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5BFF]/30 focus:border-[#0A5BFF] transition-all resize-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F8FAFD] border-[#E8EDF5] text-slate-800'}`}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#0A5BFF] hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Vitals & Sync to ABHA Record</span>
                  </button>
                </form>

                {/* EWS scorecard */}
                <div className="space-y-6">
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4`}>
                    <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>EWS Scorecard</h3>

                    <div className="flex flex-col items-center justify-center text-center py-4 space-y-3">
                      <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all ${
                        calculateEWS(vitalInputs) >= 5 
                          ? 'bg-red-500/10 border-red-500 text-red-500' 
                          : calculateEWS(vitalInputs) >= 2 
                          ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                          : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                      }`}>
                        <span className="text-3xl font-black">{calculateEWS(vitalInputs)}</span>
                        <span className="text-[9px] font-bold">EWS SCORE</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {calculateEWS(vitalInputs) >= 5 
                            ? '⚠ Deterioration Warning' 
                            : calculateEWS(vitalInputs) >= 2 
                            ? 'Moderate Observation Risk' 
                            : '✓ Patient Status: Stable'}
                        </h4>
                        <p className="text-[10px] text-gray-400 px-2">
                          Auto-calculated from pulse, SpO2, respiration, and temperature.
                        </p>
                      </div>
                    </div>

                    {/* EWS scoring guide */}
                    <div className="space-y-2">
                      {[
                        { label: '0-1', desc: 'Low risk', color: isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { label: '2-4', desc: 'Medium risk – increase monitoring', color: isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200' },
                        { label: '5+', desc: 'High risk – escalate to doctor', color: isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200' },
                      ].map((g, i) => (
                        <div key={i} className={`flex items-center space-x-2 text-[10px] px-3 py-2 rounded-xl border ${g.color}`}>
                          <span className="font-black">{g.label}</span>
                          <span>—</span>
                          <span>{g.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick reference – previous vitals */}
                  <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-3`}>
                    <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Previous Vitals</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'BP', value: activePatient.vitals.bp + ' mmHg' },
                        { label: 'HR', value: activePatient.vitals.pulse + ' BPM' },
                        { label: 'SpO2', value: activePatient.vitals.spo2 + '%' },
                        { label: 'Temp', value: activePatient.vitals.temp + ' °F' },
                      ].map((v, i) => (
                        <div key={i} className={`flex justify-between items-center text-xs px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900 text-gray-300' : 'bg-[#F8FAFD] border border-[#E8EDF5] text-slate-600'}`}>
                          <span className="font-bold text-gray-400">{v.label}</span>
                          <span className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{v.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: MEDICATION VERIFICATION & SCANNING */}
          {activeTab === 'medication' && (
            <div className="space-y-6">
              {/* Header with progress */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black">Barcoded Medication Verification</h2>
                  <p className="text-xs text-gray-400">Scan patient barcode and prescription vials to avoid administration error</p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Admin progress mini stat */}
                  {(() => {
                    const total = activePatient.medications.length;
                    const done = activePatient.medications.filter(m => m.status === 'Administered').length;
                    return (
                      <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${done === total ? (isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') : (isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50')}`}>
                          <span className={`text-sm font-black ${done === total ? 'text-emerald-500' : 'text-orange-500'}`}>{done}/{total}</span>
                        </div>
                        <div>
                          <p className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ADMINISTERED</p>
                          <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{done === total ? 'All Complete' : `${total - done} Remaining`}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Allergy quick-strip */}
              {activePatient.allergies.length > 0 && (
                <div className={`p-3 rounded-2xl border flex items-center space-x-2 ${isDarkMode ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-[10px] font-black text-red-500 uppercase">ALLERGIES:</span>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{activePatient.allergies.join(' • ')}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active patient schedule list */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4`}>
                  <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Today's Schedule for {activePatient.name}</h3>

                  <div className="space-y-3">
                    {activePatient.medications.map((med, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#F8FAFD] border-[#E8EDF5]'} ${med.status === 'Administered' ? 'opacity-70' : ''}`}>
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              med.route === 'IV Infusion' || med.route === 'IV Slow Push' ? (isDarkMode ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600 border border-purple-200')
                              : (isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')
                            }`}>{med.route}</span>
                            <span className={`text-[9px] font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{med.time}</span>
                          </div>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{med.name}</h4>
                          <p className="text-[10px] text-gray-400">Dose: {med.dose}</p>
                        </div>
                        <div>
                          {med.status === 'Pending' ? (
                            <button
                              onClick={() => handleMedScanVerification(med)}
                              className="bg-[#0A5BFF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>Double Verify & Scan</span>
                            </button>
                          ) : (
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{med.status}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety parameters index */}
                <div className="space-y-6">
                  <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4`}>
                    <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Double-Verification Index</h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { title: 'Right Patient Profile', desc: 'Wristband ABHA QR code scan verifies unique identity.', icon: true },
                        { title: 'Right Medicine & Dose', desc: 'Scanning drug label cross-verifies prescription orders.', icon: true },
                        { title: 'Allergy Interaction Check', desc: 'Safety algorithm flags matching allergic contraindications.', icon: true },
                        { title: 'Right Time & Route', desc: 'Schedule adherence and route verification for each dose.', icon: true },
                      ].map((item, i) => (
                        <div key={i} className={`p-3.5 rounded-2xl border flex items-start space-x-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFD] border-[#E8EDF5]'}`}>
                          <CheckCircle2 className="w-5 h-5 text-[#0A5BFF] mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient context */}
                  <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-3`}>
                    <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Patient Context</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Patient', value: activePatient.name },
                        { label: 'Location', value: `${activePatient.bedNo} • ${activePatient.roomNo}` },
                        { label: 'Diagnosis', value: activePatient.diagnosis },
                        { label: 'Attending', value: activePatient.doctorName },
                      ].map((v, i) => (
                        <div key={i} className={`flex justify-between items-center text-xs px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900 text-gray-300' : 'bg-[#F8FAFD] border border-[#E8EDF5] text-slate-600'}`}>
                          <span className="font-bold text-gray-400 text-[10px]">{v.label}</span>
                          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} text-right max-w-[60%] truncate`}>{v.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: DOCTOR ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Active Doctor Orders</h2>
                <p className="text-xs text-gray-400">Receive and sign-off clinical directives from attending medical staff</p>
              </div>

              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl p-4 rounded-2xl border flex justify-between items-start ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-[#E8EDF5] text-slate-850'}`}>
                    <div className="space-y-1">
                      <span className="text-[9px] bg-red-650/20 text-red-400 px-2 py-0.5 rounded font-black uppercase">URGENT</span>
                      <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>IV Paracetamol 1g Slow Infusion</h4>
                      <p className="text-[10px] text-gray-400">Ordered by Dr. Anil Patil • Bed 403 Ramesh Joshi • For high fever spike</p>
                    </div>
                    <button
                      onClick={() => {
                        triggerToast('Order Completed', 'Logged IV antipyretic delivery.', 'success');
                      }}
                      className="bg-[#0A5BFF] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Complete Order
                    </button>
                  </div>

                  <div className={`p-4 rounded-2xl p-4 rounded-2xl border flex justify-between items-start ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-[#E8EDF5] text-slate-850'}`}>
                    <div className="space-y-1">
                      <span className="text-[9px] bg-slate-800 text-gray-400 px-2 py-0.5 rounded font-black uppercase">ROUTINE</span>
                      <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>Post-op Range of Motion (ROM) assessment</h4>
                      <p className="text-[10px] text-gray-400">Ordered by Dr. Anil Patil • Bed 401 Rahul Patil • Post-op knee rehabilitation</p>
                    </div>
                    <button
                      onClick={() => {
                        triggerToast('Order Completed', 'ROM rehabilitation log updated.', 'success');
                      }}
                      className="bg-[#0A5BFF] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Complete Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TASK MANAGEMENT */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Task Checklist & Schedule</h2>
                <p className="text-xs text-gray-400">Nursing care tasks due for active ward patients</p>
              </div>

              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                <div className="space-y-3">
                  {activePatient.tasks.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => {
                        setWardPatients(prev => prev.map(p => {
                          if (p.id === activePatient.id) {
                            return {
                              ...p,
                              tasks: p.tasks.map(task => {
                                if (task.id === t.id) return { ...task, completed: !task.completed };
                                return task;
                              })
                            };
                          }
                          return p;
                        }));
                      }}
                      className={`p-4 rounded-2xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-[#E8EDF5] text-slate-800 shadow-sm'} cursor-pointer hover:bg-slate-900 transition-all`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          t.completed ? 'bg-[#0A5BFF] border-[#0A5BFF] text-white' : (isDarkMode ? 'border-slate-700' : 'border-gray-300 bg-white')
                        }`}>
                          {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-bold ${t.completed ? 'text-gray-400 line-through' : (isDarkMode ? 'text-white' : 'text-slate-850')}`}>{t.title}</h4>
                          <p className="text-[10px] text-gray-400">Target Time: {t.due} • Patient: {activePatient.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(!t.completed && (t.priority === 'High' || t.due === 'Immediate' || t.due === '11:00 AM')) && (
                          <span className="text-[9px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>ESCALATED</span>
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          t.priority === 'High' ? 'bg-red-500/10 text-red-500' : (isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-slate-200 text-slate-600')
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SHIFT HANDOVER REPORT */}
          {activeTab === 'handover' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Shift Handover & Sign-off</h2>
                <p className="text-xs text-gray-400">Generate, sign, and transmit shift summary records</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Voice handover summary compiling */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-2">
                    <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>AI Verbal Scribe</h3>
                    <p className="text-xs text-gray-400">Press record and summarize the shift verbally. The AI Assistant will auto-parse the summary into structured EMR notes.</p>
                  </div>

                  <div className={`flex flex-col items-center justify-center p-6 rounded-2xl space-y-4 border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-[#E8EDF5]'}`}>
                    <button
                      type="button"
                      onClick={toggleHandoverVoiceRecorder}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isRecordingHandover 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-[#0A5BFF] text-white hover:bg-blue-700'
                      }`}
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      {isRecordingHandover ? 'RECORDING VERBAL HANDOVER SUMMARY...' : 'CLICK TO INITIATE MIC DICTATION'}
                    </span>

                    {recordedHandoverText && (
                      <textarea
                        value={recordedHandoverText}
                        onChange={(e) => setRecordedHandoverText(e.target.value)}
                        className={`w-full h-32 border rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] mt-4 leading-relaxed ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#E8EDF5] text-slate-850'}`}
                      />
                    )}
                  </div>

                  {/* Handover summary checklist */}
                  <div className={`p-4 rounded-2xl text-xs space-y-2 border ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-[#E8EDF5] text-slate-850'}`}>
                    <span className="font-black text-[10px] text-emerald-500 dark:text-emerald-400 block uppercase">AI-COMPILED SHIFT OUTCOMES:</span>
                    <ul className={`list-disc list-inside space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
                      <li>Active Ward Occupancy: <strong>{wardPatients.length} Patients</strong> currently admitted.</li>
                      <li>Medication Schedule: <strong>{wardPatients.reduce((sum, p) => sum + p.medications.filter(m => m.status === 'Pending').length, 0)} doses pending</strong>; {wardPatients.reduce((sum, p) => sum + p.medications.filter(m => m.status === 'Administered').length, 0)} administered.</li>
                      <li>Incomplete Care Tasks: <strong>{wardPatients.reduce((sum, p) => sum + p.tasks.filter(t => !t.completed).length, 0)} checklist tasks</strong> outstanding.</li>
                      {(() => {
                        const highEWSList = wardPatients
                          .map(p => ({ p, ews: calculateEWS(p.vitals) }))
                          .filter(x => x.ews >= 3);
                        if (highEWSList.length > 0) {
                          return (
                            <li className="text-red-500 font-bold">
                              Critical Alert: {highEWSList.map(x => `${x.p.name} (Bed ${x.p.bedNo}, EWS: ${x.ews})`).join(', ')} require close observation.
                            </li>
                          );
                        }
                        return <li>No critical clinical alerts or abnormal EWS trends detected.</li>;
                      })()}
                    </ul>
                  </div>
                </div>

                {/* Digital Signature card */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5] shadow-sm'} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-1">
                    <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Shift Handover Sign-off</h3>
                    <p className="text-xs text-gray-400">Provide signature below to authorize the transfer of ward duties.</p>
                  </div>

                  {/* Draw Signature Canvas */}
                  <div className={`relative border rounded-2xl overflow-hidden h-44 flex items-center justify-center ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-[#E8EDF5] bg-white'}`}>
                    <svg
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    >
                      {signaturePaths.length > 0 && (
                        <path
                          d={signaturePaths.join(' ')}
                          stroke={isDarkMode ? '#ffffff' : '#0A5BFF'}
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                    {signaturePaths.length === 0 && (
                      <span className="text-[10px] text-gray-600 font-bold uppercase pointer-events-none">Draw signature here using finger / cursor</span>
                    )}

                    {signaturePaths.length > 0 && (
                      <button
                        onClick={clearSignature}
                        className={`absolute bottom-2 right-2 p-2 rounded-lg text-[9px] border ${isDarkMode ? 'bg-slate-800 text-gray-450 hover:text-white border-transparent' : 'bg-white text-slate-600 hover:bg-slate-50 border-[#E8EDF5]'}`}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    onClick={submitHandoverReport}
                    className="w-full bg-[#0A5BFF] hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Authorize Duty Shift Transfer</span>
                  </button>
                </div>

              </div>

              {/* Handover summary log history */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Shift Handover Audit Records</h3>
                <div className="space-y-3">
                  {handoverLogs.map(hl => (
                    <div key={hl.id} className={`p-4 rounded-2xl border flex justify-between items-start ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-[#E8EDF5] text-slate-800'}`}>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-emerald-400">{hl.date}</span>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-750'}`}>{hl.summary}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center space-x-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{hl.voiceDuration}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 9: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black">Ward Inventory & Supplies</h2>
                  <p className="text-xs text-gray-400">Track levels of active ward consumables and raise supply requisitions</p>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                <div className="space-y-3">
                  {inventory.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-[#E8EDF5] text-slate-850'}`}>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase">{item.type}</span>
                        <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{item.name}</h4>
                        <p className="text-[10px] text-gray-400">Stock: {item.stock} {item.unit} (Min Threshold: {item.minStock} {item.unit})</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          item.status === 'Good' ? 'bg-emerald-600/10 text-[#0A5BFF]' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {item.status}
                        </span>
                        <button
                          onClick={() => {
                            setInventory(prev => prev.map((it, i) => {
                              if (i === idx) return { ...it, status: 'Reorder Pending' };
                              return it;
                            }));
                            triggerToast('Reorder Requested', `Supplies requisition sent for ${item.name}.`, 'success');
                          }}
                          className="bg-[#0A5BFF] hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Reorder Requisition
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SECURE COMMUNICATION MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Secure Care Messenger</h2>
                <p className="text-xs text-gray-400">Encrypted instant messaging channel with doctors and pharmacy departments</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                
                {/* Conversations Threads list */}
                <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                  <h3 className={`font-extrabold text-sm border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5] text-slate-800'}`}>Active Channels</h3>
                  <div className="space-y-2">
                    {(['Dr. Patil', 'Pharmacy'] as const).map(th => (
                      <div
                        key={th}
                        onClick={() => setActiveChatThread(th)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          activeChatThread === th ? 'bg-[#0A5BFF]/10 border-[#0A5BFF] text-[#0A5BFF]' : isDarkMode ? 'bg-slate-950 border-slate-850 hover:bg-slate-900' : 'bg-slate-50 border-[#E8EDF5] hover:bg-slate-100 text-slate-850'
                        }`}
                      >
                        <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{th}</h4>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {messages.filter(m => m.thread === th).slice(-1)[0]?.text || 'No messages.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages pane */}
                <div className={`lg:col-span-2 p-4 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} flex flex-col justify-between h-full`}>
                  
                  {/* Message dialogue bubble */}
                  <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-4">
                    {messages.filter(m => m.thread === activeChatThread).map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                          msg.sender === 'You'
                            ? (isDarkMode ? 'bg-[#0A5BFF]/20 border border-[#0A5BFF]/30 text-blue-150 ml-auto' : 'bg-[#0A5BFF] text-white ml-auto')
                            : (isDarkMode ? 'bg-slate-900 border border-slate-800 text-gray-200' : 'bg-slate-50 border border-[#E8EDF5] text-slate-800')
                        }`}
                      >
                        <p className={`font-semibold text-[9px] mb-0.5 ${msg.sender === 'You' ? (isDarkMode ? 'text-blue-300' : 'text-blue-100') : 'text-gray-400'}`}>{msg.sender}</p>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Input container */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!chatInput.trim()) return;

                      const newMsg = {
                        id: 'msg_' + Date.now(),
                        thread: activeChatThread,
                        sender: 'You',
                        text: chatInput,
                        time: 'Just Now'
                      };

                      setMessages([...messages, newMsg]);
                      setChatInput('');

                      // Mock replies
                      setTimeout(() => {
                        const reply = {
                          id: 'reply_' + Date.now(),
                          thread: activeChatThread,
                          sender: activeChatThread === 'Dr. Patil' ? 'Dr. Anil Patil' : 'Pharmacy Admin',
                          text: activeChatThread === 'Dr. Patil' ? 'Received. I am checking the vitals log dashboard now. Proceed as advised.' : 'Requisition is ready for pickup. Reorder invoice logged.',
                          time: 'Just Now'
                        };
                        setMessages(prev => [...prev, reply]);
                      }, 2000);
                    }}
                    className={`flex items-center space-x-2 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5]'}`}
                  >
                    <input 
                      type="text"
                      placeholder="Type secure message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className={`flex-1 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A5BFF] ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#E8EDF5] text-slate-850'}`}
                    />
                    <button
                      type="submit"
                      className="bg-[#0A5BFF] hover:bg-blue-700 text-white p-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS MODULE */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Portal Configuration Settings</h2>
                <p className="text-xs text-gray-400">Configure Nurse OS parameters and system adjustments</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Configuration parameters */}
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-6`}>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0A5BFF]">System Configuration</h3>
                    
                    <div className="space-y-4">
                      {/* Biometric toggle */}
                      <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-slate-850' : 'border-[#E8EDF5]'}`}>
                        <div>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>Biometric Verification Authorization</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Require fingerprint signature to authorize medications.</p>
                        </div>
                        <button
                          onClick={() => {
                            setBiometricEnabled(!biometricEnabled);
                            logSecurityAudit(`Biometric Auth ${!biometricEnabled ? 'Enabled' : 'Disabled'}`, 'Success');
                            triggerToast('Biometrics Updated', `Biometric verification is now ${!biometricEnabled ? 'enabled' : 'disabled'}.`, 'success');
                          }}
                          className={`w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 focus:outline-none ${
                            biometricEnabled ? 'bg-[#0A5BFF] justify-end' : 'bg-gray-300 dark:bg-slate-850 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                        </button>
                      </div>

                      {/* Offline Mode toggle */}
                      <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-slate-850' : 'border-[#E8EDF5]'}`}>
                        <div>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>MCGM Offline Mode (Local-First Sync)</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Suspend central ABHA registry synchronization and enable offline spooler.</p>
                        </div>
                        <button
                          onClick={toggleOfflineMode}
                          className={`w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 focus:outline-none ${
                            isOffline ? 'bg-[#0A5BFF] justify-end' : 'bg-gray-300 dark:bg-slate-850 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                        </button>
                      </div>

                      {/* Dark mode toggle */}
                      <div className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-slate-850' : 'border-[#E8EDF5]'}`}>
                        <div>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>High Contrast Night-mode</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Adapt screen colors to zero glare for dark ward settings.</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsDarkMode(!isDarkMode);
                            logSecurityAudit(`Theme Toggle: ${!isDarkMode ? 'Dark' : 'Light'}`, 'Success');
                          }}
                          className={`w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 focus:outline-none ${
                            isDarkMode ? 'bg-[#0A5BFF] justify-end' : 'bg-gray-300 dark:bg-slate-850 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                        </button>
                      </div>

                      {/* Nurse ID badging sync */}
                      <div className="flex justify-between items-center py-3">
                        <div>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>Nurse ID Badging Sync</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Sync RFID badge with Android tablet bluetooth.</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#0A5BFF] uppercase">CONNECTED</span>
                      </div>
                    </div>
                  </div>

                  {/* Offline Queue */}
                  {isOffline && (
                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-500 flex items-center space-x-2">
                          <WifiOff className="w-4 h-4" />
                          <span>Offline Action Spooler</span>
                        </h3>
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full">
                          {offlineQueue.length} Pending
                        </span>
                      </div>
                      
                      {offlineQueue.length === 0 ? (
                        <p className="text-[10px] text-gray-400 font-semibold">No actions queued. Systems operating locally.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {offlineQueue.map(item => (
                            <div key={item.id} className={`p-3 rounded-2xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-[#E8EDF5]'}`}>
                              <div>
                                <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>
                                  {item.actionType === 'LOG_VITALS' ? 'Log Vitals Metric' : 'Administer Medication'}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Patient ID: {item.data.patientId} | {item.actionType === 'LOG_VITALS' ? `BP: ${item.data.bp}` : item.data.medName}
                                </p>
                              </div>
                              <span className="text-[9px] text-gray-400 font-bold">
                                {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Security & Consent Audit Feeds */}
                <div className="space-y-6">
                  {/* Security Audit Feed */}
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-red-500 flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Security Audit Logs</span>
                    </h3>
                    
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {securityAudits.map(audit => (
                        <div key={audit.id} className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-[#E8EDF5]'}`}>
                          <div className="flex justify-between items-start">
                            <span className={`font-bold text-[10px] truncate max-w-[130px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{audit.eventType}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                              audit.status === 'Success' 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {audit.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                            <span>{audit.user}</span>
                            <span>IP: {audit.ip}</span>
                          </div>
                          <div className="text-[9px] text-gray-450 text-right">
                            {audit.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ABHA Consent Audit Trail */}
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-[#E8EDF5]'} space-y-4`}>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0A5BFF] flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>ABHA Consent Audit Trail</span>
                    </h3>
                    
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {abhaConsentLogs.map(log => (
                        <div key={log.id} className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-[#E8EDF5]'}`}>
                          <div className="flex justify-between items-start">
                            <span className={`font-bold text-[10px] truncate max-w-[130px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{log.actionType}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                              log.status === 'Approved' || log.status === 'Success' 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : log.status === 'Bypassed' 
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-red-500/10 text-red-500'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                            <span>{log.patientName}</span>
                            <span>GW: {log.gateway}</span>
                          </div>
                          <div className="text-[9px] text-gray-450 text-right">
                            {log.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Barcode scan simulation modal */}
      <AnimatePresence>
        {showScanModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl border p-6 space-y-4 ${
                isDarkMode ? 'bg-[#0f1524] border-slate-850 text-white' : 'bg-white border-[#E8EDF5] text-slate-850'
              }`}
            >
              <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5]'}`}>
                <h3 className="font-extrabold text-sm">Medication Barcode Scan</h3>
                <button onClick={() => setShowScanModal(false)} className="text-gray-400 hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {scanState === 'scanning' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0A5BFF]/10 flex items-center justify-center border-2 border-[#0A5BFF] animate-pulse">
                    <QrCode className="w-8 h-8 text-[#0A5BFF]" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>Simulating Barcode Laser Scanner</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Cross-referencing patient ID profile and drug vials against prescription orders...</p>
                  </div>
                </div>
              )}

              {scanState === 'allergy_alert' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-650/15 border border-red-500/30 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-red-500 font-black">
                      <ShieldAlert className="w-5 h-5" />
                      <span>CRITICAL ALLERGY INTERACTION ALERT</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      Allergy Check failed! The scanned drug contains active ingredients conflictive with patient allergy record: <strong>{activePatient.allergies.join(', ')}</strong>.
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowScanModal(false)}
                      className={`flex-1 py-3.5 rounded-xl font-bold text-xs cursor-pointer text-center border ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-gray-300' : 'bg-white border-[#E8EDF5] hover:bg-slate-50 text-slate-700'}`}
                    >
                      Override / Cancel
                    </button>
                  </div>
                </div>
              )}

              {scanState === 'interaction_alert' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-650/15 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-amber-500 font-black">
                      <AlertTriangle className="w-5 h-5" />
                      <span>CRITICAL DRUG-DRUG INTERACTION ALERT (ADE)</span>
                    </div>
                    <p className="text-gray-350 dark:text-gray-300 leading-relaxed">
                      Therapeutic duplication / Adverse Drug Event threat! The scanned drug <strong>{activeScanMed?.name}</strong> has a moderate-to-severe interaction with:
                      <br />• <strong>Tab. Aceclofenac 100mg</strong> or <strong>Tab. Paracetamol 650mg</strong> already active in patient therapy.
                      <br /><br />
                      Proceeding requires Supervisor override and confirmation of physical vitals check.
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowScanModal(false)}
                      className={`flex-1 py-3.5 rounded-xl font-bold text-xs cursor-pointer text-center border ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-gray-300' : 'bg-white border-[#E8EDF5] hover:bg-slate-50 text-slate-700'}`}
                    >
                      Cancel / Hold Dose
                    </button>
                    <button
                      onClick={() => {
                        setScanState('verified');
                        logSecurityAudit(`Interaction Override: ${activeScanMed?.name}`, 'Success');
                        triggerToast('Override Logged', 'Supervisor override recorded in central EMR.', 'success');
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white flex-1 py-3.5 rounded-xl font-bold text-xs cursor-pointer text-center transition-all"
                    >
                      Override & Proceed
                    </button>
                  </div>
                </div>
              )}

              {scanState === 'verified' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 ${isDarkMode ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-850'}`}>
                    <div className={`flex items-center space-x-2 font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>DOUBLE VERIFICATION MATCHED</span>
                    </div>
                    <p className={isDarkMode ? 'text-gray-350' : 'text-slate-650'}>
                      Scanning verified: <strong>{activeScanMed?.name}</strong> matches ABHA prescription orders for <strong>{activePatient.name}</strong> (Bed {activePatient.bedNo}).
                    </p>
                  </div>

                  {/* Safety Checklist */}
                  <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-[#E8EDF5]'}`}>
                    <p className={`font-black uppercase text-[9px] tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>6 Rights of Medication Safety Checklist</p>
                    {[
                      { key: 'patient', label: `1. Right Patient: ${activePatient.name}` },
                      { key: 'drug', label: `2. Right Drug: ${activeScanMed?.name}` },
                      { key: 'dose', label: `3. Right Dose: ${activeScanMed?.dose}` },
                      { key: 'route', label: `4. Right Route: ${activeScanMed?.route}` },
                      { key: 'time', label: `5. Right Time: ${activeScanMed?.time}` },
                      { key: 'allergies', label: '6. Right Allergies: No active drug interaction' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center space-x-2.5 py-0.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(medChecks as any)[item.key]}
                          onChange={(e) => setMedChecks(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="rounded border-gray-300 dark:border-slate-800 text-[#0A5BFF] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                        />
                        <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={confirmMedAdministration}
                    disabled={!Object.values(medChecks).every(Boolean)}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all ${
                      Object.values(medChecks).every(Boolean)
                        ? 'bg-[#0A5BFF] hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm Dose Administration
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Confirmation simulation modal */}
      <AnimatePresence>
        {voiceConfirmation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl border p-6 space-y-4 ${
                isDarkMode ? 'bg-[#0f1524] border-slate-850 text-white' : 'bg-white border-[#E8EDF5] text-slate-850'
              }`}
            >
              <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-[#E8EDF5]'}`}>
                <h3 className="font-extrabold text-sm flex items-center space-x-2 text-[#0A5BFF]">
                  <Mic className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>Arogya Voice OS Confirmation</span>
                </h3>
                <button onClick={() => setVoiceConfirmation(null)} className="text-gray-400 hover:text-gray-250">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-400">We detected a command with confidence level <strong>{voiceConfirmation.confidence}%</strong>:</p>
                <div className={`p-4 rounded-2xl border text-xs font-mono ${isDarkMode ? 'bg-slate-950 border-slate-850 text-orange-400' : 'bg-orange-50/50 border-orange-100 text-orange-700'}`}>
                  "{voiceConfirmation.command}"
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setVoiceConfirmation(null)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-[11px] border cursor-pointer text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-gray-300' : 'bg-white border-[#E8EDF5] text-slate-700'}`}
                  >
                    Reject / Cancel
                  </button>
                  <button
                    onClick={voiceConfirmation.action}
                    className="flex-1 py-2.5 rounded-xl font-bold text-[11px] bg-[#0A5BFF] hover:bg-blue-700 text-white cursor-pointer text-center"
                  >
                    Confirm & Execute
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast Alert banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] max-w-sm w-[90%] border rounded-2xl shadow-2xl p-4 flex items-start space-x-3 ${
              isDarkMode ? 'bg-[#0f1524] border-slate-800 text-white' : 'bg-white border-[#E8EDF5] text-slate-850'
            }`}
          >
            <div className={`p-2 rounded-xl ${
              toast.type === 'alert' ? 'bg-red-500/10 text-red-500' : toast.type === 'success' ? 'bg-emerald-500/10 text-[#0A5BFF]' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {toast.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : toast.type === 'success' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{toast.title}</h5>
              <p className="text-[11px] text-gray-400 leading-normal mt-0.5">{toast.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
