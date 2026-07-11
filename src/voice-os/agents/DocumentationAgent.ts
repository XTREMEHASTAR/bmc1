/**
 * Agent 3: Documentation Agent
 * 
 * Handles ONLY clinical documentation:
 * - SOAP Notes
 * - Clinical Notes
 * - Discharge Summary
 * - Referral Letters
 * - Medical Certificates
 * - Ambient Documentation (Scribe)
 * 
 * NOT navigation. NOT search. NOT analytics.
 */

import type { AgentResponse } from './types';

export class DocumentationAgent {
  static process(normalizedText: string, _portal: string): AgentResponse {
    const text = normalizedText.toLowerCase().trim();

    // ── Scribe controls ─────────────────────────────────────────────────
    if (text.includes('start scribe') || text.includes('start ambient') || text.includes('start recording') || text.includes('begin scribe')) {
      window.dispatchEvent(new CustomEvent('mcgm-doctor-toggle-scribe', { detail: { active: true } }));
      return DocumentationAgent.respond('START_SCRIBE', 'Ambient scribing started. Recording consultation.', 98);
    }

    if (text.includes('stop scribe') || text.includes('stop ambient') || text.includes('stop recording') || text.includes('end scribe')) {
      window.dispatchEvent(new CustomEvent('mcgm-doctor-toggle-scribe', { detail: { active: false } }));
      return DocumentationAgent.respond('STOP_SCRIBE', 'Scribing stopped. SOAP notes drafted.', 98);
    }

    // ── SOAP Generation ─────────────────────────────────────────────────
    if (text.includes('generate soap') || text.includes('create soap') || text.includes('compile notes')) {
      window.dispatchEvent(new CustomEvent('mcgm-doctor-generate-soap'));
      return DocumentationAgent.respond('GENERATE_SOAP', 'SOAP notes compiled and ready.', 98);
    }

    // ── Discharge Summary ───────────────────────────────────────────────
    if (text.includes('discharge summary') || text.includes('generate discharge') || text.includes('open discharge')) {
      window.dispatchEvent(new CustomEvent('mcgm-doctor-open-discharge'));
      return DocumentationAgent.respond('OPEN_DISCHARGE', 'Discharge summary panel opened.', 98);
    }

    // ── Handover Report ─────────────────────────────────────────────────
    if (text.includes('generate handover') || text.includes('handover report') || text.includes('shift handover')) {
      window.dispatchEvent(new CustomEvent('mcgm-nurse-generate-handover'));
      return DocumentationAgent.respond('GENERATE_HANDOVER', 'Shift handover log generated.', 98);
    }

    // ── Certificate ─────────────────────────────────────────────────────
    if (text.includes('certificate') || text.includes('medical cert')) {
      window.dispatchEvent(new CustomEvent('mcgm-doctor-issue-cert'));
      return DocumentationAgent.respond('ISSUE_CERT', 'Opening medical certificate panel.', 96);
    }

    // ── Referral ────────────────────────────────────────────────────────
    if (text.includes('referral letter') || text.includes('write referral')) {
      window.dispatchEvent(new CustomEvent('mcgm-doctor-refer'));
      return DocumentationAgent.respond('WRITE_REFERRAL', 'Opening referral letter template.', 96);
    }

    // ── Clinical Notes ──────────────────────────────────────────────────
    if (text.includes('clinical notes') || text.includes('progress notes')) {
      return DocumentationAgent.respond('CLINICAL_NOTES', 'Opening clinical notes editor.', 92);
    }

    // Fallback — shouldn't reach here if orchestrator routes correctly
    return {
      success: false,
      agent: 'documentation',
      intent: 'UNKNOWN_DOC',
      message: "Documentation command not recognized.",
      confidence: 0,
      action: 'none',
    };
  }

  private static respond(intent: string, message: string, confidence: number): AgentResponse {
    return {
      success: true,
      agent: 'documentation',
      intent,
      message,
      confidence,
      action: 'execute',
    };
  }
}
