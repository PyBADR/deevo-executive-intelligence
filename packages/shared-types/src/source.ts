/**
 * Data source and provenance types
 * Structures for tracking where data comes from and assessing its quality
 */

import { Country } from './country';

/** Unique identifier for a data source */
export type SourceID = string & { readonly __brand: 'SourceID' };

/**
 * Creates a branded SourceID
 */
export function createSourceID(id: string): SourceID {
  return id as SourceID;
}

/** Type of data source */
export enum SourceType {
  GOVERNMENT_STATISTICS = 'government_statistics',
  CENTRAL_BANK = 'central_bank',
  INTERNATIONAL_ORGANIZATION = 'international_organization',
  NEWS_MEDIA = 'news_media',
  RESEARCH_INSTITUTION = 'research_institution',
  COMMERCIAL_DATABASE = 'commercial_database',
  COMPANY_REPORTS = 'company_reports',
  SOCIAL_MEDIA = 'social_media',
  SURVEY = 'survey',
  SENSOR_DATA = 'sensor_data',
  PROPRIETARY = 'proprietary',
}

/** Source credibility rating */
export enum CredibilityRating {
  HIGHLY_RELIABLE = 'highly_reliable',
  RELIABLE = 'reliable',
  MODERATELY_RELIABLE = 'moderately_reliable',
  QUESTIONABLE = 'questionable',
  UNRELIABLE = 'unreliable',
}

/** Data frequency or publication interval */
export enum PublicationFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  IRREGULAR = 'irregular',
}

/**
 * Data source metadata
 */
export interface DataSource {
  id: SourceID;
  name: string;
  description: string;
  type: SourceType;
  
  /** Organization information */
  organization: string;
  country?: Country;
  website?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  
  /** Data characteristics */
  coverage: {
    geographies: Country[];
    sectors?: string[];
    timeframeStart?: string; // ISO timestamp
    timeframeEnd?: string; // ISO timestamp
  };
  
  /** Quality metrics */
  quality: {
    credibilityRating: CredibilityRating;
    historicalAccuracy?: number; // 0-1
    timeliness?: number; // 0-1, how current
    completeness?: number; // 0-1
    reliability?: number; // 0-1
  };
  
  /** Update schedule */
  publicationFrequency: PublicationFrequency;
  lastUpdate: string; // ISO timestamp
  nextUpdateExpected?: string; // ISO timestamp
  
  /** Access information */
  accessType: 'public' | 'restricted' | 'subscription' | 'proprietary';
  accessUrl?: string;
  
  /** Metadata */
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  retirementDate?: string; // If source is no longer used
}

/**
 * Data point with complete provenance
 */
export interface DataPoint {
  id: string;
  value: string | number;
  unit: string;
  timestamp: string; // ISO timestamp
  
  /** Source information */
  sourceId: SourceID;
  sourceQuote?: string;
  retrievalDate: string; // When we retrieved it
  
  /** Processing information */
  adjusted?: boolean; // Seasonally adjusted, etc.
  adjustmentMethod?: string;
  
  /** Uncertainty */
  confidence: number; // 0-1
  uncertainty?: {
    lowerBound: number;
    upperBound: number;
  };
}

/**
 * Data series from a source
 */
export interface DataSeries {
  id: string;
  sourceId: SourceID;
  name: string;
  description: string;
  
  /** Series characteristics */
  variable: string; // What is being measured
  unit: string;
  frequency: PublicationFrequency;
  
  /** Data */
  dataPoints: DataPoint[];
  
  /** Metadata */
  createdAt: string;
  lastUpdated: string;
  nextUpdate?: string;
}

/**
 * Comparison of data from multiple sources
 */
export interface SourceComparison {
  variable: string;
  sources: Array<{
    source: DataSource;
    latestValue: number;
    latestDate: string;
    trend: 'up' | 'down' | 'flat';
    credibilityRating: CredibilityRating;
  }>;
  divergence: number; // 0-1, how much sources differ
  consensusValue?: number;
  consensusConfidence?: number; // 0-1
}

/**
 * Data audit - tracking how data was used
 */
export interface DataAudit {
  dataPointId: string;
  sourceId: SourceID;
  usedInDecision?: string;
  usedInAnalysis?: string;
  confidence: number; // 0-1
  notes: string;
  auditDate: string; // ISO timestamp
}

/**
 * Source evaluation report
 */
export interface SourceEvaluation {
  sourceId: SourceID;
  evaluationDate: string; // ISO timestamp
  
  /** Assessment */
  accuracy: {
    score: number; // 0-1
    assessmentMethod: string;
    comparableDataSources: SourceID[];
  };
  
  timeliness: {
    score: number; // 0-1
    averageUpdateLag: number; // Days
  };
  
  completeness: {
    score: number; // 0-1
    missingData: string[];
  };
  
  accessibility: {
    score: number; // 0-1
    issues: string[];
  };
  
  /** Overall recommendation */
  recommendation: 'use_primary' | 'use_secondary' | 'use_with_caution' | 'discontinue';
  rationale: string;
  followUpActions: string[];
}

/**
 * Data lineage - tracing data from source to output
 */
export interface DataLineage {
  id: string;
  originalSourceId: SourceID;
  transformations: Array<{
    step: number;
    description: string;
    method: string;
    appliedAt: string;
  }>;
  currentValue: number;
  currentUncertainty: number; // Accumulated uncertainty
  usedInDecision?: string;
}

/**
 * Request for data source discovery
 */
export interface SourceDiscoveryRequest {
  variable: string;
  country?: Country;
  timeframe?: string;
  requiredUpdateFrequency?: PublicationFrequency;
  minimumCredibilityRating?: CredibilityRating;
  accessTypePreference?: 'public' | 'any';
}

/**
 * Response to source discovery
 */
export interface SourceDiscoveryResponse {
  variable: string;
  foundSources: DataSource[];
  coverage: {
    complete: boolean;
    gaps: string[];
  };
  recommendations: DataSource[];
}
