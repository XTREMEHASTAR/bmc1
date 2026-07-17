import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  Bell,
  Clock,
  Sparkles,
  AlertOctagon,
  Users,
  Activity,
  Sliders,
  Settings,
  Flame,
  FileCheck,
  Check,
  CheckSquare,
  Accessibility,
  Laptop,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  XCircle,
  FileText
} from 'lucide-react';

interface TestCase {
  name: string;
  category: 'unit' | 'api' | 'workflow' | 'performance' | 'accessibility' | 'security' | 'clinical';
  status: 'passed' | 'failed' | 'running' | 'pending';
}

export default function QualityEngineeringDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'tests' | 'ai' | 'performance' | 'ops' | 'uat'>('tests');

  // Test Runner States
  const [testCases, setTestCases] = useState<TestCase[]>([
    { name: 'Patient ABHA ID validation formulas', category: 'unit', status: 'passed' },
    { name: 'Drug interaction contraindication triggers', category: 'unit', status: 'passed' },
    { name: 'FHIR R4 DiagnosticReport compatibility', category: 'api', status: 'passed' },
    { name: 'UHI consultation booking callback rate-limiting', category: 'api', status: 'passed' },
    { name: 'Doctor scheduling to payment flow verification', category: 'workflow', status: 'passed' },
    { name: 'WCAG AA keyboard focus indicators compliance', category: 'accessibility', status: 'passed' },
    { name: 'Ventilator MQTT telemetry payload injection checks', category: 'security', status: 'passed' },
    { name: 'Clinical safety sign-off for ICU prescription modules', category: 'clinical', status: 'passed' }
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Load simulator parameters
  const [surgeScenario, setSurgeScenario] = useState<'Normal' | 'Peak OPD' | 'Pandemic Surge' | 'Mass Casualty'>('Normal');
  const [simulatedUsers, setSimulatedUsers] = useState(1000);
  const [simulatedLatency, setSimulatedLatency] = useState(12);

  // UAT Clinician signoffs
  const [clinicalApprovals, setClinicalApprovals] = useState({
    medicationSafetyChecked: true,
    radiologyWorkflowsVerified: true,
    emergencySosProtocolSigned: true
  });

  // Run simulated test automation suite
  const runTestingSuite = () => {
    setIsRunningTests(true);
    setTestCases(prev => prev.map(tc => {
      if (tc.status === 'pending' || tc.category === 'clinical') return { ...tc, status: 'running' };
      return tc;
    }));

    setTimeout(() => {
      setTestCases(prev => prev.map(tc => {
        if (tc.status === 'running') return { ...tc, status: 'passed' };
        return tc;
      }));
      setIsRunningTests(false);
    }, 2000);
  };

  // Adjust surge scenarios
  const handleScenarioChange = (scenario: 'Normal' | 'Peak OPD' | 'Pandemic Surge' | 'Mass Casualty') => {
    setSurgeScenario(scenario);
    if (scenario === 'Normal') {
      setSimulatedUsers(1000);
      setSimulatedLatency(12);
    } else if (scenario === 'Peak OPD') {
      setSimulatedUsers(15000);
      setSimulatedLatency(42);
    } else if (scenario === 'Pandemic Surge') {
      setSimulatedUsers(95000);
      setSimulatedLatency(180);
    } else if (scenario === 'Mass Casualty') {
      setSimulatedUsers(120000);
      setSimulatedLatency(240);
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#06080e] text-gray-100' : 'bg-slate-50 text-slate-800'} transition-all`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors bg-white/95 border-gray-200 dark:bg-[#090b11]/95 dark:border-gray-900">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl text-white shadow-md">
            <FileCheck className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM Quality & Validation Grid</span>
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">QA Portal</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Clinical Safety Audits • AI Accuracy Calibration • Surges Load Simulator • Incident Playbooks
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
            className="hidden sm:flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock QA Console</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">

        {/* Quality metrics panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Automated Test Coverage</span>
            <h3 className="text-xl font-black text-amber-500 mt-1">94.2% Passed</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ 1,242 tests passing</span>
          </div>

          <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">AI Hallucination rate</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">0.14%</h3>
            <span className="text-[10px] text-gray-400 font-semibold mt-1">Target model calibration</span>
          </div>

          <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Accessibility Compliance</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">WCAG 2.1 AA</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Contrast & Large text validated</span>
          </div>

          <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Active Incident Tickets</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">0 Incidents</h3>
            <span className="text-[10px] text-indigo-400 font-bold mt-1">SLA targets: 100% met</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-6xl shadow-sm">
          {[
            { id: 'tests', label: 'Test Case Runner', icon: CheckSquare },
            { id: 'ai', label: 'AI Validation Suite', icon: Sparkles },
            { id: 'performance', label: 'Surge Load Simulator', icon: Sliders },
            { id: 'ops', label: 'Incident Operations', icon: Activity },
            { id: 'uat', label: 'UAT Clinical Sign-off', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content renderers */}
        <div className="mt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: AUTOMATED TEST CASE RUNNER */}
            {activeTab === 'tests' && (
              <motion.div
                key="tests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Test case log queue */}
                <div className="lg:col-span-2 bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">Test Execution Pipeline</h3>
                    {isRunningTests && <span className="text-[10px] font-bold text-amber-500 animate-pulse">Running automation scripts...</span>}
                  </div>

                  <div className="space-y-3">
                    {testCases.map((tc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold">
                        <div className="flex items-center space-x-3">
                          {tc.status === 'passed' && <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" />}
                          {tc.status === 'running' && <RotateCw className="w-5.5 h-5.5 text-amber-500 animate-spin" />}
                          {tc.status === 'pending' && <Clock className="w-5.5 h-5.5 text-gray-400" />}
                          <span>{tc.name}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-gray-400 text-[8px] font-black rounded uppercase">
                          {tc.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trigger test validation suite */}
                <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Execute Automation Suite</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                    Simulates linter validations, FHIR compliance converters, API response validations, and security scans.
                  </p>

                  <button
                    disabled={isRunningTests}
                    onClick={runTestingSuite}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isRunningTests ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Run Test Cases</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: AI CLINICAL SAFETY EVALUATION */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* AI Safety Metrics charts */}
                <div className="lg:col-span-2 bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">AI Prompt Quality & Safety Thresholds</h3>

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-slate-800 dark:text-slate-100">Prompt Injection Block Rate</p>
                        <p className="text-[10px] text-gray-400">Protects LLM terminals from patient input manipulation.</p>
                      </div>
                      <span className="font-mono text-emerald-500 font-bold">100.0% Protected</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-slate-800 dark:text-slate-100">Medical Guideline Compliance</p>
                        <p className="text-[10px] text-gray-400">Verifies LLM outputs against official WHO clinical playbooks.</p>
                      </div>
                      <span className="font-mono text-emerald-500 font-bold">99.86% Accurate</span>
                    </div>
                  </div>
                </div>

                {/* AI Bias metrics */}
                <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Bias & Calibration Index</h3>
                  
                  <div className="space-y-3 text-xs font-bold">
                    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-gray-400">Clinical Relevance</span>
                      <span className="text-amber-500">99.9%</span>
                    </div>

                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Latency average</span>
                      <span className="text-amber-500 font-mono">180ms</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SURGE PERFORMANCE SIMULATOR */}
            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Latency / load status logs */}
                <div className="lg:col-span-2 bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">Simulated Surge Telemetry</h3>

                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
                      <p className="text-[10px] text-gray-400">Simulated API Concurrent Users</p>
                      <p className="text-lg font-black text-amber-500">{simulatedUsers.toLocaleString()}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
                      <p className="text-[10px] text-gray-400">P99 System Latency</p>
                      <p className="text-lg font-black text-amber-500">{simulatedLatency} ms</p>
                    </div>
                  </div>
                </div>

                {/* Scenario switcher triggers */}
                <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Select Load Scenario</h3>

                  <div className="space-y-2">
                    {(['Normal', 'Peak OPD', 'Pandemic Surge', 'Mass Casualty'] as any[]).map(sc => (
                      <button
                        key={sc}
                        onClick={() => handleScenarioChange(sc)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          surgeScenario === sc
                            ? 'bg-amber-500 text-white shadow'
                            : 'bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:bg-slate-100'
                        }`}
                      >
                        {sc} Load Scenario
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: INCIDENT OPERATIONS RUNBOOKS */}
            {activeTab === 'ops' && (
              <motion.div
                key="ops"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">Incident Alert Center</h3>
                  
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/60 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    <div>
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold">All systems operating within normal parameters.</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">SLA availability: 100% last 24 hours.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: UAT CLINICAL SIGN-OFF */}
            {activeTab === 'uat' && (
              <motion.div
                key="uat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Clinical verification checkboxes */}
                <div className="lg:col-span-2 bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-500">Clinician Sign-off Checklist</h3>

                  <div className="space-y-3.5 text-xs font-semibold">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">Medication Safety verification</p>
                        <p className="text-[10px] text-gray-400">Ensures dosage limit warning alerts fire reliably.</p>
                      </div>
                      <button
                        onClick={() => setClinicalApprovals({ ...clinicalApprovals, medicationSafetyChecked: !clinicalApprovals.medicationSafetyChecked })}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                          clinicalApprovals.medicationSafetyChecked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        {clinicalApprovals.medicationSafetyChecked ? 'Approved ✓' : 'Approve'}
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">Radiology PACS linking verification</p>
                        <p className="text-[10px] text-gray-400">Validates that medical images display on diagnostic reports.</p>
                      </div>
                      <button
                        onClick={() => setClinicalApprovals({ ...clinicalApprovals, radiologyWorkflowsVerified: !clinicalApprovals.radiologyWorkflowsVerified })}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                          clinicalApprovals.radiologyWorkflowsVerified ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        {clinicalApprovals.radiologyWorkflowsVerified ? 'Approved ✓' : 'Approve'}
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-100">Emergency SOS SMS callback routing</p>
                        <p className="text-[10px] text-gray-400">Verifies automated alerts route to target on-call clinicians.</p>
                      </div>
                      <button
                        onClick={() => setClinicalApprovals({ ...clinicalApprovals, emergencySosProtocolSigned: !clinicalApprovals.emergencySosProtocolSigned })}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                          clinicalApprovals.emergencySosProtocolSigned ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        {clinicalApprovals.emergencySosProtocolSigned ? 'Approved ✓' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gate block details */}
                <div className="bg-white dark:bg-[#10131d] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider">UAT Compliance Gate</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                      Production deployments require 100% of clinician validations to be approved before feature flags are promoted.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold text-center">
                    {clinicalApprovals.medicationSafetyChecked &&
                    clinicalApprovals.radiologyWorkflowsVerified &&
                    clinicalApprovals.emergencySosProtocolSigned ? (
                      <span className="text-emerald-500 uppercase">✓ Deploy Readiness: Passed</span>
                    ) : (
                      <span className="text-amber-500 uppercase">⚠️ Awaiting Clinical Approvals</span>
                    )}
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
