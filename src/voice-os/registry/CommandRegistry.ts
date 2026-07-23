/**
 * MCGM Arogya Voice AI â€” Global Command Registry
 * Every page/portal registers its available voice commands here.
 * The Voice Command Agent looks up this registry FIRST before any LLM call.
 */

import type { RegisteredCommand, PageCommands } from '../agents/types';

class CommandRegistryClass {
  private commands: Map<string, RegisteredCommand> = new Map();
  private pageIndex: Map<string, Set<string>> = new Map(); // page â†’ command IDs

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

// â”€â”€ GLOBAL COMMANDS (always available) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    ...(['doctor', 'nurse', 'patient', 'command', 'ai', 'laboratory', 'radiology', 'pharmacy', 'emergency', 'surgery', 'icu', 'pmo', 'integration', 'devops', 'quality', 'vision', 'dean'] as const).map(p => ({
      id: `global-portal-${p}`,
      page: 'global',
      category: 'navigation',
      triggers: [`open ${p}`, `${p} portal`, `switch to ${p}`, `${p} dashboard`],
      synonyms: p === 'laboratory' ? ['open lab', 'pathology portal'] : p === 'emergency' ? ['casualty', 'emergency department'] : p === 'icu' ? ['intensive care', 'critical care'] : p === 'radiology' ? ['imaging portal', 'ris pacs'] : p === 'dean' ? ['dean command center', 'dean portal', 'executive portal'] : [],
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

// â”€â”€ APPOINTMENTS / QUEUE (global scope) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ DOCTOR COMMANDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ NURSE COMMANDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ PATIENT COMMANDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ EMERGENCY COMMANDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ DEAN ADMINISTRATIVE COMMANDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CommandRegistry.registerPage({
  page: 'dean',
  portal: 'admin',
  commands: [
    // Executive dashboard access
    ...([
      { tab: 'overview', triggers: ['show overview', 'dashboard', 'main screen'] },
      { tab: 'operations', triggers: ['operations', 'hospital operations', 'live ops'] },
      { tab: 'patient-flow', triggers: ['patient flow', 'arrival queue', 'triage'] },
      { tab: 'emergency', triggers: ['emergency', 'command center', 'critical care'] },
      { tab: 'resources', triggers: ['resources', 'beds', 'capacity'] },
      { tab: 'staff', triggers: ['staff', 'workforce', 'dispatches'] },
      { tab: 'diagnostics', triggers: ['diagnostics', 'labs', 'imaging'] },
      { tab: 'pharmacy', triggers: ['pharmacy', 'blood bank', 'medications'] },
      { tab: 'finance', triggers: ['finance', 'budget', 'revenue'] },
      { tab: 'quality', triggers: ['quality', 'safety', 'metrics'] },
      { tab: 'compliance', triggers: ['compliance', 'regulatory', 'audit'] },
    ] as const).map(t => ({
      id: `dean-tab-${t.tab}`,
      page: 'dean',
      category: 'navigation',
      triggers: [...t.triggers],
      description: `Open ${t.tab} dashboard`,
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: t.tab })),
      speakResponse: `Opening ${t.tab} dashboard.`,
    })),
    // Administrative actions
    {
      id: 'dean-issue-directive',
      page: 'dean',
      category: 'action',
      triggers: ['issue directive', 'send command', 'create administrative order'],
      description: 'Issue administrative directive',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-dean-issue-directive'),
      speakResponse: 'Opening directive creation panel.',
    },
    {
      id: 'dean-show-status',
      page: 'dean',
      category: 'system',
      triggers: ['show hospital status', 'hospital overview', 'system health', 'show emergency status'],
      description: 'Display comprehensive hospital system status',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'overview' })),
      speakResponse: 'Displaying hospital system overview.',
    },
    {
      id: 'dean-icu-occupancy',
      page: 'dean',
      category: 'system',
      triggers: ['show icu occupancy', 'icu occupancy status', 'icu capacity'],
      description: 'Show ICU capacity and occupancy',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'bed-management' })),
      speakResponse: 'Opening Bed Management dashboard with ICU capacity.',
    },
    {
      id: 'dean-longest-queues',
      page: 'dean',
      category: 'system',
      triggers: ['which departments have the longest queues', 'longest queues', 'opd queues status'],
      description: 'Identify departments with longest waiting queues',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'patient-flow' })),
      speakResponse: 'Opening Patient Flow Command to display department waiting queues.',
    },
    {
      id: 'dean-critical-alerts',
      page: 'dean',
      category: 'system',
      triggers: ['show critical alerts', 'view alerts', 'alerts notifications'],
      description: 'Display central alerts inbox',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'alerts' })),
      speakResponse: 'Opening central Alerts and Notifications panel.',
    },
    {
      id: 'dean-doctors-on-duty',
      page: 'dean',
      category: 'system',
      triggers: ['how many doctors are on duty', 'doctors on duty', 'physicians scheduled'],
      description: 'Query active doctors count',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'staff' })),
      speakResponse: 'Opening Staff and Workforce panel to view present doctors.',
    },
    {
      id: 'dean-pending-surgeries',
      page: 'dean',
      category: 'system',
      triggers: ['show pending surgeries', 'scheduled surgeries', 'ot surgeries list'],
      description: 'Display scheduled OT cases',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'ot-surgery' })),
      speakResponse: 'Opening OT and Surgery dashboard.',
    },
    {
      id: 'dean-blood-bank',
      page: 'dean',
      category: 'system',
      triggers: ['open blood bank status', 'blood bank inventory', 'blood stock'],
      description: 'Display blood bank inventories',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'pharmacy-blood' })),
      speakResponse: 'Opening Pharmacy and Blood bank dashboard.',
    },
    {
      id: 'dean-ct-scanner-status',
      page: 'dean',
      category: 'system',
      triggers: ['show ct scanner status', 'ct scanner status', 'ct machine offline'],
      description: 'Display CT scanner status',
      confirmRequired: false,
      execute: () => window.dispatchEvent(new CustomEvent('mcgm-dean-tab-change', { detail: 'infrastructure' })),
      speakResponse: 'Opening Infrastructure panel with critical diagnostic scanner telemetry.',
    },
    {
      id: 'dean-crisis-mode',
      page: 'dean',
      category: 'action',
      triggers: ['crisis mode', 'emergency mode', 'activate crisis'],
      description: 'Activate crisis response mode',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-dean-activate-crisis'),
      speakResponse: 'Crisis response mode activated.',
    },
    {
      id: 'dean-approve-escalation',
      page: 'dean',
      category: 'action',
      triggers: ['approve escalation', 'authorize emergency response', 'sign off on incident'],
      description: 'Approve administrative escalation',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-dean-approve-escalation'),
      speakResponse: 'Opening escalation approval panel.',
    },
    {
      id: 'dean-generate-report',
      page: 'dean',
      category: 'action',
      triggers: ['generate report', 'create executive report', 'produce analytics'],
      description: 'Generate executive report',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-dean-generate-report'),
      speakResponse: 'Opening report generation panel.',
    },
    {
      id: 'dean-staff-deployment',
      page: 'dean',
      category: 'action',
      triggers: ['deploy staff', 'staff assignment', 'resource allocation'],
      description: 'Initiate staff deployment',
      confirmRequired: true,
      execute: () => dispatchEvent('mcgm-dean-staff-deployment'),
      speakResponse: 'Opening staff deployment panel.',
    },
    {
      id: 'dean-compliance-review',
      page: 'dean',
      category: 'action',
      triggers: ['compliance review', 'audit status', 'regulatory check'],
      description: 'Initiate compliance review',
      confirmRequired: false,
      execute: () => dispatchEvent('mcgm-dean-compliance-review'),
      speakResponse: 'Opening compliance review panel.',
    },
    {
      id: 'dean-remote-portal',
      page: 'dean',
      category: 'navigation',
      triggers: ['open remote portal', 'switch to admin', 'dean access'],
      description: 'Switch to administrative portal',
      confirmRequired: false,
      execute: () => {
        dispatchEvent('mcgm-portal-change', { detail: 'dean' });
        window.dispatchEvent(new CustomEvent('mcgm-portal-change', { detail: 'dean' }));
      },
      speakResponse: 'Switching to administrative portal.',
    },
  ],
});

