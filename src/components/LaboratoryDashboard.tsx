import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Barcode, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Cpu, 
  Search, 
  Trash2, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Play, 
  RefreshCw, 
  Layers, 
  Award, 
  FileText, 
  Smartphone, 
  Calendar,
  Sparkles,
  ArrowRight,
  Database,
  Printer,
  Bell,
  Package,
  TrendingUp
} from 'lucide-react';

interface Specimen {
  uuid: string;
  patientName: string;
  age: number;
  gender: string;
  barcode: string;
  type: string;
  container: string;
  status: 'COLLECTED' | 'IN_TRANSIT' | 'RECEIVED' | 'PROCESSING' | 'TESTED' | 'RELEASED' | 'REJECTED';
  priority: 'ROUTINE' | 'URGENT' | 'STAT_EMERGENCY';
  orderedBy: string;
  testName: string;
  timestamp: string;
  result?: {
    value: number;
    unit: string;
    low: number;
    high: number;
    paramName: string;
  };
  previousResult?: number;
  aiExplanation?: string;
  aiConfidence?: number;
}

export default function LaboratoryDashboard({ 
  isDarkMode, 
  setIsDarkMode, 
  onLogout 
}: { 
  isDarkMode: boolean; 
  setIsDarkMode: (val: boolean) => void; 
  onLogout: () => void;
}) {
  // Mock Data for Laboratory Dashboard
  const [specimens, setSpecimens] = useState<Specimen[]>([
    {
      uuid: 'spec-101',
      patientName: 'Rahul Anil Patil',
      age: 32,
      gender: 'Male',
      barcode: 'MCGM-EDTA-9982',
      type: 'Whole Blood',
      container: 'EDTA Purple Top',
      status: 'TESTED',
      priority: 'STAT_EMERGENCY',
      orderedBy: 'Dr. Sunita Deshmukh',
      testName: 'Complete Blood Count (CBC)',
      timestamp: 'Today, 07:15 AM',
      result: {
        paramName: 'Hemoglobin',
        value: 10.2,
        unit: 'g/dL',
        low: 13.0,
        high: 17.0
      },
      previousResult: 12.8,
      aiExplanation: 'Hemoglobin exhibits a acute microcytic drop of 2.6 g/dL compared to previous records (15 days ago). Immediate investigation for internal bleeding or nutritional deficit advised.',
      aiConfidence: 94
    },
    {
      uuid: 'spec-102',
      patientName: 'Ayesha Shaikh',
      age: 28,
      gender: 'Female',
      barcode: 'MCGM-SST-8293',
      type: 'Serum',
      container: 'SST Gold Top',
      status: 'RECEIVED',
      priority: 'URGENT',
      orderedBy: 'Dr. Ramesh Nair',
      testName: 'Liver Function Test (LFT)',
      timestamp: 'Today, 08:30 AM',
      result: {
        paramName: 'Serum Bilirubin',
        value: 2.8,
        unit: 'mg/dL',
        low: 0.2,
        high: 1.2
      },
      previousResult: 1.1,
      aiExplanation: 'Elevated serum bilirubin with stable alkaline phosphatase suggests hepatic conjugation overload. Verify fasting state of patient.',
      aiConfidence: 87
    },
    {
      uuid: 'spec-103',
      patientName: 'Suresh Kumar',
      age: 45,
      gender: 'Male',
      barcode: 'MCGM-CITRATE-4411',
      type: 'Plasma',
      container: 'Sodium Citrate Blue Top',
      status: 'PROCESSING',
      priority: 'ROUTINE',
      orderedBy: 'Dr. Sunita Deshmukh',
      testName: 'Prothrombin Time (PT/INR)',
      timestamp: 'Today, 09:00 AM'
    },
    {
      uuid: 'spec-104',
      patientName: 'Meera Deshpande',
      age: 62,
      gender: 'Female',
      barcode: 'MCGM-SST-7182',
      type: 'Serum',
      container: 'SST Gold Top',
      status: 'COLLECTED',
      priority: 'ROUTINE',
      orderedBy: 'Dr. Anil Mehta',
      testName: 'Lipid Profile',
      timestamp: 'Today, 09:12 AM'
    }
  ]);

  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(specimens[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [digitalPin, setDigitalPin] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; desc: string; type: 'success' | 'critical' } | null>(null);

  // Machine Status states
  const [machines, setMachines] = useState([
    { id: 'HEM-201', name: 'Sysmex XN-1000 Hematology', status: 'ONLINE', queue: 2 },
    { id: 'BIO-601', name: 'Roche Cobas c501 Biochemistry', status: 'ONLINE', queue: 4 },
    { id: 'IMM-801', name: 'Abbott Alinity i Immunology', status: 'ONLINE', queue: 0 }
  ]);

  // Inventory Stock Mock
  const [inventory, setInventory] = useState([
    { name: 'EDTA Vacutainer Tubes (Purple)', stock: 120, min: 200, unit: 'pcs', alert: true },
    { name: 'Bilirubin Reagent Kit (Cobas)', stock: 14, min: 10, unit: 'kits', alert: false },
    { name: 'Sysmex Diluent Cleanser', stock: 2, min: 5, unit: 'cans', alert: true }
  ]);

  // Quality Control Control Chart Points
  // Standard Mean is 15.0, SD = 0.5
  const [qcPoints, setQcPoints] = useState([15.1, 14.8, 15.2, 14.9, 15.0, 15.4, 15.3, 16.1]); // 16.1 crosses +2SD warning line!

  // Simulation Feed Action
  const handleSimulateMachineFeed = () => {
    // Pushes results to the pending SST Gold specimen (Ayesha Shaikh)
    setSpecimens(prev => prev.map(s => {
      if (s.uuid === 'spec-102') {
        return {
          ...s,
          status: 'TESTED',
          result: {
            paramName: 'Serum Bilirubin',
            value: 3.1,
            unit: 'mg/dL',
            low: 0.2,
            high: 1.2
          }
        };
      }
      return s;
    }));

    if (selectedSpecimen?.uuid === 'spec-102') {
      setSelectedSpecimen(prev => prev ? {
        ...prev,
        status: 'TESTED',
        result: {
          paramName: 'Serum Bilirubin',
          value: 3.1,
          unit: 'mg/dL',
          low: 0.2,
          high: 1.2
        }
      } : null);
    }

    setAlertMessage({
      title: 'Machine Result Received',
      desc: 'Roche Cobas sent result for Barcode MCGM-SST-8293 (Bilirubin: 3.1 mg/dL)',
      type: 'success'
    });
  };

  const handleApproveResult = (pin: string) => {
    if (pin !== '1234') {
      setAlertMessage({
        title: 'Authentication Failed',
        desc: 'Invalid Digital Signature PIN credentials. Try again.',
        type: 'critical'
      });
      return;
    }

    setIsSigning(true);
    setTimeout(() => {
      setSpecimens(prev => prev.map(s => {
        if (s.uuid === selectedSpecimen?.uuid) {
          return { ...s, status: 'RELEASED' };
        }
        return s;
      }));

      setSelectedSpecimen(prev => prev ? { ...prev, status: 'RELEASED' } : null);
      setIsSigning(false);
      setDigitalPin('');
      setAlertMessage({
        title: 'Report Digitally Signed & Released',
        desc: 'FHIR Observation resource sent to ABHA Patient Vault and Doctor app notifications.',
        type: 'success'
      });
    }, 1200);
  };

  const filteredSpecimens = specimens.filter(s => 
    s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} font-sans pb-12`}>
      {/* LIMS Header */}
      <header className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'} sticky top-0 z-35 backdrop-blur-md px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-display font-black tracking-tight">MCGM Digital Lab</h1>
            <p className="text-xs text-slate-500 font-medium">LIMS Operations Node • Sion Hospital</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSimulateMachineFeed}
            className="flex items-center space-x-2 bg-accent hover:bg-accent-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>Simulate Analyzer Feed</span>
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-slate-850 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'} cursor-pointer`}
          >
            <Activity className="w-4 h-4" />
          </button>

          <button 
            onClick={onLogout}
            className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            Exit Portal
          </button>
        </div>
      </header>

      {/* Toast Alert Messages */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mx-6 mt-4 p-4 rounded-2xl flex items-start space-x-3 border ${
              alertMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-sm">{alertMessage.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{alertMessage.desc}</p>
            </div>
            <button 
              onClick={() => setAlertMessage(null)}
              className="text-xs font-bold underline ml-2 opacity-80 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="px-6 py-6 grid grid-cols-12 gap-6">
        
        {/* Left Side: Summary Metrics & Work queue */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Key Lab Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Samples Today</span>
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-black mt-2 font-mono">148</p>
              <span className="text-[10px] text-emerald-500 font-bold">100% Barcoded</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Critical Alerts</span>
                <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              </div>
              <p className="text-2xl font-black mt-2 font-mono text-rose-500 font-sans">01</p>
              <span className="text-[10px] text-rose-400 font-bold">Escalation active</span>
            </div>
          </div>

          {/* Sample Worklist Panel */}
          <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-sm uppercase tracking-wider">Specimen Queue</h3>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-black">
                {filteredSpecimens.length} Active
              </span>
            </div>

            {/* Search inputs */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input 
                type="text" 
                placeholder="Search patient, barcode, test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-primary' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-primary'
                } focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>

            {/* Specimen items list */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredSpecimens.map((spec) => (
                <div 
                  key={spec.uuid}
                  onClick={() => setSelectedSpecimen(spec)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedSpecimen?.uuid === spec.uuid
                      ? isDarkMode 
                        ? 'bg-slate-800 border-primary shadow-md shadow-primary/5' 
                        : 'bg-primary-50 border-primary shadow-md'
                      : isDarkMode
                        ? 'bg-slate-950 border-slate-850 hover:bg-slate-850'
                        : 'bg-white border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs">{spec.patientName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{spec.age}y / {spec.gender} • {spec.testName}</p>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      spec.priority === 'STAT_EMERGENCY'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                        : spec.priority === 'URGENT'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {spec.priority}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-slate-800/20 dark:border-slate-800/60">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                      <Barcode className="w-3.5 h-3.5" />
                      <span>{spec.barcode}</span>
                    </span>

                    <span className={`text-[10px] font-bold ${
                      spec.status === 'RELEASED'
                        ? 'text-emerald-500'
                        : spec.status === 'TESTED'
                          ? 'text-primary animate-pulse'
                          : 'text-slate-500'
                    }`}>
                      {spec.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Center/Right: Pathologist validation desk */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          {selectedSpecimen ? (
            <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
              
              {/* Patient header info */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-800/20 dark:border-slate-800/60">
                <div>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {selectedSpecimen.type} ({selectedSpecimen.container})
                  </span>
                  <h2 className="text-lg font-display font-black mt-1.5">{selectedSpecimen.patientName}</h2>
                  <p className="text-xs text-slate-500">Order by {selectedSpecimen.orderedBy} • {selectedSpecimen.timestamp}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">SPECIMEN BARCODE</span>
                  <div className="bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/10 dark:border-slate-850 mt-1 flex items-center space-x-2">
                    <Barcode className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs font-bold text-primary">{selectedSpecimen.barcode}</span>
                  </div>
                </div>
              </div>

              {/* Specimen Tracking Progress Meter */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Specimen Lifecycle Log</h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['COLLECTED', 'RECEIVED', 'PROCESSING', 'TESTED', 'RELEASED'] as const).map((step, idx) => {
                    const stepsOrder = ['COLLECTED', 'RECEIVED', 'PROCESSING', 'TESTED', 'RELEASED'];
                    const currentIdx = stepsOrder.indexOf(selectedSpecimen.status);
                    const stepIdx = stepsOrder.indexOf(step);
                    const isActive = stepIdx <= currentIdx;
                    
                    return (
                      <div 
                        key={step} 
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isActive 
                            ? isDarkMode
                              ? 'bg-primary-950/20 border-primary/30 text-primary' 
                              : 'bg-primary-50 border-primary text-primary'
                            : 'bg-transparent border-slate-800/10 dark:border-slate-850 text-slate-500'
                        }`}
                      >
                        <p className="text-[10px] font-bold">{step}</p>
                        <p className="text-[8px] opacity-75 mt-0.5">Step 0{idx + 1}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Test Parameters & Analyzers result outputs */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parameters & Findings</h4>
                
                {selectedSpecimen.result ? (
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-150'} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-500">{selectedSpecimen.testName}</span>
                        <h3 className="font-bold text-sm mt-0.5">{selectedSpecimen.result.paramName}</h3>
                      </div>
                      
                      {/* Highlight abnormal ranges */}
                      {selectedSpecimen.result.value < selectedSpecimen.result.low || selectedSpecimen.result.value > selectedSpecimen.result.high ? (
                        <div className="flex items-center space-x-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-500 px-2.5 py-1 rounded-full text-[10px] font-black">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>OUT OF REFERENCE RANGE</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 bg-emerald-500/15 text-emerald-500 px-2.5 py-1 rounded-full text-[10px] font-black">
                          <Check className="w-3.5 h-3.5" />
                          <span>NORMAL RANGE</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-dashed border-slate-800/20 dark:border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-500">ANALYZED RESULT</span>
                        <p className="text-xl font-black font-mono text-rose-500 mt-0.5">
                          {selectedSpecimen.result.value} <span className="text-xs font-sans font-medium">{selectedSpecimen.result.unit}</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">REFERENCE STANDARD</span>
                        <p className="text-xs font-bold mt-1 text-slate-400">
                          {selectedSpecimen.result.low} - {selectedSpecimen.result.high} {selectedSpecimen.result.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">DELTA OVER PREVIOUS</span>
                        <p className="text-xs font-mono font-bold mt-1 text-amber-500">
                          {selectedSpecimen.previousResult 
                            ? `${(selectedSpecimen.result.value - selectedSpecimen.previousResult).toFixed(1)} g/dL (${(( (selectedSpecimen.result.value - selectedSpecimen.previousResult) / selectedSpecimen.previousResult ) * 100).toFixed(0)}%)`
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-800/20 dark:border-slate-800/60 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold">Waiting for Laboratory Analyzer Transmission</p>
                      <p className="text-[10px] text-slate-500">HL7 connection active. Results will print here automatically.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Lab Assistant Module */}
              {selectedSpecimen.aiExplanation && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-950/20 to-purple-950/20 border border-primary/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-primary-400 font-black flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary-400 fill-primary-400/20" />
                      <span>AI LAB COPILOT DELTA MATCH</span>
                    </span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[9px] font-bold">
                      Confidence {selectedSpecimen.aiConfidence}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {selectedSpecimen.aiExplanation}
                  </p>
                </div>
              )}

              {/* Pathologist Release Approval Signature Box */}
              {selectedSpecimen.status === 'TESTED' && (
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-emerald-400">Pathologist Signature Credentials</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Verification seals the report digitally with SHA256 hashing and triggers SMS alerts to the clinical team.</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <input 
                      type="password" 
                      placeholder="Enter Digital Signature PIN (1234)"
                      value={digitalPin}
                      onChange={(e) => setDigitalPin(e.target.value)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs border ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' 
                          : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                    <button 
                      onClick={() => handleApproveResult(digitalPin)}
                      disabled={isSigning}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSigning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Hash...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Sign & Release Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
              <FlaskConical className="w-12 h-12 text-slate-700 animate-pulse" />
              <p className="text-xs font-bold">Select a specimen from the work queue to review details.</p>
            </div>
          )}

          {/* Calibration & Westgard QC Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Westgard QC Chart Indicator */}
            <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider">Analyzer Calibration (Westgard)</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Control Material Run ID: Lot #CBC-992A</p>
                </div>
                <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center space-x-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Rule 1(2s) Warning</span>
                </span>
              </div>

              {/* Standard Deviation Target Deviation graph */}
              <div className="h-28 relative border-l border-b border-slate-800 flex items-end">
                {/* Horizontal SD lines */}
                <div className="absolute left-0 right-0 top-[20%] border-t border-rose-500/30 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-rose-500 font-bold">+2 SD</span></div>
                <div className="absolute left-0 right-0 top-[50%] border-t border-slate-700/40"><span className="absolute -top-2 left-1 text-[8px] text-slate-500 font-bold">Mean</span></div>
                <div className="absolute left-0 right-0 top-[80%] border-t border-rose-500/30 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-rose-500 font-bold">-2 SD</span></div>
                
                {/* SVG Line path for points */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={qcPoints.map((val, idx) => {
                      const x = (idx / (qcPoints.length - 1)) * 100;
                      const y = 100 - ((val - 14.0) / 2.0) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {qcPoints.map((val, idx) => {
                    const x = (idx / (qcPoints.length - 1)) * 100;
                    const y = 100 - ((val - 14.0) / 2.0) * 100;
                    const isBreach = val > 15.8 || val < 14.2;
                    return (
                      <circle 
                        key={idx}
                        cx={x} 
                        cy={y} 
                        r="3" 
                        fill={isBreach ? '#ef4444' : '#3b82f6'} 
                        className={isBreach ? 'animate-ping' : ''}
                      />
                    );
                  })}
                </svg>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Point 8 (value 16.1) exceeded +2 SD warning threshold, breaching Westgard 1_2s protocol. Analyzer calibrated Lot is within acceptable 3s bounds.
              </p>
            </div>

            {/* Reagents & Laboratory Inventory Panel */}
            <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
              <div className="flex justify-between items-center">
                <h4 className="font-display font-black text-xs uppercase tracking-wider">Critical Inventory Status</h4>
                <Package className="w-4 h-4 text-slate-500" />
              </div>

              <div className="space-y-2">
                {inventory.map((inv) => (
                  <div key={inv.name} className="flex justify-between items-center p-2 rounded-xl bg-slate-950/20 border border-slate-850/50">
                    <div>
                      <p className="text-xs font-bold">{inv.name}</p>
                      <p className="text-[9px] text-slate-500">Min Threshold: {inv.min} {inv.unit}</p>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-mono font-bold ${inv.alert ? 'text-rose-500' : 'text-slate-300'}`}>
                        {inv.stock} {inv.unit}
                      </p>
                      {inv.alert && (
                        <span className="text-[8px] bg-rose-500/10 text-rose-400 px-1 rounded font-bold">LOW STOCK</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
