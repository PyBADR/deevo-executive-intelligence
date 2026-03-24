/**
 * API Configuration — Connects frontend to Intelligence API.
 *
 * All endpoints map 1:1 to FastAPI routes.
 * No fabricated endpoints. No mock fallbacks in production.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Core Intelligence
  scenarios: `${API_BASE_URL}/scenarios`,
  scenarioById: (id: string) => `${API_BASE_URL}/scenarios/${id}`,
  intelligence: (id: string) => `${API_BASE_URL}/intelligence/run/${id}`,

  // Scoring & Risk
  scores: (id: string) => `${API_BASE_URL}/scores/${id}`,
  risks: (id: string) => `${API_BASE_URL}/risks/${id}`,
  kpis: (id: string) => `${API_BASE_URL}/kpis/${id}`,
  dependency: (id: string) => `${API_BASE_URL}/dependency/${id}`,
  executiveSnapshot: (id: string) => `${API_BASE_URL}/snapshot/executive/${id}`,

  // Domain Views
  countries: `${API_BASE_URL}/countries`,
  countryById: (code: string) => `${API_BASE_URL}/countries/${code}`,
  sectors: `${API_BASE_URL}/sectors`,
  sectorExposure: `${API_BASE_URL}/sectors/exposure`,
  decisions: `${API_BASE_URL}/decisions`,
  graph: `${API_BASE_URL}/graph/relationships`,
  narratives: `${API_BASE_URL}/narratives`,
  narrativeById: (id: string) => `${API_BASE_URL}/narratives/${id}`,

  // Live Ingestion
  liveScenarios: `${API_BASE_URL}/scenarios/live`,
  ingestionRun: `${API_BASE_URL}/ingestion/run`,
  ingestionStatus: `${API_BASE_URL}/ingestion/status`,

  // Simulation
  simulatePolicy: `${API_BASE_URL}/simulate/policy`,
  simulateGeopolitics: `${API_BASE_URL}/simulate/geopolitics`,
  simulateSupplyChain: `${API_BASE_URL}/simulate/supply-chain`,
  simulateAviation: `${API_BASE_URL}/simulate/aviation`,
  simulateOilGdp: `${API_BASE_URL}/simulate/oil-gdp`,
  simulateFinancial: `${API_BASE_URL}/simulate/financial-contagion`,

  // Health
  health: `${API_BASE_URL}/health`,
} as const;
