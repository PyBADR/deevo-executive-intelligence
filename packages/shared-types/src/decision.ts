/**
 * Decision types and frameworks
 * Defines structures for representing decisions with supporting analysis and confidence
 */

/** Unique identifier for a decision */
export type DecisionID = string & { readonly __brand: 'DecisionID' };

/**
 * Creates a branded DecisionID
 */
export function createDecisionID(id: string): DecisionID {
  return id as DecisionID;
}

/** Urgency level for decision-making */
export enum DecisionUrgency {
  IMMEDIATE = 'immediate',
  SHORT_TERM = 'short_term',
  MEDIUM_TERM = 'medium_term',
  LONG_TERM = 'long_term',
}

/** Category of decision */
export enum DecisionCategory {
  STRATEGY = 'strategy',
  TACTICAL = 'tactical',
  OPERATIONAL = 'operational',
  RISK_MANAGEMENT = 'risk_management',
  RESOURCE_ALLOCATION = 'resource_allocation',
  PARTNERSHIP = 'partnership',
}

/** Stakeholder impact type */
export enum StakeholderType {
  EXECUTIVE = 'executive',
  INVESTOR = 'investor',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
  GOVERNMENT = 'government',
  PARTNER = 'partner',
}

/**
 * Impact of decision on a specific dimension
 */
export interface ImpactArea {
  dimension: string; // e.g., 'revenue', 'risk', 'brand', 'compliance'
  magnitude: number; // -1 to 1
  confidence: number; // 0-1
  timeframe: string; // When impact will be felt
  metrics: string[]; // How to measure this impact
}

/**
 * Stakeholder perspective on decision
 */
export interface StakeholderPerspective {
  stakeholderType: StakeholderType;
  sentiment: number; // -1 to 1
  priority: number; // 0-1, how much they care
  concerns: string[];
  opportunities: string[];
  influence: number; // 0-1, their ability to impact outcome
}

/**
 * Alternative option in decision analysis
 */
export interface DecisionAlternative {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedCost: number;
  expectedReturn: number;
  risks: string[];
  timeline: string;
  feasibility: number; // 0-1
  alignmentWithStrategy: number; // 0-1
}

/**
 * Supporting evidence and analysis for a decision
 */
export interface DecisionContext {
  background: string;
  relevantFactors: string[];
  marketConditions: string;
  competitiveEnvironment: string;
  regulatoryEnvironment: string;
  internalCapabilities: string[];
  externalConstraints: string[];
}

/**
 * Complete explained decision with all supporting analysis
 */
export interface ExplainedDecision {
  id: DecisionID;
  title: string;
  description: string;
  category: DecisionCategory;
  urgency: DecisionUrgency;
  
  /** Context and background */
  context: DecisionContext;
  
  /** Available alternatives */
  alternatives: DecisionAlternative[];
  
  /** Recommended option */
  recommendation: {
    alternativeId: string;
    rationale: string[];
    expectedOutcome: string;
  };
  
  /** Impact analysis */
  impacts: {
    areas: ImpactArea[];
    overallMagnitude: number; // -1 to 1
    timeToMaturity: string; // When full impact will be realized
  };
  
  /** Stakeholder analysis */
  stakeholders: StakeholderPerspective[];
  
  /** Confidence and risk */
  confidence: {
    overall: number; // 0-1
    inRecommendation: number; // 0-1
    inAnalysis: number; // 0-1
    uncertainties: string[];
  };
  
  /** Implementation details */
  implementation: {
    steps: string[];
    timeline: string;
    resources: string[];
    dependencies: string[];
    criticalSuccessFactors: string[];
  };
  
  /** Risk assessment */
  risks: Array<{
    description: string;
    severity: number; // 0-1
    probability: number; // 0-1
    mitigation: string[];
  }>;
  
  /** Key metrics for monitoring */
  successMetrics: Array<{
    name: string;
    target: string;
    measurementFrequency: string;
  }>;
  
  /** Decision metadata */
  decisionMaker?: string;
  dateCreated: string; // ISO timestamp
  lastUpdated: string; // ISO timestamp
  status: 'pending' | 'approved' | 'rejected' | 'implemented' | 'archived';
  relatedDecisions?: DecisionID[];
}

/**
 * Decision framework or template
 */
export interface DecisionFramework {
  name: string;
  description: string;
  applicableCategories: DecisionCategory[];
  keyQuestions: string[];
  evaluationCriteria: Array<{
    criterion: string;
    weight: number; // Importance weight
  }>;
  decisionMatrix: Array<{
    alternative: string;
    scores: Map<string, number>; // Criterion -> score
  }>;
}

/**
 * Portfolio of related decisions
 */
export interface DecisionPortfolio {
  name: string;
  decisions: ExplainedDecision[];
  interdependencies: Array<{
    decision1Id: DecisionID;
    decision2Id: DecisionID;
    relationship: 'depends_on' | 'conflicts_with' | 'reinforces' | 'neutral';
  }>;
  overallAlignment: number; // 0-1, how well decisions work together
  executionSequence: DecisionID[];
}

/**
 * Request for decision analysis
 */
export interface DecisionAnalysisRequest {
  question: string;
  category: DecisionCategory;
  urgency: DecisionUrgency;
  context: Partial<DecisionContext>;
  suggestedAlternatives?: string[];
  stakeholdersToConsider?: StakeholderType[];
  timeframe?: string;
}

/**
 * Decision audit trail entry
 */
export interface DecisionAuditEntry {
  decisionId: DecisionID;
  timestamp: string; // ISO timestamp
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'implemented' | 'archived';
  changedBy: string;
  changes: string[];
  rationale: string;
}
