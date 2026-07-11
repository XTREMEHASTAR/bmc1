import OpenAI from 'openai';
import { EmergencyRegistration, TriageCategory, AIInsight, CopilotMessage, TriageFormInputs } from '../../types/emergency';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const hasOpenAI = () => Boolean(import.meta.env.VITE_OPENAI_API_KEY);

// ============================================================
// TRIAGE AGENT
// Calculate AI risk score and suggested triage category
// ============================================================
export async function runTriageAgent(inputs: TriageFormInputs, injuryMechanism: string): Promise<{
  risk_score: number;
  suggested_category: TriageCategory;
  reasoning: string;
  rts_score: number;
}> {
  const gcs = inputs.gcs_eye + inputs.gcs_verbal + inputs.gcs_motor;

  // Revised Trauma Score (RTS) calculation
  const gcsCode = gcs >= 13 ? 4 : gcs >= 9 ? 3 : gcs >= 6 ? 2 : gcs >= 4 ? 1 : 0;
  const bpCode = inputs.sys_bp >= 90 ? 4 : inputs.sys_bp >= 76 ? 3 : inputs.sys_bp >= 50 ? 2 : inputs.sys_bp >= 1 ? 1 : 0;
  const rrCode = (inputs.rr_rate >= 10 && inputs.rr_rate <= 29) ? 4 : inputs.rr_rate > 29 ? 3 : (inputs.rr_rate >= 6) ? 2 : inputs.rr_rate >= 1 ? 1 : 0;
  const rts = Number((0.9368 * gcsCode + 0.7326 * bpCode + 0.2908 * rrCode).toFixed(2));

  // Rule-based risk score
  let risk = 0;
  if (inputs.spo2 < 90) risk += 30;
  else if (inputs.spo2 < 94) risk += 15;
  if (gcs <= 8) risk += 25;
  else if (gcs <= 12) risk += 10;
  if (inputs.heart_rate > 120 || inputs.heart_rate < 50) risk += 15;
  if (inputs.sys_bp < 90) risk += 20;
  if (inputs.rr_rate > 30 || inputs.rr_rate < 8) risk += 10;
  risk = Math.min(100, risk);

  const suggested: TriageCategory = risk >= 70 ? 'RED' : risk >= 40 ? 'YELLOW' : 'GREEN';

  if (!hasOpenAI()) {
    return {
      risk_score: risk,
      suggested_category: suggested,
      reasoning: `Computed RTS: ${rts}. GCS: ${gcs}. SpO2: ${inputs.spo2}%. Systolic BP: ${inputs.sys_bp} mmHg. Rule-based risk: ${risk}%.`,
      rts_score: rts,
    };
  }

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a trauma triage AI for MCGM Mumbai Emergency Department. Respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `Triage this patient:
Injury: ${injuryMechanism}
HR: ${inputs.heart_rate} bpm
BP: ${inputs.sys_bp} mmHg systolic
RR: ${inputs.rr_rate} /min
SpO2: ${inputs.spo2}%
GCS: ${gcs} (E:${inputs.gcs_eye} V:${inputs.gcs_verbal} M:${inputs.gcs_motor})
RTS: ${rts}

Respond with JSON: { "risk_score": 0-100, "category": "RED|YELLOW|GREEN", "reasoning": "brief clinical reasoning under 60 words" }`,
        },
      ],
    });

    const json = JSON.parse(resp.choices[0].message.content || '{}');
    return {
      risk_score: json.risk_score ?? risk,
      suggested_category: json.category ?? suggested,
      reasoning: json.reasoning ?? 'AI analysis complete.',
      rts_score: rts,
    };
  } catch {
    return { risk_score: risk, suggested_category: suggested, reasoning: `RTS: ${rts}. Risk score: ${risk}%.`, rts_score: rts };
  }
}

// ============================================================
// PATIENT SUMMARY AGENT
// ============================================================
export async function generatePatientSummary(reg: EmergencyRegistration): Promise<string> {
  const v = reg.latest_vitals;
  const t = reg.triage;

  if (!hasOpenAI() || !reg.patient) {
    return `EMERGENCY SUMMARY — ${reg.patient?.name || 'Unknown'} | ${reg.patient?.age || '?'}${reg.patient?.gender?.[0] || ''} | ABHA: ${reg.patient?.abha_id || 'Pending'}\n\nPresentation: ${reg.injury_mechanism || reg.chief_complaint}\n\nTriage: ${t?.category} | GCS: ${t?.gcs_total}/15 | RTS: ${t?.rts_score}\n\nVitals: HR ${v?.heart_rate} | BP ${v?.systolic_bp}/${v?.diastolic_bp} | SpO2 ${v?.spo2}% | RR ${v?.respiratory_rate} | Temp ${v?.temperature}°F\n\nAI Risk Score: ${t?.ai_risk_score}%\n\nAllergies: ${reg.patient?.allergies?.map(a => a.allergen).join(', ') || 'None known'}\n\nStatus: ${reg.status}`;
  }

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an emergency medicine AI scribe. Write a concise SOAP-style clinical summary for handover.' },
        {
          role: 'user',
          content: `Generate a clinical summary for: ${JSON.stringify({
            name: reg.patient?.name, age: reg.patient?.age, gender: reg.patient?.gender,
            presentation: reg.injury_mechanism || reg.chief_complaint, status: reg.status,
            triage: t?.category, gcs: t?.gcs_total, rts: t?.rts_score, risk: t?.ai_risk_score,
            hr: v?.heart_rate, bp: `${v?.systolic_bp}/${v?.diastolic_bp}`, spo2: v?.spo2, rr: v?.respiratory_rate,
            allergies: reg.patient?.allergies?.map(a => a.allergen),
          })}`,
        },
      ],
    });
    return resp.choices[0].message.content || 'Summary unavailable.';
  } catch {
    return `${reg.patient?.name} — ${t?.category} triage. ${reg.injury_mechanism || reg.chief_complaint}. GCS ${t?.gcs_total}. Awaiting full AI summary.`;
  }
}

