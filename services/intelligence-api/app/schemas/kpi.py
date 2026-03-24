"""
KPI schemas — executive, country-level, and sector-level KPI models.

Every KPI: named, valued, trended, categorized, explained.
"""
from pydantic import BaseModel, Field
from .scenario import LanguageVariant, GCCCountryCode, SectorCode


class KPITrend(BaseModel):
    """Trend metadata for a KPI."""
    direction: str = Field(pattern="^(up|down|stable)$")
    change_pct: float
    previous_value: float = 0.0


class ExecutiveKPI(BaseModel):
    """Top-level executive KPI."""
    id: str
    name: LanguageVariant
    value: float
    unit: str
    trend: KPITrend
    category: str = Field(pattern="^(economic|risk|opportunity|governance|infrastructure|financial)$")
    explanation: LanguageVariant


class CountryKPI(BaseModel):
    """Per-country KPI."""
    country_code: GCCCountryCode
    kpi_id: str
    name: LanguageVariant
    value: float
    unit: str
    trend: KPITrend
    explanation: LanguageVariant


class SectorKPI(BaseModel):
    """Per-sector KPI."""
    sector_code: SectorCode
    kpi_id: str
    name: LanguageVariant
    value: float
    unit: str
    trend: KPITrend
    explanation: LanguageVariant


class KPIDashboard(BaseModel):
    """Full KPI output for a scenario."""
    scenario_id: str
    executive_kpis: list[ExecutiveKPI]
    country_kpis: list[CountryKPI]
    sector_kpis: list[SectorKPI]
    headline: LanguageVariant
