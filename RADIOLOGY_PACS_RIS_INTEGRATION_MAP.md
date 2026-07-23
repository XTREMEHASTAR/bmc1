# MCGM Digital Hospital OS — Radiology, PACS & RIS Integration Map

## Overview
This document maps all 20 pages and core workflows of the Radiology, PACS, and RIS Operating System against the existing codebase. Every requirement is classified into one of four states:
- **EXISTING**: Fully built and operational in `RadiologyDashboard.tsx` or related services.
- **PARTIAL**: Partially implemented UI/logic; needs extension to fulfill full prompt specification.
- **MISSING**: New feature/page requiring clean implementation.
- **NEEDS INTEGRATION**: Backend API endpoints, Command Center events, or Universal Voice OS bindings required.

---

## 1. Requirement Classification Matrix

| Page / Component | Feature Description | Current Status | Integration & Extension Strategy |
|---|---|---|---|
| **Page 1: Command Dashboard** | High-level operational overview, live modality status (CT/MRI/XR/US/Mammo/Fluoroscopy), queue depth, STAT count, TAT KPIs | **PARTIAL** | Add dedicated `command` tab in `RadiologyDashboard.tsx` with live modality grid, STAT overview, and operational controls. |
| **Page 2: PACS Reporting Desk** | DICOM Viewer, patient worklist, AI overlays, measurement tool, slice navigation, 3D/compare modes, dark theme viewer canvas | **EXISTING** | Preserve existing layout and design system. Extend with enhanced DICOM tools (window/level presets, cine loop, DICOM metadata drawer). |
| **Page 3: RIS Scheduling** | Modality calendar/queue, scan booking form, priority classification, pre-procedure preparation checklists | **EXISTING** | Extend with room/modality filter tabs, walk-in/emergency override actions, and conflict prevention. |
| **Page 4: Radiology Order Inbox** | Auto-received orders from Doctor/ER/ICU/Ward/OPD with priority tagging (ROUTINE, URGENT, STAT, EMERGENCY) | **MISSING** | Add `orders` tab with protocol assignment, order acceptance, and clarification request workflows. |
| **Page 5: Patient Safety & Pre-Scan** | Modality-specific safety screening (MRI metal/pacemaker, CT contrast eGFR/renal/allergy, pregnancy checks) | **PARTIAL** | Expand check-in form in RIS tab into a dedicated modal/safety checklist with CLEARED / REVIEW REQUIRED status badge. |
| **Page 6: Modality Worklist** | Technologist workspace tracking lifecycle (ORDERED → SCHEDULED → ARRIVED → PREPARED → IN ROOM → SCANNING → COMPLETED → PACS RECEIVED) | **MISSING** | Add `worklist` tab for technologists to call patients, initiate prep, start scan, and send DICOM study to PACS. |
| **Page 7: Live Machine Control Board** | Imaging device status (CT-1, CT-2, MRI-1, XR-1, US-1, Mammo), utilization, downtime, AI predictive maintenance | **EXISTING** | Add machine maintenance toggle and automatic schedule block when machine goes offline. |
| **Page 8: Emergency Radiology** | Stroke/Trauma STAT queue, door-to-scan & scan-to-report TAT timer, quick launch protocols (Stroke CT, Polytrauma, PE) | **EXISTING** | Connect emergency status updates directly to Emergency Care & Command Center real-time event streams. |
| **Page 9: AI Radiology Assistant** | AI decision support with confidence scores, ROI bounding circles, candidate findings, accept/edit/reject actions | **EXISTING** | Add explicit `ACCEPT AI`, `EDIT AI`, `REJECT AI` buttons that log radiologist review actions. |
| **Page 10: Structured Reporting + Voice** | Speech-to-text dictation, template auto-fill (EXAMINATION, INDICATION, FINDINGS, IMPRESSION), security PIN sign-off | **EXISTING** | Integrate Universal Voice OS commands ("Compare previous CT", "Mark as critical", "Sign report", "Insert chest template"). |
| **Page 11: Previous Studies & Comparison** | Patient historical imaging timeline, side-by-side DICOM compare mode, change classification (New, Stable, Worsened) | **PARTIAL** | Enhance compare viewer with dual-canvas view and change delta tags. |
| **Page 12: Critical Findings Center** | Escalation queue for acute findings (ICH, Pneumothorax, PE, Dissection), notification lifecycle (DETECTED → CONFIRMED → NOTIFIED → ACKNOWLEDGED) | **PARTIAL** | Add `critical` tab with acknowledgment tracking, doctor push alerts, and Command Center escalation. |
| **Page 13: Report Sign & Release** | Pre-release verification, PIN/password sign-off, report immutability, addendum & corrected report versioning | **EXISTING** | Add Addendum creation workflow for already-released reports. |
| **Page 14: Report Distribution** | Auto-dispatch signed reports to Doctor Portal, Nurse Portal, Emergency OS, Patient EMR, Command Center | **NEEDS INTEGRATION** | Add cross-portal event dispatching (`RADIOLOGY_REPORT_RELEASED`) and backend API endpoints. |
| **Page 15: Quality Control** | Machine QA calibration audits, repeat/reject image analysis, technician performance, protocol compliance | **EXISTING** | Keep existing QC tab; link repeat scan reasons directly to audit log. |
| **Page 16: Radiation Dose Monitoring** | Dose metrics (mSv, CTDIvol, DLP), cumulative exposure tracking per patient, AERB threshold outlier alerts | **EXISTING** | Add CTDIvol and DLP metric displays to patient DICOM overlay and dose warnings. |
| **Page 17: Analytics** | Weekly volume charts, radiologist productivity, peak hours heatmap, AI volume predictions | **EXISTING** | Preserve existing analytics tab and enhance data visualizations. |
| **Page 18: Image & Report Sharing** | ABDM-compliant encrypted links, QR code generation, link expiration (1h to 7d), access log audit | **EXISTING** | Keep existing sharing tab; ensure zero public unauthenticated DICOM access. |
| **Page 19: Communication Hub** | Secure messaging between radiologist, referring doctor, ER team, technologist with read/ack receipt | **MISSING** | Add `communication` tab for radiologist-doctor chat and urgent case discussions. |
| **Page 20: Audit & Governance** | Immutable audit log of image views, report edits, AI accept/reject, critical notifications, releases, and shares | **NEEDS INTEGRATION** | Add `audit` tab displaying full tamper-proof audit trail of all PACS/RIS actions. |

