import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, AlertTriangle, Ambulance, ArrowRight, BarChart2, Bell, Brain, 
  Building, Calendar, Check, CheckCircle2, ChevronRight, Clock, Database, 
  Droplet, Eye, FileText, Heart, Info, Layers, LayoutGrid, Lock, LogOut, 
  Map, MapPin, MessageSquare, Phone, Play, Plus, Printer, QrCode, RefreshCw, 
  Search, Send, Settings, ShieldAlert, ShieldCheck, Siren, Smartphone, Sun, 
  Thermometer, Timer, TrendingUp, Truck, User, Users, Video, VideoOff, 
  Volume2, Wifi, WifiOff, X, Zap, Mic, MicOff, HeartPulse, Scissors, 
  Shield, FlaskConical, Pill, Tv, ClipboardList, Briefcase, Sparkles, Server, Globe, FileCheck,
  ZoomIn, ZoomOut, Maximize2, RotateCw, PlaySquare, Package, Archive, ShieldQuestion, Fingerprint, Camera, FileUp
} from 'lucide-react';

import {
  useRegistrations,
  useRegisterPatient,
  useUpdatePatientStatus,
  useConfirmTriage,
  useRecordVitals
} from '../hooks/usePatients';
import {
  useTraumaBays,
  useAssignPatientToBay,
  useUpdateBayStatus,
  useAmbulances,
  useUpdateAmbulanceGPS,
  useIncidents,
  useCreateIncident,
  useResources,
  useUpdateResourceAvailability
} from '../hooks/useResources';


// Type Definitions
interface PatientEmergency {
  id: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  triageCategory: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK' | 'PENDING';
  injuryMechanism: string;
  vitals: {
    hr: number;
    bp: string;
    rr: number;
    spo2: number;
    temp: number;
  };
  gcs: number;
  traumaScore?: number;
  allergies?: string;
  currentMedicines?: string;
  history?: string;
  ambulanceId?: string;
  etaMinutes?: number;
  bloodTypeNeeded?: string;
  status: 'EN_ROUTE' | 'DISPATCHED' | 'ARRIVED' | 'TRIAGED' | 'RESUSCITATING' | 'IN_SURGERY' | 'ICU' | 'ADMITTED' | 'DISCHARGED';
  timestamp: string;
  assignedBay?: number;
  assignedDoctor?: string;
  assignedNurse?: string;
  elapsedMinutes?: number;
}

interface FleetAmbulance {
  id: string;
  type: 'ALS' | 'BLS';
  driver: string;
  paramedic: string;
  status: 'AVAILABLE' | 'EN_ROUTE_INCIDENT' | 'TRANSPORTING' | 'MAINTENANCE';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  assignedPatientId?: string;
  fuel: number;
  equipmentCheck: {
    aed: boolean;
    ventilator: boolean;
    oxygen: number; // percentage
    emergencyKit: boolean;
  };
}

interface IncidentReport {
  id: string;
  title: string;
  location: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  victimsCount: number;
  status: 'OPEN' | 'RESOLVED' | 'ARCHIVED';
  reportedAt: string;
  type: 'ROAD_ACCIDENT' | 'FIRE_INCIDENT' | 'BUILDING_COLLAPSE' | 'MEDICAL_OUTBREAK';
}

interface EmergencyCareDashboardProps {
  isDarkMode?: boolean;
  setIsDarkMode?: (mode: boolean) => void;
  onLogout?: () => void;
}

function mapRegistrationToEmergencyPatient(reg: any): PatientEmergency {
  const hr = reg.latest_vitals?.heart_rate || 80;
  const bp = reg.latest_vitals
    ? `${reg.latest_vitals.systolic_bp || ''}/${reg.latest_vitals.diastolic_bp || ''}`
    : '120/80';
  const rr = reg.latest_vitals?.respiratory_rate || 18;
  const spo2 = reg.latest_vitals?.spo2 || 98;
  const temp = reg.latest_vitals?.temperature || 98.6;

  const allergies = reg.patient?.allergies?.[0]?.allergen || 'None';
  const history = reg.patient?.history?.[0]?.condition || 'None';

  return {
    id: reg.id,
    name: reg.patient?.name || 'Unknown Patient',
    age: reg.patient?.age || 30,
    gender: reg.patient?.gender || 'Male',
    abhaId: reg.patient?.abha_id || 'PENDING',
    triageCategory: (reg.triage?.category || 'PENDING') as any,
    injuryMechanism: reg.injury_mechanism || reg.chief_complaint || 'No mechanism specified.',
    vitals: { hr, bp, rr, spo2, temp },
    gcs: reg.triage?.gcs_total || 15,
    traumaScore: reg.triage?.rts_score || 7.84,
    allergies,
    currentMedicines: 'None',
    history,
    ambulanceId: reg.ambulance_id || undefined,
    etaMinutes: reg.status === 'EN_ROUTE' ? 5 : undefined,
    bloodTypeNeeded: reg.patient?.blood_group || 'O Positive',
    status: reg.status,
    timestamp: reg.arrival_time || reg.created_at || new Date().toISOString(),
    assignedBay: reg.active_bay?.bay?.bay_number || undefined,
    assignedDoctor: reg.active_bay?.assigned_doctor || undefined,
    assignedNurse: reg.active_bay?.assigned_nurse || undefined,
    elapsedMinutes: reg.arrival_time
      ? Math.max(1, Math.floor((Date.now() - new Date(reg.arrival_time).getTime()) / 60000))
      : 5
  };
}

function mapAmbulanceToFleetAmbulance(amb: any): FleetAmbulance {
  return {
    id: amb.call_sign || amb.id,
    type: amb.type || 'ALS',
    driver: amb.driver?.name || 'Vijay Salunkhe',
    paramedic: amb.paramedic?.name || 'Dr. Alok Mehta',
    status: amb.status,
    location: {
      lat: amb.lat || 19.037,
      lng: amb.lng || 72.860,
      name: amb.active_mission?.pickup_location || 'Sion Hospital Base'
    },
    assignedPatientId: amb.active_mission?.registration_id || amb.active_mission?.patient_id || undefined,
    fuel: amb.fuel_pct || 85,
    equipmentCheck: {
      aed: amb.has_aed,
      ventilator: amb.has_ventilator,
      oxygen: amb.oxygen_pct || 90,
      emergencyKit: true
    }
  };
}

function mapIncidentToIncidentReport(inc: any): IncidentReport {
  return {
    id: inc.id,
    title: inc.title,
    location: inc.location,
    severity: inc.severity,
    victimsCount: inc.victims_count || 1,
    status: inc.status,
    reportedAt: inc.reported_at || new Date().toISOString(),
    type: inc.type
  };
}

// ── Live ECG Waveform Telemetry Generator Component ──
const EcgWaveform = ({ hr = 80, color = '#22c55e', speed = 2 }: { hr?: number; color?: string; speed?: number }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    
    // Scale canvas for high PPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // ECG cardiac cycle template generator (P-Q-R-S-T)
    const cycleLength = Math.max(12, Math.floor(2500 / hr)); 
    const wavePoints: number[] = [];
    for (let i = 0; i < cycleLength; i++) {
      const p = i / cycleLength;
      if (p < 0.1) {
        wavePoints.push(0);
      } else if (p < 0.18) {
        const phase = (p - 0.1) / 0.08;
        wavePoints.push(Math.sin(phase * Math.PI) * 0.12);
      } else if (p < 0.22) {
        wavePoints.push(0);
      } else if (p < 0.24) {
        const phase = (p - 0.22) / 0.02;
        wavePoints.push(-0.15 * phase);
      } else if (p < 0.27) {
        const phase = (p - 0.24) / 0.03;
        wavePoints.push(-0.15 + phase * 1.3);
      } else if (p < 0.30) {
        const phase = (p - 0.27) / 0.03;
        wavePoints.push(1.15 - phase * 1.55);
      } else if (p < 0.33) {
        const phase = (p - 0.30) / 0.03;
        wavePoints.push(-0.4 + phase * 0.4);
      } else if (p < 0.45) {
        wavePoints.push(0);
      } else if (p < 0.58) {
        const phase = (p - 0.45) / 0.13;
        wavePoints.push(Math.sin(phase * Math.PI) * 0.3);
      } else {
        wavePoints.push(0);
      }
    }

    const pointsToDraw = new Array(Math.floor(width)).fill(height / 2);
    let index = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle clinical grid background
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 0.5;
      for (let g = 0; g < width; g += 15) {
        ctx.beginPath();
        ctx.moveTo(g, 0);
        ctx.lineTo(g, height);
        ctx.stroke();
      }
      for (let g = 0; g < height; g += 15) {
        ctx.beginPath();
        ctx.moveTo(0, g);
        ctx.lineTo(width, g);
        ctx.stroke();
      }

      // Add new sample and shift old trace
      const waveValue = wavePoints[index % wavePoints.length];
      const targetY = height / 2 - waveValue * (height * 0.35);
      pointsToDraw.shift();
      pointsToDraw.push(targetY);
      index += speed;

      // Draw active telemetry line
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.shadowColor = color;
      ctx.shadowBlur = 3;
      
      ctx.beginPath();
      ctx.moveTo(0, pointsToDraw[0]);
      for (let i = 1; i < width; i++) {
        ctx.lineTo(i, pointsToDraw[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hr, color, speed]);

  return (
    <canvas 
      ref={canvasRef} 
      className="bg-slate-950 rounded-xl w-full h-12 border border-slate-800 shadow-inner"
      style={{ display: 'block', height: '48px' }}
    />
  );
};

// ── DICOM Viewer Component ──
interface DicomViewportProps {
  study: {
    id: string;
    patient: string;
    modality: string;
    test: string;
    finding: string;
    confidence: number;
    status: string;
  };
  zoom: number;
  rotation: number;
  slice: number;
  windowMode: 'BRAIN' | 'BONE' | 'SUBDURAL' | 'LUNG';
  showAIOverlay: boolean;
  showMeasureTool: boolean;
  contrast: number;
  brightness: number;
  onSliceChange: (slice: number) => void;
}

const DicomViewport: React.FC<DicomViewportProps> = ({
  study,
  zoom,
  rotation,
  slice,
  windowMode,
  showAIOverlay,
  showMeasureTool,
  contrast,
  brightness,
  onSliceChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [measuringPoints, setMeasuringPoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Apply translations & rotation
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);

    // Dynamic contrast & brightness values
    const isBone = windowMode === 'BONE';
    const isSubdural = windowMode === 'SUBDURAL';
    const isLung = windowMode === 'LUNG';

    // Grayscale Palette Map according to window level settings
    let skullColor = 'rgba(240, 240, 240, 0.95)';
    let brainColor = 'rgba(100, 100, 100, 0.8)';
    let csfColor = 'rgba(25, 25, 25, 0.9)';
    let pathologyColor = 'rgba(235, 235, 235, 0.95)'; // Blood is hyperdense

    if (isBone) {
      skullColor = 'rgba(255, 255, 255, 1)';
      brainColor = 'rgba(20, 20, 20, 0.9)';
      csfColor = 'rgba(10, 10, 10, 0.9)';
      pathologyColor = 'rgba(30, 30, 30, 0.9)';
    } else if (isSubdural) {
      skullColor = 'rgba(255, 255, 255, 0.9)';
      brainColor = 'rgba(60, 60, 60, 0.9)';
      csfColor = 'rgba(15, 15, 15, 0.95)';
      pathologyColor = 'rgba(245, 245, 245, 1)';
    }

    if (study.modality === 'CT' && study.test.includes('Head')) {
      // ── DRAW AXIAL CT BRAIN SCAN ──
      
      // Brain outline (Dura/Skull envelope)
      ctx.beginPath();
      ctx.ellipse(cx, cy, 110, 130, 0, 0, 2 * Math.PI);
      ctx.fillStyle = brainColor;
      ctx.fill();

      // Draw Skull structure (Bone details outer envelope)
      ctx.lineWidth = isBone ? 8 : 6;
      ctx.strokeStyle = skullColor;
      ctx.stroke();

      if (isBone) {
        // Draw inner marrow cavity of skull bones
        ctx.strokeStyle = 'rgba(140, 140, 140, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Ventricles (butterfly horns, varying in size based on slice level)
      // Standard slices 6 - 18 show main ventricles
      const ventricleFactor = Math.max(0, Math.sin(((slice - 4) / 16) * Math.PI));
      if (ventricleFactor > 0 && !isBone) {
        ctx.fillStyle = csfColor;
        
        // Left Ventricle Horn
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 30 * ventricleFactor);
        ctx.bezierCurveTo(cx - 25, cy - 20 * ventricleFactor, cx - 35, cy, cx - 10, cy + 25 * ventricleFactor);
        ctx.bezierCurveTo(cx - 15, cy + 10 * ventricleFactor, cx - 20, cy - 10 * ventricleFactor, cx - 10, cy - 30 * ventricleFactor);
        ctx.fill();

        // Right Ventricle Horn
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy - 30 * ventricleFactor);
        ctx.bezierCurveTo(cx + 25, cy - 20 * ventricleFactor, cx + 35, cy, cx + 10, cy + 25 * ventricleFactor);
        ctx.bezierCurveTo(cx + 15, cy + 10 * ventricleFactor, cx + 20, cy - 10 * ventricleFactor, cx + 10, cy - 30 * ventricleFactor);
        ctx.fill();
      }

      // Midline shift fissure line (slight curve if subdural mass present)
      ctx.strokeStyle = isBone ? 'rgba(40, 40, 40, 0.8)' : 'rgba(80, 80, 80, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 120);
      
      const massFactor = Math.max(0, Math.sin((slice / 24) * Math.PI));
      if (showAIOverlay && study.id === 'RAD-901' && massFactor > 0) {
        // Curve to the right due to mass effect
        ctx.quadraticCurveTo(cx + 8 * massFactor, cy, cx, cy + 120);
      } else {
        ctx.lineTo(cx, cy + 120);
      }
      ctx.stroke();

      // Pathological Hemorrhage: Crescent on the left hemisphere (radiological right)
      // Acute subdural hematoma (convex outer, concave inner border)
      const sdhFactor = Math.max(0, Math.sin(((slice - 3) / 18) * Math.PI));
      if (study.id === 'RAD-901' && sdhFactor > 0) {
        ctx.beginPath();
        // Outer convex boundary (hugging skull inner edge)
        ctx.ellipse(cx - 106, cy, 94 * sdhFactor, 110 * sdhFactor, 0, -Math.PI/2, Math.PI/2);
        // Inner concave boundary (brain displacement)
        ctx.quadraticCurveTo(cx - 78, cy, cx - 106, cy + 110 * sdhFactor);
        ctx.fillStyle = pathologyColor;
        ctx.fill();

        // AI Bounding circle overlay
        if (showAIOverlay) {
          ctx.strokeStyle = '#f43f5e'; // rose-500
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx - 96, cy, 25, 45, 0.1, 0, 2 * Math.PI);
          ctx.stroke();

          // Red glowing overlay
          ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
          ctx.fill();
        }
      }
    } else {
      // ── DRAW CHEST X-RAY / PULMONARY PROTOCOL ──
      // Spine spine column in the center
      ctx.fillStyle = 'rgba(150, 150, 150, 0.85)';
      ctx.fillRect(cx - 8, cy - 180, 16, 360);

      // Draw two dark lung fields
      ctx.fillStyle = isLung ? 'rgba(15, 15, 15, 0.95)' : 'rgba(25, 25, 25, 0.9)';
      
      // Left Lung
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 140);
      ctx.bezierCurveTo(cx - 65, cy - 160, cx - 110, cy - 100, cx - 100, cy + 100);
      ctx.bezierCurveTo(cx - 90, cy + 120, cx - 40, cy + 120, cx - 15, cy + 60);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 120, 120, 0.5)';
      ctx.stroke();

      // Right Lung
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy - 140);
      ctx.bezierCurveTo(cx + 65, cy - 160, cx + 110, cy - 100, cx + 100, cy + 100);
      ctx.bezierCurveTo(cx + 90, cy + 120, cx + 40, cy + 120, cx + 15, cy + 80); // notch for heart
      ctx.fill();
      ctx.stroke();

      // Rib cage outlines (semi-translucent white arcs)
      ctx.strokeStyle = 'rgba(220, 220, 220, 0.2)';
      ctx.lineWidth = 4;
      for (let i = -100; i < 100; i += 30) {
        // Left ribs
        ctx.beginPath();
        ctx.arc(cx - 95, cy + i, 80, -Math.PI/6, Math.PI/3);
        ctx.stroke();
        // Right ribs
        ctx.beginPath();
        ctx.arc(cx + 95, cy + i, 80, Math.PI * (2/3), Math.PI * (7/6));
        ctx.stroke();
      }

      // Heart Shadow (Mediastinum center bulge)
      ctx.fillStyle = 'rgba(180, 180, 180, 0.85)';
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 20);
      ctx.bezierCurveTo(cx - 45, cy + 30, cx - 35, cy + 90, cx, cy + 100);
      ctx.bezierCurveTo(cx + 25, cy + 90, cx + 15, cy + 30, cx + 10, cy - 20);
      ctx.fill();

      // Pathology Opacity
      if (study.id === 'RAD-903') {
        // Asthma hyperinflation - draw lungs slightly larger and diaphragms flat
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(cx + 60, cy + 30, 35, 0, 2 * Math.PI);
        ctx.fill();
      } else if (study.id === 'RAD-902' && showAIOverlay) {
        // Pulmonary Embolism - highlighted clot in pulmonary artery trunk
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx - 15, cy - 10, 12, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
      }
    }

    ctx.restore();

    // ── DRAW MEASUREMENT CALIPER TOOL ──
    if (measuringPoints) {
      const { x1, y1, x2, y2 } = measuringPoints;
      
      // Caliper Line
      ctx.strokeStyle = '#10b981'; // emerald-500
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Tick mark at start
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const tickLen = 6;
      ctx.beginPath();
      ctx.moveTo(x1 - Math.sin(angle) * tickLen, y1 + Math.cos(angle) * tickLen);
      ctx.lineTo(x1 + Math.sin(angle) * tickLen, y1 - Math.cos(angle) * tickLen);
      ctx.stroke();

      // Tick mark at end
      ctx.beginPath();
      ctx.moveTo(x2 - Math.sin(angle) * tickLen, y2 + Math.cos(angle) * tickLen);
      ctx.lineTo(x2 + Math.sin(angle) * tickLen, y2 - Math.cos(angle) * tickLen);
      ctx.stroke();

      // Distance calculation (Scale: 1px = 0.22mm on 512px head scan)
      const pixelDist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const mmDist = (pixelDist * 0.22) / zoom;

      // Text label
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px monospace';
      const textX = (x1 + x2) / 2 + 10;
      const textY = (x1 + x2) / 2;
      ctx.fillText(`${mmDist.toFixed(1)} mm`, textX, (y1 + y2) / 2 - 5);
    }

    // ── DRAW CROSSHAIRS (WHEN MOUSE HOVERED) ──
    if (showMeasureTool && mousePos.x > 0 && mousePos.y > 0) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(width, mousePos.y);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

  }, [study, zoom, rotation, slice, windowMode, showAIOverlay, showMeasureTool, measuringPoints, mousePos, contrast, brightness]);

  // Mouse drag handlers for measurements
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showMeasureTool) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMeasuringPoints({ x1: x, y1: y, x2: x, y2: y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (isDrawing && measuringPoints) {
      setMeasuringPoints(prev => prev ? { ...prev, x2: x, y2: y } : null);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center bg-black border border-slate-900 rounded-2xl overflow-hidden p-2">
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          filter: `contrast(${contrast}%) brightness(${brightness}%)`,
          cursor: showMeasureTool ? 'crosshair' : 'grab',
          maxWidth: '100%',
          height: 'auto'
        }}
        className="rounded-xl shadow-2xl bg-black"
      />
    </div>
  );
};

const getInterpolatedCoords = (points: [number, number][], progress: number) => {
  const p = Math.max(0, Math.min(100, progress));
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { x: points[0][0], y: points[0][1] };
  
  const totalSegments = points.length - 1;
  const scaledProgress = (p / 100) * totalSegments;
  const segmentIndex = Math.min(totalSegments - 1, Math.floor(scaledProgress));
  const segmentProgress = scaledProgress - segmentIndex;
  
  const start = points[segmentIndex];
  const end = points[segmentIndex + 1];
  
  const x = start[0] + (end[0] - start[0]) * segmentProgress;
  const y = start[1] + (end[1] - start[1]) * segmentProgress;
  
  return { x, y };
};

