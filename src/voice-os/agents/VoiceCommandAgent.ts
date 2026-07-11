/**
 * Agent 1: Voice Command Agent
 * 
 * ONLY converts speech into application actions.
 * NEVER answers questions. NEVER chats. NEVER summarizes.
 * NEVER generates explanations. NEVER behaves like ChatGPT.
 * 
 * Pipeline: Speech → Normalize → Registry Lookup → Confidence Gate → Execute
 */

import type { AgentResponse, PendingConfirmation } from './types';
import { CommandRegistry } from '../registry/CommandRegistry';
import { IntentMatcher } from '../engine/IntentMatcher';
import { ConfidenceGate } from '../engine/ConfidenceGate';

export class VoiceCommandAgent {
  private static pendingConfirmation: PendingConfirmation | null = null;

  /**
   * Process a normalized speech command.
   * Returns an AgentResponse — NEVER calls an LLM.
   */
  static process(normalizedText: string, portal: string): AgentResponse {
    const text = normalizedText.toLowerCase().trim();
    if (!text) {
      return VoiceCommandAgent.fail('Empty command.');
    }

    // ── Handle pending confirmation ─────────────────────────────────────
    if (VoiceCommandAgent.pendingConfirmation) {
      return VoiceCommandAgent.handleConfirmation(text);
    }

    // ── Help command ────────────────────────────────────────────────────
    if (text === 'help' || text.includes('help') || text.includes('show commands') || text.includes('what can you do')) {
      return VoiceCommandAgent.getHelp(portal);
    }

    // ── Lookup in Command Registry ──────────────────────────────────────
    const portalCommands = CommandRegistry.getCommandsForPortal(portal);
    const allCommands = CommandRegistry.getCommandsForPortal('global');
    const combinedCommands = [...portalCommands, ...allCommands.filter(gc => !portalCommands.some(pc => pc.id === gc.id))];

    const match = IntentMatcher.matchCommand(text, combinedCommands);

    if (match.command && match.confidence > 0) {
      const gate = ConfidenceGate.evaluate(match.confidence);

      if (gate.action === 'execute') {
        // High confidence → execute immediately
        if (match.command.confirmRequired) {
          // Even high confidence: if command requires confirmation, ask
          VoiceCommandAgent.pendingConfirmation = {
            action: () => match.command!.execute(),
            description: match.command.description,
            agent: 'voice_command',
            timestamp: Date.now(),
          };
          return {
            success: true,
            agent: 'voice_command',
            intent: match.command.id.toUpperCase(),
            message: `${match.command.description}. Say "confirm" to proceed.`,
            confidence: match.confidence,
            action: 'confirm',
          };
        }
        match.command.execute();
        return {
          success: true,
          agent: 'voice_command',
          intent: match.command.id.toUpperCase(),
          message: match.command.speakResponse,
          confidence: match.confidence,
          action: 'execute',
        };
      }

      if (gate.action === 'confirm') {
        VoiceCommandAgent.pendingConfirmation = {
          action: () => match.command!.execute(),
          description: match.command.description,
          agent: 'voice_command',
          timestamp: Date.now(),
        };
        return {
          success: true,
          agent: 'voice_command',
          intent: match.command.id.toUpperCase(),
          message: ConfidenceGate.getConfirmationPrompt(match.command.description, match.confidence),
          confidence: match.confidence,
          action: 'confirm',
        };
      }

      // Low confidence → ask to repeat
      return {
        success: false,
        agent: 'voice_command',
        intent: 'UNCLEAR',
        message: "I didn't catch that clearly. Could you please repeat your command?",
        confidence: match.confidence,
        action: 'repeat',
      };
    }

    // ── Prescribe medication (special parser) ───────────────────────────
    if (portal === 'doctor' && (text.includes('prescribe') || text.includes('add medication') || text.includes('add med'))) {
      return VoiceCommandAgent.handlePrescribe(text);
    }

    // ── Lab ordering (special parser) ───────────────────────────────────
    if (portal === 'doctor' && (text.includes('order lab') || text.includes('blood test') || text.includes('cbc') || text.includes('lft') || text.includes('rft'))) {
      return VoiceCommandAgent.handleLabOrder(text);
    }

    // ── Nurse vitals (special parser) ───────────────────────────────────
    if (portal === 'nurse') {
      const vitalsResult = VoiceCommandAgent.handleNurseVitals(text);
      if (vitalsResult) return vitalsResult;
    }

    // ── No command found ────────────────────────────────────────────────
    return VoiceCommandAgent.fail("I don't recognize that command. Say \"help\" for available commands.");
  }

