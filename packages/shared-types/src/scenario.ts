/**
 * Scenario types for economic simulation and impact analysis
 * Defines structures for representing economic scenarios with baseline and alternative outcomes
 */

import { Country } from './country';
import { Sector } from './sector';
import { GDPComponent } from './gdp';
import { MacroSignal } from './signals';
import { ExplainedDecision } from './decision';

/** Unique identifier for a scenario */
export type ScenarioID = string & { readonly __brand: 'ScenarioID' };

/**
 * Creates a branded ScenarioID
 */
export function createScenarioID(id: string): ScenarioID {
  return id as ScenarioID;
}

/** Severity level for scenario impacts */
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/** Time horizon for scenario projection */
export enum TimeHorizon {
  IMMEDIATE = '0-3m',
  SHORT_TERM = '3-12m',
  MEDIUM_TERM = '1-2y',
  LONG_TERM = '2-5y',
}

/** Scenario outcome classification */
export enum OutcomeType {
  BASELINE = 'baseline',
  OPTIMISTIC = 'optimistic',
  PESSIMISTIC = 'pessimistic',
  ALTERNATIVE = 'alternative',
}

/**
 * Impact of a scenario on a specific sector
 */
export interface SectorImpact {
  sector: Sector;
  severity: SeverityLevel;
  confidence: number; // 0-1
  description: string;
  affectedSegments: string[];
}

/**
 * GDP component changes in scenario
 */
export interface GDPScenarioImpact {
  component: GDPComponent;
  percentageChange: number; // Can be negative
  confidence: number; // 0-1
}

/**
 * Macroeconomic signals triggered by scenario
 */
export interface ScenarioSignalTrigger {
  signal: MacroSignal;
  magnitude: number; // -1 to 1
  probability: number; // 0-1
  timeframe: TimeHorizon;
}

/**
 * Complete scenario definition with baseline and outcome
 */
export interface Scenario {
  id: ScenarioID;
  name: string;
  description: string;
  country: Country;
  timeHorizon: TimeHorizon;
  outcomeType: OutcomeType;
  
  /** Baseline economic conditions */
  baseline: {
    gdpGrowth: number;
    inflationRate: number;
    unemploymentRate: number;
    exchangeRate: number;
  };
  
  /** Scenario outcome economic conditions */
  outcome: {
    gdpGrowth: number;
    inflationRate: number;
    unemploymentRate: number;
    exchangeRate: number;
  };
  
  /** Changes from baseline */
  changes: {
    gdp: GDPScenarioImpact[];
    sectors: SectorImpact[];
    signals: ScenarioSignalTrigger[];
  };
  
  /** Overall severity and confidence */
  overall: {
    severity: SeverityLevel;
    confidence: number; // 0-1
  };
  
  /** Recommended decision for this scenario */
  recommendedDecision?: ExplainedDecision;
  
  /** ISO timestamp when scenario was created */
  createdAt: string;
  
  /** ISO timestamp when scenario was last updated */
  updatedAt: string;
}

/**
 * Collection of related scenarios for analysis
 */
export interface ScenarioSet {
  baseline: Scenario;
  alternatives: Scenario[];
  analysis: {
    commonImpacts: SectorImpact[];
    divergentImpacts: SectorImpact[];
    sensitivity: Map<string, number>; // Parameter name to impact magnitude
  };
}

/**
 * Request for scenario analysis
 */
export interface ScenarioAnalysisRequest {
  country: Country;
  currentConditions: {
    gdpGrowth: number;
    inflationRate: number;
    unemploymentRate: number;
  };
  timeHorizon: TimeHorizon;
  focusSectors?: Sector[];
  includeAlternatives: boolean;
}

/**
 * Response from scenario analysis
 */
export interface ScenarioAnalysisResponse {
  requestId: string;
  scenarios: ScenarioSet;
  generatedAt: string;
  analysisQuality: {
    dataCompleteness: number; // 0-1
    modelConfidence: number; // 0-1
  };
}
