/**
 * Scoring Types — exact mirror of schemas/scoring.py
 *
 * Source: services/intelligence-api/app/schemas/scoring.py
 */

import type { LanguageVariant } from "./scenario";

export type ScoreCategory =
  | "macro"
  | "gdp"
  | "country"
  | "sector"
  | "decision"
  | "composite";

export interface ScoreComponent {
  name: string;
  raw_value: number;
  weight: number; // 0-1
  weighted_value: number;
  source_layer: string;
}

export interface ScoreResult {
  id: string;
  category: ScoreCategory;
  label: LanguageVariant;
  score: number; // 0-100
  components: ScoreComponent[];
  confidence: number; // 0-1
  explanation: LanguageVariant;
}

export interface CompositeScore {
  scenario_id: string;
  overall_score: number; // 0-100
  sub_scores: ScoreResult[];
  explanation: LanguageVariant;
  confidence: number; // 0-1
}
