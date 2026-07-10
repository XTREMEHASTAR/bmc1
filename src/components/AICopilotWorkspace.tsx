import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Cpu,
  ShieldCheck,
  FileText,
  Clock,
  Activity,
  Mic,
  MicOff,
  User,
  Users,
  Search,
  Upload,
  AlertTriangle,
  Heart,
  HelpCircle,
  FileCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Maximize2,
  Minimize2,
  Volume2,
  Check,
  X,
  Code,
  Terminal,
  Database,
  RefreshCw,
  SearchCode,
  Languages,
  DollarSign,
  HeartPulse,
  BookOpen,
  Send,
  Eye,
  Info,
  LogOut
} from 'lucide-react';

interface MetricItem {
  name: string;
  value: string;
  change: string;
  positive: boolean;
}

interface AICopilotWorkspaceProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function AICopilotWorkspace({ isDarkMode, setIsDarkMode, onLogout }: AICopilotWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'ambient'
    | 'multimodal'
    | 'search'
    | 'patient'
    | 'nurse'
    | 'ops'
    | 'gov'
    | 'safety'
    | 'dev'
  >('overview');

  // Global AI metrics state
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { name: 'Time Saved / Consultation', value: '4.2 Mins', change: '-35%', positive: true },
    { name: 'Typing Reduction Rate', value: '78.4%', change: '+12.3%', positive: true },
    { name: 'Average Token Latency', value: '185 ms', change: '-42 ms', positive: true },
    { name: 'Symptom Forecast Acc.', value: '94.2%', change: '+1.5%', positive: true },
  ]);

  // Ambient AI consultation simulator states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingTranscript, setRecordingTranscript] = useState<string>('');
  const [soapNotes, setSoapNotes] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } | null>(null);
  const [suggestedCodes, setSuggestedCodes] = useState<Array<{ code: string; desc: string; type: 'ICD-10' | 'SNOMED' }>>([]);
  const [suggestedMeds, setSuggestedMeds] = useState<Array<{ name: string; dose: string; frequency: string; generic: string }>>([]);
  const [warnings, setWarnings] = useState<Array<{ type: 'allergy' | 'drug'; msg: string; severity: 'high' | 'moderate' }>>([]);
  const [consentGranted, setConsentGranted] = useState(true);

  // Multimodal sandbox state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [isCriticalFlagged, setIsCriticalFlagged] = useState(false);

  // Smart Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [fhirQuery, setFhirQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Patient AI helper state
  const [patientTerm, setPatientTerm] = useState('Elevated serum creatinine');
  const [translatedTerms, setTranslatedTerms] = useState<{ en: string; hi: string; mr: string } | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);

  // Nurse risk monitor state
  const [nursePatients, setNursePatients] = useState([
    { id: '1', name: 'Ramesh Sawant', bed: 'ICU-Bed 04', condition: 'Septic Shock Post-Op', riskType: 'Sepsis Risk', riskScore: 88, status: 'Critical', heartRate: 112, bp: '90/58' },
    { id: '2', name: 'Lilavati Patil', bed: 'Ward B-02', condition: 'Heart Failure Stage C', riskType: 'Re-admission Risk', riskScore: 42, status: 'Stable', heartRate: 78, bp: '124/80' },
    { id: '3', name: 'Shridhar Joshi', bed: 'ICU-Bed 08', condition: 'Acute Renal Exacerbation', riskType: 'Acute Kidney Injury', riskScore: 76, status: 'Urgent', heartRate: 95, bp: '142/90' },
  ]);
  const [activeHandover, setActiveHandover] = useState<string | null>(null);

  // Operations and generic pharmacy finder states
  const [drugBrand, setDrugBrand] = useState('Augmentin 625 DUO');
  const [genericAlternatives, setGenericAlternatives] = useState<any[]>([]);

  // Government epidemiology forecasting states
  const [selectedWard, setSelectedWard] = useState('F-North (Dharavi)');
  const [forecastCases, setForecastCases] = useState<number>(145);

  // Ambient audio tick
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Telemetry loop for voice waveform
  const [waveHeight, setWaveHeight] = useState<number[]>([15, 30, 45, 10, 20, 35, 12, 40, 25, 18]);
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setWaveHeight(prev => prev.map(() => Math.floor(Math.random() * 50) + 10));
    }, 150);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Ambient transcript simulation trigger
  const handleStartDictation = () => {
    if (isRecording) {
      // Stop recording and generate SOAP notes
      setIsRecording(false);
      setRecordingTranscript(
        "Patient Rahul Patil complains of throbbing knee pain for the past 2 weeks, especially after walks. Knee exam shows moderate osteoarthritic crepitus on passive movement. Left knee is warm but no massive effusion. Diagnosing primary knee osteoarthritis. Plan: Tab Paracetamol 650mg TDS for 5 days, recommend daily knee stretches, avoid squats, and follow up if pain persists beyond 1 week."
      );
      // Simulate processing
      setTimeout(() => {
        setSoapNotes({
          subjective: "Patient experiences throbbing left knee pain, exacerbated by walking, duration 2 weeks. Denies history of acute trauma.",
          objective: "Left knee exam reveals local warmth, mild joint line tenderness, crepitus on passive flexion. No significant swelling or instability.",
          assessment: "Primary Osteoarthritis of Left Knee (ICD-10 M17.11).",
          plan: "1. Tab Paracetamol 650mg TDS orally for 5 days.\n2. Daily low-impact physical therapy stretches.\n3. Avoid deep squatting.\n4. Clinical review in 7 days."
        });
        setSuggestedCodes([
          { code: 'M17.11', desc: 'Unilateral primary osteoarthritis, right knee', type: 'ICD-10' },
          { code: '396275006', desc: 'Primary osteoarthritis of knee joint (disorder)', type: 'SNOMED' }
        ]);
        setSuggestedMeds([
          { name: 'Paracetamol', dose: '650mg', frequency: 'TDS (Three times a day)', generic: 'PCM 650' }
        ]);
        setWarnings([
          { type: 'drug', msg: 'Patient reports mild history of gastric reflux, ensure paracetamol is taken post meals.', severity: 'moderate' }
        ]);
      }, 1000);
    } else {
      // Start recording
      setRecordingTranscript('Listening ambiently to consultation...');
      setSoapNotes(null);
      setSuggestedCodes([]);
      setSuggestedMeds([]);
      setWarnings([]);
      setIsRecording(true);
    }
  };

  // Multimodal test simulation
  const handleAnalyzeReport = (type: 'blood' | 'xray') => {
    setAnalysisLoading(true);
    setIsCriticalFlagged(false);
    setSelectedFile(type === 'blood' ? 'CBC_Hematology_Report.pdf' : 'Chest_XRay_AP.png');
    setTimeout(() => {
      setAnalysisLoading(false);
      if (type === 'blood') {
        setAnalysisResult(
          "Hematology findings reveal borderline low RBC count of 4.1 million/µL and elevated platelet count of 460,000 cells/mm³ (reactive thrombocytosis). WBC is stable at 8,200. Suggest nutritional correlation and check inflammatory markers."
        );
        setIsCriticalFlagged(true);
      } else {
        setAnalysisResult(
          "Chest radiograph reveals clear lung fields, no focal consolidation, pleural effusion, or pneumothorax. Cardiomegaly is not detected. Bony structures are unremarkable."
        );
      }
    }, 1500);
  };

  // Smart search simulation
  const handleSmartSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setTimeout(() => {
      setSearchLoading(false);
      const queryLower = searchQuery.toLowerCase();
      if (queryLower.includes('diabetic') || queryLower.includes('sugar')) {
        setFhirQuery("GET /fhir/Patient?disease=diabetes&wait-time-gt=7200");
        setSearchResults([
          { name: 'Pankaj Deshpande', age: 58, gender: 'Male', waitTime: '2 hrs 15 mins', lastA1c: '8.4%' },
          { name: 'Shalini Kulkarni', age: 62, gender: 'Female', waitTime: '2 hrs 40 mins', lastA1c: '7.9%' }
        ]);
      } else {
        setFhirQuery("GET /fhir/Encounter?status=waiting&_sort=wait-time");
        setSearchResults([
          { name: 'Rahul Patil', age: 32, gender: 'Male', waitTime: '32 mins', lastA1c: 'N/A' },
          { name: 'Suresh Kumar', age: 45, gender: 'Male', waitTime: '45 mins', lastA1c: 'N/A' }
        ]);
      }
    }, 1200);
  };

  // Translate terms helper
  const handleTranslateTerm = () => {
    setTranslationLoading(true);
    setTimeout(() => {
      setTranslationLoading(false);
      if (patientTerm.toLowerCase().includes('creatinine')) {
        setTranslatedTerms({
          en: "This indicates how well your kidneys are filtering waste from your blood. An elevated value suggests the kidneys might be under stress or dehydrated.",
          hi: "यह दर्शाता है कि आपकी किडनी खून से कचरे को कितनी अच्छी तरह छान रही है। बढ़ा हुआ मूल्य बताता है कि किडनी तनाव में हो सकती है या शरीर में पानी की कमी है।",
          mr: "हे दर्शवते की तुमचे मूत्रपिंड (किडनी) रक्तातील टाकाऊ पदार्थ किती चांगल्या प्रकारे फिल्टर करत आहेत. वाढलेले प्रमाण दर्शवते की मूत्रपिंडावर ताण असू शकतो किंवा शरीरात पाणी कमी असू शकते."
        });
      } else {
        setTranslatedTerms({
          en: "A simple educational description of this clinical metric would suggest maintaining a balanced lifestyle and consulting your doctor.",
          hi: "इस नैदानिक ​​मीट्रिक का एक सरल शैक्षिक विवरण संतुलित जीवन शैली बनाए रखने और अपने डॉक्टर से परामर्श करने का सुझाव देगा।",
          mr: "या क्लिनिकल मेट्रिकचे साधे शैक्षणिक वर्णन संतुलित जीवनशैली राखण्याचा आणि आपल्या डॉक्टरांचा सल्ला घेण्याचा सल्ला देईल."
        });
      }
    }, 1000);
  };

  // Generic alternative finder
  const handleFindGeneric = () => {
    if (!drugBrand) return;
    setGenericAlternatives([
      { name: 'Amoxicillin + Clavulanic Acid 625mg (Generic)', manufacturer: 'MCGM Generic Store (Haffkine)', price: '₹42.50', brandPrice: '₹188.00', savings: '77%' },
      { name: 'Novamox CV 625 (Alternative Brand)', manufacturer: 'Cipla Ltd', price: '₹145.00', brandPrice: '₹188.00', savings: '23%' }
    ]);
  };

  // Government Ward Forecast handler
  const handleWardChange = (ward: string) => {
    setSelectedWard(ward);
    if (ward.includes('Dharavi')) {
      setForecastCases(145);
    } else if (ward.includes('Worli')) {
      setForecastCases(92);
    } else {
      setForecastCases(48);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Header Bar */}
      <header className="border-b border-slate-850 bg-[#090d16] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400 uppercase">
              MCGM Cognitive Layer
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Clinical Intelligence & Decision Support System</p>
          </div>
        </div>

        {/* Live System Stats */}
        <div className="hidden lg:flex items-center space-x-6 text-[10px] uppercase font-bold tracking-wider text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Active Models: 4/4 Online</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div>Guardrails: ABDM-Active</div>
          <div className="h-4 w-[1px] bg-slate-850" />
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-1.5 hover:bg-slate-800 rounded-lg text-gray-400 transition-all cursor-pointer"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="h-4 w-[1px] bg-slate-850" />
          <button 
            onClick={onLogout} 
            className="p-1.5 hover:bg-slate-800 rounded-lg text-rose-450 text-rose-400 transition-all cursor-pointer flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-64 border-r border-slate-850 bg-[#070b13] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-gray-550 tracking-widest px-3 mb-2">Cognitive Ecosystem</p>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'overview' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Nervous System Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('ambient')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'ambient' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4 text-purple-400" />
              <span>Ambient Audio (Doctor)</span>
            </button>

            <button
              onClick={() => setActiveTab('multimodal')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'multimodal' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Multimodal Interpreter</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'search' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <SearchCode className="w-4 h-4 text-amber-400" />
              <span>Smart Search Console</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'patient' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <Languages className="w-4 h-4 text-rose-400" />
              <span>Patient Translation</span>
            </button>

            <button
              onClick={() => setActiveTab('nurse')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'nurse' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-teal-400" />
              <span>Nurse Risk Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('ops')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'ops' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Pharmacy & Ops AI</span>
            </button>

            <button
              onClick={() => setActiveTab('gov')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'gov' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Epidemic Forecasts</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'safety' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Explainable AI & Safety</span>
            </button>

            <button
              onClick={() => setActiveTab('dev')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left text-xs font-black transition-all ${
                activeTab === 'dev' ? 'bg-[#0f172a] text-blue-400 border border-blue-500/20' : 'hover:bg-slate-900 text-gray-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4 text-gray-400" />
              <span>Developer Specs</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-850 text-[10px] text-gray-500 space-y-1.5 px-3">
            <p>Compliance Mode: Strict</p>
            <p>FHIR Format: R4 Compatible</p>
            <p>DPDP Audit Log: Active</p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Core metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, idx) => (
                  <div key={idx} className="bg-[#090d16] border border-slate-850 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full translate-x-4 -translate-y-4" />
                    <p className="text-[10px] text-gray-450 uppercase font-black tracking-wider">{m.name}</p>
                    <div className="flex items-end space-x-2 mt-4">
                      <span className="text-2xl font-black">{m.value}</span>
                      <span className={`text-[10px] font-black ${m.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {m.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanatory intro */}
              <div className="bg-gradient-to-r from-blue-900/20 via-purple-900/10 to-transparent border border-blue-950 rounded-3xl p-6 space-y-4">
                <h3 className="font-extrabold text-base text-blue-300">Intelligent Nervous System Overview</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
                  The MCGM Clinical AI Operating Layer serves as a real-time copilot running silently across patient entry, registration desks, nurse registries, laboratories, and physician consultation workspaces. The system uses a multi-model workflow orchestration engine to predict clinic surges, parse diagnostics, and draft reports, while placing clinical safety, explainability, and doctor control at the core.
                </p>
              </div>

              {/* System Throughput and Safety logs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Live Model Throughput Graph mockup */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Predictive Surges & Agent Activity</h4>
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 font-extrabold px-2 py-0.5 rounded-full">LIVE</span>
                  </div>
                  
                  {/* Mock Bar Chart representing throughput by hour */}
                  <div className="h-48 flex items-end justify-between gap-1 pt-4">
                    {[35, 45, 65, 80, 95, 75, 60, 50, 45, 70, 85, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                        <div 
                          style={{ height: `${h}%` }}
                          className="w-full bg-gradient-to-t from-indigo-600 via-purple-500 to-rose-400 rounded-t-md hover:opacity-80 transition-all relative"
                        />
                        <span className="text-[8px] text-gray-500 font-bold mt-2">
                          {i + 9}:00
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Audits / Guardrails Panel */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">DPDP Safety Guardrail Logs</h4>
                    <span className="text-[8px] font-black text-emerald-400 flex items-center space-x-1 uppercase">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span>Compliant</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        <div>
                          <p className="text-xs font-bold">Allergy Warning Prompt Triggered</p>
                          <p className="text-[9px] text-gray-500">Doctor confirmed prescription change for Rahul Patil.</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">10:28 AM</span>
                    </div>

                    <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <div>
                          <p className="text-xs font-bold">Generic drug recommendation displayed</p>
                          <p className="text-[9px] text-gray-500">Augmentin substituted. Checked stock database.</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">10:14 AM</span>
                    </div>

                    <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                        <div>
                          <p className="text-xs font-bold">Critical Lab Value Flagged & Routed</p>
                          <p className="text-[9px] text-gray-500">Serum Potassium 6.2 mEq/L alert sent to on-duty ICU registrar.</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">09:44 AM</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: AMBIENT DICTATION */}
          {activeTab === 'ambient' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base">Doctor's Ambient Audio & SOAP Dictation assistant</h3>
                  <p className="text-xs text-gray-500">Simulate a doctor consultation. The AI listens, suggests diagnoses/prescriptions, and generates SOAP notes.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Consent Banner:</span>
                  <button 
                    onClick={() => setConsentGranted(!consentGranted)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                      consentGranted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {consentGranted ? 'Patient Consent Granted' : 'Consent Pending'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Dictation Controller */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Voice Control Console</h4>
                  
                  <div className="flex flex-col items-center justify-center py-8 space-y-4 border border-dashed border-slate-800 rounded-2xl bg-[#030712]">
                    
                    {/* Audio wave simulation when recording */}
                    {isRecording ? (
                      <div className="flex items-center space-x-1.5 h-16">
                        {waveHeight.map((h, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ height: h }}
                            className="w-1.5 bg-purple-500 rounded-full" 
                            style={{ minHeight: '6px' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <MicOff className="w-6 h-6" />
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-xs font-black">{isRecording ? 'Listening ambiently...' : 'Microphone Idle'}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {isRecording ? `Recording: ${recordingSeconds}s` : 'Click Start to listen to consultation'}
                      </p>
                    </div>

                    <button
                      onClick={handleStartDictation}
                      className={`px-6 py-3 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2 ${
                        isRecording ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isRecording ? 'Stop & Parse Notes' : 'Start Dictation'}</span>
                    </button>

                  </div>

                  {/* Dictated text transcript stream */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Live Transcript</h5>
                    <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl text-[11px] text-gray-400 leading-relaxed font-semibold min-h-[80px]">
                      {recordingTranscript || "No transcription. Click Start to begin recording."}
                    </div>
                  </div>
                </div>

                {/* SOAP Note & Diagnostics Suggestions */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {soapNotes ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#090d16] border border-slate-855 rounded-3xl p-5 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Generated SOAP Clinical Record</h4>
                        <span className="text-[9px] bg-purple-500/20 text-purple-400 font-extrabold px-2 py-0.5 rounded-full uppercase">Drafted</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-purple-400">Subjective (S)</p>
                          <p className="text-xs text-gray-300 leading-relaxed bg-[#030712] p-3 rounded-2xl border border-slate-850">{soapNotes.subjective}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-purple-400">Objective (O)</p>
                          <p className="text-xs text-gray-300 leading-relaxed bg-[#030712] p-3 rounded-2xl border border-slate-850">{soapNotes.objective}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-purple-400">Assessment (A)</p>
                          <p className="text-xs text-gray-300 leading-relaxed bg-[#030712] p-3 rounded-2xl border border-slate-850">{soapNotes.assessment}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-purple-400">Plan (P)</p>
                          <p className="text-xs text-gray-300 leading-relaxed bg-[#030712] p-3 rounded-2xl border border-slate-850">{soapNotes.plan}</p>
                        </div>
                      </div>

                      {/* Coding standard conversions */}
                      <div className="border-t border-slate-850 pt-4 space-y-3">
                        <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Clinical Standards Alignment (ICD-10 / SNOMED CT)</h5>
                        <div className="flex flex-wrap gap-2">
                          {suggestedCodes.map((c, i) => (
                            <span key={i} className="text-[10px] bg-[#0c1221] border border-slate-850 rounded-xl px-3 py-2 flex items-center space-x-2 font-semibold">
                              <span className="text-rose-400 font-extrabold text-[9px]">{c.type}</span>
                              <span className="font-mono text-slate-200">{c.code}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-400">{c.desc}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Suggested Meds and Safety interaction warnings */}
                      <div className="border-t border-slate-850 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Suggested Prescriptions</h5>
                          {suggestedMeds.map((m, i) => (
                            <div key={i} className="p-3 bg-[#030712] border border-slate-850 rounded-2xl flex justify-between items-center">
                              <div>
                                <p className="text-xs font-black text-slate-200">{m.name} {m.dose}</p>
                                <p className="text-[9px] text-gray-500">Frequency: {m.frequency}</p>
                              </div>
                              <button className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                                Add to Rxs
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Clinical Safety Flags</h5>
                          {warnings.map((w, i) => (
                            <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] font-black text-amber-500 uppercase">{w.severity} Warning</p>
                                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{w.msg}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>

                    </motion.div>
                  ) : (
                    <div className="h-full bg-[#090d16] border border-slate-850 rounded-3xl p-6 flex flex-col justify-center items-center text-center text-gray-500 space-y-2 py-24">
                      <Brain className="w-12 h-12 opacity-30 text-purple-400" />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Awaiting Ambient Input</h4>
                      <p className="text-[11px] max-w-sm">Click "Start Dictation" and describe symptoms to draft an structured SOAP report.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: MULTIMODAL INTERPRETER */}
          {activeTab === 'multimodal' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Multimodal Diagnostic Interpreter (Lab & Radiology AI)</h3>
                <p className="text-xs text-gray-500">Upload reports, images, or PDFs to parse clinical metrics instantly and draft patient insights.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Upload Console */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">File Sandbox</h4>
                  
                  <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-4 bg-[#030712] flex flex-col items-center">
                    <Upload className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-xs font-black">Drag and drop file here</p>
                      <p className="text-[9px] text-gray-500 mt-1">Supports PDF, PNG, JPG (Max 10MB)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Select Sample Diagnostic File</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleAnalyzeReport('blood')}
                        className="p-3 bg-[#030712] border border-slate-850 hover:border-slate-700 text-left rounded-xl transition-all cursor-pointer"
                      >
                        <p className="text-xs font-black text-slate-200">CBC Hematology</p>
                        <p className="text-[9px] text-gray-500 mt-0.5">Lab Blood Report</p>
                      </button>
                      <button 
                        onClick={() => handleAnalyzeReport('xray')}
                        className="p-3 bg-[#030712] border border-slate-850 hover:border-slate-700 text-left rounded-xl transition-all cursor-pointer"
                      >
                        <p className="text-xs font-black text-slate-200">Chest X-Ray AP</p>
                        <p className="text-[9px] text-gray-500 mt-0.5">Radiology Scan</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interpretation Results */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {analysisLoading ? (
                    <div className="h-64 bg-[#090d16] border border-slate-850 rounded-3xl flex flex-col justify-center items-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Analyzing File & Querying Gemini API...</p>
                    </div>
                  ) : analysisResult ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Extraction & Interpretive Insights</h4>
                          <p className="text-[9px] text-gray-500 mt-0.5">Source: {selectedFile}</p>
                        </div>
                        {isCriticalFlagged && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-400 font-extrabold px-3 py-1 rounded-full border border-rose-500/30 animate-pulse">
                            CRITICAL VALUE FLAG
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-[#030712] border border-slate-850 rounded-2xl space-y-2">
                          <p className="text-[9px] font-black uppercase text-blue-400">Clinical Interpretation Summary</p>
                          <p className="text-xs text-slate-200 leading-relaxed font-semibold">{analysisResult}</p>
                        </div>

                        {isCriticalFlagged && (
                          <div className="p-4 bg-rose-500/5 border border-rose-500/25 rounded-2xl space-y-2">
                            <h5 className="text-xs font-black text-rose-500 flex items-center space-x-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Critical Threshold Action Protocol</span>
                            </h5>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                              Platelet levels (460,000 cells/mm³) exceed high normal threshold. Alert triggered for consulting hematologist. Suggested next step: correlate with erythrocyte sedimentation rate (ESR) or C-reactive protein (CRP).
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full bg-[#090d16] border border-slate-850 rounded-3xl p-6 flex flex-col justify-center items-center text-center text-gray-500 space-y-2 py-24">
                      <Upload className="w-12 h-12 opacity-30 text-blue-400" />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Awaiting Scan or PDF Upload</h4>
                      <p className="text-[11px] max-w-sm">Select one of the sample diagnostic files to trigger extraction modeling.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: SMART SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Natural Language Smart Search Console</h3>
                <p className="text-xs text-gray-500">Query clinical databases using natural queries. The engine translates queries to FHIR-compliant search expressions.</p>
              </div>

              <div className="space-y-4">
                
                {/* Search Bar Input */}
                <div className="bg-[#090d16] border border-slate-855 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center space-x-3 bg-[#030712] border border-slate-850 rounded-2xl px-4 py-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder='Try: "Find diabetic patients waiting more than 2 hours" or "Show pending discharge summaries"'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-slate-100 text-xs font-semibold"
                    />
                    <button
                      onClick={handleSmartSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Search
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center text-[10px] text-gray-500 font-bold">
                    <span>Quick Examples:</span>
                    <button 
                      onClick={() => setSearchQuery("Find diabetic patients waiting more than 2 hours")}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg cursor-pointer"
                    >
                      Diabetic Wait Times
                    </button>
                    <button 
                      onClick={() => setSearchQuery("Show pending discharge summaries")}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg cursor-pointer"
                    >
                      Discharge Summaries
                    </button>
                  </div>
                </div>

                {/* Results and SQL representation */}
                {searchLoading ? (
                  <div className="h-48 bg-[#090d16] border border-slate-850 rounded-3xl flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Compiling search query...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    
                    {/* Compiled FHIR Query expression */}
                    <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center space-x-2 text-amber-500">
                        <Terminal className="w-4 h-4" />
                        <h4 className="text-xs font-black uppercase tracking-wider">Compiled FHIR Query</h4>
                      </div>
                      <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl font-mono text-[10px] text-amber-200 overflow-x-auto">
                        {fhirQuery}
                      </div>
                    </div>

                    {/* Results list */}
                    <div className="lg:col-span-2 bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Database Query Results</h4>
                      <div className="space-y-3">
                        {searchResults.map((r, i) => (
                          <div key={i} className="p-4 bg-[#030712] border border-slate-850 rounded-2xl flex justify-between items-center">
                            <div>
                              <p className="text-xs font-black text-slate-200">{r.name}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5">{r.gender} • Age {r.age}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-250">Wait Time: {r.waitTime}</span>
                              {r.lastA1c !== 'N/A' && <p className="text-[9px] text-rose-400 mt-0.5">Last HbA1c: {r.lastA1c}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="h-48 bg-[#090d16] border border-slate-855 rounded-3xl flex flex-col justify-center items-center text-center text-gray-500 py-12">
                    <Search className="w-10 h-10 opacity-30 text-amber-500 mb-2" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Console Idle</p>
                    <p className="text-[10px] text-gray-500">Enter a query above to see FHIR compiling translation.</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 5: PATIENT TRANSLATION */}
          {activeTab === 'patient' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Patient Medical Translation Hub</h3>
                <p className="text-xs text-gray-500">Input clinical jargon to generate patient-facing educational materials in English, Hindi, and Marathi.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Inputs card */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Term Input Console</h4>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500">Clinical Jargon</label>
                    <textarea 
                      value={patientTerm}
                      onChange={(e) => setPatientTerm(e.target.value)}
                      className="w-full min-h-[100px] p-3 bg-[#030712] border border-slate-800 rounded-2xl text-xs font-semibold outline-none text-slate-100 placeholder-gray-650"
                      placeholder="e.g. Elevated serum creatinine, borderline renal dysfunction"
                    />
                  </div>

                  <button
                    onClick={handleTranslateTerm}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    Generate Explanations
                  </button>

                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400">
                      <ShieldCheck className="w-4 h-4" />
                      <h5 className="text-[10px] font-black uppercase">Strict Safety Guardrail</h5>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-relaxed">
                      AI Patient explanations must explain clinically, in plain terms, but must strictly avoid self-treatment suggestions and include clinician review alerts.
                    </p>
                  </div>
                </div>

                {/* Multilingual Explanations */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {translationLoading ? (
                    <div className="h-64 bg-[#090d16] border border-slate-850 rounded-3xl flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5 text-rose-500 animate-spin" />
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Generating translations...</span>
                    </div>
                  ) : translatedTerms ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      
                      <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-300">English Translation</h4>
                          <span className="text-[9px] font-bold text-gray-500">en-IN</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{translatedTerms.en}</p>
                      </div>

                      <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-300">Hindi Translation (हिंदी)</h4>
                          <span className="text-[9px] font-bold text-gray-500">hi-IN</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{translatedTerms.hi}</p>
                      </div>

                      <div className="bg-[#090d16] border border-slate-855 rounded-3xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-300">Marathi Translation (मराठी)</h4>
                          <span className="text-[9px] font-bold text-gray-500">mr-IN</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{translatedTerms.mr}</p>
                      </div>

                      <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-start space-x-2">
                        <Info className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[9px] text-gray-400 italic">
                          Disclaimer: Educational material only. Do not rely on this translation for self-diagnosis. Consult your physician.
                        </p>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="h-full bg-[#090d16] border border-slate-850 rounded-3xl p-6 flex flex-col justify-center items-center text-center text-gray-500 space-y-2 py-24">
                      <Languages className="w-12 h-12 opacity-30 text-rose-400" />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Awaiting Explanation Request</h4>
                      <p className="text-[11px] max-w-sm">Click "Generate Explanations" to translate jargon into plain multilingual statements.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 6: NURSE RISK ROSTER */}
          {activeTab === 'nurse' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Nurse Predictive Triage & Risk Roster</h3>
                <p className="text-xs text-gray-500">Real-time prediction of ICU admission probability and sepsis risks based on telemetry vitals trends.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Roster list */}
                <div className="lg:col-span-2 bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Ward Risk Registry</h4>
                  
                  <div className="space-y-3">
                    {nursePatients.map((p) => (
                      <div key={p.id} className="p-4 bg-[#030712] border border-slate-850 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-black text-slate-200">{p.name}</p>
                            <span className="text-[9px] text-gray-500">{p.bed}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold">{p.condition}</p>
                          <div className="flex items-center space-x-4 pt-1 text-[9px] text-gray-400 font-bold uppercase">
                            <span>Heart Rate: {p.heartRate} BPM</span>
                            <span>BP: {p.bp}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-gray-500 uppercase font-black">{p.riskType}</span>
                            <div className="flex items-center space-x-1.5 justify-end">
                              <span className={`text-xs font-black ${p.riskScore > 80 ? 'text-rose-500' : p.riskScore > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {p.riskScore}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${p.riskScore}%` }} 
                                  className={`h-full ${p.riskScore > 80 ? 'bg-rose-500' : p.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                />
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => setActiveHandover(p.name)}
                            className="bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-white text-[9px] font-black uppercase px-2.5 py-1 rounded transition-all cursor-pointer"
                          >
                            Draft Handover Notes
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handover SBAR generation */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">SBAR Shift Handover Draft</h4>
                  
                  {activeHandover ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl space-y-2">
                        <p className="text-[10px] font-black uppercase text-teal-400">Situation (S)</p>
                        <p className="text-[11px] text-gray-300 leading-tight">Patient {activeHandover} in ICU Bed 04 exhibiting symptoms consistent with post-op sepsis warnings.</p>
                      </div>

                      <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl space-y-2">
                        <p className="text-[10px] font-black uppercase text-teal-400">Background (B)</p>
                        <p className="text-[11px] text-gray-300 leading-tight">Post-op telemetry indicates heart rate climbing past 110 BPM. BP stabilizing at 90/58.</p>
                      </div>

                      <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl space-y-2">
                        <p className="text-[10px] font-black uppercase text-teal-400">Assessment (A)</p>
                        <p className="text-[11px] text-gray-300 leading-tight">Early Warning Score (EWS) is 7. Highly suggestive of early systemic inflammatory response.</p>
                      </div>

                      <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl space-y-2">
                        <p className="text-[10px] font-black uppercase text-teal-400">Recommendation (R)</p>
                        <p className="text-[11px] text-gray-300 leading-tight">Initiate IV fluid challenge. Inform registrar. Monitor urine output every hour.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-20 text-center text-gray-500 text-xs font-bold space-y-1">
                      <FileText className="w-8 h-8 text-teal-500 opacity-30 mx-auto mb-2" />
                      <p>No handover selected.</p>
                      <p className="text-[10px] text-gray-500 font-semibold">Click "Draft Handover Notes" on patient roster.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: OPERATIONS & PHARMACY */}
          {activeTab === 'ops' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Pharmacy Generic alternative & Operations Stock optimizer</h3>
                <p className="text-xs text-gray-500">Provide substitutions for expensive brand medicines and check hospital generic supply stock.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Finder Panel */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Generic substitution Finder</h4>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500">Brand Name</label>
                    <input 
                      type="text" 
                      value={drugBrand} 
                      onChange={(e) => setDrugBrand(e.target.value)}
                      className="w-full p-3 bg-[#030712] border border-slate-800 rounded-xl text-xs font-semibold outline-none text-slate-100" 
                      placeholder="e.g. Augmentin 625"
                    />
                  </div>

                  <button 
                    onClick={handleFindGeneric}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    Search Alternatives
                  </button>
                </div>

                {/* Alternatives results list */}
                <div className="lg:col-span-2 bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Stock & Alternatives List</h4>
                  
                  {genericAlternatives.length > 0 ? (
                    <div className="space-y-3">
                      {genericAlternatives.map((g, i) => (
                        <div key={i} className="p-4 bg-[#030712] border border-slate-850 rounded-2xl flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-slate-200">{g.name}</p>
                            <p className="text-[9px] text-gray-500">Mfg: {g.manufacturer}</p>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="text-xs font-black text-emerald-400">Price: {g.price}</span>
                            <p className="text-[9px] text-gray-500">Brand Price: {g.brandPrice} (Save {g.savings})</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-gray-500 text-xs font-bold space-y-1">
                      <Activity className="w-8 h-8 text-sky-500 opacity-30 mx-auto mb-2" />
                      <p>Awaiting brand query input.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 8: GOVERNMENT EPIDEMIOLOGY FORECASTS */}
          {activeTab === 'gov' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Government Disease Outbreak & Epidemiology forecaster</h3>
                <p className="text-xs text-gray-500">Analyze ward-wise patient admissions to forecast potential disease surges and coordinate resource deployment.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Parameters Panel */}
                <div className="bg-[#090d16] border border-slate-855 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Forecast Parameters</h4>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500">Select Municipal Ward</label>
                    <select 
                      value={selectedWard}
                      onChange={(e) => handleWardChange(e.target.value)}
                      className="w-full p-3 bg-[#030712] border border-slate-800 rounded-xl text-xs font-semibold outline-none text-slate-100 cursor-pointer"
                    >
                      <option value="F-North (Dharavi)">F-North (Dharavi)</option>
                      <option value="G-South (Worli)">G-South (Worli)</option>
                      <option value="H-East (Bandra)">H-East (Bandra)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-indigo-950/20 border border-indigo-900 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <TrendingUp className="w-4 h-4" />
                      <h5 className="text-[10px] font-black uppercase">Outbreak Confidence</h5>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-relaxed">
                      Epidemic early indicators score stands at 84% based on waterborne symptom clustering reported at primary health centers.
                    </p>
                  </div>
                </div>

                {/* Ward forecast numbers */}
                <div className="lg:col-span-2 bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Surge Predictions</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-[#030712] border border-slate-850 rounded-2xl">
                      <span className="text-[9px] text-gray-500 font-black uppercase">Predicted Gastroenteritis Cases (Next 14 Days)</span>
                      <h5 className="text-3xl font-black text-rose-500 mt-2">{forecastCases}</h5>
                      <span className="text-[9px] text-rose-400 font-bold flex items-center space-x-1 mt-1">
                        <span>+24% surge risk</span>
                      </span>
                    </div>

                    <div className="p-5 bg-[#030712] border border-slate-850 rounded-2xl">
                      <span className="text-[9px] text-gray-500 font-black uppercase">Recommended Vaccination Buffer</span>
                      <h5 className="text-3xl font-black text-slate-200 mt-2">1,500 doses</h5>
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center space-x-1 mt-1">
                        <span>Pre-allocated</span>
                      </span>
                    </div>
                  </div>

                  {/* Strategic policy recommendations */}
                  <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-2xl space-y-2">
                    <h5 className="text-xs font-black text-indigo-400 uppercase">Policy Insight & Action Guidelines</h5>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Outbreak modeling suggests water supply chlorination checks in F-North G-Block. Recommend dispatching 50 primary hygiene kits and anti-viral buffer stocks to Sion Hospital Pharmacy storage.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 9: SAFETY & EXPLAINABILITY */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Explainable AI & Safety Registry</h3>
                <p className="text-xs text-gray-500">Inspect the reasoning, source references, and doctor feedback audit trails for all cognitive recommendations.</p>
              </div>

              <div className="space-y-4">
                
                {/* Explainable AI block example */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Model Recommendation Explainability Card</h4>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full">Approved by Doctor</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-gray-500">Recommendation</p>
                      <p className="text-xs text-slate-250 font-black">Hold Warfarin dose; recommend immediate INR blood check.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-gray-500">Confidence Score</p>
                      <p className="text-xs text-emerald-400 font-black">94.2% (High Confidence)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-gray-500">Clinical Citation Source</p>
                      <p className="text-xs text-slate-200 font-black flex items-center space-x-1.5">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span>Murtagh's GP 8th Ed - Page 412</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#030712] border border-slate-850 rounded-2xl space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-amber-500">Alternative Possibilities Analyzed</h5>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      1. Keep Warfarin at low dose (1.5mg) with daily telemetry testing (24% confidence).<br />
                      2. Substitute with Heparin under hospital observation (6% confidence).
                    </p>
                  </div>
                </div>

                {/* Audit trail */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Doctor Decision Audit Logs</h4>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Dr. Deshmukh approved Osteoarthritis SOAP Note draft</span>
                      <span className="text-[9px] text-gray-500">09 July 2026, 10:28 AM</span>
                    </div>
                    <div className="p-3 bg-[#030712] border border-slate-850 rounded-2xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Dr. Deshmukh rejected Paracetamol alternative brand dosage change</span>
                      <span className="text-[9px] text-gray-500">09 July 2026, 10:14 AM</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 10: DEVELOPER SPECS */}
          {activeTab === 'dev' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-extrabold text-base">Developer API & Prompts Playground</h3>
                <p className="text-xs text-gray-500">Check the prompt guidelines, FHIR schemas, and integration documentation for developers.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* System Prompt */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Code className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">System Prompt (SOAP Note Extraction)</h4>
                  </div>
                  
                  <pre className="p-4 bg-[#030712] border border-slate-850 rounded-2xl font-mono text-[9px] text-blue-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`You are an ambient clinical assistant. Listen to the consultation transcript and output a JSON containing SOAP structured fields.
- Subjective: Symptoms reported by patient.
- Objective: Physician exam findings.
- Assessment: Primary diagnosis with corresponding ICD-10 code.
- Plan: Prescribed medication with generic equivalent, and instructions.`}
                  </pre>
                </div>

                {/* FHIR Spec */}
                <div className="bg-[#090d16] border border-slate-850 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Database className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">ABDM FHIR Diagnostic Report Schema</h4>
                  </div>
                  
                  <pre className="p-4 bg-[#030712] border border-slate-850 rounded-2xl font-mono text-[9px] text-emerald-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`{
  "resourceType": "DiagnosticReport",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
      "code": "HM",
      "display": "Hematology"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "58410-2",
      "display": "Complete Blood Count Panel"
    }]
  }
}`}
                  </pre>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
