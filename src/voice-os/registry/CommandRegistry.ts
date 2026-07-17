/**
 * MCGM Arogya Voice AI — Global Command Registry
 * Every page/portal registers its available voice commands here.
 * The Voice Command Agent looks up this registry FIRST before any LLM call.
 */

import type { RegisteredCommand, PageCommands } from '../agents/types';

class CommandRegistryClass {
  private commands: Map<string, RegisteredCommand> = new Map();
  private pageIndex: Map<string, Set<string>> = new Map(); // page → command IDs

  /** Register a single command */
  register(command: RegisteredCommand): void {
    this.commands.set(command.id, command);
    if (!this.pageIndex.has(command.page)) {
      this.pageIndex.set(command.page, new Set());
    }
    this.pageIndex.get(command.page)!.add(command.id);
  }

  /** Bulk register commands for a page */
  registerPage(pageCommands: PageCommands): void {
    for (const cmd of pageCommands.commands) {
      this.register({ ...cmd, page: pageCommands.page });
    }
  }

  /** Get all commands for a specific portal */
  getCommandsForPortal(portal: string): RegisteredCommand[] {
    const result: RegisteredCommand[] = [];
    this.commands.forEach(cmd => {
      if (cmd.page === portal || cmd.page === 'global') {
        result.push(cmd);
      }
    });
    return result;
  }

  /** Get all registered commands */
  getAll(): RegisteredCommand[] {
    return Array.from(this.commands.values());
  }

  /** Find command by ID */
  findById(id: string): RegisteredCommand | undefined {
    return this.commands.get(id);
  }

  /** Clear all commands (useful for hot-reload) */
  clear(): void {
    this.commands.clear();
    this.pageIndex.clear();
  }

  /** Get count of registered commands */
  get size(): number {
    return this.commands.size;
  }
}

// Singleton instance
export const CommandRegistry = new CommandRegistryClass();

// ── GLOBAL COMMANDS (always available) ──────────────────────────────────────
function dispatchEvent(name: string, detail?: any) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

CommandRegistry.registerPage({
  page: 'global',
  portal: 'global',
  commands: [
    // Theme
    {
      id: 'global-toggle-theme',
      page: 'global',
      category: 'system',
      triggers: ['dark mode', 'night mode', 'light mode', 'toggle theme'],
      description: 'Toggle dark/light theme',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-toggle-dark-mode'),
      speakResponse: 'Theme toggled.',
    },
    // Emergency Quick Registration Voice Commands
    {
      id: 'emergency-open-registration',
      page: 'global',
      category: 'action',
      triggers: ['open registration', 'register emergency patient', 'start registration'],
      description: 'Open emergency registration desk',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-portal-change', { detail: 'emergency' }));
        window.dispatchEvent(new CustomEvent('mcgm-emergency-section-change', { detail: 'registration' }));
      },
      speakResponse: 'Opening quick emergency registration desk.',
    },
    {
      id: 'emergency-unknown-male',
      page: 'global',
      category: 'action',
      triggers: ['unknown male'],
      description: 'Set registration profile to unknown male',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-registration-voice-command', { detail: { action: 'UNKNOWN_MALE' } }));
      },
      speakResponse: 'Profile set to unknown male.',
    },
    {
      id: 'emergency-road-accident',
      page: 'global',
      category: 'action',
      triggers: ['road traffic accident', 'accident case', 'accident'],
      description: 'Set incident type to road traffic accident',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-registration-voice-command', { detail: { action: 'ROAD_ACCIDENT' } }));
      },
      speakResponse: 'Chief complaint set to road traffic accident.',
    },
    {
      id: 'emergency-private-vehicle',
      page: 'global',
      category: 'action',
      triggers: ['private vehicle', 'car arrival'],
      description: 'Set arrival mode to private vehicle',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-registration-voice-command', { detail: { action: 'PRIVATE_VEHICLE' } }));
      },
      speakResponse: 'Arrival mode set to private vehicle.',
    },
    {
      id: 'emergency-generate-uhid',
      page: 'global',
      category: 'action',
      triggers: ['generate uhid', 'create temp uhid'],
      description: 'Generate temporary UHID',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-registration-voice-command', { detail: { action: 'GENERATE_UHID' } }));
      },
      speakResponse: 'Generating temporary health identifier.',
    },
    {
      id: 'emergency-print-wristband',
      page: 'global',
      category: 'action',
      triggers: ['print wristband', 'wristband print'],
      description: 'Print patient wristband',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-registration-voice-command', { detail: { action: 'PRINT_WRISTBAND' } }));
      },
      speakResponse: 'Dispatching barcode wristband to emergency desk printer.',
    },
    {
      id: 'emergency-complete-registration',
      page: 'global',
      category: 'action',
      triggers: ['complete registration', 'submit intake', 'save intake'],
      description: 'Complete emergency registration',
      confirmRequired: true,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-registration-voice-command', { detail: { action: 'COMPLETE_REGISTRATION' } }));
      },
      speakResponse: 'Saving patient record. Treatment authorized immediately.',
    },
    // Logout
    {
      id: 'global-logout',
      page: 'global',
      category: 'system',
      triggers: ['logout', 'log out', 'sign out', 'end session'],
      description: 'End session and log out',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-logout'),
      speakResponse: 'Logging out. Session ended securely.',
    },
    // System status
    {
      id: 'global-status',
      page: 'global',
      category: 'system',
      triggers: ['system status', 'arogya status', 'show status'],
      description: 'Show system status',
      confirmRequired: false,
      execute: () => {},
      speakResponse: 'Arogya Clinical OS online. All systems operational. Voice OS active. ABHA integration live.',
    },
    // Portal navigation
    ...(['doctor', 'nurse', 'patient', 'command', 'ai', 'laboratory', 'radiology', 'pharmacy', 'emergency', 'surgery', 'icu', 'pmo', 'integration', 'devops', 'quality', 'vision'] as const).map(p => ({
      id: `global-portal-${p}`,
      page: 'global',
      category: 'navigation',
      triggers: [`open ${p}`, `${p} portal`, `switch to ${p}`, `${p} dashboard`],
      synonyms: p === 'laboratory' ? ['open lab', 'pathology portal'] : p === 'emergency' ? ['casualty', 'emergency department'] : p === 'icu' ? ['intensive care', 'critical care'] : p === 'radiology' ? ['imaging portal', 'ris pacs'] : [],
      description: `Open ${p} portal`,
      confirmRequired: false,
      execute: () => {
        dispatchEvent('mcgm-portal-change', { detail: p } as any);
        // Also dispatch directly for backward compat
        window.dispatchEvent(new CustomEvent('mcgm-portal-change', { detail: p }));
      },
      speakResponse: `Opening ${p} portal.`,
    })),
  ],
});

