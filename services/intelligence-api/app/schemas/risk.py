"""
Risk schemas — structured risk register with severity, likelihood, mitigation.

Every risk must: name the failure mode, estimate probability,
provide mitigation direction, and declare propagation impact.
"""
from enum import Enum
from pydantic import BaseModel, Field
from .scenario import LanguageVariant, GCCCountryCode, SectorCode


class RiskSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RiskCategory(str, Enum):
    MACRO_ECONOMIC = "macro_economic"
    SOVEREIGN = "sovereign"
    SECTOR = "sector"
    FINANCIAL = "financial"
    OPERATIONAL = "operational"
    GEOPOLITICAL = "geopolitical"
    REGULATORY = "regulatory"


class RiskEntry(BaseModel):
    """A single identified risk."""
    id: str
    category: RiskCategory
    title: LanguageVariant
    description: LanguageVariant
    severity: RiskSeverity
    likelihood: float = Field(ge=0.0, le=1.0)
    impact_score: float = Field(ge=0.0, le=100.0)
    risk_score: float = Field(ge=0.0, le=100.0, description="severity × likelihood normalized")
    affected_countries: list[GCCCountryCode]
    affected_sectors: list[SectorCode]
    mitigation: LanguageVariant
    propagation_targets: list[str] = Field(default_factory=list)
    drivers: list[str]


class RiskRegister(BaseModel):
    """Complete risk register for a scenario."""
    scenario_id: str
    risks: list[RiskEntry]
    aggregate_risk_score: float = Field(ge=0.0, le=100.0)
    critical_count: int = 0
    high_count: int = 0
    explanation: LanguageVariant
