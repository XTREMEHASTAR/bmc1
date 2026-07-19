// ============================================================
// MCGM Clinical NLP Extraction Engine
// Extracts structured clinical data from doctor speech in real-time
// Pure regex/pattern-based (works offline, zero latency)
// ============================================================

import type { ExtractedClinicalData, ExtractedMedication, ExtractedProcedure, ProcedureType } from '../../types/clinical';

export function createEmptyExtraction(): ExtractedClinicalData {
  return {
    symptoms: [], duration: '', examination_findings: [], medications: [],
    lab_orders: [], radiology_orders: [], procedures: [], diet: '',
    admission_department: '', admission_ward: '', nursing_orders: [],
    referrals: [], follow_up_days: null, follow_up_tests: [],
    diagnosis_suggestions: [], raw_segments: [],
  };
}

// Known medical terms for matching
const LAB_TESTS = [
  'cbc','complete blood count','hemoglobin','hb','wbc','platelet','esr',
  'crp','c reactive protein','lft','liver function','kft','kidney function',
  'rft','renal function','serum creatinine','creatinine','bun','urea',
  'serum amylase','amylase','lipase','serum lipase','blood sugar','rbs',
  'fbs','fasting blood sugar','ppbs','hba1c','glycated hemoglobin',
  'thyroid','tsh','t3','t4','electrolytes','sodium','potassium',
  'calcium','magnesium','phosphorus','uric acid','troponin','bnp',
  'pt inr','inr','aptt','d dimer','blood culture','urine culture',
  'urine routine','urine analysis','stool routine','stool culture',
  'blood group','cross match','peripheral smear','reticulocyte',
  'procalcitonin','lactate','abg','arterial blood gas','coagulation',
  'fibrinogen','ldh','cpk','ck mb','ast','alt','sgot','sgpt',
  'alkaline phosphatase','alp','ggt','bilirubin','albumin','protein',
  'globulin','iron','ferritin','tibc','vitamin d','vitamin b12',
  'folate','psa','ca 125','cea','afp','hiv','hbsag','hcv','vdrl',
  'widal','dengue','malaria','covid','rt pcr','rapid antigen',
];

const RADIOLOGY_STUDIES = [
  'x ray','xray','x-ray','chest x ray','chest xray','abdominal x ray',
  'ct scan','ct','computed tomography','cect','hrct','ct head','ct brain',
  'ct abdomen','ct chest','ct spine','ct pelvis','ct angiography','cta',
  'mri','mri brain','mri spine','mri abdomen','mri pelvis','mri knee',
  'ultrasound','usg','ultrasonography','ultrasound abdomen','usg abdomen',
  'usg pelvis','usg kub','doppler','echo','echocardiography','2d echo',
  'ecg','ekg','electrocardiogram','eeg','emg','ncv',
  'mammography','dexa scan','bone scan','pet scan','pet ct',
  'fluoroscopy','barium swallow','barium meal','barium enema',
  'ivp','intravenous pyelogram','mcug','rgu',
];

