"""
Event Normalizer — Deterministic RSS → ScenarioInput classification engine.

Data flow: RawFeedItem → NormalizedEvent → (via clusterer) → ScenarioInput

Classification is keyword-based and deterministic:
  1. Category detection — keyword sets per ScenarioCategory
  2. Severity detection — intensity keywords (critical/high/medium/low)
  3. Country detection — country names, codes, city names
  4. Sector detection — sector-specific keyword sets for all 20 sectors
  5. Confidence scoring — keyword match density

No ML. No LLM. Every classification decision is traceable to keyword rules.
"""
import hashlib
import logging
import re
from typing import Optional

from ..schemas.ingestion import RawFeedItem, NormalizedEvent, FeedLanguage
from ..schemas.scenario import (
    ScenarioCategory,
    ScenarioSeverity,
    GCCCountryCode,
    SectorCode,
    ScenarioInput,
    LanguageVariant,
)

logger = logging.getLogger(__name__)


# ─── Keyword Dictionaries ────────────────────────────────────────────────────
# Each dictionary maps a classification target to keyword lists.
# English and Arabic keywords are kept in the same lists.

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    ScenarioCategory.TRADE.value: [
        "trade", "export", "import", "tariff", "customs", "shipping", "cargo",
        "supply chain", "logistics", "port", "maritime", "corridor", "route",
        "تجارة", "صادرات", "واردات", "جمارك", "شحن", "ممر",
    ],
    ScenarioCategory.ENERGY.value: [
        "oil", "gas", "petroleum", "opec", "crude", "barrel", "refinery",
        "lng", "pipeline", "energy", "fuel", "hydrocarbon",
        "نفط", "غاز", "أوبك", "برميل", "طاقة", "وقود", "بترول",
    ],
    ScenarioCategory.GEOPOLITICAL.value: [
        "war", "conflict", "sanction", "military", "tension", "missile",
        "attack", "iran", "houthi", "drone", "security", "defense",
        "blockade", "escalation", "ceasefire", "diplomacy",
        "حرب", "صراع", "عقوبات", "عسكري", "توتر", "صاروخ", "هجوم", "حصار",
    ],
    ScenarioCategory.FINANCIAL.value: [
        "bank", "interest rate", "inflation", "credit", "debt", "bond",
        "stock", "market", "exchange", "fed", "monetary", "fiscal",
        "liquidity", "default", "rating", "downgrade", "ipo",
        "بنك", "فائدة", "تضخم", "ائتمان", "دين", "سوق", "بورصة",
    ],
    ScenarioCategory.REGULATORY.value: [
        "regulation", "law", "policy", "compliance", "license", "authority",
        "ban", "reform", "legislation", "mandate", "tax", "vat",
        "تنظيم", "قانون", "سياسة", "ترخيص", "ضريبة", "إصلاح",
    ],
    ScenarioCategory.DEMAND.value: [
        "demand", "consumption", "retail", "consumer", "spending", "tourism",
        "travel", "hospitality", "housing", "real estate", "property",
        "طلب", "استهلاك", "سياحة", "سفر", "عقارات", "إسكان",
    ],
    ScenarioCategory.INFRASTRUCTURE.value: [
        "infrastructure", "construction", "project", "megaproject", "airport",
        "railway", "metro", "bridge", "road", "neom", "giga",
        "بنية تحتية", "بناء", "مشروع", "مطار", "سكة حديد",
    ],
    ScenarioCategory.CONFIDENCE.value: [
        "confidence", "sentiment", "uncertainty", "risk", "outlook",
        "forecast", "downgrade", "upgrade", "moody", "fitch", "s&p",
        "recession", "growth", "gdp", "recovery",
        "ثقة", "مخاطر", "توقعات", "ركود", "نمو",
    ],
}

SEVERITY_KEYWORDS: dict[str, list[str]] = {
    ScenarioSeverity.CRITICAL.value: [
        "crisis", "collapse", "war", "emergency", "catastroph", "devastating",
        "unprecedented", "shutdown", "default", "sovereign debt",
        "أزمة", "انهيار", "حرب", "طوارئ", "كارثة",
    ],
    ScenarioSeverity.HIGH.value: [
        "surge", "plunge", "severe", "major", "significant", "sharp",
        "escalat", "disrupt", "threat", "crash", "spike",
        "حاد", "كبير", "تصاعد", "تهديد", "انخفاض حاد",
    ],
    ScenarioSeverity.MEDIUM.value: [
        "concern", "pressure", "impact", "change", "shift", "moderate",
        "slowdown", "decline", "growth slow", "volatil",
        "قلق", "ضغط", "تأثير", "تغيير", "تباطؤ",
    ],
    ScenarioSeverity.LOW.value: [
        "stable", "slight", "minor", "gradual", "expected", "forecast",
        "plan", "announce", "consider", "propose",
        "مستقر", "طفيف", "تدريجي", "متوقع", "إعلان",
    ],
}

