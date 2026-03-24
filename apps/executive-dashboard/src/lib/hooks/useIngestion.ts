"use client";

/**
 * useIngestion — Ingestion pipeline status and trigger.
 *
 * Provides: current status, trigger function, last run results.
 * Endpoint: GET /ingestion/status, POST /ingestion/run
 */

import { useState, useCallback } from "react";
import { useApiQuery, invalidateQuery } from "./useApiQuery";
import { api } from "@/lib/api/client";
import type { IngestionStatusResponse, IngestionRunResult } from "@/lib/api/client";

export function useIngestion() {
  const status = useApiQuery<IngestionStatusResponse>(
    "ingestion:status",
    () => api.ingestion.status(),
    { ttl: 10_000 } // Poll frequently
  );

  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<IngestionRunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const trigger = useCallback(async () => {
    setRunning(true);
    setRunError(null);
    try {
      const result = await api.ingestion.run();
      setLastResult(result);
      // Invalidate cached data so hooks refetch
      invalidateQuery("ingestion:status");
      invalidateQuery("scenarios:live");
      status.refetch();
      return result;
    } catch (err) {
      setRunError((err as Error).message);
      return null;
    } finally {
      setRunning(false);
    }
  }, [status]);

  return {
    status: status.data,
    statusLoading: status.loading,
    statusError: status.error,
    trigger,
    running,
    lastResult,
    runError,
    refetchStatus: status.refetch,
  };
}
