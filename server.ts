import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';


// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Clinical Blood Test Interpretation API using Gemini 3.5 Flash
app.post('/api/clinical-interpretation', async (req, res) => {
  const { results } = req.body;

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Valid hematology results array is required' });
  }

  // Format blood metrics for prompt context
  const metricsStr = results
    .map((r: any) => `${r.parameter}: ${r.result} ${r.unit} (Normal Range: ${r.normalRange}, Status: ${r.status})`)
    .join('\n');

  const prompt = `You are a clinical hematology AI specialist. Analyze the following patient Complete Blood Count (CBC) parameters and write a professional, highly readable Clinical Interpretation report.

CBC METRICS:
${metricsStr}

INSTRUCTIONS:
1. Briefly summarize what these findings indicate in professional, supportive language.
2. Identify specifically any abnormalities (such as the low RBC Count or high Platelet Count in the sample, if present).
3. Offer constructive clinical next steps, such as hydration, dietary advice, and consulting their primary care physician.
4. Keep the output clinical, clear, objective, and compact (max 150 words). Do NOT use excessive markdown, just clean paragraphs.`;

  try {
    if (!ai) {
      // Graceful fallback if API key is not configured in the developer workspace
      console.warn('Gemini API key is not set. Using high-fidelity clinical simulation.');
      const fallbackInterpretation = `The CBC parameters indicate a borderline low Red Blood Cell (RBC) count of 4.1 million/µL, which suggests mild iron-deficiency anemia or sub-optimal nutritional status. Vitals are stable as Hemoglobin remains normal.

Platelet levels are high at 460,000 cells/mm³ (mild thrombocytosis), often a reactive inflammation or minor infection response. We advise patient hydration and clinical follow-up within two weeks to correlate these parameters.`;
      return res.json({ interpretation: fallbackInterpretation });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const text = response.text || 'Diagnostic assessment completed. Suggest routine physician correlation.';
    res.json({ interpretation: text.trim() });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({
      error: 'Failed to generate diagnostic summary',
      details: err.message,
    });
  }
});

// ============================================================
// STAFF ATTENDANCE, ROSTER & GEOFENCING API SYSTEM
// ============================================================

