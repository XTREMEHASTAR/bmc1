import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Brain,
  Calendar,
  FileText,
  User,
  Bell,
  ChevronRight,
  ArrowRight,
  LogOut,
  Check,
  X,
  Plus,
  Moon,
  Sun,
  Search,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  LayoutGrid,
  Heart,
  ShieldAlert,
  Sparkles,
  Send,
  Settings,
  BookOpen,
  Layers,
  Award,
  BarChart2,
  Eye,
  ShieldCheck,
  Clock,
  CheckSquare,
  Lock,
  Share2,
  Link,
  Download,
  Wifi,
  Zap,
  Timer,
  TrendingUp,
  Users,
  Database,
  FileSpreadsheet,
  CheckCircle,
  Info,
  Book,
  FileCode,
  Landmark,
  Scale,
  GraduationCap,
  ClipboardCheck,
  Code,
  Fingerprint,
  EyeOff,
  Globe,
  PlusCircle,
  AlertOctagon
} from 'lucide-react';

// De-identified Patients Mock data for Data Lab
const RAW_PATIENTS = [
  { id: '1', name: 'Rahul Anil Patil', aadhaar: '3829-4829-1029', age: 32, diagnosis: 'Osteoarthritis Knee', creatinine: '0.9 mg/dL', location: 'Dharavi Sector 2' },
  { id: '2', name: 'Suresh Kumar', aadhaar: '9012-4456-1122', age: 45, diagnosis: 'Lower Back Pain', creatinine: '1.2 mg/dL', location: 'Sion Circle' },
  { id: '3', name: 'Ayesha Shaikh', aadhaar: '8822-9012-7711', age: 28, diagnosis: 'Rheumatoid Arthritis', creatinine: '0.7 mg/dL', location: 'Bandra West' },
  { id: '4', name: 'Mahesh Jadhav', aadhaar: '1029-3829-4822', age: 50, diagnosis: 'Type 2 Diabetes', creatinine: '1.8 mg/dL', location: 'Andheri East' },
];

// Interactive mock research projects
const RESEARCH_PROJECTS = [
  { id: 'proj_1', title: 'Monsoon Outbreak Vector Correlation Study', Lead: 'Dr. Ramesh Patil', status: 'ONGOING', trials: 1, funding: '₹12.5L', progress: 68 },
  { id: 'proj_2', title: 'AI-assisted Diabetic Retinopathy Screening', Lead: 'Dr. Sneha Limaye', status: 'ETHICS PENDING', trials: 0, funding: '₹8.0L', progress: 20 },
  { id: 'proj_3', title: 'Dengue Vaccine Trial (Phase II Phase-Sion)', Lead: 'Dr. Sandeep Kelkar', status: 'RECRUITING', trials: 1, funding: '₹45.0L', progress: 42 },
  { id: 'proj_4', title: 'Metformin Readmission Correlatives in Public Wards', Lead: 'Dr. Kavita Patel', status: 'COMPLETED', trials: 0, funding: '₹4.2L', progress: 100 }
];

// Educational Case Studies for Case Library
const CASE_STUDIES = [
  {
    id: 'case_1',
    title: 'A 45-Year-Old Female with Progressive Symmetrical Polyarthritis',
    history: 'Morning stiffness lasting > 1 hour, swelling in MCP and PIP joints bilaterally.',
    examination: 'Symmetrical synovitis, rheumatoid nodules over elbow, reduced range of motion.',
    labs: 'RF positive (120 IU/mL), Anti-CCP antibodies positive (> 200 U/mL), ESR 45 mm/hr.',
    teachingPoints: 'Early introduction of DMARDs prevents long-term joint erosion.',
    solutionIndex: 1, // Rheumatoid Arthritis
    options: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Gouty Arthritis', 'Psoriatic Arthritis']
  },
  {
    id: 'case_2',
    title: 'Acute Onset Knee Monarthritis with Negatively Birefringent Crystals',
    history: 'Sudden, severe pain in left first metatarsophalangeal joint after a high-purine meal.',
    examination: 'Joint is erythematous, warm, edematous, and extremely tender to touch.',
    labs: 'Serum Urate 8.9 mg/dL, synovial fluid reveals needle-shaped intracellular crystals.',
    teachingPoints: 'Acute management involves NSAIDs or Colchicine, long-term requires allopurinol.',
    solutionIndex: 2, // Gout
    options: ['Pseudogout', 'Septic Arthritis', 'Gouty Arthritis', 'Rheumatoid Arthritis']
  }
];