COUNTRY_KEYWORDS: dict[str, list[str]] = {
    GCCCountryCode.SA.value: [
        "saudi", "saudi arabia", "riyadh", "jeddah", "dammam", "neom",
        "aramco", "vision 2030", "mbs",
        "السعودية", "السعودي", "الرياض", "جدة", "أرامكو", "رؤية 2030",
        "المملكة",
    ],
    GCCCountryCode.AE.value: [
        "uae", "emirates", "dubai", "abu dhabi", "adnoc", "masdar",
        "الإمارات", "دبي", "أبوظبي",
    ],
    GCCCountryCode.KW.value: [
        "kuwait", "kuwait city", "kpc",
        "الكويت",
    ],
    GCCCountryCode.QA.value: [
        "qatar", "doha", "qatarenergy", "lng qatar",
        "قطر", "الدوحة",
    ],
    GCCCountryCode.BH.value: [
        "bahrain", "manama",
        "البحرين", "المنامة",
    ],
    GCCCountryCode.OM.value: [
        "oman", "muscat", "salalah", "duqm",
        "عمان", "مسقط", "صلالة", "الدقم",
    ],
}

SECTOR_KEYWORDS: dict[str, list[str]] = {
    # Tier 1 — Critical Sovereign
    SectorCode.AVIATION.value: ["aviation", "airline", "airport", "flight", "طيران", "مطار"],
    SectorCode.OIL_GAS.value: ["oil", "gas", "petroleum", "crude", "opec", "refinery", "نفط", "غاز", "بترول"],
    SectorCode.BANKING.value: ["bank", "lending", "deposit", "credit", "بنك", "إقراض", "ائتمان"],
    SectorCode.ENERGY_INFRASTRUCTURE.value: ["power", "grid", "electricity", "solar", "nuclear", "طاقة", "كهرباء"],
    SectorCode.PORTS_MARITIME.value: ["port", "maritime", "shipping", "container", "ميناء", "بحري", "شحن"],
    SectorCode.LOGISTICS.value: ["logistics", "freight", "warehouse", "supply chain", "لوجستيات", "سلسلة إمداد"],
    # Tier 2 — Financial & Economic
    SectorCode.INSURANCE.value: ["insurance", "reinsurance", "underwriting", "تأمين"],
    SectorCode.FINTECH.value: ["fintech", "digital payment", "neobank", "blockchain", "تقنية مالية"],
    SectorCode.CAPITAL_MARKETS.value: ["stock", "bond", "ipo", "exchange", "equity", "بورصة", "أسهم", "سندات"],
    SectorCode.SOVEREIGN_WEALTH.value: ["sovereign fund", "pif", "adia", "qia", "kia", "صندوق سيادي"],
    SectorCode.GOVERNMENT_FINANCE.value: ["budget", "fiscal", "public debt", "government spend", "ميزانية", "مالية عامة"],
    # Tier 3 — Market & Growth
    SectorCode.ECOMMERCE.value: ["ecommerce", "e-commerce", "online retail", "تجارة إلكترونية"],
    SectorCode.CONSTRUCTION.value: ["construction", "building", "real estate", "property", "بناء", "عقارات"],
    SectorCode.MANUFACTURING.value: ["manufacturing", "factory", "industrial zone", "industrial city", "تصنيع", "صناعة", "مصنع"],
    SectorCode.TOURISM.value: ["tourism", "hotel", "travel", "hospitality", "سياحة", "فندق", "سفر"],
    SectorCode.RETAIL.value: ["retail", "consumer", "mall", "shopping", "تجزئة", "مستهلك"],
    # Tier 4 — Future & Strategic
    SectorCode.AI_TECHNOLOGY.value: ["artificial intelligence", "machine learning", "deep learning", "ai model", "ai platform", "ذكاء اصطناعي"],
    SectorCode.STARTUP_ECOSYSTEM.value: ["startup", "venture", "incubator", "founder", "شركة ناشئة"],
    SectorCode.CYBERSECURITY.value: ["cyber", "cybersecurity", "hack", "breach", "أمن سيبراني"],
    SectorCode.SUSTAINABILITY.value: ["sustainability", "green", "carbon", "climate", "esg", "استدامة", "مناخ"],
}


