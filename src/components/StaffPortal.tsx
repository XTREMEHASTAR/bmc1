import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Plus,
  RefreshCw,
  ArrowRight,
  Lock,
  Unlock,
  Settings,
  LogOut,
  Briefcase,
  Layers,
  Check,
  ChevronLeft,
  UserCheck,
  Bell,
  Fingerprint,
  QrCode,
  FileText,
  ShieldCheck,
  Activity,
  Send,
  Camera,
  AlertOctagon,
  Radio,
  Users,
  Sliders,
  CheckSquare,
  RotateCcw
} from 'lucide-react';


interface StaffPortalProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
  setPortal: (portal: any) => void;
}

interface AttendanceEvent {
  id: string;
  staff_id: string;
  shift_id: string | null;
  event_type: 'CLOCK_IN' | 'CLOCK_OUT';
  timestamp: string;
  lat: number;
  lng: number;
  verified: boolean;
  verification_method: 'GEOFENCE' | 'EXCEPTION' | 'BYPASS';
  exception_id: string | null;
}

interface AttendanceException {
  id: string;
  staff_id: string;
  event_type: 'CLOCK_IN' | 'CLOCK_OUT';
  timestamp: string;
  lat: number;
  lng: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by: string | null;
  reviewed_at: string | null;
  comments: string | null;
  created_at: string;
}

interface Shift {
  id: string;
  hospital_id: string;
  staff_id: string;
  shift_type: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'EMERGENCY';
  date: string;
  start_time: string;
  end_time: string;
}

interface LeaveRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  leave_type: 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by: string | null;
  reviewed_at: string | null;
  comments: string | null;
  created_at: string;
}

