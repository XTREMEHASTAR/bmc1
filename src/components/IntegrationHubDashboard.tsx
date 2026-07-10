import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Database,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Zap,
  Code,
  Radio,
  Sliders,
  Play,
  RotateCw,
  Search,
  Bell,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Send,
  Plus,
  Key,
  ShieldCheck,
  Server,
  FileSpreadsheet,
  Link,
  BookOpen,
  ArrowRight,
  Sparkles,
  LifeBuoy
} from 'lucide-react';

// Seed mock data for FHIR R4 schemas
const FHIR_SCHEMAS = {
  Patient: {
    resourceType: "Patient",
    id: "pat-088",
    identifier: [{ system: "https://ndhm.gov.in/abha", value: "91-0822-9912" }],
    name: [{ text: "Rahul Patil" }],
    gender: "male",
    birthDate: "1994-08-15"
  },
  Observation: {
    resourceType: "Observation",
    id: "obs-991",
    status: "final",
    category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "laboratory" }] }],
    code: { coding: [{ system: "http://loinc.org", code: "29463-7", display: "Body Weight" }] },
    subject: { reference: "Patient/pat-088" },
    valueQuantity: { value: 72, unit: "kg", system: "http://unitsofmeasure.org", code: "kg" }
  },
  Encounter: {
    resourceType: "Encounter",
    id: "enc-402",
    status: "finished",
    class: { code: "AMB", display: "ambulatory" },
    subject: { reference: "Patient/pat-088" },
    period: { start: "2026-07-09T10:00:00Z", end: "2026-07-09T10:45:00Z" }
  }
};

// Mock Event Bus log queue
const INITIAL_EVENTS = [
  { id: 'EV-302', type: 'Patient Created', source: 'ABDM ABHA Switch', time: '12:42:01 PM', status: 'DISPATCHED', payload: '{ abhaId: "rahul.patil@abha" }' },
  { id: 'EV-303', type: 'Lab Completed', source: 'LIS Clinic Node Dadar', time: '12:40:15 PM', status: 'DISPATCHED', payload: '{ test: "HbA1c", result: "6.2%" }' },
  { id: 'EV-304', type: 'Emergency Alert', source: 'ICU Ventilator 4', time: '12:38:00 PM', status: 'ROUTED', payload: '{ trigger: "Oxygen saturation drop" }' }
];

// Webhook Registry
const INITIAL_WEBHOOKS = [
  { id: 'WH-1', url: 'https://partner.tatahealth.in/webhook/mcgm', event: 'Lab Completed', active: true, failures: 0 },
  { id: 'WH-2', url: 'https://national.insurance.gov.in/claims/notify', event: 'Discharge Summary', active: true, failures: 2 }
];

interface IntegrationHubDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function IntegrationHubDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: IntegrationHubDashboardProps) {
  // Sub-navigation tabs
  const [activeTab, setActiveTab] = useState<'gateway' | 'fhir' | 'abdm' | 'events' | 'webhooks' | 'devportal' | 'marketplace' | 'ai'>('gateway');

  // Interactive states
  const [apiKeys, setApiKeys] = useState<string[]>(['MCGM_LIVE_KEY_882910a']);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [selectedFhirResource, setSelectedFhirResource] = useState<'Patient' | 'Observation' | 'Encounter'>('Patient');
  const [fhirPayload, setFhirPayload] = useState(JSON.stringify(FHIR_SCHEMAS.Patient, null, 2));

  // Generate API key simulator
  const generateApiKey = () => {
    const key = `MCGM_LIVE_KEY_${Math.floor(100000 + Math.random() * 900000).toString(16)}`;
    setApiKeys([...apiKeys, key]);
  };