// ── APPOINTMENTS / QUEUE (global scope) ─────────────────────────────────────
CommandRegistry.registerPage({
  page: 'global',
  portal: 'global',
  commands: [
    {
      id: 'global-appointments',
      page: 'global',
      category: 'navigation',
      triggers: ["today's appointments", 'appointments', 'queue', 'opd queue', 'waiting list', 'today appointments'],
      description: 'Open appointments queue',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-doctor-tab-change', { detail: 'queue' }));
      },
      speakResponse: 'Opening appointments queue.',
    },
  ],
});

// ── DOCTOR COMMANDS ─────────────────────────────────────────────────────────
CommandRegistry.registerPage({
  page: 'doctor',
  portal: 'doctor',
  commands: [
    // Tab navigation
    ...([
      { tab: 'dashboard', triggers: ['go to dashboard', 'open dashboard', 'home tab', 'main screen'] },
      { tab: 'twin', triggers: ['digital twin', 'ecg tab', 'ecg telemetry'] },
      { tab: 'queue', triggers: ['queue', 'appointments', 'opd queue', "today's appointments"] },
      { tab: 'patients', triggers: ['patient directory', 'patient list', 'all patients'] },
      { tab: 'consultation', triggers: ['consultation', 'consult tab', 'prescription pad', 'workspace'] },
      { tab: 'labs', triggers: ['lab tab', 'lab orders', 'pathology tab'] },
      { tab: 'reports', triggers: ['reports', 'radiology tab', 'imaging results'] },
      { tab: 'messages', triggers: ['messages', 'nurse chat', 'chat tab', 'send message'] },
      { tab: 'settings', triggers: ['portal settings', 'settings tab', 'preferences'] },
      { tab: 'timeline', triggers: ['timeline', 'duty roster', 'schedule'] },
    ] as const).map(t => ({
      id: `doctor-tab-${t.tab}`,
      page: 'doctor',
      category: 'navigation',
      triggers: [...t.triggers],
      description: `Navigate to ${t.tab}`,
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-doctor-tab-change', { detail: t.tab }));
      },
      speakResponse: `Navigating to ${t.tab}.`,
    })),
    // Clinical actions
    {
      id: 'doctor-next-patient',
      page: 'doctor',
      category: 'action',
      triggers: ['next patient', 'call next', 'next'],
      description: 'Call next waiting patient',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-call-next'),
      speakResponse: 'Calling next waiting patient.',
    },
    {
      id: 'doctor-skip-patient',
      page: 'doctor',
      category: 'action',
      triggers: ['skip patient', 'skip', 'defer patient'],
      description: 'Defer patient to end of queue',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-skip-patient'),
      speakResponse: 'Patient deferred to end of queue.',
    },
    {
      id: 'doctor-sign-prescription',
      page: 'doctor',
      category: 'action',
      triggers: ['sign prescription', 'digital sign', 'approve prescription'],
      description: 'Open digital signature panel',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-sign-prescription'),
      speakResponse: 'Opening digital signature panel.',
    },
    {
      id: 'doctor-open-radiology',
      page: 'doctor',
      category: 'action',
      triggers: ['radiology', 'x-ray', 'xray', 'mri', 'ct scan', 'ultrasound'],
      description: 'Open radiology imaging panel',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-open-radiology'),
      speakResponse: 'Opening radiology imaging panel.',
    },
    {
      id: 'doctor-refer',
      page: 'doctor',
      category: 'action',
      triggers: ['refer', 'referral'],
      description: 'Open patient referral panel',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-refer'),
      speakResponse: 'Opening patient referral panel.',
    },
    {
      id: 'doctor-clear-prescription',
      page: 'doctor',
      category: 'action',
      triggers: ['clear prescription', 'clear meds', 'reset prescription'],
      description: 'Clear prescription pad',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-doctor-clear-prescriptions'),
      speakResponse: 'Prescription pad cleared.',
    },
    {
      id: 'doctor-show-ecg',
      page: 'doctor',
      category: 'action',
      triggers: ['show ecg', 'ecg report', 'previous ecg'],
      description: 'Open ECG telemetry',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-doctor-tab-change', { detail: 'twin' })),
      speakResponse: 'Opening digital twin with ECG telemetry.',
    },
    {
      id: 'doctor-call-nurse',
      page: 'doctor',
      category: 'action',
      triggers: ['call nurse', 'message nurse', 'contact nurse', 'page nurse'],
      description: 'Open nurse communication',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-doctor-tab-change', { detail: 'messages' })),
      speakResponse: 'Opening nurse communication channel.',
    },
    // Scribe
    {
      id: 'doctor-start-scribe',
      page: 'doctor',
      category: 'action',
      triggers: ['start scribe', 'begin scribe', 'start ambient', 'start recording', 'start consultation recording'],
      description: 'Start ambient clinical scribe',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-toggle-scribe', { active: true }),
      speakResponse: 'Ambient scribing started. Recording consultation.',
    },
    {
      id: 'doctor-stop-scribe',
      page: 'doctor',
      category: 'action',
      triggers: ['stop scribe', 'end scribe', 'stop ambient', 'stop recording', 'pause scribe'],
      description: 'Stop ambient clinical scribe',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-toggle-scribe', { active: false }),
      speakResponse: 'Scribing stopped. SOAP notes drafted.',
    },
    // SOAP & Documentation
    {
      id: 'doctor-generate-soap',
      page: 'doctor',
      category: 'action',
      triggers: ['generate soap', 'create soap', 'compile notes', 'soap note', 'clinical notes'],
      description: 'Generate SOAP notes from scribe',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-generate-soap'),
      speakResponse: 'SOAP notes compiled and ready for review.',
    },
    {
      id: 'doctor-discharge-summary',
      page: 'doctor',
      category: 'action',
      triggers: ['discharge summary', 'generate discharge', 'open discharge', 'discharge report'],
      description: 'Open discharge summary',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-open-discharge'),
      speakResponse: 'Opening discharge summary panel.',
    },
    {
      id: 'doctor-medical-certificate',
      page: 'doctor',
      category: 'action',
      triggers: ['medical certificate', 'issue certificate', 'fitness certificate', 'medical cert'],
      description: 'Issue medical certificate',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-issue-cert'),
      speakResponse: 'Opening medical certificate panel.',
    },
    {
      id: 'doctor-referral-letter',
      page: 'doctor',
      category: 'action',
      triggers: ['referral letter', 'write referral', 'refer patient', 'create referral'],
      description: 'Write referral letter',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-refer'),
      speakResponse: 'Opening referral letter template.',
    },
    {
      id: 'doctor-generate-handover',
      page: 'doctor',
      category: 'action',
      triggers: ['generate handover', 'handover report', 'shift handover', 'create handover'],
      description: 'Generate shift handover report',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-nurse-generate-handover'),
      speakResponse: 'Shift handover log generated.',
    },
  ],
});

