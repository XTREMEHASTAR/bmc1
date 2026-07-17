import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map, 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Sliders, 
  FileText, 
  Send, 
  Sparkles, 
  Building, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Pill, 
  Share2, 
  Plus, 
  Download, 
  ChevronRight, 
  BarChart3, 
  HelpCircle, 
  Layers, 
  Calendar, 
  Filter, 
  Droplet, 
  Wind, 
  AlertCircle,
  TrendingDown,
  Info,
  Clock,
  CheckCircle,
  Truck,
  Database,
  Lock,
  RefreshCw,
  Sun,
  Moon,
  Maximize2
} from 'lucide-react';

// Live simulated wards for Mumbai GIS
const MUMBAI_WARDS = [
  { id: 'F-North', name: 'F-North (Sion/Dharavi)', pop: '820K', dengueRisk: 'CRITICAL', malariaRisk: 'HIGH', bedsOpen: 45, density: 'High', color: 'fill-red-500/20 stroke-red-500' },
  { id: 'A-Ward', name: 'A-Ward (Colaba/Fort)', pop: '210K', dengueRisk: 'LOW', malariaRisk: 'LOW', bedsOpen: 180, density: 'Low', color: 'fill-green-500/10 stroke-green-500' },
  { id: 'D-Ward', name: 'D-Ward (Malabar Hill)', pop: '380K', dengueRisk: 'LOW', malariaRisk: 'MODERATE', bedsOpen: 120, density: 'Medium', color: 'fill-yellow-500/10 stroke-yellow-500' },
  { id: 'G-South', name: 'G-South (Elphinstone)', pop: '620K', dengueRisk: 'HIGH', malariaRisk: 'HIGH', bedsOpen: 78, density: 'High', color: 'fill-orange-500/20 stroke-orange-500' },
  { id: 'K-West', name: 'K-West (Andheri)', pop: '950K', dengueRisk: 'HIGH', malariaRisk: 'MODERATE', bedsOpen: 92, density: 'High', color: 'fill-orange-500/15 stroke-orange-400' },
  { id: 'S-Ward', name: 'S-Ward (Bhandup)', pop: '740K', dengueRisk: 'MODERATE', malariaRisk: 'HIGH', bedsOpen: 110, density: 'Medium', color: 'fill-yellow-500/15 stroke-yellow-500' },
];

// Interactive mock hospitals
const HOSPITAL_PERFORMANCE = [
  { id: 'KEM', name: 'KEM Hospital, Parel', type: 'MCGM Tertiary', waitTime: '24 mins', satisfaction: 91, readmitRate: 4.8, beds: 1800, score: 94 },
  { id: 'Sion', name: 'Sion Hospital', type: 'MCGM Tertiary', waitTime: '32 mins', satisfaction: 88, readmitRate: 5.2, beds: 1400, score: 89 },
  { id: 'Nair', name: 'BYL Nair Ch. Hospital', type: 'MCGM Tertiary', waitTime: '18 mins', satisfaction: 93, readmitRate: 4.1, beds: 1600, score: 92 },
  { id: 'Cooper', name: 'R.N. Cooper Hospital', type: 'MCGM General', waitTime: '14 mins', satisfaction: 94, readmitRate: 3.9, beds: 900, score: 90 },
  { id: 'Bhabha', name: 'KB Bhabha Hospital, Bandra', type: 'MCGM General', waitTime: '28 mins', satisfaction: 85, readmitRate: 6.1, beds: 450, score: 82 },
];

interface GovernmentHealthIntelligenceProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function GovernmentHealthIntelligence({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: GovernmentHealthIntelligenceProps) {
  // Portal tabs
  const [activeTab, setActiveTab] = useState<'command' | 'gis' | 'disease' | 'performance' | 'inventory' | 'twin' | 'copilot' | 'reports'>('command');
  
  // Interactive Filters
  const [selectedWard, setSelectedWard] = useState<string>('F-North');
  const [isWallDisplay, setIsWallDisplay] = useState(false);
  const [liveAqi, setLiveAqi] = useState(142); // Moderate AQI
  const [temp, setTemp] = useState(31);
  const [vectorRiskMultiplier, setVectorRiskMultiplier] = useState(1.0); // digital twin factor

  // GIS Map Layer Toggles
  const [mapLayers, setMapLayers] = useState({
    hospitals: true,
    outbreaks: true,
    vectorRisk: false,
    flooding: false,
    airQuality: false
  });

  // Digital Twin Simulation Parameters
  const [simDengueSurge, setSimDengueSurge] = useState(40); // 40% surge simulation default
  const [simResults, setSimResults] = useState({
    icuShortage: 32,
    paracetamolDeficit: 85000,
    ambulanceDemand: 18,
    criticalWards: ['F-North', 'G-South'],
    recommendation: 'Deploy 5 additional mobile clinics to Dharavi Sector 3 and initiate vector-control fogging.'
  });

  // Recalculate twin projections when parameters move
  useEffect(() => {
    const surgeMultiplier = simDengueSurge / 100;
    setSimResults({
      icuShortage: Math.ceil(15 + surgeMultiplier * 42),
      paracetamolDeficit: Math.ceil(20000 + surgeMultiplier * 162500),
      ambulanceDemand: Math.ceil(8 + surgeMultiplier * 25),
      criticalWards: simDengueSurge > 60 ? ['F-North', 'G-South', 'K-West'] : ['F-North', 'G-South'],
      recommendation: simDengueSurge > 70
        ? 'ALERT: Immediate mobilization of State disaster reserves. Redirect non-emergency cases to peripheral clinics.'
        : 'Optimize bed rotation in F-North Ward tertiary hospitals and trigger auto-replenishment of anti-pyretics.'
    });
  }, [simDengueSurge]);

  // AI Policy Copilot States
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotChats, setCopilotChats] = useState<Array<{ q: string; a: string; confidence: number; evidence: string }>>([
    {
      q: "Where should we deploy additional mobile vaccination vans?",
      a: "Vaccination analytics identify Ward S (Bhandup) and K-West (Andheri) as having the lowest immunization rates for pediatric measles (78% vs 90% city SLA). Recommend dispatching 3 mobile health vans with community liaisons.",
      confidence: 94,
      evidence: "ABDM Immunization Registry statistics (Q2 2026)"
    }
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  const handleCopilotSubmit = (queryText: string) => {
    if (!queryText.trim()) return;
    setIsCopilotThinking(true);
    setTimeout(() => {
      const q = queryText.toLowerCase();
      let a = "";
      let confidence = 85;
      let evidence = "General Public Health Analytics Model";

      if (q.includes('dengue') || q.includes('f-north') || q.includes('outbreak')) {
        a = "Dengue outbreak risks are concentrated in F-North Ward (Sion/Dharavi) due to recent stagnant water logging clusters. The AI prediction engine recommends immediate local mosquito breeding cleanup programs and dispatching 3 portable diagnostic camps.";
        confidence = 96;
        evidence = "GIS Vector Risk & Rainfall Correlative Forecasting Engine";
      } else if (q.includes('icu') || q.includes('capacity') || q.includes('bed')) {
        a = "KEM Hospital and Sion Hospital are currently running at 96% and 98% ICU occupancy respectively. Recommended action: Direct stable post-operative patients to peripheral General Hospitals (Cooper/Bhabha) to free up 12 high-care ICU beds.";
        confidence = 92;
        evidence = "MCGM Centralized Live Bed Telemetry Database";
      } else if (q.includes('vaccine') || q.includes('shortage')) {
        a = "Projections for measles vaccines show that without inventory transfer, Sion Hospital will face a deficit of 2,400 vials within 9 days. Transfer surplus vials from Nair Hospital (currently at 140% safety threshold buffer).";
        confidence = 95;
        evidence = "Medicine Intelligence AI Procurement Pipeline";
      } else {
        a = "No critical alerts found for query. The city's overall public health safety grid remains green. Wards have sufficient stock buffer levels and general hospital wait times are optimal.";
        confidence = 88;
        evidence = "MCGM Unified Electronic Health Records (EHR) Hub";
      }

      setCopilotChats(prev => [{ q: queryText, a, confidence, evidence }, ...prev]);
      setCopilotQuery('');
      setIsCopilotThinking(false);
    }, 1500);
  };

  // Weather simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveAqi(prev => {
        const delta = Math.floor(Math.random() * 6) - 3;
        const newVal = prev + delta;
        return newVal < 90 ? 95 : newVal > 210 ? 190 : newVal;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#0b0f19] text-gray-100' : 'bg-slate-50/50 text-slate-900'} transition-all`}>
      {/* Platform Header */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors duration-200 bg-white/95 border-gray-100 dark:bg-[#0b0f19]/95 dark:border-blue-900/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#0A5BFF] rounded-xl text-white shadow-md">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM Health Intelligence</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">Smart City Grid</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Autonomous Population Health & Epidemic Command Console • State of Maharashtra
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => setIsWallDisplay(!isWallDisplay)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isWallDisplay 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'border-gray-200 hover:bg-slate-100 dark:border-blue-900/30 dark:hover:bg-slate-900/60 text-gray-400'
            }`}
            title="Toggle Large Wall Display Layout"
          >
            <Maximize2 className="w-4.5 h-4.5" />
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-blue-900/30 dark:hover:bg-slate-900/60 text-gray-400 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
          </button>

          <button 
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock Console</span>
          </button>
        </div>
      </header>

      {/* Main Tab Router */}
      <div className={`p-4 ${isWallDisplay ? 'max-w-full' : 'max-w-7xl'} mx-auto space-y-6`}>
        
        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Total Wards Tracked</span>
            <h3 className="text-xl font-black text-[#0A5BFF] dark:text-blue-400 mt-1">24 Municipal</h3>
            <p className="text-[10px] text-green-500 font-bold mt-1">✓ Live Sync Verified</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Active Hospital Nodes</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">112 Facilities</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">ABDM Linked</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Smart City AQI Status</span>
            <h3 className={`text-xl font-black mt-1 ${liveAqi > 150 ? 'text-red-500' : 'text-orange-500'}`}>{liveAqi} (Moderate)</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Particulate: PM2.5</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Active Surveillance Alerts</span>
            <h3 className="text-xl font-black text-rose-500 mt-1 animate-pulse">2 Hotspots</h3>
            <p className="text-[10px] text-rose-450 font-bold mt-1">Dengue: Dharavi Sector 2</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Total Population Base</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">12.44 Million</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Mumbai Metropolitan</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-2xl max-w-5xl shadow-sm">
          {[
            { id: 'command', label: 'City Health HUD', icon: Building },
            { id: 'gis', label: 'Interactive GIS Map', icon: Map },
            { id: 'disease', label: 'Disease surveillance', icon: AlertTriangle },
            { id: 'performance', label: 'Hospital performance', icon: BarChart3 },
            { id: 'inventory', label: 'Medicine logistics', icon: Pill },
            { id: 'twin', label: 'Healthcare digital twin', icon: Sliders },
            { id: 'copilot', label: 'AI Policy Copilot', icon: Sparkles },
            { id: 'reports', label: 'Reports & Research', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0A5BFF] text-white shadow-md'
                    : 'text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Dashboard View router */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: CITY HEALTH COMMAND HUD */}
            {activeTab === 'command' && (
              <motion.div
                key="command"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Smart City Facility Grid */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-105 dark:border-blue-900/10">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">MCGM Healthcare Network Facility Grid</h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">Live reporting status across facility categories</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-500 text-[9px] font-black rounded uppercase">All Systems Normal</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { title: 'Tertiary Hospitals', count: '18 Active', stat: '94% ICU Load', color: 'border-red-500/25 dark:border-red-500/10 bg-red-500/5' },
                        { title: 'Peripheral Hospitals', count: '24 Facilities', stat: '81% Bed Load', color: 'border-orange-500/25 dark:border-orange-500/10 bg-orange-500/5' },
                        { title: 'Urban PHCs (UPHC)', count: '112 Centers', stat: 'Daily: 14,200 OPD', color: 'border-emerald-500/25 dark:border-emerald-500/10 bg-emerald-500/5' },
                        { title: 'Mobile Health Units', count: '40 Units Active', stat: 'Dharavi Sector 2', color: 'border-blue-500/25 dark:border-blue-500/10 bg-blue-500/5' },
                        { title: 'Emergency Ambulances', count: '142 Dispatched', stat: 'Avg Response: 9.8m', color: 'border-indigo-500/25 dark:border-indigo-500/10 bg-indigo-500/5' },
                        { title: 'Blood Banks', count: '45 Approved', stat: 'Sufficient O- reserves', color: 'border-rose-500/25 dark:border-rose-500/10 bg-rose-500/5' }
                      ].map((facility, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${facility.color} flex flex-col justify-between space-y-3`}>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-gray-205">{facility.title}</h4>
                            <p className="text-xs font-black text-[#0A5BFF] dark:text-blue-400 mt-1">{facility.count}</p>
                          </div>
                          <span className="text-[10px] text-gray-500 font-extrabold uppercase">{facility.stat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Ward Summary table */}
                    <div className="pt-4 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Critical Ward Health Watchlist</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                          <thead>
                            <tr className="border-b border-gray-105 dark:border-blue-900/15 text-gray-400 font-extrabold">
                              <th className="py-2">Ward Name</th>
                              <th className="py-2">Surveillance Risk Index</th>
                              <th className="py-2">Available ICU Beds</th>
                              <th className="py-2">Population Density</th>
                              <th className="py-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MUMBAI_WARDS.map(w => (
                              <tr key={w.id} className="border-b border-gray-50 dark:border-blue-900/5 hover:bg-slate-100/50 dark:hover:bg-slate-900/20">
                                <td className="py-3 font-black text-slate-800 dark:text-slate-100">{w.name}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                                    w.dengueRisk === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' :
                                    w.dengueRisk === 'HIGH' ? 'bg-orange-500 text-white' :
                                    w.dengueRisk === 'MODERATE' ? 'bg-yellow-500 text-slate-900' :
                                    'bg-green-500 text-white'
                                  }`}>
                                    {w.dengueRisk} Risk
                                  </span>
                                </td>
                                <td className="py-3 font-bold">{w.bedsOpen} Open Beds</td>
                                <td className="py-3 text-gray-400">{w.density}</td>
                                <td className="py-3 text-right">
                                  <button 
                                    onClick={() => { setSelectedWard(w.id); setActiveTab('gis'); }}
                                    className="text-xs text-[#0A5BFF] dark:text-blue-400 hover:underline font-black cursor-pointer"
                                  >
                                    View Ward GIS →
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Environment, Outbreak Alerts & Weather Grid */}
                  <div className="space-y-6">
                    
                    {/* Environmental Grid Sensor Hub */}
                    <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-105 dark:border-blue-900/10">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">Environment & Vector Sensoring</h3>
                        <span className="text-[8px] font-black bg-blue-100 dark:bg-blue-950 text-blue-500 px-1.5 py-0.5 rounded uppercase">Smart City Live</span>
                      </div>

                      <div className="space-y-3 font-semibold text-xs">
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-blue-900/5">
                          <span className="text-gray-400">Average Temp / Humidity</span>
                          <span>31.2°C / 78% RH</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-blue-900/5">
                          <span className="text-gray-400">Water Logging Sensor (Dharavi)</span>
                          <span className="text-orange-500 font-bold">2.4 cm (Alert Threshold 5cm)</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-blue-900/5">
                          <span className="text-gray-400">Larval Vector Mosquito Index</span>
                          <span className="text-red-500 font-bold">High (3.4 / 5.0)</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-400">Air Quality Health Advice</span>
                          <span className="text-orange-500 font-bold">Sensitive groups wear masks</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart City Heat Alert Panel */}
                    <div className="bg-gradient-to-br from-[#0c1020] to-[#0A5BFF] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
                      <div className="space-y-3 relative z-10">
                        <span className="inline-block text-[9px] font-extrabold bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Smart City Decision Support
                        </span>
                        <h4 className="font-extrabold text-base tracking-tight">AI Early warning generated</h4>
                        <p className="text-xs text-blue-100/90 leading-relaxed">
                          Forecast predicts a **45% probability** of water-borne gastroenteritis surge in F-North Ward over the next 5 days due to heavy rainfall models.
                        </p>
                        <div className="pt-2">
                          <button 
                            onClick={() => setActiveTab('twin')}
                            className="bg-white text-[#0A5BFF] hover:bg-gray-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <span>Launch Twin Simulator</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: INTERACTIVE GIS MAP */}
            {activeTab === 'gis' && (
              <motion.div
                key="gis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Layer Control Panel */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-105 dark:border-blue-900/10">
                    <Layers className="w-4.5 h-4.5 text-[#0A5BFF] dark:text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Map Layer Filters</h3>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {Object.keys(mapLayers).map((layer) => (
                      <label key={layer} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(mapLayers as any)[layer]}
                          onChange={(e) => setMapLayers(prev => ({ ...prev, [layer]: e.target.checked }))}
                          className="rounded text-[#0A5BFF] focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
                          {layer.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Ward Selection selector */}
                  <div className="pt-4 border-t border-gray-105 dark:border-blue-900/10">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Municipal Ward Quick Zoom</h4>
                    <div className="flex flex-col gap-1.5">
                      {MUMBAI_WARDS.map(w => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWard(w.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-black transition-all ${
                            selectedWard === w.id
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0A5BFF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                              : 'text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map Visualizer (SVG Mumbai/Maharashtra Ward grid) */}
                <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[500px]">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-105 dark:border-blue-900/10">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">Smart City Live GIS Interface</h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">Active Ward Zoom: {selectedWard}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-[9px] font-black text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span>Outbreak Clusters</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2" />
                      <span>MCGM Hospitals</span>
                    </div>
                  </div>

                  {/* SVG Ward Maps representation */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    <svg className="w-full max-w-lg h-auto" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g className="transition-all duration-300">
                        {/* Wards Map paths */}
                        <path d="M 50 50 L 150 20 L 250 80 L 120 180 Z" className={`transition-all stroke-2 cursor-pointer ${selectedWard === 'F-North' ? 'fill-red-500/20 stroke-red-500' : 'fill-slate-500/5 stroke-slate-400 hover:fill-slate-500/10'}`} onClick={() => setSelectedWard('F-North')} />
                        <text x="130" y="80" className="text-[10px] font-extrabold fill-slate-700 dark:fill-slate-400 select-none">F-North</text>

                        <path d="M 250 80 L 380 40 L 450 150 L 320 220 Z" className={`transition-all stroke-2 cursor-pointer ${selectedWard === 'K-West' ? 'fill-orange-500/20 stroke-orange-500' : 'fill-slate-500/5 stroke-slate-400 hover:fill-slate-500/10'}`} onClick={() => setSelectedWard('K-West')} />
                        <text x="330" y="120" className="text-[10px] font-extrabold fill-slate-700 dark:fill-slate-400 select-none">K-West</text>

                        <path d="M 120 180 L 320 220 L 250 350 L 80 320 Z" className={`transition-all stroke-2 cursor-pointer ${selectedWard === 'G-South' ? 'fill-orange-500/20 stroke-orange-500' : 'fill-slate-500/5 stroke-slate-400 hover:fill-slate-500/10'}`} onClick={() => setSelectedWard('G-South')} />
                        <text x="180" y="270" className="text-[10px] font-extrabold fill-slate-700 dark:fill-slate-400 select-none">G-South</text>

                        <path d="M 320 220 L 450 150 L 550 280 L 410 350 Z" className={`transition-all stroke-2 cursor-pointer ${selectedWard === 'S-Ward' ? 'fill-yellow-500/20 stroke-yellow-500' : 'fill-slate-500/5 stroke-slate-400 hover:fill-slate-500/10'}`} onClick={() => setSelectedWard('S-Ward')} />
                        <text x="440" y="250" className="text-[10px] font-extrabold fill-slate-700 dark:fill-slate-400 select-none">S-Ward</text>
                      </g>

                      {/* Overlays */}
                      {mapLayers.hospitals && (
                        <g>
                          <circle cx="120" cy="110" r="8" fill="#0A5BFF" stroke="white" strokeWidth="1.5" className="animate-pulse" />
                          <text x="132" y="114" fill="#0A5BFF" className="text-[8px] font-black dark:fill-blue-400">Sion Hospital</text>
                          
                          <circle cx="210" cy="240" r="8" fill="#0A5BFF" stroke="white" strokeWidth="1.5" />
                          <text x="222" y="244" fill="#0A5BFF" className="text-[8px] font-black dark:fill-blue-400">KEM Hospital</text>
                        </g>
                      )}

                      {mapLayers.outbreaks && (
                        <g>
                          {/* Pulsing red concentric circles representing dengue risk */}
                          <circle cx="100" cy="140" r="15" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
                          <circle cx="100" cy="140" r="8" fill="#ef4444" />
                        </g>
                      )}
                    </svg>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">GIS Environmental Correlatives</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">High vector risk correlated with rain/water logging levels in Dharavi sector.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMapLayers(prev => ({ ...prev, vectorRisk: true }))}
                      className="bg-[#0A5BFF] hover:bg-[#002f66] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Overlay Vector Forecast Layer
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: DISEASE SURVEILLANCE & PREDICTION */}
            {activeTab === 'disease' && (
              <motion.div
                key="disease"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Outbreak Trend Watchlist */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">Epidemic Disease Surveillance Monitor</h3>
                    
                    <div className="space-y-3">
                      {[
                        { name: 'Dengue Outbreak Vector', week: '+24%', count: '412 Cases', trend: 'rising', color: 'text-red-500 bg-red-500/5' },
                        { name: 'Malaria Infection Index', week: '-2%', count: '180 Cases', trend: 'stable', color: 'text-gray-400 bg-gray-500/5' },
                        { name: 'Typhoid / Enteric Fever', week: '+14%', count: '92 Cases', trend: 'rising', color: 'text-orange-500 bg-orange-500/5' },
                        { name: 'Tuberculosis (TB) Control', week: '-8%', count: '310 Cases', trend: 'falling', color: 'text-emerald-500 bg-emerald-500/5' },
                      ].map((dis, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl flex items-center justify-between ${dis.color}`}>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{dis.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Weekly Report: {dis.count}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black">{dis.week}</span>
                            {dis.trend === 'rising' ? <TrendingUp className="w-4 h-4 text-red-500" /> : dis.trend === 'falling' ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <Activity className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: AI Disease Prediction Parameters */}
                  <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-105 dark:border-blue-900/10">
                      <Sparkles className="w-4.5 h-4.5 text-[#0A5BFF] dark:text-blue-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider">AI Predictive Outbreak Models</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-black uppercase">Mosquito Index Risk Multiplier</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.1"
                            value={vectorRiskMultiplier}
                            onChange={(e) => setVectorRiskMultiplier(parseFloat(e.target.value))}
                            className="flex-1 accent-[#0A5BFF]"
                          />
                          <span className="text-xs font-black">{vectorRiskMultiplier.toFixed(1)}x</span>
                        </div>
                      </div>

                      <div className="space-y-3 font-semibold text-xs pt-2">
                        <h4 className="text-[10px] font-black uppercase text-gray-400">Correlative Insights:</h4>
                        <p className="text-[11.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          At **{vectorRiskMultiplier}x vector index**, the projected Dengue incubation timeline drops from 12 days to **7 days**, signaling a potential doubling of cases by next Friday.
                        </p>
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-500 text-[10.5px] font-bold">
                          ⚠️ Action Required: Mobilize local vector breeding cleanup within 48 hours.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 4: HOSPITAL PERFORMANCE BENCHMARKING */}
            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-105 dark:border-blue-900/10">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">Municipal Hospital Benchmarking (Non-Punitive)</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">Benchmarking criteria are designed for resource planning and infrastructure support rather than ranking.</p>
                  </div>
                  <button className="flex items-center space-x-1 text-xs text-[#0A5BFF] dark:text-blue-400 font-black">
                    <Download className="w-4 h-4" />
                    <span>Export Analytics</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead>
                      <tr className="border-b border-gray-105 dark:border-blue-900/15 text-gray-400 font-extrabold">
                        <th className="py-2.5">Facility Name</th>
                        <th className="py-2.5">Facility Type</th>
                        <th className="py-2.5">Avg OPD Waiting Time</th>
                        <th className="py-2.5">Patient Satisfaction</th>
                        <th className="py-2.5">30-Day Readmit Rate</th>
                        <th className="py-2.5">Total ABDM Beds</th>
                        <th className="py-2.5 text-right">Performance Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HOSPITAL_PERFORMANCE.map(h => (
                        <tr key={h.id} className="border-b border-gray-50 dark:border-blue-900/5 hover:bg-slate-100/50 dark:hover:bg-slate-900/20">
                          <td className="py-3.5 font-black text-slate-800 dark:text-slate-105">{h.name}</td>
                          <td className="py-3.5 text-gray-400 font-semibold">{h.type}</td>
                          <td className="py-3.5 font-bold">{h.waitTime}</td>
                          <td className="py-3.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-700 dark:text-slate-200">{h.satisfaction}%</span>
                              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${h.satisfaction}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-gray-500 font-mono">{h.readmitRate}%</td>
                          <td className="py-3.5 text-slate-800 dark:text-slate-300 font-bold">{h.beds} Beds</td>
                          <td className="py-3.5 text-right">
                            <span className="px-2 py-1 bg-blue-105 dark:bg-blue-950 text-[#0A5BFF] dark:text-blue-400 font-black rounded">
                              {h.score} / 100
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 5: MEDICINE & VACCINE LOGISTICS */}
            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Medicine Shortages list */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">City-Wide Essential Drug Stock</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Polio Oral Vaccine Vials', qty: '48,000 Vials', status: 'Sufficient Buffer (18 days)', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                      { name: 'Insulin Glargine Pen units', qty: '12,500 Units', status: 'Sufficient Buffer (11 days)', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                      { name: 'ORS Packets (Rehydration)', qty: '2,400 Packets', status: 'Shortage Warning: Dharavi depleted', color: 'text-red-500 animate-pulse', bg: 'bg-red-500/5' },
                      { name: 'IV Normal Saline 500ml', qty: '82,000 Bags', status: 'Sufficient Buffer (14 days)', color: 'text-emerald-500', bg: 'bg-emerald-500/5' }
                    ].map((drug, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border border-gray-100 dark:border-blue-900/10 ${drug.bg} flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{drug.name}</h4>
                            <p className={`text-[10px] font-black mt-0.5 ${drug.color}`}>{drug.status}</p>
                          </div>
                          <span className="text-xs font-black">{drug.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Logistics Forecasts */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#0A5BFF]" />
                    AI Procurement Recommendations
                  </h3>

                  <div className="space-y-4 font-semibold text-xs leading-relaxed">
                    <p className="text-gray-500 dark:text-gray-400">
                      Based on current monsoon rainfall projections, seasonal dengue cases are forecasted to raise paracetamol consumption by **210%** starting next week.
                    </p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[#0A5BFF] dark:text-blue-400 text-[10.5px] font-bold">
                      💡 Recommendation: Trigger automatic transfer of 20,000 paracetamol tabs from Ward D peripheral reserve to Ward F-North clinics.
                    </div>
                    <button className="w-full bg-[#0A5BFF] hover:bg-[#002f66] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
                      Execute Buffer Redistribution
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 6: HEALTHCARE DIGITAL TWIN SIMULATION */}
            {activeTab === 'twin' && (
              <motion.div
                key="twin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Simulation Control Sliders */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-105 dark:border-blue-900/10">
                    <Sliders className="w-4.5 h-4.5 text-[#0A5BFF] dark:text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Simulation Variables</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 font-black uppercase">Simulate Dengue Surge Factor</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="10"
                          value={simDengueSurge}
                          onChange={(e) => setSimDengueSurge(parseInt(e.target.value))}
                          className="flex-1 accent-[#0A5BFF]"
                        />
                        <span className="text-xs font-black text-red-500">+{simDengueSurge}%</span>
                      </div>
                    </div>

                    <div className="space-y-1 font-semibold text-xs pt-2">
                      <p className="text-gray-400">This digital twin models epidemic stress testing against the entire MCGM health grid capacity.</p>
                    </div>
                  </div>
                </div>

                {/* Simulation results representation */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">Projected System Load Forecasts</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-red-500">Projected ICU Bed Deficit</span>
                      <h3 className="text-2xl font-black text-red-500 mt-2">+{simResults.icuShortage} Beds</h3>
                    </div>
                    <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-orange-500">Paracetamol Deficit</span>
                      <h3 className="text-2xl font-black text-orange-500 mt-2">-{simResults.paracetamolDeficit.toLocaleString()} Tabs</h3>
                    </div>
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-indigo-500">Additional Ambulance Units</span>
                      <h3 className="text-2xl font-black text-indigo-500 mt-2">+{simResults.ambulanceDemand} Vehicles</h3>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-blue-900/5 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#0A5BFF] dark:text-blue-400">AI Mitigation Strategy</h4>
                    <p className="text-xs font-semibold leading-relaxed text-gray-500 dark:text-gray-400">{simResults.recommendation}</p>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 7: AI POLICY COPILOT */}
            {activeTab === 'copilot' && (
              <motion.div
                key="copilot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Chat Console */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-105 dark:border-blue-900/10">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400 flex items-center gap-1">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                      Government Policy Intelligence Advisor
                    </h3>
                    <span className="text-[9px] text-gray-400 font-black">ACTIVE AGENT</span>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar flex flex-col-reverse">
                    {copilotChats.map((chat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="bg-[#0A5BFF] text-white p-3 rounded-2xl text-xs font-black max-w-sm">
                            {chat.q}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-slate-50 dark:bg-slate-950/60 border border-gray-100 dark:border-blue-900/10 p-4 rounded-3xl text-xs leading-relaxed max-w-xl text-slate-700 dark:text-slate-300 font-semibold space-y-2">
                            <p>{chat.a}</p>
                            <div className="flex justify-between items-center text-[9px] text-gray-400 font-extrabold uppercase pt-2 border-t border-slate-100 dark:border-blue-900/5">
                              <span>Confidence: {chat.confidence}%</span>
                              <span>Evidence: {chat.evidence}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask policymaker queries: e.g. Which wards have rising dengue cases? or What is KEM ICU occupancy?"
                      value={copilotQuery}
                      onChange={(e) => setCopilotQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCopilotSubmit(copilotQuery)}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-blue-900/10 rounded-2xl text-xs font-semibold outline-none focus:ring-1 focus:ring-[#0A5BFF]"
                    />
                    <button
                      onClick={() => handleCopilotSubmit(copilotQuery)}
                      className="bg-[#0A5BFF] hover:bg-[#002f66] text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      {isCopilotThinking ? 'Analyzing...' : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Predefined prompt helpers */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Suggested Policy Queries</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      "Which wards have rising dengue cases?",
                      "Where should we deploy additional ambulances?",
                      "Which hospitals are nearing ICU capacity?"
                    ].map((query, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCopilotSubmit(query)}
                        className="text-left p-3 bg-slate-50 dark:bg-[#1f2937]/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-black text-slate-700 dark:text-slate-400 transition-all cursor-pointer border border-gray-100 dark:border-blue-900/10"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 8: EXECUTIVE REPORTS & RESEARCH PORTAL */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Reports generator panel */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0A5BFF] dark:text-blue-400">Executive Policy Reporting Desk</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Daily Outbreak Report (PDF)', size: '2.4 MB', date: 'Generated today 08:00 AM' },
                      { name: 'Weekly ICU Capacity & Readmission (Excel)', size: '14.2 MB', date: 'Generated yesterday' },
                      { name: 'Annual Public Health Indicators (PowerPoint)', size: '42.0 MB', date: 'Generated Q2 2026' }
                    ].map((rep, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-blue-900/10 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-205">{rep.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold">{rep.date} • {rep.size}</p>
                        </div>
                        <button className="p-2 bg-[#0A5BFF] text-white hover:bg-[#002f66] rounded-xl cursor-pointer">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Research Open Data compliance info */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-blue-900/10 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-105 dark:border-blue-900/10">
                    <Database className="w-4.5 h-4.5 text-[#0A5BFF] dark:text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider">De-Identified Research Data</h3>
                  </div>

                  <div className="space-y-3 font-semibold text-xs leading-relaxed">
                    <p className="text-gray-500 dark:text-gray-400">
                      Privacy-preserving FHIR compliant open datasets are automatically published for approved medical and research institutions.
                    </p>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center space-x-2">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>DPDP Act 2023 & ABDM Compliance Enforced.</span>
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