interface ShiftSwap {
  id: string;
  requesting_staff_id: string;
  target_staff_id: string;
  requesting_shift_id: string;
  target_shift_id: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export default function StaffPortal({ isDarkMode, setIsDarkMode, onLogout, setPortal }: StaffPortalProps) {
  // Navigation & View Role states
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'requests' | 'profile' | 'dispatch'>('home');
  const [portalRole, setPortalRole] = useState<'nurse' | 'manager'>('nurse');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Time ticker
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Staff profile info (Matches database mock)
  const staffId = 'demo-nurse-id';
  const staffName = 'Sister Sneha Shinde';
  const staffDesignation = 'Senior Nursing Officer';
  const staffDepartment = 'Orthopedic Emergency Ward - Unit 4B';
  const staffHospitalId = 'h1'; // Sion Hospital

  // Simulated GPS Location presets
  const simulatedLocations = [
    { name: 'Inside Sion Campus (ICU)', lat: 19.0360, lng: 72.8596, desc: 'In Range (10m away)' },
    { name: 'Sion Hospital Main Gate', lat: 19.0362, lng: 72.8598, desc: 'In Range (45m away)' },
    { name: 'Dadar West (Out of Bounds)', lat: 19.0180, lng: 72.8300, desc: 'Out of Bounds (2.1 KM away)' },
    { name: 'Bandra Reclamation (Out of Bounds)', lat: 19.0600, lng: 72.8400, desc: 'Out of Bounds (3.9 KM away)' }
  ];
  const [selectedLocIndex, setSelectedLocIndex] = useState(0);
  const activeLoc = simulatedLocations[selectedLocIndex];

  // Geofence status from server config
  const [geofenceConfig, setGeofenceConfig] = useState<{ lat: number; lng: number; radius: number }>({
    lat: 19.0360,
    lng: 72.8596,
    radius: 150
  });

  // State data fetched from Express API
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [exceptions, setExceptions] = useState<AttendanceException[]>([]);
  const [roster, setRoster] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [swaps, setSwaps] = useState<ShiftSwap[]>([]);

  // Dispatch / Command Center states
  const [staffList, setStaffList] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [activeBroadcasts, setActiveBroadcasts] = useState<any[]>([]);

  // Dispatch Form States
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [dispatchPriority, setDispatchPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY'>('NORMAL');
  const [dispatchTaskType, setDispatchTaskType] = useState<string>('REPORT_TO_LOCATION');
  const [dispatchTitle, setDispatchTitle] = useState('');
  const [dispatchInstructions, setDispatchInstructions] = useState('');
  const [dispatchBuilding, setDispatchBuilding] = useState('Main Building');
  const [dispatchFloor, setDispatchFloor] = useState('3rd Floor');
  const [dispatchWard, setDispatchWard] = useState('Ward 7');
  const [dispatchRoom, setDispatchRoom] = useState('');
  const [dispatchBed, setDispatchBed] = useState('');
  const [dispatchPatientRef, setDispatchPatientRef] = useState('');
  const [dispatchRequiredTime, setDispatchRequiredTime] = useState('');
  const [dispatchPhotoRequired, setDispatchPhotoRequired] = useState(false);
  const [dispatchQrRequired, setDispatchQrRequired] = useState(true);

  // Filters for staff list in Command Center
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');

  // Emergency Broadcast Form States
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'URGENT' | 'EMERGENCY'>('EMERGENCY');
  const [broadcastRoleFilter, setBroadcastRoleFilter] = useState<string[]>([]);

  // Staff Assignment State (Mobile side)
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [activeMyAssignment, setActiveMyAssignment] = useState<any | null>(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [qrScanInput, setQrScanInput] = useState('');
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [showDeclineReasonModal, setShowDeclineReasonModal] = useState(false);
  const [declineReasonText, setDeclineReasonText] = useState('');
  const [declineTargetAsmId, setDeclineTargetAsmId] = useState('');
  const [showArrivalVerificationModal, setShowArrivalVerificationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'GPS' | 'QR' | 'PHOTO' | 'SUPERVISOR'>('GPS');
  
  // Supervisor override form states
  const [supervisorIdInput, setSupervisorIdInput] = useState('');
  const [supervisorReasonInput, setSupervisorReasonInput] = useState('');

  // Canvas ref for camera preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Manager state data
  const [workforceData, setWorkforceData] = useState<{
    activeClockInsCount: number;
    activeClockIns: AttendanceEvent[];
    pendingExceptions: AttendanceException[];
    pendingLeaves: LeaveRequest[];
    pendingSwaps: ShiftSwap[];
  }>({
    activeClockInsCount: 0,
    activeClockIns: [],
    pendingExceptions: [],
    pendingLeaves: [],
    pendingSwaps: []
  });

  // Exception form state
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');
  const [exceptionEventType, setExceptionEventType] = useState<'CLOCK_IN' | 'CLOCK_OUT'>('CLOCK_IN');

  // Leave Form state
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'UNPAID'>('CASUAL');
  const [leaveReason, setLeaveReason] = useState('');

  // Swap Form state
  const [selectedYourShiftId, setSelectedYourShiftId] = useState('');
  const [colleagueShiftId, setColleagueShiftId] = useState('');

  // Fetch Dispatch / Command Center data
  const refreshDispatchData = async () => {
    try {
      let staffUrl = '/api/dispatch/staff?';
      if (filterDepartment) staffUrl += `department=${encodeURIComponent(filterDepartment)}&`;
      if (filterRole) staffUrl += `role=${encodeURIComponent(filterRole)}&`;
      if (filterAvailability) staffUrl += `availability=${encodeURIComponent(filterAvailability)}&`;
      
      const staffRes = await fetch(staffUrl);
      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaffList(data);
      }

      const asmRes = await fetch('/api/dispatch/all-assignments');
      if (asmRes.ok) {
        const data = await asmRes.json();
        setAllAssignments(data);
      }

      const bcRes = await fetch('/api/dispatch/broadcasts');
      if (bcRes.ok) {
        const data = await bcRes.json();
        setActiveBroadcasts(data);
      }

      const myAsmRes = await fetch(`/api/dispatch/assignments/${staffId}`);
      if (myAsmRes.ok) {
        const data = await myAsmRes.json();
        setMyAssignments(data);
        const active = data.find((asm: any) => !['COMPLETED', 'DECLINED', 'CANCELLED', 'EXPIRED'].includes(asm.status));
        setActiveMyAssignment(active || null);
      }
    } catch (err) {
      console.error('Error refreshing dispatch data:', err);
    }
  };

  // Fetch all data from backend
  const refreshData = async () => {
    try {
      // 1. Config
      const configRes = await fetch(`/api/attendance/config/${staffHospitalId}`);
      if (configRes.ok) {
        const configData = await configRes.json();
        setGeofenceConfig(configData);
      }

      // 2. Roster
      const rosterRes = await fetch(`/api/attendance/roster/${staffId}`);
      if (rosterRes.ok) {
        const rosterData = await rosterRes.json();
        setRoster(rosterData);
      }

      // 3. History (Events & Exceptions)
      const historyRes = await fetch(`/api/attendance/history/${staffId}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setEvents(historyData.events || []);
        setExceptions(historyData.exceptions || []);
      }

      // 4. Leaves
      const leavesRes = await fetch(`/api/attendance/leave/${staffId}`);
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData || []);
      }

      // 5. Swaps
      const swapsRes = await fetch(`/api/attendance/swaps/${staffId}`);
      if (swapsRes.ok) {
        const swapsData = await swapsRes.json();
        setSwaps(swapsData || []);
      }

      // 6. Workforce (For Manager View)
      if (portalRole === 'manager') {
        const workforceRes = await fetch('/api/attendance/workforce');
        if (workforceRes.ok) {
          const workforceData = await workforceRes.json();
          setWorkforceData(workforceData);
        }
      }
    } catch (err) {
      console.error('Error refreshing attendance data:', err);
    }
  };

  useEffect(() => {
    refreshData();
    refreshDispatchData();
  }, [portalRole, filterDepartment, filterRole, filterAvailability]);

  // Polling for live updates
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
      refreshDispatchData();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Draw simulated camera preview
  const drawCameraOverlay = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background placeholder gradient (representing camera feed)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(0.5, '#0f172a');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw camera viewfinder border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Draw crop guidelines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 3, 20);
    ctx.lineTo(canvas.width / 3, canvas.height - 20);
    ctx.moveTo((canvas.width * 2) / 3, 20);
    ctx.lineTo((canvas.width * 2) / 3, canvas.height - 20);
    ctx.moveTo(20, canvas.height / 3);
    ctx.lineTo(canvas.width - 20, canvas.height / 3);
    ctx.moveTo(20, (canvas.height * 2) / 3);
    ctx.lineTo(canvas.width - 20, (canvas.height * 2) / 3);
    ctx.stroke();

    // Draw center crosshair
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 15, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 + 15, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - 15);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 + 15);
    ctx.stroke();

    // Draw telemetry texts
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CAMERA OVERLAY VERIFIED', 30, 45);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SION EMERGENCY DEPT', 30, 70);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Staff ID: ${staffId}`, 30, 90);
    ctx.fillText(`Staff: ${staffName}`, 30, 105);
    ctx.fillText(`Location: ${activeLoc.name}`, 30, 120);
    ctx.fillText(`GPS: ${activeLoc.lat.toFixed(5)}, ${activeLoc.lng.toFixed(5)}`, 30, 135);
    ctx.fillText(`Timestamp: ${new Date().toLocaleString()}`, 30, 150);

    // Draw security watermarks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('MCGM DIGITAL HOSPITAL', 40, canvas.height - 40);
  };

  useEffect(() => {
    if (showPhotoUploadModal) {
      setTimeout(() => {
        drawCameraOverlay();
      }, 150);
    }
  }, [showPhotoUploadModal, selectedLocIndex]);

  // Accept / Acknowledge task assignment
  const handleUpdateAssignmentStatus = async (asmId: string, newStatus: string, metadata?: any) => {
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const response = await fetch(`/api/dispatch/assignments/${asmId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          staffId,
          ...metadata
        })
      });
      const data = await response.json();
      if (response.ok) {
        setActionSuccess(`Task status updated to ${newStatus}`);
        refreshDispatchData();
      } else {
        setActionError(data.error || 'Failed to update assignment status');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error updating assignment');
    } finally {
      setLoading(false);
    }
  };

  // Decline assignment with justification
  const handleDeclineAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineReasonText.trim() || !declineTargetAsmId) return;
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const response = await fetch(`/api/dispatch/assignments/${declineTargetAsmId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DECLINED',
          staffId,
          declineReason: declineReasonText
        })
      });
      const data = await response.json();
      if (response.ok) {
        setActionSuccess('Assignment successfully declined');
        setShowDeclineReasonModal(false);
        setDeclineReasonText('');
        refreshDispatchData();
      } else {
        setActionError(data.error || 'Failed to decline assignment');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error declining assignment');
    } finally {
      setLoading(false);
    }
  };

  // Submit arrival verification
  const handleVerifyArrival = async (asmId: string, method: 'GPS' | 'QR' | 'PHOTO' | 'SUPERVISOR', payload: any) => {
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const bodyPayload = {
        assignmentId: asmId,
        staffId,
        verificationMethod: method,
        ...payload
      };

      const response = await fetch('/api/dispatch/verify-arrival', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer auth_session_tkn_7729'
        },
        body: JSON.stringify(bodyPayload)
      });
      const data = await response.json();
      if (response.ok) {
        setActionSuccess('Arrival verified successfully!');
        setShowArrivalVerificationModal(false);
        setShowPhotoUploadModal(false);
        setShowQrScanModal(false);
        setSupervisorIdInput('');
        setSupervisorReasonInput('');
        setQrScanInput('');
        refreshDispatchData();
      } else {
        setActionError(data.error || 'Failed to verify arrival');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error verifying arrival');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Photo Upload
  const handleUploadPhotoAndVerify = async (asmId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPhotoUploading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      // Upload base64 photo
      const uploadRes = await fetch('/api/dispatch/upload-photo', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer auth_session_tkn_7729'
        },
        body: JSON.stringify({
          image: dataUrl,
          fileName: `proof_${asmId}_${Date.now()}.jpg`
        })
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload photo proof');
      }

      // Now verify using the returned file path and token
      await handleVerifyArrival(asmId, 'PHOTO', {
        photoUrl: uploadData.photoUrl,
        photoToken: uploadData.photoToken
      });
    } catch (err: any) {
      setActionError(err.message || 'Error during photo upload and verification');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Dispatch a new task (Manager mode)
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaffIds.length === 0 || !dispatchTitle.trim()) {
      setActionError('Please select at least one staff member and specify task title.');
      return;
    }
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const response = await fetch('/api/dispatch/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffIds: selectedStaffIds,
          title: dispatchTitle,
          priority: dispatchPriority,
          taskType: dispatchTaskType,
          instructions: dispatchInstructions,
          destination: {
            building: dispatchBuilding,
            floor: dispatchFloor,
            ward: dispatchWard,
            room: dispatchRoom || undefined,
            bed: dispatchBed || undefined
          },
          patientReference: dispatchPatientRef || undefined,
          requiredTime: dispatchRequiredTime || undefined,
          photoRequired: dispatchPhotoRequired,
          qrRequired: dispatchQrRequired
        })
      });
      const data = await response.json();
      if (response.ok) {
        setActionSuccess(`Task dispatched successfully to ${selectedStaffIds.length} staff!`);
        setSelectedStaffIds([]);
        setDispatchTitle('');
        setDispatchInstructions('');
        setDispatchRoom('');
        setDispatchBed('');
        setDispatchPatientRef('');
        setDispatchRequiredTime('');
        refreshDispatchData();
      } else {
        setActionError(data.error || 'Failed to dispatch task');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error dispatching task');
    } finally {
      setLoading(false);
    }
  };

  // Cancel task (Manager mode)
  const handleCancelAssignment = async (asmId: string) => {
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const response = await fetch(`/api/dispatch/assignments/${asmId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          staffId: 'supervisor-101'
        })
      });
      const data = await response.json();
      if (response.ok) {
        setActionSuccess('Assignment successfully cancelled');
        refreshDispatchData();
      } else {
        setActionError(data.error || 'Failed to cancel assignment');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error cancelling assignment');
    } finally {
      setLoading(false);
    }
  };

  // Send Emergency Broadcast (Manager mode)
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const response = await fetch('/api/dispatch/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          priority: broadcastPriority,
          targetRoles: broadcastRoleFilter.length > 0 ? broadcastRoleFilter : undefined
        })
      });
      const data = await response.json();
      if (response.ok) {
        setActionSuccess('Emergency Broadcast sent to all matching devices!');
        setShowBroadcastModal(false);
        setBroadcastTitle('');
        setBroadcastMessage('');
        setBroadcastRoleFilter([]);
        refreshDispatchData();
      } else {
        setActionError(data.error || 'Failed to send emergency broadcast');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error sending emergency broadcast');
    } finally {
      setLoading(false);
    }
  };

  // Respond to Emergency Broadcast (Staff mode)
  const handleRespondBroadcast = async (broadcastId: string, recipientId: string, status: 'RESPONDING' | 'BUSY' | 'UNAVAILABLE', reason?: string) => {
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const response = await fetch('/api/dispatch/broadcast/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcastId,
          recipientId,
          status,
          reason
        })
      });
      const data = await response.json();
      if (response.ok) {
        setActionSuccess(`Response registered: ${status}`);
        refreshDispatchData();
      } else {
        setActionError(data.error || 'Failed to submit broadcast response');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error submitting response');
    } finally {
      setLoading(false);
    }
  };

  // Handle Clock-in / Clock-out
  const handleClockAction = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const response = await fetch('/api/attendance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          lat: activeLoc.lat,
          lng: activeLoc.lng,
          eventType: type,
          hospitalId: staffHospitalId
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.verified) {
          setActionSuccess(`Success! ${type === 'CLOCK_IN' ? 'Clocked In' : 'Clocked Out'} successfully.`);
          refreshData();
        } else if (data.requiresApproval) {
          // Open exception request modal
          setExceptionEventType(type);
          setShowExceptionModal(true);
        }
      } else {
        // Out of bounds and bypass was not requested
        setActionError(data.message || 'Verification failed. Out of bounds.');
      }
    } catch (err) {
      setActionError('Failed to communicate with authorization server.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Exception Request
  const handleExceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionReason.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/attendance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          lat: activeLoc.lat,
          lng: activeLoc.lng,
          eventType: exceptionEventType,
          hospitalId: staffHospitalId,
          bypassGeofence: true,
          reason: exceptionReason
        })
      });

      const data = await response.json();
      if (response.ok && data.requiresApproval) {
        setActionSuccess('Exception approval request submitted successfully.');
        setShowExceptionModal(false);
        setExceptionReason('');
        refreshData();
      } else {
        setActionError(data.message || 'Failed to submit exception.');
      }
    } catch (err) {
      setActionError('Network error submitting exception.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Leave Request
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/attendance/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          leaveType,
          reason: leaveReason
        })
      });

      if (response.ok) {
        setActionSuccess('Leave application submitted for approval.');
        setLeaveStartDate('');
        setLeaveEndDate('');
        setLeaveReason('');
        refreshData();
      } else {
        setActionError('Failed to submit leave application.');
      }
    } catch (err) {
      setActionError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Shift Swap Request
  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYourShiftId || !colleagueShiftId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/attendance/shift-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestingStaffId: staffId,
          targetStaffId: 'demo-colleague-id',
          requestingShiftId: selectedYourShiftId,
          targetShiftId: colleagueShiftId
        })
      });

      if (response.ok) {
        setActionSuccess('Shift swap request sent to colleague.');
        setSelectedYourShiftId('');
        setColleagueShiftId('');
        refreshData();
      } else {
        setActionError('Failed to submit swap request.');
      }
    } catch (err) {
      setActionError('Swap submit network failure.');
    } finally {
      setLoading(false);
    }
  };

  // Manager: Action Exceptions
  const handleActionException = async (exceptionId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/attendance/approve-exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exceptionId,
          status,
          managerId: 'demo-manager-id',
          comments: `Reviewed and ${status.toLowerCase()} via Warden Dashboard.`
        })
      });

      if (response.ok) {
        setActionSuccess(`Exception request ${status.toLowerCase()} successfully.`);
        refreshData();
      }
    } catch (err) {
      setActionError('Action exception request error.');
    }
  };

  // Manager: Action Leaves
  const handleActionLeave = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/attendance/approve-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId,
          status,
          managerId: 'demo-manager-id',
          comments: `Processed ${status.toLowerCase()} by Duty Sister.`
        })
      });

      if (response.ok) {
        setActionSuccess(`Leave request ${status.toLowerCase()} successfully.`);
        refreshData();
      }
    } catch (err) {
      setActionError('Leave processing error.');
    }
  };

  // Manager: Action Swaps
  const handleActionSwap = async (swapId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/attendance/approve-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swapId,
          status,
          reviewerId: 'demo-colleague-id'
        })
      });

      if (response.ok) {
        setActionSuccess(`Shift swap request ${status.toLowerCase()} successfully.`);
        refreshData();
      }
    } catch (err) {
      setActionError('Swap action network error.');
    }
  };

  // Derive Current Clock State
  // Latest verified CLOCK_IN with no following CLOCK_OUT
  const getClockState = () => {
    const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (sortedEvents.length === 0) return { isClockedIn: false, latestEvent: null };
    
    const latest = sortedEvents[0];
    return {
      isClockedIn: latest.event_type === 'CLOCK_IN',
      latestEvent: latest
    };
  };

  const { isClockedIn, latestEvent } = getClockState();

  // Helper: Format Date/Time
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-300 pb-28`}>
      {/* Top Banner Header */}
      <header className={`p-4 ${isDarkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'} shadow-sm flex items-center justify-between sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Fingerprint className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">MCGM Digital</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance & Roster Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition-all border ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
          >
            {isDarkMode ? <Clock className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setPortal('patient')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border ${
              isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Exit Portal
          </button>
        </div>
      </header>

      {/* Global Alert Notification */}
      <AnimatePresence>
        {(actionSuccess || actionError) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 pt-4 sticky top-16 z-25"
          >
            <div className={`p-3 rounded-2xl border flex items-center justify-between shadow-lg ${
              actionSuccess 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="flex items-center gap-2.5">
                {actionSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span className="text-[11px] font-bold leading-normal">{actionSuccess || actionError}</span>
              </div>
              <button 
                onClick={() => { setActionSuccess(null); setActionError(null); }}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* ============================================================
            1. HOME TAB VIEW
            ============================================================ */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Staff Card */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 relative border border-blue-500/20">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200" alt="avatar" className="object-cover w-full h-full" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wide">{staffName}</h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{staffDesignation}</p>
                  <p className="text-[9px] font-bold text-blue-500 mt-0.5">{staffDepartment}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                portalRole === 'manager' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {portalRole}
              </span>
            </div>

            {/* 1. Emergency Broadcast Alerts for Staff */}
            {activeBroadcasts.map((bc: any) => {
              const recipient = bc.recipients?.find((r: any) => r.staff_id === staffId);
              if (recipient && recipient.status === 'SENT') {
                return (
                  <motion.div
                    key={bc.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-rose-600 text-white rounded-3xl shadow-xl border border-rose-500/30 space-y-3 relative overflow-hidden animate-pulse"
                  >
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                      <AlertOctagon className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-white animate-ping" />
                      <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wider">
                        Emergency Broadcast
                      </span>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-wide">{bc.title}</h4>
                    <p className="text-[11px] leading-normal opacity-90">{bc.message}</p>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleRespondBroadcast(bc.id, staffId, 'RESPONDING')}
                        className="flex-1 py-2 bg-white text-rose-700 hover:bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        En Route
                      </button>
                      <button
                        onClick={() => handleRespondBroadcast(bc.id, staffId, 'BUSY')}
                        className="px-3 py-2 bg-rose-850 hover:bg-rose-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        Busy
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Specify reason for unavailability:');
                          if (reason) handleRespondBroadcast(bc.id, staffId, 'UNAVAILABLE', reason);
                        }}
                        className="px-3 py-2 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </motion.div>
                );
              }
              return null;
            })}

            {/* 2. New Assignment Popup (Sent state) */}
            {myAssignments.filter(asm => asm.status === 'SENT').map((asm: any) => (
              <motion.div
                key={asm.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl shadow-2xl border border-amber-400/30 space-y-4 relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                  <Bell className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <span className="text-[9px] font-black uppercase bg-white/25 px-2 py-0.5 rounded-full tracking-wider">
                      {asm.priority} TASK DISPATCHED
                    </span>
                  </div>
                  <span className="text-[8px] font-bold opacity-80">
                    Required: {asm.required_time ? new Date(asm.required_time).toLocaleTimeString() : 'ASAP'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black">{asm.title}</h4>
                  <p className="text-[10px] opacity-90 mt-1">{asm.instructions}</p>
                </div>
                <div className="flex items-center justify-between text-[9px] bg-black/15 p-2.5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-bold text-white">
                      Destination: {asm.destination.building} - {asm.destination.floor} - {asm.destination.ward}
                    </span>
                  </div>
                  {asm.patient_reference && (
                    <span className="font-semibold opacity-90">Pt: {asm.patient_reference}</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateAssignmentStatus(asm.id, 'ACCEPTED')}
                    className="flex-1 py-2.5 bg-white text-orange-600 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Acknowledge & Accept
                  </button>
                  <button
                    onClick={() => {
                      setDeclineTargetAsmId(asm.id);
                      setShowDeclineReasonModal(true);
                    }}
                    className="px-4 py-2.5 bg-orange-700 hover:bg-orange-850 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-orange-500/20"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            ))}

            {/* 3. Active Assignment Tracker (Accepted, En Route, Arrived, In Progress states) */}
            {activeMyAssignment && (
              <div className={`p-5 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-xl space-y-4`}>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Current Assignment</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                    activeMyAssignment.priority === 'EMERGENCY'
                      ? 'bg-rose-500/10 text-rose-500 animate-pulse'
                      : activeMyAssignment.priority === 'URGENT'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {activeMyAssignment.priority}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black">{activeMyAssignment.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{activeMyAssignment.instructions}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Destination</span>
                    <span className="font-bold">
                      {activeMyAssignment.destination.building}, {activeMyAssignment.destination.ward}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Verification Need</span>
                    <span className="font-bold">
                      {[
                        activeMyAssignment.qr_required && 'QR Scan',
                        activeMyAssignment.photo_required && 'Photo Proof',
                        !activeMyAssignment.qr_required && !activeMyAssignment.photo_required && 'GPS Check'
                      ].filter(Boolean).join(' + ') || 'GPS Check'}
                    </span>
                  </div>
                </div>

                {/* Progress flow steps visualizer */}
                <div className="flex justify-between items-center py-2 px-1 relative">
                  <div className="absolute left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                  
                  {['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].map((step, idx) => {
                    const statuses = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
                    const currentIdx = statuses.indexOf(activeMyAssignment.status);
                    const isCompleted = currentIdx >= idx;
                    const isActive = activeMyAssignment.status === step;
                    
                    return (
                      <div key={step} className="flex flex-col items-center z-10 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                          isCompleted
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-black">{idx + 1}</span>
                          )}
                        </div>
                        <span className={`text-[8px] font-black mt-1 uppercase tracking-wider ${
                          isActive ? 'text-blue-500' : 'text-slate-400'
                        }`}>
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action trigger button depending on status */}
                <div className="pt-2">
                  {activeMyAssignment.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateAssignmentStatus(activeMyAssignment.id, 'EN_ROUTE')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Start Journey / En Route
                    </button>
                  )}

                  {activeMyAssignment.status === 'EN_ROUTE' && (
                    <button
                      onClick={() => {
                        if (activeMyAssignment.photo_required) {
                          setVerificationMethod('PHOTO');
                        } else if (activeMyAssignment.qr_required) {
                          setVerificationMethod('QR');
                        } else {
                          setVerificationMethod('GPS');
                        }
                        setShowArrivalVerificationModal(true);
                      }}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      Verify Arrival
                    </button>
                  )}

                  {(activeMyAssignment.status === 'ARRIVED' || activeMyAssignment.status === 'IN_PROGRESS') && (
                    <div className="space-y-2">
                      {activeMyAssignment.status === 'ARRIVED' && (
                        <button
                          onClick={() => handleUpdateAssignmentStatus(activeMyAssignment.id, 'IN_PROGRESS')}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Activity className="w-4 h-4" />
                          Begin Action / Treatment
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const notes = prompt('Enter task completion details / notes:');
                          if (notes !== null) {
                            handleUpdateAssignmentStatus(activeMyAssignment.id, 'COMPLETED', { completionNotes: notes });
                          }
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckSquare className="w-4 h-4" />
                        Mark Task Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Simulated Location Spoofing Widget */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-md space-y-3`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Simulated GPS Coordinates</span>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  activeLoc.name.includes('Inside') 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {activeLoc.name.includes('Inside') ? 'IN GEOFENCE' : 'OUT OF BOUNDS'}
                </span>
              </div>
              
              <select
                value={selectedLocIndex}
                onChange={(e) => {
                  setSelectedLocIndex(Number(e.target.value));
                  setActionSuccess(null);
                  setActionError(null);
                }}
                className={`w-full p-3 rounded-2xl text-[11px] font-bold border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-600'
                } outline-none cursor-pointer`}
              >
                {simulatedLocations.map((loc, idx) => (
                  <option key={idx} value={idx}>
                    {loc.name} — {loc.desc}
                  </option>
                ))}
              </select>

              <div className="text-[9px] font-semibold text-slate-400 flex items-center justify-between px-1">
                <span>Lat: {activeLoc.lat.toFixed(5)} | Lng: {activeLoc.lng.toFixed(5)}</span>
                <span>Standard Geofence: {geofenceConfig.radius}m</span>
              </div>
            </div>

            {/* Clock-in Main Action Card */}
            <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-slate-800/80' : 'bg-white'} shadow-2xl space-y-6 flex flex-col items-center justify-center relative overflow-hidden`}>
              {/* Pulsing ring behind button */}
              <div className={`absolute w-44 h-44 rounded-full border opacity-5 transition-all duration-700 ${
                isClockedIn ? 'border-rose-500 animate-ping' : 'border-blue-500 animate-ping'
              }`} />

              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Local Digital Clock</span>
                <h2 className="text-3xl font-black tracking-tight">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h2>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Fingerprint Interactive Toggle */}
              <button
                onClick={() => handleClockAction(isClockedIn ? 'CLOCK_OUT' : 'CLOCK_IN')}
                disabled={loading}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl relative active:scale-95 hover:scale-105 transition-all duration-300 border-4 cursor-pointer ${
                  loading ? 'opacity-50 cursor-wait' : ''
                } ${
                  isClockedIn
                    ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-orange-500 border-white/20 text-white shadow-rose-500/20'
                    : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 border-white/20 text-white shadow-blue-500/20'
                }`}
              >
                <Fingerprint className="w-12 h-12 stroke-[1.5]" />
                <span className="text-[11px] font-black uppercase tracking-wider mt-3">
                  {loading ? 'Verifying...' : isClockedIn ? 'Clock Out' : 'Clock In'}
                </span>
                <span className="text-[7px] font-extrabold uppercase opacity-80 mt-1">Tap to register</span>
              </button>

              <div className="text-center space-y-1.5">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Status: {isClockedIn ? 'Active Duty' : 'Off Duty'}
                  </span>
                </div>
                {latestEvent && (
                  <p className="text-[9px] font-semibold text-slate-400">
                    Latest Event: {latestEvent.event_type} at {formatTime(latestEvent.timestamp)} ({latestEvent.verification_method})
                  </p>
                )}
              </div>
            </div>

            {/* Active Roster Info */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-md space-y-3`}>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned shift today</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black">Morning Shift Duty</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">Sion Hospital • Orthopedic Emergency</p>
                </div>
                <span className="text-xs font-black text-blue-500">08:00 AM - 04:00 PM</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setActiveTab('requests'); setSelectedYourShiftId(roster[0]?.id || ''); }}
                className={`p-3 rounded-2xl border text-center transition-all active:scale-95 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-100' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <RefreshCw className="w-4 h-4 mx-auto mb-1.5 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-wider block">Request Swap</span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`p-3 rounded-2xl border text-center transition-all active:scale-95 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-100' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <CalendarIcon className="w-4 h-4 mx-auto mb-1.5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-wider block">Apply Leave</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            2. ATTENDANCE TAB VIEW
            ============================================================ */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Calendar Widget */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Attendance Ledger</h3>
                <span className="text-xs font-black text-blue-500">July 2026</span>
              </div>

              {/* Simple grid representation */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-slate-400 mb-2">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold">
                {/* Blank slots */}
                <span className="p-1.5 text-slate-300 dark:text-slate-800">29</span>
                <span className="p-1.5 text-slate-300 dark:text-slate-800">30</span>
                {/* Active days */}
                {[...Array(15)].map((_, i) => {
                  const day = i + 1;
                  // Present or Verified status indicators
                  let bg = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400';
                  let border = 'border border-transparent';
                  if (day < 5) {
                    bg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  } else if (day === 5) {
                    bg = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                  } else if (day === 8) {
                    bg = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
                  }
                  
                  return (
                    <button key={i} className={`p-2 rounded-xl flex flex-col items-center justify-center ${bg} ${border}`}>
                      <span>{day}</span>
                    </button>
                  );
                })}
                {/* Today */}
                <button className="p-2 rounded-xl flex flex-col items-center justify-center bg-blue-600 text-white font-black shadow-md shadow-blue-500/20">
                  16
                </button>
                {/* Remaining days */}
                {[...Array(14)].map((_, i) => (
                  <span key={i} className="p-2 text-slate-400">{i + 17}</span>
                ))}
              </div>

              {/* Color coded legends */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[9px] font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 inline-block" />
                  <span>Verified Present (Geofence)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 inline-block" />
                  <span>Approved Exception (ICU)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 inline-block" />
                  <span>Approved Medical Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>Active Session Today</span>
                </div>
              </div>
            </div>

            {/* Attendance Logs History */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-md space-y-3`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">Recent Logs History</h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {events.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-4">No recent attendance events registered.</p>
                ) : (
                  [...events].reverse().map((evt) => (
                    <div key={evt.id} className="flex justify-between items-start text-xs border-b border-slate-100 dark:border-slate-850 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${evt.event_type === 'CLOCK_IN' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="font-bold">{evt.event_type === 'CLOCK_IN' ? 'Clocked In' : 'Clocked Out'}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            evt.verified 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {evt.verified ? 'Verified' : 'Bypassed'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">Method: {evt.verification_method} • Lat: {evt.lat.toFixed(4)}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{formatTime(evt.timestamp)}, {formatDate(evt.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}


        {/* ============================================================
            2.5 DISPATCH / COMMAND CENTER VIEW (MANAGER ONLY)
            ============================================================ */}
        {activeTab === 'dispatch' && portalRole === 'manager' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Header Metrics Card */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md text-center`}>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">On-Duty Staff</span>
                <span className="text-sm font-black text-emerald-500 mt-1 block">
                  {staffList.filter(s => s.attendanceStatus === 'CLOCKED_IN').length} / {staffList.length}
                </span>
              </div>
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md text-center`}>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Active Tasks</span>
                <span className="text-sm font-black text-blue-500 mt-1 block">
                  {allAssignments.filter(a => ['SENT', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(a.status)).length}
                </span>
              </div>
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md text-center`}>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Live Alerts</span>
                <span className="text-sm font-black text-rose-500 mt-1 block">
                  {activeBroadcasts.length}
                </span>
              </div>
            </div>

            {/* 2. Emergency Broadcast Trigger Card */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl space-y-4`}>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider">Emergency Broadcast</h3>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(!showBroadcastModal)}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                >
                  {showBroadcastModal ? 'Hide Form' : 'Open Form'}
                </button>
              </div>

              {showBroadcastModal && (
                <form onSubmit={handleSendBroadcast} className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Code / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. CODE BLUE - ICU BED 4"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      } outline-none`}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Priority</label>
                    <div className="flex gap-2">
                      {['EMERGENCY', 'URGENT'].map((pri) => (
                        <button
                          key={pri}
                          type="button"
                          onClick={() => setBroadcastPriority(pri as any)}
                          className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                            broadcastPriority === pri
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {pri}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Instructions</label>
                    <textarea
                      placeholder="Message content sent directly to staff mobile alerts..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      rows={2}
                      className={`w-full p-2.5 rounded-xl text-[11px] font-semibold border transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      } outline-none`}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Target Roles (None = All)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['DOCTOR', 'NURSE', 'TECHNICIAN', 'SUPPORT'].map((role) => {
                        const isSelected = broadcastRoleFilter.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setBroadcastRoleFilter(broadcastRoleFilter.filter(r => r !== role));
                              } else {
                                setBroadcastRoleFilter([...broadcastRoleFilter, role]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase transition-all ${
                              isSelected
                                ? 'bg-rose-500 text-white border border-rose-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md"
                  >
                    <Radio className="w-4 h-4" />
                    Transmit Emergency Broadcast
                  </button>
                </form>
              )}

              {/* Active Broadcast Recipients Tracker */}
              {activeBroadcasts.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Live Transmission Logs</span>
                  {activeBroadcasts.map((bc) => (
                    <div key={bc.id} className="p-2.5 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-rose-500 uppercase">{bc.title}</span>
                        <span className="text-[8px] font-bold text-slate-400">{new Date(bc.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="space-y-1">
                        {bc.recipients?.map((rec: any) => (
                          <div key={rec.id} className="flex justify-between items-center text-[9px] py-1 border-b border-rose-500/5 last:border-0">
                            <span className="font-semibold text-slate-300">{rec.staff_name || rec.staff_id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                              rec.status === 'RESPONDING'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : rec.status === 'BUSY'
                                ? 'bg-amber-500/15 text-amber-400'
                                : rec.status === 'UNAVAILABLE'
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-slate-500/15 text-slate-400'
                            }`}>
                              {rec.status} {rec.reason ? `(${rec.reason})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Main Command Terminals Splitter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Terminal Column 1: Staff list & filters */}
              <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl space-y-4`}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Directory</h3>
                  </div>
                  {selectedStaffIds.length > 0 && (
                    <button
                      onClick={() => setSelectedStaffIds([])}
                      className="text-[9px] font-black text-rose-500 uppercase"
                    >
                      Clear ({selectedStaffIds.length})
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className={`p-1.5 rounded-lg border font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="">All Depts</option>
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="General Medicine">General Med</option>
                  </select>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className={`p-1.5 rounded-lg border font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="">All Roles</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="TECHNICIAN">Technician</option>
                  </select>
                </div>

                {/* Directory Cards list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {staffList
                    .filter(s => !filterDepartment || s.department === filterDepartment)
                    .filter(s => !filterRole || s.role === filterRole)
                    .map((s) => {
                      const isSelected = selectedStaffIds.includes(s.id);
                      const isClockedIn = s.attendanceStatus === 'CLOCKED_IN';
                      const isAvailable = s.availabilityState === 'AVAILABLE';
                      
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStaffIds(selectedStaffIds.filter(id => id !== s.id));
                            } else {
                              setSelectedStaffIds([...selectedStaffIds, s.id]);
                            }
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                            isSelected
                              ? 'bg-blue-500/10 border-blue-500'
                              : isDarkMode
                              ? 'bg-slate-850 hover:bg-slate-800 border-slate-800'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <div>
                              <h4 className="text-[10px] font-black">{s.name}</h4>
                              <p className="text-[8px] font-bold text-slate-400 mt-0.5">{s.designation} • {s.department}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${
                              isClockedIn 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {isClockedIn ? 'ON DUTY' : 'OFF DUTY'}
                            </span>
                            {isClockedIn && (
                              <span className={`text-[7px] font-black ${
                                isAvailable ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {isAvailable ? '● AVAILABLE' : '● BUSY'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Terminal Column 2: New Assignment Dispatch Form */}
              <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl space-y-4`}>
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider">New Task Dispatch</h3>
                </div>

                <form onSubmit={handleCreateAssignment} className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Prepare Room 204 ICU bed"
                      value={dispatchTitle}
                      onChange={(e) => setDispatchTitle(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      } outline-none`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Priority</label>
                      <select
                        value={dispatchPriority}
                        onChange={(e: any) => setDispatchPriority(e.target.value)}
                        className={`w-full p-2 rounded-xl text-[11px] font-bold border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-850'
                        }`}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Task Type</label>
                      <select
                        value={dispatchTaskType}
                        onChange={(e) => setDispatchTaskType(e.target.value)}
                        className={`w-full p-2 rounded-xl text-[11px] font-bold border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-850'
                        }`}
                      >
                        <option value="REPORT_TO_LOCATION">Report Location</option>
                        <option value="PATIENT_CARE">Patient Care</option>
                        <option value="EQUIPMENT_CHECK">Equipment Check</option>
                        <option value="STAT_RESPONSE">STAT Response</option>
                      </select>
                    </div>
                  </div>

                  {/* Destination Info */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-850 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Building</label>
                      <input
                        type="text"
                        value={dispatchBuilding}
                        onChange={(e) => setDispatchBuilding(e.target.value)}
                        className="w-full bg-transparent text-[10px] font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Floor</label>
                      <input
                        type="text"
                        value={dispatchFloor}
                        onChange={(e) => setDispatchFloor(e.target.value)}
                        className="w-full bg-transparent text-[10px] font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Ward</label>
                      <input
                        type="text"
                        value={dispatchWard}
                        onChange={(e) => setDispatchWard(e.target.value)}
                        className="w-full bg-transparent text-[10px] font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Instructions</label>
                    <textarea
                      placeholder="Procedural details..."
                      value={dispatchInstructions}
                      onChange={(e) => setDispatchInstructions(e.target.value)}
                      rows={2}
                      className={`w-full p-2.5 rounded-xl text-[11px] font-semibold border transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      } outline-none`}
                    />
                  </div>

                  {/* Verification Gates */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Verification Required</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dispatchPhotoRequired}
                          onChange={(e) => setDispatchPhotoRequired(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Photo Proof</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dispatchQrRequired}
                          onChange={(e) => setDispatchQrRequired(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>QR Scan</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={selectedStaffIds.length === 0}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      selectedStaffIds.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        : 'bg-slate-200 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Selected ({selectedStaffIds.length})
                  </button>
                </form>
              </div>

              {/* Terminal Column 3: Kanban monitor board */}
              <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl space-y-4 md:col-span-1`}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Active Board</h3>
                  </div>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {allAssignments.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-8">No current assignments tracked.</p>
                  ) : (
                    allAssignments.map((asm) => {
                      const priorityColor = 
                        asm.priority === 'EMERGENCY'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse'
                          : asm.priority === 'URGENT'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20';

                      return (
                        <div
                          key={asm.id}
                          className={`p-3 rounded-2xl border ${
                            isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'
                          } space-y-2 hover:shadow-md transition-all`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${priorityColor}`}>
                              {asm.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                              asm.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : asm.status === 'SENT'
                                ? 'bg-slate-500/10 text-slate-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {asm.status}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-black">{asm.title}</h4>
                            <p className="text-[8px] text-slate-400 mt-0.5">Assigned: {asm.staff_name || asm.staff_id}</p>
                          </div>

                          <div className="text-[8px] font-bold text-slate-400 flex justify-between items-center bg-black/10 p-1.5 rounded-lg">
                            <span>Loc: {asm.destination?.building} • {asm.destination?.ward}</span>
                          </div>

                          {/* Render Photo Proof Verification Check */}
                          {asm.photo_url && (
                            <div className="pt-1.5">
                              <a
                                href={`${asm.photo_url}?token=${asm.photo_token || 'auth_session_tkn_7729'}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[8px] font-black uppercase tracking-wider block text-center border border-indigo-500/20"
                              >
                                View Photo Proof
                              </a>
                            </div>
                          )}

                          {/* Supervisor Action overrides */}
                          {['SENT', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(asm.status) && (
                            <div className="flex gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={() => {
                                  const reason = prompt('Specify reason for supervisor override:');
                                  if (reason) {
                                    handleVerifyArrival(asm.id, 'SUPERVISOR', {
                                      supervisorId: 'demo-supervisor-id',
                                      reason
                                    });
                                  }
                                }}
                                className="flex-1 py-1 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 rounded-lg text-[8px] font-black uppercase tracking-wider border border-amber-500/20"
                              >
                                Override Arrival
                              </button>
                              <button
                                onClick={() => handleCancelAssignment(asm.id)}
                                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 rounded-lg text-[8px] font-black uppercase tracking-wider border border-rose-500/20"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================
            3. REQUESTS TAB VIEW
            ============================================================ */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {portalRole === 'nurse' ? (
              <>
                {/* Roster Swap Request Section */}
                <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl space-y-4`}>
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <RefreshCw className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Request Shift Swap</h3>
                  </div>

                  <form onSubmit={handleSwapSubmit} className="space-y-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Select Your Shift</label>
                      <select
                        value={selectedYourShiftId}
                        onChange={(e) => setSelectedYourShiftId(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-600'
                        } outline-none cursor-pointer`}
                      >
                        <option value="">-- Choose Shift --</option>
                        {roster.map(s => (
                          <option key={s.id} value={s.id}>
                            {formatDate(s.start_time)} ({s.shift_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Select Colleague's Shift (Colleague: Sister Varsha)</label>
                      <select
                        value={colleagueShiftId}
                        onChange={(e) => setColleagueShiftId(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-600'
                        } outline-none cursor-pointer`}
                      >
                        <option value="">-- Choose Shift --</option>
                        {/* Colleagues shifts (with demo shift prefix) */}
                        <option value="shift-colleague-101">Colleague: July 17 (MORNING Shift)</option>
                        <option value="shift-colleague-102">Colleague: July 18 (AFTERNOON Shift)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !selectedYourShiftId || !colleagueShiftId}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      Send Swap Request
                    </button>
                  </form>

                  {/* List of Swaps */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Swap History</h4>
                    {swaps.length === 0 ? (
                      <p className="text-[9px] text-slate-400 text-center py-2">No swap requests submitted yet.</p>
                    ) : (
                      swaps.map(s => (
                        <div key={s.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                          <div>
                            <p className="font-bold">Colleague swap request</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Submitted: {formatDate(s.created_at)}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            s.status === 'APPROVED' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : s.status === 'REJECTED' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : 'bg-amber-500/10 text-amber-500 animate-pulse'
                          }`}>
                            {s.status.replace('_APPROVAL', '')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Apply Leave Section */}
                <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-xl space-y-4`}>
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Apply Leave</h3>
                  </div>

                  <form onSubmit={handleLeaveSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className={`w-full p-2 rounded-xl text-[11px] font-bold border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-800 border-slate-700 text-slate-100' 
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">End Date</label>
                        <input
                          type="date"
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className={`w-full p-2 rounded-xl text-[11px] font-bold border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-800 border-slate-700 text-slate-100' 
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Leave Type</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as any)}
                        className={`w-full p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-100' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        } outline-none cursor-pointer`}
                      >
                        <option value="CASUAL">Casual Leave (CL)</option>
                        <option value="SICK">Sick Leave (SL)</option>
                        <option value="EARNED">Earned Leave (EL)</option>
                        <option value="UNPAID">Unpaid Leave (LWP)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Reason for Leave</label>
                      <textarea
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="Reason for requesting leave..."
                        className={`w-full p-2.5 rounded-xl text-[11px] font-bold border transition-all h-20 resize-none ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-100' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !leaveStartDate || !leaveEndDate || !leaveReason}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      Submit Leave Application
                    </button>
                  </form>

                  {/* Leave history */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Leave History</h4>
                    {leaves.length === 0 ? (
                      <p className="text-[9px] text-slate-400 text-center py-2">No leave applications registered.</p>
                    ) : (
                      leaves.map(l => (
                        <div key={l.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                          <div>
                            <p className="font-bold">{l.leave_type} Leave</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{l.start_date} to {l.end_date}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            l.status === 'APPROVED' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : l.status === 'REJECTED' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : 'bg-amber-500/10 text-amber-500 animate-pulse'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* MANAGER VIEW: Supervisor approvals dashboard */
              <div className="space-y-4">
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md text-center`}>
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">On-Duty Today</h5>
                    <h2 className="text-2xl font-black mt-1 text-emerald-500">12 Staff</h2>
                  </div>
                  <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md text-center`}>
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Exceptions</h5>
                    <h2 className="text-2xl font-black mt-1 text-amber-500">
                      {workforceData.pendingExceptions.length} Requests
                    </h2>
                  </div>
                </div>

                {/* Exceptions Approval List */}
                <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md space-y-3`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Pending Exception Approvals
                  </h3>

                  <div className="space-y-3">
                    {workforceData.pendingExceptions.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">No pending exceptions require review.</p>
                    ) : (
                      workforceData.pendingExceptions.map(exc => (
                        <div key={exc.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black">Sister Sneha Shinde</h4>
                              <p className="text-[8px] font-bold text-blue-500 mt-0.5">{exc.event_type} Request</p>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400">{formatTime(exc.timestamp)}</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 leading-normal bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            "{exc.reason}"
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleActionException(exc.id, 'APPROVED')}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleActionException(exc.id, 'REJECTED')}
                              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Leaves Approval List */}
                <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md space-y-3`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Pending Leave Requests
                  </h3>

                  <div className="space-y-3">
                    {workforceData.pendingLeaves.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">No pending leave requests found.</p>
                    ) : (
                      workforceData.pendingLeaves.map(leave => (
                        <div key={leave.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black">Sister Sneha Shinde</h4>
                              <p className="text-[8px] font-bold text-emerald-500 mt-0.5">{leave.leave_type} Leave</p>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400">{leave.start_date} to {leave.end_date}</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 leading-normal bg-white dark:bg-slate-900 p-2 rounded-xl">
                            Reason: "{leave.reason}"
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleActionLeave(leave.id, 'APPROVED')}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleActionLeave(leave.id, 'REJECTED')}
                              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Shift Swap Approval List */}
                <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} shadow-md space-y-3`}>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Colleague Swap Requests (Colleague Board)
                  </h3>

                  <div className="space-y-3">
                    {workforceData.pendingSwaps.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">No pending colleague swaps found.</p>
                    ) : (
                      workforceData.pendingSwaps.map(swap => (
                        <div key={swap.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <h4 className="text-xs font-black">Swap request from: Sister Sneha</h4>
                          <p className="text-[10px] text-slate-400">
                            Wants to swap tomorrow's shift with your morning shift.
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleActionSwap(swap.id, 'APPROVED')}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Accept Swap
                            </button>
                            <button
                              onClick={() => handleActionSwap(swap.id, 'REJECTED')}
                              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            4. PROFILE TAB VIEW
            ============================================================ */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Digital ID Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white p-6 border border-white/10">
              {/* Background hospital logo silhouette */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10">
                <ShieldCheck className="w-56 h-56" />
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    MCGM Emergency Staff Card
                  </span>
                  <h3 className="text-lg font-black tracking-tight mt-1">Sion Hospital</h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white/30 shadow-md">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200" alt="avatar" className="object-cover w-full h-full" />
                </div>
                <div>
                  <h2 className="text-sm font-black">{staffName}</h2>
                  <p className="text-[10px] opacity-90 font-bold">{staffDesignation}</p>
                  <p className="text-[9px] opacity-75 font-semibold mt-1">ID: MCGM-STF-40291</p>
                </div>
              </div>

              <div className="flex justify-between items-end mt-6 pt-4 border-t border-white/20">
                <div className="text-[8px] font-bold opacity-80">
                  <p>DEPT: ORTHOPEDIC WARD</p>
                  <p className="mt-0.5">VALID TILL: DEC 2029</p>
                </div>
                <QrCode className="w-8 h-8 opacity-90" />
              </div>
            </div>

            {/* Portal Role Switcher Card */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-md space-y-3`}>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Settings className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Demo / Developer Panel</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black">Active Roster Role</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">Swap to test supervisor approval workflow</p>
                </div>
                
                {/* Switcher Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setPortalRole('nurse')}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      portalRole === 'nurse' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Nurse
                  </button>
                  <button
                    onClick={() => setPortalRole('manager')}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      portalRole === 'manager' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Supervisor
                  </button>
                </div>
              </div>
            </div>

            {/* General Profile Settings */}
            <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-white'} shadow-md space-y-3.5 text-xs`}>
              <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-850 pb-2 last:border-0 last:pb-0">
                <span className="font-bold">Aadhaar Handshake</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Verified & Linked</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-850 pb-2 last:border-0 last:pb-0">
                <span className="font-bold">Biometric Authentication</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">Active</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-850 pb-2 last:border-0 last:pb-0">
                <span className="font-bold">Offline Sync Storage</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">0 records queued</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full py-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border border-rose-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out from MCGM
            </button>
          </div>
        )}
      </main>

      {/* Exception Request Modal overlay */}
      <AnimatePresence>
        {showExceptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowExceptionModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-5 relative z-10 shadow-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Geofence Validation Warning</h3>
                  <h2 className="text-sm font-black mt-1">Out of Bounds Coordinates Detected</h2>
                </div>
                <button 
                  onClick={() => setShowExceptionModal(false)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal mb-4">
                You are currently {activeLoc.desc.replace('Out of Bounds ', '')}. To register a manual {exceptionEventType.replace('_', ' ')} exception, please specify the justification reason below for supervisor approval.
              </p>

              <form onSubmit={handleExceptionSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Justification Reason</label>
                  <textarea
                    required
                    value={exceptionReason}
                    onChange={(e) => setExceptionReason(e.target.value)}
                    placeholder="E.g., calibration error, emergency ambulance transfer duty, etc."
                    className={`w-full p-3 rounded-2xl text-[11px] font-bold border transition-all h-20 resize-none outline-none ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-slate-100' 
                        : 'bg-slate-50 border-slate-200 focus:border-blue-600 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExceptionModal(false)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !exceptionReason.trim()}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Sticky Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t flex justify-around p-2 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } shadow-lg safe-bottom`}>
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-blue-500' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">Clock</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'attendance' ? 'text-blue-500' : 'text-slate-400'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'requests' ? 'text-blue-500' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          {portalRole === 'manager' && workforceData.pendingExceptions.length > 0 && (
            <span className="absolute top-0 right-3 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 text-[7px] font-black text-white items-center justify-center">!</span>
            </span>
          )}
          <span className="text-[9px] font-black uppercase tracking-wider">Requests</span>
        </button>

        {portalRole === 'manager' && (
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'dispatch' ? 'text-blue-500' : 'text-slate-400'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Command</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile' ? 'text-blue-500' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}
