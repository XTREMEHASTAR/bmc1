/**
 * MCGM Arogya Voice Clinical Operating System
 * Centralized Voice Command Engine (Voice OS)
 */

export interface VoiceCommand {
  id: string;
  intent: string;
  category: 'global' | 'doctor' | 'nurse' | 'clinical';
  triggers: { en: string[]; hi: string[]; mr: string[]; };
  confirmRequired?: boolean;
  action: (params?: any) => void;
}

// 1. VoicePermissions
export class VoicePermissions {
  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      return false;
    }
  }

  static async checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions?.query) return 'prompt';
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as any });
      return result.state;
    } catch { return 'prompt'; }
  }
}

// 2. VoiceMemory
export class VoiceMemory {
  private static storage: Map<string, any> = new Map();
  private static pendingConfirmationAction: (() => void) | null = null;
  private static pendingConfirmationText: string = '';

  static set(key: string, value: any) { this.storage.set(key, value); }
  static get(key: string): any { return this.storage.get(key); }
  static clear() { this.storage.clear(); this.pendingConfirmationAction = null; this.pendingConfirmationText = ''; }
  static setPendingConfirmation(action: () => void, text: string) { this.pendingConfirmationAction = action; this.pendingConfirmationText = text; }
  static getPendingConfirmation() { return { action: this.pendingConfirmationAction, text: this.pendingConfirmationText }; }
  static clearPendingConfirmation() { this.pendingConfirmationAction = null; this.pendingConfirmationText = ''; }
}

// 3. VoiceContextManager
export class VoiceContextManager {
  private static currentPortal: string = 'doctor';
  private static activeTab: string = 'dashboard';
  private static activePatientId: string = '1';
  private static activeModals: Set<string> = new Set();

  static setPortal(portal: string) { this.currentPortal = portal; }
  static getPortal(): string { return this.currentPortal; }
  static setActiveTab(tab: string) { this.activeTab = tab; }
  static getActiveTab(): string { return this.activeTab; }
  static setActivePatientId(id: string) { this.activePatientId = id; }
  static getActivePatientId(): string { return this.activePatientId; }
  static openModal(modalId: string) { this.activeModals.add(modalId); }
  static closeModal(modalId: string) { this.activeModals.delete(modalId); }
  static isModalOpen(modalId: string): boolean { return this.activeModals.has(modalId); }
  static clearModals() { this.activeModals.clear(); }
}

// 4. VoiceCommandRegistry
export class VoiceCommandRegistry {
  private static commands: VoiceCommand[] = [];
  static register(command: VoiceCommand) {
    if (!this.commands.some(c => c.id === command.id)) this.commands.push(command);
  }
  static getAll(): VoiceCommand[] { return this.commands; }
  static findByIntent(intent: string): VoiceCommand | undefined { return this.commands.find(c => c.intent === intent); }
  static clear() { this.commands = []; }
}

// 5. VoiceNavigation
export class VoiceNavigation {
  static navigateToPortal(portal: string) {
    VoiceContextManager.setPortal(portal);
    window.dispatchEvent(new CustomEvent('mcgm-portal-change', { detail: portal }));
  }
  static navigateToTab(tab: string) {
    const portal = VoiceContextManager.getPortal();
    VoiceContextManager.setActiveTab(tab);
    if (portal === 'doctor') window.dispatchEvent(new CustomEvent('mcgm-doctor-tab-change', { detail: tab }));
    else if (portal === 'nurse') window.dispatchEvent(new CustomEvent('mcgm-nurse-tab-change', { detail: tab }));
    else if (portal === 'patient') window.dispatchEvent(new CustomEvent('mcgm-patient-tab-change', { detail: tab }));
  }
}

// 6. VoiceFormController
export class VoiceFormController {
  static fillVitals(bp?: string, pulse?: string, temp?: string, spo2?: string, resp?: string) {
    window.dispatchEvent(new CustomEvent('mcgm-nurse-submit-vitals', { detail: { bp, pulse, temp, spo2, resp } }));
  }
  static saveVitals() { window.dispatchEvent(new CustomEvent('mcgm-nurse-save-vitals')); }
  static prescribeMedication(medName: string, dose?: string, timing?: string, duration?: string) {
    window.dispatchEvent(new CustomEvent('mcgm-doctor-prescribe', { detail: { name: medName, dose, timing, duration } }));
  }
  static clearPrescriptions() { window.dispatchEvent(new CustomEvent('mcgm-doctor-clear-prescriptions')); }
}

