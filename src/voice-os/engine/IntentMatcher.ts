/**
 * MCGM Arogya Voice AI — Intent Matcher
 * Scores speech input against registered commands using multi-signal matching.
 */

import type { RegisteredCommand, ClassifiedIntent, IntentCategory, AgentType } from '../agents/types';
import { SpeechNormalizer } from './SpeechNormalizer';

export class IntentMatcher {
  static matchCommand(
    normalizedText: string,
    commands: RegisteredCommand[]
  ): { command: RegisteredCommand | null; confidence: number; matchedTrigger: string } {
    if (!normalizedText || commands.length === 0) {
      return { command: null, confidence: 0, matchedTrigger: '' };
    }

    let bestCommand: RegisteredCommand | null = null;
    let bestScore = 0;
    let bestTrigger = '';

    for (const cmd of commands) {
      for (const trigger of [...cmd.triggers, ...(cmd.synonyms || [])]) {
        const score = IntentMatcher.computeMatchScore(normalizedText, trigger.toLowerCase());
        if (score > bestScore) {
          bestScore = score;
          bestCommand = cmd;
          bestTrigger = trigger;
        }
      }
    }

    return { command: bestCommand, confidence: bestScore, matchedTrigger: bestTrigger };
  }

  static computeMatchScore(input: string, trigger: string): number {
    if (input === trigger) return 100;
    if (input.includes(trigger)) return 96;
    if (trigger.includes(input)) return 90;

    const inputWords = new Set(input.split(' ').filter(w => w.length > 1));
    const triggerWords = new Set(trigger.split(' ').filter(w => w.length > 1));
    if (inputWords.size === 0 || triggerWords.size === 0) return 0;

    let overlap = 0;
    inputWords.forEach(w => { if (triggerWords.has(w)) overlap++; });
    const overlapRatio = overlap / Math.max(inputWords.size, triggerWords.size);

    if (overlapRatio >= 0.8) return 88;
    if (overlapRatio >= 0.5) return 78;
    if (overlapRatio >= 0.3) return 68;

    const bigramScore = SpeechNormalizer.bigramSimilarity(input, trigger) * 75;
    return Math.max(overlapRatio * 80, bigramScore);
  }

  static classifyIntent(normalizedText: string, _portal: string): ClassifiedIntent {
    const text = normalizedText.toLowerCase();
    const build = (cat: IntentCategory, agent: AgentType, intent: string, conf: number): ClassifiedIntent => ({
      category: cat, agent, intent, entities: {}, confidence: conf, rawText: text, normalizedText: text,
    });

    // Confirmation
    const yesWords = ['yes', 'confirm', 'do it', 'submit', 'approve'];
    const noWords = ['no', 'cancel', 'reject', 'stop'];
    if (yesWords.some(w => text.includes(w)) || noWords.some(w => text.includes(w))) {
      return build('confirmation', 'voice_command', 'CONFIRMATION', 100);
    }

    // Conversation (explicit AI help)
    const convTriggers = ['explain', 'summarize', 'what is', 'tell me about', 'guideline', 'help me understand', 'ask ai', 'clinical question'];
    if (convTriggers.some(t => text.includes(t))) return build('conversation', 'conversation', 'AI_QUERY', 96);

    // Documentation
    const docTriggers = ['generate soap', 'create soap', 'compile notes', 'clinical notes', 'discharge summary', 'start scribe', 'stop scribe', 'start recording', 'stop recording', 'start ambient', 'stop ambient', 'referral letter', 'medical certificate'];
    if (docTriggers.some(t => text.includes(t))) return build('documentation', 'documentation', 'DOCUMENTATION', 96);

    // Search
    const searchTriggers = ['search patient', 'find patient', 'look up', 'search reports', 'search medicines', 'search labs', 'search radiology'];
    if (searchTriggers.some(t => text.includes(t))) return build('search', 'search', 'SEARCH', 96);

    // Analytics
    const analyticsTriggers = ['show analytics', 'open analytics', 'hospital analytics', 'show statistics', 'bed occupancy', 'revenue report'];
    if (analyticsTriggers.some(t => text.includes(t))) return build('analytics', 'analytics', 'ANALYTICS', 96);

    // System
    const sysTriggers = ['dark mode', 'night mode', 'light mode', 'toggle theme', 'logout', 'log out', 'sign out', 'system status', 'help', 'show commands'];
    if (sysTriggers.some(t => text.includes(t))) return build('system', 'voice_command', 'SYSTEM', 98);

    // Navigation
    const navTriggers = ['open', 'go to', 'switch to', 'navigate to'];
    if (navTriggers.some(t => text.includes(t))) return build('navigation', 'voice_command', 'NAVIGATION', 90);

    // Default: action command
    return build('action', 'voice_command', 'ACTION', 85);
  }
}
