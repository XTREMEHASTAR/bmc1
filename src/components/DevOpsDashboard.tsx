import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Zap,
  Play,
  RotateCw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Plus,
  Key,
  ShieldAlert,
  HardDrive,
  Network,
  RefreshCw,
  Sliders,
  FileCode,
  Flame,
  UserCheck,
  TrendingUp,
  CloudLightning,
  Workflow
} from 'lucide-react';

interface BuildStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: string;
}

export default function DevOpsDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}) {
  const [activeSection, setActiveSection] = useState<'infrastructure' | 'cicd' | 'dr' | 'sre' | 'secrets'>('infrastructure');

  // Interactive CI/CD build simulator states
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    { name: 'Git Commit Validation', status: 'success', duration: '2s' },
    { name: 'Static Code Analysis (Linter & TS Check)', status: 'success', duration: '12s' },
    { name: 'Unit & Integration Testing', status: 'success', duration: '45s' },
    { name: 'Container Build & Security Scan (Trivy)', status: 'pending' },
    { name: 'Infrastructure Validation (Terraform Plan)', status: 'pending' },
    { name: 'Deploy to Staging Environment', status: 'pending' }
  ]);
  const [isBuilding, setIsBuilding] = useState(false);

  // DR Simulation states
  const [activeRegion, setActiveRegion] = useState<'Mum-West' | 'Pune-DR'>('Mum-West');
  const [drProgress, setDrProgress] = useState(100);
  const [isFailingOver, setIsFailingOver] = useState(false);

  // SRE Error Budget metric simulator
  const [errorBudget, setErrorBudget] = useState(99.88);

  // Start simulated build pipeline
  const runBuildPipeline = () => {
    setIsBuilding(true);
    // Reset steps
    setBuildSteps(prev => prev.map((step, idx) => {
      if (idx > 2) return { ...step, status: 'pending', duration: undefined };
      return step;
    }));

    setTimeout(() => {
      setBuildSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'running' } : s));
      setTimeout(() => {
        setBuildSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'success', duration: '18s' } : idx === 4 ? { ...s, status: 'running' } : s));
        setTimeout(() => {
          setBuildSteps(prev => prev.map((s, idx) => idx === 4 ? { ...s, status: 'success', duration: '5s' } : idx === 5 ? { ...s, status: 'running' } : s));
          setTimeout(() => {
            setBuildSteps(prev => prev.map((s, idx) => idx === 5 ? { ...s, status: 'success', duration: '28s' } : s));
            setIsBuilding(false);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  // Trigger DR failover simulator
  const triggerFailover = () => {
    setIsFailingOver(true);
    setDrProgress(0);
    const interval = setInterval(() => {
      setDrProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setActiveRegion(activeRegion === 'Mum-West' ? 'Pune-DR' : 'Mum-West');
          setIsFailingOver(false);
          return 100;
        }
        return p + 25;
      });
    }, 600);
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#09090e] text-gray-100' : 'bg-slate-50 text-slate-800'} transition-all`}>
      {/* Devops Header Panel */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors bg-white/95 border-gray-200 dark:bg-[#0c0c12]/95 dark:border-gray-900">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-xl text-white shadow-md">
            <Workflow className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM Infrastructure Control</span>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">Platform Ops</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Kubernetes Clusters • CI/CD Pipelines • SRE SLO Dashboards • Disaster Recovery Controls
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-900 text-gray-400 cursor-pointer"
          >
            {isDarkMode ? (
              <span className="text-yellow-400 font-bold text-xs">Light Mode</span>
            ) : (
              <span className="text-slate-700 font-bold text-xs">Dark Mode</span>
            )}
          </button>

          <button 
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-750 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock Infrastructure</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">

        {/* Global Health Indicator cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Kubernetes Node Status</span>
            <h3 className="text-xl font-black text-rose-500 mt-1">42 / 42 Nodes Online</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Autocalling status: Healthy</span>
          </div>

          <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Active Database Replicas</span>
            <h3 className="text-xl font-black text-rose-500 mt-1">6 Nodes</h3>
            <span className="text-[10px] text-gray-400 font-semibold mt-1">Point-In-Time recovery sync</span>
          </div>

          <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Region Availability</span>
            <h3 className={`text-xl font-black mt-1 ${activeRegion === 'Mum-West' ? 'text-indigo-500' : 'text-amber-500'}`}>
              Active: {activeRegion}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Pune Hot Standby Active</span>
          </div>

          <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">SRE Error Budget Remaining</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">99.88%</h3>
            <span className="text-[10px] text-indigo-400 font-bold mt-1">SLO target: 99.9%</span>
          </div>
        </div>

        {/* Segmented controls tab switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-6xl shadow-sm">
          {[
            { id: 'infrastructure', label: 'Cluster Topology', icon: Server },
            { id: 'cicd', label: 'CI/CD Builds', icon: Workflow },
            { id: 'dr', label: 'Disaster Recovery', icon: CloudLightning },
            { id: 'sre', label: 'SRE Monitor (SLIs)', icon: Activity },
            { id: 'secrets', label: 'Vault Registry', icon: Key }
          ].map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub panels rendering */}
        <div className="mt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: KUBERNETES INFRASTRUCTURE TOPOLOGY */}
            {activeSection === 'infrastructure' && (
              <motion.div
                key="infrastructure"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Cluster nodes status logs */}
                <div className="lg:col-span-2 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Live Kubernetes Deployment Pods</h3>

                  <div className="space-y-3 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">mcgm-api-gateway-service</p>
                        <p className="text-[10px] text-gray-400">Replicas: 12 Running • Rolling Updates Active</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">HEALTHY</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">mcgm-fhir-r4-gateway</p>
                        <p className="text-[10px] text-gray-400">Replicas: 6 Running • Autoscaling Enabled</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">HEALTHY</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">mcgm-telemetry-ingestion-worker</p>
                        <p className="text-[10px] text-gray-400">Replicas: 24 Running • CPU target 80%</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">HEALTHY</span>
                    </div>
                  </div>
                </div>

                {/* Resource Allocations summary */}
                <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Compute Utilization</h3>
                  
                  <div className="space-y-4 text-xs font-bold">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>CPU Utilization</span>
                        <span className="text-rose-500">42%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-600 rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Memory Utilization</span>
                        <span className="text-rose-500">68%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-600 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Storage Volumes Status</span>
                        <span className="text-emerald-500">Normal</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '22%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: CI/CD PIPELINE MANAGER */}
            {activeSection === 'cicd' && (
              <motion.div
                key="cicd"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Pipeline logs */}
                <div className="lg:col-span-2 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Build Steps</h3>
                    {isBuilding && <span className="text-[10px] font-bold text-rose-500 animate-pulse">Running Build Pipeline...</span>}
                  </div>

                  <div className="space-y-3.5">
                    {buildSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-semibold">
                        <div className="flex items-center space-x-3">
                          {step.status === 'success' && <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" />}
                          {step.status === 'running' && <RefreshCw className="w-5.5 h-5.5 text-rose-500 animate-spin" />}
                          {step.status === 'pending' && <Clock className="w-5.5 h-5.5 text-gray-400" />}
                          <span className={step.status === 'running' ? 'text-rose-500 font-bold' : ''}>{step.name}</span>
                        </div>
                        {step.duration && <span className="font-mono text-gray-400 text-[10px]">{step.duration}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline triggers */}
                <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Release trigger console</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Runs container vulnerability audits, unit tests, static code checkers, and deploy scripts.
                  </p>

                  <button
                    disabled={isBuilding}
                    onClick={runBuildPipeline}
                    className="w-full bg-rose-600 hover:bg-rose-750 disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isBuilding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Deploy Release</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: DISASTER RECOVERY & FAILOVER */}
            {activeSection === 'dr' && (
              <motion.div
                key="dr"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Active region status */}
                <div className="lg:col-span-2 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Cross-Region Replication status</h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Database Standby Sync Progress</span>
                        <span className={isFailingOver ? 'text-amber-500 font-extrabold animate-pulse' : 'text-emerald-500'}>
                          {isFailingOver ? 'Failover Routing...' : 'Synced (Point-In-Time)'}
                        </span>
                      </div>
                      
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                          style={{ width: `${drProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl">
                        <p className="text-[10px] text-gray-400">RPO (Recovery Point Objective)</p>
                        <p className="text-lg font-black text-rose-500">0 seconds</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl">
                        <p className="text-[10px] text-gray-400">RTO (Recovery Time Objective)</p>
                        <p className="text-lg font-black text-rose-500">&lt; 30 seconds</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automation failover trigger */}
                <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Manual region Failover</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Force route DNS mappings to standby regional node in Pune-DR during major Mumbai outage events.
                  </p>

                  <button
                    disabled={isFailingOver}
                    onClick={triggerFailover}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CloudLightning className="w-4 h-4" />
                    <span>Trigger Region Failover</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SRE SLO & SLI METRICS */}
            {activeSection === 'sre' && (
              <motion.div
                key="sre"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">SLO Dashboard</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase">Availability Target</p>
                      <h4 className="text-lg font-black text-rose-500">99.99%</h4>
                      <p className="text-[9.5px] text-emerald-500">Current 30d availability: 100%</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase">Latency Target (P99)</p>
                      <h4 className="text-lg font-black text-rose-500">&lt; 150ms</h4>
                      <p className="text-[9.5px] text-emerald-500">Current P99: 42ms</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase">Remaining Error Budget</p>
                      <h4 className="text-lg font-black text-emerald-500">99.88%</h4>
                      <p className="text-[9.5px] text-gray-400">0 incidents in last 7 days</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: SECRETS VAULT REGISTRY */}
            {activeSection === 'secrets' && (
              <motion.div
                key="secrets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Vault Certificate Registry</h3>

                  <div className="space-y-3 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">mcgm-wildcard-ssl-cert</p>
                        <p className="text-[10px] text-gray-400">Issuer: Let's Encrypt • Expiry: 78 days remaining</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">VALID</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">abdm-telemetry-tls-client-key</p>
                        <p className="text-[10px] text-gray-400">Issuer: National Health Authority CA • Expiry: 142 days remaining</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">VALID</span>
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
