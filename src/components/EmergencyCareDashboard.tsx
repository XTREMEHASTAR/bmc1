import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  Brain,
  Building,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  Droplet,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HardDrive,
  Heart,
  Info,
  Layers,
  LayoutGrid,
  Lock,
  LogOut,
  Map,
  MapPin,
  MessageSquare,
  Moon,
  Pause,
  Phone,
  PhoneOff,
  Play,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
  Sun,
  Thermometer,
  Timer,
  TrendingUp,
  Truck,
  User,
  Users,
  Video,
  VideoOff,
  Volume2,
  Wifi,
  WifiOff,
  X,
  Zap
} from 'lucide-react';

interface PatientEmergency {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  abhaId: string;
  triageCategory: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK' | 'PENDING';
  injuryMechanism: string;
  vitals: {
    hr: number;
    bp: string;
    rr: number;
    spo2: number;
    temp: number;
  };
  gcs: number; // 3 to 15
  traumaScore: number; // RTS 0 to 8
  allergies: string[];
  currentMedicines: string[];
  history: string;
  ambulanceId?: string;
  etaMinutes?: number;
  bloodTypeNeeded: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'TRIAGED' | 'RESUSCITATING' | 'IN_SURGERY' | 'ICU' | 'ADMITTED';
  timestamp: string;
}

interface FleetAmbulance {
  id: string;
  driver: string;
  paramedic: string;
  status: 'AVAILABLE' | 'EN_ROUTE_INCIDENT' | 'ON_SCENE' | 'TRANSPORTING' | 'MAINTENANCE';
  fuel: number;
  location: { x: number; y: number; name: string };
  equipmentCheck: {
    aed: boolean;
    ventilator: boolean;
    oxygen: number; // percentage
    emergencyKit: boolean;
  };
  assignedPatientId?: string;
}

interface IncidentReport {
  id: string;
  title: string;
  location: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  reportedAt: string;
  status: 'OPEN' | 'CONTAINED' | 'RESOLVED';
  victimsCount: number;
  type: 'ROAD_ACCIDENT' | 'FIRE_INCIDENT' | 'BUILDING_COLLAPSE' | 'MEDICAL_OUTBREAK';
}

const initialPatients: PatientEmergency[] = [
  {
    id: 'ER-2026-801',
    name: 'Santosh Harishchandra Patil',
    age: 42,
    gender: 'Male',
    abhaId: 'santosh.patil@abha',
    triageCategory: 'RED',
    injuryMechanism: 'Severe Trauma - High-Speed Motorcycle Collision',
    vitals: { hr: 124, bp: '88/54', rr: 28, spo2: 89, temp: 36.4 },
    gcs: 9,
    traumaScore: 5.2,
    allergies: ['Penicillin', 'Sulfa Drugs'],
    currentMedicines: ['Atorvastatin 10mg OD'],
    history: 'Hypertension, Left Ventricular Hypertrophy',
    ambulanceId: 'AMB-MCGM-03',
    etaMinutes: 4,
    bloodTypeNeeded: 'O Negative',
    status: 'EN_ROUTE',
    timestamp: '2026-07-09T11:20:00Z'
  },
  {
    id: 'ER-2026-802',
    name: 'Sunita Ravindra Deshmukh',
    age: 58,
    gender: 'Female',
    abhaId: 'sunita.deshmukh@abha',
    triageCategory: 'YELLOW',
    injuryMechanism: 'Potential Acute Coronary Syndrome - Chest Pain & Dyspnea',
    vitals: { hr: 98, bp: '154/96', rr: 20, spo2: 94, temp: 37.1 },
    gcs: 15,
    traumaScore: 7.84,
    allergies: [],
    currentMedicines: ['Metformin 500mg BD'],
    history: 'Type 2 Diabetes Mellitus, Dyslipidemia',
    ambulanceId: 'AMB-MCGM-09',
    etaMinutes: 9,
    bloodTypeNeeded: 'A Positive',
    status: 'DISPATCHED',
    timestamp: '2026-07-09T11:25:00Z'
  },
  {
    id: 'ER-2026-803',
    name: 'Rohan Satish Shinde',
    age: 26,
    gender: 'Male',
    abhaId: 'rohan.shinde@abha',
    triageCategory: 'PENDING',
    injuryMechanism: 'Fall from Height (approx 12 feet) - Closed Head Injury',
    vitals: { hr: 110, bp: '118/72', rr: 24, spo2: 96, temp: 36.8 },
    gcs: 12,
    traumaScore: 6.5,
    allergies: ['Contrast Dye'],
    currentMedicines: [],
    history: 'Asthma (Albuterol inhaler PRN)',
    bloodTypeNeeded: 'B Positive',
    status: 'ARRIVED',
    timestamp: '2026-07-09T11:32:00Z'
  }
];

const initialAmbulances: FleetAmbulance[] = [
  {
    id: 'AMB-MCGM-03',
    driver: 'Vijay Salunkhe',
    paramedic: 'Dr. Alok Mehta',
    status: 'TRANSPORTING',
    fuel: 85,
    location: { x: 30, y: 45, name: 'Dharavi Link Road' },
    equipmentCheck: { aed: true, ventilator: true, oxygen: 92, emergencyKit: true },
    assignedPatientId: 'ER-2026-801'
  },
  {
    id: 'AMB-MCGM-09',
    driver: 'Ganesh Shinde',
    paramedic: 'Nisha Kamble (EMT)',
    status: 'EN_ROUTE_INCIDENT',
    fuel: 62,
    location: { x: 65, y: 35, name: 'Sion Circle Flyover' },
    equipmentCheck: { aed: true, ventilator: false, oxygen: 88, emergencyKit: true },
    assignedPatientId: 'ER-2026-802'
  },
  {
    id: 'AMB-MCGM-12',
    driver: 'Suresh Naik',
    paramedic: 'Milind Sawant (EMT)',
    status: 'AVAILABLE',
    fuel: 98,
    location: { x: 45, y: 70, name: 'KEM Hospital Base' },
    equipmentCheck: { aed: true, ventilator: true, oxygen: 95, emergencyKit: true }
  }
];

