/**
 * MCGM Arogya Voice AI — Speech Normalizer
 * Cleans, normalizes, and fuzzy-corrects speech recognition output.
 * Covers ALL portals: Doctor, Nurse, Patient, Emergency, Radiology,
 * Pharmacy, Laboratory, Surgery, ICU, PMO, and system-wide commands.
 */

// ── Known vocabulary for fuzzy correction ───────────────────────────────────
const KNOWN_KEYWORDS = [
  // Navigation & System
  'appointments', 'queue', 'dashboard', 'portal', 'tab', 'open', 'close',
  'show', 'switch', 'navigate', 'home', 'settings', 'logout', 'help',
  'dark', 'light', 'theme', 'mode', 'status', 'refresh', 'next', 'skip',
  'previous', 'back', 'confirm', 'cancel', 'submit', 'approve', 'reject',
  'save', 'record', 'start', 'stop', 'end', 'begin', 'toggle',

  // Doctor Portal
  'patient', 'patients', 'prescribe', 'prescription', 'medication',
  'discharge', 'sign', 'consultation', 'consult', 'workspace',
  'diagnosis', 'referral', 'refer', 'ecg', 'telemetry', 'twin',
  'digital', 'messages', 'timeline', 'roster', 'duty',

  // Scribe / Documentation
  'scribe', 'ambient', 'recording', 'soap', 'generate', 'compile',
  'notes', 'clinical', 'progress', 'handover', 'certificate',
  'summary', 'discharge', 'letter',

  // Nurse Portal
  'vitals', 'ward', 'beds', 'tasks', 'nursing', 'meds', 'administer',
  'inventory', 'stock', 'supplies', 'handover', 'shift', 'transfer',
  'verify', 'medication', 'wristband', 'triage',

  // Patient Portal
  'book', 'booking', 'appointment', 'teleconsult', 'video', 'call',
  'abha', 'wallet', 'balance', 'records', 'medical', 'profile',
  'emergency', 'sos',

  // Emergency
  'registration', 'register', 'intake', 'unknown', 'male', 'female',
  'accident', 'trauma', 'vehicle', 'ambulance', 'wristband', 'uhid',
  'triage', 'resuscitation', 'stabilization', 'casualty',

  // Lab & Diagnostics
  'laboratory', 'lab', 'pathology', 'blood', 'test', 'order',
  'cbc', 'lft', 'rft', 'hba1c', 'crp', 'kft', 'tsh', 'thyroid',
  'lipid', 'urine', 'culture', 'sensitivity', 'esr', 'widal',
  'dengue', 'malaria', 'typhoid', 'electrolytes', 'coagulation',
  'pt', 'inr', 'aptt', 'd-dimer', 'troponin', 'bnp', 'procalcitonin',

  // Radiology / Imaging
  'radiology', 'imaging', 'xray', 'x-ray', 'mri', 'ct', 'scan',
  'ultrasound', 'usg', 'doppler', 'mammography', 'fluoroscopy',
  'zoom', 'rotate', 'annotate', 'compare', 'contrast', 'pacs',
  'dicom', 'window', 'level', 'measure', 'report',

  // Pharmacy
  'pharmacy', 'dispense', 'stock', 'inventory', 'generic', 'brand',
  'alternative', 'interaction', 'replace', 'batch', 'expiry',
  'paracetamol', 'pcm', 'crocin', 'dolo', 'aceclofenac', 'hifenac',
  'pantoprazole', 'pantocid', 'amoxicillin', 'mox', 'augmentin',
  'azithromycin', 'azee', 'cefixime', 'taxim', 'ciprofloxacin',
  'aspirin', 'ecosprin', 'metformin', 'glycomet', 'atorvastatin',
  'lipvas', 'amlodipine', 'stamlo', 'losartan', 'repace',
  'omeprazole', 'rabeprazole', 'razo', 'metoprolol', 'atenolol',
  'ibuprofen', 'diclofenac', 'voveran', 'tramadol', 'gabapentin',
  'insulin', 'glimepiride', 'telmisartan', 'ramipril', 'enalapril',
  'furosemide', 'lasix', 'spironolactone', 'hydrochlorothiazide',
  'prednisolone', 'dexamethasone', 'methylprednisolone',
  'ondansetron', 'domperidone', 'ranitidine', 'sucralfate',
  'montelukast', 'levocetirizine', 'cetirizine', 'fexofenadine',
  'salbutamol', 'budesonide', 'formoterol', 'tiotropium',
  'clopidogrel', 'warfarin', 'enoxaparin', 'heparin',
  'levothyroxine', 'carbimazole', 'propylthiouracil',

  // Surgery / ICU
  'surgery', 'surgical', 'operation', 'theatre', 'ot', 'anesthesia',
  'pre-op', 'post-op', 'intubation', 'ventilator', 'icu',
  'intensive', 'critical', 'code', 'blue', 'rapid', 'response',

  // Vitals & Measurements
  'pressure', 'pulse', 'temperature', 'oxygen', 'spo2', 'respiration',
  'heart', 'rate', 'systolic', 'diastolic', 'bmi', 'weight', 'height',
  'sugar', 'glucose', 'grbs',

  // Symptoms (EN + Hinglish/Marathi)
  'fever', 'cough', 'headache', 'pain', 'stiffness', 'swelling',
  'breathlessness', 'nausea', 'vomiting', 'diarrhea', 'fatigue',
  'dizziness', 'chest', 'abdominal', 'joint', 'back', 'knee',
  'shoulder', 'fracture', 'wound', 'laceration', 'burn', 'rash',
  'allergy', 'itching', 'bleeding', 'infection',
  // Hindi/Marathi
  'taap', 'bukhar', 'khokla', 'khansi', 'doke', 'dukhi',
  'dard', 'sujan', 'suj', 'ulti', 'dast', 'thakan',
  'chakkar', 'seena', 'pet', 'ghutna', 'kamar', 'haddi',
  'zakhm', 'jalan', 'kharish', 'khun',

  // Departments
  'orthopedics', 'cardiology', 'neurology', 'pediatrics', 'gynecology',
  'dermatology', 'ophthalmology', 'ent', 'urology', 'nephrology',
  'gastroenterology', 'pulmonology', 'oncology', 'psychiatry',
  'general', 'medicine', 'dental',

  // Analytics & Reports
  'analytics', 'statistics', 'summary', 'explain', 'summarize',
  'guideline', 'occupancy', 'revenue', 'census', 'audit', 'quality',
  'compliance', 'kpi', 'performance', 'trend',
];

