/**
 * Hook Index — re-exports all data hooks.
 *
 * Usage: import { useScenarios, useDecisions } from "@/lib/hooks";
 */

export { useApiQuery, clearQueryCache, invalidateQuery } from "./useApiQuery";
export { useScenarios } from "./useScenarios";
export { useKpis } from "./useKpis";
export { useDecisions } from "./useDecisions";
export { useSnapshot } from "./useSnapshot";
export { useIngestion } from "./useIngestion";
