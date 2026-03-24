/**
 * Key Performance Indicator (KPI) types
 * Defines structures for monitoring and tracking performance metrics
 */

import { Country } from './country';
import { Sector } from './sector';

/** Unique identifier for a KPI */
export type KPIID = string & { readonly __brand: 'KPIID' };

/**
 * Creates a branded KPIID
 */
export function createKPIID(id: string): KPIID {
  return id as KPIID;
}

/** KPI category or domain */
export enum KPICategory {
  FINANCIAL = 'financial',
  ECONOMIC = 'economic',
  OPERATIONAL = 'operational',
  MARKET = 'market',
  RISK = 'risk',
  COMPLIANCE = 'compliance',
  CUSTOMER = 'customer',
  EMPLOYEE = 'employee',
}

/** Performance status based on target achievement */
export enum PerformanceStatus {
  EXCEEDS = 'exceeds',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  CRITICAL = 'critical',
  NOT_AVAILABLE = 'not_available',
}

/** Trend direction */
export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  FLAT = 'flat',
  UNKNOWN = 'unknown',
}

/**
 * KPI definition
 */
export interface KPI {
  id: KPIID;
  name: string;
  description: string;
  category: KPICategory;
  
  /** What it measures */
  measurand: string; // What is being measured
  unit: string;
  formula?: string; // How it's calculated
  
  /** Target and thresholds */
  target?: number;
  
  thresholds: {
    exceeds?: number; // Value at or above which status is EXCEEDS
    onTrack?: number; // Value at or above which status is ON_TRACK
    atRisk?: number; // Value at or above which status is AT_RISK
  };
  
  /** Scope */
  country?: Country;
  sector?: Sector;
  applicableToSegments?: string[];
  
  /** Timing */
  updateFrequency: string; // e.g., 'daily', 'weekly', 'monthly'
  reportingDelay?: number; // Days after period end
  
  /** Ownership */
  owner?: string;
  stakeholders?: string[];
  
  /** Metadata */
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  version: number;
  deprecated?: boolean;
}

/**
 * Current value and status of a KPI
 */
export interface KPIReading {
  kpiId: KPIID;
  value: number;
  unit: string;
  timestamp: string; // ISO timestamp
  reportedDate: string; // When the reading was reported
  
  /** Status determination */
  status: PerformanceStatus;
  statusReason?: string;
  
  /** Trend analysis */
  previousValue?: number;
  previousTimestamp?: string;
  changeAmount?: number;
  changePercentage?: number;
  trend: TrendDirection;
  
  /** Quality metrics */
  confidence: number; // 0-1
  dataSource: string;
  note?: string;
}

/**
 * KPI time series - historical values
 */
export interface KPITimeSeries {
  kpiId: KPIID;
  readings: KPIReading[];
  
  /** Analytics */
  statistics: {
    currentValue: number;
    average: number;
    median: number;
    standardDeviation: number;
    min: number;
    max: number;
    percentageChangeYTD?: number;
  };
  
  /** Trend */
  trend: {
    direction: TrendDirection;
    strength: number; // 0-1
    duration: string; // How long trend has been present
  };
  
  /** Forecast */
  forecast?: {
    nextValue: number;
    confidence: number; // 0-1
    range: {
      low: number;
      high: number;
    };
  };
}

/**
 * KPI dashboard - collection of related KPIs
 */
export interface KPIDashboard {
  id: string;
  name: string;
  description: string;
  
  /** Scope */
  country?: Country;
  sector?: Sector;
  
  /** KPIs included */
  kpis: Array<{
    kpiId: KPIID;
    weight?: number; // For aggregated scoring
    displayOrder?: number;
  }>;
  
  /** Current state */
  readings: KPIReading[];
  lastUpdated: string;
  
  /** Aggregated view */
  overallStatus?: PerformanceStatus;
  overallScore?: number; // 0-100
  
  /** Alerts */
  activeAlerts: Array<{
    kpiId: KPIID;
    severity: 'warning' | 'critical';
    message: string;
  }>;
}

/**
 * KPI target and goal
 */
export interface KPIGoal {
  kpiId: KPIID;
  targetValue: number;
  targetDate: string; // ISO timestamp
  startValue: number;
  startDate: string; // ISO timestamp
  
  /** Progress */
  currentValue: number;
  currentDate: string;
  progressPercentage: number; // 0-100
  
  /** Timeline */
  daysRemaining: number;
  onTrack: boolean;
  
  /** Action if off track */
  interventions?: Array<{
    description: string;
    expectedImpact: number;
    implementationDate?: string;
  }>;
}

/**
 * Benchmark comparison of KPI against others
 */
export interface KPIBenchmark {
  kpiId: KPIID;
  yourValue: number;
  
  peers: Array<{
    peerName: string;
    value: number;
    percentile?: number; // Where you stand (0-100)
  }>;
  
  percentile: number; // Your percentile in peer group
  benchmarkValue?: number; // Industry average
  gap: number; // Difference from benchmark
  gapPercentage: number;
  
  trend: {
    yourTrend: TrendDirection;
    peerTrend: TrendDirection;
    relativeGapTrend: TrendDirection; // Is gap closing or widening
  };
}

/**
 * KPI alert condition
 */
export interface KPIAlert {
  id: string;
  kpiId: KPIID;
  alertType: 'threshold_breach' | 'trend_change' | 'forecast_warning' | 'anomaly';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  condition: string; // What triggered this alert
  recommendedAction?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

/**
 * Request for KPI analysis
 */
export interface KPIAnalysisRequest {
  kpiIds: KPIID[];
  period: string; // e.g., 'last_30_days', 'last_quarter', 'ytd'
  includeTrend: boolean;
  includeBenchmark?: boolean;
  includeForecast?: boolean;
  timeGranularity?: 'daily' | 'weekly' | 'monthly';
}

/**
 * KPI analysis report
 */
export interface KPIAnalysisReport {
  period: string;
  kpiTimeSeries: KPITimeSeries[];
  keyFindings: string[];
  riskAreas: string[];
  opportunityAreas: string[];
  recommendations: string[];
  generatedAt: string;
}