  // Trigger Custom Event Bus event simulator
  const [customEventType, setCustomEventType] = useState('Patient Created');
  const triggerCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = {
      id: `EV-${Math.floor(300 + Math.random() * 700)}`,
      type: customEventType,
      source: 'Developer Sandbox Console',
      time: new Date().toLocaleTimeString(),
      status: 'DISPATCHED',
      payload: JSON.stringify({ triggeredBy: 'DeveloperSandbox', timestamp: Date.now() })
    };
    setEvents([newEvent, ...events]);
  };

  // FHIR schema switcher handler
  const handleFhirSelect = (res: 'Patient' | 'Observation' | 'Encounter') => {
    setSelectedFhirResource(res);
    setFhirPayload(JSON.stringify(FHIR_SCHEMAS[res], null, 2));
  };

  // Add webhook simulator
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvent, setWebhookEvent] = useState('Lab Completed');
  const registerWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    const newWh = {
      id: `WH-${webhooks.length + 1}`,
      url: webhookUrl,
      event: webhookEvent,
      active: true,
      failures: 0
    };
    setWebhooks([...webhooks, newWh]);
    setWebhookUrl('');
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#0b0f19] text-gray-150' : 'bg-slate-50 text-slate-800'} transition-all`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors bg-white/95 border-gray-100 dark:bg-[#0f172a]/95 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-md">
            <Globe className="w-5.5 h-5.5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM Integration Backbone</span>
                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">Interoperability Hub</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              FHIR R4 Gateway • ABDM Unified Health Interface (UHI) • Realtime Event Bus
            </p>
          </div>
        </div>

        {/* Global controls */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-900 text-gray-450 cursor-pointer"
          >
            {isDarkMode ? (
              <span className="text-yellow-400 font-bold text-xs">Light Mode</span>
            ) : (
              <span className="text-slate-700 font-bold text-xs">Dark Mode</span>
            )}
          </button>

          <button 
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-750 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock API Console</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">

        {/* Integration KPI Banners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Total API Traffic</span>
            <h3 className="text-xl font-black text-indigo-500 mt-1">4.2M Requests</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ 99.98% Uptime</span>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Average Latency</span>
            <h3 className="text-xl font-black text-indigo-500 mt-1">18 ms</h3>
            <span className="text-[10px] text-gray-400 font-semibold mt-1">FHIR Gateway processing</span>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Event Bus Backlog</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">0 Pending</h3>
            <span className="text-[10px] text-green-500 font-bold mt-1">All subscribers updated</span>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">ABDM Registry Sync</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">Connected</h3>
            <span className="text-[10px] text-indigo-400 font-bold mt-1">Sync: 1 min ago</span>
          </div>
        </div>

        {/* Tab Selector Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl max-w-6xl shadow-sm">
          {[
            { id: 'gateway', label: 'API Gateway Metrics', icon: Server },
            { id: 'fhir', label: 'FHIR Sandbox', icon: Database },
            { id: 'abdm', label: 'ABDM Interop', icon: ShieldCheck },
            { id: 'events', label: 'Event Bus (Logs)', icon: Radio },
            { id: 'webhooks', label: 'Webhook Engine', icon: Link },
            { id: 'devportal', label: 'Developer Portal', icon: Code },
            { id: 'marketplace', label: 'API Marketplace', icon: BookOpen },
            { id: 'ai', label: 'AI Prompt Gateway', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-450 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab rendering panels */}
        <div className="mt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: API GATEWAY METRICS */}
            {activeTab === 'gateway' && (
              <motion.div
                key="gateway"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Traffic and error graphs mockups */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Endpoint Performance Metrics</h3>
                  
                  <div className="space-y-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-slate-800 dark:text-slate-100">GET /api/v1/fhir/Patient</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Rate Limit: 500 req/min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-indigo-500">12,402 calls</p>
                        <p className="text-[10px] text-emerald-500 font-bold">14 ms avg</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-slate-800 dark:text-slate-100">POST /api/v1/abdm/link-records</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Rate Limit: 100 req/min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-indigo-500">2,112 calls</p>
                        <p className="text-[10px] text-emerald-500 font-bold">42 ms avg</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Key management */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Credential Workspace</h3>
                  <p className="text-xs text-gray-450 leading-relaxed font-semibold">
                    Generate and manage credentials for custom app/hospital integrations.
                  </p>

                  <div className="space-y-2">
                    {apiKeys.map((key, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-xl flex justify-between items-center">
                        <span className="font-mono text-xs">{key}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-500 text-[8.5px] font-black rounded uppercase">ACTIVE</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={generateApiKey}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Generate API Key
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: FHIR SANDBOX */}
            {activeTab === 'fhir' && (
              <motion.div
                key="fhir"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Resource Schema viewer selector */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black uppercase tracking-wider">FHIR Resource Schemas</h3>
                  
                  <div className="space-y-2">
                    {['Patient', 'Observation', 'Encounter'].map(res => (
                      <button
                        key={res}
                        onClick={() => handleFhirSelect(res as any)}
                        className={`w-full text-left p-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          selectedFhirResource === res
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 text-gray-450 hover:bg-slate-100'
                        }`}
                      >
                        {res} Schema (R4)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live JSON Diff / preview container */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">FHIR JSON Playpen</h3>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">HL7 Compliant Payload</span>
                  </div>

                  <textarea
                    readOnly
                    value={fhirPayload}
                    className="w-full h-80 bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-gray-800 outline-none resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* TAB 3: ABDM INTEROPERABILITY */}
            {activeTab === 'abdm' && (
              <motion.div
                key="abdm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">ABDM Registry Sync status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-xs font-black">ABHA Linking Engine</h4>
                      <p className="text-[10px] text-gray-400">Simulates user credential verification with national ABHA registry, syncing local records with individual Health Lockers.</p>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">ACTIVE</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-xs font-black">Consent Manager Callback Handler</h4>
                      <p className="text-[10px] text-gray-400">Resolves automated webhook requests triggered by patients setting or revoking telemetry access rights.</p>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: EVENT BUS LOGS */}
            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Event Queue logs */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Active Event Logs</h3>
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold px-2 py-0.5 rounded uppercase">0 ms backlog</span>
                  </div>

                  <div className="overflow-x-auto text-xs text-left">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold">
                          <th className="py-2">Event ID</th>
                          <th className="py-2">Event Type</th>
                          <th className="py-2">Source</th>
                          <th className="py-2">Time</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(ev => (
                          <tr key={ev.id} className="border-b border-gray-50 dark:border-gray-850 hover:bg-slate-100/50 dark:hover:bg-slate-900/10">
                            <td className="py-3 font-mono">{ev.id}</td>
                            <td className="py-3 font-bold text-slate-800 dark:text-slate-100">{ev.type}</td>
                            <td className="py-3 text-gray-450">{ev.source}</td>
                            <td className="py-3 font-mono">{ev.time}</td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">
                                {ev.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Trigger custom event simulator */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Trigger Sandbox Event</h3>
                  
                  <form onSubmit={triggerCustomEvent} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-bold uppercase">Event Type</label>
                      <select
                        value={customEventType}
                        onChange={(e) => setCustomEventType(e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-xl text-xs outline-none"
                      >
                        <option value="Patient Created">Patient Created</option>
                        <option value="Lab Completed">Lab Completed</option>
                        <option value="Emergency Alert">Emergency Alert</option>
                        <option value="Medicine Dispensed">Medicine Dispensed</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-750 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Trigger Event
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB 5: WEBHOOK ENGINE */}
            {activeTab === 'webhooks' && (
              <motion.div
                key="webhooks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Active webhooks lists */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Registered Webhook Subscriptions</h3>

                  <div className="space-y-3">
                    {webhooks.map(wh => (
                      <div key={wh.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center gap-4 text-xs font-semibold">
                        <div className="space-y-1">
                          <p className="text-slate-800 dark:text-slate-100 font-mono break-all">{wh.url}</p>
                          <p className="text-[10px] text-gray-400">Event: {wh.event}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">ACTIVE</span>
                          {wh.failures > 0 && <p className="text-[9px] text-red-500 font-bold mt-1">{wh.failures} retries</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add new Webhook form */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Register Webhook</h3>

                  <form onSubmit={registerWebhook} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-450 font-bold uppercase">Destination Endpoint URL</label>
                      <input
                        type="url"
                        placeholder="https://yourdomain.com/webhooks"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-xl text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-450 font-bold uppercase">Trigger Event</label>
                      <select
                        value={webhookEvent}
                        onChange={(e) => setWebhookEvent(e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-xl text-xs outline-none"
                      >
                        <option value="Lab Completed">Lab Completed</option>
                        <option value="Patient Created">Patient Created</option>
                        <option value="Discharge Summary">Discharge Summary</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-750 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Register Webhook URL
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB 6: DEVELOPER PORTAL */}
            {activeTab === 'devportal' && (
              <motion.div
                key="devportal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Developer Documentation & OpenAPI Specs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-slate-800 dark:text-slate-100 font-black">SDK Downloads</h4>
                      <p className="text-[10px] text-gray-400">Direct packages for React Native, Node.js, Python, and Java supporting ABDM callbacks.</p>
                      <button className="text-indigo-500 font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                        Download Node.js SDK <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-slate-800 dark:text-slate-100 font-black">Mock Server Endpoints</h4>
                      <p className="text-[10px] text-gray-400">Sandbox domain mirroring clinical database operations for local app testing.</p>
                      <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">sandbox.mcgm.gov.in/api</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-slate-800 dark:text-slate-100 font-black">Changelog v2.14</h4>
                      <p className="text-[10px] text-gray-400">Updated Patient resource metadata formats conforming with DPDP 2023 laws.</p>
                      <span className="text-emerald-500 text-[9px] font-bold">Stable Version</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 7: API MARKETPLACE */}
            {activeTab === 'marketplace' && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Partner & External Integrations Marketplace</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-slate-800 dark:text-slate-100 font-black">Google Indoor Maps API</h4>
                        <p className="text-[10px] text-gray-400">Integrates hospital layout mapping, enabling real-time navigation inside large MCGM complexes.</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">CONNECTED</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-slate-800 dark:text-slate-100 font-black">Jan Aushadhi Inventory Engine</h4>
                        <p className="text-[10px] text-gray-400">Real-time availability audits of generic medicines at Jan Aushadhi Kendra stores.</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">CONNECTED</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 8: AI PROMPT GATEWAY */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* AI router parameters */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Central AI Routing Parameters</h3>

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                      <h4 className="text-slate-800 dark:text-slate-100 font-black">Model Priority Router</h4>
                      <p className="text-[10px] text-gray-400">Routes clinical diagnosis tasks to fine-tuned medical LLMs while keeping general reception questions on standard API models.</p>
                      <div className="flex justify-between text-[9px] uppercase font-bold text-gray-400">
                        <span>Clinical Tasks: Medical LLM</span>
                        <span>Billing Tasks: Standard LLM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI token statistics */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Model Usage Cost Analytics</h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-850">
                      <span className="text-gray-400">Total Tokens Processed</span>
                      <span className="font-mono">1.8M tokens</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Operational Cost</span>
                      <span className="text-indigo-500 font-mono">₹4.8 Lakhs</span>
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