class EventNormalizer:
    """
    Deterministic classifier: RawFeedItem → NormalizedEvent.

    Every classification decision is traceable to keyword matches.
    Confidence = (matched_keywords / total_keywords_checked) clamped to [0.3, 1.0].
    """

    def normalize(self, item: RawFeedItem) -> Optional[NormalizedEvent]:
        """
        Classify a single RSS item. Returns None if no category can be determined
        (item is not GCC-relevant).
        """
        text = f"{item.title} {item.summary}".lower()

        # Step 1: Detect category
        category, cat_keywords = self._detect_category(text)
        if not category:
            return None  # Not classifiable — skip

        # Step 2: Detect severity
        severity, sev_keywords = self._detect_severity(text)

        # Step 3: Detect countries
        countries, country_keywords = self._detect_countries(text)

        # Step 4: Detect sectors
        sectors, sector_keywords = self._detect_sectors(text)

        # Step 5: Compute confidence
        all_matched = cat_keywords + sev_keywords + country_keywords + sector_keywords
        confidence = self._compute_confidence(all_matched, text)

        # Step 6: Generate deterministic event ID
        event_id = self._generate_event_id(item.title, item.link)

        return NormalizedEvent(
            event_id=event_id,
            title=item.title,
            summary=item.summary,
            link=item.link,
            source_feed=item.feed_name,
            language=item.language,
            published=item.published,
            fetched_at=item.fetched_at,
            scenario_category=category,
            severity=severity,
            affected_countries=countries,
            affected_sectors=sectors,
            confidence=confidence,
            matched_keywords=all_matched,
        )

    def normalize_batch(self, items: list[RawFeedItem]) -> list[NormalizedEvent]:
        """Normalize a batch of items. Drops unclassifiable items."""
        events = []
        for item in items:
            event = self.normalize(item)
            if event:
                events.append(event)
        logger.info(f"Normalized {len(events)}/{len(items)} items")
        return events

    def to_scenario_input(self, event: NormalizedEvent) -> ScenarioInput:
        """Convert a NormalizedEvent to a pipeline-ready ScenarioInput."""
        # Determine bilingual title
        if event.language == FeedLanguage.AR:
            title = LanguageVariant(en=event.title, ar=event.title)
        else:
            title = LanguageVariant(en=event.title, ar="")

        # Build description from summary
        if event.language == FeedLanguage.AR:
            description = LanguageVariant(en=event.summary, ar=event.summary)
        else:
            description = LanguageVariant(en=event.summary, ar="")

        return ScenarioInput(
            id=f"live_{event.event_id[:12]}",
            title=title,
            description=description,
            category=ScenarioCategory(event.scenario_category),
            severity=ScenarioSeverity(event.severity),
            affected_countries=[GCCCountryCode(c) for c in event.affected_countries] or list(GCCCountryCode),
            affected_sectors=[SectorCode(s) for s in event.affected_sectors],
            source_count=1,
            confidence=event.confidence,
            created_at=event.fetched_at,
        )

    # ─── Detection Engines ────────────────────────────────────────────────────

    def _detect_category(self, text: str) -> tuple[Optional[str], list[str]]:
        """Find the best-matching scenario category. Returns (category, matched_keywords)."""
        best_cat = None
        best_count = 0
        best_keywords: list[str] = []

        for cat, keywords in CATEGORY_KEYWORDS.items():
            matched = [kw for kw in keywords if kw in text]
            if len(matched) > best_count:
                best_count = len(matched)
                best_cat = cat
                best_keywords = matched

        return best_cat, best_keywords

    def _detect_severity(self, text: str) -> tuple[str, list[str]]:
        """Detect severity level. Defaults to MEDIUM if no strong signal."""
        # Check from highest to lowest — first match wins
        for sev in [
            ScenarioSeverity.CRITICAL.value,
            ScenarioSeverity.HIGH.value,
            ScenarioSeverity.MEDIUM.value,
            ScenarioSeverity.LOW.value,
        ]:
            matched = [kw for kw in SEVERITY_KEYWORDS[sev] if kw in text]
            if matched:
                return sev, matched

        return ScenarioSeverity.MEDIUM.value, []

    def _detect_countries(self, text: str) -> tuple[list[str], list[str]]:
        """Detect GCC countries mentioned in text."""
        countries = []
        matched_kw = []

        for code, keywords in COUNTRY_KEYWORDS.items():
            for kw in keywords:
                if kw in text:
                    if code not in countries:
                        countries.append(code)
                    matched_kw.append(kw)
                    break  # One match per country is enough

        return countries, matched_kw

    def _detect_sectors(self, text: str) -> tuple[list[str], list[str]]:
        """Detect affected sectors from text."""
        sectors = []
        matched_kw = []

        for sector, keywords in SECTOR_KEYWORDS.items():
            for kw in keywords:
                if kw in text:
                    if sector not in sectors:
                        sectors.append(sector)
                    matched_kw.append(kw)
                    break  # One match per sector is enough

        return sectors, matched_kw

    def _compute_confidence(self, matched_keywords: list[str], text: str) -> float:
        """
        Confidence = keyword density signal.
        More matched keywords → higher confidence.
        Clamped to [0.3, 1.0] — we never go below 0.3 if we classified at all.
        """
        if not matched_keywords:
            return 0.3

        # Base: number of matched keywords / expected baseline (10 is a good match)
        raw = len(matched_keywords) / 10.0
        return min(max(round(raw, 2), 0.3), 1.0)

    @staticmethod
    def _generate_event_id(title: str, link: str) -> str:
        """SHA-256 hash of (title + link) for deterministic ID generation."""
        content = f"{title.strip().lower()}|{link.strip().lower()}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()[:24]
