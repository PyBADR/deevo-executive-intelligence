/**
 * Decision Types — exact mirror of schemas/decision.py
 *
 * Source: services/intelligence-api/app/schemas/decision.py
 */

import type { LanguageVariant, GDPComponentCode, SectorCode } from "./scenario";

export type DecisionUrgency = "immediate" | "short_term" | "medium_term" | "long_term";

export interface DecisionPressure {
  score: number; // 0-100
  urgency: DecisionUrgency;
  affected_stakeholders: string[];
  primary_drivers: string[];
}

export interface DecisionRecommendation {
  id: string;
  scenario_id: string;
  title: LanguageVariant;
  action: LanguageVariant;
  priority: DecisionUrgency;
  confidence: number; // 0-1
  affected_entities: string[];
  pressure: DecisionPressure;
}

export interface DecisionExplanation {
  decision_id: string;
  what_happened: LanguageVariant;
  why_it_matters: LanguageVariant;
  who_is_affected: string[];
  gdp_components_moved: GDPComponentCode[];
  sectors_under_pressure: SectorCode[];
  why_this_recommendation: LanguageVariant;
  likely_next_developments: LanguageVariant[];
  confidence: number; // 0-1
}

export interface ExplainedDecision {
  recommendation: DecisionRecommendation;
  explanation: DecisionExplanation;
}