const KNOWN_DRUGS: Record<string, { generic: string; category: string }> = {
  'pantoprazole': { generic: 'Pantoprazole', category: 'PPI' },
  'omeprazole': { generic: 'Omeprazole', category: 'PPI' },
  'rabeprazole': { generic: 'Rabeprazole', category: 'PPI' },
  'ondansetron': { generic: 'Ondansetron', category: 'Antiemetic' },
  'metoclopramide': { generic: 'Metoclopramide', category: 'Antiemetic' },
  'domperidone': { generic: 'Domperidone', category: 'Antiemetic' },
  'paracetamol': { generic: 'Paracetamol', category: 'Analgesic' },
  'acetaminophen': { generic: 'Paracetamol', category: 'Analgesic' },
  'ibuprofen': { generic: 'Ibuprofen', category: 'NSAID' },
  'diclofenac': { generic: 'Diclofenac', category: 'NSAID' },
  'tramadol': { generic: 'Tramadol', category: 'Analgesic' },
  'morphine': { generic: 'Morphine', category: 'Opioid' },
  'fentanyl': { generic: 'Fentanyl', category: 'Opioid' },
  'amoxicillin': { generic: 'Amoxicillin', category: 'Antibiotic' },
  'amoxicillin clavulanate': { generic: 'Amoxicillin + Clavulanate', category: 'Antibiotic' },
  'augmentin': { generic: 'Amoxicillin + Clavulanate', category: 'Antibiotic' },
  'azithromycin': { generic: 'Azithromycin', category: 'Antibiotic' },
  'ciprofloxacin': { generic: 'Ciprofloxacin', category: 'Antibiotic' },
  'levofloxacin': { generic: 'Levofloxacin', category: 'Antibiotic' },
  'metronidazole': { generic: 'Metronidazole', category: 'Antibiotic' },
  'ceftriaxone': { generic: 'Ceftriaxone', category: 'Antibiotic' },
  'cefixime': { generic: 'Cefixime', category: 'Antibiotic' },
  'piperacillin tazobactam': { generic: 'Piperacillin + Tazobactam', category: 'Antibiotic' },
  'meropenem': { generic: 'Meropenem', category: 'Antibiotic' },
  'vancomycin': { generic: 'Vancomycin', category: 'Antibiotic' },
  'doxycycline': { generic: 'Doxycycline', category: 'Antibiotic' },
  'metformin': { generic: 'Metformin', category: 'Antidiabetic' },
  'glimepiride': { generic: 'Glimepiride', category: 'Antidiabetic' },
  'insulin': { generic: 'Insulin', category: 'Antidiabetic' },
  'amlodipine': { generic: 'Amlodipine', category: 'Antihypertensive' },
  'losartan': { generic: 'Losartan', category: 'Antihypertensive' },
  'telmisartan': { generic: 'Telmisartan', category: 'Antihypertensive' },
  'atenolol': { generic: 'Atenolol', category: 'Beta Blocker' },
  'metoprolol': { generic: 'Metoprolol', category: 'Beta Blocker' },
  'aspirin': { generic: 'Aspirin', category: 'Antiplatelet' },
  'clopidogrel': { generic: 'Clopidogrel', category: 'Antiplatelet' },
  'heparin': { generic: 'Heparin', category: 'Anticoagulant' },
  'enoxaparin': { generic: 'Enoxaparin', category: 'Anticoagulant' },
  'warfarin': { generic: 'Warfarin', category: 'Anticoagulant' },
  'atorvastatin': { generic: 'Atorvastatin', category: 'Statin' },
  'rosuvastatin': { generic: 'Rosuvastatin', category: 'Statin' },
  'salbutamol': { generic: 'Salbutamol', category: 'Bronchodilator' },
  'albuterol': { generic: 'Salbutamol', category: 'Bronchodilator' },
  'budesonide': { generic: 'Budesonide', category: 'Corticosteroid' },
  'prednisolone': { generic: 'Prednisolone', category: 'Corticosteroid' },
  'dexamethasone': { generic: 'Dexamethasone', category: 'Corticosteroid' },
  'hydrocortisone': { generic: 'Hydrocortisone', category: 'Corticosteroid' },
  'methylprednisolone': { generic: 'Methylprednisolone', category: 'Corticosteroid' },
  'furosemide': { generic: 'Furosemide', category: 'Diuretic' },
  'spironolactone': { generic: 'Spironolactone', category: 'Diuretic' },
  'mannitol': { generic: 'Mannitol', category: 'Osmotic Diuretic' },
  'ranitidine': { generic: 'Ranitidine', category: 'H2 Blocker' },
  'famotidine': { generic: 'Famotidine', category: 'H2 Blocker' },
  'cetirizine': { generic: 'Cetirizine', category: 'Antihistamine' },
  'loratadine': { generic: 'Loratadine', category: 'Antihistamine' },
  'chlorpheniramine': { generic: 'Chlorpheniramine', category: 'Antihistamine' },
  'phenytoin': { generic: 'Phenytoin', category: 'Antiepileptic' },
  'levetiracetam': { generic: 'Levetiracetam', category: 'Antiepileptic' },
  'midazolam': { generic: 'Midazolam', category: 'Benzodiazepine' },
  'diazepam': { generic: 'Diazepam', category: 'Benzodiazepine' },
  'lorazepam': { generic: 'Lorazepam', category: 'Benzodiazepine' },
};

