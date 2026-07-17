import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Brain,
  Calendar,
  FileText,
  User,
  Bell,
  ChevronRight,
  ArrowRight,
  LogOut,
  Check,
  X,
  Plus,
  Moon,
  Sun,
  Search,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  LayoutGrid,
  Heart,
  ShieldAlert,
  Sparkles,
  Send,
  Settings,
  BookOpen,
  Layers,
  Award,
  BarChart2,
  Eye,
  ShieldCheck,
  Thermometer,
  Clock,
  CheckSquare,
  Volume2,
  QrCode,
  Lock,
  Share2,
  Link,
  Download,
  Wifi,
  WifiOff,
  Zap,
  Timer,
  TrendingUp,
  Server,
  HardDrive,
  Siren,
  Printer,
  Copy,
  FolderOpen,
  Users,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  SearchCode,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle,
  Truck,
  Droplet,
  Smartphone,
  CheckCircle2,
  Info
} from 'lucide-react';

interface Medicine {
  sku: string;
  genericName: string;
  brandName: string;
  manufacturer: string;
  category: 'Antibiotic' | 'Analgesic' | 'Cardiac' | 'Diabetic' | 'Respiratory' | 'Immunology' | 'Vaccine' | 'General';
  storageConditions: string;
  isColdChain: boolean;
  stockLevel: number;
  minThreshold: number;
  batchNumber: string;
  expiryDate: string;
  location: string; // e.g. "Rack A, Shelf 2, Bin 4"
  price: number;
  isGovernmentSchemeEligible: boolean; // e.g. Mahatma Jyotiba Phule Jan Arogya Yojana
  isJanAushadhi: boolean;
}

interface Prescription {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  abhaId: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  allergies: string[];
  currentMedicines: string[];
  medicationsOrdered: {
    medicineName: string; // Generic / Brand
    dosage: string; // e.g. "650 mg"
    frequency: string; // e.g. "TDS (Thrice Daily)"
    duration: string; // e.g. "5 Days"
    quantity: number;
    instructions: string; // e.g. "Post Meals"
  }[];
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: 'PENDING' | 'VERIFYING' | 'PICKING' | 'VERIFIED' | 'DISPENSED' | 'CANCELLED';
  createdAt: string;
}

interface ColdChainSensor {
  id: string;
  name: string;
  temperature: number; // in Celsius
  humidity: number; // in %
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  lastUpdated: string;
}

interface ProcurementRequest {
  id: string;
  medicineName: string;
  quantity: number;
  priority: 'ROUTINE' | 'URGENT';
  supplier: string;
  estimatedCost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED' | 'RECEIVED';
  requestedAt: string;
}

interface RecallAlert {
  id: string;
  medicineName: string;
  batchNumber: string;
  reason: string;
  severity: 'HIGH' | 'MEDIUM';
  status: 'ACTIVE' | 'ISOLATED' | 'COMPLETED';
  dateReceived: string;
  affectedPatientsCount: number;
}

// Seed mock data
const initialMedicines: Medicine[] = [
  {
    sku: 'MED-PAR-650',
    genericName: 'Paracetamol',
    brandName: 'Calpol',
    manufacturer: 'GSK Pharmaceuticals',
    category: 'Analgesic',
    storageConditions: 'Store below 30°C',
    isColdChain: false,
    stockLevel: 1250,
    minThreshold: 500,
    batchNumber: 'B-P4028',
    expiryDate: '2027-09-12',
    location: 'Rack A, Shelf 1, Bin 2',
    price: 15,
    isGovernmentSchemeEligible: true,
    isJanAushadhi: true
  },
  {
    sku: 'MED-AMO-500',
    genericName: 'Amoxicillin',
    brandName: 'Novamox',
    manufacturer: 'Alkem Laboratories',
    category: 'Antibiotic',
    storageConditions: 'Store below 25°C',
    isColdChain: false,
    stockLevel: 180,
    minThreshold: 300, // Low stock
    batchNumber: 'B-A9012',
    expiryDate: '2026-12-05',
    location: 'Rack B, Shelf 3, Bin 1',
    price: 45,
    isGovernmentSchemeEligible: true,
    isJanAushadhi: true
  },
  {
    sku: 'MED-COV-VAC',
    genericName: 'Covishield Vaccine',
    brandName: 'Covishield',
    manufacturer: 'Serum Institute of India',
    category: 'Vaccine',
    storageConditions: 'Store at 2°C to 8°C',
    isColdChain: true,
    stockLevel: 600,
    minThreshold: 200,
    batchNumber: 'B-CS552',
    expiryDate: '2026-08-30',
    location: 'Cold Storage Room 1, Refrigerator B',
    price: 0, // Free vaccine scheme
    isGovernmentSchemeEligible: true,
    isJanAushadhi: false
  },
  {
    sku: 'MED-MET-500',
    genericName: 'Metformin',
    brandName: 'Glycomet',
    manufacturer: 'USV Private Ltd',
    category: 'Diabetic',
    storageConditions: 'Store below 25°C',
    isColdChain: false,
    stockLevel: 3000,
    minThreshold: 1000,
    batchNumber: 'B-M8811',
    expiryDate: '2028-02-14',
    location: 'Rack C, Shelf 2, Bin 4',
    price: 22,
    isGovernmentSchemeEligible: true,
    isJanAushadhi: true
  },
  {
    sku: 'MED-ATR-025',
    genericName: 'Atorvastatin',
    brandName: 'Lipitor',
    manufacturer: 'Pfizer India',
    category: 'Cardiac',
    storageConditions: 'Store below 25°C',
    isColdChain: false,
    stockLevel: 90,
    minThreshold: 250, // Low stock
    batchNumber: 'B-AT0922',
    expiryDate: '2026-06-15', // Near expiry
    location: 'Rack C, Shelf 4, Bin 1',
    price: 110,
    isGovernmentSchemeEligible: true,
    isJanAushadhi: true
  },
  {
    sku: 'MED-INS-GLA',
    genericName: 'Insulin Glargine',
    brandName: 'Lantus SoloStar',
    manufacturer: 'Sanofi India',
    category: 'Vaccine', // Category mismatch or diabetic cold chain
    storageConditions: 'Store at 2°C to 8°C (Do not freeze)',
    isColdChain: true,
    stockLevel: 45,
    minThreshold: 50, // Low stock
    batchNumber: 'B-IN8892',
    expiryDate: '2026-10-22',
    location: 'Cold Storage Room 1, Refrigerator A',
    price: 680,
    isGovernmentSchemeEligible: true,
    isJanAushadhi: false
  },
  {
    sku: 'MED-AZI-500',
    genericName: 'Azithromycin',
    brandName: 'Azee',
    manufacturer: 'Cipla India',
    category: 'Antibiotic',
    storageConditions: 'Store below 30°C',
    isColdChain: false,
    stockLevel: 800,
    minThreshold: 200,
    batchNumber: 'B-AZ7719',
    expiryDate: '2027-04-18',
    location: 'Rack B, Shelf 1, Bin 5',
    price: 72,
    isGovernmentSchemeEligible: true,
    isJanAushadhi: true
  }
];