// â”€â”€ LABORATORY / LIMS COMMANDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CommandRegistry.registerPage({
  page: 'laboratory',
  portal: 'laboratory',
  commands: [
    {
      id: 'lab-open-stat',
      page: 'laboratory',
      category: 'navigation',
      triggers: ['open stat samples', 'stat samples', 'show stat', 'open stat'],
      description: 'Navigate to STAT queue',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-lab-tab-change', { detail: 'sample-management' }));
      },
      speakResponse: 'Displaying STAT specimens in sample management.'
    },
    {
      id: 'lab-find-barcode',
      page: 'laboratory',
      category: 'query',
      triggers: ['find sample barcode', 'find barcode', 'search barcode', 'barcode lookup'],
      description: 'Find a specimen by barcode',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-lab-tab-change', { detail: 'sample-management' }));
      },
      speakResponse: 'Scanning registry for matching sample barcode.'
    },
    {
      id: 'lab-show-validation',
      page: 'laboratory',
      category: 'navigation',
      triggers: ['show validation pending', 'validation pending', 'pending authorization', 'pathology validation'],
      description: 'Navigate to Pathologist authorization desk',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-lab-tab-change', { detail: 'result-validation' }));
      },
      speakResponse: 'Opening pathologist validation queue.'
    },
    {
      id: 'lab-open-critical',
      page: 'laboratory',
      category: 'navigation',
      triggers: ['open critical alerts', 'show critical alerts', 'lab critical alerts', 'panic results'],
      description: 'Navigate to Critical Alerts panel',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-lab-tab-change', { detail: 'critical-alerts' }));
      },
      speakResponse: 'Opening LIMS critical value alerts dashboard.'
    },
    {
      id: 'lab-analyzer-status',
      page: 'laboratory',
      category: 'navigation',
      triggers: ['show analyzer status', 'analyzer status', 'online analyzers', 'instrument status'],
      description: 'Navigate to Analyzer Dashboard',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-lab-tab-change', { detail: 'analyzer-dashboard' }));
      },
      speakResponse: 'Opening analyzer status monitor.'
    },
    {
      id: 'lab-show-rejected',
      page: 'laboratory',
      category: 'navigation',
      triggers: ["show today's rejected samples", 'show rejected samples', 'rejected samples', 'rejections'],
      description: 'Navigate to rejected samples list',
      confirmRequired: false,
      execute: () => {
        window.dispatchEvent(new CustomEvent('mcgm-lab-tab-change', { detail: 'sample-management' }));
      },
      speakResponse: 'Filtering specimen queue to rejected samples.'
    }
  ]
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HOSPITAL COMMAND CENTER â€” 16-PAGE VOICE NAVIGATION
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const commandPage = (id: string) =>
  window.dispatchEvent(new CustomEvent('mcgm-command-tab-change', { detail: id }));

