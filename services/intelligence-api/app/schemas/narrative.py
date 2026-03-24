"""Narrative schemas — bilingual intelligence narratives and snapshots."""
from enum import Enum
from pydantic import BaseModel, Field
from .scenario import LanguageVariant
from .macro import MacroSignalSet
from .gdp import GDPImpactResult
from .country import CountryImpact
from .sector import SectorExposureResult
from .decision import ExplainedDecision
from .graph import PropagationResult
from .kpi import ExecutiveKPI


class NarrativeType(str, Enum):
    ANALYSIS = "analysis"
    BRIEFING = "briefing"
    ALERT = "alert"
    EXPLANATION = "explanation"


class NarrativeBlock(BaseModel):
    id: str
    scenario_id: str
    type: NarrativeType
    title: LanguageVariant
    body: LanguageVariant
    key_points: list[LanguageVariant]
    sources: list[str]
    created_at: str = ""


class IntelligenceSnapshot(BaseModel):
    """Complete intelligence pipeline output for one scenario — fully typed."""
    scenario_id: str
    timestamp: str
    macro_signals: MacroSignalSet
    gdp_impacts: list[GDPImpactResult]
    country_impacts: list[CountryImpact]
    sector_exposures: SectorExposureResult
    decisions: list[ExplainedDecision]
    graph: PropagationResult
    kpis: list[ExecutiveKPI]
    narrative: NarrativeBlock
