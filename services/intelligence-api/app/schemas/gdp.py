"""GDP impact schemas — scenario pressure mapped to GDP components."""
from pydantic import BaseModel, Field
from .scenario import GCCCountryCode, GDPComponentCode, LanguageVariant


class GDPComponentImpact(BaseModel):
    """Impact on a single GDP component from a scenario."""
    component: GDPComponentCode
    impact_score: float = Field(ge=-1.0, le=1.0)
    direction: str = Field(pattern="^(positive|negative|neutral)$")
    confidence: float = Field(ge=0.0, le=1.0)
    drivers: list[str]
    explanation: LanguageVariant


class GDPImpactResult(BaseModel):
    """GDP impact across all components for a scenario + country."""
    scenario_id: str
    country_code: GCCCountryCode
    components: list[GDPComponentImpact]
    aggregate_impact: float = Field(ge=-1.0, le=1.0)
    explanation: LanguageVariant
