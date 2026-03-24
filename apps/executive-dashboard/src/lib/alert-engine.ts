/**
 * Alert Engine — Evaluates pipeline output against configured thresholds.
 *
 * Every alert maps to a real data field from the intelligence pipeline.
 * No fabricated alerts. No decorative notifications.
 *
 * Data flow:
 *   ExtendedIntelligenceOutput → AlertEngine.evaluate() → Alert[]
 */

import { ALERT_THRESHOLDS, AlertThreshold, SEVERITY_ORDER } from "../config/alerts";

// ─── Alert Output ───────────────────────────────────────────────

export interface Alert {
  id: string;
  thresholdId: string;
  name: string;
  nameAr: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "decision" | "sector" | "country" | "risk" | "macro";
  message: string;
  messageAr: string;
  actualValue: number;
  thresholdValue: number;
  operator: string;
  triggeredAt: string;
  scenarioId: string;
}

// ─── Value Extraction ───────────────────────────────────────────

function extractValue(data: any, fieldPath: string): number | null {
  /**
   * Extract a numeric value from pipeline output using dot-path notation.
   *
   * Handles special aggregation patterns:
   *   - "country_impacts.max_sensitivity" → max of all country macroSensitivity values
   *   - "sector_exposures.max_exposure" → max of all sector exposure scores
   *   - "sector_exposures.tier_summary.CRITICAL_SOVEREIGN" → tier summary value
   *   - "scores.sub_scores.decision.score" → specific sub_score by category
   *   - "risk_register.aggregate_risk_score" → direct field access
   */

  // Special aggregation patterns
  if (fieldPath === "country_impacts.max_sensitivity") {
    const impacts = data?.country_impacts;
    if (!Array.isArray(impacts) || impacts.length === 0) return null;
    return Math.max(...impacts.map((c: any) => c.macro_sensitivity ?? 0));
  }

  if (fieldPath === "sector_exposures.max_exposure") {
    const exposures = data?.sector_exposures?.exposures;
    if (!Array.isArray(exposures) || exposures.length === 0) return null;
    return Math.max(...exposures.map((e: any) => e.exposure_score ?? 0));
  }

  if (fieldPath.startsWith("sector_exposures.tier_summary.")) {
    const tierKey = fieldPath.split(".").pop();
    return data?.sector_exposures?.tier_summary?.[tierKey ?? ""] ?? null;
  }

  if (fieldPath.startsWith("scores.sub_scores.")) {
    const targetCategory = fieldPath.split(".")[2]; // e.g., "decision"
    const subScores = data?.scores?.sub_scores;
    if (!Array.isArray(subScores)) return null;
    const match = subScores.find((s: any) => s.category === targetCategory);
    return match?.score ?? null;
  }

  // Direct dot-path traversal for everything else
  const parts = fieldPath.split(".");
  let current: any = data;
  for (const part of parts) {
    if (current == null) return null;
    current = current[part];
  }

  return typeof current === "number" ? current : null;
}

// ─── Threshold Evaluation ───────────────────────────────────────

function evaluateThreshold(actual: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case ">":  return actual > threshold;
    case ">=": return actual >= threshold;
    case "<":  return actual < threshold;
    case "<=": return actual <= threshold;
    case "==": return actual === threshold;
    default:   return false;
  }
}

// ─── Alert Engine ───────────────────────────────────────────────

export class AlertEngine {
  private thresholds: AlertThreshold[];

  constructor(thresholds?: AlertThreshold[]) {
    this.thresholds = thresholds || ALERT_THRESHOLDS;
  }

  /**
   * Evaluate pipeline output against all configured thresholds.
   *
   * Returns triggered alerts sorted by severity (critical first).
   */
  evaluate(pipelineOutput: any, scenarioId: string): Alert[] {
    const now = new Date().toISOString();
    const alerts: Alert[] = [];

    for (const threshold of this.thresholds) {
      const actualValue = extractValue(pipelineOutput, threshold.field);

      if (actualValue === null) continue; // Field not found — skip

      if (evaluateThreshold(actualValue, threshold.operator, threshold.value)) {
        alerts.push({
          id: `${threshold.id}_${scenarioId}_${Date.now()}`,
          thresholdId: threshold.id,
          name: threshold.name,
          nameAr: threshold.nameAr,
          severity: threshold.severity,
          category: threshold.category,
          message: threshold.message,
          messageAr: threshold.messageAr,
          actualValue,
          thresholdValue: threshold.value,
          operator: threshold.operator,
          triggeredAt: now,
          scenarioId,
        });
      }
    }

    // Sort: critical first, then high, medium, low
    alerts.sort((a, b) => {
      return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    });

    return alerts;
  }

  /**
   * Get alerts by category.
   */
  evaluateByCategory(
    pipelineOutput: any,
    scenarioId: string,
    category: Alert["category"]
  ): Alert[] {
    return this.evaluate(pipelineOutput, scenarioId).filter(
      (a) => a.category === category
    );
  }

  /**
   * Get only critical alerts.
   */
  evaluateCritical(pipelineOutput: any, scenarioId: string): Alert[] {
    return this.evaluate(pipelineOutput, scenarioId).filter(
      (a) => a.severity === "critical"
    );
  }
}
