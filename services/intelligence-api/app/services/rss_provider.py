"""
RSS Provider — Multi-source feed fetcher with Arabic + English support.

Data flow: Feed URLs → feedparser → list[RawFeedItem]

Each feed is configured via FeedSource. The provider fetches all enabled feeds,
parses entries, and returns typed RawFeedItem objects. No classification happens
here — that is the normalizer's job.

Failure mode: Individual feed failures are caught and logged; they do not block
other feeds from being fetched.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

import feedparser

from ..schemas.ingestion import FeedSource, FeedLanguage, RawFeedItem

logger = logging.getLogger(__name__)


# ─── Default GCC Feed Registry ───────────────────────────────────────────────
# Production feeds covering GCC economic, energy, financial, and geopolitical news.
# Each feed has a language tag and optional category_hint for downstream classification.

DEFAULT_FEEDS: list[FeedSource] = [
    # ── English Sources ──────────────────────────────────────────────
    FeedSource(
        id="reuters_middle_east",
        name="Reuters Middle East",
        url="https://www.reuters.com/rssFeed/middleeastNews",
        language=FeedLanguage.EN,
        region="GCC",
        category_hint="geopolitical,trade",
    ),
    FeedSource(
        id="aljazeera_business",
        name="Al Jazeera Business",
        url="https://www.aljazeera.com/xml/rss/all.xml",
        language=FeedLanguage.EN,
        region="GCC",
        category_hint="geopolitical,energy",
    ),
    FeedSource(
        id="gulf_news_business",
        name="Gulf News Business",
        url="https://gulfnews.com/rss/business",
        language=FeedLanguage.EN,
        region="GCC",
        category_hint="financial,trade",
    ),
    FeedSource(
        id="arabian_business",
        name="Arabian Business",
        url="https://www.arabianbusiness.com/rss",
        language=FeedLanguage.EN,
        region="GCC",
        category_hint="financial,infrastructure",
    ),
    FeedSource(
        id="bloomberg_energy",
        name="Bloomberg Energy",
        url="https://feeds.bloomberg.com/markets/news.rss",
        language=FeedLanguage.EN,
        region="GLOBAL",
        category_hint="energy,financial",
    ),
    FeedSource(
        id="opec_news",
        name="OPEC News",
        url="https://www.opec.org/opec_web/en/press_room/28.htm",
        language=FeedLanguage.EN,
        region="GLOBAL",
        category_hint="energy",
    ),
    # ── Arabic Sources ───────────────────────────────────────────────
    FeedSource(
        id="alarabiya_business",
        name="العربية أعمال",
        url="https://www.alarabiya.net/feed/rss2/aswaq",
        language=FeedLanguage.AR,
        region="GCC",
        category_hint="financial,energy",
    ),
    FeedSource(
        id="aleqtisadiah",
        name="الاقتصادية",
        url="https://www.aleqt.com/feed",
        language=FeedLanguage.AR,
        region="SA",
        category_hint="financial,regulatory",
    ),
    FeedSource(
        id="alkhaleej_economy",
        name="الخليج اقتصاد",
        url="https://www.alkhaleej.ae/rss/economy",
        language=FeedLanguage.AR,
        region="AE",
        category_hint="trade,infrastructure",
    ),
    FeedSource(
        id="cnbc_arabia",
        name="CNBC عربية",
        url="https://www.cnbcarabia.com/rss",
        language=FeedLanguage.AR,
        region="GCC",
        category_hint="financial,energy",
    ),
]


class RSSProvider:
    """
    Fetches and parses RSS feeds from configured sources.

    Usage:
        provider = RSSProvider()
        items = provider.fetch_all()
        # Or fetch a single feed:
        items = provider.fetch_feed(feed_source)
    """

    def __init__(self, feeds: Optional[list[FeedSource]] = None):
        self.feeds = feeds or DEFAULT_FEEDS

    def get_enabled_feeds(self) -> list[FeedSource]:
        """Return only enabled feeds."""
        return [f for f in self.feeds if f.enabled]

    def fetch_feed(self, feed: FeedSource) -> list[RawFeedItem]:
        """
        Fetch and parse a single RSS feed.

        Returns list of RawFeedItem. On failure, returns empty list and logs error.
        """
        try:
            parsed = feedparser.parse(feed.url)

            if parsed.bozo and not parsed.entries:
                logger.warning(
                    f"Feed '{feed.name}' ({feed.id}) returned bozo error: "
                    f"{parsed.bozo_exception}"
                )
                return []

            items: list[RawFeedItem] = []
            now = datetime.now(timezone.utc).isoformat()

            for entry in parsed.entries:
                title = entry.get("title", "").strip()
                summary = entry.get("summary", entry.get("description", "")).strip()
                link = entry.get("link", "").strip()
                published = entry.get("published", entry.get("updated", None))

                if not title or not link:
                    continue

                # Truncate summary to 2000 chars to prevent memory bloat
                if len(summary) > 2000:
                    summary = summary[:2000] + "..."

                items.append(RawFeedItem(
                    feed_id=feed.id,
                    feed_name=feed.name,
                    title=title,
                    summary=summary,
                    link=link,
                    published=published,
                    language=feed.language,
                    fetched_at=now,
                ))

            logger.info(f"Feed '{feed.name}': {len(items)} items fetched")
            return items

        except Exception as e:
            logger.error(f"Feed '{feed.name}' ({feed.id}) fetch failed: {e}")
            return []

    def fetch_all(self) -> list[RawFeedItem]:
        """
        Fetch all enabled feeds. Individual failures don't block others.

        Returns: combined list of RawFeedItems from all feeds, ordered by feed.
        """
        all_items: list[RawFeedItem] = []
        enabled = self.get_enabled_feeds()

        logger.info(f"Fetching {len(enabled)} feeds...")
        for feed in enabled:
            items = self.fetch_feed(feed)
            all_items.extend(items)

        logger.info(f"Total items fetched: {len(all_items)} from {len(enabled)} feeds")
        return all_items

    def add_feed(self, feed: FeedSource) -> None:
        """Register an additional feed source."""
        # Prevent duplicate feed IDs
        existing_ids = {f.id for f in self.feeds}
        if feed.id in existing_ids:
            raise ValueError(f"Feed ID '{feed.id}' already registered")
        self.feeds.append(feed)

    def remove_feed(self, feed_id: str) -> bool:
        """Remove a feed by ID. Returns True if found and removed."""
        before = len(self.feeds)
        self.feeds = [f for f in self.feeds if f.id != feed_id]
        return len(self.feeds) < before

    def feed_count(self) -> int:
        """Total registered feeds (enabled + disabled)."""
        return len(self.feeds)

    def enabled_feed_count(self) -> int:
        """Number of currently enabled feeds."""
        return len(self.get_enabled_feeds())
