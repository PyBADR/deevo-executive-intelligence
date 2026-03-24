/**
 * Macroeconomic signals and indicators
 * Defines types for monitoring and analyzing key economic signals
 */

/** Types of macroeconomic signals */
export enum MacroSignal {
  INFLATION = 'inflation',
  TRADE_ROUTE_RISK = 'trade_route_risk',
  SHIPPING_STRESS = 'shipping_stress',
  ENERGY_EXPOSURE = 'energy_exposure',
  CONFIDENCE_SHOCK = 'confidence_shock',
  SPENDING_PRESSURE = 'spending_pressure',
  INVESTMENT_PRESSURE = 'investment_pressure',
}

/** Signal intensity or magnitude */
export enum SignalStrength {
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  SEVERE = 'severe',
}

/**
 * Current state of a macroeconomic signal
 */
export interface SignalState {
  signal: MacroSignal;
  value: number; // -1 to 1, with 0 as neutral
  strength: SignalStrength;
  confidence: number; // 0-1
  trend: 'deteriorating' | 'improving' | 'stable';
  lastUpdated: string; // ISO timestamp
}

/**
 * Historical signal data point
 */
export interface SignalDataPoint {
  timestamp: string; // ISO timestamp
  value: number; // -1 to 1
  strength: SignalStrength;
  source: string;
  confidence: number; // 0-1
}

/**
 * Signal time series
 */
export interface SignalTimeSeries {
  signal: MacroSignal;
  dataPoints: SignalDataPoint[];
  currentState: SignalState;
  
  /** Statistical measures */
  statistics: {
    mean: number;
    standardDeviation: number;
    min: number;
    max: number;
    volatility: number; // 0-1
  };
  
  /** Trend analysis */
  trend: {
    direction: 'up' | 'down' | 'flat';
    strength: number; // 0-1
    persistency: number; // 0-1, how long trend has lasted
  };
}

/**
 * Signal-based alert or warning
 */
export interface SignalAlert {
  id: string;
  signal: MacroSignal;
  alertType: 'warning' | 'critical' | 'advisory';
  description: string;
  magnitude: number; // -1 to 1
  probability: number; // 0-1
  recommendedAction: string;
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  confidence: number; // 0-1
}

/**
 * Correlation between two signals
 */
export interface SignalCorrelation {
  signal1: MacroSignal;
  signal2: MacroSignal;
  correlationCoefficient: number; // -1 to 1
  confidence: number; // 0-1
  lagDays?: number; // If signal1 leads signal2
  analysisWindow: string; // Time period used
}

/**
 * Leading/lagging relationship between signals
 */
export interface SignalRelationship {
  leadingSignal: MacroSignal;
  laggedSignal: MacroSignal;
  leadTime: string; // e.g., '2-4 weeks', '1-2 months'
  predictivePower: number; // 0-1
  historicalAccuracy: number; // 0-1
  confidence: number; // 0-1
}

/**
 * Composite index from multiple signals
 */
export interface SignalComposite {
  name: string;
  description: string;
  components: Array<{
    signal: MacroSignal;
    weight: number; // Sum of weights = 1
  }>;
  value: number; // Weighted average
  direction: 'up' | 'down' | 'flat';
  confidence: number; // 0-1
  timestamp: string;
}

/**
 * Signal monitoring configuration
 */
export interface SignalMonitoringConfig {
  monitoredSignals: MacroSignal[];
  updateFrequency: string; // e.g., 'daily', 'weekly', 'real-time'
  alertThresholds: Map<MacroSignal, number>; // Value above which alert is triggered
  correlationAnalysis: boolean;
  forecastSignalChanges: boolean;
}

/**
 * Signal analysis and interpretation
 */
export interface SignalAnalysis {
  signal: MacroSignal;
  currentValue: number;
  interpretation: string;
  historicalContext: {
    averageValue: number;
    maxHistoricalValue: number;
    minHistoricalValue: number;
    percentile: number; // Current value percentile in history
  };
  drivingFactors: string[];
  expectedEvolution: {
    shortTerm: string; // e.g., '3 months'
    direction: 'up' | 'down' | 'flat';
    confidence: number; // 0-1
  };
  relatedSignals: SignalCorrelation[];
}

/**
 * Comprehensive signal dashboard
 */
export interface SignalDashboard {
  timestamp: string;
  signals: SignalState[];
  alerts: SignalAlert[];
  composites: SignalComposite[];
  keyInsights: string[];
  overallRiskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number; // 0-1
  };
}
