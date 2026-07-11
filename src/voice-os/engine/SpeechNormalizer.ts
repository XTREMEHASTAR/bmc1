/**
 * MCGM Arogya Voice AI — Speech Normalizer
 * Cleans, normalizes, and fuzzy-corrects speech recognition output.
 * Extracted from the old monolithic VoiceCommandEngine.
 */

// ── Known vocabulary for fuzzy correction ───────────────────────────────────
const KNOWN_KEYWORDS = [
  'appointments', 'queue', 'prescribe', 'discharge', 'sign', 'next', 'skip',
  'patient', 'patients', 'vitals', 'handover', 'scribe', 'start', 'stop',
  'generate', 'soap', 'radiology', 'pharmacy', 'emergency', 'laboratory',
  'dashboard', 'consultation', 'messages', 'help', 'logout', 'dark', 'light',
  'nurse', 'doctor', 'arogya', 'computer', 'medication', 'blood', 'pressure',
  'pulse', 'temperature', 'oxygen', 'transfer', 'certificate', 'search',
  'find', 'book', 'consult', 'abha', 'icu', 'surgery', 'assistant', 'today',
  'open', 'close', 'show', 'tab', 'record', 'save', 'confirm', 'cancel',
  'order', 'lab', 'report', 'ward', 'bed', 'alert', 'sos', 'code',
  'analytics', 'statistics', 'summary', 'explain', 'summarize', 'guideline',
  'mri', 'ct', 'scan', 'zoom', 'rotate', 'annotate', 'compare',
  'cbc', 'lft', 'rft', 'hba1c', 'thyroid', 'lipid',
  'paracetamol', 'amoxicillin', 'pantoprazole', 'metformin', 'aspirin',
  'generic', 'alternative', 'interaction', 'replace',
  'repeat', 'refresh', 'previous', 'history', 'timeline', 'diagnosis',
  'prescription', 'referral', 'refer'
];

// ── Regex normalization patterns ────────────────────────────────────────────
// Maps common speech-recognition mis-hearings to canonical phrases
const NORMALIZATION_MAP: [RegExp, string][] = [
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
  // Search
  [/search\s+for\s+patient|find\s+patient|look\s+up\s+patient/i, 'search patient'],
  [/search\s+reports?|find\s+reports?/i, 'search reports'],
  [/search\s+medic\w*|find\s+medic\w*/i, 'search medicines'],
  // Analytics
  [/show\s+analytics|open\s+analytics|hospital\s+analytics/i, 'open analytics'],
  [/show\s+statistics|hospital\s+statistics/i, 'show statistics'],
  [/show\s+dashboard|open\s+dashboard/i, 'open dashboard'],
];


export class SpeechNormalizer {
  /**
   * Full cleaning pipeline: punctuation strip → whitespace collapse → lowercase → normalize → fuzzy correct
   */
  static process(rawInput: string): { cleaned: string; normalized: string; wasChanged: boolean; originalWords: string[] } {
    // Step 1: Strip trailing/leading punctuation
    const cleaned = rawInput
      .replace(/[.,\/#!$%\^&\*;:{}=\_`~()?]$/g, '')
      .replace(/^[.,\/#!$%\^&\*;:{}=\_`~()?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const lower = cleaned.toLowerCase();

    // Step 2: Regex normalization
    const normalized = SpeechNormalizer.regexNormalize(lower);

    // Step 3: Fuzzy word-level correction
    const { corrected, wasChanged } = SpeechNormalizer.fuzzyCorrect(normalized);

    return {
      cleaned,
      normalized: corrected,
      wasChanged,
      originalWords: lower.split(' ')
    };
  }

  /**
   * Applies regex patterns to map speech mis-hearings to canonical phrases
   */
  static regexNormalize(raw: string): string {
    for (const [pattern, replacement] of NORMALIZATION_MAP) {
      if (pattern.test(raw)) return replacement;
    }
    return raw;
  }

  /**
   * Bigram-similarity fuzzy correction for individual misspelled words
   */
  static fuzzyCorrect(text: string): { corrected: string; wasChanged: boolean } {
    const words = text.split(' ');
    let wasChanged = false;
    const correctedWords = words.map(word => {
      if (word.length < 3) return word;
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      if (KNOWN_KEYWORDS.includes(clean)) return word;

      let bestScore = 0;
      let bestKeyword = '';
      for (const kw of KNOWN_KEYWORDS) {
        const score = SpeechNormalizer.bigramSimilarity(clean, kw);
        if (score > bestScore) { bestScore = score; bestKeyword = kw; }
      }
      if (bestScore >= 0.6 && bestKeyword) {
        wasChanged = true;
        return bestKeyword;
      }
      return word;
    });
    return { corrected: correctedWords.join(' '), wasChanged };
  }

  /**
   * Dice coefficient using character bigrams
   */
  static bigramSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return a[0] === b[0] ? 0.5 : 0;
    const getBigrams = (s: string): Set<string> => {
      const set = new Set<string>();
      for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
      return set;
    };
    const biA = getBigrams(a.toLowerCase());
    const biB = getBigrams(b.toLowerCase());
    let intersect = 0;
    biA.forEach(bg => { if (biB.has(bg)) intersect++; });
    return (2 * intersect) / (biA.size + biB.size);
  }
}