// ── Regex normalization patterns ────────────────────────────────────────────
const NORMALIZATION_MAP: [RegExp, string][] = [
  // ═══ SCRIBE / AMBIENT DOCUMENTATION ═══
  [/start[s]?\s+(scribe|crime|script|shrine|crib|tribe|subscribe|scribing|scrying|writing|prescribed)/i, 'start scribe'],
  [/begin\s+(scribe|ambient|recording|consultation\s+recording)/i, 'start scribe'],
  [/stop\s+(scribe|crime|script|shrine|crib|tribe|scribing|scrying|writing)/i, 'stop scribe'],
  [/end\s+(scribe|ambient|recording|consultation\s+recording)/i, 'stop scribe'],
  [/pause\s+(scribe|recording|ambient)/i, 'stop scribe'],
  [/resume\s+(scribe|recording|ambient)/i, 'start scribe'],

  // ═══ SOAP / CLINICAL NOTES ═══
  [/generate\s+(soap|so[au]p|notes?|clinical\s+notes?)/i, 'generate soap'],
  [/create\s+(soap|so[au]p|clinical\s+notes?)/i, 'generate soap'],
  [/compile\s+(soap|notes?|clinical)/i, 'generate soap'],
  [/soap\s+note/i, 'generate soap'],

  // ═══ DISCHARGE ═══
  [/discharge\s*summ\w*|generate\s+discharge|open\s+discharge|discharge\s+report/i, 'discharge summary'],

  // ═══ HANDOVER ═══
  [/generate\s+handover|handover\s+report|shift\s+handover|create\s+handover/i, 'generate handover'],

  // ═══ HELP ═══
  [/sh[ao]k\s*commands?|shock\s*commands?|show\s*command/i, 'help'],
  [/what can (you|i) do|available commands?|commands? list|list commands/i, 'help'],
  [/voice\s+commands?|all\s+commands?/i, 'help'],

  // ═══ PRESCRIBE ═══
  [/prescribe\s+(\w+)|add\s+med(ication|icine|s)?/i, 'prescribe'],
  [/presc?rib?\w*/i, 'prescribe'],

  // ═══ SIGN / APPROVE ═══
  [/sign\s+(and\s+)?approve|digital\s+sign(ature)?|approve\s+presc\w*|sign\s+prescription/i, 'sign prescription'],

  // ═══ APPOINTMENTS / QUEUE ═══
  [/today['']?s?\s*appointments?|today\s+appointments?|appoint\w*/i, "today's appointments"],
  [/show\s+queue|open\s+queue|opd\s+queue|waiting\s+list/i, 'queue'],
  [/next\s*patient|call\s*next/i, 'next patient'],
  [/skip\s*patient|skip|defer\s*patient/i, 'skip patient'],

  // ═══ PORTAL NAVIGATION ═══
  [/open\s+nurs\w*|switch\s+to\s+nurse|nurse\s+portal/i, 'open nurse'],
  [/open\s+doc\w*|switch\s+to\s+doctor|doctor\s+portal/i, 'open doctor'],
  [/open\s+emerg\w*|casualty\s+portal|emergency\s+department/i, 'open emergency'],
  [/open\s+lab\w*|pathology\s+portal|laboratory\s+portal/i, 'open laboratory'],
  [/open\s+pharm\w*|pharmacy\s+portal/i, 'open pharmacy'],
  [/open\s+icu|intensive\s+care|critical\s+care\s+portal/i, 'open icu'],
  [/open\s+radio\w*|imaging\s+portal|x-?ray|xray|ris\s+pacs/i, 'open radiology'],
  [/open\s+surg\w*|surgery\s+portal|ot\s+portal|operation\s+theatre/i, 'open surgery'],
  [/open\s+patient\s+portal|patient\s+view/i, 'open patient'],
  [/open\s+pmo|pmo\s+portal|admin\s+portal/i, 'open pmo'],
  [/open\s+command|command\s+center|command\s+portal/i, 'open command'],
  [/open\s+ai|ai\s+portal|intelligence\s+portal/i, 'open ai'],
  [/open\s+quality|quality\s+portal/i, 'open quality'],
  [/open\s+devops|devops\s+portal/i, 'open devops'],
  [/open\s+integration|integration\s+portal/i, 'open integration'],
  [/open\s+vision|vision\s+portal/i, 'open vision'],

  // ═══ DOCTOR TAB NAVIGATION ═══
  [/go\s+to\s+dashboard|main\s+screen|home\s+tab/i, 'open dashboard'],
  [/digital\s+twin|ecg\s+tab|ecg\s+telemetry|show\s+ecg/i, 'digital twin'],
  [/consultation\s+tab|consult\s+tab|prescription\s+pad|workspace/i, 'consultation'],
  [/lab\s+tab|lab\s+orders?|pathology\s+tab/i, 'lab tab'],
  [/reports?\s+tab|radiology\s+tab|imaging\s+results?/i, 'reports'],
  [/messages?\s+tab|nurse\s+chat|chat\s+tab|send\s+message/i, 'messages'],
  [/timeline|duty\s+roster|schedule/i, 'timeline'],
  [/portal\s+settings|settings\s+tab|preferences/i, 'settings'],

  // ═══ NURSE TAB NAVIGATION ═══
  [/ward\s+beds?|patient\s+ward|ward\s+overview/i, 'ward'],
  [/vital\s+signs?|record\s+vitals?/i, 'vitals'],
  [/nursing\s+tasks?|task\s+list/i, 'tasks'],
  [/medication\s+tab|administer\s+meds?|meds?\s+tab/i, 'meds'],
  [/shift\s+handover|shift\s+report/i, 'handover'],

  // ═══ PATIENT NAVIGATION ═══
  [/medical\s+records?|my\s+records?|view\s+records?/i, 'medical records'],
  [/my\s+wallet|check\s+balance/i, 'my wallet'],
  [/book\s+appointment|book\s+opd|new\s+booking/i, 'book appointment'],
  [/start\s+consult|video\s+consult|call\s+doctor|teleconsult\w*/i, 'start consult'],
  [/view\s+abha|show\s+abha|abha\s+card|digital\s+health\s+card/i, 'view abha'],

  // ═══ SEARCH ═══
  [/search\s+(for\s+)?patient|find\s+patient|look\s+up\s+patient/i, 'search patient'],
  [/search\s+reports?|find\s+reports?/i, 'search reports'],
  [/search\s+medic\w*|find\s+medic\w*/i, 'search medicines'],
  [/search\s+labs?|find\s+labs?/i, 'search labs'],

  // ═══ ANALYTICS ═══
  [/show\s+analytics|open\s+analytics|hospital\s+analytics/i, 'open analytics'],
  [/show\s+statistics|hospital\s+statistics/i, 'show statistics'],
  [/bed\s+occupancy|occupancy\s+rate/i, 'bed occupancy'],
  [/revenue\s+report|financial\s+report/i, 'revenue report'],

  // ═══ EMERGENCY ═══
  [/code\s+blue|cardiac\s+arrest/i, 'code blue'],
  [/rapid\s+response|sos|emergency\s+alert/i, 'sos'],
  [/road\s+(traffic\s+)?accident|rta|accident\s+case/i, 'road traffic accident'],
  [/unknown\s+male\s*(patient)?/i, 'unknown male'],
  [/unknown\s+female\s*(patient)?/i, 'unknown female'],
  [/private\s+vehicle|car\s+arrival/i, 'private vehicle'],
  [/generate\s+(temp\s+)?uhid|create\s+(temp\s+)?uhid/i, 'generate uhid'],
  [/print\s+wristband|wristband\s+print/i, 'print wristband'],
  [/complete\s+registration|submit\s+intake|save\s+intake/i, 'complete registration'],
  [/open\s+registration|register\s+(emergency\s+)?patient|start\s+registration/i, 'open registration'],

  // ═══ VITALS (nurse) ═══
  [/save\s+vitals?|confirm\s+vitals?|submit\s+vitals?/i, 'save vitals'],
  [/transfer\s+to\s+icu|icu\s+transfer|shift\s+to\s+icu/i, 'transfer to icu'],
  [/medication\s+given|confirm\s+medication|verify\s+med\w*/i, 'verify medication'],

  // ═══ LAB ORDERS ═══
  [/order\s+(a\s+)?cbc|cbc\s+test/i, 'order lab cbc'],
  [/order\s+(a\s+)?lft|liver\s+function/i, 'order lab lft'],
  [/order\s+(a\s+)?rft|renal\s+function|kidney\s+function/i, 'order lab rft'],
  [/order\s+(a\s+)?thyroid|tsh\s+test/i, 'order lab thyroid'],
  [/order\s+(a\s+)?lipid|lipid\s+profile/i, 'order lab lipid'],
  [/order\s+blood\s+test|order\s+lab/i, 'order lab'],

  // ═══ RADIOLOGY ═══
  [/order\s+(an?\s+)?(x-?ray|xray)/i, 'order xray'],
  [/order\s+(an?\s+)?mri/i, 'order mri'],
  [/order\s+(a\s+)?ct\s+scan/i, 'order ct scan'],
  [/order\s+(an?\s+)?ultrasound|order\s+(a\s+)?usg/i, 'order ultrasound'],

  // ═══ THEME ═══
  [/dark\s+mode|night\s+mode/i, 'dark mode'],
  [/light\s+mode|day\s+mode/i, 'light mode'],
  [/toggle\s+theme/i, 'toggle theme'],

  // ═══ LOGOUT ═══
  [/log\s*out|sign\s*out|end\s+session/i, 'logout'],

  // ═══ SYSTEM STATUS ═══
  [/system\s+status|arogya\s+status|show\s+status/i, 'system status'],

  // ═══ HINGLISH / MARATHI MEDICAL PHRASES ═══
  [/bukhar\s+hai|taap\s+aala|fever\s+h[ae]i?/i, 'fever'],
  [/khansi\s+hai|khokla\s+aala/i, 'cough'],
  [/sir\s+dard|doke\s+dukh\w*/i, 'headache'],
  [/pet\s+dard|pota\s+dukh\w*/i, 'abdominal pain'],
  [/ghutna\s+dard|gudgha\s+dukh\w*/i, 'knee pain'],
  [/seena\s+dard|chhaati\s+dard|chest\s+pain/i, 'chest pain'],
  [/sans\s+(lene\s+mein\s+)?taklif|shvas\s+ghen/i, 'breathlessness'],
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
      wasChanged: wasChanged || (normalized !== lower),
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
   * Bigram-similarity + Levenshtein fuzzy correction for individual misspelled words
   */
  static fuzzyCorrect(text: string): { corrected: string; wasChanged: boolean } {
    const words = text.split(' ');
    let wasChanged = false;
    const correctedWords = words.map(word => {
      if (word.length < 3) return word;
      const clean = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (KNOWN_KEYWORDS.includes(clean)) return word;

      let bestScore = 0;
      let bestKeyword = '';
      for (const kw of KNOWN_KEYWORDS) {
        // Skip if length difference is too large (no chance of match)
        if (Math.abs(clean.length - kw.length) > 3) continue;

        const bigramScore = SpeechNormalizer.bigramSimilarity(clean, kw);
        const levenScore = 1 - (SpeechNormalizer.levenshteinDistance(clean, kw) / Math.max(clean.length, kw.length));
        // Weighted: 60% bigram + 40% levenshtein for better accuracy
        const score = bigramScore * 0.6 + levenScore * 0.4;

        if (score > bestScore) { bestScore = score; bestKeyword = kw; }
      }
      if (bestScore >= 0.55 && bestKeyword) {
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

  /**
   * Levenshtein edit distance (for secondary fuzzy scoring)
   */
  static levenshteinDistance(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }
}