const initialIncidents: IncidentReport[] = [
  {
    id: 'INC-MCI-01',
    title: 'Commercial Complex Fire Outbreak',
    location: 'Saki Naka, Andheri East',
    severity: 'CRITICAL',
    reportedAt: '2026-07-09T10:45:00Z',
    status: 'OPEN',
    victimsCount: 14,
    type: 'FIRE_INCIDENT'
  },
  {
    id: 'INC-TRAF-09',
    title: 'Double Taxi Rear-End Collision',
    location: 'Western Express Highway, Bandra',
    severity: 'MEDIUM',
    reportedAt: '2026-07-09T11:10:00Z',
    status: 'OPEN',
    victimsCount: 3,
    type: 'ROAD_ACCIDENT'
  }
];

interface EmergencyCareDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function EmergencyCareDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: EmergencyCareDashboardProps) {
  const [activeTab, setActiveTab] = useState<'command' | 'dispatcher' | 'fleet' | 'paramedic' | 'triage' | 'disaster' | 'analytics'>('command');
  const [patients, setPatients] = useState<PatientEmergency[]>(initialPatients);
  const [ambulances, setAmbulances] = useState<FleetAmbulance[]>(initialAmbulances);
  const [incidents, setIncidents] = useState<IncidentReport[]>(initialIncidents);
  
  // Disaster Mass Casualty Incident Mode Flag
  const [isDisasterMode, setIsDisasterMode] = useState(false);
  const [disasterLevel, setDisasterLevel] = useState<'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'>('LEVEL_1');
  const [situationReport, setSituationReport] = useState('MCGM Emergency Command: Alert active for Saki Naka commercial fire. 4 ambulances routed. NGO coordination lines open.');

  // UI state variables
  const [selectedPatient, setSelectedPatient] = useState<PatientEmergency>(initialPatients[0]);
  const [newIncidentRequest, setNewIncidentRequest] = useState({
    title: '',
    location: '',
    severity: 'MEDIUM' as 'MEDIUM' | 'HIGH' | 'CRITICAL',
    type: 'ROAD_ACCIDENT' as 'ROAD_ACCIDENT' | 'FIRE_INCIDENT' | 'BUILDING_COLLAPSE' | 'MEDICAL_OUTBREAK',
    victimsCount: 1
  });

  const [triageInputs, setTriageInputs] = useState({
    hr: 110,
    bp: '120/80',
    rr: 22,
    spo2: 95,
    temp: 37.0,
    gcsEye: 4,
    gcsVerbal: 5,
    gcsMotor: 6,
    mechanism: 'Blunt thoracic trauma'
  });

