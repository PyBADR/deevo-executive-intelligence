import {
  GCCCountryCode,
  SectorCode,
  SectorTier,
  PropagationSpeed,
  GDPComponentCode,
  ScenarioSeverity,
  ScenarioCategory,
  MacroSignalType,
  DecisionUrgency,
  NodeType,
  EdgeType,
  NarrativeType,
  ScoreCategory,
  RiskSeverity,
  RiskCategory,
} from "./enums";

// ─── Bilingual Content ───────────────────────────────────
export interface LanguageVariant {
  en: string;
  ar: string;
}

// ─── Scenario Input ──────────────────────────────────────
export interface ScenarioInput {
  id: string;
  title: LanguageVariant;
  description: LanguageVariant;
  category: ScenarioCategory;
  severity: ScenarioSeverity;
  affectedCountries: GCCCountryCode[];
  affectedSectors: SectorCode[];
  sourceCount: number;
  confidence: number; // 0–1
  createdAt: string;  // ISO 8601
}

// ─── Macro Signals ───────────────────────────────────────
export interface MacroSignal {
  type: MacroSignalType;
  magnitude: number;    // -1 to 1
  confidence: number;   // 0–1
  drivers: string[];
  explanation: LanguageVariant;
}

export interface MacroSignalSet {
  scenarioId: string;
  signals: MacroSignal[];
  overallStress: number; // 0–100
}

// ─── GDP Impact ──────────────────────────────────────────
export interface GDPComponentImpact {
  component: GDPComponentCode;
  impactScore: number;   // -1 to 1
  direction: "positive" | "negative" | "neutral";
  confidence: number;
  drivers: string[];
  explanation: LanguageVariant;
}

export interface GDPImpactResult {
  scenarioId: string;
  countryCode: GCCCountryCode;
  components: GDPComponentImpact[];
  aggregateImpact: number; // -1 to 1
  explanation: LanguageVariant;
}

// ─── Country Impact ──────────────────────────────────────
export interface PublicSectorImpact {
  spendingPressure: number;       // 0–100
  policySensitivity: number;
  infrastructureContinuity: number;
  regulatorySensitivity: number;
  strategicPriorities: string[];
  explanation: LanguageVariant;
}

export interface PrivateSectorImpact {
  operatingCostPressure: number;  // 0–100
  financingPressure: number;
  demandPressure: number;
  investmentSentiment: number;
  startupSensitivity: number;
  explanation: LanguageVariant;
}

export interface CountryImpact {
  countryCode: GCCCountryCode;
  macroSensitivity: number;       // 0–100
  gdpImpact: GDPImpactResult;
  publicSector: PublicSectorImpact;
  privateSector: PrivateSectorImpact;
  riskLevel: "critical" | "high" | "elevated" | "moderate" | "stable";
  narrative: LanguageVariant;
  confidence: number;
}

// ─── Sector Exposure (4-Tier Model) ─────────────────────
export interface SectorExposure {
  sectorCode: SectorCode;
  tier: SectorTier;
  exposureScore: number;                 // 0–100
  criticalityAdjustedScore: number;      // 0–100
  impactDrivers: string[];
  countryContext: GCCCountryCode[];
  gdpLinkage: GDPComponentCode[];
  decisionRelevance: number;             // 0–100
  propagationSpeed: PropagationSpeed;
  narrative: LanguageVariant;
}

export interface SectorExposureResult {
  scenarioId: string;
  exposures: SectorExposure[];
  tierSummary: Record<string, number>;   // tier name → avg exposure
}

// ─── Decision ────────────────────────────────────────────
export interface DecisionPressure {
  score: number;                  // 0–100
  urgency: DecisionUrgency;
  affectedStakeholders: string[];
  primaryDrivers: string[];
}

export interface DecisionRecommendation {
  id: string;
  scenarioId: string;
  title: LanguageVariant;
  action: LanguageVariant;
  priority: DecisionUrgency;
  confidence: number;
  affectedEntities: string[];
  pressure: DecisionPressure;
}

// ─── Decision Explanation ────────────────────────────────
export interface DecisionExplanation {
  decisionId: string;
  whatHappened: LanguageVariant;
  whyItMatters: LanguageVariant;
  whoIsAffected: string[];
  gdpComponentsMoved: GDPComponentCode[];
  sectorsUnderPressure: SectorCode[];
  whyThisRecommendation: LanguageVariant;
  likelyNextDevelopments: LanguageVariant[];
  confidence: number;
}

export interface ExplainedDecision {
  recommendation: DecisionRecommendation;
  explanation: DecisionExplanation;
}

// ─── Graph ───────────────────────────────────────────────
export interface RelationshipNode {
  id: string;
  type: NodeType;
  label: LanguageVariant;
  metadata?: Record<string, unknown>;
}

