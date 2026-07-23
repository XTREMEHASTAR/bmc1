import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Barcode, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Cpu, 
  Search, 
  Trash2, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Play, 
  RefreshCw, 
  Layers, 
  Award, 
  FileText, 
  Smartphone, 
  Calendar,
  Sparkles,
  ArrowRight,
  Database,
  Printer,
  Bell,
  Package,
  TrendingUp,
  Droplet,
  User,
  Users,
  Settings,
  Clock,
  Lock,
  Plus,
  X,
  ChevronDown,
  FileCheck
} from 'lucide-react';

// ============================================================
// LIMS Client Domain Models
// ============================================================

interface Specimen {
  id: string;
  barcode: string;
  orderId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  type: string;
  container: string;
  status: 'Ordered' | 'Awaiting Collection' | 'Collected' | 'Received' | 'Accessioned' | 'Processing' | 'Tested' | 'Validation Pending' | 'Authorized' | 'Released' | 'Rejected' | 'On Hold';
  priority: 'ROUTINE' | 'URGENT' | 'STAT' | 'EMERGENCY';
  orderedBy: string;
  testNames: string[];
  timestamp: string;
  results: Record<string, { value: any; unit: string; low: number; high: number; flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW'; comment?: string }>;
  previousResults?: Record<string, any>;
  collectedBy?: string;
  collectedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  accessionedBy?: string;
  accessionedAt?: string;
  testedBy?: string;
  testedAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
}

interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  uhid: string;
  encounterId: string;
  orderedBy: string;
  department: string;
  tests: string[];
  priority: 'ROUTINE' | 'URGENT' | 'STAT' | 'EMERGENCY';
  collectionLocation: string;
  orderTime: string;
  status: 'PENDING_COLLECTION' | 'COLLECTED' | 'PROCESSING' | 'COMPLETED';
}

interface InventoryItem {
  id: string;
  name: string;
  lot: string;
  expiry: string;
  stock: number;
  minThreshold: number;
  unit: string;
  analyzer: string;
  supplier: string;
  status: 'OK' | 'LOW' | 'CRITICAL' | 'EXPIRED';
}

interface QCLog {
  id: string;
  analyzer: string;
  testName: string;
  lot: string;
  timestamp: string;
  value: number;
  mean: number;
  sd: number;
  status: 'PASSED' | 'WARNING' | 'FAILED';
}

interface LabAlert {
  id: string;
  uhid: string;
  patientName: string;
  testName: string;
  parameter: string;
  value: number;
  unit: string;
  criticalThreshold: string;
  department: string;
  orderedBy: string;
  timestamp: string;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'ESCALATED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

interface AuditLog {
  id: string;
  action: string;
  target: string;
  user: string;
  role: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

// 10 Role definitions
type LimsRole = 
  | 'LAB_RECEPTIONIST'
  | 'PHLEBOTOMIST'
  | 'LAB_TECHNICIAN'
  | 'SENIOR_TECHNICIAN'
  | 'PATHOLOGIST'
  | 'LAB_INCHARGE'
  | 'BLOOD_BANK_TECHNICIAN'
  | 'MICROBIOLOGIST'
  | 'LAB_ADMIN'
  | 'DEAN_VIEW';

const LIMS_ROLE_LABELS: Record<LimsRole, string> = {
  LAB_RECEPTIONIST: 'Lab Receptionist',
  PHLEBOTOMIST: 'Phlebotomist / Collector',
  LAB_TECHNICIAN: 'Lab Technician',
  SENIOR_TECHNICIAN: 'Senior Technician',
  PATHOLOGIST: 'Consultant Pathologist',
  LAB_INCHARGE: 'Laboratory In-Charge',
  BLOOD_BANK_TECHNICIAN: 'Blood Bank Technologist',
  MICROBIOLOGIST: 'Microbiologist',
  LAB_ADMIN: 'LIMS System Admin',
  DEAN_VIEW: 'Dean / Executive View'
};

export default function LaboratoryDashboard({ 
  isDarkMode, 
  setIsDarkMode, 
  onLogout 
}: { 
  isDarkMode: boolean; 
  setIsDarkMode: (val: boolean) => void; 
  onLogout: () => void;
}) {
  // Role & Navigation
  const [activeRole, setActiveRole] = useState<LimsRole>('LAB_INCHARGE');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // LIMS Collections state
  const [dashboardStats, setDashboardStats] = useState<any>({
    samplesToday: 0,
    pendingSamples: 0,
    samplesCollected: 0,
    testsInProcess: 0,
    testsCompleted: 0,
    criticalResults: 0,
    statOrders: 0,
    rejectedSamples: 0,
    averageTat: 28,
    analyzersOnline: 4,
    analyzersTotal: 5
  });
  
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [qcLogs, setQcLogs] = useState<QCLog[]>([]);
  const [alerts, setAlerts] = useState<LabAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // UI selectors & interactive forms
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'warning' | 'danger' } | null>(null);
  
  // Form input states
  const [resultEntryValues, setResultEntryValues] = useState<Record<string, string>>({});
  const [digitalPin, setDigitalPin] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [grossingDetails, setGrossingDetails] = useState({ blocks: 1, slides: 2, description: '' });
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string>('');
  const [reorderQty, setReorderQty] = useState('100');
  
  // Blood bank state
  const [bloodStock, setBloodStock] = useState<Record<string, number>>({
    'A+': 18, 'A-': 4, 'B+': 24, 'B-': 6, 'AB+': 12, 'AB-': 2, 'O+': 32, 'O-': 3
  });
  
  // Microbiology state
  const [cultureBottleLogs, setCultureBottleLogs] = useState([
    { id: 'MC-1', patient: 'Ramesh Gupta', bottle: 'Culture #102', status: 'Incubating', hours: 24, GramStain: 'Gram-negative Bacilli' }
  ]);

  // E2E Simulation Checklist state
  const [e2eStep, setE2eStep] = useState<number>(0);
  const [simulatedPatient, setSimulatedPatient] = useState({
    id: 'P-99',
    name: 'Rahul Anil Patil',
    uhid: 'MCGM125487',
    encounterId: 'ER-2026-801',
    age: 32,
    gender: 'Male'
  });

  // Fetch collections from Express API
  const fetchLimsData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, ordersRes, specsRes, invRes, qcRes, alertsRes, auditRes] = await Promise.all([
        fetch('/api/lab/dashboard').then(r => r.json()),
        fetch('/api/lab/orders').then(r => r.json()),
        fetch('/api/lab/specimens').then(r => r.json()),
        fetch('/api/lab/inventory').then(r => r.json()),
        fetch('/api/lab/qc').then(r => r.json()),
        fetch('/api/lab/alerts').then(r => r.json()),
        fetch('/api/lab/audit').then(r => r.json())
      ]);