  private static handleConfirmation(text: string): AgentResponse {
    const yesWords = ['yes', 'confirm', 'do it', 'submit', 'approve'];
    const noWords = ['no', 'cancel', 'reject', 'stop'];

    if (yesWords.some(w => text.includes(w))) {
      const pending = VoiceCommandAgent.pendingConfirmation!;
      pending.action();
      VoiceCommandAgent.pendingConfirmation = null;
      return {
        success: true, agent: 'voice_command', intent: 'CONFIRM',
        message: 'Action confirmed.', confidence: 100, action: 'execute',
      };
    }
    if (noWords.some(w => text.includes(w))) {
      VoiceCommandAgent.pendingConfirmation = null;
      return {
        success: true, agent: 'voice_command', intent: 'CANCEL',
        message: 'Action cancelled.', confidence: 100, action: 'execute',
      };
    }
    return {
      success: false, agent: 'voice_command', intent: 'CONFIRM_PENDING',
      message: `Pending: ${VoiceCommandAgent.pendingConfirmation!.description}. Say "yes" or "no".`,
      confidence: 50, action: 'confirm',
    };
  }

  private static handlePrescribe(text: string): AgentResponse {
    let drugName = 'Tab. Paracetamol 650mg';
    let dose = '1-0-1', timing = 'After Food', duration = '5 Days';

    if (text.includes('paracetamol') || text.includes('crocin')) drugName = 'Tab. Paracetamol 650mg';
    else if (text.includes('pantoprazole')) drugName = 'Tab. Pantoprazole 40mg';
    else if (text.includes('amoxicillin') || text.includes('antibiotic')) drugName = 'Cap. Amoxicillin 500mg';
    else if (text.includes('aceclofenac')) drugName = 'Tab. Aceclofenac 100mg';
    else if (text.includes('aspirin')) drugName = 'Tab. Aspirin 75mg';
    else if (text.includes('metformin')) drugName = 'Tab. Metformin 500mg';
    else if (text.includes('ibuprofen')) drugName = 'Tab. Ibuprofen 400mg';

    if (text.includes('once')) dose = '1-0-0';
    else if (text.includes('thrice') || text.includes('three times')) dose = '1-1-1';
    if (text.includes('before food')) timing = 'Before Food';
    const dm = text.match(/(\d+)\s*days?/i);
    if (dm) duration = `${dm[1]} Days`;

    window.dispatchEvent(new CustomEvent('mcgm-doctor-prescribe', {
      detail: { name: drugName, dose, timing, duration }
    }));

    return {
      success: true, agent: 'voice_command', intent: 'PRESCRIBE_MED',
      message: `Added ${drugName}. Dose: ${dose}, ${duration}.`,
      confidence: 96, action: 'execute',
    };
  }

  private static handleLabOrder(text: string): AgentResponse {
    const tests: string[] = [];
    if (text.includes('cbc')) tests.push('CBC');
    if (text.includes('lft')) tests.push('LFT');
    if (text.includes('rft')) tests.push('RFT');
    if (text.includes('lipid')) tests.push('Lipid Profile');
    if (text.includes('thyroid') || text.includes('tsh')) tests.push('TSH');
    if (text.includes('hba1c')) tests.push('HbA1c');

    if (tests.length > 0) {
      VoiceCommandAgent.pendingConfirmation = {
        action: () => window.dispatchEvent(new CustomEvent('mcgm-doctor-submit-lab-direct')),
        description: `Submit lab order for ${tests.join(', ')}`,
        agent: 'voice_command',
        timestamp: Date.now(),
      };
      window.dispatchEvent(new CustomEvent('mcgm-doctor-open-labs', { detail: { tests } }));
      return {
        success: true, agent: 'voice_command', intent: 'ORDER_LAB_DRAFT',
        message: `Lab order drafted for ${tests.join(', ')}. Say "confirm" to submit.`,
        confidence: 96, action: 'confirm',
      };
    }

    window.dispatchEvent(new CustomEvent('mcgm-doctor-open-labs'));
    return {
      success: true, agent: 'voice_command', intent: 'OPEN_LAB_MODAL',
      message: 'Opening lab order panel.',
      confidence: 90, action: 'execute',
    };
  }

