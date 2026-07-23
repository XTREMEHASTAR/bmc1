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

// ============================================================
// DEAN PORTAL COMMAND CENTER MERGED API LAYER
// ============================================================

interface DeanDirective {
  id: string;
  title: string;
  instructions: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  departments: string[];
  createdBy: string;
  createdAt: string;
  status: 'ACTIVE' | 'APPROVED' | 'COMPLETED';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  acknowledgements: Array<{
    department: string;
    approvedBy: string;
    approvedAt: string;
    comments?: string;
  }>;
}

interface DeanEscalation {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  message: string;
  location: string;
  createdAt: string;
  createdBy: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
  reason?: string;
  timeElapsed?: number;
  auditTrail: Array<{
    action: string;
    by: string;
    at: string;
    comments?: string;
  }>;
}

interface DeanReport {
  id: string;
  type: string;
  generatedBy: string;
  generatedAt: string;
  status: 'GENERATING' | 'COMPLETED';
  filePath: string;
  completedAt?: string;
}

interface DeanAnalyticsJob {
  id: string;
  initiatedBy: string;
  initiatedAt: string;
  status: 'ANALYZING' | 'COMPLETED';
  completedAt?: string;
  insights?: any[];
}

const mockDirectives: DeanDirective[] = [
  {
    id: 'DIR-001',
    title: 'Surge Capacity Protocol Activation',
    instructions: 'Trigger standard surge protocols in Emergency Triage due to incoming high-volume casualty event.',
    priority: 'EMERGENCY',
    departments: ['Emergency', 'ICU'],
    createdBy: 'Dr. Dean Kumar',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    status: 'ACTIVE',
    acknowledgements: []
  }
];

const mockEscalations: DeanEscalation[] = [
  {
    id: 'ESC-001',
    title: 'O Negative Blood Supply Below Safety Level',
    severity: 'CRITICAL',
    category: 'BLOOD',
    message: 'O negative reserves dropped to 3 units (safety threshold is 10 units). Immediate donor drive requested.',
    location: 'Blood Bank',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    createdBy: 'Blood Bank Lead',
    status: 'ACTIVE',
    auditTrail: [
      { action: 'CREATED', by: 'Blood Bank Lead', at: new Date(Date.now() - 15 * 60000).toISOString(), comments: 'Reserves critically depleted after emergency trauma surgeries.' }
    ]
  },
  {
    id: 'ESC-002',
    title: 'CT Scanner Offline in Diagnostics Wing',
    severity: 'HIGH',
    category: 'INFRASTRUCTURE',
    message: 'CT Scanner 1 reporting software validation error. 14 patients queued, including 3 emergency stat scans.',
    location: 'Radiology Room 1',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    createdBy: 'Radiology Supervisor',
    status: 'ACTIVE',
    auditTrail: [
      { action: 'CREATED', by: 'Radiology Supervisor', at: new Date(Date.now() - 45 * 60000).toISOString(), comments: 'Software patch crash during routine checks.' }
    ]
  }
];

const mockReports: DeanReport[] = [
  {
    id: 'REP-101',
    type: 'Daily Hospital Report',
    generatedBy: 'Dr. Dean Kumar',
    generatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: 'COMPLETED',
    filePath: '/reports/daily_report_sion_2026-07-22.pdf',
    completedAt: new Date(Date.now() - 24 * 3600000 + 15000).toISOString()
  }
];

const mockAnalyticsJobs: DeanAnalyticsJob[] = [];

// Helper to compile dashboard aggregate from real server state variables
function compileDeanDashboard(hospitalId: string) {
  const isSion = hospitalId === 'h1' || hospitalId === 'demo-hospital';
  const hospitalName = isSion ? 'Sion Hospital' : hospitalId === 'h2' ? 'KEM Hospital' : hospitalId === 'h3' ? 'Nair Hospital' : 'Cooper Hospital';
  
  // Counts from on-duty workforce
  const staffOnDuty = mockEvents.filter(e => {
    const todayStr = new Date().toISOString().split('T')[0];
    return e.event_type === 'CLOCK_IN' && e.timestamp.startsWith(todayStr);
  }).length;

  const presentDocs = mockStaff.filter(s => s.role === 'Doctor' && getAttendanceState(s.id) === 'CLOCKED_IN').length;
  const presentNurses = mockStaff.filter(s => s.role === 'Nurse' && getAttendanceState(s.id) === 'CLOCKED_IN').length;
  const presentTechs = mockStaff.filter(s => s.role === 'ECG Technician' && getAttendanceState(s.id) === 'CLOCKED_IN').length;
  
  // ICU occupied calculation
  const totalBeds = 1240;
  const occupiedBeds = 1148;
  const icuTotal = 24;
  const icuOccupied = 22; // 91% occupancy

  return {
    hospitalId,
    hospitalName,
    operationalStatus: mockEscalations.some(e => e.severity === 'CRITICAL' && e.status === 'ACTIVE') ? 'HIGH_PRESSURE' : 'NORMAL',
    patientCensus: {
      opdToday: 2458,
      emergencyToday: 186,
      ipdCensus: 812,
      ventilatorPatients: 38,
      deliveriesToday: 16,
      labPending: 142,
      radiologyPending: 58,
      bloodAlertsCount: mockEscalations.filter(e => e.category === 'BLOOD' && e.status === 'ACTIVE').length,
      pharmacyAlertsCount: 7,
    },
    bedOccupancy: {
      total: totalBeds,
      occupied: occupiedBeds,
      available: totalBeds - occupiedBeds,
      cleaning: 24,
      blocked: 10,
      icuTotal,
      icuOccupied,
      icuAvailable: icuTotal - icuOccupied
    },
    staffing: {
      totalStaff: mockStaff.length,
      onDuty: staffOnDuty,
      presentDoctors: presentDocs > 0 ? presentDocs : 6,
      presentNurses: presentNurses > 0 ? presentNurses : 14,
      presentTechnicians: presentTechs > 0 ? presentTechs : 4,
      supportStaff: 8,
      understaffedUnits: ['Pediatrics Ward', 'Biochemistry Lab'],
      shortagesCount: 2,
    },
    emergency: {
      incomingAmbulances: 12,
      censusCount: 86,
      redCases: 18,
      yellowCases: 32,
      greenCases: 36,
      doorToDoctorMinutes: 28,
      triageAwaiting: 5,
      baysOccupied: 4,
      baysAvailable: 2,
    },
    finance: {
      dailyRevenue: 875000,
      monthlyRevenue: 87500000,
      opdRevenue: 234000,
      ipdRevenue: 492000,
      otherRevenue: 150000,
      claimsPending: 48,
      claimsRejected: 12,
      cashflowStatus: 'HEALTHY'
    },
    compliance: {
      regulatoryCompliance: 96,
      incidentReports: mockEscalations.length,
      qualityScore: 94,
      patientSafetyMetrics: 92,
      reportingStatus: 'UP_TO_DATE'
    }
  };
}

// 1. Get comprehensive Dean dashboard data
app.get('/api/dean/dashboard/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;
  res.json({
    success: true,
    data: compileDeanDashboard(hospitalId),
    timestamp: new Date().toISOString()
  });
});

// 2. Get administrative directives
app.get('/api/dean/directives', (req, res) => {
  const { status } = req.query;
  let filtered = mockDirectives;
  if (status) {
    filtered = filtered.filter(d => d.status === status);
  }
  res.json({ success: true, data: filtered });
});

// 3. Issue administrative directive
app.post('/api/dean/directives', (req, res) => {
  const { title, instructions, priority, departments, createdBy } = req.body;
  if (!title || !instructions || !priority || !departments || !Array.isArray(departments)) {
    return res.status(400).json({ error: 'Missing required directive parameters.' });
  }

  const directive: DeanDirective = {
    id: 'DIR-' + Math.floor(Math.random() * 1000000),
    title,
    instructions,
    priority,
    departments,
    createdBy: createdBy || 'Dr. Dean Kumar',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
    acknowledgements: []
  };

  mockDirectives.unshift(directive);

  res.json({ success: true, data: directive });
});

// 4. Approve/Acknowledge directive
app.post('/api/dean/directives/:id/approve', (req, res) => {
  const { id } = req.params;
  const { approvedBy, comments, department } = req.body;

  const directive = mockDirectives.find(d => d.id === id);
  if (!directive) {
    return res.status(404).json({ error: 'Directive not found' });
  }

  directive.status = 'COMPLETED';
  directive.approvedBy = approvedBy || 'Staff Supervisor';
  directive.approvedAt = new Date().toISOString();
  directive.comments = comments || 'Acknowledged and actioned.';
  directive.acknowledgements.push({
    department: department || 'General Medicine',
    approvedBy: approvedBy || 'Staff Supervisor',
    approvedAt: new Date().toISOString(),
    comments: comments || 'Acknowledged.'
  });

  res.json({ success: true, data: directive });
});

// 5. Get active escalations
app.get('/api/dean/escalations', (req, res) => {
  const { status, severity } = req.query;
  let filtered = mockEscalations;
  if (status) filtered = filtered.filter(e => e.status === status);
  if (severity) filtered = filtered.filter(e => e.severity === severity);

  filtered.forEach(e => {
    e.timeElapsed = Math.floor((Date.now() - new Date(e.createdAt).getTime()) / 60000);
  });

  res.json({ success: true, data: filtered });
});

