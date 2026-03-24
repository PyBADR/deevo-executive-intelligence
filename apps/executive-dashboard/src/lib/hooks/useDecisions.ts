"use client";

/**
 * useDecisions — Fetches all pipeline-generated decisions.
 *
 * Data Flow: Scenario → Decision Engine → Explanation Engine → ExplainedDecision[]
 * Endpoint: GET /decisions
 */

import { useApiQuery } from "./useApiQuery";
import { api } from "@/lib/api/client";
import type { ExplainedDecision } from "@/types/decision";

export function useDecisions() {
  return useApiQuery<ExplainedDecision[]>(
    "decisions:all",
    () => api.decisions.list(),
    { ttl: 60_000 }
  );
}
