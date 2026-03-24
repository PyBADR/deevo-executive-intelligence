"""
Cache Store — Prevents duplicate event processing across ingestion cycles.

Two-layer deduplication:
  1. Link cache — exact URL match (fastest)
  2. Title hash cache — normalized title similarity (catches rephrased duplicates)

Eviction: Time-based. Events older than max_age_hours are purged on each check.
Persistence: In-memory dict with optional file-based snapshot for restart recovery.

Failure mode: If cache is lost (restart without snapshot), worst case is
re-processing events that were already seen — the event_clusterer will catch
remaining duplicates downstream.
"""
import hashlib
import json
import logging
import os
import re
import unicodedata
from datetime import datetime, timezone, timedelta
from typing import Optional

logger = logging.getLogger(__name__)


class CacheStore:
    """
    In-memory dedup cache with optional file persistence.

    Usage:
        cache = CacheStore()
        if cache.is_seen(event_id, link, title):
            skip  # duplicate
        else:
            cache.mark_seen(event_id, link, title)
    """

    def __init__(
        self,
        max_age_hours: int = 72,
        snapshot_path: Optional[str] = None,
    ):
        self.max_age_hours = max_age_hours
        self.snapshot_path = snapshot_path

        # link_url → (event_id, seen_at_iso)
        self._link_cache: dict[str, tuple[str, str]] = {}

        # normalized_title_hash → (event_id, seen_at_iso)
        self._title_cache: dict[str, tuple[str, str]] = {}

        # Load from snapshot if exists
        if snapshot_path:
            self._load_snapshot()

    # ─── Public API ───────────────────────────────────────────────────────────

    def is_seen(self, event_id: str, link: str, title: str) -> bool:
        """
        Check if an event has been processed before.

        Checks both link-exact and title-similarity caches.
        Returns True if duplicate.
        """
        self._evict_stale()

        # Layer 1: Exact link match
        if link in self._link_cache:
            return True

        # Layer 2: Normalized title hash
        title_hash = self._normalize_title_hash(title)
        if title_hash in self._title_cache:
            return True

        return False

    def mark_seen(self, event_id: str, link: str, title: str) -> None:
        """Record an event as processed."""
        now = datetime.now(timezone.utc).isoformat()
        self._link_cache[link] = (event_id, now)
        title_hash = self._normalize_title_hash(title)
        self._title_cache[title_hash] = (event_id, now)

    def size(self) -> int:
        """Number of unique events in cache (by link)."""
        return len(self._link_cache)

    def clear(self) -> None:
        """Flush all caches."""
        self._link_cache.clear()
        self._title_cache.clear()

    def save_snapshot(self) -> None:
        """Persist cache to disk for restart recovery."""
        if not self.snapshot_path:
            return
        try:
            data = {
                "link_cache": self._link_cache,
                "title_cache": self._title_cache,
                "saved_at": datetime.now(timezone.utc).isoformat(),
            }
            os.makedirs(os.path.dirname(self.snapshot_path) or ".", exist_ok=True)
            with open(self.snapshot_path, "w") as f:
                json.dump(data, f)
            logger.info(f"Cache snapshot saved: {self.size()} entries")
        except Exception as e:
            logger.error(f"Cache snapshot save failed: {e}")

    # ─── Internal ─────────────────────────────────────────────────────────────

    def _load_snapshot(self) -> None:
        """Load cache from disk snapshot."""
        if not self.snapshot_path or not os.path.exists(self.snapshot_path):
            return
        try:
            with open(self.snapshot_path, "r") as f:
                data = json.load(f)

            # Reconstruct with proper types
            for link, val in data.get("link_cache", {}).items():
                self._link_cache[link] = tuple(val)
            for thash, val in data.get("title_cache", {}).items():
                self._title_cache[thash] = tuple(val)

            logger.info(f"Cache snapshot loaded: {self.size()} entries")
            # Evict stale entries from loaded snapshot
            self._evict_stale()
        except Exception as e:
            logger.warning(f"Cache snapshot load failed (starting fresh): {e}")

    def _evict_stale(self) -> None:
        """Remove entries older than max_age_hours."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=self.max_age_hours)
        cutoff_iso = cutoff.isoformat()

        stale_links = [
            link for link, (_, seen_at) in self._link_cache.items()
            if seen_at < cutoff_iso
        ]
        for link in stale_links:
            del self._link_cache[link]

        stale_titles = [
            thash for thash, (_, seen_at) in self._title_cache.items()
            if seen_at < cutoff_iso
        ]
        for thash in stale_titles:
            del self._title_cache[thash]

        if stale_links or stale_titles:
            logger.debug(
                f"Cache evicted {len(stale_links)} links, "
                f"{len(stale_titles)} titles"
            )

    @staticmethod
    def _normalize_title_hash(title: str) -> str:
        """
        Normalize a title for fuzzy matching, then SHA-256 hash it.

        Normalization:
        - Lowercase
        - Strip diacritics (Arabic tashkeel)
        - Remove punctuation
        - Collapse whitespace
        - Sort words (order-invariant matching)
        """
        # Lowercase
        t = title.lower()
        # Remove diacritics / tashkeel
        t = unicodedata.normalize("NFKD", t)
        t = "".join(c for c in t if not unicodedata.combining(c))
        # Remove punctuation
        t = re.sub(r"[^\w\s]", "", t)
        # Collapse whitespace and sort words
        words = sorted(t.split())
        normalized = " ".join(words)
        # SHA-256
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