CommandRegistry.registerPage({
  page: 'command-center',
  portal: 'command',
  commands: [
    {
      id: 'cmd-overview',
      page: 'command-center',
      category: 'navigation',
      triggers: ['command overview', 'hospital overview', 'command center overview', 'show overview', 'main dashboard'],
      description: 'Navigate to Command Center Overview',
      confirmRequired: false,
      execute: () => commandPage('overview'),
      speakResponse: 'Opening Hospital Command Center overview.'
    },
    {
      id: 'cmd-map',
      page: 'command-center',
      category: 'navigation',
      triggers: ['hospital map', 'show hospital map', 'floor plan', 'live map', 'department map'],
      description: 'Navigate to Hospital Live Map',
      confirmRequired: false,
      execute: () => commandPage('map'),
      speakResponse: 'Opening interactive hospital map.'
    },
    {
      id: 'cmd-flow',
      page: 'command-center',
      category: 'navigation',
      triggers: ['patient flow', 'show patient flow', 'patient pipeline', 'flow command', 'patient lifecycle'],
      description: 'Navigate to Patient Flow Command',
      confirmRequired: false,
      execute: () => commandPage('flow'),
      speakResponse: 'Opening patient flow command panel.'
    },
    {
      id: 'cmd-beds',
      page: 'command-center',
      category: 'navigation',
      triggers: ['bed board', 'show beds', 'bed status', 'bed occupancy', 'bed capacity', 'show bed board'],
      description: 'Navigate to Bed & Capacity Command',
      confirmRequired: false,
      execute: () => commandPage('beds'),
      speakResponse: 'Opening bed board and capacity command.'
    },
    {
      id: 'cmd-emergency',
      page: 'command-center',
      category: 'navigation',
      triggers: ['emergency command', 'show emergency', 'emergency panel', 'ambulance status', 'er command'],
      description: 'Navigate to Emergency Command',
      confirmRequired: false,
      execute: () => commandPage('emergency'),
      speakResponse: 'Opening emergency command panel.'
    },
    {
      id: 'cmd-icu-ot',
      page: 'command-center',
      category: 'navigation',
      triggers: ['icu command', 'ot command', 'icu and ot', 'show icu', 'operation theatre status', 'ot status'],
      description: 'Navigate to ICU & OT Command',
      confirmRequired: false,
      execute: () => commandPage('icu_ot'),
      speakResponse: 'Opening ICU and operation theatre command.'
    },
    {
      id: 'cmd-workforce',
      page: 'command-center',
      category: 'navigation',
      triggers: ['workforce command', 'staff command', 'show staff', 'deploy staff', 'staff deployment', 'workforce panel'],
      description: 'Navigate to Workforce Command',
      confirmRequired: false,
      execute: () => commandPage('workforce'),
      speakResponse: 'Opening workforce command and staff deployment.'
    },
    {
      id: 'cmd-departments',
      page: 'command-center',
      category: 'navigation',
      triggers: ['departments', 'department status', 'all departments', 'department operations', 'show departments'],
      description: 'Navigate to Department Operations',
      confirmRequired: false,
      execute: () => commandPage('departments'),
      speakResponse: 'Opening department operations control.'
    },
    {
      id: 'cmd-diagnostics',
      page: 'command-center',
      category: 'navigation',
      triggers: ['diagnostics command', 'lab command', 'radiology command', 'diagnostic status', 'show lab status'],
      description: 'Navigate to Diagnostics Command',
      confirmRequired: false,
      execute: () => commandPage('diagnostics'),
      speakResponse: 'Opening diagnostics command â€” laboratory and radiology.'
    },
    {
      id: 'cmd-pharmacy-blood',
      page: 'command-center',
      category: 'navigation',
      triggers: ['pharmacy blood', 'blood bank command', 'show blood bank', 'drug stock', 'pharmacy command', 'blood inventory'],
      description: 'Navigate to Pharmacy & Blood Command',
      confirmRequired: false,
      execute: () => commandPage('pharmacy_blood'),
      speakResponse: 'Opening pharmacy and blood bank command.'
    },
    {
      id: 'cmd-alerts',
      page: 'command-center',
      category: 'navigation',
      triggers: ['command alerts', 'show alerts', 'critical alerts command', 'alert management', 'open alerts'],
      description: 'Navigate to Centralized Alert Management',
      confirmRequired: false,
      execute: () => commandPage('alerts'),
      speakResponse: 'Opening centralized alert management.'
    },
    {
      id: 'cmd-incidents',
      page: 'command-center',
      category: 'navigation',
      triggers: ['incidents', 'show incidents', 'mci command', 'disaster command', 'incident management'],
      description: 'Navigate to Incident & Disaster Command',
      confirmRequired: false,
      execute: () => commandPage('incidents'),
      speakResponse: 'Opening incident and disaster command.'
    },
    {
      id: 'cmd-network',
      page: 'command-center',
      category: 'navigation',
      triggers: ['hospital network', 'inter hospital', 'mcgm network', 'transfer command', 'nearby hospitals'],
      description: 'Navigate to Inter-Hospital Network',
      confirmRequired: false,
      execute: () => commandPage('inter_hospital'),
      speakResponse: 'Opening MCGM inter-hospital network command.'
    },
    {
      id: 'cmd-ai-analytics',
      page: 'command-center',
      category: 'navigation',
      triggers: ['ai analytics', 'predictive insights', 'correlation engine', 'ai command', 'decision support', 'ai insights'],
      description: 'Navigate to AI Analytics & Decision Support',
      confirmRequired: false,
      execute: () => commandPage('ai_analytics'),
      speakResponse: 'Opening AI analytics and decision support.'
    },
    {
      id: 'cmd-reports',
      page: 'command-center',
      category: 'navigation',
      triggers: ['command reports', 'hospital reports', 'generate report', 'download report', 'reports center'],
      description: 'Navigate to Reports Center',
      confirmRequired: false,
      execute: () => commandPage('reports'),
      speakResponse: 'Opening hospital reports center.'
    },
    {
      id: 'cmd-governance',
      page: 'command-center',
      category: 'navigation',
      triggers: ['audit log', 'governance', 'command audit', 'access control', 'rbac', 'settings audit', 'tamper proof log'],
      description: 'Navigate to Governance & Audit',
      confirmRequired: false,
      execute: () => commandPage('governance'),
      speakResponse: 'Opening governance, audit, and access control.'
    },
  ]
});