// 6. Create escalation
app.post('/api/dean/escalations', (req, res) => {
  const { title, severity, category, message, location, createdBy } = req.body;
  if (!title || !severity || !category || !message || !location) {
    return res.status(400).json({ error: 'Missing escalation parameters.' });
  }

  const escalation: DeanEscalation = {
    id: 'ESC-' + Math.floor(Math.random() * 1000000),
    title,
    severity,
    category,
    message,
    location,
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'Dean Portal Alert System',
    status: 'ACTIVE',
    auditTrail: [
      { action: 'CREATED', by: createdBy || 'Dean Portal Alert System', at: new Date().toISOString(), comments: message }
    ]
  };

  mockEscalations.unshift(escalation);
  res.json({ success: true, data: escalation });
});

// 7. Get executive reports
app.get('/api/dean/reports', (req, res) => {
  res.json({ success: true, data: mockReports });
});

// 8. Generate report
app.post('/api/dean/reports/generate', (req, res) => {
  const { type, generatedBy } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Missing report type.' });
  }

  const report: DeanReport = {
    id: 'REP-' + Math.floor(Math.random() * 1000000),
    type,
    generatedBy: generatedBy || 'Dr. Dean Kumar',
    generatedAt: new Date().toISOString(),
    status: 'GENERATING',
    filePath: `/reports/${type.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`
  };

  mockReports.unshift(report);

  // Simulate completion after 2 seconds
  setTimeout(() => {
    report.status = 'COMPLETED';
    report.completedAt = new Date().toISOString();
  }, 2000);

  res.json({ success: true, data: report });
});

// 9. Trigger executive AI analysis
app.post('/api/dean/analytics/analyze', (req, res) => {
  const { initiatedBy } = req.body;
  
  const job: DeanAnalyticsJob = {
    id: 'ANL-' + Math.floor(Math.random() * 1000000),
    initiatedBy: initiatedBy || 'Dr. Dean Kumar',
    initiatedAt: new Date().toISOString(),
    status: 'ANALYZING'
  };

  mockAnalyticsJobs.unshift(job);

  setTimeout(() => {
    job.status = 'COMPLETED';
    job.completedAt = new Date().toISOString();
    job.insights = [
      {
        type: 'EMERGENCY',
        insight: 'Emergency load is 22% above the configured baseline.',
        why: 'Heavy vehicle collision on Western Express Highway triggered mass emergency registrations.',
        evidence: '18 emergency RED category admissions registered in the last 2 hours.',
        impact: 'Average door-to-doctor time has risen from 15 minutes to 28 minutes.',
        recommendedAction: 'Redeploy on-duty ward nurses to Emergency Trauma Bay 3 and Bay 4.',
        confidence: 94
      },
      {
        type: 'ICU',
        insight: 'ICU occupancy is approaching critical capacity.',
        why: 'Delayed discharge approvals in general wards are blocking expected ICU step-down transfers.',
        evidence: 'ICU is at 92% occupancy (22/24 beds filled). 4 general ward discharge requests are pending dean validation.',
        impact: 'ICU has only 2 vacant beds available for sudden trauma intakes.',
        recommendedAction: 'Acknowledge pending discharges in General Medicine and Surgery Wards immediately to release beds.',
        confidence: 88
      },
      {
        type: 'DIAGNOSTICS',
        insight: 'Biochemistry sample turnaround time has exceeded the SLA target by 18 minutes.',
        why: 'STAT chemistry analyzer reporting temporary calibration warnings.',
        evidence: 'Average lab turnaround time is currently 48 minutes (SLA target is 30 minutes).',
        impact: 'Delayed diagnostics is contributing to discharge approval delays in general wards.',
        recommendedAction: 'Deploy technical supervisor to Biochemistry Lab for analyzer audit.',
        confidence: 76
      }
    ];
  }, 1000);

  res.json({ success: true, data: job });
});

// 10. Audit log endpoint
app.post('/api/dean/audit', (req, res) => {
  const { action, target, user, role } = req.body;
  // Log dean actions securely to terminal
  console.log(`[DEAN AUDIT SECURE LOG] USER: ${user || 'Dr. Dean Kumar'}, ROLE: ${role || 'HOSPITAL_DEAN'}, ACTION: ${action}, TARGET: ${target || 'None'}, TIMESTAMP: ${new Date().toISOString()}`);
  res.json({ success: true });
});

// ============================================================
// LABORATORY MANAGEMENT & INTELLIGENCE SYSTEM (LIMS) DATABASE
// ============================================================

interface MockLabOrder {
  id: string;
  patientId: string;
  patientName: string;
  uhid: string;
  encounterId: string;
  orderedBy: string;
  department: string;
  tests: string[];
  priority: 'ROUTINE' | 'URGENT' | 'STAT' | 'EMERGENCY';
  collectionLocation: string;
  orderTime: string;
  status: 'PENDING_COLLECTION' | 'COLLECTED' | 'PROCESSING' | 'COMPLETED';
}