// 7. VoiceSearch
export class VoiceSearch {
  static searchPatient(query: string) {
    window.dispatchEvent(new CustomEvent('mcgm-doctor-search-patient', { detail: query.toLowerCase().trim() }));
  }
}

// 8. VoiceActionDispatcher
export class VoiceActionDispatcher {
  static dispatch(eventName: string, detail?: any) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  static speak(text: string) {
    const enabled = localStorage.getItem('mcgm-enable-voice-speech') !== 'false';
    if (enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  }
}

// 9. VoiceIntentRouter — Full demo-ready command set
export class VoiceIntentRouter {
  private static lastExecutedText = '';
  private static lastExecutedTime = 0;

  // ── FUZZY NORMALIZER ──────────────────────────────────────────────────────
  // Maps common speech-recognition mis-hearings to canonical phrases
  private static normalize(raw: string): string {
    const map: [RegExp, string][] = [
      // Scribe
      [/start[s]?\s+(scribe|crime|script|shrine|crib|tribe|subscribe|scribing)/i, 'start scribe'],
      [/begin\s+(scribe|ambient|recording)/i, 'start scribe'],
      [/stop\s+(scribe|crime|script|shrine|crib|tribe)/i, 'stop scribe'],
      [/end\s+(scribe|ambient|recording)/i, 'stop scribe'],
      // Help
      [/sh[ao]k\s*commands?|shock\s*commands?|show\s*command/i, 'help'],
      [/what can (you|i) do|available commands?|commands? list/i, 'help'],
      // Appointments / queue
      [/today['']?s?\s*appointments?|today\s+appointments?|appoint\w*/i, "today's appointments"],
      [/show\s+queue|open\s+queue|opd\s+queue/i, 'queue'],
      // Discharge
      [/discharge\s*summ\w*|generate\s+discharge|open\s+discharge|discharge/i, 'discharge summary'],
      // Sign
      [/sign\s+and\s+approve|digital\s+sign|approve\s+presc|sign\s+prescription/i, 'sign prescription'],
      // Portals
      [/open\s+nurs\w*|switch\s+to\s+nurse|nurse\s+portal/i, 'open nurse'],
      [/open\s+doc\w*|switch\s+to\s+doctor|doctor\s+portal/i, 'open doctor'],
      [/open\s+emerg\w*|casualty/i, 'open emergency'],
      [/open\s+lab\w*|pathology\s+portal/i, 'open lab'],
      [/open\s+pharm\w*/i, 'open pharmacy'],
      [/open\s+icu|intensive\s+care/i, 'open icu'],
      [/open\s+radio\w*|imaging\s+portal|x-?ray|xray|^x$/i, 'open radiology'],
      // Next/Skip patient
      [/next\s*patient|call\s*next/i, 'next patient'],
      [/skip\s*patient|skip|defer\s*patient/i, 'skip patient'],
      // Patients directory
      [/(?:show\s+|open\s+)?patients?(?:\s+directory|\s+list|\s+tab)?/i, 'patients'],
    ];
    let result = raw;
    for (const [pattern, replacement] of map) {
      if (pattern.test(raw)) { result = replacement; break; }
    }
    return result;
  }

