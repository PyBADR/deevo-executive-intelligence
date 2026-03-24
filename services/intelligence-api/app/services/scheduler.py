"""
Ingestion Scheduler — Orchestrates the RSS → Pipeline loop.

Data flow:
  RSSProvider.fetch_all()
  → CacheStore.is_seen() (dedup)
  → EventNormalizer.normalize_batch()
  → EventClusterer.cluster()
  → EventNormalizer.to_scenario_input() per cluster
  → IntelligenceOrchestrator.run_extended() per scenario
  → Full intelligence output

The scheduler is synchronous and single-threaded by design.
For production, wrap in asyncio or APScheduler — but the core logic is
always this deterministic loop.
"""
import logging
from datetime import datetime, timezone
from typing import Optional
import uuid

from ..schemas.ingestion import (
    IngestionRunResult,
    IngestionStatusResponse,
    IngestionStatus,
)
from ..schemas.scenario import ScenarioInput
from .rss_provider import RSSProvider
from .event_normalizer import EventNormalizer
from .event_clusterer import EventClusterer
from .cache_store import CacheStore
from ..engines.intelligence_orchestrator import IntelligenceOrchestrator

logger = logging.getLogger(__name__)


class IngestionScheduler:
    """
    Single-pass ingestion: fetch → normalize → cluster → deduplicate → run pipeline.

    Usage:
        scheduler = IngestionScheduler()
        result = scheduler.run_once()
        # result.scenarios_generated tells you how many new scenarios were produced
        # Access full outputs via scheduler.last_outputs
    """

    def __init__(
        self,
        provider: Optional[RSSProvider] = None,
        normalizer: Optional[EventNormalizer] = None,
        clusterer: Optional[EventClusterer] = None,
        cache: Optional[CacheStore] = None,
        orchestrator: Optional[IntelligenceOrchestrator] = None,
    ):
        self.provider = provider or RSSProvider()
        self.normalizer = normalizer or EventNormalizer()
        self.clusterer = clusterer or EventClusterer()
        self.cache = cache or CacheStore(max_age_hours=72)
        self.orchestrator = orchestrator or IntelligenceOrchestrator()

        # State
        self._status: IngestionStatus = IngestionStatus.IDLE
        self._last_run: Optional[IngestionRunResult] = None
        self._total_runs: int = 0
        self._total_scenarios: int = 0
        self._last_outputs: list[dict] = []
        self._last_scenarios: list[ScenarioInput] = []

    # ─── Core Loop ────────────────────────────────────────────────────────────

    def run_once(self) -> IngestionRunResult:
        """
        Execute one full ingestion cycle.

        Returns IngestionRunResult with counts and any errors.
        Full pipeline outputs are stored in self.last_outputs.
        """
        # Re-entrancy guard
        if self._status == IngestionStatus.RUNNING:
            logger.warning("Ingestion already running — skipping")
            return IngestionRunResult(
                run_id="skipped",
                started_at=datetime.now(timezone.utc).isoformat(),
                completed_at=datetime.now(timezone.utc).isoformat(),
                feeds_fetched=0, raw_items=0, normalized_events=0,
                clusters_formed=0, scenarios_generated=0, duplicates_skipped=0,
                errors=["Ingestion already running"],
            )

        run_id = f"run_{uuid.uuid4().hex[:12]}"
        started_at = datetime.now(timezone.utc).isoformat()
        errors: list[str] = []
        self._status = IngestionStatus.RUNNING
        self._last_outputs = []
        self._last_scenarios = []

        logger.info(f"=== Ingestion run {run_id} started ===")

        # Step 1: Fetch all RSS feeds
        try:
            raw_items = self.provider.fetch_all()
            feeds_fetched = self.provider.enabled_feed_count()
        except Exception as e:
            errors.append(f"RSS fetch failed: {e}")
            raw_items = []
            feeds_fetched = 0
            logger.error(f"RSS fetch failed: {e}")

        # Step 2: Deduplicate via cache (before normalization to save CPU)
        new_items = []
        duplicates_skipped = 0
        for item in raw_items:
            if self.cache.is_seen("", item.link, item.title):
                duplicates_skipped += 1
            else:
                new_items.append(item)
                self.cache.mark_seen("", item.link, item.title)

        logger.info(
            f"Cache filter: {len(raw_items)} raw → {len(new_items)} new, "
            f"{duplicates_skipped} duplicates skipped"
        )

        # Step 3: Normalize (classify)
        try:
            normalized = self.normalizer.normalize_batch(new_items)
        except Exception as e:
            errors.append(f"Normalization failed: {e}")
            normalized = []
            logger.error(f"Normalization failed: {e}")

        # Step 4: Cluster
        try:
            clusters = self.clusterer.cluster(normalized)
        except Exception as e:
            errors.append(f"Clustering failed: {e}")
            clusters = []
            logger.error(f"Clustering failed: {e}")

        # Step 5: Convert clusters → ScenarioInput → run pipeline
        scenarios_generated = 0
        for cluster in clusters:
            try:
                scenario = self.normalizer.to_scenario_input(cluster.primary_event)
                # Override with merged data from cluster
                scenario = ScenarioInput(
                    id=scenario.id,
                    title=scenario.title,
                    description=scenario.description,
                    category=scenario.category,
                    severity=scenario.severity,
                    affected_countries=scenario.affected_countries,
                    affected_sectors=scenario.affected_sectors,
                    source_count=cluster.source_count,
                    confidence=cluster.max_confidence,
                    created_at=scenario.created_at,
                )

                # Run full intelligence pipeline
                output = self.orchestrator.run_extended(scenario)
                self._last_outputs.append(output)
                self._last_scenarios.append(scenario)
                scenarios_generated += 1

            except Exception as e:
                errors.append(
                    f"Pipeline failed for cluster {cluster.cluster_id}: {e}"
                )
                logger.error(f"Pipeline error: {e}")

        # Save cache snapshot
        self.cache.save_snapshot()

        # Build result
        completed_at = datetime.now(timezone.utc).isoformat()
        result = IngestionRunResult(
            run_id=run_id,
            started_at=started_at,
            completed_at=completed_at,
            feeds_fetched=feeds_fetched,
            raw_items=len(raw_items),
            normalized_events=len(normalized),
            clusters_formed=len(clusters),
            scenarios_generated=scenarios_generated,
            duplicates_skipped=duplicates_skipped,
            errors=errors,
        )

        # Update state
        self._last_run = result
        self._total_runs += 1
        self._total_scenarios += scenarios_generated
        # Status: COMPLETED if no errors, FAILED if errors and no output,
        # COMPLETED if partial success (some errors but scenarios generated)
        if not errors:
            self._status = IngestionStatus.COMPLETED
        elif scenarios_generated > 0:
            self._status = IngestionStatus.COMPLETED  # partial success
        else:
            self._status = IngestionStatus.FAILED

        logger.info(
            f"=== Ingestion run {run_id} complete: "
            f"{scenarios_generated} scenarios generated, "
            f"{len(errors)} errors ==="
        )

        return result

    # ─── State Accessors ──────────────────────────────────────────────────────

    @property
    def status(self) -> IngestionStatusResponse:
        """Current ingestion system status."""
        return IngestionStatusResponse(
            status=self._status,
            last_run=self._last_run,
            total_runs=self._total_runs,
            total_scenarios_generated=self._total_scenarios,
            active_feeds=self.provider.enabled_feed_count(),
            cache_size=self.cache.size(),
        )

    @property
    def last_outputs(self) -> list[dict]:
        """Full pipeline outputs from last run."""
        return self._last_outputs

    @property
    def last_scenarios(self) -> list[ScenarioInput]:
        """ScenarioInput objects generated in last run."""
        return self._last_scenarios
