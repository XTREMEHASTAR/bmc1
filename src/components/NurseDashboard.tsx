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
  FileText
} from 'lucide-react';
import { Patient, Appointment, HealthRecord, NotificationItem } from '../types';

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

  // Inventory Levels state
  const [inventory, setInventory] = useState([
    { name: 'Surgical Nitrile Gloves (M)', type: 'Consumable', stock: 12, minStock: 25, unit: 'Boxes', status: 'Low Stock' },
    { name: 'Sterile IV Infusion Sets', type: 'Consumable', stock: 48, minStock: 30, unit: 'Units', status: 'Good' },
    { name: 'N95 Respirator Masks', type: 'Consumable', stock: 8, minStock: 15, unit: 'Boxes', status: 'Low Stock' },
    { name: 'Disposable Syringes 5ml', type: 'Consumable', stock: 110, minStock: 50, unit: 'Units', status: 'Good' },
    { name: 'Sterile Gauze Roll 10cm', type: 'Consumable', stock: 15, minStock: 20, unit: 'Rolls', status: 'Reorder Pending' }
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
      setWardPatients(prev => prev.map(p => {
        if (p.id === activePatient.id) {
          return { ...p, vitals: newVitalsObj };
        }
        return p;
      }));
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

          if (allergyMatch) {
            setScanState('allergy_alert');
          } else {
            setScanState('verified');
            // Auto administration log
            setTimeout(() => {
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
  }, [activePatient, vitalInputs, wardPatients]);

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
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verified' | 'allergy_alert' | 'success'>('idle');
  const [activeScanMed, setActiveScanMed] = useState<any>(null);

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

    setWardPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        return {
          ...p,
          vitals: newVitalsObj
        };
      }
      return p;
    }));

    triggerToast('Vitals Saved', `Logged vitals successfully for Bed #${activePatient.bedNo}.`, 'success');
    setVitalInputs({ bp: '', pulse: '', temp: '', spo2: '', resp: '', gcs: '15', pain: '0', bloodSugar: '' });
  };

  // Barcode Scan Verification trigger
  const handleMedScanVerification = (med: any) => {
    setActiveScanMed(med);
    setScanState('scanning');
    setShowScanModal(true);

    setTimeout(() => {
      // Simulate checking patient allergies
      const allergyMatch = activePatient.allergies.some(al => 
        med.name.toLowerCase().includes(al.toLowerCase()) || 
        (al.toLowerCase() === 'sulfa drugs' && med.name.toLowerCase().includes('sulfa'))
      );

      if (allergyMatch) {
        setScanState('allergy_alert');
      } else {
        setScanState('verified');
      }
    }, 2000);
  };

  const confirmMedAdministration = () => {
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
    triggerToast('Handover Successful', 'Shift handover report saved and sent to Ward Sister.', 'success');
    setRecordedHandoverText('');
    setSignaturePaths([]);
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${isDarkMode ? 'bg-[#090d16] text-white' : 'bg-[#f4f7fc] text-[#002068]'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-72 flex flex-col justify-between border-r ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} p-4`}>
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
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
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ward Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('ward')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ward'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Ward Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Patient Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('vitals')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Vitals Module</span>
            </button>

            <button
              onClick={() => setActiveTab('medication')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'medication'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Medication Verification</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Doctor Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Task Management</span>
            </button>

            <button
              onClick={() => setActiveTab('handover')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'handover'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <FileSignature className="w-4 h-4" />
              <span>Shift Handover</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Ward Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Secure Messaging</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/30">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Nurse Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-xs font-black">{nurseName}</h4>
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
        <header className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'bg-[#0b0f1a] border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-black tracking-tight">{assignedWard}</h1>
              <p className="text-xs text-gray-400 font-semibold">{nurseShift}</p>
            </div>
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-600/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[10px] font-bold">
              <Wifi className="w-3.5 h-3.5" />
              <span>SECURE ABHA GATEWAY SYNCED</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Language Toggle */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-0.5">
              {(['en', 'mr', 'hi'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    lang === l ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-gray-300 hover:text-white cursor-pointer transition-all"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Clock display */}
            <div className="text-right text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hidden sm:block">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </header>

        {/* Inner Tab Controller */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick statistics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assigned Beds</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-emerald-500">4</span>
                    <span className="text-xs text-gray-400">/ 10 Occupied</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Meds</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-orange-500">3</span>
                    <span className="text-xs text-gray-400">Doses Due Now</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Critical Alerts</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-red-500">1</span>
                    <span className="text-xs text-gray-400">Active Warning</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tasks Pending</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-blue-500">5</span>
                    <span className="text-xs text-gray-400">In Shift Checklist</span>
                  </div>
                </div>
              </div>

              {/* Central Layout columns: Ward overview status + clinical notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Ward Grid layout */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-sm">Ward 4B Bed Grid View</h3>
                      <p className="text-[11px] text-gray-400">Interactive live status monitor</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('ward')}
                      className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center space-x-1"
                    >
                      <span>Full layout view</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {wardPatients.map(wp => (
                      <div
                        key={wp.id}
                        onClick={() => {
                          setSelectedPatientId(wp.id);
                          setActiveTab('patients');
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-28 relative overflow-hidden ${
                          selectedPatientId === wp.id
                            ? 'bg-emerald-600/10 border-emerald-500'
                            : wp.priority === 'Emergency'
                            ? 'bg-red-650/10 border-red-500/30'
                            : wp.priority === 'Urgent'
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : isDarkMode
                            ? 'bg-slate-900 border-slate-800'
                            : 'bg-slate-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-gray-400">{wp.bedNo}</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            wp.priority === 'Emergency'
                              ? 'bg-red-500 animate-ping'
                              : wp.priority === 'Urgent'
                              ? 'bg-orange-500'
                              : 'bg-emerald-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black truncate">{wp.name}</h4>
                          <p className="text-[9px] text-gray-400 truncate">{wp.diagnosis}</p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[9px] font-bold text-emerald-500">{wp.vitals.pulse} BPM</span>
                          <span className="text-[9px] text-gray-400">{wp.vitals.spo2}% SpO2</span>
                        </div>
                      </div>
                    ))}

                    {/* Available Bed Placeholder */}
                    <div className={`p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center h-28 ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-gray-200 bg-gray-50/50'
                    }`}>
                      <Plus className="w-5 h-5 text-gray-500 mb-1" />
                      <span className="text-[10px] font-black text-gray-400">Bed 405</span>
                      <span className="text-[9px] text-emerald-500 font-bold">AVAILABLE</span>
                    </div>

                    {/* Cleaning Needed Placeholder */}
                    <div className={`p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center h-28 ${
                      isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-gray-200 bg-gray-50/50'
                    }`}>
                      <RefreshCw className="w-5 h-5 text-amber-500 mb-1 animate-spin" />
                      <span className="text-[10px] font-black text-gray-400">Bed 406</span>
                      <span className="text-[9px] text-amber-500 font-bold">CLEANING</span>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Sidebar Warnings */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h3 className="font-extrabold text-sm">AI Clinical Assistant</h3>
                      <p className="text-[10px] text-gray-400">Real-time telemetry scan</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-red-650/10 border border-red-500/20 text-xs space-y-1">
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
                        className="text-[10px] font-black text-red-400 hover:text-red-300 mt-2 flex items-center space-x-1"
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
                        className="text-[10px] font-black text-orange-400 hover:text-orange-300 mt-2 flex items-center space-x-1"
                      >
                        <span>Open Med verification</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Down row: Shift handover checklist + communication widget */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Active Ward Tasks checklist */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-sm">Shift Task Management</h3>
                    <button 
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-bold text-emerald-500 hover:text-emerald-400"
                    >
                      View all checklist items
                    </button>
                  </div>

                  <div className="space-y-2">
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
                          triggerToast('Task State Updated', `"${t.title}" toggled.`, 'info');
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          t.completed 
                            ? 'bg-slate-900/40 border-slate-800 text-gray-500 line-through' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            t.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
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

                {/* Shift Handover Report generator widget */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm">Automated Shift Handover</h3>
                    <p className="text-xs text-gray-400">Compile patient summaries and clinical events for the incoming shift supervisor.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-emerald-400">PREPARED HANDOVER REPORT</span>
                      <span className="text-[10px] text-gray-400 font-mono">Size: 4.8 KB</span>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-3">
                      Shift Summary: Orthopedic Ward 4B contains 4 active occupied beds. Ramesh Joshi Septic Arthritis requires strict 2-hour monitoring due to SpO2 drop. Rahul Patil knee dressing successfully updated...
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('handover')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Proceed to Sign & Handover</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: WARD OVERVIEW LAYOUT */}
          {activeTab === 'ward' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black">Ward Layout Map</h2>
                  <p className="text-xs text-gray-400">Physical bed matrix and occupancy index</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span>4 Occupied</span>
                  <span className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-2" />
                  <span>2 Available</span>
                </div>
              </div>

              {/* Physical Floor Grid layout simulation */}
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} grid grid-cols-1 md:grid-cols-3 gap-6`}>
                
                {/* Room 4 Card */}
                <div className="border border-slate-800 bg-slate-900/50 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-black">Orthopedic Room 4</span>
                    <span className="text-[10px] text-gray-500">General ward</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {wardPatients.filter(wp => wp.roomNo === 'Room 4').map(wp => (
                      <div 
                        key={wp.id}
                        onClick={() => {
                          setSelectedPatientId(wp.id);
                          setActiveTab('patients');
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:bg-slate-800 ${
                          selectedPatientId === wp.id ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-emerald-400">{wp.bedNo}</span>
                          <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-gray-400">{wp.priority}</span>
                        </div>
                        <h4 className="text-xs font-black mt-2">{wp.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 truncate">{wp.diagnosis}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room 5 (Isolation / High Risk Room) */}
                <div className="border border-slate-800 bg-slate-900/50 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-black">Room 5 (Isolation & Triage)</span>
                    <span className="text-[10px] text-red-400 font-bold">HIGH RISK ZONE</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {wardPatients.filter(wp => wp.roomNo === 'Room 5').map(wp => (
                      <div 
                        key={wp.id}
                        onClick={() => {
                          setSelectedPatientId(wp.id);
                          setActiveTab('patients');
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:bg-slate-800 ${
                          selectedPatientId === wp.id 
                            ? 'bg-emerald-600/10 border-emerald-500' 
                            : wp.priority === 'Emergency' 
                            ? 'bg-red-650/10 border-red-500/20' 
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-red-400">{wp.bedNo}</span>
                          <span className="text-[9px] bg-red-650/20 px-2 py-0.5 rounded text-red-400 font-bold">{wp.priority}</span>
                        </div>
                        <h4 className="text-xs font-black mt-2">{wp.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 truncate">{wp.diagnosis}</p>
                        
                        {wp.vitals.spo2 < 95 && (
                          <div className="mt-3 flex items-center space-x-2 text-[10px] text-red-400 animate-pulse font-bold bg-red-600/5 p-1 rounded">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Deteriorating: SpO2 {wp.vitals.spo2}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room 6 (Empty Beds / Admission holding) */}
                <div className="border border-slate-800 bg-slate-900/50 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-black">Room 6 (Holding Area)</span>
                    <span className="text-[10px] text-emerald-400 font-bold">2 FREE BEDS</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-xl border border-dashed border-slate-850 flex flex-col items-center justify-center text-center h-28 bg-slate-950/20">
                      <Plus className="w-6 h-6 text-slate-700 mb-1" />
                      <span className="text-[10px] font-black text-slate-400">Bed 405</span>
                      <span className="text-[9px] text-emerald-500 font-bold">AVAILABLE FOR ADMISSION</span>
                    </div>

                    <div className="p-4 rounded-xl border border-dashed border-slate-850 flex flex-col items-center justify-center text-center h-28 bg-slate-950/20">
                      <RefreshCw className="w-6 h-6 text-amber-500/80 mb-1 animate-spin" />
                      <span className="text-[10px] font-black text-slate-400">Bed 406</span>
                      <span className="text-[9px] text-amber-500 font-bold">CLEANING & SANITIZATION IN PROGRESS</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: PATIENT PROFILE DETAIL */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-600">
                    <img 
                      src={activePatient.name === 'Rahul Anil Patil' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'}
                      alt="Patient Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{activePatient.name}</h2>
                    <p className="text-xs text-gray-400">{activePatient.age} Y / {activePatient.gender} • ABHA Address: {activePatient.name.toLowerCase().replace(/\s/g, '')}@abha</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('vitals')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Log Vitals
                  </button>
                  <button 
                    onClick={() => setActiveTab('medication')}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Medication Pad
                  </button>
                </div>
              </div>

              {/* Details sections columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Clinical Stats & vitals index */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-6`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Active Vitals Intake</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] text-gray-500 font-bold">BLOOD PRESSURE</p>
                      <p className="text-base font-black mt-1 text-white">{activePatient.vitals.bp} mmHg</p>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] text-gray-500 font-bold">HEART RATE</p>
                      <p className="text-base font-black mt-1 text-emerald-500">{activePatient.vitals.pulse} BPM</p>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] text-gray-500 font-bold">OXYGEN SATURATION</p>
                      <p className={`text-base font-black mt-1 ${activePatient.vitals.spo2 < 94 ? 'text-red-500' : 'text-emerald-400'}`}>{activePatient.vitals.spo2}% SpO2</p>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] text-gray-500 font-bold">TEMPERATURE</p>
                      <p className={`text-base font-black mt-1 ${activePatient.vitals.temp > 100 ? 'text-red-400' : 'text-white'}`}>{activePatient.vitals.temp} °F</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-red-650/10 border border-red-500/20 text-xs">
                    <span className="font-black text-[10px] text-red-500 block uppercase">Allergies & Warnings</span>
                    <p className="text-gray-300 mt-1">{activePatient.allergies.length > 0 ? activePatient.allergies.join(', ') : 'No drug allergies reported.'}</p>
                  </div>
                </div>

                {/* Treatment plan & Medications */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-6 lg:col-span-2`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Active Prescribed Medications</h3>

                  <div className="space-y-3">
                    {activePatient.medications.map((m, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{m.route}</span>
                          <h4 className="text-xs font-black text-white">{m.name}</h4>
                          <p className="text-[10px] text-gray-400">Dosage: {m.dose} • Due: {m.time}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            m.status === 'Administered' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {m.status}
                          </span>
                          {m.status === 'Pending' && (
                            <button
                              onClick={() => handleMedScanVerification(m)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
            </div>
          )}

          {/* TAB 4: VITALS ENTRY MODULE */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Vitals Logging Panel</h2>
                <p className="text-xs text-gray-400">Log vitals parameters for {activePatient.name} (Bed #{activePatient.bedNo})</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form fields */}
                <form onSubmit={submitVitals} className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Blood Pressure (mmHg) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 120/80" 
                        value={vitalInputs.bp}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, bp: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Pulse Rate (BPM) *</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 72" 
                        value={vitalInputs.pulse}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, pulse: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Temperature (°F) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 98.6" 
                        value={vitalInputs.temp}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, temp: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Oxygen Saturation (% SpO2)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 98" 
                        value={vitalInputs.spo2}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, spo2: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Respiration Rate (breaths/min)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 16" 
                        value={vitalInputs.resp}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, resp: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Glasgow Coma Scale (GCS)</label>
                      <select 
                        value={vitalInputs.gcs}
                        onChange={(e) => setVitalInputs({ ...vitalInputs, gcs: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="15">15 - Fully Awake</option>
                        <option value="14">14 - Mild Confusion</option>
                        <option value="13">13 - Moderate Confusion</option>
                        <option value="9">9 - Severe Comatose State</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-98"
                  >
                    Save Vitals & Sync to ABHA Record
                  </button>
                </form>

                {/* EWS scorecard */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">EWS Scorecard</h3>

                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
                    <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${
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
                      <h4 className="text-xs font-black">
                        {calculateEWS(vitalInputs) >= 5 
                          ? 'Deterioration warning' 
                          : calculateEWS(vitalInputs) >= 2 
                          ? 'Moderate observation risk' 
                          : 'Patient status: Stable'}
                      </h4>
                      <p className="text-[10px] text-gray-400 px-4">
                        Early Warning Score calculated automatically from pulse rate, oxygen levels, respiration, and temperature inputs.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: MEDICATION VERIFICATION & SCANNING */}
          {activeTab === 'medication' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black">Barcoded Medication Verification</h2>
                  <p className="text-xs text-gray-400">Scan patient barcode and prescription vials to avoid administration error</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active patient schedule list */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Today's Schedule for {activePatient.name}</h3>

                  <div className="space-y-3">
                    {activePatient.medications.map((med, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-gray-400 font-bold uppercase">{med.route}</span>
                          <h4 className="text-xs font-black">{med.name}</h4>
                          <p className="text-[10px] text-gray-400">Dose: {med.dose} • Timing: {med.time}</p>
                        </div>
                        <div>
                          {med.status === 'Pending' ? (
                            <button
                              onClick={() => handleMedScanVerification(med)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>Double Verify & Scan</span>
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-600/10 px-3 py-1 rounded-full flex items-center space-x-1">
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
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Double-Verification Index</h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <h4 className="font-black">Right Patient Profile</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Wristband ABHA QR code scan verifies unique identity index.</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <h4 className="font-black">Right Medicine & Dose</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Scanning drug label cross-verifies prescription orders.</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <h4 className="font-black">Allergy Interaction warning</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Safety algorithm flags matching allergic contraindications.</p>
                      </div>
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

              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-red-650/20 text-red-400 px-2 py-0.5 rounded font-black uppercase">URGENT</span>
                      <h4 className="text-xs font-black">IV Paracetamol 1g Slow Infusion</h4>
                      <p className="text-[10px] text-gray-400">Ordered by Dr. Anil Patil • Bed 403 Ramesh Joshi • For high fever spike</p>
                    </div>
                    <button
                      onClick={() => {
                        triggerToast('Order Completed', 'Logged IV antipyretic delivery.', 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Complete Order
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-slate-800 text-gray-400 px-2 py-0.5 rounded font-black uppercase">ROUTINE</span>
                      <h4 className="text-xs font-black">Post-op Range of Motion (ROM) assessment</h4>
                      <p className="text-[10px] text-gray-400">Ordered by Dr. Anil Patil • Bed 401 Rahul Patil • Post-op knee rehabilitation</p>
                    </div>
                    <button
                      onClick={() => {
                        triggerToast('Order Completed', 'ROM rehabilitation log updated.', 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
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

              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
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
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          t.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                        }`}>
                          {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-bold ${t.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{t.title}</h4>
                          <p className="text-[10px] text-gray-400">Target Time: {t.due} • Patient: {activePatient.name}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-gray-400'
                      }`}>
                        {t.priority}
                      </span>
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
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">AI Verbal Scribe</h3>
                    <p className="text-xs text-gray-400">Press record and summarize the shift verbally. The AI Assistant will auto-parse the summary into structured EMR notes.</p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                    <button
                      type="button"
                      onClick={toggleHandoverVoiceRecorder}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isRecordingHandover 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
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
                        className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 mt-4 leading-relaxed"
                      />
                    )}
                  </div>

                  {/* Handover summary checklist */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-xs space-y-2">
                    <span className="font-black text-[10px] text-emerald-400 block uppercase">AUTO-COMPILED OUTCOMES:</span>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>Total ward occupancy monitored: 4 Active cases.</li>
                      <li>Bed 403 Ramesh Joshi septic arthritis temperature logged at 101.2 F.</li>
                      <li>All routine medication doses successfully verified against ABHA logs.</li>
                    </ul>
                  </div>
                </div>

                {/* Digital Signature card */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Shift Handover Sign-off</h3>
                    <p className="text-xs text-gray-400">Provide signature below to authorize the transfer of ward duties.</p>
                  </div>

                  {/* Draw Signature Canvas */}
                  <div className="relative border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden h-44 flex items-center justify-center">
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
                          stroke={isDarkMode ? '#ffffff' : '#002068'}
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
                        className="absolute bottom-2 right-2 bg-slate-800 text-gray-400 p-2 rounded-lg text-[9px] hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    onClick={submitHandoverReport}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Authorize Duty Shift Transfer</span>
                  </button>
                </div>

              </div>

              {/* Handover summary log history */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Shift Handover Audit Records</h3>
                <div className="space-y-3">
                  {handoverLogs.map(hl => (
                    <div key={hl.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-emerald-400">{hl.date}</span>
                        <p className="text-xs text-gray-300 leading-relaxed">{hl.summary}</p>
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

              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                <div className="space-y-3">
                  {inventory.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase">{item.type}</span>
                        <h4 className="text-xs font-black">{item.name}</h4>
                        <p className="text-[10px] text-gray-400">Stock: {item.stock} {item.unit} (Min Threshold: {item.minStock} {item.unit})</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          item.status === 'Good' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
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
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
                <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Active Channels</h3>
                  <div className="space-y-2">
                    {(['Dr. Patil', 'Pharmacy'] as const).map(th => (
                      <div
                        key={th}
                        onClick={() => setActiveChatThread(th)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          activeChatThread === th ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-950 border-slate-850 hover:bg-slate-900'
                        }`}
                      >
                        <h4 className="text-xs font-black">{th}</h4>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {messages.filter(m => m.thread === th).slice(-1)[0]?.text || 'No messages.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages pane */}
                <div className={`lg:col-span-2 p-4 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} flex flex-col justify-between h-full`}>
                  
                  {/* Message dialogue bubble */}
                  <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-4">
                    {messages.filter(m => m.thread === activeChatThread).map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                          msg.sender === 'You'
                            ? 'bg-emerald-600/15 border border-emerald-500/20 text-emerald-100 ml-auto'
                            : 'bg-slate-900 border border-slate-800 text-gray-200'
                        }`}
                      >
                        <p className="font-semibold text-[9px] text-emerald-400 mb-0.5">{msg.sender}</p>
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
                    className="flex items-center space-x-2 pt-3 border-t border-slate-800"
                  >
                    <input 
                      type="text"
                      placeholder="Type secure message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl transition-all cursor-pointer"
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

              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-6`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-850">
                    <div>
                      <h4 className="text-xs font-black">Biometric Verification Authorization</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Require fingerprint signature to authorize medications.</p>
                    </div>
                    <span className="w-12 h-6 rounded-full bg-emerald-600 flex items-center justify-end p-0.5 cursor-pointer">
                      <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-850">
                    <div>
                      <h4 className="text-xs font-black">High Contrast Night-mode</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Adapt screen colors to zero glare for dark ward settings.</p>
                    </div>
                    <span className="w-12 h-6 rounded-full bg-emerald-600 flex items-center justify-end p-0.5 cursor-pointer">
                      <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="text-xs font-black">Nurse ID Badging Sync</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Sync RFID badge with Android tablet bluetooth.</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">CONNECTED</span>
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
                isDarkMode ? 'bg-[#0f1524] border-slate-850 text-white' : 'bg-white border-gray-150 text-[#002068]'
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm">Medication Barcode Scan</h3>
                <button onClick={() => setShowScanModal(false)} className="text-gray-400 hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {scanState === 'scanning' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center border-2 border-emerald-500 animate-pulse">
                    <QrCode className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">Simulating Barcode Laser Scanner</h4>
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
                      className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 py-3.5 rounded-xl font-bold text-xs cursor-pointer text-center"
                    >
                      Override / Cancel
                    </button>
                  </div>
                </div>
              )}

              {scanState === 'verified' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-black">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>DOUBLE VERIFICATION MATCHED</span>
                    </div>
                    <p className="text-gray-300">
                      Scanning verified: <strong>{activeScanMed.name}</strong> is correctly prescribed for <strong>{activePatient.name}</strong> (Bed {activePatient.bedNo}). All safety checks passed.
                    </p>
                  </div>

                  <button
                    onClick={confirmMedAdministration}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Confirm Dose Administration
                  </button>
                </div>
              )}

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
              isDarkMode ? 'bg-[#0f1524] border-slate-800 text-white' : 'bg-white border-gray-200 text-[#002068]'
            }`}
          >
            <div className={`p-2 rounded-xl ${
              toast.type === 'alert' ? 'bg-red-500/10 text-red-500' : toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {toast.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : toast.type === 'success' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-black">{toast.title}</h5>
              <p className="text-[11px] text-gray-400 leading-normal mt-0.5">{toast.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
