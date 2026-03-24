/**
 * Graph and relationship types for economic knowledge representation
 * Structures for representing causal relationships, dependencies, and networks
 */

import { Country } from './country';
import { Sector } from './sector';
import { MacroSignal } from './signals';

/** Unique identifier for a node in the economic graph */
export type NodeID = string & { readonly __brand: 'NodeID' };

/**
 * Creates a branded NodeID
 */
export function createNodeID(id: string): NodeID {
  return id as NodeID;
}

/** Types of nodes in economic graph */
export enum NodeType {
  COUNTRY = 'country',
  SECTOR = 'sector',
  SIGNAL = 'signal',
  COMPANY = 'company',
  POLICY = 'policy',
  EVENT = 'event',
  TREND = 'trend',
  RISK_FACTOR = 'risk_factor',
}

/** Types of relationships between nodes */
export enum RelationshipType {
  CAUSES = 'causes',
  INFLUENCED_BY = 'influenced_by',
  CORRELATES_WITH = 'correlates_with',
  DEPENDS_ON = 'depends_on',
  COMPETES_WITH = 'competes_with',
  COMPLEMENTS = 'complements',
  SUBSTITUTES = 'substitutes',
  PART_OF = 'part_of',
  CONTAINS = 'contains',
  CONNECTED_TO = 'connected_to',
}

/**
 * Node in the economic knowledge graph
 */
export interface GraphNode {
  id: NodeID;
  type: NodeType;
  label: string;
  description: string;
  
  /** Core attributes */
  attributes: Record<string, string | number | boolean>;
  
  /** Classification */
  country?: Country;
  sector?: Sector;
  signal?: MacroSignal;
  
  /** Timeline */
  relevantSince?: string; // ISO timestamp
  relevantUntil?: string; // ISO timestamp
  
  /** Data quality */
  confidence: number; // 0-1
  dataSource: string;
  lastUpdated: string; // ISO timestamp
}

/**
 * Relationship between two nodes
 */
export interface GraphRelationship {
  id: string;
  sourceNodeId: NodeID;
  targetNodeId: NodeID;
  type: RelationshipType;
  
  /** Strength of relationship */
  strength: number; // -1 to 1
  confidence: number; // 0-1
  
  /** Temporal information */
  lag?: number; // Days by which source precedes target
  
  /** Description */
  description: string;
  mechanism: string; // How does the relationship work?
  
  /** Supporting evidence */
  evidence: Array<{
    source: string;
    citation: string;
    confidence: number; // 0-1
  }>;
  
  /** Metadata */
  discoveredDate: string; // ISO timestamp
  lastValidated: string; // ISO timestamp
}

/**
 * Path between two nodes in the graph
 */
export interface GraphPath {
  startNodeId: NodeID;
  endNodeId: NodeID;
  path: NodeID[];
  relationships: GraphRelationship[];
  totalStrength: number; // Combined strength of path
  confidence: number; // 0-1
  shortestPath: boolean;
}

/**
 * Causal chain - sequence of causally related events
 */
export interface CausalChain {
  id: string;
  startEvent: GraphNode;
  endEvent: GraphNode;
  chain: Array<{
    node: GraphNode;
    relationship: GraphRelationship;
  }>;
  totalDelay: number; // Days from start to end
  confidence: number; // 0-1
  description: string;
}

/**
 * Subgraph - connected component of the larger graph
 */
export interface Subgraph {
  id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  density: number; // 0-1, how interconnected
  clustering: number; // 0-1, tendency to form clusters
}

/**
 * Network analysis metrics
 */
export interface NetworkMetrics {
  totalNodes: number;
  totalRelationships: number;
  averageDegree: number;
  networkDensity: number; // 0-1
  clusteringCoefficient: number; // 0-1
  averagePathLength: number;
  
  /** Centrality measures */
  centralityByNode: Map<NodeID, {
    betweenness: number;
    closeness: number;
    eigenvector: number;
    pagerank: number;
  }>;
  
  /** Community detection */
  communities: NodeID[][];
  communityCount: number;
}

/**
 * Graph query - specification for finding patterns in the graph
 */
export interface GraphQuery {
  id: string;
  name: string;
  
  /** Node criteria */
  nodeTypes?: NodeType[];
  nodeLabelPattern?: string;
  nodeAttributes?: Record<string, unknown>;
  
  /** Relationship criteria */
  relationshipTypes?: RelationshipType[];
  minRelationshipStrength?: number;
  minConfidence?: number;
  
  /** Path criteria */
  maxPathLength?: number;
  onlyDirectRelationships?: boolean;
  
  /** Results */
  limit?: number;
}

/**
 * Result of a graph query
 */
export interface GraphQueryResult {
  queryId: string;
  matchingNodes: GraphNode[];
  matchingRelationships: GraphRelationship[];
  matchingPaths: GraphPath[];
  matchCount: number;
  executionTime: number; // Milliseconds
}

/**
 * Graph snapshot - static copy of graph at a point in time
 */
export interface GraphSnapshot {
  id: string;
  timestamp: string; // ISO timestamp
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  metrics: NetworkMetrics;
  description: string;
}

/**
 * Graph evolution - tracking changes over time
 */
export interface GraphEvolution {
  nodeId: NodeID;
  snapshots: Array<{
    timestamp: string;
    attributeChanges: Record<string, string | number>;
    relationshipChanges: {
      added: GraphRelationship[];
      removed: GraphRelationship[];
      modified: Array<{ old: GraphRelationship; new: GraphRelationship }>;
    };
  }>;
}

/**
 * Anomaly in the graph - unusual pattern or relationship
 */
export interface GraphAnomaly {
  id: string;
  type: 'unexpected_connection' | 'missing_relationship' | 'strength_anomaly' | 'timing_anomaly';
  severity: number; // 0-1
  description: string;
  affectedNodes: NodeID[];
  affectedRelationships?: string[];
  detectedAt: string; // ISO timestamp
  confidence: number; // 0-1
}
