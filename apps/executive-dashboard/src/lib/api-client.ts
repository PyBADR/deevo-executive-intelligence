/**
 * Intelligence API Client — Typed fetch layer for all backend endpoints.
 *
 * Every method returns typed data matching the shared-types contract.
 * No caching, no state — pure fetch with error handling.
 */

import { API_ENDPOINTS } from "../config/api";

// ─── Generic Fetch ──────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

// ─── Intelligence API ───────────────────────────────────────────

export const intelligenceApi = {
  // ── Scenarios ─────────────────────────────────────────────
  getScenarios: () => apiFetch<any[]>(API_ENDPOINTS.scenarios),

  getScenario: (id: string) => apiFetch<any>(API_ENDPOINTS.scenarioById(id)),

  getLiveScenarios: () => apiFetch<{
    count: number;
    source: string;
    scenarios: LiveScenario[];
  }>(API_ENDPOINTS.liveScenarios),

  // ── Executive Snapshot (full pipeline output) ─────────────
  getExecutiveSnapshot: (id: string) => apiFetch<any>(API_ENDPOINTS.executiveSnapshot(id)),

  getScores: (id: string) => apiFetch<any>(API_ENDPOINTS.scores(id)),

  getRisks: (id: string) => apiFetch<any>(API_ENDPOINTS.risks(id)),

  getKPIs: (id: string) => apiFetch<any>(API_ENDPOINTS.kpis(id)),

  getDependency: (id: string) => apiFetch<any>(API_ENDPOINTS.dependency(id)),

  // ── Domain Views ──────────────────────────────────────────
  getCountries: () => apiFetch<any[]>(API_ENDPOINTS.countries),

  getCountry: (code: string) => apiFetch<any>(API_ENDPOINTS.countryById(code)),

  getSectorExposure: () => apiFetch<any>(API_ENDPOINTS.sectorExposure),

  getDecisions: () => apiFetch<any[]>(API_ENDPOINTS.decisions),

  getGraph: () => apiFetch<any>(API_ENDPOINTS.graph),

  getNarratives: () => apiFetch<any[]>(API_ENDPOINTS.narratives),

  getNarrative: (id: string) => apiFetch<any>(API_ENDPOINTS.narrativeById(id)),

  // ── Ingestion ─────────────────────────────────────────────
  runIngestion: () => apiFetch<IngestionResult>(API_ENDPOINTS.ingestionRun, { method: "POST" }),

  getIngestionStatus: () => apiFetch<IngestionStatus>(API_ENDPOINTS.ingestionStatus),

  // ── Simulation ────────────────────────────────────────────
  simulatePolicy: (data: any) =>
    apiFetch<any>(API_ENDPOINTS.simulatePolicy, { method: "POST", body: JSON.stringify(data) }),

  simulateGeopolitics: (data: any) =>
    apiFetch<any>(API_ENDPOINTS.simulateGeopolitics, { method: "POST", body: JSON.stringify(data) }),

  simulateSupplyChain: (data: any) =>
    apiFetch<any>(API_ENDPOINTS.simulateSupplyChain, { method: "POST", body: JSON.stringify(data) }),

  // ── Health ────────────────────────────────────────────────
  healthCheck: () => apiFetch<{ status: string }>(API_ENDPOINTS.health),
};

// ─── Response Types ─────────────────────────────────────────────

export interface LiveScenario {
  scenario_id: string;
  title: { en: string; ar: string };
  scenario_type: string;
  severity: string;
  affected_countries: string[];
  linked_sectors: string[];
  confidence: number;
  source_count: number;
  created_at: string;
  pipeline?: {
    overall_score: number;
    aggregate_risk_score: number;
    decisions_count: number;
    sectors_exposed: number;
    macro_stress: number;
    narrative_title: string;
  };
}

export interface IngestionResult {
  run_id: string;
  started_at: string;
  completed_at: string;
  feeds_fetched: number;
  raw_items: number;
  normalized_events: number;
  clusters_formed: number;
  scenarios_generated: number;
  duplicates_skipped: number;
  errors: string[];
}

export interface IngestionStatus {
  status: "idle" | "running" | "completed" | "failed";
  last_run: IngestionResult | null;
  total_runs: number;
  total_scenarios_generated: number;
  active_feeds: number;
  cache_size: number;
}
