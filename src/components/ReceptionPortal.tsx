import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  UserPlus,
  Bot,
  Ticket,
  MapPin,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Activity,
  Phone,
  ShieldAlert,
  QrCode,
  Printer,
  Heart,
  Clock,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Compass,
  AlertTriangle,
  ChevronRight,
  Plus,
  Smartphone,
  HeartPulse,
  Send,
  Building,
  Mic,
  Calendar,
  Check,
  X,
  CreditCard as CardIcon,
  Layers,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { Patient, Appointment, HealthRecord, NotificationItem } from '../types';

interface ReceptionPortalProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

interface Visitor {
  id: string;
  name: string;
  phone: string;
  patientName: string;
  relation: string;
  passType: 'Day Pass' | 'Night Stay';
  validUntil: string;
  passCode: string;
}

export default function ReceptionPortal({
  isDarkMode,
  setIsDarkMode,
  onLogout,
  patients,
  setPatients,
  appointments,
  notifications,
  setNotifications
}: ReceptionPortalProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registration' | 'booking' | 'kiosk' | 'visitor' | 'billing' | 'analytics' | 'settings'>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Quick Stats
  const stats = {
    todayRegistrations: 148,
    activeQueue: 42,
    walkins: 92,
    appointments: 56,
    emergencies: 4,
    avgWaitTime: 8, // minutes
    hospitalOccupancy: 84 // %
  };

  // State managers
  const [regType, setRegType] = useState<'aadhaar' | 'abha' | 'manual'>('aadhaar');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'fetched' | 'completed'>('idle');
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'alert' | 'info' } | null>(null);
  
  // Registration Inputs
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientAadhaar, setNewPatientAadhaar] = useState('');
  const [newPatientABHA, setNewPatientABHA] = useState('');
  const [newPatientDOB, setNewPatientDOB] = useState('1998-05-12');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientAddress, setNewPatientAddress] = useState('Dadar, Mumbai, MH');
  const [newPatientRelation, setNewPatientRelation] = useState('Suresh Patil (Father)');
  const [newPatientBlood, setNewPatientBlood] = useState('O+');
  const [newPatientLanguage, setNewPatientLanguage] = useState('Marathi');

  // Generated Digital Card
  const [generatedCard, setGeneratedCard] = useState<any>(null);

  // Search returning patient
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<any>(null);

  // OPD Booking states
  const [selectedDept, setSelectedDept] = useState('General Medicine');
  const [selectedDoc, setSelectedDoc] = useState('Dr. Anil Patil');
  const [priorityType, setPriorityType] = useState<'Routine' | 'Senior Citizen' | 'Emergency' | 'Pregnant' | 'Disabled'>('Routine');
  const [bookedToken, setBookedToken] = useState<any>(null);

  // Visitor log list
  const [visitors, setVisitors] = useState<Visitor[]>([
    { id: 'v1', name: 'Shweta Shinde', phone: '9876543210', patientName: 'Rahul Anil Patil', relation: 'Spouse', passType: 'Day Pass', validUntil: '08:00 PM', passCode: 'VIS-DAD-0294' }
  ]);
  const [newVisitor, setNewVisitor] = useState({ name: '', phone: '', patientName: 'Rahul Anil Patil', relation: 'Spouse', passType: 'Day Pass' as const });

  // AI Assistant Interaction
  const [aiText, setAiText] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Namaskar! How can I assist you today? You can say "I have stomach pain" or "Orthopedics OPD location". I support English, Hindi, and Marathi.' }
  ]);

  // Billing states
  const [billingPatientName, setBillingPatientName] = useState('Rahul Anil Patil');
  const [billingItems, setBillingItems] = useState([
    { name: 'OPD Consultation Ticket', category: 'Consultation', price: 10 },
    { name: 'Complete Blood Count (CBC) Panel', category: 'Lab', price: 150 },
    { name: 'Knee X-Ray Bilateral', category: 'Radiology', price: 350 }
  ]);
  const [pmjaySchemeChecked, setPmjaySchemeChecked] = useState(false);
  const [billReceipt, setBillReceipt] = useState<any>(null);

  // Kiosk Sub-tab Navigation
  const [kioskTab, setKioskTab] = useState<'home' | 'book' | 'status' | 'wayfinding'>('home');
  const [kioskVoiceActive, setKioskVoiceActive] = useState(false);

  // Telemetry Time ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (title: string, desc: string, type: 'success' | 'alert' | 'info') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Simulate Aadhaar/ABHA Autofetch
  const handleAutofetch = () => {
    if (regType === 'aadhaar' && !newPatientAadhaar) {
      triggerToast('Aadhaar Required', 'Please enter a valid Aadhaar number.', 'alert');
      return;
    }
    if (regType === 'abha' && !newPatientABHA) {
      triggerToast('ABHA Address Required', 'Please enter a valid ABHA address.', 'alert');
      return;
    }

    setScanState('scanning');
    setTimeout(() => {
      // Mock fetch database
      setNewPatientName('Rajesh Madhukar Deshmukh');
      setNewPatientPhone('9819028484');
      setNewPatientDOB('1984-09-24');
      setNewPatientGender('Male');
      setNewPatientAddress('Shivaji Park, Dadar West, Mumbai 400028');
      setNewPatientBlood('A+');
      setNewPatientLanguage('Marathi');
      setScanState('fetched');
      triggerToast('ABHA Sync Completed', 'Demographics fetched securely from NHA gateway.', 'success');
    }, 1800);
  };

  // Finalize New Patient Registration
  const submitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !newPatientPhone) {
      triggerToast('Incomplete Fields', 'Please supply Patient Name and Contact Phone.', 'alert');
      return;
    }

    const regId = 'MCGM-' + Math.floor(100000 + Math.random() * 900000);
    const newCard = {
      healthId: regId,
      name: newPatientName,
      phone: newPatientPhone,
      dob: newPatientDOB,
      gender: newPatientGender,
      bloodGroup: newPatientBlood,
      address: newPatientAddress,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${regId}`
    };

    setGeneratedCard(newCard);
    setScanState('completed');

    // Add to patient queue pool
    const newQueuePatient: Patient = {
      id: String(patients.length + 1),
      token: 'OPD-' + Math.floor(1000 + Math.random() * 9000),
      name: newPatientName,
      age: 2026 - parseInt(newPatientDOB.split('-')[0]),
      gender: newPatientGender as 'Male' | 'Female',
      waitTime: 10,
      priority: 'Routine',
      diagnosis: 'Registered Walk-in',
      status: 'Waiting',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'
    };
    setPatients([...patients, newQueuePatient]);

    // Send notifications
    const newNotif: NotificationItem = {
      id: 'notif_reg_' + Date.now(),
      type: 'appointment',
      title: 'Registration Generated',
      desc: `Patient ${newPatientName} linked to digital ABHA profile.`,
      timeAgo: 'Just now',
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);

    triggerToast('Registration Successful', `Digital Health ID: ${regId} issued.`, 'success');
  };

  // Returning Patient Lookup
  const handlePatientLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) {
      triggerToast('Search Query Required', 'Please enter Aadhaar, ABHA, or Phone.', 'alert');
      return;
    }

    // Mock search matching patients
    const matches = patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.token.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matches.length > 0) {
      setSearchedPatient(matches[0]);
      triggerToast('Patient Record Retrieved', `Loaded profile for ${matches[0].name}.`, 'success');
    } else {
      triggerToast('No Record Found', 'Aadhaar or ABHA address not registered in system.', 'alert');
      setSearchedPatient(null);
    }
  };

  // OPD Booking submission
  const handleOPDBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenNo = 'OPD-' + Math.floor(1000 + Math.random() * 9000);
    const estWait = priorityType === 'Emergency' ? 0 : priorityType === 'Senior Citizen' ? 5 : 12;

    const tokenObj = {
      tokenNo: tokenNo,
      patientName: searchedPatient ? searchedPatient.name : newPatientName || 'Walk-in Patient',
      department: selectedDept,
      doctor: selectedDoc,
      waitTime: estWait,
      priority: priorityType,
      counter: 'OPD Counter 2B',
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${tokenNo}`
    };

    setBookedToken(tokenObj);
    triggerToast('OPD Booking confirmed', `Token ${tokenNo} generated.`, 'success');
  };

  // AI Chat Assistant symptom parser
  const handleAIChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiText.trim()) return;

    const userMsg = { sender: 'user' as const, text: aiText };
    setAiChat(prev => [...prev, userMsg]);
    setAiText('');

    setTimeout(() => {
      let reply = "I can guide you. Please share symptoms like cough, sprain, or chest pain.";
      const input = aiText.toLowerCase();

      if (input.includes('fever') || input.includes('cough') || input.includes('taap')) {
        reply = "Recommended OPD: General Medicine (OPD Room 102). Average queue: 3 patients ahead. Would you like to book a token?";
        setSelectedDept('General Medicine');
      } else if (input.includes('fracture') || input.includes('bone') || input.includes('hadd')) {
        reply = "Recommended OPD: Orthopedics (OPD Room 108). Average wait time: 10 minutes. Doctor on duty: Dr. Anil Patil.";
        setSelectedDept('Orthopedics');
      } else if (input.includes('baby') || input.includes('child') || input.includes('balak')) {
        reply = "Recommended OPD: Pediatrics (OPD Room 105). Average wait: 8 minutes. Doctor: Dr. Sunita Deshmukh.";
        setSelectedDept('Pediatrics');
      }

      setAiChat(prev => [...prev, { sender: 'assistant', text: reply }]);
      if (kioskVoiceActive) {
        // Trigger simulated audio feedback
        triggerToast('AI Voice Guidance', `Reading: "${reply}"`, 'info');
      }
    }, 1000);
  };

  // Add Visitor
  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitor.name || !newVisitor.phone) {
      triggerToast('Fields missing', 'Please enter visitor details.', 'alert');
      return;
    }

    const newV: Visitor = {
      id: 'v_' + Date.now(),
      name: newVisitor.name,
      phone: newVisitor.phone,
      patientName: newVisitor.patientName,
      relation: newVisitor.relation,
      passType: newVisitor.passType,
      validUntil: newVisitor.passType === 'Day Pass' ? '08:00 PM' : '08:00 AM',
      passCode: 'VIS-DAD-' + Math.floor(1000 + Math.random() * 9000)
    };

    setVisitors([newV, ...visitors]);
    setNewVisitor({ name: '', phone: '', patientName: 'Rahul Anil Patil', relation: 'Spouse', passType: 'Day Pass' });
    triggerToast('Visitor Logged', 'Digital Visitor pass issued successfully.', 'success');
  };

  // Billing checkout
  const handleCheckoutPayment = () => {
    const receiptObj = {
      invoiceId: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      patientName: billingPatientName,
      date: new Date().toLocaleDateString('en-GB'),
      items: billingItems,
      total: pmjaySchemeChecked ? 0 : billingItems.reduce((acc, it) => acc + it.price, 0),
      status: pmjaySchemeChecked ? 'SCHEME CONFIRMED (CASHLESS)' : 'COMPLETED via UPI wallet'
    };

    setBillReceipt(receiptObj);
    triggerToast('Payment Successful', 'Cashless invoice registered under Ayushman Bharat scheme.', 'success');
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${isDarkMode ? 'bg-[#090d16] text-white' : 'bg-[#f4f7fc] text-[#002068]'}`}>
      
      {/* Sidebar Controls */}
      <aside className={`w-72 flex flex-col justify-between border-r ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} p-4`}>
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase">MCGM ENTRY</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Front Desk & Kiosk OS</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-orange-505 bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Reception Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('registration')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'registration'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Patient Registration</span>
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>OPD Ticket Booking</span>
            </button>

            <button
              onClick={() => setActiveTab('kiosk')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kiosk'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Self-Service Kiosk View</span>
            </button>

            <button
              onClick={() => setActiveTab('visitor')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'visitor'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Visitor Passes</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing & Schemes</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800/10 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Rush Logs</span>
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-orange-500/30">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Receptionist Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-xs font-black">Counter 1 - Priya Sen</h4>
              <p className="text-[10px] text-gray-400">Dadar Central Front Desk</p>
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

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar */}
        <header className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'bg-[#0b0f1a] border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-black tracking-tight">MCGM Dadar General Hospital Entry</h1>
              <p className="text-xs text-gray-400 font-semibold">Triage Counter 1 • Active Queue Engine V2</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-880 text-gray-300 hover:text-white cursor-pointer transition-all"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <div className="text-right text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hidden sm:block">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </header>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          
          {/* TAB 1: RECEPTION DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Tiles above fold */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Today's Registrations</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-orange-500">{stats.todayRegistrations}</span>
                    <span className="text-xs text-emerald-500 font-bold">12 New</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active OPD Queue</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-blue-500">{stats.activeQueue}</span>
                    <span className="text-xs text-gray-400">Avg 8 min Wait</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Emergencies Triaged</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-red-500">{stats.emergencies}</span>
                    <span className="text-xs text-red-400 font-bold animate-pulse">Critical Priority</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hospital Occupancy</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-white">{stats.hospitalOccupancy}%</span>
                    <span className="text-xs text-gray-400">12 Beds Left</span>
                  </div>
                </div>
              </div>

              {/* Main row: AI symptom triage + counters status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI Reception symptom parse assistant */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Bot className="w-5 h-5 text-orange-500" />
                    <div>
                      <h3 className="font-extrabold text-sm">AI Conversational Receptionist</h3>
                      <p className="text-[10px] text-gray-400">Natural Language Department Recommender</p>
                    </div>
                  </div>

                  {/* Chat interface */}
                  <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-950 border border-slate-850 rounded-2xl no-scrollbar flex flex-col justify-end">
                    {aiChat.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                          msg.sender === 'user' 
                            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-100 ml-auto'
                            : 'bg-slate-900 border border-slate-800 text-gray-200'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAIChatMessage} className="flex items-center space-x-2 pt-2 border-t border-slate-850">
                    <input
                      type="text"
                      placeholder="Type patient complaints (e.g., 'I have back pain' or 'Sardhi khokla')"
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      className="bg-orange-655 bg-orange-600 hover:bg-orange-700 text-white p-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Counters on Duty & Announcements */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Entry Desk Status</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="font-bold">Counter 1 (Triage)</span>
                      <span className="text-emerald-500 font-bold bg-emerald-600/10 px-2 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-bold">Counter 2 (Billing)</span>
                      <span className="text-emerald-500 font-bold bg-emerald-600/10 px-2 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-bold">Counter 3 (ABHA Assist)</span>
                      <span className="text-gray-400 font-bold bg-slate-800 px-2 py-0.5 rounded">CLOSED</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs">
                    <span className="font-black text-[10px] text-orange-500 block uppercase">Peak Hour Warning</span>
                    <p className="text-gray-300 mt-1 leading-relaxed">
                      AI Predictor: High walk-in rush expected between 11:30 AM - 01:00 PM today. Recommending opening Counter 3.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PATIENT REGISTRATION */}
          {activeTab === 'registration' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black">Fast Demographics Registration</h2>
                  <p className="text-xs text-gray-400">Autofetch verified credentials from Aadhaar/ABHA to minimize registration errors</p>
                </div>
                {/* Method selector */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-0.5">
                  {(['aadhaar', 'abha', 'manual'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setRegType(type)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        regType === type ? 'bg-orange-655 bg-orange-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Input Panel */}
                <form onSubmit={submitRegistration} className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                  {regType === 'aadhaar' && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Enter UIDAI Aadhaar Number</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. 2201 8890 1234"
                          value={newPatientAadhaar}
                          onChange={(e) => setNewPatientAadhaar(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <button
                          type="button"
                          onClick={handleAutofetch}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Fetch & Verify
                        </button>
                      </div>
                    </div>
                  )}

                  {regType === 'abha' && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Enter ABHA Health Address / ID</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. rajesh@abha"
                          value={newPatientABHA}
                          onChange={(e) => setNewPatientABHA(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <button
                          type="button"
                          onClick={handleAutofetch}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Fetch & Sync
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Shared Demographics fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Full Patient Name *</label>
                      <input
                        type="text"
                        placeholder="First & Last Name"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Mobile Contact Number *</label>
                      <input
                        type="text"
                        placeholder="10-digit number"
                        value={newPatientPhone}
                        onChange={(e) => setNewPatientPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Date of Birth</label>
                      <input
                        type="date"
                        value={newPatientDOB}
                        onChange={(e) => setNewPatientDOB(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</label>
                      <input
                        type="text"
                        placeholder="e.g. O+ / B+"
                        value={newPatientBlood}
                        onChange={(e) => setNewPatientBlood(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Residential Address</label>
                    <textarea
                      placeholder="Street, Locality, Ward, Pin Code"
                      value={newPatientAddress}
                      onChange={(e) => setNewPatientAddress(e.target.value)}
                      className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-98"
                  >
                    Confirm Registration & Issue MCGM Health Card
                  </button>
                </form>

                {/* Generated Digital Card Preview */}
                <div className="space-y-4">
                  {generatedCard ? (
                    <div className="bg-gradient-to-br from-orange-500 via-amber-600 to-amber-800 p-5 rounded-3xl text-white shadow-xl relative overflow-hidden space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            MCGM Digital Health ID
                          </span>
                          <h3 className="font-extrabold text-base tracking-tight mt-1">{generatedCard.name}</h3>
                          <p className="text-[10px] font-mono text-orange-100">{generatedCard.healthId}</p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-lg p-1">
                          <img src={generatedCard.qrUrl} alt="QR Code" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-orange-55 mt-4">
                        <div>
                          <span className="block text-orange-200/70 font-bold">DOB / GENDER</span>
                          <span className="font-bold">{generatedCard.dob} • {generatedCard.gender}</span>
                        </div>
                        <div>
                          <span className="block text-orange-200/70 font-bold">BLOOD TYPE</span>
                          <span className="font-bold">{generatedCard.bloodGroup}</span>
                        </div>
                      </div>

                      <div className="border-t border-white/20 pt-3 flex justify-between items-center text-[10px]">
                        <span>Dadar Central Hub</span>
                        <span className="font-mono">ABHA SYNCED</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 bg-slate-900/10 rounded-3xl p-6 text-center text-gray-500 flex flex-col items-center justify-center h-56">
                      <UserPlus className="w-8 h-8 text-gray-700 mb-2" />
                      <p className="text-xs font-black">Digital Health ID Preview</p>
                      <p className="text-[10px] text-gray-400 mt-1">Submit the registration demographics form to issue new digital identity card.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: OPD TICKET BOOKING & QUEUE GENERATION */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">OPD Appointment Desk</h2>
                <p className="text-xs text-gray-400">Allocate departments and doctors, generate queue tokens</p>
              </div>

              {/* Returning Patient Lookup bar */}
              <form onSubmit={handlePatientLookup} className="flex space-x-2 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search returning patient profile via Phone, ABHA, Aadhaar or Token..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Retrieve EMR Profile
                </button>
              </form>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Booking form */}
                <form onSubmit={handleOPDBooking} className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Target Specialty Department</label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Cardiology">Cardiology</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Duty Doctor Allocation</label>
                      <select
                        value={selectedDoc}
                        onChange={(e) => setSelectedDoc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="Dr. Anil Patil">Dr. Anil Patil (Available)</option>
                        <option value="Dr. Sunita Deshmukh">Dr. Sunita Deshmukh (In Surgery)</option>
                        <option value="Dr. Ramesh Mehta">Dr. Ramesh Mehta (OPD Queue: 8)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Triage Queue Priority</label>
                      <select
                        value={priorityType}
                        onChange={(e) => setPriorityType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="Routine">Routine - General Walk-in</option>
                        <option value="Senior Citizen">Senior Citizen - Priority 1</option>
                        <option value="Emergency">Emergency - Instant Bypass</option>
                        <option value="Pregnant">Pregnant Woman - Priority 2</option>
                        <option value="Disabled">Disabled Patient - Priority 1</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-655 bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-98"
                  >
                    Confirm Doctor Allocation & Issue Token
                  </button>
                </form>

                {/* Print token layout preview */}
                <div className="space-y-4">
                  {bookedToken ? (
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl text-white space-y-4 shadow-lg text-center">
                      <div className="flex items-center justify-center space-x-2 text-emerald-500 font-bold text-xs">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>TOKEN GENERATED</span>
                      </div>

                      <div className="space-y-1 py-4 border-y border-slate-850">
                        <h2 className="text-3xl font-black tracking-tight">{bookedToken.tokenNo}</h2>
                        <p className="text-[10px] text-gray-400 uppercase font-black">{bookedToken.department} OPD</p>
                      </div>

                      <div className="space-y-2 text-xs text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Patient:</span>
                          <span className="font-bold">{bookedToken.patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Allocated Doctor:</span>
                          <span className="font-bold">{bookedToken.doctor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Estimated Wait:</span>
                          <span className="text-orange-500 font-bold">{bookedToken.waitTime} Mins</span>
                        </div>
                      </div>

                      <div className="flex justify-center py-2">
                        <img src={bookedToken.qrUrl} alt="Token QR" className="w-24 h-24 bg-white p-1 rounded-lg" />
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerToast('Printing Token', 'Sent print directive to OPD ticket printer.', 'success')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-gray-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-slate-800 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Physical Ticket</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 bg-slate-900/10 rounded-3xl p-6 text-center text-gray-500 flex flex-col items-center justify-center h-56">
                      <Ticket className="w-8 h-8 text-gray-700 mb-2" />
                      <p className="text-xs font-black">OPD Ticket Preview</p>
                      <p className="text-[10px] text-gray-400 mt-1">Allocate doctor and confirm booking to display printable token.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: SELF SERVICE KIOSK VIEW */}
          {activeTab === 'kiosk' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-black">Self-Service Touch Kiosk Simulator</h2>
                  <p className="text-xs text-gray-400">Simulate visitor/patient walk-in kiosk terminals</p>
                </div>
                <button
                  onClick={() => setKioskVoiceActive(!kioskVoiceActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    kioskVoiceActive ? 'bg-orange-600 text-white' : 'bg-slate-900 border border-slate-800 text-gray-400'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{kioskVoiceActive ? 'Voice Guidance Active' : 'Enable Voice'}</span>
                </button>
              </div>

              {/* Kiosk Dashboard simulation */}
              <div className="bg-[#0f1524] border border-slate-800 rounded-3xl p-6 min-h-[480px] flex flex-col justify-between">
                
                {kioskTab === 'home' && (
                  <div className="space-y-8 flex-1 flex flex-col justify-center">
                    <div className="text-center space-y-2">
                      <span className="text-xs font-extrabold uppercase bg-orange-600/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full">
                        MCGM DIGITAL WELCOME DESK
                      </span>
                      <h2 className="text-2xl font-black tracking-tight">Touch to Begin / सुरुवात करा</h2>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">Skip registration lines. Print your OPD token or find departments instantly.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto w-full">
                      <button
                        onClick={() => setKioskTab('book')}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-850 p-6 rounded-2xl text-center space-y-3 hover:scale-102 transition-all cursor-pointer"
                      >
                        <UserPlus className="w-8 h-8 text-orange-500 mx-auto" />
                        <h4 className="text-xs font-black">Fast Registration / OPD Ticket</h4>
                      </button>

                      <button
                        onClick={() => setKioskTab('status')}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-850 p-6 rounded-2xl text-center space-y-3 hover:scale-102 transition-all cursor-pointer"
                      >
                        <Ticket className="w-8 h-8 text-blue-500 mx-auto" />
                        <h4 className="text-xs font-black">Print Health Card / Bill Payment</h4>
                      </button>

                      <button
                        onClick={() => setKioskTab('wayfinding')}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-850 p-6 rounded-2xl text-center space-y-3 hover:scale-102 transition-all cursor-pointer"
                      >
                        <Compass className="w-8 h-8 text-emerald-500 mx-auto" />
                        <h4 className="text-xs font-black">Hospital Indoor Map & Route</h4>
                      </button>
                    </div>
                  </div>
                )}

                {kioskTab === 'book' && (
                  <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm">Self-Service OPD Ticket Booking</h3>
                      <button onClick={() => setKioskTab('home')} className="text-xs text-gray-400 hover:text-white">Back to Home</button>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                      <p className="text-xs text-gray-400">Scan Aadhaar or ABHA Address barcode at the scanner box below.</p>
                      <div className="h-32 border-2 border-dashed border-slate-800 bg-slate-900/50 rounded-xl flex items-center justify-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase animate-pulse">Position Barcode / Phone QR under red laser</span>
                      </div>
                    </div>
                  </div>
                )}

                {kioskTab === 'status' && (
                  <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm">Retrieve Status & Print Records</h3>
                      <button onClick={() => setKioskTab('home')} className="text-xs text-gray-400 hover:text-white">Back to Home</button>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Enter Health ID or registered phone number..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => triggerToast('Records Synced', 'Active billing logs loaded.', 'success')}
                          className="bg-orange-600 text-white px-4 rounded-xl text-xs font-bold"
                        >
                          Find Logs
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {kioskTab === 'wayfinding' && (
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm">Indoor Interactive Hospital Map</h3>
                      <button onClick={() => setKioskTab('home')} className="text-xs text-gray-400 hover:text-white">Back to Home</button>
                    </div>

                    {/* Interactive wayfinding visual layout */}
                    <div className="relative border border-slate-800 bg-slate-950 rounded-2xl h-64 overflow-hidden flex items-center justify-center p-4">
                      {/* Stylized vector SVG wayfinding map */}
                      <svg className="w-full h-full text-slate-800 stroke-slate-700" viewBox="0 0 400 200">
                        <rect x="10" y="10" width="100" height="80" rx="8" fill="#1e293b" opacity="0.3" />
                        <text x="25" y="55" fill="#94a3b8" fontSize="10" fontWeight="bold">LOBBY / WAITING</text>

                        <rect x="130" y="10" width="120" height="80" rx="8" fill="#047857" opacity="0.1" stroke="#059669" />
                        <text x="145" y="45" fill="#34d399" fontSize="10" fontWeight="bold">GENERAL MEDICINE</text>
                        <text x="145" y="65" fill="#34d399" fontSize="8">OPD Rooms 101-104</text>

                        <rect x="270" y="10" width="120" height="80" rx="8" fill="#1d4ed8" opacity="0.1" stroke="#2563eb" />
                        <text x="285" y="45" fill="#60a5fa" fontSize="10" fontWeight="bold">ORTHOPEDICS OPD</text>
                        <text x="285" y="65" fill="#60a5fa" fontSize="8">OPD Rooms 105-108</text>

                        {/* Navigation Line */}
                        <path d="M 60 90 L 60 140 L 190 140 L 190 90" stroke="#f97316" strokeWidth="2.5" fill="none" strokeDasharray="5,5" className="animate-pulse" />
                        <circle cx="60" cy="90" r="4" fill="#f97316" />
                        <circle cx="190" cy="90" r="4" fill="#34d399" />
                        <text x="75" y="132" fill="#f97316" fontSize="9" fontWeight="bold">PATHWAY TO OPD 102</text>

                        <rect x="10" y="110" width="100" height="80" rx="8" fill="#1e293b" opacity="0.3" />
                        <text x="25" y="150" fill="#94a3b8" fontSize="10" fontWeight="bold">PHARMACY DESK</text>
                      </svg>
                      <div className="absolute top-2 right-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded text-[9px] text-orange-400 font-bold uppercase">
                        Current Location: Lobby Entry kiosk
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 5: VISITOR PASSES */}
          {activeTab === 'visitor' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Visitor Logging & Security</h2>
                <p className="text-xs text-gray-400">Issue visitor badges linked to active inpatient beds</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form fields */}
                <form onSubmit={handleAddVisitor} className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100'} space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Visitor Full Name *</label>
                      <input
                        type="text"
                        placeholder="Visitor Name"
                        value={newVisitor.name}
                        onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Visitor Phone Number *</label>
                      <input
                        type="text"
                        placeholder="Contact number"
                        value={newVisitor.phone}
                        onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Linked Inpatient Bed</label>
                      <select
                        value={newVisitor.patientName}
                        onChange={(e) => setNewVisitor({ ...newVisitor, patientName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="Rahul Anil Patil">Rahul Anil Patil (Bed 401)</option>
                        <option value="Suresh Kumar">Suresh Kumar (Bed 402)</option>
                        <option value="Ramesh Joshi">Ramesh Joshi (Bed 403-ISO)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Pass Validity Category</label>
                      <select
                        value={newVisitor.passType}
                        onChange={(e) => setNewVisitor({ ...newVisitor, passType: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="Day Pass">Day Pass (Until 08:00 PM)</option>
                        <option value="Night Stay">Night Stay (Overnight supervisor)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-98"
                  >
                    Generate Digital Visitor Pass
                  </button>
                </form>

                {/* Visitor Log index */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Active Visitor Passes</h3>

                  <div className="space-y-3">
                    {visitors.map(v => (
                      <div key={v.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black">{v.name}</h4>
                            <p className="text-[10px] text-gray-500">Visiting: {v.patientName}</p>
                          </div>
                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-orange-400 font-mono">
                            {v.passType}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 pt-2 border-t border-slate-850">
                          <span>Code: {v.passCode}</span>
                          <span>Valid: {v.validUntil}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: BILLING & SCHEMES CHECK */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">OPD Billing & State Health Schemes</h2>
                <p className="text-xs text-gray-400">Generate cashless scheme approvals or accept digital wallets payments</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Invoice items list */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Invoice Summary for {billingPatientName}</h3>

                    <div className="space-y-2">
                      {billingItems.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-black">{item.name}</h4>
                            <p className="text-[10px] text-gray-500">{item.category}</p>
                          </div>
                          <span className="text-xs font-black">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schemes checker */}
                  <div className="p-4 rounded-2xl bg-orange-600/10 border border-orange-500/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4.5 h-4.5 text-orange-400" />
                        <span className="text-xs font-black text-orange-400">Ayushman Bharat (PM-JAY) Eligibility Check</span>
                      </div>
                      <span className="text-[9px] bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black">ELIGIBLE</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Patient profile matches cashless state healthcare scheme directives. All OPD, pharmacy, and diagnostic fees are fully covered.
                    </p>

                    <label className="flex items-center space-x-3 cursor-pointer pt-2 border-t border-slate-850">
                      <input
                        type="checkbox"
                        checked={pmjaySchemeChecked}
                        onChange={(e) => setPmjaySchemeChecked(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-xs font-bold text-gray-300">Apply Cashless Scheme Benefit Override</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Grand Total Due</span>
                      <h3 className="text-lg font-black text-white">₹{pmjaySchemeChecked ? 0 : billingItems.reduce((acc, it) => acc + it.price, 0)}</h3>
                    </div>
                    <button
                      onClick={handleCheckoutPayment}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Confirm Checkout & Print Receipt
                    </button>
                  </div>
                </div>

                {/* Digital Receipt layout */}
                <div className="space-y-4">
                  {billReceipt ? (
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl text-white space-y-4 shadow-lg text-center">
                      <div className="flex items-center justify-center space-x-2 text-emerald-500 font-bold text-xs">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>INVOICE PAID</span>
                      </div>

                      <div className="space-y-1 py-4 border-y border-slate-850 text-left">
                        <p className="text-[10px] text-gray-500">INVOICE NO: {billReceipt.invoiceId}</p>
                        <p className="text-xs font-bold text-white">Patient: {billReceipt.patientName}</p>
                        <p className="text-xs text-gray-400">Date: {billReceipt.date}</p>
                      </div>

                      <div className="space-y-2 text-xs text-left">
                        {billReceipt.items.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-gray-400">{it.name}:</span>
                            <span className="font-bold">₹{pmjaySchemeChecked ? 0 : it.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-850 flex justify-between items-center text-xs">
                        <span className="font-bold">Total Paid:</span>
                        <span className="text-emerald-500 font-black">₹{billReceipt.total}</span>
                      </div>

                      <p className="text-[10px] text-gray-500 font-mono italic">{billReceipt.status}</p>

                      <button
                        type="button"
                        onClick={() => triggerToast('Printing Receipt', 'Sent invoice print command.', 'success')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-gray-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-slate-800 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Invoice Receipt</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 bg-slate-900/10 rounded-3xl p-6 text-center text-gray-500 flex flex-col items-center justify-center h-56">
                      <CreditCard className="w-8 h-8 text-gray-700 mb-2" />
                      <p className="text-xs font-black">Invoice Receipt Preview</p>
                      <p className="text-[10px] text-gray-400 mt-1">Complete payment checkout to display paid billing invoice receipt.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS & RUSH HOURS LOGS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black">Hospital Front Desk Analytics</h2>
                <p className="text-xs text-gray-400">Track registration bottlenecks, peak rush hours, and counter performance</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Rush hours histogram */}
                <div className={`lg:col-span-2 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Walk-in Registrations Peak Hours</h3>
                  
                  {/* Histogram graphic */}
                  <div className="h-44 flex items-end justify-between space-x-2 pt-6">
                    {[12, 28, 48, 92, 110, 85, 34, 15].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center space-y-2">
                        <span className="text-[9px] text-gray-400">{val}</span>
                        <div 
                          className="w-full bg-orange-600 rounded-t-lg transition-all"
                          style={{ height: `${(val / 110) * 100}px` }}
                        />
                        <span className="text-[8px] text-gray-500 font-mono">
                          {['08 AM', '09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM'][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Efficiency KPI logs */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-gray-100 shadow-sm'} space-y-4`}>
                  <h3 className="font-extrabold text-sm border-b border-slate-800 pb-2">Desk Performance Metrics</h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                        <span>Avg Registration Time</span>
                        <span className="text-emerald-500">1m 45s (TARGET MET)</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                        <span>ABHA Sync Rate</span>
                        <span className="text-emerald-500">92%</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                        <span>Queue Bypass Rate</span>
                        <span className="text-orange-500">12% (Bypass to Kiosks)</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '35%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Global Toast Banner */}
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
              {toast.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : toast.type === 'success' ? <Check className="w-5 h-5" /> : <Info className="w-5 h-5" />}
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
