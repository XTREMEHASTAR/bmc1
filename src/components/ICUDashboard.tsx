import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  HeartPulse,
  Users,
  Clock,
  Tv,
  Pill,
  Siren,
  Check,
  X,
  ChevronRight,
  ClipboardList,
  Thermometer,
  Droplet,
  Brain,
  LayoutGrid,
  Settings,
  LogOut,
  Sun,
  Moon,
  Video,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Lock,
  Plus,
  Play,
  Pause,
  Zap,
  Sparkles,
  Search,
  Eye,
  Sliders,
  Volume2,
  VolumeX,
  Mic,
  Database
} from 'lucide-react';

// Interfaces for ICU Patients
interface ICUPatient {
  id: string;
  bedNumber: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  abhaId: string;
  diagnosis: string;
  severity: 'Critical' | 'Unstable' | 'Stable';
  subUnit: 'MICU' | 'SICU' | 'CICU' | 'NeuroICU' | 'PICU' | 'NICU' | 'BurnICU' | 'Isolation';
  doctor: string;
  nurse: string;
  admittedDate: string;
  ventStatus: 'None' | 'Invasive' | 'Non-Invasive' | 'Weaning';
  dialysisStatus: 'None' | 'CRRT' | 'Intermittent';
  alertStatus: 'Normal' | 'Alert' | 'Stat';
  scores: {
    news2: number;
    sofa: number;
    apache: number;
  };
}

