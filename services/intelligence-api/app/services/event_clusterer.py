"""
Event Clusterer — Groups related events about the same development.

Data flow: list[NormalizedEvent] → list[EventCluster]

Clustering is deterministic and based on:
  1. Same scenario_category
  2. Overlapping affected_countries (≥1 common)
  3. Title similarity (Jaccard on normalized word sets ≥ 0.3)

Each cluster picks the highest-confidence event as primary.
Cluster merges countries and sectors across all member events.
"""
import hashlib
import logging
import re
import unicodedata
from datetime import datetime, timezone
from typing import Optional

from ..schemas.ingestion import NormalizedEvent, EventCluster, ClusterAction
from ..schemas.scenario import ScenarioSeverity

logger = logging.getLogger(__name__)

# Severity ranking for max_severity computation
SEVERITY_RANK: dict[str, int] = {
    ScenarioSeverity.CRITICAL.value: 4,
    ScenarioSeverity.HIGH.value: 3,
    ScenarioSeverity.MEDIUM.value: 2,
    ScenarioSeverity.LOW.value: 1,
}


class EventClusterer:
    """
    Groups NormalizedEvents into EventClusters.

    Deterministic logic:
    - Events in the same category with overlapping countries and similar titles
      are clustered together.
    - New events that don't match any existing cluster form a new cluster.
    - Clusters pick the highest-confidence member as primary event.
    """

    def __init__(self, title_similarity_threshold: float = 0.3):
        self.title_threshold = title_similarity_threshold
        self._clusters: list[EventCluster] = []

    def cluster(self, events: list[NormalizedEvent]) -> list[EventCluster]:
        """
        Cluster a batch of normalized events.

        Returns list of EventClusters. Each event is assigned to exactly one cluster.
        """
        self._clusters = []
        actions: dict[str, ClusterAction] = {}

        for event in events:
            matched_cluster = self._find_matching_cluster(event)

            if matched_cluster is not None:
                # Merge into existing cluster
                self._merge_into_cluster(matched_cluster, event)
                actions[event.event_id] = ClusterAction.MERGED
            else:
                # Create new cluster
                new_cluster = self._create_cluster(event)
                self._clusters.append(new_cluster)
                actions[event.event_id] = ClusterAction.NEW

        logger.info(
            f"Clustered {len(events)} events → {len(self._clusters)} clusters "
            f"(new: {sum(1 for a in actions.values() if a == ClusterAction.NEW)}, "
            f"merged: {sum(1 for a in actions.values() if a == ClusterAction.MERGED)})"
        )
        return self._clusters

    def get_clusters(self) -> list[EventCluster]:
        """Return current cluster state."""
        return self._clusters

    # ─── Cluster Operations ───────────────────────────────────────────────────

    def _find_matching_cluster(self, event: NormalizedEvent) -> Optional[int]:
        """
        Find index of matching cluster for this event, or None.

        Match criteria (ALL must be true):
          1. Same scenario_category
          2. ≥1 overlapping country
          3. Title Jaccard similarity ≥ threshold
        """
        for idx, cluster in enumerate(self._clusters):
            primary = cluster.primary_event

            # Criterion 1: Same category
            if primary.scenario_category != event.scenario_category:
                continue

            # Criterion 2: Overlapping countries
            existing_countries = set(cluster.merged_countries)
            event_countries = set(event.affected_countries)
            if not existing_countries.intersection(event_countries) and existing_countries and event_countries:
                continue

            # Criterion 3: Title similarity
            similarity = self._title_jaccard(primary.title, event.title)
            if similarity >= self.title_threshold:
                return idx

        return None

    def _create_cluster(self, event: NormalizedEvent) -> EventCluster:
        """Create a new cluster from a single event."""
        cluster_id = self._generate_cluster_id(event)
        return EventCluster(
            cluster_id=cluster_id,
            primary_event=event,
            source_events=[event.event_id],
            source_count=1,
            merged_countries=list(event.affected_countries),
            merged_sectors=list(event.affected_sectors),
            max_confidence=event.confidence,
            max_severity=event.severity,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    def _merge_into_cluster(self, cluster_idx: int, event: NormalizedEvent) -> None:
        """Merge an event into an existing cluster."""
        cluster = self._clusters[cluster_idx]

        # Add event ID
        source_events = list(cluster.source_events)
        if event.event_id not in source_events:
            source_events.append(event.event_id)

        # Merge countries (union)
        merged_countries = list(set(cluster.merged_countries) | set(event.affected_countries))

        # Merge sectors (union)
        merged_sectors = list(set(cluster.merged_sectors) | set(event.affected_sectors))

        # Update max confidence
        max_confidence = max(cluster.max_confidence, event.confidence)

        # Update max severity
        max_severity = cluster.max_severity
        if SEVERITY_RANK.get(event.severity, 0) > SEVERITY_RANK.get(cluster.max_severity, 0):
            max_severity = event.severity

        # Update primary event if new event has higher confidence
        primary = cluster.primary_event
        if event.confidence > cluster.max_confidence:
            primary = event

        # Rebuild cluster (Pydantic models are immutable by default)
        self._clusters[cluster_idx] = EventCluster(
            cluster_id=cluster.cluster_id,
            primary_event=primary,
            source_events=source_events,
            source_count=len(source_events),
            merged_countries=merged_countries,
            merged_sectors=merged_sectors,
            max_confidence=max_confidence,
            max_severity=max_severity,
            created_at=cluster.created_at,
        )

    # ─── Similarity ───────────────────────────────────────────────────────────

    @staticmethod
    def _title_jaccard(title_a: str, title_b: str) -> float:
        """
        Jaccard similarity on normalized word sets.

        Normalization: lowercase, strip diacritics, remove punctuation, split.
        """
        def normalize_words(t: str) -> set[str]:
            t = t.lower()
            t = unicodedata.normalize("NFKD", t)
            t = "".join(c for c in t if not unicodedata.combining(c))
            t = re.sub(r"[^\w\s]", "", t)
            return set(t.split()) - {"the", "a", "an", "in", "of", "to", "for", "and", "or", "is", "at", "on"}

        words_a = normalize_words(title_a)
        words_b = normalize_words(title_b)

        if not words_a or not words_b:
            return 0.0

        intersection = words_a & words_b
        union = words_a | words_b
        return len(intersection) / len(union) if union else 0.0

    @staticmethod
    def _generate_cluster_id(event: NormalizedEvent) -> str:
        """Generate deterministic cluster ID from first event."""
        content = f"cluster|{event.scenario_category}|{event.event_id}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]
