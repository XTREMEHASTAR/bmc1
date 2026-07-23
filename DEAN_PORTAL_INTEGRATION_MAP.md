# DEAN COMMAND CENTER INTEGRATION MAP

This document maps the integration points of the Dean Command & Control Center within the existing MCGM Digital Hospital OS codebase.

## 1. Existing Capabilities & Data Stores

The MCGM Digital Hospital OS has established systems and data structures that the Dean Command Center must sit above and consume in real-time.

### A. Backend Services (`server.ts` & `backend/src/main.py`)
- **Staffing & Attendance:**
  - Mock staff database (`mockStaff` in `server.ts`) representing doctors, nurses, technicians, security, facilities.
  - Geofenced attendance events (`mockEvents`, `mockExceptions`, `mockSwaps`, `mockLeaves`).
  - Active staff availability mapping (`mockAvailability`).
  - Manager endpoints for attendance/workforce tracking (`/api/attendance/workforce`, `/api/attendance/approve-exception`, `/api/attendance/approve-leave`, `/api/attendance/approve-swap`).
- **Staff Dispatch & Emergency Alerts:**
  - Staff assignment tracking (`mockAssignments` in `server.ts`).
  - Emergency broadcasts (`mockBroadcasts` and `mockBroadcastRecipients` in `server.ts`).
  - Dispatch endpoints (`/api/dispatch/assignments`, `/api/dispatch/update-status`, `/api/dispatch/broadcast`).
- **Clinical & Triage Core (FastAPI / python backend):**
  - Citizen index & Patient enrollment (`/api/v1/citizens`, `/api/v1/patients`).
  - Encounter registry (`/api/v1/encounters`).
  - Longitudinal timeline query (`/api/v1/citizens/{citizen_id}/timeline`).
  - AI dispatch and feedback logger.

### B. Frontend Services & Mock States
- **Emergency Service (`src/services/patients.ts` & `src/services/resources.ts`):**
  - Emergency registrations (`DEMO_REGISTRATIONS`) with GCS, RTS, triage category, vitals, bay assignments.
  - Trauma bays status tracking (`DEMO_BAYS` - occupied, available, cleaning, maintenance, active assignment).
  - Ambulances fleet tracking (`DEMO_AMBULANCES` - status, vehicle numbers, fuel, oxygen levels, active missions).
  - Incidents log (`DEMO_INCIDENTS` - fire outbreaks, road traffic accidents, severity, victims count).
  - Central resources list (`DEMO_RESOURCES` - ICU beds, ventilators, blood units, OT suites, wheelchairs, stretchers, oxygen cylinders, monitors).
- **Clinical Encounters (`src/services/encounters.ts`):**
  - Clinical encounters repository (`ENCOUNTERS`).
  - Ward beds digital board (`WARD_BEDS` containing 164 beds across General Male/Female, Surgical, Pediatric, Maternity, ICU, HDU, CCU, NICU, PICU, Isolation, and Emergency Observation wards).
  - Ward occupancy aggregates via `getWardSummary()`.
  - Downstream routing triggers for Pharmacy, Laboratory, Radiology, and Nursing.
- **Voice OS Engine (`src/voice-os/`):**
  - A comprehensive speech recognition and command execution system.
  - A registry of voice commands (`CommandRegistry.ts`) mapping spoken triggers to custom events.

---

## 2. Reusable Components

The following existing visual and functional modules will be leveraged by the Dean Command Center:
1. **ICU Dashboard (`src/components/ICUDashboard.tsx`):** We will reuse its state models for ICU occupancy and transfer details.
2. **Emergency Care Dashboard (`src/components/EmergencyCareDashboard.tsx`):** We will reuse its maps, trauma bay tracking, and triage category views.
3. **Staff Portal (`src/components/StaffPortal.tsx`):** We will reuse its dispatch widgets, geo-fenced attendance cards, and task forms.
4. **Surgery Dashboard (`src/components/SurgeryDashboard.tsx`):** We will reuse its scheduled surgeries and room allocation views.
5. **Diagnostics Dashboards (`src/components/LaboratoryDashboard.tsx` & `src/components/RadiologyDashboard.tsx`):** We will reuse their sample processing backlogs, turnaround times, and equipment statuses.
6. **Pharmacy Dashboard (`src/components/PharmacyDashboard.tsx`):** We will reuse its inventory levels and out-of-stock warning indicators.
7. **VoiceAssistantOverlay (`src/components/VoiceAssistantOverlay.tsx`):** We will use this to capture administrative vocal requests.