// ─────────────────────────────────────────────────────────────
// RADIOLOGY PACS + RIS — VOICE NAVIGATION & COMMANDS
// ─────────────────────────────────────────────────────────────
const radPage = (id: string) =>
  window.dispatchEvent(new CustomEvent('mcgm-rad-tab-change', { detail: id }));

CommandRegistry.registerPage({
  page: 'radiology',
  portal: 'radiology',
  commands: [
    {
      id: 'rad-command',
      page: 'radiology',
      category: 'navigation',
      triggers: ['radiology command', 'radiology dashboard', 'imaging overview', 'modalities status', 'radiology overview'],
      description: 'Navigate to Radiology Command Overview',
      confirmRequired: false,
      execute: () => radPage('command'),
      speakResponse: 'Opening Radiology Command Dashboard.'
    },
    {
      id: 'rad-reporting',
      page: 'radiology',
      category: 'navigation',
      triggers: ['pacs reporting desk', 'pacs viewer', 'dicom viewer', 'open pacs', 'patient worklist', 'reporting desk'],
      description: 'Navigate to PACS Reporting Desk',
      confirmRequired: false,
      execute: () => radPage('reporting'),
      speakResponse: 'Opening PACS Reporting Desk.'
    },
    {
      id: 'rad-schedule',
      page: 'radiology',
      category: 'navigation',
      triggers: ['ris scheduling', 'radiology schedule', 'book scan', 'scan appointment', 'schedule scan'],
      description: 'Navigate to RIS Scheduling',
      confirmRequired: false,
      execute: () => radPage('schedule'),
      speakResponse: 'Opening RIS Scheduling System.'
    },
    {
      id: 'rad-orders',
      page: 'radiology',
      category: 'navigation',
      triggers: ['radiology order inbox', 'order inbox', 'imaging orders', 'radiology requests', 'doctor orders radiology'],
      description: 'Navigate to Radiology Order Inbox',
      confirmRequired: false,
      execute: () => radPage('orders'),
      speakResponse: 'Opening Radiology Order Inbox.'
    },
    {
      id: 'rad-safety',
      page: 'radiology',
      category: 'navigation',
      triggers: ['patient safety', 'pre scan checklist', 'mri safety', 'contrast allergy check', 'safety screening'],
      description: 'Navigate to Patient Safety & Pre-Scan',
      confirmRequired: false,
      execute: () => radPage('safety'),
      speakResponse: 'Opening Patient Safety & Pre-Scan Screening.'
    },
    {
      id: 'rad-worklist',
      page: 'radiology',
      category: 'navigation',
      triggers: ['modality worklist', 'technologist worklist', 'tech worklist', 'scan queue', 'modality queue'],
      description: 'Navigate to Modality Worklist',
      confirmRequired: false,
      execute: () => radPage('worklist'),
      speakResponse: 'Opening Technologist Modality Worklist.'
    },
    {
      id: 'rad-machines',
      page: 'radiology',
      category: 'navigation',
      triggers: ['machine control board', 'imaging machines', 'ct status', 'mri status', 'scanner status', 'device health'],
      description: 'Navigate to Live Machine Control Board',
      confirmRequired: false,
      execute: () => radPage('machines'),
      speakResponse: 'Opening Live Machine Control Board.'
    },
    {
      id: 'rad-emergency',
      page: 'radiology',
      category: 'navigation',
      triggers: ['emergency radiology', 'stroke protocol', 'stat scan', 'trauma radiology', 'emergency ct'],
      description: 'Navigate to Emergency Radiology',
      confirmRequired: false,
      execute: () => radPage('emergency'),
      speakResponse: 'Opening Emergency Radiology Command.'
    },
    {
      id: 'rad-ai-assistant',
      page: 'radiology',
      category: 'navigation',
      triggers: ['ai radiology assistant', 'rad ai', 'ai findings', 'ai decision support', 'show ai findings'],
      description: 'Navigate to AI Radiology Assistant',
      confirmRequired: false,
      execute: () => radPage('ai_assistant'),
      speakResponse: 'Opening AI Radiology Assistant.'
    },
    {
      id: 'rad-dictation',
      page: 'radiology',
      category: 'navigation',
      triggers: ['structured dictation', 'voice dictation', 'dictate report', 'start dictation', 'speech to text report'],
      description: 'Navigate to Dictation Desk',
      confirmRequired: false,
      execute: () => radPage('dictation'),
      speakResponse: 'Opening Structured Dictation Desk.'
    },
    {
      id: 'rad-comparison',
      page: 'radiology',
      category: 'navigation',
      triggers: ['compare previous ct', 'compare study', 'previous studies', 'side by side compare', 'delta comparison'],
      description: 'Navigate to Previous Studies & Comparison',
      confirmRequired: false,
      execute: () => radPage('comparison'),
      speakResponse: 'Opening Previous Studies & Comparison view.'
    },
    {
      id: 'rad-critical',
      page: 'radiology',
      category: 'navigation',
      triggers: ['critical findings center', 'mark as critical', 'critical alerts radiology', 'critical findings queue', 'acute findings'],
      description: 'Navigate to Critical Findings Center',
      confirmRequired: false,
      execute: () => radPage('critical'),
      speakResponse: 'Opening Critical Findings Center.'
    },
    {
      id: 'rad-sign-release',
      page: 'radiology',
      category: 'navigation',
      triggers: ['sign report', 'sign and release', 'release report', 'report authorization', 'sign radiology report'],
      description: 'Navigate to Report Sign & Release',
      confirmRequired: false,
      execute: () => radPage('sign_release'),
      speakResponse: 'Opening Report Sign & Release desk.'
    },
    {
      id: 'rad-distribution',
      page: 'radiology',
      category: 'navigation',
      triggers: ['report distribution', 'dispatched reports', 'sync report', 'emr sync', 'doctor portal sync'],
      description: 'Navigate to Report Distribution',
      confirmRequired: false,
      execute: () => radPage('distribution'),
      speakResponse: 'Opening Report Distribution portal.'
    },
    {
      id: 'rad-quality',
      page: 'radiology',
      category: 'navigation',
      triggers: ['quality control', 'qc calibration', 'repeat scan tracking', 'image quality logs', 'qa audit'],
      description: 'Navigate to Quality Control',
      confirmRequired: false,
      execute: () => radPage('quality'),
      speakResponse: 'Opening Quality Control & QC Logs.'
    },
    {
      id: 'rad-dose',
      page: 'radiology',
      category: 'navigation',
      triggers: ['radiation dose monitoring', 'dose tracker', 'msv dose', 'ctdivol', 'aerb compliance'],
      description: 'Navigate to Radiation Dose Monitoring',
      confirmRequired: false,
      execute: () => radPage('dose'),
      speakResponse: 'Opening Radiation Dose Monitoring.'
    },
    {
      id: 'rad-analytics',
      page: 'radiology',
      category: 'navigation',
      triggers: ['radiology analytics', 'imaging volume', 'tat trends', 'radiologist productivity'],
      description: 'Navigate to Radiology Analytics',
      confirmRequired: false,
      execute: () => radPage('analytics'),
      speakResponse: 'Opening Radiology Analytics.'
    },
    {
      id: 'rad-sharing',
      page: 'radiology',
      category: 'navigation',
      triggers: ['image sharing', 'share dicom', 'abdm link', 'qr code report', 'share study'],
      description: 'Navigate to Image & Report Sharing',
      confirmRequired: false,
      execute: () => radPage('sharing'),
      speakResponse: 'Opening Image & Report Sharing.'
    },
    {
      id: 'rad-communication',
      page: 'radiology',
      category: 'navigation',
      triggers: ['radiology communication hub', 'radiologist chat', 'doctor message radiology', 'radiology hub'],
      description: 'Navigate to Radiology Communication Hub',
      confirmRequired: false,
      execute: () => radPage('communication'),
      speakResponse: 'Opening Radiology Communication Hub.'
    },
    {
      id: 'rad-audit',
      page: 'radiology',
      category: 'navigation',
      triggers: ['radiology audit', 'pacs audit log', 'dicom audit trail', 'report release audit'],
      description: 'Navigate to Audit & Governance',
      confirmRequired: false,
      execute: () => radPage('audit'),
      speakResponse: 'Opening Radiology Audit & Governance.'
    },
  ]
});