// ============================================================
// COPILOT AGENT
// ============================================================
export async function runCopilotAgent(
  messages: CopilotMessage[],
  context: { registrations?: EmergencyRegistration[]; resources?: unknown[] }
): Promise<string> {
  const systemContext = context.registrations?.slice(0, 5).map(r => ({
    id: r.registration_no, name: r.patient?.name, status: r.status,
    triage: r.triage?.category, risk: r.triage?.ai_risk_score,
    vitals: r.latest_vitals ? `HR:${r.latest_vitals.heart_rate} SpO2:${r.latest_vitals.spo2}%` : 'N/A',
  })) || [];

  if (!hasOpenAI()) {
    const last = messages[messages.length - 1]?.text?.toLowerCase() || '';
    if (last.includes('bay 1') || last.includes('patil')) return 'Santosh Patil in Bay 1: RED triage, GCS 9, subdural hematoma 12mm on CT. 2 units O-Negative reserved.';
    if (last.includes('blood')) return 'Blood Bank: 12 units O-Negative available. 6 pre-ordered for incoming transits.';
    if (last.includes('icu')) return 'ICU: 3 of 24 beds available. High occupancy. Recommend reserve for incoming RED patient.';
    if (last.includes('ct') || last.includes('radiology')) return 'CT Room 1 active. CT Room 2 standby. Average turnaround: 14.8 min.';
    if (last.includes('ambulance')) return 'AMB-MCGM-03 ETA 4 min (Santosh Patil). AMB-MCGM-09 ETA 9 min (Sunita Deshmukh). 1 unit available.';
    return 'Command acknowledged. Please configure your OpenAI API key for full AI copilot functionality. Currently running in offline mode.';
  }

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are the MCGM Sion Emergency Department AI Copilot. Current ER context: ${JSON.stringify(systemContext)}. Answer concisely in under 80 words. You can: summarize patients, check resources, issue clinical guidance, recommend actions.`,
        },
        ...messages.map(m => ({
          role: m.sender === 'AI' ? 'assistant' as const : 'user' as const,
          content: m.text,
        })),
      ],
    });
    return resp.choices[0].message.content || 'No response.';
  } catch (err) {
    return 'AI Copilot temporarily unavailable. Please try again.';
  }
}

// ============================================================
// AI INSIGHTS GENERATOR
// ============================================================
export async function generateAIInsights(registrations: EmergencyRegistration[]): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  // Rule-based insights (always run)
  const criticalPatients = registrations.filter(r => r.triage?.category === 'RED');
  const lowSpo2 = registrations.filter(r => (r.latest_vitals?.spo2 || 100) < 90);
  const pendingTriage = registrations.filter(r => r.triage?.category === 'PENDING');
  const longWait = registrations.filter(r => {
    const mins = (Date.now() - new Date(r.arrival_time).getTime()) / 60000;
    return mins > 30 && r.triage?.category === 'RED';
  });

  if (criticalPatients.length > 2) {
    insights.push({ id: 'i-1', type: 'CRITICAL', title: 'Multiple Critical Patients', body: `${criticalPatients.length} RED triage patients active. Recommend activating surge protocol.`, action: 'ACTIVATE_SURGE', created_at: new Date().toISOString() });
  }

  if (lowSpo2.length > 0) {
    insights.push({ id: 'i-2', type: 'WARNING', title: 'Hypoxia Alert', body: `${lowSpo2.map(r => r.patient?.name?.split(' ')[0]).join(', ')} have SpO2 < 90%. Immediate respiratory support required.`, action: 'RESPIRATORY_ALERT', created_at: new Date().toISOString() });
  }

  if (pendingTriage.length > 0) {
    insights.push({ id: 'i-3', type: 'WARNING', title: 'Triage Backlog', body: `${pendingTriage.length} patient(s) awaiting triage assignment. Longest wait: ${Math.round((Date.now() - new Date(pendingTriage[0].arrival_time).getTime()) / 60000)} min.`, created_at: new Date().toISOString() });
  }

  if (longWait.length > 0) {
    insights.push({ id: 'i-4', type: 'CRITICAL', title: 'Golden Hour Breach Risk', body: `${longWait.map(r => r.patient?.name?.split(' ')[0]).join(', ')} — RED patients > 30 min in ER. CT/OT urgency escalation recommended.`, action: 'ESCALATE_OT', created_at: new Date().toISOString() });
  }

  insights.push({ id: 'i-5', type: 'INFO', title: 'Blood Bank Status', body: 'O-Negative reserve at 12 units (35% capacity). Pre-order 10 units recommended given incoming traumas.', action: 'ORDER_BLOOD', created_at: new Date().toISOString() });
  insights.push({ id: 'i-6', type: 'RECOMMENDATION', title: 'Reserve ICU Bed', body: 'Santosh Patil (Bay 1) likely requires ICU post-OT. Recommend reserving 1 ICU bed now.', action: 'RESERVE_ICU', created_at: new Date().toISOString() });

  return insights;
}

// ============================================================
// VOICE COMMAND AGENT — Intent classification
// ============================================================
export interface VoiceIntent {
  intent: string;
  action: string;
  params: Record<string, string>;
  confidence: number;
  requires_confirmation: boolean;
  display_text: string;
}

const VOICE_PATTERNS: Array<{ pattern: RegExp; intent: string; action: string; confirmation: boolean }> = [
  { pattern: /register patient/i, intent: 'REGISTER_PATIENT', action: 'OPEN_REGISTRATION_MODAL', confirmation: false },
  { pattern: /open patient (.+)/i, intent: 'OPEN_PATIENT', action: 'NAVIGATE_TO_PATIENT', confirmation: false },
  { pattern: /assign bay (\d+)/i, intent: 'ASSIGN_BAY', action: 'ASSIGN_BAY', confirmation: true },
  { pattern: /reserve icu/i, intent: 'RESERVE_ICU', action: 'RESERVE_ICU', confirmation: true },
  { pattern: /reserve ot/i, intent: 'RESERVE_OT', action: 'RESERVE_OT', confirmation: true },
  { pattern: /code blue/i, intent: 'CODE_BLUE', action: 'BROADCAST_CODE_BLUE', confirmation: true },
  { pattern: /order ct/i, intent: 'ORDER_CT', action: 'CREATE_RADIOLOGY_ORDER', confirmation: true },
  { pattern: /order mri/i, intent: 'ORDER_MRI', action: 'CREATE_RADIOLOGY_ORDER', confirmation: true },
  { pattern: /call blood bank/i, intent: 'CALL_BLOOD_BANK', action: 'OPEN_BLOOD_REQUEST', confirmation: false },
  { pattern: /notify (trauma team|neurosurgeon|cardiologist)/i, intent: 'NOTIFY_TEAM', action: 'SEND_NOTIFICATION', confirmation: true },
  { pattern: /declare mci|mass casualty/i, intent: 'DECLARE_MCI', action: 'ACTIVATE_MCI', confirmation: true },
  { pattern: /cancel mci|normal mode/i, intent: 'CANCEL_MCI', action: 'DEACTIVATE_MCI', confirmation: true },
  { pattern: /show (critical|red) patients/i, intent: 'FILTER_CRITICAL', action: 'FILTER_PATIENTS', confirmation: false },
  { pattern: /summarize patient (.+)/i, intent: 'SUMMARIZE_PATIENT', action: 'GENERATE_SUMMARY', confirmation: false },
  { pattern: /generate (clinical )?notes/i, intent: 'CLINICAL_NOTES', action: 'GENERATE_NOTES', confirmation: false },
  { pattern: /show (triage|triage board)/i, intent: 'SHOW_TRIAGE', action: 'NAVIGATE_TRIAGE', confirmation: false },
  { pattern: /show (lab|laboratory)/i, intent: 'SHOW_LAB', action: 'NAVIGATE_LAB', confirmation: false },
  { pattern: /show (radiology|x.ray)/i, intent: 'SHOW_RADIOLOGY', action: 'NAVIGATE_RADIOLOGY', confirmation: false },
  { pattern: /transfer patient/i, intent: 'TRANSFER_PATIENT', action: 'OPEN_TRANSFER', confirmation: true },
  { pattern: /discharge patient/i, intent: 'DISCHARGE', action: 'OPEN_DISCHARGE', confirmation: true },
];

export function classifyVoiceIntent(transcript: string): VoiceIntent {
  const lower = transcript.toLowerCase().trim();

  for (const p of VOICE_PATTERNS) {
    const match = lower.match(p.pattern);
    if (match) {
      const params: Record<string, string> = {};
      if (match[1]) params.subject = match[1];
      return {
        intent: p.intent,
        action: p.action,
        params,
        confidence: 0.92,
        requires_confirmation: p.confirmation,
        display_text: `Intent: ${p.intent.replace(/_/g, ' ')}`,
      };
    }
  }

  return {
    intent: 'UNKNOWN',
    action: 'LOG_QUERY',
    params: { transcript },
    confidence: 0.4,
    requires_confirmation: false,
    display_text: `Query logged: "${transcript}"`,
  };
}
