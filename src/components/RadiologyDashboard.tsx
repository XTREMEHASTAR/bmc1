import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Brain, Calendar, FileText, User, Bell, ChevronRight, ArrowRight, LogOut,
  Check, X, Plus, Moon, Sun, Search, AlertTriangle, Play, Pause, Mic, MicOff,
  RefreshCw, ZoomIn, ZoomOut, Maximize2, Move, RotateCw, LayoutGrid, Heart,
  ShieldAlert, Sparkles, Send, Settings, BookOpen, Layers, Award, BarChart2, Eye,
  ShieldCheck, Thermometer, Clock, CheckSquare, Volume2, Tv, QrCode, Lock,
  Share2, Link, Download, Wifi, WifiOff, Zap, Timer, TrendingUp, Server, HardDrive,
  Siren, Printer, Copy, MessageSquare, CheckCircle, AlertCircle, FilePlus, Users
} from 'lucide-react';

export type RadiologyTab =
  | 'command' | 'reporting' | 'schedule' | 'orders' | 'safety'
  | 'worklist' | 'machines' | 'emergency' | 'ai_assistant' | 'dictation'
  | 'comparison' | 'critical' | 'sign_release' | 'distribution' | 'quality'
  | 'dose' | 'analytics' | 'sharing' | 'communication' | 'audit';

interface Study {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  abhaId: string;
  modality: 'CT' | 'MRI' | 'X-Ray' | 'Ultrasound' | 'Mammography' | 'PET-CT' | 'DEXA' | 'Fluoroscopy';
  procedureName: string;
  priority: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  status: 'ORDERED' | 'SCHEDULED' | 'ARRIVED' | 'PREPARED' | 'IN_ROOM' | 'SCANNING' | 'COMPLETED' | 'QC_PENDING' | 'AI_PROCESSED' | 'REPORTING' | 'RELEASED';
  accessionNumber: string;
  doseMsv: number;
  ctdivol?: number;
  dlp?: number;
  aiFindings: {
    label: string;
    confidence: number;
    hasCriticalAlert: boolean;
    description: string;
    roi: { x: number; y: number; r: number };
    accepted?: boolean;
  };
  clinicalHistory: string;
  consentSigned: boolean;
  metalImplantChecked: boolean;
  contrastAllergyChecked: boolean;
  fastingConfirmed: boolean;
  pregnancyScreened: boolean;
  safetyCleared?: boolean;
  scannedAt?: string;
  previousStudyDate?: string;
  previousStudyId?: string;
  referringDoctor?: string;
  department?: string;
  dictatedReport?: string;
  reportSignedAt?: string;
  signedBy?: string;
  addendums?: { text: string; date: string; by: string }[];
}

const INITIAL_STUDIES: Study[] = [
  {
    id: 'std_001',
    patientName: 'Rohan Devendra Sharma',
    age: 45,
    gender: 'Male',
    abhaId: 'rohan.sharma@abha',
    modality: 'CT',
    procedureName: 'CT Head (NCCT) - Stroke Protocol',
    priority: 'EMERGENCY',
    status: 'AI_PROCESSED',
    accessionNumber: 'ACC-2026-99081',
    doseMsv: 2.1,
    ctdivol: 52.4,
    dlp: 780,
    aiFindings: {
      label: 'Acute Intracranial Hemorrhage',
      confidence: 96.4,
      hasCriticalAlert: true,
      description: 'Hyperdense lesion noted in the left basal ganglia measuring 24 x 18 mm. Surrounding edema and minor mass effect on the left lateral ventricle.',
      roi: { x: 180, y: 155, r: 28 },
      accepted: true
    },
    clinicalHistory: 'Sudden onset left-sided weakness, slurred speech. Onset 90 minutes prior to admission.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: true,
    pregnancyScreened: true,
    safetyCleared: true,
    scannedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    previousStudyDate: '2025-11-12',
    previousStudyId: 'std_prev_901',
    referringDoctor: 'Dr. Sunita Deshmukh',
    department: 'Neurology Emergency',
    dictatedReport: 'IMAGING REPORT: NON-CONTRAST HEAD CT.\n\nFINDINGS: Left basal ganglia hemorrhagic lesion measuring 24 x 18 mm with focal surrounding edema. 3mm rightward midline shift.\n\nIMPRESSION: Acute Intracranial Hemorrhage. Immediate neurosurgical consultation advised.'
  },
  {
    id: 'std_002',
    patientName: 'Priya Kirit Patel',
    age: 32,
    gender: 'Female',
    abhaId: 'priya.patel@abha',
    modality: 'MRI',
    procedureName: 'MRI Brain with Contrast',
    priority: 'URGENT',
    status: 'REPORTING',
    accessionNumber: 'ACC-2026-99082',
    doseMsv: 0.0,
    aiFindings: {
      label: 'Demyelinating Lesion (Active)',
      confidence: 89.2,
      hasCriticalAlert: false,
      description: 'Multiple hyperintense foci on T2/FLAIR images in periventricular white matter. Dominant lesion exhibits Gd enhancement.',
      roi: { x: 140, y: 120, r: 16 }
    },
    clinicalHistory: 'Sensory paresthesia, transient vision loss in left eye (optic neuritis query).',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: true,
    pregnancyScreened: true,
    safetyCleared: true,
    scannedAt: new Date(Date.now() - 60 * 60000).toISOString(),
    previousStudyDate: '2026-02-14',
    previousStudyId: 'std_prev_902',
    referringDoctor: 'Dr. Ramesh Nair',
    department: 'Neurology'
  },
  {
    id: 'std_003',
    patientName: 'Vikram Singh Gill',
    age: 58,
    gender: 'Male',
    abhaId: 'vikram.gill@abha',
    modality: 'X-Ray',
    procedureName: 'Chest X-Ray PA View',
    priority: 'ROUTINE',
    status: 'QC_PENDING',
    accessionNumber: 'ACC-2026-99083',
    doseMsv: 0.05,
    aiFindings: {
      label: 'Right Lower Lobe Consolidation',
      confidence: 91.0,
      hasCriticalAlert: false,
      description: 'Opacification of right lower lung field with air bronchograms. Consistent with lobar pneumonia.',
      roi: { x: 210, y: 220, r: 40 }
    },
    clinicalHistory: 'High-grade fever, productive cough with rusty sputum, dyspnea on exertion.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: false,
    fastingConfirmed: false,
    pregnancyScreened: true,
    safetyCleared: true,
    scannedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    referringDoctor: 'Dr. Anil Mehta',
    department: 'Pulmonology'
  },
  {
    id: 'std_004',
    patientName: 'Ananya S. Kulkarni',
    age: 61,
    gender: 'Female',
    abhaId: 'ananya.kulkarni@abha',
    modality: 'CT',
    procedureName: 'CT Chest (HRCT) - Oncology Follow-up',
    priority: 'ROUTINE',
    status: 'AI_PROCESSED',
    accessionNumber: 'ACC-2026-99084',
    doseMsv: 5.4,
    ctdivol: 18.2,
    dlp: 620,
    aiFindings: {
      label: 'Pulmonary Nodule Growth (Left Lung)',
      confidence: 94.1,
      hasCriticalAlert: true,
      description: 'Solid nodule in the left upper lobe measuring 14 mm, previously 11 mm. Suggests progressive disease.',
      roi: { x: 95, y: 180, r: 20 }
    },
    clinicalHistory: 'Follow-up for diagnosed stage III adenocarcinoma post 3 cycles of chemotherapy.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: true,
    pregnancyScreened: true,
    safetyCleared: true,
    scannedAt: new Date(Date.now() - 150 * 60000).toISOString(),
    previousStudyDate: '2026-04-10',
    previousStudyId: 'std_prev_904',
    referringDoctor: 'Dr. Kavita Joshi',
  }
];