---

## 3. Missing Capabilities (To Build)

To fully fulfill the requirements of the MCGM Dean Command & Control Center, the following backend APIs, frontend views, and integrations must be built:

### A. Missing Backend APIs (to be merged into `server.ts`)
We will integrate the Dean Command Center's endpoints directly into the main `server.ts` to ensure single-port execution (port 3000) and seamless production builds:
1. `GET /api/dean/dashboard/:hospitalId` - Aggregated executive overview, returning real-time metrics compiled from live patient flow, resource availability, staff counts, and finance summaries.
2. `GET /api/dean/directives` - Fetch administrative operational directives.
3. `POST /api/dean/directives` - Create a new directive issued by the Dean.
4. `POST /api/dean/directives/:id/approve` - Approve/acknowledge a directive.
5. `GET /api/dean/escalations` - Fetch active operational escalations.
6. `POST /api/dean/escalations` - Create a new executive escalation.
7. `POST /api/dean/reports/generate` - Trigger PDF/Excel compilation of hospital stats.
8. `GET /api/dean/reports` - Fetch list of generated reports.
9. `POST /api/dean/analytics/analyze` - Trigger AI-driven analysis of hospital pressure parameters.

### B. Missing Frontend Views (Inside `src/app/dean-command-center/page.tsx`)
We will create a multi-tab desktop-first navigation framework (supporting 19 portals) with drill-down capabilities:
1. **Executive Overview (Page 1):** Clickable top grid, live patient flow comparison, occupancy representations, and the Critical Alert Center.
2. **Patient Flow Command (Page 2):** Inflow/outflow heatmaps, waiting times, and bottleneck alerts.
3. **Emergency Command (Page 3):** Ambulances eta tracking, trauma bay occupancies, and disaster state declarations.
4. **Bed Management (Page 4):** Digital bed board representing all wards (available, occupied, cleaning, blocked) with patient details.
5. **OT & Surgery (Page 5):** Surgeon timetables, turnaround metrics, and cancels tracking.
6. **Clinical Services (Page 6):** Departmental workloads cards (Medicine, Ortho, Surgery, etc.).
7. **Diagnostics (Page 7):** Pending samples tracker, CT/MRI utilisation, and STAT delays.
8. **Pharmacy & Blood (Page 8):** Blood group inventories and cold-chain status.
9. **Staff & Workforce (Page 9):** Scheduled vs. on-duty heatmaps, roster gaps, and the Staff Dispatch panel.
10. **Finance & Revenue (Page 10):** Revenue categories (OPD, IPD, Diagnostics) and PMJAY integration statistics.
11. **Quality & Safety (Page 11):** Serious adverse events, mortality incidents, and readmission rates.
12. **Infrastructure (Page 12):** CT/MRI scanner downtime, oxygen tank levels, power backup statuses.
13. **Academic & Research (Page 13):** Residents duty logs and research project approvals.
14. **Alerts & Notifications (Page 14):** Unified command inbox (Clinical, Staffing, Financial, Infrastructure alerts).
15. **Reports & Analytics (Page 15):** On-demand exports of operational metrics.
16. **Action Center (Page 16):** Task tracker for Dean directives and escalations.
17. **Audit & Logs (Page 17):** Append-only log tracking executive viewer actions.
18. **System Health (Page 18):** Gateway checks (ABHA, LIS, PACS, Realtime).
19. **Settings & Configuration (Page 19):** Staffing rules, alert limits, escalation lines.

### C. Missing Real-time Notifications & Realtime Integration
- Subscription bindings between frontend state and backend events (`mcgm-patient-registered`, `mcgm-resource/update`, `mcgm-nurse-emergency-alert`, `mcgm-dispatch/assignment`).
- Cross-module correlation notifications (e.g. equipment failure cascading into patient delay alerts).

### D. Missing Voice OS Extension
- Adding administrative triggers to `CommandRegistry.ts` (e.g., "Show ICU occupancy", "Open blood bank status", "Approve staff redeployment").

---

## 4. Multi-Hospital Context & Role Isolation

All data queries will include `hospital_id` in headers or URL parameters:
- `hospital_id === 'h1'` -> Sion Hospital
- `hospital_id === 'h2'` -> KEM Hospital
- `hospital_id === 'h3'` -> Nair Hospital
- `hospital_id === 'h4'` -> Cooper Hospital

Only users with roles `HOSPITAL_DEAN` or higher (matching the current Dean user) will be allowed access to the command panel. If the user session hospital ID does not match, data isolation limits details.
