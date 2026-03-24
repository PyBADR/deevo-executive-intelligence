// ─── GCC Country Codes ───────────────────────────────────
export enum GCCCountryCode {
  SA = "SA",
  AE = "AE",
  KW = "KW",
  QA = "QA",
  BH = "BH",
  OM = "OM",
}

// ─── Sector Codes — 4-Tier Sovereign-Grade Model ────────
export enum SectorCode {
  // Tier 1 — Critical Sovereign Systems
  AVIATION = "AVIATION",
  OIL_GAS = "OIL_GAS",
  BANKING = "BANKING",
  ENERGY_INFRASTRUCTURE = "ENERGY_INFRASTRUCTURE",
  PORTS_MARITIME = "PORTS_MARITIME",
  LOGISTICS = "LOGISTICS",
  // Tier 2 — Financial & Economic Systems
  INSURANCE = "INSURANCE",
  FINTECH = "FINTECH",
  CAPITAL_MARKETS = "CAPITAL_MARKETS",
  SOVEREIGN_WEALTH = "SOVEREIGN_WEALTH",
  GOVERNMENT_FINANCE = "GOVERNMENT_FINANCE",
  // Tier 3 — Market & Growth Systems
  ECOMMERCE = "ECOMMERCE",
  CONSTRUCTION = "CONSTRUCTION",
  MANUFACTURING = "MANUFACTURING",
  TOURISM = "TOURISM",
  RETAIL = "RETAIL",
  // Tier 4 — Future & Strategic Systems
  AI_TECHNOLOGY = "AI_TECHNOLOGY",
  STARTUP_ECOSYSTEM = "STARTUP_ECOSYSTEM",
  CYBERSECURITY = "CYBERSECURITY",
  SUSTAINABILITY = "SUSTAINABILITY",
}

// ─── Sector Tier ────────────────────────────────────────
export enum SectorTier {
  CRITICAL_SOVEREIGN = 1,
  FINANCIAL_ECONOMIC = 2,
  MARKET_GROWTH = 3,
  FUTURE_STRATEGIC = 4,
}

// ─── Propagation Speed ──────────────────────────────────
export enum PropagationSpeed {
  IMMEDIATE = "immediate",
  FAST = "fast",
  MEDIUM = "medium",
  SLOW = "slow",
}

// ─── GDP Components ──────────────────────────────────────
export enum GDPComponentCode {
  HOUSEHOLD_CONSUMPTION = "HOUSEHOLD_CONSUMPTION",
  BUSINESS_INVESTMENT = "BUSINESS_INVESTMENT",
  GOVERNMENT_SPENDING = "GOVERNMENT_SPENDING",
  NET_EXPORTS = "NET_EXPORTS",
}

// ─── Scenario ────────────────────────────────────────────
export enum ScenarioSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum ScenarioCategory {
  TRADE = "trade",
  ENERGY = "energy",
  GEOPOLITICAL = "geopolitical",
  FINANCIAL = "financial",
  REGULATORY = "regulatory",
  DEMAND = "demand",
  INFRASTRUCTURE = "infrastructure",
  CONFIDENCE = "confidence",
}

// ─── Macro Signal Types ──────────────────────────────────
export enum MacroSignalType {
  TRADE_RISK = "trade_risk",
  SHIPPING_PRESSURE = "shipping_pressure",
  INFLATION_PRESSURE = "inflation_pressure",
  CONFIDENCE_PRESSURE = "confidence_pressure",
  ENERGY_EXPOSURE = "energy_exposure",
  FINANCING_SENSITIVITY = "financing_sensitivity",
  DEMAND_PRESSURE = "demand_pressure",
  REGULATORY_PRESSURE = "regulatory_pressure",
}

// ─── Decision ────────────────────────────────────────────
export enum DecisionUrgency {
  IMMEDIATE = "immediate",
  SHORT_TERM = "short_term",
  MEDIUM_TERM = "medium_term",
  LONG_TERM = "long_term",
}

// ─── Graph ───────────────────────────────────────────────
export enum NodeType {
  SCENARIO = "scenario",
  MACRO_SIGNAL = "macro_signal",
  GDP_COMPONENT = "gdp_component",
  COUNTRY = "country",
  PUBLIC_SECTOR = "public_sector",
  PRIVATE_SECTOR = "private_sector",
  SECTOR = "sector",
  DECISION = "decision",
}

export enum EdgeType {
  AFFECTS = "affects",
  INCREASES = "increases",
  REDUCES = "reduces",
  PRESSURES = "pressures",
  TRIGGERS = "triggers",
  SUPPORTS = "supports",
}

// ─── Narrative ───────────────────────────────────────────
export enum NarrativeType {
  ANALYSIS = "analysis",
  BRIEFING = "briefing",
  ALERT = "alert",
  EXPLANATION = "explanation",
}

// ─── Scoring ────────────────────────────────────────────
export enum ScoreCategory {
  MACRO = "macro",
  GDP = "gdp",
  COUNTRY = "country",
  SECTOR = "sector",
  DECISION = "decision",
  COMPOSITE = "composite",
}

// ─── Risk ───────────────────────────────────────────────
export enum RiskSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum RiskCategory {
  MACRO_ECONOMIC = "macro_economic",
  SOVEREIGN = "sovereign",
  SECTOR = "sector",
  FINANCIAL = "financial",
  OPERATIONAL = "operational",
  GEOPOLITICAL = "geopolitical",
  REGULATORY = "regulatory",
}
