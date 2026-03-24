"""Ingestion schemas — typed contracts for the RSS → ScenarioInput pipeline.

Data flow:
  RawFeedItem (RSS parse)
  → NormalizedEvent (classification + region + sector mapping)
  → EventCluster (deduplicated, multi-source)
  → ScenarioInput (pipeline-ready)
"""
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ─── Enums ────────────────────────────────────────────────────────────────────

class FeedLanguage(str, Enum):
    EN = "en"
    AR = "ar"


class IngestionStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ClusterAction(str, Enum):
    """What happened to an event during clustering."""
    NEW = "new"              # First occurrence — new cluster
    MERGED = "merged"        # Merged into existing cluster
    DUPLICATE = "duplicate"  # Exact duplicate — dropped


# ─── Feed Configuration ───────────────────────────────────────────────────────

class FeedSource(BaseModel):
    """One RSS feed endpoint."""
    id: str
    name: str
    url: str
    language: FeedLanguage
    region: str = "GCC"            # Geographic focus
    category_hint: str = ""        # Optional: helps classification
    enabled: bool = True
    fetch_interval_minutes: int = Field(default=30, ge=1, le=1440)


# ─── Raw Feed Items ───────────────────────────────────────────────────────────

class RawFeedItem(BaseModel):
    """Single item parsed from an RSS feed — no interpretation yet."""
    feed_id: str
    feed_name: str
    title: str
    summary: str
    link: str
    published: Optional[str] = None
    language: FeedLanguage
    fetched_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ─── Normalized Events ────────────────────────────────────────────────────────

class NormalizedEvent(BaseModel):
    """RSS item after deterministic classification.

    At this stage we have:
    - scenario_category (mapped from keywords)
    - severity (mapped from keyword intensity)
    - affected_countries (detected from text)
    - affected_sectors (detected from text)
    - confidence (based on keyword match density)
    """
    event_id: str                    # SHA-256 of (title + link)
    title: str
    summary: str
    link: str
    source_feed: str
    language: FeedLanguage
    published: Optional[str] = None
    fetched_at: str

    # Classification outputs
    scenario_category: str           # Maps to ScenarioCategory.value
    severity: str                    # Maps to ScenarioSeverity.value
    affected_countries: list[str]    # GCCCountryCode values
    affected_sectors: list[str]      # SectorCode values
    confidence: float = Field(ge=0.0, le=1.0)
    matched_keywords: list[str] = []


# ─── Event Clusters ──────────────────────────────────────────────────────────

class EventCluster(BaseModel):
    """Group of related events about the same underlying development."""
    cluster_id: str
    primary_event: NormalizedEvent   # Highest-confidence event in cluster
    source_events: list[str]         # event_ids of all members
    source_count: int = Field(ge=1)
    merged_countries: list[str]      # Union of all affected countries
    merged_sectors: list[str]        # Union of all affected sectors
    max_confidence: float = Field(ge=0.0, le=1.0)
    max_severity: str
    created_at: str


# ─── Ingestion Run ────────────────────────────────────────────────────────────

class IngestionRunResult(BaseModel):
    """Result of a single ingestion cycle."""
    run_id: str
    started_at: str
    completed_at: str
    feeds_fetched: int
    raw_items: int
    normalized_events: int
    clusters_formed: int
    scenarios_generated: int
    duplicates_skipped: int
    errors: list[str] = []


class IngestionStatusResponse(BaseModel):
    """Current state of the ingestion system."""
    status: IngestionStatus
    last_run: Optional[IngestionRunResult] = None
    total_runs: int = 0
    total_scenarios_generated: int = 0
    active_feeds: int = 0
    cache_size: int = 0