// ── NURSE COMMANDS ──────────────────────────────────────────────────────────
CommandRegistry.registerPage({
  page: 'nurse',
  portal: 'nurse',
  commands: [
    ...([
      { tab: 'ward', triggers: ['ward', 'ward beds', 'patient ward', 'ward overview', 'bed status'] },
      { tab: 'vitals', triggers: ['vitals', 'vital signs', 'record vitals', 'take vitals', 'check vitals'] },
      { tab: 'tasks', triggers: ['tasks', 'nursing tasks', 'task list', 'my tasks', 'pending tasks'] },
      { tab: 'meds', triggers: ['medication', 'meds tab', 'administer meds', 'medication round', 'drug chart'] },
      { tab: 'handover', triggers: ['handover', 'shift handover', 'shift report', 'end shift'] },
      { tab: 'messages', triggers: ['messages', 'nurse messages', 'doctor messages', 'chat'] },
      { tab: 'inventory', triggers: ['inventory', 'stock', 'supplies', 'consumables', 'reorder'] },
    ] as const).map(t => ({
      id: `nurse-tab-${t.tab}`,
      page: 'nurse',
      category: 'navigation',
      triggers: [...t.triggers],
      description: `Open ${t.tab}`,
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-nurse-tab-change', { detail: t.tab })),
      speakResponse: `Opening ${t.tab}.`,
    })),
    {
      id: 'nurse-save-vitals',
      page: 'nurse',
      category: 'action',
      triggers: ['save vitals', 'confirm vitals', 'submit vitals', 'vitals done'],
      description: 'Save patient vitals',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-nurse-save-vitals'),
      speakResponse: 'Vitals synced to electronic health records.',
    },
    {
      id: 'nurse-verify-med',
      page: 'nurse',
      category: 'action',
      triggers: ['medication given', 'confirm medication', 'verify med', 'administer', 'med administered', 'drug given'],
      description: 'Verify medication administration',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-nurse-verify-med'),
      speakResponse: 'Running five-rights medication verification.',
    },
    {
      id: 'nurse-transfer-icu',
      page: 'nurse',
      category: 'action',
      triggers: ['transfer to icu', 'icu transfer', 'shift to icu', 'move to icu', 'critical transfer'],
      description: 'Transfer patient to ICU',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-nurse-shift-icu'),
      speakResponse: 'ICU transfer order dispatched. Team alerted.',
    },
    {
      id: 'nurse-emergency',
      page: 'nurse',
      category: 'action',
      triggers: ['code blue', 'sos', 'cardiac arrest', 'call doctor emergency', 'rapid response', 'emergency alert', 'code red'],
      description: 'Emergency alert',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-nurse-emergency-alert'),
      speakResponse: 'Emergency alert triggered! Rapid response team notified!',
    },
    {
      id: 'nurse-wound-care',
      page: 'nurse',
      category: 'action',
      triggers: ['wound care', 'dressing change', 'change dressing', 'wound assessment'],
      description: 'Log wound care / dressing change',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-nurse-wound-care'),
      speakResponse: 'Wound care documented.',
    },
    {
      id: 'nurse-start-scribe',
      page: 'nurse',
      category: 'action',
      triggers: ['start scribe', 'begin recording', 'start ambient'],
      description: 'Start ambient scribe for nursing notes',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-toggle-scribe', { active: true }),
      speakResponse: 'Ambient scribing started for nursing notes.',
    },
    {
      id: 'nurse-stop-scribe',
      page: 'nurse',
      category: 'action',
      triggers: ['stop scribe', 'end recording', 'stop ambient'],
      description: 'Stop ambient scribe',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-toggle-scribe', { active: false }),
      speakResponse: 'Scribing stopped. Notes saved.',
    },
  ],
});