const mockRadiologyOrders = [
  {
    id: 'RAD-ORD-101',
    patientName: 'Rohan Devendra Sharma',
    age: 45,
    gender: 'Male',
    uhid: 'UHID-2026-8801',
    modality: 'CT',
    studyName: 'CT Head (NCCT) - Stroke Protocol',
    priority: 'STAT',
    clinicalIndication: 'Sudden left-sided weakness, slurred speech. Onset 90m ago.',
    orderingDoctor: 'Dr. Sunita Deshmukh (Neurology)',
    department: 'Emergency / Stroke Unit',
    orderedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    status: 'COMPLETED',
    protocolAssigned: 'NCCT Stroke Protocol (120kVp, 250mAs)',
  },
  {
    id: 'RAD-ORD-102',
    patientName: 'Priya Kirit Patel',
    age: 32,
    gender: 'Female',
    uhid: 'UHID-2026-8802',
    modality: 'MRI',
    studyName: 'MRI Brain with Gadolinium',
    priority: 'URGENT',
    clinicalIndication: 'Transient vision loss left eye, paresthesia.',
    orderingDoctor: 'Dr. Ramesh Nair (Neurology)',
    department: 'IPD Neurology',
    orderedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    status: 'IN_PROGRESS',
    protocolAssigned: 'T2/FLAIR + Contrast Gadolinium',
  },
  {
    id: 'RAD-ORD-103',
    patientName: 'Vikram Singh Gill',
    age: 58,
    gender: 'Male',
    uhid: 'UHID-2026-8803',
    modality: 'X-Ray',
    studyName: 'Chest X-Ray PA View',
    priority: 'ROUTINE',
    clinicalIndication: 'Fever 102F, productive cough 4 days.',
    orderingDoctor: 'Dr. Anil Mehta (Pulmonology)',
    department: 'OPD Chest Medicine',
    orderedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'SCHEDULED',
    protocolAssigned: 'Standard PA Standing 110kVp',
  }
];

interface RadiologyDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function RadiologyDashboard({ isDarkMode, setIsDarkMode, onLogout }: RadiologyDashboardProps) {
  const [studies, setStudies] = useState<Study[]>(INITIAL_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState<Study>(INITIAL_STUDIES[0]);
  const [activeTab, setActiveTab] = useState<RadiologyTab>('reporting');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // DICOM Viewer states
  const [viewerZoom, setViewerZoom] = useState<number>(1);
  const [viewerPan, setViewerPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewerBrightness, setViewerBrightness] = useState<number>(100);
  const [viewerContrast, setViewerContrast] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showAIOverlay, setShowAIOverlay] = useState<boolean>(true);
  const [showMeasureTool, setShowMeasureTool] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [pacsMode, setPacsMode] = useState<'slice' | 'previous' | '3d'>('slice');

