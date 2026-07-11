/**
 * Agent 2: Conversation Agent
 * 
 * ChatGPT-like assistant that activates ONLY when the user explicitly requests AI help.
 * Examples: "Explain this ECG", "Summarize this patient", "What is the latest guideline?"
 * 
 * This agent is NEVER invoked for navigation, actions, or commands.
 */

import type { AgentResponse } from './types';

export class ConversationAgent {
  /**
   * Process an explicit AI conversation request.
   * In production, this would call an LLM. For now, returns structured acknowledgment.
   */
  static process(normalizedText: string, _portal: string): AgentResponse {
    const text = normalizedText.toLowerCase().trim();

    // Determine what kind of AI help is being requested
    if (text.includes('explain')) {
      return ConversationAgent.respond(
        'EXPLAIN',
        `Querying clinical knowledge base for explanation. Processing: "${normalizedText}"`,
        92
      );
    }

    if (text.includes('summarize') || text.includes('summary')) {
      return ConversationAgent.respond(
        'SUMMARIZE',
        `Generating clinical summary. Processing: "${normalizedText}"`,
        92
      );
    }

    if (text.includes('guideline') || text.includes('protocol') || text.includes('latest')) {
      return ConversationAgent.respond(
        'GUIDELINE_QUERY',
        `Searching clinical guidelines database. Processing: "${normalizedText}"`,
        90
      );
    }

    if (text.includes('what is') || text.includes('what are') || text.includes('tell me about')) {
      return ConversationAgent.respond(
        'KNOWLEDGE_QUERY',
        `Querying medical knowledge base. Processing: "${normalizedText}"`,
        88
      );
    }

    // Generic AI query
    return ConversationAgent.respond(
      'AI_QUERY',
      `AI Assistant processing your request: "${normalizedText}"`,
      85
    );
  }

  private static respond(intent: string, message: string, confidence: number): AgentResponse {
    return {
      success: true,
      agent: 'conversation',
      intent,
      message,
      confidence,
      action: 'execute',
    };
  }
}
