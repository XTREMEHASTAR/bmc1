import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Database,
  FileText,
  User,
  Users,
  Bell,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  Eye,
  EyeOff,
  Cpu,
  Terminal,
  Activity,
  Zap,
  Check,
  Server,
  FileSpreadsheet,
  Globe,
  Radio,
  Sliders,
  Send,
  AlertOctagon,
  LifeBuoy,
  Sun,
  Moon
} from 'lucide-react';

// Seed mock data for SOC alerts
const INITIAL_ALERTS = [
  { id: 'AL-109', title: 'Suspicious Privilege Escalation', source: 'KEM Hospital Ward 4 Node', severity: 'CRITICAL', timestamp: '12:40:02 PM', status: 'UNASSIGNED', category: 'Access Violation' },
  { id: 'AL-110', title: 'Infusion Pump Firmware Anomaly', source: 'Sion Hospital Pediatric ICU', severity: 'HIGH', timestamp: '12:38:15 PM', status: 'INVESTIGATING', category: 'Device Security' },
  { id: 'AL-111', title: 'Bulk Health Records Export Attempt', source: 'Reception Desk 3 (Dadar)', severity: 'HIGH', timestamp: '12:35:44 PM', status: 'CONTAINED', category: 'Data Leakage' },
  { id: 'AL-112', title: 'Out-of-hours Physician Logged On', source: 'Doctor Dashboard Remote VPN', severity: 'MEDIUM', timestamp: '12:30:10 PM', status: 'CLOSED', category: 'Zero Trust Heuristic' }
];

// Connected Medical IoT Devices
const CONNECTED_DEVICES = [
  { id: 'DEV-VENT-402', name: 'ICU Ventilator (Hamilton)', hospital: 'KEM Hospital', status: 'SECURE', patchLevel: 'v4.12.2', certExpiry: '2027-12-30', riskScore: 12 },
  { id: 'DEV-PUMP-901', name: 'Infusion Pump (Baxter)', hospital: 'Sion Hospital', status: 'ANOMALY DETECTED', patchLevel: 'v2.8.1 (Outdated)', certExpiry: '2026-08-15', riskScore: 84 },
  { id: 'DEV-MON-102', name: 'Patient Monitor (Philips)', hospital: 'Nair Hospital', status: 'SECURE', patchLevel: 'v12.0.4', certExpiry: '2028-04-10', riskScore: 8 }
];

// Immutable audit history logs
const AUDIT_LOGS = [
  { id: 'LOG-8802', actor: 'Dr. Ramesh Patil', action: 'Accessed Patient Record (Rahul Patil)', reason: 'Standard Care Follow-up', time: '12:39:15 PM', ip: '10.24.11.82', compliance: 'DPDP COMPLIANT' },
  { id: 'LOG-8803', actor: 'System Agent (AI)', action: 'Masked Aadhaar field in Research Export', reason: 'Anonymization Trigger', time: '12:37:08 PM', ip: 'localhost', compliance: 'HIPAA/ABDM COMPLIANT' },
  { id: 'LOG-8804', actor: 'Staff Nurse Aarti', action: 'Requested JIT Emergency Override', reason: 'ICU Code Blue Override', time: '12:35:00 PM', ip: '10.24.12.9', compliance: 'BREAK GLASS TRIGGERED' }
];

// Active Consent items
const INITIAL_CONSENTS = [
  { id: 'CON-90', patient: 'Rahul Patil', abhaId: 'rahul.patil@abha', type: 'Clinical Care Access', scope: 'All Wards', expiry: '2027-12-31', status: 'ACTIVE' },
  { id: 'CON-91', patient: 'Aarti Tambe', abhaId: 'aarti.tambe@abha', type: 'Research Trial Study', scope: 'Cardiology Only', expiry: '2026-08-30', status: 'ACTIVE' },
  { id: 'CON-92', patient: 'Devendra Sawant', abhaId: 'dev.sawant@abha', type: 'Full Medical Record Share', scope: 'Emergency Only', expiry: '2026-10-15', status: 'REVOKED' }
];

// AI Heuristic security assistant recommendations
const INITIAL_RECS = [
  { id: 'REC-1', title: 'Disable Outdated TLS Cipher on Dadar UPHC 2 server', severity: 'HIGH', autoActions: ['TLSv1.1 deprecation policy'], approved: false },
  { id: 'REC-2', title: 'Patch Infusion Pump Baxter firmware (CVE-2026-1082)', severity: 'CRITICAL', autoActions: ['Download patch', 'Verify firmware signature'], approved: false }
];