// ── PATIENT COMMANDS ────────────────────────────────────────────────────────
CommandRegistry.registerPage({
  page: 'patient',
  portal: 'patient',
  commands: [
    ...([
      { tab: 'home', triggers: ['go to home', 'open home', 'home screen', 'main page'] },
      { tab: 'records', triggers: ['go to records', 'medical records', 'my records', 'view records', 'health records'] },
      { tab: 'wallet', triggers: ['go to wallet', 'my wallet', 'check balance', 'payment history', 'billing'] },
      { tab: 'sos', triggers: ['go to emergency', 'sos tab', 'emergency call', 'call ambulance', 'panic'] },
      { tab: 'profile', triggers: ['go to profile', 'my profile', 'settings', 'account settings', 'edit profile'] },
    ] as const).map(t => ({
      id: `patient-tab-${t.tab}`,
      page: 'patient',
      category: 'navigation',
      triggers: [...t.triggers],
      description: `Open ${t.tab} section`,
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-patient-tab-change', { detail: t.tab })),
      speakResponse: `Opening ${t.tab} section.`,
    })),
    {
      id: 'patient-book-opd',
      page: 'patient',
      category: 'action',
      triggers: ['book appointment', 'book opd', 'new booking', 'schedule appointment', 'book doctor'],
      description: 'Book an OPD appointment',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-patient-book-opd'),
      speakResponse: 'Opening OPD Booking Flow.',
    },
    {
      id: 'patient-teleconsult',
      page: 'patient',
      category: 'action',
      triggers: ['start consult', 'video consult', 'call doctor', 'teleconsult', 'online consultation'],
      description: 'Start teleconsultation',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-patient-teleconsult'),
      speakResponse: 'Initiating secure tele-consultation video feed.',
    },
    {
      id: 'patient-view-abha',
      page: 'patient',
      category: 'action',
      triggers: ['view abha', 'show abha', 'abha card', 'digital health card', 'health id'],
      description: 'View ABHA card',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-patient-view-abha'),
      speakResponse: 'Displaying your digital ABHA identity card.',
    },
    {
      id: 'patient-download-records',
      page: 'patient',
      category: 'action',
      triggers: ['download records', 'export records', 'download report', 'save records'],
      description: 'Download medical records',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-patient-download-records'),
      speakResponse: 'Preparing medical records for download.',
    },
    {
      id: 'patient-share-records',
      page: 'patient',
      category: 'action',
      triggers: ['share records', 'send records', 'share with doctor', 'consent share'],
      description: 'Share medical records',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-patient-share-records'),
      speakResponse: 'Opening consent-based record sharing.',
    },
    {
      id: 'patient-cancel-appointment',
      page: 'patient',
      category: 'action',
      triggers: ['cancel appointment', 'cancel booking', 'reschedule'],
      description: 'Cancel or reschedule appointment',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-patient-cancel-appointment'),
      speakResponse: 'Opening appointment cancellation.',
    },
  ],
});

