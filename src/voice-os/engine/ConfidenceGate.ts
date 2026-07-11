/**
 * MCGM Arogya Voice AI — Confidence Gate
 * Three-tier confidence gating for voice command execution.
 *
 * >95%  → Execute immediately
 * 70–95 → Ask for confirmation
 * <70%  → Ask user to repeat
 */

import type { ConfidenceLevel } from '../agents/types';

export class ConfidenceGate {
  static readonly HIGH_THRESHOLD = 95;
  static readonly MEDIUM_THRESHOLD = 70;

  /**
   * Returns the confidence level and action to take
   */
  static evaluate(score: number): {
    level: ConfidenceLevel;
    action: 'execute' | 'confirm' | 'repeat';
  } {
    if (score >= ConfidenceGate.HIGH_THRESHOLD) {
      return { level: 'high', action: 'execute' };
    }
    if (score >= ConfidenceGate.MEDIUM_THRESHOLD) {
      return { level: 'medium', action: 'confirm' };
    }
    return { level: 'low', action: 'repeat' };
  }

  /**
   * Generate the appropriate voice response for confirmation
   */
  static getConfirmationPrompt(intent: string, confidence: number): string {
    if (confidence >= ConfidenceGate.HIGH_THRESHOLD) {
      return ''; // No prompt needed
    }
    if (confidence >= ConfidenceGate.MEDIUM_THRESHOLD) {
      return `Did you mean "${intent}"? Say yes to confirm or no to cancel.`;
    }
    return "I didn't catch that clearly. Could you please repeat your command?";
  }
}
