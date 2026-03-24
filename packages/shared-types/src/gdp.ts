/**
 * GDP-related types for economic analysis
 * Covers GDP components, growth rates, and economic structure
 */

/** Major components of GDP */
export enum GDPComponent {
  HOUSEHOLD_CONSUMPTION = 'household_consumption',
  BUSINESS_INVESTMENT = 'business_investment',
  GOVERNMENT_SPENDING = 'government_spending',
  NET_EXPORTS = 'net_exports',
}

/**
 * GDP component breakdown with values
 */
export interface GDPBreakdown {
  component: GDPComponent;
  absoluteValue: number; // In billions of local currency
  percentageOfTotal: number;
  growthRate: number; // Percentage, can be negative
  confidence: number; // 0-1
}

/**
 * Complete GDP overview for a time period
 */
export interface GDPOverview {
  totalGDP: number; // In billions of local currency
  gdpPerCapita: number;
  growthRate: number; // Percentage YoY
  previousPeriodGDP?: number;
  components: GDPBreakdown[];
  timestamp: string; // ISO timestamp
  dataQuality: number; // 0-1
  forecastConfidence: number; // 0-1
}

/**
 * Historical GDP trend
 */
export interface GDPTrend {
  periods: Array<{
    date: string; // ISO timestamp
    gdp: number;
    growthRate: number;
    components: GDPBreakdown[];
  }>;
  averageGrowthRate: number;
  volatility: number; // Standard deviation of growth rates
  trend: 'accelerating' | 'decelerating' | 'stable';
}

/**
 * GDP forecast for future periods
 */
export interface GDPForecast {
  basePeriod: string; // ISO timestamp
  forecastPeriods: Array<{
    date: string; // ISO timestamp
    projectedGDP: number;
    projectedGrowthRate: number;
    lowBound: number; // Lower confidence interval
    highBound: number; // Upper confidence interval
    confidence: number; // 0-1
  }>;
  methodology: string;
  assumptions: string[];
}

/**
 * Sensitivity analysis for GDP components
 */
export interface GDPSensitivity {
  component: GDPComponent;
  baselineValue: number;
  scenarios: Array<{
    changePercentage: number;
    resultingGDPImpact: number;
    probability: number; // 0-1
  }>;
}

/**
 * Shock impact on GDP
 */
export interface GDPShock {
  description: string;
  magnitude: number; // -1 to 1
  affectedComponents: GDPComponent[];
  immediateImpact: number; // Percentage change
  recoveryPath: {
    timeline: string; // e.g., '6-12 months'
    recoveryRate: number; // Percentage per month
  };
  confidence: number; // 0-1
}

/**
 * Detailed economic accounting framework
 */
export interface NationalAccounts {
  period: string; // ISO timestamp
  
  /** Production approach */
  grossValueAdded: number;
  grossValueAddedByIndustry: Map<string, number>;
  
  /** Expenditure approach */
  consumption: number;
  investment: number;
  governmentSpending: number;
  exports: number;
  imports: number;
  gdp: number;
  
  /** Income approach */
  compensation: number;
  businessSurplus: number;
  mixedIncome: number;
  taxes: number;
  subsidies: number;
  
  /** Reconciliation and balancing */
  statisticalDiscrepancy: number;
  dataQuality: 'high' | 'medium' | 'low';
}

/**
 * Request for GDP analysis
 */
export interface GDPAnalysisRequest {
  includeComponents: boolean;
  includeForecast: boolean;
  forecastHorizon?: string; // e.g., '6m', '1y', '2y'
  includeHistoricalTrend: boolean;
  historicalPeriods?: number; // Number of past periods to include
  includeSensitivityAnalysis: boolean;
}

/**
 * Comprehensive GDP analysis response
 */
export interface GDPAnalysisResponse {
  overview: GDPOverview;
  trend?: GDPTrend;
  forecast?: GDPForecast;
  sensitivity?: GDPSensitivity[];
  analysisQuality: {
    dataCompleteness: number; // 0-1
    forecastReliability: number; // 0-1
  };
  timestamp: string;
}
