/**
 * Scenario Types — exact mirror of schemas/scenario.py
 *
 * Source: services/intelligence-api/app/schemas/scenario.py
 * Contract: every field, every enum, every constraint must match.
 */

// ─── Enums ──────────────────────────────────────────────────────

export type ScenarioSeverity = "critical" | "high" | "medium" | "low";

export type ScenarioCategory =
  | "trade"
  | "energy"
  | "geopolitical"
  | "financial"
  | "regulatory"
  | "demand"
  | "infrastructure"
  | "confidence";

export type GCCCountryCode = "SA" | "AE" | "KW" | "QA" | "BH" | "OM";

export type SectorCode =
  // Tier 1 — Critical Sovereign
  | "AVIATION"
  | "OIL_GAS"
  | "BANKING"
  | "ENERGY_INFRASTRUCTURE"
  | "PORTS_MARITIME"
  | "LOGISTICS"
  // Tier 2 — Financial & Economic
  | "INSURANCE"
  | "FINTECH"
  | "CAPITAL_MARKETS"
  | "SOVEREIGN_WEALTH"
  | "GOVERNMENT_FINANCE"
  // Tier 3 — Market & Growth
  | "ECOMMERCE"
  | "CONSTRUCTION"
  | "MANUFACTURING"
  | "TOURISM"
  | "RETAIL"
  // Tier 4 — Future & Strategic
  | "AI_TECHNOLOGY"
  | "STARTUP_ECOSYSTEM"
  | "CYBERSECURITY"
  | "SUSTAINABILITY";

export type GDPComponentCode =
  | "HOUSEHOLD_CONSUMPTION"
  | "BUSINESS_INVESTMENT"
  | "GOVERNMENT_SPENDING"
  | "NET_EXPORTS";

// ─── Shared ─────────────────────────────────────────────────────

export interface LanguageVariant {
  en: string;
  ar: string;
}

// ─── Models ─────────────────────────────────────────────────────

export interface ScenarioInput {
  id: string;
  title: LanguageVariant;
  description: LanguageVariant;
  category: ScenarioCategory;
  severity: ScenarioSeverity;
  affected_countries: GCCCountryCode[];
  affected_sectors: SectorCode[];
  source_count: number;
  confidence: number; // 0-1
  created_at?: string;
}

export interface ScenarioResponse extends ScenarioInput {
  stress_level: number; // 0-100
}