const initialPrescriptions: Prescription[] = [
  {
    id: 'PR-2026-001',
    patientName: 'Devendra Mahadev Sawant',
    age: 48,
    gender: 'Male',
    abhaId: 'devendra.sawant@abha',
    doctorName: 'Dr. Ramesh Patil',
    department: 'General Medicine',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    allergies: ['Penicillin'],
    currentMedicines: ['Metformin 500mg BD'],
    medicationsOrdered: [
      {
        medicineName: 'Azithromycin 500mg',
        dosage: '500 mg',
        frequency: 'OD (Once Daily)',
        duration: '5 Days',
        quantity: 5,
        instructions: 'Post Meals'
      },
      {
        medicineName: 'Paracetamol 650mg',
        dosage: '650 mg',
        frequency: 'TDS (Thrice Daily) PRN',
        duration: '3 Days',
        quantity: 9,
        instructions: 'For fever above 100 F'
      }
    ],
    priority: 'ROUTINE',
    status: 'PENDING',
    createdAt: '2026-07-09T09:15:00Z'
  },
  {
    id: 'PR-2026-002',
    patientName: 'Aarti Vijay Tambe',
    age: 62,
    gender: 'Female',
    abhaId: 'aarti.tambe@abha',
    doctorName: 'Dr. Sandeep Kelkar',
    department: 'Cardiology',
    diagnosis: 'Hypertension & Hyperlipidemia',
    allergies: [],
    currentMedicines: ['Amlodipine 5mg OD'],
    medicationsOrdered: [
      {
        medicineName: 'Atorvastatin 10mg',
        dosage: '10 mg',
        frequency: 'HS (At Bedtime)',
        duration: '30 Days',
        quantity: 30,
        instructions: 'Avoid grapefruit juice'
      }
    ],
    priority: 'URGENT',
    status: 'VERIFYING',
    createdAt: '2026-07-09T09:40:00Z'
  },
  {
    id: 'PR-2026-003',
    patientName: 'Master Aarav Deshmukh',
    age: 6,
    gender: 'Male',
    abhaId: 'aarav.deshmukh@abha',
    doctorName: 'Dr. Sneha Limaye',
    department: 'Pediatrics',
    diagnosis: 'Acute Gastroenteritis',
    allergies: [],
    currentMedicines: [],
    medicationsOrdered: [
      {
        medicineName: 'Paracetamol 250mg Oral Suspension',
        dosage: '5 ml',
        frequency: 'TDS (Thrice Daily)',
        duration: '3 Days',
        quantity: 1,
        instructions: 'Post Meals'
      }
    ],
    priority: 'EMERGENCY',
    status: 'PENDING',
    createdAt: '2026-07-09T10:10:00Z'
  }
];

const initialSensors: ColdChainSensor[] = [
  {
    id: 'SENS-01',
    name: 'Vaccine Fridge Room 1 (Ref A)',
    temperature: 4.2,
    humidity: 45,
    status: 'OPTIMAL',
    lastUpdated: '2026-07-09T11:25:00Z'
  },
  {
    id: 'SENS-02',
    name: 'Insulin Storage (Ref B)',
    temperature: 8.9, // Warming alert
    humidity: 50,
    status: 'WARNING',
    lastUpdated: '2026-07-09T11:28:00Z'
  },
  {
    id: 'SENS-03',
    name: 'Clinical Raw Agent (Room 2)',
    temperature: 2.1,
    humidity: 38,
    status: 'OPTIMAL',
    lastUpdated: '2026-07-09T11:20:00Z'
  }
];

