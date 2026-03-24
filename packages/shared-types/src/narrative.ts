/**
 * Narrative and story types for economic intelligence
 * Structures for generating and storing economic narratives and explanations
 */

import { LanguageVariant } from './common';
import { MacroSignal } from './signals';
import { Sector } from './sector';
import { Country } from './country';

/** Unique identifier for a narrative */
export type NarrativeID = string & { readonly __brand: 'NarrativeID' };

/**
 * Creates a branded NarrativeID
 */
export function createNarrativeID(id: string): NarrativeID {
  return id as NarrativeID;
}

/** Narrative type or genre */
export enum NarrativeType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  DEEP_DIVE = 'deep_dive',
  SCENARIO_STORY = 'scenario_story',
  TREND_ANALYSIS = 'trend_analysis',
  RISK_ALERT = 'risk_alert',
  OPPORTUNITY_BRIEF = 'opportunity_brief',
  MARKET_INSIGHT = 'market_insight',
}

/** Target audience for narrative */
export enum NarrativeAudience {
  EXECUTIVE = 'executive',
  ANALYST = 'analyst',
  INVESTOR = 'investor',
  OPERATIONAL = 'operational',
  BOARD = 'board',
  PUBLIC = 'public',
}

/**
 * Section within a narrative
 */
export interface NarrativeSection {
  id: string;
  title: LanguageVariant;
  content: LanguageVariant;
  importance: 'critical' | 'high' | 'medium' | 'low';
  keyTakeaways: LanguageVariant[];
  supportingData?: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
}

/**
 * Narrative about economic trends or insights
 */
export interface Narrative {
  id: NarrativeID;
  type: NarrativeType;
  audience: NarrativeAudience;
  title: LanguageVariant;
  
  /** Metadata */
  country: Country;
  affectedSectors?: Sector[];
  relatedSignals?: MacroSignal[];
  timeframe?: string;
  
  /** Content */
  summary: LanguageVariant;
  sections: NarrativeSection[];
  
  /** Context and supporting info */
  keyFacts: Array<{
    fact: LanguageVariant;
    source: string;
    confidence: number; // 0-1
  }>;
  
  /** Implications */
  implications: {
    shortTerm: LanguageVariant;
    mediumTerm: LanguageVariant;
    longTerm: LanguageVariant;
  };
  
  /** Recommendations */
  recommendations: Array<{
    action: LanguageVariant;
    rationale: LanguageVariant;
    timeframe: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }>;
  
  /** Narrative quality metrics */
  quality: {
    clarity: number; // 0-1
    accuracy: number; // 0-1
    completeness: number; // 0-1
    coherence: number; // 0-1
  };
  
  /** Metadata */
  author?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  version: number;
  status: 'draft' | 'published' | 'archived';
}

/**
 * Story arc component of narrative
 */
export interface StoryArc {
  setup: LanguageVariant; // The context/situation
  complication: LanguageVariant; // The challenge or change
  climax: LanguageVariant; // The peak moment or decision point
  resolution: LanguageVariant; // The outcome or implication
}

/**
 * Character or actor in an economic narrative
 */
export interface NarrativeActor {
  name: string;
  role: string;
  description: LanguageVariant;
  motivations: string[];
  constraints: string[];
  influence: number; // 0-1
}

/**
 * Economic narrative with character development
 */
export interface EconomicStory {
  id: NarrativeID;
  title: LanguageVariant;
  storyArc: StoryArc;
  actors: NarrativeActor[];
  setting: {
    country: Country;
    timeframe: string;
    economicContext: LanguageVariant;
  };
  themes: string[];
  lesson: LanguageVariant; // The takeaway
  createdAt: string;
}

/**
 * Comparative narrative analyzing multiple scenarios
 */
export interface ComparativeNarrative {
  id: NarrativeID;
  title: LanguageVariant;
  scenarios: Array<{
    name: string;
    narrative: LanguageVariant;
    likelihood: number; // 0-1
    keyDifferences: LanguageVariant[];
  }>;
  analysis: {
    convergences: LanguageVariant[];
    divergences: LanguageVariant[];
    criticalDecisionPoints: LanguageVariant[];
  };
  implications: LanguageVariant;
  createdAt: string;
}

/**
 * Visualization narrative pairing text with data
 */
export interface DataStory {
  id: NarrativeID;
  title: LanguageVariant;
  narrative: LanguageVariant;
  visualizations: Array<{
    id: string;
    type: 'chart' | 'map' | 'table' | 'infographic';
    dataSourceId: string;
    caption: LanguageVariant;
  }>;
  keyMetrics: Array<{
    metric: string;
    value: number;
    context: LanguageVariant;
  }>;
  createdAt: string;
}

/**
 * Narrative outline or template
 */
export interface NarrativeTemplate {
  id: string;
  name: string;
  description: string;
  type: NarrativeType;
  sections: Array<{
    title: string;
    guidingQuestions: string[];
    expectedLength: string; // e.g., '2-3 paragraphs'
  }>;
  keyElements: string[];
}

/**
 * Request for narrative generation
 */
export interface NarrativeGenerationRequest {
  type: NarrativeType;
  audience: NarrativeAudience;
  country?: Country;
  topic: string;
  affectedSectors?: Sector[];
  relatedSignals?: MacroSignal[];
  tone: 'neutral' | 'urgent' | 'optimistic' | 'cautious';
  languages: Array<'en' | 'ar'>;
  maxLength?: number; // Words
}

/**
 * Generated narrative response
 */
export interface NarrativeResponse {
  narrative: Narrative;
  generationQuality: {
    coherence: number; // 0-1
    relevance: number; // 0-1
    actionability: number; // 0-1
  };
  alternativeNarratives?: Narrative[];
}
