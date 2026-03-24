/**
 * Country Types — exact mirror of schemas/country.py + schemas/gdp.py
 *
 * Source: services/intelligence-api/app/schemas/country.py
 */

import type { LanguageVariant, GCCCountryCode, GDPComponentCode } from "./scenario";

// ─── GDP Impact (from gdp.py) ───────────────────────────────────

export interface GDPComponentImpact {
  component: GDPComponentCode;
  impact_score: number; // -1 to 1
  direction: "positive" | "negative" | "neutral";
  confidence: number; // 0-1
  drivers: string[];
  explanation: LanguageVariant;
}

export interface GDPImpactResult {
  scenario_id: string;
  country_code: GCCCountryCode;
  components: GDPComponentImpact[];
  aggregate_impact: number; // -1 to 1
  explanation: LanguageVariant;
}

// ─── Country Impact ─────────────────────────────────────────────

export interface PublicSectorImpact {
  spending_pressure: number; // 0-100
  policy_sensitivity: number; // 0-100
  infrastructure_continuity: number; // 0-100
  regulatory_sensitivity: number; // 0-100
  strategic_priorities: string[];
  explanation: LanguageVariant;
}

export interface PrivateSectorImpact {
  operating_cost_pressure: number; // 0-100
  financing_pressure: number; // 0-100
  demand_pressure: number; // 0-100
  investment_sentiment: number; // 0-100
  startup_sensitivity: number; // 0-100
  explanation: LanguageVariant;
}

export interface CountryImpact {
  country_code: GCCCountryCode;
  macro_sensitivity: number; // 0-100
  gdp_impact: GDPImpactResult;
  public_sector: PublicSectorImpact;
  private_sector: PrivateSectorImpact;
  risk_level: "critical" | "high" | "elevated" | "moderate" | "stable";
  narrative: LanguageVariant;
  confidence: number; // 0-1
}