export default function ICUDashboard({
  isDarkMode,
  setIsDarkMode,
  onLogout
}: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'command' | 'map' | 'dashboard' | 'telemetry' | 'ventilator' | 'medication' | 'nurse' | 'scores' | 'tele_icu' | 'family' | 'analytics' | 'fhir'>('command');
  const [isWallDisplay, setIsWallDisplay] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Alert sound simulator state
  const [isAlarmMuted, setIsAlarmMuted] = useState(true);

  // Simulated ICU Patients List
  const [patients, setPatients] = useState<ICUPatient[]>([
    {
      id: "ICU-301",
      bedNumber: "Bed 01 (Isolation)",
      name: "Dinkar Ramchandra Patil",
      age: 62,
      gender: "Male",
      abhaId: "dinkar.patil@abha",
      diagnosis: "Severe ARDS, Sepsis Secondary to Lobar Pneumonia",
      severity: "Critical",
      subUnit: "Isolation",
      doctor: "Dr. Sandeep Vaishya",
      nurse: "Sr. Kavita Shinde",
      admittedDate: "2026-07-05",
      ventStatus: "Invasive",
      dialysisStatus: "CRRT",
      alertStatus: "Stat",
      scores: { news2: 8, sofa: 11, apache: 26 }
    },
    {
      id: "ICU-302",
      bedNumber: "Bed 02",
      name: "Anjali Hemant Kulkarni",
      age: 48,
      gender: "Female",
      abhaId: "anjalik@abha",
      diagnosis: "Post-op CABG, Acute Kidney Injury Stage II",
      severity: "Unstable",
      subUnit: "CICU",
      doctor: "Dr. Meera Nair",
      nurse: "Sr. Kavita Shinde",
      admittedDate: "2026-07-08",
      ventStatus: "Non-Invasive",
      dialysisStatus: "None",
      alertStatus: "Alert",
      scores: { news2: 5, sofa: 7, apache: 18 }
    },
    {
      id: "ICU-303",
      bedNumber: "Bed 03",
      name: "Suresh Madhav Gokhale",
      age: 70,
      gender: "Male",
      abhaId: "sureshg@abha",
      diagnosis: "Haemorrhagic Stroke, Elevated ICP",
      severity: "Critical",
      subUnit: "NeuroICU",
      doctor: "Dr. Anil D'Souza",
      nurse: "Br. Satish Kumar",
      admittedDate: "2026-07-06",
      ventStatus: "Invasive",
      dialysisStatus: "None",
      alertStatus: "Alert",
      scores: { news2: 6, sofa: 9, apache: 22 }
    },
    {
      id: "ICU-304",
      bedNumber: "Bed 04",
      name: "Trupti Shashank Joshi",
      age: 35,
      gender: "Female",
      abhaId: "truptij@abha",
      diagnosis: "Polytrauma, Flail Chest, Bilateral Hemothorax",
      severity: "Unstable",
      subUnit: "SICU",
      doctor: "Dr. Alok Mehta",
      nurse: "Br. Satish Kumar",
      admittedDate: "2026-07-08",
      ventStatus: "Invasive",
      dialysisStatus: "None",
      alertStatus: "Normal",
      scores: { news2: 4, sofa: 5, apache: 14 }
    },
    {
      id: "ICU-305",
      bedNumber: "Bed 05",
      name: "Master Aarav Singh",
      age: 8,
      gender: "Male",
      abhaId: "aaravs@abha",
      diagnosis: "Diabetic Ketoacidosis, Cerebral Oedema",
      severity: "Unstable",
      subUnit: "PICU",
      doctor: "Dr. K. R. Raman",
      nurse: "Sr. Deepa Patel",
      admittedDate: "2026-07-07",
      ventStatus: "None",
      dialysisStatus: "None",
      alertStatus: "Alert",
      scores: { news2: 5, sofa: 4, apache: 12 }
    },
    {
      id: "ICU-306",
      bedNumber: "Bed 06 (Isolation)",
      name: "Harish Vithal Kamble",
      age: 55,
      gender: "Male",
      abhaId: "harishk@abha",
      diagnosis: "Septic Shock, Multi-Organ Dysfunction Syndrome",
      severity: "Critical",
      subUnit: "Isolation",
      doctor: "Dr. Sandeep Vaishya",
      nurse: "Sr. Deepa Patel",
      admittedDate: "2026-07-04",
      ventStatus: "Invasive",
      dialysisStatus: "CRRT",
      alertStatus: "Stat",
      scores: { news2: 9, sofa: 13, apache: 29 }
    }
  ]);

  // Selected Patient state
  const [selectedPatientId, setSelectedPatientId] = useState<string>("ICU-301");
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Live Telemetry waveform simulator states
  const [liveVitals, setLiveVitals] = useState({
    hr: 112,
    sbp: 98,
    dbp: 58,
    rr: 24,
    spo2: 91,
    temp: 101.4,
    etco2: 32,
    cvp: 6,
    icp: 14,
    urineOutput: 25,
    bloodSugar: 220
  });

  // Vent settings state
  const [ventSettings, setVentSettings] = useState({
    mode: 'PRVC',
    peep: 10,
    fio2: 60,
    tidalVolume: 420,
    rr: 20,
    plateauPress: 28,
    weaningProgress: 45
  });

  // Fluid Balance Log
  const [fluidLog, setFluidLog] = useState([
    { time: "08:00", intake: "IV fluids (NS) 100ml", output: "Urine 30ml", balance: "+70ml" },
    { time: "09:00", intake: "IV fluids (NS) 100ml, Norad 10ml", output: "Urine 22ml", balance: "+158ml" },
    { time: "10:00", intake: "IV fluids (NS) 100ml", output: "Urine 25ml", balance: "+233ml" },
    { time: "11:00", intake: "Enteral feed 150ml", output: "Urine 20ml", balance: "+363ml" }
  ]);
  const [newFluid, setNewFluid] = useState({ type: 'Intake', amount: 100, item: 'IV Fluids' });

  // Turning positioning state
  const [lastTurnTime, setLastTurnTime] = useState("10:00");
  const [currentPosition, setCurrentPosition] = useState("Right Lateral");
  const [turnTimer, setTurnTimer] = useState(72); // minutes left before next turn

  // Clinician Score Calculator state
  const [calcScores, setCalcScores] = useState({
    hr: 110,
    temp: 38.5,
    spo2: 92,
    sbp: 95,
    rr: 24,
    gcs: 14,
    pao2: 68,
    fio2: 60,
    creatinine: 2.1,
    bilirubin: 1.8,
    platelets: 98
  });

  // Tele-ICU video panel state
  const [remoteCameraActive, setRemoteCameraActive] = useState(true);
  const [teleChat, setTeleChat] = useState([
    { sender: "Hub Specialist (KEM)", time: "11:02", text: "Noradrenaline infusion is high. Let's look at initiating hydrocortisone if blood pressure remains unstable." },
    { sender: "Bedside Nurse (Sion)", time: "11:05", text: "Noted. Will draw a repeat lactate level now and update." }
  ]);
  const [newChatText, setNewChatText] = useState("");

  // Turning log
  const [positionHistory, setPositionHistory] = useState([
    { time: "08:00", position: "Supine", signedBy: "Sr. Kavita" },
    { time: "10:00", position: "Right Lateral", signedBy: "Br. Satish" }
  ]);

  // Voice recording simulation
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState("");
  const [nursingNotes, setNursingNotes] = useState("ARDS protocol active. PEEP maintained at 10. Noradrenaline titrating for MAP > 65. Arterial line flushing well. Foley catheter draining dark amber urine. Check skin integrity completed.");

  // ICU Score calculator results
  const [calculatedSOFA, setCalculatedSOFA] = useState(11);
  const [calculatedNEWS2, setCalculatedNEWS2] = useState(8);

  // ECG and SpO2 Wave Canvas rendering logic
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const spo2CanvasRef = useRef<HTMLCanvasElement>(null);

  // Vitals Drift simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVitals(prev => {
        const drift = Math.random() > 0.5 ? 1 : -1;
        const hrDrift = Math.random() > 0.6 ? (drift * 2) : 0;
        const bpDrift = Math.random() > 0.7 ? (drift * 3) : 0;
        const spo2Drift = Math.random() > 0.8 ? (drift) : 0;

        return {
          ...prev,
          hr: Math.min(160, Math.max(50, prev.hr + hrDrift)),
          sbp: Math.min(200, Math.max(70, prev.sbp + bpDrift)),
          dbp: Math.min(110, Math.max(40, prev.dbp + (drift * 1))),
          spo2: Math.min(100, Math.max(80, prev.spo2 + spo2Drift)),
          temp: parseFloat((prev.temp + (Math.random() * 0.1 - 0.05)).toFixed(1)),
          urineOutput: Math.max(5, prev.urineOutput + (Math.random() > 0.85 ? (drift * 2) : 0))
        };
      });

      setTurnTimer(prev => (prev > 0 ? prev - 1 : 120));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate ECG and SpO2 waveforms
  useEffect(() => {
    let animationId: number;
    const ecgCanvas = ecgCanvasRef.current;
    const spo2Canvas = spo2CanvasRef.current;

    if (!ecgCanvas || !spo2Canvas) return;

    const ecgCtx = ecgCanvas.getContext('2d');
    const spo2Ctx = spo2Canvas.getContext('2d');

    if (!ecgCtx || !spo2Ctx) return;

    let x = 0;
    const width = ecgCanvas.width;
    const height = ecgCanvas.height;

    ecgCtx.strokeStyle = '#22c55e'; // emerald-500
    ecgCtx.lineWidth = 2;
    spo2Ctx.strokeStyle = '#06b6d4'; // cyan-500
    spo2Ctx.lineWidth = 2;

    // Clear background initially
    ecgCtx.fillStyle = '#090d16';
    ecgCtx.fillRect(0, 0, width, height);
    spo2Ctx.fillStyle = '#090d16';
    spo2Ctx.fillRect(0, 0, width, height);

    const draw = () => {
      // Clear a small slice ahead
      ecgCtx.fillStyle = '#090d16';
      ecgCtx.fillRect(x, 0, 10, height);
      spo2Ctx.fillStyle = '#090d16';
      spo2Ctx.fillRect(x, 0, 10, height);

      // ECG wave calculation (QRS complex simulator)
      let ecgY = height / 2;
      const mod = x % 60;
      if (mod === 0) {
        ecgY = height / 2 - 25; // R peak
      } else if (mod === 3) {
        ecgY = height / 2 + 15; // S wave
      } else if (mod === 6) {
        ecgY = height / 2; // baseline
      } else if (mod > 15 && mod < 25) {
        ecgY = height / 2 - 5 - Math.sin((mod - 15) * Math.PI / 10) * 8; // T wave
      } else if (mod === 58) {
        ecgY = height / 2 + 3; // Q wave
      }

      // SpO2 wave calculation (pulse photoplethysmogram wave)
      const spo2Y = height / 2 - 10 - Math.sin((x % 40) * Math.PI / 20) * 15;

      // Draw ECG line
      ecgCtx.beginPath();
      ecgCtx.moveTo(x === 0 ? 0 : x - 1, height / 2);
      ecgCtx.lineTo(x, ecgY);
      ecgCtx.stroke();

      // Draw SpO2 line
      spo2Ctx.beginPath();
      spo2Ctx.moveTo(x === 0 ? 0 : x - 1, height / 2);
      spo2Ctx.lineTo(x, spo2Y);
      spo2Ctx.stroke();

      x = (x + 1) % width;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [activeTab, selectedPatientId]);

  // Recalculate values dynamically in calculator
  const calculateRiskScores = () => {
    let newsVal = 0;
    // NEWS2 simple score map
    if (calcScores.rr >= 25 || calcScores.rr <= 8) newsVal += 3;
    else if (calcScores.rr >= 21) newsVal += 2;
    else if (calcScores.rr <= 11) newsVal += 1;

    if (calcScores.spo2 <= 91) newsVal += 3;
    else if (calcScores.spo2 <= 93) newsVal += 2;
    else if (calcScores.spo2 <= 95) newsVal += 1;

    if (calcScores.temp >= 39.1 || calcScores.temp <= 35.0) newsVal += 3;
    else if (calcScores.temp >= 38.1 || calcScores.temp <= 36.0) newsVal += 1;

    if (calcScores.sbp <= 90 || calcScores.sbp >= 220) newsVal += 3;
    else if (calcScores.sbp <= 100) newsVal += 2;
    else if (calcScores.sbp <= 110) newsVal += 1;

    if (calcScores.hr >= 131 || calcScores.hr <= 40) newsVal += 3;
    else if (calcScores.hr >= 111 || calcScores.hr <= 50) newsVal += 2;
    else if (calcScores.hr >= 91) newsVal += 1;

    if (calcScores.gcs < 15) newsVal += 3;

    setCalculatedNEWS2(newsVal);

    // SOFA simple score map
    let sofaVal = 0;
    const pfRatio = (calcScores.pao2 / (calcScores.fio2 / 100));
    if (pfRatio < 100) sofaVal += 4;
    else if (pfRatio < 200) sofaVal += 3;
    else if (pfRatio < 300) sofaVal += 2;
    else if (pfRatio < 400) sofaVal += 1;

    if (calcScores.platelets < 20) sofaVal += 4;
    else if (calcScores.platelets < 50) sofaVal += 3;
    else if (calcScores.platelets < 100) sofaVal += 2;
    else if (calcScores.platelets < 150) sofaVal += 1;

    if (calcScores.bilirubin > 12.0) sofaVal += 4;
    else if (calcScores.bilirubin > 6.0) sofaVal += 3;
    else if (calcScores.bilirubin > 2.0) sofaVal += 2;
    else if (calcScores.bilirubin > 1.2) sofaVal += 1;

    if (calcScores.sbp < 70) sofaVal += 4; // requires vasoactives
    else if (calcScores.sbp < 90) sofaVal += 1;

    if (calcScores.gcs === 15) sofaVal += 0;
    else if (calcScores.gcs >= 13) sofaVal += 1;
    else if (calcScores.gcs >= 10) sofaVal += 2;
    else if (calcScores.gcs >= 6) sofaVal += 3;
    else sofaVal += 4;

    if (calcScores.creatinine > 5.0) sofaVal += 4;
    else if (calcScores.creatinine > 3.5) sofaVal += 3;
    else if (calcScores.creatinine > 2.0) sofaVal += 2;
    else if (calcScores.creatinine > 1.2) sofaVal += 1;

    setCalculatedSOFA(sofaVal);
  };

  // Voice recording mockup trigger
  const triggerVoiceNote = () => {
    setIsRecordingNote(true);
    setRecordedTranscript("Listening to clinician audio...");
    setTimeout(() => {
      const notesArray = [
        "Foley catheter changed. Draining clear output. Vent settings unchanged. Tolerating PRVC mode well.",
        "Noradrenaline weaning initiated. Current dose is 0.08 mcg/kg/min down from 0.12. Arterial line site dressing clean.",
        "Suctioned thick white secretions from ET tube. Ventilator peak pressures dropped to 24. Awaiting morning ABG results."
      ];
      const randomNote = notesArray[Math.floor(Math.random() * notesArray.length)];
      setRecordedTranscript(`Recorded: "${randomNote}"`);
      setIsRecordingNote(false);
      setNursingNotes(prev => prev + "\n" + randomNote);
    }, 2500);
  };

  // Add Fluid log entry
  const addFluidEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceSign = newFluid.type === 'Intake' ? `+${newFluid.amount}ml` : `-${newFluid.amount}ml`;
    setFluidLog([
      ...fluidLog,
      {
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        intake: newFluid.type === 'Intake' ? `${newFluid.item} ${newFluid.amount}ml` : '-',
        output: newFluid.type === 'Output' ? `${newFluid.item} ${newFluid.amount}ml` : '-',
        balance: balanceSign
      }
    ]);
  };

  // Switch positioning
  const handlePositionTurn = (pos: string) => {
    setCurrentPosition(pos);
    setLastTurnTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setTurnTimer(120); // reset 2h timer
    setPositionHistory([
      { time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), position: pos, signedBy: "Dr. Vaishya" },
      ...positionHistory
    ]);
  };

  // Tele-ICU chat submit
  const sendTeleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setTeleChat([
      ...teleChat,
      { sender: "Dr. Sandeep (Local)", time: "Just now", text: newChatText }
    ]);
    setNewChatText("");
  };

  // Color helper for severity tags
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'Unstable': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-all flex flex-col font-sans`}>
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg animate-pulse">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <span>MCGM Critical Care OS</span>
              <span className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
                Smart ICU
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
              Centralized Intensive Care Command Console • Level 1 Trauma Center
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3">
          {/* Audio Alarm Toggle */}
          <button
            onClick={() => setIsAlarmMuted(!isAlarmMuted)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase flex items-center space-x-1.5 transition-all cursor-pointer ${
              !isAlarmMuted 
                ? 'bg-rose-600 text-white border-rose-500 shadow-md animate-bounce' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isAlarmMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
            <span>{isAlarmMuted ? "Alarms Muted" : "Live Sirens"}</span>
          </button>

          {/* Wall/Tablet toggles */}
          <button
            onClick={() => setIsWallDisplay(!isWallDisplay)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase flex items-center space-x-1.5 transition-all cursor-pointer ${
              isWallDisplay 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{isWallDisplay ? "Wall HUD ON" : "Wall Display"}</span>
          </button>

          <button
            onClick={() => setIsTabletView(!isTabletView)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase flex items-center space-x-1.5 transition-all cursor-pointer ${
              isTabletView 
                ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isTabletView ? "Tablet Mode" : "Desktop Mode"}</span>
          </button>

          {/* Dark Mode toggle */}
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

      {/* DASHBOARD CORE AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2 shrink-0 ${isTabletView ? 'w-20' : 'w-64'} hidden md:block`}>
          <div className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase px-2 mb-4">
            {isTabletView ? "ICU" : "ICU Care Channels"}
          </div>

          <nav className="space-y-1">
            {[
              { id: 'command', label: 'Command HUD', icon: LayoutGrid },
              { id: 'map', label: 'Interactive Map', icon: Siren },
              { id: 'dashboard', label: 'Patient Dashboard', icon: ClipboardList },
              { id: 'telemetry', label: 'Telemetry Stream', icon: Activity },
              { id: 'ventilator', label: 'Ventilator Suite', icon: Sliders },
              { id: 'medication', label: 'Infusion Chart', icon: Pill },
              { id: 'nurse', label: 'Nursing Workspace', icon: ClipboardList },
              { id: 'scores', label: 'Score Calculators', icon: TrendingUp },
              { id: 'tele_icu', label: 'Tele-ICU Platform', icon: Video },
              { id: 'family', label: 'Family Portal', icon: Users },
              { id: 'analytics', label: 'AI Analytics', icon: Brain },
              { id: 'fhir', label: 'FHIR Export', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white border-indigo-550 shadow-md' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isTabletView && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats Alerts */}
          {!isTabletView && (
            <div className="pt-6 px-2">
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-2xl space-y-2">
                <div className="flex items-center space-x-1.5 text-[9px] font-black text-rose-500 uppercase">
                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                  <span>Early Warnings</span>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  2 Patients flagged with critical sepsis risk criteria (SOFA &gt; 10).
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN DISPLAY PORT */}
        <main className={`flex-1 overflow-y-auto p-6 ${isWallDisplay ? 'bg-slate-950 text-white' : ''}`}>
          
          {/* MOBILE TABS */}
          <div className="md:hidden flex space-x-2 overflow-x-auto pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            {['command', 'map', 'dashboard', 'telemetry', 'ventilator', 'nurse', 'tele_icu'].map(tId => (
              <button
                key={tId}
                onClick={() => setActiveTab(tId as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap tracking-wider border ${
                  activeTab === tId
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tId}
              </button>
            ))}
          </div>

          {/* TAB 1: COMMAND HUD */}
          {activeTab === 'command' && (
            <div className="space-y-6">
              {/* Top row cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "ICU Occupancy", value: "32 / 36 Beds", sub: "88% Occupied, 4 Available", color: "border-l-indigo-500 text-indigo-500" },
                  { label: "Active Ventilators", value: "18 Patients", sub: "3 Weaning In-Progress", color: "border-l-cyan-500 text-cyan-500" },
                  { label: "Staff-to-Patient Ratio", value: "1 : 1.5", sub: "Optimal range (Target 1:1)", color: "border-l-emerald-500 text-emerald-500" },
                  { label: "Critical Vitals Alarm", value: "2 Stat Alerts", sub: "Beds #1 and #6 Flagged", color: "border-l-rose-500 text-rose-500 animate-pulse" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">{stat.label}</p>
                    <h3 className={`text-lg font-black mt-1 ${stat.color}`}>{stat.value}</h3>
                    <p className="text-[9px] text-gray-400 mt-1 font-semibold">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* ICU occupancy detail by unit */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Sub-Unit Census</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Medical ICU (MICU)", occupancy: "8/8 Beds", activeVent: 5, color: "bg-rose-500" },
                      { name: "Surgical ICU (SICU)", occupancy: "6/8 Beds", activeVent: 4, color: "bg-amber-500" },
                      { name: "Cardiac ICU (CICU)", occupancy: "5/6 Beds", activeVent: 3, color: "bg-cyan-500" },
                      { name: "Pediatric ICU (PICU)", occupancy: "3/4 Beds", activeVent: 1, color: "bg-indigo-500" },
                      { name: "Neonatal ICU (NICU)", occupancy: "6/6 Beds", activeVent: 2, color: "bg-emerald-500" },
                      { name: "Burn ICU & Isolation", occupancy: "4/4 Beds", activeVent: 3, color: "bg-purple-500" }
                    ].map((unit, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-black text-slate-800 dark:text-white">{unit.name}</h4>
                          <span className="text-[10px] font-black text-slate-500">{unit.occupancy}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                          <div className={`h-full ${unit.color}`} style={{ width: unit.occupancy.includes('/8') ? '75%' : '100%' }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-2">
                          <span>Active Ventilators: {unit.activeVent}</span>
                          <span>Dialysis/CRRT: {unit.activeVent > 2 ? 1 : 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital twin alerts */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-rose-500 flex items-center justify-between">
                    <span>Critical Alert Hub</span>
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                  </h3>
                  <div className="space-y-3">
                    {[
                      { bed: "Bed 01", desc: "SPO2 plummeted to 91% on current oxygen set of 60%. Flagged for vent check.", time: "1m ago", severity: "Stat" },
                      { bed: "Bed 06", desc: "Urine Output < 15ml/hr for last 3 hours. Severe septic kidney injury suspected.", time: "4m ago", severity: "Stat" },
                      { bed: "Bed 03", desc: "Intracranial pressure increased to 16 mmHg (Normal < 15). Flagged neuro assessment.", time: "12m ago", severity: "Alert" }
                    ].map((al, idx) => (
                      <div key={idx} className="p-3 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 rounded-2xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">{al.bed}</span>
                          <span className="text-[8px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full">{al.severity}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{al.desc}</p>
                        <span className="text-[8px] text-slate-400 font-bold block mt-1">{al.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI forecast and twin */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span>AI Predictive Demand forecasting</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold block">VENTILATOR PRESSURE DEMAND</span>
                    <p className="mt-1 text-slate-800 dark:text-white font-bold leading-normal">
                      AI forecasts 92% likelihood of requiring 2 additional ventilators within 48 hours based on incoming emergency care pipeline.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold block">BED SHIFT REQUIREMENTS</span>
                    <p className="mt-1 text-slate-800 dark:text-white font-bold leading-normal">
                      Bed #2 (Anjali Kulkarni) is flagged as highly suitable for step-down unit transition (Success likelihood 89%). Clear bed for admissions.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <span className="text-[10px] text-gray-400 font-bold block">CRITICAL MEDICATION DEMAND</span>
                    <p className="mt-1 text-slate-800 dark:text-white font-bold leading-normal">
                      Noradrenaline stock forecast: Current supply sufficient for 5 days. Re-order trigger suggested.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART ICU MAP */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Smart ICU Interactive Map</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Click on any bed to examine vitals telemetry, active ventilation modes, and assign doctors/nurses</p>
              </div>

              {/* Grid map of beds */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {patients.map(p => {
                  const isSelected = p.id === selectedPatientId;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected 
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 border-indigo-300 dark:border-indigo-850'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{p.bedNumber}</span>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{p.name}</h4>
                          <span className="text-[9px] text-gray-400 font-semibold">{p.age} {p.gender} • {p.subUnit}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${getSeverityBadge(p.severity)}`}>
                          {p.severity}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="text-[8px] text-slate-400 dark:text-slate-500 block uppercase">Intensivist</span>
                          <span className="truncate block mt-0.5">{p.doctor}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 dark:text-slate-500 block uppercase">Primary Nurse</span>
                          <span className="truncate block mt-0.5">{p.nurse}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-bold">
                        <div className="flex items-center space-x-1.5">
                          <Activity className="w-3.5 h-3.5 text-rose-500" />
                          <span>NEWS2: <strong className={p.scores.news2 >= 7 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}>{p.scores.news2}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <span>Vent: <strong>{p.ventStatus}</strong></span>
                        </div>
                      </div>

                      {/* Spark line details */}
                      {p.alertStatus !== 'Normal' && (
                        <div className="absolute top-0 right-0 w-2 h-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Interactive map visualization */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Floor Layout & Cleaning Status</h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 text-center">
                  {[
                    { label: "Bed 01", status: "Occupied (Stat)", style: "bg-rose-500 text-white" },
                    { label: "Bed 02", status: "Occupied (Alert)", style: "bg-amber-500 text-white" },
                    { label: "Bed 03", status: "Occupied (Alert)", style: "bg-amber-500 text-white" },
                    { label: "Bed 04", status: "Occupied (Normal)", style: "bg-indigo-600 text-white" },
                    { label: "Bed 05", status: "Occupied (Alert)", style: "bg-amber-500 text-white" },
                    { label: "Bed 06", status: "Occupied (Stat)", style: "bg-rose-500 text-white" },
                    { label: "Bed 07", status: "Cleaning In Progress", style: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 animate-pulse" },
                    { label: "Bed 08", status: "Available", style: "bg-emerald-500 text-white" }
                  ].map((cell, idx) => (
                    <div key={idx} className={`p-3 rounded-2xl border border-transparent flex flex-col justify-center items-center space-y-1 ${cell.style}`}>
                      <span className="text-[10px] font-black">{cell.label}</span>
                      <span className="text-[8px] opacity-90 leading-tight font-semibold">{cell.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PATIENT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Patient Profile Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">{selectedPatient.name}</h2>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      {selectedPatient.subUnit}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    ABHA: {selectedPatient.abhaId} • {selectedPatient.age} years • {selectedPatient.gender}
                  </p>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold mt-1">
                    <strong>Primary ICU Admission Diagnosis:</strong> {selectedPatient.diagnosis}
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                    <span className="text-[8px] text-gray-400 font-black uppercase block">NEWS2</span>
                    <span className="text-xs font-black text-rose-500">{selectedPatient.scores.news2}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                    <span className="text-[8px] text-gray-400 font-black uppercase block">SOFA</span>
                    <span className="text-xs font-black text-amber-500">{selectedPatient.scores.sofa}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                    <span className="text-[8px] text-gray-400 font-black uppercase block">APACHE II</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{selectedPatient.scores.apache}</span>
                  </div>
                </div>
              </div>

              {/* Vitals overview row */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: "Heart Rate", value: `${liveVitals.hr} bpm`, status: liveVitals.hr > 100 ? "Tachycardia" : "Normal", color: liveVitals.hr > 100 ? "text-rose-500" : "text-emerald-500" },
                  { label: "Blood Pressure", value: `${liveVitals.sbp}/${liveVitals.dbp} mmHg`, status: liveVitals.sbp < 100 ? "Hypotension" : "Normal", color: liveVitals.sbp < 100 ? "text-rose-500" : "text-emerald-500" },
                  { label: "SPO2 Saturation", value: `${liveVitals.spo2} %`, status: liveVitals.spo2 < 92 ? "Hypoxia" : "Normal", color: liveVitals.spo2 < 92 ? "text-rose-500" : "text-emerald-500" },
                  { label: "Respiration Rate", value: `${liveVitals.rr} /min`, status: liveVitals.rr > 20 ? "Tachypnoea" : "Normal", color: liveVitals.rr > 20 ? "text-rose-500" : "text-emerald-500" },
                  { label: "Body Temp", value: `${liveVitals.temp} °F`, status: liveVitals.temp > 100.4 ? "Pyrexia" : "Normal", color: liveVitals.temp > 100.4 ? "text-rose-500" : "text-emerald-500" },
                  { label: "Urine Output", value: `${liveVitals.urineOutput} ml/h`, status: liveVitals.urineOutput < 30 ? "Oliguria" : "Normal", color: liveVitals.urineOutput < 30 ? "text-rose-500 animate-pulse" : "text-emerald-500" }
                ].map((vit, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[8px] text-gray-400 font-bold block uppercase">{vit.label}</span>
                    <span className={`text-sm font-black block mt-1 ${vit.color}`}>{vit.value}</span>
                    <span className="text-[8px] text-gray-400 dark:text-slate-500 font-semibold block mt-0.5">{vit.status}</span>
                  </div>
                ))}
              </div>

              {/* Infusion / Vent Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active infusions pump dashboard */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Active Infusions (IoT Linked)</h3>
                  <div className="space-y-3">
                    {[
                      { drug: "Noradrenaline", dose: "0.12 mcg/kg/min", rate: "8.4 ml/h", volumeLeft: "14.2 ml", priority: "Vasoactive" },
                      { drug: "Propofol (Sedation)", dose: "2.0 mg/kg/h", rate: "12.0 ml/h", volumeLeft: "24.5 ml", priority: "Sedative" },
                      { drug: "Fentanyl (Analgesia)", dose: "50 mcg/h", rate: "2.0 ml/h", volumeLeft: "42.0 ml", priority: "High-Risk" }
                    ].map((inf, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                        <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-800 dark:text-white">{inf.drug}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{inf.dose}</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                          <span>Pump rate: {inf.rate}</span>
                          <span>Volume remaining: {inf.volumeLeft}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ventilator monitoring widget */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Ventilator Status</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-[8px] text-gray-400 font-bold block uppercase">VENT MODE</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">{ventSettings.mode}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 font-bold block uppercase">PEEP / FIO2</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">{ventSettings.peep} cmH2O / {ventSettings.fio2}%</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span>Weaning Readiness Score</span>
                        <span className="text-emerald-500">{ventSettings.weaningProgress}% Ready</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-emerald-500 h-full" style={{ width: `${ventSettings.weaningProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI clinical recommendations */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>AI Copilot Insights</span>
                  </h3>
                  <div className="space-y-2 text-[10px] leading-relaxed font-semibold text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Hypokalemia Alert:</strong> Morning potassium level was 3.2 mEq/L (Low). Replacement protocol suggested.
                    </p>
                    <p>
                      <strong>Septic progression risk:</strong> Lactate levels trending upward (2.1 to 2.8 mmol/L). High suggestion for repeat ABG/Lactate.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY STREAM */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">High-Fidelity Vitals Telemetry</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time physiologic waveforms and digital patient telemetry streams</p>
              </div>

              {/* Waveforms Canvas rendering */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Waveforms panel */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-[#090d16] p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                        <span>Lead II ECG (Sinus Wave)</span>
                        <span>112 bpm</span>
                      </div>
                      <canvas ref={ecgCanvasRef} width={600} height={100} className="w-full bg-[#090d16] rounded-xl border border-slate-900" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">
                        <span>SpO2 Photoplethysmogram (Pleth Wave)</span>
                        <span>91%</span>
                      </div>
                      <canvas ref={spo2CanvasRef} width={600} height={100} className="w-full bg-[#090d16] rounded-xl border border-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Additional parameters sidebar */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Physiological Parameters</h3>
                  <div className="space-y-3">
                    {[
                      { label: "CVP (Central Venous Pressure)", value: `${liveVitals.cvp} mmHg`, range: "Normal: 2-6 mmHg", status: "Optimal" },
                      { label: "ICP (Intracranial Pressure)", value: `${liveVitals.icp} mmHg`, range: "Normal: < 15 mmHg", status: "High Borderline" },
                      { label: "ETCO2 (End-Tidal CO2)", value: `${liveVitals.etco2} mmHg`, range: "Normal: 35-45 mmHg", status: "Low" },
                      { label: "Blood Glucose", value: `${liveVitals.bloodSugar} mg/dL`, range: "Target: 140-180 mg/dL", status: "Elevated" }
                    ].map((param, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                        <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-800 dark:text-white">{param.label}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{param.value}</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                          <span>{param.range}</span>
                          <span>{param.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: VENTILATOR WORKSPACE */}
          {activeTab === 'ventilator' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Ventilator Command Workspace</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Adjust ventilation modes, PEEP, FiO2 values, and track AI weaning indices</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Control Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Ventilation Parameters & Adjustments</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase block mb-1">Ventilation Mode</span>
                      <select 
                        value={ventSettings.mode} 
                        onChange={(e) => setVentSettings({ ...ventSettings, mode: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="PRVC">PRVC (Pressure Regulated Volume Control)</option>
                        <option value="SIMV">SIMV-PC (Sychronized Intermittent Mand.)</option>
                        <option value="CPAP">CPAP/PS (Continuous Positive Airway Press)</option>
                        <option value="ACV">ACV-VC (Assist-Control Volume)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase block mb-1">FiO2 (Oxygen concentration)</span>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="range" 
                          min={21} 
                          max={100}
                          value={ventSettings.fio2}
                          onChange={(e) => setVentSettings({ ...ventSettings, fio2: parseInt(e.target.value) })}
                          className="flex-1 accent-indigo-600"
                        />
                        <span className="text-xs font-black">{ventSettings.fio2}%</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase block mb-1">PEEP (Positive End-Expiratory Pressure)</span>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="range" 
                          min={0} 
                          max={20}
                          value={ventSettings.peep}
                          onChange={(e) => setVentSettings({ ...ventSettings, peep: parseInt(e.target.value) })}
                          className="flex-1 accent-indigo-600"
                        />
                        <span className="text-xs font-black">{ventSettings.peep} cmH2O</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase block mb-1">Tidal Volume (Target Vt)</span>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="range" 
                          min={250} 
                          max={600}
                          value={ventSettings.tidalVolume}
                          onChange={(e) => setVentSettings({ ...ventSettings, tidalVolume: parseInt(e.target.value) })}
                          className="flex-1 accent-indigo-600"
                        />
                        <span className="text-xs font-black">{ventSettings.tidalVolume} ml</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/30 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">Clinical Safety Warning</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-semibold">
                      Plateau pressure is currently at **28 cmH2O** (Target &lt; 30 to prevent barotrauma). Lung protective ventilation parameters active.
                    </p>
                  </div>
                </div>

                {/* AI Weaning Index */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>AI Weaning Insights</span>
                  </h3>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold block uppercase">Rapid Shallow Breathing Index (RSBI)</span>
                    <span className="text-lg font-black text-emerald-500 block mt-1">68</span>
                    <span className="text-[8px] font-black uppercase text-emerald-500 block mt-0.5">Ready for SBT (Target &lt; 105)</span>
                  </div>

                  <div className="space-y-2 text-[10px] leading-relaxed font-semibold text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Trigger check:</strong> Minute ventilation is stable at 8.2 L/min. PEEP has successfully weaned to 10.
                    </p>
                    <p>
                      <strong>SBT Trial:</strong> Clinicians are suggested to initiate a Spontaneous Breathing Trial (SBT) of 30 minutes on CPAP mode.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: INFUSION CHART */}
          {activeTab === 'medication' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">ICU Infusion Pumps & Drug Compatibility</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time drip calculations, compatibility matrix, and allergy warnings</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Compatibility Matrix */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Y-Site Drug Compatibility Grid</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-bold text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-gray-400 uppercase">
                          <th className="py-2">Infusion Drug</th>
                          <th className="py-2">Noradrenaline</th>
                          <th className="py-2">Propofol</th>
                          <th className="py-2">Fentanyl</th>
                          <th className="py-2">KCL (Potassium)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { name: "Noradrenaline", compat: ["COMPATIBLE", "COMPATIBLE", "COMPATIBLE", "INCOMPATIBLE"] },
                          { name: "Propofol", compat: ["COMPATIBLE", "COMPATIBLE", "COMPATIBLE", "COMPATIBLE"] },
                          { name: "Fentanyl", compat: ["COMPATIBLE", "COMPATIBLE", "COMPATIBLE", "COMPATIBLE"] },
                          { name: "KCL (Potassium)", compat: ["INCOMPATIBLE", "COMPATIBLE", "COMPATIBLE", "COMPATIBLE"] }
                        ].map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-3 text-slate-900 dark:text-white">{row.name}</td>
                            {row.compat.map((c, i) => (
                              <td key={i} className="py-3">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  c === 'COMPATIBLE' 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {c}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* High risk drug digital witness sign-off */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Digital Witness Sign-Off</h3>
                  
                  <div className="p-3 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 rounded-2xl space-y-2">
                    <span className="text-[8px] font-black uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full">HIGH-RISK DRUG</span>
                    <h4 className="text-xs font-black">Potassium Chloride 40mEq IV Infusion</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                      Requires two licensed clinicians to sign-off and witness pump connection setup.
                    </p>
                    <button 
                      onClick={() => alert("Digital witness signatures saved and locked in audit logs.")}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Authenticate Sign-off
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: NURSING WORKSPACE */}
          {activeTab === 'nurse' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">ICU Nursing Workspace</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Turning schedule log, ventilator care bundles, and shift SBAR handover notes</p>
                </div>
                <button
                  onClick={triggerVoiceNote}
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${isRecordingNote ? 'animate-bounce bg-rose-600' : ''}`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecordingNote ? "Recording Note..." : "Dictate Note"}</span>
                </button>
              </div>

              {recordedTranscript && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-[10px] text-amber-500 font-bold">
                  {recordedTranscript}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Skin turn positioning log */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">2-Hour Turning & Skin Log</h3>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold block uppercase">CURRENT POSITION</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white">{currentPosition}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 font-bold block uppercase">NEXT TURN DUE</span>
                      <span className="text-xs font-black text-rose-500">{turnTimer} minutes</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {["Supine", "Left Lateral", "Right Lateral", "Prone"].map((pos, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handlePositionTurn(pos)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                          currentPosition === pos 
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>

                  {/* Position History */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[8px] text-gray-400 font-bold uppercase block">Position Log History</span>
                    {positionHistory.map((ph, i) => (
                      <div key={i} className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 font-bold">
                        <span>{ph.time} - {ph.position}</span>
                        <span>{ph.signedBy}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intake & Output Fluid Balance */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Fluid Balance Console</h3>
                  
                  <form onSubmit={addFluidEntry} className="grid grid-cols-3 gap-2">
                    <select 
                      value={newFluid.type} 
                      onChange={(e) => setNewFluid({ ...newFluid, type: e.target.value })}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-2 py-1 rounded-lg text-[9px] font-black"
                    >
                      <option value="Intake">Intake</option>
                      <option value="Output">Output</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="ml"
                      value={newFluid.amount}
                      onChange={(e) => setNewFluid({ ...newFluid, amount: parseInt(e.target.value) || 0 })}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 px-2 py-1 rounded-lg text-[9px] font-black"
                    />
                    <button type="submit" className="bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase">Add</button>
                  </form>

                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto pt-2">
                    {fluidLog.map((fl, i) => (
                      <div key={i} className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 pb-1">
                        <span>{fl.time} • Intake: {fl.intake} • Output: {fl.output}</span>
                        <span className="font-bold">{fl.balance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SBAR Handover Notes */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">SBAR Shift Handover Note</h3>
                  <textarea 
                    value={nursingNotes}
                    onChange={(e) => setNursingNotes(e.target.value)}
                    className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-[10px] font-bold text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: CLINICAL SCORING */}
          {activeTab === 'scores' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">ICU Clinical Scoring Systems</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Automated calculators for NEWS2, SOFA (Sequential Organ Failure), and APACHE II</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Calculator fields */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Physiological Variables Inputs</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase block mb-1">Resp Rate</span>
                      <input 
                        type="number" 
                        value={calcScores.rr}
                        onChange={(e) => {
                          setCalcScores({ ...calcScores, rr: parseInt(e.target.value) || 0 });
                          calculateRiskScores();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase block mb-1">SpO2 Sat (%)</span>
                      <input 
                        type="number" 
                        value={calcScores.spo2}
                        onChange={(e) => {
                          setCalcScores({ ...calcScores, spo2: parseInt(e.target.value) || 0 });
                          calculateRiskScores();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase block mb-1">Heart Rate</span>
                      <input 
                        type="number" 
                        value={calcScores.hr}
                        onChange={(e) => {
                          setCalcScores({ ...calcScores, hr: parseInt(e.target.value) || 0 });
                          calculateRiskScores();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase block mb-1">Systolic BP</span>
                      <input 
                        type="number" 
                        value={calcScores.sbp}
                        onChange={(e) => {
                          setCalcScores({ ...calcScores, sbp: parseInt(e.target.value) || 0 });
                          calculateRiskScores();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase block mb-1">Platelets (k/uL)</span>
                      <input 
                        type="number" 
                        value={calcScores.platelets}
                        onChange={(e) => {
                          setCalcScores({ ...calcScores, platelets: parseInt(e.target.value) || 0 });
                          calculateRiskScores();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase block mb-1">Creatinine (mg/dL)</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={calcScores.creatinine}
                        onChange={(e) => {
                          setCalcScores({ ...calcScores, creatinine: parseFloat(e.target.value) || 0 });
                          calculateRiskScores();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Score results card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Calculated Organ Dysfunction</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 rounded-2xl text-center">
                      <span className="text-[9px] text-rose-500 font-bold block uppercase">NEWS2 Score</span>
                      <span className="text-2xl font-black text-rose-500 block mt-1">{calculatedNEWS2}</span>
                      <span className="text-[8px] font-black uppercase block mt-1 text-slate-500">High Risk Group</span>
                    </div>

                    <div className="p-3 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl text-center">
                      <span className="text-[9px] text-amber-500 font-bold block uppercase">SOFA Score</span>
                      <span className="text-2xl font-black text-amber-500 block mt-1">{calculatedSOFA}</span>
                      <span className="text-[8px] font-black uppercase block mt-1 text-slate-500">Organ Impairment</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: TELE-ICU */}
          {activeTab === 'tele_icu' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">Tele-ICU Portal</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Secure clinical feed streaming, remote intensivist coordination desk</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live stream */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Patient Camera Feed (Bed 01)</h3>
                  
                  <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                    {remoteCameraActive ? (
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">LIVE BROADCAST</span>
                          <span className="text-[9px] text-white/70 font-semibold">127.0.0.1 Connected</span>
                        </div>
                        {/* Simulation grid placeholder lines */}
                        <div className="w-full h-0.5 bg-white/10" />
                        <div className="flex justify-between items-center text-[10px] text-white font-bold bg-black/40 p-2 rounded-lg">
                          <span>Patient: Dinkar Patil</span>
                          <button 
                            onClick={() => setRemoteCameraActive(false)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-[8px] uppercase"
                          >
                            Disconnect Video
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-xs text-gray-500 font-black">Camera Stream Disconnected</p>
                        <button 
                          onClick={() => setRemoteCameraActive(true)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase"
                        >
                          Reconnect
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team chat coordinator */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between h-[300px]">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Coordinator Chat</h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[180px]">
                    {teleChat.map((msg, i) => (
                      <div key={i} className="text-[10px]">
                        <strong className="text-indigo-600 dark:text-indigo-400">{msg.sender} ({msg.time}):</strong>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-semibold">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={sendTeleChat} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type coordinator note..."
                      value={newChatText}
                      onChange={(e) => setNewChatText(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2 rounded-xl text-[10px] font-bold"
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-xl text-[10px] font-black uppercase">Send</button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: FAMILY PORTAL */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">ICU Family Portal Updates</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Secure updates, educational resources, and visit scheduling</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Layperson Status Translation</h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    "Your father's breathing machine support is currently stable. We are starting to slowly reduce his oxygen support levels (weaning process). His kidney functions are monitored continuously by the clinical team."
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Visit Booking Schedule</h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal font-semibold">
                    ICU Visiting Hours: 16:00 - 18:00 (Max 1 visitor per patient at bedside).
                  </p>
                  <button 
                    onClick={() => alert("Visiting pass generated. Sent to registered mobile number via SMS.")}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Generate Visitor Pass
                  </button>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Consent Management</h3>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-semibold text-slate-600">
                    <span>Active Consent Pending:</span>
                    <strong className="block text-slate-900 dark:text-white mt-1">Surgical tracheostomy consent form</strong>
                    <button 
                      onClick={() => alert("Consent link sent to family registered Aadhaar portal.")}
                      className="mt-2 w-full py-1.5 bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Request Aadhaar Sign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: AI ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">ICU Performance & Quality Metrics</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Average length of stay, ventilator days, and alarm frequency analysis</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { metric: "Average Length of Stay", value: "6.8 Days", target: "Target: < 7.0 Days" },
                  { metric: "Ventilator Associated Pneumonia", value: "0.2 per 1000", target: "Target: 0.0" },
                  { metric: "ICU Readmission Rate", value: "1.8%", target: "Target: < 2.5%" },
                  { metric: "Average Alarm Response Time", value: "14 seconds", target: "Target: < 15s" }
                ].map((met, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold block uppercase">{met.metric}</span>
                    <span className="text-base font-black block mt-1 text-indigo-600 dark:text-indigo-400">{met.value}</span>
                    <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">{met.target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: FHIR INTEROP */}
          {activeTab === 'fhir' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">FHIR / ABDM Compliance Export</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">JSON model structures for interoperable HL7 FHIR Procedure, Device and Observation resources</p>
                </div>
                <button
                  onClick={() => alert("JSON payload downloaded locally.")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>Download Manifest</span>
                </button>
              </div>

              <div className="bg-[#090d16] text-[#00ff66] p-5 rounded-3xl border border-slate-800 font-mono text-[9px] leading-relaxed overflow-x-auto">
                <pre>{JSON.stringify({
                  resourceType: "Bundle",
                  type: "collection",
                  entry: [
                    {
                      resource: {
                        resourceType: "Procedure",
                        id: "procedure-icu-301",
                        status: "in-progress",
                        code: {
                          coding: [{ system: "http://snomed.info/sct", code: "232664002", display: "Intubation of respiratory tract" }]
                        },
                        subject: { reference: `Patient/${selectedPatient.id}`, display: selectedPatient.name }
                      }
                    },
                    {
                      resource: {
                        resourceType: "Device",
                        id: "device-vent-301",
                        identifier: [{ system: "http://fda.gov/udi", value: "UDI-VENT-9012" }],
                        manufacturer: "Hamilton Medical",
                        modelNumber: "C6"
                      }
                    },
                    {
                      resource: {
                        resourceType: "Observation",
                        id: "obs-sofa-301",
                        status: "final",
                        code: {
                          coding: [{ system: "http://loinc.org", code: "8523-8", display: "Sequential Organ Failure Assessment Score" }]
                        },
                        valueInteger: selectedPatient.scores.sofa,
                        subject: { reference: `Patient/${selectedPatient.id}` }
                      }
                    }
                  ]
                }, null, 2)}</pre>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
