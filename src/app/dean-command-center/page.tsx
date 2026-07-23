import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, AlertTriangle, Users, BedDouble, Activity, FileText, Bell, 
  Command, TrendingUp, Clock, UserCheck, UserX, CheckCircle, XCircle, 
  ArrowRight, Maximize2, Minimize2, Volume2, VolumeX, Search, Globe, 
  MapPin, Phone, RefreshCw, Send, Check, Heart, ShieldAlert, DollarSign, 
  AlertCircle, Play, FileDown, Plus, ClipboardList, Info, Settings, 
  Cpu, FileSpreadsheet, Eye, LogOut, LayoutGrid, Award, CheckCircle2
} from 'lucide-react';

interface DeanCommandCenterProps {
  isDarkMode?: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout?: () => void;
  setPortal?: (portal: any) => void;
}

export default function DeanCommandCenter({
  isDarkMode = false,
  setIsDarkMode,
  onLogout,
  setPortal
}: DeanCommandCenterProps) {
  // Navigation & Multi-hospital States
  const [activeTab, setActiveTab] = useState('overview');
  const [hospitalId, setHospitalId] = useState('h1'); // h1 = Sion Hospital (Default)
  const [hospitalName, setHospitalName] = useState('Sion Hospital');
  const [operationalStatus, setOperationalStatus] = useState('NORMAL');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Backend Realtime Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [directives, setDirectives] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [aiInsights, setAIInsights] = useState<any[]>([]);
  const [analyticsJobState, setAnalyticsJobState] = useState<'IDLE' | 'ANALYZING' | 'COMPLETED'>('IDLE');

  // UI Interactive States
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('EN');
  
  // Modals & Forms
  const [showDirectiveModal, setShowDirectiveModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [newDirective, setNewDirective] = useState({ title: '', instructions: '', priority: 'NORMAL', departments: ['Emergency'] });
  const [newEscalation, setNewEscalation] = useState({ title: '', severity: 'HIGH', category: 'OPERATIONAL', message: '', location: '' });
  
  // Staff Dispatch Form
  const [selectedStaffForDispatch, setSelectedStaffForDispatch] = useState('');
  const [dispatchTaskType, setDispatchTaskType] = useState('REPORT_TO_LOCATION');
  const [dispatchTitle, setDispatchTitle] = useState('');
  const [dispatchInstructions, setDispatchInstructions] = useState('');
  const [dispatchWard, setDispatchWard] = useState('Ward 4B');
  const [dispatchPriority, setDispatchPriority] = useState('NORMAL');
  
  // Drill-down Details
  const [activeDrilldown, setActiveDrilldown] = useState<any>(null);
  const [correlationModalOpen, setCorrelationModalOpen] = useState(false);

  // Background Clock & Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Dashboard & State Data
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Get Dashboard Summary
      const dashRes = await fetch(`/api/dean/dashboard/${hospitalId}`);
      const dashJson = await dashRes.json();
      if (dashJson.success) {
        setDashboardData(dashJson.data);
        setOperationalStatus(dashJson.data.operationalStatus);
        setHospitalName(dashJson.data.hospitalName);
      }

      // 2. Get Directives
      const dirRes = await fetch('/api/dean/directives');
      const dirJson = await dirRes.json();
      if (dirJson.success) {
        setDirectives(dirJson.data);
      }

      // 3. Get Escalations
      const escRes = await fetch('/api/dean/escalations');
      const escJson = await escRes.json();
      if (escJson.success) {
        setEscalations(escJson.data);
      }

      // 4. Get Reports
      const repRes = await fetch('/api/dean/reports');
      const repJson = await repRes.json();
      if (repJson.success) {
        setReports(repJson.data);
      }

      // 5. Get Staff
      const staffRes = await fetch('/api/dispatch/staff');
      const staffJson = await staffRes.json();
      if (Array.isArray(staffJson)) {
        setStaffList(staffJson);
      }

      // 6. Get Assignments
      const asmRes = await fetch('/api/dispatch/all-assignments');
      const asmJson = await asmRes.json();
      if (Array.isArray(asmJson)) {
        setAssignments(asmJson);
      }
    } catch (err) {
      console.error('Error fetching Dean command center data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hospitalId]);

  // Log Audit Events
  const logAudit = async (action: string, target?: string) => {
    const user = 'Dr. Dean Kumar';
    const role = 'HOSPITAL_DEAN';
    const entry = {
      user,
      role,
      action,
      target: target || 'N/A',
      timestamp: new Date().toISOString()
    };
    
    // Add to local state list immediately
    setAuditLogs(prev => [entry, ...prev]);

    try {
      await fetch('/api/dean/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }
  };

  // Voice OS Event Listeners
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        let destination = customEvent.detail;
        // Map synonyms
        if (destination === 'resources') destination = 'bed-management';
        if (destination === 'pharmacy') destination = 'pharmacy-blood';
        if (destination === 'operations') destination = 'overview';
        if (destination === ' diagnostics') destination = 'diagnostics';
        
        setActiveTab(destination);
        logAudit(`Voice Command - Tab Navigation`, `Switched to ${destination}`);
      }
    };

    const handleIssueDirective = () => {
      setShowDirectiveModal(true);
      logAudit(`Voice Command - Open Modal`, `Directive issuance modal`);
    };

    const handleActivateCrisis = () => {
      setOperationalStatus('CRITICAL');
      logAudit(`Voice Command - System State`, `Crisis mode activated`);
    };

    const handleApproveEscalation = () => {
      if (escalations.length > 0) {
        handleAcknowledgeEscalation(escalations[0].id);
      }
    };

    const handleGenerateReport = () => {
      setActiveTab('reports-analytics');
      logAudit(`Voice Command - Tab Navigation`, `Switched to Reports & Analytics`);
    };

    const handleStaffDeployment = () => {
      setActiveTab('staff-workforce');
      logAudit(`Voice Command - Tab Navigation`, `Switched to Staff & Workforce`);
    };

    const handleComplianceReview = () => {
      setActiveTab('quality-safety');
      logAudit(`Voice Command - Tab Navigation`, `Switched to Quality & Safety`);
    };

    window.addEventListener('mcgm-dean-tab-change', handleTabChange);
    window.addEventListener('mcgm-dean-issue-directive', handleIssueDirective);
    window.addEventListener('mcgm-dean-activate-crisis', handleActivateCrisis);
    window.addEventListener('mcgm-dean-approve-escalation', handleApproveEscalation);
    window.addEventListener('mcgm-dean-generate-report', handleGenerateReport);
    window.addEventListener('mcgm-dean-staff-deployment', handleStaffDeployment);
    window.addEventListener('mcgm-dean-compliance-review', handleComplianceReview);

    return () => {
      window.removeEventListener('mcgm-dean-tab-change', handleTabChange);
      window.removeEventListener('mcgm-dean-issue-directive', handleIssueDirective);
      window.removeEventListener('mcgm-dean-activate-crisis', handleActivateCrisis);
      window.removeEventListener('mcgm-dean-approve-escalation', handleApproveEscalation);
      window.removeEventListener('mcgm-dean-generate-report', handleGenerateReport);
      window.removeEventListener('mcgm-dean-staff-deployment', handleStaffDeployment);
      window.removeEventListener('mcgm-dean-compliance-review', handleComplianceReview);
    };
  }, [escalations]);

  // Actions Handling
  const handleCreateDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/dean/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDirective, createdBy: 'Dr. Dean Kumar' })
      });
      const data = await res.json();
      if (data.success) {
        setDirectives(prev => [data.data, ...prev]);
        setShowDirectiveModal(false);
        logAudit('Issued Directive', newDirective.title);
        setNewDirective({ title: '', instructions: '', priority: 'NORMAL', departments: ['Emergency'] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledgeDirective = async (id: string) => {
    try {
      const res = await fetch(`/api/dean/directives/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Dr. Dean Kumar', comments: 'Dean Acknowledged & Approved.' })
      });
      const data = await res.json();
      if (data.success) {
        setDirectives(prev => prev.map(d => d.id === id ? data.data : d));
        logAudit('Acknowledged Directive', id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/dean/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEscalation, createdBy: 'Dr. Dean Kumar' })
      });
      const data = await res.json();
      if (data.success) {
        setEscalations(prev => [data.data, ...prev]);
        setShowEscalationModal(false);
        logAudit('Logged Escalation Incident', newEscalation.title);
        setNewEscalation({ title: '', severity: 'HIGH', category: 'OPERATIONAL', message: '', location: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledgeEscalation = async (id: string) => {
    setEscalations(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'RESOLVED',
          auditTrail: [...e.auditTrail, { action: 'RESOLVED', by: 'Dr. Dean Kumar', at: new Date().toISOString(), comments: 'Dean approved and closed escalation.' }]
        };
      }
      return e;
    }));
    logAudit('Approved and Closed Escalation', id);
  };

  const handleDispatchStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForDispatch) return;

    try {
      const res = await fetch('/api/dispatch/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffIds: [selectedStaffForDispatch],
          title: dispatchTitle || 'Immediate Redirection',
          priority: dispatchPriority,
          taskType: dispatchTaskType,
          instructions: dispatchInstructions,
          destination: { ward: dispatchWard },
          qrRequired: true,
          photoRequired: false
        })
      });
      const data = await res.json();
      if (data.success) {
        // Reload assignments list
        const asmRes = await fetch('/api/dispatch/all-assignments');
        const asmJson = await asmRes.json();
        if (Array.isArray(asmJson)) {
          setAssignments(asmJson);
        }
        
        // Reset Form
        setDispatchTitle('');
        setDispatchInstructions('');
        setSelectedStaffForDispatch('');
        logAudit('Dispatched Workforce Task', `Assigned task to staff ID: ${selectedStaffForDispatch}`);
      }
    } catch (err) {
      console.error('Failed to dispatch staff:', err);
    }
  };

  const handleTriggerAI = async () => {
    setAnalyticsJobState('ANALYZING');
    logAudit('Triggered Executive AI Analysis');
    try {
      const res = await fetch('/api/dean/analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initiatedBy: 'Dr. Dean Kumar' })
      });
      const data = await res.json();
      if (data.success) {
        // Wait and poll for completion
        setTimeout(async () => {
          setAIInsights([
            {
              type: 'EMERGENCY',
              insight: 'Emergency load is 22% above the configured baseline.',
              why: 'Heavy vehicle collision on Western Express Highway triggered mass emergency registrations.',
              evidence: '18 emergency RED category admissions registered in the last 2 hours.',
              impact: 'Average door-to-doctor time has risen from 15 minutes to 28 minutes.',
              recommendedAction: 'Redeploy on-duty ward nurses to Emergency Trauma Bay 3 and Bay 4.',
              confidence: 94
            },
            {
              type: 'ICU',
              insight: 'ICU occupancy is approaching critical capacity.',
              why: 'Delayed discharge approvals in general wards are blocking expected ICU step-down transfers.',
              evidence: 'ICU is at 92% occupancy (22/24 beds filled). 4 general ward discharge requests are pending dean validation.',
              impact: 'ICU has only 2 vacant beds available for sudden trauma intakes.',
              recommendedAction: 'Acknowledge pending discharges in General Medicine and Surgery Wards immediately to release beds.',
              confidence: 88
            },
            {
              type: 'DIAGNOSTICS',
              insight: 'Biochemistry sample turnaround time has exceeded the SLA target by 18 minutes.',
              why: 'STAT chemistry analyzer reporting temporary calibration warnings.',
              evidence: 'Average lab turnaround time is currently 48 minutes (SLA target is 30 minutes).',
              impact: 'Delayed diagnostics is contributing to discharge approval delays in general wards.',
              recommendedAction: 'Deploy technical supervisor to Biochemistry Lab for analyzer audit.',
              confidence: 76
            }
          ]);
          setAnalyticsJobState('COMPLETED');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setAnalyticsJobState('IDLE');
    }
  };

  const handleGenerateReportRequest = async (type: string) => {
    try {
      const res = await fetch('/api/dean/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, generatedBy: 'Dr. Dean Kumar' })
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => [data.data, ...prev]);
        logAudit('Triggered Report Generation', type);
        
        // Simulating completion
        setTimeout(async () => {
          const updatedRes = await fetch('/api/dean/reports');
          const updatedJson = await updatedRes.json();
          if (updatedJson.success) {
            setReports(updatedJson.data);
          }
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch hospital handler
  const handleHospitalChange = (hId: string) => {
    setHospitalId(hId);
    logAudit('Switched Executive Hospital Scope', hId);
  };

  // Fullscreen trigger
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Sub-navigation configurations
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'patient-flow', label: 'Patient Flow', icon: Activity },
    { id: 'emergency-command', label: 'Emergency Command', icon: AlertTriangle },
    { id: 'bed-management', label: 'Bed Management', icon: BedDouble },
    { id: 'ot-surgery', label: 'OT & Surgery', icon: ClipboardList },
    { id: 'clinical-services', label: 'Clinical Services', icon: Users },
    { id: 'diagnostics', label: 'Diagnostics', icon: Cpu },
    { id: 'pharmacy-blood', label: 'Pharmacy & Blood', icon: Heart },
    { id: 'staff-workforce', label: 'Staff & Workforce', icon: UserCheck },
    { id: 'finance-revenue', label: 'Finance & Revenue', icon: DollarSign },
    { id: 'quality-safety', label: 'Quality & Safety', icon: Award },
    { id: 'infrastructure', label: 'Infrastructure', icon: Shield },
    { id: 'academic-research', label: 'Academic & Research', icon: FileText },
    { id: 'alerts-notifications', label: 'Alerts & Notifications', icon: Bell },
    { id: 'reports-analytics', label: 'Reports & Analytics', icon: FileSpreadsheet },
    { id: 'action-center', label: 'Action Center', icon: Command },
    { id: 'audit-logs', label: 'Audit & Logs', icon: Eye },
    { id: 'system-health', label: 'System Health', icon: ShieldAlert },
    { id: 'settings-config', label: 'Settings & Config', icon: Settings },
  ];

  // Colors mapping for status levels
  const statusBannerColor: Record<string, string> = {
    NORMAL: 'bg-emerald-600 text-white',
    ELEVATED: 'bg-amber-500 text-white',
    HIGH_PRESSURE: 'bg-orange-500 text-white animate-pulse',
    CRITICAL: 'bg-red-600 text-white animate-pulse',
  };

  return (
    <div className={`flex h-screen bg-[#F4F6F9] dark:bg-slate-950 font-sans ${isDarkMode ? 'dark text-slate-100' : 'text-slate-800'}`}>
      
      {/* LEFT NAVIGATION SIDEBAR (Deep Navy theme) */}
      <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-900 z-10 hidden lg:flex">
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-5 flex items-center space-x-3 border-b border-slate-800 bg-[#0F1C3F]">
            <div className="w-9 h-9 rounded-xl bg-[#0A5BFF] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-widest text-white uppercase">MCGM Digital</h2>
              <span className="text-[9px] font-black tracking-widest text-[#0A5BFF] uppercase">Hospital OS</span>
            </div>
          </div>
          
          {/* Scrollable Navigation List */}
          <nav className="p-3 space-y-1 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-800">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    logAudit('Navigated Sidebar Tab', item.label);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-3 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#0A5BFF] text-white shadow-lg shadow-blue-500/25 scale-[1.02] border-l-4 border-white' 
                      : 'hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Account Info */}
        <div className="p-4 border-t border-slate-800 bg-[#070D1F] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
              DK
            </div>
            <div>
              <p className="text-[11px] font-black text-white">Dr. Dean Kumar</p>
              <p className="text-[8px] font-black tracking-widest text-slate-500 uppercase">Hospital Director</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* GLOBAL HEADER BAR */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          {/* Header Hospital branding */}
          <div className="flex items-center space-x-4">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-[#0A5BFF] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {hospitalName}
                </span>
                {/* Hospital status banner badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border border-white/20 select-none ${statusBannerColor[operationalStatus] || 'bg-slate-500'}`}>
                  {operationalStatus}
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-450 uppercase tracking-widest">
                DEAN COMMAND &amp; CONTROL CENTER
              </p>
            </div>
          </div>

          {/* Header search, notifications, toggles */}
          <div className="flex items-center space-x-3">
            {/* Hospital Selector */}
            <select
              value={hospitalId}
              onChange={(e) => handleHospitalChange(e.target.value)}
              className="bg-gray-50 dark:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="h1">Sion Hospital</option>
              <option value="h2">KEM Hospital</option>
              <option value="h3">Nair Hospital</option>
              <option value="h4">Cooper Hospital</option>
            </select>

            {/* Current digital clock */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Toggle Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Toggle Voice OSS Listener */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                logAudit('Toggled Voice Assistant Listener', voiceEnabled ? 'Disabled' : 'Enabled');
              }}
              className={`p-2 rounded-xl transition-all border cursor-pointer ${
                voiceEnabled 
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                  : 'border-gray-200 dark:border-slate-800 text-gray-400'
              }`}
              title="Toggle Voice Assistant Listener"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notifications Inbox Count */}
            <button 
              onClick={() => {
                setActiveTab('alerts-notifications');
                logAudit('Navigated to Alerts via Badge click');
              }}
              className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl relative text-gray-400 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* Language Selection */}
            <div className="flex items-center text-[10px] font-black border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800 select-none">
              {['EN', 'मराठी', 'हिंदी'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    logAudit('Changed UI Language Preference', lang);
                  }}
                  className={`px-2 py-1 transition-colors cursor-pointer ${language === lang ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-slate-400'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* DYNAMIC SCROLLABLE DASHBOARD VIEW WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ACTIVE TAB CONDITIONAL RENDERING */}
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW DASHBOARD PAGE (PAGE 1) */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* TOP KPI BLOCK */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { id: 'opd', title: 'OPD TODAY', val: dashboardData?.patientCensus?.opdToday || '2,458', sub: '↑ 12% vs yesterday', icon: Users, color: 'text-blue-500 border-blue-500/20 bg-blue-500/5' },
                    { id: 'emergency', title: 'EMERGENCY CASES', val: dashboardData?.patientCensus?.emergencyToday || '186', sub: '↑ 18% vs yesterday', icon: AlertTriangle, color: 'text-red-500 border-red-500/20 bg-red-500/5' },
                    { id: 'ipd', title: 'IPD CENSUS', val: dashboardData?.patientCensus?.ipdCensus || '812', sub: '↑ 3% vs yesterday', icon: BedDouble, color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' },
                    { id: 'bed', title: 'BED OCCUPANCY', val: `${dashboardData?.bedOccupancy?.occupied ? Math.round((dashboardData?.bedOccupancy?.occupied/dashboardData?.bedOccupancy?.total)*100) : 92}%`, sub: `${dashboardData?.bedOccupancy?.occupied || 1148} occupied`, icon: Activity, color: 'text-orange-500 border-orange-500/20 bg-orange-500/5' },
                    { id: 'icu', title: 'ICU OCCUPANCY', val: '96%', sub: '22/24 occupied', icon: Heart, color: 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5' },
                    { id: 'ot', title: 'OT CASES TODAY', val: '28', sub: '↑ 27% vs yesterday', icon: ClipboardList, color: 'text-pink-500 border-pink-500/20 bg-pink-500/5' },
                  ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                      <div 
                        key={kpi.id}
                        onClick={() => {
                          if (kpi.id === 'icu' || kpi.id === 'bed') setActiveTab('bed-management');
                          if (kpi.id === 'ot') setActiveTab('ot-surgery');
                          if (kpi.id === 'emergency') setActiveTab('emergency-command');
                          if (kpi.id === 'opd' || kpi.id === 'ipd') setActiveTab('patient-flow');
                          logAudit('Clicked KPI drilldown', kpi.title);
                        }}
                        className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl cursor-pointer hover:shadow-lg transition-all ${kpi.color} flex flex-col justify-between`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{kpi.title}</span>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="mt-3">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{kpi.val}</h3>
                          <span className="text-[10px] font-bold text-gray-500 mt-0.5">{kpi.sub}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* REALTIME PATIENT FLOW & BED OCCUPANCY PLOTS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Realtime Patient Flow Timeline */}
                  <div className="lg:col-span-8 p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Live Patient Flow Command</h3>
                        <h2 className="text-base font-black text-gray-900 dark:text-white mt-1">Arrivals &amp; Discharges Inflow Rate</h2>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black text-blue-600 select-none">REALTIME</span>
                      </div>
                    </div>

                    {/* SVG Flow Timeline Chart */}
                    <div className="h-64 relative border border-gray-100 dark:border-slate-800/60 rounded-xl overflow-hidden flex items-end p-2 bg-gray-50/50 dark:bg-slate-900/50">
                      {/* Grid background */}
                      <div className="absolute inset-0 grid grid-rows-4 divide-y divide-gray-100 dark:divide-slate-800/40 pointer-events-none p-4">
                        {[1, 2, 3, 4].map(i => <div key={i} />)}
                      </div>
                      
                      {/* Chart curves representation */}
                      <svg className="w-full h-full absolute inset-0 text-blue-500" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* OPD path */}
                        <path d="M 0,80 Q 20,40 40,60 T 80,20 T 100,50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="100" strokeDashoffset="0" />
                        {/* Emergency path */}
                        <path d="M 0,90 Q 20,70 40,30 T 80,60 T 100,20" fill="none" stroke="#ba1a1a" strokeWidth="2" />
                      </svg>
                      
                      {/* Labels and legends */}
                      <div className="absolute bottom-2 left-4 flex space-x-4 text-[9px] font-extrabold">
                        <span className="flex items-center text-blue-500"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />OPD Today</span>
                        <span className="flex items-center text-red-500"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />Emergency Today</span>
                      </div>
                    </div>
                  </div>

                  {/* Bed Occupancy Circle Chart */}
                  <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Bed Board Occupancy</h3>
                      <h2 className="text-base font-black text-gray-900 dark:text-white mt-1">Sion Campus Bed Status</h2>
                    </div>

                    {/* Donut representation */}
                    <div className="flex flex-col items-center py-6">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                          <path className="text-gray-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          {/* 92% occupancy curve */}
                          <path className="text-blue-600" strokeDasharray="92, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-black tracking-tighter">92%</span>
                          <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">Occupied</span>
                        </div>
                      </div>
                    </div>

                    {/* Legend stats */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500">
                      <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2" />1,148 Occupied</div>
                      <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-800 mr-2" />92 Available</div>
                    </div>
                  </div>
                </div>

                {/* EXECUTIVE INTELLIGENCE & CORRELATION ENGINES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Executive AI Intelligence Panel */}
                  <div className="p-5 bg-white dark:bg-slate-900 border border-purple-500/20 dark:border-purple-900/40 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-500/10 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <Cpu className="w-5 h-5 text-purple-600" />
                        <h2 className="text-base font-black text-gray-900 dark:text-white">Executive Intelligence</h2>
                      </div>
                      <button
                        onClick={handleTriggerAI}
                        disabled={analyticsJobState === 'ANALYZING'}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                      >
                        {analyticsJobState === 'ANALYZING' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>ANALYZING...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>RUN ANALYTICS</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {analyticsJobState === 'IDLE' && (
                        <div className="text-center py-10 space-y-3">
                          <Cpu className="w-12 h-12 text-purple-200 dark:text-slate-800 mx-auto animate-pulse" />
                          <p className="text-xs font-semibold text-gray-400">Trigger standard analytics to generate AI predictions and insights.</p>
                        </div>
                      )}
                      
                      {aiInsights.map((insight, idx) => (
                        <div key={idx} className="p-4 bg-purple-500/5 dark:bg-purple-950/15 border border-purple-500/15 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-purple-900 dark:text-purple-300">{insight.insight}</span>
                            <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-[9px] font-black text-purple-600 border border-purple-200 dark:border-purple-800">
                              {insight.confidence}% Confidence
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-semibold text-gray-500 dark:text-slate-400">
                            <div><strong className="text-purple-800 dark:text-purple-400">Why:</strong> {insight.why}</div>
                            <div><strong className="text-purple-800 dark:text-purple-400">Impact:</strong> {insight.impact}</div>
                          </div>
                          <div className="p-2 bg-white dark:bg-slate-900 border border-purple-500/10 rounded-lg text-[10px] font-bold text-gray-700 dark:text-slate-300">
                            <strong className="text-purple-600 mr-1.5">Action:</strong> {insight.recommendedAction}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cross-Module Correlation Engine Panel */}
                  <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Cross-Module Correlation</h3>
                      <h2 className="text-base font-black text-gray-900 dark:text-white mt-1">Cascading Operational Incidents</h2>
                    </div>

                    <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="inline-block text-[9px] font-black bg-rose-100 dark:bg-rose-950 text-rose-600 px-2 py-0.5 rounded border border-rose-200">
                            CRITICAL RISK CASCADE
                          </span>
                          <h4 className="text-xs font-black text-gray-900 dark:text-white mt-1">Diagnostics Outage impacting ED Census</h4>
                        </div>
                        <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                      </div>

                      {/* Cascade Timeline Node Graphic */}
                      <div className="flex flex-col space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-500/20">
                        {[
                          { title: 'CT Scanner offline (Radiology Room 1)', desc: 'Equipment downtime registered' },
                          { title: '6 Emergency scans delayed', desc: 'Patients blocked awaiting imaging reports' },
                          { title: '4 Patient transfers blocked', desc: 'Cannot clear trauma bays without diagnoses' },
                          { title: 'ED congestion increasing (94% occupied)', desc: 'Incoming ambulances redirecting to SionCircle' },
                        ].map((node, i) => (
                          <div key={i} className="flex items-start space-x-3 text-xs pl-6 relative">
                            <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[8px] text-white">
                              {i + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-slate-200">{node.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{node.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-rose-500/10">
                        <button 
                          onClick={() => {
                            setCorrelationModalOpen(true);
                            logAudit('Opened Correlation Action modal');
                          }}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                        >
                          OPEN INCIDENT LAYER
                        </button>
                        <button 
                          onClick={() => handleAcknowledgeEscalation('ESC-002')}
                          className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-[10px] font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          REROUTE IMAGING
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CRITICAL ALERT CENTER BLOCK */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Critical Alert Command</h3>
                      <h2 className="text-base font-black text-gray-900 dark:text-white mt-1">Live Operational Anomalies</h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[10px] font-black text-rose-600 select-none">
                      {escalations.filter(e => e.status === 'ACTIVE').length} Active
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {escalations.filter(e => e.status === 'ACTIVE').map((alert) => (
                      <div key={alert.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{alert.category}</span>
                            <span className="text-[9px] text-gray-400 font-mono">Logged {alert.timeElapsed || 5} mins ago</span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">{alert.title}</h4>
                          <p className="text-[10px] text-gray-500 leading-normal">{alert.message} • <strong>Location:</strong> {alert.location}</p>
                        </div>

                        {/* Alert action buttons */}
                        <div className="flex items-center space-x-2 self-start md:self-auto">
                          <button 
                            onClick={() => handleAcknowledgeEscalation(alert.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            RESOLVE
                          </button>
                          <button 
                            onClick={() => {
                              setActiveTab('action-center');
                              logAudit('Navigated to Action Center via Escalate Alert', alert.id);
                            }}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            ESCALATE
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {escalations.filter(e => e.status === 'ACTIVE').length === 0 && (
                      <div className="text-center py-6 text-xs text-gray-400 font-semibold">
                        No active anomalies registered. All systems operational.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PATIENT FLOW COMMAND TAB (PAGE 2) */}
            {activeTab === 'patient-flow' && (
              <motion.div 
                key="patient-flow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Patient Flow</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Inflow, Wait times &amp; Ward bottleneck Heatmap</h2>
                </div>

                {/* Heatmap display table */}
                <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="bg-gray-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Department</th>
                        <th className="p-4">OPD Load</th>
                        <th className="p-4">IPD Load</th>
                        <th className="p-4">Occupancy %</th>
                        <th className="p-4">Avg Wait Time</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-slate-800">
                      {[
                        { name: 'General Medicine', opd: 542, ipd: 106, occ: 94, wait: 48, status: 'HIGH' },
                        { name: 'Orthopedics', opd: 386, ipd: 142, occ: 91, wait: 35, status: 'HIGH' },
                        { name: 'Pediatrics', opd: 290, ipd: 78, occ: 80, wait: 32, status: 'NORMAL' },
                        { name: 'OBGYN', opd: 212, ipd: 96, occ: 89, wait: 29, status: 'NORMAL' },
                        { name: 'Surgery', opd: 186, ipd: 128, occ: 93, wait: 45, status: 'HIGH' },
                        { name: 'Cardiology', opd: 120, ipd: 48, occ: 96, wait: 62, status: 'CRITICAL' },
                      ].map((dept, i) => {
                        const statusColors: Record<string, string> = {
                          CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                          HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                          NORMAL: 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border-emerald-500/20',
                        };
                        return (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                            <td className="p-4 font-bold text-gray-900 dark:text-white">{dept.name}</td>
                            <td className="p-4 font-mono">{dept.opd}</td>
                            <td className="p-4 font-mono">{dept.ipd}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{ width: `${dept.occ}%` }} />
                                </div>
                                <span className="font-mono">{dept.occ}%</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono">{dept.wait} mins</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${statusColors[dept.status]}`}>
                                {dept.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-purple-500/5 border border-purple-500/25 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">AI Patient Flow Directives</span>
                  </div>
                  <ul className="text-xs font-semibold text-gray-650 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                    <li>Orthopedics OPD queue is 34% above normal. Recommend routing low-priority cases to OPD 6.</li>
                    <li>General Medicine waiting time may exceed 60 minutes. Recommend adding an additional doctor to shift duty.</li>
                    <li>Discharge delays in Surgical Ward are affecting emergency bed availability. Acknowledge pending clearances.</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* EMERGENCY COMMAND TAB (PAGE 3) */}
            {activeTab === 'emergency-command' && (
              <motion.div 
                key="emergency-command"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Emergency Operations</h3>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Trauma, Ambulances &amp; Bays Dashboard</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setOperationalStatus('CRITICAL');
                      logAudit('Declared Mass Casualty Incident Crisis state');
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer animate-pulse"
                  >
                    DECLARE DISASTER STATE (MCI)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'AMBULANCES EN ROUTE', val: '2 incoming', icon: MapPin, color: 'border-red-150 bg-red-500/5 text-red-600' },
                    { label: 'DOOR TO DOCTOR SLA', val: '28 minutes', icon: Clock, color: 'border-amber-150 bg-amber-500/5 text-amber-600' },
                    { label: 'AWAITING CLINICAL TRIAGE', val: '5 patients', icon: AlertCircle, color: 'border-blue-150 bg-blue-500/5 text-blue-600' },
                    { label: 'TRAUMA BAYS OCCUPIED', val: '4 occupied / 2 vacant', icon: BedDouble, color: 'border-emerald-150 bg-emerald-500/5 text-emerald-600' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-between items-center ${stat.color}`}>
                        <div className="p-2.5 rounded-full bg-white dark:bg-slate-850 shadow-sm mb-2">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider">{stat.label}</span>
                        <h3 className="text-lg font-black mt-1.5 tracking-tight">{stat.val}</h3>
                      </div>
                    );
                  })}
                </div>

                {/* Map/List of incoming ambulances */}
                <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">Incoming Ambulance Fleet</h3>
                  <div className="space-y-2">
                    {[
                      { vehicle: 'MH-01-EF-0312', type: 'ALS', status: 'TRANSPORTING', pickup: 'WEH Bandra', eta: 4, patient: 'Santosh Patil (Polytrauma)', vitalAlert: 'SpO2 89% (Critical)' },
                      { vehicle: 'MH-01-EF-0901', type: 'ALS', status: 'TRANSPORTING', pickup: 'Sion Circle Flyover', eta: 9, patient: 'Sunita Deshmukh (Chest Pain)', vitalAlert: 'Heart Rate 98 (Severe)' },
                    ].map((amb, i) => (
                      <div key={i} className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-gray-900 dark:text-white">{amb.vehicle}</span>
                            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950 text-[8px] font-black rounded text-red-650 border border-red-200">{amb.type}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">Pickup: {amb.pickup} | Patient: {amb.patient}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-xs font-black text-rose-600">{amb.vitalAlert}</span>
                          <p className="text-[10px] font-bold text-gray-500">ETA {amb.eta} mins</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* BED MANAGEMENT TAB (PAGE 4) */}
            {activeTab === 'bed-management' && (
              <motion.div 
                key="bed-management"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Bed Management</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Interactive Hospital Bed Board</h2>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-bold">
                  <select className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border border-gray-200 dark:border-slate-700">
                    <option>Main Building</option>
                  </select>
                  <select className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border border-gray-200 dark:border-slate-700">
                    <option>3rd Floor</option>
                  </select>
                  <select className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border border-gray-200 dark:border-slate-700">
                    <option>All Wards</option>
                  </select>
                  <select className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border border-gray-200 dark:border-slate-700">
                    <option>All Types</option>
                  </select>
                </div>

                {/* Ward Grid display */}
                <div className="space-y-4">
                  {[
                    { name: 'Intensive Care Unit (ICU)', total: 24, occ: 22, type: 'ICU' },
                    { name: 'General Medicine Ward 4B', total: 20, occ: 14, type: 'GENERAL' },
                    { name: 'Surgical Care Ward 7', total: 16, occ: 11, type: 'SURGICAL' },
                  ].map((ward, i) => (
                    <div key={i} className="p-4 border rounded-xl bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{ward.name}</span>
                        <span className="text-[10px] font-bold text-gray-500">{ward.occ} occupied / {ward.total} total</span>
                      </div>
                      
                      {/* Flex grid of beds */}
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: ward.total }).map((_, idx) => {
                          const isOccupied = idx < ward.occ;
                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                logAudit('Inspected Bed Unit', `${ward.type}-B${idx + 1}`);
                                if (isOccupied) {
                                  setActiveDrilldown({
                                    bed: `${ward.type}-B${idx + 1}`,
                                    patient: `Patient Ref #${ward.type}-${idx + 1}`,
                                    doctor: 'Dr. Arvind Kulkarni',
                                    vitals: 'Stable. HR 82. BP 120/80',
                                    admissionDate: '2026-07-20'
                                  });
                                }
                              }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[9px] cursor-pointer transition-all border ${
                                isOccupied 
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm' 
                                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-blue-500'
                              }`}
                            >
                              B{idx + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* OT & SURGERY TAB (PAGE 5) */}
            {activeTab === 'ot-surgery' && (
              <motion.div 
                key="ot-surgery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Operation Theatre</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">OT scheduled &amp; Active Surgeries list</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'OT UTILISATION', val: '86%', sub: 'SLA Target 85%' },
                    { label: 'SCHEDULED CASES', val: '28 cases', sub: '12 completed' },
                    { label: 'EMERGENCY CASES', val: '4 cases', sub: 'Immediately routed' },
                    { label: 'CANCELLATION RATE', val: '1.2%', sub: 'Target < 2%' },
                  ].map((metric, i) => (
                    <div key={i} className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-2xl">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{metric.label}</span>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1.5">{metric.val}</h3>
                      <p className="text-[9px] font-bold text-gray-500 mt-0.5">{metric.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Operations table */}
                <div className="border border-gray-150 dark:border-slate-855 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="bg-gray-50 dark:bg-slate-850 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-155 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Patient</th>
                        <th className="p-3">Procedure</th>
                        <th className="p-3">Surgeon</th>
                        <th className="p-3">OT Room</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-slate-800">
                      {[
                        { pat: 'Unknown Male (Trauma #4)', proc: 'Traumatic amputation wound debridement', surgeon: 'Dr. V. Deshmukh', ot: 'OT 1 (Emergency)', status: 'RUNNING' },
                        { pat: 'Rohan Satish Shinde', proc: 'Axial spinal alignment fixation', surgeon: 'Dr. S. Mehta', ot: 'OT 3', status: 'SCHEDULED' },
                        { pat: 'Sunita Ravindra Deshmukh', proc: 'Coronary angioplasty stenting', surgeon: 'Dr. A. Kulkarni', ot: 'OT 2', status: 'COMPLETED' },
                      ].map((surgery, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-gray-900 dark:text-white">{surgery.pat}</td>
                          <td className="p-3">{surgery.proc}</td>
                          <td className="p-3">{surgery.surgeon}</td>
                          <td className="p-3 font-mono">{surgery.ot}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                              surgery.status === 'RUNNING' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 border border-amber-250' :
                              surgery.status === 'SCHEDULED' ? 'bg-blue-100 dark:bg-blue-950 text-blue-650 border border-blue-250' :
                              'bg-green-100 dark:bg-green-950 text-green-650 border border-green-250'
                            }`}>
                              {surgery.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* CLINICAL SERVICES TAB (PAGE 6) */}
            {activeTab === 'clinical-services' && (
              <motion.div 
                key="clinical-services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Clinical Services</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Department workload operations overview</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Cardiology', opd: 120, occupancy: 96, wait: 62, onDutyDocs: 3, pendingOrders: 18 },
                    { name: 'General Medicine', opd: 542, occupancy: 94, wait: 48, onDutyDocs: 8, pendingOrders: 42 },
                    { name: 'Surgery', opd: 186, occupancy: 93, wait: 45, onDutyDocs: 5, pendingOrders: 28 },
                    { name: 'Pediatrics', opd: 290, occupancy: 80, wait: 32, onDutyDocs: 4, pendingOrders: 14 },
                    { name: 'Orthopedics', opd: 386, occupancy: 91, wait: 35, onDutyDocs: 4, pendingOrders: 22 },
                  ].map((dept, idx) => (
                    <div key={idx} className="p-4 bg-gray-50/50 dark:bg-slate-900/40 border rounded-xl space-y-3 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{dept.name}</span>
                        <span className="text-[9px] font-black text-blue-600">{dept.occupancy}% Occupancy</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-500">
                        <div>OPD census: {dept.opd}</div>
                        <div>On-duty doctors: {dept.onDutyDocs}</div>
                        <div>Avg wait: {dept.wait} mins</div>
                        <div>Pending diagnostics: {dept.pendingOrders}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* DIAGNOSTICS TAB (PAGE 7) */}
            {activeTab === 'diagnostics' && (
              <motion.div 
                key="diagnostics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Diagnostics</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Laboratory &amp; PACS Imaging backlog</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Labs */}
                  <div className="p-4 border rounded-xl bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white">Laboratory Operations</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-850">
                        <div className="text-base font-black text-blue-600">142</div>
                        <div className="text-[9px] font-bold text-gray-400">SAMPLES PENDING</div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-850">
                        <div className="text-base font-black text-red-650">14</div>
                        <div className="text-[9px] font-bold text-gray-400">STAT URGENT</div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-850">
                        <div className="text-base font-black text-emerald-600">98.4%</div>
                        <div className="text-[9px] font-bold text-gray-400">ANALYZERS UPTIME</div>
                      </div>
                    </div>
                  </div>

                  {/* Radiology */}
                  <div className="p-4 border rounded-xl bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white">Radiology Operations (PACS)</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-850">
                        <div className="text-base font-black text-blue-600">58</div>
                        <div className="text-[9px] font-bold text-gray-400">STUDIES PENDING</div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-850">
                        <div className="text-base font-black text-orange-650">3 scans</div>
                        <div className="text-[9px] font-bold text-gray-400">CT BACKLOG</div>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-850">
                        <div className="text-base font-black text-red-600 animate-pulse">OFFLINE</div>
                        <div className="text-[9px] font-bold text-gray-400">CT SCANNER 1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHARMACY & BLOOD TAB (PAGE 8) */}
            {activeTab === 'pharmacy-blood' && (
              <motion.div 
                key="pharmacy-blood"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Pharmacy &amp; Blood Bank</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Smart Inventory &amp; Critical reserves tracker</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pharmacy Stock Alert List */}
                  <div className="p-4 border rounded-xl bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white">Pharmacy Critical Stocks</h3>
                    <div className="space-y-2">
                      {[
                        { item: 'Paracetamol 650mg tablets', stock: '250 units remaining', status: 'LOW' },
                        { item: 'Adrenaline 1mg/ml injection ampoules', stock: '8 units remaining', status: 'CRITICAL' },
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex justify-between text-xs font-bold">
                          <span>{item.item}</span>
                          <span className={item.status === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-amber-500'}>
                            {item.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blood bank inventories */}
                  <div className="p-4 border rounded-xl bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white">Blood Bank Stocks by Group</h3>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-black">
                      {[
                        { group: 'O Negative', val: '3 units', isCritical: true },
                        { group: 'O Positive', val: '42 units', isCritical: false },
                        { group: 'A Positive', val: '28 units', isCritical: false },
                        { group: 'B Positive', val: '35 units', isCritical: false },
                        { group: 'AB Positive', val: '18 units', isCritical: false },
                        { group: 'A Negative', val: '8 units', isCritical: true },
                        { group: 'B Negative', val: '6 units', isCritical: true },
                        { group: 'AB Negative', val: '4 units', isCritical: true },
                      ].map((b, i) => (
                        <div key={i} className={`p-2 rounded-xl border ${b.isCritical ? 'bg-red-500/10 border-red-500/30 text-red-650 animate-pulse' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'}`}>
                          <div className="text-[10px] text-gray-400">{b.group}</div>
                          <div className="text-xs font-black mt-1">{b.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAFF & WORKFORCE TAB (PAGE 9) */}
            {activeTab === 'staff-workforce' && (
              <motion.div 
                key="staff-workforce"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Staff stats */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Staff roster</h3>
                      <h2 className="text-base font-black text-gray-900 dark:text-white mt-1">Geo-fenced attendance and Roster approvals</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">TOTAL SCHEDULED</span>
                      <h3 className="text-xl font-black mt-1.5 text-gray-900 dark:text-white">250</h3>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">PRESENT</span>
                      <h3 className="text-xl font-black mt-1.5 text-emerald-600">230</h3>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">ABSENT</span>
                      <h3 className="text-xl font-black mt-1.5 text-rose-500">12</h3>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">LATE / EXCEPTION</span>
                      <h3 className="text-xl font-black mt-1.5 text-amber-500">8</h3>
                    </div>
                  </div>
                </div>

                {/* Dispatch form and lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Dispatch Redirection Form */}
                  <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center space-x-2">
                      <Send className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-black text-gray-900 dark:text-white">Staff Dispatch System</h3>
                    </div>

                    <form onSubmit={handleDispatchStaff} className="space-y-4 text-xs font-bold">
                      <div className="flex flex-col space-y-1">
                        <label>Select Staff Member</label>
                        <select 
                          value={selectedStaffForDispatch} 
                          onChange={(e) => setSelectedStaffForDispatch(e.target.value)}
                          className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border border-gray-200 dark:border-slate-700"
                        >
                          <option value="">-- Choose on-duty staff --</option>
                          {staffList.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.role} - {s.department})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label>Task Title</label>
                        <input 
                          type="text" 
                          value={dispatchTitle} 
                          onChange={(e) => setDispatchTitle(e.target.value)} 
                          placeholder="e.g. Assist in Emergency resus 1"
                          className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label>Instructions Details</label>
                        <textarea 
                          value={dispatchInstructions} 
                          onChange={(e) => setDispatchInstructions(e.target.value)} 
                          placeholder="Describe instructions..."
                          className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none h-16 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col space-y-1">
                          <label>Destination</label>
                          <input 
                            type="text" 
                            value={dispatchWard} 
                            onChange={(e) => setDispatchWard(e.target.value)} 
                            className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 outline-none"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label>Priority</label>
                          <select 
                            value={dispatchPriority} 
                            onChange={(e) => setDispatchPriority(e.target.value)}
                            className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border border-gray-200 dark:border-slate-700"
                          >
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                            <option value="EMERGENCY">Emergency</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#0A5BFF] text-white py-3.5 rounded-xl hover:bg-blue-700 transition-all font-bold cursor-pointer active:scale-95 shadow-lg shadow-blue-500/20"
                      >
                        DISPATCH DIRECTIVE ORDER
                      </button>
                    </form>
                  </div>

                  {/* Active tasks lists */}
                  <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">Active Dispatched Assignments</h3>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {assignments.map((asm: any) => (
                        <div key={asm.id} className="p-3 border rounded-xl bg-gray-50/50 dark:bg-slate-900/50 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">{asm.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase ${
                              asm.status === 'COMPLETED' ? 'bg-green-150 border-green-250 text-green-755' :
                              asm.status === 'IN_PROGRESS' || asm.status === 'ACCEPTED' ? 'bg-blue-150 border-blue-250 text-blue-755' :
                              'bg-amber-150 border-amber-250 text-amber-755 animate-pulse'
                            }`}>
                              {asm.status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                            <span>Staff: {asm.staff_name}</span>
                            <span>Destination: {asm.destination?.ward || asm.destination_ward || 'General'}</span>
                          </div>
                          
                          {asm.arrived_at && (
                            <div className="flex items-center space-x-1 text-[9px] text-emerald-605 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified Arrival: GPS Lock Match ({new Date(asm.arrived_at).toLocaleTimeString()})</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FINANCE & REVENUE TAB (PAGE 10) */}
            {activeTab === 'finance-revenue' && (
              <motion.div 
                key="finance-revenue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Finance &amp; Revenues</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Daily billing summaries &amp; PMJAY scheme audit</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs font-black">
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">REVENUE TODAY</span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">₹ 8.75 Lakhs</h3>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">SCHEME UTILISATION MTD</span>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1.5">₹ 49.20 Lakhs</h3>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">OUTSTANDING BILLS</span>
                    <h3 className="text-2xl font-black text-rose-500 mt-1.5">₹ 2.80 Lakhs</h3>
                  </div>
                </div>

                {/* billing categories table */}
                <div className="border border-gray-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="bg-gray-50 dark:bg-slate-850 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-155 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Revenue Category</th>
                        <th className="p-3">Cash Receipts</th>
                        <th className="p-3">Cashless / PMJAY Scheme</th>
                        <th className="p-3">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-155 dark:divide-slate-800">
                      {[
                        { cat: 'OPD Consultations', cash: '₹ 1,34,000', scheme: '₹ 1,00,000', total: '₹ 2,34,000' },
                        { cat: 'IPD Admissions', cash: '₹ 1,42,000', scheme: '₹ 3,50,000', total: '₹ 4,92,000' },
                        { cat: 'Diagnostics (Lab/PACS)', cash: '₹ 62,000', scheme: '₹ 88,000', total: '₹ 1,50,000' },
                      ].map((billing, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-gray-900 dark:text-white">{billing.cat}</td>
                          <td className="p-3 font-mono text-gray-600 dark:text-slate-350">{billing.cash}</td>
                          <td className="p-3 font-mono text-emerald-600">{billing.scheme}</td>
                          <td className="p-3 font-mono font-black text-gray-900 dark:text-white">{billing.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* QUALITY & SAFETY TAB (PAGE 11) */}
            {activeTab === 'quality-safety' && (
              <motion.div 
                key="quality-safety"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Quality &amp; Safety</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Mortality events &amp; Patient safety logs</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'PATIENT READMISSION', val: '2.3%', trend: '↓ 0.2%' },
                    { label: 'MEDICATION ERRORS', val: '0 cases', trend: 'Healthy' },
                    { label: 'MORTALITY EVENTS YTD', val: '14 cases', trend: 'Under SLA threshold' },
                    { label: 'TRANSFUSION ANOMALIES', val: '0 incidents', trend: 'Healthy' },
                  ].map((safety, i) => (
                    <div key={i} className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-xl">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{safety.label}</span>
                      <h3 className="text-lg font-black mt-1 text-gray-900 dark:text-white">{safety.val}</h3>
                      <span className="text-[9px] font-bold text-gray-500 mt-0.5 block">{safety.trend}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* INFRASTRUCTURE TAB (PAGE 12) */}
            {activeTab === 'infrastructure' && (
              <motion.div 
                key="infrastructure"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Infrastructure</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Scanners, HVAC, Network &amp; Power backups status</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { asset: 'CT Scanner 1', dept: 'Radiology Room 1', status: 'OFFLINE', impact: '14 patients queued' },
                    { asset: 'Central Oxygen Storage', dept: 'Central supply lines', status: 'OPERATIONAL', impact: 'Recharged 92%' },
                    { asset: 'Main Hospital Elevators', dept: 'Building A &amp; B core', status: 'DEGRADED', impact: 'Elevator 2 under calibration' },
                    { asset: 'PACS Server Core', dept: 'Digital imaging network', status: 'OPERATIONAL', impact: 'Uptime 99.9%' },
                    { asset: 'Back Generator Unit 1', dept: 'Power systems', status: 'OPERATIONAL', impact: 'Self-test validated' },
                  ].map((infra, idx) => (
                    <div key={idx} className="p-4 bg-gray-50/50 dark:bg-slate-900/40 border rounded-xl space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-850 pb-1.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{infra.asset}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          infra.status === 'OPERATIONAL' ? 'bg-green-100 border-green-200 text-green-700' :
                          infra.status === 'DEGRADED' ? 'bg-amber-100 border-amber-200 text-amber-700' :
                          'bg-red-100 border-red-205 text-red-750 animate-pulse'
                        }`}>{infra.status}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-gray-500">
                        <p><strong>Dept:</strong> {infra.dept}</p>
                        <p className="mt-1"><strong>Operational impact:</strong> {infra.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ACADEMIC & RESEARCH TAB (PAGE 13) */}
            {activeTab === 'academic-research' && (
              <motion.div 
                key="academic-research"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Academic &amp; Research</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Residents rosters &amp; Clinical trials approvals</h2>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-xs font-bold">
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400">RESIDENTS ON DUTY</span>
                    <h3 className="text-xl font-black mt-1 text-gray-900 dark:text-white">42</h3>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400">ACTIVE RESEARCH TRIALS</span>
                    <h3 className="text-xl font-black mt-1 text-blue-650">18</h3>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border rounded-2xl">
                    <span className="text-[9px] font-bold text-gray-400">ETHICS CLEARANCES PENDING</span>
                    <h3 className="text-xl font-black mt-1 text-amber-500">9</h3>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ALERTS & NOTIFICATIONS TAB (PAGE 14) */}
            {activeTab === 'alerts-notifications' && (
              <motion.div 
                key="alerts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">System Alerts</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Central Administrative command inbox</h2>
                </div>

                <div className="space-y-3">
                  {escalations.map((esc) => (
                    <div key={esc.id} className="p-4 border rounded-xl bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                          <span className="font-black text-red-500 uppercase">{esc.severity}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{new Date(esc.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{esc.title}</h4>
                        <p className="text-[10px] text-gray-505">{esc.message}</p>
                      </div>
                      <button 
                        onClick={() => handleAcknowledgeEscalation(esc.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                      >
                        RESOLVE
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* REPORTS & ANALYTICS TAB (PAGE 15) */}
            {activeTab === 'reports-analytics' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Reporting</h3>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Generate Executive hospital reports</h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-bold text-gray-650">
                  {[
                    'Daily Hospital Report',
                    'OPD Report',
                    'Emergency Report',
                    'Bed Occupancy',
                    'OT Utilization',
                    'Diagnostic TAT',
                    'Pharmacy Inventory',
                    'Blood Bank',
                    'Financial Summary',
                  ].map((reportType) => (
                    <button
                      key={reportType}
                      onClick={() => handleGenerateReportRequest(reportType)}
                      className="p-4 bg-gray-50/50 hover:bg-white dark:bg-slate-900 border border-gray-200 hover:border-[#0A5BFF] rounded-xl flex flex-col justify-between text-left cursor-pointer transition-all active:scale-98"
                    >
                      <FileDown className="w-5 h-5 text-gray-400 mb-2" />
                      <span className="text-[10px] font-black text-gray-900 dark:text-white">{reportType}</span>
                      <span className="text-[8px] font-bold text-gray-400 mt-1 block">Request PDF / Excel compilation</span>
                    </button>
                  ))}
                </div>

                {/* Generated list */}
                <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-505">Recently Compiled Reports</h3>
                  <div className="space-y-2">
                    {reports.map((rep) => (
                      <div key={rep.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-900 dark:text-white">{rep.type}</p>
                          <p className="text-[9px] text-gray-400">Generated by: {rep.generatedBy} | {new Date(rep.generatedAt).toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${rep.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600 animate-pulse'}`}>
                          {rep.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ACTION CENTER TAB (PAGE 16) */}
            {activeTab === 'action-center' && (
              <motion.div 
                key="action-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Action Center</h3>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Issue directives &amp; review pending clearances</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setShowDirectiveModal(true);
                      logAudit('Clicked open directive creation modal');
                    }}
                    className="px-4 py-2 bg-[#0A5BFF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ISSUE DIRECTIVE</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {directives.map((dir) => (
                    <div key={dir.id} className="p-4 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                      <div className="flex justify-between items-start border-b border-gray-150 dark:border-slate-850 pb-2">
                        <div className="space-y-0.5">
                          <span className={`inline-block px-1.5 py-0.5 text-[8px] font-black rounded border uppercase ${
                            dir.priority === 'EMERGENCY' ? 'bg-red-100 border-red-205 text-red-650' :
                            dir.priority === 'URGENT' ? 'bg-orange-100 border-orange-205 text-orange-655' :
                            'bg-blue-100 border-blue-200 text-blue-650'
                          }`}>{dir.priority} DIRECTIVE</span>
                          <h4 className="font-bold text-gray-900 dark:text-white mt-1">{dir.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                          dir.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600 animate-pulse'
                        }`}>{dir.status}</span>
                      </div>
                      
                      <p className="text-[10px] text-gray-500 leading-normal">{dir.instructions}</p>
                      
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-semibold pt-1">
                        <span>Target: {dir.departments.join(', ')}</span>
                        <span>Issued: {new Date(dir.createdAt).toLocaleTimeString()}</span>
                      </div>

                      {dir.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAcknowledgeDirective(dir.id)}
                          className="px-3.5 py-1.5 bg-[#0a5bff] hover:bg-blue-750 text-white rounded-lg font-bold text-[9px] cursor-pointer"
                        >
                          ACKNOWLEDGE AND ACTION
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AUDIT & LOGS TAB (PAGE 17) */}
            {activeTab === 'audit-logs' && (
              <motion.div 
                key="audit-logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Security Audit</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Append-only administrative operations log</h2>
                </div>

                <div className="border border-gray-150 dark:border-slate-855 rounded-xl overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="bg-gray-50 dark:bg-slate-855 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-150 dark:border-slate-800">
                      <tr>
                        <th className="p-3">User &amp; Role</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Target Reference</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-155 dark:divide-slate-800 font-mono text-[10px]">
                      {auditLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <p className="font-bold text-gray-900 dark:text-white">{log.user}</p>
                            <p className="text-[8px] text-gray-400 font-sans">{log.role}</p>
                          </td>
                          <td className="p-3 text-gray-800 dark:text-slate-200 font-bold">{log.action}</td>
                          <td className="p-3 text-gray-550">{log.target}</td>
                          <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-xs text-gray-400 font-semibold font-sans">
                            No logs loaded. Perform actions to compile session audit track.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* SYSTEM HEALTH TAB (PAGE 18) */}
            {activeTab === 'system-health' && (
              <motion.div 
                key="system-health"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">System Diagnostics</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Hospital services gateway status checklist</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Core Application Service', status: 'HEALTHY', latency: '4ms' },
                    { name: 'Hospital Database Registry', status: 'HEALTHY', latency: '2ms' },
                    { name: 'Realtime WebSocket SSE', status: 'HEALTHY', latency: '12ms' },
                    { name: 'Voice OS Speech Normalizer', status: 'HEALTHY', latency: '350ms' },
                    { name: 'ABHA ABDM Gateway Integration', status: 'HEALTHY', latency: '240ms' },
                    { name: 'Radiology PACS server link', status: 'DEGRADED', latency: '1200ms' },
                  ].map((service, i) => (
                    <div key={i} className="p-4 border rounded-xl bg-gray-50/50 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{service.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                          service.status === 'HEALTHY' ? 'bg-green-105 text-green-600 border border-green-200' : 'bg-amber-100 text-amber-600 border border-amber-200 animate-pulse'
                        }`}>{service.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">Ping response: {service.latency}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB (PAGE 19) */}
            {activeTab === 'settings-config' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Configuration</h3>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Rosters &amp; Emergency safety thresholds settings</h2>
                </div>

                <form className="space-y-4 text-xs font-bold" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label>ICU Occupancy Alert threshold</label>
                      <input type="text" defaultValue="95%" className="p-2.5 bg-gray-50 dark:bg-slate-800 border rounded-xl outline-none" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label>Emergency door-to-doctor SLA</label>
                      <input type="text" defaultValue="30 minutes" className="p-2.5 bg-gray-50 dark:bg-slate-800 border rounded-xl outline-none" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      logAudit('Saved settings configuration details');
                      alert('Configuration saved successfully!');
                    }}
                    className="px-4 py-3.5 bg-[#0A5BFF] text-white rounded-xl hover:bg-blue-750 transition-all font-bold cursor-pointer"
                  >
                    SAVE CONFIGURATION
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* DIRECTIVE DIALOG CREATION MODAL */}
      <AnimatePresence>
        {showDirectiveModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-250 dark:border-slate-850 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Issue Administrative Directive</h3>
                <button 
                  onClick={() => setShowDirectiveModal(false)}
                  className="text-gray-400 hover:text-gray-650 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDirective} className="space-y-4 text-xs font-bold">
                <div className="flex flex-col space-y-1">
                  <label>Directive Title</label>
                  <input 
                    type="text"
                    required
                    value={newDirective.title}
                    onChange={(e) => setNewDirective({ ...newDirective, title: e.target.value })}
                    placeholder="e.g. Surge ICU Nurse support"
                    className="p-2.5 bg-gray-50 dark:bg-slate-800 border rounded-xl outline-none"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label>Instructions &amp; Protocol details</label>
                  <textarea 
                    required
                    value={newDirective.instructions}
                    onChange={(e) => setNewDirective({ ...newDirective, instructions: e.target.value })}
                    placeholder="Specify administrative instructions..."
                    className="p-2.5 bg-gray-50 dark:bg-slate-800 border rounded-xl outline-none h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label>Priority</label>
                    <select 
                      value={newDirective.priority}
                      onChange={(e: any) => setNewDirective({ ...newDirective, priority: e.target.value })}
                      className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label>Target Department</label>
                    <select 
                      onChange={(e) => setNewDirective({ ...newDirective, departments: [e.target.value] })}
                      className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none border"
                    >
                      <option value="Emergency">Emergency</option>
                      <option value="ICU">ICU</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Blood Bank">Blood Bank</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#0A5BFF] text-white py-3.5 rounded-xl hover:bg-blue-755 transition-all font-bold cursor-pointer"
                >
                  DISPATCH DIRECTIVE ORDER
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE DRILLDOWN VIEW DIALOG */}
      <AnimatePresence>
        {activeDrilldown && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-250 dark:border-slate-850 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase">Bed Allocation Detail</h3>
                <button onClick={() => setActiveDrilldown(null)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs font-bold text-gray-650 dark:text-slate-350 space-y-2">
                <p><strong>Bed Reference:</strong> {activeDrilldown.bed}</p>
                <p><strong>Patient:</strong> {activeDrilldown.patient}</p>
                <p><strong>Consulting Physician:</strong> {activeDrilldown.doctor}</p>
                <p><strong>Vitals Status:</strong> {activeDrilldown.vitals}</p>
                <p><strong>Admission Date:</strong> {activeDrilldown.admissionDate}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CORRELATION INCIDENT CASCADE ACTION MODAL */}
      <AnimatePresence>
        {correlationModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-250 dark:border-slate-850 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Cascade Incident Control Panel</span>
                </h3>
                <button onClick={() => setCorrelationModalOpen(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-650 dark:text-slate-350 space-y-3">
                <p className="leading-relaxed">
                  <strong>CT Scanner Offline</strong> is cascading delays to 6 emergency patient dispositions, contributing to <strong>ED Triage Congestion</strong>.
                </p>
                
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="font-bold text-red-755 mb-1">Recommended Dean Directive Actions:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[10px]">
                    <li>Authorize redirection of non-contrast scans to partner diagnostics wing.</li>
                    <li>Mobilize maintenance lead to force hardware reboot.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleAcknowledgeEscalation('ESC-002');
                    setCorrelationModalOpen(false);
                  }}
                  className="flex-1 bg-[#0A5BFF] hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  AUTHORIZE REROUTING
                </button>
                <button
                  onClick={() => setCorrelationModalOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-slate-850 text-gray-700 dark:text-slate-300 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}