// ── EMERGENCY COMMANDS ──────────────────────────────────────────────────────
CommandRegistry.registerPage({
  page: 'emergency',
  portal: 'emergency',
  commands: [
    ...([
      { tab: 'triage', triggers: ['triage', 'triage board', 'triage queue'] },
      { tab: 'registration', triggers: ['registration', 'patient intake', 'new patient'] },
      { tab: 'resuscitation', triggers: ['resuscitation', 'resus bay', 'critical bay'] },
      { tab: 'monitoring', triggers: ['monitoring', 'patient monitoring', 'live monitors'] },
    ] as const).map(t => ({
      id: `emergency-tab-${t.tab}`,
      page: 'emergency',
      category: 'navigation',
      triggers: [...t.triggers],
      description: `Open ${t.tab}`,
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-emergency-section-change', { detail: t.tab })),
      speakResponse: `Opening ${t.tab}.`,
    })),
    {
      id: 'emergency-code-blue',
      page: 'emergency',
      category: 'action',
      triggers: ['code blue', 'cardiac arrest', 'crash call'],
      description: 'Activate Code Blue',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-nurse-emergency-alert'),
      speakResponse: 'Code Blue activated! Crash team notified!',
    },
    {
      id: 'emergency-start-scribe',
      page: 'emergency',
      category: 'action',
      triggers: ['start scribe', 'start recording', 'begin documentation'],
      description: 'Start emergency scribe',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-toggle-scribe', { active: true }),
      speakResponse: 'Emergency scribing started.',
    },
    {
      id: 'emergency-stop-scribe',
      page: 'emergency',
      category: 'action',
      triggers: ['stop scribe', 'stop recording', 'end documentation'],
      description: 'Stop emergency scribe',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-doctor-toggle-scribe', { active: false }),
      speakResponse: 'Emergency scribing stopped. Notes saved.',
    },
  ],
});

