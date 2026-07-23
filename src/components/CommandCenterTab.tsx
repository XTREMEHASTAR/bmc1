import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, AlertTriangle, Search, Building2, Clock, HeartPulse, Sparkles,
  X, ChevronRight, ShieldCheck, Zap, Info, ShieldAlert, Users, DollarSign,
  Map, Truck, Send, Download, BarChart2, Sliders, Moon, Sun, Monitor,
  AlertCircle, FileText, CheckCircle, RefreshCw, Maximize2, Bed,
  Syringe, FlaskConical, Radio, Pill as PillIcon, Droplet, Wifi, WifiOff, Bell,
  BellOff, Shield, MapPin, Phone, ChevronDown, ChevronUp, ArrowRight,
  TrendingUp, TrendingDown, Minus, Circle, Square, Triangle, Star,
  Package, Thermometer, Cpu, Eye, Lock, Unlock, Flag, Navigation,
  UserCheck, UserX, Calendar, Filter, Plus, Pencil, Trash2, ExternalLink,
  Volume2, VolumeX, Hash, MoreVertical
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
type Page =
  | 'overview' | 'map' | 'flow' | 'beds' | 'emergency'
  | 'icu_ot' | 'workforce' | 'departments' | 'diagnostics'
  | 'pharmacy_blood' | 'alerts' | 'incidents' | 'inter_hospital'
  | 'ai_analytics' | 'reports' | 'governance';

interface CmdAlert {
  id: string; severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'; category: string;
  title: string; message: string; department: string; location: string;
  startedAt: string; status: string; escalationLevel: number; owner?: string; elapsed?: number;
  acknowledgedBy?: string;
}
interface CmdIncident {
  id: string; type: string; severity: string; title: string; location: string;
  reportedAt: string; commander?: string; teamsAssigned: string[]; resourcesRequested: string[];
  status: string; isMCI: boolean; updates: { time: string; message: string; by: string }[];
}
interface BedWard { ward: string; total: number; occupied: number; available: number; cleaning: number; blocked: number; reserved: number; icuClass: boolean; }
interface DeptRow { id: string; name: string; opdLoad: number; ipdCensus: number; capacity: number; staff: number; avgWait: number; criticalCases: number; openAlerts: number; status: string; occupancyPct?: number; }

// ── Helpers ──────────────────────────────────────────────────
const api = async (path: string, opts?: RequestInit) => {
  try {
    const r = await fetch(path, opts);
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.json();
  } catch (e) { return null; }
};
const postAudit = (action: string, target: string) =>
  api('/api/command/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: 'Command Officer', role: 'COMMAND_OFFICER', action, target }) });

const statusColor: Record<string, string> = {
  NORMAL: 'text-emerald-500', MODERATE: 'text-amber-500', HIGH_LOAD: 'text-orange-500',
  CRITICAL: 'text-red-500', HIGH_PRESSURE: 'text-red-500', ONLINE: 'text-emerald-500',
  OFFLINE: 'text-red-500', CALIBRATING: 'text-amber-400', RUNNING: 'text-blue-500',
  EMERGENCY_READY: 'text-emerald-500', CLEANING: 'text-amber-400', SCHEDULED: 'text-slate-400',
  OK: 'text-emerald-500', LOW: 'text-amber-400', CRITICAL_STOCK: 'text-red-500',
  DETECTED: 'text-red-500 animate-pulse', ACKNOWLEDGED: 'text-amber-500',
  ASSIGNED: 'text-blue-500', IN_PROGRESS: 'text-purple-500', RESOLVED: 'text-emerald-500',
  OPEN: 'text-orange-500', ACTIVE: 'text-red-500', CONTAINED: 'text-amber-500',
  MCI_DECLARED: 'text-red-600 font-black animate-pulse'
};
const severityBg: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 border-red-500/30',
  HIGH: 'bg-orange-500/10 border-orange-500/30',
  WARNING: 'bg-amber-500/10 border-amber-500/30',
  INFO: 'bg-blue-500/10 border-blue-500/30',
  MEDIUM: 'bg-amber-500/10 border-amber-500/30',
  LOW: 'bg-slate-500/10 border-slate-500/30',
};
const severityDot: Record<string, string> = {
  CRITICAL: 'bg-red-500', HIGH: 'bg-orange-500', WARNING: 'bg-amber-400',
  INFO: 'bg-blue-500', MEDIUM: 'bg-amber-400', LOW: 'bg-slate-400'
};
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const elapsedMins = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

// ── Tiny pill component ───────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${color}`}>{label}</span>
);

// ── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, color, icon: Icon, alert }: any) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden ${alert ? 'ring-1 ring-red-500/40' : ''}`}>
    {alert && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{title}</p>
        <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{sub}</p>}
      </div>
      {Icon && <div className={`p-2 rounded-xl ${color.replace('text-', 'bg-').replace('500', '500/10')}`}><Icon className={`w-4 h-4 ${color}`} /></div>}
    </div>
  </div>
);

