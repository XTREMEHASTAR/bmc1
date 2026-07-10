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
  Mic,
  MicOff,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  RotateCw,
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
  Tv,
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
  Copy
} from 'lucide-react';

interface Study {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  abhaId: string;
  modality: 'CT' | 'MRI' | 'X-Ray' | 'Ultrasound' | 'Mammography' | 'PET-CT' | 'DEXA' | 'Fluoroscopy';
  procedureName: string;
  priority: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  status: 'SCHEDULED' | 'ACQUIRING' | 'QC_PENDING' | 'AI_PROCESSED' | 'REPORTING' | 'RELEASED';
  accessionNumber: string;
  doseMsv: number;
  aiFindings: {
    label: string;
    confidence: number;
    hasCriticalAlert: boolean;
    description: string;
    roi: { x: number; y: number; r: number }; // Bounding circle for simulated overlay
  };
  clinicalHistory: string;
  consentSigned: boolean;
  metalImplantChecked: boolean;
  contrastAllergyChecked: boolean;
  fastingConfirmed: boolean;
  pregnancyScreened: boolean;
  scannedAt?: string;
  previousStudyDate?: string;
  previousStudyId?: string;
  referringDoctor?: string;
  department?: string;
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
    aiFindings: {
      label: 'Acute Intracranial Hemorrhage',
      confidence: 96.4,
      hasCriticalAlert: true,
      description: 'Hyperdense lesion noted in the left basal ganglia measuring 24 x 18 mm. Surrounding edema and minor mass effect on the left lateral ventricle.',
      roi: { x: 180, y: 155, r: 28 }
    },
    clinicalHistory: 'Sudden onset left-sided weakness, slurred speech. Onset 90 minutes prior to admission.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: true,
    pregnancyScreened: true,
    scannedAt: '2026-07-09T10:15:00Z',
    previousStudyDate: '2025-11-12',
    previousStudyId: 'std_prev_901',
    referringDoctor: 'Dr. Sunita Deshmukh',
    department: 'Neurology'
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
    doseMsv: 0.0, // MRI has no ionizing radiation
    aiFindings: {
      label: 'Demyelinating Lesion (Active)',
      confidence: 89.2,
      hasCriticalAlert: false,
      description: 'Multiple hyperintense foci on T2/FLAIR images in the periventricular white matter. Largest lesion shows gadolinium enhancement.',
      roi: { x: 140, y: 120, r: 16 }
    },
    clinicalHistory: 'Sensory paresthesia, transient vision loss in left eye (optic neuritis query).',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: true,
    pregnancyScreened: true,
    scannedAt: '2026-07-09T09:30:00Z',
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
      description: 'Opacification of the right lower lung field with air bronchograms. Consistent with lobar pneumonia.',
      roi: { x: 210, y: 220, r: 40 }
    },
    clinicalHistory: 'High-grade fever, productive cough with rusty sputum, dyspnea on exertion.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: false,
    fastingConfirmed: false,
    pregnancyScreened: true,
    scannedAt: '2026-07-09T10:45:00Z',
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
    scannedAt: '2026-07-09T08:15:00Z',
    previousStudyDate: '2026-04-10',
    previousStudyId: 'std_prev_904',
    referringDoctor: 'Dr. Kavita Joshi',
    department: 'Oncology'
  },
  {
    id: 'std_005',
    patientName: 'Bala Subrahmanyam',
    age: 50,
    gender: 'Male',
    abhaId: 'bala.subra@abha',
    modality: 'MRI',
    procedureName: 'MRI Spine (Lumbar)',
    priority: 'ROUTINE',
    status: 'SCHEDULED',
    accessionNumber: 'ACC-2026-99085',
    doseMsv: 0.0,
    aiFindings: {
      label: 'L4-L5 Disc Herniation',
      confidence: 88.0,
      hasCriticalAlert: false,
      description: 'Posterolateral extrusion of disc material causing compression of the left descending nerve root.',
      roi: { x: 150, y: 190, r: 18 }
    },
    clinicalHistory: 'Chronic low back pain radiating down the left leg (sciatica). Positive straight leg raise.',
    consentSigned: false,
    metalImplantChecked: false,
    contrastAllergyChecked: false,
    fastingConfirmed: false,
    pregnancyScreened: false,
    referringDoctor: 'Dr. Prakash Rao',
    department: 'Orthopaedics'
  },
  {
    id: 'std_006',
    patientName: 'Sunita Ramesh Yadav',
    age: 54,
    gender: 'Female',
    abhaId: 'sunita.yadav@abha',
    modality: 'Mammography',
    procedureName: 'Digital Mammography - Bilateral Screening',
    priority: 'ROUTINE',
    status: 'AI_PROCESSED',
    accessionNumber: 'ACC-2026-99086',
    doseMsv: 0.4,
    aiFindings: {
      label: 'Suspicious Microcalcifications (BI-RADS 4)',
      confidence: 85.3,
      hasCriticalAlert: true,
      description: 'Cluster of pleomorphic microcalcifications in the upper outer quadrant of the right breast. Recommend biopsy.',
      roi: { x: 200, y: 130, r: 15 }
    },
    clinicalHistory: 'Annual screening mammogram. Family history of breast cancer (mother, diagnosed age 52).',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: false,
    pregnancyScreened: true,
    scannedAt: '2026-07-09T07:45:00Z',
    referringDoctor: 'Dr. Priya Shetty',
    department: 'Surgery'
  },
  {
    id: 'std_007',
    patientName: 'Mohammed Irfan Khan',
    age: 67,
    gender: 'Male',
    abhaId: 'irfan.khan@abha',
    modality: 'PET-CT',
    procedureName: 'FDG PET-CT - Staging Lymphoma',
    priority: 'URGENT',
    status: 'REPORTING',
    accessionNumber: 'ACC-2026-99087',
    doseMsv: 14.0,
    aiFindings: {
      label: 'Hypermetabolic Mediastinal Lymphadenopathy',
      confidence: 92.7,
      hasCriticalAlert: false,
      description: 'Multiple FDG-avid lymph nodes in the mediastinum (SUVmax 12.4) and bilateral axillae. Consistent with stage III lymphoma.',
      roi: { x: 175, y: 140, r: 32 }
    },
    clinicalHistory: 'Newly diagnosed Non-Hodgkin Lymphoma. Staging prior to chemotherapy initiation.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: true,
    pregnancyScreened: true,
    scannedAt: '2026-07-09T06:30:00Z',
    referringDoctor: 'Dr. Sneha Bhargava',
    department: 'Haematology'
  },
  {
    id: 'std_008',
    patientName: 'Lakshmi Devi Nair',
    age: 38,
    gender: 'Female',
    abhaId: 'lakshmi.nair@abha',
    modality: 'Ultrasound',
    procedureName: 'USG Abdomen & Pelvis - Complete',
    priority: 'ROUTINE',
    status: 'QC_PENDING',
    accessionNumber: 'ACC-2026-99088',
    doseMsv: 0.0,
    aiFindings: {
      label: 'Cholelithiasis (Gallstones)',
      confidence: 97.2,
      hasCriticalAlert: false,
      description: 'Multiple echogenic foci with posterior acoustic shadowing in the gallbladder. Largest measures 12 mm. No wall thickening.',
      roi: { x: 160, y: 170, r: 14 }
    },
    clinicalHistory: 'Recurrent right upper quadrant pain post meals. Rule out cholelithiasis.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: false,
    fastingConfirmed: true,
    pregnancyScreened: true,
    scannedAt: '2026-07-09T11:00:00Z',
    referringDoctor: 'Dr. Anil Mehta',
    department: 'General Surgery'
  },
  {
    id: 'std_009',
    patientName: 'Rajendra Prasad Gupta',
    age: 72,
    gender: 'Male',
    abhaId: 'rajendra.gupta@abha',
    modality: 'Fluoroscopy',
    procedureName: 'Barium Swallow - Dysphagia Work-up',
    priority: 'ROUTINE',
    status: 'ACQUIRING',
    accessionNumber: 'ACC-2026-99089',
    doseMsv: 1.5,
    aiFindings: {
      label: 'Awaiting Completion',
      confidence: 0,
      hasCriticalAlert: false,
      description: 'Study in progress. AI pre-analysis will run upon image upload.',
      roi: { x: 175, y: 175, r: 10 }
    },
    clinicalHistory: 'Progressive dysphagia to solids over 3 months. Weight loss of 5 kg. Rule out esophageal pathology.',
    consentSigned: true,
    metalImplantChecked: true,
    contrastAllergyChecked: true,
    fastingConfirmed: true,
    pregnancyScreened: true,
    referringDoctor: 'Dr. Ramesh Nair',
    department: 'Gastroenterology'
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
  const [viewerZoom, setViewerZoom] = useState<number>(1);
  const [viewerPan, setViewerPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewerBrightness, setViewerBrightness] = useState<number>(100);
  const [viewerContrast, setViewerContrast] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showAIOverlay, setShowAIOverlay] = useState<boolean>(true);
  const [showMeasureTool, setShowMeasureTool] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [pacsMode, setPacsMode] = useState<'slice' | 'previous' | '3d'>('slice');

  // Voice report / Dictation states
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictationText, setDictationText] = useState<string>('');
  const [pathologistPIN, setPathologistPIN] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tab views within workstation
  const [activeTab, setActiveTab] = useState<'reporting' | 'schedule' | 'analytics' | 'quality' | 'emergency' | 'machines' | 'sharing'>('reporting');

  // Scheduling states
  const [newApptName, setNewApptName] = useState<string>('');
  const [newApptModality, setNewApptModality] = useState<'CT' | 'MRI' | 'X-Ray' | 'Ultrasound'>('CT');
  const [newApptPriority, setNewApptPriority] = useState<'EMERGENCY' | 'URGENT' | 'ROUTINE'>('ROUTINE');
  const [newApptHistory, setNewApptHistory] = useState<string>('');

  // Machine status
  const [machines] = useState([
    { id: 'CT-01', name: 'GE Revolution CT 256-Slice', status: 'ONLINE' as const, utilization: 94, scansToday: 28, avgScanTime: '12 min', lastCalibration: 'Today 06:15 AM', nextMaintenance: '2026-07-22' },
    { id: 'MRI-01', name: 'Siemens Magnetom 3T MRI', status: 'ONLINE' as const, utilization: 88, scansToday: 14, avgScanTime: '32 min', lastCalibration: 'Today 05:40 AM', nextMaintenance: '2026-07-18' },
    { id: 'XR-01', name: 'Fujifilm FDR D-EVO II DR', status: 'ONLINE' as const, utilization: 72, scansToday: 42, avgScanTime: '4 min', lastCalibration: 'Yesterday 08:30 PM', nextMaintenance: '2026-08-01' },
    { id: 'XR-02', name: 'Fujifilm FDR D-EVO II DR (Bay 2)', status: 'MAINTENANCE' as const, utilization: 0, scansToday: 0, avgScanTime: '-', lastCalibration: 'Yesterday 06:00 PM', nextMaintenance: 'In Progress' },
    { id: 'US-01', name: 'GE Voluson E10 Ultrasound', status: 'ONLINE' as const, utilization: 65, scansToday: 18, avgScanTime: '18 min', lastCalibration: 'Today 07:00 AM', nextMaintenance: '2026-08-05' },
    { id: 'MAMMO-01', name: 'Hologic Selenia Dimensions', status: 'ONLINE' as const, utilization: 48, scansToday: 8, avgScanTime: '8 min', lastCalibration: 'Today 06:30 AM', nextMaintenance: '2026-07-30' },
  ]);

  // Image Sharing
  const [shareLink, setShareLink] = useState<string>('');
  const [shareExpiry, setShareExpiry] = useState<string>('24h');
  const [showShareQR, setShowShareQR] = useState(false);

  // Emergency timer
  const [emergencyTimer, setEmergencyTimer] = useState(0);
  const [emergencyActive, setEmergencyActive] = useState(false);

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

  // Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (title: string, text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ title, text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Preset voice dictation simulation
  const handleDictateSimulate = () => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }
    setIsDictating(true);
    setDictationText('');
    let sentence = '';
    if (selectedStudy.modality === 'CT') {
      sentence = `IMAGING REPORT: NON-CONTRAST HEAD CT.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: Left basal ganglia hemorrhagic lesion measuring approximately 24 x 18 mm. Surrounding focal edema is present. The midline structures are shifted by 3mm to the right. Ventricles are within normal limits for age. No skull fractures noted.\n\nIMPRESSION:\n1. Acute Intracranial Hemorrhage in the left basal ganglia.\n2. Accompanying peri-lesional edema creating minor mass effect. Immediate neurosurgical consult advised.`;
    } else if (selectedStudy.modality === 'MRI') {
      sentence = `IMAGING REPORT: BRAIN MRI WITH GADOLINIUM.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: Multiple high-signal T2 FLAIR plaques located in the periventricular white matter and corpus callosum. Mild active enhancement seen in the dominant plaque in the left parietal region. Brainstem is normal.\n\nIMPRESSION: Consistent with active demyelinating disease, highly suggestive of Multiple Sclerosis exacerbation.`;
    } else if (selectedStudy.modality === 'Mammography') {
      sentence = `IMAGING REPORT: BILATERAL DIGITAL MAMMOGRAPHY.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: Cluster of pleomorphic microcalcifications in the upper outer quadrant of the right breast, spanning approximately 8 mm. No associated mass or architectural distortion. Left breast is unremarkable.\n\nBI-RADS CATEGORY: 4B — Suspicious finding.\n\nIMPRESSION: Suspicious microcalcifications in the right breast. Stereotactic biopsy recommended within 14 days.`;
    } else if (selectedStudy.modality === 'PET-CT') {
      sentence = `IMAGING REPORT: FDG PET-CT WHOLE BODY.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: Multiple FDG-avid mediastinal lymph nodes (SUVmax 12.4). Bilateral axillary lymphadenopathy (SUVmax 8.6). Mild splenic FDG uptake. No osseous lesions. No FDG-avid pulmonary parenchymal disease.\n\nIMPRESSION:\n1. Stage III lymphoma with mediastinal and axillary involvement.\n2. Baseline staging scan prior to chemotherapy. Follow-up PET-CT recommended post 2 cycles.`;
    } else if (selectedStudy.modality === 'Ultrasound') {
      sentence = `IMAGING REPORT: USG ABDOMEN AND PELVIS COMPLETE.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: Gallbladder contains multiple echogenic foci with posterior acoustic shadowing, largest measuring 12 mm. No gallbladder wall thickening or pericholecystic fluid. Liver, spleen, pancreas and kidneys are unremarkable.\n\nIMPRESSION: Cholelithiasis (multiple gallstones). No evidence of acute cholecystitis. Surgical consultation recommended.`;
    } else if (selectedStudy.modality === 'Fluoroscopy') {
      sentence = `IMAGING REPORT: BARIUM SWALLOW STUDY.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: Smooth narrowing of the distal esophagus with proximal dilatation. Bird-beak appearance at the gastroesophageal junction. No mucosal irregularity or filling defect.\n\nIMPRESSION: Findings suggestive of achalasia cardia. Recommend esophageal manometry for confirmation.`;
    } else {
      sentence = `IMAGING REPORT: CHEST X-RAY PA VIEW.\n\nCLINICAL HISTORY: ${selectedStudy.clinicalHistory}\n\nFINDINGS: Lobar consolidation in the right lower lobe with faint air bronchograms. No pleural effusion. Heart size is within normal limits.\n\nIMPRESSION: Right lower lobe pneumonia. Recommend antibiotic therapy and clinical correlation.`;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDictationText(prev => prev + sentence.charAt(i));
      i++;
      if (i >= sentence.length) {
        clearInterval(interval);
        setIsDictating(false);
        showToast('Transcription Done', 'AI completed voice report draft', 'success');
      }
    }, 20);
  };

  // Sign & release study report
  const handleSignRelease = () => {
    if (pathologistPIN !== '1234') {
      showToast('Authentication Failed', 'Invalid security PIN code', 'warn');
      return;
    }
    const updated = studies.map(s => {
      if (s.id === selectedStudy.id) {
        return { ...s, status: 'RELEASED' as const };
      }
      return s;
    });
    setStudies(updated);
    setSelectedStudy({ ...selectedStudy, status: 'RELEASED' });
    setPathologistPIN('');
    showToast('Report Released', `Report signed and dispatched to patient ABDM timeline`, 'success');
  };

  // Simulate PACS DICOM canvas interaction
  const handleViewerClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!showMeasureTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (measurePoints.length >= 2) {
      setMeasurePoints([{ x, y }]);
    } else {
      setMeasurePoints([...measurePoints, { x, y }]);
    }
  };

  // Calculate measurement distance
  const getMeasurementDistance = () => {
    if (measurePoints.length < 2) return null;
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Assume 1 pixel = 0.12 mm calibration
    const dist = Math.sqrt(dx * dx + dy * dy) * 0.12;
    return dist.toFixed(1) + ' mm';
  };

  // Simulate new scheduling request
  const handleScheduleAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptName) return;

    const newStudy: Study = {
      id: 'std_' + (Date.now()).toString(),
      patientName: newApptName,
      age: Math.floor(Math.random() * 50) + 20,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      abhaId: `${newApptName.toLowerCase().replace(/\s+/g, '')}@abha`,
      modality: newApptModality,
      procedureName: `${newApptModality} Scan - Scheduled Procedure`,
      priority: newApptPriority,
      status: 'SCHEDULED',
      accessionNumber: `ACC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      doseMsv: newApptModality === 'CT' ? 3.5 : newApptModality === 'X-Ray' ? 0.08 : 0.0,
      aiFindings: {
        label: 'Awaiting Scan',
        confidence: 0,
        hasCriticalAlert: false,
        description: 'AI pre-analysis will trigger upon image acquisition.',
        roi: { x: 150, y: 150, r: 10 }
      },
      clinicalHistory: newApptHistory || 'Referred for clinical evaluation',
      consentSigned: false,
      metalImplantChecked: false,
      contrastAllergyChecked: false,
      fastingConfirmed: false,
      pregnancyScreened: false
    };

    setStudies([newStudy, ...studies]);
    setNewApptName('');
    setNewApptHistory('');
    showToast('Appointment Scheduled', `Patient queue updated for ${newApptName}`, 'success');
  };

  const handleStatusChange = (studyId: string, nextStatus: Study['status']) => {
    const updated = studies.map(s => {
      if (s.id === studyId) {
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setStudies(updated);
    if (selectedStudy.id === studyId) {
      setSelectedStudy({ ...selectedStudy, status: nextStatus });
    }
    showToast('Status Updated', `Study state transitioned to ${nextStatus}`, 'info');
  };

  // Filter studies based on search query
  const filteredStudies = studies.filter(s =>
    s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.modality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.abhaId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0b0f19] text-gray-100' : 'bg-slate-50 text-gray-900'} font-sans flex flex-col transition-colors duration-200`}>
      
      {/* Workstation Header */}
      <header className={`border-b ${isDarkMode ? 'border-gray-800 bg-[#0f172a]' : 'border-gray-200 bg-white'} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="bg-sky-650 bg-sky-600 p-2.5 rounded-xl text-white shadow-lg flex items-center justify-center">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-tight text-white">MCGM Digital PACS & RIS</h1>
              <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Sion Hospital Node
              </span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Picture Archiving, Communication & AI Diagnostics Workstation v4.2
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="hidden lg:flex items-center space-x-8">
          <div className="text-center">
            <span className="block text-[10px] uppercase font-bold text-gray-400">Critical Queue</span>
            <span className="text-sm font-black text-red-500 flex items-center justify-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{studies.filter(s => s.priority === 'EMERGENCY' && s.status !== 'RELEASED').length} Studies</span>
            </span>
          </div>
          <div className="text-center border-l border-gray-800 pl-8">
            <span className="block text-[10px] uppercase font-bold text-gray-400">Active Modalities</span>
            <span className="text-sm font-black text-sky-400">MRI-1, CT-2, XR-4</span>
          </div>
          <div className="text-center border-l border-gray-800 pl-8">
            <span className="block text-[10px] uppercase font-bold text-gray-400">Avg Report TAT</span>
            <span className="text-sm font-black text-emerald-400">14.8 minutes</span>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode ? 'bg-[#1e293b] border-gray-700 text-yellow-400 hover:bg-slate-800' : 'bg-slate-100 border-gray-300 text-gray-600 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onLogout}
            className="bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Port</span>
          </button>
        </div>
      </header>

      {/* Global Tab Navigation */}
      <div className={`px-6 py-2 border-b flex justify-between items-center ${isDarkMode ? 'bg-[#0f172a]/60 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('reporting')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'reporting'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>PACS Reporting Desk</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>RIS Scheduling System</span>
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'quality'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>QC Calibration Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-red-400/60 hover:text-red-300 hover:bg-red-500/10'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>Emergency</span>
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'machines'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Machines</span>
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'sharing'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Sharing</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64 max-w-sm hidden sm:block">
          <input
            type="text"
            placeholder="Search patient, modality, ABHA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/60 text-xs px-3.5 py-1.5 pl-9 rounded-xl border border-gray-700 text-white focus:outline-none focus:border-sky-500 placeholder-gray-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <main className="flex-1 p-6 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 min-h-0">
        
        {/* TAB 1: PACS REPORTING WORKSPACE */}
        {activeTab === 'reporting' && (
          <>
            {/* Left Column: RIS Worklist / Study Queue */}
            <section className="w-full lg:w-80 flex flex-col space-y-4 flex-shrink-0">
              <div className={`p-4 rounded-2xl border flex flex-col h-[580px] ${isDarkMode ? 'bg-[#0f172a]/95 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Patient Worklist</h3>
                  <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold text-sky-400">
                    {filteredStudies.length} Cases
                  </span>
                </div>

                {/* Queue Filter Tabs */}
                <div className="grid grid-cols-3 gap-1 mt-3 mb-2">
                  <button className="bg-sky-500/10 text-sky-400 text-[9px] font-black rounded py-1 uppercase text-center">
                    All Scans
                  </button>
                  <button className="bg-red-500/10 text-red-500 text-[9px] font-black rounded py-1 uppercase text-center">
                    Emergency
                  </button>
                  <button className="bg-slate-800 text-gray-400 text-[9px] font-black rounded py-1 uppercase text-center">
                    Pending
                  </button>
                </div>

                {/* Queue List Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-2.5 mt-2 pr-1 custom-scrollbar">
                  {filteredStudies.map((st) => {
                    const isSelected = st.id === selectedStudy.id;
                    const priorityColors =
                      st.priority === 'EMERGENCY'
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : st.priority === 'URGENT'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-slate-800 text-gray-400 border-gray-700';

                    const statusLabels: Record<Study['status'], { text: string; bg: string }> = {
                      SCHEDULED: { text: 'Scheduled', bg: 'text-gray-400 bg-gray-800' },
                      ACQUIRING: { text: 'Acquiring', bg: 'text-blue-400 bg-blue-500/10' },
                      QC_PENDING: { text: 'QC Pending', bg: 'text-purple-400 bg-purple-500/10' },
                      AI_PROCESSED: { text: 'AI Processed', bg: 'text-pink-400 bg-pink-500/10' },
                      REPORTING: { text: 'Drafting', bg: 'text-orange-400 bg-orange-500/10' },
                      RELEASED: { text: 'Released', bg: 'text-emerald-400 bg-emerald-500/10' }
                    };

                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          setSelectedStudy(st);
                          setViewerZoom(1);
                          setViewerPan({ x: 0, y: 0 });
                          setMeasurePoints([]);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/5 shadow-inner'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-slate-800 text-gray-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                              {st.modality}
                            </span>
                            <span className={`ml-1.5 border text-[8px] px-1.5 py-0.5 rounded-full font-bold ${priorityColors}`}>
                              {st.priority}
                            </span>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${statusLabels[st.status].bg}`}>
                            {statusLabels[st.status].text}
                          </span>
                        </div>

                        <h4 className="text-xs font-black mt-2 text-white line-clamp-1">{st.patientName}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {st.age}Y • {st.gender} • {st.accessionNumber}
                        </p>

                        {/* Critical Finding Highlight Tag */}
                        {st.aiFindings.hasCriticalAlert && st.status !== 'RELEASED' && (
                          <div className="flex items-center space-x-1 mt-2 text-red-500 bg-red-500/5 border border-red-500/20 p-1.5 rounded-lg text-[9px] font-bold animate-pulse">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{st.aiFindings.label}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Queue Summary / Machine Status panel */}
                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Total Radiation Dose:</span>
                  <span className="font-bold text-amber-500">
                    {studies.reduce((acc, curr) => acc + curr.doseMsv, 0).toFixed(2)} mSv today
                  </span>
                </div>
              </div>
            </section>

            {/* Center Column: Interactive DICOM-like PACS Viewer */}
            <section className="flex-1 flex flex-col space-y-4 min-w-0">
              <div className={`p-4 rounded-2xl border flex flex-col flex-1 h-[580px] ${isDarkMode ? 'bg-[#0a0f1d] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                {/* Viewer Toolbar */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-800 flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setPacsMode('slice')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        pacsMode === 'slice' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Active Study
                    </button>
                    <button
                      onClick={() => setPacsMode('previous')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        pacsMode === 'previous' ? 'bg-sky-650 bg-sky-600 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Compare Studies
                    </button>
                    <button
                      onClick={() => setPacsMode('3d')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        pacsMode === '3d' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      3D MPR Model
                    </button>
                  </div>

                  {/* DICOM Action Controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setViewerZoom(prev => Math.min(prev + 0.2, 3))}
                      title="Zoom In"
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewerZoom(prev => Math.max(prev - 0.2, 0.6))}
                      title="Zoom Out"
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRotation(prev => (prev + 90) % 360)}
                      title="Rotate study"
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setShowMeasureTool(!showMeasureTool);
                        setMeasurePoints([]);
                      }}
                      title="Distance Measure Tool"
                      className={`p-2 rounded transition-colors cursor-pointer ${
                        showMeasureTool ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowAIOverlay(!showAIOverlay)}
                      title="Toggle AI Bounding Box Overlays"
                      className={`p-2 rounded transition-colors cursor-pointer ${
                        showAIOverlay ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    </button>
                    <button
                      onClick={() => {
                        setViewerZoom(1);
                        setViewerPan({ x: 0, y: 0 });
                        setViewerBrightness(100);
                        setViewerContrast(100);
                        setMeasurePoints([]);
                      }}
                      title="Reset parameters"
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* DICOM Grid Canvas area */}
                <div className="flex-1 relative bg-black border border-slate-900 rounded-xl overflow-hidden mt-4 flex items-center justify-center select-none">
                  {/* Slice Information Overlays */}
                  <div className="absolute top-3 left-3 z-10 text-[10px] text-gray-400 font-mono space-y-0.5 bg-black/60 p-2 rounded-lg pointer-events-none">
                    <p className="text-white font-bold">{selectedStudy.patientName}</p>
                    <p>{selectedStudy.gender} • {selectedStudy.age}Y</p>
                    <p>ID: {selectedStudy.id}</p>
                    <p>Acc: {selectedStudy.accessionNumber}</p>
                    <p className="text-sky-300">ABHA: {selectedStudy.abhaId}</p>
                    {selectedStudy.referringDoctor && <p className="text-amber-400">Ref: {selectedStudy.referringDoctor} ({selectedStudy.department})</p>}
                  </div>

                  <div className="absolute top-3 right-3 z-10 text-[10px] text-gray-400 font-mono text-right bg-black/60 p-2 rounded-lg pointer-events-none">
                    <p className="text-sky-400 font-bold">{selectedStudy.procedureName}</p>
                    <p>Slice: 18 / 32 (Axial)</p>
                    <p>KVP: 120 • MA: 250</p>
                    <p>Dose: {selectedStudy.doseMsv.toFixed(2)} mSv</p>
                    {selectedStudy.scannedAt && <p>Scanned: {new Date(selectedStudy.scannedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>

                  <div className="absolute bottom-3 left-3 z-10 text-[10px] text-gray-400 font-mono bg-black/60 p-2 rounded-lg pointer-events-none">
                    <p>ZOOM: {(viewerZoom * 100).toFixed(0)}%</p>
                    <p>WW: 80 / WL: 40</p>
                    {showMeasureTool && <p className="text-sky-400 font-bold">MEASURE TOOL ACTIVE</p>}
                  </div>

                  <div className="absolute bottom-3 right-3 z-10 text-[10px] text-gray-400 font-mono text-right bg-black/60 p-2 rounded-lg pointer-events-none">
                    <p className="text-emerald-400 font-bold uppercase">DICOM COMPLIANT</p>
                    <p>MCGM Local Server PACS-01</p>
                  </div>

                  {/* MAIN CANVAS GRAPHIC */}
                  <div
                    className="relative transition-transform duration-100"
                    style={{
                      transform: `scale(${viewerZoom}) translate(${viewerPan.x}px, ${viewerPan.y}px) rotate(${rotation}deg)`,
                      filter: `brightness(${viewerBrightness}%) contrast(${viewerContrast}%)`
                    }}
                  >
                    <svg
                      width="350"
                      height="350"
                      onClick={handleViewerClick}
                      className="cursor-crosshair bg-slate-950 rounded-lg shadow-2xl"
                    >
                      {/* Anatomy Outline Representation based on Modality */}
                      {selectedStudy.modality === 'CT' || selectedStudy.modality === 'MRI' ? (
                        <>
                          {/* Inner Skull structure */}
                          <circle cx="175" cy="175" r="140" fill="none" stroke="#223" strokeWidth="15" />
                          <circle cx="175" cy="175" r="130" fill="#0c0e1a" />
                          {/* Ventricles */}
                          <path d="M150,150 Q175,120 175,175 Q175,230 150,200" fill="none" stroke="#1d283c" strokeWidth="6" />
                          <path d="M200,150 Q175,120 175,175 Q175,230 200,200" fill="none" stroke="#1d283c" strokeWidth="6" />
                          {/* Brain tissue folds */}
                          <path d="M80,175 C80,100 270,100 270,175 C270,250 80,250 80,175 Z" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="5,15" />
                        </>
                      ) : (
                        <>
                          {/* Chest X-ray outline representation */}
                          <path d="M80,50 L270,50 L270,300 L80,300 Z" fill="#05070d" />
                          {/* Rib cage lines */}
                          <path d="M80,90 Q175,70 270,90 M80,130 Q175,110 270,130 M80,170 Q175,150 270,170 M80,210 Q175,190 270,210" fill="none" stroke="#1e293b" strokeWidth="3" />
                          {/* Spine column */}
                          <line x1="175" y1="50" x2="175" y2="300" stroke="#2a354c" strokeWidth="12" strokeDasharray="8,4" />
                          {/* Lung black zones */}
                          <ellipse cx="120" cy="160" rx="35" ry="80" fill="#020305" stroke="#101827" strokeWidth="2" />
                          <ellipse cx="230" cy="160" rx="35" ry="80" fill="#020305" stroke="#101827" strokeWidth="2" />
                          {/* Heart silhouette */}
                          <path d="M160,180 Q175,150 200,200 Q175,230 160,180" fill="#151e2e" opacity="0.8" />
                        </>
                      )}

                      {/* AI Bounding Box Overlay */}
                      {showAIOverlay && selectedStudy.aiFindings.roi && (
                        <g>
                          <circle
                            cx={selectedStudy.aiFindings.roi.x}
                            cy={selectedStudy.aiFindings.roi.y}
                            r={selectedStudy.aiFindings.roi.r}
                            fill="none"
                            stroke={selectedStudy.aiFindings.hasCriticalAlert ? '#ef4444' : '#a855f7'}
                            strokeWidth="2.5"
                            strokeDasharray="4,2"
                            className="animate-pulse"
                          />
                          <text
                            x={selectedStudy.aiFindings.roi.x - 30}
                            y={selectedStudy.aiFindings.roi.y - selectedStudy.aiFindings.roi.r - 8}
                            fill={selectedStudy.aiFindings.hasCriticalAlert ? '#ef4444' : '#a855f7'}
                            fontSize="9"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            AI: {selectedStudy.aiFindings.confidence.toFixed(1)}% Conf
                          </text>
                        </g>
                      )}

                      {/* Interactive Measurement Line */}
                      {showMeasureTool && measurePoints.map((pt, idx) => (
                        <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="#0ea5e9" />
                      ))}
                      {showMeasureTool && measurePoints.length === 2 && (
                        <g>
                          <line
                            x1={measurePoints[0].x}
                            y1={measurePoints[0].y}
                            x2={measurePoints[1].x}
                            y2={measurePoints[1].y}
                            stroke="#0ea5e9"
                            strokeWidth="2"
                          />
                          <text
                            x={(measurePoints[0].x + measurePoints[1].x) / 2 + 10}
                            y={(measurePoints[0].y + measurePoints[1].y) / 2 - 10}
                            fill="#0ea5e9"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {getMeasurementDistance()}
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Adjust Brightness & Contrast slider controls */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400 font-mono w-16">BRIGHTNESS:</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={viewerBrightness}
                      onChange={(e) => setViewerBrightness(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400 font-mono w-16">CONTRAST:</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={viewerContrast}
                      onChange={(e) => setViewerContrast(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Right Column: AI Assistant & Reporting Workspace */}
            <section className="w-full lg:w-96 flex flex-col space-y-4 flex-shrink-0">
              {/* AI Findings Summary Card */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a]/95 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-800">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h4 className="text-xs font-black uppercase text-gray-200">AI Medical Assistant</h4>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="flex justify-between items-center bg-purple-500/5 border border-purple-500/20 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-400">Primary AI Suggestion</span>
                      <h5 className="text-xs font-black text-white mt-0.5">{selectedStudy.aiFindings.label}</h5>
                    </div>
                    <span className="bg-purple-600 text-white font-mono text-xs font-bold px-2 py-1 rounded-lg">
                      {selectedStudy.aiFindings.confidence.toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-normal">
                    {selectedStudy.aiFindings.description}
                  </p>

                  {/* Previous Study Reference info if available */}
                  {selectedStudy.previousStudyDate && (
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-gray-400 block uppercase text-[8px] font-bold">Previous Study Ref</span>
                        <span className="text-white font-bold">{selectedStudy.modality} Study on {selectedStudy.previousStudyDate}</span>
                      </div>
                      <button
                        onClick={() => {
                          setPacsMode('previous');
                          showToast('Compare View Triggered', 'Loading side-by-side chronological study comparison', 'info');
                        }}
                        className="text-sky-400 hover:underline font-bold"
                      >
                        Compare
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dictation & Report Drafting Card */}
              <div className={`p-4 rounded-2xl border flex-1 flex flex-col ${isDarkMode ? 'bg-[#0f172a]/95 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-5 h-5 text-sky-400" />
                    <h4 className="text-xs font-black uppercase text-gray-200">Structured Dictation Desk</h4>
                  </div>
                  <button
                    onClick={handleDictateSimulate}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isDictating ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-gray-300 hover:text-white'
                    }`}
                  >
                    {isDictating ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isDictating ? 'Transcribing...' : 'Dictate'}</span>
                  </button>
                </div>

                <div className="flex-1 mt-3 flex flex-col space-y-3">
                  <textarea
                    value={dictationText}
                    onChange={(e) => setDictationText(e.target.value)}
                    placeholder="Enter or dictate radiologist clinical findings report..."
                    className="w-full flex-1 min-h-[140px] bg-slate-950 text-[11px] p-3 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-sky-500 resize-none font-mono"
                  />

                  {/* Sign & Authentication Action */}
                  <div className="bg-slate-900/60 p-3 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Pathologist Security PIN:</span>
                      </span>
                      <span className="text-[9px] text-gray-500">Demo PIN: 1234</span>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="password"
                        placeholder="PIN Code"
                        value={pathologistPIN}
                        onChange={(e) => setPathologistPIN(e.target.value)}
                        className="w-24 bg-slate-950 text-center font-bold text-xs p-2.5 rounded-lg border border-gray-800 text-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={handleSignRelease}
                        disabled={selectedStudy.status === 'RELEASED'}
                        className={`flex-1 font-bold text-xs rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                          selectedStudy.status === 'RELEASED'
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{selectedStudy.status === 'RELEASED' ? 'Signed & Dispatched' : 'Sign & Release'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* TAB 2: RIS SCHEDULING SYSTEM */}
        {activeTab === 'schedule' && (
          <section className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Book Scan Form */}
            <div className={`p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-black text-white uppercase border-b border-gray-800 pb-3 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                <span>Schedule New Patient Scan</span>
              </h3>

              <form onSubmit={handleScheduleAppt} className="mt-4 space-y-4 flex-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Govind Rao"
                    value={newApptName}
                    onChange={(e) => setNewApptName(e.target.value)}
                    className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-gray-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Imaging Modality</label>
                    <select
                      value={newApptModality}
                      onChange={(e) => setNewApptModality(e.target.value as any)}
                      className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-gray-800 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="CT">CT Scan</option>
                      <option value="MRI">MRI Scan</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Ultrasound">Ultrasound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Priority Classification</label>
                    <select
                      value={newApptPriority}
                      onChange={(e) => setNewApptPriority(e.target.value as any)}
                      className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-gray-800 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency (STAT)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Clinical History / Indication</label>
                  <textarea
                    placeholder="Provide details of clinical symptoms or surgical history..."
                    value={newApptHistory}
                    onChange={(e) => setNewApptHistory(e.target.value)}
                    className="w-full bg-slate-950 text-xs p-3.5 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-sky-500 h-28 resize-none"
                  />
                </div>

                {/* Pre-prep instructions hint */}
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-[10px] text-gray-400">
                  <span className="font-bold text-sky-400 block mb-1">Pre-Procedure Preparation</span>
                  Fasting instructions, contrast consent forms, and pregnancy screening forms will be dispatched automatically via ABDM / SMS.
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  Create Appointment Slot
                </button>
              </form>
            </div>

            {/* Center: Live Modality Check-In Queue & Checklist */}
            <div className={`p-6 rounded-2xl border lg:col-span-2 flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-black text-white uppercase border-b border-gray-800 pb-3 flex justify-between items-center">
                <span>Modality Check-in & Acquisition Checklist</span>
                <span className="text-xs bg-slate-800 text-sky-400 px-2.5 py-0.5 rounded font-mono font-bold">SION-CT-02 Active</span>
              </h3>

              <div className="mt-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {studies.filter(st => st.status === 'SCHEDULED' || st.status === 'ACQUIRING').map(st => (
                  <div key={st.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <h4 className="text-xs font-black text-white">{st.patientName}</h4>
                      <p className="text-[10px] text-gray-400">{st.modality} • {st.procedureName}</p>
                      <p className="text-[9px] text-gray-500 font-mono mt-1">Accession: {st.accessionNumber}</p>
                    </div>

                    {/* Checklists */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <button
                        onClick={() => {
                          const updated = studies.map(s => s.id === st.id ? { ...s, consentSigned: !s.consentSigned } : s);
                          setStudies(updated);
                        }}
                        className={`flex items-center space-x-1.5 p-1.5 rounded transition-all ${
                          st.consentSigned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Consent Signed</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = studies.map(s => s.id === st.id ? { ...s, metalImplantChecked: !s.metalImplantChecked } : s);
                          setStudies(updated);
                        }}
                        className={`flex items-center space-x-1.5 p-1.5 rounded transition-all ${
                          st.metalImplantChecked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>No Metal Implant</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = studies.map(s => s.id === st.id ? { ...s, contrastAllergyChecked: !s.contrastAllergyChecked } : s);
                          setStudies(updated);
                        }}
                        className={`flex items-center space-x-1.5 p-1.5 rounded transition-all ${
                          st.contrastAllergyChecked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Allergy Screened</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = studies.map(s => s.id === st.id ? { ...s, fastingConfirmed: !s.fastingConfirmed } : s);
                          setStudies(updated);
                        }}
                        className={`flex items-center space-x-1.5 p-1.5 rounded transition-all ${
                          st.fastingConfirmed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Fasting Verified</span>
                      </button>
                    </div>

                    {/* Acquisition status actions */}
                    <div className="flex justify-end space-x-2">
                      {st.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleStatusChange(st.id, 'ACQUIRING')}
                          disabled={!st.consentSigned || !st.metalImplantChecked}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          Check In Patient
                        </button>
                      )}
                      {st.status === 'ACQUIRING' && (
                        <button
                          onClick={() => handleStatusChange(st.id, 'AI_PROCESSED')}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                        >
                          Complete Image Acquisition
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {studies.filter(st => st.status === 'SCHEDULED' || st.status === 'ACQUIRING').length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No active patients in check-in/acquisition phase. All patient imaging completed.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: QC CALIBRATION LOGS */}
        {activeTab === 'quality' && (
          <section className="flex-1 space-y-6">
            {/* Top Row: Calibration + Radiation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className="text-sm font-black text-white uppercase border-b border-gray-800 pb-3 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Modality Calibration & Daily QA Audits</span>
                </h3>
                <div className="mt-4 space-y-3.5">
                  {[
                    { name: 'CT Scanner (GE Revolution 256)', time: 'Today 06:15 AM', result: 'Pass (0.12mm accuracy)' },
                    { name: 'MRI 3T System (Siemens Magnetom)', time: 'Today 05:40 AM', result: 'Pass (99.8% Homogeneity)' },
                    { name: 'DR X-Ray System (Fujifilm FDR)', time: 'Yesterday 08:30 PM', result: 'Pass (Aligned Grid)' },
                    { name: 'Mammography (Hologic Selenia)', time: 'Today 06:30 AM', result: 'Pass (AEC verified)' },
                    { name: 'Ultrasound (GE Voluson E10)', time: 'Today 07:00 AM', result: 'Pass (Phantom test OK)' },
                  ].map(m => (
                    <div key={m.name} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-white">{m.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Last calibration: {m.time}</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-1 rounded font-bold uppercase">{m.result}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className="text-sm font-black text-white uppercase border-b border-gray-800 pb-3 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Radiation Exposure Monitor</span>
                </h3>
                <div className="mt-4 space-y-4 flex-1">
                  <p className="text-xs text-gray-400 leading-normal">
                    In compliance with Atomic Energy Regulatory Board (AERB) directives, patient dose levels are mapped via digital detectors and uploaded into the Central Registry.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl text-center">
                      <span className="block text-[10px] uppercase font-bold text-gray-400">Total Dose Index</span>
                      <span className="text-xl font-black text-amber-500 block mt-1">{studies.reduce((a, s) => a + s.doseMsv, 0).toFixed(1)} mSv</span>
                      <span className="text-[9px] text-gray-400">cumulative today</span>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl text-center">
                      <span className="block text-[10px] uppercase font-bold text-gray-400">Dose Alert Threshold</span>
                      <span className="text-xl font-black text-emerald-400 block mt-1">20 mSv</span>
                      <span className="text-[9px] text-gray-400">patient warning cap</span>
                    </div>
                  </div>

                  {/* Per-patient dose breakdown */}
                  <div className="space-y-2 mt-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Patient Dose Log (Today)</span>
                    {studies.filter(s => s.doseMsv > 0 && s.scannedAt).map(s => (
                      <div key={s.id} className="flex justify-between items-center bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg text-[10px]">
                        <span className="text-white font-bold">{s.patientName}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-500">{s.modality}</span>
                          <span className={`font-bold font-mono ${s.doseMsv > 10 ? 'text-red-400' : s.doseMsv > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>{s.doseMsv.toFixed(2)} mSv</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Technician Performance + Protocol Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3 flex items-center space-x-2">
                  <User className="w-4 h-4 text-sky-400" /><span>Technician Performance</span>
                </h4>
                <div className="mt-4 space-y-3">
                  {[
                    { name: 'Tech. Suresh Patkar', scans: 18, repeats: 0, rating: 'Excellent' },
                    { name: 'Tech. Meena Chavan', scans: 15, repeats: 1, rating: 'Good' },
                    { name: 'Tech. Rajiv Awale', scans: 12, repeats: 0, rating: 'Excellent' },
                    { name: 'Tech. Deepa Sawant', scans: 9, repeats: 1, rating: 'Good' },
                  ].map(tech => (
                    <div key={tech.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                      <div>
                        <h5 className="text-xs font-bold text-white">{tech.name}</h5>
                        <p className="text-[10px] text-gray-500">{tech.scans} scans • {tech.repeats} repeat(s)</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tech.rating === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>{tech.rating}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3">Protocol Compliance Audit</h4>
                <div className="mt-4 space-y-3">
                  {[
                    { protocol: 'Patient ID Verification (ABHA/QR)', compliance: 100 },
                    { protocol: 'Consent Form Signed', compliance: 96 },
                    { protocol: 'Pregnancy Screening (Female)', compliance: 98 },
                    { protocol: 'Metal Implant Checklist', compliance: 100 },
                    { protocol: 'Contrast Allergy Review', compliance: 94 },
                    { protocol: 'Fasting Verification', compliance: 88 },
                  ].map(p => (
                    <div key={p.protocol} className="flex items-center space-x-3 text-[10px]">
                      <span className="text-gray-400 flex-1">{p.protocol}</span>
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.compliance >= 98 ? 'bg-emerald-500' : p.compliance >= 90 ? 'bg-sky-500' : 'bg-amber-500'}`} style={{ width: `${p.compliance}%` }} />
                      </div>
                      <span className="font-bold text-white w-10 text-right">{p.compliance}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3">Image Quality Metrics</h4>
                <div className="mt-4 space-y-3">
                  {[
                    { metric: 'Images Accepted First Pass', value: '98.1%', status: 'good' },
                    { metric: 'Rejected for Motion Artifact', value: '0.8%', status: 'good' },
                    { metric: 'Rejected for Positioning', value: '0.6%', status: 'good' },
                    { metric: 'Contrast Timing Issues', value: '0.5%', status: 'good' },
                    { metric: 'Overall Repeat Rate', value: '1.9%', status: 'good' },
                  ].map(m => (
                    <div key={m.metric} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px]">
                      <span className="text-gray-400">{m.metric}</span>
                      <span className="font-bold text-emerald-400">{m.value}</span>
                    </div>
                  ))}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg text-[10px] text-emerald-400 font-bold text-center">
                    All metrics within MCGM quality benchmarks ✓
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: DEPARTMENT ANALYTICS */}
        {activeTab === 'analytics' && (
          <section className="flex-1 space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'CT Scans', value: '48', trend: '+12%', color: 'text-sky-400' },
                { label: 'MRI Scans', value: '14', trend: '+5%', color: 'text-purple-400' },
                { label: 'X-Rays', value: '92', trend: '+18%', color: 'text-emerald-400' },
                { label: 'Avg Report TAT', value: '14.8m', trend: '-22%', color: 'text-amber-400' },
                { label: 'Repeat Scans', value: '3', trend: '-40%', color: 'text-red-400' },
                { label: 'AI Accuracy', value: '97.8%', trend: '+1.2%', color: 'text-purple-400' },
              ].map(kpi => (
                <div key={kpi.label} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">{kpi.label}</span>
                  <h4 className={`text-xl font-black mt-1 ${kpi.color}`}>{kpi.value}</h4>
                  <p className="text-[10px] text-emerald-400 mt-1 font-bold flex items-center space-x-1"><TrendingUp className="w-3 h-3" /><span>{kpi.trend}</span></p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Chart */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3">Weekly Imaging Volume</h4>
                <div className="mt-4 h-40 flex items-end justify-between space-x-2">
                  {[
                    { day: 'Mon', ct: 45, mri: 12, xr: 78 },
                    { day: 'Tue', ct: 52, mri: 14, xr: 92 },
                    { day: 'Wed', ct: 38, mri: 16, xr: 85 },
                    { day: 'Thu', ct: 48, mri: 11, xr: 90 },
                    { day: 'Fri', ct: 55, mri: 18, xr: 95 },
                    { day: 'Sat', ct: 30, mri: 8, xr: 60 },
                    { day: 'Sun', ct: 20, mri: 5, xr: 35 },
                  ].map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center space-y-1">
                      <div className="w-full flex flex-col items-center space-y-0.5">
                        <div className="w-full bg-sky-500/60 rounded-t" style={{ height: `${d.ct * 1.2}px` }} title={`CT: ${d.ct}`} />
                        <div className="w-full bg-purple-500/60 rounded" style={{ height: `${d.mri * 2}px` }} title={`MRI: ${d.mri}`} />
                        <div className="w-full bg-emerald-500/60 rounded-b" style={{ height: `${d.xr * 0.8}px` }} title={`XR: ${d.xr}`} />
                      </div>
                      <span className="text-[9px] font-bold text-gray-500">{d.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-3 text-[9px]">
                  <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-sky-500" /><span className="text-gray-400">CT</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-purple-500" /><span className="text-gray-400">MRI</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-gray-400">X-Ray</span></span>
                </div>
              </div>

              {/* Radiologist Productivity */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3">Radiologist Productivity</h4>
                <div className="mt-4 space-y-3">
                  {[
                    { name: 'Dr. A. K. Verma', reports: 28, avgTime: '11 min', accuracy: 99.1 },
                    { name: 'Dr. Meera S. Rao', reports: 24, avgTime: '13 min', accuracy: 98.4 },
                    { name: 'Dr. Farhan Patel', reports: 19, avgTime: '16 min', accuracy: 97.9 },
                    { name: 'Dr. Neha Gupta', reports: 15, avgTime: '18 min', accuracy: 98.8 },
                  ].map(doc => (
                    <div key={doc.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                      <div>
                        <h5 className="text-xs font-bold text-white">{doc.name}</h5>
                        <p className="text-[10px] text-gray-500">{doc.reports} reports today • Avg {doc.avgTime}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">{doc.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Peak Hours & AI Predictions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3">Peak Hours Today</h4>
                <div className="mt-4 space-y-2">
                  {[
                    { hour: '08:00 - 10:00', load: 95, label: 'Peak' },
                    { hour: '10:00 - 12:00', load: 82, label: 'High' },
                    { hour: '12:00 - 14:00', load: 45, label: 'Moderate' },
                    { hour: '14:00 - 16:00', load: 78, label: 'High' },
                    { hour: '16:00 - 18:00', load: 60, label: 'Moderate' },
                  ].map(h => (
                    <div key={h.hour} className="flex items-center space-x-3 text-[10px]">
                      <span className="text-gray-500 w-24 font-mono">{h.hour}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${h.load > 85 ? 'bg-red-500' : h.load > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${h.load}%` }} />
                      </div>
                      <span className="font-bold text-gray-400 w-8">{h.load}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3 flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" /><span>AI Volume Predictions</span>
                </h4>
                <div className="mt-4 space-y-3">
                  {[
                    { metric: 'Tomorrow Patient Volume', prediction: '~165 scans', confidence: 89 },
                    { metric: 'Next Week Emergency Cases', prediction: '~14 cases', confidence: 72 },
                    { metric: 'Storage Growth (30d)', prediction: '+2.4 TB', confidence: 94 },
                    { metric: 'Staff Requirement (Tomorrow)', prediction: '3 radiologists', confidence: 81 },
                  ].map(p => (
                    <div key={p.metric} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px]">
                      <div>
                        <span className="text-gray-400 block">{p.metric}</span>
                        <span className="font-bold text-white">{p.prediction}</span>
                      </div>
                      <span className="text-purple-400 font-bold">AI {p.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3">Repeat Scan Tracking</h4>
                <div className="mt-4 space-y-3">
                  {[
                    { reason: 'Motion artifact', count: 1, modality: 'MRI' },
                    { reason: 'Positioning error', count: 1, modality: 'X-Ray' },
                    { reason: 'Contrast timing', count: 1, modality: 'CT' },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px]">
                      <div>
                        <span className="font-bold text-white">{r.reason}</span>
                        <span className="text-gray-500 ml-2">({r.modality})</span>
                      </div>
                      <span className="text-amber-400 font-bold">{r.count} repeat(s)</span>
                    </div>
                  ))}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg text-[10px] text-emerald-400 font-bold text-center">
                    Repeat rate: 1.9% — Below 3% national benchmark ✓
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: EMERGENCY RADIOLOGY */}
        {activeTab === 'emergency' && (
          <section className="flex-1 space-y-6">
            {/* Emergency Header Banner */}
            <div className={`p-5 rounded-2xl border-2 ${emergencyActive ? 'border-red-500 bg-red-500/5 animate-pulse' : 'border-red-500/20 bg-red-500/5'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white">
                    <Siren className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-red-400 uppercase">Emergency Radiology Command</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Stroke Protocol • Trauma Queue • Critical Alerts</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <span className="block text-[9px] uppercase font-bold text-gray-400">Elapsed</span>
                    <span className={`text-xl font-black font-mono ${emergencyActive ? 'text-red-400' : 'text-gray-600'}`}>{formatTimer(emergencyTimer)}</span>
                  </div>
                  <button
                    onClick={() => { setEmergencyActive(!emergencyActive); if (!emergencyActive) setEmergencyTimer(0); }}
                    className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${emergencyActive ? 'bg-gray-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'}`}
                  >
                    {emergencyActive ? <><Pause className="w-4 h-4" /><span>Stand Down</span></> : <><Zap className="w-4 h-4" /><span>Activate STAT Protocol</span></>}
                  </button>
                </div>
              </div>
            </div>

            {/* Trauma Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-red-400 border-b border-gray-800 pb-3 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" /><span>Trauma & Stroke Priority Queue</span>
                </h4>
                <div className="mt-4 space-y-3">
                  {studies.filter(s => s.priority === 'EMERGENCY').map(st => (
                    <div key={st.id} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex justify-between items-center">
                      <div>
                        <h5 className="text-xs font-black text-white">{st.patientName}</h5>
                        <p className="text-[10px] text-gray-400">{st.procedureName}</p>
                        <p className="text-[9px] text-red-400 font-bold mt-1">{st.aiFindings.label} • {st.aiFindings.confidence}% conf</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="bg-red-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">{st.status}</span>
                        <button onClick={() => { setSelectedStudy(st); setActiveTab('reporting'); }} className="text-[10px] text-sky-400 font-bold hover:underline cursor-pointer">Open in PACS →</button>
                      </div>
                    </div>
                  ))}
                  {studies.filter(s => s.priority === 'EMERGENCY').length === 0 && (
                    <p className="text-center text-xs text-gray-500 py-8">No active emergency cases</p>
                  )}
                </div>
              </div>

              {/* Emergency Protocols */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3">Quick Launch Protocols</h4>
                <div className="mt-4 space-y-3">
                  {[
                    { name: 'Stroke CT Protocol', desc: 'NCCT Head → CTA → CTP', color: 'red', time: '< 15 min door-to-scan' },
                    { name: 'Polytrauma Protocol', desc: 'CT Head + C-Spine + Chest + Abdomen', color: 'amber', time: '< 20 min full body scan' },
                    { name: 'Acute Abdomen Protocol', desc: 'CT Abdomen with IV Contrast', color: 'orange', time: '< 25 min scan + report' },
                    { name: 'Chest PE Protocol', desc: 'CTPA Pulmonary Angiography', color: 'purple', time: '< 18 min scan + AI screen' },
                    { name: 'Pediatric Emergency', desc: 'Low-dose CT Head / Ultrasound First', color: 'sky', time: 'ALARA dose optimization' },
                  ].map(proto => (
                    <button key={proto.name} onClick={() => showToast('Protocol Activated', `${proto.name} queued for next patient`, 'info')} className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-left transition-all cursor-pointer flex justify-between items-center">
                      <div>
                        <h5 className="text-xs font-bold text-white">{proto.name}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">{proto.desc}</p>
                      </div>
                      <span className="text-[9px] text-gray-500 font-mono">{proto.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Critical Alert Audit Log */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-500" /><span>Critical Alert Audit Trail (Last 24h)</span>
              </h4>
              <div className="mt-4 space-y-2">
                {[
                  { time: '10:18 AM', patient: 'Rohan D. Sharma', alert: 'Acute ICH detected by AI', action: 'Neurosurgery notified in 2 min', status: 'Resolved' },
                  { time: '08:22 AM', patient: 'Ananya S. Kulkarni', alert: 'Pulmonary nodule growth 27%', action: 'Oncology team alerted', status: 'Under Review' },
                  { time: '06:45 AM', patient: 'Meera R. Desai', alert: 'Tension pneumothorax on CXR', action: 'ER physician notified immediately', status: 'Resolved' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-mono text-gray-500 w-16">{log.time}</span>
                      <div>
                        <span className="font-bold text-white">{log.patient}</span>
                        <span className="text-gray-400 ml-2">— {log.alert}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: MACHINE STATUS */}
        {activeTab === 'machines' && (
          <section className="flex-1 space-y-6">
            {/* Machine KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Online Modalities</span>
                <h4 className="text-2xl font-black mt-1 text-emerald-400">{machines.filter(m => m.status === 'ONLINE').length}/{machines.length}</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Scans Today</span>
                <h4 className="text-2xl font-black mt-1 text-sky-400">{machines.reduce((a, m) => a + m.scansToday, 0)}</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">Avg Utilization</span>
                <h4 className="text-2xl font-black mt-1 text-purple-400">{(machines.filter(m => m.status === 'ONLINE').reduce((a, m) => a + m.utilization, 0) / machines.filter(m => m.status === 'ONLINE').length).toFixed(0)}%</h4>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400">In Maintenance</span>
                <h4 className="text-2xl font-black mt-1 text-amber-400">{machines.filter(m => m.status === 'MAINTENANCE').length}</h4>
              </div>
            </div>

            {/* Machine Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {machines.map(machine => (
                <div key={machine.id} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'} space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${machine.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-white">{machine.id}</h5>
                        <p className="text-[10px] text-gray-400">{machine.name}</p>
                      </div>
                    </div>
                    <span className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-1 rounded-full ${machine.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {machine.status === 'ONLINE' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      <span>{machine.status}</span>
                    </span>
                  </div>

                  {/* Utilization Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-400">Utilization</span>
                      <span className="font-bold text-white">{machine.utilization}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${machine.utilization > 85 ? 'bg-red-500' : machine.utilization > 60 ? 'bg-sky-500' : 'bg-emerald-500'}`} style={{ width: `${machine.utilization}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] pt-2 border-t border-gray-800">
                    <div><span className="text-gray-500 block">Scans Today</span><span className="font-bold text-white">{machine.scansToday}</span></div>
                    <div><span className="text-gray-500 block">Avg Time</span><span className="font-bold text-white">{machine.avgScanTime}</span></div>
                    <div><span className="text-gray-500 block">Last Calibrated</span><span className="font-bold text-white">{machine.lastCalibration}</span></div>
                    <div><span className="text-gray-500 block">Next Service</span><span className="font-bold text-white">{machine.nextMaintenance}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Predictive Maintenance */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h4 className="text-xs font-black uppercase text-gray-400 border-b border-gray-800 pb-3 flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" /><span>AI Predictive Maintenance Alerts</span>
              </h4>
              <div className="mt-4 space-y-3">
                {[
                  { machine: 'CT-01', prediction: 'X-Ray tube replacement recommended within 14 days', confidence: 87, severity: 'warn' },
                  { machine: 'MRI-01', prediction: 'Gradient coil temperature trending high — schedule coolant flush', confidence: 72, severity: 'info' },
                  { machine: 'US-01', prediction: 'Transducer probe C5-1 showing signal degradation', confidence: 64, severity: 'info' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                    <div className="flex items-center space-x-3">
                      <span className="bg-slate-800 text-sky-400 text-[10px] font-mono font-bold px-2 py-1 rounded">{alert.machine}</span>
                      <p className="text-xs text-gray-300">{alert.prediction}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${alert.severity === 'warn' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>AI {alert.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 7: IMAGE SHARING */}
        {activeTab === 'sharing' && (
          <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Share Study */}
            <div className={`p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-black text-white uppercase border-b border-gray-800 pb-3 flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-sky-400" /><span>Share Study via Secure Link</span>
              </h3>
              <div className="mt-5 space-y-4 flex-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Select Study to Share</label>
                  <select className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-gray-800 text-white focus:outline-none focus:border-sky-500">
                    {studies.map(s => <option key={s.id} value={s.id}>{s.patientName} — {s.modality} ({s.accessionNumber})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Link Expiry</label>
                  <div className="flex space-x-2">
                    {['1h', '24h', '72h', '7d'].map(exp => (
                      <button key={exp} onClick={() => setShareExpiry(exp)} className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${shareExpiry === exp ? 'bg-sky-600 text-white' : 'bg-slate-800 text-gray-400'}`}>{exp}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Share Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setShareLink(`https://pacs.mcgm.gov.in/s/${Date.now().toString(36)}`); showToast('Link Generated', 'Secure ABDM-compliant share link created', 'success'); }} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2">
                      <Link className="w-4 h-4" /><span>Generate Secure Link</span>
                    </button>
                    <button onClick={() => { setShowShareQR(!showShareQR); showToast('QR Ready', 'Patient can scan to download report', 'info'); }} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2">
                      <QrCode className="w-4 h-4" /><span>Show QR Code</span>
                    </button>
                  </div>
                </div>

                {shareLink && (
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <code className="text-[10px] text-sky-400 font-mono truncate flex-1 mr-3">{shareLink}</code>
                    <button onClick={() => { navigator.clipboard.writeText(shareLink); showToast('Copied', 'Link copied to clipboard', 'success'); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-300 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                )}

                {showShareQR && (
                  <div className="bg-white p-6 rounded-xl flex flex-col items-center space-y-2">
                    <div className="w-32 h-32 bg-black rounded-lg grid grid-cols-8 grid-rows-8 gap-px p-2">
                      {Array.from({length: 64}).map((_, i) => <div key={i} className={`${Math.random() > 0.4 ? 'bg-black' : 'bg-white'} rounded-sm`} />)}
                    </div>
                    <p className="text-[10px] text-gray-600 font-bold">Scan to access DICOM viewer</p>
                  </div>
                )}
              </div>
            </div>

            {/* Access & Consent Management */}
            <div className={`p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-sm font-black text-white uppercase border-b border-gray-800 pb-3 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-emerald-400" /><span>Access Control & ABDM Consent</span>
              </h3>
              <div className="mt-5 space-y-4 flex-1">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] text-emerald-400 font-black uppercase">ABDM / FHIR Compliant Sharing</span>
                  <p className="text-[11px] text-gray-400 leading-normal">All shared studies are encrypted with AES-256-GCM. Access is consent-gated through Ayushman Bharat Digital Mission protocols. Every access event is logged immutably.</p>
                </div>

                <h4 className="text-[10px] uppercase font-bold text-gray-400 pt-2">Recent Access Logs</h4>
                <div className="space-y-2">
                  {[
                    { who: 'Dr. Sunita Deshmukh (Neurology)', action: 'Viewed CT Head — Rohan Sharma', time: '10:22 AM', type: 'Doctor' },
                    { who: 'Patient: Priya K. Patel via ABHA App', action: 'Downloaded MRI Brain report PDF', time: '09:45 AM', type: 'Patient' },
                    { who: 'Dr. Kavita Joshi (Oncology)', action: 'Accessed CT Chest comparison', time: '08:30 AM', type: 'Doctor' },
                    { who: 'External: City Hospital Referral', action: 'Viewed shared link (expired)', time: 'Yesterday', type: 'External' },
                  ].map((log, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px]">
                      <div>
                        <span className="font-bold text-white">{log.who}</span>
                        <p className="text-gray-500 mt-0.5">{log.action}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 block">{log.time}</span>
                        <span className={`font-bold ${log.type === 'Patient' ? 'text-sky-400' : log.type === 'External' ? 'text-amber-400' : 'text-emerald-400'}`}>{log.type}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[10px] text-gray-400 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Digital watermark with radiologist signature and timestamp is embedded in all shared DICOM files and PDF reports.</span>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Toast Notification Box */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl flex items-start space-x-3 text-white">
          <div className="bg-sky-500/10 text-sky-400 p-2 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-black">{toastMessage.title}</h5>
            <p className="text-[10px] text-gray-400 mt-1">{toastMessage.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