  private static handleNurseVitals(text: string): AgentResponse | null {
    const bpM = text.match(/bp\s+(\d+)\/(\d+)/i) || text.match(/blood pressure\s+(\d+)\s+over\s+(\d+)/i);
    const pulseM = text.match(/pulse\s+(\d+)/i) || text.match(/heart rate\s+(\d+)/i);
    const tempM = text.match(/temp(?:erature)?\s+(\d+\.?\d*)/i);
    const spo2M = text.match(/spo2\s+(\d+)/i) || text.match(/oxygen\s+(\d+)/i);
    const respM = text.match(/resp(?:iration)?\s+(\d+)/i);

    if (bpM || pulseM || tempM || spo2M || respM) {
      const bp = bpM ? `${bpM[1]}/${bpM[2]}` : undefined;
      const pulse = pulseM ? pulseM[1] : undefined;
      const temp = tempM ? tempM[1] : undefined;
      const spo2 = spo2M ? spo2M[1] : undefined;
      const resp = respM ? respM[1] : undefined;

      window.dispatchEvent(new CustomEvent('mcgm-nurse-submit-vitals', {
        detail: { bp, pulse, temp, spo2, resp }
      }));

      VoiceCommandAgent.pendingConfirmation = {
        action: () => window.dispatchEvent(new CustomEvent('mcgm-nurse-save-vitals')),
        description: 'Save vitals',
        agent: 'voice_command',
        timestamp: Date.now(),
      };

      const msg = `Vitals — BP: ${bp||'—'}, Pulse: ${pulse||'—'}, Temp: ${temp||'—'}°F, SpO2: ${spo2||'—'}%. Say "save vitals" to confirm.`;
      return {
        success: true, agent: 'voice_command', intent: 'RECORD_VITALS_DRAFT',
        message: msg, confidence: 96, action: 'confirm',
      };
    }
    return null;
  }

  private static getHelp(portal: string): AgentResponse {
    let msg = '';
    if (portal === 'doctor') {
      msg = 'Doctor commands: next patient, appointments, prescribe medication, order labs, sign prescription, start scribe, digital twin, open nurse, toggle theme, logout.';
    } else if (portal === 'nurse') {
      msg = 'Nurse commands: record vitals, save vitals, verify medication, shift handover, transfer to ICU, emergency code blue, toggle theme, logout.';
    } else if (portal === 'patient') {
      msg = 'Patient commands: book appointment, start consult, view ABHA card, medical records, my wallet, emergency SOS, toggle theme, logout.';
    } else {
      msg = 'Available portals: open doctor, nurse, laboratory, radiology, pharmacy, emergency, surgery, ICU. Say "help" in any portal for specific commands.';
    }
    return {
      success: true, agent: 'voice_command', intent: 'HELP',
      message: msg, confidence: 100, action: 'execute',
    };
  }

  private static fail(message: string): AgentResponse {
    return {
      success: false, agent: 'voice_command', intent: 'UNRECOGNIZED',
      message, confidence: 0, action: 'none',
    };
  }

  /** Clear any pending confirmation state */
  static clearPending(): void {
    VoiceCommandAgent.pendingConfirmation = null;
  }

  /** Check if there's a pending confirmation */
  static hasPending(): boolean {
    return VoiceCommandAgent.pendingConfirmation !== null;
  }
}
