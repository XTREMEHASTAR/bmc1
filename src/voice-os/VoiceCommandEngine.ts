/**
 * MCGM Arogya Voice Clinical Operating System
 * VoiceCommandEngine — Backward Compatibility Shim
 * 
 * This file is now a thin wrapper around the multi-agent architecture.
 * All existing imports from other components continue to work.
 * 
 * Architecture:
 *   AgentOrchestrator → VoiceCommandAgent (registry lookup)
 *                     → DocumentationAgent (SOAP, discharge)
 *                     → SearchAgent (patient, report search)
 *                     → ConversationAgent (explicit AI help)
 *                     → AnalyticsAgent (dashboards, stats)
 */

// Re-export agents and engine for direct access
export { AgentOrchestrator } from './agents/AgentOrchestrator';
export { VoiceCommandAgent } from './agents/VoiceCommandAgent';
export { ConversationAgent } from './agents/ConversationAgent';
export { DocumentationAgent } from './agents/DocumentationAgent';
export { SearchAgent } from './agents/SearchAgent';
export { AnalyticsAgent } from './agents/AnalyticsAgent';
export { CommandRegistry } from './registry/CommandRegistry';
export { SpeechNormalizer } from './engine/SpeechNormalizer';
export { IntentMatcher } from './engine/IntentMatcher';
export { ConfidenceGate } from './engine/ConfidenceGate';

// Re-export types
export type {
  AgentResponse,
  AgentType,
  RegisteredCommand,
  PageCommands,
  VoiceContext,
  ClassifiedIntent,
  ConfidenceLevel,
  ConfidenceResult,
  PendingConfirmation,
} from './agents/types';

// ── Backward-compatible interfaces ──────────────────────────────────────────

export interface VoiceCommand {
  id: string;
  intent: string;
  category: 'global' | 'doctor' | 'nurse' | 'clinical';
  triggers: { en: string[]; hi: string[]; mr: string[]; };
  confirmRequired?: boolean;
  action: (params?: any) => void;
}

// ── VoicePermissions (unchanged) ────────────────────────────────────────────
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

// ── VoiceMemory (backward compat — delegates to VoiceCommandAgent) ──────────
export class VoiceMemory {
  private static storage: Map<string, any> = new Map();

  static set(key: string, value: any) { this.storage.set(key, value); }
  static get(key: string): any { return this.storage.get(key); }
  static clear() { this.storage.clear(); }
  static setPendingConfirmation(_action: () => void, _text: string) {
    // Now handled internally by VoiceCommandAgent
  }
  static getPendingConfirmation() {
    return { action: null, text: '' };
  }
  static clearPendingConfirmation() {
    // Now handled internally by VoiceCommandAgent
  }
}

// ── VoiceContextManager (delegates to AgentOrchestrator) ────────────────────
import { AgentOrchestrator as _Orchestrator } from './agents/AgentOrchestrator';

export class VoiceContextManager {
  static setPortal(portal: string) { _Orchestrator.setPortal(portal); }
  static getPortal(): string { return _Orchestrator.getPortal(); }
  static setActiveTab(tab: string) { _Orchestrator.setActiveTab(tab); }
  static getActiveTab(): string { return _Orchestrator.getContext().activeTab; }
  static setActivePatientId(id: string) { _Orchestrator.setActivePatientId(id); }
  static getActivePatientId(): string { return _Orchestrator.getContext().activePatientId; }
  static openModal(modalId: string) { _Orchestrator.openModal(modalId); }
  static closeModal(modalId: string) { _Orchestrator.closeModal(modalId); }
  static isModalOpen(modalId: string): boolean { return _Orchestrator.getContext().activeModals.has(modalId); }
  static clearModals() { /* no-op for backward compat */ }
}

// ── VoiceCommandRegistry (backward compat — wraps CommandRegistry) ──────────
import { CommandRegistry as _Registry } from './registry/CommandRegistry';

export class VoiceCommandRegistry {
  private static commands: VoiceCommand[] = [];
  static register(command: VoiceCommand) {
    if (!this.commands.some(c => c.id === command.id)) this.commands.push(command);
  }
  static getAll(): VoiceCommand[] { return this.commands; }
  static findByIntent(intent: string): VoiceCommand | undefined { return this.commands.find(c => c.intent === intent); }
  static clear() { this.commands = []; }
}

// ── VoiceNavigation (unchanged) ─────────────────────────────────────────────
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

// ── VoiceFormController (unchanged) ─────────────────────────────────────────
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

// ── VoiceSearch (unchanged) ─────────────────────────────────────────────────
export class VoiceSearch {
  static searchPatient(query: string) {
    window.dispatchEvent(new CustomEvent('mcgm-doctor-search-patient', { detail: query.toLowerCase().trim() }));
  }
}

// ── VoiceActionDispatcher (unchanged) ───────────────────────────────────────
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

// ── VoiceIntentRouter (backward compat — delegates to AgentOrchestrator) ────
export class VoiceIntentRouter {
  /**
   * Routes speech through the multi-agent orchestrator.
   * Returns the same { success, message, intent } shape for backward compat.
   */
  static route(speechText: string): { success: boolean; message: string; intent?: string } {
    const { response } = _Orchestrator.process(speechText);
    return {
      success: response.success,
      message: response.message,
      intent: response.intent,
    };
  }
}