const initialProcurements: ProcurementRequest[] = [
  {
    id: 'PRQ-2026-90',
    medicineName: 'Amoxicillin 500mg Capsule',
    quantity: 5000,
    priority: 'URGENT',
    supplier: 'GlaxoSmithKline India',
    estimatedCost: 225000,
    status: 'APPROVED',
    requestedAt: '2026-07-08T09:00:00Z'
  },
  {
    id: 'PRQ-2026-91',
    medicineName: 'Atorvastatin 10mg Tablet',
    quantity: 10000,
    priority: 'ROUTINE',
    supplier: 'Cipla Pharmaceuticals Ltd',
    estimatedCost: 110000,
    status: 'PENDING',
    requestedAt: '2026-07-09T05:30:00Z'
  }
];

const initialRecallAlerts: RecallAlert[] = [
  {
    id: 'REC-2026-12',
    medicineName: 'Metformin 500mg ER',
    batchNumber: 'B-M8811',
    reason: 'Possible NDMA impurity above acceptable daily intake limit',
    severity: 'HIGH',
    status: 'ACTIVE',
    affectedPatientsCount: 18,
    dateReceived: '2026-07-08T18:00:00Z'
  }
];

interface PharmacyDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function PharmacyDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: PharmacyDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dispense' | 'inventory' | 'coldchain' | 'procurement' | 'recalls' | 'analytics'>('dashboard');
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [sensors, setSensors] = useState<ColdChainSensor[]>(initialSensors);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>(initialProcurements);
  const [recallAlerts, setRecallAlerts] = useState<RecallAlert[]>(initialRecallAlerts);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Workstation States
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription>(initialPrescriptions[0]);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [pharmacistPin, setPharmacistPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'marathi' | 'hindi'>('english');
  const [isCounselingSpeaking, setIsCounselingSpeaking] = useState(false);

  // New Medicine form states
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({
    sku: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    category: 'General',
    storageConditions: '',
    isColdChain: false,
    stockLevel: 100,
    minThreshold: 20,
    batchNumber: '',
    expiryDate: '',
    location: '',
    price: 0,
    isGovernmentSchemeEligible: true,
    isJanAushadhi: false
  });

  // Procurement request states
  const [isRequestingProcurement, setIsRequestingProcurement] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<ProcurementRequest>>({
    medicineName: '',
    quantity: 1000,
    priority: 'ROUTINE',
    supplier: '',
    estimatedCost: 15000
  });

  // UI Toast system
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const triggerToast = (title: string, desc: string, type: 'success' | 'warning' | 'error') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keyboard shortcut listener (Ctrl+K focus search, Alt+D navigate, etc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('pharmacy-global-search');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // AI Assistant Analysis State
  const lowStockCount = medicines.filter(m => m.stockLevel <= m.minThreshold).length;
  const criticalMedicines = medicines.filter(m => m.category === 'Cardiac' || m.category === 'Immunology');
  const expiryCount = medicines.filter(m => new Date(m.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000).length;

  const handleDispenseMedicine = (prescriptionId: string) => {
    if (!pharmacistPin || pharmacistPin !== '1234') {
      setPinError(true);
      triggerToast('Verification Failed', 'Invalid Pharmacist Credential PIN', 'error');
      return;
    }
    setPinError(false);

    // Deduct stock levels in state
    const rx = prescriptions.find(p => p.id === prescriptionId);
    if (!rx) return;

    let hasStockIssues = false;
    const updatedMedicines = medicines.map(med => {
      const match = rx.medicationsOrdered.find(ord => ord.medicineName.toLowerCase().includes(med.genericName.toLowerCase()) || ord.medicineName.toLowerCase().includes(med.brandName.toLowerCase()));
      if (match) {
        if (med.stockLevel < match.quantity) {
          hasStockIssues = true;
          return med;
        }
        return { ...med, stockLevel: med.stockLevel - match.quantity };
      }
      return med;
    });

    if (hasStockIssues) {
      triggerToast('Stock Error', 'Insufficient stock to fulfill full prescription quantity.', 'error');
      return;
    }

    setMedicines(updatedMedicines);
    setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? { ...p, status: 'DISPENSED' } : p));
    triggerToast('Medication Dispensed', `Successfully verified & dispensed prescription for ${rx.patientName}`, 'success');
    setPharmacistPin('');
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.genericName || !newMedicine.sku) {
      triggerToast('Missing Fields', 'Please complete all required fields.', 'error');
      return;
    }
    setMedicines([...medicines, newMedicine as Medicine]);
    setIsAddingMedicine(false);
    triggerToast('Medicine Registered', `Added SKU ${newMedicine.sku} to Medicine Master.`, 'success');
  };

  const handleCreateProcurementRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.medicineName || !newRequest.supplier) {
      triggerToast('Missing Fields', 'Please complete all required fields.', 'error');
      return;
    }
    const req: ProcurementRequest = {
      id: `PRQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      medicineName: newRequest.medicineName,
      quantity: Number(newRequest.quantity),
      priority: newRequest.priority as 'ROUTINE' | 'URGENT',
      supplier: newRequest.supplier,
      estimatedCost: Number(newRequest.estimatedCost),
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };
    setProcurements([req, ...procurements]);
    setIsRequestingProcurement(false);
    triggerToast('Request Submitted', 'Procurement Request sent for director approval.', 'success');
  };

  const getLanguageCounseling = (lang: 'english' | 'marathi' | 'hindi', rx: Prescription) => {
    const textDict = {
      english: `Hello ${rx.patientName}. You have been prescribed ${rx.medicationsOrdered.map(m => m.medicineName).join(' and ')}. Please take these exactly as specified. ${rx.medicationsOrdered[0]?.instructions}. Avoid taking double dose.`,
      marathi: `नमस्कार ${rx.patientName}. तुम्हाला ${rx.medicationsOrdered.map(m => m.medicineName).join(' आणि ')} ही औषधे लिहून दिली आहेत. कृपया सांगितल्याप्रमाणेच डोस घ्या. ${rx.medicationsOrdered[0]?.instructions}. दुप्पट डोस घेणे टाळा.`,
      hindi: `नमस्ते ${rx.patientName}। आपको ${rx.medicationsOrdered.map(m => m.medicineName).join(' और ')} दवाएं लिखी गई हैं। कृपया निर्देशों का पालन करें। ${rx.medicationsOrdered[0]?.instructions}। दोहरी खुराक न लें।`
    };
    return textDict[lang];
  };

  const handleSpeakInstructions = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isCounselingSpeaking) {
        window.speechSynthesis.cancel();
        setIsCounselingSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'marathi' ? 'mr-IN' : selectedLanguage === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setIsCounselingSpeaking(false);
      setIsCounselingSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      triggerToast('Not Supported', 'Text-to-speech is not supported on this browser.', 'warning');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none ${isDarkMode ? 'bg-[#090d16] text-gray-150' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Toast Alert System */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-start space-x-3.5 animate-slide-in">
          <div className="p-2 rounded-xl bg-slate-800">
            {toastMessage.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : toastMessage.type === 'error' ? (
              <AlertOctagon className="w-5 h-5 text-rose-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-black text-white">{toastMessage.title}</h5>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{toastMessage.desc}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <header className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-30 ${isDarkMode ? 'bg-[#0c1322] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>MCGM Healthcare OS</h1>
            <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Pharmacy & Medication Lifecycle Module</p>
          </div>
        </div>

        {/* Global search */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-xl w-80">
          <Search className="w-4 h-4 text-gray-550" />
          <input
            id="pharmacy-global-search"
            type="text"
            placeholder="Search SKUs, prescriptions, patients... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] text-white w-full placeholder-gray-500 font-medium"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-900 border-gray-800 hover:bg-slate-800 text-amber-400' : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600'}`}
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          
          <div className={`flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-gray-400">PHARMACIST LOGGED IN</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className={`w-64 border-r p-4 space-y-6 flex flex-col justify-between ${isDarkMode ? 'bg-[#0a0f1d] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="space-y-4">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Dashboard Modules</span>
            <nav className="space-y-1.5">
              {[
                { id: 'dashboard', label: 'Pharmacy Dashboard', icon: LayoutGrid },
                { id: 'dispense', label: 'Dispensing Workspace', icon: CheckSquare },
                { id: 'inventory', label: 'Medicine Master', icon: Database },
                { id: 'coldchain', label: 'Cold Chain Monitoring', icon: Thermometer },
                { id: 'procurement', label: 'Procurement Requests', icon: Truck },
                { id: 'recalls', label: 'Drug Recalls', icon: AlertOctagon },
                { id: 'analytics', label: 'Analytics & Forecasting', icon: BarChart2 }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-md'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
                          : 'text-gray-650 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'dispense' && prescriptions.filter(p => p.status === 'PENDING').length > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {prescriptions.filter(p => p.status === 'PENDING').length}
                      </span>
                    )}
                    {item.id === 'coldchain' && sensors.some(s => s.status !== 'OPTIMAL') && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    )}
                    {item.id === 'recalls' && recallAlerts.length > 0 && (
                      <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {recallAlerts.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* AI Helper Quick Summary Widget */}
          <div className={`rounded-2xl p-4 space-y-3.5 border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-500" />
              <span>AI Pharmacy Copilot</span>
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Low Stock SKUs</span>
                <span className={`font-black ${lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{lowStockCount}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Near Expiry</span>
                <span className="font-black text-rose-500">{expiryCount}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>IoT Cold Chain</span>
                <span className="font-black text-emerald-500">Stable</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-xl border text-[9px] leading-relaxed ${isDarkMode ? 'bg-slate-950 border-slate-800 text-gray-400' : 'bg-indigo-50 border-indigo-100 text-gray-600'}`}>
              💡 **Suggestion:** Metformin batch B-M8811 recall isolated successfully. 18 patients need notify protocol.
            </div>
          </div>
        </aside>

        {/* Central Workspace Panel */}
        <section className={`flex-1 p-6 overflow-y-auto ${isDarkMode ? 'bg-[#060a12]' : 'bg-gray-50'}`}>

          {/* TAB 1: PHARMACY DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Today's Prescriptions</span>
                  <span className={`text-2xl font-black mt-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{prescriptions.length}</span>
                  <div className="flex items-center space-x-1 mt-2 text-[9px] text-emerald-400 font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+12.4% vs yesterday</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Pending Queue</span>
                  <span className="text-2xl font-black text-amber-500 mt-1.5">
                    {prescriptions.filter(p => p.status === 'PENDING' || p.status === 'VERIFYING').length}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-2 font-medium">Avg waiting: 6.4 minutes</span>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Low Stock Alert</span>
                  <span className={`text-2xl font-black mt-1.5 ${lowStockCount > 0 ? 'text-rose-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lowStockCount}</span>
                  <span className="text-[9px] text-gray-400 mt-2 font-medium">Amoxicillin critical level</span>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <span className="text-[10px] uppercase font-black text-gray-500">Govt Scheme Usage</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1.5">84.2%</span>
                  <span className="text-[9px] text-gray-400 mt-2 font-medium">Mahatma Jyotiba Phule scheme</span>
                </div>
              </div>

              {/* Bottom Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Prescriptions Queue */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-black uppercase flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Clock className="w-4.5 h-4.5 text-indigo-500" />
                      <span>Pending Verification Queue</span>
                    </h3>
                    <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] px-2 py-0.5 rounded font-black">REALTIME SYNC</span>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    {prescriptions.map(rx => (
                      <div
                        key={rx.id}
                        onClick={() => {
                          setSelectedPrescription(rx);
                          setActiveTab('dispense');
                        }}
                        className={`border hover:border-indigo-500 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200 hover:shadow-sm'}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rx.patientName}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                              rx.priority === 'EMERGENCY' ? 'bg-rose-500 text-white animate-pulse' : rx.priority === 'URGENT' ? 'bg-amber-500 text-slate-950' : isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {rx.priority}
                            </span>
                          </div>
                          <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Diagnosis: {rx.diagnosis} • Ref: {rx.doctorName}</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Meds: {rx.medicationsOrdered.map(m => m.medicineName).join(', ')}</p>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-1.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            rx.status === 'VERIFYING' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {rx.status}
                          </span>
                          <span className="text-[9px] text-gray-500">{new Date(rx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expiry alerts & low stock summary */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="space-y-4">
                    <h3 className={`text-sm font-black uppercase border-b pb-3 flex items-center space-x-2 ${isDarkMode ? 'text-white border-gray-800' : 'text-gray-900 border-gray-200'}`}>
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                      <span>Expiry & Low Stock Center</span>
                    </h3>

                    <div className="space-y-3">
                      {medicines.filter(m => m.stockLevel <= m.minThreshold).map(m => (
                        <div key={m.sku} className={`border p-3 rounded-xl flex items-center justify-between text-[10px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                          <div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{m.brandName} ({m.genericName})</span>
                            <p className="text-rose-500 font-medium">Stock: {m.stockLevel} units (Min: {m.minThreshold})</p>
                          </div>
                          <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded text-[8px] font-bold">LOW STOCK</span>
                        </div>
                      ))}

                      {medicines.filter(m => new Date(m.expiryDate).getTime() - new Date().getTime() < 120 * 24 * 60 * 60 * 1000).map(m => (
                        <div key={m.sku} className={`border p-3 rounded-xl flex items-center justify-between text-[10px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                          <div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{m.brandName}</span>
                            <p className="text-amber-500 font-medium">Expiry: {m.expiryDate}</p>
                          </div>
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-bold">NEAR EXPIRY</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNewRequest({
                        medicineName: 'Amoxicillin 500mg',
                        quantity: 5000,
                        priority: 'URGENT',
                        supplier: 'GlaxoSmithKline India',
                        estimatedCost: 225000
                      });
                      setIsRequestingProcurement(true);
                      setActiveTab('procurement');
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl mt-4 transition-all shadow-md"
                  >
                    Quick procurement request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISPENSING WORKSPACE */}
          {activeTab === 'dispense' && selectedPrescription && (
            <div className="space-y-6">
              {/* Workspace Header */}
              <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Dispensing Workspace</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order ID: {selectedPrescription.id} • Patient: {selectedPrescription.patientName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                    selectedPrescription.priority === 'EMERGENCY' ? 'bg-rose-500 text-white animate-pulse' : isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {selectedPrescription.priority} Priority
                  </span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>ABHA: {selectedPrescription.abhaId}</span>
                </div>
              </div>

              {/* Main Split Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Patient Card & Safety Checks */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="space-y-5">
                    <h3 className={`text-xs font-black uppercase text-indigo-500 border-b pb-2 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>Patient Profile & History</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Age / Gender:</span><span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.age} Y / {selectedPrescription.gender}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Diagnosis:</span><span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.diagnosis}</span></div>
                      <div className="flex justify-between"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Prescribing Doctor:</span><span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPrescription.doctorName} ({selectedPrescription.department})</span></div>
                    </div>

                    {/* Allergies & Drug Interactions */}
                    <div className="space-y-3.5">
                      <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-rose-950/40 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                        <h4 className="text-[10px] font-black text-rose-400 uppercase flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Allergy Alerts</span>
                        </h4>
                        <div className="mt-2 space-y-1">
                          {selectedPrescription.allergies.length > 0 ? (
                            selectedPrescription.allergies.map(al => (
                              <p key={al} className={`text-[10px] font-bold ${isDarkMode ? 'text-white' : 'text-rose-900'}`}>• Contraindicated: patient allergic to {al}</p>
                            ))
                          ) : (
                            <p className="text-[10px] text-gray-400">No known drug allergies reported ✓</p>
                          )}
                        </div>
                      </div>

                      <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-amber-950/40 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                        <h4 className="text-[10px] font-black text-amber-500 uppercase flex items-center space-x-1.5">
                          <Brain className="w-3.5 h-3.5" />
                          <span>AI Clinical Drug Interactions</span>
                        </h4>
                        <div className="mt-2 text-[10px] leading-normal space-y-1.5">
                          <p className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>• Check: Azithromycin + Amlodipine interaction check complete (No critical interaction detected).</p>
                          <p className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>• Note: Avoid administering duplicate therapies with other analgesics.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <span className={`text-[10px] uppercase font-bold block mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ABDM FHIR Consent Signature status</span>
                    <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ABDM Digitally signed transaction token verified</span>
                    </div>
                  </div>
                </div>

                {/* Center Panel: Medicine Picking & Double Verification */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="space-y-5">
                    <h3 className={`text-xs font-black uppercase text-indigo-500 border-b pb-2 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>Prescribed Medications & Barcode Verify</h3>
                    
                    <div className="space-y-4">
                      {selectedPrescription.medicationsOrdered.map((med, idx) => {
                        const matchedMed = medicines.find(m => m.genericName.toLowerCase().includes(med.medicineName.toLowerCase()) || m.brandName.toLowerCase().includes(med.medicineName.toLowerCase()));
                        return (
                          <div key={idx} className={`border p-4 rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{med.medicineName}</h4>
                                <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{med.dosage} • {med.frequency} • {med.duration}</p>
                              </div>
                              <span className="text-xs font-black text-indigo-500">Qty: {med.quantity}</span>
                            </div>

                            {/* Verification status and stock location */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-white border-gray-200'}`}>
                              <div>
                                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Pick Location:</span>
                                <p className={`font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{matchedMed?.location || 'Generic Rack D'}</p>
                              </div>
                              <div>
                                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Batch & Expiry:</span>
                                <p className={`font-bold mt-0.5 ${matchedMed && new Date(matchedMed.expiryDate).getTime() < new Date().getTime() + 180*24*60*60*1000 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                  {matchedMed ? `${matchedMed.batchNumber} (Exp: ${matchedMed.expiryDate})` : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Barcode scanner simulator */}
                    <div className={`border p-4 rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <label className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Scan Medicine Barcode for Double-Verification</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Place cursor here and scan or type barcode (e.g. B-P4028)"
                          value={scannedBarcode}
                          onChange={(e) => setScannedBarcode(e.target.value)}
                          className={`border text-xs font-bold px-3 py-2 rounded-xl flex-1 outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                        />
                        <button
                          onClick={() => {
                            if (scannedBarcode === 'B-P4028' || scannedBarcode === 'B-A9012' || scannedBarcode === 'B-M8811') {
                              triggerToast('Barcode Match', 'Double verification pass for this batch.', 'success');
                            } else {
                              triggerToast('Mismatched Barcode', 'Barcode does not match any batch in stock location.', 'error');
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-xl transition-all"
                        >
                          Verify Barcode
                        </button>
                      </div>
                    </div>

                    {/* Patient Counseling Section */}
                    <div className={`border p-4 rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                        <span className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Counseling Language</span>
                        <div className="flex space-x-1.5">
                          {['english', 'marathi', 'hindi'].map(lang => (
                            <button
                              key={lang}
                              onClick={() => setSelectedLanguage(lang as any)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize cursor-pointer ${selectedLanguage === lang ? 'bg-indigo-600 text-white font-extrabold' : isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] leading-normal">
                        <p className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                          {getLanguageCounseling(selectedLanguage, selectedPrescription)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSpeakInstructions(getLanguageCounseling(selectedLanguage, selectedPrescription))}
                          className="flex items-center space-x-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs px-3.5 py-2 rounded-xl font-bold hover:bg-indigo-500/20 transition-all cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{isCounselingSpeaking ? 'Stop Voice Instruction' : 'Play Voice Counseling'}</span>
                        </button>
                        
                        <div className={`flex items-center space-x-2 text-[9px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <QrCode className="w-4 h-4 text-indigo-500" />
                          <span>Scan QR for patient mobile guide</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approve / Release Dispensation */}
                  <div className={`border-t pt-4 mt-4 space-y-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
                      <div className="flex-1">
                        <input
                          type="password"
                          placeholder="Enter 4-digit Pharmacist Signature PIN (1234)"
                          value={pharmacistPin}
                          onChange={(e) => {
                            setPharmacistPin(e.target.value);
                            setPinError(false);
                          }}
                          className={`border px-3 py-2.5 rounded-xl text-xs font-bold w-full outline-none ${isDarkMode ? `bg-slate-950 text-white placeholder-gray-600 ${pinError ? 'border-rose-500' : 'border-slate-800'}` : `bg-white text-gray-900 placeholder-gray-400 ${pinError ? 'border-rose-500' : 'border-gray-300'}`}`}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDispenseMedicine(selectedPrescription.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                        >
                          <Check className="w-4.5 h-4.5" />
                          <span>Approve & Dispense</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setPrescriptions(prev => prev.map(p => p.id === selectedPrescription.id ? { ...p, status: 'CANCELLED' } : p));
                            triggerToast('Prescription Cancelled', 'Order status marked as cancelled.', 'warning');
                          }}
                          className={`font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className={`flex justify-between items-center border-b pb-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Medicine Master Inventory</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage government medical stores catalog & warehouse stocks</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingMedicine(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Medicine SKU</span>
                </button>
              </div>

              {/* Add Medicine Form Modal */}
              {isAddingMedicine && (
                <form onSubmit={handleAddMedicine} className={`border p-6 rounded-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                    <h3 className={`text-xs font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Register Medicine Master SKU</h3>
                    <button type="button" onClick={() => setIsAddingMedicine(false)} className="text-gray-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">SKU Code</label>
                      <input
                        type="text"
                        placeholder="MED-XXX-000"
                        value={newMedicine.sku}
                        onChange={(e) => setNewMedicine({ ...newMedicine, sku: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Generic Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Paracetamol"
                        value={newMedicine.genericName}
                        onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Calpol"
                        value={newMedicine.brandName}
                        onChange={(e) => setNewMedicine({ ...newMedicine, brandName: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Batch Number</label>
                      <input
                        type="text"
                        placeholder="e.g. B-9012"
                        value={newMedicine.batchNumber}
                        onChange={(e) => setNewMedicine({ ...newMedicine, batchNumber: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Expiry Date</label>
                      <input
                        type="date"
                        value={newMedicine.expiryDate}
                        onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Location Shelf / Rack</label>
                      <input
                        type="text"
                        placeholder="Rack A, Shelf 2"
                        value={newMedicine.location}
                        onChange={(e) => setNewMedicine({ ...newMedicine, location: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingMedicine(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md"
                    >
                      Save SKU
                    </button>
                  </div>
                </form>
              )}

              {/* Inventory Table list */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-[10px] text-gray-500 uppercase font-black ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <th className="pb-3">SKU</th>
                        <th className="pb-3">Generic Name / Brand</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Stock Level</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3">Expiry</th>
                        <th className="pb-3">Cold Chain</th>
                        <th className="pb-3">Scheme</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40 text-xs">
                      {medicines.map((med) => (
                        <tr key={med.sku} className={`${isDarkMode ? 'hover:bg-slate-900/30' : 'hover:bg-gray-50'}`}>
                          <td className="py-3 font-mono font-bold text-indigo-500">{med.sku}</td>
                          <td className="py-3">
                            <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{med.brandName}</span>
                            <span className={`text-[9px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{med.genericName} ({med.manufacturer})</span>
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{med.category}</span>
                          </td>
                          <td className="py-3">
                            <span className={`font-black ${med.stockLevel <= med.minThreshold ? 'text-rose-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {med.stockLevel} units
                            </span>
                            {med.stockLevel <= med.minThreshold && (
                              <span className="text-[8px] bg-rose-500/10 text-rose-500 px-1 py-0.5 rounded font-black ml-1.5 uppercase">LOW</span>
                            )}
                          </td>
                          <td className="py-3 text-gray-400 font-mono text-[10px]">{med.location}</td>
                          <td className="py-3">
                            <span className={`font-mono ${new Date(med.expiryDate).getTime() < new Date().getTime() + 180*24*60*60*1000 ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                              {med.expiryDate}
                            </span>
                          </td>
                          <td className="py-3">
                            {med.isColdChain ? (
                              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] px-2 py-0.5 rounded font-bold uppercase flex items-center w-fit space-x-1">
                                <Thermometer className="w-3 h-3 text-sky-400" />
                                <span>Cold</span>
                              </span>
                            ) : (
                              <span className="text-gray-600 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`text-[9px] font-bold ${med.isGovernmentSchemeEligible ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {med.isGovernmentSchemeEligible ? 'Yes (MJPJAY)' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLD CHAIN MONITORING */}
          {activeTab === 'coldchain' && (
            <div className="space-y-6">
              <div className={`flex justify-between items-center border-b pb-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cold Chain Management</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time IoT temperature sensors monitoring vaccine fridge room</p>
                  </div>
                </div>
                
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-3 py-1 rounded-full font-black">
                  SENSORS ONLINE
                </span>
              </div>

              {/* Sensor Grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sensors.map(sens => (
                  <div key={sens.id} className={`p-6 rounded-2xl border flex flex-col justify-between ${
                    sens.status === 'WARNING' ? (isDarkMode ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200') : isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sens.name}</h4>
                          <span className="text-[9px] text-gray-500 font-mono">ID: {sens.id}</span>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          sens.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {sens.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-500">Temperature</span>
                          <span className={`text-2xl font-black block mt-1 ${
                            sens.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-400'
                          }`}>
                            {sens.temperature.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] uppercase font-bold text-gray-500">Humidity</span>
                          <span className={`text-xl font-black block mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sens.humidity}%</span>
                        </div>
                      </div>
                    </div>

                    <div className={`border-t pt-3 mt-4 flex justify-between items-center text-[9px] text-gray-500 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                      <span>Last reported: Just now</span>
                      <button className="text-indigo-400 font-bold hover:underline cursor-pointer">Calibration history</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Temperature threshold and regulatory guidance warning block */}
              <div className={`border p-6 rounded-2xl space-y-3.5 ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h4 className={`text-xs font-black uppercase flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
                  <span>Vaccine Storage Compliance Checklist</span>
                </h4>
                <p className={`text-xs leading-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  WHO and Ministry of Health Guidelines mandate storing all vaccines and sensitive immunoglobulins in WHO-PQS prequalified refrigerators between 2°C to 8°C.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className={`p-3.5 rounded-xl border text-[10px] ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="text-emerald-500 font-bold block">✓ Safe Temperature Log</span>
                    <span className="text-gray-500 block mt-1">Automatic logging every 5 mins</span>
                  </div>
                  <div className={`p-3.5 rounded-xl border text-[10px] ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="text-emerald-500 font-bold block">✓ Power Backup Active</span>
                    <span className="text-gray-500 block mt-1">Automatic switchover to secondary grid</span>
                  </div>
                  <div className={`p-3.5 rounded-xl border text-[10px] ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="text-amber-500 font-bold block">⚠ Refrigerator Warming Alert</span>
                    <span className="text-gray-500 block mt-1">Insulin fridge B warming (8.9°C)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROCUREMENT MODULE */}
          {activeTab === 'procurement' && (
            <div className="space-y-6">
              <div className={`flex justify-between items-center border-b pb-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Procurement & Order Requests</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create and approve replenishment request forms for central store</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsRequestingProcurement(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Create Purchase Request
                </button>
              </div>

              {isRequestingProcurement && (
                <form onSubmit={handleCreateProcurementRequest} className={`border p-6 rounded-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                    <h3 className={`text-xs font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New Purchase Order Request</h3>
                    <button type="button" onClick={() => setIsRequestingProcurement(false)} className="text-gray-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Medicine Name</label>
                      <input
                        type="text"
                        placeholder="Amoxicillin 500mg"
                        value={newRequest.medicineName}
                        onChange={(e) => setNewRequest({ ...newRequest, medicineName: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Supplier / Vendor</label>
                      <input
                        type="text"
                        placeholder="Cipla Pharma"
                        value={newRequest.supplier}
                        onChange={(e) => setNewRequest({ ...newRequest, supplier: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Order Quantity</label>
                      <input
                        type="number"
                        value={newRequest.quantity}
                        onChange={(e) => setNewRequest({ ...newRequest, quantity: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-xl w-full outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsRequestingProcurement(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md"
                    >
                      Submit Purchase PO
                    </button>
                  </div>
                </form>
              )}

              {/* Procurements log */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="space-y-4">
                  {procurements.map(proc => (
                    <div key={proc.id} className={`border p-4 rounded-xl flex items-center justify-between text-xs ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{proc.medicineName}</span>
                          <span className="text-[9px] text-indigo-500 font-mono">{proc.id}</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vendor: {proc.supplier} • Qty: {proc.quantity} units</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500">Est. Cost:</span>
                          <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{proc.estimatedCost.toLocaleString('en-IN')}</span>
                        </div>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${
                          proc.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {proc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DRUG RECALLS */}
          {activeTab === 'recalls' && (
            <div className="space-y-6">
              <div className={`flex justify-between items-center border-b pb-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Drug Recall Management</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Emergency manufacturer and regulatory drug recalls alerts</p>
                  </div>
                </div>
              </div>

              {/* Recall Alert cards */}
              <div className="space-y-4">
                {recallAlerts.map(rec => (
                  <div key={rec.id} className={`border p-6 rounded-2xl flex flex-col justify-between ${isDarkMode ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wide">
                            {rec.severity} SEVERITY RECALL
                          </span>
                          <h4 className={`text-sm font-black mt-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rec.medicineName} (Batch: {rec.batchNumber})</h4>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono">{rec.id}</span>
                      </div>

                      <p className={`text-xs leading-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        **Reason for recall:** {rec.reason}
                      </p>

                      <div className={`p-4 rounded-xl border text-[10px] space-y-1.5 ${isDarkMode ? 'bg-slate-950/60 border-slate-900' : 'bg-white border-gray-200'}`}>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Affected Patient Protocol Status:</p>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>• Detected {rec.affectedPatientsCount} patients who received this batch in the last 30 days.</p>
                        <p className={`font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>• Action Pending: Dispatch automated alert notifications (SMS/WhatsApp) to all affected patients.</p>
                      </div>
                    </div>

                    <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t mt-4 justify-between ${isDarkMode ? 'border-gray-800/60' : 'border-gray-200'}`}>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            triggerToast('Batch Isolated', 'Batch inventory locked and isolated in warehouse bin 12.', 'success');
                            setRecallAlerts(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'ISOLATED' } : r));
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Lock & Isolate Batch
                        </button>
                        <button
                          onClick={() => {
                            triggerToast('Notifications Dispatched', 'Automated alerts sent to affected patients & physicians.', 'success');
                          }}
                          className={`font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-350' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        >
                          Dispatch Patient Alerts
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold mt-2 sm:mt-0">Recall received: Yesterday</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS & FORECASTING */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className={`flex justify-between items-center border-b pb-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pharmacy Analytics & Seasonal Forecasting</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Medication consumption trends, seasonal demand forecasts, and supply delays</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className={`text-xs font-black uppercase text-indigo-500 border-b pb-2 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>Fastest Moving Medicines</h3>
                  
                  <div className="space-y-3.5 mt-4">
                    {[
                      { name: 'Paracetamol 650mg Tablet', volume: 15400, percent: 92 },
                      { name: 'Metformin 500mg Tablet', volume: 12100, percent: 84 },
                      { name: 'Amoxicillin 500mg Capsule', volume: 8900, percent: 68 },
                      { name: 'Azithromycin 500mg Tablet', volume: 5400, percent: 45 },
                    ].map(f => (
                      <div key={f.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{f.name}</span>
                          <span className="text-indigo-500 font-bold">{f.volume} units</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${f.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className={`text-xs font-black uppercase text-indigo-500 border-b pb-2 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>AI Demand Predictions (Next 30 Days)</h3>
                  
                  <div className="space-y-3.5 mt-4">
                    <div className={`border p-3 rounded-xl flex items-center justify-between text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Seasonal Flu Outbreak Demand</span>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paracetamol/Antibiotics predicted spike</p>
                      </div>
                      <span className="text-rose-400 font-black">+35% forecast</span>
                    </div>

                    <div className={`border p-3 rounded-xl flex items-center justify-between text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Supplier Delay Warning</span>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>GlaxoSmithKline India logistics warning</p>
                      </div>
                      <span className="text-amber-500 font-black">4 days delay risk</span>
                    </div>

                    <div className={`border p-3 rounded-xl flex items-center justify-between text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Central Warehouse Replenishment</span>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Auto order recommended for Insulin</p>
                      </div>
                      <span className="text-emerald-500 font-black">Order advised</span>
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
