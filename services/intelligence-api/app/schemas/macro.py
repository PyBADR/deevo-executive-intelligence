"""Macro signal schemas — scenario-derived economic pressure signals."""
from enum import Enum
from pydantic import BaseModel, Field
from .scenario import LanguageVariant


class MacroSignalType(str, Enum):
    TRADE_RISK = "trade_risk"
    SHIPPING_PRESSURE = "shipping_pressure"
    INFLATION_PRESSURE = "inflation_pressure"
    CONFIDENCE_PRESSURE = "confidence_pressure"
    ENERGY_EXPOSURE = "energy_exposure"
    FINANCING_SENSITIVITY = "financing_sensitivity"
    DEMAND_PRESSURE = "demand_pressure"
    REGULATORY_PRESSURE = "regulatory_pressure"


class MacroSignal(BaseModel):
    """A single macro-economic pressure signal derived from a scenario."""
    type: MacroSignalType
    magnitude: float = Field(ge=-1.0, le=1.0, description="Negative = adverse pressure")
    confidence: float = Field(ge=0.0, le=1.0)
    drivers: list[str]
    explanation: LanguageVariant


class MacroSignalSet(BaseModel):
    """Full set of macro signals generated from one scenario."""
    scenario_id: str
    signals: list[MacroSignal]
    overall_stress: float = Field(ge=0.0, le=100.0)
