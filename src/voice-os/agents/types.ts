/**
 * MCGM Arogya Voice AI — Multi-Agent Architecture
 * Shared type definitions for all agents
 */

// ── Agent Classification ────────────────────────────────────────────────────
export type AgentType =
  | 'voice_command'    // Agent 1: Speech → Intent → Execute
  | 'conversation'     // Agent 2: ChatGPT-like (explicit only)
  | 'documentation'    // Agent 3: SOAP, Clinical Notes, Discharge
  | 'search'           // Agent 4: Search Patient / Reports / Meds
  | 'analytics'        // Agent 5: Dashboards, Reports, Statistics
  | 'orchestrator';    // Agent 6: Routes, coordinates, context

// ── Confidence Levels ───────────────────────────────────────────────────────
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceResult {
  score: number;          // 0–100
  level: ConfidenceLevel; // high (>95), medium (70–95), low (<70)
  matchedIntent: string;
  matchedTrigger: string;
}

// ── Agent Response ──────────────────────────────────────────────────────────
export interface AgentResponse {
  success: boolean;
  agent: AgentType;
  intent: string;
  message: string;
  confidence: number;
  action?: 'execute' | 'confirm' | 'repeat' | 'delegate' | 'none';
  delegateTo?: AgentType;
  data?: Record<string, any>;
}

// ── Command Definition (for Registry) ───────────────────────────────────────
export interface RegisteredCommand {
  id: string;
  page: string;              // which page/portal registers this
  category: string;          // 'navigation' | 'action' | 'form' | 'modal'
  triggers: string[];        // spoken phrases that match
  synonyms?: string[];       // additional fuzzy-matchable phrases
  description: string;       // human-readable description
  confirmRequired: boolean;
  execute: (params?: Record<string, any>) => void;
  speakResponse: string;     // what to say after execution
}

// ── Page Command Registration ───────────────────────────────────────────────
export interface PageCommands {
  page: string;
  portal: string;
  commands: RegisteredCommand[];
}

// ── Voice Context (shared state across agents) ──────────────────────────────
export interface VoiceContext {
  currentPortal: string;
  activeTab: string;
  activePatientId: string;
  activeDoctor: string;
  activeDepartment: string;
  activeEncounter: string;
  currentScreen: string;
  activeModals: Set<string>;
}

// ── Intent Classification ───────────────────────────────────────────────────
export type IntentCategory =
  | 'navigation'       // Portal/tab switching
  | 'action'           // Execute a clinical action
  | 'search'           // Search for patient/report/medicine
  | 'documentation'    // Generate SOAP/notes/discharge
  | 'analytics'        // Open dashboard/report/statistics
  | 'conversation'     // AI-assisted explanation/summarization
  | 'system'           // Theme toggle, logout, help, status
  | 'confirmation'     // Yes/No to pending action
  | 'unknown';         // No match found

export interface ClassifiedIntent {
  category: IntentCategory;
  agent: AgentType;
  intent: string;
  entities: Record<string, string>;
  confidence: number;
  rawText: string;
  normalizedText: string;
}

// ── Pending Confirmation ────────────────────────────────────────────────────
export interface PendingConfirmation {
  action: () => void;
  description: string;
  agent: AgentType;
  timestamp: number;
}
