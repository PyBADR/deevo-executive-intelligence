/**
 * Sector Types — exact mirror of schemas/sector.py
 *
 * Source: services/intelligence-api/app/schemas/sector.py
 * Model: 4-tier, 20-sector sovereign-grade exposure framework.
 */

import type { LanguageVariant, SectorCode, GCCCountryCode, GDPComponentCode } from "./scenario";

// ─── Enums ──────────────────────────────────────────────────────

export type SectorTier = 1 | 2 | 3 | 4;

export type PropagationSpeed = "immediate" | "fast" | "medium" | "slow";

// ─── Sector Profile (static config) ────────────────────────────

export interface SectorProfile {
  sector_code: SectorCode;
  name: LanguageVariant;
  tier: SectorTier;
  criticality_score: number; // 0-100
  gdp_linkage: GDPComponentCode[];
  public_sector_dependency: number; // 0-1
  private_sector_dependency: number; // 0-1
  sensitivity_profile: Record<string, number>;
  propagation_speed: PropagationSpeed;
  decision_priority_base: number; // 0-100
}

// ─── Country-Sector Weight ──────────────────────────────────────

export interface CountrySectorWeight {
  country_code: GCCCountryCode;
  sector_code: SectorCode;
  weight: number; // 0-1
  rationale: string;
}

// ─── Sector Exposure (runtime output) ───────────────────────────

export interface SectorExposure {
  sector_code: SectorCode;
  tier: SectorTier;
  exposure_score: number; // 0-100
  criticality_adjusted_score: number; // 0-100
  impact_drivers: string[];
  country_context: GCCCountryCode[];
  gdp_linkage: GDPComponentCode[];
  decision_relevance: number; // 0-100
  propagation_speed: PropagationSpeed;
  narrative: LanguageVariant;
}

export interface SectorExposureResult {
  scenario_id: string;
  exposures: SectorExposure[];
  tier_summary: Record<string, number>; // tier name → avg exposure
}
