"""
Scoring schemas — deterministic, weighted, explainable scoring model.

Every score must be: traceable, weighted, reproducible.
"""
from enum import Enum
from pydantic import BaseModel, Field
from .scenario import LanguageVariant


class ScoreCategory(str, Enum):
    MACRO = "macro"
    GDP = "gdp"
    COUNTRY = "country"
    SECTOR = "sector"
    DECISION = "decision"
    COMPOSITE = "composite"


class ScoreComponent(BaseModel):
    """A single scored component with weight and contribution."""
    name: str
    raw_value: float
    weight: float = Field(ge=0.0, le=1.0)
    weighted_value: float
    source_layer: str  # which engine/layer produced this


class ScoreResult(BaseModel):
    """A fully explainable score."""
    id: str
    category: ScoreCategory
    label: LanguageVariant
    score: float = Field(ge=0.0, le=100.0)
    components: list[ScoreComponent]
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: LanguageVariant


class CompositeScore(BaseModel):
    """Executive-level composite score built from multiple ScoreResults."""
    scenario_id: str
    overall_score: float = Field(ge=0.0, le=100.0)
    sub_scores: list[ScoreResult]
    explanation: LanguageVariant
    confidence: float = Field(ge=0.0, le=1.0)
