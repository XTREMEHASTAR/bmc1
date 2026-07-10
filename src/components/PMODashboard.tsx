import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  TrendingUp,
  Activity,
  Layers,
  AlertOctagon,
  Calendar,
  Briefcase,
  Users,
  CheckSquare,
  Shield,
  HelpCircle,
  Database,
  ArrowRight,
  TrendingDown,
  Lock,
  Globe,
  Settings,
  Sparkles,
  Info
} from 'lucide-react';

interface ReadinessCheck {
  id: string;
  item: string;
  category: 'Network' | 'Data' | 'Training' | 'Hardware';
  status: 'Ready' | 'In Progress' | 'Awaiting';
  progress: number;
}

export default function PMODashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'readiness' | 'budget' | 'risks' | 'cutover'>('timeline');

  // Readiness Assessment states
  const [readinessChecks, setReadinessChecks] = useState<ReadinessCheck[]>([
    { id: 'RC-01', item: 'KEM Hospital HL7/PACS data extraction', category: 'Data', status: 'Ready', progress: 100 },
    { id: 'RC-02', item: 'Sion Hospital fiber backbone latency test', category: 'Network', status: 'In Progress', progress: 65 },
    { id: 'RC-03', item: 'Cooper Hospital nurse roster training sign-off', category: 'Training', status: 'Awaiting', progress: 0 },
    { id: 'RC-04', item: 'Nair Hospital ICU monitor IoT gateway install', category: 'Hardware', status: 'In Progress', progress: 45 }
  ]);

  // Risk matrix states
  const [risks, setRisks] = useState([
    { id: 'RSK-01', title: 'Legacy HIS Data Corruption during import', impact: 'Critical', likelihood: 'Moderate', status: 'Mitigated' },
    { id: 'RSK-02', title: 'Clinician resistance to new EMR workflows', impact: 'High', likelihood: 'High', status: 'Active Training' },
    { id: 'RSK-03', title: 'UHI gateway endpoint downtime during rollout', impact: 'High', likelihood: 'Low', status: 'Mitigated' }
  ]);

  // Cutover Strategy Checkbox states
  const [cutoverChecks, setCutoverChecks] = useState([
    { id: 'CO-01', text: 'Backup all legacy patient records to secure cold storage', checked: true },
    { id: 'CO-02', text: 'Verify FHIR validation endpoints are online', checked: true },
    { id: 'CO-03', text: 'Freeze legacy database writing blocks', checked: false },
    { id: 'CO-04', text: 'Initiate DNS routing swap to new MCGM OS Gateway', checked: false },
    { id: 'CO-05', text: 'Activate Hypercare support hotlines', checked: false }
  ]);

  const toggleCutover = (id: string) => {
    setCutoverChecks(prev =>
      prev.map(c => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleUpdateReadiness = (id: string, progress: number) => {
    setReadinessChecks(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newStatus = progress === 100 ? 'Ready' : progress === 0 ? 'Awaiting' : 'In Progress';
          return { ...c, progress, status: newStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#06070c] text-gray-100' : 'bg-slate-50 text-slate-800'} transition-all`}>
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors bg-white/95 border-gray-150 dark:bg-[#0a0b12]/95 dark:border-gray-900">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 via-indigo-600 to-rose-600 rounded-xl text-white shadow-md">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM OS Deploy PMO</span>
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">Command Console</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Rollout Playbook • Readiness Audits • Risk Matrices • Migration Gating
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-900 text-gray-450 cursor-pointer animate-transition"
          >
            {isDarkMode ? (
              <span className="text-yellow-400 font-bold text-xs">Light Mode</span>
            ) : (
              <span className="text-slate-700 font-bold text-xs">Dark Mode</span>
            )}
          </button>

          <button 
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1.5 bg-indigo-500 hover:bg-indigo-600 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock Deployment console</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">

        {/* Strategic Dashboard Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Active Pilots</span>
            <h3 className="text-xl font-black text-indigo-500 mt-1">KEM Hospital</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Core EMR Online</span>
          </div>

          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Overall Readiness Rate</span>
            <h3 className="text-xl font-black text-cyan-500 mt-1">84.2% Complete</h3>
            <span className="text-[10px] text-gray-450 font-semibold mt-1">12 major gates checked</span>
          </div>

          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Active Risks Blockers</span>
            <h3 className="text-xl font-black text-rose-500 mt-1">0 Critical Risks</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Mitigation paths active</span>
          </div>

          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Project Budget Consumed</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">42% of ₹45 Cr</h3>
            <span className="text-[10px] text-indigo-400 font-bold mt-1">On-track, target cost met</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl max-w-6xl shadow-sm">
          {[
            { id: 'timeline', label: 'Rollout Timeline', icon: Calendar },
            { id: 'readiness', label: 'Readiness Audit', icon: Layers },
            { id: 'budget', label: 'Budget Plan', icon: Briefcase },
            { id: 'risks', label: 'Risk Matrix', icon: AlertOctagon },
            { id: 'cutover', label: 'Cutover & Go-Live', icon: CheckSquare }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-450 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel Renderings */}
        <div className="mt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: ROLLOUT TIMELINE */}
            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500">MCGM deployment phases</h3>

                <div className="space-y-4 text-xs font-semibold">
                  {[
                    { phase: 'Phase 1: Pilot Deployment', target: 'KEM Hospital (EMR, OTs, Labs)', duration: 'Months 1-3', status: 'Active Pilot' },
                    { phase: 'Phase 2: Core Teaching Hospitals', target: 'Sion, Cooper, Nair, Phule Clinics', duration: 'Months 4-6', status: 'Scheduled' },
                    { phase: 'Phase 3: Peripheral Networks', target: '24 Peripheral Clinics & Blood Banks', duration: 'Months 7-12', status: 'Scheduled' },
                    { phase: 'Phase 4: State Interoperability Grid', target: 'National Registry, Cross-border API', duration: 'Months 13-18', status: 'Planned' }
                  ].map((p, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-850 dark:text-gray-200">{p.phase}</p>
                        <p className="text-[10px] text-gray-450">{p.target}</p>
                      </div>
                      <div className="flex items-center space-x-3 text-[10px]">
                        <span className="text-gray-400 font-semibold">{p.duration}</span>
                        <span className={`px-2 py-0.5 rounded font-black text-[8.5px] uppercase ${
                          p.status === 'Active Pilot' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-200 dark:bg-slate-800 text-gray-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 2: READINESS AUDITS */}
            {activeTab === 'readiness' && (
              <motion.div
                key="readiness"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Readiness parameters checklist */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500">Readiness checklists</h3>

                  <div className="space-y-4">
                    {readinessChecks.map(c => (
                      <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2 text-xs font-bold">
                        <div className="flex justify-between items-center">
                          <span>{c.item}</span>
                          <span className={`px-2 py-0.5 text-[8.5px] rounded uppercase font-black ${
                            c.status === 'Ready' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                            c.status === 'In Progress' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' :
                            'bg-slate-200 dark:bg-slate-800 text-gray-400'
                          }`}>
                            {c.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={c.progress} 
                            onChange={(e) => handleUpdateReadiness(c.id, parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <span className="text-[10px] text-gray-400 font-semibold">{c.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Audit stats */}
                <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider">Hospital Readiness Rates</h3>
                    <p className="text-xs text-gray-450 leading-relaxed font-semibold">
                      Adjust parameters to simulate local network load capacities, legacy HL7 data migration checks, and roster training programs completion status.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold text-center">
                    <span className="text-emerald-500 uppercase">✓ Gating Ready for Pilot</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: BUDGET PLANNING */}
            {activeTab === 'budget' && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500">Resource & Budget Allocation</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
                  <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-400">Core Software & API Integration</p>
                    <p className="text-lg font-black text-indigo-500">₹18.5 Cr</p>
                    <p className="text-[10px] text-emerald-500">✓ Fully funded</p>
                  </div>

                  <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-400">Hospital Server & IoT Gateways</p>
                    <p className="text-lg font-black text-cyan-500">₹14.2 Cr</p>
                    <p className="text-[10px] text-indigo-400">45% Invoices cleared</p>
                  </div>

                  <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-400">Nurse & Doctor Change Training</p>
                    <p className="text-lg font-black text-rose-500">₹6.2 Cr</p>
                    <p className="text-[10px] text-gray-400">Ongoing rollout</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: RISK MATRIX */}
            {activeTab === 'risks' && (
              <motion.div
                key="risks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500">Active Deployment Risks Log</h3>

                <div className="space-y-3 text-xs font-semibold">
                  {risks.map((risk, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-gray-200">{risk.title}</p>
                        <p className="text-[10px] text-gray-400">Impact: <span className="text-rose-500 font-bold">{risk.impact}</span> • Likelihood: {risk.likelihood}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded font-black text-[8.5px] uppercase ${
                        risk.status === 'Mitigated' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                      }`}>
                        {risk.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 5: CUTOVER & GO-LIVE GATES */}
            {activeTab === 'cutover' && (
              <motion.div
                key="cutover"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Pre-Cutover checklist */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-500">Gating Cutover Checklist</h3>

                  <div className="space-y-3 text-xs font-semibold">
                    {cutoverChecks.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => toggleCutover(c.id)}
                        className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center space-x-3 cursor-pointer select-none"
                      >
                        <input 
                          type="checkbox" 
                          checked={c.checked}
                          onChange={() => {}} // handled by div click
                          className="w-4 h-4 rounded text-indigo-500 border-gray-300 focus:ring-indigo-500" 
                        />
                        <span className={c.checked ? 'text-gray-400 line-through' : 'text-slate-800 dark:text-gray-200'}>
                          {c.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hypercare status */}
                <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider">Deployment Readiness Status</h3>
                  
                  <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400">Pre-Cutover Checklist Gates</p>
                    <p className="text-2xl font-black text-indigo-500">
                      {cutoverChecks.filter(c => c.checked).length} / {cutoverChecks.length} Passed
                    </p>
                  </div>

                  <p className="text-[9px] text-gray-450 text-center font-semibold uppercase">
                    All checklist items must be approved to initiate live cutover script.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
