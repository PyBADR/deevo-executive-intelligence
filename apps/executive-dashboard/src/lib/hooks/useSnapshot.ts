"use client";

/**
 * useSnapshot — Fetches the full executive snapshot for a scenario.
 *
 * Data Flow: All 12 pipeline stages → Executive Snapshot
 * Endpoint: GET /snapshot/executive/{scenario_id}
 *
 * This is the most data-rich hook — contains scores, risks,
 * KPIs, decisions, countries, sectors, and narrative in one payload.
 */

import { useApiQuery } from "./useApiQuery";
import { api } from "@/lib/api/client";
import type { ExecutiveSnapshot } from "@/lib/api/client";

export function useSnapshot(scenarioId: string | null) {
  return useApiQuery<ExecutiveSnapshot>(
    `snapshot:${scenarioId}`,
    () => api.snapshot.executive(scenarioId!),
    {
      ttl: 60_000,
      enabled: !!scenarioId,
    }
  );
}
