/**
 * Risk Types — exact mirror of schemas/risk.py
 *
 * Source: services/intelligence-api/app/schemas/risk.py
 */

import type { LanguageVariant, GCCCountryCode, SectorCode } from "./scenario";

export type RiskSeverity = "critical" | "high" | "medium" | "low";

export type RiskCategory =
  | "macro_economic"
  | "sovereign"
  | "sector"
  | "financial"
  | "operational"
  | "geopolitical"
  | "regulatory";

export interface RiskEntry {
  id: string;
  category: RiskCategory;
  title: LanguageVariant;
  description: LanguageVariant;
  severity: RiskSeverity;
  likelihood: number; // 0-1
  impact_score: number; // 0-100
  risk_score: number; // 0-100 (severity × likelihood normalized)
  affected_countries: GCCCountryCode[];
  affected_sectors: SectorCode[];
  mitigation: LanguageVariant;
  propagation_targets: string[];
  drivers: string[];
}

export interface RiskRegister {
  scenario_id: string;
  risks: RiskEntry[];
  aggregate_risk_score: number; // 0-100
  critical_count: number;
  high_count: number;
  explanation: LanguageVariant;
}
