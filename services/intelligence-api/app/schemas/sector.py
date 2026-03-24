"""
Sector schemas — 4-tier sovereign-grade sector intelligence model.

Tier 1: Critical Sovereign Systems (Aviation, Oil & Gas, Banking, Energy Infra, Ports, Logistics)
Tier 2: Financial & Economic Systems (Insurance, Fintech, Capital Markets, SWFs, Gov Finance)
Tier 3: Market & Growth Systems (E-Commerce, Construction, Manufacturing, Tourism, Retail)
Tier 4: Future & Strategic Systems (AI/Tech, Startups, Cybersecurity, Sustainability)
"""
from enum import Enum
from pydantic import BaseModel, Field
from .scenario import SectorCode, GCCCountryCode, GDPComponentCode, LanguageVariant
from .macro import MacroSignalType


class SectorTier(int, Enum):
    """Sector criticality tier. Lower = more critical."""
    CRITICAL_SOVEREIGN = 1
    FINANCIAL_ECONOMIC = 2
    MARKET_GROWTH = 3
    FUTURE_STRATEGIC = 4


class PropagationSpeed(str, Enum):
    IMMEDIATE = "immediate"
    FAST = "fast"
    MEDIUM = "medium"
    SLOW = "slow"


# ─── Sector Profile (Static structural metadata) ─────────
class SectorProfile(BaseModel):
    """Structural profile for a sector — static configuration."""
    sector_code: SectorCode
    name: LanguageVariant
    tier: SectorTier
    criticality_score: float = Field(ge=0.0, le=100.0, description="Base criticality 0-100")
    gdp_linkage: list[GDPComponentCode]
    public_sector_dependency: float = Field(ge=0.0, le=1.0)
    private_sector_dependency: float = Field(ge=0.0, le=1.0)
    sensitivity_profile: dict[str, float] = Field(
        default_factory=dict,
        description="MacroSignalType.value → sensitivity weight 0-1",
    )
    propagation_speed: PropagationSpeed
    decision_priority_base: float = Field(ge=0.0, le=100.0)


# ─── Country-Sector Weight ───────────────────────────────
class CountrySectorWeight(BaseModel):
    """Per-country weighting for a sector's importance."""
    country_code: GCCCountryCode
    sector_code: SectorCode
    weight: float = Field(ge=0.0, le=1.0, description="Country-specific importance 0-1")
    rationale: str = ""


# ─── Sector Exposure (Runtime output) ────────────────────
class SectorExposure(BaseModel):
    """Exposure assessment for a single sector under a scenario."""
    sector_code: SectorCode
    tier: SectorTier
    exposure_score: float = Field(ge=0.0, le=100.0)
    criticality_adjusted_score: float = Field(ge=0.0, le=100.0)
    impact_drivers: list[str]
    country_context: list[GCCCountryCode]
    gdp_linkage: list[GDPComponentCode]
    decision_relevance: float = Field(ge=0.0, le=100.0)
    propagation_speed: PropagationSpeed
    narrative: LanguageVariant


class SectorExposureResult(BaseModel):
    """All sector exposures for a scenario — tiered and weighted."""
    scenario_id: str
    exposures: list[SectorExposure]
    tier_summary: dict[str, float] = Field(
        default_factory=dict,
        description="Tier name → average exposure score",
    )
