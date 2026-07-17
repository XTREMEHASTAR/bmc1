import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Building2, 
  Clock, 
  HeartPulse, 
  Sparkles, 
  Plus, 
  X, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  ShieldAlert,
  Users,
  DollarSign,
  Map,
  Truck,
  Send,
  Download,
  BarChart2,
  Sliders,
  Moon,
  Sun,
  Monitor,
  AlertCircle,
  FileText,
  CheckCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Maximize2
} from 'lucide-react';

// Mock types
interface PatientMock {
  id: string;
  name: string;
  age: number;
  gender: string;
  token: string;
  condition: string;
  metric: string;
  waitTime?: number;
}

export default function CommandCenterTab() {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'twin' | 'map' | 'emergency' | 'copilot' | 'resources' | 'financials' | 'reports'>('twin');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isWallMode, setIsWallMode] = useState(false);
  const [isDisasterMode, setIsDisasterMode] = useState(false);
  
  // Interactive Map States
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  
  // AI Copilot States
  const [nlpQuery, setNlpQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{ query: string; answer: string; chartType?: string; confidence: number }[]>([
    {
      query: "Predict tomorrow's patient load.",
      answer: "Model forecasts an influx of 580-620 walk-in patients tomorrow. A 22% surge is expected in Pediatrics and General Medicine between 9:30 AM and 12:30 PM due to local viral outbreak clusters. Recommend deploying 3 auxiliary nurses to Triage Counters 1 & 2.",
      chartType: 'load',
      confidence: 94
    }
  ]);
  const [isNlpRunning, setIsNlpRunning] = useState(false);

  // Live heart rate telemetry arrays for ICU beds
  const [icuTelemetries, setIcuTelemetries] = useState<Record<string, number[]>>({
    'ICU Bed 1': new Array(20).fill(72),
    'ICU Bed 2': new Array(20).fill(65),
    'ICU Bed 3': new Array(20).fill(110),
    'ICU Bed 4': new Array(20).fill(80),
  });

  // Simulated active ambulances on live transit
  const [ambulances, setAmbulances] = useState([
    { id: 'AMB-01', location: 'Dadar TT Circle', eta: '4 mins', status: 'En-route (Trauma Case)', progress: 65, vitals: 'BP 110/70, SpO2 94%', driver: 'Rajesh Shinde' },
    { id: 'AMB-02', location: 'Sion Circle Flyover', eta: '2 mins', status: 'En-route (Cardiac)', progress: 85, vitals: 'BP 140/90, HR 105', driver: 'Amit Patil' },
    { id: 'AMB-03', location: 'Prabhadevi Chowk', eta: '12 mins', status: 'Dispatched (Routine)', progress: 20, vitals: 'Stable', driver: 'Vinay Kamble' },
    { id: 'AMB-04', location: 'Worli Sea Face', eta: '8 mins', status: 'En-route (Respiratory)', progress: 45, vitals: 'SpO2 89% (On Oxygen)', driver: 'Sanjay More' },
  ]);

  // Telemetry updates
  useEffect(() => {
    const timer = setInterval(() => {
      // Update ICU Heart Rate graphs
      setIcuTelemetries(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(bed => {
          const bedArr = [...next[bed].slice(1)];
          const base = bed === 'ICU Bed 3' ? 105 : bed === 'ICU Bed 2' ? 64 : 75;
          const fluctuation = Math.floor(Math.random() * 8) - 4;
          let pulse = base + fluctuation;
          if (Math.random() > 0.9) pulse = bed === 'ICU Bed 3' ? 130 : 45; // pvc spikes
          bedArr.push(pulse);
          next[bed] = bedArr;
        });
        return next;
      });

      // Update Ambulance coordinates progression
      setAmbulances(prev => 
        prev.map(amb => {
          const nextProg = amb.progress + Math.floor(Math.random() * 4) + 1;
          return {
            ...amb,
            progress: nextProg >= 100 ? 0 : nextProg,
            eta: nextProg >= 100 ? 'Arrived' : `${Math.ceil((100 - nextProg) / 8)} mins`
          };
        })
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Audio system alert for disaster mode
  useEffect(() => {
    if (isDisasterMode) {
      // Flashing alert feedback
      const alertAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
      alertAudio.volume = 0.15;
      alertAudio.play().catch(() => {});
    }
  }, [isDisasterMode]);

  // AI clinical query handler
  const handleNlpSearch = (query: string) => {
    if (!query.trim()) return;
    setIsNlpRunning(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      let answer = "";
      let chartType: string | undefined = undefined;
      let confidence = 89;

      if (q.includes('hba1c') || q.includes('diabetic')) {
        answer = "Found 3 patients with HbA1c > 9.0 in Ward C. Recommended Action: Alert primary doctor to adjust Insulin/Metformin schedules prior to discharge to prevent readmission risk. 1. Ramesh Sawant (9.8%), 2. Meena Kulkarni (10.2%), 3. Gopal Hegde (9.1%).";
        confidence = 96;
      } else if (q.includes('wait') || q.includes('crowd') || q.includes('opd')) {
        answer = "OPD Department wait times are abnormal in Orthopedics (+28 mins over SLA) and Pediatrics (+19 mins over SLA). Cause: High walk-in registration volumes and 1 scheduled doctor absence. Recommend: Route 2 non-urgent triage tickets to General Medicine.";
        chartType = 'wait';
        confidence = 92;
      } else if (q.includes('medicine') || q.includes('stock') || q.includes('pharmacy')) {
        answer = "Pharmacy stock forecast identifies Paracetamol 650mg and Amoxicillin 500mg running below safety buffer levels (depleting in 3 days due to high viral fever presentations). Recommend trigger auto-purchase replenishment order (Buffer: 150,000 tablets).";
        chartType = 'inventory';
        confidence = 95;
      } else {
        answer = "No critical risk patterns matching query. General hospital vitals are within standard operating thresholds. Let me know if you would like me to audit ICU ventilator logs or emergency blood unit reserves.";
        confidence = 88;
      }

      setChatHistory(prev => [{ query, answer, chartType, confidence }, ...prev]);
      setNlpQuery('');
      setIsNlpRunning(false);
    }, 1500);
  };

  // Export reports simulator
  const [isExporting, setIsExporting] = useState(false);
  const handleExport = (type: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Executive Hospital Report exported successfully in ${type} format.`);
    }, 2000);
  };

  // Department statistics mapping for interactive map
  const DEPT_INFO: Record<string, { title: string; occupied: number; capacity: number; waitTime: string; staff: string; risk: string }> = {
    'emergency': { title: 'Emergency Trauma Care', occupied: 12, capacity: 15, waitTime: '2 mins', staff: '4 Doctors, 8 Nurses', risk: 'HIGH (Red alert)' },
    'icu': { title: 'Intensive Care Unit (ICU)', occupied: 18, capacity: 20, waitTime: 'N/A', staff: '2 Doctors, 10 Nurses', risk: 'Stable (90% capacity)' },
    'opd': { title: 'Outpatient Clinic (OPD)', occupied: 114, capacity: 150, waitTime: '38 mins', staff: '12 Doctors, 6 Nurses', risk: 'MODERATE (OPD Surge)' },
    'pharmacy': { title: 'Hospital Central Pharmacy', occupied: 45, capacity: 60, waitTime: '9 mins', staff: '4 Pharmacists', risk: 'Low stock alerts active' },
    'ot': { title: 'Operation Theatre Block', occupied: 3, capacity: 5, waitTime: 'Turnaround: 18m', staff: '6 Surgeons, 12 Nurses', risk: 'On Schedule' },
  };

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 font-sans ${isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Banner Navigation & Title */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              MCGM Hospital Command Center
              <span className="text-xs bg-[#0A5BFF] text-white px-2 py-0.5 rounded font-black tracking-normal">MISSION CONTROL</span>
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-Time Digital Twin & Predictive Intelligence Dashboard • Active Node: Sion Central Command
          </p>
        </div>

        {/* Global Action Switches */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsDisasterMode(!isDisasterMode)}
            className={`px-4 py-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg ${
              isDisasterMode 
                ? 'bg-red-600 text-white animate-pulse border border-red-500' 
                : 'bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isDisasterMode ? 'ACTIVE: MASS CASUALTY MODE' : 'MASS CASUALTY OVERRIDE'}</span>
          </button>

          <button 
            onClick={() => setIsWallMode(!isWallMode)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-gray-500 cursor-pointer"
            title="Toggle Large Wall Display Mode"
          >
            <Maximize2 className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-gray-500 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* Flashing Disaster Mode Banner */}
      <AnimatePresence>
        {isDisasterMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-red-600 text-white p-4 rounded-2xl flex items-center justify-between border-2 border-red-500/50 shadow-2xl animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 animate-bounce" />
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">STATE-LEVEL DISASTER PROTOCOL TRIGGERED</h4>
                <p className="text-xs text-red-100 font-semibold mt-0.5">
                  OPD admissions suspended. All non-critical cases redirected to clinics. Reallocating ICU beds 14-20 for trauma emergency.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black text-red-400 rounded-md">CODE RED ALERT</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Outbreak Surveillance Notification */}
      <div className="mt-4 bg-orange-500/10 border border-orange-500/20 dark:border-orange-950/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/20 text-orange-500 rounded-xl">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-500">Live Outbreak Surveillance Signal</h4>
            <p className="text-[10.5px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
              Gastroenteritis cases surge +24% in Dharavi (F-North Ward). Proactively dispatched 50 rehydration kits and anti-viral drugs to Pharmacy.
            </p>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-orange-500 text-white rounded-md">EPIDEMIC ALERT</span>
      </div>

      {/* CommandCenter Sub-navigation Tab Grid */}
      <div className="flex flex-wrap gap-2 mt-6 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl max-w-4xl border border-slate-200 dark:border-slate-800">
        {[
          { id: 'twin', label: 'Digital Twin Telemetry', icon: Activity },
          { id: 'map', label: 'Interactive Floor Map', icon: Map },
          { id: 'emergency', label: 'Emergency Command', icon: Truck },
          { id: 'copilot', label: 'AI Copilot & Forecasts', icon: Sparkles },
          { id: 'resources', label: 'Resource & Staff Control', icon: Sliders },
          { id: 'financials', label: 'Financial Analytics', icon: DollarSign },
          { id: 'reports', label: 'Executive Report Desk', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#0A5BFF] text-white shadow-lg'
                  : 'text-gray-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Command Center Tab Layout Router */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DIGITAL TWIN TELEMETRY */}
          {activeSubTab === 'twin' && (
            <motion.div
              key="twin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Primary KPIs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'Patients Triaged Today', value: '1,412', trend: '+12% from yesterday', trendUp: true, color: 'text-blue-500' },
                  { title: 'Bed Occupancy Rate', value: '94.2%', trend: '12 General beds open', trendUp: false, color: 'text-emerald-500' },
                  { title: 'Avg OPD Wait Time', value: '18 mins', trend: '-4 mins from SLA', trendUp: false, color: 'text-purple-500' },
                  { title: 'Active Emergency Cases', value: '18 Cases', trend: 'Disaster bypass status: Active', trendUp: true, color: 'text-red-500' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider block">{kpi.title}</span>
                    <h3 className={`text-2xl font-black tracking-tight mt-1 ${kpi.color}`}>{kpi.value}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-1">
                      {kpi.trend}
                    </p>
                  </div>
                ))}
              </div>

              {/* Digital Twin Occupancy Status Rows */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Department Live status widgets */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4.5 h-4.5 text-[#0A5BFF]" />
                      Live Digital Twin Corridor telemetry
                    </h3>
                    <span className="text-[9px] font-bold text-green-500 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1.5" />
                      Live telemetry active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Intensive Care Unit (ICU)', count: '18 / 20 Beds', status: 'CRITICAL STAGE', barColor: 'bg-red-500', bg: 'bg-red-500/5' },
                      { name: 'Pediatrics Ward', count: '45 / 50 Beds', status: 'Near Capacity', barColor: 'bg-orange-500', bg: 'bg-orange-500/5' },
                      { name: 'General Medicine OPD', count: '114 / 150 Limit', status: 'Active OPD Desk', barColor: 'bg-[#0A5BFF]', bg: 'bg-blue-500/5' },
                      { name: 'Radiology / X-Ray', count: '3 / 4 Scanner rooms', status: 'Turnaround: 14m', barColor: 'bg-emerald-500', bg: 'bg-emerald-500/5' }
                    ].map((dept, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border border-slate-100 dark:border-slate-800 ${dept.bg} flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-108">{dept.name}</h4>
                            <p className="text-[9px] text-gray-500 font-extrabold mt-0.5">{dept.status}</p>
                          </div>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-108">{dept.count}</span>
                        </div>
                        {/* Progress */}
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                          <div className={`h-full ${dept.barColor}`} style={{ width: '85%' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Realtime Bed allocation maps */}
                  <div className="pt-2">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">ICU Active Bed Vitals Tracker</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {Object.keys(icuTelemetries).map((bed, idx) => {
                        const bpm = icuTelemetries[bed][icuTelemetries[bed].length - 1];
                        return (
                          <div key={bed} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                            <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase">
                              <span>Bed {idx + 1}</span>
                              <span className={bpm > 100 ? 'text-red-500 animate-pulse' : 'text-green-500'}>{bpm} BPM</span>
                            </div>
                            {/* Live sparkline graph */}
                            <div className="h-10 flex items-end justify-between mt-3 pt-1 border-t border-slate-200/10">
                              {icuTelemetries[bed].map((pulse, pIdx) => {
                                const h = Math.max(8, Math.min(36, (pulse / 130) * 36));
                                return (
                                  <span 
                                    key={pIdx} 
                                    style={{ height: `${h}px` }} 
                                    className={`w-0.5 rounded-full transition-all duration-300 ${
                                      bpm > 100 ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Ambulance GPS Tracker */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Truck className="w-4 h-4 text-[#0A5BFF]" />
                      Emergency Fleet Transit
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[#0A5BFF] dark:text-blue-305 text-[8px] font-black rounded">3 Dispatched</span>
                  </div>

                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
                    {ambulances.map(amb => (
                      <div key={amb.id} className="p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                        <div className="flex justify-between text-[10.5px]">
                          <span className="font-black text-slate-800 dark:text-slate-108">{amb.id}</span>
                          <span className="font-black text-[#0A5BFF] dark:text-blue-400">{amb.eta}</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-505"> {amb.location} • Driver: {amb.driver}</p>
                        <div className="flex justify-between items-center text-[8.5px] font-black">
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-955/20 text-red-650 rounded">
                            {amb.status}
                          </span>
                          <span className="text-gray-400 font-mono">{amb.vitals}</span>
                        </div>
                        {/* Progress */}
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-[#0A5BFF] rounded-full transition-all duration-1000" 
                            style={{ width: `${amb.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE FLOOR MAP */}
          {activeSubTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Floor Plan Interactive SVG */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Map className="w-4.5 h-4.5 text-[#0A5BFF]" />
                    Interactive floor plan & indoor routing map
                  </h3>
                  <span className="text-[9px] text-gray-400 font-extrabold">CLICK DEPARTMENT TO VIEW TELEMETRY</span>
                </div>

                {/* SVG Visualizer */}
                <div className="relative border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 min-h-[350px]">
                  <svg className="w-full max-w-md h-auto" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background grid grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Department Block: Emergency */}
                    <g 
                      onClick={() => setSelectedDept('emergency')}
                      className="cursor-pointer group"
                    >
                      <rect x="30" y="40" width="160" height="120" rx="12" fill={selectedDept === 'emergency' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.05)'} stroke="#ef4444" strokeWidth={selectedDept === 'emergency' ? '3' : '1.5'} className="transition-all" />
                      <text x="50" y="80" fill="#ef4444" className="text-xs font-extrabold select-none">EMERGENCY WARD</text>
                      <text x="50" y="100" fill="#ef4444" className="text-[10px] font-bold select-none">Beds occupied: 12 / 15</text>
                      <circle cx="160" cy="65" r="4" fill="#ef4444" className="animate-pulse" />
                    </g>

                    {/* Department Block: ICU */}
                    <g 
                      onClick={() => setSelectedDept('icu')}
                      className="cursor-pointer group"
                    >
                      <rect x="210" y="40" width="180" height="120" rx="12" fill={selectedDept === 'icu' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)'} stroke="#3b82f6" strokeWidth={selectedDept === 'icu' ? '3' : '1.5'} className="transition-all" />
                      <text x="230" y="80" fill="#3b82f6" className="text-xs font-extrabold select-none">ICU BLOCK A</text>
                      <text x="230" y="100" fill="#3b82f6" className="text-[10px] font-bold select-none">Ventilators Active: 6</text>
                    </g>

                    {/* Department Block: OT */}
                    <g 
                      onClick={() => setSelectedDept('ot')}
                      className="cursor-pointer group"
                    >
                      <rect x="410" y="40" width="160" height="120" rx="12" fill={selectedDept === 'ot' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.05)'} stroke="#f59e0b" strokeWidth={selectedDept === 'ot' ? '3' : '1.5'} className="transition-all" />
                      <text x="430" y="80" fill="#f59e0b" className="text-xs font-extrabold select-none">THEATRE OT</text>
                      <text x="430" y="100" fill="#f59e0b" className="text-[10px] font-bold select-none">3 active surgeries</text>
                    </g>

                    {/* Department Block: OPD */}
                    <g 
                      onClick={() => setSelectedDept('opd')}
                      className="cursor-pointer group"
                    >
                      <rect x="30" y="200" width="360" height="150" rx="12" fill={selectedDept === 'opd' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.05)'} stroke="#8b5cf6" strokeWidth={selectedDept === 'opd' ? '3' : '1.5'} className="transition-all" />
                      <text x="50" y="240" fill="#8b5cf6" className="text-xs font-extrabold select-none">GENERAL MEDICINE OPD</text>
                      <text x="50" y="260" fill="#8b5cf6" className="text-[10px] font-bold select-none">Queue: 114 Patients • Wait: 38m</text>
                    </g>

                    {/* Department Block: Pharmacy */}
                    <g 
                      onClick={() => setSelectedDept('pharmacy')}
                      className="cursor-pointer group"
                    >
                      <rect x="410" y="200" width="160" height="150" rx="12" fill={selectedDept === 'pharmacy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.05)'} stroke="#10b881" strokeWidth={selectedDept === 'pharmacy' ? '3' : '1.5'} className="transition-all" />
                      <text x="430" y="240" fill="#10b881" className="text-xs font-extrabold select-none">PHARMACY</text>
                      <text x="430" y="260" fill="#10b881" className="text-[10px] font-bold select-none">Fast refill active</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Department details view panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                {selectedDept && DEPT_INFO[selectedDept] ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[8.5px] font-black uppercase text-gray-500">Selected Node Telemetry</span>
                        <h4 className="text-sm font-black text-[#0A5BFF] mt-0.5">{DEPT_INFO[selectedDept].title}</h4>
                      </div>
                      <button 
                        onClick={() => setSelectedDept(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="space-y-3 font-semibold text-xs text-slate-708 dark:text-slate-208">
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-gray-500">Live Bed / Capacity Occupancy</span>
                        <span>{DEPT_INFO[selectedDept].occupied} / {DEPT_INFO[selectedDept].capacity}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-gray-500">Expected Wait Time</span>
                        <span className="text-[#0A5BFF] font-black">{DEPT_INFO[selectedDept].waitTime}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-gray-500">On-Duty Medical Staff</span>
                        <span>{DEPT_INFO[selectedDept].staff}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Triage Assessment Risk</span>
                        <span className="text-orange-505 font-bold">{DEPT_INFO[selectedDept].risk}</span>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="pt-4 space-y-2">
                      <button className="w-full bg-[#0A5BFF] hover:bg-[#002f66] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
                        Reallocate Staff Buffer
                      </button>
                      <button className="w-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
                        Audit Equipment Logs
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center py-12 text-center text-gray-400 space-y-2">
                    <Info className="w-8 h-8 opacity-40 text-gray-400" />
                    <p className="text-xs font-bold">Select any floor segment or department rect on the SVG floorplan to fetch direct clinical telemetry.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: EMERGENCY COMMAND */}
          {activeSubTab === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Trauma & Red Alert Cases */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                    Critical Trauma & Emergency Queue
                  </h3>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-955/20 text-red-500 text-[8.5px] font-black rounded uppercase">Severe Bypass Enabled</span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'TRM-401', name: 'Leela Fernandes', age: '69', problem: 'Severe Dyspnea / SpO2 86%', triage: 'Priority 1 (Red)', doctor: 'Dr. Sunita Deshmukh (Emergency Coordinator)', bedsAllocated: 'Bed 2 (Allocated)' },
                    { id: 'TRM-402', name: 'Harish Mehta', age: '50', problem: 'STEMI Chest Pain', triage: 'Priority 1 (Red)', doctor: 'Dr. Anil Patil (Cardiologist)', bedsAllocated: 'ICU Bed A-1' },
                    { id: 'TRM-403', name: 'Sanjay More', age: '32', problem: 'Open Tibia Fracture (Road Trauma)', triage: 'Priority 2 (Orange)', doctor: 'Dr. Rahul Joshi (Orthopedic)', bedsAllocated: 'OT-4 Prep Area' }
                  ].map(trm => (
                    <div key={trm.id} className="p-4 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-108">{trm.name}</span>
                          <span className="text-[10px] text-gray-500 font-bold">({trm.age} yrs • ID: {trm.id})</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold">{trm.problem}</p>
                        <span className="inline-block text-[8px] font-black px-1.5 py-0.5 bg-red-500 text-white rounded uppercase tracking-wider">{trm.triage}</span>
                      </div>
                      
                      <div className="md:text-right space-y-1.5 flex flex-col justify-between">
                        <div className="text-[10.5px]">
                          <span className="text-gray-505">Allocated: </span>
                          <span className="font-black text-slate-800 dark:text-slate-205">{trm.bedsAllocated}</span>
                        </div>
                        <p className="text-[9.5px] text-[#0A5BFF] font-bold">{trm.doctor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trauma Reserves telemetry */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-[#0A5BFF]" />
                  Emergency Trauma Reserves
                </h3>

                <div className="space-y-3 font-semibold text-xs">
                  {[
                    { name: 'O-Negative Blood Units', qty: '18 Units', alert: false, color: 'text-emerald-500' },
                    { name: 'A-Positive Blood Units', qty: '4 Units', alert: true, color: 'text-red-500 animate-pulse' },
                    { name: 'Active Trauma Vent units', qty: '3 available', alert: false, color: 'text-slate-800 dark:text-slate-200' },
                    { name: 'Emergency Surgical staff', qty: '2 On-Call teams', alert: false, color: 'text-slate-800 dark:text-slate-200' }
                  ].map((res, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-gray-500">{res.name}</span>
                      <span className={`font-black ${res.color}`}>{res.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
                    Request Red Cross Blood Buffer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AI COPILOT & FORECASTS */}
          {activeSubTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Conversational Terminal */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-[#0A5BFF]" />
                    Conversational Operational Copilot
                  </h3>
                  <span className="text-[9px] text-gray-500 font-extrabold uppercase">MCGM-Predictive V2</span>
                </div>

                {/* Chat window */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar flex flex-col-reverse">
                  {chatHistory.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-[#0A5BFF] text-white p-3 rounded-2xl text-xs font-black max-w-sm">
                          {item.query}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl text-xs leading-relaxed max-w-xl font-semibold text-slate-800 dark:text-slate-208 space-y-3">
                          <p>{item.answer}</p>
                          <div className="flex justify-between items-center text-[9px] text-gray-500 font-extrabold uppercase pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span>Confidence Model: {item.confidence}%</span>
                            <span>Reasoning Trace: ML-Surge-Pediatrics</span>
                          </div>
                          
                          {/* Mini render forecast chart */}
                          {item.chartType === 'load' && (
                            <div className="pt-2">
                              <div className="flex justify-between items-end h-16 pt-2 border-b border-slate-200 dark:border-slate-800">
                                {[
                                  { h: '08:00', v: 45 },
                                  { h: '10:00', v: 120 },
                                  { h: '12:00', v: 95 },
                                  { h: '14:00', v: 35 },
                                  { h: '16:00', v: 65 }
                                ].map((bar, bIdx) => (
                                  <div key={bIdx} className="flex flex-col items-center flex-1 space-y-1">
                                    <div style={{ height: `${(bar.v / 120) * 36}px` }} className={`w-3.5 rounded-t-sm ${bar.v > 100 ? 'bg-orange-500' : 'bg-[#0A5BFF]'}`} />
                                    <span className="text-[8px] font-black text-gray-400">{bar.h}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Query submission box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask command: e.g. Why is OPD crowded today? or Which medicines will run out?"
                    value={nlpQuery}
                    onChange={(e) => setNlpQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNlpSearch(nlpQuery)}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold outline-none focus:ring-1 focus:ring-[#0A5BFF]"
                  />
                  <button 
                    onClick={() => handleNlpSearch(nlpQuery)}
                    className="bg-[#0A5BFF] hover:bg-[#002f66] text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    {isNlpRunning ? 'Running...' : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sample Action queries list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider">Suggested Command Queries</h3>
                <div className="flex flex-col gap-2.5">
                  {[
                    "Why is OPD crowded today?",
                    "Which medicines will run out this week?",
                    "Suggest operational improvements for Dadar triage"
                  ].map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNlpSearch(query)}
                      className="text-left p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: RESOURCE & STAFF CONTROL */}
          {activeSubTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Critical Stocks lists */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-4 h-4 text-[#0A5BFF]" />
                  Central Inventory and Stock reserves
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Oxygen Liquid Cylinders', qty: '480,000 Liters', status: 'Sufficient Buffer (12 days)', color: 'text-green-500', barColor: 'bg-green-500' },
                    { name: 'Ventilator Spare Sets', qty: '4 / 22 available', status: 'Warning Level reached', color: 'text-orange-500', barColor: 'bg-orange-500' },
                    { name: 'Paracetamol 650mg Tabs', qty: '2,400 tablets', status: 'CRITICAL: Refill urgently', color: 'text-red-500 animate-pulse', barColor: 'bg-red-500' },
                    { name: 'Amoxicillin Antibiotics', qty: '12,500 tablets', status: 'Sufficient Buffer (8 days)', color: 'text-green-500', barColor: 'bg-green-500' }
                  ].map((stock, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-108">{stock.name}</h4>
                          <p className={`text-[9.5px] font-black mt-0.5 ${stock.color}`}>{stock.status}</p>
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-105">{stock.qty}</span>
                      </div>
                      {/* Bar */}
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                        <div className={`h-full ${stock.barColor}`} style={{ width: '60%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-Duty Shifts Allocation */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-4.5 h-4.5 text-[#0A5BFF]" />
                  Active Shifts Roster
                </h3>

                <div className="space-y-3">
                  {[
                    { name: 'Dr. Sunita Deshmukh', dept: 'Emergency ER Duty', time: '08:00 - 16:00', status: 'Active' },
                    { name: 'Dr. Anil Patil', dept: 'Cardiology OPD Duty', time: '09:00 - 15:00', status: 'Active' },
                    { name: 'Sister Priya Sen', dept: 'Triage Counter 1', time: '08:00 - 16:00', status: 'Active' }
                  ].map((staff, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-black text-slate-800 dark:text-slate-108">{staff.name}</h5>
                        <p className="text-[9.5px] text-gray-500 font-bold mt-0.5">{staff.dept} • {staff.time}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-955/20 text-green-600 text-[8.5px] font-black rounded uppercase">{staff.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: FINANCIAL ANALYTICS */}
          {activeSubTab === 'financials' && (
            <motion.div
              key="financials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Daily revenue metrics */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-4.5 h-4.5 text-[#0A5BFF]" />
                  OPD & Scheme Revenue Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Today\'s Billings', val: '₹1,24,900', desc: '480 checkouts issued' },
                    { title: 'PM-JAY Scheme cashless override', val: '₹84,500', desc: '142 patients covered (68%)' },
                    { title: 'Out of Pocket cash receipts', val: '₹40,400', desc: 'General consultations' }
                  ].map((rev, idx) => (
                    <div key={idx} className="p-4 bg-slate-55 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black uppercase text-gray-500">{rev.title}</span>
                      <h4 className="text-lg font-black text-slate-800 dark:text-white">{rev.val}</h4>
                      <p className="text-[9.5px] text-gray-400 font-bold">{rev.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Claims processing */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider">State Insurance Claim Submissions</h3>
                <div className="space-y-3">
                  {[
                    { policy: 'MH-MJPJAY-9801', desc: 'OPD Consultation & Diagnostic panels', amt: '₹510', status: 'Pre-Approved' },
                    { policy: 'PMJAY-Trauma-8821', desc: 'Surgical Fracture reduction', amt: '₹14,500', status: 'Pending Review' }
                  ].map((claim, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-black">{claim.policy}</h5>
                        <p className="text-[9px] text-gray-500 mt-0.5">{claim.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#0A5BFF]">{claim.amt}</span>
                        <span className="block text-[8px] text-orange-550 font-black mt-0.5 uppercase">{claim.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 7: EXECUTIVE REPORT DESK */}
          {activeSubTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm max-w-3xl"
            >
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-[#0A5BFF]" />
                Daily/Weekly operational summary generator
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Compile and export high-fidelity performance metrics direct for Municipal Commissioner & State Health Department review.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black uppercase text-gray-500">Select Date Range Filter</span>
                  <select className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none">
                    <option>Today's Shift Log (09 July 2026)</option>
                    <option>Weekly Performance (02 Jul - 09 Jul)</option>
                    <option>Monthly Board Report (June 2026)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9.5px] font-black uppercase text-gray-500">Report Focus Area</span>
                  <select className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none">
                    <option>All Operations Summary (Standard)</option>
                    <option>OPD Triage & Patient Flow bottleneck</option>
                    <option>Pharmacy stock & PM-JAY Cashless audit</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => handleExport('PDF')}
                  disabled={isExporting}
                  className="px-5 py-3 bg-[#0A5BFF] hover:bg-[#002f66] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </button>
                <button 
                  onClick={() => handleExport('Excel')}
                  disabled={isExporting}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 disabled:opacity-50 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center space-x-1.5"
                >
                  <FileText className="w-4 h-4 text-green-500" />
                  <span>{isExporting ? 'Generating Excel...' : 'Export Excel Data'}</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Wall display console overlay */}
      <AnimatePresence>
        {isWallMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-[#020617] text-white p-6 flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider">SION MUNICIPAL CENTRAL OPERATIONS WALL</h1>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Console ID: MCGM-SION-WALL-V2 • System Online</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="font-mono text-sm tracking-widest text-[#0A5BFF] dark:text-blue-400">10:28:12 AM</span>
                <button 
                  onClick={() => setIsWallMode(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-black uppercase rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Console Mode
                </button>
              </div>
            </div>

            {/* Giant Grid of live feeds */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              
              {/* Box 1: ER Live wait times */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-500 block">Emergency Trauma Corridor</span>
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="text-4xl font-black tracking-tight text-red-500">12 Patients</span>
                    <span className="text-xs font-black text-slate-400">80% occupied</span>
                  </div>
                </div>
                {/* Active alert status */}
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold leading-normal">
                  Cardiac bypass active. ER Beds 1-4 isolated for critical acute presentations.
                </div>
              </div>

              {/* Box 2: ICU Vitals telemetry */}
              <div className="bg-slate-955 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-500 block">ICU Live Heart Telemetries</span>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {Object.keys(icuTelemetries).map(bed => (
                      <div key={bed} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="flex justify-between text-[9px] font-black text-slate-400">
                          <span>{bed}</span>
                          <span className="text-green-500">{icuTelemetries[bed][icuTelemetries[bed].length - 1]} BPM</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 3: Live Transit fleet */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-500 block">Active Ambulance Transit</span>
                  <div className="space-y-3 mt-4">
                    {ambulances.slice(0, 2).map(amb => (
                      <div key={amb.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-black text-slate-100">{amb.id}</span>
                          <p className="text-[9px] text-slate-405 mt-0.5">{amb.location}</p>
                        </div>
                        <span className="font-black text-[#0A5BFF]">{amb.eta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer status bar */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>MCGM State Health Command • Active node Mumbai Sion</span>
              <span>All systems fully operational</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
