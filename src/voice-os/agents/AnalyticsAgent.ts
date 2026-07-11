/**
 * Agent 5: Analytics Agent
 * 
 * Handles ONLY analytics and dashboard operations:
 * - Open dashboards
 * - View reports and statistics
 * - Hospital analytics
 * 
 * NOT navigation. NOT documentation. NOT conversation. NOT search.
 */

import type { AgentResponse } from './types';

export class AnalyticsAgent {
  static process(normalizedText: string, _portal: string): AgentResponse {
    const text = normalizedText.toLowerCase().trim();

    if (text.includes('analytics') || text.includes('hospital analytics')) {
      return AnalyticsAgent.respond('OPEN_ANALYTICS', 'Opening hospital analytics dashboard.', 96);
    }

    if (text.includes('statistics') || text.includes('opd statistics')) {
      return AnalyticsAgent.respond('SHOW_STATISTICS', 'Loading hospital statistics.', 94);
    }

    if (text.includes('bed occupancy')) {
      return AnalyticsAgent.respond('BED_OCCUPANCY', 'Displaying bed occupancy report.', 96);
    }

    if (text.includes('revenue report')) {
      return AnalyticsAgent.respond('REVENUE_REPORT', 'Loading revenue and billing report.', 94);
    }

    if (text.includes('department report')) {
      return AnalyticsAgent.respond('DEPARTMENT_REPORT', 'Opening department-wise performance report.', 94);
    }

    if (text.includes('mortality') || text.includes('infection rate')) {
      return AnalyticsAgent.respond('CLINICAL_METRICS', 'Loading clinical outcome metrics.', 92);
    }

    return {
      success: false,
      agent: 'analytics',
      intent: 'UNKNOWN_ANALYTICS',
      message: "Analytics command not recognized. Try: show analytics, bed occupancy, revenue report.",
      confidence: 0,
      action: 'none',
    };
  }

  private static respond(intent: string, message: string, confidence: number): AgentResponse {
    return {
      success: true,
      agent: 'analytics',
      intent,
      message,
      confidence,
      action: 'execute',
    };
  }
}
