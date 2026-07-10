import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  TrendingUp,
  Activity,
  Globe,
  Database,
  Cpu,
  Layers,
  Heart,
  User,
  GitBranch,
  Settings,
  Shield,
  Eye,
  Tv,
  Workflow,
  Wind,
  Trash2,
  Zap,
  Users,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  BookOpen,
  MapPin,
  ChevronRight,
  TrendingDown,
  Navigation,
  Compass
} from 'lucide-react';

interface GenomicMarker {
  gene: string;
  variant: string;
  riskFactor: 'High' | 'Moderate' | 'Low';
  drugReactivity: string;
}

export default function Vision2035Dashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'digitaltwin' | 'genomics' | 'robotics' | 'sustainability' | 'grid'>('digitaltwin');

  // Digital twin interactive simulator states
  const [outbreakRisk, setOutbreakRisk] = useState(14);
  const [bedCapacity, setBedCapacity] = useState(84);
  const [resourceSurge, setResourceSurge] = useState(25);

  // Precision Genomics States
  const [genomicMarkers, setGenomicMarkers] = useState<GenomicMarker[]>([
    { gene: 'CYP2C19', variant: '*2/*17', riskFactor: 'High', drugReactivity: 'Reduced responsiveness to Clopidogrel (Plavix)' },
    { gene: 'BRCA1', variant: 'c.5266dupG', riskFactor: 'Moderate', drugReactivity: 'Indicates elevated susceptibility to PARP inhibitors' },
    { gene: 'VKORC1', variant: '-1639G>A', riskFactor: 'Low', drugReactivity: 'Requires low-dose adjustments for Warfarin (Coumadin)' }
  ]);
  const [isSequencing, setIsSequencing] = useState(false);

  // Robotics & IoT drone routes
  const [droneDeliveries, setDroneDeliveries] = useState([
    { id: 'MCGM-D01', cargo: 'O-Negative Blood Pack', destination: 'Sion Hospital Trauma', status: 'En Route', progress: 65 },
    { id: 'MCGM-D02', cargo: 'Personalized DNA Vaccine', destination: 'Phule Clinic Ward 4', status: 'Delivered', progress: 100 },
    { id: 'MCGM-D03', cargo: 'Critical Pacemaker Unit', destination: 'KEM Hospital Emergency', status: 'Charging', progress: 0 }
  ]);

  // Sustainability trackers
  const [carbonFootprint, setCarbonFootprint] = useState(142); // CO2 tons

  // Start DNA Sequencing Simulator
  const runDnaSequencing = () => {
    setIsSequencing(true);
    setTimeout(() => {
      setGenomicMarkers(prev => [
        ...prev,
        { gene: 'HLA-B*5701', variant: 'Positive', riskFactor: 'High', drugReactivity: 'Severe hypersensitivity reaction to Abacavir' }
      ]);
      setIsSequencing(false);
    }, 2000);
  };

  // Adjust Digital Twin variables
  const scaleDigitalTwin = (val: number) => {
    setBedCapacity(val);
    // Predict outbreak risks using bed capacity ratio
    setOutbreakRisk(Math.max(5, Math.min(95, Math.round((100 - val) * 1.8))));
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#06070c] text-gray-100' : 'bg-slate-50 text-slate-800'} transition-all`}>
      {/* Top Hologram Header */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors bg-white/95 border-gray-150 dark:bg-[#0a0b12]/95 dark:border-gray-900">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-purple-500 to-rose-500 rounded-xl text-white shadow-md">
            <Sparkles className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM Vision 2035</span>
                <span className="text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">Future OS</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Longitudinal DNA Mapping • Digital Twins • Drone Logistics • Sustainability Indicators
            </p>
          </div>
        </div>

        {/* Global Controls */}
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
            className="hidden sm:flex items-center space-x-1.5 bg-cyan-500 hover:bg-cyan-600 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock Vision Hub</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">

        {/* Strategic Success Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Active Digital Twins</span>
            <h3 className="text-xl font-black text-cyan-500 mt-1">4 Cities Mapped</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Sion, KEM, Cooper, Nair</span>
          </div>

          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Genomic Sequence Matches</span>
            <h3 className="text-xl font-black text-purple-500 mt-1">1.2M Citizens</h3>
            <span className="text-[10px] text-gray-400 font-semibold mt-1">Pharmacogenomics active</span>
          </div>

          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Autonomous Drones Active</span>
            <h3 className="text-xl font-black text-pink-500 mt-1">12 Drone Nodes</h3>
            <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Supply deliveries normal</span>
          </div>

          <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-450">Carbon Footprint Saved</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">3,420 Tons</h3>
            <span className="text-[10px] text-cyan-400 font-bold mt-1">100% Paperless workflows</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-2xl max-w-6xl shadow-sm">
          {[
            { id: 'digitaltwin', label: 'Hospital Digital Twin', icon: Tv },
            { id: 'genomics', label: 'Precision Genomics', icon: Heart },
            { id: 'robotics', label: 'Autonomous Drones', icon: Navigation },
            { id: 'sustainability', label: 'Sustainability Track', icon: Wind },
            { id: 'grid', label: 'National Health Grid', icon: Globe }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-gray-450 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub panel views */}
        <div className="mt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: HOSPITAL DIGITAL TWIN */}
            {activeTab === 'digitaltwin' && (
              <motion.div
                key="digitaltwin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Visualizer maps */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-500">Live City Digital Twin Simulator</h3>

                  <div className="space-y-4 text-xs font-bold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span>Simulated Hospital Bed Occupancy</span>
                        <span>{bedCapacity}% Occupied</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={bedCapacity} 
                        onChange={(e) => scaleDigitalTwin(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-2xl">
                        <p className="text-[10px] text-gray-400">Predicted Epidemic Outbreak Risk</p>
                        <p className={`text-lg font-black mt-1 ${outbreakRisk > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {outbreakRisk}% Risk
                        </p>
                      </div>

                      <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-2xl">
                        <p className="text-[10px] text-gray-400">Staff Deployment Status</p>
                        <p className="text-lg font-black text-cyan-500">Optimal (100%)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Planning console */}
                <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider">Predictive Simulations</h3>
                    <p className="text-xs text-gray-450 leading-relaxed font-semibold">
                      Adjust bed occupancies to project local clinical resources requirements, emergency responder redirects, and city vaccine drives.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold text-center">
                    {bedCapacity > 85 ? (
                      <span className="text-rose-500 uppercase">⚠️ Warning: Surge threshold reached</span>
                    ) : (
                      <span className="text-emerald-500 uppercase">✓ Cluster Capacities Normal</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: PRECISION GENOMICS WORKSPACE */}
            {activeTab === 'genomics' && (
              <motion.div
                key="genomics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Genomic sequencing list */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-500">Citizen DNA Risk Profiles</h3>

                  <div className="space-y-3 text-xs font-semibold">
                    {genomicMarkers.map((marker, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-slate-800 dark:text-slate-100 font-bold">{marker.gene} • {marker.variant}</p>
                          <p className="text-[10px] text-gray-450">{marker.drugReactivity}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[8.5px] font-black rounded uppercase ${
                          marker.riskFactor === 'High' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' :
                          marker.riskFactor === 'Moderate' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' :
                          'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        }`}>
                          {marker.riskFactor} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DNA sequencing execution controls */}
                <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Run Gene Sequencing</h3>
                  <p className="text-xs text-gray-450 leading-relaxed font-semibold">
                    Analyses longitudinal DNA profile mappings to calibrate pharmacogenomic drug responses and detect rare diseases risks.
                  </p>

                  <button
                    disabled={isSequencing}
                    onClick={runDnaSequencing}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSequencing ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Run DNA Profile</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: AUTONOMOUS DRONES & ROBOTICS */}
            {activeTab === 'robotics' && (
              <motion.div
                key="robotics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-500">Autonomous Logistics Drones</h3>

                  <div className="space-y-3 text-xs font-semibold">
                    {droneDeliveries.map((drone, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-cyan-500">{drone.id}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${
                            drone.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                            drone.status === 'En Route' ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600' :
                            'bg-slate-200 dark:bg-slate-800 text-gray-400'
                          }`}>
                            {drone.status}
                          </span>
                        </div>

                        <div className="flex justify-between text-gray-450 text-[10px]">
                          <span>Cargo: {drone.cargo}</span>
                          <span>Dest: {drone.destination}</span>
                        </div>

                        {drone.progress > 0 && drone.progress < 100 && (
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${drone.progress}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SUSTAINABILITY METRICS */}
            {activeTab === 'sustainability' && (
              <motion.div
                key="sustainability"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Waste and carbon offsets */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-500">Green Hospital Indicators</h3>

                  <div className="space-y-4 text-xs font-bold">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Solar Power Utilization</span>
                        <span className="text-emerald-500">74%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '74%' }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Water Recycling Efficiency</span>
                        <span className="text-cyan-500">89%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '89%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carbon footprint */}
                <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider">Carbon Footprint Saved</h3>
                  
                  <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400">Total Paper Offset Tons</p>
                    <p className="text-2xl font-black text-emerald-500">142 Tons</p>
                  </div>

                  <p className="text-[9.5px] text-gray-450 text-center font-semibold">
                    100% digital patient record routing removes hospital physical paper prints.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 5: NATIONAL HEALTH GRID INTEROPERABILITY MAP */}
            {activeTab === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#0f111c] border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-500">National Health Grid Status</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-2xl flex justify-between items-center">
                      <span>Primary Health Centres</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">CONNECTED</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-2xl flex justify-between items-center">
                      <span>Diagnostic Labs</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">CONNECTED</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-850 rounded-2xl flex justify-between items-center">
                      <span>Blood Banks</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[8.5px] font-black rounded uppercase">CONNECTED</span>
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