const FREQ_MAP: Record<string, string> = {
  'once daily': 'OD', 'once a day': 'OD', 'od': 'OD', 'daily': 'OD',
  'twice daily': 'BD', 'twice a day': 'BD', 'bd': 'BD', 'bid': 'BD', 'two times': 'BD',
  'three times daily': 'TDS', 'three times a day': 'TDS', 'tds': 'TDS', 'tid': 'TDS', 'thrice daily': 'TDS', 'three times': 'TDS',
  'four times daily': 'QID', 'four times a day': 'QID', 'qid': 'QID', 'four times': 'QID',
  'at bedtime': 'HS', 'at night': 'HS', 'hs': 'HS', 'bedtime': 'HS',
  'as needed': 'SOS', 'sos': 'SOS', 'prn': 'PRN', 'when needed': 'PRN',
  'stat': 'STAT', 'immediately': 'STAT', 'now': 'STAT', 'right now': 'STAT',
};

const ROUTE_MAP: Record<string, string> = {
  'oral': 'PO', 'orally': 'PO', 'by mouth': 'PO', 'po': 'PO', 'tablet': 'PO', 'capsule': 'PO',
  'iv': 'IV', 'intravenous': 'IV', 'intravenously': 'IV',
  'im': 'IM', 'intramuscular': 'IM', 'intramuscularly': 'IM',
  'sc': 'SC', 'subcutaneous': 'SC', 'subcutaneously': 'SC',
  'topical': 'TOPICAL', 'topically': 'TOPICAL', 'apply': 'TOPICAL',
  'inhaler': 'INHALATION', 'inhalation': 'INHALATION', 'nebulization': 'INHALATION', 'nebulize': 'INHALATION',
};

/**
 * Extract structured clinical data from a single speech segment.
 * Called progressively as new finalized segments arrive.
 */
