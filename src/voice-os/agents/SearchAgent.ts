/**
 * Agent 4: Search Agent
 * 
 * Handles ONLY search operations:
 * - Search Patient
 * - Search Reports
 * - Search Medicines
 * - Search Labs
 * - Search Radiology
 * - Search Analytics
 * 
 * NOT navigation. NOT documentation. NOT conversation.
 */

import type { AgentResponse } from './types';

export class SearchAgent {
  static process(normalizedText: string, portal: string): AgentResponse {
    const text = normalizedText.toLowerCase().trim();

    // ── Patient search ──────────────────────────────────────────────────
    if (text.includes('search patient') || text.includes('find patient') || text.includes('look up')) {
      const query = text
        .replace(/search patient|find patient|look up|search for|search/g, '')
        .trim();

      if (query) {
        window.dispatchEvent(new CustomEvent('mcgm-doctor-search-patient', { detail: query }));
        if (portal === 'doctor') {
          window.dispatchEvent(new CustomEvent('mcgm-doctor-tab-change', { detail: 'patients' }));
        }
        return SearchAgent.respond('SEARCH_PATIENT', `Searching for patient: "${query}".`, 96);
      }

      return SearchAgent.respond('SEARCH_PATIENT_PROMPT', 'Who would you like to search for? Say the patient name.', 80);
    }

    // ── Report search ───────────────────────────────────────────────────
    if (text.includes('search reports') || text.includes('find report')) {
      const query = text.replace(/search reports?|find reports?/g, '').trim();
      return SearchAgent.respond('SEARCH_REPORTS', `Searching reports${query ? `: "${query}"` : ''}.`, 92);
    }

    // ── Medicine search ─────────────────────────────────────────────────
    if (text.includes('search medicine') || text.includes('find medicine') || text.includes('search drug')) {
      const query = text.replace(/search medicine|find medicine|search drug/g, '').trim();
      return SearchAgent.respond('SEARCH_MEDICINES', `Searching medicines${query ? `: "${query}"` : ''}.`, 92);
    }

    // ── Lab search ──────────────────────────────────────────────────────
    if (text.includes('search labs') || text.includes('search lab') || text.includes('find lab')) {
      const query = text.replace(/search labs?|find labs?/g, '').trim();
      return SearchAgent.respond('SEARCH_LABS', `Searching lab results${query ? `: "${query}"` : ''}.`, 92);
    }

    // ── Radiology search ────────────────────────────────────────────────
    if (text.includes('search radiology') || text.includes('find scan') || text.includes('search imaging')) {
      const query = text.replace(/search radiology|find scan|search imaging/g, '').trim();
      return SearchAgent.respond('SEARCH_RADIOLOGY', `Searching radiology images${query ? `: "${query}"` : ''}.`, 92);
    }

    // Fallback
    return {
      success: false,
      agent: 'search',
      intent: 'UNKNOWN_SEARCH',
      message: "Search command not recognized. Try: search patient, search reports, search medicines.",
      confidence: 0,
      action: 'none',
    };
  }

  private static respond(intent: string, message: string, confidence: number): AgentResponse {
    return {
      success: true,
      agent: 'search',
      intent,
      message,
      confidence,
      action: 'execute',
    };
  }
}
