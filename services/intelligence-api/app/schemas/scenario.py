"""Scenario schemas — the entry point for all intelligence flows."""
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


class ScenarioSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ScenarioCategory(str, Enum):
    TRADE = "trade"
    ENERGY = "energy"
    GEOPOLITICAL = "geopolitical"
    FINANCIAL = "financial"
    REGULATORY = "regulatory"
    DEMAND = "demand"
    INFRASTRUCTURE = "infrastructure"
    CONFIDENCE = "confidence"


class GCCCountryCode(str, Enum):
    SA = "SA"
    AE = "AE"
    KW = "KW"
    QA = "QA"
    BH = "BH"
    OM = "OM"


class SectorCode(str, Enum):
    """Legacy sector codes — kept for backward compatibility.
    The canonical 4-tier SectorCode lives in schemas/sector.py.
    """
    # Tier 1 — Critical Sovereign Systems
    AVIATION = "AVIATION"
    OIL_GAS = "OIL_GAS"
    BANKING = "BANKING"
    ENERGY_INFRASTRUCTURE = "ENERGY_INFRASTRUCTURE"
    PORTS_MARITIME = "PORTS_MARITIME"
    LOGISTICS = "LOGISTICS"
    # Tier 2 — Financial & Economic Systems
    INSURANCE = "INSURANCE"
    FINTECH = "FINTECH"
    CAPITAL_MARKETS = "CAPITAL_MARKETS"
    SOVEREIGN_WEALTH = "SOVEREIGN_WEALTH"
    GOVERNMENT_FINANCE = "GOVERNMENT_FINANCE"
    # Tier 3 — Market & Growth Systems
    ECOMMERCE = "ECOMMERCE"
    CONSTRUCTION = "CONSTRUCTION"
    MANUFACTURING = "MANUFACTURING"
    TOURISM = "TOURISM"
    RETAIL = "RETAIL"
    # Tier 4 — Future & Strategic Systems
    AI_TECHNOLOGY = "AI_TECHNOLOGY"
    STARTUP_ECOSYSTEM = "STARTUP_ECOSYSTEM"
    CYBERSECURITY = "CYBERSECURITY"
    SUSTAINABILITY = "SUSTAINABILITY"


class GDPComponentCode(str, Enum):
    HOUSEHOLD_CONSUMPTION = "HOUSEHOLD_CONSUMPTION"
    BUSINESS_INVESTMENT = "BUSINESS_INVESTMENT"
    GOVERNMENT_SPENDING = "GOVERNMENT_SPENDING"
    NET_EXPORTS = "NET_EXPORTS"


class LanguageVariant(BaseModel):
    """Bilingual content container."""
    en: str
    ar: str = ""


class ScenarioInput(BaseModel):
    """Input scenario that triggers the intelligence pipeline."""
    id: str
    title: LanguageVariant
    description: LanguageVariant
    category: ScenarioCategory
    severity: ScenarioSeverity
    affected_countries: list[GCCCountryCode]
    affected_sectors: list[SectorCode]
    source_count: int = Field(ge=0, default=0)
    confidence: float = Field(ge=0.0, le=1.0)
    created_at: Optional[str] = None


class ScenarioResponse(ScenarioInput):
    """Scenario with computed stress level."""
    stress_level: float = Field(ge=0.0, le=100.0, description="Overall scenario stress 0-100")