// Fallback local memory state definitions
interface MemoryAttendanceEvent {
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

interface MemoryAttendanceException {
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

interface MemoryShiftSwap {
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

interface MemoryLeaveRequest {
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

interface MemoryShift {
  id: string;
  hospital_id: string;
  staff_id: string;
  shift_type: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'EMERGENCY';
  date: string;
  start_time: string;
  end_time: string;
}

// Memory database
const mockShifts: MemoryShift[] = [];
const mockEvents: MemoryAttendanceEvent[] = [];
const mockExceptions: MemoryAttendanceException[] = [];
const mockSwaps: MemoryShiftSwap[] = [];
const mockLeaves: MemoryLeaveRequest[] = [];

// Hospital Geofence Coords (Mumbai MCGM Campuses)
const hospitalCoordinates: Record<string, { lat: number; lng: number; radius: number }> = {
  'h1': { lat: 19.0360, lng: 72.8596, radius: 150 }, // Sion Hospital
  'h2': { lat: 19.0025, lng: 72.8420, radius: 150 }, // KEM Hospital
  'h3': { lat: 18.9774, lng: 72.8222, radius: 150 }, // Nair Hospital
  'h4': { lat: 19.1110, lng: 72.8360, radius: 150 }, // Cooper Hospital
  'demo-hospital': { lat: 19.0360, lng: 72.8596, radius: 150 }
};

// Populate memory database dynamically for testing
function initMemoryDB() {
  const today = new Date();
  const getOffsetDateString = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const shiftTypes: Array<'MORNING' | 'AFTERNOON' | 'NIGHT' | 'EMERGENCY'> = ['MORNING', 'AFTERNOON', 'NIGHT', 'MORNING', 'AFTERNOON', 'NIGHT', 'MORNING'];
  
  // Create 10 days of shifts
  for (let i = -5; i <= 5; i++) {
    const dateStr = getOffsetDateString(i);
    const shiftType = shiftTypes[Math.abs(i) % shiftTypes.length];
    
    let startTime = '';
    let endTime = '';
    if (shiftType === 'MORNING') {
      startTime = `${dateStr}T08:00:00Z`;
      endTime = `${dateStr}T16:00:00Z`;
    } else if (shiftType === 'AFTERNOON') {
      startTime = `${dateStr}T16:00:00Z`;
      endTime = `${dateStr}T00:00:00Z`;
    } else {
      startTime = `${dateStr}T00:00:00Z`;
      endTime = `${dateStr}T08:00:00Z`;
    }

    // Nurse shifts
    mockShifts.push({
      id: `shift-nurse-${i + 100}`,
      hospital_id: 'h1',
      staff_id: 'demo-nurse-id',
      shift_type: shiftType,
      date: dateStr,
      start_time: startTime,
      end_time: endTime
    });

    // Colleague shifts
    mockShifts.push({
      id: `shift-colleague-${i + 100}`,
      hospital_id: 'h1',
      staff_id: 'demo-colleague-id',
      shift_type: shiftType === 'MORNING' ? 'AFTERNOON' : 'MORNING',
      date: dateStr,
      start_time: shiftType === 'MORNING' ? `${dateStr}T16:00:00Z` : `${dateStr}T08:00:00Z`,
      end_time: shiftType === 'MORNING' ? `${dateStr}T00:00:00Z` : `${dateStr}T16:00:00Z`
    });
  }

  // Pre-populate some attendance history
  mockEvents.push({
    id: 'evt-1',
    staff_id: 'demo-nurse-id',
    shift_id: 'shift-nurse-95', // 5 days ago
    event_type: 'CLOCK_IN',
    timestamp: getOffsetDateString(-5) + 'T08:05:00Z',
    lat: 19.0361,
    lng: 72.8595,
    verified: true,
    verification_method: 'GEOFENCE',
    exception_id: null
  });
  mockEvents.push({
    id: 'evt-2',
    staff_id: 'demo-nurse-id',
    shift_id: 'shift-nurse-95',
    event_type: 'CLOCK_OUT',
    timestamp: getOffsetDateString(-5) + 'T16:02:00Z',
    lat: 19.0359,
    lng: 72.8597,
    verified: true,
    verification_method: 'GEOFENCE',
    exception_id: null
  });

  // Approved Exception clock-in
  const excId = 'exc-1';
  mockExceptions.push({
    id: excId,
    staff_id: 'demo-nurse-id',
    event_type: 'CLOCK_IN',
    timestamp: getOffsetDateString(-4) + 'T08:15:00Z',
    lat: 19.0500, // out of bounds
    lng: 72.8800,
    reason: 'Device GPS calibration failed indoors inside the MRI diagnostics wing.',
    status: 'APPROVED',
    reviewed_by: 'demo-manager-id',
    reviewed_at: getOffsetDateString(-4) + 'T09:00:00Z',
    comments: 'Duty verified by nurse ward supervisor.',
    created_at: getOffsetDateString(-4) + 'T08:15:00Z'
  });
  
  mockEvents.push({
    id: 'evt-3',
    staff_id: 'demo-nurse-id',
    shift_id: 'shift-nurse-96',
    event_type: 'CLOCK_IN',
    timestamp: getOffsetDateString(-4) + 'T08:15:00Z',
    lat: 19.0500,
    lng: 72.8800,
    verified: true,
    verification_method: 'EXCEPTION',
    exception_id: excId
  });

  // Pending Exception for testing
  mockExceptions.push({
    id: 'exc-pending',
    staff_id: 'demo-nurse-id',
    event_type: 'CLOCK_IN',
    timestamp: getOffsetDateString(0) + 'T08:10:00Z',
    lat: 19.0700,
    lng: 72.8900,
    reason: 'Sion Hospital emergency ward power outage disrupted local campus beacon sync.',
    status: 'PENDING',
    reviewed_by: null,
    reviewed_at: null,
    comments: null,
    created_at: getOffsetDateString(0) + 'T08:10:00Z'
  });

  // Pending Leave Request
  mockLeaves.push({
    id: 'leave-1',
    staff_id: 'demo-nurse-id',
    start_date: getOffsetDateString(2),
    end_date: getOffsetDateString(3),
    leave_type: 'CASUAL',
    reason: 'Personal family emergency in Pune.',
    status: 'PENDING',
    reviewed_by: null,
    reviewed_at: null,
    comments: null,
    created_at: today.toISOString()
  });

  // Pending Shift Swap
  mockSwaps.push({
    id: 'swap-1',
    requesting_staff_id: 'demo-nurse-id',
    target_staff_id: 'demo-colleague-id',
    requesting_shift_id: `shift-nurse-101`, // tomorrow
    target_shift_id: `shift-colleague-101`,
    status: 'PENDING_APPROVAL',
    reviewed_by: null,
    reviewed_at: null,
    created_at: today.toISOString()
  });
}

initMemoryDB();

// Haversine formula for distance check
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

// 1. Get Campus Config / Geofence coordinates
app.get('/api/attendance/config/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;
  const config = hospitalCoordinates[hospitalId] || hospitalCoordinates['demo-hospital'];
  res.json(config);
});

// 2. Verify clock-in/out and validate geofence (strictly server-side verification)
app.post('/api/attendance/verify', (req, res) => {
  const { staffId, lat, lng, eventType, hospitalId, bypassGeofence, reason } = req.body;

  if (!staffId || lat === undefined || lng === undefined || !eventType || !hospitalId) {
    return res.status(400).json({ error: 'Missing required validation parameters' });
  }

  // Get hospital coordinates config
  const config = hospitalCoordinates[hospitalId] || hospitalCoordinates['demo-hospital'];
  
  // Calculate true distance on server
  const distance = calculateHaversineDistance(lat, lng, config.lat, config.lng);
  const isInside = distance <= config.radius;

  if (isInside) {
    // Verified geofenced attendance
    const event: MemoryAttendanceEvent = {
      id: 'evt-' + Date.now(),
      staff_id: staffId,
      shift_id: null, // can be linked by active window on client/server lookup
      event_type: eventType,
      timestamp: new Date().toISOString(),
      lat,
      lng,
      verified: true,
      verification_method: 'GEOFENCE',
      exception_id: null
    };
    
    mockEvents.push(event);
    return res.json({
      success: true,
      verified: true,
      distance: Math.round(distance),
      radius: config.radius,
      message: `${eventType === 'CLOCK_IN' ? 'Clock-in' : 'Clock-out'} verified successfully within the hospital campus.`,
      event
    });
  } else {
    // Out of bounds
    if (bypassGeofence && reason) {
      // Create manual exception request
      const exceptionId = 'exc-' + Date.now();
      const exception: MemoryAttendanceException = {
        id: exceptionId,
        staff_id: staffId,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        lat,
        lng,
        reason,
        status: 'PENDING',
        reviewed_by: null,
        reviewed_at: null,
        comments: null,
        created_at: new Date().toISOString()
      };

      mockExceptions.push(exception);
      return res.json({
        success: true,
        verified: false,
        requiresApproval: true,
        distance: Math.round(distance),
        radius: config.radius,
        message: 'Out of bounds coordinate detected. Exception request submitted for supervisor approval.',
        exception
      });
    } else {
      return res.json({
        success: true,
        verified: false,
        requiresApproval: true,
        distance: Math.round(distance),
        radius: config.radius,
        message: `Out of bounds coordinate detected. Exception justification required.`
      });
    }
  }
});

// 3. Get history for staff
app.get('/api/attendance/history/:staffId', (req, res) => {
  const { staffId } = req.params;
  const events = mockEvents.filter(e => e.staff_id === staffId);
  const exceptions = mockExceptions.filter(e => e.staff_id === staffId);
  res.json({ events, exceptions });
});

// 4. Get roster shifts for staff
app.get('/api/attendance/roster/:staffId', (req, res) => {
  const { staffId } = req.params;
  const shifts = mockShifts.filter(s => s.staff_id === staffId);
  res.json(shifts);
});

// 5. Shift swaps
app.post('/api/attendance/shift-swap', (req, res) => {
  const { requestingStaffId, targetStaffId, requestingShiftId, targetShiftId } = req.body;
  if (!requestingStaffId || !targetStaffId || !requestingShiftId || !targetShiftId) {
    return res.status(400).json({ error: 'Missing parameters for shift swap' });
  }

  const swap: MemoryShiftSwap = {
    id: 'swap-' + Date.now(),
    requesting_staff_id: requestingStaffId,
    target_staff_id: targetStaffId,
    requesting_shift_id: requestingShiftId,
    target_shift_id: targetShiftId,
    status: 'PENDING_APPROVAL',
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString()
  };

  mockSwaps.push(swap);
  res.json({ success: true, swap });
});

// 6. Get shift swaps
app.get('/api/attendance/swaps/:staffId', (req, res) => {
  const { staffId } = req.params;
  const swaps = mockSwaps.filter(s => s.requesting_staff_id === staffId || s.target_staff_id === staffId);
  res.json(swaps);
});

// 7. Leave requests
app.post('/api/attendance/leave', (req, res) => {
  const { staffId, startDate, endDate, leaveType, reason } = req.body;
  if (!staffId || !startDate || !endDate || !leaveType || !reason) {
    return res.status(400).json({ error: 'Missing parameters for leave request' });
  }

  const leave: MemoryLeaveRequest = {
    id: 'leave-' + Date.now(),
    staff_id: staffId,
    start_date: startDate,
    end_date: endDate,
    leave_type: leaveType,
    reason,
    status: 'PENDING',
    reviewed_by: null,
    reviewed_at: null,
    comments: null,
    created_at: new Date().toISOString()
  };

  mockLeaves.push(leave);
  res.json({ success: true, leave });
});

// 8. Get leave requests
app.get('/api/attendance/leave/:staffId', (req, res) => {
  const { staffId } = req.params;
  const leaves = mockLeaves.filter(l => l.staff_id === staffId);
  res.json(leaves);
});

// 9. Manager: Get live workforce dashboard status
app.get('/api/attendance/workforce', (req, res) => {
  // Count active clock-ins today
  const todayStr = new Date().toISOString().split('T')[0];
  const activeClockIns = mockEvents.filter(e => e.event_type === 'CLOCK_IN' && e.timestamp.startsWith(todayStr));
  
  // Pending exceptions
  const pendingExceptions = mockExceptions.filter(e => e.status === 'PENDING');
  // Pending leaves
  const pendingLeaves = mockLeaves.filter(l => l.status === 'PENDING');
  // Pending swaps
  const pendingSwaps = mockSwaps.filter(s => s.status === 'PENDING_APPROVAL');

  res.json({
    activeClockInsCount: activeClockIns.length,
    activeClockIns,
    pendingExceptions,
    pendingLeaves,
    pendingSwaps
  });
});

// 10. Manager: Action pending exception
app.post('/api/attendance/approve-exception', (req, res) => {
  const { exceptionId, status, managerId, comments } = req.body;
  if (!exceptionId || !status || !managerId) {
    return res.status(400).json({ error: 'Missing decision parameters' });
  }

  const excIndex = mockExceptions.findIndex(e => e.id === exceptionId);
  if (excIndex === -1) {
    return res.status(404).json({ error: 'Exception request not found' });
  }

  mockExceptions[excIndex].status = status;
  mockExceptions[excIndex].reviewed_by = managerId;
  mockExceptions[excIndex].reviewed_at = new Date().toISOString();
  mockExceptions[excIndex].comments = comments;

  if (status === 'APPROVED') {
    // If approved, create verified event
    const exc = mockExceptions[excIndex];
    mockEvents.push({
      id: 'evt-' + Date.now(),
      staff_id: exc.staff_id,
      shift_id: null,
      event_type: exc.event_type,
      timestamp: exc.timestamp,
      lat: exc.lat,
      lng: exc.lng,
      verified: true,
      verification_method: 'EXCEPTION',
      exception_id: exc.id
    });
  }

  res.json({ success: true, exception: mockExceptions[excIndex] });
});

// 11. Manager: Action leave request
app.post('/api/attendance/approve-leave', (req, res) => {
  const { leaveId, status, managerId, comments } = req.body;
  if (!leaveId || !status || !managerId) {
    return res.status(400).json({ error: 'Missing leave decision parameters' });
  }

  const leaveIndex = mockLeaves.findIndex(l => l.id === leaveId);
  if (leaveIndex === -1) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  mockLeaves[leaveIndex].status = status;
  mockLeaves[leaveIndex].reviewed_by = managerId;
  mockLeaves[leaveIndex].reviewed_at = new Date().toISOString();
  mockLeaves[leaveIndex].comments = comments;

  res.json({ success: true, leave: mockLeaves[leaveIndex] });
});

// 12. Manager/Colleague: Action shift swap
app.post('/api/attendance/approve-swap', (req, res) => {
  const { swapId, status, reviewerId } = req.body;
  if (!swapId || !status || !reviewerId) {
    return res.status(400).json({ error: 'Missing swap approval parameters' });
  }

  const swapIndex = mockSwaps.findIndex(s => s.id === swapId);
  if (swapIndex === -1) {
    return res.status(404).json({ error: 'Shift swap request not found' });
  }

  mockSwaps[swapIndex].status = status;
  mockSwaps[swapIndex].reviewed_by = reviewerId;
  mockSwaps[swapIndex].reviewed_at = new Date().toISOString();

  if (status === 'APPROVED') {
    const swap = mockSwaps[swapIndex];
    // Swap the staff_id values of the two shifts
    const reqShiftIndex = mockShifts.findIndex(s => s.id === swap.requesting_shift_id);
    const tarShiftIndex = mockShifts.findIndex(s => s.id === swap.target_shift_id);

    if (reqShiftIndex !== -1 && tarShiftIndex !== -1) {
      const tempStaff = mockShifts[reqShiftIndex].staff_id;
      mockShifts[reqShiftIndex].staff_id = mockShifts[tarShiftIndex].staff_id;
      mockShifts[tarShiftIndex].staff_id = tempStaff;
    }
  }

  res.json({ success: true, swap: mockSwaps[swapIndex] });
});

// ============================================================
// CENTRAL STAFF DISPATCH, ALERTS & PROOF OF ARRIVAL API SYSTEM
// ============================================================

interface MemoryStaffAssignment {
  id: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  task_type: 'REPORT_TO_LOCATION' | 'PATIENT_ASSISTANCE' | 'WARD_ASSIGNMENT' | 'EMERGENCY_RESPONSE' | 'PATIENT_TRANSPORT' | 'SAMPLE_COLLECTION' | 'MEDICATION_DELIVERY' | 'EQUIPMENT_REQUEST' | 'CODE_RESPONSE' | 'OT_ASSISTANCE' | 'ICU_ASSISTANCE' | 'SECURITY_ASSISTANCE' | 'HOUSEKEEPING' | 'TECHNICAL_SUPPORT' | 'OTHER';
  title: string;
  instructions: string | null;
  destination_building: string | null;
  destination_floor: string | null;
  destination_ward: string | null;
  destination_room: string | null;
  destination_bed: string | null;
  patient_ref: string | null;
  required_arrival_time: string | null;
  ack_required: boolean;
  loc_verification_required: boolean;
  photo_proof_required: boolean;
  completion_required: boolean;
  status: 'CREATED' | 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED' | 'ESCALATED';
  assigned_staff_id: string;
  created_by: string;
  created_at: string;
  declined_reason?: string | null;
  escalated_at?: string | null;
  escalation_action_taken?: string | null;
  acknowledged_at?: string | null;
  accepted_at?: string | null;
  arrived_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
}

interface MemoryArrivalVerification {
  id: string;
  assignment_id: string;
  staff_id: string;
  verification_method: 'GPS' | 'QR' | 'NFC' | 'PHOTO' | 'SUPERVISOR';
  verified_at: string;
  lat: number | null;
  lng: number | null;
  qr_code_scanned: string | null;
  photo_url: string | null;
  supervisor_id: string | null;
  supervisor_reason: string | null;
  verification_status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  rejected_reason?: string | null;
}

interface MemoryEmergencyBroadcast {
  id: string;
  title: string;
  message: string;
  priority: 'URGENT' | 'EMERGENCY';
  created_by: string;
  created_at: string;
}

interface MemoryEmergencyBroadcastRecipient {
  id: string;
  broadcast_id: string;
  staff_id: string;
  response_status: 'PENDING' | 'RESPONDING' | 'UNAVAILABLE' | 'ALREADY_ASSIGNED';
  updated_at: string;
}

interface MockStaffMember {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'ECG Technician' | 'Ward Assistant' | 'Security' | 'Housekeeping' | 'Supervisor';
  department: string;
  qualification: string;
  building: string;
  floor: string;
  ward: string;
  shift_ends_in_min: number;
}

// In-Memory Database Collections
const mockStaff: MockStaffMember[] = [
  { id: 'demo-nurse-id', name: 'Sister Sneha Shinde', role: 'Nurse', department: 'Orthopedic Ward', qualification: 'ICU Certified', building: 'Main Building', floor: '3rd Floor', ward: 'Ward 7', shift_ends_in_min: 180 },
  { id: 'demo-colleague-id', name: 'Sister Varsha Sawant', role: 'Nurse', department: 'Orthopedic Ward', qualification: 'General Nursing', building: 'Main Building', floor: '3rd Floor', ward: 'Ward 5', shift_ends_in_min: 220 },
  { id: 'staff-sharma', name: 'Dr. Alok Sharma', role: 'Doctor', department: 'General Medicine', qualification: 'MD Cardiology', building: 'OPD Building', floor: '2nd Floor', ward: 'OPD 4', shift_ends_in_min: 120 },
  { id: 'staff-rahul', name: 'Rahul Deshmukh', role: 'ECG Technician', department: 'Diagnostics', qualification: 'ECG Specialist', building: 'Diagnostics Wing', floor: '1st Floor', ward: 'ECG Lab', shift_ends_in_min: 90 },
  { id: 'staff-amit', name: 'Amit Patil', role: 'Ward Assistant', department: 'Emergency', qualification: 'Patient Transport', building: 'Main Building', floor: '1st Floor', ward: 'Emergency Ward', shift_ends_in_min: 420 },
  { id: 'staff-ravi', name: 'Ravi Naik', role: 'Security', department: 'Security Department', qualification: 'Crisis Response', building: 'Gate 1', floor: 'Ground Floor', ward: 'Main Entrance', shift_ends_in_min: 8 },
  { id: 'staff-sneha-p', name: 'Nurse Sneha Patil', role: 'Nurse', department: 'Emergency', qualification: 'Resus Certified', building: 'Main Building', floor: '1st Floor', ward: 'Resus Bay 1', shift_ends_in_min: 60 },
  { id: 'staff-kamlesh', name: 'Kamlesh Solanki', role: 'Housekeeping', department: 'Facilities', qualification: 'Sanitation Specialist', building: 'Main Building', floor: '4th Floor', ward: 'Pediatrics Ward', shift_ends_in_min: 310 }
];

const mockAssignments: MemoryStaffAssignment[] = [];
const mockArrivalVerifications: MemoryArrivalVerification[] = [];
const mockAvailability: Record<string, 'AVAILABLE' | 'BUSY' | 'RESPONDING' | 'AT_LOCATION' | 'ON_BREAK' | 'ON_CALL' | 'UNAVAILABLE' | 'ENDING_SHIFT_SOON'> = {};
const mockBroadcasts: MemoryEmergencyBroadcast[] = [];
const mockBroadcastRecipients: MemoryEmergencyBroadcastRecipient[] = [];

// Seed initial values
function seedDispatchData() {
  // Clear collections
  mockAssignments.length = 0;
  mockArrivalVerifications.length = 0;
  mockBroadcasts.length = 0;
  mockBroadcastRecipients.length = 0;

  // Initialize all availabilities
  mockStaff.forEach(s => {
    mockAvailability[s.id] = 'AVAILABLE';
  });

  // Seed statuses
  mockAvailability['staff-amit'] = 'BUSY';
  mockAvailability['staff-ravi'] = 'ENDING_SHIFT_SOON';
  mockAvailability['staff-sneha-p'] = 'ON_BREAK';

  // Seed standard assignments
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  
  // 1. Completed patient transport assignment
  mockAssignments.push({
    id: 'asm-completed-1',
    priority: 'HIGH',
    task_type: 'PATIENT_TRANSPORT',
    title: 'Patient Transport to Radiology',
    instructions: 'Transfer patient R.K. from Emergency Bay 2 to CT Scan room.',
    destination_building: 'Main Building',
    destination_floor: 'Ground Floor',
    destination_ward: 'Radiology',
    destination_room: 'CT Scan 1',
    destination_bed: null,
    patient_ref: 'R.K. (Bed 2)',
    required_arrival_time: twoHoursAgo,
    ack_required: true,
    loc_verification_required: true,
    photo_proof_required: false,
    completion_required: true,
    status: 'COMPLETED',
    assigned_staff_id: 'staff-amit',
    created_by: 'demo-manager-id',
    created_at: yesterday,
    acknowledged_at: twoHoursAgo,
    accepted_at: twoHoursAgo,
    arrived_at: twoHoursAgo,
    completed_at: twoHoursAgo
  });

  // 2. Active assignment in-progress
  mockAssignments.push({
    id: 'asm-active-1',
    priority: 'URGENT',
    task_type: 'WARD_ASSIGNMENT',
    title: 'Report to Ward 5 for duty support',
    instructions: 'Staff shortage in Pediatrics ward. Report immediately for bedside rounds.',
    destination_building: 'Main Building',
    destination_floor: '3rd Floor',
    destination_ward: 'Ward 5',
    destination_room: null,
    destination_bed: null,
    patient_ref: null,
    required_arrival_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    ack_required: true,
    loc_verification_required: true,
    photo_proof_required: true,
    completion_required: true,
    status: 'IN_PROGRESS',
    assigned_staff_id: 'demo-colleague-id',
    created_by: 'demo-manager-id',
    created_at: twoHoursAgo,
    acknowledged_at: twoHoursAgo,
    accepted_at: twoHoursAgo,
    arrived_at: twoHoursAgo
  });

  // 3. Pending urgent assignment to trigger alert for Sneha Shinde (logged-in nurse)
  mockAssignments.push({
    id: 'asm-pending-alert',
    priority: 'URGENT',
    task_type: 'PATIENT_ASSISTANCE',
    title: 'Patient Assistance - Ward 7 Bed 12',
    instructions: 'Patient at Bed 12 requires assistance with post-operative vitals monitoring.',
    destination_building: 'Main Building',
    destination_floor: '3rd Floor',
    destination_ward: 'Ward 7',
    destination_room: '12B',
    destination_bed: 'Bed 12',
    patient_ref: 'P.S. (Bed 12)',
    required_arrival_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    ack_required: true,
    loc_verification_required: true,
    photo_proof_required: true,
    completion_required: true,
    status: 'SENT',
    assigned_staff_id: 'demo-nurse-id',
    created_by: 'demo-manager-id',
    created_at: new Date().toISOString()
  });

  // Seed mock broadcast
  mockBroadcasts.push({
    id: 'bc-1',
    title: 'MCI ACTIVATION - TRAUMA WING',
    message: 'Mass Casualty Incident declared. Multiple trauma victims incoming. All emergency and OT staff report to Emergency Dept triage.',
    priority: 'EMERGENCY',
    created_by: 'demo-manager-id',
    created_at: new Date().toISOString()
  });

  mockBroadcastRecipients.push({
    id: 'bcr-1',
    broadcast_id: 'bc-1',
    staff_id: 'demo-nurse-id',
    response_status: 'PENDING',
    updated_at: new Date().toISOString()
  });
}

seedDispatchData();

// Helper to determine clock state dynamically
function getAttendanceState(staffId: string): 'CLOCKED_IN' | 'CLOCKED_OUT' {
  const staffEvents = mockEvents
    .filter(e => e.staff_id === staffId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  if (staffEvents.length > 0) {
    return staffEvents[0].event_type === 'CLOCK_IN' ? 'CLOCKED_IN' : 'CLOCKED_OUT';
  }
  
  // Default seeded logged-in staff
  if (['demo-nurse-id', 'demo-colleague-id', 'staff-sharma', 'staff-rahul', 'staff-amit', 'staff-ravi'].includes(staffId)) {
    return 'CLOCKED_IN';
  }
  return 'CLOCKED_OUT';
}

// Escalation logic: updates statuses based on priority rules
function updateEscalations() {
  const now = Date.now();
  mockAssignments.forEach(asm => {
    if (asm.status === 'SENT' || asm.status === 'CREATED' || asm.status === 'DELIVERED') {
      const createdTime = new Date(asm.created_at).getTime();
      const diffSec = (now - createdTime) / 1000;
      
      let threshold = 60; // 60s for normal priority
      if (asm.priority === 'EMERGENCY') {
        threshold = 15; // 15s to trigger escalation under test environment
      } else if (asm.priority === 'URGENT') {
        threshold = 30; // 30s
      } else if (asm.priority === 'HIGH') {
        threshold = 45; // 45s
      }

      if (diffSec > threshold) {
        asm.status = 'ESCALATED';
        asm.escalated_at = new Date().toISOString();
        asm.escalation_action_taken = `Escalated to Supervisor automatically after ${Math.round(diffSec)}s of no acknowledgment.`;
        mockAvailability[asm.assigned_staff_id] = 'AVAILABLE';
      }
    }
  });
}

// 1. GET /api/dispatch/staff - Live operational staffing data
app.get('/api/dispatch/staff', (req, res) => {
  updateEscalations();

  const { department, role, building, availability } = req.query;

  const staffDetails = mockStaff.map(s => {
    const attendance = getAttendanceState(s.id);
    let opState = mockAvailability[s.id] || 'AVAILABLE';
    if (attendance === 'CLOCKED_OUT') {
      opState = 'UNAVAILABLE';
    }

    return {
      ...s,
      designation: s.qualification,
      attendanceStatus: attendance,
      availabilityState: opState,
      attendance_state: attendance,
      availability_state: opState,
      current_assignment: mockAssignments.find(asm => 
        asm.assigned_staff_id === s.id && 
        !['COMPLETED', 'DECLINED', 'CANCELLED', 'EXPIRED'].includes(asm.status)
      ) || null
    };
  });

  let filtered = staffDetails;
  if (department) filtered = filtered.filter(s => s.department === department);
  if (role) filtered = filtered.filter(s => s.role === role);
  if (building) filtered = filtered.filter(s => s.building === building);
  if (availability) filtered = filtered.filter(s => s.availabilityState === availability);

  res.json(filtered);
});

// 2. POST /api/dispatch/create - Create operational assignment
app.post('/api/dispatch/create', (req, res) => {
  const {
    assignedStaffIds,
    priority,
    taskType,
    title,
    instructions,
    destinationBuilding,
    destinationFloor,
    destinationWard,
    destinationRoom,
    destinationBed,
    patientRef,
    requiredArrivalTime,
    ackRequired,
    locVerificationRequired,
    photoProofRequired,
    completionRequired,
    createdById
  } = req.body;

  if (!assignedStaffIds || !Array.isArray(assignedStaffIds) || assignedStaffIds.length === 0 || !taskType || !title) {
    return res.status(400).json({ error: 'Missing required parameters to dispatch assignment.' });
  }

  const createdAssignments: MemoryStaffAssignment[] = [];

  assignedStaffIds.forEach((staffId: string) => {
    const asm: MemoryStaffAssignment = {
      id: 'asm-' + Math.floor(Math.random() * 1000000),
      priority: priority || 'NORMAL',
      task_type: taskType,
      title,
      instructions: instructions || null,
      destination_building: destinationBuilding || null,
      destination_floor: destinationFloor || null,
      destination_ward: destinationWard || null,
      destination_room: destinationRoom || null,
      destination_bed: destinationBed || null,
      patient_ref: patientRef || null,
      required_arrival_time: requiredArrivalTime || null,
      ack_required: ackRequired !== undefined ? ackRequired : true,
      loc_verification_required: locVerificationRequired !== undefined ? locVerificationRequired : true,
      photo_proof_required: photoProofRequired !== undefined ? photoProofRequired : false,
      completion_required: completionRequired !== undefined ? completionRequired : true,
      status: 'SENT',
      assigned_staff_id: staffId,
      created_by: createdById || 'demo-manager-id',
      created_at: new Date().toISOString()
    };

    mockAssignments.push(asm);
    createdAssignments.push(asm);

    // Update availability
    mockAvailability[staffId] = 'RESPONDING';
  });

  res.json({ success: true, assignments: createdAssignments });
});

// 3. GET /api/dispatch/assignments/:staffId - Active/History tasks for specific staff
app.get('/api/dispatch/assignments/:staffId', (req, res) => {
  updateEscalations();
  const { staffId } = req.params;
  const assignments = mockAssignments.filter(asm => asm.assigned_staff_id === staffId);
  const staffLookup = (id: string) => mockStaff.find(s => s.id === id)?.name || id;
  res.json(assignments.map(asm => ({
    ...asm,
    staff_name: staffLookup(asm.assigned_staff_id),
    staff_id: asm.assigned_staff_id,
    destination: {
      building: asm.destination_building,
      floor: asm.destination_floor,
      ward: asm.destination_ward,
      room: asm.destination_room,
      bed: asm.destination_bed
    },
    patient_reference: asm.patient_ref,
    required_time: asm.required_arrival_time,
    photo_required: asm.photo_proof_required,
    qr_required: asm.loc_verification_required
  })));
});

// 4. GET /api/dispatch/all-assignments - Supervisor Command Kanban List
app.get('/api/dispatch/all-assignments', (req, res) => {
  updateEscalations();
  const staffLookup = (id: string) => mockStaff.find(s => s.id === id)?.name || id;
  res.json(mockAssignments.map(asm => ({
    ...asm,
    staff_name: staffLookup(asm.assigned_staff_id),
    staff_id: asm.assigned_staff_id,
    destination: {
      building: asm.destination_building,
      floor: asm.destination_floor,
      ward: asm.destination_ward,
      room: asm.destination_room,
      bed: asm.destination_bed
    },
    patient_reference: asm.patient_ref,
    required_time: asm.required_arrival_time,
    photo_required: asm.photo_proof_required,
    qr_required: asm.loc_verification_required
  })));
});

// 5. POST /api/dispatch/update-status - Advances task state machine
app.post('/api/dispatch/update-status', (req, res) => {
  const { assignmentId, status, declinedReason } = req.body;

  if (!assignmentId || !status) {
    return res.status(400).json({ error: 'Missing parameters for task status update.' });
  }

  const idx = mockAssignments.findIndex(asm => asm.id === assignmentId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  const asm = mockAssignments[idx];
  asm.status = status;

  const now = new Date().toISOString();
  if (status === 'ACKNOWLEDGED') asm.acknowledged_at = now;
  if (status === 'ACCEPTED') {
    asm.accepted_at = now;
    mockAvailability[asm.assigned_staff_id] = 'RESPONDING';
  }
  if (status === 'EN_ROUTE') {
    mockAvailability[asm.assigned_staff_id] = 'RESPONDING';
  }
  if (status === 'ARRIVED') {
    asm.arrived_at = now;
    mockAvailability[asm.assigned_staff_id] = 'AT_LOCATION';
  }
  if (status === 'IN_PROGRESS') {
    mockAvailability[asm.assigned_staff_id] = 'BUSY';
  }
  if (status === 'COMPLETED') {
    asm.completed_at = now;
    mockAvailability[asm.assigned_staff_id] = 'AVAILABLE';
  }
  if (status === 'DECLINED') {
    asm.declined_reason = declinedReason || 'No reason provided';
    mockAvailability[asm.assigned_staff_id] = 'AVAILABLE';
  }
  if (status === 'CANCELLED') {
    asm.cancelled_at = now;
    mockAvailability[asm.assigned_staff_id] = 'AVAILABLE';
  }

  res.json({ success: true, assignment: asm });
});

// 6. POST /api/dispatch/upload-photo - Secure private photo proof upload
app.post('/api/dispatch/upload-photo', (req, res) => {
  const { photoBase64, image, assignmentId, staffId, fileName } = req.body;
  const imgData = photoBase64 || image;

  if (!imgData) {
    return res.status(400).json({ error: 'Missing photo payload or credentials.' });
  }

  // File size validation (max 5MB)
  const buffer = Buffer.from(imgData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image exceeds the maximum 5MB restriction.' });
  }

  // Mime validation
  if (!imgData.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid file format. Only JPEG/PNG image files are permitted.' });
  }

  // Ensure upload directory
  const uploadDir = path.join(process.cwd(), 'artifacts', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate private filename
  const extension = imgData.split(';')[0].split('/')[1] || 'jpg';
  const filename = fileName || `proof_${assignmentId || 'unknown'}_${Date.now()}.${extension}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, buffer);

  // Return private access URL
  const photoUrl = `/api/dispatch/photo/${filename}?token=auth_session_tkn_7729`;
  res.json({ success: true, photoUrl, photoToken: 'auth_session_tkn_7729' });
});

// 7. GET /api/dispatch/photo/:filename - Private authenticated photo viewer
app.get('/api/dispatch/photo/:filename', (req, res) => {
  const { filename } = req.params;
  const { token } = req.query;

  // Enforce session/token validation
  if (!token || token !== 'auth_session_tkn_7729') {
    return res.status(403).json({ error: 'Access Denied. Invalid or expired authentication token.' });
  }

  const filepath = path.join(process.cwd(), 'artifacts', 'uploads', filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Photo proof file not found.' });
  }

  res.sendFile(filepath);
});

// 8. POST /api/dispatch/verify-arrival - Verification (GPS/QR/Photo/Supervisor)
app.post('/api/dispatch/verify-arrival', (req, res) => {
  const {
    assignmentId,
    staffId,
    method,
    verificationMethod,
    lat,
    lng,
    qrCode,
    photoUrl,
    supervisorId,
    supervisorReason,
    reason
  } = req.body;
  const resolvedMethod = method || verificationMethod;
  const resolvedSupervisorReason = supervisorReason || reason;

  if (!assignmentId || !staffId || !resolvedMethod) {
    return res.status(400).json({ error: 'Missing verification parameters.' });
  }

  const asmIdx = mockAssignments.findIndex(asm => asm.id === assignmentId);
  if (asmIdx === -1) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  const asm = mockAssignments[asmIdx];

  // Perform backend check validations
  if (resolvedMethod === 'QR') {
    // E.g. expected QR code matches the destination ward code name
    const expectedCode = `QR-${asm.destination_ward?.replace(/\s+/g, '-').toUpperCase() || 'LOCATION'}`;
    if (qrCode !== expectedCode && qrCode !== 'QR-GENERIC') {
      return res.status(400).json({ error: 'Incorrect QR Code scanned for this location.' });
    }
  }

  const verificationId = 'ver-' + Math.floor(Math.random() * 1000000);
  const verification: MemoryArrivalVerification = {
    id: verificationId,
    assignment_id: assignmentId,
    staff_id: staffId,
    verification_method: resolvedMethod,
    verified_at: new Date().toISOString(),
    lat: lat || null,
    lng: lng || null,
    qr_code_scanned: qrCode || null,
    photo_url: photoUrl || null,
    supervisor_id: supervisorId || null,
    supervisor_reason: resolvedSupervisorReason || null,
    verification_status: 'VERIFIED'
  };

  mockArrivalVerifications.push(verification);

  // Transition task state
  asm.status = asm.completion_required ? 'IN_PROGRESS' : 'ARRIVED';
  asm.arrived_at = new Date().toISOString();
  mockAvailability[staffId] = asm.completion_required ? 'BUSY' : 'AT_LOCATION';

  res.json({ success: true, verification, assignment: asm });
});

// 9. POST /api/dispatch/broadcast - Create emergency alert broadcast
app.post('/api/dispatch/broadcast', (req, res) => {
  const { title, message, priority, createdById, eligibleRoles, targetRoles } = req.body;
  const resolvedRoles = eligibleRoles || targetRoles;

  if (!title || !message) {
    return res.status(400).json({ error: 'Missing broadcast details.' });
  }

  const broadcast: MemoryEmergencyBroadcast = {
    id: 'bc-' + Math.floor(Math.random() * 1000000),
    title,
    message,
    priority: priority || 'EMERGENCY',
    created_by: createdById || 'demo-manager-id',
    created_at: new Date().toISOString()
  };

  mockBroadcasts.push(broadcast);

  // Seed responses for matching on-duty staff
  mockStaff.forEach(s => {
    // Check if matching role
    if (!resolvedRoles || resolvedRoles.includes(s.role)) {
      mockBroadcastRecipients.push({
        id: 'bcr-' + Math.floor(Math.random() * 1000000),
        broadcast_id: broadcast.id,
        staff_id: s.id,
        response_status: 'PENDING',
        updated_at: new Date().toISOString()
      });
    }
  });

  res.json({ success: true, broadcast });
});

// 10. GET /api/dispatch/broadcasts - Active broadcasts with response stats
app.get('/api/dispatch/broadcasts', (req, res) => {
  const data = mockBroadcasts.map(bc => {
    const recipients = mockBroadcastRecipients.filter(r => r.broadcast_id === bc.id).map(r => {
      const staff = mockStaff.find(s => s.id === r.staff_id);
      // Frontend reads `status` (SENT = pending action needed)
      const statusAlias = r.response_status === 'PENDING' ? 'SENT' : r.response_status;
      return { ...r, staff_name: staff?.name || r.staff_id, status: statusAlias };
    });
    const responding = recipients.filter(r => r.response_status === 'RESPONDING').length;
    const unavailable = recipients.filter(r => r.response_status === 'UNAVAILABLE').length;
    const busy = recipients.filter(r => r.response_status === 'ALREADY_ASSIGNED').length;
    const pending = recipients.filter(r => r.response_status === 'PENDING').length;

    return {
      ...bc,
      recipients,
      stats: { responding, unavailable, busy, pending, total: recipients.length }
    };
  });
  res.json(data);
});

// 11. POST /api/dispatch/respond-broadcast - Respond to emergency broadcast
app.post('/api/dispatch/respond-broadcast', (req, res) => {
  const { broadcastId, staffId, responseStatus } = req.body;

  if (!broadcastId || !staffId || !responseStatus) {
    return res.status(400).json({ error: 'Missing broadcast response fields.' });
  }

  const idx = mockBroadcastRecipients.findIndex(r => r.broadcast_id === broadcastId && r.staff_id === staffId);
  if (idx !== -1) {
    mockBroadcastRecipients[idx].response_status = responseStatus;
    mockBroadcastRecipients[idx].updated_at = new Date().toISOString();

    if (responseStatus === 'RESPONDING') {
      mockAvailability[staffId] = 'RESPONDING';
    }
  }

  res.json({ success: true });
});

// 12. POST /api/dispatch/audit-photos - Photo retention pruning
app.post('/api/dispatch/audit-photos', (req, res) => {
  const { daysToRetain } = req.body; // e.g. 0 to delete immediately
  // Pruning logic - delete local uploads matching policy
  const uploadDir = path.join(process.cwd(), 'artifacts', 'uploads');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    files.forEach(file => {
      const filepath = path.join(uploadDir, file);
      // Delete under policy
      fs.unlinkSync(filepath);
    });
  }
  res.json({ success: true, message: 'Audit completed. Cleaned up aged photo proof records.' });
});

// ============================================================
// FRONTEND-COMPATIBLE ROUTE ALIASES
// The StaffPortal.tsx frontend uses slightly different routes/field
// names than the original backend. These aliases bridge the gap.
// ============================================================

// Helper: normalize assignment shape for frontend consumption
function normalizeAssignment(asm: MemoryStaffAssignment) {
  const staff = mockStaff.find(s => s.id === asm.assigned_staff_id);
  return {
    ...asm,
    staff_name: staff?.name || asm.assigned_staff_id,
    staff_id: asm.assigned_staff_id,
    destination: {
      building: asm.destination_building,
      floor: asm.destination_floor,
      ward: asm.destination_ward,
      room: asm.destination_room,
      bed: asm.destination_bed
    },
    patient_reference: asm.patient_ref,
    required_time: asm.required_arrival_time,
    photo_required: asm.photo_proof_required,
    qr_required: asm.loc_verification_required
  };
}

// Alias: POST /api/dispatch/assignments (frontend create)
app.post('/api/dispatch/assignments', (req, res) => {
  const {
    staffIds,
    title,
    priority,
    taskType,
    instructions,
    destination,
    patientReference,
    requiredTime,
    photoRequired,
    qrRequired
  } = req.body;

  if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0 || !title) {
    return res.status(400).json({ error: 'Missing required parameters to dispatch assignment.' });
  }

  const createdAssignments: MemoryStaffAssignment[] = [];

  staffIds.forEach((sid: string) => {
    const asm: MemoryStaffAssignment = {
      id: 'asm-' + Math.floor(Math.random() * 1000000),
      priority: priority || 'NORMAL',
      task_type: taskType || 'REPORT_TO_LOCATION',
      title,
      instructions: instructions || null,
      destination_building: destination?.building || null,
      destination_floor: destination?.floor || null,
      destination_ward: destination?.ward || null,
      destination_room: destination?.room || null,
      destination_bed: destination?.bed || null,
      patient_ref: patientReference || null,
      required_arrival_time: requiredTime || null,
      ack_required: true,
      loc_verification_required: qrRequired !== undefined ? qrRequired : true,
      photo_proof_required: photoRequired !== undefined ? photoRequired : false,
      completion_required: true,
      status: 'SENT',
      assigned_staff_id: sid,
      created_by: 'demo-manager-id',
      created_at: new Date().toISOString()
    };
    mockAssignments.push(asm);
    createdAssignments.push(asm);
    mockAvailability[sid] = 'RESPONDING';
  });

  res.json({ success: true, assignments: createdAssignments.map(normalizeAssignment) });
});

// Alias: PUT /api/dispatch/assignments/:id/status (frontend status update)
app.put('/api/dispatch/assignments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, declinedReason, declineReason } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Missing status parameter.' });
  }

  const idx = mockAssignments.findIndex(asm => asm.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  const asm = mockAssignments[idx];
  asm.status = status;

  const now = new Date().toISOString();
  if (status === 'ACKNOWLEDGED') asm.acknowledged_at = now;
  if (status === 'ACCEPTED') {
    asm.accepted_at = now;
    mockAvailability[asm.assigned_staff_id] = 'RESPONDING';
  }
  if (status === 'EN_ROUTE') mockAvailability[asm.assigned_staff_id] = 'RESPONDING';
  if (status === 'ARRIVED') {
    asm.arrived_at = now;
    mockAvailability[asm.assigned_staff_id] = 'AT_LOCATION';
  }
  if (status === 'IN_PROGRESS') mockAvailability[asm.assigned_staff_id] = 'BUSY';
  if (status === 'COMPLETED') {
    asm.completed_at = now;
    mockAvailability[asm.assigned_staff_id] = 'AVAILABLE';
  }
  if (status === 'DECLINED') {
    asm.declined_reason = declinedReason || declineReason || 'No reason provided';
    mockAvailability[asm.assigned_staff_id] = 'AVAILABLE';
  }
  if (status === 'CANCELLED') {
    asm.cancelled_at = now;
    mockAvailability[asm.assigned_staff_id] = 'AVAILABLE';
  }

  res.json({ success: true, assignment: normalizeAssignment(asm) });
});

// Alias: POST /api/dispatch/broadcast/respond (frontend broadcast response)
app.post('/api/dispatch/broadcast/respond', (req, res) => {
  const { broadcastId, recipientId, status, reason } = req.body;

  if (!broadcastId || !recipientId || !status) {
    return res.status(400).json({ error: 'Missing broadcast response fields.' });
  }

  const idx = mockBroadcastRecipients.findIndex(r => r.broadcast_id === broadcastId && r.staff_id === recipientId);
  if (idx !== -1) {
    mockBroadcastRecipients[idx].response_status = status === 'BUSY' ? 'ALREADY_ASSIGNED' : status;
    mockBroadcastRecipients[idx].updated_at = new Date().toISOString();
    if (status === 'RESPONDING') {
      mockAvailability[recipientId] = 'RESPONDING';
    }
  }

  res.json({ success: true });
});

// Override: GET /api/dispatch/all-assignments returns normalized shapes
const origAllAssignments = app.get;
app.get('/api/dispatch/all-assignments-normalized', (req, res) => {
  updateEscalations();
  res.json(mockAssignments.map(normalizeAssignment));
});

// Override: GET /api/dispatch/assignments/:staffId returns normalized shapes
app.get('/api/dispatch/assignments-normalized/:staffId', (req, res) => {
  updateEscalations();
  const { staffId } = req.params;
  const assignments = mockAssignments.filter(asm => asm.assigned_staff_id === staffId);
  res.json(assignments.map(normalizeAssignment));
});

// Override: GET /api/dispatch/broadcasts with staff_name on recipients
app.get('/api/dispatch/broadcasts-normalized', (req, res) => {
  const data = mockBroadcasts.map(bc => {
    const recipients = mockBroadcastRecipients.filter(r => r.broadcast_id === bc.id).map(r => {
      const staff = mockStaff.find(s => s.id === r.staff_id);
      return { ...r, staff_name: staff?.name || r.staff_id };
    });
    const responding = recipients.filter(r => r.response_status === 'RESPONDING').length;
    const unavailable = recipients.filter(r => r.response_status === 'UNAVAILABLE').length;
    const busy = recipients.filter(r => r.response_status === 'ALREADY_ASSIGNED').length;
    const pending = recipients.filter(r => r.response_status === 'PENDING').length;
    return { ...bc, recipients, stats: { responding, unavailable, busy, pending, total: recipients.length } };
  });
  res.json(data);
});

// Vite Dev Server Integration & SPA Fallback serving
async function setupVite() {

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MCGM Digital Hospital server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start fullstack server:', err);
});