// ── Occupancy Bar ─────────────────────────────────────────────
const OccBar = ({ pct, label }: { pct: number; label?: string }) => {
  const col = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1"><span>{label}</span><span className={pct >= 90 ? 'text-red-500' : pct >= 75 ? 'text-orange-500' : 'text-emerald-500'}>{pct}%</span></div>}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${col} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function CommandCenterTab() {
  const [page, setPage] = useState<Page>('overview');
  const [isDark, setIsDark] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMciActive, setIsMciActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  // Data state
  const [overview, setOverview] = useState<any>(null);
  const [alerts, setAlerts] = useState<CmdAlert[]>([]);
  const [incidents, setIncidents] = useState<CmdIncident[]>([]);
  const [beds, setBeds] = useState<any>(null);
  const [flow, setFlow] = useState<any>(null);
  const [departments, setDepartments] = useState<DeptRow[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [pharmacyBlood, setPharmacyBlood] = useState<any>(null);
  const [otSchedule, setOtSchedule] = useState<any>(null);
  const [interHospital, setInterHospital] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  // Ambulance telemetry
  const [ambulances, setAmbulances] = useState([
    { id: 'AMB-01', location: 'Dadar TT Circle', eta: '4 mins', status: 'En-route — Trauma (RED)', progress: 65, vitals: 'BP 110/70 • SpO₂ 94%', driver: 'Rajesh Shinde', severity: 'RED' },
    { id: 'AMB-02', location: 'Sion Circle Flyover', eta: '2 mins', status: 'En-route — Cardiac (RED)', progress: 85, vitals: 'BP 140/90 • HR 105', driver: 'Amit Patil', severity: 'RED' },
    { id: 'AMB-03', location: 'Prabhadevi Chowk', eta: '12 mins', status: 'Dispatched — Routine (GREEN)', progress: 20, vitals: 'Stable', driver: 'Vinay Kamble', severity: 'GREEN' },
    { id: 'AMB-04', location: 'Worli Sea Face', eta: '8 mins', status: 'En-route — Respiratory (YELLOW)', progress: 45, vitals: 'SpO₂ 89% (On O₂)', driver: 'Sanjay More', severity: 'YELLOW' },
  ]);

  // ICU live telemetry
  const [icuTelemetry, setIcuTelemetry] = useState<Record<string, number[]>>({
    'ICU-A1': new Array(20).fill(72), 'ICU-A2': new Array(20).fill(65),
    'ICU-A3': new Array(20).fill(115), 'ICU-A4': new Array(20).fill(80),
  });

  // Modals
  const [reserveBedModal, setReserveBedModal] = useState(false);
  const [reserveBedWard, setReserveBedWard] = useState('');
  const [dispatchModal, setDispatchModal] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState('');
  const [incidentModal, setIncidentModal] = useState(false);
  const [mciConfirm, setMciConfirm] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<CmdAlert | null>(null);

  // E2E simulation
  const [simRunning, setSimRunning] = useState(false);
  const [simSteps, setSimSteps] = useState<{ step: string; status: 'pending' | 'running' | 'done' | 'error' }[]>([]);

  // ── Load all data ───────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [ov, al, inc, bd, fl, dep, diag, pb, ot, ih, cor, aud] = await Promise.all([
      api('/api/dean/dashboard/sion'),
      api('/api/command/alerts'),
      api('/api/command/incidents'),
      api('/api/command/beds'),
      api('/api/command/patient-flow'),
      api('/api/command/departments'),
      api('/api/command/diagnostics'),
      api('/api/command/pharmacy-blood'),
      api('/api/command/ot-schedule'),
      api('/api/command/inter-hospital'),
      api('/api/command/correlation'),
      api('/api/command/audit'),
    ]);
    if (ov?.data) setOverview(ov.data);
    if (al?.data) setAlerts(al.data);
    if (inc?.data) setIncidents(inc.data);
    if (bd?.data) setBeds(bd.data);
    if (fl?.data) setFlow(fl.data);
    if (dep?.data) setDepartments(dep.data);
    if (diag?.data) setDiagnostics(diag.data);
    if (pb?.data) setPharmacyBlood(pb.data);
    if (ot?.data) setOtSchedule(ot.data);
    if (ih?.data) setInterHospital(ih.data);
    if (cor?.data) setCorrelations(cor.data);
    if (aud?.data) setAuditLog(aud.data);
    if (inc?.data?.some((i: CmdIncident) => i.isMCI)) setIsMciActive(true);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Ambulance telemetry
  useEffect(() => {
    const t = setInterval(() => {
      setAmbulances(prev => prev.map(a => {
        const np = Math.min(100, a.progress + Math.floor(Math.random() * 3) + 1);
        return { ...a, progress: np, eta: np >= 100 ? 'ARRIVED' : `${Math.ceil((100 - np) / 8)} mins` };
      }));
      setIcuTelemetry(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(bed => {
          const arr = [...next[bed].slice(1)];
          const base = bed === 'ICU-A3' ? 108 : 74;
          const pulse = base + Math.floor(Math.random() * 8) - 4;
          arr.push(pulse);
          next[bed] = arr;
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  // Voice OS listener
  useEffect(() => {
    const handler = (e: any) => {
      const tab = e.detail;
      if (['overview', 'map', 'flow', 'beds', 'emergency', 'icu_ot', 'workforce', 'departments', 'diagnostics', 'pharmacy_blood', 'alerts', 'incidents', 'inter_hospital', 'ai_analytics', 'reports', 'governance'].includes(tab)) {
        setPage(tab as Page);
      }
    };
    window.addEventListener('mcgm-command-tab-change', handler);
    return () => window.removeEventListener('mcgm-command-tab-change', handler);
  }, []);

  // ── Actions ─────────────────────────────────────────────────
  const reserveBed = async () => {
    if (!reserveBedWard) return;
    const r = await api('/api/command/beds/reserve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ward: reserveBedWard, reason: 'Command Center reservation', reservedBy: 'Command Officer' })
    });
    if (r?.success) {
      setActionFeedback(`✅ Bed reserved in ${reserveBedWard}`);
      await postAudit(`Reserved bed in ${reserveBedWard}`, reserveBedWard);
      await loadAll();
    } else setActionFeedback(`❌ ${r?.error || 'Reservation failed'}`);
    setReserveBedModal(false);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const acknowledgeAlert = async (id: string) => {
    await api(`/api/command/alerts/${id}/acknowledge`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedBy: 'Command Officer', action: 'acknowledge' })
    });
    await postAudit(`Acknowledged alert ${id}`, id);
    await loadAll();
    setSelectedAlert(null);
  };

  const resolveAlert = async (id: string) => {
    await api(`/api/command/alerts/${id}/acknowledge`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedBy: 'Command Officer', action: 'resolve' })
    });
    await postAudit(`Resolved alert ${id}`, id);
    await loadAll();
    setSelectedAlert(null);
  };

  const declareMCI = async (incidentId: string) => {
    if (!mciConfirm || mciConfirm.toUpperCase() !== 'DECLARE MCI') {
      setActionFeedback('❌ Please type DECLARE MCI to confirm.'); return;
    }
    const r = await api(`/api/command/incidents/${incidentId}/declare-mci`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ declaredBy: 'Dr. Dean Kumar', reason: 'Mass casualty threshold exceeded.' })
    });
    if (r?.success) {
      setIsMciActive(true);
      setActionFeedback('🚨 MCI DECLARED — All protocols activated');
      await postAudit('DECLARED MCI', incidentId);
      await loadAll();
    }
    setMciConfirm('');
    setTimeout(() => setActionFeedback(''), 6000);
  };

  // E2E trauma simulation
  const runE2ESimulation = async () => {
    const steps = [
      'Ambulance reports incoming RED trauma patient',
      'Command Center receives patient ETA',
      'Emergency bay pre-assigned to patient',
      'AI detects ICU near capacity + O-Neg shortage',
      'Correlated operational warning generated',
      'Command officer reserves Trauma Bay 1',
      'Staff deployment command sent to Er Nurse Varsha',
      'Staff acknowledges: ON MY WAY',
      'Patient registered on arrival (UHID auto-generated)',
      'Triage completed — RED category confirmed',
      'Doctor orders CBC STAT + CT Scan',
      'Lab receives order automatically',
      'Radiology receives CT order automatically',
      'Command Center tracks TAT timer',
      'Critical lab result generated (Hb 5.8 g/dL)',
      'Doctor + Nurse notified via alert',
      'Alert escalated: unacknowledged at 5 min mark',
      'ICU bed reserved and assigned',
      'All modules update — patient timeline complete',
      'Full audit trail available for review'
    ].map(step => ({ step, status: 'pending' as const }));
    setSimSteps(steps);
    setSimRunning(true);
    for (let i = 0; i < steps.length; i++) {
      setSimSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      await new Promise(r => setTimeout(r, 900));
      setSimSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
    }
    setSimRunning(false);
    setActionFeedback('✅ E2E trauma simulation complete — all 20 steps verified');
    setTimeout(() => setActionFeedback(''), 6000);
  };

  // ── Derived state ────────────────────────────────────────────
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');
  const hospitalStatus = (() => {
    if (isMciActive) return { label: 'MCI ACTIVE', color: 'text-red-600', bg: 'bg-red-600', pulse: true };
    if (criticalAlerts.length >= 3) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500', pulse: true };
    if (criticalAlerts.length >= 1 || (beds?.occupancyPct || 0) > 90) return { label: 'HIGH PRESSURE', color: 'text-orange-500', bg: 'bg-orange-500', pulse: false };
    if ((beds?.occupancyPct || 0) > 75) return { label: 'MODERATE PRESSURE', color: 'text-amber-500', bg: 'bg-amber-400', pulse: false };
    return { label: 'NORMAL OPERATIONS', color: 'text-emerald-500', bg: 'bg-emerald-500', pulse: false };
  })();

  // ── NAV PAGES ────────────────────────────────────────────────
  const PAGES: { id: Page; label: string; icon: any; alert?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: Monitor },
    { id: 'map', label: 'Hospital Map', icon: Map },
    { id: 'flow', label: 'Patient Flow', icon: Activity },
    { id: 'beds', label: 'Bed Board', icon: Bed },
    { id: 'emergency', label: 'Emergency', icon: Truck, alert: true },
    { id: 'icu_ot', label: 'ICU & OT', icon: HeartPulse },
    { id: 'workforce', label: 'Workforce', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'diagnostics', label: 'Diagnostics', icon: FlaskConical },
    { id: 'pharmacy_blood', label: 'Pharmacy & Blood', icon: Droplet },
    { id: 'alerts', label: 'Alerts', icon: Bell, alert: criticalAlerts.length > 0 },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, alert: isMciActive },
    { id: 'inter_hospital', label: 'Network', icon: Wifi },
    { id: 'ai_analytics', label: 'AI Analytics', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'governance', label: 'Audit', icon: Lock },
  ];

  const cls = (dark: string, light: string) => isDark ? dark : light;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${isDark ? 'bg-[#040B18] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>

      {/* MCI Banner */}
      <AnimatePresence>
        {isMciActive && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="bg-red-600 text-white text-center py-2 px-4 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 animate-pulse z-50">
            <Zap className="w-5 h-5" />
            🚨 MASS CASUALTY INCIDENT ACTIVE — ALL PROTOCOLS ENGAGED
            <Zap className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'bg-[#060D1F] border-slate-800' : 'bg-white border-slate-200'} sticky top-0 z-40 shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hospitalStatus.bg} ${hospitalStatus.pulse ? 'animate-ping' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">MCGM DIGITAL HOSPITAL</span>
            </div>
            <h1 className="text-base font-black uppercase tracking-tight leading-tight">
              HOSPITAL COMMAND CENTER
              <span className="ml-2 text-[9px] font-black bg-[#0A5BFF] text-white px-2 py-0.5 rounded">MISSION CONTROL</span>
            </h1>
          </div>
          <div className={`hidden md:flex flex-col ml-4 pl-4 border-l ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
            <span className="text-xs font-black text-slate-500">SION HOSPITAL</span>
            <span className={`text-xs font-black ${hospitalStatus.color}`}>{hospitalStatus.label}</span>
          </div>
        </div>

        {/* Header Center — Search */}
        <div className={`hidden lg:flex items-center gap-2 rounded-xl px-3 py-2 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'} w-72`}>
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search patient, staff, bed, incident…" className="bg-transparent text-xs w-full outline-none text-slate-500 placeholder:text-slate-500" />
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-2">
          <div className={`hidden md:flex flex-col items-end text-[9px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{liveTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="text-base font-black tracking-widest">{liveTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
          </div>
          <button onClick={() => setNotifOpen(!notifOpen)} className={`relative p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}>
            <Bell className="w-4 h-4 text-slate-400" />
            {criticalAlerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
          </button>
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}>
            {isDark ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}>
            <Maximize2 className="w-4 h-4 text-slate-400" />
          </button>
          <div className={`flex items-center gap-2 ml-1 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
            <div className="w-6 h-6 bg-[#0A5BFF] rounded-full flex items-center justify-center text-white text-[9px] font-black">CO</div>
            <span className="text-[9px] font-black hidden xl:block">Cmd. Officer Sharma</span>
          </div>
        </div>
      </header>

      {/* Body — Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Nav */}
        <nav className={`w-48 shrink-0 flex flex-col border-r ${isDark ? 'bg-[#060D1F] border-slate-800' : 'bg-white border-slate-200'} overflow-y-auto`} style={{ height: 'calc(100vh - 57px)' }}>
          <div className="p-3 space-y-0.5">
            {PAGES.map(p => {
              const Icon = p.icon;
              const active = page === p.id;
              return (
                <button key={p.id} onClick={() => setPage(p.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer relative
                    ${active
                      ? 'bg-[#0A5BFF] text-white shadow-lg shadow-blue-900/30'
                      : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{p.label}</span>
                  {p.alert && !active && <span className="ml-auto w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className={`mt-auto p-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Quick Commands</p>
            <div className="space-y-1">
              {[
                { label: 'Reserve ICU Bed', action: () => { setReserveBedWard('ICU Block A'); setReserveBedModal(true); } },
                { label: 'Deploy Staff', action: () => setDispatchModal(true) },
                { label: 'Create Incident', action: () => setIncidentModal(true) },
                { label: 'Simulate Trauma', action: runE2ESimulation },
              ].map(q => (
                <button key={q.label} onClick={q.action}
                  className={`w-full text-[9px] font-black text-left px-2 py-1.5 rounded-lg ${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} transition-all`}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-5" style={{ height: 'calc(100vh - 57px)' }}>

          {/* Action Feedback */}
          <AnimatePresence>
            {actionFeedback && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className={`mb-4 p-3 rounded-xl text-sm font-bold border ${actionFeedback.includes('❌') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                {actionFeedback}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

              {/* ════ PAGE 1: OVERVIEW ════════════════════════════════════════ */}
              {page === 'overview' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black uppercase tracking-wide">Command Overview</h2>
                      <p className="text-[10px] text-slate-400">SEE → UNDERSTAND → DECIDE → ACT → TRACK</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={loadAll} className="flex items-center gap-1.5 text-[9px] font-black px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all">
                        <RefreshCw className="w-3 h-3" /> Refresh
                      </button>
                      <button onClick={runE2ESimulation} disabled={simRunning} className="flex items-center gap-1.5 text-[9px] font-black px-3 py-2 bg-[#0A5BFF] hover:bg-blue-600 text-white rounded-xl shadow transition-all disabled:opacity-60">
                        <Zap className="w-3 h-3" /> {simRunning ? 'Simulating…' : 'Simulate Trauma E2E'}
                      </button>
                    </div>
                  </div>

                  {/* Hospital Status Banner */}
                  <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${hospitalStatus.bg.replace('bg-', 'border-').replace('500', '500/40')} ${hospitalStatus.bg.replace('bg-', 'bg-').replace('500', '500/10')}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${hospitalStatus.bg} ${hospitalStatus.pulse ? 'animate-pulse' : ''}`} />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hospital Operating State</p>
                        <p className={`text-xl font-black ${hospitalStatus.color}`}>{hospitalStatus.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black text-slate-500">
                      <div className="text-center"><div className="text-xs font-black text-red-500">{criticalAlerts.length}</div>CRITICAL ALERTS</div>
                      <div className="text-center"><div className="text-xs font-black text-amber-400">{incidents.filter(i => i.status === 'ACTIVE').length}</div>ACTIVE INCIDENTS</div>
                      <div className="text-center"><div className="text-xs font-black text-emerald-400">{beds?.occupancyPct || '--'}%</div>BED OCCUPANCY</div>
                    </div>
                  </div>

                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <KpiCard title="OPD Today" value={overview?.metrics?.opdToday?.toLocaleString() || '2,458'} sub="Registrations complete" color="text-blue-400" icon={Users} />
                    <KpiCard title="Emergency Arrivals" value={overview?.metrics?.emergencyToday || '186'} sub="12 ambulances incoming" color="text-red-400" icon={Truck} alert />
                    <KpiCard title="IPD Census" value={overview?.metrics?.ipdCensus?.toLocaleString() || '812'} sub="Active inpatients" color="text-purple-400" icon={Bed} />
                    <KpiCard title="ICU Occupancy" value={`${Math.round(((overview?.bedOccupancy?.icuOccupied || 22) / (overview?.bedOccupancy?.icuTotal || 24)) * 100)}%`} sub={`${overview?.bedOccupancy?.icuAvailable ?? 2} beds available`} color="text-orange-400" icon={HeartPulse} alert />
                    <KpiCard title="Staff On Duty" value={overview?.staffing?.onDuty || '28'} sub={`${overview?.staffing?.presentDoctors || 6} doctors on shift`} color="text-emerald-400" icon={UserCheck} />
                    <KpiCard title="OT Cases Running" value="2" sub="3 OTs emergency-ready" color="text-blue-400" icon={Activity} />
                    <KpiCard title="Ambulances En-Route" value="4" sub="2 RED, 1 YELLOW, 1 GREEN" color="text-red-400" icon={Navigation} alert />
                    <KpiCard title="Lab Pending" value={overview?.metrics?.labPending || '142'} sub="STAT TAT +18 min over SLA" color="text-amber-400" icon={FlaskConical} />
                    <KpiCard title="Critical Alerts" value={criticalAlerts.length} sub="Unresolved critical issues" color="text-red-500" icon={AlertTriangle} alert={criticalAlerts.length > 0} />
                    <KpiCard title="Discharges Today" value="89" sub="8 discharge-ready, awaiting beds" color="text-emerald-400" icon={CheckCircle} />
                  </div>

                  {/* Correlation Engine — most important */}
                  {correlations.length > 0 && (
                    <div className={`rounded-2xl border ${isDark ? 'bg-purple-950/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'} p-4 space-y-3`}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400">AI Correlation Engine — Cross-Module Insights</h3>
                      </div>
                      {correlations.map(cor => (
                        <div key={cor.id} className={`p-3 rounded-xl border ${severityBg[cor.severity] || 'bg-slate-800/30 border-slate-700'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityDot[cor.severity] || 'bg-slate-500'} animate-pulse`} />
                            <div className="flex-1">
                              <p className="text-xs font-black">{cor.title}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{cor.situation}</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {cor.factors.map((f: any, i: number) => (
                                  <span key={i} className="text-[8px] font-bold px-2 py-0.5 rounded bg-slate-800/60 text-slate-300">{f.module}: {f.value}</span>
                                ))}
                              </div>
                              <div className="mt-2 space-y-0.5">
                                {cor.recommendedActions.map((a: string, i: number) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[9px] text-slate-300">
                                    <ArrowRight className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                                    {a}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <span className="text-[9px] font-black text-purple-400 shrink-0">{cor.confidence}% conf.</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Two-column: Critical Alerts + Ambulance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Critical Alerts panel */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Critical Alert Panel</h3>
                        <button onClick={() => setPage('alerts')} className="text-[9px] text-[#0A5BFF] font-black flex items-center gap-1">Manage All <ChevronRight className="w-3 h-3" /></button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {alerts.filter(a => a.status !== 'RESOLVED').slice(0, 6).map(a => (
                          <div key={a.id} className={`p-2.5 rounded-xl border cursor-pointer transition-all hover:opacity-90 ${severityBg[a.severity]}`} onClick={() => setSelectedAlert(a)}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityDot[a.severity]} ${a.severity === 'CRITICAL' ? 'animate-ping' : ''}`} />
                                  <p className="text-[10px] font-black leading-tight">{a.title}</p>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-0.5 ml-3">{a.department} • {elapsedMins(a.startedAt)}m ago</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Pill label={a.severity} color={`px-1.5 py-0.5 rounded text-[8px] font-black ${a.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`} />
                                <span className={`text-[8px] font-bold ${statusColor[a.status] || 'text-slate-400'}`}>{a.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {alerts.filter(a => a.status !== 'RESOLVED').length === 0 && (
                          <div className="text-center py-6 text-slate-400 text-xs">No active alerts</div>
                        )}
                      </div>
                    </div>

                    {/* Ambulance Fleet */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-400" /> Live Ambulance Fleet</h3>
                      <div className="space-y-3">
                        {ambulances.map(a => (
                          <div key={a.id} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                            <div className="flex justify-between text-[10px]">
                              <span className="font-black">{a.id}</span>
                              <span className={`font-black ${a.eta === 'ARRIVED' ? 'text-emerald-400' : 'text-blue-400'}`}>{a.eta}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-semibold">{a.location} • {a.driver}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${a.severity === 'RED' ? 'bg-red-500/20 text-red-400' : a.severity === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{a.status}</span>
                              <span className="text-[8px] text-slate-400 font-mono">{a.vitals}</span>
                            </div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${a.severity === 'RED' ? 'bg-red-500' : a.severity === 'YELLOW' ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${a.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* E2E Simulation Panel */}
                  <AnimatePresence>
                    {simSteps.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5" /> E2E Trauma Simulation — Live Execution
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {simSteps.map((s, i) => (
                            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-[9px] font-bold transition-all ${s.status === 'done' ? 'text-emerald-400 bg-emerald-500/5' : s.status === 'running' ? 'text-blue-400 bg-blue-500/10 animate-pulse' : 'text-slate-500'}`}>
                              {s.status === 'done' && <CheckCircle className="w-3 h-3 shrink-0" />}
                              {s.status === 'running' && <RefreshCw className="w-3 h-3 shrink-0 animate-spin" />}
                              {s.status === 'pending' && <Circle className="w-3 h-3 shrink-0 text-slate-700" />}
                              <span>Step {i + 1}: {s.step}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ════ PAGE 2: HOSPITAL MAP ════════════════════════════════════ */}
              {page === 'map' && (
                <div className="space-y-4">
                  <h2 className="text-base font-black uppercase tracking-wide">Live Hospital Map</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className={`lg:col-span-2 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Interactive Floor Plan — Click Department</h3>
                        <div className="flex gap-2 text-[8px] font-black">
                          {[['bg-emerald-500', 'Normal'], ['bg-amber-400', 'Moderate'], ['bg-orange-500', 'High'], ['bg-red-500', 'Critical']].map(([c, l]) => (
                            <div key={l} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${c}`} />{l}</div>
                          ))}
                        </div>
                      </div>
                      <div className={`relative rounded-xl overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-50'} min-h-[420px] p-4`}>
                        <svg className="w-full h-[400px]" viewBox="0 0 700 420" fill="none">
                          <defs><pattern id="g2" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" /></pattern></defs>
                          <rect width="700" height="420" fill="url(#g2)" />
                          {/* Main Building Outline */}
                          <rect x="10" y="10" width="680" height="400" rx="16" fill="none" stroke="rgba(100,120,180,0.2)" strokeWidth="1.5" />

                          {/* Emergency */}
                          <g onClick={() => setSelectedDept('Emergency')} className="cursor-pointer">
                            <rect x="20" y="20" width="160" height="110" rx="10" fill={selectedDept === 'Emergency' ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.08)'} stroke="#ef4444" strokeWidth={selectedDept === 'Emergency' ? 2.5 : 1.5} />
                            <text x="40" y="55" fill="#ef4444" fontSize="11" fontWeight="900">EMERGENCY</text>
                            <text x="40" y="72" fill="#ef4444" fontSize="9">86/90 patients</text>
                            <text x="40" y="88" fill="#f87171" fontSize="8.5">18 RED • 32 YELLOW</text>
                            <circle cx="164" cy="30" r="5" fill="#ef4444" opacity="0.9"><animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite" /></circle>
                          </g>

                          {/* ICU */}
                          <g onClick={() => setSelectedDept('ICU')} className="cursor-pointer">
                            <rect x="200" y="20" width="150" height="110" rx="10" fill={selectedDept === 'ICU' ? 'rgba(249,115,22,0.25)' : 'rgba(249,115,22,0.08)'} stroke="#f97316" strokeWidth={selectedDept === 'ICU' ? 2.5 : 1.5} />
                            <text x="220" y="55" fill="#f97316" fontSize="11" fontWeight="900">ICU BLOCK A</text>
                            <text x="220" y="72" fill="#f97316" fontSize="9">22/24 beds</text>
                            <text x="220" y="88" fill="#fb923c" fontSize="8.5">6 ventilators • 92%</text>
                          </g>

                          {/* OT */}
                          <g onClick={() => setSelectedDept('OT')} className="cursor-pointer">
                            <rect x="370" y="20" width="140" height="110" rx="10" fill={selectedDept === 'OT' ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.08)'} stroke="#3b82f6" strokeWidth={selectedDept === 'OT' ? 2.5 : 1.5} />
                            <text x="388" y="55" fill="#3b82f6" fontSize="11" fontWeight="900">OPERATION THEATRE</text>
                            <text x="388" y="72" fill="#3b82f6" fontSize="9">2 running • 1 ER-ready</text>
                          </g>

                          {/* OPD */}
                          <g onClick={() => setSelectedDept('OPD')} className="cursor-pointer">
                            <rect x="530" y="20" width="150" height="110" rx="10" fill={selectedDept === 'OPD' ? 'rgba(234,179,8,0.25)' : 'rgba(234,179,8,0.08)'} stroke="#eab308" strokeWidth={selectedDept === 'OPD' ? 2.5 : 1.5} />
                            <text x="548" y="55" fill="#eab308" fontSize="11" fontWeight="900">OPD BLOCK</text>
                            <text x="548" y="72" fill="#eab308" fontSize="9">312 patients today</text>
                            <text x="548" y="88" fill="#fbbf24" fontSize="8.5">47 waiting consult</text>
                          </g>

                          {/* General Medicine Ward */}
                          <g onClick={() => setSelectedDept('General Medicine')} className="cursor-pointer">
                            <rect x="20" y="150" width="200" height="100" rx="10" fill={selectedDept === 'General Medicine' ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.06)'} stroke="#f97316" strokeWidth={selectedDept === 'General Medicine' ? 2 : 1} />
                            <text x="38" y="185" fill="#f97316" fontSize="10" fontWeight="800">GENERAL MEDICINE</text>
                            <text x="38" y="201" fill="#fb923c" fontSize="8.5">108/120 beds • HIGH</text>
                          </g>

                          {/* Surgery */}
                          <g onClick={() => setSelectedDept('Surgery')} className="cursor-pointer">
                            <rect x="240" y="150" width="160" height="100" rx="10" fill={selectedDept === 'Surgery' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.06)'} stroke="#22c55e" strokeWidth={selectedDept === 'Surgery' ? 2 : 1} />
                            <text x="258" y="185" fill="#22c55e" fontSize="10" fontWeight="800">SURGERY WARD</text>
                            <text x="258" y="201" fill="#4ade80" fontSize="8.5">71/80 beds • Normal</text>
                          </g>

                          {/* Pediatrics */}
                          <g onClick={() => setSelectedDept('Pediatrics')} className="cursor-pointer">
                            <rect x="420" y="150" width="140" height="100" rx="10" fill={selectedDept === 'Pediatrics' ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.06)'} stroke="#f97316" strokeWidth={selectedDept === 'Pediatrics' ? 2 : 1} />
                            <text x="436" y="185" fill="#f97316" fontSize="10" fontWeight="800">PEDIATRICS</text>
                            <text x="436" y="201" fill="#fb923c" fontSize="8.5">45/50 beds • ⚠ Staff</text>
                          </g>

                          {/* Lab */}
                          <g onClick={() => setSelectedDept('Laboratory')} className="cursor-pointer">
                            <rect x="580" y="150" width="100" height="100" rx="10" fill={selectedDept === 'Laboratory' ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.06)'} stroke="#a855f7" strokeWidth={selectedDept === 'Laboratory' ? 2 : 1} />
                            <text x="596" y="190" fill="#a855f7" fontSize="10" fontWeight="800">LAB</text>
                            <text x="596" y="206" fill="#c084fc" fontSize="8">142 pending</text>
                          </g>

                          {/* Blood Bank */}
                          <g onClick={() => setSelectedDept('Blood Bank')} className="cursor-pointer">
                            <rect x="20" y="270" width="130" height="90" rx="10" fill={selectedDept === 'Blood Bank' ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.08)'} stroke="#ef4444" strokeWidth={selectedDept === 'Blood Bank' ? 2 : 1} />
                            <text x="36" y="305" fill="#ef4444" fontSize="10" fontWeight="800">BLOOD BANK</text>
                            <text x="36" y="321" fill="#f87171" fontSize="8">O- CRITICAL (2 units)</text>
                          </g>

                          {/* Pharmacy */}
                          <g onClick={() => setSelectedDept('Pharmacy')} className="cursor-pointer">
                            <rect x="170" y="270" width="130" height="90" rx="10" fill={selectedDept === 'Pharmacy' ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.06)'} stroke="#eab308" strokeWidth={selectedDept === 'Pharmacy' ? 2 : 1} />
                            <text x="185" y="305" fill="#eab308" fontSize="10" fontWeight="800">PHARMACY</text>
                            <text x="185" y="321" fill="#fbbf24" fontSize="8">2 critical stocks</text>
                          </g>

                          {/* Radiology */}
                          <g onClick={() => setSelectedDept('Radiology')} className="cursor-pointer">
                            <rect x="320" y="270" width="140" height="90" rx="10" fill={selectedDept === 'Radiology' ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.06)'} stroke="#f59e0b" strokeWidth={selectedDept === 'Radiology' ? 2 : 1} />
                            <text x="336" y="305" fill="#f59e0b" fontSize="10" fontWeight="800">RADIOLOGY</text>
                            <text x="336" y="321" fill="#fbbf24" fontSize="8">CT #2 OFFLINE • 8 wait</text>
                          </g>

                          {/* OBGYN */}
                          <g onClick={() => setSelectedDept('OBGYN')} className="cursor-pointer">
                            <rect x="480" y="270" width="130" height="90" rx="10" fill={selectedDept === 'OBGYN' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.06)'} stroke="#22c55e" strokeWidth={selectedDept === 'OBGYN' ? 2 : 1} />
                            <text x="496" y="305" fill="#22c55e" fontSize="10" fontWeight="800">OBGYN</text>
                            <text x="496" y="321" fill="#4ade80" fontSize="8">48/60 beds • Normal</text>
                          </g>

                          {/* Ambulance Bays */}
                          <rect x="20" y="375" width="660" height="35" rx="8" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" strokeWidth="1" strokeDasharray="6,4" />
                          <text x="320" y="398" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="700">AMBULANCE BAYS — 4 EN-ROUTE</text>
                        </svg>
                      </div>
                    </div>

                    {/* Department Detail */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {selectedDept ? `${selectedDept} — Detail` : 'Click a department'}
                      </h3>
                      {selectedDept ? (
                        <div className="space-y-3">
                          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <p className="text-xs font-black">{selectedDept}</p>
                            {departments.find(d => d.name.includes(selectedDept.split(' ')[0])) && (() => {
                              const d = departments.find(dd => dd.name.includes(selectedDept.split(' ')[0]))!;
                              return (
                                <div className="mt-2 space-y-2 text-[9px]">
                                  <OccBar pct={d.occupancyPct || Math.round((d.ipdCensus / d.capacity) * 100)} label="Bed Occupancy" />
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div><p className="text-slate-400">OPD Load</p><p className="font-black text-xs">{d.opdLoad}</p></div>
                                    <div><p className="text-slate-400">IPD Census</p><p className="font-black text-xs">{d.ipdCensus}/{d.capacity}</p></div>
                                    <div><p className="text-slate-400">Staff</p><p className="font-black text-xs">{d.staff}</p></div>
                                    <div><p className="text-slate-400">Avg Wait</p><p className="font-black text-xs">{d.avgWait} min</p></div>
                                    <div><p className="text-slate-400">Critical Cases</p><p className={`font-black text-xs ${d.criticalCases > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{d.criticalCases}</p></div>
                                    <div><p className="text-slate-400">Open Alerts</p><p className={`font-black text-xs ${d.openAlerts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{d.openAlerts}</p></div>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    <button onClick={() => setDispatchModal(true)} className="w-full text-[9px] font-black bg-[#0A5BFF] text-white py-1.5 rounded-lg hover:bg-blue-600 transition-all">Deploy Staff Here</button>
                                    <button onClick={() => { setReserveBedWard(d.name); setReserveBedModal(true); }} className="w-full text-[9px] font-black bg-slate-700 text-white py-1.5 rounded-lg hover:bg-slate-600 transition-all">Reserve Bed</button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400">Select any department block on the map to view live operational details, capacity, staff, and quick actions.</p>
                          <div className="text-[9px] text-slate-500 space-y-1 mt-4">
                            <p className="font-black text-slate-400 uppercase tracking-widest text-[8px]">Critical Status</p>
                            <div className="flex items-center gap-2 text-red-400"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /><span>ICU — 92% capacity (WARNING)</span></div>
                            <div className="flex items-center gap-2 text-red-400"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /><span>Blood Bank — O-Neg critically low</span></div>
                            <div className="flex items-center gap-2 text-amber-400"><div className="w-1.5 h-1.5 bg-amber-400 rounded-full" /><span>Radiology — CT #2 offline</span></div>
                            <div className="flex items-center gap-2 text-orange-400"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full" /><span>Gen. Medicine — HIGH load</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PAGE 3: PATIENT FLOW ════════════════════════════════════ */}
              {page === 'flow' && flow && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">Patient Flow Command</h2>
                  {/* Pipeline */}
                  <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-5`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Live Patient Lifecycle Pipeline</h3>
                    <div className="flex flex-wrap items-center gap-0">
                      {[
                        { label: 'Arrival', value: flow.arrival.opd + flow.arrival.emergency, sub: `OPD: ${flow.arrival.opd} • ER: ${flow.arrival.emergency}`, color: 'border-blue-500 text-blue-400' },
                        { label: 'Registration', value: flow.registration.completed, sub: `${flow.registration.pending} pending`, color: 'border-blue-400 text-blue-300' },
                        { label: 'Triage', value: flow.triage.completed, sub: `${flow.triage.awaiting} awaiting`, color: 'border-amber-400 text-amber-400' },
                        { label: 'Consultation', value: flow.consultation.inProgress, sub: `${flow.consultation.waiting} waiting`, color: 'border-orange-500 text-orange-400', alert: flow.consultation.waiting > 30 },
                        { label: 'Diagnostics', value: flow.diagnostics.labPending + flow.diagnostics.radPending, sub: `Lab: ${flow.diagnostics.labPending} • Rad: ${flow.diagnostics.radPending}`, color: 'border-purple-500 text-purple-400', alert: true },
                        { label: 'Treatment', value: flow.treatment.inProgress, sub: `${flow.treatment.proceduresPending} procedures`, color: 'border-indigo-500 text-indigo-400' },
                        { label: 'Admission', value: flow.admission.recentAdmissions, sub: `${flow.admission.holdsPending} holds`, color: 'border-orange-500 text-orange-400', alert: flow.admission.holdsPending > 5 },
                        { label: 'Discharge', value: flow.discharge.dischargedToday, sub: `${flow.discharge.dischargeReady} ready`, color: 'border-emerald-500 text-emerald-400' },
                      ].map((s, i) => (
                        <React.Fragment key={s.label}>
                          <div className={`flex-1 min-w-[100px] border-2 rounded-xl p-3 relative ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'} ${s.color} ${s.alert ? 'shadow-lg shadow-red-500/10' : ''}`}>
                            {s.alert && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                            <p className={`text-2xl font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
                            <p className="text-[8px] text-slate-500">{s.sub}</p>
                          </div>
                          {i < 7 && <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Bottlenecks */}
                  <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Auto-Detected Bottlenecks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {flow.bottlenecks.map((b: any, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border ${severityBg[b.severity === 'HIGH' ? 'HIGH' : 'WARNING']}`}>
                          <div className="flex items-start gap-2">
                            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${b.severity === 'HIGH' ? 'text-orange-400' : 'text-amber-400'}`} />
                            <div className="flex-1">
                              <p className="text-xs font-black">{b.stage}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{b.issue}</p>
                              <p className="text-[8px] text-slate-500 mt-1">Dept: {b.dept}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button onClick={() => setDispatchModal(true)} className="text-[8px] font-black bg-[#0A5BFF] text-white px-2 py-0.5 rounded hover:bg-blue-600">Deploy Staff</button>
                              <button onClick={() => setPage('alerts')} className="text-[8px] font-black bg-slate-700 text-white px-2 py-0.5 rounded hover:bg-slate-600">Alert</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KpiCard title="Longest OPD Wait" value={flow.consultation.longestWait} sub="Orthopaedics OPD" color="text-orange-400" icon={Clock} />
                    <KpiCard title="Discharge Ready" value={flow.discharge.dischargeReady} sub="Beds held unnecessarily" color="text-amber-400" icon={CheckCircle} alert />
                    <KpiCard title="Admission Holds" value={flow.admission.holdsPending} sub="No bed available" color="text-red-400" icon={Bed} alert />
                    <KpiCard title="CT Queue" value={flow.diagnostics.ctQueue} sub="1 scanner offline" color="text-purple-400" icon={Radio} alert />
                  </div>
                </div>
              )}

              {/* ════ PAGE 4: BED BOARD ══════════════════════════════════════ */}
              {page === 'beds' && beds && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black uppercase tracking-wide">Bed & Capacity Command</h2>
                    <button onClick={() => setReserveBedModal(true)} className="flex items-center gap-1.5 text-[9px] font-black bg-[#0A5BFF] text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all">
                      <Plus className="w-3 h-3" /> Reserve Bed
                    </button>
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { label: 'Total', value: beds.summary.total, color: 'text-slate-300' },
                      { label: 'Occupied', value: beds.summary.occupied, color: 'text-orange-400' },
                      { label: 'Available', value: beds.summary.available, color: 'text-emerald-400' },
                      { label: 'Reserved', value: beds.summary.reserved, color: 'text-blue-400' },
                      { label: 'Cleaning', value: beds.summary.cleaning, color: 'text-amber-400' },
                      { label: 'Blocked', value: beds.summary.blocked, color: 'text-red-400' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-2xl border p-3 text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <OccBar pct={beds.occupancyPct} label={`Overall Occupancy — ${beds.occupancyPct}%`} />

                  {/* Ward table */}
                  <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Ward-Level Bed Board</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={`text-[9px] uppercase tracking-widest font-black ${isDark ? 'text-slate-500 bg-slate-950/30' : 'text-slate-400 bg-slate-50'}`}>
                            {['Ward', 'Total', 'Occupied', 'Available', 'Reserved', 'Cleaning', 'Blocked', 'Occupancy', 'Actions'].map(h => (
                              <th key={h} className="px-3 py-2 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {beds.wards.map((w: BedWard) => {
                            const pct = Math.round((w.occupied / w.total) * 100);
                            return (
                              <tr key={w.ward} className={`border-t ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50'} transition-all`}>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2">
                                    {w.icuClass && <span className="text-[7px] font-black bg-red-500/20 text-red-400 px-1.5 rounded">ICU</span>}
                                    <span className="font-bold text-[10px]">{w.ward}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 font-mono text-[10px]">{w.total}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-orange-400">{w.occupied}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-emerald-400 font-black">{w.available}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-blue-400">{w.reserved}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-amber-400">{w.cleaning}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-red-400">{w.blocked}</td>
                                <td className="px-3 py-2.5 w-36">
                                  <OccBar pct={pct} />
                                </td>
                                <td className="px-3 py-2.5">
                                  {w.available > 0 ? (
                                    <button onClick={() => { setReserveBedWard(w.ward); setReserveBedModal(true); }}
                                      className="text-[8px] font-black bg-[#0A5BFF]/20 text-[#0A5BFF] hover:bg-[#0A5BFF] hover:text-white px-2 py-1 rounded transition-all">
                                      Reserve
                                    </button>
                                  ) : <span className="text-[8px] text-red-400 font-black">FULL</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Capacity Forecast */}
                  <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400">AI Capacity Forecast</h3>
                      <span className="text-[8px] text-slate-500 ml-auto">Decision support only — requires confirmation to act</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { horizon: '2 hours', data: beds.forecast.twoHours },
                        { horizon: '4 hours', data: beds.forecast.fourHours },
                        { horizon: '8 hours', data: beds.forecast.eightHours },
                        { horizon: '24 hours', data: beds.forecast.twentyfourHours },
                      ].map(f => (
                        <div key={f.horizon} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <p className="text-[9px] font-black text-slate-400 uppercase">{f.horizon}</p>
                          <p className={`text-sm font-black mt-1 ${statusColor[f.data.pressure] || 'text-slate-300'}`}>{f.data.pressure}</p>
                          <div className="mt-2 text-[8px] text-slate-500 space-y-0.5">
                            <p>+{f.data.expectedAdmissions} admissions</p>
                            <p>−{f.data.expectedDischarges} discharges</p>
                            <p className={f.data.expectedAdmissions > f.data.expectedDischarges ? 'text-orange-400 font-bold' : 'text-emerald-400 font-bold'}>
                              Net: {f.data.expectedAdmissions > f.data.expectedDischarges ? '+' : ''}{f.data.expectedAdmissions - f.data.expectedDischarges} beds
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PAGE 5: EMERGENCY COMMAND ══════════════════════════════ */}
              {page === 'emergency' && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide flex items-center gap-2">
                    Emergency Command
                    <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">LIVE</span>
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'ER Census', value: '86/90', color: 'text-orange-400', alert: true },
                      { label: 'Red Cases', value: '18', color: 'text-red-500', alert: true },
                      { label: 'Yellow Cases', value: '32', color: 'text-amber-400' },
                      { label: 'Green Cases', value: '36', color: 'text-emerald-400' },
                      { label: 'Door-to-Doctor', value: '28 min', color: 'text-orange-400', alert: true },
                      { label: 'Awaiting Triage', value: '5', color: 'text-amber-400' },
                      { label: 'Bays Available', value: '2/6', color: 'text-emerald-400' },
                      { label: 'Incoming Ambulances', value: '4', color: 'text-blue-400', alert: true },
                    ].map(k => (
                      <div key={k.label} className={`rounded-2xl border p-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} relative`}>
                        {k.alert && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{k.label}</p>
                        <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Ambulances */}
                  <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-3">Live Ambulance Panel — Pre-Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ambulances.map(a => (
                        <div key={a.id} className={`p-4 rounded-xl border ${a.severity === 'RED' ? 'border-red-500/40 bg-red-500/5' : a.severity === 'YELLOW' ? 'border-amber-400/40 bg-amber-400/5' : 'border-emerald-500/30 bg-emerald-500/5'} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm">{a.id}</span>
                            <span className={`text-xs font-black ${a.eta === 'ARRIVED' ? 'text-emerald-400' : 'text-slate-300'}`}>{a.eta}</span>
                          </div>
                          <p className="text-[9px] text-slate-400">{a.status}</p>
                          <p className="text-[9px] text-slate-400">{a.location} • Dr: {a.driver}</p>
                          <p className="text-[9px] font-mono text-slate-300">{a.vitals}</p>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${a.severity === 'RED' ? 'bg-red-500' : a.severity === 'YELLOW' ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${a.progress}%` }} />
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {['Pre-assign Bay', 'Reserve ICU', 'Request Blood', 'Alert Trauma Team'].map(action => (
                              <button key={action} onClick={async () => {
                                await postAudit(`${action} for ${a.id}`, a.id);
                                setActionFeedback(`✅ ${action} actioned for ${a.id}`);
                                setTimeout(() => setActionFeedback(''), 3000);
                              }} className="text-[8px] font-black px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-all">
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ICU Telemetry */}
                  <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-3">Live ICU Telemetry</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(icuTelemetry).map(([bed, data]) => {
                        const bpm = data[data.length - 1];
                        const critical = bpm > 100 || bpm < 55;
                        return (
                          <div key={bed} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex justify-between text-[9px] font-black">
                              <span className="text-slate-400">{bed}</span>
                              <span className={critical ? 'text-red-400 animate-pulse' : 'text-emerald-400'}>{bpm} BPM</span>
                            </div>
                            <div className="h-10 flex items-end gap-0.5 mt-2 border-t border-slate-800 pt-1">
                              {data.map((v, i) => (
                                <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${critical ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ height: `${Math.max(4, (v / 130) * 36)}px` }} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PAGE 6: ICU & OT ═══════════════════════════════════════ */}
              {page === 'icu_ot' && otSchedule && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">ICU & OT Command</h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* ICU */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><HeartPulse className="w-3.5 h-3.5 text-red-400" /> ICU Status</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { l: 'Total Beds', v: 24, c: 'text-slate-300' },
                          { l: 'Occupied', v: 22, c: 'text-orange-400' },
                          { l: 'Available', v: 2, c: 'text-emerald-400' },
                          { l: 'Ventilators', v: 6, c: 'text-red-400' },
                          { l: 'Step-Down Ready', v: 3, c: 'text-blue-400' },
                          { l: 'Pending Requests', v: 4, c: 'text-amber-400' },
                        ].map(k => (
                          <div key={k.l} className={`p-2 rounded-xl ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'} text-center`}>
                            <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
                            <p className="text-[8px] text-slate-500 font-bold">{k.l}</p>
                          </div>
                        ))}
                      </div>
                      <OccBar pct={92} label="ICU Occupancy — 92%" />
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(icuTelemetry).map(([bed, data]) => {
                          const bpm = data[data.length - 1];
                          const crit = bpm > 100;
                          return (
                            <div key={bed} className={`p-2 rounded-lg border text-[9px] ${crit ? 'border-red-500/40 bg-red-500/5' : isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                              <div className="flex justify-between font-black">
                                <span>{bed}</span>
                                <span className={crit ? 'text-red-400 animate-pulse' : 'text-emerald-400'}>{bpm} BPM</span>
                              </div>
                              <div className="h-6 flex items-end gap-0.5 mt-1">
                                {data.slice(-12).map((v, i) => (
                                  <div key={i} className={`flex-1 rounded ${crit ? 'bg-red-500/70' : 'bg-emerald-500/70'}`} style={{ height: `${Math.max(2, (v / 130) * 22)}px` }} />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setReserveBedWard('ICU Block A'); setReserveBedModal(true); }} className="flex-1 text-[9px] font-black bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded-xl transition-all">Reserve ICU Bed</button>
                        <button onClick={() => setDispatchModal(true)} className="flex-1 text-[9px] font-black bg-slate-700 text-white hover:bg-slate-600 py-2 rounded-xl transition-all">Call ICU Team</button>
                      </div>
                    </div>

                    {/* OT */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-blue-400" /> OT Schedule</h3>
                        <div className="flex gap-2 text-[9px] font-black">
                          <span className="text-blue-400">{otSchedule.summary.running} RUNNING</span>
                          <span className="text-emerald-400">{otSchedule.summary.emergencyReady} ER-READY</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {otSchedule.rooms.map((ot: any) => {
                          const statusColors: Record<string, string> = {
                            RUNNING: 'border-blue-500/40 bg-blue-500/5',
                            EMERGENCY_READY: 'border-emerald-500/40 bg-emerald-500/5',
                            CLEANING: 'border-amber-400/40 bg-amber-400/5',
                            SCHEDULED: isDark ? 'border-slate-700 bg-slate-950/40' : 'border-slate-200 bg-slate-50',
                            MAINTENANCE: 'border-red-500/30 bg-red-500/5'
                          };
                          return (
                            <div key={ot.id} className={`p-3 rounded-xl border ${statusColors[ot.status] || ''} flex items-center gap-3`}>
                              <div className={`w-2 h-12 rounded-full shrink-0 ${ot.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' : ot.status === 'EMERGENCY_READY' ? 'bg-emerald-500' : ot.status === 'CLEANING' ? 'bg-amber-400' : 'bg-slate-600'}`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black">{ot.name}</span>
                                  <span className={`text-[8px] font-black ${statusColor[ot.status] || 'text-slate-400'}`}>{ot.status.replace(/_/g, ' ')}</span>
                                </div>
                                {ot.procedure && <p className="text-[9px] text-slate-400 mt-0.5">{ot.procedure}</p>}
                                {ot.surgeon && <p className="text-[9px] text-slate-500">{ot.surgeon} • {ot.specialty}</p>}
                                {ot.started && <p className="text-[8px] text-slate-500">Started: {fmtTime(ot.started)} • Est. End: {fmtTime(ot.estEnd)}</p>}
                              </div>
                              {ot.status === 'EMERGENCY_READY' && (
                                <button onClick={async () => {
                                  await postAudit(`Reserved ${ot.name} for emergency`, ot.name);
                                  setActionFeedback(`✅ ${ot.name} reserved for emergency`);
                                  setTimeout(() => setActionFeedback(''), 3000);
                                }} className="text-[8px] font-black bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600">Reserve</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PAGE 7: WORKFORCE COMMAND ══════════════════════════════ */}
              {page === 'workforce' && overview && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black uppercase tracking-wide">Workforce Command</h2>
                    <button onClick={() => setDispatchModal(true)} className="flex items-center gap-1.5 text-[9px] font-black bg-[#0A5BFF] text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all">
                      <Send className="w-3 h-3" /> Deploy Staff
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KpiCard title="Total Staff" value={overview.staffing.totalStaff} color="text-slate-300" icon={Users} />
                    <KpiCard title="On Duty Now" value={overview.staffing.onDuty} color="text-emerald-400" icon={UserCheck} />
                    <KpiCard title="Doctors Present" value={overview.staffing.presentDoctors} color="text-blue-400" icon={Activity} />
                    <KpiCard title="Nurses Present" value={overview.staffing.presentNurses} color="text-purple-400" icon={HeartPulse} />
                  </div>

                  {overview.staffing.shortagesCount > 0 && (
                    <div className={`p-3 rounded-xl border ${severityBg['WARNING']}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <p className="text-xs font-black text-amber-400">Understaffed Units: {overview.staffing.understaffedUnits?.join(', ')}</p>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 ml-6">Recommend deploying available staff from adjoining wards or calling on-call staff.</p>
                      <button onClick={() => setDispatchModal(true)} className="ml-6 mt-2 text-[9px] font-black bg-amber-500 text-black px-3 py-1 rounded-lg hover:bg-amber-400">Deploy to Understaffed Unit</button>
                    </div>
                  )}

                  {/* Staff table */}
                  <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Staff On-Duty Register</h3>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={`text-[9px] uppercase tracking-widest font-black ${isDark ? 'text-slate-500 bg-slate-950/30' : 'text-slate-400 bg-slate-50'}`}>
                          {['Name', 'Role', 'Department', 'Status', 'Current Task', 'Shift', 'Actions'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Dr. Suresh Patil', role: 'Surgeon', dept: 'OT / Surgery', status: 'IN_PROCEDURE', task: 'Knee Replacement — OT 1', shift: '8 AM–4 PM' },
                          { name: 'Sister Varsha Sawant', role: 'Sr. Nurse', dept: 'Emergency', status: 'ON_DUTY', task: 'Triage management', shift: '7 AM–3 PM' },
                          { name: 'Dr. Meena Joshi', role: 'Gynecologist', dept: 'OBGYN / OT', status: 'IN_PROCEDURE', task: 'LSCS Emergency — OT 2', shift: 'Emergency' },
                          { name: 'Dr. Rajiv Nair', role: 'Radiologist', dept: 'Radiology', status: 'ON_DUTY', task: 'CT scan queue review', shift: '9 AM–5 PM' },
                          { name: 'Mr. Prashant Ghule', role: 'Lab Tech', dept: 'Biochemistry Lab', status: 'ON_DUTY', task: 'Analyzer calibration (STAT)', shift: '6 AM–2 PM' },
                          { name: 'Dr. Anita Desai', role: 'Physician', dept: 'General Medicine', status: 'ON_DUTY', task: 'Ward rounds — Floor 3', shift: '8 AM–4 PM' },
                        ].map((s, i) => (
                          <tr key={i} className={`border-t ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50'} transition-all`}>
                            <td className="px-3 py-2.5 font-bold text-[10px]">{s.name}</td>
                            <td className="px-3 py-2.5 text-[9px] text-slate-400">{s.role}</td>
                            <td className="px-3 py-2.5 text-[9px] text-slate-400">{s.dept}</td>
                            <td className="px-3 py-2.5">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${s.status === 'IN_PROCEDURE' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{s.status.replace(/_/g, ' ')}</span>
                            </td>
                            <td className="px-3 py-2.5 text-[9px] text-slate-400 max-w-[180px] truncate">{s.task}</td>
                            <td className="px-3 py-2.5 text-[9px] text-slate-400">{s.shift}</td>
                            <td className="px-3 py-2.5">
                              <button onClick={() => setDispatchModal(true)} className="text-[8px] font-black bg-[#0A5BFF]/20 text-[#0A5BFF] hover:bg-[#0A5BFF] hover:text-white px-2 py-0.5 rounded transition-all">Deploy</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════ PAGE 8: DEPARTMENTS ════════════════════════════════════ */}
              {page === 'departments' && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">Department Operations Control</h2>
                  <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={`text-[9px] uppercase tracking-widest font-black ${isDark ? 'text-slate-500 bg-slate-950/30' : 'text-slate-400 bg-slate-50'}`}>
                            {['Department', 'OPD Load', 'IPD Census', 'Capacity', 'Staff', 'Avg Wait', 'Critical', 'Alerts', 'Occupancy', 'Status'].map(h => (
                              <th key={h} className="px-3 py-2.5 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {departments.map(d => {
                            const pct = d.occupancyPct || Math.round((d.ipdCensus / d.capacity) * 100);
                            return (
                              <tr key={d.id} onClick={() => setSelectedDept(d.name)}
                                className={`border-t cursor-pointer ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50'} transition-all`}>
                                <td className="px-3 py-2.5 font-bold text-[10px]">{d.name}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px]">{d.opdLoad}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px]">{d.ipdCensus}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-slate-400">{d.capacity}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px]">{d.staff}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-amber-400">{d.avgWait}m</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-red-400 font-black">{d.criticalCases}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] text-amber-400">{d.openAlerts}</td>
                                <td className="px-3 py-2.5 w-28"><OccBar pct={pct} /></td>
                                <td className="px-3 py-2.5">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${statusColor[d.status] ? `${statusColor[d.status]} ${d.status === 'CRITICAL' ? 'bg-red-500/20' : d.status === 'HIGH_LOAD' ? 'bg-orange-500/20' : d.status === 'MODERATE' ? 'bg-amber-500/20' : 'bg-emerald-500/20'}` : ''}`}>
                                    {d.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PAGE 9: DIAGNOSTICS ════════════════════════════════════ */}
              {page === 'diagnostics' && diagnostics && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">Diagnostics Command</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Lab */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><FlaskConical className="w-3.5 h-3.5 text-purple-400" /> Laboratory</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { l: 'Orders Today', v: diagnostics.lab.ordersToday, c: 'text-slate-300' },
                          { l: 'Pending', v: diagnostics.lab.pending, c: 'text-amber-400' },
                          { l: 'STAT Pending', v: diagnostics.lab.statPending, c: 'text-red-400' },
                        ].map(k => (
                          <div key={k.l} className={`p-2 rounded-xl ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'} text-center`}>
                            <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
                            <p className="text-[8px] text-slate-500">{k.l}</p>
                          </div>
                        ))}
                      </div>
                      <div className={`p-3 rounded-xl border ${diagnostics.lab.slaBreached ? 'border-red-500/40 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                        <p className="text-[9px] font-black">TAT Compliance</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div>
                            <p className={`text-xl font-black ${diagnostics.lab.slaBreached ? 'text-red-400' : 'text-emerald-400'}`}>{diagnostics.lab.averageTatMin} min</p>
                            <p className="text-[8px] text-slate-400">Current avg TAT</p>
                          </div>
                          <div>
                            <p className="text-xl font-black text-slate-400">{diagnostics.lab.slaTargetMin} min</p>
                            <p className="text-[8px] text-slate-400">SLA target</p>
                          </div>
                          {diagnostics.lab.slaBreached && <span className="text-[8px] font-black text-red-400 bg-red-500/10 px-2 py-1 rounded ml-auto">SLA BREACHED</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analyzer Status</p>
                        {diagnostics.lab.analyzers.map((a: any) => (
                          <div key={a.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-slate-950/40' : 'bg-slate-50'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${a.status === 'ONLINE' ? 'bg-emerald-500' : a.status === 'CALIBRATING' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`} />
                              <span className="text-[9px] font-bold">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-slate-400">Q: {a.queue}</span>
                              <span className={`text-[8px] font-black ${statusColor[a.status] || ''}`}>{a.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Radiology */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Radio className="w-3.5 h-3.5 text-blue-400" /> Radiology</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { l: 'X-Ray Queue', v: diagnostics.radiology.xrayQueue, wait: diagnostics.radiology.avgWaitXray, c: 'text-blue-400' },
                          { l: 'CT Queue', v: diagnostics.radiology.ctQueue, wait: diagnostics.radiology.avgWaitCt, c: 'text-orange-400' },
                          { l: 'MRI Queue', v: diagnostics.radiology.mriQueue, wait: diagnostics.radiology.avgWaitMri, c: 'text-purple-400' },
                          { l: 'USG Queue', v: diagnostics.radiology.usgQueue, wait: '25 min', c: 'text-emerald-400' },
                        ].map(k => (
                          <div key={k.l} className={`p-3 rounded-xl ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                            <p className="text-[9px] text-slate-400">{k.l}</p>
                            <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
                            <p className="text-[8px] text-slate-500">Avg wait: {k.wait}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Machine Status</p>
                        {diagnostics.radiology.machines.map((m: any) => (
                          <div key={m.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-slate-950/40' : 'bg-slate-50'} ${m.status === 'OFFLINE' ? 'border border-red-500/30' : ''}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
                              <span className="text-[9px] font-bold">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-slate-400">Q: {m.queue}</span>
                              <span className={`text-[8px] font-black ${statusColor[m.status] || ''}`}>{m.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PAGE 10: PHARMACY & BLOOD ══════════════════════════════ */}
              {page === 'pharmacy_blood' && pharmacyBlood && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">Pharmacy, Blood & Resource Command</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Pharmacy */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><PillIcon className="w-3.5 h-3.5 text-green-400" /> Pharmacy — Critical Stock</h3>
                      <div className="space-y-2">
                        {pharmacyBlood.pharmacy.criticalStock.map((d: any) => (
                          <div key={d.drug} className={`p-3 rounded-xl border flex items-center justify-between ${d.status === 'CRITICAL' ? 'border-red-500/40 bg-red-500/5' : 'border-amber-400/40 bg-amber-400/5'}`}>
                            <div>
                              <p className="text-[10px] font-black">{d.drug}</p>
                              <p className="text-[8px] text-slate-400">{d.stock.toLocaleString()} {d.unit} remaining • Reorder at {d.reorderLevel.toLocaleString()}</p>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded ${d.status === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-400'}`}>{d.status}</span>
                          </div>
                        ))}
                      </div>
                      {pharmacyBlood.pharmacy.expiryRisk.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Expiry Risk</p>
                          {pharmacyBlood.pharmacy.expiryRisk.map((e: any) => (
                            <div key={e.drug} className={`p-2 rounded-lg flex items-center justify-between ${isDark ? 'bg-amber-900/10' : 'bg-amber-50'} border border-amber-500/20 mb-1`}>
                              <p className="text-[9px] font-bold">{e.drug}</p>
                              <p className="text-[8px] text-amber-400">Exp: {e.expiry} • Qty: {e.quantity}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Blood Bank */}
                    <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Droplet className="w-3.5 h-3.5 text-red-400" /> Blood Bank Inventory</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {pharmacyBlood.bloodBank.inventory.map((b: any) => (
                          <div key={b.group} className={`p-3 rounded-xl border flex items-center justify-between ${b.status === 'CRITICAL' ? 'border-red-500/60 bg-red-500/10' : b.status === 'LOW' ? 'border-amber-400/40 bg-amber-400/5' : isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                            <div>
                              <p className={`text-lg font-black ${b.group.includes('-') ? 'text-red-400' : 'text-slate-200'}`}>{b.group}</p>
                              <p className="text-[8px] text-slate-400">Min: {b.minimum} units</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-black ${b.status === 'CRITICAL' ? 'text-red-400 animate-pulse' : b.status === 'LOW' ? 'text-amber-400' : 'text-emerald-400'}`}>{b.available}</p>
                              <p className="text-[8px] text-slate-500">{b.reserved} reserved</p>
                              <span className={`text-[7px] font-black ${b.status === 'CRITICAL' ? 'bg-red-500 text-white' : b.status === 'LOW' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'} px-1 py-0.5 rounded`}>{b.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={async () => {
                          await postAudit('Requested emergency O-Negative blood from KEM Hospital', 'Blood Bank');
                          setActionFeedback('✅ Emergency blood request sent to KEM Hospital');
                          setTimeout(() => setActionFeedback(''), 4000);
                        }} className="flex-1 text-[9px] font-black bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded-xl transition-all">
                          🩸 Emergency Blood Request
                        </button>
                        <button onClick={() => setPage('inter_hospital')} className="flex-1 text-[9px] font-black bg-slate-700 text-white hover:bg-slate-600 py-2 rounded-xl transition-all">
                          Network Availability
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ PAGE 11: ALERTS ════════════════════════════════════════ */}
              {page === 'alerts' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black uppercase tracking-wide">Centralized Alert Management</h2>
                    <div className="flex gap-2 text-[9px] font-black">
                      <span className="text-red-400">{alerts.filter(a => a.severity === 'CRITICAL').length} CRITICAL</span>
                      <span className="text-orange-400">{alerts.filter(a => a.severity === 'HIGH').length} HIGH</span>
                      <span className="text-emerald-400">{alerts.filter(a => a.status === 'RESOLVED').length} RESOLVED</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {alerts.map(a => (
                      <div key={a.id} className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-lg ${severityBg[a.severity]} ${selectedAlert?.id === a.id ? 'ring-2 ring-[#0A5BFF]' : ''}`} onClick={() => setSelectedAlert(selectedAlert?.id === a.id ? null : a)}>
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${severityDot[a.severity]} ${a.severity === 'CRITICAL' && a.status === 'DETECTED' ? 'animate-ping' : ''}`} />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-black">{a.title}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{a.message}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded ${a.severity === 'CRITICAL' ? 'bg-red-500 text-white' : a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.severity}</span>
                                <span className={`text-[8px] font-black ${statusColor[a.status] || 'text-slate-400'}`}>{a.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-[9px] text-slate-400">
                              <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{a.department} — {a.location}</span>
                              <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{elapsedMins(a.startedAt)} min ago</span>
                              {a.owner && <span className="flex items-center gap-1"><UserCheck className="w-2.5 h-2.5" />{a.owner}</span>}
                              <span className="flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" />Escalation L{a.escalationLevel}</span>
                            </div>
                          </div>
                        </div>

                        {/* Alert actions drawer */}
                        <AnimatePresence>
                          {selectedAlert?.id === a.id && a.status !== 'RESOLVED' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-slate-700/50 flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); acknowledgeAlert(a.id); }}
                                className="text-[9px] font-black bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black px-3 py-1.5 rounded-lg transition-all">
                                ✓ Acknowledge
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); resolveAlert(a.id); }}
                                className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black px-3 py-1.5 rounded-lg transition-all">
                                ✓ Mark Resolved
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDispatchModal(true); }}
                                className="text-[9px] font-black bg-[#0A5BFF]/20 text-[#0A5BFF] hover:bg-[#0A5BFF] hover:text-white px-3 py-1.5 rounded-lg transition-all">
                                Deploy Response Team
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    {alerts.length === 0 && <div className="text-center py-12 text-slate-400">No alerts at this time</div>}
                  </div>
                </div>
              )}

              {/* ════ PAGE 12: INCIDENTS ═════════════════════════════════════ */}
              {page === 'incidents' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black uppercase tracking-wide flex items-center gap-2">
                      Incident & Disaster Command
                      {isMciActive && <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded animate-pulse">MCI ACTIVE</span>}
                    </h2>
                    <button onClick={() => setIncidentModal(true)} className="flex items-center gap-1.5 text-[9px] font-black bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-all">
                      <Plus className="w-3 h-3" /> Create Incident
                    </button>
                  </div>

                  {incidents.map(inc => (
                    <div key={inc.id} className={`rounded-2xl border p-4 space-y-3 ${inc.isMCI ? 'border-red-600/60 bg-red-600/10 animate-pulse' : severityBg[inc.severity]}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${inc.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`} />
                          <div>
                            <p className="text-sm font-black">{inc.title}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{inc.type} • {inc.location}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Commander: {inc.commander} • {elapsedMins(inc.reportedAt)}m ago</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${statusColor[inc.status] || 'text-slate-400'} ${inc.isMCI ? 'bg-red-600 text-white' : 'bg-slate-800'}`}>{inc.isMCI ? '⚠ MCI DECLARED' : inc.status}</span>
                        </div>
                      </div>

                      <div className="flex gap-4 text-[9px] text-slate-400">
                        <span>Teams: {inc.teamsAssigned.join(', ') || 'None'}</span>
                        <span>Resources: {inc.resourcesRequested.join(', ') || 'None'}</span>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-1.5">
                        {inc.updates.map((u, i) => (
                          <div key={i} className="flex items-start gap-2 text-[9px]">
                            <span className="text-slate-500 shrink-0">{fmtTime(u.time)}</span>
                            <span className="text-slate-300">{u.message}</span>
                            <span className="text-slate-500 ml-auto shrink-0">{u.by}</span>
                          </div>
                        ))}
                      </div>

                      {/* MCI Declaration */}
                      {!inc.isMCI && inc.severity === 'CRITICAL' && (
                        <div className={`mt-3 p-3 rounded-xl border border-red-600/40 bg-red-600/5 space-y-2`}>
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Declare Mass Casualty Incident (MCI)</p>
                          <p className="text-[8px] text-slate-400">This action triggers hospital-wide MCI protocols. Type <span className="font-black text-red-400">DECLARE MCI</span> to confirm.</p>
                          <div className="flex gap-2">
                            <input value={mciConfirm} onChange={e => setMciConfirm(e.target.value)} placeholder="Type: DECLARE MCI"
                              className={`flex-1 text-xs px-3 py-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-red-500/30 text-white' : 'bg-white border-red-300 text-slate-900'} outline-none`} />
                            <button onClick={() => declareMCI(inc.id)} className="text-[9px] font-black bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-all">DECLARE</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {incidents.length === 0 && <div className="text-center py-12 text-slate-400">No active incidents</div>}
                </div>
              )}

              {/* ════ PAGE 13: INTER-HOSPITAL ════════════════════════════════ */}
              {page === 'inter_hospital' && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">MCGM Hospital Network — Inter-Hospital Coordination</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interHospital.map(h => (
                      <div key={h.id} className={`rounded-2xl border p-4 space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-black">{h.name}</p>
                            <p className="text-[9px] text-slate-400">{h.distance}</p>
                          </div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded ${statusColor[h.status] || 'text-slate-400'} ${h.status === 'CRITICAL' || h.status === 'HIGH_PRESSURE' ? 'bg-red-500/20' : h.status === 'NORMAL' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>{h.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                            <p className="text-slate-400">ICU Available</p>
                            <p className={`text-lg font-black ${h.icuAvailable > 5 ? 'text-emerald-400' : h.icuAvailable > 2 ? 'text-amber-400' : 'text-red-400'}`}>{h.icuAvailable}</p>
                          </div>
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                            <p className="text-slate-400">ER Capacity</p>
                            <p className="text-lg font-black text-blue-400">{h.emergencyCapacity}%</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {h.specialties.map((s: string) => (
                            <span key={s} className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{s}</span>
                          ))}
                        </div>
                        {h.transferable && (
                          <div className="flex gap-2">
                            <button onClick={async () => {
                              const r = await api('/api/command/inter-hospital/transfer-request', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ toHospital: h.name, patientRef: 'Pending patient', reason: 'ICU capacity', requestedBy: 'Command Officer' })
                              });
                              if (r?.success) {
                                setActionFeedback(`✅ Transfer request sent to ${h.name} (${r.data.id})`);
                                await postAudit(`Sent transfer request to ${h.name}`, h.name);
                              }
                              setTimeout(() => setActionFeedback(''), 4000);
                            }} className="flex-1 text-[9px] font-black bg-[#0A5BFF]/20 text-[#0A5BFF] hover:bg-[#0A5BFF] hover:text-white py-1.5 rounded-lg transition-all">Request Transfer</button>
                            <button className="flex-1 text-[9px] font-black bg-slate-700 text-white hover:bg-slate-600 py-1.5 rounded-lg transition-all">Request Specialist</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════ PAGE 14: AI ANALYTICS ══════════════════════════════════ */}
              {page === 'ai_analytics' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h2 className="text-base font-black uppercase tracking-wide">AI Analytics & Decision Support</h2>
                    <span className="text-[8px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Decision support only — never autonomous action</span>
                  </div>

                  {/* Correlated insights */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400">Cross-Module Correlated Insights</h3>
                    {correlations.map(cor => (
                      <div key={cor.id} className={`rounded-2xl border ${severityBg[cor.severity]} p-4 space-y-3`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-black">{cor.title}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{cor.situation}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded ${cor.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-500/20 text-orange-400'}`}>{cor.severity}</span>
                            <span className="text-[9px] font-black text-purple-400">{cor.confidence}% confidence</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Evidence</p>
                          <div className="grid grid-cols-2 gap-2">
                            {cor.factors.map((f: any, i: number) => (
                              <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-100'} text-[9px]`}>
                                <p className="font-black text-blue-400">{f.module}</p>
                                <p className="text-slate-400 mt-0.5">{f.signal}</p>
                                <p className="text-slate-300 font-bold">{f.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Recommended Actions (require authorization)</p>
                          <div className="space-y-1">
                            {cor.recommendedActions.map((a: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-[9px]">
                                <span className="text-[8px] font-black text-purple-400 w-4 shrink-0">{i + 1}.</span>
                                <span className="text-slate-300">{a}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Predictive insights */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400">Predictive Insights</h3>
                    {[
                      { insight: 'ICU may reach capacity by 4:30 PM today.', reason: '4 incoming trauma patients + 2 delayed step-down transfers', metric: 'Current: 92% | Trend: +2% per hour', confidence: 87, action: 'Initiate step-down review now' },
                      { insight: 'Emergency load likely to rise 25% in next 2 hours.', reason: 'Historical Friday evening surge pattern + local event reported', metric: 'Current 186 arrivals | Forecast: 230+ by 6 PM', confidence: 79, action: 'Pre-call 3 additional emergency nurses' },
                      { insight: 'Discharge delays are driving bed pressure in General Medicine.', reason: '8 patients clinically ready but pending lab results', metric: '8 held beds x avg 2.5 hours = 20 unnecessary bed-hours', confidence: 94, action: 'Expedite pending lab results and discharge approvals' },
                      { insight: 'Biochemistry TAT deteriorating — risk to discharge pipeline.', reason: 'STAT analyzer in calibration mode since 10:42 AM', metric: 'TAT: 48 min (target: 30 min) | +18 min breach', confidence: 91, action: 'Deploy biomedical tech to restore STAT analyzer' },
                    ].map((p, i) => (
                      <div key={i} className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-black">{p.insight}</p>
                            <p className="text-[9px] text-slate-400 mt-1"><strong className="text-slate-300">Why:</strong> {p.reason}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5"><strong className="text-slate-300">Metrics:</strong> {p.metric}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[8px] font-black text-purple-400">{p.confidence}% confidence</span>
                              <span className="text-[9px] text-emerald-400">→ {p.action}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════ PAGE 15: REPORTS ═══════════════════════════════════════ */}
              {page === 'reports' && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">Reports Center</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Daily Hospital Report', desc: 'Complete census, throughput, outcomes', icon: FileText, color: 'text-blue-400' },
                      { name: 'OPD Performance Report', desc: 'OPD load, wait times, SLA compliance', icon: Users, color: 'text-green-400' },
                      { name: 'Emergency & Casualty Report', desc: 'ER census, door-to-doctor, outcomes', icon: Truck, color: 'text-red-400' },
                      { name: 'Bed Occupancy Report', desc: 'Ward-level occupancy, turnaround', icon: Bed, color: 'text-purple-400' },
                      { name: 'ICU Utilization Report', desc: 'ICU census, ventilator days, LOS', icon: HeartPulse, color: 'text-red-400' },
                      { name: 'OT Utilization Report', desc: 'OT utilization, delays, turnaround', icon: Activity, color: 'text-blue-400' },
                      { name: 'Department Performance', desc: 'All department load and quality metrics', icon: BarChart2, color: 'text-indigo-400' },
                      { name: 'Staff Attendance Report', desc: 'Attendance, punctuality, deployment', icon: UserCheck, color: 'text-emerald-400' },
                      { name: 'Diagnostics TAT Report', desc: 'Lab and radiology turnaround times', icon: FlaskConical, color: 'text-purple-400' },
                      { name: 'Pharmacy Stock Report', desc: 'Drug stocks, expiry, consumption', icon: PillIcon, color: 'text-green-400' },
                      { name: 'Blood Bank Report', desc: 'Blood inventory, requests, utilization', icon: Droplet, color: 'text-red-400' },
                      { name: 'Incident Report', desc: 'Incidents, MCI events, root cause', icon: ShieldAlert, color: 'text-orange-400' },
                    ].map(r => {
                      const Icon = r.icon;
                      return (
                        <div key={r.name} className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}><Icon className={`w-4 h-4 ${r.color}`} /></div>
                            <div>
                              <p className="text-xs font-black">{r.name}</p>
                              <p className="text-[8px] text-slate-400 mt-0.5">{r.desc}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {['PDF', 'Excel', 'CSV'].map(fmt => (
                              <button key={fmt} onClick={async () => {
                                await postAudit(`Generated ${r.name} (${fmt})`, r.name);
                                setActionFeedback(`✅ ${r.name} export started as ${fmt}`);
                                setTimeout(() => setActionFeedback(''), 3000);
                              }} className={`flex-1 text-[8px] font-black py-1.5 rounded-lg border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'border-slate-300 text-slate-500 hover:bg-slate-200'}`}>
                                {fmt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ════ PAGE 16: GOVERNANCE & AUDIT ════════════════════════════ */}
              {page === 'governance' && (
                <div className="space-y-5">
                  <h2 className="text-base font-black uppercase tracking-wide">Settings, Audit & Governance</h2>

                  {/* Alert Thresholds */}
                  <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 space-y-3`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alert Thresholds (Read-Only Preview)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: 'ICU Occupancy Warning', value: '85%', editable: true },
                        { label: 'ICU Occupancy Critical', value: '95%', editable: true },
                        { label: 'O-Neg Blood Critical', value: '4 units', editable: true },
                        { label: 'Emergency Wait Warning', value: '20 min', editable: true },
                        { label: 'Lab TAT Critical', value: '60 min', editable: true },
                        { label: 'Escalation Timer L1→L2', value: '5 min', editable: true },
                        { label: 'Escalation Timer L2→L3', value: '10 min', editable: true },
                        { label: 'MCI Trigger Threshold', value: '10+ casualties', editable: true },
                        { label: 'Session Timeout', value: '15 min', editable: false },
                      ].map(t => (
                        <div key={t.label} className={`p-3 rounded-xl ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                          <p className="text-[8px] text-slate-400">{t.label}</p>
                          <p className="text-sm font-black text-slate-200 mt-0.5">{t.value}</p>
                          {t.editable && <p className="text-[7px] text-slate-600 mt-0.5">Configurable — requires Admin role</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Log */}
                  <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-slate-400" /> Tamper-Proof Audit Log</h3>
                      <span className="text-[8px] text-slate-500">{auditLog.length} entries</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={`text-[9px] uppercase tracking-widest font-black ${isDark ? 'text-slate-500 bg-slate-950/30' : 'text-slate-400 bg-slate-50'}`}>
                            {['Timestamp', 'User', 'Role', 'Action', 'Target'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {auditLog.map(entry => (
                            <tr key={entry.id} className={`border-t ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50'} transition-all`}>
                              <td className="px-3 py-2 font-mono text-[9px] text-slate-400">{new Date(entry.timestamp).toLocaleTimeString('en-IN')}</td>
                              <td className="px-3 py-2 font-bold text-[10px]">{entry.user}</td>
                              <td className="px-3 py-2 text-[9px] text-blue-400">{entry.role}</td>
                              <td className="px-3 py-2 text-[9px] text-slate-300">{entry.action}</td>
                              <td className="px-3 py-2 text-[9px] text-slate-400">{entry.target}</td>
                            </tr>
                          ))}
                          {auditLog.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-xs">No audit entries yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RBAC Info */}
                  <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Role-Based Access Control (RBAC)</h3>
                    <div className="space-y-2">
                      {[
                        { role: 'Dean', permissions: 'Full access. MCI declaration. Budget approvals. Cross-hospital governance.' },
                        { role: 'Medical Superintendent', permissions: 'Full clinical + admin access. Cannot declare MCI solo.' },
                        { role: 'Command Officer', permissions: 'Operational actions: deploy staff, reserve beds, acknowledge alerts, create incidents.' },
                        { role: 'Emergency Head', permissions: 'Emergency command, ambulance dispatch, triage override.' },
                        { role: 'Department Head', permissions: 'Own department: staff, beds, alerts, OPD/IPD control.' },
                        { role: 'Admin Staff', permissions: 'Read-only overview, patient flow, reports. No command actions.' },
                      ].map(r => (
                        <div key={r.role} className={`flex items-start gap-3 p-2.5 rounded-xl ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                          <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black text-blue-400">{r.role}</span>
                            <p className="text-[9px] text-slate-400 mt-0.5">{r.permissions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}

      {/* Reserve Bed Modal */}
      <AnimatePresence>
        {reserveBedModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setReserveBedModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl border w-full max-w-md p-5 space-y-4 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black">Reserve Hospital Bed</h3>
                <button onClick={() => setReserveBedModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase">Ward</label>
                  <select value={reserveBedWard} onChange={e => setReserveBedWard(e.target.value)}
                    className={`mt-1 w-full text-xs px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} outline-none`}>
                    <option value="">Select ward…</option>
                    {beds?.wards?.filter((w: BedWard) => w.available > 0).map((w: BedWard) => (
                      <option key={w.ward} value={w.ward}>{w.ward} ({w.available} available)</option>
                    ))}
                  </select>
                </div>
                <div className={`p-3 rounded-xl text-[9px] ${isDark ? 'bg-slate-800' : 'bg-slate-100'} text-slate-400`}>
                  <p className="font-black text-amber-400 mb-1">⚠ Clinical authorization required</p>
                  This reservation will be logged in the audit trail and requires clinical sign-off before patient assignment.
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setReserveBedModal(false)} className="flex-1 text-[9px] font-black py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800">Cancel</button>
                <button onClick={reserveBed} className="flex-1 text-[9px] font-black bg-[#0A5BFF] text-white py-2 rounded-xl hover:bg-blue-600">Confirm Reserve</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deploy Staff Modal */}
      <AnimatePresence>
        {dispatchModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDispatchModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl border w-full max-w-md p-5 space-y-4 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2"><Send className="w-4 h-4 text-[#0A5BFF]" /> Deploy Staff</h3>
                <button onClick={() => setDispatchModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase">Staff Member</label>
                  <select className={`mt-1 w-full text-xs px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} outline-none`}>
                    <option>Sister Varsha Sawant (Available)</option>
                    <option>Dr. Anita Desai (Ward rounds)</option>
                    <option>Mr. Prashant Ghule (Lab)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase">Destination</label>
                  <input value={dispatchTarget} onChange={e => setDispatchTarget(e.target.value)} placeholder="E.g. Emergency Bay 2, Ward 7, OT 3"
                    className={`mt-1 w-full text-xs px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} outline-none`} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase">Task Description</label>
                  <textarea rows={2} placeholder="E.g. Report to Emergency Bay 2 for incoming trauma patient support"
                    className={`mt-1 w-full text-xs px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} outline-none resize-none`} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDispatchModal(false)} className="flex-1 text-[9px] font-black py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800">Cancel</button>
                <button onClick={async () => {
                  await postAudit(`Deployed staff to ${dispatchTarget}`, dispatchTarget);
                  setActionFeedback(`✅ Staff deployment command sent to ${dispatchTarget || 'destination'}`);
                  setDispatchModal(false);
                  setTimeout(() => setActionFeedback(''), 4000);
                }} className="flex-1 text-[9px] font-black bg-[#0A5BFF] text-white py-2 rounded-xl hover:bg-blue-600">Send Deployment</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Incident Modal */}
      <AnimatePresence>
        {incidentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIncidentModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl border w-full max-w-md p-5 space-y-4 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-400" /> Create Incident</h3>
                <button onClick={() => setIncidentModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Incident Type', type: 'select', opts: ['MASS_CASUALTY', 'FIRE', 'POWER_FAILURE', 'OXYGEN_FAILURE', 'DISEASE_OUTBREAK', 'VIOLENCE', 'IT_OUTAGE', 'INFRASTRUCTURE'] },
                  { label: 'Severity', type: 'select', opts: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                  { label: 'Title', type: 'text', placeholder: 'Brief incident description' },
                  { label: 'Location', type: 'text', placeholder: 'Specific location in hospital' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[9px] font-black text-slate-400 uppercase">{f.label}</label>
                    {f.type === 'select' ? (
                      <select className={`mt-1 w-full text-xs px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} outline-none`}>
                        {f.opts!.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type="text" placeholder={f.placeholder} className={`mt-1 w-full text-xs px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} outline-none`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIncidentModal(false)} className="flex-1 text-[9px] font-black py-2 rounded-xl border border-slate-700 text-slate-400">Cancel</button>
                <button onClick={async () => {
                  const r = await api('/api/command/incidents', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'GENERAL', severity: 'HIGH', title: 'New Incident', location: 'Hospital', commander: 'Command Officer' })
                  });
                  if (r?.success) {
                    setActionFeedback(`✅ Incident ${r.data.id} created`);
                    await postAudit('Created incident', r.data.id);
                    await loadAll();
                  }
                  setIncidentModal(false);
                  setTimeout(() => setActionFeedback(''), 4000);
                }} className="flex-1 text-[9px] font-black bg-red-500 text-white py-2 rounded-xl hover:bg-red-600">Create Incident</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