export interface RelationshipEdge {
  sourceId: string;
  targetId: string;
  type: EdgeType;
  weight: number;       // 0–1
  label: LanguageVariant;
  explanation?: string;
}

export interface PropagationResult {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
  propagationPath: string[]; // ordered node IDs
}

// ─── Scoring ────────────────────────────────────────────
export interface ScoreComponent {
  name: string;
  rawValue: number;
  weight: number;          // 0–1
  weightedValue: number;
  sourceLayer: string;
}

export interface ScoreResult {
  id: string;
  category: ScoreCategory;
  label: LanguageVariant;
  score: number;           // 0–100
  components: ScoreComponent[];
  confidence: number;      // 0–1
  explanation: LanguageVariant;
}

export interface CompositeScore {
  scenarioId: string;
  overallScore: number;    // 0–100
  subScores: ScoreResult[];
  explanation: LanguageVariant;
  confidence: number;
}

// ─── Risk ───────────────────────────────────────────────
export interface RiskEntry {
  id: string;
  category: RiskCategory;
  title: LanguageVariant;
  description: LanguageVariant;
  severity: RiskSeverity;
  likelihood: number;       // 0–1
  impactScore: number;      // 0–100
  riskScore: number;        // 0–100
  affectedCountries: GCCCountryCode[];
  affectedSectors: SectorCode[];
  mitigation: LanguageVariant;
  propagationTargets: string[];
  drivers: string[];
}

export interface RiskRegister {
  scenarioId: string;
  risks: RiskEntry[];
  aggregateRiskScore: number; // 0–100
  criticalCount: number;
  highCount: number;
  explanation: LanguageVariant;
}

// ─── KPI ────────────────────────────────────────────────
export interface KPITrend {
  direction: "up" | "down" | "stable";
  changePct: number;
  previousValue: number;
}

export interface ExecutiveKPI {
  id: string;
  name: LanguageVariant;
  value: number;
  unit: string;
  trend: KPITrend;
  category: "economic" | "risk" | "opportunity" | "governance" | "infrastructure" | "financial";
  explanation: LanguageVariant;
}

export interface CountryKPI {
  countryCode: GCCCountryCode;
  kpiId: string;
  name: LanguageVariant;
  value: number;
  unit: string;
  trend: KPITrend;
  explanation: LanguageVariant;
}

export interface SectorKPI {
  sectorCode: SectorCode;
  kpiId: string;
  name: LanguageVariant;
  value: number;
  unit: string;
  trend: KPITrend;
  explanation: LanguageVariant;
}

export interface KPIDashboard {
  scenarioId: string;
  executiveKpis: ExecutiveKPI[];
  countryKpis: CountryKPI[];
  sectorKpis: SectorKPI[];
  headline: LanguageVariant;
}

// ─── GCC Dependency ─────────────────────────────────────
export interface SpilloverEffect {
  sourceCountry: GCCCountryCode;
  targetCountry: GCCCountryCode;
  channel: string;
  spilloverScore: number;   // 0–100
  explanation: LanguageVariant;
}

export interface DependencyResult {
  spillovers: SpilloverEffect[];
  aggregateInterconnection: number; // 0–100
  mostExposedCountry: GCCCountryCode;
  explanation: LanguageVariant;
}

// ─── Narrative ───────────────────────────────────────────
export interface NarrativeBlock {
  id: string;
  scenarioId: string;
  type: NarrativeType;
  title: LanguageVariant;
  body: LanguageVariant;
  keyPoints: LanguageVariant[];
  sources: string[];
  createdAt: string;
}

// ─── Full Intelligence Snapshot ──────────────────────────
export interface IntelligenceSnapshot {
  scenarioId: string;
  timestamp: string;
  macroSignals: MacroSignalSet;
  gdpImpacts: GDPImpactResult[];
  countryImpacts: CountryImpact[];
  sectorExposures: SectorExposureResult;
  decisions: ExplainedDecision[];
  graph: PropagationResult;
  kpis: ExecutiveKPI[];
  narrative: NarrativeBlock;
}

// ─── Extended Intelligence Output (from run_extended) ───
export interface ExtendedIntelligenceOutput {
  scenarioId: string;
  timestamp: string;
  macroSignals: MacroSignalSet;
  gdpImpacts: GDPImpactResult[];
  countryImpacts: CountryImpact[];
  sectorExposures: SectorExposureResult;
  decisions: ExplainedDecision[];
  graph: PropagationResult;
  scores: CompositeScore;
  riskRegister: RiskRegister;
  kpiDashboard: KPIDashboard;
  dependencyAnalysis: DependencyResult;
  narrative: NarrativeBlock;
}
