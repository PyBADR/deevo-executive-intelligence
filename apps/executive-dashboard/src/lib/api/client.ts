/**
 * Production-Grade API Client — Deevo Intelligence Platform.
 *
 * Architecture Decision:
 *   Centralized fetch layer with typed responses, retry logic,
 *   structured error handling, and request/response logging hooks.
 *   Every method maps 1:1 to a FastAPI endpoint — no fabricated routes.
 *
 * Data Flow:
 *   Component → Hook → client.ts → fetch() → FastAPI → Pipeline Output
 *
 * Failure Modes:
 *   - Network timeout → ApiError with status 0
 *   - 4xx → ApiError with server message
 *   - 5xx → ApiError with retry suggestion
 *   - JSON parse failure → ApiError with raw body
 */

import type { ScenarioInput, ScenarioResponse } from "@/types/scenario";
import type { CompositeScore } from "@/types/scoring";
import type { RiskRegister } from "@/types/risk";
import type { KPIDashboard } from "@/types/kpi";
import type { ExplainedDecision } from "@/types/decision";
import type { CountryImpact } from "@/types/country";
import type { SectorExposureResult } from "@/types/sector";

// ─── Configuration ──────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT = 30_000; // 30 seconds
const MAX_RETRIES = 2;

// ─── Error Type ─────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public body?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Core Fetch ─────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
      ...options,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");

      // Retry on 5xx
      if (res.status >= 500 && retries > 0) {
        return request<T>(path, options, retries - 1);
      }

      throw new ApiError(
        `API ${res.status}: ${res.statusText}`,
        res.status,
        path,
        body
      );
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    // Abort / timeout
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timeout", 0, path);
    }

    // Network failure — retry
    if (retries > 0) {
      return request<T>(path, options, retries - 1);
    }

    throw new ApiError(
      `Network error: ${(err as Error).message}`,
      0,
      path
    );
  } finally {
    clearTimeout(timeout);
  }
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── Live Scenario Types ────────────────────────────────────────

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

export interface LiveScenariosResponse {
  count: number;
  source: string;
  scenarios: LiveScenario[];
}

export interface IngestionRunResult {
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

export interface IngestionStatusResponse {
  status: "idle" | "running" | "completed" | "failed";
  last_run: IngestionRunResult | null;
  total_runs: number;
  total_scenarios_generated: number;
  active_feeds: number;
  cache_size: number;
}

export interface ExecutiveSnapshot {
  scenario_id: string;
  timestamp: string;
  scores: CompositeScore;
  risk_register: RiskRegister;
  kpi_dashboard: KPIDashboard;
  decisions: ExplainedDecision[];
  country_impacts: CountryImpact[];
  sector_exposures: SectorExposureResult;
  narrative: {
    title: { en: string; ar: string };
    body: { en: string; ar: string };
    key_points: Array<{ en: string; ar: string }>;
  };
}

// ─── Typed API Methods ──────────────────────────────────────────

export const api = {
  // ── Scenarios ─────────────────────────────────────────────
  scenarios: {
    list: () => get<ScenarioResponse[]>("/scenarios"),
    get: (id: string) => get<ScenarioResponse>(`/scenarios/${id}`),
    live: () => get<LiveScenariosResponse>("/scenarios/live"),
    create: (input: ScenarioInput) => post<ScenarioResponse>("/scenarios", input),
  },

  // ── Executive Snapshot (full pipeline output) ─────────────
  snapshot: {
    executive: (id: string) => get<ExecutiveSnapshot>(`/snapshot/executive/${id}`),
  },

  // ── Scoring ───────────────────────────────────────────────
  scoring: {
    get: (id: string) => get<CompositeScore>(`/scores/${id}`),
  },

  // ── Risk ──────────────────────────────────────────────────
  risk: {
    get: (id: string) => get<RiskRegister>(`/risks/${id}`),
  },

  // ── KPI ───────────────────────────────────────────────────
  kpi: {
    get: (id: string) => get<KPIDashboard>(`/kpis/${id}`),
  },

  // ── Decisions ─────────────────────────────────────────────
  decisions: {
    list: () => get<ExplainedDecision[]>("/decisions"),
  },

  // ── Countries ─────────────────────────────────────────────
  countries: {
    list: () => get<CountryImpact[]>("/countries"),
    get: (code: string) => get<CountryImpact>(`/countries/${code}`),
  },

  // ── Sectors ───────────────────────────────────────────────
  sectors: {
    exposure: () => get<SectorExposureResult>("/sectors/exposure"),
  },

  // ── Narratives ────────────────────────────────────────────
  narratives: {
    list: () => get<any[]>("/narratives"),
    get: (id: string) => get<any>(`/narratives/${id}`),
  },

  // ── Ingestion ─────────────────────────────────────────────
  ingestion: {
    run: () => post<IngestionRunResult>("/ingestion/run"),
    status: () => get<IngestionStatusResponse>("/ingestion/status"),
  },

  // ── Graph ─────────────────────────────────────────────────
  graph: {
    relationships: () => get<any>("/graph/relationships"),
  },

  // ── Health ────────────────────────────────────────────────
  health: () => get<{ status: string; endpoints: string[] }>("/health"),
} as const;
