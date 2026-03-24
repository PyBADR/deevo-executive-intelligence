"""Country impact schemas — GCC country-level intelligence with public/private split."""
from pydantic import BaseModel, Field
from .scenario import GCCCountryCode, LanguageVariant
from .gdp import GDPImpactResult


class PublicSectorImpact(BaseModel):
    """Government and sovereign sector impact assessment."""
    spending_pressure: float = Field(ge=0.0, le=100.0)
    policy_sensitivity: float = Field(ge=0.0, le=100.0)
    infrastructure_continuity: float = Field(ge=0.0, le=100.0)
    regulatory_sensitivity: float = Field(ge=0.0, le=100.0)
    strategic_priorities: list[str]
    explanation: LanguageVariant


class PrivateSectorImpact(BaseModel):
    """Private sector and market-facing impact assessment."""
    operating_cost_pressure: float = Field(ge=0.0, le=100.0)
    financing_pressure: float = Field(ge=0.0, le=100.0)
    demand_pressure: float = Field(ge=0.0, le=100.0)
    investment_sentiment: float = Field(ge=0.0, le=100.0)
    startup_sensitivity: float = Field(ge=0.0, le=100.0)
    explanation: LanguageVariant


class CountryImpact(BaseModel):
    """Full country-level intelligence output."""
    country_code: GCCCountryCode
    macro_sensitivity: float = Field(ge=0.0, le=100.0)
    gdp_impact: GDPImpactResult
    public_sector: PublicSectorImpact
    private_sector: PrivateSectorImpact
    risk_level: str = Field(pattern="^(critical|high|elevated|moderate|stable)$")
    narrative: LanguageVariant
    confidence: float = Field(ge=0.0, le=1.0)
