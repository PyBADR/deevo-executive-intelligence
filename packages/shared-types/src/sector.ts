/**
 * Sector definitions and classifications for GCC economies
 * Covers key economic sectors relevant to Gulf Cooperation Council countries
 */

/** Economic sector classification */
export enum Sector {
  OIL_GAS = 'oil_gas',
  BANKING = 'banking',
  INSURANCE = 'insurance',
  FINTECH = 'fintech',
  ECOMMERCE = 'ecommerce',
  LOGISTICS = 'logistics',
  PUBLIC_SECTOR = 'public_sector',
  INFRASTRUCTURE = 'infrastructure',
  TECHNOLOGY = 'technology',
}

/**
 * Metadata about a sector
 */
export interface SectorMetadata {
  code: Sector;
  name: string;
  description: string;
  gdpContribution: number; // Percentage of total GDP
  employmentShare: number; // Percentage of total employment
  volatility: number; // 0-1, higher = more volatile
}

/**
 * Performance metrics for a sector
 */
export interface SectorPerformance {
  sector: Sector;
  growthRate: number; // Percentage
  confidence: number; // 0-1
  trendDirection: 'up' | 'down' | 'flat';
  keyDrivers: string[];
  risks: string[];
}

/**
 * Sector-specific indicators
 */
export interface SectorIndicator {
  sector: Sector;
  indicatorName: string;
  value: number;
  unit: string;
  timestamp: string; // ISO timestamp
  previousValue?: number;
  changePercentage?: number;
}

/**
 * Cross-sector correlation data
 */
export interface SectorCorrelation {
  sector1: Sector;
  sector2: Sector;
  correlationCoefficient: number; // -1 to 1
  confidence: number; // 0-1
  analysisWindow: string; // Time period analyzed
}

/**
 * Sector composition of GDP
 */
export interface SectorGDPComposition {
  sector: Sector;
  absoluteValue: number; // In billions of local currency
  percentageOfTotal: number;
  growthRate: number; // Percentage YoY
  confidence: number; // 0-1
}

/**
 * Configuration for sector analysis
 */
export interface SectorAnalysisConfig {
  includedSectors: Sector[];
  analysisDepth: 'summary' | 'detailed' | 'granular';
  timeSeriesLength: number; // Number of periods to analyze
  correlationAnalysis: boolean;
  forecastHorizon?: string; // e.g., '6m', '1y', '2y'
}

/**
 * Sector shock or disruption event
 */
export interface SectorShock {
  sector: Sector;
  description: string;
  magnitude: number; // -1 to 1
  probability: number; // 0-1
  expectedImpactOnGDP: number; // Percentage
  affectedSubsectors: string[];
  recoveryTimeline?: string; // e.g., '3-6 months', '1-2 years'
}
