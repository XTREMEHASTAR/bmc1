# Laboratory Management & Intelligence System (LIMS) Integration Map

This document outlines the architectural map of the MCGM Digital Hospital LIMS module. It audits the existing laboratory features, identifies gaps, and charts the path for full implementation of the complete digital laboratory workflow.

---

## 1. Feature Audit Checklist

### EXISTING
* **Basic Lab Portal Shell:** The client application contains a basic `<LaboratoryDashboard>` component in [LaboratoryDashboard.tsx](file:///c:/Users/jaiveer/Downloads/mcgm-digital-hospital/src/components/LaboratoryDashboard.tsx).
* **Vitals & Patient Schema:** The core application defines `Patient` and `EmergencyRegistration` in [emergency.ts](file:///c:/Users/jaiveer/Downloads/mcgm-digital-hospital/src/types/emergency.ts).
* **Express Dev Server:** The backend in [server.ts](file:///c:/Users/jaiveer/Downloads/mcgm-digital-hospital/server.ts) hosts basic Express APIs, Gemini API hooks, and serves the static frontend bundles.
* **Basic AI Interpretation:** A clinical text-generation API at `/api/clinical-interpretation` exists to interpret simple hematology results using Gemini.

### PARTIAL
* **LIMS Sidebar Navigation:** The application routes to the laboratory portal shell via the portal switcher in `App.tsx`, but only loads a static single-view mockup.
* **Voice OS Triggers:** The [CommandRegistry.ts](file:///c:/Users/jaiveer/Downloads/mcgm-digital-hospital/src/voice-os/registry/CommandRegistry.ts) contains a few basic keywords for laboratory tabs, but lacks complete sub-tab navigation and context-aware queries.

### MISSING
* **Unified Role Workspaces:** Role-based dashboard restrictions for `LAB_RECEPTIONIST`, `PHLEBOTOMIST`, `LAB_TECHNICIAN`, `SENIOR_TECHNICIAN`, `PATHOLOGIST`, `LAB_INCHARGE`, `BLOOD_BANK_TECHNICIAN`, `MICROBIOLOGIST`, `LAB_ADMIN`, and `DEAN` views.
* **21 Sub-Navigation Panels:** Separate operational modules for sample collection, accessioning, specialty benches, reagent inventory, quality control charts, and audit ledgers.
* **Specimen Lifecycle Workflows:** A complete event chain spanning doctor order, phlebotomy task generation, patient identification verification, tube/bottle collection instructions, barcode generation, lab accessioning accept/reject checks, department splits, and result entry.
* **Quality Control & Westgard Logic:** Interactive Levey-Jennings graphs supporting standard deviation boundaries (+1SD, +2SD, +3SD, Mean) and Westgard rule warning triggers (like 1_2s or 1_3s breaches).
* **Inventory Alerts:** Reagent levels tracking matching kits, lots, and expiry dates with warning notifications for near-expiry and expired lots.
* **Critical Alerts Engine:** Real-time triggers for life-threatening test bounds (like Hb < 7, critical Troponin, extreme potassium) sending instant alerts to clinicians.
* **Digital Lab Reports:** PDF generation of authorized lab findings complete with QR verification barcodes and digital pathologist seals.
* **Audit Trail ledger:** Append-only session ledger logging specimen collection, manual result modifications, and pathologists' authorizations.

---

## 2. Implementation Strategy

### REUSE
* **Dashboard Shell:** The responsive flex grid and dark/light modes of `LaboratoryDashboard.tsx`.
* **Clinical Styling:** Navy blue sidebars, white/grey content cards, and the MCGM blue primary color system.
* **Gemini Copilot Engine:** The `/api/clinical-interpretation` endpoint for clinical explanation generation.
* **Live Patient States:** Linking LIMS test orders to patient records inside the existing `DEMO_REGISTRATIONS` list.

### BUILD
1. **LIMS State Management in `server.ts`:**
   - Create Express mock data collections: `mockLabOrders`, `mockSpecimens`, `mockLabInventory`, `mockQCLogs`, `mockLabAlerts`, and `mockLabAudit`.
   - Implement REST endpoints for fetching/updating specimens, generating barcodes, entering findings, and recording authorizations.
2. **Interactive Role Swapping:**
   - Create a header-level Role Selector dropdown allowing the user to switch active duties (e.g. Phlebotomist, Pathologist, etc.) on the fly.
3. **Phlebotomy Workspace:**
   - Implement identity verification (wristband barcode scan simulation), tube instructions (e.g., EDTA Purple Top, SST Gold Top), and a "Collect Sample" button.
4. **Accessioning Bench:**
   - Build a container-verification UI where technicians inspect volumes, labeling, and quality, with options to accept, partially accept, or reject (with configured reasons).
5. **Specialty Bench Interfaces:**
   - Design tab views for Hematology (CBC), Biochemistry (RFT/Troponin), Microbiology (incubations, Gram stains), Histopathology (cassettes, embed), and Molecular PCR.
6. **Levey-Jennings Charting Component:**
   - Plot live control data points dynamically using SVG graphs.
7. **Comprehensive Audit Logs & Alerts Mailbox:**
   - Render a high-density, filterable list of security events and active panic result notices.
8. **End-to-End Simulation Runner:**
   - Add a "Simulate E2E Lab Case" panel allowing the user to trigger the "Rahul Patil" scenario (STAT CBC, RFT, and Troponin) and progress it step-by-step to demonstrate the unified event chain.
