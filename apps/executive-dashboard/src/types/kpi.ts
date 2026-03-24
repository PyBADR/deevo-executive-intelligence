/**
 * KPI Types — exact mirror of schemas/kpi.py
 *
 * Source: services/intelligence-api/app/schemas/kpi.py
 */

import type { LanguageVariant, GCCCountryCode, SectorCode } from "./scenario";

export interface KPITrend {
  direction: "up" | "down" | "stable";
  change_pct: number;
  previous_value: number;
}

export interface ExecutiveKPI {
  id: string;
  name: LanguageVariant;
  value: number;
  unit: string;
  trend: KPITrend;
  category: "economic" | "risk" | "opportunity" | "governance" | "infrastructure" | "financial";
  explanation: LanguageVariant;
}

export interface CountryKPI {
  country_code: GCCCountryCode;
  kpi_id: string;
  name: LanguageVariant;
  value: number;
  unit: string;
  trend: KPITrend;
  explanation: LanguageVariant;
}

export interface SectorKPI {
  sector_code: SectorCode;
  kpi_id: string;
  name: LanguageVariant;
  value: number;
  unit: string;
  trend: KPITrend;
  explanation: LanguageVariant;
}

export interface KPIDashboard {
  scenario_id: string;
  executive_kpis: ExecutiveKPI[];
  country_kpis: CountryKPI[];
  sector_kpis: SectorKPI[];
  headline: LanguageVariant;
}