  // Telemedicine Simulator State
  const [telemedicineActive, setTelemedicineActive] = useState(false);
  const [telemedicineConnected, setTelemedicineConnected] = useState(false);

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notification logs
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; type: 'alert' | 'info' | 'critical' }[]>([
    { id: '1', text: 'Critical Alert: Red Category patient arriving in 4 mins (Santosh Patil)', time: 'Just now', type: 'critical' },
    { id: '2', text: 'Saki Naka Fire MCI: NGO volunteer networks activated', time: '8 mins ago', type: 'alert' },
    { id: '3', text: 'Ambulance AMB-MCGM-03 dispatched to Western Express Highway', time: '14 mins ago', type: 'info' }
  ]);

  // Toast notifications
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const triggerToast = (title: string, desc: string, type: 'success' | 'warning' | 'error') => {
    setToast(null);
    setTimeout(() => setToast({ title, desc, type }), 50);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Compute stats
  const redCasesCount = patients.filter(p => p.triageCategory === 'RED').length;
  const yellowCasesCount = patients.filter(p => p.triageCategory === 'YELLOW').length;
  const greenCasesCount = patients.filter(p => p.triageCategory === 'GREEN').length;
  const blackCasesCount = patients.filter(p => p.triageCategory === 'BLACK').length;
  const activeMciIncidents = incidents.filter(i => i.severity === 'CRITICAL' && i.status === 'OPEN').length;

  // GCS Calculation
  const calculatedGCS = Number(triageInputs.gcsEye) + Number(triageInputs.gcsVerbal) + Number(triageInputs.gcsMotor);
  
  // AI Triage Calculator logic (START / ESI protocols)
  const calculateAiTriage = () => {
    const spo2 = Number(triageInputs.spo2);
    const hr = Number(triageInputs.hr);
    const rr = Number(triageInputs.rr);
    const gcsVal = calculatedGCS;

    if (gcsVal <= 8 || spo2 < 85 || rr > 30 || rr < 8) {
      return 'RED'; // Critical respiratory failure / unconscious
    }
    if (gcsVal <= 12 || spo2 < 92 || hr > 120 || hr < 50 || rr > 25) {
      return 'YELLOW'; // Urgent physiological derangement
    }
    return 'GREEN'; // Stable
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentRequest.title || !newIncidentRequest.location) {
      triggerToast('Validation Error', 'Incident title and location are required.', 'error');
      return;
    }

    const newId = `INC-${Math.floor(100 + Math.random() * 900)}`;
    const createdIncident: IncidentReport = {
      id: newId,
      title: newIncidentRequest.title,
      location: newIncidentRequest.location,
      severity: newIncidentRequest.severity,
      victimsCount: Number(newIncidentRequest.victimsCount),
      reportedAt: new Date().toISOString(),
      status: 'OPEN',
      type: newIncidentRequest.type
    };

    setIncidents([createdIncident, ...incidents]);
    
    // Auto-dispatch AI recommendation toast
    triggerToast(
      'AI Alert Dispatcher',
      `Auto-dispatching nearest ambulance to ${newIncidentRequest.location}`,
      'success'
    );

    setNewIncidentRequest({
      title: '',
      location: '',
      severity: 'MEDIUM',
      type: 'ROAD_ACCIDENT',
      victimsCount: 1
    });
  };

  const handleUpdatePatientStatus = (patientId: string, nextStatus: PatientEmergency['status']) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: nextStatus } : p));
    triggerToast(
      'Patient Status Updated',
      `Patient status changed to ${nextStatus}`,
      'success'
    );
  };

  const handleConfirmTriage = (patientId: string, category: PatientEmergency['triageCategory']) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, triageCategory: category, status: 'TRIAGED' } : p));
    triggerToast(
      'Triage Locked',
      `Patient marked as ${category} category. Ready for trauma bay allocation.`,
      'success'
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none transition-colors duration-200 ${
      isDisasterMode 
        ? 'bg-[#180a0a] text-red-100' 
        : isDarkMode 
          ? 'bg-[#090d16] text-gray-100' 
          : 'bg-gray-50 text-gray-800'
    }`}>
      
      {/* Toast Popup Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] max-w-sm w-full border p-4 rounded-2xl shadow-2xl flex items-start space-x-3.5 animate-slide-in ${
          isDisasterMode 
            ? 'bg-red-950 border-red-800' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="p-2 rounded-xl bg-slate-800/80">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertOctagon className="w-5 h-5 text-rose-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-black text-white">{toast.title}</h5>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{toast.desc}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header / Top Operation Command Line */}
      <header className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-30 transition-all ${
        isDisasterMode 
          ? 'bg-[#2a0e0e] border-red-900' 
          : isDarkMode 
            ? 'bg-[#0c1322] border-gray-800' 
            : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
            isDisasterMode ? 'bg-red-650 bg-red-600 animate-pulse' : 'bg-rose-600'
          }`}>
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-base font-black tracking-tight ${isDarkMode || isDisasterMode ? 'text-white' : 'text-gray-900'}`}>
                MCGM Trauma Emergency OS
              </h1>
              {isDisasterMode && (
                <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-ping">
                  DISASTER MASS CASUALTY ACTIVE
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Trauma Command, Fleet GIS & Disaster Response Module
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl w-80">
          <Search className="w-4 h-4 text-gray-550" />
          <input
            type="text"
            placeholder="Search incident, ambulance, GCS, ABHA... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] text-white w-full placeholder-gray-500 font-medium"
          />
        </div>

        {/* System controls */}
        <div className="flex items-center space-x-3">
          {/* Disaster Mode Declaration Button */}
          <button
            onClick={() => {
              setIsDisasterMode(!isDisasterMode);
              triggerToast(
                isDisasterMode ? 'Disaster Mode Deactivated' : 'DISASTER PROTOCOL ACTIVE',
                isDisasterMode 
                  ? 'Reverted to standard operational emergency protocols.' 
                  : 'Mass Casualty Incident Mode declared. Resources locked, notification sent to state control.',
                isDisasterMode ? 'success' : 'warning'
              );
            }}
            className={`flex items-center space-x-1.5 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer border ${
              isDisasterMode 
                ? 'bg-red-650 bg-red-600 border-red-500 text-white hover:bg-red-700 animate-pulse'
                : 'bg-rose-950/20 text-rose-500 border-rose-500/20 hover:bg-rose-500/10'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{isDisasterMode ? 'CANCEL MCI' : 'DECLARE MCI'}</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-900 border-gray-800 text-amber-400' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar Panel */}
        <aside className={`w-64 border-r p-4 space-y-6 flex flex-col justify-between transition-all ${
          isDisasterMode 
            ? 'bg-[#1f0d0d] border-red-950' 
            : isDarkMode 
              ? 'bg-[#0a0f1d] border-gray-800' 
              : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-4">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">COMMAND MODULES</span>
            <nav className="space-y-1">
              {[
                { id: 'command', label: 'Trauma Command Center', icon: LayoutGrid },
                { id: 'dispatcher', label: 'AI Dispatcher Workspace', icon: Brain },
                { id: 'fleet', label: 'Ambulance Fleet Status', icon: Ambulance },
                { id: 'paramedic', label: 'Paramedic Pre-Hospital', icon: Smartphone },
                { id: 'triage', label: 'ESI/START Triage & Trauma', icon: Activity },
                { id: 'disaster', label: 'Disaster Management', icon: ShieldAlert },
                { id: 'analytics', label: 'Response Analytics', icon: BarChart2 }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-rose-600 text-white shadow-md'
                        : isDarkMode || isDisasterMode
                          ? 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
                          : 'text-gray-650 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'triage' && patients.some(p => p.triageCategory === 'PENDING') && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    )}
                    {item.id === 'dispatcher' && incidents.length > 0 && (
                      <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                        {incidents.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* AI Clinical Assistant Widget */}
          <div className={`border rounded-2xl p-4 space-y-3.5 ${
            isDisasterMode 
              ? 'bg-[#291212] border-red-900/60' 
              : 'bg-[#0f172a] border-gray-800'
          }`}>
            <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Brain className="w-3.5 h-3.5 text-rose-500" />
              <span>AI Command Copilot</span>
            </h5>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-gray-450 text-gray-400">RED Status Cases</span>
                <span className="font-black text-rose-500">{redCasesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-450 text-gray-400">Active Incidents</span>
                <span className="font-black text-white">{incidents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-450 text-gray-400">Available Ambulances</span>
                <span className="font-black text-emerald-400">
                  {ambulances.filter(a => a.status === 'AVAILABLE').length}
                </span>
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-[9px] leading-relaxed text-gray-400">
              💡 **AI Forecast:** High probability of road accident spikes on WEH due to heavy rain. Advising AMB-09 redistribution.
            </div>
          </div>
        </aside>

        {/* Central Dashboard Viewport */}
        <section className={`flex-1 p-6 overflow-y-auto ${
          isDisasterMode 
            ? 'bg-[#100606]' 
            : isDarkMode 
              ? 'bg-[#060a12]' 
              : 'bg-gray-50'
        }`}>

          {/* TAB 1: TRAUMA COMMAND CENTER */}
          {activeTab === 'command' && (
            <div className="space-y-6">
              
              {/* Top Row KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border flex flex-col ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Total Critical (RED) Cases</span>
                  <span className="text-2xl font-black text-rose-500 mt-1.5">{redCasesCount}</span>
                  <div className="flex items-center space-x-1 mt-2 text-[9px] text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    <span>Trauma Bay 1 & 2 full</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Live Ambulance Fleet</span>
                  <span className="text-2xl font-black text-white mt-1.5">
                    {ambulances.length}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-2 font-medium">
                    {ambulances.filter(a => a.status === 'AVAILABLE').length} Available base stations
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Hospital Resource Readiness</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1.5">Optimal</span>
                  <span className="text-[9px] text-gray-400 mt-2 font-medium">OT availability: 2 open bays</span>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Disaster Alert Index</span>
                  <span className={`text-2xl font-black mt-1.5 ${isDisasterMode ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
                    {isDisasterMode ? 'CRITICAL MCI' : 'NORMAL'}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-2 font-medium">
                    {incidents.filter(i => i.severity === 'CRITICAL').length} High-impact incidents logged
                  </span>
                </div>
              </div>

              {/* Live Grid Map & Incoming Queue split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Area: Live Map and Fleet GPS */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <div className="flex justify-between items-center border-b border-gray-800/60 pb-3">
                    <h3 className="text-sm font-black uppercase text-white flex items-center space-x-2">
                      <Map className="w-4.5 h-4.5 text-rose-500" />
                      <span>Live GIS GPS Emergency Map</span>
                    </h3>
                    <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] px-2 py-0.5 rounded font-black">
                      ACTIVE SATELLITE RADAR
                    </span>
                  </div>

                  {/* Simulated map canvas */}
                  <div className="relative bg-slate-950 h-80 rounded-xl my-4 border border-slate-900 overflow-hidden flex items-center justify-center">
                    {/* SVG Map Lines Representation */}
                    <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 50 Q 150 120 300 50 T 600 50" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
                      <path d="M 50 0 Q 150 200 150 400" fill="none" stroke="#2563eb" strokeWidth="1" />
                      <path d="M 250 0 L 250 400" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,3" />
                      <circle cx="250" cy="180" r="40" fill="none" stroke="#e11d48" strokeWidth="1" className="animate-pulse" />
                    </svg>

                    {/* Interactive Incidents points on map */}
                    {incidents.map((inc, i) => (
                      <div
                        key={inc.id}
                        style={{ top: `${20 + i * 28}%`, left: `${25 + i * 35}%` }}
                        className="absolute flex flex-col items-center cursor-pointer group"
                      >
                        <div className="w-4 h-4 bg-red-650 bg-red-600 rounded-full flex items-center justify-center animate-ping absolute" />
                        <div className="w-3.5 h-3.5 bg-red-650 bg-red-600 rounded-full border border-white flex items-center justify-center relative z-10">
                          <AlertOctagon className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="bg-slate-900 border border-slate-800 text-[8px] font-black text-white px-1.5 py-0.5 rounded absolute -bottom-5 whitespace-nowrap shadow-xl">
                          {inc.id}
                        </span>
                      </div>
                    ))}

                    {/* Ambulance GPS dots on map */}
                    {ambulances.map((amb, i) => (
                      <div
                        key={amb.id}
                        style={{ top: `${45 + i * 20}%`, left: `${30 + i * 22}%` }}
                        className="absolute flex flex-col items-center cursor-pointer group"
                      >
                        <div className="w-3 h-3 bg-indigo-500 rounded-full border border-white flex items-center justify-center relative z-10 animate-bounce">
                          <Ambulance className="w-2 h-2 text-white" />
                        </div>
                        <span className="bg-slate-900 border border-slate-800 text-[8px] font-black text-indigo-400 px-1.5 py-0.5 rounded absolute -bottom-5 whitespace-nowrap shadow-xl">
                          {amb.id} (ETA: {4 + i * 5}m)
                        </span>
                      </div>
                    ))}

                    {/* Hospital Headquarters */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-7 h-7 bg-rose-600 rounded-xl flex items-center justify-center border-2 border-white shadow-xl">
                        <Building className="w-4 h-4 text-white" />
                      </div>
                      <span className="bg-slate-900 border border-slate-800 text-[9px] font-black text-white px-2 py-0.5 rounded mt-1.5 whitespace-nowrap">
                        MCGM Base Hospital
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg text-[9px] space-y-1">
                      <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-red-650 bg-red-600"></span><span className="text-gray-400 font-bold">MCI Incident Hotspot</span></div>
                      <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span><span className="text-gray-400 font-bold">En-Route Ambulance</span></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-800/50">
                    <span>GPS Signal Strength: 98% (High Accuracy)</span>
                    <button 
                      onClick={() => triggerToast('Route Recalculated', 'All ambulance routes updated with current Bandra traffic indices.', 'success')}
                      className="text-rose-500 font-bold hover:underline cursor-pointer"
                    >
                      Optimize All Routes
                    </button>
                  </div>
                </div>

                {/* Right Area: Trauma Bays & Critical Queue */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-white border-b border-gray-800/60 pb-3 flex items-center space-x-2">
                      <Siren className="w-4.5 h-4.5 text-rose-500" />
                      <span>Trauma Bay Occupancy</span>
                    </h3>

                    <div className="space-y-3.5">
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="text-white font-bold block">Trauma Bay 1 (MCI Red)</span>
                          <span className="text-rose-500 font-black text-[9px] mt-0.5 block">OCCUPIED - Santosh Patil</span>
                        </div>
                        <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded text-[8px] font-bold">RED CASE</span>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="text-white font-bold block">Trauma Bay 2 (Resus Bed)</span>
                          <span className="text-amber-500 font-black text-[9px] mt-0.5 block">OCCUPIED - Rohan Shinde</span>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-bold">YELLOW CASE</span>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="text-white font-bold block">Trauma Bay 3 (Fast Track)</span>
                          <span className="text-emerald-400 font-bold text-[9px] mt-0.5 block">AVAILABLE</span>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold">OPEN</span>
                      </div>
                    </div>
                  </div>

                  {/* Bed Capacity and quick actions */}
                  <div className="pt-4 border-t border-gray-800/60 mt-4 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Critical Bed Ledger</span>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-gray-400">ICU Open Beds</span>
                        <span className="text-white font-black block mt-0.5">3 / 24 Beds</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-gray-400">OT Available Rooms</span>
                        <span className="text-emerald-400 font-black block mt-0.5">2 Open</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incoming Ambulances Queue */}
              <div className={`p-6 rounded-2xl border ${
                isDisasterMode 
                  ? 'bg-[#220d0d] border-red-950' 
                  : isDarkMode 
                    ? 'bg-[#0f172a] border-gray-800' 
                    : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-sm font-black uppercase text-white border-b border-gray-800/60 pb-3 flex items-center space-x-2">
                  <Ambulance className="w-5 h-5 text-indigo-400" />
                  <span>Incoming Ambulances Transit Log</span>
                </h3>

                <div className="mt-4 space-y-3">
                  {patients.filter(p => p.status === 'EN_ROUTE' || p.status === 'DISPATCHED').map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setActiveTab('paramedic');
                      }}
                      className="bg-slate-900 border border-slate-800 hover:border-rose-500 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between cursor-pointer transition-all hover:scale-[1.005]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs font-black text-white">{p.name}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                            p.triageCategory === 'RED' ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {p.triageCategory} TRIAGE
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-450 text-gray-400">Mechanism: {p.injuryMechanism}</p>
                      </div>

                      <div className="flex items-center space-x-6 mt-3 md:mt-0">
                        <div className="text-[10px]">
                          <span className="text-gray-500">Ambulance:</span>
                          <span className="text-white font-bold block">{p.ambulanceId}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-gray-500">Live Vitals:</span>
                          <span className="text-rose-400 font-bold block">HR {p.vitals.hr} • SpO2 {p.vitals.spo2}%</span>
                        </div>
                        <div className="text-[10px] text-right">
                          <span className="text-gray-500">ETA:</span>
                          <span className="text-rose-500 font-black block">{p.etaMinutes} mins</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI DISPATCHER WORKSPACE */}
          {activeTab === 'dispatcher' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">AI Emergency Dispatch Center</h2>
                    <p className="text-[10px] text-gray-400">Smart vehicle allocation recommendations & triage prioritization</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Block: Log Incident Request form */}
                <div className={`p-6 rounded-2xl border ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-gray-800 pb-3 block mb-4">Log Emergency Incident</h3>
                  
                  <form onSubmit={handleCreateIncident} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-450 text-gray-400 uppercase">Incident Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Major Accident on JJ Flyover"
                        value={newIncidentRequest.title}
                        onChange={(e) => setNewIncidentRequest({ ...newIncidentRequest, title: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-450 text-gray-400 uppercase">Location Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Bandra West, Near Mosque"
                        value={newIncidentRequest.location}
                        onChange={(e) => setNewIncidentRequest({ ...newIncidentRequest, location: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-450 text-gray-400 uppercase">Severity</label>
                        <select
                          value={newIncidentRequest.severity}
                          onChange={(e) => setNewIncidentRequest({ ...newIncidentRequest, severity: e.target.value as any })}
                          className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none cursor-pointer"
                        >
                          <option value="MEDIUM">Medium Severity</option>
                          <option value="HIGH">High Severity</option>
                          <option value="CRITICAL">Critical Severity</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-450 text-gray-400 uppercase">Estimated Victims</label>
                        <input
                          type="number"
                          value={newIncidentRequest.victimsCount}
                          onChange={(e) => setNewIncidentRequest({ ...newIncidentRequest, victimsCount: Number(e.target.value) })}
                          className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-450 text-gray-400 uppercase">Incident Type</label>
                      <select
                        value={newIncidentRequest.type}
                        onChange={(e) => setNewIncidentRequest({ ...newIncidentRequest, type: e.target.value as any })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none cursor-pointer"
                      >
                        <option value="ROAD_ACCIDENT">Road Accident</option>
                        <option value="FIRE_INCIDENT">Fire Incident</option>
                        <option value="BUILDING_COLLAPSE">Building Collapse</option>
                        <option value="MEDICAL_OUTBREAK">Medical Outbreak</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl mt-2 w-full transition-all shadow-md cursor-pointer"
                    >
                      Log & Auto-Route Dispatch
                    </button>
                  </form>
                </div>

                {/* Right block: Live Incident Queue & Dispatch Decisions */}
                <div className="lg:col-span-2 space-y-4">
                  <div className={`p-6 rounded-2xl border ${
                    isDisasterMode 
                      ? 'bg-[#220d0d] border-red-950' 
                      : isDarkMode 
                        ? 'bg-[#0f172a] border-gray-800' 
                        : 'bg-white border-gray-200'
                  }`}>
                    <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-gray-800 pb-3 mb-4 flex items-center justify-between">
                      <span>Active Incidents Queue</span>
                      <span className="text-[9px] bg-slate-800 text-gray-300 px-2 py-0.5 rounded font-black font-mono">
                        {incidents.length} INCIDENTS
                      </span>
                    </h3>

                    <div className="space-y-3">
                      {incidents.map(inc => (
                        <div key={inc.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-black text-white">{inc.title}</span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                inc.severity === 'CRITICAL' ? 'bg-red-650 bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-gray-300'
                              }`}>
                                {inc.severity}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400">Location: {inc.location} • Victims: {inc.victimsCount} patients</p>
                            <span className="text-[9px] text-gray-500 font-mono">Logged: {new Date(inc.reportedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                triggerToast('Ambulance Dispatched', `AMB-MCGM-12 routed to ${inc.location}. ETA: 7 mins.`, 'success');
                                setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: 'RESOLVED' } : i));
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              Route Ambulance
                            </button>
                            <button
                              onClick={() => {
                                setIncidents(prev => prev.filter(i => i.id !== inc.id));
                                triggerToast('Incident Resolved', 'Incident marked resolved and archived.', 'success');
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-gray-300 text-[10px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMBULANCE FLEET STATUS */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Ambulance className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Ambulance Fleet & Equipment Dashboard</h2>
                    <p className="text-[10px] text-gray-400">GPS locations, crew assignments, fuel levels, and critical device telemetry</p>
                  </div>
                </div>
              </div>

              {/* Fleet status cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ambulances.map(amb => (
                  <div key={amb.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-white">{amb.id}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{amb.location.name}</p>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                        amb.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {amb.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between"><span className="text-gray-500">Driver:</span><span className="text-white font-bold">{amb.driver}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">EMT / Paramedic:</span><span className="text-white font-bold">{amb.paramedic}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Fuel Level:</span><span className="text-white font-bold">{amb.fuel}%</span></div>
                    </div>

                    {/* Equipment Checklist Status */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-2.5 text-[9px]">
                      <span className="font-bold text-gray-400 block uppercase">Equipment telemetry</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-1.5">
                          <Check className={`w-3.5 h-3.5 ${amb.equipmentCheck.aed ? 'text-emerald-400' : 'text-rose-500'}`} />
                          <span>AED Defibrillator</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Check className={`w-3.5 h-3.5 ${amb.equipmentCheck.ventilator ? 'text-emerald-400' : 'text-rose-500'}`} />
                          <span>Ventilator</span>
                        </div>
                        <div className="flex items-center space-x-1.5 col-span-2">
                          <Droplet className="w-3.5 h-3.5 text-sky-400" />
                          <span>Oxygen Reserve: {amb.equipmentCheck.oxygen}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerToast('Telemetry Sync', `Forced sensor reload on ${amb.id}. Device tests passed.`, 'success')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Sync Device Telemetry
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PARAMEDIC PRE-HOSPITAL CARE APP */}
          {activeTab === 'paramedic' && selectedPatient && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800/60 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Paramedic Incident Field Assessment</h2>
                    <p className="text-[10px] text-gray-400">Order ID: {selectedPatient.id} • Patient: {selectedPatient.name}</p>
                  </div>
                </div>

                {/* Telemedicine consult button */}
                <button
                  onClick={() => {
                    setTelemedicineActive(!telemedicineActive);
                    if (!telemedicineActive) {
                      setTimeout(() => setTelemedicineConnected(true), 2000);
                    } else {
                      setTelemedicineConnected(false);
                    }
                  }}
                  className={`flex items-center space-x-2 text-xs font-black px-4.5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer ${
                    telemedicineActive 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                      : 'bg-indigo-650 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{telemedicineActive ? 'DISCONNECT MD CONSULT' : 'START TELEMEDICINE CONSULT'}</span>
                </button>
              </div>

              {/* Main paramedic dashboard grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Telemedicine Video Box */}
                {telemedicineActive && (
                  <div className="lg:col-span-3 bg-slate-950 border border-indigo-500/35 rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-xs font-black text-indigo-400 flex items-center space-x-2">
                        <Video className="w-4 h-4 animate-pulse text-rose-500" />
                        <span>Live Telemedicine Link: Dr. Ramesh Patil (ER Chief)</span>
                      </span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">
                        {telemedicineConnected ? 'CONNECTED' : 'CALLING MD...'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 bg-slate-900 rounded-xl overflow-hidden relative">
                      {telemedicineConnected ? (
                        <>
                          <div className="bg-slate-950 flex items-center justify-center text-white relative">
                            <span className="absolute top-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[8px] font-bold">MD FEED</span>
                            <img
                              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=200"
                              alt="Doctor Feed"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="bg-slate-950 flex items-center justify-center text-white relative">
                            <span className="absolute top-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[8px] font-bold">AMBULANCE IN-CABIN FEED</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] text-gray-500">Transmitting high-res vitals & ECG...</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 flex flex-col items-center justify-center space-y-2">
                          <Siren className="w-8 h-8 text-indigo-400 animate-spin" />
                          <span className="text-xs text-gray-400">Initiating peer-to-peer WebRTC connection...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Left Panel: Field Vitals log */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-gray-800 pb-2">Pre-Hospital Vitals</h3>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-450 text-gray-400">Heart Rate (bpm)</span>
                        <span className="text-rose-500 font-black">{selectedPatient.vitals.hr}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-450 text-gray-400">Blood Pressure</span>
                        <span className="text-white font-bold">{selectedPatient.vitals.bp}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-450 text-gray-400">Respiratory Rate (rpm)</span>
                        <span className="text-white font-bold">{selectedPatient.vitals.rr}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-450 text-gray-400">Oxygen Saturation (%)</span>
                        <span className="text-rose-400 font-black">{selectedPatient.vitals.spo2}%</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block mb-2">Trauma & Injury Overview</span>
                      <p className="text-[11px] text-white leading-normal bg-slate-950 p-3 rounded-lg border border-slate-900">
                        {selectedPatient.injuryMechanism}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => triggerToast('Clinical Note Synced', 'Paramedic voice note added to patient longitudinal record.', 'success')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Add Voice Note
                    </button>
                  </div>
                </div>

                {/* Center / Right: Clinical Score Calculations */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-gray-800 pb-2">Glasgow Coma Scale & Trauma Score Calculator</h3>
                    
                    {/* GCS Interactive Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Eye Opening (1-4)</label>
                        <select
                          value={triageInputs.gcsEye}
                          onChange={(e) => setTriageInputs({ ...triageInputs, gcsEye: Number(e.target.value) })}
                          className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                        >
                          <option value="4">4 - Spontaneous</option>
                          <option value="3">3 - To Sound</option>
                          <option value="2">2 - To Pressure</option>
                          <option value="1">1 - None</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Verbal Response (1-5)</label>
                        <select
                          value={triageInputs.gcsVerbal}
                          onChange={(e) => setTriageInputs({ ...triageInputs, gcsVerbal: Number(e.target.value) })}
                          className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                        >
                          <option value="5">5 - Oriented</option>
                          <option value="4">4 - Confused</option>
                          <option value="3">3 - Inappropriate Words</option>
                          <option value="2">2 - Incomprehensible Sounds</option>
                          <option value="1">1 - None</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Motor Response (1-6)</label>
                        <select
                          value={triageInputs.gcsMotor}
                          onChange={(e) => setTriageInputs({ ...triageInputs, gcsMotor: Number(e.target.value) })}
                          className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                        >
                          <option value="6">6 - Obeys Commands</option>
                          <option value="5">5 - Localising Pain</option>
                          <option value="4">4 - Normal Flexion Withdrawal</option>
                          <option value="3">3 - Abnormal Flexion (Decorticate)</option>
                          <option value="2">2 - Extension (Decerebrate)</option>
                          <option value="1">1 - None</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Calculated GCS Score</span>
                        <span className="text-2xl font-black text-rose-500 block mt-1">{calculatedGCS} / 15</span>
                        <span className="text-[8px] text-gray-400 block mt-1">
                          {calculatedGCS <= 8 ? 'Comatose / Severe Head Injury' : calculatedGCS <= 12 ? 'Moderate Injury' : 'Minor/No Head Injury'}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Revised Trauma Score (RTS)</span>
                        <span className="text-2xl font-black text-white block mt-1">
                          {calculatedGCS <= 8 ? '5.24' : '7.84'}
                        </span>
                        <span className="text-[8px] text-emerald-450 block mt-1 text-emerald-400">Probability of survival: 94.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleUpdatePatientStatus(selectedPatient.id, 'ARRIVED')}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Confirm Arrival & Route to Triage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ESI/START TRIAGE & TRAUMA */}
          {activeTab === 'triage' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Emergency Triage & Trauma Board</h2>
                    <p className="text-[10px] text-gray-400">Assign ESI color coding, review clinical guideline recommendations, and lock patient codes</p>
                  </div>
                </div>
              </div>

              {/* Triage Queue lists */}
              <div className={`p-6 rounded-2xl border ${
                isDisasterMode 
                  ? 'bg-[#220d0d] border-red-950' 
                  : isDarkMode 
                    ? 'bg-[#0f172a] border-gray-800' 
                    : 'bg-white border-gray-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase font-black">
                        <th className="pb-3">Patient Name</th>
                        <th className="pb-3">Age/Gender</th>
                        <th className="pb-3">Mechanism of Injury</th>
                        <th className="pb-3">GCS</th>
                        <th className="pb-3">Clinical Status</th>
                        <th className="pb-3">Triage Category</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40 text-xs">
                      {patients.map(p => (
                        <tr key={p.id} className="hover:bg-slate-900/30">
                          <td className="py-3 font-bold text-white">
                            <span>{p.name}</span>
                            <span className="text-[9px] text-gray-400 block font-mono">ABHA: {p.abhaId}</span>
                          </td>
                          <td className="py-3 text-gray-300 font-bold">{p.age} Y / {p.gender}</td>
                          <td className="py-3 text-gray-400 font-medium max-w-xs truncate">{p.injuryMechanism}</td>
                          <td className="py-3 font-mono font-bold text-rose-400">{p.gcs} / 15</td>
                          <td className="py-3">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              p.status === 'ARRIVED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-gray-300'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${
                              p.triageCategory === 'RED' 
                                ? 'bg-rose-500 text-white animate-pulse' 
                                : p.triageCategory === 'YELLOW' 
                                  ? 'bg-amber-500 text-slate-950' 
                                  : p.triageCategory === 'GREEN' 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-slate-800 text-gray-300'
                            }`}>
                              {p.triageCategory}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {p.triageCategory === 'PENDING' ? (
                              <div className="flex justify-end space-x-1.5">
                                <button
                                  onClick={() => handleConfirmTriage(p.id, 'RED')}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer"
                                >
                                  RED
                                </button>
                                <button
                                  onClick={() => handleConfirmTriage(p.id, 'YELLOW')}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] px-2 py-1 rounded cursor-pointer"
                                >
                                  YELLOW
                                </button>
                                <button
                                  onClick={() => handleConfirmTriage(p.id, 'GREEN')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer"
                                >
                                  GREEN
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedPatient(p);
                                  setActiveTab('paramedic');
                                }}
                                className="text-rose-500 hover:underline font-bold text-[10px] cursor-pointer"
                              >
                                View Timeline
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DISASTER MANAGEMENT CENTER */}
          {activeTab === 'disaster' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Disaster Response & Mass Casualty Coordination</h2>
                    <p className="text-[10px] text-gray-400">MCGM emergency protocols, NGO coordination lines, volunteer management registries</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Active Alert Level</span>
                  <div className="flex space-x-1">
                    {['LEVEL_1', 'LEVEL_2', 'LEVEL_3'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setDisasterLevel(lvl as any);
                          triggerToast('MCI Alert Escalated', `Disaster alert changed to ${lvl}`, 'warning');
                        }}
                        className={`text-[9px] font-black px-2.5 py-1 rounded ${
                          disasterLevel === lvl 
                            ? 'bg-red-650 bg-red-600 text-white' 
                            : 'bg-slate-900 text-gray-500'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disaster Dashboard Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Situation report summary */}
                <div className={`p-6 rounded-2xl border lg:col-span-2 space-y-4 ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-xs font-black uppercase text-red-400 border-b border-gray-850 pb-2">Active Situation Report</h3>
                  <textarea
                    value={situationReport}
                    onChange={(e) => setSituationReport(e.target.value)}
                    rows={4}
                    className="bg-slate-950 border border-slate-900 text-xs font-bold text-white p-4 rounded-xl w-full outline-none resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-500">Last updated: Just now via MCGM control room</span>
                    <button
                      onClick={() => triggerToast('Report Published', 'Broadcasted new situation report to emergency department leads.', 'success')}
                      className="bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Publish Broadcast
                    </button>
                  </div>
                </div>

                {/* Volunteer & NGO coordination card */}
                <div className={`p-6 rounded-2xl border space-y-4 ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-gray-850 pb-2">Civil & NGO Resource Registry</h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">Red Cross Mumbai Chapter</span>
                        <span className="text-[9px] text-gray-500">12 emergency volunteers active</span>
                      </div>
                      <span className="text-emerald-400 font-bold">STANDBY</span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">NDRF Team 4 Dispatch</span>
                        <span className="text-[9px] text-gray-500">Saki Naka location deployment</span>
                      </div>
                      <span className="text-red-500 font-black animate-pulse">DEPLOYED</span>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerToast('Emergency Call Out', 'SMS and email notifications sent to all registered disaster volunteers.', 'success')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs py-2.5 rounded-xl transition-all"
                  >
                    Call for NGO volunteers
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: RESPONSE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Trauma response metrics</h2>
                    <p className="text-[10px] text-gray-400">Door-to-Triage, Door-to-Doctor, Door-to-CT, Door-to-Balloon indicators</p>
                  </div>
                </div>
              </div>

              {/* Analytics metrics grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-gray-800 pb-2">Average response timelines</h3>
                  
                  <div className="space-y-3.5 mt-4">
                    {[
                      { name: 'Door-to-Triage time', duration: '1.4 minutes', percent: 94 },
                      { name: 'Door-to-Doctor review', duration: '4.8 minutes', percent: 86 },
                      { name: 'Door-to-CT Imaging scan', duration: '18.2 minutes', percent: 72 },
                      { name: 'Door-to-Balloon (ACS Protocol)', duration: '58.5 minutes', percent: 90 },
                    ].map(metric => (
                      <div key={metric.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-white font-bold">{metric.name}</span>
                          <span className="text-indigo-455 text-indigo-400 font-bold">{metric.duration}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-600 rounded-full" style={{ width: `${metric.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDisasterMode 
                    ? 'bg-[#220d0d] border-red-950' 
                    : isDarkMode 
                      ? 'bg-[#0f172a] border-gray-800' 
                      : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-gray-800 pb-2">AI Incident Prediction Matrix</h3>
                  
                  <div className="space-y-3.5 mt-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-bold block">Weekend Road Traffic Accident Spike</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Predicted based on rain forecast and congestion indices</p>
                      </div>
                      <span className="text-rose-400 font-black">+20% risk increase</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-bold block">Blood Bank Reserve Demand</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">O Negative blood component pre-orders recommended</p>
                      </div>
                      <span className="text-amber-400 font-black">2 units recommended</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-bold block">Critical Care ICU Bed Shortage</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">High probability of bed exhaustion within 12 hours</p>
                      </div>
                      <span className="text-rose-500 font-black">95% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
