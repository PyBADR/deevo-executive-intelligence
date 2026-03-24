"""Decision schemas — recommendations, pressure scoring, and explanations."""
from pydantic import BaseModel, Field
from enum import Enum
from .scenario import GDPComponentCode, SectorCode, LanguageVariant


class DecisionUrgency(str, Enum):
    IMMEDIATE = "immediate"
    SHORT_TERM = "short_term"
    MEDIUM_TERM = "medium_term"
    LONG_TERM = "long_term"


class DecisionPressure(BaseModel):
    """Quantified decision pressure with stakeholder context."""
    score: float = Field(ge=0.0, le=100.0)
    urgency: DecisionUrgency
    affected_stakeholders: list[str]
    primary_drivers: list[str]


class DecisionRecommendation(BaseModel):
    """A single actionable decision recommendation."""
    id: str
    scenario_id: str
    title: LanguageVariant
    action: LanguageVariant
    priority: DecisionUrgency
    confidence: float = Field(ge=0.0, le=1.0)
    affected_entities: list[str]
    pressure: DecisionPressure


class DecisionExplanation(BaseModel):
    """Structured explanation for why a decision was recommended."""
    decision_id: str
    what_happened: LanguageVariant
    why_it_matters: LanguageVariant
    who_is_affected: list[str]
    gdp_components_moved: list[GDPComponentCode]
    sectors_under_pressure: list[SectorCode]
    why_this_recommendation: LanguageVariant
    likely_next_developments: list[LanguageVariant]
    confidence: float = Field(ge=0.0, le=1.0)


class ExplainedDecision(BaseModel):
    """Decision + full explanation bundle."""
    recommendation: DecisionRecommendation
    explanation: DecisionExplanation