interface MedicalResearchDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function MedicalResearchDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: MedicalResearchDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'research' | 'ethics' | 'trials' | 'datalab' | 'assistant' | 'knowledge' | 'education' | 'publication' | 'analytics'>('dashboard');

  // Core research state variables
  const [projects, setProjects] = useState(RESEARCH_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(RESEARCH_PROJECTS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Size Calculator State
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [effectSize, setEffectSize] = useState(0.5);
  const [calculatedSampleSize, setCalculatedSampleSize] = useState(64);

  // Recalculate sample size when parameters move
  useEffect(() => {
    // Standard sample size formula for two independent groups:
    // n = 2 * (Z_alpha + Z_beta)^2 * (s^2) / (d^2)
    // We approximate using simple regression weights of typical alpha/power values
    const zAlpha = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;
    const zBeta = power === 0.95 ? 1.645 : power === 0.90 ? 1.282 : power === 0.80 ? 0.842 : 0.524;
    const numerator = 2 * Math.pow(zAlpha + zBeta, 2);
    const denominator = Math.pow(effectSize, 2);
    const result = Math.ceil(numerator / denominator);
    setCalculatedSampleSize(isNaN(result) || result === Infinity ? 0 : result);
  }, [alpha, power, effectSize]);

  // Ethics committee digital signature
  const [passcode, setPasscode] = useState('');
  const [isDigitallySigned, setIsDigitallySigned] = useState(false);
  const [signatureTrail, setSignatureTrail] = useState<string[]>([]);

  const handleDigitalSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsDigitallySigned(true);
      setSignatureTrail(prev => [...prev, `Proposal approved by Chief Research Officer at ${new Date().toLocaleTimeString()} (Aadhaar Verified Signoff)`]);
      setPasscode('');
    } else {
      alert('Invalid research signing passcode. Enter 1234 for testing.');
    }
  };

  // AI Data Lab - De-identification simulator
  const [applyDeIdent, setApplyDeIdent] = useState(false);

  // AI Assistant states
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLogs, setAssistantLogs] = useState<Array<{ q: string; a: string }>>([
    {
      q: "Draft a patient consent summary for the Dengue vaccine trial.",
      a: "This study evaluates the efficacy of the vaccine against DENV-1 and DENV-2 serotypes. Participation is completely voluntary. Patients can withdraw at any time without affecting standard care. Potential side effects include mild localized fever and muscle aches."
    }
  ]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  const triggerAssistantQuery = (query: string) => {
    if (!query.trim()) return;
    setIsAssistantLoading(true);
    setTimeout(() => {
      let a = "";
      if (query.toLowerCase().includes('sample') || query.toLowerCase().includes('size')) {
        a = "Based on your input parameters, a calculated sample size of 64 participants per study arm is statistically sufficient to achieve 80% power at alpha = 0.05 under an estimated moderate Cohen effect size of 0.5.";
      } else if (query.toLowerCase().includes('ethics') || query.toLowerCase().includes('review')) {
        a = "Ethics submission protocol requires patient de-identification compliance matching ABDM and the DPDP Act 2023. Check the AI Data Lab tab to test masking filters on your current cohort.";
      } else if (query.toLowerCase().includes('diabetes') || query.toLowerCase().includes('retinopathy')) {
        a = "Outlining literature review: Deep learning models (specifically ResNet-50 and Vision Transformers) show 96.2% sensitivity for detecting proliferative diabetic retinopathy from color fundus photos. Gap: Low clinical trial validation in municipal UPHCs.";
      } else {
        a = "Your study parameters suggest a randomized clinical trial design. AI recommends using double-blinded block randomization to minimize investigator bias. Ensure all clinical trial registries are linked via CTRI.";
      }
      setAssistantLogs(prev => [{ q: query, a }, ...prev]);
      setAssistantInput('');
      setIsAssistantLoading(false);
    }, 1200);
  };

  // Education Quiz State
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScored, setQuizScored] = useState(false);
  const [quizResultText, setQuizResultText] = useState('');

  const submitQuiz = () => {
    if (quizAnswer === null) return;
    const isCorrect = quizAnswer === CASE_STUDIES[selectedCaseIdx].solutionIndex;
    setQuizScored(true);
    setQuizResultText(isCorrect 
      ? "CORRECT! Synovial needle crystals confirm gouty arthritis. Management should center on NSAIDs and long-term uric acid reduction."
      : "INCORRECT. Re-evaluate joint fluid analysis. Needle crystals showing negative birefringence are pathognomonic of gouty arthritis."
    );
  };

  // Published paper citations builder
  const [citationsFormat, setCitationsFormat] = useState<'APA' | 'AMA' | 'Harvard'>('APA');

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#090d16] text-gray-200' : 'bg-slate-50 text-slate-800'} transition-all`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b p-4 backdrop-blur-md flex items-center justify-between transition-colors bg-white/95 border-gray-100 dark:bg-[#0c1322]/95 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white shadow-md">
            <Brain className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>MCGM Medical Research</span>
                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-black tracking-normal uppercase">AI Knowledge Hub</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Clinical Trial Engine • Faculty Education Workspace • Privacy Sandbox
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-slate-100 dark:border-gray-800 dark:hover:bg-slate-900 text-gray-400 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
          </button>

          <button 
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Lock Workspace</span>
          </button>
        </div>
      </header>

      {/* Main Content Router */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Active Trials</span>
            <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">12 Clinical</h3>
            <p className="text-[10px] text-green-500 font-bold mt-1">✓ CTRI Verified</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Ethics Proposals</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">4 Pending</h3>
            <p className="text-[10px] text-orange-500 font-bold mt-1">Meeting: Friday 3PM</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Total Publications</span>
            <h3 className="text-xl font-black text-emerald-500 mt-1">340 Articles</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">PubMed Indexed</p>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Research Grants</span>
            <h3 className="text-xl font-black text-[#0A5BFF] mt-1">₹85.4 Lakhs</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">DBT / ICMR Funded</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Education Scholars</span>
            <h3 className="text-xl font-black text-violet-500 mt-1">82 Residents</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Logbooks online</p>
          </div>
        </div>

        {/* Tab Router Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl max-w-6xl shadow-sm">
          {[
            { id: 'dashboard', label: 'Active Projects', icon: LayoutGrid },
            { id: 'research', label: 'Study Designer', icon: FileCode },
            { id: 'ethics', label: 'Ethics Committee', icon: Scale },
            { id: 'trials', label: 'Clinical Trials', icon: CheckCircle },
            { id: 'datalab', label: 'AI Data Lab', icon: Database },
            { id: 'assistant', label: 'AI Research Assistant', icon: Sparkles },
            { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpen },
            { id: 'education', label: 'Case & Quiz Library', icon: GraduationCap },
            { id: 'publication', label: 'Publication Center', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-650 bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab view panels */}
        <div className="mt-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: RESEARCH DASHBOARD / ACTIVE PROJECTS */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Active Projects List */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Institutional Clinical Trials & Research projects</h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">MCGM Medical College active studies</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-500 text-[9px] font-black rounded uppercase">Academic Sync Active</span>
                    </div>

                    <div className="space-y-3">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row justify-between md:items-center gap-4 ${
                            selectedProject.id === proj.id
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40'
                              : 'bg-white dark:bg-transparent border-gray-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{proj.title}</h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] text-gray-400 font-bold">PI: {proj.Lead}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              <span className="text-[10px] text-gray-400 font-bold">Grant: {proj.funding}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${proj.progress}%` }} />
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              proj.status === 'ONGOING' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' :
                              proj.status === 'ETHICS PENDING' ? 'bg-orange-100 dark:bg-orange-950 text-orange-600' :
                              proj.status === 'RECRUITING' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                              'bg-gray-100 dark:bg-gray-900 text-gray-500'
                            }`}>
                              {proj.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Research Alerts & Updates */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Research Notifications</h3>
                      
                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl flex items-start space-x-2 text-orange-600">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Ethics Review Action Required</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Dr. Sneha Limaye's Diabetic Retinopathy screening protocol is pending CRO digital signoff.</p>
                          </div>
                        </div>

                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex items-start space-x-2 text-indigo-600">
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">AI Data Lab Suggestion</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Dengue vaccine cohort qualifies for DPDP compliance. Auto-masking enabled.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: STUDY DESIGNER & SAMPLE SIZE CALCULATOR */}
            {activeTab === 'research' && (
              <motion.div
                key="research"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left Column: Sample Size Calculator */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <Activity className="w-4.5 h-4.5 text-indigo-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Sample Size Calculator</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-bold uppercase">Significance Level (Alpha)</label>
                      <select 
                        value={alpha} 
                        onChange={(e) => setAlpha(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs outline-none"
                      >
                        <option value={0.01}>0.01 (99% Confidence)</option>
                        <option value={0.05}>0.05 (95% Confidence)</option>
                        <option value={0.10}>0.10 (90% Confidence)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-bold uppercase">Statistical Power (1 - Beta)</label>
                      <select 
                        value={power} 
                        onChange={(e) => setPower(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs outline-none"
                      >
                        <option value={0.95}>0.95 Power</option>
                        <option value={0.90}>0.90 Power</option>
                        <option value={0.80}>0.80 Power</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-bold uppercase">Estimated Effect Size (Cohen's d)</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0.1"
                          max="1.5"
                          step="0.1"
                          value={effectSize}
                          onChange={(e) => setEffectSize(parseFloat(e.target.value))}
                          className="flex-1 accent-indigo-650"
                        />
                        <span className="text-xs font-black w-8">{effectSize}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-center space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Required Sample Size</span>
                      <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{calculatedSampleSize} Patients</h3>
                      <p className="text-[9px] text-gray-400">Total required sample per randomized study arm</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Protocol Generator Draft */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Study Protocol Outline</h3>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-semibold leading-relaxed space-y-3">
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                      <span className="text-[9px] text-gray-400 font-black uppercase">Study Objective</span>
                      <p className="mt-1 font-bold">Evaluate diabetic retinopathy diagnostic accuracy of AI models vs clinical fundus exams in municipal UPHCs.</p>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                      <span className="text-[9px] text-gray-400 font-black uppercase">Inclusion Criteria</span>
                      <p className="mt-1 font-bold">Adult patients aged 18-70 with diagnosed Type 2 diabetes for &gt; 5 years, presenting without pre-diagnosed proliferative retinopathy.</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-black uppercase">Primary Endpoints</span>
                      <p className="mt-1 font-bold">Diagnostic sensitivity and specificity of automated retinopathy graders compared to standard ophthalmic exam consensus.</p>
                    </div>
                  </div>

                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
                    Export Study Protocol PDF
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: ETHICS COMMITTEE & SIGN-OFF */}
            {activeTab === 'ethics' && (
              <motion.div
                key="ethics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left Column: Proposals Waiting Review */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Institutional Review Board (IRB) Queue</h3>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">AI Diabetic Retinopathy Screening Proposal</h4>
                        <p className="text-[10px] text-gray-400 mt-1">PI: Dr. Sneha Limaye • Department: Ophthalmology</p>
                      </div>
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 text-[9px] font-black rounded uppercase">PENDING CRO SIGNATURE</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center opacity-70">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Dengue Vaccine Phase II Trial Protocol</h4>
                        <p className="text-[10px] text-gray-400 mt-1">PI: Dr. Sandeep Kelkar • Department: Pediatrics</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[9px] font-black rounded uppercase">APPROVED</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Digital Signoff Signer */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Proposal Digital Approval</h3>

                  <form onSubmit={handleDigitalSign} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-bold uppercase">Enter Chief Investigator Passcode (1234)</label>
                      <input
                        type="password"
                        placeholder="••••"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>Digitally Sign & Approve</span>
                    </button>
                  </form>

                  {/* Audit Trail list */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <span className="text-[9px] text-gray-400 font-black uppercase">IRB Audit Trail Ledger</span>
                    <div className="space-y-1.5 text-[10px] text-gray-400 font-semibold leading-normal">
                      {signatureTrail.length === 0 ? (
                        <p>No approvals signed off this session.</p>
                      ) : (
                        signatureTrail.map((sig, i) => (
                          <div key={i} className="flex items-start space-x-1.5 text-emerald-500">
                            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{sig}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: CLINICAL TRIALS & RECRUITMENT */}
            {activeTab === 'trials' && (
              <motion.div
                key="trials"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Trial Recruitment sites */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Clinical Trial Recruitment Monitoring</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-slate-800 dark:text-slate-100">Dengue Vaccine Phase II Trial (Sion Hospital Site)</h4>
                          <div className="flex items-center space-x-2 mt-1 text-[10px] text-gray-400 font-bold">
                            <span>Recruited: 42 / 100</span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            <span>Adverse Events: 0 Alerts</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[9px] font-black rounded uppercase">RECRUITING ACTIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Randomizer helper */}
                  <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider">Participant Block Randomizer</h3>
                    <p className="text-xs text-gray-400">Secure de-identified randomization of next participant cohort matching protocol constraints.</p>
                    <button className="w-full bg-[#0A5BFF] hover:bg-[#002f66] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer">
                      Generate Randomization ID
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 5: AI DATA LAB (De-identification & DPDP compliance sandbox) */}
            {activeTab === 'datalab' && (
              <motion.div
                key="datalab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Patient Cohort Table with Masking Switch */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Research Data Sandbox</h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">Simulate HIPAA & DPDP Act compliance masking</p>
                      </div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-xs font-black text-gray-400 uppercase">Apply De-Identification</span>
                        <input
                          type="checkbox"
                          checked={applyDeIdent}
                          onChange={(e) => setApplyDeIdent(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5"
                        />
                      </label>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold">
                            <th className="py-2">Aadhaar (PII)</th>
                            <th className="py-2">Patient Name</th>
                            <th className="py-2">Age</th>
                            <th className="py-2">Diagnosis</th>
                            <th className="py-2 text-right">Serum Creatinine</th>
                          </tr>
                        </thead>
                        <tbody>
                          {RAW_PATIENTS.map(pat => (
                            <tr key={pat.id} className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/10">
                              <td className="py-3 font-mono">{applyDeIdent ? '••••-••••-••••' : pat.aadhaar}</td>
                              <td className="py-3 font-bold">{applyDeIdent ? 'PATIENT_' + pat.id : pat.name}</td>
                              <td className="py-3">{applyDeIdent ? Math.floor(pat.age / 10) * 10 + 's' : pat.age}</td>
                              <td className="py-3 font-bold">{pat.diagnosis}</td>
                              <td className="py-3 text-right">{pat.creatinine}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Privacy Compliance Verification */}
                  <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider">Privacy Engine Output</h3>
                    
                    <div className="space-y-3 font-semibold text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>K-Anonymity Verified (k=4)</span>
                      </div>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 text-[10.5px] font-bold flex items-center space-x-2">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>Differential Privacy Noise Added to Lab Values</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Cohort data ready for secure export or API integration to external model evaluators.</p>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 6: AI RESEARCH ASSISTANT */}
            {activeTab === 'assistant' && (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Chat Console */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                      Academic Literature & Protocol Assistant
                    </h3>
                    <span className="text-[9px] text-gray-400 font-black">AI RESIDENT</span>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 flex flex-col-reverse">
                    {assistantLogs.map((chat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="bg-indigo-650 bg-indigo-600 text-white p-3 rounded-2xl text-xs font-black max-w-sm">
                            {chat.q}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-4 rounded-3xl text-xs leading-relaxed max-w-xl text-slate-700 dark:text-slate-400 font-semibold space-y-1">
                            <p>{chat.a}</p>
                            <p className="text-[9.5px] text-orange-500 font-bold italic pt-1">Note: AI-generated text. Peer review mandatory before final IRB submission.</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask AI Research Assistant: e.g. Draft sample size analysis or Summarize Diabetic Retinopathy literature..."
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && triggerAssistantQuery(assistantInput)}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                    <button
                      onClick={() => triggerAssistantQuery(assistantInput)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      {isAssistantLoading ? 'Formulating...' : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Suggested research prompts */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Suggested Research Queries</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      "Suggest sample size calculation parameters.",
                      "Outline recent studies on AI Diabetic Retinopathy.",
                      "Find research gaps in public ward Dengue monitoring."
                    ].map((query, idx) => (
                      <button
                        key={idx}
                        onClick={() => triggerAssistantQuery(query)}
                        className="text-left p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl text-xs font-black text-slate-700 dark:text-slate-400 transition-all cursor-pointer border border-gray-100 dark:border-gray-800"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 7: MEDICAL KNOWLEDGE HUB */}
            {activeTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Universal Medical Knowledge Search</h3>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Linked to PubMed & MCGM Guidelines</span>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-2xl w-full">
                    <Search className="w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search guidelines, journal articles, hospital protocols, drug references, surgical videos..."
                      className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 w-full placeholder-gray-500 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                      <Book className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs font-black">MCGM Standard Hospital Protocols</h4>
                      <p className="text-[10px] text-gray-400">Revised malaria and dengue management algorithms for public clinics.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                      <Play className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs font-black">Surgical Technique Video Library</h4>
                      <p className="text-[10px] text-gray-400">Bilateral total knee arthroplasty techniques by Dr. Ramesh Patil.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs font-black">Radiology PACS Case Reference</h4>
                      <p className="text-[10px] text-gray-400">Curated chest CT patterns of drug-resistant pulmonary tuberculosis.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 8: CASE LIBRARY & CLINICAL EDUCATION */}
            {activeTab === 'education' && (
              <motion.div
                key="education"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left Column: Interactive Case Simulation */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Interactive Resident Case Study</h3>
                    <div className="flex gap-2">
                      {CASE_STUDIES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedCaseIdx(i); setQuizAnswer(null); setQuizScored(false); }}
                          className={`w-6 h-6 rounded-full text-xs font-black ${selectedCaseIdx === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-gray-400'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 font-semibold text-xs leading-relaxed">
                    <div>
                      <span className="text-[9px] text-gray-400 font-black uppercase">Clinical Presentation</span>
                      <p className="mt-1 text-slate-800 dark:text-slate-205">{CASE_STUDIES[selectedCaseIdx].title}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <span className="text-[9px] text-gray-400 font-black uppercase">Patient History & Exam</span>
                      <p className="mt-1">{CASE_STUDIES[selectedCaseIdx].history}</p>
                      <p className="mt-1 text-gray-400">{CASE_STUDIES[selectedCaseIdx].examination}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <span className="text-[9px] text-gray-400 font-black uppercase">Laboratory Findings</span>
                      <p className="mt-1 font-mono">{CASE_STUDIES[selectedCaseIdx].labs}</p>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] text-gray-400 font-black uppercase">Select Most Likely Diagnosis</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {CASE_STUDIES[selectedCaseIdx].options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuizAnswer(idx)}
                          className={`p-3 text-left rounded-xl text-xs font-black transition-all cursor-pointer border ${
                            quizAnswer === idx
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900'
                              : 'bg-white dark:bg-transparent border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={submitQuiz}
                      disabled={quizAnswer === null}
                      className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    >
                      Submit Diagnosis
                    </button>
                    {quizScored && (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-xs font-bold flex-1 ml-4 text-indigo-600 dark:text-indigo-400">
                        {quizResultText}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Logbook and skills tracking */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Resident Competency Logbook</h3>
                  <div className="space-y-3 font-semibold text-xs leading-relaxed">
                    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800/40">
                      <span className="text-gray-400">Arterial Line Placement</span>
                      <span className="text-emerald-500 font-bold">12 Completed (SLA Met)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800/40">
                      <span className="text-gray-400">Lumbar Puncture</span>
                      <span className="text-orange-500 font-bold">4 Completed (Needs 6)</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Intubation Competency</span>
                      <span className="text-emerald-500 font-bold">Approved by Dr. Patil</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 9: PUBLICATION CENTER */}
            {activeTab === 'publication' && (
              <motion.div
                key="publication"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Collaborative Editor Box */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Manuscript Collaborative Editor</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Title: AI Retinopathy Screening in Public Wards</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setCitationsFormat('APA')}
                        className={`px-2 py-1 rounded text-[9px] font-black ${citationsFormat === 'APA' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-gray-400'}`}
                      >
                        APA
                      </button>
                      <button 
                        onClick={() => setCitationsFormat('AMA')}
                        className={`px-2 py-1 rounded text-[9px] font-black ${citationsFormat === 'AMA' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-gray-400'}`}
                      >
                        AMA
                      </button>
                      <button 
                        onClick={() => setCitationsFormat('Harvard')}
                        className={`px-2 py-1 rounded text-[9px] font-black ${citationsFormat === 'Harvard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-gray-400'}`}
                      >
                        Harvard
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl min-h-[250px] border border-gray-100 dark:border-gray-800 font-semibold text-xs leading-relaxed space-y-4">
                    <p className="text-slate-800 dark:text-slate-105">
                      **Introduction:** Diabetic retinopathy remains a leading cause of preventable blindness in urban populations. Early screening is critical, yet access to specialist ophthalmologists in municipal primary clinics remains limited.
                    </p>
                    <p className="text-slate-800 dark:text-slate-105">
                      **Methods:** We deployed a validated ResNet-50 fundus deep learning classifier across three UPHC locations in Mumbai. De-identified patient cohorts were generated via the MCGM AI Data Lab.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 border-l-2 border-indigo-500 pl-3 italic">
                      Comment by Dr. Ramesh Patil: "Include the calculated sample size (N=64 per group) here to satisfy AMA review standards."
                    </p>
                  </div>
                </div>

                {/* Right Column: Reference Builder & Citation helper */}
                <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider">Academic Reference Formatter</h3>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                    <span className="text-[9px] text-gray-400 font-black uppercase">Generated Citation ({citationsFormat})</span>
                    <p className="text-[11px] font-bold leading-normal">
                      {citationsFormat === 'APA' && "Patil, R., & Limaye, S. (2026). Artificial Intelligence in Ophthalmic Care. Journal of Public Health Research, 14(2), 112-118."}
                      {citationsFormat === 'AMA' && "Patil R, Limaye S. Artificial Intelligence in Ophthalmic Care. J Pub Health Res. 2026;14(2):112-118."}
                      {citationsFormat === 'Harvard' && "Patil, R. and Limaye, S., 2026. Artificial Intelligence in Ophthalmic Care. Journal of Public Health Research, 14(2), pp.112-118."}
                    </p>
                  </div>

                  <button className="w-full bg-[#0A5BFF] hover:bg-[#002f66] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer">
                    Copy Reference to Clipboard
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
