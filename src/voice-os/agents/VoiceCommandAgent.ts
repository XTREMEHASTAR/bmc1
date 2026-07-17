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

    // Drug lookup (brand + generic names)
    const drugMap: [string[], string][] = [
      [['paracetamol', 'crocin', 'dolo', 'pcm'], 'Tab. Paracetamol 650mg'],
      [['pantoprazole', 'pantocid'], 'Tab. Pantoprazole 40mg'],
      [['omeprazole'], 'Cap. Omeprazole 20mg'],
      [['rabeprazole', 'razo'], 'Tab. Rabeprazole 20mg'],
      [['amoxicillin', 'mox', 'antibiotic'], 'Cap. Amoxicillin 500mg'],
      [['augmentin', 'amoxiclav'], 'Tab. Amoxicillin-Clavulanate 625mg'],
      [['azithromycin', 'azee', 'azithral'], 'Tab. Azithromycin 500mg'],
      [['cefixime', 'taxim'], 'Tab. Cefixime 200mg'],
      [['ciprofloxacin', 'cipro'], 'Tab. Ciprofloxacin 500mg'],
      [['aceclofenac', 'hifenac'], 'Tab. Aceclofenac 100mg'],
      [['ibuprofen', 'brufen'], 'Tab. Ibuprofen 400mg'],
      [['diclofenac', 'voveran'], 'Tab. Diclofenac 50mg'],
      [['aspirin', 'ecosprin'], 'Tab. Aspirin 75mg'],
      [['metformin', 'glycomet'], 'Tab. Metformin 500mg'],
      [['glimepiride', 'amaryl'], 'Tab. Glimepiride 1mg'],
      [['atorvastatin', 'lipvas'], 'Tab. Atorvastatin 10mg'],
      [['amlodipine', 'stamlo'], 'Tab. Amlodipine 5mg'],
      [['losartan', 'repace'], 'Tab. Losartan 50mg'],
      [['telmisartan', 'telma'], 'Tab. Telmisartan 40mg'],
      [['metoprolol'], 'Tab. Metoprolol 25mg'],
      [['atenolol'], 'Tab. Atenolol 50mg'],
      [['furosemide', 'lasix'], 'Tab. Furosemide 40mg'],
      [['ondansetron'], 'Tab. Ondansetron 4mg'],
      [['domperidone'], 'Tab. Domperidone 10mg'],
      [['montelukast'], 'Tab. Montelukast 10mg'],
      [['cetirizine', 'levocetirizine'], 'Tab. Levocetirizine 5mg'],
      [['salbutamol', 'asthalin'], 'Inh. Salbutamol 100mcg'],
      [['insulin'], 'Inj. Insulin (as per dose)'],
      [['tramadol'], 'Tab. Tramadol 50mg'],
      [['gabapentin'], 'Cap. Gabapentin 300mg'],
      [['prednisolone'], 'Tab. Prednisolone 10mg'],
      [['dexamethasone'], 'Inj. Dexamethasone 4mg'],
      [['clopidogrel'], 'Tab. Clopidogrel 75mg'],
      [['enoxaparin'], 'Inj. Enoxaparin 40mg'],
      [['levothyroxine', 'thyronorm'], 'Tab. Levothyroxine 50mcg'],
    ];
    for (const [keys, name] of drugMap) {
      if (keys.some(k => text.includes(k))) { drugName = name; break; }
    }

    if (text.includes('once') || text.includes('od')) dose = '1-0-0';
    else if (text.includes('twice') || text.includes('bd')) dose = '1-0-1';
    else if (text.includes('thrice') || text.includes('three times') || text.includes('tid')) dose = '1-1-1';
    if (text.includes('before food') || text.includes('empty stomach')) timing = 'Before Food';
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
    const labMap: [string[], string][] = [
      [['cbc', 'complete blood', 'blood count'], 'CBC'],
      [['lft', 'liver function'], 'LFT'],
      [['rft', 'renal function', 'kidney function', 'kft'], 'RFT'],
      [['lipid', 'cholesterol'], 'Lipid Profile'],
      [['thyroid', 'tsh'], 'TSH'],
      [['hba1c', 'glycated'], 'HbA1c'],
      [['crp', 'c-reactive'], 'CRP'],
      [['esr', 'sedimentation'], 'ESR'],
      [['urine', 'urinalysis'], 'Urine R/M'],
      [['culture', 'sensitivity'], 'Culture & Sensitivity'],
      [['electrolyte', 'sodium', 'potassium'], 'Electrolytes'],
      [['d-dimer', 'dimer'], 'D-Dimer'],
      [['troponin', 'cardiac marker'], 'Troponin-I'],
      [['procalcitonin', 'pct'], 'Procalcitonin'],
      [['coagulation', 'pt inr', 'aptt'], 'Coagulation Profile'],
      [['dengue'], 'Dengue NS1/IgM'],
      [['malaria', 'mp'], 'Malaria Parasite'],
      [['widal', 'typhoid'], 'Widal Test'],
      [['bnp'], 'NT-proBNP'],
      [['blood sugar', 'grbs', 'glucose'], 'Blood Sugar (F/PP)'],
    ];
    for (const [keys, name] of labMap) {
      if (keys.some(k => text.includes(k))) tests.push(name);
    }

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
      msg = 'Doctor commands: next patient · skip patient · appointments · consultation · prescribe [drug] · order labs [cbc/lft/rft/lipid/thyroid/hba1c/crp/d-dimer/troponin] · sign prescription · clear prescription · start scribe · stop scribe · generate SOAP · discharge summary · medical certificate · referral letter · handover report · digital twin · ECG · call nurse · open radiology · toggle theme · logout.';
    } else if (portal === 'nurse') {
      msg = 'Nurse commands: ward · vitals · record vitals (BP 120/80, pulse 72, temp 98.6, spo2 98) · save vitals · tasks · medication round · verify med · wound care · shift handover · transfer to ICU · code blue · start scribe · stop scribe · inventory · toggle theme · logout.';
    } else if (portal === 'patient') {
      msg = 'Patient commands: book appointment · start consult · video consult · view ABHA · medical records · download records · share records · cancel appointment · my wallet · emergency SOS · toggle theme · logout.';
    } else if (portal === 'emergency') {
      msg = 'Emergency commands: open registration · unknown male/female · road accident · private vehicle · generate UHID · print wristband · complete registration · triage · resuscitation · code blue · start scribe · stop scribe · toggle theme.';
    } else {
      msg = 'Portals: open doctor · nurse · patient · laboratory · radiology · pharmacy · emergency · surgery · ICU · command · AI · PMO · quality · devops · integration · vision. Say "help" inside any portal for specific commands.';
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
