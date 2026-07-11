/**
 * Agent 6: Workflow Orchestrator
 * 
 * Coordinates all agents. Routes requests. Maintains context.
 * 
 * Flow:
 *   Speech → SpeechNormalizer → IntentMatcher.classifyIntent → Route to Agent → AgentResponse
 * 
 * The Voice Command Agent is always tried FIRST via Command Registry.
 * Only if no command matches, the orchestrator classifies intent and delegates.
 * 
 * If NO agent can handle the request, it responds:
 *   "I don't recognize that command."
 * It NEVER starts chatting.
 */

import type { AgentResponse, VoiceContext } from './types';
import { SpeechNormalizer } from '../engine/SpeechNormalizer';
import { IntentMatcher } from '../engine/IntentMatcher';
import { VoiceCommandAgent } from './VoiceCommandAgent';
import { ConversationAgent } from './ConversationAgent';
import { DocumentationAgent } from './DocumentationAgent';
import { SearchAgent } from './SearchAgent';
import { AnalyticsAgent } from './AnalyticsAgent';

export class AgentOrchestrator {
  // ── Shared context across all agents ──────────────────────────────────
  private static context: VoiceContext = {
    currentPortal: 'doctor',
    activeTab: 'dashboard',
    activePatientId: '1',
    activeDoctor: 'Dr. Vikram Deshmukh',
    activeDepartment: 'Orthopedics',
    activeEncounter: '',
    currentScreen: 'dashboard',
    activeModals: new Set(),
  };

  // ── Duplicate throttle ────────────────────────────────────────────────
  private static lastProcessedText = '';
  private static lastProcessedTime = 0;

  /**
   * Main entry point. All speech goes through here.
   * Returns { response: AgentResponse, normalized: string, wasChanged: boolean }
   */
  static process(rawSpeech: string): {
    response: AgentResponse;
    normalized: string;
    wasChanged: boolean;
  } {
    // Step 1: Normalize speech
    const { normalized, wasChanged } = SpeechNormalizer.process(rawSpeech);

    if (!normalized) {
      return {
        response: {
          success: false, agent: 'orchestrator', intent: 'EMPTY',
          message: 'Empty command.', confidence: 0, action: 'none',
        },
        normalized: '',
        wasChanged: false,
      };
    }

    // Step 2: Throttle duplicate commands (2.5s window)
    const now = Date.now();
    if (normalized === AgentOrchestrator.lastProcessedText && (now - AgentOrchestrator.lastProcessedTime) < 2500) {
      return {
        response: {
          success: true, agent: 'orchestrator', intent: 'THROTTLED',
          message: 'Throttled duplicate command.', confidence: 100, action: 'none',
        },
        normalized,
        wasChanged,
      };
    }

    // Step 3: Classify intent FIRST to determine which agent handles this
    // This prevents conversation requests from being keyword-matched as commands
    const portal = AgentOrchestrator.context.currentPortal;
    const classification = IntentMatcher.classifyIntent(normalized, portal);

    let response: AgentResponse;

    switch (classification.category) {
      // ── Specialized agents get priority for their domains ──────────────
      case 'conversation':
        // Explicit AI help — never goes through command matching
        response = ConversationAgent.process(normalized, portal);
        break;

      case 'documentation':
        response = DocumentationAgent.process(normalized, portal);
        break;

      case 'search':
        response = SearchAgent.process(normalized, portal);
        break;

      case 'analytics':
        response = AnalyticsAgent.process(normalized, portal);
        break;

      // ── Navigation, actions, system, confirmation → VoiceCommandAgent ──
      case 'navigation':
      case 'action':
      case 'system':
      case 'confirmation':
      default: {
        const cmdResult = VoiceCommandAgent.process(normalized, portal);
        response = cmdResult;
        break;
      }
    }

    if (response.success) {
      AgentOrchestrator.lastProcessedText = normalized;
      AgentOrchestrator.lastProcessedTime = now;
    }

    return { response, normalized, wasChanged };
  }

  // ── Context Management ────────────────────────────────────────────────
  static setPortal(portal: string): void {
    AgentOrchestrator.context.currentPortal = portal;
  }

  static getPortal(): string {
    return AgentOrchestrator.context.currentPortal;
  }

  static setActiveTab(tab: string): void {
    AgentOrchestrator.context.activeTab = tab;
  }

  static setActivePatientId(id: string): void {
    AgentOrchestrator.context.activePatientId = id;
  }

  static getContext(): Readonly<VoiceContext> {
    return AgentOrchestrator.context;
  }

  static openModal(id: string): void {
    AgentOrchestrator.context.activeModals.add(id);
  }

  static closeModal(id: string): void {
    AgentOrchestrator.context.activeModals.delete(id);
  }
}
