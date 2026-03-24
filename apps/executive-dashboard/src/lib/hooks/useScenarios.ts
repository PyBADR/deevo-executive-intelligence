"use client";

/**
 * useScenarios — Fetches live scenarios from the ingestion pipeline.
 *
 * Data Flow: RSS → Normalize → Cluster → Scenario → Pipeline → Live
 * Endpoint: GET /scenarios/live
 */

import { useApiQuery } from "./useApiQuery";
import { api } from "@/lib/api/client";
import type { LiveScenariosResponse } from "@/lib/api/client";

export function useScenarios() {
  return useApiQuery<LiveScenariosResponse>(
    "scenarios:live",
    () => api.scenarios.live(),
    { ttl: 30_000 } // 30s — scenarios update frequently
  );
}
