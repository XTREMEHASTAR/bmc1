import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  FileText, 
  Wallet, 
  User, 
  Bell, 
  ChevronRight, 
  ArrowRight, 
  LogOut, 
  HeartPulse, 
  ShieldCheck, 
  Shield,
  Check, 
  Activity, 
  Smartphone, 
  AlertTriangle,
  Info,
  X,
  Plus,
  Moon,
  Sun,
  Video,
  Volume2,
  VolumeX,
  VideoOff,
  PhoneOff,
  MessageSquare,
  ClipboardList,
  Building,
  Brain,
  Globe,
  Server,
  FlaskConical,
  Tv,
  Layers,
  Pill,
  Siren,
  Scissors,
  FileCheck,
  Sparkles,
  Briefcase
} from 'lucide-react';

import Onboarding from './components/Onboarding';
import WalletTab from './components/WalletTab';
import HealthRecordsTab from './components/HealthRecordsTab';
import EmergencySOSTab from './components/EmergencySOSTab';
import BookAppointmentFlow from './components/BookAppointmentFlow';
import LiveQueueStatus from './components/LiveQueueStatus';
import DoctorDashboard from './components/DoctorDashboard';
import NurseDashboard from './components/NurseDashboard';
import ReceptionPortal from './components/ReceptionPortal';
import CommandCenterTab from './components/CommandCenterTab';
import AICopilotWorkspace from './components/AICopilotWorkspace';
import LaboratoryDashboard from './components/LaboratoryDashboard';
import RadiologyDashboard from './components/RadiologyDashboard';
import PharmacyDashboard from './components/PharmacyDashboard';
import EmergencyCareDashboard from './components/EmergencyCareDashboard';
import SurgeryDashboard from './components/SurgeryDashboard';
import ICUDashboard from './components/ICUDashboard';
import GovernmentHealthIntelligence from './components/GovernmentHealthIntelligence';
import MedicalResearchDashboard from './components/MedicalResearchDashboard';
import CyberSecurityDashboard from './components/CyberSecurityDashboard';
import IntegrationHubDashboard from './components/IntegrationHubDashboard';
import DevOpsDashboard from './components/DevOpsDashboard';
import QualityEngineeringDashboard from './components/QualityEngineeringDashboard';
import Vision2035Dashboard from './components/Vision2035Dashboard';
import PMODashboard from './components/PMODashboard';
import VoiceAssistantOverlay from './components/VoiceAssistantOverlay';





import { 
  HOSPITALS, 
  DEPARTMENTS, 
  DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_RECORDS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS 
} from './data';
import { Appointment, HealthRecord, Transaction, NotificationItem, Patient } from './types';