export function extractFromSegment(text: string, existing: ExtractedClinicalData): ExtractedClinicalData {
  const result = { ...existing, raw_segments: [...existing.raw_segments, text] };
  const lower = text.toLowerCase();

  // 1. SYMPTOMS
  const symptomPatterns = [
    /(?:complaining of|complaints? of|c\/o|presents? with|suffering from|has|having)\s+(.+?)(?:\s+since|\s+for|\s+from|\.|$)/gi,
    /(?:pain|ache|discomfort|swelling|bleeding|fever|cough|vomiting|nausea|diarrhea|headache|dizziness|weakness|fatigue|breathlessness|shortness of breath)\b/gi,
  ];
  for (const pat of symptomPatterns) {
    const matches = lower.matchAll(pat);
    for (const m of matches) {
      const symptom = (m[1] || m[0]).trim();
      if (symptom.length > 2 && symptom.length < 80 && !result.symptoms.includes(capitalize(symptom))) {
        result.symptoms.push(capitalize(symptom));
      }
    }
  }

  // 2. DURATION
  const durationMatch = lower.match(/(?:since|for|from)\s+(last\s+)?(\d+\s+(?:day|days|week|weeks|month|months|hour|hours|year|years|night|morning|evening)s?(?:\s+ago)?)/i)
    || lower.match(/since\s+(yesterday|last night|last week|this morning|today|last month)/i);
  if (durationMatch && !result.duration) {
    result.duration = capitalize((durationMatch[1] || '') + (durationMatch[2] || durationMatch[1] || ''));
  }

  // 3. EXAMINATION FINDINGS
  const examPatterns = [
    /(?:on examination|o\/e|on exam|examination shows?|examination reveals?|findings?)\s*[:\-]?\s*(.+?)(?:\.|$)/gi,
    /(?:abdomen|chest|lungs|heart|throat|skin|limbs?|extremit(?:y|ies)|pupil|reflexes?)\s+(?:is|are|shows?|reveals?)\s+(.+?)(?:\.|$)/gi,
    /(tender|tenderness|guarding|rigidity|distension|crepts?|crepitations?|rhonchi|wheeze|murmur|gallop|edema|oedema|pallor|icterus|cyanosis|clubbing|lymphadenopathy)\b/gi,
  ];
  for (const pat of examPatterns) {
    const matches = lower.matchAll(pat);
    for (const m of matches) {
      const finding = capitalize((m[1] || m[0]).trim());
      if (finding.length > 2 && !result.examination_findings.some(f => f.toLowerCase() === finding.toLowerCase())) {
        result.examination_findings.push(finding);
      }
    }
  }

  // 4. MEDICATIONS
  for (const [drugKey, drugInfo] of Object.entries(KNOWN_DRUGS)) {
    if (lower.includes(drugKey)) {
      // Already extracted?
      if (result.medications.some(m => m.drug.toLowerCase() === drugInfo.generic.toLowerCase())) continue;
      
      const med: ExtractedMedication = { drug: drugInfo.generic, dose: '', route: '', frequency: '', duration: '', timing: '' };
      
      // Extract dose near drug mention
      const doseRegion = lower.substring(Math.max(0, lower.indexOf(drugKey) - 10), Math.min(lower.length, lower.indexOf(drugKey) + drugKey.length + 80));
      const doseMatch = doseRegion.match(/(\d+(?:\.\d+)?)\s*(mg|gm|g|ml|mcg|iu|units?|%)/i);
      if (doseMatch) med.dose = `${doseMatch[1]} ${doseMatch[2].toUpperCase()}`;
      
      // Extract route
      for (const [routeKey, routeVal] of Object.entries(ROUTE_MAP)) {
        if (doseRegion.includes(routeKey)) { med.route = routeVal; break; }
      }
      
      // Extract frequency
      for (const [freqKey, freqVal] of Object.entries(FREQ_MAP)) {
        if (doseRegion.includes(freqKey)) { med.frequency = freqVal; break; }
      }
      
      // Extract duration
      const durMatch = doseRegion.match(/(?:for|x)\s*(\d+)\s*(days?|weeks?|months?)/i);
      if (durMatch) med.duration = `${durMatch[1]} ${durMatch[2]}`;
      
      // Extract timing
      if (doseRegion.includes('before food') || doseRegion.includes('before meals') || doseRegion.includes('empty stomach')) med.timing = 'Before food';
      else if (doseRegion.includes('after food') || doseRegion.includes('after meals') || doseRegion.includes('with food')) med.timing = 'After food';
      
      result.medications.push(med);
    }
  }

  // 5. LAB ORDERS
  for (const test of LAB_TESTS) {
    if (lower.includes(test)) {
      const normalized = test.toUpperCase().replace(/\b\w/g, c => c);
      const display = test.length <= 4 ? test.toUpperCase() : capitalize(test);
      if (!result.lab_orders.some(t => t.toLowerCase() === display.toLowerCase())) {
        result.lab_orders.push(display);
      }
    }
  }

  // 6. RADIOLOGY ORDERS
  for (const study of RADIOLOGY_STUDIES) {
    if (lower.includes(study)) {
      const display = capitalize(study);
      if (!result.radiology_orders.some(s => s.toLowerCase() === display.toLowerCase())) {
        result.radiology_orders.push(display);
      }
    }
  }

  // 7. PROCEDURES
  const procedurePatterns: Array<{ pattern: RegExp; type: ProcedureType; name: string }> = [
    { pattern: /(?:start|give|begin|run)\s+(?:iv\s+fluids?|normal saline|ns|ringer|rl|dns|d5|dextrose)(.{0,60})?/i, type: 'IV_FLUIDS', name: 'IV Fluids' },
    { pattern: /(?:start|give|put on)\s+oxygen\b(.{0,40})?/i, type: 'OXYGEN', name: 'Oxygen Therapy' },
    { pattern: /nebuliz(?:e|ation)\b(.{0,40})?/i, type: 'NEBULIZATION', name: 'Nebulization' },
    { pattern: /(?:do|apply|change)\s+dressing\b(.{0,40})?/i, type: 'DRESSING', name: 'Dressing' },
    { pattern: /(?:insert|put|place)\s+(?:foley|urinary)\s*(?:catheter)?\b(.{0,40})?/i, type: 'CATHETERIZATION', name: 'Catheterization' },
    { pattern: /(?:insert|put|place)\s+(?:ng|naso\s*gastric|ryle)\s*(?:tube)?\b(.{0,40})?/i, type: 'NG_TUBE', name: 'NG Tube Insertion' },
    { pattern: /blood\s+transfusion\b(.{0,40})?/i, type: 'BLOOD_TRANSFUSION', name: 'Blood Transfusion' },
    { pattern: /dialysis\b(.{0,40})?/i, type: 'DIALYSIS', name: 'Dialysis' },
    { pattern: /physiotherapy\b(.{0,40})?/i, type: 'PHYSIOTHERAPY', name: 'Physiotherapy' },
    { pattern: /wound\s+care\b(.{0,40})?/i, type: 'WOUND_CARE', name: 'Wound Care' },
  ];
  for (const pp of procedurePatterns) {
    const m = lower.match(pp.pattern);
    if (m && !result.procedures.some(p => p.type === pp.type)) {
      result.procedures.push({ name: pp.name, details: (m[1] || '').trim(), type: pp.type });
    }
  }

  // 8. DIET
  const dietPatterns: Array<{ pattern: RegExp; diet: string }> = [
    { pattern: /\bnpo\b|nil\s+(?:by|per)\s+(?:mouth|oral)/i, diet: 'NPO' },
    { pattern: /liquid\s+diet/i, diet: 'Liquid Diet' },
    { pattern: /soft\s+diet/i, diet: 'Soft Diet' },
    { pattern: /diabetic\s+diet/i, diet: 'Diabetic Diet' },
    { pattern: /low\s+salt\s+diet/i, diet: 'Low Salt Diet' },
    { pattern: /renal\s+diet/i, diet: 'Renal Diet' },
    { pattern: /cardiac\s+diet/i, diet: 'Cardiac Diet' },
    { pattern: /normal\s+diet/i, diet: 'Normal Diet' },
  ];
  for (const dp of dietPatterns) {
    if (dp.pattern.test(lower) && !result.diet) {
      result.diet = dp.diet;
    }
  }

  // 9. ADMISSION
  const admitMatch = lower.match(/(?:admit|admission)\s+(?:under|to|in)\s+(.+?)(?:\.|,|$)/i);
  if (admitMatch && !result.admission_department) {
    result.admission_department = capitalize(admitMatch[1].trim());
  }

  // 10. WARD
  const wardMatch = lower.match(/(?:shift|transfer|move|send)\s+(?:to|in)\s+(.+?(?:ward|icu|hdu|ccu|nicu|picu|unit))(?:\.|,|$)/i);
  if (wardMatch && !result.admission_ward) {
    result.admission_ward = capitalize(wardMatch[1].trim());
  }

  // 11. NURSING ORDERS
  const nursingPatterns = [
    /(?:monitor|check|record)\s+(.+?)\s+(?:every|q)\s*(\d+)\s*(?:hour|hr|hourly|h)/gi,
    /(?:strict|maintain)\s+(intake?\s*(?:and|&)?\s*output|i\/?o)\b/gi,
    /\bbed\s+rest\b/gi,
    /\bfall\s+precautions?\b/gi,
    /\bhead\s+(?:end|of\s+bed)\s+elevation\b/gi,
    /\bposition\s+change\s+every\s+(\d+)\s*(?:hour|hr|h)\b/gi,
    /\bblood\s+sugar\s+monitoring\b/gi,
    /\bstrict\s+input\s*(?:and|&)?\s*output\b/gi,
  ];
  for (const np of nursingPatterns) {
    const matches = lower.matchAll(np);
    for (const m of matches) {
      let instruction = capitalize(m[0].trim());
      if (!result.nursing_orders.some(n => n.toLowerCase() === instruction.toLowerCase())) {
        result.nursing_orders.push(instruction);
      }
    }
  }

  // 12. REFERRALS
  const referMatch = lower.match(/(?:refer|referral|consult)\s+(?:to|with)\s+(.+?)(?:\.|,|$)/i);
  if (referMatch) {
    const spec = capitalize(referMatch[1].trim());
    if (!result.referrals.includes(spec)) result.referrals.push(spec);
  }

  // 13. FOLLOW-UP
  const fuMatch = lower.match(/(?:review|follow\s*up|follow-up|come\s+back|revisit)\s+(?:after|in)\s+(\d+)\s*(days?|weeks?|months?)/i);
  if (fuMatch && !result.follow_up_days) {
    const num = parseInt(fuMatch[1]);
    const unit = fuMatch[2].toLowerCase();
    result.follow_up_days = unit.startsWith('week') ? num * 7 : unit.startsWith('month') ? num * 30 : num;
  }
  // Follow-up tests
  const fuTestMatch = lower.match(/(?:with|bring|repeat)\s+(.+?)\s+(?:report|test|result)/i);
  if (fuTestMatch) {
    const tests = fuTestMatch[1].split(/,|\band\b/).map(t => t.trim()).filter(Boolean);
    for (const t of tests) {
      const display = t.length <= 4 ? t.toUpperCase() : capitalize(t);
      if (!result.follow_up_tests.includes(display)) result.follow_up_tests.push(display);
    }
  }

  return result;
}