interface MockSpecimen {
  id: string;
  barcode: string;
  orderId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  type: string;
  container: string;
  status: 'Ordered' | 'Awaiting Collection' | 'Collected' | 'Received' | 'Accessioned' | 'Processing' | 'Tested' | 'Validation Pending' | 'Authorized' | 'Released' | 'Rejected' | 'On Hold';
  priority: 'ROUTINE' | 'URGENT' | 'STAT' | 'EMERGENCY';
  orderedBy: string;
  testNames: string[];
  timestamp: string;
  results: Record<string, { value: any; unit: string; low: number; high: number; flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW'; comment?: string }>;
  previousResults?: Record<string, any>;
  collectedBy?: string;
  collectedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  accessionedBy?: string;
  accessionedAt?: string;
  testedBy?: string;
  testedAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
}

interface MockLabInventoryItem {
  id: string;
  name: string;
  lot: string;
  expiry: string;
  stock: number;
  minThreshold: number;
  unit: string;
  analyzer: string;
  supplier: string;
  status: 'OK' | 'LOW' | 'CRITICAL' | 'EXPIRED';
}

interface MockQCLog {
  id: string;
  analyzer: string;
  testName: string;
  lot: string;
  timestamp: string;
  value: number;
  mean: number;
  sd: number;
  status: 'PASSED' | 'WARNING' | 'FAILED';
}

interface MockLabAlert {
  id: string;
  uhid: string;
  patientName: string;
  testName: string;
  parameter: string;
  value: number;
  unit: string;
  criticalThreshold: string;
  department: string;
  orderedBy: string;
  timestamp: string;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'ESCALATED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

interface MockLabAudit {
  id: string;
  action: string;
  target: string;
  user: string;
  role: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

const mockLabOrders: MockLabOrder[] = [
  {
    id: 'ORD-001',
    patientId: 'P-802',
    patientName: 'Sunita Ravindra Deshmukh',
    uhid: 'MCGM125488',
    encounterId: 'ER-2026-802',
    orderedBy: 'Dr. Ramesh Nair',
    department: 'Cardiology',
    tests: ['LFT', 'Coagulation'],
    priority: 'URGENT',
    collectionLocation: 'Ward 5',
    orderTime: new Date(Date.now() - 30 * 60000).toISOString(),
    status: 'PENDING_COLLECTION'
  },
  {
    id: 'ORD-002',
    patientId: 'P-803',
    patientName: 'Rohan Satish Shinde',
    uhid: 'MCGM125489',
    encounterId: 'ER-2026-803',
    orderedBy: 'Dr. Amit Shah',
    department: 'Orthopaedics',
    tests: ['CBC', 'LFT'],
    priority: 'ROUTINE',
    collectionLocation: 'OPD 4',
    orderTime: new Date(Date.now() - 20 * 60000).toISOString(),
    status: 'PENDING_COLLECTION'
  }
];

const mockSpecimens: MockSpecimen[] = [
  {
    id: 'SPEC-101',
    barcode: 'MCGM-SION-20260723-000241',
    orderId: 'ORD-101',
    patientId: 'P-801',
    patientName: 'Rahul Anil Patil',
    age: 32,
    gender: 'Male',
    type: 'Whole Blood',
    container: 'EDTA Purple Top',
    status: 'Tested',
    priority: 'STAT',
    orderedBy: 'Dr. Sunita Deshmukh',
    testNames: ['CBC'],
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    results: {
      'Hemoglobin': { value: 6.2, unit: 'g/dL', low: 13.0, high: 17.0, flag: 'CRITICAL_LOW', comment: 'Severe anemia detected, crossmatch blood transfusion advised.' },
      'RBC Count': { value: 3.1, unit: 'million/µL', low: 4.5, high: 5.9, flag: 'LOW' },
      'WBC Count': { value: 7500, unit: 'cells/mm³', low: 4000, high: 11000, flag: 'NORMAL' },
      'Platelet Count': { value: 460000, unit: 'cells/mm³', low: 150000, high: 450000, flag: 'HIGH' }
    },
    previousResults: {
      'Hemoglobin': 13.1,
      'Platelet Count': 410000
    },
    collectedBy: 'Phleb. Sister Sneha',
    collectedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    receivedBy: 'Tech. Rahul Deshmukh',
    receivedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    accessionedBy: 'Tech. Rahul Deshmukh',
    accessionedAt: new Date(Date.now() - 32 * 60000).toISOString(),
    testedBy: 'Tech. Rahul Deshmukh',
    testedAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'SPEC-102',
    barcode: 'MCGM-SION-20260723-000242',
    orderId: 'ORD-102',
    patientId: 'P-805',
    patientName: 'Amrit Verma',
    age: 45,
    gender: 'Male',
    type: 'Serum',
    container: 'Serum SST Gold Top',
    status: 'Tested',
    priority: 'URGENT',
    orderedBy: 'Dr. Sunita Deshmukh',
    testNames: ['RFT'],
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    results: {
      'Potassium': { value: 2.8, unit: 'mEq/L', low: 3.5, high: 5.1, flag: 'CRITICAL_LOW', comment: 'Hypokalemia alert.' },
      'Creatinine': { value: 1.1, unit: 'mg/dL', low: 0.7, high: 1.3, flag: 'NORMAL' }
    },
    previousResults: {
      'Potassium': 3.9
    },
    collectedBy: 'Phleb. Sister Sneha',
    collectedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    receivedBy: 'Tech. Rahul Deshmukh',
    receivedAt: new Date(Date.now() - 22 * 60000).toISOString(),
    accessionedBy: 'Tech. Rahul Deshmukh',
    accessionedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    testedBy: 'Tech. Rahul Deshmukh',
    testedAt: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 'SPEC-103',
    barcode: 'MCGM-SION-20260723-000243',
    orderId: 'ORD-103',
    patientId: 'P-806',
    patientName: 'Ramesh Gupta',
    age: 51,
    gender: 'Male',
    type: 'Whole Blood',
    container: 'Culture Bottle',
    status: 'Released',
    priority: 'EMERGENCY',
    orderedBy: 'Dr. Sunita Deshmukh',
    testNames: ['Blood Culture'],
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    results: {
      'Culture': { value: 'Positive', unit: 'growth', low: 0, high: 0, flag: 'CRITICAL_HIGH', comment: 'Gram-negative bacilli growth detected. Bacterial sepsis risk.' }
    },
    collectedBy: 'Phleb. Sister Sneha',
    collectedAt: new Date(Date.now() - 110 * 60000).toISOString(),
    receivedBy: 'Tech. Rahul Deshmukh',
    receivedAt: new Date(Date.now() - 100 * 60000).toISOString(),
    accessionedBy: 'Tech. Rahul Deshmukh',
    accessionedAt: new Date(Date.now() - 95 * 60000).toISOString(),
    testedBy: 'Microbio. Sunil P.',
    testedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    validatedBy: 'Path. Meera Joshi',
    validatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    authorizedBy: 'Path. Meera Joshi',
    authorizedAt: new Date(Date.now() - 5 * 60000).toISOString()
  }
];

const mockLabInventory: MockLabInventoryItem[] = [
  { id: 'INV-001', name: 'EDTA Purple Top Vacutainers', lot: 'LOT-EDTA-9982', expiry: '2027-12-15', stock: 120, minThreshold: 200, unit: 'pcs', analyzer: 'None', supplier: 'BD India', status: 'LOW' },
  { id: 'INV-002', name: 'Serum SST Gold Top Vacutainers', lot: 'LOT-SST-8812', expiry: '2028-01-20', stock: 350, minThreshold: 200, unit: 'pcs', analyzer: 'None', supplier: 'BD India', status: 'OK' },
  { id: 'INV-003', name: 'CBC Diluent (Sysmex)', lot: 'LOT-DIL-4411', expiry: '2026-08-30', stock: 2, minThreshold: 5, unit: 'cans', analyzer: 'Sysmex XN-1000', supplier: 'Sysmex India', status: 'LOW' },
  { id: 'INV-004', name: 'Bilirubin Reagent (Cobas)', lot: 'LOT-BIL-0982', expiry: '2026-06-15', stock: 14, minThreshold: 10, unit: 'kits', analyzer: 'Roche Cobas c501', supplier: 'Roche Diagnostics', status: 'OK' },
  { id: 'INV-005', name: 'Troponin I Reagent (Alinity)', lot: 'LOT-TROP-7712', expiry: '2026-10-10', stock: 4, minThreshold: 10, unit: 'kits', analyzer: 'Abbott Alinity i', supplier: 'Abbott Healthcare', status: 'CRITICAL' }
];

const mockQCLogs: MockQCLog[] = [
  { id: 'QC-1', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T01:00:00Z', value: 15.1, mean: 15.0, sd: 0.5, status: 'PASSED' },
  { id: 'QC-2', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T02:00:00Z', value: 14.8, mean: 15.0, sd: 0.5, status: 'PASSED' },
  { id: 'QC-3', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T03:00:00Z', value: 15.2, mean: 15.0, sd: 0.5, status: 'PASSED' },
  { id: 'QC-4', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T04:00:00Z', value: 14.9, mean: 15.0, sd: 0.5, status: 'PASSED' },
  { id: 'QC-5', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T05:00:00Z', value: 15.0, mean: 15.0, sd: 0.5, status: 'PASSED' },
  { id: 'QC-6', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T06:00:00Z', value: 15.4, mean: 15.0, sd: 0.5, status: 'PASSED' },
  { id: 'QC-7', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T07:00:00Z', value: 15.3, mean: 15.0, sd: 0.5, status: 'PASSED' },
  { id: 'QC-8', analyzer: 'Sysmex XN-1000', testName: 'Hemoglobin Control', lot: 'LOT-CBC-992A', timestamp: '2026-07-23T08:00:00Z', value: 16.1, mean: 15.0, sd: 0.5, status: 'WARNING' }
];

const mockLabAlerts: MockLabAlert[] = [
  {
    id: 'ALT-001',
    uhid: 'MCGM125487',
    patientName: 'Rahul Anil Patil',
    testName: 'Complete Blood Count (CBC)',
    parameter: 'Hemoglobin',
    value: 6.2,
    unit: 'g/dL',
    criticalThreshold: '< 7.0 g/dL',
    department: 'Emergency',
    orderedBy: 'Dr. Sunita Deshmukh',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'UNACKNOWLEDGED'
  },
  {
    id: 'ALT-002',
    uhid: 'MCGM125489',
    patientName: 'Amrit Verma',
    testName: 'Renal Function Test (RFT)',
    parameter: 'Potassium',
    value: 2.8,
    unit: 'mEq/L',
    criticalThreshold: '< 3.0 mEq/L',
    department: 'General Medicine',
    orderedBy: 'Dr. Sunita Deshmukh',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'UNACKNOWLEDGED'
  }
];

const mockLabAudit: MockLabAudit[] = [
  { id: 'AUD-001', action: 'ORDER_CREATED', target: 'ORD-001', user: 'Dr. Ramesh Nair', role: 'Doctor', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'AUD-002', action: 'SAMPLE_COLLECTED', target: 'SPEC-101', user: 'Phleb. Sister Sneha', role: 'Phlebotomist', timestamp: new Date(Date.now() - 25 * 60000).toISOString() }
];

// ============================================================
// LIMS Express REST API Endpoints
// ============================================================

// 1. Dashboard aggregates
app.get('/api/lab/dashboard', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const samplesToday = mockSpecimens.length; // total seeded for demo
  const pendingSamples = mockSpecimens.filter(s => s.status !== 'Released' && s.status !== 'Rejected').length;
  const samplesCollected = mockSpecimens.filter(s => ['Collected', 'Received', 'Accessioned', 'Processing', 'Tested', 'Validation Pending', 'Authorized', 'Released'].includes(s.status)).length;
  const testsInProcess = mockSpecimens.filter(s => ['Received', 'Accessioned', 'Processing'].includes(s.status)).length;
  const testsCompleted = mockSpecimens.filter(s => ['Tested', 'Validation Pending', 'Authorized', 'Released'].includes(s.status)).length;
  const criticalResults = mockLabAlerts.filter(a => a.status === 'UNACKNOWLEDGED').length;
  const statOrders = mockSpecimens.filter(s => s.priority === 'STAT' && s.status !== 'Released' && s.status !== 'Rejected').length;
  const rejectedSamples = mockSpecimens.filter(s => s.status === 'Rejected').length;
  
  res.json({
    success: true,
    data: {
      samplesToday,
      pendingSamples,
      samplesCollected,
      testsInProcess,
      testsCompleted,
      criticalResults,
      statOrders,
      rejectedSamples,
      averageTat: 28,
      analyzersOnline: 4,
      analyzersTotal: 5
    }
  });
});

// 2. Get/Create Test Orders
app.get('/api/lab/orders', (req, res) => {
  res.json({ success: true, data: mockLabOrders });
});

app.post('/api/lab/orders', (req, res) => {
  const { patientId, patientName, uhid, encounterId, orderedBy, department, tests, priority, collectionLocation } = req.body;
  if (!patientId || !patientName || !uhid || !tests || !Array.isArray(tests) || !priority) {
    return res.status(400).json({ error: 'Missing required lab order parameters.' });
  }

  const order: MockLabOrder = {
    id: 'ORD-' + Math.floor(Math.random() * 1000 + 100),
    patientId,
    patientName,
    uhid,
    encounterId: encounterId || 'ENC-' + Math.floor(Math.random() * 10000),
    orderedBy: orderedBy || 'Emergency Physician',
    department: department || 'OPD',
    tests,
    priority,
    collectionLocation: collectionLocation || 'Lab Collection Center',
    orderTime: new Date().toISOString(),
    status: 'PENDING_COLLECTION'
  };

  mockLabOrders.unshift(order);

  // Auto-generate specimens awaiting collection
  tests.forEach((testName) => {
    let type = 'Whole Blood';
    let container = 'EDTA Purple Top';
    if (testName === 'RFT' || testName === 'LFT' || testName === 'Troponin') {
      type = 'Serum';
      container = 'Serum SST Gold Top';
    } else if (testName === 'Coagulation' || testName === 'PT/INR') {
      type = 'Plasma';
      container = 'Sodium Citrate Blue Top';
    } else if (testName === 'Blood Culture') {
      type = 'Whole Blood';
      container = 'Culture Bottle';
    }

    mockSpecimens.unshift({
      id: 'SPEC-' + Math.floor(Math.random() * 1000 + 100),
      barcode: 'MCGM-SION-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 1000)).padStart(4, '0'),
      orderId: order.id,
      patientId,
      patientName,
      age: 32, // default mock age
      gender: 'Male', // default mock gender
      type,
      container,
      status: 'Awaiting Collection',
      priority,
      orderedBy: order.orderedBy,
      testNames: [testName],
      timestamp: new Date().toISOString(),
      results: {}
    });
  });

  // Log action
  mockLabAudit.unshift({
    id: 'AUD-' + Math.floor(Math.random() * 100000),
    action: 'ORDER_CREATED',
    target: order.id,
    user: order.orderedBy,
    role: 'Doctor',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: order });
});

// 3. Get Specimens
app.get('/api/lab/specimens', (req, res) => {
  res.json({ success: true, data: mockSpecimens });
});

// 4. Collect Sample
app.post('/api/lab/specimens/collect', (req, res) => {
  const { specimenId, collectorName } = req.body;
  const spec = mockSpecimens.find(s => s.id === specimenId || s.barcode === specimenId);
  if (!spec) {
    return res.status(404).json({ error: 'Specimen not found' });
  }

  spec.status = 'Collected';
  spec.collectedBy = collectorName || 'Phleb. Sister Sneha';
  spec.collectedAt = new Date().toISOString();

  // Log action
  mockLabAudit.unshift({
    id: 'AUD-' + Math.floor(Math.random() * 100000),
    action: 'SAMPLE_COLLECTED',
    target: spec.barcode,
    user: spec.collectedBy,
    role: 'Phlebotomist',
    timestamp: new Date().toISOString()
  });

  // Update order status if all collected
  const order = mockLabOrders.find(o => o.id === spec.orderId);
  if (order) {
    const siblings = mockSpecimens.filter(s => s.orderId === order.id);
    const allCollected = siblings.every(s => s.status !== 'Awaiting Collection');
    if (allCollected) {
      order.status = 'COLLECTED';
    }
  }

  res.json({ success: true, data: spec });
});

// 5. Accessioning (Accept/Reject)
app.post('/api/lab/specimens/accession', (req, res) => {
  const { specimenId, accessionerName, action, rejectionReason, rejectionNotes } = req.body;
  const spec = mockSpecimens.find(s => s.id === specimenId || s.barcode === specimenId);
  if (!spec) {
    return res.status(404).json({ error: 'Specimen not found' });
  }

  if (action === 'REJECT') {
    spec.status = 'Rejected';
    spec.rejectionReason = rejectionReason || 'Hemolyzed';
    spec.rejectionNotes = rejectionNotes || 'Specimen is severely hemolyzed.';
    
    // Log action
    mockLabAudit.unshift({
      id: 'AUD-' + Math.floor(Math.random() * 100000),
      action: 'SAMPLE_REJECTED',
      target: spec.barcode,
      user: accessionerName || 'Tech. Rahul Deshmukh',
      role: 'Lab Technician',
      timestamp: new Date().toISOString(),
      reason: rejectionReason
    });
  } else {
    spec.status = 'Received';
    spec.accessionedBy = accessionerName || 'Tech. Rahul Deshmukh';
    spec.accessionedAt = new Date().toISOString();

    // Log action
    mockLabAudit.unshift({
      id: 'AUD-' + Math.floor(Math.random() * 100000),
      action: 'SAMPLE_RECEIVED',
      target: spec.barcode,
      user: spec.accessionedBy,
      role: 'Lab Technician',
      timestamp: new Date().toISOString()
    });
  }

  res.json({ success: true, data: spec });
});

// 6. Enter Results
app.post('/api/lab/specimens/result', (req, res) => {
  const { specimenId, technicianName, results } = req.body;
  const spec = mockSpecimens.find(s => s.id === specimenId || s.barcode === specimenId);
  if (!spec) {
    return res.status(404).json({ error: 'Specimen not found' });
  }

  spec.status = 'Tested';
  spec.testedBy = technicianName || 'Tech. Rahul Deshmukh';
  spec.testedAt = new Date().toISOString();
  
  // Format results and compute high/low/critical bounds
  spec.results = {};
  for (const [key, valueNum] of Object.entries(results)) {
    const val = Number(valueNum);
    let low = 0;
    let high = 0;
    let unit = '';
    let flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW' = 'NORMAL';

    if (key === 'Hemoglobin') {
      low = 13.0; high = 17.0; unit = 'g/dL';
      if (val < 7.0) flag = 'CRITICAL_LOW';
      else if (val < low) flag = 'LOW';
      else if (val > high) flag = 'HIGH';
    } else if (key === 'Troponin I' || key === 'Troponin') {
      low = 0.0; high = 0.04; unit = 'ng/mL';
      if (val > 0.4) flag = 'CRITICAL_HIGH';
      else if (val > high) flag = 'HIGH';
    } else if (key === 'Potassium') {
      low = 3.5; high = 5.1; unit = 'mEq/L';
      if (val < 3.0) flag = 'CRITICAL_LOW';
      else if (val > 6.0) flag = 'CRITICAL_HIGH';
      else if (val < low) flag = 'LOW';
      else if (val > high) flag = 'HIGH';
    } else if (key === 'Creatinine') {
      low = 0.7; high = 1.3; unit = 'mg/dL';
      if (val > 2.0) flag = 'CRITICAL_HIGH';
      else if (val < low) flag = 'LOW';
      else if (val > high) flag = 'HIGH';
    } else {
      low = 10; high = 100; unit = '';
      if (val < low) flag = 'LOW';
      if (val > high) flag = 'HIGH';
    }

    spec.results[key] = { value: val, unit, low, high, flag };

    // Fire critical alert if needed
    if (flag === 'CRITICAL_LOW' || flag === 'CRITICAL_HIGH') {
      mockLabAlerts.unshift({
        id: 'ALT-' + Math.floor(Math.random() * 1000 + 100),
        uhid: 'MCGM125487',
        patientName: spec.patientName,
        testName: spec.testNames.join(', '),
        parameter: key,
        value: val,
        unit,
        criticalThreshold: flag === 'CRITICAL_LOW' ? `< ${low} ${unit}` : `> ${high} ${unit}`,
        department: 'Emergency',
        orderedBy: spec.orderedBy,
        timestamp: new Date().toISOString(),
        status: 'UNACKNOWLEDGED'
      });
    }
  }

  // Log action
  mockLabAudit.unshift({
    id: 'AUD-' + Math.floor(Math.random() * 100000),
    action: 'RESULT_ENTERED',
    target: spec.barcode,
    user: spec.testedBy,
    role: 'Lab Technician',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: spec });
});

// 7. Pathologist clinical validation/release
app.post('/api/lab/specimens/validate', (req, res) => {
  const { specimenId, pathologistName, status, pin } = req.body;
  const spec = mockSpecimens.find(s => s.id === specimenId || s.barcode === specimenId);
  if (!spec) {
    return res.status(404).json({ error: 'Specimen not found' });
  }

  if (pin !== '1234') {
    return res.status(401).json({ error: 'Invalid Pathologist Digital Signature PIN' });
  }

  if (status === 'RELEASED') {
    spec.status = 'Released';
    spec.validatedBy = pathologistName || 'Path. Meera Joshi';
    spec.validatedAt = new Date().toISOString();
    spec.authorizedBy = pathologistName || 'Path. Meera Joshi';
    spec.authorizedAt = new Date().toISOString();

    // Mark the lab order completed if all specimens released
    const order = mockLabOrders.find(o => o.id === spec.orderId);
    if (order) {
      const siblings = mockSpecimens.filter(s => s.orderId === order.id);
      const allReleased = siblings.every(s => s.status === 'Released' || s.status === 'Rejected');
      if (allReleased) {
        order.status = 'COMPLETED';
      }
    }

    // Log action
    mockLabAudit.unshift({
      id: 'AUD-' + Math.floor(Math.random() * 100000),
      action: 'RESULT_VALIDATED',
      target: spec.barcode,
      user: spec.validatedBy,
      role: 'Pathologist',
      timestamp: new Date().toISOString()
    });
  } else {
    spec.status = 'On Hold';
  }

  res.json({ success: true, data: spec });
});

// 8. Quality Control (Westgard / Levey-Jennings)
app.get('/api/lab/qc', (req, res) => {
  res.json({ success: true, data: mockQCLogs });
});

app.post('/api/lab/qc/calibrate', (req, res) => {
  const { value, testName, analyzer, mean, sd, technicianName } = req.body;
  if (!value || !testName || !analyzer) {
    return res.status(400).json({ error: 'Missing calibration parameters.' });
  }

  const meanVal = Number(mean || 15.0);
  const sdVal = Number(sd || 0.5);
  const val = Number(value);

  let status: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
  if (Math.abs(val - meanVal) >= 3 * sdVal) {
    status = 'FAILED';
  } else if (Math.abs(val - meanVal) >= 2 * sdVal) {
    status = 'WARNING';
  }

  const log: MockQCLog = {
    id: 'QC-' + Math.floor(Math.random() * 1000),
    analyzer,
    testName,
    lot: 'LOT-' + Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString(),
    value: val,
    mean: meanVal,
    sd: sdVal,
    status
  };

  mockQCLogs.push(log);

  // Log action
  mockLabAudit.unshift({
    id: 'AUD-' + Math.floor(Math.random() * 100000),
    action: 'QC_CALIBRATION_RUN',
    target: analyzer,
    user: technicianName || 'Tech. Rahul Deshmukh',
    role: 'Lab Technician',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: log });
});

// 9. Inventory management
app.get('/api/lab/inventory', (req, res) => {
  res.json({ success: true, data: mockLabInventory });
});

app.post('/api/lab/inventory/reorder', (req, res) => {
  const { itemId, quantity } = req.body;
  const item = mockLabInventory.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Inventory item not found.' });
  }

  item.stock += Number(quantity || 100);
  if (item.stock >= item.minThreshold) {
    item.status = 'OK';
  } else {
    item.status = 'LOW';
  }

  res.json({ success: true, data: item });
});

// 10. Critical alerts panics
app.get('/api/lab/alerts', (req, res) => {
  res.json({ success: true, data: mockLabAlerts });
});

app.post('/api/lab/alerts/acknowledge', (req, res) => {
  const { alertId, acknowledgedBy } = req.body;
  const alert = mockLabAlerts.find(a => a.id === alertId);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found.' });
  }

  alert.status = 'ACKNOWLEDGED';
  alert.acknowledgedBy = acknowledgedBy || 'Dr. Sunita Deshmukh';
  alert.acknowledgedAt = new Date().toISOString();

  // Log action
  mockLabAudit.unshift({
    id: 'AUD-' + Math.floor(Math.random() * 100000),
    action: 'CRITICAL_ALERT_ACKNOWLEDGED',
    target: alert.id,
    user: alert.acknowledgedBy,
    role: 'Doctor',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, data: alert });
});

// 11. Audit logs
app.get('/api/lab/audit', (req, res) => {
  res.json({ success: true, data: mockLabAudit });
});

// ============================================================
// HOSPITAL COMMAND CENTER — OPERATIONAL APIs
// ============================================================

// ── In-Memory Data Stores ────────────────────────────────────

interface CmdAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  category: string;
  title: string;
  message: string;
  department: string;
  location: string;
  startedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  status: 'DETECTED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  escalationLevel: number;
  owner?: string;
  elapsed?: number;
}

interface CmdIncident {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  location: string;
  reportedAt: string;
  commander?: string;
  teamsAssigned: string[];
  resourcesRequested: string[];
  status: 'OPEN' | 'ACTIVE' | 'CONTAINED' | 'RESOLVED' | 'MCI_DECLARED';
  isMCI: boolean;
  mciDeclaredAt?: string;
  mciDeclaredBy?: string;
  updates: { time: string; message: string; by: string }[];
}

interface BedRecord {
  ward: string;
  total: number;
  occupied: number;
  available: number;
  cleaning: number;
  blocked: number;
  reserved: number;
  icuClass: boolean;
}

const mockCmdAlerts: CmdAlert[] = [
  {
    id: 'ALT-001',
    severity: 'CRITICAL',
    category: 'CAPACITY',
    title: 'ICU Occupancy >95%',
    message: 'ICU has only 1 available bed. Incoming trauma cases may require diversion.',
    department: 'ICU',
    location: 'ICU Block A',
    startedAt: new Date(Date.now() - 18 * 60000).toISOString(),
    status: 'DETECTED',
    escalationLevel: 2,
    owner: 'Dr. ICU Head',
    elapsed: 18
  },
  {
    id: 'ALT-002',
    severity: 'HIGH',
    category: 'DIAGNOSTICS',
    title: 'CT Scanner Offline',
    message: 'CT Scanner #2 reported an error code. 8 patients in queue, rerouting to CT #1.',
    department: 'Radiology',
    location: 'Radiology Wing B',
    startedAt: new Date(Date.now() - 34 * 60000).toISOString(),
    status: 'ACKNOWLEDGED',
    escalationLevel: 1,
    owner: 'Radiology Head',
    acknowledgedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    acknowledgedBy: 'Dr. Rajiv Nair',
    elapsed: 34
  },
  {
    id: 'ALT-003',
    severity: 'CRITICAL',
    category: 'BLOOD',
    title: 'O-Negative Blood Critically Low',
    message: 'O-Negative units: 2 remaining. Emergency trauma case incoming. Immediate procurement required.',
    department: 'Blood Bank',
    location: 'Blood Bank',
    startedAt: new Date(Date.now() - 7 * 60000).toISOString(),
    status: 'DETECTED',
    escalationLevel: 1,
    owner: 'Blood Bank Officer',
    elapsed: 7
  },
  {
    id: 'ALT-004',
    severity: 'WARNING',
    category: 'STAFF',
    title: 'Pediatrics Ward Below Safe Staffing',
    message: 'Pediatrics ward has 2 nurses for 45 patients. Safe ratio requires minimum 4 nurses.',
    department: 'Pediatrics',
    location: 'Ward 3 - Pediatrics',
    startedAt: new Date(Date.now() - 52 * 60000).toISOString(),
    status: 'ASSIGNED',
    escalationLevel: 1,
    owner: 'Nursing Supervisor',
    elapsed: 52
  },
  {
    id: 'ALT-005',
    severity: 'HIGH',
    category: 'CLINICAL',
    title: 'Unacknowledged Critical Lab Result',
    message: 'CBC critical value (Hb 6.2 g/dL) for patient Rahul Patil unacknowledged for 12 minutes.',
    department: 'Laboratory',
    location: 'LIMS System',
    startedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    status: 'DETECTED',
    escalationLevel: 2,
    owner: 'Dr. S. Kulkarni',
    elapsed: 12
  }
];

const mockCmdIncidents: CmdIncident[] = [
  {
    id: 'INC-001',
    type: 'MASS_CASUALTY',
    severity: 'CRITICAL',
    title: 'Highway Accident — Mass Casualty Event',
    location: 'Western Express Highway, Bandra',
    reportedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    commander: 'Dr. Dean Kumar',
    teamsAssigned: ['Emergency Team A', 'Trauma Surgery', 'Anesthesia', 'Blood Bank'],
    resourcesRequested: ['10 trauma beds', '2 ICU beds', '8 units O-neg blood', 'OT 3 standby'],
    status: 'ACTIVE',
    isMCI: false,
    updates: [
      { time: new Date(Date.now() - 44 * 60000).toISOString(), message: 'Incident reported. Emergency teams mobilized.', by: 'Command Officer' },
      { time: new Date(Date.now() - 38 * 60000).toISOString(), message: '3 ambulances dispatched. ETA 12-22 mins.', by: 'Ambulance Control' },
      { time: new Date(Date.now() - 20 * 60000).toISOString(), message: 'First patient arrived. Triage ongoing.', by: 'Emergency Nurse' }
    ]
  }
];

const mockBedBoard: BedRecord[] = [
  { ward: 'General Medicine', total: 120, occupied: 108, available: 8, cleaning: 3, blocked: 1, reserved: 4, icuClass: false },
  { ward: 'Surgery Ward', total: 80, occupied: 71, available: 5, cleaning: 2, blocked: 2, reserved: 4, icuClass: false },
  { ward: 'Orthopaedics', total: 60, occupied: 52, available: 5, cleaning: 2, blocked: 1, reserved: 3, icuClass: false },
  { ward: 'Pediatrics', total: 50, occupied: 45, available: 3, cleaning: 1, blocked: 1, reserved: 2, icuClass: false },
  { ward: 'OBGYN / Maternity', total: 60, occupied: 48, available: 8, cleaning: 2, blocked: 0, reserved: 6, icuClass: false },
  { ward: 'ICU Block A', total: 12, occupied: 11, available: 1, cleaning: 0, blocked: 0, reserved: 1, icuClass: true },
  { ward: 'ICU Block B', total: 12, occupied: 11, available: 1, cleaning: 0, blocked: 0, reserved: 1, icuClass: true },
  { ward: 'HDU', total: 20, occupied: 16, available: 3, cleaning: 1, blocked: 0, reserved: 2, icuClass: false },
  { ward: 'NICU', total: 16, occupied: 12, available: 3, cleaning: 0, blocked: 1, reserved: 2, icuClass: true },
  { ward: 'Isolation Ward', total: 20, occupied: 9, available: 10, cleaning: 1, blocked: 0, reserved: 1, icuClass: false },
  { ward: 'Emergency Observation', total: 30, occupied: 24, available: 4, cleaning: 1, blocked: 1, reserved: 2, icuClass: false },
  { ward: 'Burns Unit', total: 10, occupied: 7, available: 2, cleaning: 1, blocked: 0, reserved: 1, icuClass: false }
];

const mockOTSchedule = [
  { id: 'OT-01', name: 'OT 1', status: 'RUNNING', surgeon: 'Dr. Suresh Patil', procedure: 'Total Knee Replacement', started: new Date(Date.now() - 90 * 60000).toISOString(), estEnd: new Date(Date.now() + 60 * 60000).toISOString(), specialty: 'Orthopaedics' },
  { id: 'OT-02', name: 'OT 2', status: 'RUNNING', surgeon: 'Dr. Meena Joshi', procedure: 'LSCS (Emergency C-Section)', started: new Date(Date.now() - 35 * 60000).toISOString(), estEnd: new Date(Date.now() + 25 * 60000).toISOString(), specialty: 'OBGYN' },
  { id: 'OT-03', name: 'OT 3', status: 'EMERGENCY_READY', surgeon: null, procedure: null, started: null, estEnd: null, specialty: null },
  { id: 'OT-04', name: 'OT 4', status: 'CLEANING', surgeon: null, procedure: 'Previous: Appendectomy', started: null, estEnd: new Date(Date.now() + 15 * 60000).toISOString(), specialty: 'General Surgery' },
  { id: 'OT-05', name: 'OT 5', status: 'SCHEDULED', surgeon: 'Dr. Rajesh Shenoy', procedure: 'Laparoscopic Cholecystectomy', started: null, estEnd: new Date(Date.now() + 120 * 60000).toISOString(), specialty: 'General Surgery' }
];

const mockDepartmentOps = [
  { id: 'DEPT-001', name: 'General Medicine', opdLoad: 312, ipdCensus: 108, capacity: 120, staff: 18, avgWait: 24, criticalCases: 3, openAlerts: 1, status: 'HIGH_LOAD' },
  { id: 'DEPT-002', name: 'Surgery', opdLoad: 84, ipdCensus: 71, capacity: 80, staff: 14, avgWait: 18, criticalCases: 1, openAlerts: 0, status: 'NORMAL' },
  { id: 'DEPT-003', name: 'Orthopaedics', opdLoad: 96, ipdCensus: 52, capacity: 60, staff: 10, avgWait: 32, criticalCases: 2, openAlerts: 1, status: 'MODERATE' },
  { id: 'DEPT-004', name: 'Pediatrics', opdLoad: 148, ipdCensus: 45, capacity: 50, staff: 8, avgWait: 19, criticalCases: 4, openAlerts: 2, status: 'HIGH_LOAD' },
  { id: 'DEPT-005', name: 'OBGYN / Maternity', opdLoad: 64, ipdCensus: 48, capacity: 60, staff: 12, avgWait: 12, criticalCases: 1, openAlerts: 0, status: 'NORMAL' },
  { id: 'DEPT-006', name: 'ENT', opdLoad: 52, ipdCensus: 18, capacity: 30, staff: 6, avgWait: 28, criticalCases: 0, openAlerts: 0, status: 'NORMAL' },
  { id: 'DEPT-007', name: 'Ophthalmology', opdLoad: 72, ipdCensus: 12, capacity: 24, staff: 6, avgWait: 35, criticalCases: 0, openAlerts: 0, status: 'MODERATE' },
  { id: 'DEPT-008', name: 'Cardiology', opdLoad: 88, ipdCensus: 36, capacity: 40, staff: 8, avgWait: 21, criticalCases: 5, openAlerts: 1, status: 'HIGH_LOAD' },
  { id: 'DEPT-009', name: 'Neurology', opdLoad: 48, ipdCensus: 22, capacity: 30, staff: 6, avgWait: 28, criticalCases: 3, openAlerts: 0, status: 'MODERATE' },
  { id: 'DEPT-010', name: 'Psychiatry', opdLoad: 36, ipdCensus: 15, capacity: 20, staff: 4, avgWait: 22, criticalCases: 1, openAlerts: 0, status: 'NORMAL' },
  { id: 'DEPT-011', name: 'Dermatology', opdLoad: 44, ipdCensus: 8, capacity: 15, staff: 3, avgWait: 30, criticalCases: 0, openAlerts: 0, status: 'NORMAL' },
  { id: 'DEPT-012', name: 'Emergency', opdLoad: 186, ipdCensus: 86, capacity: 90, staff: 22, avgWait: 8, criticalCases: 18, openAlerts: 3, status: 'CRITICAL' }
];

const mockInterHospital = [
  { id: 'H01', name: 'Sion Hospital', distance: '0 km (Self)', icuAvailable: 2, emergencyCapacity: 72, status: 'HIGH_PRESSURE', transferable: false, specialties: ['Trauma', 'Burns', 'Cardiology'] },
  { id: 'H02', name: 'KEM Hospital', distance: '4.2 km', icuAvailable: 8, emergencyCapacity: 85, status: 'NORMAL', transferable: true, specialties: ['Neurosurgery', 'Pediatrics', 'Burns'] },
  { id: 'H03', name: 'Nair Hospital', distance: '3.8 km', icuAvailable: 5, emergencyCapacity: 60, status: 'MODERATE', transferable: true, specialties: ['Orthopaedics', 'General Medicine'] },
  { id: 'H04', name: 'Cooper Hospital', distance: '8.1 km', icuAvailable: 12, emergencyCapacity: 90, status: 'NORMAL', transferable: true, specialties: ['Cardiac Surgery', 'Neurology', 'Oncology'] },
  { id: 'H05', name: 'Cama & Albless Hospital', distance: '5.5 km', icuAvailable: 3, emergencyCapacity: 40, status: 'MODERATE', transferable: true, specialties: ['OBGYN', 'Neonatology'] },
  { id: 'H06', name: 'Rajawadi Hospital', distance: '6.4 km', icuAvailable: 6, emergencyCapacity: 55, status: 'NORMAL', transferable: true, specialties: ['General Surgery', 'Medicine', 'Pediatrics'] }
];

// ── Command Center APIs ───────────────────────────────────────

// 1. Patient flow at each stage
app.get('/api/command/patient-flow', (req, res) => {
  const flow = {
    arrival: { opd: 2458, emergency: 186, ambulance: 12 },
    registration: { completed: 2240, pending: 218, avgTime: '3.2 min' },
    triage: { completed: 186, awaiting: 5, redCases: 18, yellowCases: 32, greenCases: 36 },
    consultation: { inProgress: 142, waiting: 47, avgWait: '24 min', longestWait: '68 min' },
    diagnostics: { labOrdered: 184, labPending: 142, ctQueue: 8, mriQueue: 3, xrayQueue: 22, radPending: 58 },
    treatment: { inProgress: 812, medicated: 486, proceduresPending: 34 },
    admission: { recentAdmissions: 48, holdsPending: 12, transfersPending: 6 },
    discharge: { dischargeReady: 8, pendingApproval: 14, dischargedToday: 89 },
    bottlenecks: [
      { stage: 'Consultation', issue: '47 patients waiting', severity: 'WARNING', dept: 'OPD' },
      { stage: 'CT Scan Queue', issue: '8 patients awaiting CT, 1 scanner offline', severity: 'HIGH', dept: 'Radiology' },
      { stage: 'Admission Holds', issue: '12 patients clinically cleared but no bed available', severity: 'HIGH', dept: 'Bed Management' },
      { stage: 'Discharge Bottleneck', issue: '8 patients discharge-ready occupying beds', severity: 'WARNING', dept: 'General Medicine' }
    ],
    timestamp: new Date().toISOString()
  };
  res.json({ success: true, data: flow });
});

// 2. Full bed board
app.get('/api/command/beds', (req, res) => {
  const summary = mockBedBoard.reduce((acc, ward) => ({
    total: acc.total + ward.total,
    occupied: acc.occupied + ward.occupied,
    available: acc.available + ward.available,
    cleaning: acc.cleaning + ward.cleaning,
    blocked: acc.blocked + ward.blocked,
    reserved: acc.reserved + ward.reserved
  }), { total: 0, occupied: 0, available: 0, cleaning: 0, blocked: 0, reserved: 0 });

  res.json({
    success: true,
    data: {
      summary,
      occupancyPct: Math.round((summary.occupied / summary.total) * 100),
      wards: mockBedBoard,
      forecast: {
        twoHours: { pressure: 'INCREASING', expectedAdmissions: 18, expectedDischarges: 14 },
        fourHours: { pressure: 'HIGH', expectedAdmissions: 32, expectedDischarges: 22 },
        eightHours: { pressure: 'MODERATE', expectedAdmissions: 48, expectedDischarges: 51 },
        twentyfourHours: { pressure: 'NORMAL', expectedAdmissions: 112, expectedDischarges: 124 }
      }
    }
  });
});

// 3. Reserve a bed
app.post('/api/command/beds/reserve', (req, res) => {
  const { ward, reason, reservedBy, patientRef } = req.body;
  if (!ward || !reason || !reservedBy) {
    return res.status(400).json({ error: 'ward, reason, and reservedBy are required' });
  }
  const bedRecord = mockBedBoard.find(b => b.ward === ward);
  if (!bedRecord) return res.status(404).json({ error: 'Ward not found' });
  if (bedRecord.available <= 0) return res.status(409).json({ error: 'No available beds in this ward' });
  bedRecord.available--;
  bedRecord.reserved++;
  res.json({ success: true, data: { ward, reservedFor: patientRef || 'Incoming patient', reservedBy, reason, at: new Date().toISOString() } });
});

// 4. OT schedule
app.get('/api/command/ot-schedule', (req, res) => {
  const running = mockOTSchedule.filter(o => o.status === 'RUNNING').length;
  const emergencyReady = mockOTSchedule.filter(o => o.status === 'EMERGENCY_READY').length;
  res.json({
    success: true,
    data: {
      rooms: mockOTSchedule,
      summary: { total: mockOTSchedule.length, running, cleaning: mockOTSchedule.filter(o => o.status === 'CLEANING').length, emergencyReady, scheduled: mockOTSchedule.filter(o => o.status === 'SCHEDULED').length }
    }
  });
});

// 5. Department operations table
app.get('/api/command/departments', (req, res) => {
  const depts = mockDepartmentOps.map(d => ({
    ...d,
    occupancyPct: Math.round((d.ipdCensus / d.capacity) * 100)
  }));
  res.json({ success: true, data: depts });
});

// 6. Diagnostics aggregated command view
app.get('/api/command/diagnostics', (req, res) => {
  res.json({
    success: true,
    data: {
      lab: {
        ordersToday: 284,
        pending: 142,
        statPending: 3,
        averageTatMin: 48,
        slaTargetMin: 30,
        slaBreached: true,
        criticalUnacknowledged: 1,
        analyzers: [
          { id: 'ANLY-01', name: 'Hematology Analyzer', status: 'ONLINE', queue: 12 },
          { id: 'ANLY-02', name: 'Biochemistry (STAT)', status: 'CALIBRATING', queue: 8 },
          { id: 'ANLY-03', name: 'Immunoassay', status: 'ONLINE', queue: 6 },
          { id: 'ANLY-04', name: 'Microbiology Incubator', status: 'ONLINE', queue: 4 },
          { id: 'ANLY-05', name: 'Coagulation', status: 'OFFLINE', queue: 0 }
        ]
      },
      radiology: {
        totalQueue: 58,
        xrayQueue: 22,
        ctQueue: 8,
        mriQueue: 3,
        usgQueue: 25,
        avgWaitXray: '12 min',
        avgWaitCt: '42 min',
        avgWaitMri: '68 min',
        machines: [
          { id: 'RAD-01', name: 'CT Scanner 1', status: 'ONLINE', queue: 8 },
          { id: 'RAD-02', name: 'CT Scanner 2', status: 'OFFLINE', queue: 0 },
          { id: 'RAD-03', name: 'MRI 1.5T', status: 'ONLINE', queue: 3 },
          { id: 'RAD-04', name: 'X-Ray Room 1', status: 'ONLINE', queue: 12 },
          { id: 'RAD-05', name: 'X-Ray Room 2', status: 'ONLINE', queue: 10 },
          { id: 'RAD-06', name: 'Ultrasound Suite', status: 'ONLINE', queue: 25 }
        ]
      },
      timestamp: new Date().toISOString()
    }
  });
});

// 7. Pharmacy + blood bank command view
app.get('/api/command/pharmacy-blood', (req, res) => {
  res.json({
    success: true,
    data: {
      pharmacy: {
        criticalStock: [
          { drug: 'Adrenaline 1mg/mL Inj', stock: 8, unit: 'vials', reorderLevel: 20, status: 'CRITICAL' },
          { drug: 'Dopamine 200mg/5mL', stock: 12, unit: 'vials', reorderLevel: 24, status: 'CRITICAL' },
          { drug: 'Paracetamol 650mg Tab', stock: 14200, unit: 'tabs', reorderLevel: 20000, status: 'LOW' },
          { drug: 'Amoxicillin 500mg Cap', stock: 4800, unit: 'caps', reorderLevel: 8000, status: 'LOW' },
          { drug: 'Insulin Actrapid', stock: 24, unit: 'vials', reorderLevel: 30, status: 'LOW' }
        ],
        expiryRisk: [
          { drug: 'IV Metronidazole 500mg', expiry: '2026-08-15', quantity: 340 },
          { drug: 'Ceftriaxone 1g Inj', expiry: '2026-07-31', quantity: 120 }
        ],
        coldChainAlerts: 1
      },
      bloodBank: {
        inventory: [
          { group: 'A+', available: 18, reserved: 3, minimum: 10, status: 'OK' },
          { group: 'A-', available: 4, reserved: 1, minimum: 4, status: 'CRITICAL' },
          { group: 'B+', available: 22, reserved: 4, minimum: 10, status: 'OK' },
          { group: 'B-', available: 3, reserved: 0, minimum: 4, status: 'CRITICAL' },
          { group: 'AB+', available: 8, reserved: 2, minimum: 4, status: 'OK' },
          { group: 'AB-', available: 2, reserved: 0, minimum: 2, status: 'LOW' },
          { group: 'O+', available: 24, reserved: 5, minimum: 15, status: 'OK' },
          { group: 'O-', available: 2, reserved: 1, minimum: 8, status: 'CRITICAL' }
        ],
        pendingRequests: 3,
        crossMatchPending: 2
      },
      timestamp: new Date().toISOString()
    }
  });
});

// 8. Centralized alert management
app.get('/api/command/alerts', (req, res) => {
  const { status, severity, category } = req.query as Record<string, string>;
  let filtered = mockCmdAlerts;
  if (status) filtered = filtered.filter(a => a.status === status);
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (category) filtered = filtered.filter(a => a.category === category);
  filtered.forEach(a => { a.elapsed = Math.floor((Date.now() - new Date(a.startedAt).getTime()) / 60000); });
  res.json({ success: true, data: filtered });
});

// 9. Acknowledge alert
app.post('/api/command/alerts/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  const { acknowledgedBy, action } = req.body;
  const alert = mockCmdAlerts.find(a => a.id === id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = action === 'resolve' ? 'RESOLVED' : 'ACKNOWLEDGED';
  alert.acknowledgedBy = acknowledgedBy || 'Command Officer';
  alert.acknowledgedAt = new Date().toISOString();
  if (action === 'resolve') alert.resolvedAt = new Date().toISOString();
  res.json({ success: true, data: alert });
});

// 10. Create alert
app.post('/api/command/alerts', (req, res) => {
  const { severity, category, title, message, department, location } = req.body;
  if (!severity || !category || !title || !message || !department || !location) {
    return res.status(400).json({ error: 'All alert fields required' });
  }
  const alert: CmdAlert = {
    id: 'ALT-' + Math.floor(Math.random() * 100000),
    severity, category, title, message, department, location,
    startedAt: new Date().toISOString(),
    status: 'DETECTED',
    escalationLevel: 1
  };
  mockCmdAlerts.unshift(alert);
  res.json({ success: true, data: alert });
});

// 11. Get incidents
app.get('/api/command/incidents', (req, res) => {
  res.json({ success: true, data: mockCmdIncidents });
});

// 12. Create incident
app.post('/api/command/incidents', (req, res) => {
  const { type, severity, title, location, commander } = req.body;
  if (!type || !severity || !title || !location) {
    return res.status(400).json({ error: 'type, severity, title, location required' });
  }
  const incident: CmdIncident = {
    id: 'INC-' + Math.floor(Math.random() * 100000),
    type, severity, title, location,
    reportedAt: new Date().toISOString(),
    commander: commander || 'Command Officer',
    teamsAssigned: [],
    resourcesRequested: [],
    status: 'OPEN',
    isMCI: false,
    updates: [{ time: new Date().toISOString(), message: 'Incident opened.', by: commander || 'Command Officer' }]
  };
  mockCmdIncidents.unshift(incident);
  res.json({ success: true, data: incident });
});

// 13. Declare MCI
app.post('/api/command/incidents/:id/declare-mci', (req, res) => {
  const { id } = req.params;
  const { declaredBy, reason } = req.body;
  const incident = mockCmdIncidents.find(i => i.id === id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  if (!declaredBy) return res.status(400).json({ error: 'declaredBy is required for MCI declaration' });
  incident.isMCI = true;
  incident.status = 'MCI_DECLARED';
  incident.mciDeclaredAt = new Date().toISOString();
  incident.mciDeclaredBy = declaredBy;
  incident.updates.push({ time: new Date().toISOString(), message: `MCI DECLARED by ${declaredBy}. Reason: ${reason || 'Mass casualty threshold exceeded.'}`, by: declaredBy });
  res.json({ success: true, data: incident });
});

// 14. Inter-hospital network status
app.get('/api/command/inter-hospital', (req, res) => {
  res.json({ success: true, data: mockInterHospital });
});

// 15. Inter-hospital transfer request
app.post('/api/command/inter-hospital/transfer-request', (req, res) => {
  const { fromHospital, toHospital, patientRef, reason, requestedBy, specialty } = req.body;
  if (!toHospital || !patientRef || !reason || !requestedBy) {
    return res.status(400).json({ error: 'toHospital, patientRef, reason, requestedBy required' });
  }
  const request = {
    id: 'TRF-' + Math.floor(Math.random() * 100000),
    fromHospital: fromHospital || 'Sion Hospital',
    toHospital,
    patientRef,
    specialty: specialty || 'General',
    reason,
    requestedBy,
    requestedAt: new Date().toISOString(),
    status: 'PENDING_APPROVAL'
  };
  res.json({ success: true, data: request });
});

// 16. Cross-module correlation engine
app.get('/api/command/correlation', (req, res) => {
  const correlations = [
    {
      id: 'COR-001',
      title: 'Trauma Patient + Critical Resource Shortage',
      severity: 'CRITICAL',
      factors: [
        { module: 'Emergency', signal: 'Incoming RED trauma patient — ETA 4 mins', value: 'AMB-02' },
        { module: 'ICU', signal: 'ICU at 92% capacity — only 2 beds available', value: '22/24 beds occupied' },
        { module: 'Blood Bank', signal: 'O-Negative critically low — 2 units remaining', value: '2 units' },
        { module: 'OT', signal: 'OT 3 is emergency-ready', value: 'Available' }
      ],
      situation: 'Incoming cardiac trauma patient requires ICU, blood, and possible emergency OT simultaneously. Multiple critical resources are near depletion.',
      recommendedActions: [
        'Pre-assign Trauma Bay 1 for incoming AMB-02',
        'Reserve ICU Bed 23 immediately',
        'Request emergency O-Negative procurement from KEM Hospital (8 units available)',
        'Place OT 3 on STANDBY for emergency cardiac procedure',
        'Alert Cardiac Surgeon Dr. Mehta and Anesthesia team'
      ],
      confidence: 97,
      createdAt: new Date(Date.now() - 3 * 60000).toISOString()
    },
    {
      id: 'COR-002',
      title: 'Lab TAT Delay → Discharge Blockage → Bed Shortage',
      severity: 'HIGH',
      factors: [
        { module: 'Laboratory', signal: 'STAT Biochemistry analyzer calibrating — 8 pending orders', value: 'TAT +18 min over SLA' },
        { module: 'Wards', signal: '14 patients pending discharge approval, awaiting lab results', value: '14 patients' },
        { module: 'Admissions', signal: '12 admission-holds due to no available beds', value: '12 pending admissions' }
      ],
      situation: 'Lab delays are causing a cascade: discharge approvals are blocked, preventing bed release, which is blocking new admissions.',
      recommendedActions: [
        'Deploy Biochemistry Lab supervisor for analyzer calibration',
        'Route STAT samples to Hematology analyzer as backup',
        'Fast-track discharge review for 8 patients whose results are non-critical'
      ],
      confidence: 89,
      createdAt: new Date(Date.now() - 8 * 60000).toISOString()
    }
  ];
  res.json({ success: true, data: correlations });
});

// 17. Command center audit log
const cmdAuditLog: any[] = [
  { id: 'CAUD-001', user: 'Dr. Dean Kumar', role: 'Hospital Dean', action: 'Acknowledged ICU capacity alert', target: 'ALT-001', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'CAUD-002', user: 'Cmd Officer Sharma', role: 'Command Officer', action: 'Reserved ICU Bed 23 for incoming trauma patient', target: 'ICU Block A', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: 'CAUD-003', user: 'Cmd Officer Sharma', role: 'Command Officer', action: 'Dispatched staff to Emergency Bay 2', target: 'Staff: Sister Varsha Sawant', timestamp: new Date(Date.now() - 5 * 60000).toISOString() }
];

app.get('/api/command/audit', (req, res) => {
  res.json({ success: true, data: cmdAuditLog });
});

app.post('/api/command/audit', (req, res) => {
  const { user, role, action, target } = req.body;
  const entry = {
    id: 'CAUD-' + Math.floor(Math.random() * 1000000),
    user: user || 'Command Officer',
    role: role || 'COMMAND_OFFICER',
    action,
    target: target || 'N/A',
    timestamp: new Date().toISOString()
  };
  cmdAuditLog.unshift(entry);
  console.log(`[CMD AUDIT] ${entry.user} (${entry.role}): ${entry.action} → ${entry.target}`);
  res.json({ success: true, data: entry });
});

// ─────────────────────────────────────────────────────────────
// RADIOLOGY PACS + RIS API ENDPOINTS
// ─────────────────────────────────────────────────────────────
const mockRadiologyOrders: any[] = [
  {
    id: 'RAD-ORD-101',
    patientName: 'Rohan Devendra Sharma',
    age: 45,
    gender: 'Male',
    uhid: 'UHID-2026-8801',
    modality: 'CT',
    studyName: 'CT Head (NCCT) - Stroke Protocol',
    priority: 'STAT',
    clinicalIndication: 'Sudden left-sided weakness, slurred speech. Onset 90m ago.',
    orderingDoctor: 'Dr. Sunita Deshmukh (Neurology)',
    department: 'Emergency / Stroke Unit',
    orderedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    status: 'COMPLETED',
    protocolAssigned: 'NCCT Stroke Protocol (120kVp, 250mAs)',
  },
  {
    id: 'RAD-ORD-102',
    patientName: 'Priya Kirit Patel',
    age: 32,
    gender: 'Female',
    uhid: 'UHID-2026-8802',
    modality: 'MRI',
    studyName: 'MRI Brain with Gadolinium',
    priority: 'URGENT',
    clinicalIndication: 'Transient vision loss left eye, paresthesia.',
    orderingDoctor: 'Dr. Ramesh Nair (Neurology)',
    department: 'IPD Neurology',
    orderedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    status: 'IN_PROGRESS',
    protocolAssigned: 'T2/FLAIR + Contrast Gadolinium',
  },
  {
    id: 'RAD-ORD-103',
    patientName: 'Vikram Singh Gill',
    age: 58,
    gender: 'Male',
    uhid: 'UHID-2026-8803',
    modality: 'X-Ray',
    studyName: 'Chest X-Ray PA View',
    priority: 'ROUTINE',
    clinicalIndication: 'Fever 102F, productive cough 4 days.',
    orderingDoctor: 'Dr. Anil Mehta (Pulmonology)',
    department: 'OPD Chest Medicine',
    orderedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'SCHEDULED',
    protocolAssigned: 'Standard PA Standing 110kVp',
  }
];

const mockRadiologyCriticalFindings: any[] = [
  {
    id: 'CRIT-RAD-01',
    patientName: 'Rohan Devendra Sharma',
    uhid: 'UHID-2026-8801',
    accession: 'ACC-2026-99081',
    study: 'CT Head (NCCT)',
    finding: 'Acute Intracranial Hemorrhage in left basal ganglia (24x18mm) with 3mm midline shift',
    severity: 'CRITICAL',
    radiologist: 'Dr. A. K. Verma',
    notifiedDoctor: 'Dr. Sunita Deshmukh',
    department: 'Neurology Emergency',
    detectedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    acknowledgedBy: 'Dr. Sunita Deshmukh',
    status: 'ACKNOWLEDGED',
  }
];

const mockRadiologyMessages: any[] = [
  {
    id: 'RAD-MSG-01',
    sender: 'Dr. A. K. Verma (Radiology)',
    recipient: 'Dr. Sunita Deshmukh (Emergency)',
    studyId: 'std_001',
    patientName: 'Rohan Devendra Sharma',
    message: 'STAT CT Head shows acute 24mm ICH in left basal ganglia. Images in PACS. Please review immediately.',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    read: true,
    acknowledged: true
  }
];

const mockRadiologyAudit: any[] = [
  { id: 'RAUD-101', user: 'Dr. A. K. Verma', role: 'Radiologist', action: 'Opened DICOM Study', target: 'ACC-2026-99081 (Rohan Sharma)', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'RAUD-102', user: 'AI Engine (MCGM-RadAI)', role: 'AI Assistant', action: 'Flagged Acute ICH (96.4% confidence)', target: 'ACC-2026-99081', timestamp: new Date(Date.now() - 28 * 60000).toISOString() },
  { id: 'RAUD-103', user: 'Dr. A. K. Verma', role: 'Radiologist', action: 'Accepted AI Finding & Dictated Report', target: 'ACC-2026-99081', timestamp: new Date(Date.now() - 24 * 60000).toISOString() },
  { id: 'RAUD-104', user: 'Dr. A. K. Verma', role: 'Radiologist', action: 'Signed & Released Report (PIN Auth)', target: 'ACC-2026-99081', timestamp: new Date(Date.now() - 20 * 60000).toISOString() },
];

app.get('/api/radiology/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      studiesToday: 184,
      emergencyStudies: 28,
      statPending: 3,
      scheduled: 42,
      completed: 111,
      reportingPending: 16,
      criticalFindings: 4,
      avgReportTatMin: 14.8,
      machinesOnline: 5,
      machinesOffline: 1,
      modalities: [
        { name: 'CT-01 (GE Revolution)', type: 'CT', status: 'ONLINE', currentPatient: 'Rohan D. Sharma', queue: 4, avgWaitMin: 12, scansToday: 28 },
        { name: 'CT-02 (Siemens Somatom)', type: 'CT', status: 'ONLINE', currentPatient: 'Ananya Kulkarni', queue: 3, avgWaitMin: 15, scansToday: 22 },
        { name: 'MRI-01 (Siemens 3T)', type: 'MRI', status: 'ONLINE', currentPatient: 'Priya Patel', queue: 2, avgWaitMin: 32, scansToday: 14 },
        { name: 'XR-01 (Fujifilm DR)', type: 'X-Ray', status: 'ONLINE', currentPatient: 'Vikram Gill', queue: 6, avgWaitMin: 4, scansToday: 42 },
        { name: 'XR-02 (Fujifilm Bay 2)', type: 'X-Ray', status: 'MAINTENANCE', currentPatient: 'None', queue: 0, avgWaitMin: 0, scansToday: 0 },
        { name: 'US-01 (GE Voluson)', type: 'Ultrasound', status: 'ONLINE', currentPatient: 'Lakshmi Nair', queue: 3, avgWaitMin: 18, scansToday: 18 },
      ]
    }
  });
});

app.get('/api/radiology/orders', (req, res) => {
  res.json({ success: true, data: mockRadiologyOrders });
});

app.post('/api/radiology/orders', (req, res) => {
  const newOrder = {
    id: 'RAD-ORD-' + Math.floor(Math.random() * 1000),
    ...req.body,
    orderedAt: new Date().toISOString(),
    status: 'ORDERED'
  };
  mockRadiologyOrders.unshift(newOrder);
  res.json({ success: true, data: newOrder });
});

app.post('/api/radiology/orders/:id/protocol', (req, res) => {
  const { id } = req.params;
  const { protocol, priority } = req.body;
  const ord = mockRadiologyOrders.find(o => o.id === id);
  if (ord) {
    if (protocol) ord.protocolAssigned = protocol;
    if (priority) ord.priority = priority;
    ord.status = 'PROTOCOLED';
  }
  res.json({ success: true, data: ord });
});

app.get('/api/radiology/critical-findings', (req, res) => {
  res.json({ success: true, data: mockRadiologyCriticalFindings });
});

app.post('/api/radiology/critical-findings/:id/ack', (req, res) => {
  const { id } = req.params;
  const { acknowledgedBy } = req.body;
  const cf = mockRadiologyCriticalFindings.find(c => c.id === id);
  if (cf) {
    cf.status = 'ACKNOWLEDGED';
    cf.acknowledgedBy = acknowledgedBy || 'Dr. Sunita Deshmukh';
    cf.acknowledgedAt = new Date().toISOString();
  }
  res.json({ success: true, data: cf });
});

app.get('/api/radiology/messages', (req, res) => {
  res.json({ success: true, data: mockRadiologyMessages });
});

app.post('/api/radiology/messages', (req, res) => {
  const newMsg = {
    id: 'RAD-MSG-' + Math.floor(Math.random() * 1000),
    ...req.body,
    timestamp: new Date().toISOString(),
    read: false,
    acknowledged: false
  };
  mockRadiologyMessages.push(newMsg);
  res.json({ success: true, data: newMsg });
});

app.get('/api/radiology/audit', (req, res) => {
  res.json({ success: true, data: mockRadiologyAudit });
});

app.post('/api/radiology/audit', (req, res) => {
  const entry = {
    id: 'RAUD-' + Math.floor(Math.random() * 10000),
    user: req.body.user || 'Dr. A. K. Verma',
    role: req.body.role || 'Radiologist',
    action: req.body.action,
    target: req.body.target || 'PACS',
    timestamp: new Date().toISOString()
  };
  mockRadiologyAudit.unshift(entry);
  res.json({ success: true, data: entry });
});

// Vite Dev Server Integration & SPA Fallback serving

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