  static route(speechText: string): { success: boolean; message: string; intent?: string } {
    // Clean trailing/leading punctuation or common filler characters
    const cleaned = speechText
      .replace(/[.,\/#!$%\^&\*;:{}=\_`~()?]$/g, "")
      .replace(/^[.,\/#!$%\^&\*;:{}=\_`~()?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const raw = cleaned.toLowerCase();
    if (!raw) return { success: false, message: 'Empty command.' };

    const normalized = VoiceIntentRouter.normalize(raw);

    // Throttle duplicate executions of the exact same normalized command within 2.5 seconds
    const now = Date.now();
    if (normalized === VoiceIntentRouter.lastExecutedText && (now - VoiceIntentRouter.lastExecutedTime) < 2500) {
      return { success: true, message: 'Throttled duplicate command.', intent: 'THROTTLED' };
    }

    const result = VoiceIntentRouter.routeInternal(cleaned);
    if (result.success && result.intent !== 'THROTTLED') {
      VoiceIntentRouter.lastExecutedText = normalized;
      VoiceIntentRouter.lastExecutedTime = now;
    }
    return result;
  }

  private static routeInternal(speechText: string): { success: boolean; message: string; intent?: string } {
    const raw = speechText.toLowerCase().trim();
    const normalized = VoiceIntentRouter.normalize(raw);
    const portal = VoiceContextManager.getPortal();

    // Pending confirmation flow
    const pending = VoiceMemory.getPendingConfirmation();
    if (pending.action) {
      const yes = ['yes', 'confirm', 'do it', 'submit', 'approve', 'हो', 'हाँ', 'होय'];
      const no  = ['no', 'cancel', 'reject', 'stop', 'नको', 'नहीं', 'रद्द'];
      if (yes.some(t => raw.includes(t))) {
        pending.action();
        VoiceMemory.clearPendingConfirmation();
        VoiceActionDispatcher.speak('Action confirmed.');
        return { success: true, message: 'Action confirmed and submitted.', intent: 'CONFIRM' };
      }
      if (no.some(t => raw.includes(t))) {
        VoiceMemory.clearPendingConfirmation();
        VoiceActionDispatcher.speak('Action cancelled.');
        return { success: true, message: 'Action cancelled.', intent: 'CANCEL' };
      }
    }

    // ── GLOBAL COMMANDS (always active, any portal) ────────────────────────
    if (raw.includes('dark mode') || raw.includes('night mode') || raw.includes('light mode') || raw.includes('toggle theme')) {
      VoiceActionDispatcher.dispatch('mcgm-toggle-dark-mode');
      VoiceActionDispatcher.speak('Theme toggled.');
      return { success: true, message: 'Theme toggled.', intent: 'TOGGLE_DARK_MODE' };
    }

    if (normalized === 'help' || raw.includes('help') || raw.includes('what can you do') || raw.includes('show commands') || raw.includes('commands')) {
      let msg = '';
      if (portal === 'doctor') {
        msg = 'Doctor commands: next patient, appointments queue, prescribe medication, order labs, sign prescription, start scribe, stop scribe, digital twin, open nurse, logout, toggle theme.';
      } else if (portal === 'nurse') {
        msg = 'Nurse commands: record vitals, save vitals, verify medication, shift handover, transfer to ICU, emergency code blue, logout, toggle theme.';
      } else if (portal === 'patient') {
        msg = 'Patient commands: book appointment, start consult, view ABHA card, medical records, my wallet, emergency SOS, switch language, logout, toggle theme.';
      } else {
        msg = 'Available portals: open patient, open doctor, open nurse, open laboratory, open radiology, open pharmacy, open emergency, open surgery, open ICU.';
      }
      VoiceActionDispatcher.speak(msg);
      return { success: true, message: msg, intent: 'HELP' };
    }

    if (raw.includes('logout') || raw.includes('log out') || raw.includes('sign out') || raw.includes('end session')) {
      VoiceActionDispatcher.dispatch('mcgm-logout');
      VoiceActionDispatcher.speak('Logging out. Session ended securely.');
      return { success: true, message: 'Logging out.', intent: 'LOGOUT' };
    }

    if (raw.includes('system status') || raw.includes('arogya status') || raw.includes('show status')) {
      const msg = 'Arogya Clinical OS online. All systems operational. Voice OS active. ABHA integration live.';
      VoiceActionDispatcher.speak(msg);
      return { success: true, message: msg, intent: 'SYSTEM_STATUS' };
    }

    // ── GLOBAL: SCRIBE (works from any portal) ─────────────────────────────
    if (normalized === 'start scribe' || raw.includes('start scribe') || raw.includes('begin scribe') || raw.includes('start ambient') || raw.includes('start recording')) {
      VoiceActionDispatcher.dispatch('mcgm-doctor-toggle-scribe', { active: true });
      VoiceActionDispatcher.speak('Ambient scribing started. Recording consultation.');
      return { success: true, message: 'Scribing started.', intent: 'START_SCRIBE' };
    }
    if (normalized === 'stop scribe' || raw.includes('stop scribe') || raw.includes('end scribe') || raw.includes('stop ambient') || raw.includes('stop recording')) {
      VoiceActionDispatcher.dispatch('mcgm-doctor-toggle-scribe', { active: false });
      VoiceActionDispatcher.speak('Scribing stopped. SOAP notes drafted.');
      return { success: true, message: 'Scribing stopped.', intent: 'STOP_SCRIBE' };
    }

    // ── GLOBAL: DISCHARGE (works from any portal) ──────────────────────────
    if (normalized === 'discharge summary' || raw.includes('discharge')) {
      VoiceActionDispatcher.dispatch('mcgm-doctor-open-discharge');
      VoiceActionDispatcher.speak('Discharge summary panel opened.');
      return { success: true, message: 'Discharge summary opened.', intent: 'OPEN_DISCHARGE' };
    }

    // ── GLOBAL: APPOINTMENTS / QUEUE ───────────────────────────────────────
    if (normalized.includes("today's appointments") || normalized === 'queue' || raw.includes('appointments') || raw.includes('today appointment') || raw.includes('opd queue') || raw.includes('waiting list')) {
      VoiceNavigation.navigateToTab('queue');
      VoiceActionDispatcher.speak('Opening appointments queue.');
      return { success: true, message: 'Appointments queue opened.', intent: 'TAB_QUEUE' };
    }

    // ── PORTAL SWITCHING ───────────────────────────────────────────────────
    const portals: Record<string, string[]> = {
      doctor:      ['open doctor', 'doctor portal', 'doctor dashboard', 'switch to doctor', 'डॉक्टर'],
      nurse:       ['open nurse', 'nurse portal', 'nurse dashboard', 'switch to nurse', 'नर्स'],
      patient:     ['open patient', 'patient portal', 'switch to patient', 'मरीज', 'रुग्ण'],
      command:     ['open command', 'command center', 'नियंत्रण कक्ष'],
      ai:          ['open ai', 'ai copilot', 'copilot', 'ai assistant'],
      laboratory:  ['open lab', 'open laboratory', 'pathology portal', 'प्रयोगशाळा'],
      radiology:   ['open radiology', 'imaging portal', 'ris pacs'],
      pharmacy:    ['open pharmacy', 'medicines store', 'औषधालय'],
      emergency:   ['open emergency', 'casualty', 'emergency department', 'आपत्कालीन'],
      surgery:     ['open surgery', 'operation theatre', 'ot room', 'शस्त्रक्रिया'],
      icu:         ['open icu', 'intensive care', 'critical care', 'आयसीयू'],
      pmo:         ['open pmo', 'project management', 'deployment project'],
      integration: ['open integration', 'interoperability', 'fhir api', 'integration hub'],
      devops:      ['open devops', 'observability', 'deployment check'],
      quality:     ['open quality', 'quality engineering', 'qa dashboard'],
      vision:      ['open vision', 'vision 2035', 'roadmap'],
    };
    for (const [key, terms] of Object.entries(portals)) {
      if (terms.some(t => raw.includes(t) || normalized.includes(t))) {
        VoiceNavigation.navigateToPortal(key);
        VoiceActionDispatcher.speak(`Opening ${key} portal.`);
        return { success: true, message: `Opening ${key} portal.`, intent: `PORTAL_${key.toUpperCase()}` };
      }
    }

    // ── DOCTOR COMMANDS ────────────────────────────────────────────────────
    if (portal === 'doctor') {
      // Tab navigation
      const docTabs: Record<string, string[]> = {
        dashboard:    ['go to dashboard', 'open dashboard', 'home tab', 'main screen'],
        twin:         ['digital twin', 'ecg tab', 'ecg telemetry', 'ईसीजी'],
        queue:        ['queue', 'appointments', 'opd queue', 'waiting list', "today's appointments", 'today appointments', 'open queue', 'रांग'],
        patients:     ['patient directory', 'patient list', 'all patients', 'रुग्ण सूची'],
        consultation: ['consultation', 'consult tab', 'prescription pad', 'workspace', 'सल्ला'],
        labs:         ['lab tab', 'lab orders', 'pathology tab'],
        reports:      ['reports', 'radiology tab', 'imaging results', 'report tab'],
        messages:     ['messages', 'nurse chat', 'chat tab', 'send message', 'चर्चा'],
        settings:     ['portal settings', 'settings tab', 'preferences', 'सेटअप'],
        timeline:     ['timeline', 'duty roster', 'schedule', 'वेळापत्रक'],
      };
      for (const [tab, terms] of Object.entries(docTabs)) {
        if (terms.some(t => raw.includes(t))) {
          VoiceNavigation.navigateToTab(tab);
          VoiceActionDispatcher.speak(`Navigating to ${tab}.`);
          return { success: true, message: `Navigated to ${tab}.`, intent: `TAB_${tab.toUpperCase()}` };
        }
      }

      // Next patient
      if (normalized === 'next patient' || raw.includes('next patient') || raw.includes('call next') || raw === 'next' || raw.includes('पुढचा रुग्ण') || raw.includes('अगला मरीज')) {
        VoiceActionDispatcher.dispatch('mcgm-doctor-call-next');
        VoiceActionDispatcher.speak('Calling next waiting patient.');
        return { success: true, message: 'Calling next waiting patient.', intent: 'CALL_NEXT' };
      }

      // Skip patient
      if (normalized === 'skip patient' || raw.includes('skip patient') || raw === 'skip' || raw.includes('defer patient') || raw.includes('वगळा')) {
        VoiceActionDispatcher.dispatch('mcgm-doctor-skip-patient');
        VoiceActionDispatcher.speak('Patient deferred to end of queue.');
        return { success: true, message: 'Patient deferred.', intent: 'SKIP_PATIENT' };
      }

      // Patients tab fallback (if they just say "patient")
      if (normalized === 'patients' || raw.includes('patients') || raw.includes('patient list') || raw.includes('patient directory')) {
        VoiceNavigation.navigateToTab('patients');
        VoiceActionDispatcher.speak('Opening patients directory.');
        return { success: true, message: 'Opened patients directory.', intent: 'TAB_PATIENTS' };
      }

      // Lab test ordering
      if (raw.includes('order lab') || raw.includes('blood test') || raw.includes('cbc') || raw.includes('lft') || raw.includes('rft') || raw.includes('uric') || raw.includes('lipid') || raw.includes('thyroid') || raw.includes('hba1c')) {
        const tests: string[] = [];
        if (raw.includes('cbc'))    tests.push('CBC (Complete Blood Count)');
        if (raw.includes('lft'))    tests.push('LFT (Liver Function Test)');
        if (raw.includes('rft'))    tests.push('RFT (Renal Function Test)');
        if (raw.includes('uric'))   tests.push('Serum Uric Acid');
        if (raw.includes('lipid'))  tests.push('Lipid Profile');
        if (raw.includes('thyroid') || raw.includes('tsh')) tests.push('TSH (Thyroid)');
        if (raw.includes('hba1c')) tests.push('HbA1c');
        if (raw.includes('rheumatoid') || raw.includes('rf')) tests.push('Rheumatoid Factor');

        if (tests.length > 0) {
          VoiceActionDispatcher.dispatch('mcgm-doctor-open-labs', { tests });
          const msg = `Lab order drafted for ${tests.join(', ')}. Say confirm to submit.`;
          VoiceMemory.setPendingConfirmation(() => VoiceActionDispatcher.dispatch('mcgm-doctor-submit-lab-direct'), 'Lab Submit');
          VoiceActionDispatcher.speak(msg);
          return { success: true, message: msg, intent: 'ORDER_LAB_DRAFT' };
        }
        VoiceActionDispatcher.dispatch('mcgm-doctor-open-labs');
        VoiceActionDispatcher.speak('Opening lab order panel.');
        return { success: true, message: 'Opening lab panel.', intent: 'OPEN_LAB_MODAL' };
      }

      // Radiology
      if (normalized === 'radiology' || raw.includes('radiology') || raw.includes('x-ray') || raw.includes('xray') || raw.includes('mri') || raw.includes('ct scan') || raw.includes('ultrasound')) {
        VoiceActionDispatcher.dispatch('mcgm-doctor-open-radiology');
        VoiceActionDispatcher.speak('Opening radiology imaging panel.');
        return { success: true, message: 'Opening radiology.', intent: 'OPEN_RADIOLOGY' };
      }

      // Refer
      if (raw.includes('refer') || raw.includes('referral') || raw.includes('रेफर')) {
        VoiceActionDispatcher.dispatch('mcgm-doctor-refer');
        VoiceActionDispatcher.speak('Opening patient referral panel.');
        return { success: true, message: 'Opening referral.', intent: 'OPEN_REFER' };
      }

      // Prescribe medication
      if (raw.includes('prescribe') || raw.includes('add medication') || raw.includes('add med') || raw.includes('औषध लिहा') || raw.includes('दवा जोड़ें')) {
        let drugName = 'Tab. Paracetamol 650mg';
        let dose = '1-0-1', timing = 'After Food', duration = '5 Days';

        if (raw.includes('paracetamol') || raw.includes('crocin')) drugName = 'Tab. Paracetamol 650mg';
        else if (raw.includes('pantoprazole') || raw.includes('pan d')) drugName = 'Tab. Pantoprazole 40mg';
        else if (raw.includes('amoxicillin') || raw.includes('antibiotic')) drugName = 'Cap. Amoxicillin 500mg';
        else if (raw.includes('aceclofenac') || raw.includes('zerodol')) drugName = 'Tab. Aceclofenac 100mg';
        else if (raw.includes('aspirin')) drugName = 'Tab. Aspirin 75mg';
        else if (raw.includes('metformin')) drugName = 'Tab. Metformin 500mg';
        else if (raw.includes('multivitamin') || raw.includes('becosules')) drugName = 'Cap. Multivitamin';
        else if (raw.includes('tramadol')) drugName = 'Tab. Tramadol 50mg SOS';
        else if (raw.includes('ibuprofen')) drugName = 'Tab. Ibuprofen 400mg';

        if (raw.includes('once')) dose = '1-0-0';
        else if (raw.includes('thrice') || raw.includes('three times')) dose = '1-1-1';
        if (raw.includes('before food') || raw.includes('empty stomach')) timing = 'Before Food';
        const dm = raw.match(/(\d+)\s*days?/i);
        if (dm) duration = `${dm[1]} Days`;

        VoiceFormController.prescribeMedication(drugName, dose, timing, duration);
        const msg = `Added ${drugName}. Dose: ${dose}, ${duration}.`;
        VoiceActionDispatcher.speak(msg);
        return { success: true, message: msg, intent: 'PRESCRIBE_MED' };
      }

      // Clear prescription
      if (raw.includes('clear prescription') || raw.includes('clear meds') || raw.includes('reset prescription')) {
        VoiceFormController.clearPrescriptions();
        VoiceActionDispatcher.speak('Prescription pad cleared.');
        return { success: true, message: 'Prescription cleared.', intent: 'CLEAR_PRESCRIPTION' };
      }

      // Sign prescription
      if (normalized === 'sign prescription' || raw.includes('sign prescription') || raw.includes('digital sign') || raw.includes('approve prescription') || raw.includes('सही करा')) {
        VoiceActionDispatcher.dispatch('mcgm-doctor-sign-prescription');
        VoiceActionDispatcher.speak('Opening digital signature panel.');
        return { success: true, message: 'Opening signature panel.', intent: 'OPEN_SIGN_MODAL' };
      }

      // Generate SOAP
      if (raw.includes('generate soap') || raw.includes('generate notes') || raw.includes('create soap') || raw.includes('compile notes')) {
        VoiceActionDispatcher.dispatch('mcgm-doctor-generate-soap');
        VoiceActionDispatcher.speak('SOAP notes compiled and ready.');
        return { success: true, message: 'SOAP notes generated.', intent: 'GENERATE_SOAP' };
      }

      // Certificate
      if (raw.includes('certificate') || raw.includes('medical cert') || raw.includes('प्रमाणपत्र')) {
        VoiceActionDispatcher.dispatch('mcgm-doctor-issue-cert');
        VoiceActionDispatcher.speak('Opening medical certificate panel.');
        return { success: true, message: 'Certificate panel opened.', intent: 'ISSUE_CERT' };
      }

      // Search patient
      if (raw.includes('search patient') || raw.includes('find patient') || raw.includes('look up')) {
        const q = raw.replace(/search patient|find patient|look up|search/g, '').trim();
        if (q) {
          VoiceSearch.searchPatient(q);
          VoiceNavigation.navigateToTab('patients');
          VoiceActionDispatcher.speak(`Searching for ${q}.`);
          return { success: true, message: `Searching: ${q}.`, intent: 'SEARCH_PATIENT' };
        }
      }

      // DICOM controls
      if (raw.includes('zoom') || raw.includes('contrast') || raw.includes('brightness') || raw.includes('invert')) {
        let param = 'zoom';
        let value = 100;
        const numMatch = raw.match(/(\d+)/);
        if (numMatch) value = parseInt(numMatch[1]);
        if (raw.includes('contrast'))   param = 'contrast';
        else if (raw.includes('brightness')) param = 'brightness';
        VoiceActionDispatcher.dispatch('mcgm-doctor-dicom-control', { param, value });
        VoiceActionDispatcher.speak(`Radiograph ${param} set to ${value} percent.`);
        return { success: true, message: `DICOM ${param}: ${value}%.`, intent: 'DICOM_CONTROL' };
      }

      // Call nurse
      if (raw.includes('call nurse') || raw.includes('message nurse') || raw.includes('contact nurse')) {
        VoiceNavigation.navigateToTab('messages');
        VoiceActionDispatcher.speak('Opening nurse communication channel.');
        return { success: true, message: 'Opening nurse chat.', intent: 'CALL_NURSE' };
      }

      // Show ECG
      if (raw.includes('show ecg') || raw.includes('ecg report') || raw.includes('previous ecg')) {
        VoiceNavigation.navigateToTab('twin');
        VoiceActionDispatcher.speak('Opening digital twin with ECG telemetry.');
        return { success: true, message: 'Opening ECG twin.', intent: 'SHOW_ECG' };
      }
    }

    // ── NURSE COMMANDS ─────────────────────────────────────────────────────
    if (portal === 'nurse') {
      const nurseTabs: Record<string, string[]> = {
        ward:      ['ward', 'ward beds', 'patient ward', 'खाटा'],
        vitals:    ['vitals', 'vital signs', 'record vitals', 'व्हाइटल्स'],
        tasks:     ['tasks', 'nursing tasks', 'task list', 'कार्ये'],
        meds:      ['medication', 'meds tab', 'administer meds', 'औषधे'],
        handover:  ['handover', 'shift handover', 'shift report', 'हस्तांतरण'],
        messages:  ['messages', 'nurse messages', 'communicate'],
        inventory: ['inventory', 'stock', 'supplies'],
      };
      for (const [tab, terms] of Object.entries(nurseTabs)) {
        if (terms.some(t => raw.includes(t))) {
          VoiceNavigation.navigateToTab(tab);
          VoiceActionDispatcher.speak(`Opening ${tab}.`);
          return { success: true, message: `Opened ${tab}.`, intent: `NURSE_TAB_${tab.toUpperCase()}` };
        }
      }

      // Record vitals
      const bpM   = raw.match(/bp\s+(\d+)\/(\d+)/i) || raw.match(/blood pressure\s+(\d+)\s+over\s+(\d+)/i);
      const pulseM = raw.match(/pulse\s+(\d+)/i) || raw.match(/heart rate\s+(\d+)/i);
      const tempM  = raw.match(/temp(?:erature)?\s+(\d+\.?\d*)/i);
      const spo2M  = raw.match(/spo2\s+(\d+)/i) || raw.match(/oxygen\s+(\d+)/i);
      const respM  = raw.match(/resp(?:iration)?\s+(\d+)/i);

      if (bpM || pulseM || tempM || spo2M || respM) {
        const bp    = bpM    ? `${bpM[1]}/${bpM[2]}` : undefined;
        const pulse = pulseM ? pulseM[1] : undefined;
        const temp  = tempM  ? tempM[1]  : undefined;
        const spo2  = spo2M  ? spo2M[1]  : undefined;
        const resp  = respM  ? respM[1]  : undefined;
        VoiceFormController.fillVitals(bp, pulse, temp, spo2, resp);
        const msg = `Vitals — BP: ${bp||'—'}, Pulse: ${pulse||'—'}, Temp: ${temp||'—'}°F, SpO2: ${spo2||'—'}%. Say "save vitals" to confirm.`;
        VoiceMemory.setPendingConfirmation(() => VoiceFormController.saveVitals(), 'Save Vitals');
        VoiceActionDispatcher.speak(msg);
        return { success: true, message: msg, intent: 'RECORD_VITALS_DRAFT' };
      }

      if (raw.includes('save vitals') || raw.includes('confirm vitals') || raw.includes('submit vitals')) {
        VoiceFormController.saveVitals();
        VoiceActionDispatcher.speak('Vitals synced to electronic health records.');
        return { success: true, message: 'Vitals saved.', intent: 'SAVE_VITALS' };
      }

      if (raw.includes('medication given') || raw.includes('confirm medication') || raw.includes('verify med') || raw.includes('administer')) {
        VoiceActionDispatcher.dispatch('mcgm-nurse-verify-med');
        VoiceActionDispatcher.speak('Running five-rights medication verification.');
        return { success: true, message: 'Medication verification triggered.', intent: 'VERIFY_MED' };
      }

      if (raw.includes('transfer to icu') || raw.includes('icu transfer') || raw.includes('shift to icu')) {
        VoiceActionDispatcher.dispatch('mcgm-nurse-shift-icu');
        VoiceActionDispatcher.speak('ICU transfer order dispatched. Team alerted.');
        return { success: true, message: 'ICU transfer dispatched.', intent: 'TRANSFER_ICU' };
      }

      if (raw.includes('generate handover') || raw.includes('handover report') || raw.includes('shift handover')) {
        VoiceActionDispatcher.dispatch('mcgm-nurse-generate-handover');
        VoiceActionDispatcher.speak('Shift handover log generated.');
        return { success: true, message: 'Handover generated.', intent: 'GENERATE_HANDOVER' };
      }

      if (raw.includes('code blue') || raw.includes('sos') || raw.includes('cardiac arrest') || raw.includes('call doctor emergency')) {
        VoiceActionDispatcher.dispatch('mcgm-nurse-emergency-alert');
        VoiceActionDispatcher.speak('Emergency alert triggered! Rapid response team notified!');
        return { success: true, message: 'Code Blue activated!', intent: 'EMERGENCY_ALERT' };
      }
    }

    // ── PATIENT PORTAL COMMANDS ─────────────────────────────────────────────
    if (portal === 'patient') {
      // Tab navigation
      const patientTabs: Record<string, string[]> = {
        home:    ['go to home', 'open home', 'home screen', 'main page', 'घर'],
        records: ['go to records', 'medical records', 'my records', 'reports', 'view records', 'रुग्ण रेकॉर्ड', 'फाइल'],
        wallet:  ['go to wallet', 'my wallet', 'check balance', 'wallet balance', 'पाकीट'],
        sos:     ['go to emergency', 'sos tab', 'emergency call', 'आपत्कालीन'],
        profile: ['go to profile', 'my profile', 'settings', 'माहिती'],
      };
      for (const [tab, terms] of Object.entries(patientTabs)) {
        if (terms.some(t => raw.includes(t))) {
          VoiceNavigation.navigateToTab(tab);
          VoiceActionDispatcher.speak(`Opening ${tab} section.`);
          return { success: true, message: `Opened ${tab} section.`, intent: `PATIENT_TAB_${tab.toUpperCase()}` };
        }
      }

      // Book appointment
      if (raw.includes('book appointment') || raw.includes('book opd') || raw.includes('new booking') || raw.includes('अपॉइंटमेंट बुक करा') || raw.includes('बुकिंग')) {
        VoiceActionDispatcher.dispatch('mcgm-patient-book-opd');
        VoiceActionDispatcher.speak('Opening OPD Booking Flow.');
        return { success: true, message: 'Opening OPD Booking Flow.', intent: 'PATIENT_BOOK_OPD' };
      }

      // Teleconsultation
      if (raw.includes('start consult') || raw.includes('video consult') || raw.includes('call doctor') || raw.includes('डॉक्टर कॉल') || raw.includes('सल्ला सुरू करा')) {
        VoiceActionDispatcher.dispatch('mcgm-patient-teleconsult');
        VoiceActionDispatcher.speak('Initiating secure tele-consultation video feed.');
        return { success: true, message: 'Initiating teleconsultation.', intent: 'PATIENT_TELECONSULT' };
      }

      // View ABHA Card
      if (raw.includes('view abha') || raw.includes('show abha') || raw.includes('abha card') || raw.includes('digital health card') || raw.includes('आभा कार्ड')) {
        VoiceActionDispatcher.dispatch('mcgm-patient-view-abha');
        VoiceActionDispatcher.speak('Displaying your digital ABHA identity card.');
        return { success: true, message: 'Displaying ABHA Card.', intent: 'PATIENT_VIEW_ABHA' };
      }

      // Change language
      if (raw.includes('select english') || raw.includes('choose english') || raw.includes('english language')) {
        VoiceActionDispatcher.dispatch('mcgm-change-language', 'en');
        VoiceActionDispatcher.speak('Language set to English.');
        return { success: true, message: 'Language set to English.', intent: 'PATIENT_LANG_EN' };
      }
      if (raw.includes('select hindi') || raw.includes('choose hindi') || raw.includes('hindi language') || raw.includes('हिंदी')) {
        VoiceActionDispatcher.dispatch('mcgm-change-language', 'hi');
        VoiceActionDispatcher.speak('भाषा हिंदी में सेट की गई है।');
        return { success: true, message: 'Language set to Hindi.', intent: 'PATIENT_LANG_HI' };
      }
      if (raw.includes('select marathi') || raw.includes('choose marathi') || raw.includes('marathi language') || raw.includes('मराठी')) {
        VoiceActionDispatcher.dispatch('mcgm-change-language', 'mr');
        VoiceActionDispatcher.speak('भाषा मराठीमध्ये सेट केली आहे.');
        return { success: true, message: 'Language set to Marathi.', intent: 'PATIENT_LANG_MR' };
      }
    }

    // Fallback
    return { success: false, message: `Command not recognized: "${speechText}". Say "help" for commands.` };
  }
}