function capitalize(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase()).replace(/\s+/g, ' ').trim();
}

/**
 * Check medication safety against known patient data
 */
export function checkMedicationSafety(
  drugName: string,
  patientAllergies: string[],
  activeMeds: string[],
  patientAge?: number,
): Array<{ type: string; severity: string; message: string }> {
  const warnings: Array<{ type: string; severity: string; message: string }> = [];
  const lower = drugName.toLowerCase();

  // Allergy check
  for (const allergy of patientAllergies) {
    if (lower.includes(allergy.toLowerCase()) || allergy.toLowerCase().includes(lower)) {
      warnings.push({ type: 'ALLERGY', severity: 'CRITICAL', message: `⚠️ ALLERGY ALERT: Patient is allergic to ${allergy}. ${drugName} may trigger a reaction.` });
    }
  }

  // Duplicate check
  for (const med of activeMeds) {
    if (med.toLowerCase() === lower) {
      warnings.push({ type: 'DUPLICATE', severity: 'HIGH', message: `Duplicate therapy: ${drugName} is already active in current medications.` });
    }
  }

  // Age-based warnings
  if (patientAge !== undefined) {
    if (patientAge < 12 && ['aspirin'].includes(lower)) {
      warnings.push({ type: 'AGE', severity: 'CRITICAL', message: `Aspirin is contraindicated in children under 12 (Reye syndrome risk).` });
    }
    if (patientAge > 65 && ['metformin'].includes(lower)) {
      warnings.push({ type: 'AGE', severity: 'MEDIUM', message: `Metformin: monitor renal function in patients over 65.` });
    }
  }

  // Known interactions (simplified)
  const interactions: Record<string, string[]> = {
    'warfarin': ['aspirin', 'ibuprofen', 'diclofenac', 'metronidazole'],
    'metformin': ['contrast dye'],
    'heparin': ['aspirin', 'clopidogrel'],
    'digoxin': ['amiodarone', 'verapamil'],
  };
  for (const [drug, interacts] of Object.entries(interactions)) {
    if (lower === drug) {
      for (const activeMed of activeMeds) {
        if (interacts.includes(activeMed.toLowerCase())) {
          warnings.push({ type: 'INTERACTION', severity: 'HIGH', message: `Drug interaction: ${drugName} + ${activeMed}. Monitor closely.` });
        }
      }
    }
  }

  return warnings;
}