  // Dictation & Sign states
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictationText, setDictationText] = useState<string>(INITIAL_STUDIES[0].dictatedReport || '');
  const [pathologistPIN, setPathologistPIN] = useState<string>('');
  const [addendumInput, setAddendumInput] = useState<string>('');

  // RIS Schedule states
  const [newApptName, setNewApptName] = useState<string>('');
  const [newApptModality, setNewApptModality] = useState<'CT' | 'MRI' | 'X-Ray' | 'Ultrasound'>('CT');
  const [newApptPriority, setNewApptPriority] = useState<'EMERGENCY' | 'URGENT' | 'ROUTINE'>('ROUTINE');
  const [newApptHistory, setNewApptHistory] = useState<string>('');

  // Machines
  const [machines, setMachines] = useState([
    { id: 'CT-01', name: 'GE Revolution CT 256-Slice', status: 'ONLINE' as const, utilization: 94, scansToday: 28, avgScanTime: '12 min', lastCalibration: 'Today 06:15 AM', nextMaintenance: '2026-07-22' },
    { id: 'CT-02', name: 'Siemens Somatom Force', status: 'ONLINE' as const, utilization: 82, scansToday: 22, avgScanTime: '14 min', lastCalibration: 'Today 05:30 AM', nextMaintenance: '2026-07-25' },
    { id: 'MRI-01', name: 'Siemens Magnetom 3T MRI', status: 'ONLINE' as const, utilization: 88, scansToday: 14, avgScanTime: '32 min', lastCalibration: 'Today 05:40 AM', nextMaintenance: '2026-07-18' },
    { id: 'XR-01', name: 'Fujifilm FDR D-EVO II DR', status: 'ONLINE' as const, utilization: 72, scansToday: 42, avgScanTime: '4 min', lastCalibration: 'Yesterday 08:30 PM', nextMaintenance: '2026-08-01' },
    { id: 'XR-02', name: 'Fujifilm FDR D-EVO II DR (Bay 2)', status: 'MAINTENANCE' as const, utilization: 0, scansToday: 0, avgScanTime: '-', lastCalibration: 'Yesterday 06:00 PM', nextMaintenance: 'In Progress' },
    { id: 'US-01', name: 'GE Voluson E10 Ultrasound', status: 'ONLINE' as const, utilization: 65, scansToday: 18, avgScanTime: '18 min', lastCalibration: 'Today 07:00 AM', nextMaintenance: '2026-08-05' },
  ]);

  // Critical Findings & Messages
  const [criticalFindings, setCriticalFindings] = useState([
    { id: 'CRIT-RAD-01', patient: 'Rohan Devendra Sharma', uhid: 'UHID-2026-8801', accession: 'ACC-2026-99081', study: 'CT Head (NCCT)', finding: 'Acute Intracranial Hemorrhage in left basal ganglia (24x18mm)', severity: 'CRITICAL', radiologist: 'Dr. A. K. Verma', doctor: 'Dr. Sunita Deshmukh', dept: 'Neurology Emergency', time: '25 min ago', status: 'ACKNOWLEDGED', ackBy: 'Dr. Sunita Deshmukh' },
    { id: 'CRIT-RAD-02', patient: 'Ananya S. Kulkarni', uhid: 'UHID-2026-8804', accession: 'ACC-2026-99084', study: 'CT Chest (HRCT)', finding: 'Pulmonary nodule growth 27% (14mm vs 11mm)', severity: 'HIGH', radiologist: 'Dr. Meera Rao', doctor: 'Dr. Kavita Joshi', dept: 'Oncology', time: '150 min ago', status: 'NOTIFIED', ackBy: undefined },
  ]);

  const [messages, setMessages] = useState([
    { id: 'MSG-01', sender: 'Dr. A. K. Verma (Radiology)', recipient: 'Dr. Sunita Deshmukh (Emergency)', patient: 'Rohan Devendra Sharma', text: 'STAT CT Head shows acute 24mm ICH in left basal ganglia. Images in PACS. Please review immediately.', time: '25m ago', ack: true },
    { id: 'MSG-02', sender: 'Dr. Sunita Deshmukh (Emergency)', recipient: 'Dr. A. K. Verma (Radiology)', patient: 'Rohan Devendra Sharma', text: 'Acknowledged. Neurosurgery team mobilized for trauma bay 1.', time: '20m ago', ack: true }
  ]);

  const [chatInput, setChatInput] = useState('');

  // Audit Log
  const [auditLog, setAuditLog] = useState([
    { id: 'RAUD-101', user: 'Dr. A. K. Verma', role: 'Radiologist', action: 'Opened DICOM Study', target: 'ACC-2026-99081 (Rohan Sharma)', time: '30 min ago' },
    { id: 'RAUD-102', user: 'AI Engine (MCGM-RadAI)', role: 'AI Assistant', action: 'Flagged Acute ICH (96.4% confidence)', target: 'ACC-2026-99081', time: '28 min ago' },
    { id: 'RAUD-103', user: 'Dr. A. K. Verma', role: 'Radiologist', action: 'Accepted AI Finding & Dictated Report', target: 'ACC-2026-99081', time: '24 min ago' },
    { id: 'RAUD-104', user: 'Dr. A. K. Verma', role: 'Radiologist', action: 'Signed & Released Report (PIN Auth)', target: 'ACC-2026-99081', time: '20 min ago' },
  ]);

  // E2E Trauma Simulation
  const [simRunning, setSimRunning] = useState(false);
  const [simSteps, setSimSteps] = useState<{ step: string; status: 'pending' | 'running' | 'done' }[]>([]);

  // Emergency timer
  const [emergencyTimer, setEmergencyTimer] = useState(0);
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Sharing
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState('24h');
  const [showShareQR, setShowShareQR] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (title: string, text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ title, text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addAudit = (action: string, target: string) => {
    const entry = { id: 'RAUD-' + Math.floor(Math.random() * 10000), user: 'Dr. A. K. Verma', role: 'Radiologist', action, target, time: 'Just now' };
    setAuditLog(prev => [entry, ...prev]);
  };

  // Voice OS tab listener
  useEffect(() => {
    const handler = (e: any) => {
      const tab = e.detail;
      if (['command', 'reporting', 'schedule', 'orders', 'safety', 'worklist', 'machines', 'emergency', 'ai_assistant', 'dictation', 'comparison', 'critical', 'sign_release', 'distribution', 'quality', 'dose', 'analytics', 'sharing', 'communication', 'audit'].includes(tab)) {
        setActiveTab(tab as RadiologyTab);
      }
    };
    window.addEventListener('mcgm-rad-tab-change', handler);
    return () => window.removeEventListener('mcgm-rad-tab-change', handler);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (emergencyActive) {
      interval = setInterval(() => setEmergencyTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emergencyActive]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 23-Step Trauma E2E Simulation
  const runE2ESimulation = async () => {
    const steps = [
      '1. Emergency doctor orders CT Brain Stroke Protocol STAT',
      '2. Order auto-populates Radiology Order Inbox',
      '3. Technologist Modality Worklist receives patient for CT-01',
      '4. Emergency Command Center receives pending CT alert',
      '5. Patient safety screening (Contrast, eGFR, metal) confirmed',
      '6. Patient status transitions to IN ROOM → SCANNING',
      '7. DICOM study acquired and received by PACS',
      '8. Radiologist worklist auto-prioritizes study (EMERGENCY)',
      '9. AI Assistant auto-analyzes slices & flags Acute ICH (96.4%)',
      '10. Radiologist opens DICOM Viewer in dark diagnostic mode',
      '11. Radiologist inspects ROI and measures lesion (24x18 mm)',
      '12. Radiologist clicks ACCEPT AI FINDING',
      '13. Voice dictation generates structured report',
      '14. Critical finding (ICH) confirmed and dispatched to ER Doctor',
      '15. ER Doctor receives push notification & acknowledges',
      '16. Radiologist inputs PIN 1234 and signs report',
      '17. Signed report becomes immutable (dispatches RADIOLOGY_REPORT_RELEASED)',
      '18. Doctor Portal, Nurse Portal & Patient EMR auto-update',
      '19. Hospital Command Center marks diagnostic bottleneck resolved',
      '20. Dose metrics (2.1 mSv) logged to AERB dose registry',
      '21. Technologist QA rating updated (0 repeats)',
      '22. Full 23-step audit trail recorded in Audit Log',
      '23. E2E Cross-System Verification Complete!'
    ].map(step => ({ step, status: 'pending' as const }));

    setSimSteps(steps);
    setSimRunning(true);
    for (let i = 0; i < steps.length; i++) {
      setSimSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      await new Promise(r => setTimeout(r, 650));
      setSimSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
    }
    setSimRunning(false);
    showToast('E2E Simulation Complete', 'All 23 radiology pipeline steps verified', 'success');
  };

  const handleDictateSimulate = () => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }
    setIsDictating(true);
    setDictationText('');
    let sentence = `IMAGING REPORT: ${selectedStudy.modality} ${selectedStudy.procedureName.toUpperCase()}.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: ${selectedStudy.aiFindings.description}\n\nIMPRESSION: Primary finding consistent with ${selectedStudy.aiFindings.label}. Immediate clinical correlation and specialist consultation recommended.`;
    let i = 0;
    const interval = setInterval(() => {
      setDictationText(prev => prev + sentence.charAt(i));
      i++;
      if (i >= sentence.length) {
        clearInterval(interval);
        setIsDictating(false);
        addAudit('Completed Structured Voice Dictation', selectedStudy.accessionNumber);
        showToast('Transcription Done', 'AI completed voice report draft', 'success');
      }
    }, 15);
  };

  const handleSignRelease = () => {
    if (pathologistPIN !== '1234') {
      showToast('Authentication Failed', 'Invalid security PIN code', 'warn');
      return;
    }
    const updated = studies.map(s => s.id === selectedStudy.id ? { ...s, status: 'RELEASED' as const, reportSignedAt: new Date().toISOString(), signedBy: 'Dr. A. K. Verma' } : s);
    setStudies(updated);
    setSelectedStudy(prev => ({ ...prev, status: 'RELEASED', reportSignedAt: new Date().toISOString(), signedBy: 'Dr. A. K. Verma' }));
    setPathologistPIN('');
    addAudit('Signed & Released Report (PIN Authenticated)', selectedStudy.accessionNumber);
    window.dispatchEvent(new CustomEvent('mcgm-radiology-report-released', { detail: { studyId: selectedStudy.id, accession: selectedStudy.accessionNumber } }));
    showToast('Report Released', `Report signed and dispatched to EMR & Command Center`, 'success');
  };

  const handleAddAddendum = () => {
    if (!addendumInput.trim()) return;
    const newAddendum = { text: addendumInput, date: new Date().toLocaleTimeString('en-IN'), by: 'Dr. A. K. Verma' };
    setSelectedStudy(prev => ({ ...prev, addendums: [...(prev.addendums || []), newAddendum] }));
    setAddendumInput('');
    addAudit('Added Signed Addendum', selectedStudy.accessionNumber);
    showToast('Addendum Created', 'Signed addendum appended to immutable report', 'success');
  };

  const filteredStudies = studies.filter(s =>
    s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.modality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.accessionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS: { id: RadiologyTab; label: string; icon: any; alert?: boolean }[] = [
    { id: 'command', label: 'Command', icon: Activity },
    { id: 'reporting', label: 'PACS Viewer', icon: Tv },
    { id: 'schedule', label: 'RIS Schedule', icon: Calendar },
    { id: 'orders', label: 'Order Inbox', icon: FilePlus, alert: true },
    { id: 'safety', label: 'Safety & Prep', icon: ShieldCheck },
    { id: 'worklist', label: 'Tech Worklist', icon: CheckSquare },
    { id: 'machines', label: 'Machines', icon: Server },
    { id: 'emergency', label: 'Emergency', icon: Siren, alert: true },
    { id: 'ai_assistant', label: 'AI Assistant', icon: Brain },
    { id: 'dictation', label: 'Dictation', icon: Mic },
    { id: 'comparison', label: 'Compare', icon: Layers },
    { id: 'critical', label: 'Critical Queue', icon: ShieldAlert, alert: criticalFindings.some(c => c.status === 'NOTIFIED') },
    { id: 'sign_release', label: 'Sign & Release', icon: Lock },
    { id: 'distribution', label: 'Distribution', icon: Send },
    { id: 'quality', label: 'QC Logs', icon: Award },
    { id: 'dose', label: 'Radiation Dose', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'sharing', label: 'Sharing', icon: Share2 },
    { id: 'communication', label: 'Chat Hub', icon: MessageSquare },
    { id: 'audit', label: 'Audit Log', icon: Lock },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0b0f19] text-gray-100' : 'bg-slate-50 text-gray-900'} font-sans flex flex-col transition-colors duration-200`}>
      
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-gray-800 bg-[#0f172a]' : 'border-gray-200 bg-white'} px-6 py-3 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center space-x-3">
          <div className="bg-sky-600 p-2.5 rounded-xl text-white shadow-lg flex items-center justify-center">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>MCGM Digital PACS & RIS</h1>
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Sion Hospital Node
              </span>
            </div>
            <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Picture Archiving, Communication & AI Diagnostics Operating System v4.2
            </p>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="text-center">
            <span className="block text-[9px] uppercase font-bold text-gray-400">Critical Queue</span>
            <span className="text-xs font-black text-red-500 flex items-center justify-center space-x-1">
              <ShieldAlert className="w-3 h-3" />
              <span>{studies.filter(s => s.priority === 'EMERGENCY' && s.status !== 'RELEASED').length} Studies</span>
            </span>
          </div>
          <div className="text-center border-l border-gray-800 pl-6">
            <span className="block text-[9px] uppercase font-bold text-gray-400">Active Modalities</span>
            <span className="text-xs font-black text-sky-400">5 Online • 1 Maintenance</span>
          </div>
          <div className="text-center border-l border-gray-800 pl-6">
            <span className="block text-[9px] uppercase font-bold text-gray-400">Avg Report TAT</span>
            <span className="text-xs font-black text-emerald-400">14.8 minutes</span>
          </div>
        </div>

        {/* Actions & Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={runE2ESimulation}
            disabled={simRunning}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simRunning ? 'Simulating…' : 'Run E2E Trauma Sim'}</span>
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode ? 'bg-[#1e293b] border-gray-700 text-yellow-400 hover:bg-slate-800' : 'bg-slate-100 border-gray-300 text-gray-600 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Port</span>
          </button>
        </div>
      </header>

      {/* 20-Page Tab Bar Navigation */}
      <div className={`px-6 py-2 border-b flex justify-between items-center overflow-x-auto ${isDarkMode ? 'bg-[#0f172a]/80 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex space-x-1 overflow-x-auto custom-scrollbar py-0.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap relative ${
                  active
                    ? 'bg-sky-600 text-white shadow-md'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.alert && !active && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Global Search */}
        <div className="relative w-56 ml-4 hidden md:block shrink-0">
          <input
            type="text"
            placeholder="Search patient, accession, ABHA…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs px-3 py-1.5 pl-8 rounded-xl border focus:outline-none focus:border-sky-500 ${
              isDarkMode
                ? 'bg-slate-800/60 border-gray-700 text-white placeholder-gray-400'
                : 'bg-slate-100 border-gray-300 text-slate-800 placeholder-gray-500'
            }`}
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* E2E Simulation Banner */}
      {simSteps.length > 0 && (
        <div className={`px-6 py-3 border-b ${isDarkMode ? 'bg-purple-950/30 border-purple-800/40' : 'bg-purple-50 border-purple-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-purple-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>E2E Radiology Trauma Pipeline Simulation ({simSteps.filter(s => s.status === 'done').length}/{simSteps.length} Steps Verified)</span>
            </span>
            {simRunning && <span className="text-[10px] font-bold text-purple-300 animate-pulse">Running live cross-system pipeline…</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
            {simSteps.map((s, idx) => (
              <div key={idx} className={`p-1.5 rounded text-[9px] font-bold truncate flex items-center space-x-1 ${
                s.status === 'done' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : s.status === 'running' ? 'bg-purple-500/30 text-purple-200 border border-purple-400 animate-pulse' : 'bg-slate-800/40 text-gray-500'
              }`}>
                {s.status === 'done' ? <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> : <Clock className="w-3 h-3 text-gray-500 shrink-0" />}
                <span className="truncate">{s.step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE VIEW ROUTER */}
      <main className="flex-1 p-6 flex flex-col space-y-6 min-h-0">

        {/* ════ PAGE 1: COMMAND DASHBOARD ════════════════════════════════ */}
        {activeTab === 'command' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black uppercase tracking-wide">Radiology Command Dashboard</h2>
                <p className="text-[10px] text-gray-400">Live Modality Operational Status • Capacity & Workload Balance</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setActiveTab('orders')} className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl">Order Inbox ({mockRadiologyOrders.length})</button>
                <button onClick={() => setActiveTab('critical')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl">Critical Findings ({criticalFindings.length})</button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Studies Today', val: '184', sub: '+14% vs yesterday', col: 'text-sky-400' },
                { label: 'Emergency STAT', val: '28', sub: '3 pending scan', col: 'text-red-400' },
                { label: 'Scheduled', val: '42', sub: 'RIS active queue', col: 'text-amber-400' },
                { label: 'Completed Scans', val: '111', sub: 'PACS received', col: 'text-emerald-400' },
                { label: 'Reporting Pending', val: '16', sub: 'Radiologist queue', col: 'text-purple-400' },
                { label: 'Average TAT', val: '14.8m', sub: 'Target < 30m', col: 'text-emerald-400' },
              ].map((k, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">{k.label}</span>
                  <p className={`text-xl font-black mt-1 ${k.col}`}>{k.val}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Modality Status Grid */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 border-b border-gray-800 pb-2">Live Modality Health & Workload Grid</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines.map(m => (
                  <div key={m.id} className={`p-4 rounded-xl border ${m.status === 'ONLINE' ? isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50' : 'border-amber-500/30 bg-amber-500/5'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">{m.id}</span>
                        <h4 className="text-xs font-black mt-1 text-white">{m.name}</h4>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${m.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{m.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                      <div><span className="text-gray-500 block">Scans Today</span><span className="font-bold text-white">{m.scansToday}</span></div>
                      <div><span className="text-gray-500 block">Avg Wait</span><span className="font-bold text-white">{m.avgScanTime}</span></div>
                      <div><span className="text-gray-500 block">Utilization</span><span className="font-bold text-sky-400">{m.utilization}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ PAGE 2: PACS REPORTING DESK (EXISTING PRESERVED) ═════════ */}
        {activeTab === 'reporting' && (
          <div className="flex-1 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 min-h-0">
            {/* Left Worklist */}
            <section className="w-full lg:w-80 flex flex-col space-y-4 shrink-0">
              <div className={`p-4 rounded-2xl border flex flex-col h-[600px] ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Patient Worklist</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDarkMode ? 'bg-slate-800 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
                    {filteredStudies.length} Cases
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 mt-3 mb-2">
                  <button className="bg-sky-500/10 text-sky-400 text-[9px] font-black rounded py-1 uppercase text-center">All Scans</button>
                  <button className="bg-red-500/10 text-red-500 text-[9px] font-black rounded py-1 uppercase text-center">Emergency</button>
                  <button className={`text-[9px] font-black rounded py-1 uppercase text-center ${isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-slate-600'}`}>Pending</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1 custom-scrollbar">
                  {filteredStudies.map((st) => {
                    const isSelected = st.id === selectedStudy.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => { setSelectedStudy(st); setDictationText(st.dictatedReport || ''); setViewerZoom(1); setViewerPan({ x: 0, y: 0 }); setMeasurePoints([]); }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected ? 'border-sky-500 bg-sky-500/10 shadow-inner' : isDarkMode ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-slate-200 text-slate-700'}`}>{st.modality}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${st.priority === 'EMERGENCY' ? 'bg-red-500/20 text-red-400' : 'bg-sky-500/20 text-sky-400'}`}>{st.priority}</span>
                        </div>
                        <h4 className={`text-xs font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{st.patientName}</h4>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{st.age}Y • {st.gender} • {st.accessionNumber}</p>
                        {st.aiFindings.hasCriticalAlert && st.status !== 'RELEASED' && (
                          <div className="flex items-center space-x-1 mt-2 text-red-400 bg-red-500/10 border border-red-500/20 p-1 rounded text-[9px] font-bold animate-pulse">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{st.aiFindings.label}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Center DICOM Viewer */}
            <section className="flex-1 flex flex-col space-y-4 min-w-0">
              <div className={`p-4 rounded-2xl border flex flex-col flex-1 h-[600px] ${isDarkMode ? 'bg-[#0a0f1d] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                {/* Viewer Header Toolbar */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-800 flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button onClick={() => setPacsMode('slice')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${pacsMode === 'slice' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-gray-400'}`}>Active Study</button>
                    <button onClick={() => setPacsMode('previous')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${pacsMode === 'previous' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-gray-400'}`}>Compare Studies</button>
                    <button onClick={() => setPacsMode('3d')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${pacsMode === '3d' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-gray-400'}`}>3D MPR Model</button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => setViewerZoom(prev => Math.min(prev + 0.2, 3))} className="p-2 rounded bg-slate-800 text-gray-300 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setViewerZoom(prev => Math.max(prev - 0.2, 0.6))} className="p-2 rounded bg-slate-800 text-gray-300 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-2 rounded bg-slate-800 text-gray-300 hover:text-white"><RotateCw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setShowMeasureTool(!showMeasureTool); setMeasurePoints([]); }} className={`p-2 rounded ${showMeasureTool ? 'bg-sky-600 text-white' : 'bg-slate-800 text-gray-300'}`}><Layers className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setShowAIOverlay(!showAIOverlay)} className={`p-2 rounded ${showAIOverlay ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-300'}`}><Sparkles className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setViewerZoom(1); setViewerPan({ x: 0, y: 0 }); setViewerBrightness(100); setViewerContrast(100); setMeasurePoints([]); }} className="p-2 rounded bg-slate-800 text-gray-300 hover:text-white"><RefreshCw className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* DICOM Canvas Box */}
                <div className="flex-1 relative bg-black border border-slate-900 rounded-xl overflow-hidden mt-3 flex items-center justify-center select-none">
                  <div className="absolute top-3 left-3 z-10 text-[10px] text-gray-400 font-mono space-y-0.5 bg-black/60 p-2 rounded-lg pointer-events-none">
                    <p className="text-white font-bold">{selectedStudy.patientName}</p>
                    <p>{selectedStudy.gender} • {selectedStudy.age}Y • Acc: {selectedStudy.accessionNumber}</p>
                    <p className="text-sky-300">ABHA: {selectedStudy.abhaId}</p>
                  </div>
                  <div className="absolute top-3 right-3 z-10 text-[10px] text-gray-400 font-mono text-right bg-black/60 p-2 rounded-lg pointer-events-none">
                    <p className="text-sky-400 font-bold">{selectedStudy.procedureName}</p>
                    <p>Dose: {selectedStudy.doseMsv.toFixed(2)} mSv {selectedStudy.ctdivol ? `• CTDI: ${selectedStudy.ctdivol}` : ''}</p>
                  </div>
                  <div className="absolute bottom-3 left-3 z-10 text-[10px] text-gray-400 font-mono bg-black/60 p-2 rounded-lg pointer-events-none">
                    <p>ZOOM: {(viewerZoom * 100).toFixed(0)}% • WW: 80 / WL: 40</p>
                  </div>

                  <div className="relative transition-transform duration-100" style={{ transform: `scale(${viewerZoom}) translate(${viewerPan.x}px, ${viewerPan.y}px) rotate(${rotation}deg)`, filter: `brightness(${viewerBrightness}%) contrast(${viewerContrast}%)` }}>
                    <svg width="340" height="340" className="cursor-crosshair bg-slate-950 rounded-lg shadow-2xl">
                      {selectedStudy.modality === 'CT' || selectedStudy.modality === 'MRI' ? (
                        <>
                          <circle cx="170" cy="170" r="135" fill="none" stroke="#223" strokeWidth="14" />
                          <circle cx="170" cy="170" r="125" fill="#0c0e1a" />
                          <path d="M145,145 Q170,115 170,170 Q170,225 145,195" fill="none" stroke="#1d283c" strokeWidth="6" />
                          <path d="M195,145 Q170,115 170,170 Q170,225 195,195" fill="none" stroke="#1d283c" strokeWidth="6" />
                        </>
                      ) : (
                        <>
                          <rect x="75" y="45" width="190" height="250" rx="8" fill="#05070d" />
                          <line x1="170" y1="45" x2="170" y2="295" stroke="#2a354c" strokeWidth="10" strokeDasharray="8,4" />
                          <ellipse cx="120" cy="160" rx="30" ry="75" fill="#020305" stroke="#101827" strokeWidth="2" />
                          <ellipse cx="220" cy="160" rx="30" ry="75" fill="#020305" stroke="#101827" strokeWidth="2" />
                        </>
                      )}
                      {showAIOverlay && selectedStudy.aiFindings.roi && (
                        <g>
                          <circle cx={selectedStudy.aiFindings.roi.x} cy={selectedStudy.aiFindings.roi.y} r={selectedStudy.aiFindings.roi.r} fill="none" stroke={selectedStudy.aiFindings.hasCriticalAlert ? '#ef4444' : '#a855f7'} strokeWidth="2.5" strokeDasharray="4,2" className="animate-pulse" />
                          <text x={selectedStudy.aiFindings.roi.x - 25} y={selectedStudy.aiFindings.roi.y - selectedStudy.aiFindings.roi.r - 6} fill={selectedStudy.aiFindings.hasCriticalAlert ? '#ef4444' : '#a855f7'} fontSize="9" fontWeight="bold" fontFamily="monospace">
                            AI: {selectedStudy.aiFindings.confidence.toFixed(1)}% Conf
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-gray-800">
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-gray-400 font-mono">BRIGHTNESS:</span>
                    <input type="range" min="50" max="150" value={viewerBrightness} onChange={e => setViewerBrightness(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded accent-sky-500" />
                  </div>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-gray-400 font-mono">CONTRAST:</span>
                    <input type="range" min="50" max="150" value={viewerContrast} onChange={e => setViewerContrast(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded accent-sky-500" />
                  </div>
                </div>
              </div>
            </section>

            {/* Right Reporting & AI Panel */}
            <section className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-800">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-black uppercase text-gray-200">AI Findings Assistant</h4>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-purple-400">Candidate Finding</span>
                      <h5 className="text-xs font-black text-white mt-0.5">{selectedStudy.aiFindings.label}</h5>
                    </div>
                    <span className="bg-purple-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">{selectedStudy.aiFindings.confidence}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{selectedStudy.aiFindings.description}</p>
                  <div className="flex space-x-2 mt-2">
                    <button onClick={() => { setSelectedStudy(prev => ({ ...prev, aiFindings: { ...prev.aiFindings, accepted: true } })); addAudit('Accepted AI Finding', selectedStudy.accessionNumber); showToast('AI Finding Accepted', 'Finding included in report draft', 'success'); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg">Accept AI</button>
                    <button onClick={() => { addAudit('Rejected AI Finding', selectedStudy.accessionNumber); showToast('AI Finding Rejected', 'Finding excluded', 'info'); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 text-[10px] font-bold py-1.5 rounded-lg">Reject</button>
                  </div>
                </div>
              </div>

              {/* Dictation Desk */}
              <div className={`p-4 rounded-2xl border flex-1 flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-black uppercase text-gray-200">Structured Dictation Desk</h4>
                  </div>
                  <button onClick={handleDictateSimulate} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold ${isDictating ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-gray-300'}`}>{isDictating ? 'Transcribing…' : 'Voice Dictate'}</button>
                </div>

                <textarea value={dictationText} onChange={e => setDictationText(e.target.value)} placeholder="Dictate or type report..." className="w-full flex-1 min-h-[120px] text-[10px] p-2.5 border rounded-xl font-mono mt-3 bg-slate-950 border-gray-800 text-white resize-none" />

                <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">PIN Auth (Demo: 1234):</span>
                    <input type="password" placeholder="PIN" value={pathologistPIN} onChange={e => setPathologistPIN(e.target.value)} className="w-20 text-center text-xs p-1 rounded bg-slate-950 border border-gray-800 text-white font-mono" />
                  </div>
                  <button onClick={handleSignRelease} disabled={selectedStudy.status === 'RELEASED'} className={`w-full text-xs font-bold py-2 rounded-lg transition-all ${selectedStudy.status === 'RELEASED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                    {selectedStudy.status === 'RELEASED' ? '✓ Report Signed & Released' : 'Sign & Release Report'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ════ PAGE 3: RIS SCHEDULING SYSTEM ════════════════════════════ */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><Calendar className="w-4 h-4 text-sky-400" /><span>Book Radiology Scan</span></h3>
              <form onSubmit={e => { e.preventDefault(); if (!newApptName) return; const newS: Study = { id: 'std_' + Date.now(), patientName: newApptName, age: 40, gender: 'Male', abhaId: `${newApptName.toLowerCase().replace(/\s+/g,'')}@abha`, modality: newApptModality, procedureName: `${newApptModality} Scan`, priority: newApptPriority, status: 'SCHEDULED', accessionNumber: `ACC-2026-${Math.floor(10000+Math.random()*90000)}`, doseMsv: 1.5, aiFindings: { label: 'Awaiting Scan', confidence: 0, hasCriticalAlert: false, description: 'Scan pending', roi: { x: 150, y: 150, r: 10 } }, clinicalHistory: newApptHistory || 'Referred for scan', consentSigned: false, metalImplantChecked: false, contrastAllergyChecked: false, fastingConfirmed: false, pregnancyScreened: false }; setStudies([newS, ...studies]); setNewApptName(''); setNewApptHistory(''); showToast('Scan Booked', `Appointment created for ${newApptName}`, 'success'); }} className="mt-4 space-y-3">
                <div><label className="text-[9px] uppercase font-bold text-gray-400">Patient Name</label><input required type="text" value={newApptName} onChange={e => setNewApptName(e.target.value)} placeholder="e.g. Rajesh Kumar" className="w-full text-xs p-2.5 rounded-xl border bg-slate-950 border-gray-800 text-white mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[9px] uppercase font-bold text-gray-400">Modality</label><select value={newApptModality} onChange={e => setNewApptModality(e.target.value as any)} className="w-full text-xs p-2.5 rounded-xl border bg-slate-950 border-gray-800 text-white mt-1"><option value="CT">CT</option><option value="MRI">MRI</option><option value="X-Ray">X-Ray</option><option value="Ultrasound">Ultrasound</option></select></div>
                  <div><label className="text-[9px] uppercase font-bold text-gray-400">Priority</label><select value={newApptPriority} onChange={e => setNewApptPriority(e.target.value as any)} className="w-full text-xs p-2.5 rounded-xl border bg-slate-950 border-gray-800 text-white mt-1"><option value="ROUTINE">Routine</option><option value="URGENT">Urgent</option><option value="EMERGENCY">Emergency STAT</option></select></div>
                </div>
                <div><label className="text-[9px] uppercase font-bold text-gray-400">Clinical History</label><textarea value={newApptHistory} onChange={e => setNewApptHistory(e.target.value)} placeholder="Indication..." className="w-full text-xs p-2.5 rounded-xl border bg-slate-950 border-gray-800 text-white mt-1 h-20 resize-none" /></div>
                <button type="submit" className="w-full bg-sky-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-sky-700">Create Booking Slot</button>
              </form>
            </div>
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3">Scheduled Patient Queue</h3>
              <div className="mt-4 space-y-3">
                {studies.filter(s => s.status === 'SCHEDULED' || s.status === 'ARRIVED').map(s => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-black text-white">{s.patientName} ({s.modality})</h4>
                      <p className="text-[10px] text-gray-400">{s.procedureName} • Acc: {s.accessionNumber}</p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ PAGE 4: RADIOLOGY ORDER INBOX ═════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex justify-between items-center">
              <span className="flex items-center space-x-2"><FilePlus className="w-4 h-4 text-sky-400" /><span>Radiology Order Inbox (Auto-Received from EMR)</span></span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-bold">{mockRadiologyOrders.length} New Orders</span>
            </h3>
            <div className="mt-4 space-y-3">
              {mockRadiologyOrders.map(ord => (
                <div key={ord.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white">{ord.patientName}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${ord.priority === 'STAT' ? 'bg-red-500 text-white' : 'bg-sky-500/20 text-sky-400'}`}>{ord.priority}</span>
                      <span className="text-[9px] text-gray-500">({ord.uhid})</span>
                    </div>
                    <p className="text-[10px] text-sky-400 font-bold mt-1">{ord.studyName} • {ord.modality}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Indication: {ord.clinicalIndication}</p>
                    <p className="text-[9px] text-gray-500">Ordered By: {ord.orderingDoctor} ({ord.department})</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => showToast('Protocol Assigned', `Assigned protocol for ${ord.patientName}`, 'success')} className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Assign Protocol</button>
                    <button onClick={() => showToast('Order Accepted', `Accepted order ${ord.id}`, 'info')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Accept Order</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 5: PATIENT SAFETY & PRE-SCAN ═════════════════════════ */}
        {activeTab === 'safety' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Patient Safety & Modality Pre-Scan Screening</span></h3>
            <div className="mt-4 space-y-4">
              {studies.map(st => (
                <div key={st.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
                  <div>
                    <h4 className="font-black text-white">{st.patientName} ({st.modality})</h4>
                    <p className="text-[10px] text-gray-400">{st.procedureName}</p>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded mt-2 inline-block ${st.safetyCleared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{st.safetyCleared ? 'SAFETY CLEARED' : 'REVIEW REQUIRED'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="p-2 bg-slate-950 rounded flex justify-between"><span>Consent Form:</span><span className={st.consentSigned ? 'text-emerald-400 font-bold' : 'text-red-400'}>{st.consentSigned ? 'Signed' : 'Pending'}</span></div>
                    <div className="p-2 bg-slate-950 rounded flex justify-between"><span>Metal Implant:</span><span className={st.metalImplantChecked ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{st.metalImplantChecked ? 'No Implant' : 'Unchecked'}</span></div>
                    <div className="p-2 bg-slate-950 rounded flex justify-between"><span>Contrast eGFR:</span><span className={st.contrastAllergyChecked ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{st.contrastAllergyChecked ? 'eGFR > 60 OK' : 'Pending'}</span></div>
                    <div className="p-2 bg-slate-950 rounded flex justify-between"><span>Pregnancy Screen:</span><span className={st.pregnancyScreened ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{st.pregnancyScreened ? 'Negative' : 'N/A'}</span></div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => { const updated = studies.map(s => s.id === st.id ? { ...s, safetyCleared: true, consentSigned: true, metalImplantChecked: true, contrastAllergyChecked: true } : s); setStudies(updated); showToast('Cleared', `Patient ${st.patientName} safety cleared for scan`, 'success'); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-4 py-2 rounded-lg">Authorize Safety Clear</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 6: MODALITY WORKLIST ═════════════════════════════════ */}
        {activeTab === 'worklist' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><CheckSquare className="w-4 h-4 text-sky-400" /><span>Technologist Modality Worklist (Scan Execution Pipeline)</span></h3>
            <div className="mt-4 space-y-3">
              {studies.map(st => (
                <div key={st.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-bold">{st.modality}</span>
                    <h4 className="font-black text-white mt-1">{st.patientName} — {st.procedureName}</h4>
                    <p className="text-[10px] text-gray-400">Acc: {st.accessionNumber} • Priority: {st.priority}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-slate-800 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded">{st.status}</span>
                    <button onClick={() => { const next = st.status === 'SCHEDULED' ? 'ARRIVED' : st.status === 'ARRIVED' ? 'SCANNING' : st.status === 'SCANNING' ? 'AI_PROCESSED' : 'RELEASED'; const updated = studies.map(s => s.id === st.id ? { ...s, status: next as any } : s); setStudies(updated); showToast('Worklist State Updated', `${st.patientName} shifted to ${next}`, 'info'); }} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg">Advance Stage →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 7: LIVE MACHINE CONTROL BOARD (EXISTING ENHANCED) ════ */}
        {activeTab === 'machines' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Online Devices</span>
                <h4 className="text-2xl font-black mt-1 text-emerald-400">{machines.filter(m => m.status === 'ONLINE').length}/{machines.length}</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Scans Conducted</span>
                <h4 className="text-2xl font-black mt-1 text-sky-400">{machines.reduce((a, m) => a + m.scansToday, 0)}</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Avg Utilization</span>
                <h4 className="text-2xl font-black mt-1 text-purple-400">81%</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Maintenance</span>
                <h4 className="text-2xl font-black mt-1 text-amber-400">{machines.filter(m => m.status === 'MAINTENANCE').length}</h4>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {machines.map(m => (
                <div key={m.id} className="p-5 rounded-2xl border border-slate-800 bg-[#0f172a] space-y-3">
                  <div className="flex justify-between items-start">
                    <h5 className="font-black text-white text-xs">{m.id} - {m.name}</h5>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${m.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{m.status}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${m.utilization}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Scans: {m.scansToday}</span>
                    <span>Utilization: {m.utilization}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 8: EMERGENCY RADIOLOGY (EXISTING ENHANCED) ═══════════ */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border-2 border-red-500/30 bg-red-500/5 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white"><Siren className="w-5 h-5" /></div>
                <div><h3 className="text-xs font-black text-red-400 uppercase">Emergency Radiology Command</h3><p className="text-[10px] text-gray-400">STAT Stroke & Trauma Imaging Protocols</p></div>
              </div>
              <button onClick={() => { setEmergencyActive(!emergencyActive); if (!emergencyActive) setEmergencyTimer(0); }} className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${emergencyActive ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}>{emergencyActive ? 'Stand Down STAT' : 'Activate STAT Timer'}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studies.filter(s => s.priority === 'EMERGENCY').map(st => (
                <div key={st.id} className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-black text-white">{st.patientName}</h4>
                    <p className="text-[10px] text-red-300 mt-0.5">{st.procedureName}</p>
                    <p className="text-[9px] text-gray-400 mt-1">Finding: {st.aiFindings.label}</p>
                  </div>
                  <button onClick={() => { setSelectedStudy(st); setActiveTab('reporting'); }} className="bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg">PACS View →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 9: AI RADIOLOGY ASSISTANT ═════════════════════════════ */}
        {activeTab === 'ai_assistant' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-purple-400 border-b border-gray-800 pb-3 flex items-center space-x-2"><Brain className="w-4 h-4" /><span>AI Radiology Decision Support & Candidate Findings</span></h3>
            <div className="mt-4 space-y-4">
              {studies.map(st => (
                <div key={st.id} className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-white">{st.patientName} ({st.modality}) — {st.procedureName}</span>
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">Confidence: {st.aiFindings.confidence}%</span>
                  </div>
                  <p className="text-[11px] text-purple-200 font-bold">AI Finding: {st.aiFindings.label}</p>
                  <p className="text-[10px] text-gray-400">{st.aiFindings.description}</p>
                  <div className="flex space-x-2 pt-2">
                    <button onClick={() => showToast('AI Finding Accepted', `Accepted AI finding for ${st.patientName}`, 'success')} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg">Accept AI Finding</button>
                    <button onClick={() => showToast('AI Finding Modified', `Editing AI finding for ${st.patientName}`, 'info')} className="bg-sky-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg">Edit Finding</button>
                    <button onClick={() => showToast('AI Finding Rejected', `Rejected AI finding for ${st.patientName}`, 'warn')} className="bg-slate-800 text-gray-300 text-[10px] font-bold px-3 py-1 rounded-lg">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 10: STRUCTURED REPORTING & VOICE ═════════════════════ */}
        {activeTab === 'dictation' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex justify-between items-center">
              <span className="flex items-center space-x-2"><Mic className="w-4 h-4 text-sky-400" /><span>Structured Dictation & Template Studio</span></span>
              <button onClick={handleDictateSimulate} className="bg-sky-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg">{isDictating ? 'Transcribing…' : 'Simulate Dictation'}</button>
            </h3>
            <div className="mt-4 space-y-3">
              <textarea value={dictationText} onChange={e => setDictationText(e.target.value)} rows={10} className="w-full text-xs p-3 rounded-xl border bg-slate-950 border-gray-800 text-white font-mono" />
              <div className="flex space-x-2">
                {['Normal Chest CXR', 'Normal Head CT', 'Stroke Protocol', 'Abdomen USG'].map(tmpl => (
                  <button key={tmpl} onClick={() => setDictationText(`TEMPLATE [${tmpl.toUpperCase()}]:\nEXAMINATION: ${tmpl}\nFINDINGS: Unremarkable mucosal outlines and parenchymal structures.\nIMPRESSION: Normal study.`)} className="bg-slate-800 text-gray-300 text-[9px] font-bold px-2.5 py-1 rounded-lg hover:text-white">Insert {tmpl}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ PAGE 11: PREVIOUS STUDIES & COMPARISON ════════════════════ */}
        {activeTab === 'comparison' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><Layers className="w-4 h-4 text-sky-400" /><span>Chronological Image Comparison & Change Delta</span></h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-black rounded-xl border border-slate-800 text-center text-xs">
                <span className="text-sky-400 font-bold block mb-2">CURRENT STUDY: {selectedStudy.procedureName} ({new Date().toLocaleDateString()})</span>
                <div className="w-48 h-48 bg-slate-950 rounded-lg mx-auto flex items-center justify-center border border-slate-800 text-gray-500 font-mono text-[10px]">Current Image Canvas</div>
              </div>
              <div className="p-4 bg-black rounded-xl border border-slate-800 text-center text-xs">
                <span className="text-amber-400 font-bold block mb-2">PREVIOUS STUDY: {selectedStudy.previousStudyDate || '2025-11-12'}</span>
                <div className="w-48 h-48 bg-slate-950 rounded-lg mx-auto flex items-center justify-center border border-slate-800 text-gray-500 font-mono text-[10px]">Historical Baseline Canvas</div>
              </div>
            </div>
          </div>
        )}

        {/* ════ PAGE 12: CRITICAL FINDINGS CENTER ═════════════════════════ */}
        {activeTab === 'critical' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-red-400 border-b border-gray-800 pb-3 flex items-center space-x-2"><ShieldAlert className="w-4 h-4" /><span>Central Critical Findings Escalation Desk</span></h3>
            <div className="mt-4 space-y-3">
              {criticalFindings.map(cf => (
                <div key={cf.id} className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-black text-white">{cf.patient} ({cf.uhid})</h4>
                    <p className="text-[10px] text-red-300 mt-0.5">{cf.finding}</p>
                    <p className="text-[9px] text-gray-400 mt-1">Doctor: {cf.doctor} ({cf.dept}) • Time: {cf.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded ${cf.status === 'ACKNOWLEDGED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-600 text-white animate-pulse'}`}>{cf.status}</span>
                    {cf.status !== 'ACKNOWLEDGED' && (
                      <button onClick={() => { const updated = criticalFindings.map(c => c.id === cf.id ? { ...c, status: 'ACKNOWLEDGED', ackBy: 'Dr. Sunita Deshmukh' } : c); setCriticalFindings(updated); showToast('Acknowledged', 'Critical finding acknowledged by clinical team', 'success'); }} className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg">Confirm Doctor Ack</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 13: REPORT SIGN & RELEASE ═════════════════════════════ */}
        {activeTab === 'sign_release' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><Lock className="w-4 h-4 text-emerald-400" /><span>Report Authorization & Immutability Management</span></h3>
            <div className="mt-4 space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h4 className="font-black text-white">{selectedStudy.patientName} — {selectedStudy.procedureName}</h4>
                <p className="text-[10px] text-gray-400">Status: <span className="text-emerald-400 font-bold">{selectedStudy.status}</span></p>
                <div className="p-3 bg-slate-950 rounded-lg text-[10px] font-mono text-gray-300">{selectedStudy.dictatedReport || 'Report draft pending dictation.'}</div>
                {selectedStudy.addendums && selectedStudy.addendums.map((a, i) => (
                  <div key={i} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-300">
                    <span className="font-bold">SIGNED ADDENDUM ({a.date}):</span> {a.text}
                  </div>
                ))}
                {selectedStudy.status === 'RELEASED' && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <input type="text" value={addendumInput} onChange={e => setAddendumInput(e.target.value)} placeholder="Type addendum note..." className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-gray-800 text-white" />
                    <button onClick={handleAddAddendum} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-4 py-2 rounded-lg">Create Signed Addendum</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════ PAGE 14: REPORT DISTRIBUTION ═════════════════════════════ */}
        {activeTab === 'distribution' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><Send className="w-4 h-4 text-sky-400" /><span>Cross-Portal Automated Report Distribution Matrix</span></h3>
            <div className="mt-4 space-y-3 text-xs">
              {[
                { portal: 'Doctor Portal (EMR)', status: 'SYNCED', time: 'Instant', icon: User },
                { portal: 'Nurse Care Portal', status: 'SYNCED', time: 'Instant', icon: Heart },
                { portal: 'Emergency Care OS', status: 'SYNCED', time: 'Instant', icon: Siren },
                { portal: 'Patient ABDM Timeline App', status: 'DISPATCHED', time: 'ABDM Push', icon: Share2 },
                { portal: 'Hospital Command Center Alerts', status: 'RESOLVED', time: 'Realtime', icon: Activity },
              ].map((p, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <p.icon className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white">{p.portal}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded">{p.status} ({p.time})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 15: QUALITY CONTROL (EXISTING PRESERVED) ═════════════ */}
        {activeTab === 'quality' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3">Daily Device Calibration Audits</h4>
                <div className="mt-3 space-y-2 text-xs">
                  {machines.map(m => (
                    <div key={m.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded">PASSED</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3">Technologist Image Repeat Metrics</h4>
                <div className="mt-3 space-y-2 text-xs">
                  <p className="text-[10px] text-emerald-400 font-bold">Overall repeat rate: 1.9% (Benchmark &lt; 3.0% OK)</p>
                  <p className="text-[10px] text-gray-400">Motion artifact: 1 • Positioning: 1 • Contrast timing: 1</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ PAGE 16: RADIATION DOSE MONITORING ════════════════════════ */}
        {activeTab === 'dose' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-amber-400 border-b border-gray-800 pb-3 flex items-center space-x-2"><Zap className="w-4 h-4" /><span>Radiation Dose Monitoring & AERB Compliance</span></h3>
            <div className="mt-4 space-y-3 text-xs">
              {studies.filter(s => s.doseMsv > 0).map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-white">{s.patientName} — {s.modality} ({s.procedureName})</h4>
                    <p className="text-[10px] text-gray-400">Dose Index: <span className="text-amber-400 font-bold">{s.doseMsv.toFixed(2)} mSv</span> {s.ctdivol ? `• CTDIvol: ${s.ctdivol} mGy • DLP: ${s.dlp} mGy*cm` : ''}</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded">ALARA COMPLIANT</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PAGE 17: ANALYTICS (EXISTING PRESERVED) ═══════════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">CT Volume</span><h4 className="text-xl font-black text-sky-400 mt-1">48 scans</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">MRI Volume</span><h4 className="text-xl font-black text-purple-400 mt-1">14 scans</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">X-Ray Volume</span><h4 className="text-xl font-black text-emerald-400 mt-1">92 scans</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Avg TAT</span><h4 className="text-xl font-black text-amber-400 mt-1">14.8 min</h4>
              </div>
            </div>
          </div>
        )}

        {/* ════ PAGE 18: IMAGE SHARING (EXISTING PRESERVED) ════════════════ */}
        {activeTab === 'sharing' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><Share2 className="w-4 h-4 text-sky-400" /><span>Secure ABDM Encrypted Link & QR Generator</span></h3>
            <div className="mt-4 space-y-4 text-xs">
              <button onClick={() => { setShareLink(`https://pacs.mcgm.gov.in/share/${Date.now().toString(36)}`); showToast('Link Generated', 'ABDM consent encrypted link generated', 'success'); }} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl">Generate Encrypted Share Link</button>
              {shareLink && <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sky-300 text-[10px]">{shareLink}</div>}
            </div>
          </div>
        )}

        {/* ════ PAGE 19: RADIOLOGY COMMUNICATION HUB ══════════════════════ */}
        {activeTab === 'communication' && (
          <div className={`p-6 rounded-2xl border flex flex-col h-[550px] ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><MessageSquare className="w-4 h-4 text-sky-400" /><span>Radiology Clinical Communication Hub</span></h3>
            <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1 custom-scrollbar">
              {messages.map(m => (
                <div key={m.id} className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-black text-sky-400">{m.sender} → {m.recipient}</span>
                    <span className="text-gray-500">{m.time}</span>
                  </div>
                  <p className="text-white mt-1">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex space-x-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type urgent clinical note..." className="flex-1 text-xs p-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white" />
              <button onClick={() => { if (!chatInput) return; setMessages(prev => [...prev, { id: 'MSG-' + Date.now(), sender: 'Dr. A. K. Verma (Radiology)', recipient: 'Emergency Doctor', patient: selectedStudy.patientName, text: chatInput, time: 'Just now', ack: true }]); setChatInput(''); showToast('Message Sent', 'Clinical note dispatched to ER doctor', 'success'); }} className="bg-sky-600 text-white font-bold text-xs px-4 rounded-xl">Send</button>
            </div>
          </div>
        )}

        {/* ════ PAGE 20: AUDIT & GOVERNANCE ═══════════════════════════════ */}
        {activeTab === 'audit' && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xs font-black uppercase text-white border-b border-gray-800 pb-3 flex items-center space-x-2"><Lock className="w-4 h-4 text-emerald-400" /><span>Radiology Tamper-Proof Audit & Access Log</span></h3>
            <div className="mt-4 space-y-2 text-xs">
              {auditLog.map(entry => (
                <div key={entry.id} className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center text-[10px]">
                  <div>
                    <span className="font-bold text-white">{entry.user} ({entry.role})</span>
                    <p className="text-gray-400 mt-0.5">{entry.action} → <span className="text-sky-300">{entry.target}</span></p>
                  </div>
                  <span className="text-gray-500 font-mono">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl flex items-start space-x-3 text-white">
          <div className="bg-sky-500/10 text-sky-400 p-2 rounded-lg"><Bell className="w-5 h-5" /></div>
          <div><h5 className="text-xs font-black">{toastMessage.title}</h5><p className="text-[10px] text-gray-400 mt-1">{toastMessage.text}</p></div>
        </div>
      )}
    </div>
  );
}