---

## 2. End-to-End Simulation Pipeline (23 Steps)

1. Emergency doctor orders CT Brain Stroke Protocol STAT.
2. Order auto-populates Radiology Order Inbox (`/api/radiology/orders`).
3. Technologist Modality Worklist receives patient and prepares CT-01 room.
4. Emergency Command Center receives pending CT alert.
5. Patient safety screening (Contrast allergy, renal eGFR, metal check) confirmed.
6. Patient status transitions to IN ROOM → SCANNING.
7. DICOM study acquired and received by PACS.
8. Radiologist worklist auto-prioritizes study to top of queue (EMERGENCY).
9. AI Assistant auto-analyzes slices and flags "Possible Acute Intracranial Hemorrhage (96.4% confidence)".
10. Radiologist opens DICOM Viewer in dark diagnostic mode.
11. Radiologist inspects ROI bounding circle and measures lesion (24 x 18 mm).
12. Radiologist clicks "ACCEPT AI FINDING".
13. Radiologist uses voice dictation to generate structured report (EXAMINATION, INDICATION, FINDINGS, IMPRESSION).
14. Critical finding (ICH) confirmed and dispatched to ER Doctor with delivery tracking.
15. ER Doctor receives push notification and acknowledges critical finding.
16. Radiologist inputs PIN `1234` and signs report.
17. Signed report becomes immutable and dispatches `RADIOLOGY_REPORT_RELEASED` event.
18. Doctor Portal, Nurse Portal, Emergency OS, and Patient EMR auto-update.
19. Hospital Command Center marks diagnostic bottleneck resolved.
20. Dose metrics (2.1 mSv) logged to AERB dose tracking registry.
21. Technologist QA rating updated (0 repeats).
22. Complete 23-step journey logged to tamper-proof Radiology Audit Log.
