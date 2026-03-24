"use client";

/**
 * IntelligenceContext — Global data provider for the intelligence shell.
 *
 * Architecture Decision:
 *   Single context that holds the "active scenario" and its derived data.
 *   All child components consume this rather than fetching independently.
 *   This prevents duplicate API calls and ensures data consistency.
 *
 * Data Flow:
 *   useScenarios() → picks first live scenario → useSnapshot() → context
 *   Children read from context: scores, risks, kpis, decisions, etc.
 */

import { createContext, useContext, useMemo } from "react";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { useSnapshot } from "@/lib/hooks/useSnapshot";
import { useIngestion } from "@/lib/hooks/useIngestion";
import type { LiveScenario, ExecutiveSnapshot } from "@/lib/api/client";

// ─── Context Shape ──────────────────────────────────────────────

interface IntelligenceContextValue {
  // Active scenario
  activeScenarioId: string | null;
  activeScenario: LiveScenario | null;
  scenarios: LiveScenario[];
  scenariosLoading: boolean;

  // Full snapshot for active scenario
  snapshot: ExecutiveSnapshot | null;
  snapshotLoading: boolean;
  snapshotError: string | null;

  // Ingestion controls
  ingestionStatus: ReturnType<typeof useIngestion>["status"];
  triggerIngestion: () => Promise<any>;
  ingestionRunning: boolean;

  // Refresh
  refresh: () => void;
}

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  const scenariosQuery = useScenarios();
  const ingestion = useIngestion();

  // Pick first live scenario as active
  const scenarios = scenariosQuery.data?.scenarios ?? [];
  const activeScenario = scenarios.length > 0 ? scenarios[0] : null;
  const activeScenarioId = activeScenario?.scenario_id ?? null;

  const snapshotQuery = useSnapshot(activeScenarioId);

  const refresh = () => {
    scenariosQuery.refetch();
    if (activeScenarioId) snapshotQuery.refetch();
    ingestion.refetchStatus();
  };

  const value = useMemo<IntelligenceContextValue>(
    () => ({
      activeScenarioId,
      activeScenario,
      scenarios,
      scenariosLoading: scenariosQuery.loading,
      snapshot: snapshotQuery.data,
      snapshotLoading: snapshotQuery.loading,
      snapshotError: snapshotQuery.error,
      ingestionStatus: ingestion.status,
      triggerIngestion: ingestion.trigger,
      ingestionRunning: ingestion.running,
      refresh,
    }),
    [
      activeScenarioId,
      activeScenario,
      scenarios,
      scenariosQuery.loading,
      snapshotQuery.data,
      snapshotQuery.loading,
      snapshotQuery.error,
      ingestion.status,
      ingestion.trigger,
      ingestion.running,
    ]
  );

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────

export function useIntelligence(): IntelligenceContextValue {
  const ctx = useContext(IntelligenceContext);
  if (!ctx) {
    throw new Error("useIntelligence must be used within IntelligenceProvider");
  }
  return ctx;
}