export default function App() {
  // Navigation & Core States
  const [portal, setPortal] = useState<'doctor' | 'patient' | 'nurse' | 'reception' | 'command' | 'ai' | 'laboratory' | 'radiology' | 'pharmacy' | 'emergency' | 'surgery' | 'icu' | 'gov' | 'research' | 'security' | 'integration' | 'devops' | 'quality' | 'vision' | 'pmo'>('doctor');
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Listen for portal change events dispatched by the Voice OS
  useEffect(() => {
    const handlePortalChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPortal(customEvent.detail as any);
      }
    };
    window.addEventListener('mcgm-portal-change', handlePortalChange);
    return () => {
      window.removeEventListener('mcgm-portal-change', handlePortalChange);
    };
  }, []);

  // Voice OS: dark mode toggle event
  useEffect(() => {
    const handleToggleDark = () => setIsDarkMode((prev: boolean) => !prev);
    window.addEventListener('mcgm-toggle-dark-mode', handleToggleDark);
    return () => window.removeEventListener('mcgm-toggle-dark-mode', handleToggleDark);
  }, []);

  // Voice OS: logout event
  useEffect(() => {
    const handleLogout = () => setPortal('login' as any);
    window.addEventListener('mcgm-logout', handleLogout);
    return () => window.removeEventListener('mcgm-logout', handleLogout);
  }, []);

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'wallet' | 'sos' | 'profile'>('home');
  const [isBookingFlow, setIsBookingFlow] = useState(false);
  
  // User Profile States
  const [language, setLanguage] = useState('en');
  const [aadhaarNo, setAadhaarNo] = useState<string | null>(null);
  const [isAadhaarLinked, setIsAadhaarLinked] = useState(false);
  const [userName, setUserName] = useState('Rahul Patil');
  const [userGender, setUserGender] = useState('Male');
  const [userAge, setUserAge] = useState('28');
  const [userBloodGroup, setUserBloodGroup] = useState('O Positive');

  // Interactive Live Statuses
  const [walletBalance, setWalletBalance] = useState(2450.00);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [records, setRecords] = useState<HealthRecord[]>(INITIAL_RECORDS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Lifted Patient Queue (Doctor OPD patients list)
  const [patients, setPatients] = useState<Patient[]>([
    { id: '1', token: 'OPD1234', name: 'Rahul Anil Patil', age: 32, gender: 'Male', waitTime: 22, priority: 'Routine', diagnosis: 'Osteoarthritis Knee', status: 'Waiting', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '2', token: 'OPD1235', name: 'Suresh Kumar', age: 45, gender: 'Male', waitTime: 32, priority: 'Routine', diagnosis: 'Lower Back Pain', status: 'Waiting', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '3', token: 'OPD1236', name: 'Ayesha Shaikh', age: 28, gender: 'Female', waitTime: 45, priority: 'Routine', diagnosis: 'Shoulder Pain', status: 'Waiting', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '4', token: 'OPD1237', name: 'Mahesh Jadhav', age: 50, gender: 'Male', waitTime: 12, priority: 'Emergency', diagnosis: 'Fracture Left Ankle', status: 'Waiting', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '5', token: 'OPD1238', name: 'Priya Singh', age: 30, gender: 'Female', waitTime: 75, priority: 'Urgent', diagnosis: 'Rheumatoid Arthritis', status: 'Waiting', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '6', token: 'OPD1239', name: 'Imran Khan', age: 41, gender: 'Male', waitTime: 90, priority: 'Routine', diagnosis: 'Gouty Arthritis', status: 'Completed', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '7', token: 'OPD1240', name: 'Kavita Patel', age: 35, gender: 'Female', waitTime: 105, priority: 'Routine', diagnosis: 'Cervical Spondylosis', status: 'Completed', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150' }
  ]);

  // Active sub-views
  const [activeLiveQueueAppt, setActiveLiveQueueAppt] = useState<Appointment | null>(null);
  const [showNotificationsView, setShowNotificationsView] = useState(false);
  const [showABHADialog, setShowABHADialog] = useState(false);

  // Live Teleconsultation Simulation States
  const [showTeleconsultView, setShowTeleconsultView] = useState(false);
  const [teleconsultStep, setTeleconsultStep] = useState<'connecting' | 'active' | 'completed'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [teleconsultMessages, setTeleconsultMessages] = useState<Array<{ sender: 'doctor' | 'patient'; text: string; time: string }>>([]);

  // Simulation interactive stats
  const [heartRate, setHeartRate] = useState(72);
  const [heartbeatActive, setHeartbeatActive] = useState(false);

  // Heartbeat pulse simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeatActive(true);
      setHeartRate(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newRate = prev + change;
        return newRate > 80 ? 76 : newRate < 65 ? 68 : newRate;
      });
      setTimeout(() => setHeartbeatActive(false), 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Listen for portal changes from Voice Assistant
  useEffect(() => {
    const handlePortalChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPortal(customEvent.detail);
      }
    };
    window.addEventListener('mcgm-portal-change', handlePortalChange);
    return () => window.removeEventListener('mcgm-portal-change', handlePortalChange);
  }, []);

  // Listen for patient-specific voice commands / events
  useEffect(() => {
    const handlePatientTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as any);
      }
    };
    const handlePatientBookOPD = () => {
      setIsBookingFlow(true);
    };
    const handlePatientViewABHA = () => {
      setShowABHADialog(true);
    };
    const handlePatientTeleconsult = () => {
      setShowTeleconsultView(true);
      setTeleconsultStep('connecting');
      setTeleconsultMessages([
        { sender: 'doctor', text: 'Namaskar Rahul. Connecting secure video feed...', time: 'Just Now' }
      ]);
      setTimeout(() => {
        setTeleconsultStep('active');
        setTimeout(() => {
          setTeleconsultMessages(prev => [
            ...prev,
            { sender: 'doctor', text: 'Namaskar. I am Dr. Sunita Deshmukh. How are you feeling today?', time: 'Just Now' }
          ]);
        }, 1500);
      }, 3000);
    };
    const handleChangeLanguage = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setLanguage(customEvent.detail);
      }
    };

    window.addEventListener('mcgm-patient-tab-change', handlePatientTabChange);
    window.addEventListener('mcgm-patient-book-opd', handlePatientBookOPD);
    window.addEventListener('mcgm-patient-view-abha', handlePatientViewABHA);
    window.addEventListener('mcgm-patient-teleconsult', handlePatientTeleconsult);
    window.addEventListener('mcgm-change-language', handleChangeLanguage);

    return () => {
      window.removeEventListener('mcgm-patient-tab-change', handlePatientTabChange);
      window.removeEventListener('mcgm-patient-book-opd', handlePatientBookOPD);
      window.removeEventListener('mcgm-patient-view-abha', handlePatientViewABHA);
      window.removeEventListener('mcgm-patient-teleconsult', handlePatientTeleconsult);
      window.removeEventListener('mcgm-change-language', handleChangeLanguage);
    };
  }, []);

  const handleOnboardingComplete = (lang: string, aadhaar: string | null) => {
    setLanguage(lang);
    if (aadhaar) {
      setAadhaarNo(aadhaar);
      setIsAadhaarLinked(true);
    }
    setIsFirstLaunch(false);
  };

  // Callback from Booking Flow
  const handleBookingComplete = (newAppt: Appointment, bookingFee: number) => {
    // Deduct from wallet
    setWalletBalance(prev => Math.max(0, prev - bookingFee));
    
    // Register transaction
    const newTx: Transaction = {
      id: 'tx_book_' + Date.now(),
      type: 'debit',
      title: `${newAppt.department.name} Consultation Fee`,
      dateStr: 'Just Now',
      amount: bookingFee,
      status: 'SUCCESS'
    };
    setTransactions([newTx, ...transactions]);

    // Add to appointments
    setAppointments([newAppt, ...appointments]);

    // Also add this patient to the doctor's live queue patients list
    const newQueuePatient: Patient = {
      id: 'p_book_' + Date.now(),
      token: newAppt.tokenNo,
      name: userName, // "Rahul Patil" / "Rahul Anil Patil"
      age: 32,
      gender: 'Male',
      waitTime: 0,
      priority: 'Routine',
      diagnosis: 'Follow-up Consultation request',
      status: 'Waiting',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150'
    };
    setPatients(prev => [...prev, newQueuePatient]);

    // Send push notification
    const newNotif: NotificationItem = {
      id: 'notif_book_' + Date.now(),
      type: 'appointment',
      title: 'OPD Ticket Confirmed',
      desc: `Your booking at ${newAppt.hospital.name} for ${newAppt.doctor.name} is confirmed. Token: ${newAppt.tokenNo}`,
      timeAgo: 'Just now',
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);

    // Exit flow
    setIsBookingFlow(false);
  };

  // Wallet Add Money handler
  const handleAddMoney = (amount: number) => {
    setWalletBalance(prev => prev + amount);

    // Register transaction
    const newTx: Transaction = {
      id: 'tx_add_' + Date.now(),
      type: 'credit',
      title: 'Wallet Refill (UPI Gateway)',
      dateStr: 'Just Now',
      amount: amount,
      status: 'COMPLETED'
    };
    setTransactions([newTx, ...transactions]);

    // Send notification
    const newNotif: NotificationItem = {
      id: 'notif_add_' + Date.now(),
      type: 'payment',
      title: 'Funds Added Successfully',
      desc: `₹${amount.toLocaleString('en-IN')} successfully credited to your medical wallet.`,
      timeAgo: 'Just now',
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Wallet Pay Bill handler
  const handlePayBill = (amount: number, billTitle: string) => {
    setWalletBalance(prev => Math.max(0, prev - amount));

    // Register transaction
    const newTx: Transaction = {
      id: 'tx_pay_' + Date.now(),
      type: 'debit',
      title: billTitle,
      dateStr: 'Just Now',
      amount: amount,
      status: 'SUCCESS'
    };
    setTransactions([newTx, ...transactions]);

    // Send notification
    const newNotif: NotificationItem = {
      id: 'notif_pay_' + Date.now(),
      type: 'payment',
      title: 'Bill Paid Successfully',
      desc: `Invoice payment of ₹${amount} for ${billTitle} completed.`,
      timeAgo: 'Just now',
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleAddCustomRecord = (newRec: HealthRecord) => {
    setRecords([newRec, ...records]);

    // Notification
    const newNotif: NotificationItem = {
      id: 'notif_rec_' + Date.now(),
      type: 'report',
      title: 'New Health Record Linked',
      desc: `"${newRec.title}" successfully added to your ABHA timeline.`,
      timeAgo: 'Just now',
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => {
    setIsFirstLaunch(true);
    setActiveTab('home');
    setAadhaarNo(null);
    setIsAadhaarLinked(false);
  };

  const renderPortalSwitcher = (current: string) => {
    const portals = [
      { id: 'patient', label: 'Patient Portal', icon: User, className: 'bg-[#FF9933] hover:bg-orange-600' },
      { id: 'doctor', label: 'Doctor Portal', icon: Activity, className: 'bg-[#003F8A] hover:bg-blue-800' },
      { id: 'nurse', label: 'Nurse Portal', icon: ClipboardList, className: 'bg-emerald-600 hover:bg-emerald-700' },
      { id: 'reception', label: 'Reception Desk', icon: Building, className: 'bg-purple-600 hover:bg-purple-700' },
      { id: 'command', label: 'Command Center', icon: Activity, className: 'bg-[#0f172a] hover:bg-slate-900', isPulse: true, iconClass: 'text-rose-500 animate-pulse' },
      { id: 'ai', label: 'AI Copilot', icon: Brain, className: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-90' },
      { id: 'laboratory', label: 'Lab Portal', icon: FlaskConical, className: 'bg-sky-600 hover:bg-sky-700' },
      { id: 'radiology', label: 'RIS/PACS Portal', icon: Tv, className: 'bg-slate-700 hover:bg-slate-800' },
      { id: 'pharmacy', label: 'Pharmacy Portal', icon: Pill, className: 'bg-[#008080] hover:bg-teal-700' },
      { id: 'emergency', label: 'Emergency OS', icon: Siren, className: 'bg-rose-600 hover:bg-rose-700', isPulse: true },
      { id: 'surgery', label: 'Surgical OS', icon: Scissors, className: 'bg-gradient-to-tr from-rose-600 to-amber-500 hover:opacity-90' },
      { id: 'icu', label: 'ICU OS', icon: HeartPulse, className: 'bg-gradient-to-tr from-violet-600 to-indigo-500 hover:opacity-90' },
      { id: 'gov', label: 'Gov Intel Grid', icon: ShieldCheck, className: 'bg-gradient-to-tr from-blue-700 via-cyan-800 to-indigo-700 hover:opacity-90' },
      { id: 'research', label: 'Research & Innovation', icon: Brain, className: 'bg-gradient-to-tr from-violet-700 via-purple-750 to-indigo-700 hover:opacity-90' },
      { id: 'security', label: 'Cyber Security & Trust', icon: Shield, className: 'bg-gradient-to-tr from-cyan-900 via-[#0c1322] to-slate-900 border border-cyan-800/40 hover:opacity-90' },
      { id: 'integration', label: 'Integration Backbone', icon: Globe, className: 'bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-850 hover:opacity-90' },
      { id: 'devops', label: 'DevOps & Infrastructure', icon: Server, className: 'bg-gradient-to-tr from-rose-900 via-[#0e0a13] to-slate-950 border border-rose-800/40 hover:opacity-90' },
      { id: 'quality', label: 'Quality & Validation', icon: FileCheck, className: 'bg-gradient-to-tr from-amber-900 via-[#100c14] to-slate-950 border border-amber-800/40 hover:opacity-90' },
      { id: 'vision', label: 'Vision 2035 Hub', icon: Sparkles, className: 'bg-gradient-to-tr from-cyan-900 via-[#0a111a] to-slate-950 border border-cyan-800/40 hover:opacity-90' },
      { id: 'pmo', label: 'PMO Deployment', icon: Briefcase, className: 'bg-gradient-to-tr from-indigo-900 via-[#0b0c15] to-slate-950 border border-indigo-800/40 hover:opacity-90' }
    ];

    return (
      <>
        <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {portals
            .filter(p => p.id !== current)
            .map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setPortal(p.id as any)}
                  title={p.label}
                  className={`${p.className} text-white font-bold text-[10px] px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-white/30 cursor-pointer flex-shrink-0`}
                >
                  <Icon className={`w-3.5 h-3.5 ${p.iconClass || ''} ${p.isPulse ? 'animate-pulse' : ''}`} />
                  <span className="whitespace-nowrap">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  if (isAppLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0b0f19] text-white' : 'bg-[#f7fafd] text-[#002068]'
      }`}>
        <div className="w-full max-w-md text-center space-y-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg relative ${
              isDarkMode ? 'bg-[#111827] border border-blue-900/30 text-blue-400' : 'bg-white text-[#002068]'
            }`}
          >
            {/* Pulsing glow ring */}
            <span className="absolute inset-0 rounded-2xl border-2 border-blue-500/30 animate-ping" />
            <span className="absolute inset-2 rounded-2xl border border-blue-500/20 animate-pulse" />
            
            <HeartPulse className="w-10 h-10 animate-pulse stroke-[2.5]" />
          </motion.div>
          
          <div className="space-y-2">
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-black tracking-widest uppercase"
            >
              MCGM Digital
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Secure Medical Hub
            </motion.p>
          </div>

          {/* Secure connection text loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center space-y-3 pt-4"
          >
            <div className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-1/2 bg-blue-500 rounded-full"
              />
            </div>
            <p className={`text-[10px] font-semibold tracking-wider uppercase animate-pulse ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Establishing Secure ABHA Session
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (portal !== 'patient') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        {portal === 'doctor' && (
          <DoctorDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
            patients={patients}
            setPatients={setPatients}
            appointments={appointments}
            setAppointments={setAppointments}
            records={records}
            setRecords={setRecords}
            notifications={notifications}
            setNotifications={setNotifications}
            setPortal={setPortal}
          />
        )}
        {portal === 'nurse' && (
          <NurseDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
            patients={patients}
            setPatients={setPatients}
            appointments={appointments}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        )}
        {portal === 'reception' && (
          <ReceptionPortal 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
            patients={patients}
            setPatients={setPatients}
            appointments={appointments}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        )}
        {portal === 'command' && <CommandCenterTab />}
        {portal === 'ai' && (
          <AICopilotWorkspace 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'laboratory' && (
          <LaboratoryDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'radiology' && (
          <RadiologyDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'pharmacy' && (
          <PharmacyDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'emergency' && (
          <EmergencyCareDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'surgery' && (
          <SurgeryDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'icu' && (
          <ICUDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'gov' && (
          <GovernmentHealthIntelligence 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'research' && (
          <MedicalResearchDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'security' && (
          <CyberSecurityDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'integration' && (
          <IntegrationHubDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'devops' && (
          <DevOpsDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'quality' && (
          <QualityEngineeringDashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'vision' && (
          <Vision2035Dashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        {portal === 'pmo' && (
          <PMODashboard 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
          />
        )}
        
        {/* Floating Portal Switcher */}
        {renderPortalSwitcher(portal)}

        {/* Global Voice Assistant Overlay */}
        <VoiceAssistantOverlay currentPortal={portal} isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (isFirstLaunch) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Onboarding onComplete={handleOnboardingComplete} />
        <VoiceAssistantOverlay currentPortal="patient" isDarkMode={isDarkMode} />
      </div>
    );
  }

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`min-h-screen bg-[#f7fafd] flex justify-center text-gray-800 antialiased font-sans ${isDarkMode ? 'dark' : ''}`}>
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl border-x border-gray-100 flex flex-col justify-between relative">
        
        {/* Core Header Navigation Bar */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-100 p-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#002068] flex items-center justify-center text-white">
              <span className="font-extrabold text-sm tracking-tighter">MC</span>
            </div>
            <div>
              <h1 className="text-xs font-black tracking-widest text-[#002068] uppercase">
                MCGM Digital
              </h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Dadar Central Hub</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell Badge */}
            <button
              onClick={() => setShowNotificationsView(true)}
              className="p-2 hover:bg-gray-50 rounded-xl relative transition-all"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Profile trigger */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full overflow-hidden border border-gray-200"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </header>

        {/* Dynamic Inner Main Content Panel */}
        <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {isBookingFlow ? (
              <motion.div
                key="booking"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <BookAppointmentFlow 
                  walletBalance={walletBalance} 
                  onBookingComplete={handleBookingComplete}
                  onCancel={() => setIsBookingFlow(false)}
                />
              </motion.div>
            ) : activeLiveQueueAppt ? (
              <motion.div
                key="queue"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <LiveQueueStatus 
                  appointment={activeLiveQueueAppt}
                  patients={patients}
                  onBack={() => setActiveLiveQueueAppt(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {/* Tab Home View */}
                {activeTab === 'home' && (
                  <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                        <span>Namaskar, {userName.split(' ')[0]}</span>
                        <span className="ml-2 animate-bounce origin-bottom-right">👋</span>
                      </h2>
                      <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mt-1">
                        Ayushman Bharat Digital Health (ABHA) Portal
                      </p>
                    </div>

                    {/* ABHA Patient Digital Identity Card */}
                    <div 
                      onClick={() => setShowABHADialog(true)}
                      className="bg-gradient-to-br from-[#002068] via-[#003399] to-[#0050cc] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-blue-400/20 active:scale-99"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
                      
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="inline-block text-[9px] font-extrabold bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Verified ABHA Card
                          </span>
                          <h3 className="font-extrabold text-base tracking-tight mt-1">{userName}</h3>
                          <p className="text-[10px] text-blue-100/90 font-mono">ID: 22-5401-8890-1234</p>
                        </div>

                        {/* Government hologram visual */}
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                          <ShieldCheck className="w-5 h-5 text-green-400 stroke-[2.5]" />
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-8 border-t border-white/10 pt-3">
                        <div className="text-[10px] text-blue-100">
                          <p className="opacity-75">Date of Birth</p>
                          <p className="font-bold">14 Oct 1998</p>
                        </div>
                        <span className="text-[10px] font-bold text-white hover:underline flex items-center">
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </div>
                    </div>

                    {/* Quick Hospital Action Grid (4 core actions) */}
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => setIsBookingFlow(true)}
                        className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center justify-between hover:border-gray-200 transition-all shadow-sm active:scale-95"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002068] mb-2">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold text-gray-800 leading-tight">Book OPD</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('records')}
                        className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center justify-between hover:border-gray-200 transition-all shadow-sm active:scale-95"
                      >
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-2">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold text-gray-800 leading-tight">My Records</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('wallet')}
                        className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center justify-between hover:border-gray-200 transition-all shadow-sm active:scale-95"
                      >
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-2">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold text-gray-800 leading-tight">My Wallet</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('sos')}
                        className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center justify-between hover:border-gray-200 transition-all shadow-sm active:scale-95"
                      >
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#ba1a1a] mb-2">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold text-gray-800 leading-tight">ER Dispatch</span>
                      </button>
                    </div>

                    {/* Live Teleconsultation / TeleHealth Banner */}
                    <div className="bg-gradient-to-r from-indigo-900 to-[#002068] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden border border-blue-500/20">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-6 -translate-y-6" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block text-[9px] font-extrabold bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            MCGM TeleHealth Live
                          </span>
                          <h3 className="font-extrabold text-base tracking-tight mt-2">Instant Doctor Teleconsult</h3>
                          <p className="text-[10px] text-indigo-200/90 mt-1">Connect with an on-duty MCGM physician over video.</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                          <Video className="w-5 h-5 text-indigo-300 animate-pulse" />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowTeleconsultView(true);
                          setTeleconsultStep('connecting');
                          setTeleconsultMessages([
                            { sender: 'doctor', text: 'Namaskar Rahul. Connecting secure video feed...', time: 'Just Now' }
                          ]);
                          setTimeout(() => {
                            setTeleconsultStep('active');
                            // Simulate doctor speech message
                            setTimeout(() => {
                              setTeleconsultMessages(prev => [
                                ...prev,
                                { sender: 'doctor', text: 'Namaskar. I am Dr. Sunita Deshmukh. I see your recent CBC blood report has slightly elevated platelets (460,000 cells/mm³). Are you experiencing any headaches, fatigue, or minor infections?', time: 'Just Now' }
                              ]);
                            }, 3000);
                          }, 2500);
                        }}
                        className="w-full bg-white text-[#002068] py-3.5 rounded-xl font-bold mt-4 hover:bg-indigo-50 active:scale-95 transition-all text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Start Video Consultation</span>
                      </button>
                    </div>

                    {/* Upcoming appointments list */}
                    {appointments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <h3 className="font-extrabold text-gray-900 text-sm tracking-wider uppercase">Active Appointments</h3>
                          <span className="text-xs font-bold text-gray-400">{appointments.length} active</span>
                        </div>

                        {appointments.map((appt) => (
                          <div
                            key={appt.id}
                            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-blue-50 text-[#0050cc] rounded-xl font-bold text-center min-w-[48px]">
                                  <p className="text-[10px] uppercase font-extrabold">{appt.dateStr.split(' ')[0].slice(0,3)}</p>
                                  <p className="text-sm font-black mt-0.5">{appt.dateStr.split(' ').pop()}</p>
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-xs">{appt.department.name} Consultation</h4>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{appt.hospital.name} • {appt.doctor.name}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">
                                {appt.status}
                              </span>
                            </div>

                            {/* Queue overview widget */}
                            <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                <span className="font-bold text-gray-700">Token {appt.tokenNo}</span>
                              </div>
                              <button
                                onClick={() => setActiveLiveQueueAppt(appt)}
                                className="text-[#0050cc] font-extrabold text-[11px] flex items-center hover:underline"
                              >
                                <span>Track Queue Position</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Medical Insights Area */}
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-gray-900 text-sm tracking-wider uppercase">Health Metrics</h3>
                      
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Heart Rate</p>
                          <div className="flex items-end space-x-1.5 mt-3">
                            <span className="text-3xl font-black text-gray-900">{heartRate}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">BPM</span>
                          </div>
                          
                          {/* Animated heartbeat wave */}
                          <div className={`absolute right-4 bottom-4 transition-all duration-300 ${
                            heartbeatActive ? 'scale-125 text-red-500' : 'text-[#ba1a1a]/40'
                          }`}>
                            <Activity className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</p>
                          <div className="flex items-end space-x-1 mt-3">
                            <span className="text-2xl font-black text-[#ba1a1a]">{userBloodGroup.split(' ')[0]}</span>
                            <span className="text-xs font-bold text-gray-500 mb-0.5">Rh+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Records View */}
                {activeTab === 'records' && (
                  <HealthRecordsTab records={records} onAddRecord={handleAddCustomRecord} />
                )}

                {/* Tab Wallet View */}
                {activeTab === 'wallet' && (
                  <WalletTab 
                    balance={walletBalance} 
                    transactions={transactions} 
                    onAddMoney={handleAddMoney}
                    onPayBill={handlePayBill}
                  />
                )}

                {/* Tab SOS View */}
                {activeTab === 'sos' && (
                  <EmergencySOSTab />
                )}

                {/* Tab Profile View */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Header profile display */}
                    <div className="flex flex-col items-center text-center py-4 border-b border-gray-100">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
                            alt="Rahul Patil Avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {isAadhaarLinked && (
                          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#002068] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-extrabold text-gray-900 text-lg mt-3">{userName}</h3>
                      <p className="text-xs text-gray-400">ID: MCGM-88219-R • Mumbai, MH</p>
                    </div>

                    {/* ABHA card widget */}
                    <div 
                      onClick={() => setShowABHADialog(true)}
                      className="p-4 border border-blue-100 bg-blue-50/30 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-[#002068]" />
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">Ayushman Bharat Digital ID</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">Show barcode & card details</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0050cc]" />
                    </div>

                    {/* Settings Menu lists */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Preferences</h4>
                      
                      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100 text-xs">
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">App Language</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Set language environment</p>
                          </div>
                          <span className="text-[11px] font-black uppercase text-[#002068] bg-[#002068]/5 px-2.5 py-1 rounded-full">
                            {language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'}
                          </span>
                        </div>

                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">Aadhaar Linked Identity</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">National identity verification</p>
                          </div>
                          {isAadhaarLinked ? (
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                              VERIFIED
                            </span>
                          ) : (
                            <button 
                              onClick={() => setIsFirstLaunch(true)}
                              className="text-xs font-bold text-[#0050cc] hover:underline"
                            >
                              Verify Aadhaar
                            </button>
                          )}
                        </div>

                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">Night Mode</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">High-contrast dark color scheme</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsDarkMode(prev => !prev)}
                            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 relative focus:outline-none ${
                              isDarkMode ? 'bg-[#0050cc]' : 'bg-gray-200'
                            }`}
                          >
                            <motion.div
                              layout
                              className="w-4.5 h-4.5 bg-white rounded-full shadow-md flex items-center justify-center"
                              animate={{ x: isDarkMode ? 20 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              {isDarkMode ? (
                                <Moon className="w-3 h-3 text-[#0050cc]" />
                              ) : (
                                <Sun className="w-3 h-3 text-amber-500" />
                              )}
                            </motion.div>
                          </button>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left p-4 flex items-center justify-between text-[#ba1a1a] hover:bg-red-50/50 transition-all font-bold cursor-pointer"
                        >
                          <span>Reset App Onboarding</span>
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Floating Bottom Nav Bar */}
        <nav className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-2 flex justify-between items-center z-40">
          {[
            { id: 'home' as const, label: 'Home', icon: Home },
            { id: 'records' as const, label: 'Records', icon: FileText },
            { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
            { id: 'sos' as const, label: 'SOS', icon: HeartPulse },
            { id: 'profile' as const, label: 'Profile', icon: User }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id && !isBookingFlow && !activeLiveQueueAppt;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setIsBookingFlow(false);
                  setActiveLiveQueueAppt(null);
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center p-2 transition-all cursor-pointer ${
                  isActive 
                    ? 'text-[#0050cc] scale-105' 
                    : tab.id === 'sos' 
                      ? 'text-[#ba1a1a] hover:text-[#ba1a1a]' 
                      : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <IconComponent className={`w-5.5 h-5.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Notifications Tray Overlay */}
        <AnimatePresence>
          {showNotificationsView && (
            <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between p-6"
              >
                <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-extrabold text-gray-900 text-base flex items-center space-x-2">
                      <span>Notifications</span>
                      <span className="text-xs bg-[#002068]/5 text-[#002068] px-2 py-0.5 rounded-full font-bold">
                        {unreadNotifCount} New
                      </span>
                    </h3>
                    <button onClick={() => setShowNotificationsView(false)} className="p-1 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          n.isRead ? 'bg-white border-gray-100' : 'bg-[#0050cc]/5 border-blue-100/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 text-xs">{n.title}</h4>
                          <span className="text-[9px] text-gray-400">{n.timeAgo}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      markAllNotificationsAsRead();
                      setShowNotificationsView(false);
                    }}
                    className="w-full bg-[#002068] text-white py-3.5 rounded-xl font-bold hover:bg-[#00164e] transition-all text-xs"
                  >
                    Mark All as Read
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ABHA Digital ID Card Detail dialog */}
        <AnimatePresence>
          {showABHADialog && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-6 border border-gray-100 shadow-2xl relative overflow-hidden"
              >
                <button
                  onClick={() => setShowABHADialog(false)}
                  className="absolute top-4 right-4 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-gray-900 text-base">ABHA Health Card</h3>
                  <p className="text-xs text-gray-400">Scan at the OPD kiosk for quick check-in</p>
                </div>

                {/* Simulated Digital barcode and QR */}
                <div className="bg-[#f7fafd] rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100 space-y-4">
                  <div className="w-36 h-36 border-4 border-white rounded-xl shadow-sm bg-white p-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                      alt="ABHA QR Code"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* barcode lines */}
                  <div className="w-full space-y-1 pt-1">
                    <div className="h-6 bg-gray-800 rounded flex space-x-1.5 overflow-hidden">
                      {/* Alternating black and white bars for barcode look */}
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-black" 
                          style={{ width: `${(i % 3 === 0 ? 8 : i % 2 === 0 ? 4 : 2)}px` }} 
                        />
                      ))}
                    </div>
                    <p className="text-[9px] text-gray-400 font-mono tracking-widest text-center mt-1">2254-0188-9012</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Card Status</span>
                    <span className="font-bold text-green-700">VERIFIED & ACTIVE</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">ABHA Address</span>
                    <span className="font-bold text-gray-800">rahulpatil@abha</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Linked Identity</span>
                    <span className="font-bold text-gray-800">Aadhaar (Ending *1189)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setToast({ title: 'Wallet Saved', message: 'Card buffered to your Apple/Google Wallet successfully!', type: 'success' });
                    setShowABHADialog(false);
                  }}
                  className="w-full bg-[#002068] text-white py-3.5 rounded-xl font-bold hover:bg-[#00164e] transition-all text-xs"
                >
                  Save to Google Wallet
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Teleconsultation Video Overlay */}
        <AnimatePresence>
          {showTeleconsultView && (
            <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col justify-between p-4 text-white">
              {teleconsultStep === 'connecting' ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-[#002068]/50 border-4 border-blue-500/30 flex items-center justify-center relative">
                    <span className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping" />
                    <Video className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold tracking-wide uppercase">Connecting to TeleHealth</h3>
                    <p className="text-xs text-gray-400">Securing end-to-end encrypted channel...</p>
                    <p className="text-[10px] text-gray-500 font-mono">Routing ID: WebRTC-MCGM-88219-R</p>
                  </div>
                </div>
              ) : teleconsultStep === 'active' ? (
                <div className="flex-1 flex flex-col justify-between relative h-full space-y-4">
                  {/* Doctor Video Area */}
                  <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center min-h-[300px]">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600&h=800" 
                      alt="Dr. Sunita Deshmukh" 
                      className="w-full h-full object-cover absolute inset-0"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Doctor Info Overlay */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs z-10">
                      <p className="font-bold">Dr. Sunita Deshmukh</p>
                      <p className="text-[10px] text-gray-300">General OPD • Sion Hospital</p>
                    </div>

                    {/* Vitals overlay */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs flex items-center space-x-2 z-10">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                      <span className="font-bold text-red-400">{heartRate} BPM</span>
                    </div>

                    {/* Local User Camera Viewport (Picture in Picture) */}
                    <div className="absolute bottom-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white bg-slate-850 shadow-lg z-10">
                      {!isCamOff ? (
                        <div className="w-full h-full relative">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=400" 
                            alt="Local User Preview" 
                            className="w-full h-full object-cover transform -scale-x-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-1 left-2 text-[9px] bg-black/40 px-1 rounded font-semibold">You</div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <VideoOff className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Doctor Messages & Prescription Panel */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4">
                    <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                      {teleconsultMessages.map((msg, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                            msg.sender === 'doctor' 
                              ? 'bg-blue-600/20 border border-blue-500/20 text-blue-100 mr-auto' 
                              : 'bg-slate-800 text-gray-200 ml-auto'
                          }`}
                        >
                          <p className="font-semibold text-[10px] text-blue-400 mb-0.5">
                            {msg.sender === 'doctor' ? 'Dr. Sunita Deshmukh' : 'You'}
                          </p>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Interactive chat inputs / replies */}
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Type reply to Doctor..." 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const val = e.currentTarget.value.trim();
                            setTeleconsultMessages(prev => [
                              ...prev,
                              { sender: 'patient', text: val, time: 'Just Now' }
                            ]);
                            e.currentTarget.value = '';
                            
                            // Doctor reply response simulation
                            setTimeout(() => {
                              setTeleconsultMessages(prev => [
                                ...prev,
                                { sender: 'doctor', text: 'I am prescribing a mild hydration fluid and recommending a follow-up CBC count in 10 days. I have linked the digital prescription to your ABHA health record profile. Please check the Records tab.', time: 'Just Now' }
                              ]);
                            }, 2000);
                          }
                        }}
                      />
                    </div>

                    {/* Call Actions Row */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => setIsMuted(prev => !prev)}
                          className={`p-3 rounded-full transition-all cursor-pointer ${
                            isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-750'
                          }`}
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => setIsCamOff(prev => !prev)}
                          className={`p-3 rounded-full transition-all cursor-pointer ${
                            isCamOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-750'
                          }`}
                        >
                          {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Doctor generates digital prescription action */}
                      <button
                        onClick={() => {
                          const docPrescription: HealthRecord = {
                            id: 'rec_tele_' + Date.now(),
                            title: 'OPD Pharmacy Prescription',
                            doctorName: 'Dr. Sunita Deshmukh',
                            source: 'MCGM TeleHealth Gateway',
                            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
                            type: 'PDF',
                            clinicalInterpretation: 'Patient advised to consume 2.5L fluids daily, rest well, and undergo an repeat complete blood count (CBC) in 10 days. Avoid vigorous exercise.'
                          };
                          handleAddCustomRecord(docPrescription);
                          setToast({ title: 'Prescription Synced', message: 'Prescription successfully generated and synced to your ABHA digital records locker!', type: 'success' });
                          setTeleconsultStep('completed');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer active:scale-95"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Issue e-Prescription</span>
                      </button>

                      <button 
                        onClick={() => setTeleconsultStep('completed')}
                        className="bg-[#ba1a1a] hover:bg-red-700 text-white p-3 rounded-full transition-all cursor-pointer active:scale-95"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border-4 border-green-500/30">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-white">Consultation Finished</h3>
                    <p className="text-xs text-gray-400 px-8 leading-relaxed">
                      Your consultation session with Dr. Sunita Deshmukh has ended. All prescriptions and referral tickets are linked to your ABHA account.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTeleconsultView(false);
                      setTeleconsultStep('connecting');
                      setActiveTab('records'); // auto navigate to records so they can see it!
                    }}
                    className="bg-[#002068] hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-xs transition-all w-full max-w-xs cursor-pointer active:scale-95"
                  >
                    Go to My Records
                  </button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Floating Portal Switcher — compact scrollable strip */}
        <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { portal: 'doctor',     label: 'Doctor',    Icon: Activity,      cls: 'bg-[#003F8A] hover:bg-blue-800' },
              { portal: 'nurse',      label: 'Nurse',     Icon: ClipboardList, cls: 'bg-emerald-600 hover:bg-emerald-700' },
              { portal: 'reception',  label: 'Reception', Icon: Building,      cls: 'bg-purple-600 hover:bg-purple-700' },
              { portal: 'ai',         label: 'AI Copilot',Icon: Brain,         cls: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500' },
              { portal: 'laboratory', label: 'Lab',       Icon: FlaskConical,  cls: 'bg-sky-600 hover:bg-sky-700' },
              { portal: 'radiology',  label: 'RIS/PACS',  Icon: Tv,            cls: 'bg-slate-700 hover:bg-slate-800' },
              { portal: 'pharmacy',   label: 'Pharmacy',  Icon: Pill,          cls: 'bg-teal-700 hover:bg-teal-800' },
              { portal: 'emergency',  label: 'Emergency', Icon: Siren,         cls: 'bg-rose-600 hover:bg-rose-700', pulse: true },
              { portal: 'surgery',    label: 'Surgical',  Icon: Scissors,      cls: 'bg-gradient-to-tr from-rose-600 to-amber-500' },
            ].map(({ portal: p, label, Icon, cls, pulse }) => (
              <button
                key={p}
                onClick={() => setPortal(p as any)}
                title={label}
                className={`${cls} text-white font-bold text-[10px] px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-white/30 cursor-pointer flex-shrink-0`}
              >
                <Icon className={`w-3.5 h-3.5 ${pulse ? 'animate-pulse' : ''}`} />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>


      {/* Global Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-y-1/2 z-[9999] max-w-sm w-[90%] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex items-start space-x-3 pointer-events-auto"
          >
            <div className={`p-2 rounded-xl ${toast.type === 'warning' ? 'bg-red-500/10 text-red-500' : toast.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
              {toast.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : toast.type === 'success' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-black text-gray-900">{toast.title}</h5>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <VoiceAssistantOverlay currentPortal={portal} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