interface CyberSecurityDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function CyberSecurityDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: CyberSecurityDashboardProps) {
  // Portal navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'soc' | 'trust' | 'consent' | 'audit' | 'devices' | 'ai' | 'compliance' | 'continuity'>('soc');

  // Interactive states
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [devices, setDevices] = useState(CONNECTED_DEVICES);
  const [consents, setConsents] = useState(INITIAL_CONSENTS);
  const [aiRecs, setAiRecs] = useState(INITIAL_RECS);
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  // Break glass emergency override simulator
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [isBreakGlassActive, setIsBreakGlassActive] = useState(false);

  const triggerBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason.trim()) return;
    setIsBreakGlassActive(true);
    // Add to audit logs immediately
    const newLog = {
      id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
      actor: 'CRO Administrator',
      action: 'Emergency BREAK GLASS Activated',
      reason: breakGlassReason,
      time: new Date().toLocaleTimeString(),
      ip: '10.24.11.1',
      compliance: 'EMERGENCY OVERRIDE'
    };
    setAuditLogs([newLog, ...auditLogs]);
    setBreakGlassReason('');
  };

  // Resolve SOC alert simulator
  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(al => al.id === id ? { ...al, status: 'CLOSED' } : al));
  };

  // Toggle consent status
  const toggleConsent = (id: string) => {
    setConsents(prev => prev.map(con => {
      if (con.id === id) {
        const nextStatus = con.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
        // Add to audit trail
        const newLog = {
          id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
          actor: 'Patient Portal Switch',
          action: `Consent ${nextStatus} for ${con.patient}`,
          reason: 'User Initiated Revocation',
          time: new Date().toLocaleTimeString(),
          ip: '192.168.1.4',
          compliance: 'DPDP ACT COMPLIANT'
        };
        setAuditLogs(prevLogs => [newLog, ...prevLogs]);
        return { ...con, status: nextStatus };
      }
      return con;
    }));
  };

  // AI Security Agent recommendation approval
  const approveRecommendation = (id: string) => {
    setAiRecs(prev => prev.map(rec => rec.id === id ? { ...rec, approved: true } : rec));
    // Simulate updating corresponding device risk score
    if (id === 'REC-2') {
      setDevices(prev => prev.map(dev => dev.id === 'DEV-PUMP-901' ? { ...dev, status: 'SECURE', riskScore: 10 } : dev));
    }
  };

  // Offline Mode simulator state
  const [offlineSyncProgress, setOfflineSyncProgress] = useState(100);
  const [isSimulatingOfflineMode, setIsSimulatingOfflineMode] = useState(false);

  const startOfflineDrill = () => {
    setIsSimulatingOfflineMode(true);
    setOfflineSyncProgress(100);
    const interval = setInterval(() => {
      setOfflineSyncProgress(prev => {
        if (prev <= 10) {
          clearInterval(interval);
          setIsSimulatingOfflineMode(false);
          return 100;
        }
        return prev - 15;
      });
    }, 400);
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#090d16] text-gray-200' : 'bg-slate-50 text-slate-800'} transition-all`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors bg-white/95 border-gray-100 dark:bg-[#0c1322]/95 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-md">
            <Shield className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM Cyber Security</span>
                <span className="text-[10px] bg-cyan-600 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">Zero Trust Engine</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              ABDM Telemetry Gateway • DPDP Compliance Auditor • Hospital Security Operations Center
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-900 text-gray-400 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
          </button>

          <button 
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock Security Portal</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">

        {/* Security Alert KPI Banners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">SOC Alert Status</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <h3 className="text-lg font-black text-rose-500">{alerts.filter(a => a.status !== 'CLOSED').length} Active</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-bold mt-1">Zero Trust Rules Enabled</span>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Device Risk Score</span>
            <h3 className="text-xl font-black text-amber-500 mt-1">Medium Risk</h3>
            <span className="text-[10px] text-red-400 font-bold mt-1">1 Device needs patching</span>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">DPDP Compliance</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">98.4% Compliant</h3>
            <span className="text-[10px] text-green-500 font-bold mt-1">✓ HIPAA / ABDM Ready</span>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Active Break Glass</span>
            <h3 className={`text-xl font-black mt-1 ${isBreakGlassActive ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
              {isBreakGlassActive ? 'ACTIVE' : 'OFF'}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold mt-1">Audit ledger live tracking</span>
          </div>
        </div>

        {/* Tab Selector Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl max-w-6xl shadow-sm">
          {[
            { id: 'soc', label: 'SOC Alert Center', icon: ShieldAlert },
            { id: 'trust', label: 'Access Control', icon: Key },
            { id: 'consent', label: 'Consent Registry', icon: Users },
            { id: 'audit', label: 'Audit Ledger', icon: FileSpreadsheet },
            { id: 'devices', label: 'IoT Device Security', icon: Cpu },
            { id: 'ai', label: 'AI Governance', icon: Zap },
            { id: 'compliance', label: 'Compliance Index', icon: ShieldCheck },
            { id: 'continuity', label: 'Business Continuity', icon: LifeBuoy }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Display Active Tab views */}
        <div className="mt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: SOC ALERT CENTER */}
            {activeTab === 'soc' && (
              <motion.div
                key="soc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Active Incidents Queue */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">SOC Incident Queue</h3>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Realtime Heuristics</span>
                  </div>

                  <div className="space-y-3">
                    {alerts.map(al => (
                      <div
                        key={al.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 ${
                          al.severity === 'CRITICAL' ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30' : 'bg-slate-50 dark:bg-slate-900/40 border-gray-100 dark:border-gray-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                              al.severity === 'CRITICAL' ? 'bg-red-200 bg-red-600 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                            }`}>
                              {al.severity}
                            </span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{al.title}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold">{al.source} • {al.timestamp} • {al.category}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          {al.status !== 'CLOSED' ? (
                            <button
                              onClick={() => resolveAlert(al.id)}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Resolve incident
                            </button>
                          ) : (
                            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heuristic System Status */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">SIEM Engine Analytics</h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-400">Total Log Telemetry</span>
                      <span className="font-mono font-bold">14,289 EPS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-400">Suspicious Login Blocked</span>
                      <span className="font-mono font-bold text-red-500">12 Attempts</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Device Risk Posture</span>
                      <span className="font-bold text-amber-500">92/100 (Stable)</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: ACCESS CONTROL & EMERGENCY BREAK GLASS */}
            {activeTab === 'trust' && (
              <motion.div
                key="trust"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Emergency Break Glass Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Emergency Override (Break Glass Mode)</h3>
                  </div>
                  
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Activating Break Glass bypasses Standard role-based access restrictions for critical patient care scenarios. **Warning: This bypass is audited in immutable logs and flags immediate alerts to SOC.**
                  </p>

                  <form onSubmit={triggerBreakGlass} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-405 font-bold uppercase">Provide Reason for Emergency Override</label>
                      <input
                        type="text"
                        placeholder="e.g. Patient code blue, immediate record transfer needed"
                        value={breakGlassReason}
                        onChange={(e) => setBreakGlassReason(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isBreakGlassActive}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isBreakGlassActive ? 'BREAK GLASS OVERRIDE ACTIVE' : 'Initiate Override'}
                    </button>
                  </form>
                </div>

                {/* Just-In-Time Authorization details */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">JIT Permission Matrix</h3>
                  <div className="space-y-3 font-semibold text-xs leading-normal">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-slate-800 dark:text-slate-100">Role-Based Access Rules</p>
                      <p className="text-[10px] text-gray-400 mt-1">Standard: Least privilege isolation restricts oncology patient records to department staff only.</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 3: PATIENT CONSENT REGISTRY */}
            {activeTab === 'consent' && (
              <motion.div
                key="consent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">ABDM & DPDP Consent Registry</h3>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Patient Data Control</span>
                  </div>

                  <div className="overflow-x-auto text-xs text-left">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold">
                          <th className="py-2">ABHA ID</th>
                          <th className="py-2">Patient</th>
                          <th className="py-2">Consent Type</th>
                          <th className="py-2">Expiry Date</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consents.map(con => (
                          <tr key={con.id} className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                            <td className="py-3 font-mono">{con.abhaId}</td>
                            <td className="py-3 font-bold">{con.patient}</td>
                            <td className="py-3">{con.type}</td>
                            <td className="py-3">{con.expiry}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => toggleConsent(con.id)}
                                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider cursor-pointer ${
                                  con.status === 'ACTIVE'
                                    ? 'bg-rose-100 dark:bg-rose-950/20 text-rose-600'
                                    : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600'
                                }`}
                              >
                                {con.status === 'ACTIVE' ? 'Revoke Consent' : 'Activate Consent'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: IMMUTABLE AUDIT LEDGER */}
            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Immutable Audit Ledger Logs</h3>
                    <span className="text-[9px] bg-cyan-100 dark:bg-cyan-950 text-cyan-500 font-bold px-2 py-0.5 rounded uppercase">SHA-256 Signatures</span>
                  </div>

                  <div className="overflow-x-auto text-xs text-left">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold">
                          <th className="py-2">Timestamp</th>
                          <th className="py-2">User / Actor</th>
                          <th className="py-2">Action</th>
                          <th className="py-2">IP Address</th>
                          <th className="py-2 text-right">Compliance Index</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map(log => (
                          <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/10">
                            <td className="py-3 font-mono">{log.time}</td>
                            <td className="py-3 font-bold text-slate-800 dark:text-slate-100">{log.actor}</td>
                            <td className="py-3">{log.action} <span className="text-gray-400 font-normal">({log.reason})</span></td>
                            <td className="py-3 font-mono">{log.ip}</td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 text-[8.5px] font-black rounded uppercase">
                                {log.compliance}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: IOT DEVICE SECURITY */}
            {activeTab === 'devices' && (
              <motion.div
                key="devices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">IoT Device Compliance & Inventory</h3>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Medical Hardware Security</span>
                  </div>

                  <div className="overflow-x-auto text-xs text-left">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold">
                          <th className="py-2">Device ID</th>
                          <th className="py-2">Device Name</th>
                          <th className="py-2">Hospital Node</th>
                          <th className="py-2">Patch Level</th>
                          <th className="py-2 text-right">Heuristic Risk Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devices.map(dev => (
                          <tr key={dev.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/10">
                            <td className="py-3 font-mono">{dev.id}</td>
                            <td className="py-3 font-bold text-slate-800 dark:text-slate-100">{dev.name}</td>
                            <td className="py-3">{dev.hospital}</td>
                            <td className="py-3">{dev.patchLevel}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-black ${
                                dev.riskScore > 50 ? 'bg-red-100 dark:bg-red-950 text-red-500' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-500'
                              }`}>
                                {dev.riskScore} / 100
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 6: AI GOVERNANCE CENTER */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Heuristic Recommendation approvals */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">AI Risk Mitigation Approvals</h3>
                  
                  <div className="space-y-3">
                    {aiRecs.map(rec => (
                      <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{rec.title}</h4>
                          <p className="text-[9.5px] text-gray-400">Suggested Action: {rec.autoActions.join(', ')}</p>
                        </div>
                        
                        <div>
                          {!rec.approved ? (
                            <button
                              onClick={() => approveRecommendation(rec.id)}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Approve & Apply Policy
                            </button>
                          ) : (
                            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                              <Check className="w-4 h-4" /> Applied
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Bias & Hallucination tracking */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">AI Model Trust Metrics</h3>
                  <div className="space-y-3.5 text-xs font-semibold">
                    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-gray-400">Clinical Retinopathy Classifier Bias</span>
                      <span className="text-emerald-500">0.02 (Optimal)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-gray-400">Hallucination Index</span>
                      <span className="text-emerald-500">&lt; 1%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 7: COMPLIANCE INDEX */}
            {activeTab === 'compliance' && (
              <motion.div
                key="compliance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Government Security Compliance Checklists</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-xs font-black">DPDP Act 2023 Compliance</h4>
                      <p className="text-[10px] text-gray-400">Ensures clear consent withdrawal pathways, de-identified datasets, and audit trails of health record operations.</p>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">98% VERIFIED</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-xs font-black">ABDM Telemetry & FHIR Standards</h4>
                      <p className="text-[10px] text-gray-400">Interoperable transmission of clinical data via secure gateway configurations.</p>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">100% VERIFIED</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 8: BUSINESS CONTINUITY */}
            {activeTab === 'continuity' && (
              <motion.div
                key="continuity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Disaster Recovery drills simulator */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Business Continuity & Offline Recovery Drills</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Simulate local backup restore and offline caching operations to verify continuity of care during network outages.
                  </p>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span>Offline Sync Progress</span>
                      <span>{offlineSyncProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${offlineSyncProgress}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={startOfflineDrill}
                    disabled={isSimulatingOfflineMode}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {isSimulatingOfflineMode ? 'Drill Underway...' : 'Start Continuity Recovery Drill'}
                  </button>
                </div>

                {/* Backup verification stats */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Redundant Infrastructure Status</h3>
                  <div className="space-y-3.5 text-xs font-semibold">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-gray-400">KEM Hot Standby Node</span>
                      <span className="text-emerald-500">ONLINE</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Last Backup Verification</span>
                      <span className="font-mono">Today, 06:00 AM</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