      if (statsRes.success) setDashboardStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (specsRes.success) {
        setSpecimens(specsRes.data);
        // keep current selection synced
        if (selectedSpecimen) {
          const updated = specsRes.data.find((s: Specimen) => s.id === selectedSpecimen.id);
          if (updated) setSelectedSpecimen(updated);
        }
      }
      if (invRes.success) setInventory(invRes.data);
      if (qcRes.success) setQcLogs(qcRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Error fetching LIMS data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLimsData();
    // Refresh interval
    const interval = setInterval(fetchLimsData, 10000);
    return () => clearInterval(interval);
  }, [selectedSpecimen]);

  // Show Toast Helper
  const showToast = (title: string, desc: string, type: 'success' | 'warning' | 'danger') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch tabs voice support listeners
  useEffect(() => {
    const handleVoiceTab = (e: any) => {
      const tabTarget = e.detail;
      if (tabTarget) {
        setActiveTab(tabTarget);
        showToast('Voice Command Received', `Navigated to ${tabTarget}`, 'success');
      }
    };
    window.addEventListener('mcgm-lab-tab-change', handleVoiceTab);
    return () => window.removeEventListener('mcgm-lab-tab-change', handleVoiceTab);
  }, []);

  // Filter tabs by active role permissions
  const getTabsForRole = (role: LimsRole) => {
    const allTabs = [
      { id: 'dashboard', label: 'Lab Dashboard', icon: FlaskConical },
      { id: 'sample-management', label: 'Sample Management', icon: Barcode },
      { id: 'sample-collection', label: 'Sample Collection', icon: Smartphone },
      { id: 'test-orders', label: 'Test Orders', icon: Calendar },
      { id: 'results-entry', label: 'Results & Reporting', icon: FileText },
      { id: 'result-validation', label: 'Result Validation', icon: Award },
      { id: 'critical-alerts', label: 'Critical Alerts', icon: ShieldAlert },
      { id: 'analyzer-dashboard', label: 'Analyzer Dashboard', icon: Cpu },
      { id: 'qc', label: 'Quality Control', icon: Activity },
      { id: 'inventory', label: 'Inventory & Reagents', icon: Package },
      { id: 'blood-bank', label: 'Blood Bank (Lab)', icon: Droplet },
      { id: 'microbiology', label: 'Microbiology', icon: Sparkles },
      { id: 'hematology', label: 'Hematology', icon: Layers },
      { id: 'biochemistry', label: 'Biochemistry', icon: TrendingUp },
      { id: 'immunology', label: 'Immunology / Serology', icon: ShieldAlert },
      { id: 'histopathology', label: 'Histopathology', icon: FileText },
      { id: 'molecular', label: 'Molecular Lab', icon: Cpu },
      { id: 'alerts-notif', label: 'Alerts & Notifications', icon: Bell },
      { id: 'reports-analytics', label: 'Reports & Analytics', icon: FileCheck },
      { id: 'audit-logs', label: 'Audit Logs', icon: Database },
      { id: 'settings', label: 'Settings & Config', icon: Settings }
    ];

    if (role === 'LAB_INCHARGE' || role === 'LAB_ADMIN') return allTabs;
    if (role === 'PHLEBOTOMIST') {
      return allTabs.filter(t => ['sample-collection', 'sample-management', 'test-orders', 'alerts-notif'].includes(t.id));
    }
    if (role === 'PATHOLOGIST') {
      return allTabs.filter(t => ['dashboard', 'sample-management', 'test-orders', 'result-validation', 'critical-alerts', 'qc', 'reports-analytics', 'audit-logs', 'settings'].includes(t.id));
    }
    if (role === 'LAB_TECHNICIAN' || role === 'SENIOR_TECHNICIAN') {
      return allTabs.filter(t => ['sample-management', 'test-orders', 'results-entry', 'analyzer-dashboard', 'qc', 'inventory', 'hematology', 'biochemistry', 'immunology'].includes(t.id));
    }
    if (role === 'MICROBIOLOGIST') {
      return allTabs.filter(t => ['sample-management', 'results-entry', 'analyzer-dashboard', 'microbiology', 'qc'].includes(t.id));
    }
    if (role === 'BLOOD_BANK_TECHNICIAN') {
      return allTabs.filter(t => ['sample-management', 'results-entry', 'blood-bank', 'qc'].includes(t.id));
    }
    if (role === 'LAB_RECEPTIONIST') {
      return allTabs.filter(t => ['test-orders', 'sample-management', 'alerts-notif'].includes(t.id));
    }
    if (role === 'DEAN_VIEW') {
      return allTabs.filter(t => ['dashboard', 'qc', 'inventory', 'reports-analytics'].includes(t.id));
    }
    return allTabs;
  };

  // Perform Sample Collection
  const handleCollectSample = async (id: string) => {
    try {
      const res = await fetch('/api/lab/specimens/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specimenId: id, collectorName: 'Phleb. Sister Sneha' })
      }).then(r => r.json());

      if (res.success) {
        showToast('Sample Collected', `Specimen barcode generated successfully!`, 'success');
        fetchLimsData();
      } else {
        showToast('Error', res.error || 'Failed to collect specimen', 'danger');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform Specimen Accessioning Check
  const handleAccessionSpecimen = async (id: string, action: 'ACCEPT' | 'REJECT', reason?: string) => {
    try {
      const res = await fetch('/api/lab/specimens/accession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimenId: id,
          accessionerName: 'Tech. Rahul Deshmukh',
          action,
          rejectionReason: reason,
          rejectionNotes: reason ? `Rejected during quality inspection: ${reason}` : ''
        })
      }).then(r => r.json());

      if (res.success) {
        showToast(
          action === 'ACCEPT' ? 'Specimen Accessioned' : 'Specimen Rejected',
          action === 'ACCEPT' ? 'Container approved for routing.' : `Alert created. Reason: ${reason}`,
          action === 'ACCEPT' ? 'success' : 'warning'
        );
        fetchLimsData();
      } else {
        showToast('Error', res.error || 'Failed to accession specimen', 'danger');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Enter Result Values
  const handleEnterResults = async (id: string) => {
    try {
      const res = await fetch('/api/lab/specimens/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimenId: id,
          technicianName: 'Tech. Rahul Deshmukh',
          results: resultEntryValues
        })
      }).then(r => r.json());

      if (res.success) {
        showToast('Results Recorded', `Entered values sent for validation.`, 'success');
        setResultEntryValues({});
        fetchLimsData();
      } else {
        showToast('Error', res.error || 'Failed to enter results', 'danger');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clinical path validation with PIN check
  const handleValidateResult = async (id: string, action: 'RELEASED' | 'HOLD') => {
    if (action === 'RELEASED' && digitalPin !== '1234') {
      showToast('Validation Failed', 'Invalid Pathologist Digital Signature PIN.', 'danger');
      return;
    }

    setIsSigning(true);
    try {
      const res = await fetch('/api/lab/specimens/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimenId: id,
          pathologistName: 'Path. Dr. Meera Joshi',
          status: action,
          pin: digitalPin
        })
      }).then(r => r.json());

      if (res.success) {
        showToast('Report Authorized', 'Digitally signed report uploaded to patient EMR and app.', 'success');
        setDigitalPin('');
        fetchLimsData();
      } else {
        showToast('Error', res.error || 'Failed to validate report', 'danger');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  // Reagent Replenish Reorder
  const handleReorderInventory = async (itemId: string, qty: string) => {
    try {
      const res = await fetch('/api/lab/inventory/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: Number(qty) })
      }).then(r => r.json());

      if (res.success) {
        showToast('Replenished Reagent', `Reorder completed. Added ${qty} units to stock.`, 'success');
        fetchLimsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Acknowledge Critical Alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/lab/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, acknowledgedBy: 'Dr. S. Kulkarni' })
      }).then(r => r.json());

      if (res.success) {
        showToast('Alert Acknowledged', 'Notification confirmation synced with EMR.', 'success');
        fetchLimsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Westgard QC Calibration Run
  const handleRunQCCalibration = async (value: string, test: string, analyzer: string) => {
    try {
      const res = await fetch('/api/lab/qc/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: Number(value),
          testName: test,
          analyzer,
          mean: 15.0,
          sd: 0.5,
          technicianName: 'Tech. Rahul Deshmukh'
        })
      }).then(r => r.json());

      if (res.success) {
        showToast('QC Point Added', `Calibrator value ${value} recorded on control chart.`, 'success');
        fetchLimsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // E2E CHECKS SIMULATOR RUNNER
  // ============================================================
  const runNextE2eStep = async () => {
    const nextStep = e2eStep + 1;
    setE2eStep(nextStep);

    if (nextStep === 1) {
      // 1. Doctor orders STAT CBC, RFT, Troponin for Rahul Patil
      try {
        const res = await fetch('/api/lab/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: simulatedPatient.id,
            patientName: simulatedPatient.name,
            uhid: simulatedPatient.uhid,
            encounterId: simulatedPatient.encounterId,
            orderedBy: 'Dr. S. Kulkarni',
            department: 'Emergency',
            tests: ['CBC', 'RFT', 'Troponin'],
            priority: 'STAT',
            collectionLocation: 'Trauma Room'
          })
        }).then(r => r.json());
        if (res.success) {
          showToast('E2E SIMULATION: Order Placed', 'STAT orders routed to Lab Queue.', 'success');
          fetchLimsData();
        }
      } catch (err) {
        console.error(err);
      }
    } else if (nextStep === 2) {
      // 2. Phlebotomy collect sample CBC (Purple Top)
      const cbcSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('EDTA'));
      if (cbcSpec) {
        await handleCollectSample(cbcSpec.id);
        showToast('E2E SIMULATION: CBC collected', 'Purple top tube barcode printed.', 'success');
      }
    } else if (nextStep === 3) {
      // 3. Phlebotomy collect RFT/Troponin (SST Gold Top)
      const sstSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('SST'));
      if (sstSpec) {
        await handleCollectSample(sstSpec.id);
        showToast('E2E SIMULATION: RFT/Troponin collected', 'Gold top tube barcode printed.', 'success');
      }
    } else if (nextStep === 4) {
      // 4. Lab Reception / Accessioning (Accept specimens)
      const cbcSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('EDTA'));
      const sstSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('SST'));
      if (cbcSpec) await handleAccessionSpecimen(cbcSpec.id, 'ACCEPT');
      if (sstSpec) await handleAccessionSpecimen(sstSpec.id, 'ACCEPT');
      showToast('E2E SIMULATION: Accession Accepted', 'Specimens checked and accepted into lab work benches.', 'success');
    } else if (nextStep === 5) {
      // 5. Result Entry CBC (Hb: 6.2 critical low)
      const cbcSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('EDTA'));
      if (cbcSpec) {
        try {
          const res = await fetch('/api/lab/specimens/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              specimenId: cbcSpec.id,
              technicianName: 'Tech. Rahul Deshmukh',
              results: { 'Hemoglobin': 6.2, 'WBC Count': 7500, 'Platelet Count': 460000 }
            })
          }).then(r => r.json());
          if (res.success) {
            showToast('E2E SIMULATION: CBC results entry', 'Critical alert generated: Hb 6.2 g/dL.', 'warning');
            fetchLimsData();
          }
        } catch (err) {
          console.error(err);
        }
      }
    } else if (nextStep === 6) {
      // 6. Result Entry Troponin & RFT (Potassium: 2.8 critical low, Troponin: 0.45 critical high)
      const sstSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('SST'));
      if (sstSpec) {
        try {
          const res = await fetch('/api/lab/specimens/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              specimenId: sstSpec.id,
              technicianName: 'Tech. Rahul Deshmukh',
              results: { 'Troponin I': 0.45, 'Potassium': 2.8, 'Creatinine': 1.1 }
            })
          }).then(r => r.json());
          if (res.success) {
            showToast('E2E SIMULATION: RFT/Troponin entry', 'Cardiac Troponin panic alert fired.', 'danger');
            fetchLimsData();
          }
        } catch (err) {
          console.error(err);
        }
      }
    } else if (nextStep === 7) {
      // 7. Acknowledge emergency alerts
      const activeAlerts = alerts.filter(a => a.patientName.includes('Rahul') && a.status === 'UNACKNOWLEDGED');
      for (const alert of activeAlerts) {
        await handleAcknowledgeAlert(alert.id);
      }
      showToast('E2E SIMULATION: Doctor Acknowledged Alerts', 'Critical alarms cleared in doctor EMR.', 'success');
    } else if (nextStep === 8) {
      // 8. Pathologist validation (enter PIN 1234)
      const cbcSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('EDTA'));
      const sstSpec = specimens.find(s => s.patientName.includes('Rahul') && s.container.includes('SST'));
      
      // Simulate Pathologist validation using pin 1234
      if (cbcSpec) {
        await fetch('/api/lab/specimens/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ specimenId: cbcSpec.id, pathologistName: 'Path. Dr. Meera Joshi', status: 'RELEASED', pin: '1234' })
        });
      }
      if (sstSpec) {
        await fetch('/api/lab/specimens/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ specimenId: sstSpec.id, pathologistName: 'Path. Dr. Meera Joshi', status: 'RELEASED', pin: '1234' })
        });
      }
      showToast('E2E SIMULATION: Reports Authorized & Released', 'Digitally signed. Syncing with EMR.', 'success');
      fetchLimsData();
    }
  };

  const resetE2eSim = () => {
    setE2eStep(0);
    showToast('Simulation Reset', 'Checklist restarted.', 'warning');
  };

  // Filtered specimens by search query
  const filteredSpecimens = specimens.filter(s => 
    s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.testNames.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0b1329] text-white' : 'bg-slate-50 text-slate-900'} font-sans pb-12 transition-colors duration-300`}>
      
      {/* Top Banner LIMS Header */}
      <header className={`border-b ${isDarkMode ? 'border-slate-800 bg-[#0f172a]/95' : 'border-slate-200 bg-white'} sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0050cc] to-sky-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight font-display">MCGM LIMS OS</h1>
            <p className="text-xs text-slate-500 font-medium">Sion Laboratory Diagnostics Wing • Mumbai</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          
          {/* LIMS Role Dropdown Switcher */}
          <div className="relative flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={activeRole}
              onChange={(e) => {
                setActiveRole(e.target.value as LimsRole);
                const tabs = getTabsForRole(e.target.value as LimsRole);
                if (tabs.length > 0) setActiveTab(tabs[0].id);
                showToast('Role Overridden', `Workspace switched to ${LIMS_ROLE_LABELS[e.target.value as LimsRole]}`, 'success');
              }}
              className={`text-xs font-bold px-3 py-2 rounded-xl border ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-slate-200' 
                  : 'bg-white border-slate-200 text-slate-700'
              } focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer`}
            >
              {Object.entries(LIMS_ROLE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={fetchLimsData}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-900 text-amber-400' : 'border-slate-200 bg-white text-slate-600'} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            <Activity className="w-4 h-4" />
          </button>

          <button 
            onClick={onLogout}
            className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            Exit LIMS
          </button>
        </div>
      </header>

      {/* Floating Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-[9999] p-4 rounded-2xl border shadow-xl flex items-start space-x-3 w-[360px] ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : toast.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-xs">{toast.title}</h4>
              <p className="text-[10px] opacity-90 mt-0.5">{toast.desc}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-6 grid grid-cols-12 gap-6">
        
        {/* Left Navigation: 21 sub-navigation tabs filtered by active role */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 mb-2.5">
              Laboratory Benches ({getTabsForRole(activeRole).length})
            </div>
            
            <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {getTabsForRole(activeRole).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left font-bold text-[11px] px-3.5 py-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#0050cc]/10 border-l-4 border-l-[#0050cc] text-[#0050cc] dark:text-blue-400 font-extrabold shadow-sm' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0050cc] dark:text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* E2E SIMULATION CONTROLLER CARD */}
          <div className="p-4 rounded-3xl border border-blue-500/30 bg-[#0050cc]/5 space-y-3 shadow-md">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-[#0050cc] dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span>E2E Workflow Simulator</span>
              </h4>
              {e2eStep > 0 && (
                <button onClick={resetE2eSim} className="text-[8px] font-bold text-slate-400 underline cursor-pointer">
                  Reset
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Progress patient <strong>Rahul Patil's</strong> STAT CBC/RFT/Troponin panel step-by-step to verify the entire system.
            </p>

            <div className="space-y-1.5 pt-1.5 border-t border-dashed border-slate-700/50">
              {[
                { step: 1, label: 'Order STAT Panel' },
                { step: 2, label: 'Collect CBC Tube' },
                { step: 3, label: 'Collect SST Tube' },
                { step: 4, label: 'Accession Specimens' },
                { step: 5, label: 'Enter CBC Results (Hb 6.2)' },
                { step: 6, label: 'Enter RFT/Trop (Criticals)' },
                { step: 7, label: 'Acknowledge Panic Alerts' },
                { step: 8, label: 'Pathologist Signature Seal' }
              ].map((item) => (
                <div key={item.step} className="flex items-center space-x-2 text-[10px]">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    e2eStep >= item.step 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {e2eStep >= item.step ? '✓' : item.step}
                  </div>
                  <span className={e2eStep >= item.step ? 'text-slate-400 line-through' : 'font-medium text-slate-200'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {e2eStep < 8 ? (
              <button
                onClick={runNextE2eStep}
                className="w-full bg-[#0050cc] hover:bg-blue-700 text-white font-bold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>Trigger Next Step</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <div className="bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl text-center text-[10px] font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulation Complete!</span>
              </div>
            )}
          </div>
        </aside>

        {/* Center Panel content: renders active navigation sub-panel */}
        <main className="col-span-12 lg:col-span-9 space-y-6">

          {/* TAB 1: LAB DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top KPIs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Samples Today', val: dashboardStats.samplesToday, change: '18% vs Yesterday', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Pending Samples', val: dashboardStats.pendingSamples, change: `${dashboardStats.statOrders} STAT Pending`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Tests Completed', val: dashboardStats.testsCompleted, change: '22% vs Yesterday', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Critical Alerts', val: dashboardStats.criticalResults, change: 'Requires Immediate Action', color: 'text-rose-500', bg: 'bg-rose-500/10 animate-pulse' }
                ].map((kpi, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{kpi.label}</span>
                      <div className={`w-6 h-6 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                        <Activity className={`w-3.5 h-3.5 ${kpi.color}`} />
                      </div>
                    </div>
                    <p className={`text-2xl font-black font-mono mt-2.5 ${kpi.color}`}>{kpi.val}</p>
                    <span className="text-[9px] text-slate-400 font-bold mt-1 block">{kpi.change}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sample Collection Status distribution */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col justify-between`}>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider mb-4">Sample Collection Status</h3>
                  
                  {/* Custom styled SVG donut distribution chart */}
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="3" />
                      {/* Received 70%, Processing 15%, On Hold 10%, Rejected 5% */}
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="70 100" strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-70" />
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="10 100" strokeDashoffset="-85" />
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="5 100" strokeDashoffset="-95" />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-xl font-black font-mono">{dashboardStats.samplesToday}</p>
                      <p className="text-[8px] text-slate-500 uppercase font-bold">Total Samples</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] border-t border-slate-800/20 dark:border-slate-800/60 pt-4">
                    <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500" /> <span className="font-bold text-slate-400">Received (70%)</span></div>
                    <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-500" /> <span className="font-bold text-slate-400">In Process (15%)</span></div>
                    <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded bg-purple-500" /> <span className="font-bold text-slate-400">On Hold (10%)</span></div>
                    <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded bg-red-500" /> <span className="font-bold text-slate-400">Rejected (5%)</span></div>
                  </div>
                </div>

                {/* Department Wise sample load counts */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm col-span-2 space-y-4`}>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">Department Wise Sample Volumes</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/10 dark:border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <th className="pb-3">Department</th>
                          <th className="pb-3 text-center">Samples</th>
                          <th className="pb-3 text-center">Completed</th>
                          <th className="pb-3 text-center">Pending</th>
                          <th className="pb-3 text-center">STAT</th>
                          <th className="pb-3 text-center">TAT %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/50 text-[11px]">
                        {[
                          { dept: 'OPD Clinical Desk', count: 128, comp: 102, pend: 26, stat: 4, tat: '94%' },
                          { dept: 'Emergency OS', count: 64, comp: 48, pend: 16, stat: 12, tat: '91%' },
                          { dept: 'IPD Wards', count: 42, comp: 36, pend: 6, stat: 2, tat: '88%' },
                          { dept: 'ICU OS Desk', count: 14, comp: 10, pend: 4, stat: 3, tat: '92%' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/20">
                            <td className="py-3 font-bold">{row.dept}</td>
                            <td className="py-3 text-center font-mono">{row.count}</td>
                            <td className="py-3 text-center font-mono text-emerald-500">{row.comp}</td>
                            <td className="py-3 text-center font-mono text-amber-500">{row.pend}</td>
                            <td className="py-3 text-center font-mono text-rose-500 font-extrabold">{row.stat}</td>
                            <td className="py-3 text-center font-mono text-blue-400 font-bold">{row.tat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* CRITICAL ALERTS inbox list on dashboard */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>Real-Time Clinical Critical Alerts</span>
                  </h3>
                  <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full text-[9px] font-black">
                    {alerts.filter(a => a.status === 'UNACKNOWLEDGED').length} Active Panic Results
                  </span>
                </div>

                <div className="space-y-3">
                  {alerts.map((alt) => (
                    <div 
                      key={alt.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        alt.status === 'UNACKNOWLEDGED' 
                          ? 'bg-rose-500/5 border-rose-500/20' 
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${alt.status === 'UNACKNOWLEDGED' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            PANIC VALUE
                          </span>
                          <span className="font-mono text-xs font-bold">{alt.uhid}</span>
                          <span className="text-[10px] text-slate-500">• {alt.department} Ward</span>
                        </div>
                        <h4 className="font-black text-sm mt-1.5">
                          {alt.parameter}: <span className="text-rose-500 font-mono">{alt.value} {alt.unit}</span>
                          <span className="text-xs font-medium text-slate-400 ml-2">(Threshold: {alt.criticalThreshold})</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">Patient: <strong>{alt.patientName}</strong> • Ordered by: {alt.orderedBy}</p>
                      </div>

                      {alt.status === 'UNACKNOWLEDGED' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcknowledgeAlert(alt.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                          >
                            Acknowledge Alert
                          </button>
                          <a
                            href={`tel:${alt.orderedBy.includes('Sunita') ? '9820001122' : '9822334455'}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Call Clinician</span>
                          </a>
                        </div>
                      ) : (
                        <div className="text-right text-[10px]">
                          <p className="text-emerald-500 font-bold">Acknowledged</p>
                          <p className="text-slate-500 mt-0.5">By {alt.acknowledgedBy} at {new Date(alt.acknowledgedAt || '').toLocaleTimeString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAMPLE MANAGEMENT */}
          {activeTab === 'sample-management' && (
            <div className="space-y-6">
              
              {/* Search & List of all specimens */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">Specimen Audit Ledger</h3>
                  
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search patient, barcode, test panel..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border ${
                        isDarkMode 
                          ? 'bg-[#0b1329] border-slate-800 text-white focus:border-blue-500' 
                          : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-500'
                      } focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/10 dark:border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="pb-3">Barcode</th>
                        <th className="pb-3">Patient</th>
                        <th className="pb-3 text-center">Test Name</th>
                        <th className="pb-3 text-center">Specimen</th>
                        <th className="pb-3 text-center">Priority</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/50 text-[11px]">
                      {filteredSpecimens.map((spec) => (
                        <tr key={spec.id} className="hover:bg-slate-800/20">
                          <td className="py-3 font-mono font-bold text-blue-400 flex items-center space-x-1">
                            <Barcode className="w-3.5 h-3.5" />
                            <span>{spec.barcode}</span>
                          </td>
                          <td className="py-3">
                            <p className="font-bold">{spec.patientName}</p>
                            <p className="text-[9px] text-slate-500">{spec.age}y / {spec.gender}</p>
                          </td>
                          <td className="py-3 text-center font-bold">{spec.testNames.join(', ')}</td>
                          <td className="py-3 text-center text-slate-400">{spec.type} ({spec.container})</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                              spec.priority === 'STAT' || spec.priority === 'EMERGENCY'
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {spec.priority}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              spec.status === 'Released'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : spec.status === 'Tested'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : spec.status === 'Rejected'
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : 'bg-slate-800 text-slate-400'
                            }`}>
                              {spec.status}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => setSelectedSpecimen(spec)}
                              className="text-blue-400 hover:text-blue-500 font-bold underline cursor-pointer"
                            >
                              Track
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lifecycle logs timeline if specimen selected */}
              {selectedSpecimen && (
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Specimen Lifecycle Timeline: Barcode {selectedSpecimen.barcode}</span>
                  </h3>
                  
                  <div className="relative pl-6 border-l-2 border-slate-700/60 space-y-4 ml-3 pt-2">
                    {[
                      { title: 'Test Ordered', time: selectedSpecimen.timestamp, user: selectedSpecimen.orderedBy },
                      { title: 'Specimen Collected', time: selectedSpecimen.collectedAt, user: selectedSpecimen.collectedBy },
                      { title: 'Received & Accessioned', time: selectedSpecimen.accessionedAt, user: selectedSpecimen.accessionedBy },
                      { title: 'Analyzed & Tested', time: selectedSpecimen.testedAt, user: selectedSpecimen.testedBy },
                      { title: 'Validated & Released', time: selectedSpecimen.authorizedAt, user: selectedSpecimen.authorizedBy }
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                          step.time 
                            ? 'bg-emerald-600 border-emerald-500' 
                            : 'bg-[#0b1329] border-slate-800'
                        }`} />
                        <h4 className={`font-bold text-xs ${step.time ? 'text-slate-200' : 'text-slate-500'}`}>{step.title}</h4>
                        {step.time ? (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Logged at {new Date(step.time).toLocaleTimeString()} • Executed by: {step.user}
                          </p>
                        ) : (
                          <p className="text-[9px] text-slate-600 mt-0.5">Pending execution</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAMPLE COLLECTION */}
          {activeTab === 'sample-collection' && (
            <div className="space-y-6">
              
              {/* Phlebotomist task queue */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Awaiting Sample Collection</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specimens.filter(s => s.status === 'Awaiting Collection').map((spec) => (
                    <div key={spec.id} className="p-4 rounded-2xl border border-slate-800 bg-[#0f172a]/40 space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs">{spec.patientName}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                            spec.priority === 'STAT' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {spec.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Age: {spec.age}y • Gender: {spec.gender} • Test: <strong>{spec.testNames.join(', ')}</strong></p>
                      </div>

                      <div className="bg-[#0b1329] p-2.5 rounded-xl border border-slate-800/80 text-[10px] space-y-1.5">
                        <p className="flex justify-between text-slate-400">
                          <span>Tube type:</span>
                          <span className="font-bold text-blue-400">{spec.container}</span>
                        </p>
                        <p className="flex justify-between text-slate-400">
                          <span>Specimen:</span>
                          <span className="font-bold text-slate-300">{spec.type}</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCollectSample(spec.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                        >
                          Collect Sample
                        </button>
                        <button
                          onClick={() => handleAccessionSpecimen(spec.id, 'REJECT', 'Insufficient Quantity')}
                          className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Unable to Collect
                        </button>
                      </div>
                    </div>
                  ))}
                  {specimens.filter(s => s.status === 'Awaiting Collection').length === 0 && (
                    <div className="col-span-2 py-8 text-center text-slate-500 text-xs">
                      No pending collections in phlebotomy queue.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEST ORDERS */}
          {activeTab === 'test-orders' && (
            <div className="space-y-6">
              
              {/* Doctor orders queue */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">Clinical Orders Queue</h3>
                  <button 
                    onClick={() => {
                      // Trigger mock doctor order
                      fetch('/api/lab/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          patientId: 'P-802',
                          patientName: 'Sunita Ravindra Deshmukh',
                          uhid: 'MCGM125488',
                          encounterId: 'ER-2026-802',
                          orderedBy: 'Dr. Ramesh Nair',
                          department: 'Cardiology',
                          tests: ['LFT'],
                          priority: 'URGENT'
                        })
                      }).then(r => r.json()).then(res => {
                        if (res.success) {
                          showToast('Lab Order Created', 'LFT panel order placed successfully.', 'success');
                          fetchLimsData();
                        }
                      });
                    }}
                    className="bg-[#0050cc] hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Issue Mock Order</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/10 dark:border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th>Order ID</th>
                        <th>Patient</th>
                        <th className="text-center">Tests Panel</th>
                        <th className="text-center">Priority</th>
                        <th className="text-center">Order Time</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/50 text-[11px]">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/20">
                          <td className="py-3 font-bold font-mono text-slate-300">{ord.id}</td>
                          <td className="py-3">
                            <p className="font-bold">{ord.patientName}</p>
                            <p className="text-[9px] text-slate-500">UHID: {ord.uhid}</p>
                          </td>
                          <td className="py-3 text-center font-bold text-blue-400">{ord.tests.join(', ')}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                              ord.priority === 'STAT' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {ord.priority}
                            </span>
                          </td>
                          <td className="py-3 text-center text-slate-400">
                            {new Date(ord.orderTime).toLocaleTimeString()}
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-[10px] font-bold text-slate-400">{ord.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESULTS & REPORTING */}
          {activeTab === 'results-entry' && (
            <div className="space-y-6">
              
              {/* Accession queue for results entry */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Accession Registry (Result Entry)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specimens.filter(s => ['Received', 'Accessioned', 'Processing', 'Tested'].includes(s.status)).map((spec) => (
                    <div 
                      key={spec.id} 
                      onClick={() => {
                        setSelectedSpecimen(spec);
                        setResultEntryValues({});
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedSpecimen?.id === spec.id 
                          ? 'border-blue-500 bg-[#0050cc]/10' 
                          : 'border-slate-800 bg-[#0f172a]/40 hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs">{spec.patientName}</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${spec.priority === 'STAT' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                          {spec.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Barcode: <strong>{spec.barcode}</strong> • Test: {spec.testNames.join(', ')}</p>
                      
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-slate-800/40">
                        <span className="text-[9px] text-slate-400 font-bold">{spec.type} ({spec.container})</span>
                        <span className="text-[10px] font-bold text-amber-500">{spec.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result input form */}
              {selectedSpecimen && ['Received', 'Accessioned', 'Processing', 'Tested'].includes(selectedSpecimen.status) && (
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">
                    Result Entry: {selectedSpecimen.patientName} ({selectedSpecimen.testNames.join(', ')})
                  </h3>

                  <div className="space-y-4">
                    {selectedSpecimen.testNames.includes('CBC') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: 'Hemoglobin', label: 'Hemoglobin (g/dL)', low: 13.0, high: 17.0 },
                          { key: 'RBC Count', label: 'RBC Count (million/µL)', low: 4.5, high: 5.9 },
                          { key: 'Platelet Count', label: 'Platelet Count (cells/mm³)', low: 150000, high: 450000 }
                        ].map((field) => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold">{field.label}</label>
                            <input 
                              type="number"
                              step="any"
                              placeholder={`Ref: ${field.low} - ${field.high}`}
                              value={resultEntryValues[field.key] || ''}
                              onChange={(e) => setResultEntryValues({ ...resultEntryValues, [field.key]: e.target.value })}
                              className={`w-full px-3 py-2 rounded-xl text-xs border ${
                                isDarkMode 
                                  ? 'bg-[#0b1329] border-slate-800 text-white focus:border-blue-500' 
                                  : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                              } focus:outline-none`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedSpecimen.testNames.includes('RFT') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'Creatinine', label: 'Creatinine (mg/dL)', low: 0.7, high: 1.3 },
                          { key: 'Potassium', label: 'Potassium (mEq/L)', low: 3.5, high: 5.1 }
                        ].map((field) => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold">{field.label}</label>
                            <input 
                              type="number"
                              step="any"
                              placeholder={`Ref: ${field.low} - ${field.high}`}
                              value={resultEntryValues[field.key] || ''}
                              onChange={(e) => setResultEntryValues({ ...resultEntryValues, [field.key]: e.target.value })}
                              className={`w-full px-3 py-2 rounded-xl text-xs border ${
                                isDarkMode 
                                  ? 'bg-[#0b1329] border-slate-800 text-white focus:border-blue-500' 
                                  : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                              } focus:outline-none`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedSpecimen.testNames.includes('Troponin') && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold">Troponin I (ng/mL)</label>
                          <input 
                            type="number"
                            step="any"
                            placeholder="Ref: 0.0 - 0.04"
                            value={resultEntryValues['Troponin I'] || ''}
                            onChange={(e) => setResultEntryValues({ ...resultEntryValues, 'Troponin I': e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl text-xs border ${
                              isDarkMode 
                                ? 'bg-[#0b1329] border-slate-800 text-white focus:border-blue-500' 
                                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                            } focus:outline-none`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Generic Entry Fallback */}
                    {!['CBC', 'RFT', 'Troponin'].some(t => selectedSpecimen.testNames.includes(t)) && (
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold">Analyte Result Value</label>
                        <input 
                          type="text"
                          placeholder="Enter finding value..."
                          value={resultEntryValues['Result'] || ''}
                          onChange={(e) => setResultEntryValues({ ...resultEntryValues, 'Result': e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl text-xs border ${
                            isDarkMode 
                              ? 'bg-[#0b1329] border-slate-800 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                          } focus:outline-none`}
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleEnterResults(selectedSpecimen.id)}
                      className="w-full bg-[#0050cc] hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Transmit Result Findings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RESULT VALIDATION */}
          {activeTab === 'result-validation' && (
            <div className="space-y-6">
              
              {/* Pathologist authorization bench */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Awaiting Pathologist Authorization</h3>

                <div className="divide-y divide-slate-800/10 dark:divide-slate-800/50">
                  {specimens.filter(s => s.status === 'Tested').map((spec) => (
                    <div 
                      key={spec.id}
                      onClick={() => setSelectedSpecimen(spec)}
                      className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all ${
                        selectedSpecimen?.id === spec.id 
                          ? 'bg-[#0050cc]/10 border border-blue-500' 
                          : 'hover:bg-slate-800/25 border border-transparent'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${spec.priority === 'STAT' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {spec.priority}
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-400">{spec.barcode}</span>
                        </div>
                        <h4 className="font-black text-sm mt-1">{spec.patientName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{spec.age}y / {spec.gender} • Ordered by: {spec.orderedBy}</p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Findings</p>
                          <p className="text-xs font-mono font-bold text-slate-300">
                            {Object.entries(spec.results).map(([k, v]) => `${k}: ${v.value}`).join(', ')}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                    </div>
                  ))}
                  {specimens.filter(s => s.status === 'Tested').length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No reports awaiting clinical pathologist authorization.
                    </div>
                  )}
                </div>
              </div>

              {/* Digital signature PIN seal box */}
              {selectedSpecimen && selectedSpecimen.status === 'Tested' && (
                <div className={`p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm space-y-4`}>
                  <div className="flex items-start space-x-3">
                    <Award className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-400">Pathologist Digital Signature Seal</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Authorizing this release will digitally lock findings, generate an official PDF, sync to the patient EMR app, and notify {selectedSpecimen.orderedBy}.
                      </p>
                    </div>
                  </div>

                  {/* Reference ranges and value review */}
                  <div className="bg-[#0b1329] p-4 rounded-2xl border border-slate-800/80 space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review Findings Parameters</h5>
                    {Object.entries(selectedSpecimen.results).map(([paramName, res]) => {
                      const isAbnormal = res.flag !== 'NORMAL';
                      return (
                        <div key={paramName} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800/40 last:border-0">
                          <span className="font-medium">{paramName}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-400">Ref: {res.low} - {res.high} {res.unit}</span>
                            <span className={`font-mono font-bold ${isAbnormal ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                              {res.value} {res.unit} {isAbnormal ? `[${res.flag}]` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <input 
                      type="password" 
                      placeholder="Enter Pathologist Authorization PIN (1234)"
                      value={digitalPin}
                      onChange={(e) => setDigitalPin(e.target.value)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs border ${
                        isDarkMode 
                          ? 'bg-[#0b1329] border-slate-800 text-white focus:border-emerald-500' 
                          : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                      } focus:outline-none`}
                    />
                    <button 
                      onClick={() => handleValidateResult(selectedSpecimen.id, 'RELEASED')}
                      disabled={isSigning}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSigning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Signing SHA256...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Release Authorized Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: ANALYZER DASHBOARD */}
          {activeTab === 'analyzer-dashboard' && (
            <div className="space-y-6">
              
              {/* Instrument Heartbeats */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Laboratory Instruments & Interfaces</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Sysmex XN-1000', type: 'Hematology', status: 'ONLINE', load: 2, qc: 'PASSED' },
                    { name: 'Roche Cobas c501', type: 'Biochemistry', status: 'ONLINE', load: 4, qc: 'PASSED' },
                    { name: 'Abbott Alinity i', type: 'Immunology', status: 'BUSY', load: 1, qc: 'PASSED' },
                    { name: 'Bactec FX blood culture', type: 'Microbiology', status: 'ONLINE', load: 0, qc: 'PASSED' },
                    { name: 'AU5800 chemistry', type: 'Biochemistry', status: 'MAINTENANCE', load: 0, qc: 'WARNING' }
                  ].map((analyzer, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-800 bg-[#0f172a]/40 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs text-slate-200">{analyzer.name}</h4>
                          <p className="text-[9px] text-slate-500 mt-0.5">{analyzer.type} Bench</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          analyzer.status === 'ONLINE' || analyzer.status === 'BUSY'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {analyzer.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-850">
                        <span className="text-slate-500">QC Control:</span>
                        <span className={`font-bold ${analyzer.qc === 'PASSED' ? 'text-emerald-500' : 'text-amber-500'}`}>{analyzer.qc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: QUALITY CONTROL */}
          {activeTab === 'qc' && (
            <div className="space-y-6">
              
              {/* Levey-Jennings QC Graph point series */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-black text-xs uppercase tracking-wider">Hematology Control Chart (Levey-Jennings)</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sysmex XN-1000 • Lot #CBC-992A • Parameter: Hemoglobin (Target Mean: 15.0)</p>
                  </div>
                  <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Westgard 1_2s Rule Violation</span>
                  </span>
                </div>

                {/* SVG Graph rendering */}
                <div className="h-40 relative border-l border-b border-slate-800 flex items-end">
                  <div className="absolute left-0 right-0 top-[15%] border-t border-rose-500/30 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-rose-500 font-bold">+3 SD (16.5)</span></div>
                  <div className="absolute left-0 right-0 top-[30%] border-t border-amber-500/30 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-amber-500 font-bold">+2 SD (16.0)</span></div>
                  <div className="absolute left-0 right-0 top-[50%] border-t border-slate-700/40"><span className="absolute -top-2 left-1 text-[8px] text-slate-500 font-bold">Mean (15.0)</span></div>
                  <div className="absolute left-0 right-0 top-[70%] border-t border-amber-500/30 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-amber-500 font-bold">-2 SD (14.0)</span></div>
                  <div className="absolute left-0 right-0 top-[85%] border-t border-rose-500/30 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-rose-500 font-bold">-3 SD (13.5)</span></div>
                  
                  {/* SVG line */}
                  {qcLogs.length > 0 && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        points={qcLogs.map((log, idx) => {
                          const x = (idx / (qcLogs.length - 1)) * 100;
                          const y = 100 - ((log.value - 13.0) / 4.0) * 100;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      {qcLogs.map((log, idx) => {
                        const x = (idx / (qcLogs.length - 1)) * 100;
                        const y = 100 - ((log.value - 13.0) / 4.0) * 100;
                        const isBreach = Math.abs(log.value - log.mean) >= 2 * log.sd;
                        return (
                          <circle 
                            key={idx}
                            cx={x} 
                            cy={y} 
                            r="3" 
                            fill={isBreach ? '#ef4444' : '#3b82f6'} 
                            className={isBreach ? 'animate-ping' : ''}
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a]/45 flex justify-between items-center">
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-slate-400">Trigger Calibration Run</h5>
                    <p className="text-[9px] text-slate-500">Run a simulated QC material sample value to add to control chart.</p>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      step="any"
                      placeholder="e.g. 15.2"
                      id="qcVal"
                      className="w-20 px-2 py-1 rounded text-xs bg-slate-900 border border-slate-800"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('qcVal') as HTMLInputElement;
                        if (el && el.value) {
                          handleRunQCCalibration(el.value, 'Hemoglobin Control', 'Sysmex XN-1000');
                          el.value = '';
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg"
                    >
                      Run QC
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: INVENTORY & REAGENTS */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              
              {/* Inventory items board */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Consumables & Reagents Reserve</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/10 dark:border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th>Item</th>
                        <th>Lot No.</th>
                        <th>Expiry Date</th>
                        <th className="text-center">Current Stock</th>
                        <th className="text-center">Threshold</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/50 text-[11px]">
                      {inventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/20">
                          <td className="py-3 font-bold">{item.name}</td>
                          <td className="py-3 font-mono text-slate-400">{item.lot}</td>
                          <td className="py-3 text-slate-400">{item.expiry}</td>
                          <td className="py-3 text-center font-mono font-bold text-slate-350">{item.stock} {item.unit}</td>
                          <td className="py-3 text-center font-mono text-slate-500">{item.minThreshold} {item.unit}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                              item.status === 'OK' 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-rose-500/10 text-rose-500 animate-pulse'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a]/45 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-slate-400">Replenish Low Stock</h5>
                    <p className="text-[9px] text-slate-500">Order inventory replenishment lots.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedInventoryItem}
                      onChange={(e) => setSelectedInventoryItem(e.target.value)}
                      className="px-2 py-1.5 rounded text-xs bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value="">Select Item...</option>
                      {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <input 
                      type="number"
                      placeholder="Qty"
                      value={reorderQty}
                      onChange={(e) => setReorderQty(e.target.value)}
                      className="w-16 px-2 py-1 rounded text-xs bg-slate-900 border border-slate-800 text-white"
                    />
                    <button
                      onClick={() => {
                        if (selectedInventoryItem) {
                          handleReorderInventory(selectedInventoryItem, reorderQty);
                          setSelectedInventoryItem('');
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                    >
                      Replenish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: BLOOD BANK LAB */}
          {activeTab === 'blood-bank' && (
            <div className="space-y-6">
              
              {/* ABO stock reserves & crossmatch compatibility */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Blood Group Stock Reserves</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {Object.entries(bloodStock).map(([group, qty]) => (
                    <div key={group} className="p-4 rounded-xl border border-slate-800 bg-[#0f172a]/40 text-center">
                      <p className="text-xl font-black text-rose-500 font-mono">{group}</p>
                      <p className="text-xs font-bold font-mono text-slate-350 mt-1">{qty} units</p>
                      <span className={`text-[8px] font-bold ${qty < 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                        {qty < 5 ? 'CRITICAL SHORTAGE' : 'STABLE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: MICROBIOLOGY */}
          {activeTab === 'microbiology' && (
            <div className="space-y-6">
              
              {/* Incubations & antibiotic sensitivity logs */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Culture Incubator & Sensitivity Analysis</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/10 dark:border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th>Culture Bottle</th>
                        <th>Patient</th>
                        <th className="text-center">Gram Stain</th>
                        <th className="text-center">Incubation Hours</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/50 text-[11px]">
                      {cultureBottleLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/20">
                          <td className="py-3 font-bold font-mono text-blue-400">{log.bottle}</td>
                          <td className="py-3 font-bold">{log.patient}</td>
                          <td className="py-3 text-center text-slate-400">{log.GramStain}</td>
                          <td className="py-3 text-center font-mono">{log.hours}h</td>
                          <td className="py-3 text-center text-amber-500 font-bold">{log.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a]/45 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Antibiotic Susceptibility Grid (AST)</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { drug: 'Amoxicillin', status: 'RESISTANT', color: 'text-rose-500' },
                      { drug: 'Ceftriaxone', status: 'SENSITIVE', color: 'text-emerald-500' },
                      { drug: 'Meropenem', status: 'SENSITIVE', color: 'text-emerald-500' }
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold">{row.drug}</span>
                        <span className={`font-mono font-extrabold ${row.color}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: HEMATOLOGY */}
          {activeTab === 'hematology' && (
            <div className="space-y-6">
              
              {/* CBC counters, smears Review */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Hematology Diagnostics & Smear Review</h3>
                <p className="text-xs text-slate-500">Reviews cell counter outputs, flags, and manual smear validation.</p>

                <div className="bg-[#0b1329] p-4 rounded-2xl border border-slate-800/80 text-xs space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                    <span className="font-bold">Manual Smear Review Requirement:</span>
                    <span className="text-amber-500 font-bold">Triggered (Platelet clump warning)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                    <span className="font-bold">Sysmex XN Counter Status:</span>
                    <span className="text-emerald-500 font-bold">Connected & Idle</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 16: HISTOPATHOLOGY */}
          {activeTab === 'histopathology' && (
            <div className="space-y-6">
              
              {/* Grossing, cassette embedding blocks */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Histology Specimen Process timeline</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a]/40 space-y-3">
                    <h4 className="font-bold text-xs text-slate-300">Sectioning & grossing parameters</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400">Cassette block count</label>
                        <input 
                          type="number" 
                          value={grossingDetails.blocks}
                          onChange={(e) => setGrossingDetails({ ...grossingDetails, blocks: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Slides prepared</label>
                        <input 
                          type="number" 
                          value={grossingDetails.slides}
                          onChange={(e) => setGrossingDetails({ ...grossingDetails, slides: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a]/40 space-y-2">
                    <h4 className="font-bold text-xs text-slate-350">Pathology Diagnosis Narrative</h4>
                    <textarea 
                      placeholder="Enter detailed microscopic and macroscopic description..."
                      value={grossingDetails.description}
                      onChange={(e) => setGrossingDetails({ ...grossingDetails, description: e.target.value })}
                      className="w-full h-24 p-2 rounded text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 19: REPORTS & ANALYTICS */}
          {activeTab === 'reports-analytics' && (
            <div className="space-y-6">
              
              {/* PDF compilation list */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Diagnostic PDF Report Registry</h3>

                <div className="divide-y divide-slate-800/10 dark:divide-slate-800/50">
                  {specimens.filter(s => s.status === 'Released').map((spec) => (
                    <div key={spec.id} className="p-4 flex justify-between items-center hover:bg-slate-800/20 rounded-xl">
                      <div>
                        <h4 className="font-bold text-xs">{spec.patientName} ({spec.testNames.join(', ')})</h4>
                        <p className="text-[9px] text-slate-500 mt-0.5">Authorized by {spec.authorizedBy} on {new Date(spec.authorizedAt || '').toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => {
                          showToast('PDF compilation triggered', `Compiling MCGM diagnostic report for ${spec.patientName}...`, 'success');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print PDF</span>
                      </button>
                    </div>
                  ))}
                  {specimens.filter(s => s.status === 'Released').length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No released laboratory reports ready for print compilation.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 20: AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="space-y-6">
              
              {/* Security Audit Trail ledger */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
                <h3 className="font-display font-black text-xs uppercase tracking-wider">Compliance Security Audit Log</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/10 dark:border-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th>Timestamp</th>
                        <th>User</th>
                        <th className="text-center">Role</th>
                        <th className="text-center">Action log</th>
                        <th className="text-center">Target spec</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10 dark:divide-slate-800/50 text-[11px] font-mono">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/20">
                          <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="py-3 font-bold text-slate-350">{log.user}</td>
                          <td className="py-3 text-center text-blue-400">{log.role}</td>
                          <td className="py-3 text-center text-emerald-500 font-bold">{log.action}</td>
                          <td className="py-3 text-center text-slate-400">{log.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Fallback View for tabs that are configured with standard metadata */}
          {!['dashboard', 'sample-management', 'sample-collection', 'test-orders', 'results-entry', 'result-validation', 'analyzer-dashboard', 'qc', 'inventory', 'blood-bank', 'microbiology', 'hematology', 'histopathology', 'reports-analytics', 'audit-logs'].includes(activeTab) && (
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} text-center text-slate-500 space-y-2 shadow-sm`}>
              <FlaskConical className="w-10 h-10 text-slate-700 mx-auto animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Specialty Workspace Online</h4>
              <p className="text-[10px] text-slate-500 leading-normal max-w-sm mx-auto">
                This diagnostic workbench is configured to receive automatic telemetry parameters directly from laboratory analyzers in real-time.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
