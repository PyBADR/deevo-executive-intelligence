"use client";

/**
 * useKpis — Fetches KPI dashboard for a given scenario.
 *
 * Data Flow: Pipeline → KPI Engine → ExecutiveKPIs + CountryKPIs + SectorKPIs
 * Endpoint: GET /kpis/{scenario_id}
 */

import { useApiQuery } from "./useApiQuery";
import { api } from "@/lib/api/client";
import type { KPIDashboard } from "@/types/kpi";

export function useKpis(scenarioId: string | null) {
  return useApiQuery<KPIDashboard>(
    `kpis:${scenarioId}`,
    () => api.kpi.get(scenarioId!),
    {
      ttl: 60_000,
      enabled: !!scenarioId,
    }
  );
}