export default function EmergencyCareDashboard({ isDarkMode, setIsDarkMode, onLogout }: EmergencyCareDashboardProps) {
  // 1. Sidebar Active Section State
  const [activeSection, setActiveSection] = useState<string>('command');
  
  // TanStack Query Hooks
  const { data: patientsData, isLoading: isPatientsLoading } = useRegistrations();
  const { data: ambulancesData } = useAmbulances();
  const { data: incidentsData } = useIncidents();
  const { data: traumaBays } = useTraumaBays();
  const { data: resourcesData } = useResources();

  // Mutations
  const registerPatientMutation = useRegisterPatient();
  const updatePatientStatusMutation = useUpdatePatientStatus();
  const confirmTriageMutation = useConfirmTriage();
  const recordVitalsMutation = useRecordVitals();
  const assignPatientToBayMutation = useAssignPatientToBay();
  const updateBayStatusMutation = useUpdateBayStatus();
  const createIncidentMutation = useCreateIncident();

  // Map to local types
  const patients = useMemo(() => {
    return patientsData ? patientsData.map(mapRegistrationToEmergencyPatient) : [];
  }, [patientsData]);

  const ambulances = useMemo(() => {
    return ambulancesData ? ambulancesData.map(mapAmbulanceToFleetAmbulance) : [];
  }, [ambulancesData]);

  const incidents = useMemo(() => {
    return incidentsData ? incidentsData.map(mapIncidentToIncidentReport) : [];
  }, [incidentsData]);

  const [bayVitals, setBayVitals] = useState<Record<number, { hr: number; spo2: number }>>({
    1: { hr: 124, spo2: 92 },
    2: { hr: 98, spo2: 96 },
    3: { hr: 135, spo2: 89 },
    4: { hr: 80, spo2: 98 },
    5: { hr: 80, spo2: 98 },
    6: { hr: 80, spo2: 98 }
  });

  const [bayStaffAssignments, setBayStaffAssignments] = useState<Record<number, { docName?: string; nurseName?: string }>>({
    1: { docName: 'Dr. Ramesh Patil', nurseName: 'Nurse Sneha Patil' },
    2: { docName: 'Dr. Anil Mehta', nurseName: 'Nurse Kavita R.' },
    3: { docName: 'Dr. Sunita Deshmukh', nurseName: 'Nurse Alok S.' },
    4: { docName: undefined, nurseName: undefined },
    5: { docName: undefined, nurseName: undefined },
    6: { docName: undefined, nurseName: undefined }
  });

  const mappedBays = useMemo(() => {
    if (!traumaBays) {
      return [
        { num: 1, status: 'OCCUPIED' as const, patient: 'Santosh Patil', age: '42M', condition: 'Polytrauma', hr: bayVitals[1]?.hr || 124, spo2: bayVitals[1]?.spo2 || 92, vent: 'ON', monitor: true, doc: bayStaffAssignments[1]?.docName || 'Dr. Ramesh Patil', nurse: bayStaffAssignments[1]?.nurseName || 'Nurse Sneha Patil' },
        { num: 2, status: 'OCCUPIED' as const, patient: 'Sunita Deshmukh', age: '58F', condition: 'Chest Pain / ACS', hr: bayVitals[2]?.hr || 98, spo2: bayVitals[2]?.spo2 || 96, vent: 'OFF', monitor: true, doc: bayStaffAssignments[2]?.docName || 'Dr. Anil Mehta', nurse: bayStaffAssignments[2]?.nurseName || 'Nurse Kavita R.' },
        { num: 3, status: 'OCCUPIED' as const, patient: 'Priya Singh', age: '30F', condition: 'Asthma Exacerbation', hr: bayVitals[3]?.hr || 135, spo2: bayVitals[3]?.spo2 || 89, vent: 'ON', monitor: true, doc: bayStaffAssignments[3]?.docName || 'Dr. Sunita Deshmukh', nurse: bayStaffAssignments[3]?.nurseName || 'Nurse Alok S.' },
        { num: 4, status: 'AVAILABLE' as const, vent: 'STANDBY', monitor: false, doc: bayStaffAssignments[4]?.docName || 'Unassigned', nurse: bayStaffAssignments[4]?.nurseName || 'Unassigned' },
        { num: 5, status: 'CLEANING' as const, timeRemaining: '6 mins', vent: 'OFF', monitor: false, doc: bayStaffAssignments[5]?.docName || 'Unassigned', nurse: bayStaffAssignments[5]?.nurseName || 'Unassigned' },
        { num: 6, status: 'MAINTENANCE' as const, vent: 'OFF', monitor: false, doc: bayStaffAssignments[6]?.docName || 'Unassigned', nurse: bayStaffAssignments[6]?.nurseName || 'Unassigned' }
      ];
    }
    
    return traumaBays.map(bay => {
      const assignment = bay.active_assignment;
      const patientName = assignment?.patient?.name || '';
      const ageGenderStr = assignment?.patient ? `${assignment.patient.age || ''}${assignment.patient.gender?.[0] || ''}` : '';
      const matchedReg = patients.find(p => p.id === assignment?.registration_id);
      const hr = bayVitals[bay.bay_number]?.hr || matchedReg?.vitals?.hr || 80;
      const spo2 = bayVitals[bay.bay_number]?.spo2 || matchedReg?.vitals?.spo2 || 98;
      
      return {
        id: bay.id,
        num: bay.bay_number,
        status: (bay.status === 'RESERVED' ? 'OCCUPIED' : bay.status) as any,
        patient: patientName,
        age: ageGenderStr,
        condition: matchedReg?.injuryMechanism || 'Critical Resus',
        hr,
        spo2,
        vent: bay.has_ventilator ? 'ON' : 'OFF',
        monitor: bay.has_monitor,
        doc: bayStaffAssignments[bay.bay_number]?.docName || assignment?.assigned_doctor || 'Unassigned',
        nurse: bayStaffAssignments[bay.bay_number]?.nurseName || assignment?.assigned_nurse || 'Unassigned'
      };
    });
  }, [traumaBays, patients, bayStaffAssignments, bayVitals]);

  const mappedResources = useMemo(() => {
    if (!resourcesData) {
      return [
        { name: 'O- Negative Blood', val: '12 Units', percent: 35, color: 'bg-rose-500' },
        { name: 'High-Flow Ventilators', val: '4 / 12 available', percent: 33, color: 'bg-[#0A5BFF]' }
      ];
    }
    return resourcesData.map(res => {
      const percent = Math.round((res.available / res.total) * 100);
      const color = res.id.includes('BLOOD') || res.available <= 5 ? 'bg-rose-500' : 'bg-[#0A5BFF]';
      const val = res.id.includes('BLOOD') ? `${res.available} Units` : `${res.available} / ${res.total} available`;
      return {
        name: res.name,
        val,
        percent,
        color
      };
    });
  }, [resourcesData]);


  // 3. Command Dashboard Specific States
  const [isDisasterMode, setIsDisasterMode] = useState<boolean>(false);
  const [disasterLevel, setDisasterLevel] = useState<'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'>('LEVEL_1');
  const [situationReport, setSituationReport] = useState<string>(
    'ALERT INDEX 7.8: High-velocity road collision on WEH. 2 RED patients en route to Sion Trauma. NGO responders on alert. Blood bank pre-ordering O Negative units.'
  );
  
  // Interactive Filters
  const [triageFilter, setTriageFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Detail Panel Popups
  const [selectedPatient, setSelectedPatient] = useState<PatientEmergency | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState<boolean>(false);
  
  // Quick Patient Form Input State
  const [newPatientInput, setNewPatientInput] = useState({
    name: '',
    age: '',
    gender: 'Male',
    abhaId: '',
    triageCategory: 'PENDING' as 'RED' | 'YELLOW' | 'GREEN' | 'BLACK' | 'PENDING',
    injuryMechanism: '',
    hr: '80',
    bp: '120/80',
    rr: '18',
    spo2: '98',
    temp: '98.6',
    gcs: '15',
    arrival_mode: 'UNKNOWN',
    arrivalSource: '',
    phone: '',
    blood_group: 'Unknown',
    relativeName: '',
    relativePhone: '',
    conscious: 'Yes',
    unknownPatient: false
  });

  // Triage Calculator Inputs
  const [triageInputs, setTriageInputs] = useState({
    gcsEye: 4,
    gcsVerbal: 5,
    gcsMotor: 6,
    rrRate: 18,
    sysBP: 120,
    heartRate: 80
  });

  // Telemedicine States
  const [telemedicineActive, setTelemedicineActive] = useState<boolean>(false);
  const [telemedicineConnected, setTelemedicineConnected] = useState<boolean>(false);
  
  // System Toast Alerts
  const [toast, setToast] = useState<{ message: string; description?: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);
  
  // Voice Command Scribing States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLogs, setVoiceLogs] = useState<string[]>([
    'System Initialized: Sion Emergency OS v4.8',
    'AI Scribe status: Standby. Ready for clinical dictation.'
  ]);
  const [currentSpeechTranscript, setCurrentSpeechTranscript] = useState<string>('');
  
  // Simulated tasks checklist
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Prepare O Negative blood transfer for Bay 1', done: false, priority: 'HIGH' },
    { id: 2, text: 'Confirm CT scan slot clearance for incoming RTA patient', done: false, priority: 'HIGH' },
    { id: 3, text: 'Verify ventilator check completion in Trauma Bay 4', done: true, priority: 'MEDIUM' },
    { id: 4, text: 'Send billing/discharge forms for Bed 12 (Discharge pending)', done: false, priority: 'LOW' }
  ]);

  // Ref for speech recognition
  const recognitionRef = useRef<any>(null);

  // PACS Viewer workstation states
  const [pacsZoom, setPacsZoom] = useState<number>(1);
  const [pacsRotation, setPacsRotation] = useState<number>(0);
  const [pacsContrast, setPacsContrast] = useState<number>(100);
  const [pacsBrightness, setPacsBrightness] = useState<number>(100);
  const [showAIOverlay, setShowAIOverlay] = useState<boolean>(true);
  const [showMeasureTool, setShowMeasureTool] = useState<boolean>(false);
  const [pacsSlice, setPacsSlice] = useState<number>(12);
  const [pacsWindowMode, setPacsWindowMode] = useState<'BRAIN' | 'BONE' | 'SUBDURAL' | 'LUNG'>('BRAIN');
  const [pacsReportText, setPacsReportText] = useState<string>('');
  const [pacsDictationActive, setPacsDictationActive] = useState<boolean>(false);
  const pacsSpeechRef = useRef<any>(null);
  const [pacsPIN, setPacsPIN] = useState<string>('');
  const [pacsSearch, setPacsSearch] = useState<string>('');
  const [pacsModalityFilter, setPacsModalityFilter] = useState<'ALL' | 'CT' | 'X-Ray'>('ALL');

  // LIMS Workstation State
  const [labPIN, setLabPIN] = useState<string>('');

  // Active sub-workspaces mock databases
  const [specimens, setSpecimens] = useState([
    { id: 'SPEC-801', patient: 'Santosh Patil', type: 'Whole Blood', status: 'TESTED', barcode: 'MCGM-EDTA-091', test: 'Complete Blood Count', time: '10:15 AM', result: 'Hb: 9.8 g/dL (Low)', delta: 'Down 2.4 g/dL', normal: '13-17 g/dL' },
    { id: 'SPEC-802', patient: 'Sunita Deshmukh', type: 'Serum', status: 'PROCESSING', barcode: 'MCGM-SST-092', test: 'Cardiac Troponin I', time: '10:30 AM', result: 'Awaiting Analyzer output', normal: '< 0.04 ng/mL' },
    { id: 'SPEC-803', patient: 'Priya Singh', type: 'Arterial Blood', status: 'RELEASED', barcode: 'MCGM-ABG-093', test: 'Arterial Blood Gas', time: '10:20 AM', result: 'pH: 7.28 (Acidosis), pCO2: 52 mmHg', normal: 'pH 7.35-7.45' }
  ]);

  const [radiologyStudies, setRadiologyStudies] = useState([
    { id: 'RAD-901', patient: 'Santosh Patil', modality: 'CT', test: 'CT Head (NCCT) - Trauma Protocol', priority: 'EMERGENCY', status: 'AI_PROCESSED', finding: 'Acute subdural hematoma on left hemisphere measuring 12mm thick.', confidence: 94 },
    { id: 'RAD-902', patient: 'Sunita Deshmukh', modality: 'CT', test: 'CT Chest (Angiography) - PE Protocol', priority: 'EMERGENCY', status: 'ACQUIRING', finding: 'Awaiting image acquisition.', confidence: 0 },
    { id: 'RAD-903', patient: 'Priya Singh', modality: 'X-Ray', test: 'Chest X-Ray PA View', priority: 'URGENT', status: 'RELEASED', finding: 'Hyperinflation of lung fields, flattened diaphragms. No pneumothorax.', confidence: 91 }
  ]);

  const [activeRadStudy, setActiveRadStudy] = useState(radiologyStudies[0]);
  const [activeSpecimen, setActiveSpecimen] = useState(specimens[0]);

  // Sync PACS report draft text when active study changes
  useEffect(() => {
    if (activeRadStudy) {
      setPacsReportText(activeRadStudy.finding || '');
      setPacsSlice(activeRadStudy.modality === 'CT' ? 12 : 1);
      setPacsWindowMode(activeRadStudy.modality === 'CT' ? 'BRAIN' : 'LUNG');
    }
  }, [activeRadStudy]);

  // Copilot interactive states
  const [copilotInput, setCopilotInput] = useState<string>('');
  const [copilotChat, setCopilotChat] = useState([
    { sender: 'AI', text: 'Good morning. I am your Sion Emergency Copilot. Ask for summaries of active trauma cases, verify blood bank reserve stocks, or issue paging orders.' }
  ]);

  // On-duty rosters as state variables
  const [doctorsDuty, setDoctorsDuty] = useState([
    { id: 'doc-1', name: 'Dr. Ramesh Patil', role: 'ER Chief / Trauma Lead', contact: '+91 98200 11223', status: 'ACTIVE IN BAY 1', bay: 1, workload: 'High', telemetry: { hr: 78, loc: 'Resus Bay 1' }, shift: '08:00 - 20:00', pagerActive: false },
    { id: 'doc-2', name: 'Dr. Sunita Deshmukh', role: 'Critical Care Specialist', contact: '+91 98211 44556', status: 'ACTIVE IN BAY 3', bay: 3, workload: 'Medium', telemetry: { hr: 82, loc: 'Resus Bay 3' }, shift: '08:00 - 20:00', pagerActive: false },
    { id: 'doc-3', name: 'Dr. Anil Mehta', role: 'ER Senior Resident', contact: '+91 98333 77889', status: 'ACTIVE IN BAY 2', bay: 2, workload: 'High', telemetry: { hr: 90, loc: 'Resus Bay 2' }, shift: '08:00 - 20:00', pagerActive: false },
    { id: 'doc-4', name: 'Dr. Rohan Kamble', role: 'Trauma Surgeon (On-Call)', contact: '+91 98222 99001', status: 'STANDBY - IN OT', bay: null, workload: 'Low', telemetry: { hr: 72, loc: 'Main OT Suite' }, shift: 'On-Call 24h', pagerActive: false },
    { id: 'doc-5', name: 'Dr. Priya Shah', role: 'Toxicology Expert', contact: '+91 98222 11002', status: 'STANDBY - LIMS', bay: null, workload: 'Low', telemetry: { hr: 74, loc: 'Tox Lab' }, shift: '10:00 - 18:00', pagerActive: false }
  ]);

  const [nursesDuty, setNursesDuty] = useState([
    { id: 'nurse-1', name: 'Nurse Sneha Patil', role: 'Lead Resus Nurse', contact: '+91 99100 12345', status: 'ACTIVE IN BAY 1', bay: 1, workload: 'High', telemetry: { hr: 84, loc: 'Resus Bay 1' }, shift: '07:00 - 19:00', pagerActive: false },
    { id: 'nurse-2', name: 'Nurse Kavita R.', role: 'Trauma Nurse', contact: '+91 99200 23456', status: 'ACTIVE IN BAY 2', bay: 2, workload: 'Medium', telemetry: { hr: 80, loc: 'Resus Bay 2' }, shift: '07:00 - 19:00', pagerActive: false },
    { id: 'nurse-3', name: 'Nurse Alok S.', role: 'Triage Desk Nurse', contact: '+91 99300 34567', status: 'ACTIVE IN BAY 3', bay: 3, workload: 'High', telemetry: { hr: 88, loc: 'Triage Desk' }, shift: '07:00 - 19:00', pagerActive: false },
    { id: 'nurse-4', name: 'Nurse Pratik S.', role: 'Auxiliary Float Nurse', contact: '+91 99400 45678', status: 'STANDBY - RECEPTION', bay: null, workload: 'Low', telemetry: { hr: 75, loc: 'Intake Desk' }, shift: '07:00 - 19:00', pagerActive: false },
    { id: 'nurse-5', name: 'Nurse Sandeep K.', role: 'ICU Float Nurse', contact: '+91 99400 55679', status: 'STANDBY - ICU', bay: null, workload: 'Low', telemetry: { hr: 76, loc: 'ICU Transit' }, shift: '19:00 - 07:00', pagerActive: false }
  ]);

  const [draggedStaff, setDraggedStaff] = useState<{ type: 'doctor' | 'nurse'; id: string } | null>(null);
  const [pagerActiveState, setPagerActiveState] = useState<Record<string, boolean>>({});

  const handleAssignStaffToBay = (staffId: string, staffType: 'doctor' | 'nurse', bayNum: number) => {
    let staffName = '';
    if (staffType === 'doctor') {
      const doc = doctorsDuty.find(d => d.id === staffId);
      if (doc) {
        staffName = doc.name;
        setDoctorsDuty(prev => prev.map(d => d.id === staffId ? {
          ...d,
          status: `ACTIVE IN BAY ${bayNum}`,
          bay: bayNum,
          workload: 'High',
          telemetry: { ...d.telemetry, loc: `Resus Bay ${bayNum}` }
        } : d));
      }
    } else {
      const nurse = nursesDuty.find(n => n.id === staffId);
      if (nurse) {
        staffName = nurse.name;
        setNursesDuty(prev => prev.map(n => n.id === staffId ? {
          ...n,
          status: `ACTIVE IN BAY ${bayNum}`,
          bay: bayNum,
          workload: 'High',
          telemetry: { ...n.telemetry, loc: `Resus Bay ${bayNum}` }
        } : n));
      }
    }

    if (staffName) {
      setBayStaffAssignments(prev => ({
        ...prev,
        [bayNum]: {
          ...prev[bayNum],
          [staffType === 'doctor' ? 'docName' : 'nurseName']: staffName
        }
      }));
      
      triggerToast(
        'Staff Assigned',
        `${staffName} has been assigned to Trauma Bay ${bayNum}. Live tracking updated.`,
        'success'
      );
    }
  };

  // Configurable thresholds for alert triggers
  const [settingsThresholds, setSettingsThresholds] = useState({
    spo2Critical: 90,
    hrCriticalHigh: 120,
    hrCriticalLow: 50,
    rrCritical: 28,
    gcsThreshold: 10
  });

  const [simulationEnabled, setSimulationEnabled] = useState(true);
  const [soundAlarms, setSoundAlarms] = useState(false);
  const [autoRouteBays, setAutoRouteBays] = useState(false);
  const [hospitalLocation, setHospitalLocation] = useState('Sion General Hospital (MCGM)');

  // Blood Bank dynamic states
  const [bloodStocks, setBloodStocks] = useState([
    { type: 'O Negative', qty: 12, alert: 'Pre-ordered 6 units', percent: 35, color: 'bg-rose-500' },
    { type: 'O Positive', qty: 24, alert: 'Normal reserves', percent: 80, color: 'bg-emerald-500' },
    { type: 'A Positive', qty: 18, alert: 'Normal reserves', percent: 60, color: 'bg-emerald-500' },
    { type: 'B Positive', qty: 14, alert: 'Low reserve warning', percent: 45, color: 'bg-amber-500' }
  ]);

  const [bloodRequests, setBloodRequests] = useState<Array<{
    id: string;
    patientName: string;
    bayNum: number;
    bloodType: string;
    units: number;
    status: 'RECEIVING' | 'CROSS_MATCHING' | 'DISPATCHED' | 'DELIVERED';
    urgency: 'STAT' | 'URGENT' | 'ROUTINE';
    timestamp: string;
  }>>([
    { id: 'req-1', patientName: 'Santosh Patil', bayNum: 1, bloodType: 'O Negative', units: 2, status: 'DISPATCHED', urgency: 'STAT', timestamp: '18:45' },
    { id: 'req-2', patientName: 'Sunita Deshmukh', bayNum: 2, bloodType: 'A Positive', units: 1, status: 'DELIVERED', urgency: 'URGENT', timestamp: '18:50' }
  ]);

  // Pharmacy Cart dynamic states
  const [medStocks, setMedStocks] = useState([
    { id: 'epi', name: 'Epinephrine 1mg/mL ampoules', qty: 48, max: 50, status: 'IN STOCK' },
    { id: 'norepi', name: 'Norepinephrine 4mg/4mL ampoules', qty: 32, max: 40, status: 'IN STOCK' },
    { id: 'amio', name: 'Amiodarone 150mg ampoules', qty: 12, max: 20, status: 'LOW RESERVES' },
    { id: 'txa', name: 'Tranexamic Acid (TXA) 1g/10mL', qty: 22, max: 30, status: 'IN STOCK' },
    { id: 'prop', name: 'Propofol 200mg/20mL vial', qty: 15, max: 15, status: 'IN STOCK' },
    { id: 'succ', name: 'Succinylcholine 200mg/10mL vial', qty: 8, max: 10, status: 'IN STOCK' }
  ]);

  const [medLogs, setMedLogs] = useState<Array<{
    timestamp: string;
    bayNum: number;
    medName: string;
    dosage: string;
    adminBy: string;
  }>>([
    { timestamp: '18:32', bayNum: 1, medName: 'Epinephrine 1mg/mL ampoules', dosage: '1mg IV', adminBy: 'Nurse Sneha Patil' },
    { timestamp: '18:40', bayNum: 2, medName: 'Tranexamic Acid (TXA)', dosage: '1g IV over 10m', adminBy: 'Nurse Kavita R.' }
  ]);

  // Blood Bank Form states
  const [bloodFormType, setBloodFormType] = useState('O Negative');
  const [bloodFormBay, setBloodFormBay] = useState(1);
  const [bloodFormUnits, setBloodFormUnits] = useState(1);
  const [bloodFormUrgency, setBloodFormUrgency] = useState<'STAT' | 'URGENT' | 'ROUTINE'>('STAT');
  const [bloodFormPIN, setBloodFormPIN] = useState('');

  // Pharmacy Form states
  const [medFormBay, setMedFormBay] = useState(1);
  const [medFormMed, setMedFormMed] = useState('epi');
  const [medFormDosage, setMedFormDosage] = useState('1mg IV');
  const [medFormClinician, setMedFormClinician] = useState('Nurse Sneha Patil');

  // Emergency Registration Workspace States
  const [registrationSubView, setRegistrationSubView] = useState<'home' | 'voice' | 'manual' | 'post-register'>('home');
  const [ocrScanning, setOcrScanning] = useState<boolean>(false);
  const [ocrCardImage, setOcrCardImage] = useState<string | null>(null);
  const [fingerprintScanning, setFingerprintScanning] = useState<boolean>(false);
  const [fingerprintCaptured, setFingerprintCaptured] = useState<boolean>(false);
  const [photoTaken, setPhotoTaken] = useState<boolean>(false);
  const [goldenHourTime, setGoldenHourTime] = useState<number>(3600); // 60 minutes
  const [recentRegisteredPatient, setRecentRegisteredPatient] = useState<any>(null);
  const [lastGeneratedUHID, setLastGeneratedUHID] = useState<string>('');
  const [lastGeneratedCaseNo, setLastGeneratedCaseNo] = useState<string>('');
  const [voiceInputTranscript, setVoiceInputTranscript] = useState<string>('');
  const [voiceInputStatus, setVoiceInputStatus] = useState<'IDLE' | 'LISTENING' | 'PARSING' | 'COMPLETED'>('IDLE');
  const regSpeechRef = useRef<any>(null);

  // States for Incoming Patient workspace
  const [activeAmbulanceId, setActiveAmbulanceId] = useState<string | null>('AMB-MCGM-03');
  const [activeTraumaCode, setActiveTraumaCode] = useState<{ ambulanceId: string; type: 'RED' | 'BLUE' } | null>(null);
  const [mapSimulationProgress, setMapSimulationProgress] = useState<number>(30);


  // ── NLU Parser: extract patient fields from free-form transcript ──
  const parseVoiceTranscript = (raw: string) => {
    const t = raw.toLowerCase().replace(/[.,!?]/g, '');
    const words = t.split(/\s+/);
    const parsed: Record<string, string> = {};

    // ── Gender ──
    if (/\b(female|woman|lady|girl|mahila|aurat|stree)\b/.test(t)) parsed.gender = 'Female';
    else if (/\b(male|man|boy|aadmi|purush)\b/.test(t)) parsed.gender = 'Male';

    // ── Age ──
    const ageWordMap: Record<string, number> = {
      ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
      sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
      'twenty-five': 25, thirty: 30, 'thirty-five': 35, forty: 40,
      'forty-five': 45, fifty: 50, 'fifty-five': 55, sixty: 60,
      'sixty-five': 65, seventy: 70, 'seventy-five': 75, eighty: 80,
    };
    const ageNumMatch = t.match(/(?:age[d]?\s*|aged?\s+)(\d{1,3})/);
    if (ageNumMatch) parsed.age = ageNumMatch[1];
    else {
      for (const [word, num] of Object.entries(ageWordMap)) {
        if (t.includes(word)) { parsed.age = String(num); break; }
      }
    }
    if (!parsed.age) {
      const digitMatch = t.match(/\b(\d{1,2})\s*(?:year|sal|saal|yr)/);
      if (digitMatch) parsed.age = digitMatch[1];
    }

    // ── Arrival mode ──
    if (/\b(ambulance|108|102)\b/.test(t)) parsed.arrival_mode = 'AMBULANCE';
    else if (/\b(police|pcr|thana|constable)\b/.test(t)) parsed.arrival_mode = 'POLICE';
    else if (/\b(private|car|auto|rickshaw|taxi|uber|ola)\b/.test(t)) parsed.arrival_mode = 'PRIVATE';
    else if (/\b(walk[\s-]*in|walking|walked)\b/.test(t)) parsed.arrival_mode = 'WALK_IN';

    // ── Triage ──
    if (/\b(critical|red\s*(?:triage|category)?|immediate|life.?threatening|coding|cardiac arrest|unresponsive|unconscious|comatose|hemorrhage|polytrauma|drowning|severe)\b/.test(t)) parsed.triageCategory = 'RED';
    else if (/\b(urgent|yellow|serious)\b/.test(t)) parsed.triageCategory = 'YELLOW';
    else if (/\b(minor|green|non.?urgent|stable)\b/.test(t)) parsed.triageCategory = 'GREEN';

    // ── Consciousness / GCS ──
    if (/\b(unconscious|unresponsive|comatose|not\s+responding)\b/.test(t)) { parsed.conscious = 'No'; parsed.gcs = '6'; }
    else if (/\b(semi.?conscious|drowsy|altered)\b/.test(t)) { parsed.conscious = 'Yes'; parsed.gcs = '10'; }
    const gcsMatch = t.match(/gcs\s*(\d{1,2})/);
    if (gcsMatch) parsed.gcs = gcsMatch[1];

    // ── Unknown patient ──
    if (/\b(unknown|unidentified|no\s*id|no\s*identification)\b/.test(t)) {
      parsed.unknownPatient = 'true';
      if (!parsed.gender) parsed.gender = 'Male';
      parsed.name = `Unknown ${parsed.gender === 'Female' ? 'Female' : 'Male'} ${Math.floor(100 + Math.random() * 900)}`;
    }

    // ── Injury / Chief complaint ──
    const injuryPatterns: [RegExp, string][] = [
      [/\b(road\s*(traffic)?\s*accident|rta|collision|hit\s*by\s*vehicle)\b/, 'Road Traffic Accident (RTA)'],
      [/\b(fall|fell|fallen|slip)\b/, 'Accidental fall / trauma'],
      [/\b(burn|scald|fire)\b/, 'Burn injury'],
      [/\b(stab|stabbing|knife|sharp\s*injury)\b/, 'Penetrating stab wound'],
      [/\b(chest\s*pain|heart\s*attack|cardiac|mi|stemi|angina)\b/, 'Acute chest pain / Suspected MI'],
      [/\b(breathing|dyspnea|asthma|respiratory|choking)\b/, 'Respiratory distress'],
      [/\b(poison|overdose|ingestion|toxic)\b/, 'Poisoning / Toxic ingestion'],
      [/\b(snake\s*bite|dog\s*bite|animal\s*bite|bite)\b/, 'Animal / Snake bite'],
      [/\b(drowning|submersion)\b/, 'Near drowning'],
      [/\b(seizure|convulsion|fits|epilepsy)\b/, 'Seizure / Convulsions'],
      [/\b(assault|beaten|attack|fight)\b/, 'Assault / Physical trauma'],
      [/\b(fracture|broken\s*bone|dislocation)\b/, 'Fracture / Dislocation'],
      [/\b(bleeding|hemorrhage|haemorrhage)\b/, 'Active hemorrhage'],
      [/\b(head\s*injury|skull|concussion|brain)\b/, 'Head injury / TBI'],
      [/\b(polytrauma|multiple\s*injuries|severe\s*trauma)\b/, 'Severe polytrauma'],
      [/\b(stroke|paralysis|hemiplegia|weakness)\b/, 'Suspected stroke / CVA'],
      [/\b(pregnancy|labour|labor|delivery|obstetric)\b/, 'Obstetric emergency'],
    ];
    for (const [pattern, desc] of injuryPatterns) {
      if (pattern.test(t)) { parsed.injuryMechanism = desc; break; }
    }
    if (!parsed.injuryMechanism && t.length > 20) {
      parsed.injuryMechanism = raw.replace(/^(register|emergency|patient)\s*/i, '').trim();
    }

    // ── Name extraction ──
    if (!parsed.name) {
      const namePatterns = [
        /(?:patient|naam|name)\s+(?:is\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
        /(?:register|admit)\s+(?:patient\s+|emergency\s+patient\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
      ];
      for (const pat of namePatterns) {
        const m = raw.match(pat);
        if (m) {
          const candidate = m[1].trim();
          const stopWords = ['male','female','aged','age','year','old','brought','by','unknown','from','with','suffering','complaining','road','accident','ambulance','police','private','walk','in','unconscious','conscious','chest','pain','breathing','critical','urgent','minor','emergency','patient','register','admit'];
          const cleaned = candidate.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase())).join(' ');
          if (cleaned.length >= 2) { parsed.name = cleaned; break; }
        }
      }
    }

    return parsed;
  };

  // ── Start / Stop real speech recognition for registration ──
  const startRegistrationVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      triggerToast('Not Supported', 'Speech recognition requires Chrome or Edge browser.', 'error');
      return;
    }
    if (regSpeechRef.current) { try { regSpeechRef.current.stop(); } catch (_) {} }

    const recognizer = new SR();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = 'en-IN';
    recognizer.maxAlternatives = 1;

    let fullTranscript = '';

    recognizer.onstart = () => { setVoiceInputStatus('LISTENING'); };

    recognizer.onresult = (event: any) => {
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          fullTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setVoiceInputTranscript(fullTranscript.trim() + (interim ? ' ' + interim : ''));
    };

    recognizer.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        triggerToast('Mic Denied', 'Allow microphone access in browser settings.', 'error');
        setVoiceInputStatus('IDLE');
      }
    };

    recognizer.onend = () => {
      // If still LISTENING (not manually stopped), auto-trigger parse
      if (fullTranscript.trim().length > 5) {
        setVoiceInputTranscript(fullTranscript.trim());
        finishVoiceParsing(fullTranscript.trim());
      }
    };

    regSpeechRef.current = recognizer;
    setVoiceInputTranscript('');
    setVoiceInputStatus('LISTENING');
    recognizer.start();
  };

  const stopRegistrationVoice = () => {
    if (regSpeechRef.current) {
      try { regSpeechRef.current.stop(); } catch (_) {}
      regSpeechRef.current = null;
    }
    if (voiceInputTranscript.trim().length > 5) {
      finishVoiceParsing(voiceInputTranscript.trim());
    } else {
      setVoiceInputStatus('IDLE');
    }
  };

  const finishVoiceParsing = (transcript: string) => {
    setVoiceInputStatus('PARSING');
    // Small delay to show parsing animation
    setTimeout(() => {
      const parsed = parseVoiceTranscript(transcript);
      setNewPatientInput(prev => ({
        ...prev,
        ...(parsed.name && { name: parsed.name }),
        ...(parsed.age && { age: parsed.age }),
        ...(parsed.gender && { gender: parsed.gender }),
        ...(parsed.arrival_mode && { arrival_mode: parsed.arrival_mode }),
        ...(parsed.injuryMechanism && { injuryMechanism: parsed.injuryMechanism }),
        ...(parsed.triageCategory && { triageCategory: parsed.triageCategory as any }),
        ...(parsed.conscious && { conscious: parsed.conscious }),
        ...(parsed.gcs && { gcs: parsed.gcs }),
        ...(parsed.unknownPatient === 'true' && { unknownPatient: true }),
      }));
      setVoiceInputStatus('COMPLETED');
      triggerToast('Speech Parsed', 'AI extracted patient parameters from your voice input.', 'success');
    }, 1200);
  };

  // Toggle voice dictation for PACS report
  const togglePacsDictation = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      triggerToast('Not Supported', 'Speech recognition requires Chrome or Edge browser.', 'error');
      return;
    }

    if (pacsDictationActive) {
      if (pacsSpeechRef.current) {
        try {
          pacsSpeechRef.current.stop();
        } catch (_) {}
      }
      setPacsDictationActive(false);
      triggerToast('Dictation Stopped', 'Recording saved to EMR draft.', 'info');
    } else {
      const recognizer = new SR();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-IN';
      
      recognizer.onstart = () => {
        setPacsDictationActive(true);
        triggerToast('Dictation Active', 'Recording clinical impression...', 'success');
      };

      recognizer.onresult = (event: any) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTrans) {
          setPacsReportText(prev => prev + (prev ? ' ' : '') + finalTrans.trim());
        }
      };

      recognizer.onerror = (e: any) => {
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          triggerToast('Mic Denied', 'Allow microphone access in settings.', 'error');
        }
        setPacsDictationActive(false);
      };

      recognizer.onend = () => {
        setPacsDictationActive(false);
      };

      pacsSpeechRef.current = recognizer;
      recognizer.start();
    }
  };

  // Event Listener for Emergency Section & Voice Commands
  // Map simulation progress ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setMapSimulationProgress(prev => {
        if (prev >= 95) return 10;
        return prev + 0.5;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Telemetry fluctuation drift (flashes heartrate and drifts vitals if simulation is enabled)
  useEffect(() => {
    if (!simulationEnabled) return;
    const timer = setInterval(() => {
      // Fluctuate doctor HR
      setDoctorsDuty(prev => prev.map(d => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return {
          ...d,
          telemetry: { ...d.telemetry, hr: Math.max(65, Math.min(105, d.telemetry.hr + delta)) }
        };
      }));

      // Fluctuate nurse HR
      setNursesDuty(prev => prev.map(n => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return {
          ...n,
          telemetry: { ...n.telemetry, hr: Math.max(65, Math.min(105, n.telemetry.hr + delta)) }
        };
      }));

      // Fluctuate bay patient vitals
      setBayVitals(prev => {
        const updated = { ...prev };
        for (const num of [1, 2, 3]) {
          const v = updated[num];
          if (v) {
            const hrDelta = Math.floor(Math.random() * 5) - 2;
            const spo2Delta = Math.floor(Math.random() * 3) - 1;
            updated[num] = {
              hr: Math.max(55, Math.min(150, v.hr + hrDelta)),
              spo2: Math.max(82, Math.min(100, v.spo2 + spo2Delta))
            };
          }
        }
        return updated;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [simulationEnabled]);

  // Blood Bank Request progress ticker (advances dispatches periodically)
  useEffect(() => {
    const timer = setInterval(() => {
      setBloodRequests(prev => {
        let changed = false;
        const next = prev.map(req => {
          if (req.status === 'DELIVERED') return req;
          const nextStatusMap: Record<string, 'RECEIVING' | 'CROSS_MATCHING' | 'DISPATCHED' | 'DELIVERED'> = {
            'RECEIVING': 'CROSS_MATCHING',
            'CROSS_MATCHING': 'DISPATCHED',
            'DISPATCHED': 'DELIVERED'
          };
          const nextStatus = nextStatusMap[req.status];
          if (nextStatus) {
            changed = true;
            if (nextStatus === 'DELIVERED') {
              triggerToast('Blood Delivered', `${req.units} units of ${req.bloodType} delivered to Trauma Bay ${req.bayNum}.`, 'success');
            }
            return { ...req, status: nextStatus };
          }
          return req;
        });
        return changed ? next : prev;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleSectionChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'registration') {
        setActiveSection('registration');
        setRegistrationSubView('home');
      }
    };

    window.addEventListener('mcgm-emergency-section-change', handleSectionChange);
    return () => {
      window.removeEventListener('mcgm-emergency-section-change', handleSectionChange);
    };
  }, []);

  useEffect(() => {
    const handleVoiceCommand = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { action } = customEvent.detail || {};
      
      if (activeSection !== 'registration') {
        setActiveSection('registration');
      }

      if (action === 'UNKNOWN_MALE') {
        setRegistrationSubView('manual');
        setNewPatientInput(prev => ({
          ...prev,
          name: 'Unknown Male ' + Math.floor(100 + Math.random() * 900),
          gender: 'Male',
          age: '40',
          unknownPatient: true,
          injuryMechanism: 'Brought by emergency responders. Patient unconscious, no identification found.',
        }));
        triggerToast('Voice Command Received', 'Profile set to Unknown Male.', 'info');
      } else if (action === 'ROAD_ACCIDENT') {
        setNewPatientInput(prev => ({
          ...prev,
          injuryMechanism: 'Road Traffic Accident (RTA) / High-velocity impact.',
        }));
        triggerToast('Voice Command Received', 'Chief complaint set to Road Traffic Accident.', 'info');
      } else if (action === 'PRIVATE_VEHICLE') {
        setNewPatientInput(prev => ({
          ...prev,
          arrival_mode: 'PRIVATE',
        }));
        triggerToast('Voice Command Received', 'Arrival mode set to Private Vehicle.', 'info');
      } else if (action === 'GENERATE_UHID') {
        const tempUhid = `TEMP-UHID-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        setNewPatientInput(prev => ({
          ...prev,
          abhaId: tempUhid,
        }));
        triggerToast('UHID Generated', `Temporary ID: ${tempUhid}`, 'success');
      } else if (action === 'PRINT_WRISTBAND') {
        triggerToast('Wristband Printed', 'Barcode & QR Wristband sent to ER Desk Printer.', 'success');
      } else if (action === 'COMPLETE_REGISTRATION') {
        triggerToast('Registration Completing', 'Submitting patient intake...', 'info');
        const formSubmit = document.getElementById('emergency-registration-submit-btn');
        if (formSubmit) {
          formSubmit.click();
        } else {
          // Fallback direct execution
          handleEmergencyRegister();
        }
      }
    };

    window.addEventListener('mcgm-registration-voice-command', handleVoiceCommand);
    return () => {
      window.removeEventListener('mcgm-registration-voice-command', handleVoiceCommand);
    };
  }, [activeSection]);

  // Golden Hour countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGoldenHourTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatGoldenHour = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmergencyRegister = async (overrideData?: any) => {
    const name = overrideData?.name || newPatientInput.name || 'Unknown Patient';
    const age = overrideData?.age ? Number(overrideData.age) : (Number(newPatientInput.age) || 30);
    const gender = overrideData?.gender || newPatientInput.gender;
    const abhaId = overrideData?.abhaId || newPatientInput.abhaId || `TEMP-UHID-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const arrivalMode = overrideData?.arrivalMode || newPatientInput.arrival_mode || 'UNKNOWN';
    const chiefComplaint = overrideData?.chiefComplaint || newPatientInput.injuryMechanism || 'Unknown trauma/injury at intake.';
    const triageCat = overrideData?.triageCategory || newPatientInput.triageCategory || 'PENDING';
    const hr = Number(newPatientInput.hr) || 80;
    const bp = newPatientInput.bp || '120/80';
    const rr = Number(newPatientInput.rr) || 18;
    const spo2 = Number(newPatientInput.spo2) || 98;
    const temp = Number(newPatientInput.temp) || 98.6;

    try {
      const result = await registerPatientMutation.mutateAsync({
        name,
        age,
        gender: gender as any,
        abha_id: abhaId,
        arrival_mode: arrivalMode,
        chief_complaint: chiefComplaint,
        injury_mechanism: chiefComplaint,
        hr,
        bp,
        rr,
        spo2,
        temperature: temp,
        triage_category: triageCat as any
      });

      setRecentRegisteredPatient(result);
      setLastGeneratedUHID(abhaId);
      setLastGeneratedCaseNo(result.registration_no || `ER-2026-${Math.floor(800000 + Math.random() * 100000)}`);
      setRegistrationSubView('post-register');
      setGoldenHourTime(3600); // Start 60:00 golden hour clock
      
      triggerToast('Emergency Patient Intake Created', `${name} successfully registered. Golden Hour timer active.`, 'success');
      
      // Reset Form State
      setNewPatientInput({
        name: '',
        age: '',
        gender: 'Male',
        abhaId: '',
        triageCategory: 'PENDING' as 'RED' | 'YELLOW' | 'GREEN' | 'BLACK' | 'PENDING',
        injuryMechanism: '',
        hr: '80',
        bp: '120/80',
        rr: '18',
        spo2: '98',
        temp: '98.6',
        gcs: '15',
        arrival_mode: 'UNKNOWN',
        arrivalSource: '',
        phone: '',
        blood_group: 'Unknown',
        relativeName: '',
        relativePhone: '',
        conscious: 'Yes',
        unknownPatient: false
      });
      setPhotoTaken(false);
      setFingerprintCaptured(false);
      setOcrCardImage(null);
    } catch (err) {
      console.error(err);
      triggerToast('Registration Failed', 'Database update error.', 'error');
    }
  };

  // Helper trigger for toast alerts
  const triggerToast = (message: string, description?: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToast({ message, description, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Computed Clinical Score Calculations (GCS / RTS)
  const calculatedGCS = useMemo(() => {
    return triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor;
  }, [triageInputs]);

  const calculatedRTS = useMemo(() => {
    let gcsPoints = 4;
    if (calculatedGCS <= 3) gcsPoints = 0;
    else if (calculatedGCS <= 5) gcsPoints = 1;
    else if (calculatedGCS <= 8) gcsPoints = 2;
    else if (calculatedGCS <= 12) gcsPoints = 3;

    let rrPoints = 4;
    if (triageInputs.rrRate < 1) rrPoints = 0;
    else if (triageInputs.rrRate <= 5) rrPoints = 1;
    else if (triageInputs.rrRate <= 9) rrPoints = 2;
    else if (triageInputs.rrRate > 29) rrPoints = 3;

    let bpPoints = 4;
    if (triageInputs.sysBP < 1) bpPoints = 0;
    else if (triageInputs.sysBP <= 49) bpPoints = 1;
    else if (triageInputs.sysBP <= 75) bpPoints = 2;
    else if (triageInputs.sysBP <= 89) bpPoints = 3;

    const rts = 0.9368 * gcsPoints + 0.7326 * bpPoints + 0.2908 * rrPoints;
    return Number(rts.toFixed(2));
  }, [calculatedGCS, triageInputs]);

  // Voice Recognition Implementation
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('Speech Engine Offline', 'Browser does not support Speech Recognition APIs.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setCurrentSpeechTranscript('Listening...');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setCurrentSpeechTranscript(text);
        processVoiceCommand(text);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech error', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Voice Command Router
  const processVoiceCommand = (command: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setVoiceLogs(prev => [`Doctor: "${command}" [${timestamp}]`, ...prev]);

    if (command.includes('triage') || command.includes('show triage')) {
      setActiveSection('triage');
      triggerToast('Voice Intent Matched', 'Navigating to AI Triage Board.', 'success');
    } else if (command.includes('command') || command.includes('dashboard') || command.includes('os')) {
      setActiveSection('command');
      triggerToast('Voice Intent Matched', 'Navigating to consolidated Emergency Command.', 'success');
    } else if (command.includes('declare mci') || command.includes('declare disaster') || command.includes('mass casualty')) {
      setIsDisasterMode(true);
      triggerToast('MCI Declared via Voice', 'Mass casualty alert broadcasted.', 'warning');
    } else if (command.includes('cancel mci') || command.includes('normal mode') || command.includes('clear disaster')) {
      setIsDisasterMode(false);
      triggerToast('MCI Cancelled via Voice', 'Returned to standard operating index.', 'success');
    } else if (command.includes('digital twin') || command.includes('map') || command.includes('floor')) {
      setActiveSection('digital_twin');
      triggerToast('Voice Intent Matched', 'Displaying Digital Twin floor layout.', 'success');
    } else if (command.includes('call code blue') || command.includes('code blue')) {
      triggerToast('CODE BLUE ACTIVATED', 'Trauma team and resus carts paged immediately to Bay 1.', 'error');
      setVoiceLogs(prev => ['SYSTEM: CODE BLUE BROADCAST INITIATED!', ...prev]);
    } else if (command.includes('summarize patient') || command.includes('details')) {
      setSelectedPatient(patients[0]);
      triggerToast('Voice AI Clinical Summary', 'Displaying clinical synopsis for Santosh Patil.', 'info');
    } else if (command.includes('laboratory') || command.includes('lab')) {
      setActiveSection('laboratory');
      triggerToast('Voice Intent Matched', 'Navigating to Laboratory Desk.', 'success');
    } else if (command.includes('radiology') || command.includes('x-ray') || command.includes('ct')) {
      setActiveSection('radiology');
      triggerToast('Voice Intent Matched', 'Navigating to Radiology Workstation.', 'success');
    } else {
      triggerToast('Voice command logged', `Query: "${command}" parsed by copilot context.`, 'info');
    }
  };

  // Event Handlers
  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIncidentMutation.mutateAsync({
        title: newPatientInput.name || 'Emergency Incident Call',
        location: newPatientInput.injuryMechanism || 'Sion Hospital Catchment',
        severity: 'CRITICAL',
        victims_count: 5,
        type: 'ROAD_ACCIDENT'
      });
      triggerToast('Emergency Incident Logged', 'Incident routed to AI dispatch dispatcher.', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Incident Log Failed', 'Database update error.', 'error');
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientInput.name) return;

    try {
      await registerPatientMutation.mutateAsync({
        name: newPatientInput.name,
        age: Number(newPatientInput.age) || 30,
        gender: newPatientInput.gender as any,
        abha_id: newPatientInput.abhaId || undefined,
        arrival_mode: 'SELF',
        chief_complaint: newPatientInput.injuryMechanism || 'Unknown trauma/ailment at intake.',
        injury_mechanism: newPatientInput.injuryMechanism || 'Unknown trauma/ailment at intake.',
        hr: Number(newPatientInput.hr) || 80,
        bp: newPatientInput.bp || '120/80',
        rr: Number(newPatientInput.rr) || 18,
        spo2: Number(newPatientInput.spo2) || 98,
        temperature: Number(newPatientInput.temp) || 98.6,
        triage_category: 'PENDING'
      });
      setShowNewPatientModal(false);
      triggerToast('Patient Intake Registered', `${newPatientInput.name} registered. Routed to Triage board.`, 'success');
      
      // Clear Form
      setNewPatientInput({
        name: '',
        age: '',
        gender: 'Male',
        abhaId: '',
        triageCategory: 'PENDING',
        injuryMechanism: '',
        hr: '80',
        bp: '120/80',
        rr: '18',
        spo2: '98',
        temp: '98.6',
        gcs: '15',
        arrival_mode: 'UNKNOWN',
        arrivalSource: '',
        phone: '',
        blood_group: 'Unknown',
        relativeName: '',
        relativePhone: '',
        conscious: 'Yes',
        unknownPatient: false
      });
    } catch (err) {
      console.error(err);
      triggerToast('Registration Failed', 'Database update error.', 'error');
    }
  };

  const handleConfirmTriage = async (id: string, code: PatientEmergency['triageCategory']) => {
    try {
      await confirmTriageMutation.mutateAsync({
        registrationId: id,
        category: code
      });
      await updatePatientStatusMutation.mutateAsync({
        registrationId: id,
        status: 'TRIAGED'
      });
      triggerToast('Triage Priority Locked', `Patient triage set to ${code}`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Triage Locking Failed', 'Database update error.', 'error');
    }
  };


  // Filtered Patient Dataset
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (triageFilter && p.triageCategory !== triageFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.abhaId.toLowerCase().includes(query) ||
          p.injuryMechanism.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [patients, triageFilter, searchQuery]);

  // Copilot text interaction
  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput;
    setCopilotChat(prev => [...prev, { sender: 'User', text: userText }]);
    setCopilotInput('');

    // Simulated responses
    setTimeout(() => {
      let aiResponse = 'Command logged. I am verifying the emergency database for relevant logs.';
      const cleanText = userText.toLowerCase();
      if (cleanText.includes('bay 1') || cleanText.includes('patil')) {
        aiResponse = 'Santosh Patil in Bay 1 has an active RED Triage status. High GCS risk (score 9) and a 12mm subdural hematoma on head CT. 2 units of O- blood are reserved and ready.';
      } else if (cleanText.includes('blood') || cleanText.includes('bank') || cleanText.includes('o-')) {
        aiResponse = 'Sion Blood Bank currently holds 12 Units of O- Negative blood. 6 units are pre-ordered for upcoming trauma transits.';
      } else if (cleanText.includes('radiology') || cleanText.includes('ct')) {
        aiResponse = 'CT Room 1 is active with Santosh Patil. CT Room 2 is standby for incoming. Average turnaround is 14.8 minutes.';
      }
      setCopilotChat(prev => [...prev, { sender: 'AI', text: aiResponse }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased relative pb-16">
      
      {/* Toast Alerts Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-start space-x-3.5 transition-all duration-300 animate-slide-in">
          <div className={`p-2.5 rounded-xl ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
            toast.type === 'warning' ? 'bg-amber-50 text-amber-600' :
            toast.type === 'error' ? 'bg-rose-50 text-rose-600 animate-pulse' :
            'bg-blue-50 text-blue-600'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {toast.type === 'error' && <Siren className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900">{toast.message}</h4>
            {toast.description && <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{toast.description}</p>}
          </div>
        </div>
      )}

      {/* Top Navigation & Global Header */}
      <header className="sticky top-0 z-35 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shadow-slate-100/50">
        
        {/* Crest Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0A5BFF] text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-blue-800/20">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-widest text-[#0A5BFF] uppercase">MCGM DIGITAL HOSPITAL</span>
              <span className="bg-red-500/10 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse border border-red-500/20">EMERGENCY OS</span>
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">Trauma Command Center</h1>
          </div>
        </div>

        {/* Global AI Search & Voice triggers */}
        <div className="flex-1 max-w-xl mx-0 md:mx-6">
          <div className="relative flex items-center bg-[#f0f4f9] rounded-2xl border border-slate-100 p-1">
            <Search className="w-4 h-4 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search patients, ABHA ID, enroute ambulances, incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 placeholder-slate-400 px-3 py-2 outline-none"
            />
            {isListening ? (
              <button 
                onClick={stopSpeechRecognition}
                className="bg-rose-500 text-white p-2 rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors animate-pulse"
                title="Stop speech command engine"
              >
                <MicOff className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={startSpeechRecognition}
                className="bg-[#0A5BFF] text-white p-2 rounded-xl flex items-center justify-center hover:bg-blue-800 transition-colors"
                title="Trigger Doctor Voice Command Scribe"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {currentSpeechTranscript && (
            <p className="text-[9px] text-slate-500 mt-1 italic pl-1 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              <span>Voice: "{currentSpeechTranscript}"</span>
            </p>
          )}
        </div>

        {/* Shift detail, Weather station, Broadcast alerts, and MCI Activation */}
        <div className="flex items-center flex-wrap gap-3.5">
          <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-left hidden lg:block">
            <span className="text-[8px] text-slate-400 font-bold uppercase block">Current Duty shift</span>
            <span className="text-[10px] font-bold text-slate-800">Day Shift • Dr. R. Patil</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-left hidden lg:block">
            <span className="text-[8px] text-slate-400 font-bold uppercase block">Sion, Mumbai</span>
            <span className="text-[10px] font-bold text-[#0A5BFF] flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>29°C • Heavy Rain</span>
            </span>
          </div>

          <button
            onClick={() => {
              setIsDisasterMode(!isDisasterMode);
              triggerToast(
                isDisasterMode ? 'Disaster Alert Cancelled' : 'MASS CASUALTY PROTOCOLS INITIATED',
                isDisasterMode ? 'System returned to standard status.' : 'All trauma bays locked, paging auxiliary staff.',
                isDisasterMode ? 'success' : 'error'
              );
            }}
            className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all ${
              isDisasterMode 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse border border-red-500 shadow-red-550/30' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isDisasterMode ? 'MCI ACTIVE: LEVEL 3' : 'DECLARE MCI'}</span>
          </button>
          
          <button 
            onClick={onLogout}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Sign out of Emergency OS"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrolling Broadcast Ticker */}
      <div className="bg-[#0A5BFF] text-white px-6 py-1.5 flex items-center justify-between text-[10px] font-semibold overflow-hidden shadow-inner">
        <div className="flex items-center space-x-2">
          <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded font-mono">ALERT</span>
          <div className="animate-marquee whitespace-nowrap">
            Sion Flyover traffic congested due to heavy rain water logging. Ambulances routed via WEH Bypass. O Negative blood reserve replenishment requested.
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 font-mono ml-4 flex-shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>SION HOSP SERVER TIME: 10:42 AM</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* Left Aside Navigation panel */}
        <aside className="w-full lg:w-72 bg-white border-r border-slate-100 p-4 space-y-2 flex-shrink-0">
          <div className="px-3 py-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Operational Modules</span>
          </div>

          <nav className="space-y-1">
            {([
              { id: 'command', label: 'Emergency Command', icon: Activity, badge: 'LIVE' },
              { id: 'incidents', label: 'Live Incidents', icon: Siren, badge: incidents.length.toString() },
              { id: 'registration', label: 'Quick Registration', icon: User },
              { id: 'incoming', label: 'Incoming Patients', icon: Ambulance, badge: patients.filter(p => p.status === 'EN_ROUTE').length.toString() },
              { id: 'triage', label: 'AI Triage Board', icon: Heart, badge: patients.filter(p => p.triageCategory === 'PENDING').length.toString() },
              { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, badge: specimens.filter(s => s.status !== 'RELEASED').length.toString() },
              { id: 'radiology', label: 'Radiology PACS', icon: Tv, badge: radiologyStudies.filter(r => r.status !== 'RELEASED').length.toString() },
              { id: 'doctors', label: 'On-duty Doctors', icon: Users },
              { id: 'nurses', label: 'On-duty Nurses', icon: ClipboardList },
              { id: 'blood_bank', label: 'Blood Bank', icon: Droplet, badge: '12 U' },
              { id: 'pharmacy', label: 'Pharmacy Cart', icon: Pill },
              { id: 'settings', label: 'Settings Control', icon: Settings },
              { id: 'copilot', label: 'AI Copilot Prompt', icon: Brain, badge: 'AI' }
            ] as Array<{ id: string; label: string; icon: any; badge?: string; action?: () => void }>).map(item => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) item.action();
                    else setActiveSection(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    isSelected 
                      ? 'bg-blue-50 text-[#0A5BFF] border-l-4 border-[#0A5BFF]' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0A5BFF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                      item.badge === 'LIVE' || item.badge === 'AI' 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Dashboard Area */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] no-scrollbar">
          
          {/* Mission Control Command Dashboard */}
          {activeSection === 'command' && (
            <>
              {/* 12 Interactive KPI Cards */}
              <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                {[
                  { id: 'incoming', label: 'Incoming Transits', count: patients.filter(p => p.status === 'EN_ROUTE').length, icon: Ambulance, text: 'En route now', color: 'text-indigo-650' },
                  { id: 'critical', label: 'Critical RED Cases', count: patients.filter(p => p.triageCategory === 'RED').length, icon: Siren, text: 'Life threatening', color: 'text-rose-600', isPulse: true },
                  { id: 'golden', label: 'Golden Hour Alert', count: patients.filter(p => p.elapsedMinutes && p.elapsedMinutes < 60 && p.triageCategory === 'RED').length, icon: Timer, text: 'In critical window', color: 'text-amber-600' },
                  { id: 'triage_waiting', label: 'Awaiting Triage', count: patients.filter(p => p.status === 'ARRIVED').length, icon: Users, text: 'In intake lobby', color: 'text-amber-500' },
                  { id: 'door_doc', label: 'Door-to-Doctor', count: '4.8m', icon: Clock, text: 'Target < 10 mins', color: 'text-emerald-600' },
                  { id: 'bays_avail', label: 'Trauma Bays Open', count: '2 / 6', icon: LayoutGrid, text: 'Resus bays available', color: 'text-slate-600' },
                  { id: 'icu_beds', label: 'ICU Open Beds', count: '3 / 24', icon: HeartPulse, text: 'Critical reserve tight', color: 'text-rose-500' },
                  { id: 'ot_status', label: 'OT Active Rooms', count: '2 Ready', icon: Scissors, text: 'Surgical suites open', color: 'text-emerald-500' },
                  { id: 'blood', label: 'O Neg Reserve', count: '12 U', icon: Droplet, text: 'Pre-ordered 6 units', color: 'text-rose-600' },
                  { id: 'doc_duty', label: 'On-Duty Doctors', count: '4 Active', icon: User, text: '3 Specialists on call', color: 'text-slate-600' },
                  { id: 'amb_duty', label: 'Ambulances Active', count: ambulances.filter(a => a.status !== 'AVAILABLE').length, icon: Truck, text: 'GPS Telemetry sync', color: 'text-indigo-650' },
                  { id: 'occupancy', label: 'ER Occupancy', count: '84%', icon: Building, text: 'High patient load indices', color: 'text-amber-600' }
                ].map(card => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => {
                        if (card.id === 'critical') setTriageFilter(triageFilter === 'RED' ? null : 'RED');
                        else if (card.id === 'incoming') setTriageFilter(triageFilter === 'PENDING' ? null : 'PENDING');
                        else {
                          setTriageFilter(null);
                          triggerToast('KPI Interactive Click', `Displaying operational details for ${card.label}.`, 'info');
                        }
                      }}
                      className="bg-white border border-slate-100 hover:border-[#0A5BFF] hover:shadow-md rounded-2xl p-4.5 text-left transition-all shadow-sm shadow-slate-100/50 flex flex-col justify-between h-28 relative group cursor-pointer"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-wider">{card.label}</span>
                        <Icon className={`w-4 h-4 ${card.color} ${card.isPulse ? 'animate-pulse' : ''}`} />
                      </div>
                      <div className="mt-2.5">
                        <span className="text-2xl font-black text-slate-900 block tracking-tight">{card.count}</span>
                        <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">{card.text}</span>
                      </div>
                    </button>
                  );
                })}
              </section>

              {/* Consolidated Layout Columns */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Left Column Area (col-span-8) */}
                <div className="col-span-12 xl:col-span-8 space-y-6">
                  
                  {/* GIS Incident map */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <Map className="w-5 h-5 text-[#0A5BFF]" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Live GIS Emergency Operations Grid</h3>
                      </div>
                    </div>

                    <div className="h-72 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-30 pointer-events-none">
                        {Array.from({ length: 72 }).map((_, i) => (
                          <div key={i} className="border-t border-r border-slate-200" />
                        ))}
                      </div>

                      <svg className="absolute inset-0 w-full h-full text-slate-200 pointer-events-none" fill="none">
                        <path d="M 0,100 L 800,180" stroke="currentColor" strokeWidth="6" />
                        <path d="M 120,0 L 220,300" stroke="currentColor" strokeWidth="4" />
                        <path d="M 350,0 L 350,300" stroke="currentColor" strokeWidth="5" />
                        <path d="M 0,220 C 200,200 400,280 800,220" stroke="currentColor" strokeWidth="8" />
                      </svg>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                        <div className="w-10 h-10 bg-[#0A5BFF] text-white rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white">
                          <Building className="w-5 h-5" />
                        </div>
                        <span className="bg-slate-900 text-white font-bold text-[8px] px-2 py-0.5 rounded shadow mt-1">Sion Trauma Base</span>
                      </div>

                      <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                        <div className="w-8 h-8 bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center border border-rose-500 animate-pulse">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="bg-rose-600 text-white font-bold text-[7px] px-1.5 py-0.5 rounded shadow mt-1">INC-MCI-01</span>
                      </div>

                      {ambulances.map((amb, index) => (
                        <div
                          key={amb.id}
                          style={{
                            top: index === 0 ? '60%' : index === 1 ? '30%' : '75%',
                            left: index === 0 ? '70%' : index === 1 ? '55%' : '48%'
                          }}
                          className="absolute flex flex-col items-center group cursor-pointer"
                        >
                          <div className="w-7 h-7 bg-[#0A5BFF] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-110 transition-transform">
                            <Ambulance className="w-3.5 h-3.5" />
                          </div>
                          
                          <div className="hidden group-hover:block absolute bottom-8 bg-slate-900 text-white text-[9px] p-2.5 rounded-xl shadow-2xl z-40 border border-slate-700 w-36 leading-normal">
                            <span className="font-bold block">{amb.id}</span>
                            <span className="text-gray-400 block mt-0.5">{amb.location.name}</span>
                            <span className="text-rose-400 font-bold block mt-0.5">ETA: {patients.find(p => p.ambulanceId === amb.id)?.etaMinutes || 5} mins</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Patient Stream */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <Activity className="w-5 h-5 text-rose-500" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Live Trauma Patient Registry</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredPatients.map(p => (
                        <div
                          key={p.id}
                          className={`bg-white border hover:border-[#0A5BFF] p-4.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md shadow-sm shadow-slate-100/30 ${
                            p.triageCategory === 'RED' ? 'border-l-4 border-l-rose-500' : 
                            p.triageCategory === 'YELLOW' ? 'border-l-4 border-l-amber-500' :
                            p.triageCategory === 'GREEN' ? 'border-l-4 border-l-emerald-500' :
                            'border-l-4 border-l-slate-400'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-black text-slate-900">{p.name}</h4>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                                p.triageCategory === 'RED' ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' :
                                p.triageCategory === 'YELLOW' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                p.triageCategory === 'GREEN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {p.triageCategory}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal max-w-md">{p.injuryMechanism}</p>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 md:w-80">
                            <div>
                              <span className="text-slate-400 block text-[8px] font-bold">HR</span>
                              <span className={`font-black block mt-0.5 ${p.vitals.hr > 110 ? 'text-rose-600' : 'text-slate-700'}`}>{p.vitals.hr}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] font-bold">SpO2</span>
                              <span className="font-black text-slate-700 block mt-0.5">{p.vitals.spo2}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] font-bold">BP</span>
                              <span className="font-bold text-slate-700 block mt-0.5">{p.vitals.bp}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] font-bold">GCS</span>
                              <span className="font-bold text-[#0A5BFF] block mt-0.5">{p.gcs}/15</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPatient(p);
                                setActiveSection('triage');
                              }}
                              className="bg-[#0A5BFF] hover:bg-blue-800 text-white text-[10px] font-bold px-3 py-2 rounded-xl"
                            >
                              Triage Calc
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trauma Bay grid */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <LayoutGrid className="w-5 h-5 text-[#0A5BFF]" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Critical Trauma Resuscitation Bays</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
                      {mappedBays.map(bay => (
                        <div
                          key={bay.num}
                          className={`bg-white border rounded-2xl p-4.5 space-y-3.5 relative flex flex-col justify-between shadow-sm ${
                            bay.status === 'OCCUPIED' ? 'border-[#0A5BFF] bg-blue-50/10' :
                            bay.status === 'CLEANING' ? 'border-amber-200 bg-amber-50/5' :
                            bay.status === 'MAINTENANCE' ? 'border-slate-200 bg-slate-50/35 opacity-60' :
                            'border-slate-100'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black text-slate-900 uppercase">Trauma Bay {bay.num}</h4>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                                bay.status === 'OCCUPIED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                bay.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {bay.status}
                              </span>
                            </div>
                          </div>

                          {bay.status === 'OCCUPIED' ? (
                            <div className="space-y-2 text-[10px]">
                              <div>
                                <span className="text-slate-800 font-bold block">{bay.patient} ({bay.age})</span>
                                <span className="text-slate-500 block text-[9px] mt-0.5">Dx: {bay.condition}</span>
                              </div>

                              <div className="bg-slate-900 h-11 rounded-lg border border-slate-800 overflow-hidden relative flex items-center p-2.5">
                                <span className="absolute top-1 left-2 text-[8px] font-mono text-emerald-400 font-bold">HR: {bay.hr}</span>
                                <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 30" preserveAspectRatio="none">
                                  <path
                                    d="M0,15 L10,15 L15,10 L20,20 L25,15 L40,15 L45,2 L50,28 L55,15 L70,15 L75,12 L80,18 L85,15 L100,15"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              <span className="text-[10px] font-bold text-slate-800 mt-1">Ready</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column Area (col-span-4) */}
                <div className="col-span-12 xl:col-span-4 space-y-6">
                  
                  {/* AI insights panel */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100/50 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <Brain className="w-5 h-5 text-[#0A5BFF]" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">AI Emergency Intelligence</h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: 'CT Scan Overdue Warning', text: 'Door-to-CT time for Sunita Deshmukh exceeded 22 mins. Priority slot cleared in Radiology.', alert: 'CRITICAL', color: 'bg-rose-50 text-rose-600' },
                        { title: 'Internal Bleeding Probability', text: 'GCS 9 / RTS 5.2 calculated for Santosh Patil (Bay 1). High risk of hemorrhagic shock.', alert: 'WARNING', color: 'bg-amber-50 text-amber-600' }
                      ].map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${item.color} space-y-1`}>
                          <span className="text-[8px] font-black uppercase tracking-wide block">{item.title}</span>
                          <p className="text-[10px] leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resource registry panel */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-slate-100/50 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <Database className="w-5 h-5 text-[#0A5BFF]" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Critical Resource Registry</h3>
                    </div>

                    <div className="space-y-3">
                      {mappedResources.map(res => (
                        <div key={res.name} className="space-y-1 text-[10px]">
                          <div className="flex justify-between items-center font-bold">
                            <span>{res.name}</span>
                            <span>{res.val}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${res.color}`} style={{ width: `${res.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </>
          )}

          {/* DEDICATED WORKSPACE: LABORATORY WORKSPACE */}
          {activeSection === 'laboratory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0A5BFF] border border-blue-200 rounded-2xl flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Emergency LIMS Validation Desk</h2>
                    <p className="text-[10px] text-slate-500">Live specimen queues, Westgard QC charts, and digital signature validations.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                
                {/* Left Side: Specimens Queue */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">Active Specimens</h3>
                    <div className="space-y-3">
                      {specimens.map(spec => (
                        <div
                          key={spec.id}
                          onClick={() => setActiveSpecimen(spec)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            activeSpecimen.id === spec.id ? 'border-[#0A5BFF] bg-blue-50/10' : 'border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{spec.patient}</h4>
                              <p className="text-[9px] text-slate-400">{spec.test}</p>
                            </div>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                              spec.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-650' : 'bg-rose-50 text-rose-600'
                            }`}>{spec.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Specimen validation desk */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <span className="bg-blue-50 text-[#0A5BFF] text-[9px] font-black px-2 py-0.5 rounded">{activeSpecimen.type}</span>
                        <h3 className="text-base font-black text-slate-900 mt-2">{activeSpecimen.patient}</h3>
                        <p className="text-[10px] text-slate-500">ABHA Barcode: {activeSpecimen.barcode} • Logged at {activeSpecimen.time}</p>
                      </div>
                    </div>

                    {/* Results table */}
                    <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Analyzed Parameter: {activeSpecimen.test}</span>
                        <span className="text-rose-600">OUT OF REFERENCE RANGE</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-[10px] font-bold">
                        <div>
                          <span className="text-slate-400 block text-slate-400">RESULT VALUE</span>
                          <span className="text-base font-black text-rose-600 block mt-0.5">{activeSpecimen.result}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-slate-400">REFERENCE RANGE</span>
                          <span className="text-slate-700 block mt-1">{activeSpecimen.normal}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-slate-400">HISTORICAL DELTA</span>
                          <span className="text-amber-500 block mt-1">{activeSpecimen.delta}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sign-off authentication */}
                    {activeSpecimen.status === 'TESTED' && (
                      <div className="bg-emerald-50/10 border border-emerald-500/20 p-5 rounded-2xl space-y-3 text-[10px]">
                        <h4 className="font-bold text-emerald-600 uppercase">Authorize Digital Release Signature</h4>
                        <p className="text-slate-500">Sign with credentials to publish FHIR Observation resources onto MCGM servers.</p>
                        <div className="flex gap-3">
                          <input
                            type="password"
                            placeholder="Enter Signature PIN (1234)"
                            value={labPIN}
                            onChange={(e) => setLabPIN(e.target.value)}
                            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs flex-1 outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => {
                              if (labPIN === '1234') {
                                setSpecimens(prev => prev.map(s => s.id === activeSpecimen.id ? { ...s, status: 'RELEASED' } : s));
                                setActiveSpecimen({ ...activeSpecimen, status: 'RELEASED' });
                                setLabPIN('');
                                triggerToast('Lab Report Released', 'FHIR payload sent to ABHA Patient Timeline.', 'success');
                              } else {
                                triggerToast('Invalid PIN code', 'Signature authentication failed.', 'error');
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl"
                          >
                            Release Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calibration chart */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">Westgard QC Quality Control Calibration</h3>
                    <div className="h-28 relative border-l border-b border-slate-200 flex items-end">
                      <div className="absolute left-0 right-0 top-[20%] border-t border-rose-500/10 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-rose-500 font-bold">+2 SD</span></div>
                      <div className="absolute left-0 right-0 top-[50%] border-t border-slate-200"><span className="absolute -top-2 left-1 text-[8px] text-slate-500 font-bold">Target Mean</span></div>
                      <div className="absolute left-0 right-0 top-[80%] border-t border-rose-500/10 border-dashed"><span className="absolute -top-2 left-1 text-[8px] text-rose-500 font-bold">-2 SD</span></div>
                      <svg className="absolute inset-0 w-full h-full text-indigo-500" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,50 15,48 30,55 45,40 60,65 75,50 90,82 100,52" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: RADIOLOGY PACS WORKSTATION */}
          {activeSection === 'radiology' && (() => {
            const filteredStudies = radiologyStudies.filter(study => {
              const matchesSearch = study.patient.toLowerCase().includes(pacsSearch.toLowerCase()) || 
                                    study.id.toLowerCase().includes(pacsSearch.toLowerCase()) ||
                                    study.test.toLowerCase().includes(pacsSearch.toLowerCase());
              const matchesModality = pacsModalityFilter === 'ALL' || study.modality === pacsModalityFilter;
              return matchesSearch && matchesModality;
            });

            return (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-150 rounded-2xl flex items-center justify-center shadow-sm">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Radiology PACS DICOM Workstation</h2>
                      <p className="text-[10px] text-slate-500 font-medium">Sion Hospital Emergency Command Center PACS Viewport. Caliper measurements, Hounsfield window mapping, and ABDM certification ledger.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider font-mono">PACS PACS-LINK ACTIVE</span>
                  </div>
                </div>

                {/* Main 3-Column Workstation Grid */}
                <div className="grid grid-cols-12 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-900 shadow-2xl">
                  
                  {/* COLUMN 1: ACTIVE STUDY QUEUE (3/12 cols) */}
                  <div className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Imaging Queue</h3>
                        <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded font-mono">
                          {filteredStudies.length} STUDIES
                        </span>
                      </div>

                      {/* Search Filter Input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search patient, ID, test..."
                          value={pacsSearch}
                          onChange={(e) => setPacsSearch(e.target.value)}
                          className="w-full bg-black border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-[10px] text-white outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-all"
                        />
                      </div>

                      {/* Modality Filter Buttons */}
                      <div className="grid grid-cols-3 gap-1 bg-black p-1 rounded-xl border border-slate-800">
                        {(['ALL', 'CT', 'X-Ray'] as const).map((mod) => (
                          <button
                            key={mod}
                            onClick={() => setPacsModalityFilter(mod)}
                            className={`py-1 rounded-lg text-[9px] font-black transition-all ${
                              pacsModalityFilter === mod ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            {mod === 'X-Ray' ? 'X-RAY' : mod}
                          </button>
                        ))}
                      </div>

                      {/* Patient List Queue */}
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                        {filteredStudies.length > 0 ? (
                          filteredStudies.map((study) => {
                            const isActive = activeRadStudy.id === study.id;
                            const isEmergency = study.priority === 'EMERGENCY';
                            const isReleased = study.status === 'RELEASED';

                            return (
                              <div
                                key={study.id}
                                onClick={() => {
                                  setActiveRadStudy(study);
                                  setPacsZoom(1);
                                  setPacsRotation(0);
                                }}
                                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                                  isActive 
                                    ? 'border-indigo-500 bg-indigo-950/20 shadow-md' 
                                    : 'border-slate-800 bg-black hover:border-slate-750'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1.5">
                                  <div>
                                    <h4 className="text-[11.5px] font-bold text-white leading-tight">{study.patient}</h4>
                                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{study.id} • {study.modality}</p>
                                  </div>
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${
                                    isReleased
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                      : isEmergency
                                        ? 'bg-rose-500/20 text-rose-450 border border-rose-500/20 animate-pulse'
                                        : 'bg-amber-500/20 text-amber-450 border border-amber-500/20'
                                  }`}>
                                    {isReleased ? 'RELEASED' : study.priority}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-2 truncate">{study.test}</p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center text-slate-600 text-[10px] font-mono">
                            No imaging orders found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: ACTIVE DICOM VIEWPORT (5/12 cols) */}
                  <div className="col-span-12 lg:col-span-5 space-y-4 flex flex-col justify-between">
                    
                    {/* Viewport Control Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setPacsZoom(z => Math.min(3, z + 0.15))}
                          className="p-2 rounded-xl bg-black border border-slate-800 hover:border-slate-700 text-slate-400 active:scale-90 transition-all"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPacsZoom(z => Math.max(0.5, z - 0.15))}
                          className="p-2 rounded-xl bg-black border border-slate-800 hover:border-slate-700 text-slate-400 active:scale-90 transition-all"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPacsRotation(r => (r + 90) % 360)}
                          className="p-2 rounded-xl bg-black border border-slate-800 hover:border-slate-700 text-slate-400 active:scale-90 transition-all"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPacsZoom(1);
                            setPacsRotation(0);
                            setPacsContrast(100);
                            setPacsBrightness(100);
                            setPacsSlice(activeRadStudy.modality === 'CT' ? 12 : 1);
                          }}
                          className="px-2.5 py-2 rounded-xl bg-black border border-slate-800 hover:border-slate-700 text-[8.5px] font-black text-slate-400 active:scale-90 transition-all"
                          title="Reset View"
                        >
                          RESET
                        </button>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setShowMeasureTool(!showMeasureTool)}
                          className={`px-3 py-1.5 rounded-xl text-[8.5px] font-black tracking-wider transition-all flex items-center space-x-1 border ${
                            showMeasureTool 
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-450' 
                              : 'bg-black border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>MEASURE</span>
                        </button>
                        <button
                          onClick={() => setShowAIOverlay(!showAIOverlay)}
                          className={`px-3 py-1.5 rounded-xl text-[8.5px] font-black tracking-wider transition-all flex items-center space-x-1 border ${
                            showAIOverlay 
                              ? 'bg-rose-600/20 border-rose-500 text-rose-450' 
                              : 'bg-black border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>AI DETECT</span>
                        </button>
                      </div>
                    </div>

                    {/* Window level preset settings */}
                    <div className="flex items-center justify-between bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
                      <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider font-mono">HU Hounsfield Presets</span>
                      <div className="flex space-x-1.5">
                        {(activeRadStudy.modality === 'CT' ? ['BRAIN', 'BONE', 'SUBDURAL'] : ['BRAIN', 'LUNG']).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setPacsWindowMode(mode as any)}
                            className={`px-2.5 py-1 rounded-lg text-[8px] font-black transition-all ${
                              pacsWindowMode === mode 
                                ? 'bg-indigo-600 text-white shadow' 
                                : 'bg-black text-slate-400 border border-slate-800 hover:text-slate-400'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Canvas DICOM Viewport */}
                    <DicomViewport
                      study={activeRadStudy}
                      zoom={pacsZoom}
                      rotation={pacsRotation}
                      slice={pacsSlice}
                      windowMode={pacsWindowMode}
                      showAIOverlay={showAIOverlay}
                      showMeasureTool={showMeasureTool}
                      contrast={pacsContrast}
                      brightness={pacsBrightness}
                      onSliceChange={setPacsSlice}
                    />

                    {/* Slide Navigation */}
                    {activeRadStudy.modality === 'CT' && (
                      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1.5 shadow-inner">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                          <span>SLICE SCROLLER: {pacsSlice} / 24</span>
                          <span>Z-HEIGHT: {(120 - pacsSlice * 5.2).toFixed(1)} mm</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="24"
                          value={pacsSlice}
                          onChange={(e) => setPacsSlice(Number(e.target.value))}
                          className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-800"
                        />
                      </div>
                    )}

                    {/* Fine Adjustment Sliders */}
                    <div className="grid grid-cols-2 gap-3.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-[9px] font-mono text-slate-400">
                      <div className="space-y-1.5 text-left">
                        <span className="block">W-CONTRAST: {pacsContrast}%</span>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={pacsContrast}
                          onChange={(e) => setPacsContrast(Number(e.target.value))}
                          className="w-full h-1 bg-black accent-indigo-500 rounded appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <span className="block">W-LEVEL (BRIGHT): {pacsBrightness}%</span>
                        <input
                          type="range"
                          min="55"
                          max="145"
                          value={pacsBrightness}
                          onChange={(e) => setPacsBrightness(Number(e.target.value))}
                          className="w-full h-1 bg-black accent-indigo-500 rounded appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* MPR Thumbnails */}
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="border border-indigo-500/30 rounded-xl bg-slate-950 p-1.5 text-center cursor-pointer hover:border-indigo-400 transition-all">
                        <div className="h-10 bg-slate-900 rounded-lg flex items-center justify-center text-[8px] font-black text-indigo-450 uppercase tracking-widest font-mono">AXIAL</div>
                        <span className="text-[7px] text-slate-500 font-mono mt-0.5 block font-bold">PRIMARY ACTIVE</span>
                      </div>
                      <div className="border border-slate-800 rounded-xl bg-slate-950 p-1.5 text-center cursor-pointer hover:border-indigo-500/20 transition-all">
                        <div className="h-10 bg-slate-900 rounded-lg flex items-center justify-center text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">CORONAL</div>
                        <span className="text-[7px] text-slate-600 font-mono mt-0.5 block">MPR RECONSTRUCT</span>
                      </div>
                      <div className="border border-slate-800 rounded-xl bg-slate-950 p-1.5 text-center cursor-pointer hover:border-indigo-500/20 transition-all">
                        <div className="h-10 bg-slate-900 rounded-lg flex items-center justify-center text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">SAGITTAL</div>
                        <span className="text-[7px] text-slate-600 font-mono mt-0.5 block">MPR RECONSTRUCT</span>
                      </div>
                    </div>

                  </div>

                  {/* COLUMN 3: REPORTING & DIGITAL AUTHORIZATION (4/12 cols) */}
                  <div className="col-span-12 lg:col-span-4 space-y-4">
                    
                    {/* Patient Info Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] text-slate-500 font-black font-mono tracking-wider block uppercase">PACS ACCESSION NO</span>
                          <span className="text-[10px] text-indigo-400 font-black font-mono block">{activeRadStudy.id}</span>
                          <h4 className="text-[13.5px] font-black text-white leading-tight mt-1">{activeRadStudy.patient}</h4>
                          <p className="text-[9.5px] text-indigo-300 font-bold mt-0.5">{activeRadStudy.test}</p>
                        </div>
                        <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${
                          activeRadStudy.priority === 'EMERGENCY' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {activeRadStudy.priority}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 pt-2 border-t border-slate-800 font-mono text-left">
                        <span>MODALITY: <span className="text-white font-bold">{activeRadStudy.modality}</span></span>
                        <span>STATUS: <span className={activeRadStudy.status === 'RELEASED' ? 'text-emerald-450 font-black' : 'text-amber-450 font-black animate-pulse'}>{activeRadStudy.status}</span></span>
                        <span>ABHA ID: <span className="text-slate-300">91-2094-1102</span></span>
                        <span>LINK: <span className="text-indigo-450 font-bold">ABDM EMR</span></span>
                      </div>
                    </div>

                    {/* AI Diagnostics Card */}
                    <div className="bg-indigo-950/15 border border-indigo-900/40 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-1.5 text-[8.5px] text-indigo-450 font-black uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span>AI Diagnostic impression</span>
                      </div>
                      <p className="text-xs text-indigo-200 leading-relaxed font-semibold text-left">
                        {activeRadStudy.finding}
                      </p>
                      {activeRadStudy.confidence > 0 && (
                        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-indigo-900/35">
                          <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                            Confidence: {activeRadStudy.confidence}%
                          </span>
                          <span className="text-[8px] font-mono text-indigo-450">Vessel segmentation 99.4%</span>
                        </div>
                      )}
                    </div>

                    {/* Scribe Area */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">Clinical EMR Report</label>
                        
                        {/* Voice Dictation Button */}
                        <button
                          onClick={togglePacsDictation}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[8.5px] font-black border transition-all ${
                            pacsDictationActive 
                              ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-md' 
                              : 'bg-black border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {pacsDictationActive ? (
                            <>
                              <Mic className="w-2.5 h-2.5 animate-bounce text-white" />
                              <span>DICTATING LIVE</span>
                            </>
                          ) : (
                            <>
                              <MicOff className="w-2.5 h-2.5 text-slate-500" />
                              <span>VOICE DICTATE</span>
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        value={pacsReportText}
                        onChange={(e) => setPacsReportText(e.target.value)}
                        placeholder="Draft clinical report. Click 'VOICE DICTATE' to speak findings directly."
                        className="w-full h-28 bg-black border border-slate-800 rounded-xl p-3 text-xs outline-none text-white focus:border-indigo-500 transition-all font-sans resize-none leading-relaxed placeholder:text-slate-700"
                      />

                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono">
                        <span>ABDM FHIR-compliant scribe</span>
                        <span>{pacsReportText.length} chars</span>
                      </div>
                    </div>

                    {/* Cryptographic Signature & Sign-off */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[9.5px] font-black text-sky-400 uppercase tracking-wider">Report Authorization PIN</h4>
                        {activeRadStudy.status === 'RELEASED' && (
                          <span className="flex items-center space-x-1 text-[8.5px] text-emerald-450 font-black">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>RELEASED EMR</span>
                          </span>
                        )}
                      </div>
                      
                      {activeRadStudy.status !== 'RELEASED' ? (
                        <div className="space-y-2">
                          <input
                            type="password"
                            placeholder="Enter PACS PIN (1234)"
                            value={pacsPIN}
                            onChange={(e) => setPacsPIN(e.target.value)}
                            className="w-full bg-black border border-slate-800 px-3 py-2.5 rounded-xl text-xs outline-none text-white focus:border-sky-500 font-mono text-center tracking-widest placeholder:tracking-normal placeholder:font-sans"
                          />
                          <button
                            onClick={() => {
                              if (pacsPIN === '1234') {
                                const finalReport = pacsReportText || activeRadStudy.finding;
                                setRadiologyStudies(prev => prev.map(r => r.id === activeRadStudy.id ? { ...r, status: 'RELEASED', finding: finalReport } : r));
                                setActiveRadStudy(prev => ({ ...prev, status: 'RELEASED', finding: finalReport }));
                                setPacsPIN('');
                                triggerToast('EMR Signed & Released', 'DICOM findings authorized & broadcasted to EMR ledger.', 'success');
                              } else {
                                triggerToast('Authentication Failed', 'Invalid security PIN code.', 'error');
                              }
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
                          >
                            <Fingerprint className="w-4 h-4" />
                            <span>SIGN & DEPLOY TO ABDM</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileCheck className="w-5 h-5 text-emerald-400" />
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">ABDM RECORD INTEGRATED</span>
                              <span className="text-[8px] text-slate-500 font-mono block mt-1 leading-none">SHA256: d84c9f...a80b1e</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => window.print()}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 p-2 rounded-xl text-[8.5px] font-black flex items-center space-x-1.5 active:scale-95 transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PRINT</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })()}

          {/* DEDICATED WORKSPACE: STAFF ROSTER (DOCTORS / NURSES) */}
          {(activeSection === 'doctors' || activeSection === 'nurses') && (() => {
            const isDocView = activeSection === 'doctors';
            const staffList = isDocView ? doctorsDuty : nursesDuty;
            
            return (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 text-[#0A5BFF] border border-blue-200 rounded-2xl flex items-center justify-center">
                      {isDocView ? <Users className="w-5 h-5 text-[#0A5BFF]" /> : <ClipboardList className="w-5 h-5 text-[#0A5BFF]" />}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                        {isDocView ? 'On-Duty ER Doctors Roster' : 'On-Duty Resus Nurses Roster'}
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        {isDocView 
                          ? 'Real-time telemetry, active resus bay drag-assignment, workload metrics, and doctor paging console.'
                          : 'Roster details, real-time workload heat-maps, active bay drag-assignment, and nurse communication tags.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {staffList.filter(s => s.status.startsWith('ACTIVE')).length} / {staffList.length} DEPLOYED
                    </span>
                    <button 
                      onClick={() => {
                        // Reset all assignments
                        setBayStaffAssignments({
                          1: { docName: undefined, nurseName: undefined },
                          2: { docName: undefined, nurseName: undefined },
                          3: { docName: undefined, nurseName: undefined },
                          4: { docName: undefined, nurseName: undefined },
                          5: { docName: undefined, nurseName: undefined },
                          6: { docName: undefined, nurseName: undefined }
                        });
                        setDoctorsDuty(prev => prev.map((d, i) => ({
                          ...d,
                          bay: i < 3 ? i + 1 : null,
                          status: i < 3 ? `ACTIVE IN BAY ${i + 1}` : 'STANDBY - IN OT',
                          workload: i < 3 ? 'High' : 'Low',
                          telemetry: { ...d.telemetry, loc: i < 3 ? `Resus Bay ${i + 1}` : 'Main OT Suite' }
                        })));
                        setNursesDuty(prev => prev.map((n, i) => ({
                          ...n,
                          bay: i < 3 ? i + 1 : null,
                          status: i < 3 ? `ACTIVE IN BAY ${i + 1}` : 'STANDBY - RECEPTION',
                          workload: i < 3 ? 'High' : 'Low',
                          telemetry: { ...n.telemetry, loc: i < 3 ? `Resus Bay ${i + 1}` : 'Intake Desk' }
                        })));
                        triggerToast('Assignments Reset', 'All bay assignments and staff statuses set to default.', 'info');
                      }}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[9px] font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Roster Roles</span>
                    </button>
                  </div>
                </div>

                {/* Main Staff Command Desk Layout */}
                <div className="grid grid-cols-12 gap-6">
                  
                  {/* Left Column: Staff Cards List */}
                  <div className="col-span-12 lg:col-span-7 space-y-4">
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Active Duty Staff Directory
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">
                          DRAG CARD TO ASSIGN TO BAY
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {staffList.map((staff) => {
                          const isHighLoad = staff.workload === 'High';
                          const isMedLoad = staff.workload === 'Medium';
                          const isPagerActive = pagerActiveState[staff.id];

                          return (
                            <div
                              key={staff.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', `${staff.id},${isDocView ? 'doctor' : 'nurse'}`);
                                setDraggedStaff({ type: isDocView ? 'doctor' : 'nurse', id: staff.id });
                              }}
                              onDragEnd={() => setDraggedStaff(null)}
                              className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-450 hover:bg-blue-50/5 hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none relative overflow-hidden group"
                            >
                              {/* Left details */}
                              <div className="flex items-start space-x-3.5">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm relative border ${
                                  isHighLoad 
                                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                    : isMedLoad
                                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                                  {staff.name.split(' ').map(n => n[0]).join('')}
                                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                    isHighLoad ? 'bg-rose-500 animate-pulse' : isMedLoad ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`} title={`Workload: ${staff.workload}`} />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-black text-slate-800 text-xs">{staff.name}</span>
                                    <span className="text-[8px] bg-slate-200 text-slate-655 font-mono px-1 rounded">
                                      {staff.shift}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                                    {staff.role}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                    Tag: {staff.id.toUpperCase()} • {staff.contact}
                                  </span>
                                </div>
                              </div>

                              {/* Telemetry and Location tracking */}
                              <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-slate-200/50 pt-2.5 md:pt-0">
                                <div className="text-left md:text-right space-y-1">
                                  <div className="flex items-center space-x-1.5 justify-end">
                                    <MapPin className="w-3 h-3 text-[#0A5BFF]" />
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-wider">{staff.telemetry.loc}</span>
                                  </div>
                                  
                                  {/* Telemetry Heart Rate Pulse Widget */}
                                  <div className="flex items-center space-x-1.5 justify-end">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                                    <span className="text-[9px] font-mono text-rose-600 font-bold flex items-center space-x-1">
                                      <span>{staff.telemetry.hr} BPM</span>
                                    </span>
                                    <div className="w-12 h-4 overflow-hidden bg-slate-900/5 rounded border border-slate-100 flex items-center">
                                      <EcgWaveform hr={staff.telemetry.hr} color="#ef4444" speed={3} />
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Action Menu / Pager Trigger */}
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={staff.status}
                                    onChange={(e) => {
                                      const newStatus = e.target.value;
                                      const isBayStatus = newStatus.startsWith('ACTIVE IN BAY');
                                      const matchedBay = isBayStatus ? parseInt(newStatus.split(' ').pop() || '1') : null;
                                      
                                      if (isDocView) {
                                        setDoctorsDuty(prev => prev.map(d => d.id === staff.id ? { 
                                          ...d, 
                                          status: newStatus,
                                          bay: matchedBay,
                                          workload: isBayStatus ? 'High' : 'Low',
                                          telemetry: { ...d.telemetry, loc: isBayStatus ? `Resus Bay ${matchedBay}` : 'Trauma Desk' }
                                        } : d));
                                        if (matchedBay) {
                                          setBayStaffAssignments(prev => ({
                                            ...prev,
                                            [matchedBay]: { ...prev[matchedBay], docName: staff.name }
                                          }));
                                        }
                                      } else {
                                        setNursesDuty(prev => prev.map(n => n.id === staff.id ? { 
                                          ...n, 
                                          status: newStatus,
                                          bay: matchedBay,
                                          workload: isBayStatus ? 'High' : 'Low',
                                          telemetry: { ...n.telemetry, loc: isBayStatus ? `Resus Bay ${matchedBay}` : 'Nurses Lounge' }
                                        } : n));
                                        if (matchedBay) {
                                          setBayStaffAssignments(prev => ({
                                            ...prev,
                                            [matchedBay]: { ...prev[matchedBay], nurseName: staff.name }
                                          }));
                                        }
                                      }
                                      triggerToast('Status Updated', `${staff.name} is now ${newStatus}.`, 'info');
                                    }}
                                    className="bg-white border border-slate-200 text-[10px] font-bold p-1 rounded-lg text-slate-700 outline-none"
                                  >
                                    <option value="STANDBY - RECEPTION">Standby (Reception)</option>
                                    <option value="STANDBY - ICU">Standby (ICU)</option>
                                    <option value="STANDBY - IN OT">Standby (OT)</option>
                                    <option value="ACTIVE IN BAY 1">Active in Bay 1</option>
                                    <option value="ACTIVE IN BAY 2">Active in Bay 2</option>
                                    <option value="ACTIVE IN BAY 3">Active in Bay 3</option>
                                    <option value="ACTIVE IN BAY 4">Active in Bay 4</option>
                                    <option value="ACTIVE IN BAY 5">Active in Bay 5</option>
                                    <option value="ACTIVE IN BAY 6">Active in Bay 6</option>
                                    <option value="ON BREAK">On Break</option>
                                  </select>

                                  <button
                                    onClick={() => {
                                      setPagerActiveState(prev => ({ ...prev, [staff.id]: true }));
                                      triggerToast(
                                        'Pager Broadcasted',
                                        `Emergency alert successfully paged to ${staff.name}'s wristband.`,
                                        'warning'
                                      );
                                      setTimeout(() => {
                                        setPagerActiveState(prev => ({ ...prev, [staff.id]: false }));
                                      }, 5000);
                                    }}
                                    className={`p-1.5 rounded-xl border text-[9px] font-black transition-all flex items-center space-x-1 ${
                                      isPagerActive 
                                        ? 'bg-rose-600 border-rose-500 text-white animate-bounce' 
                                        : 'bg-white border-slate-200 text-rose-650 hover:bg-rose-50'
                                    }`}
                                  >
                                    <Bell className={`w-3.5 h-3.5 ${isPagerActive ? 'animate-spin' : ''}`} />
                                    <span>{isPagerActive ? 'PAGED' : 'PAGE'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Trauma Bay Drop Zones */}
                  <div className="col-span-12 lg:col-span-5 space-y-4">
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Trauma Bay Drop Targets
                        </span>
                        <span className="text-[9px] text-[#0A5BFF] font-black uppercase bg-blue-50 px-2 py-0.5 rounded">
                          Live Allocations
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3.5">
                        {mappedBays.map((bay) => {
                          const isOccupied = bay.status === 'OCCUPIED';
                          const isCleaning = bay.status === 'CLEANING';
                          const isMaint = bay.status === 'MAINTENANCE';

                          const docName = bay.doc || 'Unassigned';
                          const nurseName = bay.nurse || 'Unassigned';

                          return (
                            <div
                              key={bay.num}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const data = e.dataTransfer.getData('text/plain');
                                if (data) {
                                  const [staffId, staffType] = data.split(',');
                                  handleAssignStaffToBay(staffId, staffType as any, bay.num);
                                }
                              }}
                              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between min-h-[100px] ${
                                draggedStaff 
                                  ? 'border-dashed border-blue-400 bg-blue-50/5 scale-[1.01]' 
                                  : isOccupied
                                    ? 'border-slate-200 bg-slate-50'
                                    : isCleaning
                                      ? 'border-amber-200 bg-amber-50/10'
                                      : 'border-slate-100 bg-white'
                              }`}
                            >
                              {/* Top metadata */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-black text-slate-800 block">TRAUMA BAY #{bay.num}</span>
                                  {isOccupied ? (
                                    <span className="text-[9px] text-slate-500 block mt-0.5">
                                      Patient: <strong className="text-slate-800 uppercase tracking-wide">{bay.patient}</strong> ({bay.condition})
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-slate-400 block mt-0.5">
                                      {isCleaning ? 'Cleaning in progress...' : isMaint ? 'Under Maintenance' : 'Bay Ready for Intake'}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                  isOccupied 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                    : isCleaning 
                                      ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                      : isMaint
                                        ? 'bg-slate-100 text-slate-500'
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                  {bay.status}
                                </span>
                              </div>

                              {/* Staffing info / drop targets details */}
                              <div className="mt-3.5 pt-3.5 border-t border-slate-200/50 grid grid-cols-2 gap-3 text-[10px]">
                                <div className="space-y-1">
                                  <span className="text-[8px] text-slate-400 uppercase block font-bold">Assigned MD:</span>
                                  <div className="flex items-center space-x-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${docName === 'Unassigned' ? 'bg-slate-300' : 'bg-blue-500'}`} />
                                    <span className="font-bold text-slate-800 truncate">{docName}</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[8px] text-slate-455 uppercase block font-bold">Assigned RN:</span>
                                  <div className="flex items-center space-x-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${nurseName === 'Unassigned' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                                    <span className="font-bold text-slate-800 truncate">{nurseName}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Assign Button Fallback */}
                              {draggedStaff && (
                                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[0.5px] border-2 border-blue-500 flex items-center justify-center transition-all animate-fadeIn">
                                  <button
                                    onClick={() => handleAssignStaffToBay(draggedStaff.id, draggedStaff.type, bay.num)}
                                    className="bg-[#0A5BFF] text-white font-black text-[9px] px-3.5 py-1.5 rounded-xl shadow-lg flex items-center space-x-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>ASSIGN HERE</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Advanced Shift Scheduler & Coverage Gantt Timeline */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#0A5BFF]" />
                    <span>24-Hour Trauma Unit Shift Roster Gantt Chart</span>
                  </h3>
                  
                  <div className="space-y-3 font-mono text-[9px] text-slate-500">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-slate-400 font-bold">
                      <span className="w-24">PROVIDER</span>
                      <div className="flex-1 grid grid-cols-4 gap-1 text-center font-black">
                        <span>08:00 - 12:00</span>
                        <span>12:00 - 16:00</span>
                        <span>16:00 - 20:00</span>
                        <span>20:00 - 00:00</span>
                      </div>
                    </div>

                    {[
                      { name: 'Dr. Ramesh Patil', shift: [1, 1, 1, 0], color: 'bg-blue-500' },
                      { name: 'Dr. Sunita Deshmukh', shift: [1, 1, 1, 0], color: 'bg-blue-500' },
                      { name: 'Dr. Anil Mehta', shift: [1, 1, 1, 0], color: 'bg-blue-500' },
                      { name: 'Nurse Sneha Patil', shift: [1, 1, 1, 0], color: 'bg-emerald-500' },
                      { name: 'Nurse Kavita R.', shift: [1, 1, 1, 0], color: 'bg-emerald-500' },
                      { name: 'Nurse Alok S.', shift: [1, 1, 1, 0], color: 'bg-emerald-500' },
                      { name: 'Nurse Sandeep K.', shift: [0, 0, 0, 1], color: 'bg-emerald-500' }
                    ].map((staffRow, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 hover:bg-slate-50 rounded">
                        <span className="w-24 font-bold text-slate-700 truncate">{staffRow.name}</span>
                        <div className="flex-1 grid grid-cols-4 gap-1">
                          {staffRow.shift.map((activeSegment, i) => (
                            <div
                              key={i}
                              className={`h-4.5 rounded-lg flex items-center justify-center font-bold text-[8px] text-white shadow-sm transition-all ${
                                activeSegment ? `${staffRow.color} opacity-90` : 'bg-slate-100 text-slate-400 shadow-none border border-slate-100/50'
                              }`}
                            >
                              {activeSegment ? 'ON DUTY' : 'OFF'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}

          {/* DEDICATED WORKSPACE: BLOOD BANK RESERVE */}
          {activeSection === 'blood_bank' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center rounded-2xl">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Blood Bank Emergency Reserve</h2>
                    <p className="text-[10px] text-slate-500">O Negative pre-orders, request logs, and compatibility registry.</p>
                  </div>
                </div>
              </div>

              {/* Grid Layout: Reserves and Request Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Reservoirs */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>Active Reservoirs</span>
                    <span className="text-[9px] text-slate-400 font-medium normal-case">Click units to simulate stock adjustments</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {bloodStocks.map((blood, idx) => (
                      <div key={blood.type} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-xs relative group">
                        <span className="font-bold text-slate-500 uppercase block">{blood.type}</span>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-2xl font-black text-slate-900">{blood.qty}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Units</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-1 truncate">{blood.alert}</span>
                        
                        <div className="w-full h-1 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                          <div className={`h-full ${blood.color}`} style={{ width: `${Math.min(100, (blood.qty / 30) * 100)}%` }} />
                        </div>

                        {/* Adjust stock steppers */}
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const updated = [...bloodStocks];
                              updated[idx].qty = Math.max(0, updated[idx].qty - 1);
                              setBloodStocks(updated);
                            }}
                            className="w-5 h-5 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                          >
                            -
                          </button>
                          <button
                            onClick={() => {
                              const updated = [...bloodStocks];
                              updated[idx].qty = Math.min(50, updated[idx].qty + 1);
                              setBloodStocks(updated);
                            }}
                            className="w-5 h-5 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dispatch Progress Tracker */}
                  <div className="space-y-3 mt-6 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase text-slate-900">Active Emergency Dispatches</h4>
                    {bloodRequests.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No active emergency dispatches in progress.</div>
                    ) : (
                      <div className="space-y-3">
                        {bloodRequests.map((req) => (
                          <div key={req.id} className="bg-slate-55 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
                            <div className="space-y-1 md:w-1/3">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${req.urgency === 'STAT' ? 'bg-red-500 animate-pulse' : req.urgency === 'URGENT' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                <span className="font-bold text-slate-800">{req.bloodType} Release</span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Patient: <span className="font-bold text-slate-700">{req.patientName}</span> (Bay {req.bayNum})
                              </div>
                              <div className="text-[9px] text-slate-400">Requested at {req.timestamp} • Units: {req.units}</div>
                            </div>

                            {/* Stepper progress */}
                            <div className="flex-1 flex items-center justify-between px-2 max-w-md relative">
                              {['RECEIVING', 'CROSS_MATCHING', 'DISPATCHED', 'DELIVERED'].map((step, sIdx) => {
                                const statuses = ['RECEIVING', 'CROSS_MATCHING', 'DISPATCHED', 'DELIVERED'];
                                const currentIdx = statuses.indexOf(req.status);
                                const isCompleted = sIdx <= currentIdx;
                                const isActive = sIdx === currentIdx;

                                return (
                                  <div key={step} className="flex flex-col items-center z-10 relative">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black border transition-all ${
                                      isCompleted 
                                        ? 'bg-rose-500 border-rose-500 text-white' 
                                        : 'bg-white border-slate-200 text-slate-400'
                                    } ${isActive ? 'ring-4 ring-rose-100 animate-pulse' : ''}`}>
                                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : sIdx + 1}
                                    </div>
                                    <span className="text-[8px] mt-1 font-bold text-slate-400 uppercase scale-90 whitespace-nowrap">
                                      {step.replace('_', ' ')}
                                    </span>
                                  </div>
                                );
                              })}
                              {/* Connector line */}
                              <div className="absolute top-3 left-6 right-6 h-0.5 bg-slate-100 -z-10" />
                              <div className="absolute top-3 left-6 h-0.5 bg-rose-500 -z-10 transition-all duration-500" style={{
                                width: req.status === 'DELIVERED' ? '100%' : req.status === 'DISPATCHED' ? '66%' : req.status === 'CROSS_MATCHING' ? '33%' : '0%'
                              }} />
                            </div>

                            <div>
                              {req.status !== 'DELIVERED' && (
                                <button
                                  onClick={() => {
                                    setBloodRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'DELIVERED' } : r));
                                    triggerToast('Blood Delivered', `${req.units} units of ${req.bloodType} delivered to Trauma Bay ${req.bayNum}.`, 'success');
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] px-2.5 py-1.5 rounded-lg border border-slate-200"
                                >
                                  Force Deliver
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Blood Release Form */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-rose-500" />
                    <span>Emergency Release Protocol</span>
                  </h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block">Select Blood Type</label>
                      <select 
                        value={bloodFormType} 
                        onChange={(e) => setBloodFormType(e.target.value)}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-semibold text-slate-700"
                      >
                        <option value="O Negative">O Negative (Universal)</option>
                        <option value="O Positive">O Positive</option>
                        <option value="A Positive">A Positive</option>
                        <option value="B Positive">B Positive</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-455 font-bold uppercase block">Target Bay</label>
                        <select 
                          value={bloodFormBay} 
                          onChange={(e) => setBloodFormBay(Number(e.target.value))}
                          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-semibold text-slate-700"
                        >
                          {[1, 2, 3, 4, 5, 6].map(bay => (
                            <option key={bay} value={bay}>Trauma Bay {bay}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-455 font-bold uppercase block">Units Required</label>
                        <input 
                          type="number" 
                          min={1} 
                          max={6}
                          value={bloodFormUnits} 
                          onChange={(e) => setBloodFormUnits(Number(e.target.value))}
                          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-semibold text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-455 font-bold uppercase block">Urgency Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['STAT', 'URGENT', 'ROUTINE'].map((urg) => (
                          <button
                            key={urg}
                            type="button"
                            onClick={() => setBloodFormUrgency(urg as any)}
                            className={`py-2 rounded-xl text-[9px] font-black border transition-all ${
                              bloodFormUrgency === urg 
                                ? urg === 'STAT' ? 'bg-red-50 border-red-200 text-red-700' : urg === 'URGENT' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-5 border-blue-200 text-blue-700'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {urg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] text-slate-455 font-bold uppercase block">Clinician Authorization PIN</label>
                        <span className="text-[8px] text-slate-400 font-bold">Default: 1234</span>
                      </div>
                      <input 
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        value={bloodFormPIN}
                        onChange={(e) => setBloodFormPIN(e.target.value)}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full text-center outline-none tracking-widest font-black"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (bloodFormPIN !== '1234') {
                          triggerToast('Authorization Failed', 'Invalid signature sign-off PIN.', 'error');
                          return;
                        }

                        // Subtract reserve
                        const stockIdx = bloodStocks.findIndex(b => b.type === bloodFormType);
                        if (stockIdx !== -1) {
                          const currentStock = bloodStocks[stockIdx].qty;
                          if (currentStock < bloodFormUnits) {
                            triggerToast('Insufficient Reserve', `Only ${currentStock} units of ${bloodFormType} available. Ordering restock.`, 'error');
                            return;
                          }
                          const updated = [...bloodStocks];
                          updated[stockIdx].qty -= bloodFormUnits;
                          setBloodStocks(updated);
                        }

                        // Add request
                        const newReq = {
                          id: `req-${Date.now()}`,
                          patientName: mappedBays.find(b => b.num === bloodFormBay)?.patient || 'Unknown Patient',
                          bayNum: bloodFormBay,
                          bloodType: bloodFormType,
                          units: bloodFormUnits,
                          status: 'RECEIVING' as const,
                          urgency: bloodFormUrgency,
                          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                        };

                        setBloodRequests(prev => [newReq, ...prev]);
                        setBloodFormPIN('');
                        triggerToast('Release Protocol Active', `Emergency O-Neg release dispatch protocol started.`, 'success');
                      }}
                      className="w-full bg-[#0A5BFF] hover:bg-blue-800 text-white font-black py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-350" />
                      <span>DEPLOY DISPATCH PROTOCOL</span>
                    </button>
                  </div>

                  {/* Compatibility Registry Table */}
                  <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-500 space-y-2">
                    <span className="font-bold text-slate-700 block uppercase text-[9px]">Emergency Cross-Match Chart</span>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-rose-600">O Negative (O-)</span>
                      <span className="text-slate-500 text-right">Universal Donor. Can be given to any patient in extreme emergent trauma.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: PHARMACY CART */}
          {activeSection === 'pharmacy' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-55 text-[#0A5BFF] border border-blue-200 rounded-2xl flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Trauma Pharmacy Dispensary Cart</h2>
                    <p className="text-[10px] text-slate-500">Critical care pharmaceutical inventories, administration ledger, and restocks.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vasoactives & Resus Med Stocks */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">Vasoactives & Resus Medications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medStocks.map((med, idx) => {
                        const percent = (med.qty / med.max) * 100;
                        const isLow = med.qty <= med.max * 0.3;

                        return (
                          <div key={med.name} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center text-xs relative group">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 block">{med.name}</span>
                              <span className="text-[10px] text-slate-400 block">Stock Level: {med.qty} / {med.max}</span>
                              <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full ${isLow ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                isLow ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {isLow ? 'LOW RESERVES' : 'IN STOCK'}
                              </span>

                              <button
                                onClick={() => {
                                  // Restock simulation
                                  const updated = [...medStocks];
                                  updated[idx].qty = med.max;
                                  updated[idx].status = 'IN STOCK';
                                  setMedStocks(updated);
                                  triggerToast('Restock Dispatch', `Order for ${med.name} refill sent to Sion warehouse.`, 'success');
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[9px] px-2 py-1 rounded flex items-center space-x-1"
                              >
                                <RefreshCw className="w-3 h-3 text-[#0A5BFF]" />
                                <span>Refill</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Administration Ledger */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-black uppercase text-slate-900">Active Administration Ledger</h3>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden text-xs">
                      <div className="grid grid-cols-4 gap-4 p-3 bg-slate-100 font-bold text-slate-500 border-b border-slate-200 uppercase text-[9px]">
                        <span>Timestamp</span>
                        <span>Bay Target</span>
                        <span>Medication</span>
                        <span>Administered By</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-200">
                        {medLogs.map((log, i) => (
                          <div key={i} className="grid grid-cols-4 gap-4 p-3 hover:bg-slate-100/50 items-center">
                            <span className="font-mono text-slate-400">{log.timestamp}</span>
                            <span className="font-bold text-slate-800">Trauma Bay {log.bayNum}</span>
                            <div>
                              <span className="font-bold text-slate-800 block">{log.medName}</span>
                              <span className="text-[9px] text-slate-400">{log.dosage}</span>
                            </div>
                            <span className="text-slate-600">{log.adminBy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Administer Medication Form */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-[#0A5BFF]" />
                    <span>Log Drug Administration</span>
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-455 font-bold uppercase block">Target Bay</label>
                      <select 
                        value={medFormBay} 
                        onChange={(e) => setMedFormBay(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-semibold text-slate-700"
                      >
                        {[1, 2, 3, 4, 5, 6].map(bay => (
                          <option key={bay} value={bay}>Trauma Bay {bay}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-455 font-bold uppercase block">Select Medication</label>
                      <select 
                        value={medFormMed} 
                        onChange={(e) => setMedFormMed(e.target.value)}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-semibold text-slate-700"
                      >
                        {medStocks.map((med) => (
                          <option key={med.id} value={med.id}>{med.name} (Qty: {med.qty})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-455 font-bold uppercase block">Dosage administered</label>
                      <input 
                        type="text" 
                        value={medFormDosage} 
                        onChange={(e) => setMedFormDosage(e.target.value)}
                        placeholder="e.g. 1mg IV Push"
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-semibold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-455 font-bold uppercase block">Administering Clinician</label>
                      <input 
                        type="text" 
                        value={medFormClinician} 
                        onChange={(e) => setMedFormClinician(e.target.value)}
                        placeholder="Clinician name"
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-semibold text-slate-700"
                      />
                    </div>

                    <button
                      onClick={() => {
                        const selectedIndex = medStocks.findIndex(m => m.id === medFormMed);
                        if (selectedIndex === -1) return;
                        
                        const selectedMed = medStocks[selectedIndex];
                        if (selectedMed.qty <= 0) {
                          triggerToast('Stock Depleted', `${selectedMed.name} is out of stock. Order a restock first.`, 'error');
                          return;
                        }

                        // Subtract stock
                        const updatedStocks = [...medStocks];
                        updatedStocks[selectedIndex].qty -= 1;
                        setMedStocks(updatedStocks);

                        // Append to log
                        const newLog = {
                          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                          bayNum: medFormBay,
                          medName: selectedMed.name,
                          dosage: medFormDosage,
                          adminBy: medFormClinician
                        };

                        setMedLogs(prev => [newLog, ...prev]);
                        triggerToast('Administration Logged', `${selectedMed.name} registered for Trauma Bay ${medFormBay}.`, 'success');
                      }}
                      className="w-full bg-[#0A5BFF] hover:bg-blue-800 text-white font-black py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>RECORD DRUG DISPENSAL</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: SETTINGS CONTROL */}
          {activeSection === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0A5BFF] border border-blue-200 rounded-2xl flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">System Settings & Threshold Configurations</h2>
                    <p className="text-[10px] text-slate-500">Configure safety trigger limits, simulation modules, and alerts.</p>
                  </div>
                </div>
              </div>

              {/* Bento grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* AI alert thresholds */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>AI Alert Threshold Limits</span>
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold uppercase">Critical SpO2 Threshold (%)</label>
                      <input
                        type="number"
                        value={settingsThresholds.spo2Critical}
                        onChange={(e) => setSettingsThresholds({ ...settingsThresholds, spo2Critical: Number(e.target.value) })}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-455 block font-bold uppercase">Critical HR High Limit (bpm)</label>
                      <input
                        type="number"
                        value={settingsThresholds.hrCriticalHigh}
                        onChange={(e) => setSettingsThresholds({ ...settingsThresholds, hrCriticalHigh: Number(e.target.value) })}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-455 block font-bold uppercase">Critical HR Low Limit (bpm)</label>
                      <input
                        type="number"
                        value={settingsThresholds.hrCriticalLow}
                        onChange={(e) => setSettingsThresholds({ ...settingsThresholds, hrCriticalLow: Number(e.target.value) })}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-455 block font-bold uppercase">Critical GCS Index Limit</label>
                      <input
                        type="number"
                        value={settingsThresholds.gcsThreshold}
                        onChange={(e) => setSettingsThresholds({ ...settingsThresholds, gcsThreshold: Number(e.target.value) })}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-bold"
                      />
                    </div>

                    <button
                      onClick={() => triggerToast('Configuration Saved', 'AI Alert limits saved to system runtime.', 'success')}
                      className="w-full bg-[#0A5BFF] hover:bg-blue-800 text-white font-black py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>

                {/* Simulation & Operations Panel */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Active Operations Panel</span>
                  </h3>
                  <div className="space-y-4 text-xs font-semibold">
                    {/* Toggle telemetry simulation */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div>
                        <span className="font-bold text-slate-800 block">Telemetry Simulation</span>
                        <span className="text-[9px] text-slate-400 font-normal">Real-time vital drift and ECG sparkline fluctuations</span>
                      </div>
                      <button
                        onClick={() => {
                          setSimulationEnabled(!simulationEnabled);
                          triggerToast('Simulation Updated', `Vitals drift simulation turned ${!simulationEnabled ? 'ON' : 'OFF'}.`, 'info');
                        }}
                        className={`w-12 h-6.5 rounded-full p-1 transition-all ${simulationEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full transition-all ${simulationEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Sound alarms */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div>
                        <span className="font-bold text-slate-800 block">Audio Broadcast Alarms</span>
                        <span className="text-[9px] text-slate-400 font-normal">Trigger synthetic alert tones for critical triage vitals</span>
                      </div>
                      <button
                        onClick={() => {
                          setSoundAlarms(!soundAlarms);
                          triggerToast('Alarms Sound', `Audible broadcast alarms ${!soundAlarms ? 'ENABLED' : 'DISABLED'}.`, 'info');
                        }}
                        className={`w-12 h-6.5 rounded-full p-1 transition-all ${soundAlarms ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full transition-all ${soundAlarms ? 'translate-x-5.5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Auto route */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div>
                        <span className="font-bold text-slate-800 block">Smart Triage Auto-Routing</span>
                        <span className="text-[9px] text-slate-400 font-normal">Auto-assign RED level patients to available trauma bays</span>
                      </div>
                      <button
                        onClick={() => {
                          setAutoRouteBays(!autoRouteBays);
                          triggerToast('Smart Routing', `Triage bay auto-routing ${!autoRouteBays ? 'ENABLED' : 'DISABLED'}.`, 'info');
                        }}
                        className={`w-12 h-6.5 rounded-full p-1 transition-all ${autoRouteBays ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full transition-all ${autoRouteBays ? 'translate-x-5.5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Hospital Site Selection */}
                    <div className="space-y-1 pt-2">
                      <label className="text-[9px] text-slate-455 font-bold uppercase block">Hospital Location Site</label>
                      <select
                        value={hospitalLocation}
                        onChange={(e) => {
                          setHospitalLocation(e.target.value);
                          triggerToast('Site Changed', `Hospital context updated to ${e.target.value}.`, 'success');
                        }}
                        className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none font-bold text-slate-700"
                      >
                        <option value="Sion General Hospital (MCGM)">Sion General Hospital (MCGM)</option>
                        <option value="KEM Hospital (MCGM)">KEM Hospital (MCGM)</option>
                        <option value="Nair General Hospital (MCGM)">Nair General Hospital (MCGM)</option>
                        <option value="Cooper Trauma Care (MCGM)">Cooper Trauma Care (MCGM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hospital Protocol Constants (Read-only Reference Card) */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-rose-500" />
                      <span>Hospital Protocols Rota</span>
                    </h3>
                    
                    <div className="space-y-3.5 text-xs text-slate-600">
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold">Red Triage Trigger</span>
                        <span className="font-mono text-slate-500 bg-rose-50 text-rose-600 px-2 py-0.5 rounded">RTS &lt; 6, GCS &lt; 9</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold">Golden Hour Limit</span>
                        <span className="font-mono text-slate-500 bg-amber-50 text-amber-600 px-2 py-0.5 rounded">60 minutes</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold">Blood Restock Limit</span>
                        <span className="font-mono text-slate-500 bg-slate-100 text-slate-700 px-2 py-0.5 rounded">&lt; 10 Units O-</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold">Incident Broadcast</span>
                        <span className="font-mono text-slate-500 bg-blue-50 text-[#0A5BFF] px-2 py-0.5 rounded">Enabled via webhook</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSettingsThresholds({
                        spo2Critical: 90,
                        hrCriticalHigh: 120,
                        hrCriticalLow: 50,
                        rrCritical: 28,
                        gcsThreshold: 10
                      });
                      setSimulationEnabled(true);
                      setSoundAlarms(false);
                      setAutoRouteBays(false);
                      setHospitalLocation('Sion General Hospital (MCGM)');
                      triggerToast('Protocols Reset', 'Standard hospital configuration defaults restored.', 'info');
                    }}
                    className="w-full bg-slate-200 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-xl transition-all border border-slate-200 cursor-pointer"
                  >
                    Restore Protocol Defaults
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: CLINICAL TRIAGE */}
          {activeSection === 'triage' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0A5BFF] border border-blue-200 rounded-2xl flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Clinical Triage & Risk Desk</h2>
                    <p className="text-[10px] text-slate-500">Calculate GCS/RTS priority scores and assign trauma categories.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Left Side: Patients requiring triage */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">Awaiting/Active Patients</h3>
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {patients.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPatient(p);
                            setTriageInputs({
                              gcsEye: 4,
                              gcsVerbal: 5,
                              gcsMotor: 6,
                              rrRate: p.vitals.rr || 18,
                              sysBP: parseInt(p.vitals.bp.split('/')[0]) || 120,
                              heartRate: p.vitals.hr || 80
                            });
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            selectedPatient?.id === p.id ? 'border-[#0A5BFF] bg-blue-50/10' : 'border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                              <p className="text-[9px] text-slate-500">Age/Gender: {p.age} {p.gender} • HR: {p.vitals.hr} | SpO2: {p.vitals.spo2}%</p>
                            </div>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                              p.triageCategory === 'RED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              p.triageCategory === 'YELLOW' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              p.triageCategory === 'GREEN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              'bg-slate-100 text-slate-500'
                            }`}>{p.triageCategory}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: GCS/RTS Calculator */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  {selectedPatient ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-[8px] font-black uppercase bg-blue-50 text-[#0A5BFF] px-2 py-0.5 rounded-full">Intake Selected</span>
                        <h3 className="text-base font-black text-slate-900 mt-2">{selectedPatient.name}</h3>
                        <p className="text-[10px] text-slate-500">Ailment: {selectedPatient.injuryMechanism || 'Trauma intake'}</p>
                      </div>

                      {/* Calculator inputs */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 block font-bold uppercase">GCS Eye Response</label>
                          <select
                            value={triageInputs.gcsEye}
                            onChange={(e) => setTriageInputs({ ...triageInputs, gcsEye: Number(e.target.value) })}
                            className="bg-slate-50 border border-slate-200 p-2 rounded-xl w-full outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value={4}>4 - Spontaneous</option>
                            <option value={3}>3 - To speech</option>
                            <option value={2}>2 - To pain</option>
                            <option value={1}>1 - None</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 block font-bold uppercase">GCS Verbal Response</label>
                          <select
                            value={triageInputs.gcsVerbal}
                            onChange={(e) => setTriageInputs({ ...triageInputs, gcsVerbal: Number(e.target.value) })}
                            className="bg-slate-50 border border-slate-200 p-2 rounded-xl w-full outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value={5}>5 - Oriented</option>
                            <option value={4}>4 - Confused</option>
                            <option value={3}>3 - Inappropriate</option>
                            <option value={2}>2 - Incomprehensible</option>
                            <option value={1}>1 - None</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] text-slate-400 block font-bold uppercase">GCS Motor Response</label>
                          <select
                            value={triageInputs.gcsMotor}
                            onChange={(e) => setTriageInputs({ ...triageInputs, gcsMotor: Number(e.target.value) })}
                            className="bg-slate-50 border border-slate-200 p-2 rounded-xl w-full outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value={6}>6 - Obeys commands</option>
                            <option value={5}>5 - Localizes pain</option>
                            <option value={4}>4 - Withdraws (pain)</option>
                            <option value={3}>3 - Flexion (decorticate)</option>
                            <option value={2}>2 - Extension (decerebrate)</option>
                            <option value={1}>1 - None</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 block font-bold uppercase">Systolic BP (mmHg)</label>
                          <input
                            type="number"
                            value={triageInputs.sysBP}
                            onChange={(e) => setTriageInputs({ ...triageInputs, sysBP: Number(e.target.value) })}
                            className="bg-slate-50 border border-slate-200 p-2 rounded-xl w-full outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 block font-bold uppercase">Respiratory Rate (bpm)</label>
                          <input
                            type="number"
                            value={triageInputs.rrRate}
                            onChange={(e) => setTriageInputs({ ...triageInputs, rrRate: Number(e.target.value) })}
                            className="bg-slate-50 border border-slate-200 p-2 rounded-xl w-full outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Display calculations */}
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3 text-[10px] font-bold">
                        <div className="flex justify-between items-center text-xs">
                          <span>Trauma Score Calculations</span>
                          <span className="text-[#0A5BFF]">AI Core Active</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">GCS Total</span>
                            <span className="text-base font-black text-slate-900 block mt-0.5">
                              {triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor} / 15
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">RTS Score</span>
                            <span className="text-base font-black text-slate-900 block mt-0.5">
                              {(
                                (triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor <= 3 ? 0 : triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor <= 8 ? 1 : 2) * 0.93 +
                                (triageInputs.sysBP < 50 ? 0 : triageInputs.sysBP < 76 ? 1 : 4) * 0.73 +
                                (triageInputs.rrRate < 10 ? 1 : triageInputs.rrRate < 30 ? 4 : 3) * 0.29
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Suggested Triage</span>
                            <span className={`text-base font-black block mt-0.5 ${
                              triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor <= 8 ? 'text-rose-600' :
                              triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor <= 12 ? 'text-amber-500' :
                              'text-emerald-600'
                            }`}>
                              {triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor <= 8 ? 'RED' :
                               triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor <= 12 ? 'YELLOW' :
                               'GREEN'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Confirm Button */}
                      <button
                        onClick={() => {
                          const score = triageInputs.gcsEye + triageInputs.gcsVerbal + triageInputs.gcsMotor;
                          const category = score <= 8 ? 'RED' : score <= 12 ? 'YELLOW' : 'GREEN';
                          handleConfirmTriage(selectedPatient.id, category);
                        }}
                        className="bg-[#0A5BFF] hover:bg-blue-800 text-white font-bold py-3.5 rounded-2xl w-full text-xs shadow-sm cursor-pointer"
                      >
                        Confirm & Lock Triage Priority
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center text-slate-400 h-64">
                      <Activity className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                      <span className="text-xs font-bold text-slate-500">Select a Patient to Load the Triage Desk</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: INCIDENTS COMMAND */}
          {activeSection === 'incidents' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Disaster Command & Incident Registry</h2>
                    <p className="text-[10px] text-slate-500">Log mass-casualty incidents, route emergency responders, and manage disaster status.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500">DISASTER MODE:</span>
                  <button
                    onClick={() => {
                      setIsDisasterMode(!isDisasterMode);
                      triggerToast(isDisasterMode ? 'Disaster Mode Deactivated' : 'Disaster Mode Active', 'Alert sent to municipal coordinators.', 'warning');
                    }}
                    className={`text-[10px] font-bold px-4 py-2 rounded-full border transition-all ${
                      isDisasterMode 
                        ? 'bg-rose-600 text-white border-rose-700 animate-pulse animate-duration-1000' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isDisasterMode ? 'ACTIVE ON' : 'STANDBY OFF'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Left Side: Active Incidents */}
                <div className="col-span-12 lg:col-span-7 space-y-4">
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">Active Mass Casualty Incidents</h3>
                    <div className="space-y-3">
                      {incidents.length > 0 ? (
                        incidents.map(inc => (
                          <div key={inc.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <span className="font-black text-slate-900 block">{inc.title}</span>
                              <span className="text-[9px] text-slate-500 block font-bold">Loc: {inc.location} • Victims: {inc.victimsCount}</span>
                            </div>
                            <div className="text-right space-y-1">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                inc.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-amber-50 text-amber-600'
                              }`}>{inc.severity}</span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">{new Date(inc.reportedAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 font-medium">No active disaster incidents reported.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Log Incident Form */}
                <div className="col-span-12 lg:col-span-5">
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">Log Disaster Incident</h3>
                    <form onSubmit={handleCreateIncident} className="space-y-4 text-xs font-semibold text-slate-600">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 block font-bold uppercase">Incident Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Expressway Collision near Chembur"
                          value={newPatientInput.name}
                          onChange={(e) => setNewPatientInput({ ...newPatientInput, name: e.target.value })}
                          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 block font-bold uppercase">Pickup Location / Catchment</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. WEH Flyover, Sion South"
                          value={newPatientInput.injuryMechanism}
                          onChange={(e) => setNewPatientInput({ ...newPatientInput, injuryMechanism: e.target.value })}
                          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl w-full text-xs shadow-sm cursor-pointer transition-all"
                      >
                        File Incident & Dispatch Alert
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: INCOMING DISPATCH */}
          {activeSection === 'incoming' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-650 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Siren className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">En-Route Trauma Fleet Control</h2>
                    <p className="text-[10px] text-slate-500">Live GPS tracking, real-time paramedic ECG telemetry streams, and emergency pre-allocation of trauma bays.</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-[9px] font-bold text-rose-700 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                    <span>2 PATIENTS EN-ROUTE</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[9px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    <span>3 FLEET UNITS ONLINE</span>
                  </span>
                </div>
              </div>

              {/* KPI Summaries Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Active Transits</span>
                    <span className="text-xl font-black text-slate-900 block mt-0.5">2 ALS Trucks</span>
                    <span className="text-[8px] text-indigo-500 block mt-0.5 font-bold">100% telemetry online</span>
                  </div>
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center">
                    <Ambulance className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Median Transit ETA</span>
                    <span className="text-xl font-black text-[#0A5BFF] block mt-0.5">5.5 mins</span>
                    <span className="text-[8px] text-emerald-600 block mt-0.5 font-bold">Green Corridor active</span>
                  </div>
                  <div className="w-9 h-9 bg-blue-50 text-[#0A5BFF] rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-rose-500 block uppercase tracking-wider">Resus Alert</span>
                    <span className="text-xl font-black text-rose-700 block mt-0.5">1 RED Alert</span>
                    <span className="text-[8px] text-rose-600 block mt-0.5 font-bold">Resus bay pre-routed</span>
                  </div>
                  <div className="w-9 h-9 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center animate-bounce">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Resus Bays Free</span>
                    <span className="text-xl font-black text-emerald-600 block mt-0.5">1 Bay Available</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5 font-bold">Bay 4 Standby</span>
                  </div>
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Main Workspace grid */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left Side: Fleet List */}
                <div className="col-span-12 lg:col-span-7 space-y-4">
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-black uppercase text-slate-900">Active Fleet & Patient Telemetry</h3>
                      <span className="text-[8px] text-slate-400 font-mono">Auto-syncing every 2s</span>
                    </div>

                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                      {ambulances.map(amb => {
                        const matchedReg = patientsData?.find(p => p.id === amb.assignedPatientId || p.patient_id === amb.assignedPatientId);
                        const isSelected = activeAmbulanceId === amb.id;
                        const isTraumaActive = activeTraumaCode?.ambulanceId === amb.id;

                        return (
                          <div 
                            key={amb.id} 
                            onClick={() => setActiveAmbulanceId(amb.id)}
                            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 relative ${
                              isTraumaActive
                                ? 'bg-red-50/70 border-red-500 shadow-lg shadow-red-500/10 ring-2 ring-red-500/20'
                                : isSelected 
                                  ? 'bg-slate-50/50 border-[#0A5BFF] shadow-sm' 
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  amb.status === 'TRANSPORTING' ? 'bg-[#0A5BFF]/10 text-[#0A5BFF]' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  <Ambulance className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-black text-slate-900 text-[11px]">{amb.id}</span>
                                    <span className="text-[8px] text-slate-400">• {amb.type} Class</span>
                                  </div>
                                  <span className="text-[9px] text-slate-500 block mt-0.5">Crew: {amb.paramedic} (MD) • {amb.driver} (Pilot)</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                  amb.status === 'TRANSPORTING'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200 animate-pulse'
                                    : amb.status === 'AVAILABLE'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {amb.status}
                                </span>
                              </div>
                            </div>

                            {/* Equipment Check & Consumables */}
                            <div className="grid grid-cols-4 gap-2 bg-slate-50/80 p-2.5 rounded-2xl text-[9px] border border-slate-100">
                              <div>
                                <span className="text-slate-400 block text-[8px] uppercase font-bold">Fuel Reserves</span>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${amb.fuel}%` }} />
                                  </div>
                                  <span className="font-bold text-slate-700">{amb.fuel}%</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[8px] uppercase font-bold">O2 Saturation</span>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${amb.equipmentCheck.oxygen}%` }} />
                                  </div>
                                  <span className="font-bold text-slate-700">{amb.equipmentCheck.oxygen}%</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-slate-600 font-bold">Ventilator</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-slate-600 font-bold">AED</span>
                              </div>
                            </div>

                            {/* Patient Triage & Vitals Panel */}
                            {matchedReg ? (
                              <div className="border-t border-slate-100 pt-3 space-y-3">
                                {/* Patient metadata */}
                                <div className="flex justify-between items-center text-[10px]">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-black text-slate-800 text-[11px]">{matchedReg.patient?.name}</span>
                                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{matchedReg.patient?.age}{matchedReg.patient?.gender?.[0]}</span>
                                  </div>
                                  <span className="text-rose-600 font-black flex items-center space-x-1">
                                    <Clock className="w-3.5 h-3.5 animate-spin" />
                                    <span>ETA: {amb.id === 'AMB-MCGM-03' ? Math.max(1, Math.round(4 - (mapSimulationProgress - 30) / 15)) : 8} mins</span>
                                  </span>
                                </div>

                                {/* Vital Signs metrics */}
                                <div className="grid grid-cols-6 gap-2 text-center">
                                  <div className="bg-rose-50 border border-rose-100 p-1.5 rounded-xl">
                                    <span className="text-[7px] font-bold text-rose-500 block uppercase">HR (BPM)</span>
                                    <span className="text-[11px] font-black text-rose-700 block mt-0.5 flex items-center justify-center gap-0.5">
                                      <Heart className="w-3 h-3 text-rose-600 fill-rose-600 animate-pulse" />
                                      {matchedReg.latest_vitals?.heart_rate || 80}
                                    </span>
                                  </div>
                                  <div className="bg-sky-50 border border-sky-100 p-1.5 rounded-xl">
                                    <span className="text-[7px] font-bold text-sky-500 block uppercase">SpO2 (%)</span>
                                    <span className="text-[11px] font-black text-sky-700 block mt-0.5">
                                      {matchedReg.latest_vitals?.spo2 || 98}%
                                    </span>
                                  </div>
                                  <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-xl">
                                    <span className="text-[7px] font-bold text-indigo-500 block uppercase">NIBP (mmHg)</span>
                                    <span className="text-[10px] font-black text-indigo-700 block mt-0.5">
                                      {matchedReg.latest_vitals?.systolic_bp}/{matchedReg.latest_vitals?.diastolic_bp}
                                    </span>
                                  </div>
                                  <div className="bg-amber-50 border border-amber-100 p-1.5 rounded-xl">
                                    <span className="text-[7px] font-bold text-amber-600 block uppercase">Resp Rate</span>
                                    <span className="text-[11px] font-black text-amber-800 block mt-0.5">
                                      {matchedReg.latest_vitals?.respiratory_rate || 18}
                                    </span>
                                  </div>
                                  <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-xl">
                                    <span className="text-[7px] font-bold text-emerald-500 block uppercase">GCS Total</span>
                                    <span className="text-[11px] font-black text-emerald-700 block mt-0.5">
                                      {matchedReg.triage?.gcs_total || 15}
                                    </span>
                                  </div>
                                  <div className={`p-1.5 rounded-xl border ${
                                    matchedReg.triage?.category === 'RED'
                                      ? 'bg-red-600 border-red-700 text-white'
                                      : 'bg-yellow-500 border-yellow-605 text-white'
                                  }`}>
                                    <span className="text-[7px] font-bold opacity-90 block uppercase">Triage</span>
                                    <span className="text-[10px] font-black block mt-0.5">
                                      {matchedReg.triage?.category || 'PENDING'}
                                    </span>
                                  </div>
                                </div>

                                {/* ECG Canvas Stream */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[7px] text-slate-400 font-mono">
                                    <span>ECG CHANNEL I (II - LEADS V5)</span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                      <span>REAL-TIME STREAMING</span>
                                    </span>
                                  </div>
                                  <EcgWaveform 
                                    hr={matchedReg.latest_vitals?.heart_rate || 80} 
                                    color={matchedReg.triage?.category === 'RED' ? '#ef4444' : '#eab308'} 
                                    speed={2} 
                                  />
                                </div>

                                {/* Paramedic Notes & AI Insight */}
                                <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 border border-slate-100">
                                  <div className="flex items-center space-x-1.5">
                                    <Brain className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[8px] font-black uppercase text-slate-700 tracking-wider">AI Clinical Pre-Arrival Summary</span>
                                  </div>
                                  <p className="text-[9px] text-slate-600 leading-normal">
                                    {matchedReg.injury_mechanism}
                                  </p>
                                  {matchedReg.triage?.ai_reasoning && (
                                    <div className="text-[8px] text-[#0A5BFF] bg-blue-50/50 p-1.5 rounded border border-blue-100/50 mt-1 font-bold">
                                      AI Pre-Route: {matchedReg.triage.ai_reasoning}
                                    </div>
                                  )}
                                </div>

                                {/* Actions & Bay Allocation */}
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[8.5px] font-black text-slate-600 uppercase">Pre-Assign Bay:</span>
                                    <select
                                      value={matchedReg.active_bay?.bay?.bay_number || ''}
                                      onChange={async (e) => {
                                        const bayId = e.target.value;
                                        if (!bayId) return;
                                        try {
                                          await assignPatientToBayMutation.mutateAsync({
                                            registrationId: matchedReg.id,
                                            patientId: matchedReg.patient_id,
                                            bayId
                                          });
                                          triggerToast('Trauma Bay Reserved', `Reserved Bay for ${matchedReg.patient?.name}`, 'success');
                                        } catch (err) {
                                          triggerToast('Bay Assignment Failed', 'Database update error.', 'error');
                                        }
                                      }}
                                      className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[9px] font-bold outline-none cursor-pointer hover:border-slate-400"
                                    >
                                      <option value="">Select Bay...</option>
                                      {mappedBays.map(b => (
                                        <option key={b.id || b.num} value={b.id || String(b.num)}>
                                          Bay {b.num} ({b.status === 'AVAILABLE' ? 'VACANT' : b.status})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex-1" />

                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        if (isTraumaActive) {
                                          setActiveTraumaCode(null);
                                        } else {
                                          setActiveTraumaCode({ ambulanceId: amb.id, type: 'RED' });
                                          triggerToast('Trauma Team Paged', `Trauma Code Red dispatched to Sion Trauma Team.`, 'warning');
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all flex items-center space-x-1 ${
                                        isTraumaActive
                                          ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                      }`}
                                    >
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>{isTraumaActive ? 'CANCEL CODE RED' : 'TRIGGER CODE RED'}</span>
                                    </button>

                                    <button 
                                      onClick={() => {
                                        triggerToast('Telemedicine Live Link', 'Connecting to paramedic bodycam stream...', 'info');
                                      }}
                                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center space-x-1 cursor-pointer"
                                    >
                                      <Video className="w-3 h-3" />
                                      <span>BODYCAM LIVE</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 text-center py-2">
                                No active dispatch registration. Standby/Available status.
                              </div>
                            )}

                            {/* Flash alert cover when trauma code is active */}
                            {isTraumaActive && (
                              <div className="absolute inset-0 bg-rose-500/5 rounded-3xl pointer-events-none animate-pulse border-2 border-rose-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Map & Communications Log */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                  {/* GIS Radar Map */}
                  <div className="bg-[#0f172a] rounded-3xl p-5 border border-slate-800 text-white space-y-4 h-[350px] flex flex-col justify-between shadow-xl shadow-slate-900/40">
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <Map className="w-4 h-4 text-sky-400" />
                        <span className="text-sky-400 font-bold uppercase tracking-wider">Sion Hospital Catchment GIS Tracker</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse border border-emerald-500/20">GPS FEED ACTIVE</span>
                    </div>

                    <div className="flex-1 bg-slate-950 rounded-2xl relative border border-slate-900 overflow-hidden flex items-center justify-center p-4">
                      {/* Grid representation */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:15px_15px]" />
                      
                      {/* Stylized routes paths */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                        {/* Route A: WEH Bandra */}
                        <path 
                          d="M 40 60 Q 100 90 170 110 T 250 150" 
                          fill="none" 
                          stroke="rgba(14, 165, 233, 0.4)" 
                          strokeWidth="2.5" 
                          strokeDasharray="4 3" 
                        />
                        {/* Route B: Eastern Express Dadar */}
                        <path 
                          d="M 440 50 Q 380 80 310 110 T 250 150" 
                          fill="none" 
                          stroke="rgba(245, 158, 11, 0.4)" 
                          strokeWidth="2.5" 
                          strokeDasharray="4 3" 
                        />
                        {/* Route C: Dharavi Junction */}
                        <path 
                          d="M 110 250 Q 170 200 250 150" 
                          fill="none" 
                          stroke="rgba(16, 185, 129, 0.3)" 
                          strokeWidth="2" 
                          strokeDasharray="4 3" 
                        />

                        {/* concentric radar circular lines around Sion Hospital Base */}
                        <circle cx="250" cy="150" r="30" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" className="animate-ping" style={{ transformOrigin: 'center' }} />
                        <circle cx="250" cy="150" r="60" fill="none" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="1" />
                        <circle cx="250" cy="150" r="90" fill="none" stroke="rgba(14, 165, 233, 0.05)" strokeWidth="1" />

                        {/* Landmark Pins */}
                        {/* WEH Bandra */}
                        <g transform="translate(40, 60)">
                          <circle cx="0" cy="0" r="4" fill="#0ea5e9" />
                          <text x="6" y="3" fontSize="8" fill="#94a3b8" fontFamily="monospace">WEH Bandra</text>
                        </g>
                        {/* Sion Circle */}
                        <g transform="translate(440, 50)">
                          <circle cx="0" cy="0" r="4" fill="#f59e0b" />
                          <text x="-65" y="3" fontSize="8" fill="#94a3b8" fontFamily="monospace">Sion Circle</text>
                        </g>
                        {/* Dharavi */}
                        <g transform="translate(110, 250)">
                          <circle cx="0" cy="0" r="4" fill="#10b981" />
                          <text x="6" y="3" fontSize="8" fill="#94a3b8" fontFamily="monospace">Dharavi Link</text>
                        </g>

                        {/* Animated Ambulances Markers */}
                        {/* AMB-03 Marker */}
                        {(() => {
                          const routePoints: [number, number][] = [[40, 60], [100, 90], [170, 110], [220, 130], [250, 150]];
                          const pos = getInterpolatedCoords(routePoints, mapSimulationProgress);
                          const isFocused = activeAmbulanceId === 'AMB-MCGM-03';
                          return (
                            <g 
                              transform={`translate(${pos.x}, ${pos.y})`} 
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAmbulanceId('AMB-MCGM-03');
                              }}
                            >
                              <circle cx="0" cy="0" r="11" fill={isFocused ? '#0ea5e9' : '#0A5BFF'} stroke="#ffffff" strokeWidth="1.5" className="shadow-md" />
                              <circle cx="0" cy="0" r="15" fill="none" stroke="#0ea5e9" strokeWidth="1" className="animate-ping" style={{ transformOrigin: 'center' }} />
                              <text x="0" y="2.5" textAnchor="middle" fontSize="6.5" fill="#ffffff" fontWeight="black" fontFamily="sans-serif">03</text>
                            </g>
                          );
                        })()}

                        {/* AMB-09 Marker */}
                        {(() => {
                          const routePoints: [number, number][] = [[440, 50], [380, 80], [310, 110], [275, 135], [250, 150]];
                          // AMB-09 is further back, offset progress
                          const p = Math.min(95, mapSimulationProgress - 15);
                          const pos = getInterpolatedCoords(routePoints, p);
                          const isFocused = activeAmbulanceId === 'AMB-MCGM-09';
                          return (
                            <g 
                              transform={`translate(${pos.x}, ${pos.y})`} 
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAmbulanceId('AMB-MCGM-09');
                              }}
                            >
                              <circle cx="0" cy="0" r="11" fill={isFocused ? '#f59e0b' : '#d97706'} stroke="#ffffff" strokeWidth="1.5" className="shadow-md" />
                              <circle cx="0" cy="0" r="15" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" style={{ transformOrigin: 'center' }} />
                              <text x="0" y="2.5" textAnchor="middle" fontSize="6.5" fill="#ffffff" fontWeight="black" fontFamily="sans-serif">09</text>
                            </g>
                          );
                        })()}

                        {/* Sion Hospital Base Center Pin */}
                        <g transform="translate(250, 150)">
                          <circle cx="0" cy="0" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="shadow-lg" />
                          <circle cx="0" cy="0" r="12" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-pulse" />
                          <text x="0" y="-12" textAnchor="middle" fontSize="8.5" fill="#ffffff" fontWeight="black" fontFamily="sans-serif">SION BASE</text>
                        </g>
                      </svg>

                      {/* Floating zoom overlay indicator */}
                      <div className="absolute top-2 right-2 bg-slate-900/80 border border-slate-800 text-[8px] font-mono px-2 py-1 rounded-lg">
                        Scale: 1:12,500
                      </div>

                      {/* Map Status Indicators at the bottom */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between text-[8px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                        <span>AMB-03: {(100 - mapSimulationProgress).toFixed(0)}% to arrival</span>
                        <span>AMB-09: {(100 - Math.min(95, mapSimulationProgress - 15)).toFixed(0)}% to arrival</span>
                      </div>
                    </div>
                  </div>

                  {/* Paramedics Communications log & Quick Dispatch Center */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-black uppercase text-slate-900">Paramedic Dispatch Radio Feed</h4>
                      </div>
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    </div>

                    {/* Radio Logs list */}
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      <div className="bg-slate-50 p-2.5 rounded-xl text-[9.5px] border border-slate-100 space-y-1">
                        <div className="flex justify-between text-slate-400 font-mono text-[8px]">
                          <span className="font-bold text-slate-600">AMB-03 (Dr. Alok Mehta)</span>
                          <span>10:48 AM</span>
                        </div>
                        <p className="text-slate-700 leading-normal">
                          "Active chest decompression performed. Oxygen saturation stable at 89% on ventilator. Heart rate 124 bpm, blood pressure 88/54. ETA 3 minutes, request trauma team standby at Bay 1."
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl text-[9.5px] border border-slate-100 space-y-1">
                        <div className="flex justify-between text-slate-400 font-mono text-[8px]">
                          <span className="font-bold text-slate-600">AMB-09 (Nurse Nisha Kamble)</span>
                          <span>10:44 AM</span>
                        </div>
                        <p className="text-slate-700 leading-normal">
                          "ST elevation in chest leads V1-V4 verified. Aspirin and nitro administered. Pain scores down from 9/10 to 6/10. Vitals stable. ETA 8 minutes, pre-routing to cardiac consultation."
                        </p>
                      </div>
                    </div>

                    {/* Quick Standby Actions block */}
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase block tracking-wider">Quick Command Pre-Arrival Directives</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            triggerToast('Pre-Arrival Blood Allocation', 'Sent pre-orders for 2 units O- Blood to blood bank.', 'success');
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Droplet className="w-3 h-3" />
                          <span>ORDER 2U O- BLOOD</span>
                        </button>

                        <button
                          onClick={() => {
                            triggerToast('CT Scan Lock', 'Reserved emergency CT Trauma slot for en-route polytrauma.', 'success');
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-[#0A5BFF] border border-indigo-150 px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Tv className="w-3 h-3" />
                          <span>CLEAR CT SLOT</span>
                        </button>

                        <button
                          onClick={() => {
                            triggerToast('Cardiology Alerted', 'Primary Angioplasty lab paged. Cardiology team stands by.', 'info');
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <HeartPulse className="w-3 h-3" />
                          <span>ALERT CATH LAB</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: QUICK EMERGENCY REGISTRATION HUB */}
          {activeSection === 'registration' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0A5BFF] border border-blue-200 rounded-2xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Quick Emergency Registration Desk</h2>
                    <p className="text-[10px] text-slate-500">Reduce intake time to under 30 seconds for critical patients. Authorized treatment first, details later.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {recentRegisteredPatient && (
                    <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">GOLDEN HOUR TIMER: {formatGoldenHour(goldenHourTime)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-[9px] font-bold text-slate-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span>ABHA & Aadhaar Gateway Live</span>
                  </div>
                </div>
              </div>

              {/* Registration Sub-view Switchboard */}
              {registrationSubView === 'home' && (
                <div className="space-y-6">
                  {/* Mode Selector Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Voice Registration Card */}
                    <button
                      onClick={() => {
                        setRegistrationSubView('voice');
                        setVoiceInputTranscript('');
                        setVoiceInputStatus('IDLE');
                      }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 p-5 rounded-2xl text-left hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px] cursor-pointer"
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="w-12 h-12 bg-white text-[#0A5BFF] rounded-xl flex items-center justify-center shadow-sm">
                          <Mic className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="bg-blue-100 text-[#0A5BFF] text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Hands-free</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xs font-black text-[#0A5BFF] uppercase tracking-wider">🎤 Voice-First Registration</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Speak details (Name, Age, Incident, Mode) for instant AI extraction in <span className="font-bold text-indigo-600">10 seconds</span>.</p>
                      </div>
                    </button>

                    {/* Manual Registration Card */}
                    <button
                      onClick={() => {
                        setRegistrationSubView('manual');
                        setNewPatientInput(prev => ({
                          ...prev,
                          name: '',
                          unknownPatient: false
                        }));
                      }}
                      className="bg-white border border-slate-200 hover:border-[#0A5BFF] p-5 rounded-2xl text-left hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px] cursor-pointer"
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                          <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Touch optimized</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">⌨ Manual Triage Intake</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Minimal fields layout with large buttons suitable for sterile gloves. Unknown toggle support.</p>
                      </div>
                    </button>

                    {/* OCR Scan Card */}
                    <button
                      onClick={() => {
                        setRegistrationSubView('manual');
                        setTimeout(() => {
                          const ocrPanel = document.getElementById('registration-ocr-scanner-panel');
                          if (ocrPanel) ocrPanel.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="bg-white border border-slate-200 hover:border-blue-500 p-5 rounded-2xl text-left hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px] cursor-pointer"
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="w-12 h-12 bg-slate-50 text-slate-750 rounded-xl flex items-center justify-center shadow-sm">
                          <QrCode className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="bg-[#e0f2fe] text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">OCR Auto-Fill</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">🪪 Aadhaar / ABHA Scan</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Scan identity documents to automatically retrieve and populate demography instantly.</p>
                      </div>
                    </button>

                    {/* Paramedic App incoming Card */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[220px]">
                      <div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <Ambulance className="w-4 h-4 text-rose-500" />
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Incoming Ambulance Dispatch</h4>
                          </div>
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        </div>

                        {/* List of en-route fleet patients */}
                        <div className="space-y-2 mt-3 max-h-[120px] overflow-y-auto pr-1">
                          {patients.filter(p => p.status === 'EN_ROUTE').length === 0 ? (
                            <p className="text-[9px] text-slate-400 text-center py-4">No active ambulance pre-registrations.</p>
                          ) : (
                            patients.filter(p => p.status === 'EN_ROUTE').map(p => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setNewPatientInput({
                                    name: p.name,
                                    age: p.age.toString(),
                                    gender: p.gender,
                                    abhaId: p.abhaId || '',
                                    triageCategory: p.triageCategory,
                                    injuryMechanism: p.injuryMechanism,
                                    hr: p.vitals.hr.toString(),
                                    bp: p.vitals.bp,
                                    rr: p.vitals.rr.toString(),
                                    spo2: p.vitals.spo2.toString(),
                                    temp: p.vitals.temp.toString(),
                                    gcs: p.gcs.toString(),
                                    arrival_mode: 'AMBULANCE',
                                    arrivalSource: p.ambulanceId || 'Fleet 108',
                                    phone: '',
                                    blood_group: p.bloodTypeNeeded || 'Unknown',
                                    relativeName: '',
                                    relativePhone: '',
                                    conscious: p.gcs >= 12 ? 'Yes' : 'No',
                                    unknownPatient: p.name.includes('Unknown')
                                  });
                                  setRegistrationSubView('manual');
                                  triggerToast('Paramedic Data Loaded', `Intake form populated for ${p.name}`, 'info');
                                }}
                                className="bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                              >
                                <div>
                                  <span className="text-[9px] font-bold text-slate-700 block">{p.name} ({p.age}/{p.gender.charAt(0)})</span>
                                  <span className="text-[8px] text-slate-400 block">{p.injuryMechanism.substring(0, 30)}...</span>
                                </div>
                                <div className="text-right">
                                  <span className="bg-rose-50 text-rose-600 text-[7px] font-black px-1.5 py-0.5 rounded block uppercase mb-1">RED / ETA {p.etaMinutes || 5}m</span>
                                  <span className="text-[8px] text-slate-400 block font-mono">HR {p.vitals.hr} | SpO2 {p.vitals.spo2}%</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <p className="text-[8px] text-slate-400 mt-2">💡 Click on any en-route patient to auto-populate and finalize registration.</p>
                    </div>

                    {/* Citizen App Card */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[220px]">
                      <div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-4 h-4 text-blue-500" />
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Citizen App Pre-Registers</h4>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-[7px] font-black px-1.5 py-0.5 rounded-full">2 NEW</span>
                        </div>

                        <div className="space-y-2 mt-3">
                          <div
                            onClick={() => {
                              setNewPatientInput(prev => ({
                                ...prev,
                                name: 'Vijay Salunkhe',
                                age: '28',
                                gender: 'Male',
                                abhaId: 'vijay.salunkhe@abha',
                                phone: '+91 98200 11223',
                                arrival_mode: 'PRIVATE',
                                injuryMechanism: 'Brought by family. Excruciating chest pain radiating to left arm. Conscious.',
                                triageCategory: 'RED',
                                conscious: 'Yes'
                              }));
                              setRegistrationSubView('manual');
                              triggerToast('Citizen App Data Loaded', 'Intake form populated for Vijay Salunkhe', 'info');
                            }}
                            className="bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                          >
                            <div>
                              <span className="text-[9px] font-bold text-slate-700 block">Vijay Salunkhe (28/M)</span>
                              <span className="text-[8px] text-slate-400 block">Chest Pain | ETA 8 mins</span>
                            </div>
                            <span className="bg-amber-50 text-amber-600 text-[7px] font-black px-1.5 py-0.5 rounded uppercase">ETA 8m</span>
                          </div>

                          <div
                            onClick={() => {
                              setNewPatientInput(prev => ({
                                ...prev,
                                name: 'Meera Deshpande',
                                age: '45',
                                gender: 'Female',
                                abhaId: 'meera.desh@abha',
                                phone: '+91 97700 88990',
                                arrival_mode: 'TAXI',
                                injuryMechanism: 'Acute abdominal spasm with vomiting and diaphoresis.',
                                triageCategory: 'YELLOW',
                                conscious: 'Yes'
                              }));
                              setRegistrationSubView('manual');
                              triggerToast('Citizen App Data Loaded', 'Intake form populated for Meera Deshpande', 'info');
                            }}
                            className="bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                          >
                            <div>
                              <span className="text-[9px] font-bold text-slate-700 block">Meera Deshpande (45/F)</span>
                              <span className="text-[8px] text-slate-400 block">Abdominal Spasm | ETA 12 mins</span>
                            </div>
                            <span className="bg-slate-100 text-slate-600 text-[7px] font-black px-1.5 py-0.5 rounded uppercase">ETA 12m</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[8px] text-slate-400 mt-2">💡 Relatives can pre-register en-route using Aadhaar to skip intake desk queues.</p>
                    </div>

                    {/* Police / Referrals Card */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[220px]">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-880 uppercase tracking-wider pb-3 border-b border-slate-100">Special Intake Desks</h4>
                        
                        <div className="space-y-3 mt-4">
                          <button
                            onClick={() => {
                              setNewPatientInput(prev => ({
                                ...prev,
                                name: 'Unknown Male ' + Math.floor(100 + Math.random() * 900),
                                gender: 'Male',
                                age: '35',
                                unknownPatient: true,
                                arrival_mode: 'POLICE',
                                injuryMechanism: 'Brought by Kurla Police. Road traffic accident casualty, found unconscious on road side. MLC case.',
                                triageCategory: 'RED',
                                conscious: 'No'
                              }));
                              setRegistrationSubView('manual');
                              triggerToast('MLC Police Intake Ready', 'Intake form initialized for MLC case.', 'info');
                            }}
                            className="w-full bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl flex items-center space-x-3 text-left transition-all cursor-pointer"
                          >
                            <Building className="w-5 h-5 text-slate-500" />
                            <div>
                              <span className="text-[9px] font-bold text-slate-700 block">👮 Police / MLC Intake</span>
                              <span className="text-[8px] text-slate-400">Initialize registration for police brought cases.</span>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setNewPatientInput(prev => ({
                                ...prev,
                                name: 'Nikhil Kadam',
                                age: '52',
                                gender: 'Male',
                                arrival_mode: 'AMBULANCE',
                                arrivalSource: 'KEM Hospital Transfer',
                                injuryMechanism: 'Transferred from KEM ER. Acute Coronary Syndrome requiring emergency cardiac catheterization.',
                                triageCategory: 'RED',
                                conscious: 'Yes'
                              }));
                              setRegistrationSubView('manual');
                              triggerToast('Referral Intake Ready', 'Intake form initialized for Hospital Referral.', 'info');
                            }}
                            className="w-full bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl flex items-center space-x-3 text-left transition-all cursor-pointer"
                          >
                            <Globe className="w-5 h-5 text-blue-500" />
                            <div>
                              <span className="text-[9px] font-bold text-slate-700 block">🏥 Inter-Hospital Referral</span>
                              <span className="text-[8px] text-slate-400">Log patient transfers from other MCGM sites.</span>
                            </div>
                          </button>
                        </div>
                      </div>
                      <p className="text-[8px] text-slate-400 mt-2">🔒 All MLC cases are auto-flagged for the MCGM Police Desk portal.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* VOICE SUB-VIEW */}
              {registrationSubView === 'voice' && (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">🎙 AI Voice-First Registration Portal</h3>
                    <button
                      onClick={() => setRegistrationSubView('home')}
                      className="text-[10px] font-bold text-[#0A5BFF] hover:underline cursor-pointer"
                    >
                      ← Back to Hub
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Voice Controls Column */}
                    <div className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl flex flex-col items-center justify-between min-h-[300px] border border-slate-100">
                      <div className="text-center space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Voice Assistant Core</span>
                        <p className="text-[10px] text-slate-500">Tap mic and speak patient details. AI will extract fields automatically.</p>
                      </div>

                      {/* Microphone Pulse Button — REAL SPEECH */}
                      <button
                        type="button"
                        onClick={() => {
                          if (voiceInputStatus === 'IDLE' || voiceInputStatus === 'COMPLETED') {
                            startRegistrationVoice();
                          } else if (voiceInputStatus === 'LISTENING') {
                            stopRegistrationVoice();
                          }
                        }}
                        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                          voiceInputStatus === 'LISTENING' 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse' 
                            : voiceInputStatus === 'PARSING' 
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 animate-spin animate-duration-3000'
                            : 'bg-[#0A5BFF] text-white hover:bg-blue-800 shadow-md shadow-blue-200'
                        }`}
                      >
                        {voiceInputStatus === 'LISTENING' ? (
                          <>
                            <MicOff className="w-8 h-8" />
                            <span className="text-[8px] font-black uppercase mt-1">STOP & PARSE</span>
                          </>
                        ) : voiceInputStatus === 'PARSING' ? (
                          <>
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            <span className="text-[8px] font-black uppercase mt-1">PARSING...</span>
                          </>
                        ) : voiceInputStatus === 'COMPLETED' ? (
                          <>
                            <Mic className="w-8 h-8" />
                            <span className="text-[8px] font-black uppercase mt-1">RE-RECORD</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-8 h-8" />
                            <span className="text-[8px] font-black uppercase mt-1">TAP TO SPEAK</span>
                          </>
                        )}
                      </button>

                      <div className="text-center w-full space-y-1">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase">Voice Engine Status</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                          voiceInputStatus === 'LISTENING' 
                            ? 'bg-red-100 text-red-700' 
                            : voiceInputStatus === 'PARSING' 
                            ? 'bg-amber-100 text-amber-700' 
                            : voiceInputStatus === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {voiceInputStatus}
                        </span>
                      </div>
                    </div>

                    {/* Transcript & Parse Output Columns */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Live Transcript Panel */}
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-slate-500 uppercase font-black">Live Speech Transcript</label>
                          {voiceInputTranscript && (
                            <button
                              onClick={() => setVoiceInputTranscript('')}
                              className="text-[8px] font-bold text-rose-600 uppercase hover:underline cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="bg-white border border-slate-200 p-3.5 rounded-lg min-h-[90px] text-slate-800 text-[10px] leading-relaxed font-mono whitespace-pre-wrap">
                          {voiceInputTranscript || (
                            <span className="text-slate-400 italic">"Tap the mic and say something like: 'Register patient Ramesh Kumar aged 45 male brought by ambulance road accident unconscious' — your speech will stream here in real time."</span>
                          )}
                        </div>
                      </div>

                      {/* Suggestions list — these use the same NLU parser as real voice */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">Or tap a preset to demo the parser:</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              const text = "Register unknown male approximately thirty years old brought by police after fall unconscious";
                              setVoiceInputTranscript(text);
                              finishVoiceParsing(text);
                            }}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-left text-[9px] text-slate-700 transition-all cursor-pointer"
                          >
                            🎤 "Register unknown male approximately 30 years old brought by police after fall unconscious..."
                          </button>
                          <button
                            onClick={() => {
                              const text = "Register emergency patient Sunita Deshmukh aged fifty brought by ambulance suffering severe chest pain";
                              setVoiceInputTranscript(text);
                              finishVoiceParsing(text);
                            }}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-left text-[9px] text-slate-700 transition-all cursor-pointer"
                          >
                            🎤 "Register patient Sunita Deshmukh aged 50 brought by ambulance suffering severe chest pain..."
                          </button>
                        </div>
                      </div>

                      {/* AI parsed parameter confirmation */}
                      {voiceInputStatus === 'COMPLETED' && (
                        <div className="bg-emerald-50/50 border border-emerald-250 p-4 rounded-xl space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>AI NLU Intake Parameters Extracted</span>
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded">98% Match Confidence</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[9px]">
                            <div>
                              <span className="text-slate-400 block font-bold">NAME:</span>
                              <span className="text-slate-900 font-bold">{newPatientInput.name || 'Not detected'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">AGE:</span>
                              <span className="text-slate-900 font-bold">{newPatientInput.age || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">GENDER:</span>
                              <span className="text-slate-900 font-bold">{newPatientInput.gender}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">ARRIVAL MODE:</span>
                              <span className="text-slate-900 font-bold">{newPatientInput.arrival_mode}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 block font-bold">INJURY / COMPLAINT:</span>
                              <span className="text-slate-900 font-bold">{newPatientInput.injuryMechanism || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">TRIAGE:</span>
                              <span className={`font-black ${newPatientInput.triageCategory === 'RED' ? 'text-rose-600' : newPatientInput.triageCategory === 'YELLOW' ? 'text-amber-600' : newPatientInput.triageCategory === 'GREEN' ? 'text-emerald-600' : 'text-slate-500'}`}>{newPatientInput.triageCategory}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">CONSCIOUS / GCS:</span>
                              <span className="text-slate-900 font-bold">{newPatientInput.conscious} / GCS {newPatientInput.gcs}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-emerald-100 flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setRegistrationSubView('manual')}
                              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-[9px] px-3.5 py-2 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            >
                              Edit Details manually
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEmergencyRegister()}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-4 py-2 rounded-lg transition-all cursor-pointer"
                            >
                              Confirm & Register Patient
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MANUAL REGISTRATION SUB-VIEW */}
              {registrationSubView === 'manual' && (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">📋 Manual Intake Registration form</h3>
                    <button
                      type="button"
                      onClick={() => setRegistrationSubView('home')}
                      className="text-[10px] font-bold text-[#0A5BFF] hover:underline cursor-pointer"
                    >
                      ← Back to Hub
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEmergencyRegister();
                    }}
                    className="space-y-6"
                  >
                    {/* Primary Demographic Panel */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-205">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Patient Demographics</span>
                        
                        {/* Unknown Toggle */}
                        <div className="flex items-center space-x-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase text-[9px]">Unknown Patient Profile:</label>
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = !newPatientInput.unknownPatient;
                              const mockName = nextVal 
                                ? `Unknown ${newPatientInput.gender === 'Female' ? 'Female' : 'Male'} ` + Math.floor(100 + Math.random() * 900)
                                : '';
                              setNewPatientInput(prev => ({
                                ...prev,
                                unknownPatient: nextVal,
                                name: mockName,
                                age: nextVal ? '35' : '',
                              }));
                            }}
                            className={`w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                              newPatientInput.unknownPatient ? 'bg-rose-500' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-all transform ${
                              newPatientInput.unknownPatient ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Name field */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Patient Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder={newPatientInput.unknownPatient ? 'Auto-generated Unknown ID' : 'Enter name or swipe Aadhaar'}
                            value={newPatientInput.name}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, name: e.target.value })}
                            className="bg-white border border-slate-200 p-3 rounded-xl w-full text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Age Selection Buttons */}
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Age Class / Selection</label>
                          <div className="flex space-x-2">
                            {[
                              { label: '👶 Child (0-12)', val: '8' },
                              { label: '👦 Teen (13-19)', val: '16' },
                              { label: '🧑 Adult (20-59)', val: '35' },
                              { label: '👴 Senior (60+)', val: '68' }
                            ].map(btn => (
                              <button
                                key={btn.label}
                                type="button"
                                onClick={() => setNewPatientInput({ ...newPatientInput, age: btn.val })}
                                className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all cursor-pointer ${
                                  Number(newPatientInput.age) === Number(btn.val)
                                    ? 'bg-[#0A5BFF] text-white border-blue-800'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                            <input
                              type="number"
                              placeholder="Age"
                              value={newPatientInput.age}
                              onChange={(e) => setNewPatientInput({ ...newPatientInput, age: e.target.value })}
                              className="bg-white border border-slate-200 p-2.5 rounded-xl w-20 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gender Selector Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Gender</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Male', 'Female', 'Other'].map(g => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => {
                                  const nameVal = newPatientInput.unknownPatient
                                    ? `Unknown ${g === 'Female' ? 'Female' : 'Male'} ` + Math.floor(100 + Math.random() * 900)
                                    : newPatientInput.name;
                                  setNewPatientInput({
                                    ...newPatientInput,
                                    gender: g,
                                    name: nameVal
                                  });
                                }}
                                className={`py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all cursor-pointer ${
                                  newPatientInput.gender === g
                                    ? 'bg-[#0A5BFF] text-white border-blue-800'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Phone Number</label>
                          <input
                            type="text"
                            placeholder="+91 99999 99999"
                            disabled={newPatientInput.unknownPatient}
                            value={newPatientInput.phone}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, phone: e.target.value })}
                            className="bg-white border border-slate-200 p-3 rounded-xl w-full text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-105 disabled:text-slate-400"
                          />
                        </div>

                        {/* ABHA ID details */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">ABHA ID / Aadhaar ID</label>
                          <input
                            type="text"
                            placeholder="username@abha"
                            disabled={newPatientInput.unknownPatient}
                            value={newPatientInput.abhaId}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, abhaId: e.target.value })}
                            className="bg-white border border-slate-200 p-3 rounded-xl w-full text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-105 disabled:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Intake parameters & Arrival Mode */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-205">Intake Details & Vitals</h4>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Arrival mode selectors */}
                        <div className="space-y-2">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Arrival Mode</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Ambulance', val: 'AMBULANCE' },
                              { label: 'Taxi', val: 'TAXI' },
                              { label: 'Private Car', val: 'PRIVATE' },
                              { label: 'Walk In', val: 'WALK_IN' },
                              { label: 'Police', val: 'POLICE' },
                              { label: 'Fire Brigade', val: 'FIRE' },
                              { label: 'Auto Rickshaw', val: 'RICKSHAW' },
                              { label: 'Unknown', val: 'UNKNOWN' }
                            ].map(item => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => setNewPatientInput({ ...newPatientInput, arrival_mode: item.val })}
                                className={`py-2 rounded-lg border text-[8px] font-bold uppercase transition-all cursor-pointer ${
                                  newPatientInput.arrival_mode === item.val
                                    ? 'bg-[#0A5BFF] text-white border-blue-800'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Chief complaint preset tags */}
                        <div className="space-y-2">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Chief Complaint / Injury Details</label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Unconscious', 'Severe Chest Pain', 'Major Trauma', 'Polytrauma',
                              'Severe Dyspnea', 'Cardiac Arrest', 'Stroke / Hemiplegia', 'Burns'
                            ].map(tag => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setNewPatientInput({ ...newPatientInput, injuryMechanism: tag })}
                                className={`px-2.5 py-1.5 rounded-lg border text-[8px] font-bold uppercase transition-all cursor-pointer ${
                                  newPatientInput.injuryMechanism === tag
                                    ? 'bg-rose-50 text-rose-750 border-rose-300'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Or type complaint details manually..."
                            value={newPatientInput.injuryMechanism}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, injuryMechanism: e.target.value })}
                            className="bg-white border border-slate-200 p-2.5 rounded-xl w-full text-[10px] outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                          />
                        </div>
                      </div>

                      {/* Vitals, Conscious toggle & Triage Category selection */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                        {/* Conscious toggle */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Conscious Level</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Yes', 'No'].map(v => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setNewPatientInput({ ...newPatientInput, conscious: v })}
                                className={`py-2 rounded-lg border text-[9px] font-black uppercase transition-all cursor-pointer ${
                                  newPatientInput.conscious === v
                                    ? 'bg-[#0A5BFF] text-white border-blue-800'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Vitals: SpO2 */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Intake SpO2 (%)</label>
                          <input
                            type="number"
                            placeholder="98"
                            value={newPatientInput.spo2}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, spo2: e.target.value })}
                            className="bg-white border border-slate-200 p-2.5 rounded-xl w-full text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Vitals: Heart Rate */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Intake Heart Rate (bpm)</label>
                          <input
                            type="number"
                            placeholder="80"
                            value={newPatientInput.hr}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, hr: e.target.value })}
                            className="bg-white border border-slate-200 p-2.5 rounded-xl w-full text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Triage selection */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Initial Triage Category</label>
                          <div className="grid grid-cols-4 gap-1">
                            {([
                              { id: 'RED', bg: 'bg-rose-600 border-rose-700 text-white' },
                              { id: 'YELLOW', bg: 'bg-amber-500 border-amber-600 text-white' },
                              { id: 'GREEN', bg: 'bg-emerald-600 border-emerald-700 text-white' },
                              { id: 'BLACK', bg: 'bg-slate-900 border-black text-white' }
                            ] as const).map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setNewPatientInput({ ...newPatientInput, triageCategory: cat.id })}
                                className={`py-2 rounded-lg border text-[8px] font-black transition-all cursor-pointer ${
                                  newPatientInput.triageCategory === cat.id
                                    ? cat.bg
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {cat.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Relative Details */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-205">Relative / Brought-By Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Relative Name</label>
                          <input
                            type="text"
                            placeholder="Enter name of relative/friend"
                            value={newPatientInput.relativeName}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, relativeName: e.target.value })}
                            className="bg-white border border-slate-200 p-3 rounded-xl w-full text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Relative Contact Number</label>
                          <input
                            type="text"
                            placeholder="+91 99999 99999"
                            value={newPatientInput.relativePhone}
                            onChange={(e) => setNewPatientInput({ ...newPatientInput, relativePhone: e.target.value })}
                            className="bg-white border border-slate-200 p-3 rounded-xl w-full text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* OCR SCANNER PANEL */}
                    <div id="registration-ocr-scanner-panel" className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-blue-205">
                        <span className="text-[10px] font-black text-[#0A5BFF] uppercase tracking-wider flex items-center space-x-1.5">
                          <QrCode className="w-4 h-4" />
                          <span>AI OCR Identity document Card Scanner</span>
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[8px] font-black px-1.5 py-0.5 rounded">Aadhaar / ABHA</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selector of Mock Doc */}
                        <div className="space-y-3">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Select Document to Mock Scan:</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'aadhaar', label: '🪪 Aadhaar Card' },
                              { id: 'abha', label: '🏥 ABHA Health Card' },
                              { id: 'dl', label: '🚗 Driver License' }
                            ].map(doc => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => setOcrCardImage(doc.id)}
                                className={`py-2 rounded-lg border text-[8px] font-bold uppercase transition-all cursor-pointer ${
                                  ocrCardImage === doc.id
                                    ? 'bg-[#0A5BFF] text-white border-blue-800'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {doc.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (!ocrCardImage) {
                                  triggerToast('No Card Selected', 'Please select a document type to scan.', 'warning');
                                  return;
                                }
                                setOcrScanning(true);
                                let progress = 0;
                                const interval = setInterval(() => {
                                  progress += 20;
                                  if (progress >= 100) {
                                    clearInterval(interval);
                                    setOcrScanning(false);
                                    if (ocrCardImage === 'aadhaar') {
                                      setNewPatientInput(prev => ({
                                        ...prev,
                                        name: 'Sudhir Deshmukh',
                                        age: '42',
                                        gender: 'Male',
                                        phone: '+91 99200 45678',
                                        abhaId: '8829-1029-4482',
                                        blood_group: 'O+',
                                        relativeName: 'Sunita Deshmukh',
                                        relativePhone: '+91 99200 45679'
                                      }));
                                      triggerToast('Aadhaar Extracted', 'Demographics populated successfully.', 'success');
                                    } else if (ocrCardImage === 'abha') {
                                      setNewPatientInput(prev => ({
                                        ...prev,
                                        name: 'Priya Sharma',
                                        age: '29',
                                        gender: 'Female',
                                        phone: '+91 98400 90123',
                                        abhaId: 'priya.sharma@abha',
                                        blood_group: 'B+'
                                      }));
                                      triggerToast('ABHA Data Extracted', 'Patient identity verified via ABHA gateway.', 'success');
                                    } else if (ocrCardImage === 'dl') {
                                      setNewPatientInput(prev => ({
                                        ...prev,
                                        name: 'Rahul Rane',
                                        age: '31',
                                        gender: 'Male',
                                        phone: '+91 97600 33445'
                                      }));
                                      triggerToast('DL OCR Completed', 'Name and Age extracted.', 'success');
                                    }
                                  }
                                }, 300);
                              }}
                              className="bg-[#0A5BFF] hover:bg-blue-800 text-white font-bold text-[9px] px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>{ocrScanning ? 'Scanning Card...' : 'Scan Mock Document'}</span>
                            </button>

                            {ocrScanning && (
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full animate-progress" style={{ width: '80%' }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Scanner visual feedback */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[120px] text-center">
                          {ocrCardImage ? (
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold text-indigo-600 block uppercase">Mock Card Loaded: {ocrCardImage.toUpperCase()}</span>
                              <div className="border-2 border-dashed border-blue-300 w-48 h-28 rounded-lg flex items-center justify-center bg-slate-50 relative overflow-hidden">
                                <span className="text-[8px] text-slate-400 font-bold uppercase">{ocrCardImage === 'aadhaar' ? 'Aadhaar Card Visual' : ocrCardImage === 'abha' ? 'ABHA Identity' : 'DL License'}</span>
                                {ocrScanning && (
                                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse border-b-2 border-blue-500" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-slate-400 mb-1" />
                              <span className="text-[9px] text-slate-400 block font-bold">No card image uploaded yet.</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Biometric Integration (Fingerprint Capture Mock) */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-205">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                          <Fingerprint className="w-4 h-4 text-[#0A5BFF]" />
                          <span>Biometric Intake verification</span>
                        </span>
                        <span className="bg-slate-200 text-slate-600 text-[7px] font-black px-1.5 py-0.5 rounded uppercase">MCGM BioNet</span>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-700">Scan victim's fingerprint to retrieve state-wide medical records.</p>
                          <p className="text-[9px] text-slate-400">Useful for unidentified or unconscious polytrauma patients.</p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setFingerprintScanning(true);
                              setTimeout(() => {
                                setFingerprintScanning(false);
                                setFingerprintCaptured(true);
                                setNewPatientInput(prev => ({
                                  ...prev,
                                  name: 'Santosh Kamble',
                                  age: '48',
                                  gender: 'Male',
                                  phone: '+91 99100 88221',
                                  abhaId: 'santosh.kamble@abha',
                                  blood_group: 'AB+'
                                }));
                                triggerToast('Biometrics Matched', 'Identified as Santosh Kamble. Records loaded.', 'success');
                              }, 1500);
                            }}
                            className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all flex items-center space-x-1.5 cursor-pointer ${
                              fingerprintCaptured 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <Fingerprint className={`w-4 h-4 ${fingerprintScanning ? 'animate-pulse text-blue-600' : ''}`} />
                            <span>{fingerprintScanning ? 'Scanning...' : fingerprintCaptured ? 'Fingerprint Linked' : 'Initiate Scanner'}</span>
                          </button>

                          {fingerprintCaptured && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-full uppercase">Bio-ID Match 100%</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setRegistrationSubView('home')}
                        className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-3 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        id="emergency-registration-submit-btn"
                        type="submit"
                        className="bg-[#0A5BFF] hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                      >
                        Register Intake & Start Treatment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* POST-REGISTRATION PIPELINE SCREEN */}
              {registrationSubView === 'post-register' && recentRegisteredPatient && (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 animate-fadeIn">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded uppercase">Intake Registered</span>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5 uppercase tracking-wider">{recentRegisteredPatient.patient.name} ({recentRegisteredPatient.patient.age}/{recentRegisteredPatient.patient.gender.charAt(0)})</h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          triggerToast('Wristband Printed', `Wristband barcode queued for ${recentRegisteredPatient.patient.name}`, 'success');
                        }}
                        className="bg-white hover:bg-slate-50 text-slate-705 font-bold text-[10px] px-3.5 py-2 rounded-xl border border-slate-200 flex items-center space-x-1.5 cursor-pointer transition-all"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print Wristband</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection('triage');
                          triggerToast('Navigated to Triage', 'Finalize clinical scores on triage board.', 'info');
                        }}
                        className="bg-[#0A5BFF] hover:bg-blue-800 text-white font-bold text-[10px] px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all"
                      >
                        <span>Go to AI Triage Board</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Identifier Card Details */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl space-y-1">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase">Temporary UHID Generated</span>
                          <span className="text-xs font-mono font-black text-slate-800 block tracking-wider">{lastGeneratedUHID || 'TEMP-UHID-2026-X'}</span>
                        </div>
                        <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl space-y-1">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase">Emergency Case Number</span>
                          <span className="text-xs font-mono font-black text-slate-800 block tracking-wider">{lastGeneratedCaseNo || 'ER-CASE-2026-Y'}</span>
                        </div>
                      </div>

                      {/* Patient Timeline */}
                      <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-205">Patient Intake Pipeline Status</h4>
                        
                        <div className="relative border-l-2 border-blue-200 pl-5 ml-2.5 space-y-5 py-1">
                          {/* Step 1 */}
                          <div className="relative">
                            <span className="absolute -left-[27px] top-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                            <div>
                              <span className="text-[9px] font-bold text-slate-800 block">Intake Completed & Authorized</span>
                              <span className="text-[8px] text-slate-400">Intake Desk registered. Vitals captured. Assigned to Waiting.</span>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="relative">
                            <span className="absolute -left-[27px] top-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                            <div>
                              <span className="text-[9px] font-bold text-slate-800 block">Golden Hour countdown active</span>
                              <span className="text-[8px] text-rose-600 font-bold uppercase">Time remaining: {formatGoldenHour(goldenHourTime)}</span>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="relative">
                            <span className="absolute -left-[27px] top-0 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white" />
                            <div>
                              <span className="text-[9px] font-bold text-slate-800 block">Barcode wristband QR code queued</span>
                              <span className="text-[8px] text-slate-400">Intake Desk label printer printing wristband automatically.</span>
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="relative">
                            <span className="absolute -left-[27px] top-0 w-3.5 h-3.5 bg-slate-300 rounded-full border-2 border-white" />
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block">Clinical Triage & Bay allocation pending</span>
                              <span className="text-[8px] text-slate-400">Waiting for physician triage assessment and trauma bay assignment.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Pending / Continue Later Panel */}
                    <div className="lg:col-span-1 bg-amber-50/40 border border-amber-200/80 p-5 rounded-2xl flex flex-col justify-between min-h-[300px]">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 pb-2 border-b border-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Registration Details Pending</h4>
                        </div>

                        <p className="text-[9px] text-slate-600 leading-relaxed">Emergency intake requires only minimal details. Complete these administrative fields when the patient stabilizes or relatives arrive:</p>

                        <div className="space-y-2 mt-2">
                          {[
                            'Verify identity via ABHA card verification',
                            'Input residential permanent address',
                            'Log patient medical insurance card details',
                            'Upload previous medical history reports'
                          ].map(item => (
                            <div key={item} className="flex items-start space-x-2 text-[9px] text-slate-600">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <button
                          onClick={() => {
                            triggerToast('SMS Link Dispatched', `Intake completion SMS link sent to ${recentRegisteredPatient.patient.phone || '+91 99999 99999'}`, 'success');
                          }}
                          className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-[9px] py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer text-center"
                        >
                          Send Complete-Later SMS Link
                        </button>
                        <button
                          onClick={() => setRegistrationSubView('home')}
                          className="w-full bg-slate-900 hover:bg-black text-white font-bold text-[9px] py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Back to Registration Desk
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEDICATED WORKSPACE: AI COPILOT INTERACTION */}
          {activeSection === 'copilot' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 text-[#0A5BFF] border border-blue-100 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Clinical AI Assistant Prompt Desk</h2>
                    <p className="text-[10px] text-slate-500">Query clinical guidelines, write patient summaries, and issue system triage notifications.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[520px]">
                {/* Chat window */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 no-scrollbar text-xs">
                  {copilotChat.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex ${chat.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-4 rounded-2xl max-w-md leading-relaxed ${
                        chat.sender === 'User' 
                          ? 'bg-[#0A5BFF] text-white rounded-br-none' 
                          : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                        <span className="text-[8px] font-black uppercase block tracking-wider opacity-60 mb-1">{chat.sender}</span>
                        <p>{chat.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleCopilotSubmit} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Ask AI e.g. 'Summarize patient in Bay 1' or 'Show blood reserves'"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-xs flex-1 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-[#0A5BFF] hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Bottom Portal Switcher / Quick Action Dock */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span>Sion ER Command Backbone</span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveSection('registration')}
            className="bg-[#0A5BFF] hover:bg-blue-800 text-white font-bold text-[10px] px-4 py-2 rounded-full shadow-md shadow-blue-800/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            + Quick Patient Intake
          </button>
          <button
            onClick={() => {
              triggerToast('OT Room Pre-reserved', 'Surgical Theatre #3 reserved for immediate polytrauma transfer.', 'success');
            }}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            🏥 Pre-reserve OT Suite
          </button>
        </div>
      </footer>

    </div>
  );
}
