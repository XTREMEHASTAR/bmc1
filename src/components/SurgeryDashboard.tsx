import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Eye,
  FileText,
  Heart,
  Info,
  Layers,
  LayoutGrid,
  Lock,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Thermometer,
  Timer,
  Users,
  Volume2,
  X,
  Zap,
  Mic,
  Sliders,
  Scissors,
  CheckSquare,
  Sparkles,
  BarChart3,
  HardDrive,
  Package,
  Droplet,
  Tv
} from 'lucide-react';

interface SurgeryCase {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  abhaId: string;
  procedure: string;
  specialty: 'Cardiac' | 'General' | 'Neurosurgery' | 'Orthopaedic' | 'Urology' | 'Ophthalmic';
  surgeon: string;
  anaesthetist: string;
  otNumber: string;
  startTime: string;
  estimatedDuration: number; // minutes
  status: 'Pre-Op' | 'In-Surgery' | 'Recovery' | 'Completed' | 'Delayed' | 'Cancelled';
  priority: 'Routine' | 'Urgent' | 'Emergency';
  checklistProgress: number; // 0 to 100
  whoStatus: {
    signIn: boolean;
    timeOut: boolean;
    signOut: boolean;
  };
}

export default function SurgeryDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'command' | 'scheduler' | 'preop' | 'who' | 'live' | 'anaesthesia' | 'instruments' | 'implants' | 'recovery' | 'analytics' | 'fhir'>('command');
  const [isWallDisplay, setIsWallDisplay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated State for Surgery Cases
  const [cases, setCases] = useState<SurgeryCase[]>([
    {
      id: "SURG-201",
      patientName: "Gajanan Madhav Patil",
      age: 58,
      gender: "Male",
      abhaId: "patil.gajanan@abha",
      procedure: "Coronary Artery Bypass Graft (CABG)",
      specialty: "Cardiac",
      surgeon: "Dr. Sandeep Vaishya",
      anaesthetist: "Dr. Meera Nair",
      otNumber: "OT-01 (Cardiac Hybrid)",
      startTime: "08:30",
      estimatedDuration: 240,
      status: "In-Surgery",
      priority: "Urgent",
      checklistProgress: 66,
      whoStatus: { signIn: true, timeOut: true, signOut: false }
    },
    {
      id: "SURG-202",
      patientName: "Meena Satish Kamble",
      age: 42,
      gender: "Female",
      abhaId: "meenak@abha",
      procedure: "Laparoscopic Cholecystectomy",
      specialty: "General",
      surgeon: "Dr. Alok Mehta",
      anaesthetist: "Dr. K. R. Raman",
      otNumber: "OT-03",
      startTime: "10:15",
      estimatedDuration: 90,
      status: "Pre-Op",
      priority: "Routine",
      checklistProgress: 40,
      whoStatus: { signIn: true, timeOut: false, signOut: false }
    },
    {
      id: "SURG-203",
      patientName: "Rajesh Ramchandra Joshi",
      age: 65,
      gender: "Male",
      abhaId: "rajeshj@abha",
      procedure: "Lumbar Laminectomy & Fusion",
      specialty: "Neurosurgery",
      surgeon: "Dr. Anil D'Souza",
      anaesthetist: "Dr. Meera Nair",
      otNumber: "OT-02",
      startTime: "09:00",
      estimatedDuration: 180,
      status: "In-Surgery",
      priority: "Routine",
      checklistProgress: 66,
      whoStatus: { signIn: true, timeOut: true, signOut: false }
    },
    {
      id: "SURG-204",
      patientName: "Sunita Dilip Thorat",
      age: 29,
      gender: "Female",
      abhaId: "sunitat@abha",
      procedure: "Emergency Appendectomy",
      specialty: "General",
      surgeon: "Dr. Alok Mehta",
      anaesthetist: "Dr. K. R. Raman",
      otNumber: "OT-04 (Emergency)",
      startTime: "11:45",
      estimatedDuration: 60,
      status: "Pre-Op",
      priority: "Emergency",
      checklistProgress: 10,
      whoStatus: { signIn: false, timeOut: false, signOut: false }
    },
    {
      id: "SURG-205",
      patientName: "Vikram Sunil Shinde",
      age: 51,
      gender: "Male",
      abhaId: "vikrams@abha",
      procedure: "Total Knee Arthroplasty (R)",
      specialty: "Orthopaedic",
      surgeon: "Dr. Rajesh Shah",
      anaesthetist: "Dr. S. K. Sen",
      otNumber: "OT-05",
      startTime: "13:30",
      estimatedDuration: 120,
      status: "Pre-Op",
      priority: "Routine",
      checklistProgress: 0,
      whoStatus: { signIn: false, timeOut: false, signOut: false }
    }
  ]);

  // Selected Case for Details/WHO Checklist/Live Surgery
  const [selectedCaseId, setSelectedCaseId] = useState<string>("SURG-201");
  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Live Surgery Metrics (Simulated updates)
  const [vitals, setVitals] = useState({ hr: 78, sbp: 122, dbp: 74, rr: 14, spo2: 99, temp: 36.8 });
  const [elapsedTime, setElapsedTime] = useState(142); // minutes elapsed
  const [bloodLoss, setBloodLoss] = useState(320); // ml
  const [urineOutput, setUrineOutput] = useState(150); // ml
  const [instrumentCount, setInstrumentCount] = useState({ initial: 48, current: 48, status: 'MATCHED' });
  const [spongeCount, setSpongeCount] = useState({ initial: 20, current: 20, status: 'MATCHED' });
  const [needleCount, setNeedleCount] = useState({ initial: 15, current: 15, status: 'MATCHED' });
  
  // Anaesthesia drugs
  const [anaesthesiaLogs, setAnaesthesiaLogs] = useState([
    { time: "08:35", drug: "Propofol", dose: "150 mg", route: "IV Bolus" },
    { time: "08:37", drug: "Fentanyl", dose: "100 mcg", route: "IV Bolus" },
    { time: "08:40", drug: "Atracurium", dose: "40 mg", route: "IV Bolus" },
    { time: "09:30", drug: "Atracurium (Maintenance)", dose: "10 mg", route: "IV Bolus" },
    { time: "10:30", drug: "Atracurium (Maintenance)", dose: "10 mg", route: "IV" }
  ]);
  const [newDrug, setNewDrug] = useState({ name: '', dose: '', route: 'IV Bolus' });

  // CSSD Sterilization Queue
  const [sterilizationQueue, setSterilizationQueue] = useState([
    { id: "TRAY-109", name: "Major Vascular Tray A", method: "Autoclave (Steam)", status: "Sterilizing", timeLeft: "14 min", loadNo: "L-904" },
    { id: "TRAY-112", name: "Ortho Knee Set B", method: "Autoclave (Steam)", status: "Sterilized (Cooling)", timeLeft: "0 min", loadNo: "L-903" },
    { id: "TRAY-115", name: "Micro Neurosurgery Set", method: "Autoclave (Plasma)", status: "Pending", timeLeft: "Ready in queue", loadNo: "L-905" }
  ]);

  // Implants inventory catalog
  const [implantCatalog, setImplantCatalog] = useState([
    { udi: "00884838029312", name: "St. Jude Epic Valve 23mm", lot: "L-CABG-9102", status: "Allocated", recall: false },
    { udi: "00732847921932", name: "Zimmer Biomet NexGen Tibial Plate", lot: "L-TKA-7781", status: "Available", recall: false },
    { udi: "00921820491022", name: "Stryker Titanium Bone Plate", lot: "L-STR-1122", status: "Available", recall: true }
  ]);

  // WHO checklist interactive checks
  const [signInChecks, setSignInChecks] = useState({
    identityConfirmed: true,
    siteMarked: true,
    anaesthesiaSafetyChecked: true,
    pulseOxymeterOn: true,
    allergyStated: true,
    airwayRiskAssessed: true,
    bloodLossRiskAssessed: true
  });

  const [timeOutChecks, setTimeOutChecks] = useState({
    confirmTeamIntroduced: true,
    confirmPatientIdentity: true,
    confirmProcedureSite: true,
    antibioticProphylaxisGiven: true,
    anticipatedCriticalEventsSurgeon: false,
    anticipatedCriticalEventsAnaesthetist: false,
    anticipatedCriticalEventsNursing: false,
    imagingDisplayed: true
  });

  const [signOutChecks, setSignOutChecks] = useState({
    procedureRecorded: false,
    instrumentCountMatched: false,
    specimenLabeled: false,
    equipmentProblemsAddressed: false,
    recoveryConcernsReviewed: false
  });

  // Ambient Voice Dictation Simulation
  const [isDictating, setIsDictating] = useState(false);
  const [dictatedText, setDictatedText] = useState("");
  const [clinicalNoteDraft, setClinicalNoteDraft] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Instrument count status (matched) requires digital sign-off from Scrub Nurse.",
    "Antibiotic prophylaxis (Cefazolin 2g) was administered at 08:34. Ready for Time Out confirmation.",
    "Specimen container count: 1 specimen logged. Standard biopsy container labeled with patient ABHA barcode."
  ]);

  // Simulate vitals flickering
  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedCase.status === 'In-Surgery') {
        setVitals(prev => ({
          hr: Math.round(prev.hr + (Math.random() * 4 - 2)),
          sbp: Math.round(prev.sbp + (Math.random() * 6 - 3)),
          dbp: Math.round(prev.dbp + (Math.random() * 4 - 2)),
          rr: Math.round(prev.rr + (Math.random() * 2 - 1)),
          spo2: Math.min(100, Math.max(95, Math.round(prev.spo2 + (Math.random() * 2 - 1)))),
          temp: parseFloat((prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1))
        }));
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [selectedCase]);

  // Handle voice command simulation
  const startVoiceDictation = () => {
    setIsDictating(true);
    setDictatedText("Listening to surgical ambient microphone...");
    setTimeout(() => {
      setDictatedText("Ambient Audio: 'Completed anastomosis of the left internal mammary artery to the left anterior descending artery. Hemostasis achieved. Initiating chest closure and sponge count validation.'");
      setIsDictating(false);
      setClinicalNoteDraft("Intraoperative findings: Normal left ventricular function. LIMA harvested and anastomosed to LAD without complication. Distal runoff is satisfactory. Retropleural drain inserted. Sponge and instrument count reported correct by Nurse Satish.");
      setAiSuggestions(prev => [
        "Updated: Chest closure note generated.",
        "Checked: LIMA-LAD bypass documented.",
        ...prev.slice(0, 1)
      ]);
    }, 3000);
  };

  const handleTriageColor = (priority: string) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-500 text-white animate-pulse';
      case 'Urgent': return 'bg-amber-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-all flex flex-col font-sans`}>
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Scissors className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <span>MCGM Surgical OS</span>
              <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                Perioperative Care
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Operation Theatre Command Center • Mumbai Central Hub
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3">
          {/* Wall Display Toggle */}
          <button
            onClick={() => setIsWallDisplay(!isWallDisplay)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase flex items-center space-x-1.5 transition-all cursor-pointer ${
              isWallDisplay 
                ? 'bg-rose-600 text-white border-rose-500 shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{isWallDisplay ? "OT HUD Enabled" : "Wall Display HUD"}</span>
          </button>

          {/* Theme mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-900" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 p-2.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DASHBOARD LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR TABS */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 hidden md:block shrink-0">
          <div className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase px-2 mb-4">
            OT Navigation Channels
          </div>

          <nav className="space-y-1">
            {[
              { id: 'command', label: 'OT Command HUD', icon: LayoutGrid },
              { id: 'scheduler', label: 'Surgery Scheduler', icon: Calendar },
              { id: 'preop', label: 'Pre-Op & Clearance', icon: CheckSquare },
              { id: 'who', label: 'WHO Safety Checklist', icon: ShieldCheck },
              { id: 'live', label: 'Live Surgery Workspace', icon: Activity },
              { id: 'anaesthesia', label: 'Anaesthesia Panel', icon: Thermometer },
              { id: 'instruments', label: 'CSSD & Trays Status', icon: Scissors },
              { id: 'implants', label: 'Implant Inventory', icon: Package },
              { id: 'recovery', label: 'Recovery & Post-Op', icon: Clock },
              { id: 'analytics', label: 'OT Performance Stats', icon: BarChart3 },
              { id: 'fhir', label: 'FHIR/ABDM Interop', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-rose-500 text-white border-rose-450 shadow-md' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-8 px-2">
            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl space-y-2">
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Emergency Override</span>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Directly hijack any OT for a life-saving bypass or trauma procedure.
              </p>
              <button 
                onClick={() => {
                  alert("Emergency override protocol initiated! Allocating OT-04 for incoming Trauma patient.");
                  setActiveTab('scheduler');
                }}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
              >
                Trigger Stat Surgery
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <main className={`flex-1 overflow-y-auto p-6 ${isWallDisplay ? 'bg-slate-950 text-white' : ''}`}>
          
          {/* TABS FOR MOBILE */}
          <div className="md:hidden flex space-x-2 overflow-x-auto pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            {['command', 'scheduler', 'preop', 'who', 'live', 'anaesthesia', 'recovery'].map(tabId => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap uppercase tracking-wider border ${
                  activeTab === tabId
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tabId}
              </button>
            ))}
          </div>

          {/* TAB 1: OT COMMAND CENTER (HUD) */}
          {activeTab === 'command' && (
            <div className="space-y-6">
              
              {/* Stats Widgets Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Operations", value: "3 Rooms Running", sub: "1 Cardiac, 2 General", color: "border-l-rose-500 text-rose-500" },
                  { label: "Turnaround Time Avg", value: "22 mins", sub: "Target < 25 mins", color: "border-l-emerald-500 text-emerald-500" },
                  { label: "Scheduled Today", value: "14 Surgeries", sub: "9 Routine, 5 Urgent/Emerg", color: "border-l-indigo-500 text-indigo-500" },
                  { label: "Available Recovery Beds", value: "4 / 12 Beds", sub: "8 Occupied, 1 Reserved", color: "border-l-amber-500 text-amber-500" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4">
                    <p className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">{stat.label}</p>
                    <h3 className={`text-lg font-black mt-1 ${stat.color}`}>{stat.value}</h3>
                    <p className="text-[9px] text-gray-400 mt-1 font-semibold">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* OT Room Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-black tracking-widest uppercase text-slate-450 dark:text-slate-500">Live Operating Theatres Status</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[
                    { room: "OT-01 (Cardiac Hybrid)", surgeon: "Dr. Sandeep Vaishya", procedure: "CABG Bypass", status: "In-Surgery", time: "08:30 - 12:30", progress: 70, alerts: "None" },
                    { room: "OT-02 (Neurosurgery)", surgeon: "Dr. Anil D'Souza", procedure: "Lumbar Fusion", status: "In-Surgery", time: "09:00 - 12:00", progress: 60, alerts: "Low platelet count flagged" },
                    { room: "OT-03 (General Surgery)", surgeon: "Dr. Alok Mehta", procedure: "Laparoscopic Chole", status: "Cleaning Queue", time: "10:15 - 11:45", progress: 100, alerts: "Changeover in progress" },
                    { room: "OT-04 (Emergency Room)", surgeon: "Available Standby", procedure: "Triage Alert Ready", status: "Available", time: "24/7 Standby", progress: 0, alerts: "Stat response ready" },
                    { room: "OT-05 (Orthopaedic)", surgeon: "Dr. Rajesh Shah", procedure: "Total Knee replacement", status: "Pre-Op Preparation", time: "13:30 - 15:30", progress: 10, alerts: "Ortho tray cooling complete" }
                  ].map((ot, idx) => (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-3xl border transition-all ${
                        ot.status === 'In-Surgery' 
                          ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-250 dark:border-rose-900/60' 
                          : ot.status === 'Available'
                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white tracking-tight">{ot.room}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 font-bold">{ot.procedure}</p>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ot.status === 'In-Surgery' ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400' :
                          ot.status === 'Available' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' :
                          'bg-slate-100 dark:bg-slate-850 text-slate-500'
                        }`}>
                          {ot.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-[9px] text-slate-450 dark:text-slate-500 font-bold">
                          <span>Surgeon: {ot.surgeon}</span>
                          <span>{ot.time}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${ot.status === 'In-Surgery' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${ot.progress}%` }}
                          />
                        </div>
                      </div>

                      {ot.alerts !== "None" && (
                        <div className="mt-3 p-2 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center space-x-1.5 text-[9px] text-amber-700 dark:text-amber-400 font-bold">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{ot.alerts}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Alerts and AI Suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Real-time Alerts */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Active OT Warnings & Staff Sync</span>
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  </h3>

                  <div className="space-y-2">
                    {[
                      { type: "Critical", text: "Dr. Rajesh Shah has conflicting schedule: TKA Surgery scheduled at 13:30 overlaps with consultation clinic.", time: "10 mins ago" },
                      { type: "Warning", text: "Autoclave cycle L-904 shows 14 mins remaining. Major Vascular Tray A required for SURG-201 bypass closure.", time: "15 mins ago" },
                      { type: "Info", text: "CSSD reports complete sterilization of Ortho Knee Set B. Delivered to clean holding bay.", time: "25 mins ago" }
                    ].map((alert, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-start space-x-3">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          alert.type === 'Critical' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' :
                          alert.type === 'Warning' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                          'bg-blue-100 dark:bg-blue-950 text-blue-600'
                        }`}>
                          {alert.type}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-700 dark:text-slate-350 leading-normal font-semibold">{alert.text}</p>
                          <span className="text-[8px] text-slate-400 font-bold block mt-1">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Scheduling Optimization recommendations */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>AI Surgical Resource Forecast</span>
                  </h3>

                  <div className="space-y-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-450">
                    <p>
                      <strong>Pre-operative clearance:</strong> Sunshine Appendectomy patient (Sunita Thorat) has not completed pre-anaesthetic air clearance. AI predicts 15 min induction delay if delay is not mitigated now.
                    </p>
                    <p>
                      <strong>ICU Bed Forecast:</strong> Current CABG bypass surgery (Gajanan Patil) has a high-probability ICU transfer. ICU Bed #4 is sterilised and kept in hold status till 13:00.
                    </p>
                    <p>
                      <strong>Blood Supply Check:</strong> 2 units of O-Negative cross-matched and reserved in the satellite fridge for immediate emergency call-back.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SURGERY SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Active Surgical Calendar & Conflict Console</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Drag-and-drop simulated allocations, automated surgeon matching & emergency insertion</p>
                </div>
                <button
                  onClick={() => alert("Open New Booking Interface")}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Surgery Case</span>
                </button>
              </div>

              {/* Conflict banner */}
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 rounded-3xl flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-800 dark:text-amber-400">Scheduling conflict detected by AI</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed mt-1">
                    Dr. Rajesh Shah is scheduled for **Total Knee Arthroplasty (Vikram Shinde)** in OT-05 from 13:30 to 15:30. However, Dr. Shah has an Outpatient Consultation shift scheduled at Sion clinic at 14:00. 
                  </p>
                  <div className="flex space-x-3 mt-2">
                    <button
                      onClick={() => {
                        alert("Notifying Dr. Shah's team to reschedule Sion clinic block.");
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Resolve: Adjust Clinic Clinic
                    </button>
                    <button
                      onClick={() => {
                        alert("Reallocating surgery slot to Dr. Maheshwari (Orthopaedic).");
                      }}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Assign Alternate Surgeon
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Slots Visualization */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 overflow-x-auto">
                <div className="min-w-[700px] space-y-4">
                  
                  {/* Timeline hours */}
                  <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-850 pb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <div className="col-span-2">Theatre</div>
                    <div>08:00 - 10:00</div>
                    <div>10:00 - 12:00</div>
                    <div>12:00 - 14:00</div>
                    <div>14:00 - 16:00</div>
                    <div>16:00 - 18:00</div>
                    <div>18:00 - 20:00</div>
                  </div>

                  {/* Theatre rows */}
                  {[
                    { room: "OT-01 (Cardiac Hybrid)", activeCases: [{ time: "08:30 - 12:30", name: "Gajanan Patil (CABG)", duration: "240m", color: "bg-rose-500 text-white" }] },
                    { room: "OT-02 (Neurosurgery)", activeCases: [{ time: "09:00 - 12:00", name: "Rajesh Joshi (Laminectomy)", duration: "180m", color: "bg-indigo-500 text-white" }] },
                    { room: "OT-03 (General)", activeCases: [{ time: "10:15 - 11:45", name: "Meena Kamble (Chole)", duration: "90m", color: "bg-teal-500 text-white" }] },
                    { room: "OT-04 (Emergency)", activeCases: [{ time: "11:45 - 12:45", name: "Sunita Thorat (Appendectomy)", duration: "60m", color: "bg-rose-600 text-white animate-pulse" }] },
                    { room: "OT-05 (Orthopaedic)", activeCases: [{ time: "13:30 - 15:30", name: "Vikram Shinde (TKA)", duration: "120m", color: "bg-amber-500 text-white" }] }
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-8 items-center py-3 border-b border-slate-100 dark:border-slate-850/50">
                      <div className="col-span-2 text-xs font-black text-slate-800 dark:text-white pr-2">{row.room}</div>
                      
                      {/* Timeline Block representation */}
                      <div className="col-span-6 relative h-10 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        {row.activeCases.map((ac, idx) => (
                          <div 
                            key={idx}
                            className={`absolute top-1 bottom-1 px-3 py-1.5 rounded-lg flex flex-col justify-center text-[9px] font-black cursor-pointer shadow-sm ${ac.color}`}
                            style={{ 
                              left: ac.time.startsWith("08:30") ? "8%" : 
                                    ac.time.startsWith("09:00") ? "15%" :
                                    ac.time.startsWith("10:15") ? "35%" :
                                    ac.time.startsWith("11:45") ? "55%" : "70%",
                              width: ac.duration === "240m" ? "55%" :
                                     ac.duration === "180m" ? "42%" :
                                     ac.duration === "120m" ? "30%" : "20%"
                            }}
                          >
                            <span className="truncate">{ac.name}</span>
                            <span className="opacity-80 text-[8px] font-medium">{ac.time} ({ac.duration})</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRE-OPERATIVE ASSESSMENT */}
          {activeTab === 'preop' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Pre-Operative Assessment & Anaesthetic Clearance</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Verification of patient identity, digital consents, lab investigations, and airway risk profiles</p>
              </div>

              {/* Case Select dropdown */}
              <div className="flex space-x-3 items-center">
                <span className="text-xs font-bold">Select Scheduled Patient:</span>
                <select 
                  value={selectedCaseId} 
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.patientName} ({c.procedure})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Clinical Clearance Status */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">ABHA & Pre-Op Core Clearance Checklist</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "ABHA Identity verification", status: "Verified & Locked", desc: `Linked with profile: ${selectedCase.abhaId}`, checked: true },
                        { label: "Surgical Consent Form", status: "Digitally Signed & Sealed", desc: "Co-signed by patient & Dr. Vaishya", checked: true },
                        { label: "Anaesthesia Evaluation", status: "Cleared (ASA Class II)", desc: "Airway assessment: Mallampati Class I", checked: true },
                        { label: "Blood Cross-Matching", status: "2 Units Reserved (O+)", desc: "Satellite blood bank storage ref: 9021", checked: selectedCase.id !== 'SURG-204' },
                        { label: "Cardiac Clearance (ECG/ECHO)", status: "Cleared", desc: "EF: 55%, rhythm sinus bradycardia", checked: selectedCase.id !== 'SURG-204' },
                        { label: "Coagulation Panel (PT/INR)", status: "Pending review", desc: "INR: 1.1 (Lab report received)", checked: selectedCase.id !== 'SURG-202' }
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-start space-x-3">
                          <div className={`p-1.5 rounded-lg ${item.checked ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-rose-105 bg-rose-100 dark:bg-rose-950 text-rose-600'}`}>
                            {item.checked ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white">{item.label}</h4>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{item.status}</p>
                            <p className="text-[9px] text-gray-400 mt-1 font-semibold">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lab Results summary widget */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Key Lab Investigations</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { test: "Hemoglobin", value: "13.8 g/dL", status: "Normal" },
                        { test: "Platelets", value: "245k / uL", status: "Normal" },
                        { test: "Creatinine", value: "0.9 mg/dL", status: "Normal" },
                        { test: "Potassium", value: "4.1 mEq/L", status: "Normal" }
                      ].map((lab, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center border border-slate-100 dark:border-slate-850">
                          <span className="text-[9px] text-gray-450 dark:text-slate-500 font-bold block">{lab.test}</span>
                          <span className="text-xs font-black text-slate-800 dark:text-white block mt-1">{lab.value}</span>
                          <span className="text-[8px] font-black uppercase text-emerald-500 block mt-0.5">{lab.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk and Vitals Panel */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Risk Assessment Profile</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Surgical Risk (Mortality)</span>
                          <span className="text-amber-500">Low (ASA 2)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-amber-500 h-full" style={{ width: '25%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Cardiac Risk Index</span>
                          <span className="text-emerald-500">Class I (RCRI)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-emerald-500 h-full" style={{ width: '15%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>DVT / Venous Thromboembolism</span>
                          <span className="text-rose-500">High Risk (Caprini)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-rose-500 h-full" style={{ width: '75%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-[9px] font-black text-rose-600 dark:text-rose-450 uppercase">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Allergy / Alert Warning</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold leading-normal">
                        Patient has documented severe anaphylactic reaction to **Penicillin**. Flagged in EMR and ABDM system interface.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: WHO SURGICAL SAFETY CHECKLIST */}
          {activeTab === 'who' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">WHO Surgical Safety Checklist</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Verification checkpoints for Sign In, Time Out, and Sign Out protocols</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold">Patient:</span>
                  <span className="text-xs font-black bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {selectedCase.patientName} ({selectedCase.id})
                  </span>
                </div>
              </div>

              {/* Progress Tracker bar */}
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { name: "1. SIGN IN", desc: "Before Induction of Anaesthesia", active: true, checked: selectedCase.whoStatus.signIn },
                  { name: "2. TIME OUT", desc: "Before Skin Incision", active: true, checked: selectedCase.whoStatus.timeOut },
                  { name: "3. SIGN OUT", desc: "Before Patient Leaves OT", active: false, checked: selectedCase.whoStatus.signOut }
                ].map((step, i) => (
                  <div key={i} className={`p-3 rounded-2xl border transition-all ${
                    step.checked 
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-900/60' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850'
                  }`}>
                    <span className="text-xs font-black block">{step.name}</span>
                    <span className="text-[9px] text-gray-400 mt-0.5 block">{step.desc}</span>
                    <span className="mt-2 inline-block text-[9px] font-black uppercase text-emerald-500">
                      {step.checked ? "Completed & Audited" : "Pending Checkpoint"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sign In Checks Column */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">1. Sign In Checks</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(signInChecks).map(([key, val]) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={() => setSignInChecks(prev => ({ ...prev, [key]: !val }))}
                          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Out Checks Column */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">2. Time Out Checks</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(timeOutChecks).map(([key, val]) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={() => setTimeOutChecks(prev => ({ ...prev, [key]: !val }))}
                          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sign Out Checks Column */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">3. Sign Out Checks</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(signOutChecks).map(([key, val]) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={() => setSignOutChecks(prev => ({ ...prev, [key]: !val }))}
                          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* digital sign-off */}
              <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-rose-600" />
                  <div>
                    <h4 className="text-xs font-black">Digital Checklist Seal & Lock</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Encrypts checklist records and pushes audit logs to blockchain trail</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert("WHO checklist digitally verified, signed and locked!");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Verify & Lock Checklist
                </button>
              </div>

            </div>
          )}

          {/* TAB 5: LIVE SURGERY DASHBOARD */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              
              {/* Header and Timer */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-black text-rose-600 flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Live Intraoperative Stream</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    OT Room: {selectedCase.otNumber} • Surgeon: {selectedCase.surgeon}
                  </p>
                </div>
                
                {/* Elapsed Time Widget */}
                <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center space-x-3 border border-slate-800">
                  <Timer className="w-5 h-5 text-rose-500" />
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Elapsed Incision Time</span>
                    <span className="text-sm font-black">{Math.floor(elapsedTime / 60)}h {elapsedTime % 60}m</span>
                  </div>
                </div>
              </div>

              {/* Vitals Telemetry Monitor HUD */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 font-mono shadow-2xl relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[8px] text-slate-500 font-black uppercase tracking-wider">Telemetry Link Active</div>

                {[
                  { label: "HR", value: vitals.hr, unit: "bpm", color: "text-emerald-500" },
                  { label: "BP", value: `${vitals.sbp}/${vitals.dbp}`, unit: "mmHg", color: "text-amber-500" },
                  { label: "RR", value: vitals.rr, unit: "rpm", color: "text-blue-400" },
                  { label: "SPO2", value: `${vitals.spo2}%`, unit: "O2 Sat", color: "text-rose-500" },
                  { label: "TEMP", value: `${vitals.temp}°C`, unit: "Body Temp", color: "text-teal-400" },
                  { label: "ETCO2", value: "38", unit: "mmHg", color: "text-purple-400" }
                ].map((vit, i) => (
                  <div key={i} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold">{vit.label}</span>
                    <span className={`text-xl font-black block mt-1 ${vit.color}`}>{vit.value}</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">{vit.unit}</span>
                  </div>
                ))}
              </div>

              {/* Active Counts and Fluids */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Counts Verification */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Instrument & Sponge Counts</span>
                    <span className="text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-2 py-0.5 rounded-full">Matched</span>
                  </h3>

                  <div className="space-y-3">
                    {[
                      { name: "Surgical Sponges", initial: spongeCount.initial, current: spongeCount.current },
                      { name: "Needles / Sharps", initial: needleCount.initial, current: needleCount.current },
                      { name: "Forceps & Retractors", initial: instrumentCount.initial, current: instrumentCount.current }
                    ].map((count, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{count.name}</span>
                        <div className="flex space-x-4 text-xs font-mono">
                          <span className="text-slate-400">In: {count.initial}</span>
                          <span className="text-emerald-500 font-bold">Out: {count.current}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => alert("Counts re-verified manually.")}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-750 cursor-pointer"
                    >
                      Recount Manual Verify
                    </button>
                  </div>
                </div>

                {/* Ambient Voice Transcription */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Intraoperative Voice Notes</span>
                    <span className="flex items-center space-x-1">
                      <span className={`h-1.5 w-1.5 rounded-full bg-rose-500 ${isDictating ? 'animate-ping' : ''}`} />
                      <span className="text-[9px] font-black uppercase text-slate-400">Microphone Ready</span>
                    </span>
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={startVoiceDictation}
                      className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        isDictating 
                          ? 'bg-rose-500 text-white animate-pulse shadow-md' 
                          : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 hover:bg-rose-200/50'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isDictating ? "Ambient Listening..." : "Trigger Voice Capture"}</span>
                    </button>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl h-24 overflow-y-auto">
                      <p className="text-[10px] leading-relaxed text-slate-500 italic">
                        {dictatedText || "Press the microphone button to simulate ambient surgical transcription..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Timeline Events & Warnings */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>AI Surgical Timeline Notes</span>
                  </h3>

                  <div className="space-y-2 h-[180px] overflow-y-auto pr-1">
                    {aiSuggestions.map((sug, i) => (
                      <div key={i} className="p-2.5 bg-slate-50/85 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[9px] leading-normal font-semibold text-slate-600 dark:text-slate-400">
                        {sug}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: ANAESTHESIA WORKSPACE */}
          {activeTab === 'anaesthesia' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Anaesthesia Infusion & Monitoring Panel</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Pre-Anaesthetic Evaluation (PAE) status, drug charts, and live airway scoring</p>
                </div>
                <div className="flex space-x-2">
                  <span className="text-xs font-bold">Patient:</span>
                  <span className="text-xs font-black bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {selectedCase.patientName} (ASA Class II)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Drug Chart / Infusion Log */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">
                    Intraoperative Drug Administration Chart
                  </h3>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {anaesthesiaLogs.map((log, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-bold text-gray-400">{log.time}</span>
                          <span className="text-xs font-black text-slate-850 dark:text-slate-200">{log.drug}</span>
                        </div>
                        <div className="flex space-x-4 text-xs font-mono">
                          <span className="text-rose-600 font-bold">{log.dose}</span>
                          <span className="text-slate-400">{log.route}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add drug form */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                    <input
                      type="text"
                      placeholder="Drug name (e.g. Fentanyl)"
                      value={newDrug.name}
                      onChange={(e) => setNewDrug(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none text-slate-850 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Dose (e.g. 50 mcg)"
                      value={newDrug.dose}
                      onChange={(e) => setNewDrug(prev => ({ ...prev, dose: e.target.value }))}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none text-slate-850 dark:text-slate-200"
                    />
                    <button
                      onClick={() => {
                        if (!newDrug.name || !newDrug.dose) return;
                        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                        setAnaesthesiaLogs(prev => [...prev, { time, drug: newDrug.name, dose: newDrug.dose, route: newDrug.route }]);
                        setNewDrug({ name: '', dose: '', route: 'IV Bolus' });
                      }}
                      className="bg-rose-650 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Log Infusion
                    </button>
                  </div>
                </div>

                {/* Pre-Anaesthesia assessment indicators */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">
                    Airway & Ventilation Score
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                      <span className="text-[10px] text-gray-400 block font-bold">Mallampati Classification</span>
                      <span className="text-xs font-black text-slate-850 dark:text-white block mt-1">Class I (Full visibility of tonsils, uvula, and soft palate)</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                      <span className="text-[10px] text-gray-400 block font-bold">Ventilation Mode</span>
                      <span className="text-xs font-black text-slate-850 dark:text-white block mt-1">Volume Controlled (VCV) • Tidal Volume: 450ml</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                      <span className="text-[10px] text-gray-400 block font-bold">ASA Physical Status Classification</span>
                      <span className="text-xs font-black text-rose-500 block mt-1 font-mono">ASA II — Mild Systemic Disease</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: INSTRUMENT MANAGEMENT & CSSD INTEGRATION */}
          {activeTab === 'instruments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Instrument Tray Tracking & CSSD Sterility Log</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time status of sterile autoclaves, barcode/RFID tray scanning, and maintenance schedules</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CSSD Sterility Queue */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Sterilization Chamber Cycles</h3>
                  
                  <div className="space-y-3">
                    {sterilizationQueue.map((tray, i) => (
                      <div key={i} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-800 dark:text-white">{tray.name}</span>
                            <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">{tray.id}</span>
                          </div>
                          <p className="text-[9px] text-gray-400 mt-1 font-semibold">Chamber load: {tray.loadNo} • Sterilizer Method: {tray.method}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            tray.status.startsWith('Sterilized') ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                            tray.status.startsWith('Sterilizing') ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 animate-pulse' :
                            'bg-slate-100 dark:bg-slate-850 text-slate-500'
                          }`}>
                            {tray.status}
                          </span>
                          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold block mt-1">{tray.timeLeft}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RFID Barcode Tray Scanner */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">RFID Tray scanner</h3>
                  
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <Database className="w-8 h-8 text-rose-500 mx-auto opacity-75" />
                    <p className="text-xs font-bold text-slate-650 dark:text-slate-350">Place sterile tray package on barcode RFID reader area</p>
                    <button 
                      onClick={() => {
                        alert("Simulating RFID scan. Read package barcode: TRAY-2292 (Laparotomy Set A). Expired check: Passed.");
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Trigger Test Scan
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: IMPLANT & INVENTORY LEDGER */}
          {activeTab === 'implants' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Implant Registry & Lot Tracking (UDI)</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Verification of surgical implants, warranty linkage, and manufacturer safety recall monitors</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">
                  UDI / Lot Catalogue Lookup
                </h3>

                <div className="space-y-3">
                  {implantCatalog.map((imp, i) => (
                    <div key={i} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-850 dark:text-white">{imp.name}</span>
                          <span className="text-[8px] bg-slate-250 bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">{imp.lot}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1 font-semibold">UDI Barcode: {imp.udi}</p>
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        {imp.recall ? (
                          <span className="text-[8px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-600 px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                            <ShieldAlert className="w-3 h-3 text-rose-500" />
                            <span>Recall Alert</span>
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-2 py-0.5 rounded-full">
                            Cleared
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-500">{imp.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: POST-OPERATIVE RECOVERY */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Post-Operative PACU & Recovery scoring</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Monitoring of patient Aldrete recovery scores, pain thresholds, and secure ward transition pathways</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Aldrete Score Calculator */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Aldrete Discharge Scoring Panel (Standard: Score &gt; 9 for discharge)</h3>

                  <div className="space-y-4">
                    {[
                      { metric: "Activity (Voluntary Movement)", desc: "Moves all 4 extremities (2), Moves 2 extremities (1), Unable to move (0)" },
                      { metric: "Respiration", desc: "Breaths deeply / coughs (2), Dyspnea / limited breathing (1), Apneic (0)" },
                      { metric: "Circulation (BP variation vs baseline)", desc: "BP within 20% of pre-op (2), BP within 20-50% (1), BP deviates > 50% (0)" },
                      { metric: "Consciousness", desc: "Fully awake (2), Arousable on calling (1), Unresponsive (0)" },
                      { metric: "Oxygen Saturation (SpO2)", desc: "SpO2 > 92% on room air (2), Requires oxygen supplementation (1), SpO2 < 90% (0)" }
                    ].map((ald, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white">{ald.metric}</h4>
                            <p className="text-[9px] text-gray-400 mt-1 font-semibold">{ald.desc}</p>
                          </div>
                          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold p-1 rounded">
                            <option value="2">2 - Full</option>
                            <option value="1">1 - Partial</option>
                            <option value="0">0 - None</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transfer pathway */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Recovery & Ward Transfer</h3>
                  
                  <div className="space-y-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-450">
                    <p>
                      <strong>Current Score:</strong> 10 / 10 (Aldrete Cleared)
                    </p>
                    <p>
                      <strong>Discharge Plan:</strong> Transfer to Ward 4B (Cardiology post-op wing).
                    </p>
                    <p>
                      <strong>Special instructions:</strong> Keep head elevated. Check vitals and femoral arterial line sites every 30 mins for the first 2 hours.
                    </p>
                    <button
                      onClick={() => alert("Transfer request dispatched to nursing staff in Ward 4B.")}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-md"
                    >
                      Authorize Ward Transfer
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Operation Theatre Performance Analytics</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Statistical insights covering room utilization percentages, delays, and cancellation risk ratios</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* OT Utilization Chart */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-450 dark:text-slate-500">Weekly OT Utilization</h3>
                  
                  {/* Simulated Bar Graph */}
                  <div className="flex justify-between items-end h-32 px-4 pt-4">
                    {[
                      { day: "Mon", val: 82 },
                      { day: "Tue", val: 88 },
                      { day: "Wed", val: 94 },
                      { day: "Thu", val: 76 },
                      { day: "Fri", val: 90 },
                      { day: "Sat", val: 45 }
                    ].map((d, i) => (
                      <div key={i} className="flex flex-col items-center space-y-2">
                        <div className="bg-rose-500 w-6 rounded-t-lg transition-all" style={{ height: `${d.val}%` }} />
                        <span className="text-[9px] font-bold text-slate-400">{d.day}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">Average Occupancy Rate: 79.1%</p>
                </div>

                {/* Delay reason analysis */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-450 dark:text-slate-500">Common Delay Causes (This Month)</h3>

                  <div className="space-y-3">
                    {[
                      { reason: "Pre-Op Prep / Lab delays", pct: 40, color: "bg-rose-500" },
                      { reason: "CSSD / Tray delays", pct: 25, color: "bg-amber-500" },
                      { reason: "Anaesthesia induction delays", pct: 20, color: "bg-blue-500" },
                      { reason: "Biomedical / Equipment check", pct: 15, color: "bg-slate-500" }
                    ].map((del, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{del.reason}</span>
                          <span>{del.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className={`${del.color} h-full`} style={{ width: `${del.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancel cases */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-450 dark:text-slate-500">Cancellation Risk Index</h3>
                  <div className="py-6">
                    <span className="text-3xl font-black text-rose-500">1.8%</span>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold block mt-1 uppercase">Target limit &lt; 2.5%</span>
                  </div>
                  <p className="text-[9px] leading-relaxed text-slate-500">
                    AI recommendation: Optimizing surgery schedules using predictive turnaround buffers has lowered late cancellations by 14% since May.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 11: FHIR & ABDM INTEROPERABILITY */}
          {activeTab === 'fhir' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">FHIR & ABDM Interoperability Schema Registry</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">HL7 FHIR json structures representing surgical procedures, digital consent seals, and anaesthesia care plans</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* FHIR Procedure Resource Preview */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">FHIR Procedure Resource Schema</h3>
                  
                  <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-[9px] font-mono overflow-x-auto max-h-[300px]">
{`{
  "resourceType": "Procedure",
  "id": "mcgm-surg-procedure-201",
  "status": "in-progress",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "232717009",
        "display": "Coronary artery bypass graft"
      }
    ]
  },
  "subject": {
    "reference": "Patient/patil-gajanan",
    "display": "Gajanan Madhav Patil"
  },
  "performer": [
    {
      "actor": {
        "reference": "Practitioner/doc-vaishya",
        "display": "Dr. Sandeep Vaishya"
      }
    }
  ],
  "reasonCode": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "50911007",
          "display": "Coronary artery disease"
        }
      ]
    }
  ]
}`}
                  </pre>
                </div>

                {/* FHIR Consent Resource */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">FHIR Consent (ABHA Digital Seal) Schema</h3>
                  
                  <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-[9px] font-mono overflow-x-auto max-h-[300px]">
{`{
  "resourceType": "Consent",
  "id": "mcgm-consent-surg-201",
  "status": "active",
  "scope": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/consentscope",
        "code": "patient-privacy"
      }
    ]
  },
  "category": [
    {
      "coding": [
        {
          "system": "http://loinc.org",
          "code": "59284-0",
          "display": "Consent Document"
        }
      ]
    }
  ],
  "patient": {
    "reference": "Patient/patil-gajanan"
  },
  "dateTime": "2026-07-09T08:15:00Z",
  "policy": [
    {
      "uri": "http://mcgm.gov.in/policies/digital-surgical-consent"
    }
  ],
  "provision": {
    "type": "permit",
    "action": [
      {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/consentaction",
            "code": "access"
          }
        ]
      }
    ]
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
