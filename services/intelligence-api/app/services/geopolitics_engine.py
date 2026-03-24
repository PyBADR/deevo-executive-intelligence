"""
Geopolitics / Event Impact Engine — Analytical, non-operational.

Translates geopolitical/security events into economic impact:
event → routes/energy/finance/confidence → GDP → sectors → decisions.
"""
from pydantic import BaseModel, Field
from enum import Enum
from ..schemas.scenario import (
    ScenarioInput, ScenarioCategory, ScenarioSeverity,
    GCCCountryCode, SectorCode, LanguageVariant,
)


class GeopoliticalEventType(str, Enum):
    TENSION = "tension"
    DISRUPTION = "disruption"
    SANCTIONS = "sanctions"
    INSTABILITY = "instability"


class GeopoliticalInput(BaseModel):
    event_type: GeopoliticalEventType
    region: str = "GCC"
    severity: str = Field(pattern="^(low|medium|high|critical)$")
    description: str = ""
    trade_impact: bool = True
    energy_impact: bool = True


class GeopoliticalOutput(BaseModel):
    generated_scenario: ScenarioInput
    impact_channels: list[str]
    explanation: LanguageVariant


EVENT_CATEGORY_MAP = {
    GeopoliticalEventType.TENSION: ScenarioCategory.GEOPOLITICAL,
    GeopoliticalEventType.DISRUPTION: ScenarioCategory.TRADE,
    GeopoliticalEventType.SANCTIONS: ScenarioCategory.TRADE,
    GeopoliticalEventType.INSTABILITY: ScenarioCategory.CONFIDENCE,
}

SEVERITY_MAP = {"low": ScenarioSeverity.LOW, "medium": ScenarioSeverity.MEDIUM, "high": ScenarioSeverity.HIGH, "critical": ScenarioSeverity.CRITICAL}


class GeopoliticsEngine:
    """Translates geopolitical events into economic scenarios for analysis."""

    def run(self, input: GeopoliticalInput) -> GeopoliticalOutput:
        category = EVENT_CATEGORY_MAP.get(input.event_type, ScenarioCategory.GEOPOLITICAL)
        severity = SEVERITY_MAP[input.severity]

        sectors = [SectorCode.BANKING, SectorCode.AVIATION]
        channels = ["Confidence shock"]
        if input.trade_impact:
            sectors.extend([SectorCode.LOGISTICS, SectorCode.PORTS_MARITIME])
            channels.append("Trade/logistics pressure")
        if input.energy_impact:
            sectors.extend([SectorCode.OIL_GAS, SectorCode.ENERGY_INFRASTRUCTURE])
            channels.append("Energy exposure")

        scenario = ScenarioInput(
            id=f"sim_geo_{input.event_type.value}",
            title=LanguageVariant(
                en=f"Geopolitical: {input.event_type.value.title()} ({input.severity})",
                ar=f"جيوسياسي: {input.event_type.value} ({input.severity})",
            ),
            description=LanguageVariant(
                en=f"Geopolitical {input.event_type.value} event in {input.region} at {input.severity} severity. "
                   f"{input.description}",
                ar=f"حدث جيوسياسي ({input.event_type.value}) في {input.region} بشدة {input.severity}.",
            ),
            category=category,
            severity=severity,
            affected_countries=list(GCCCountryCode),
            affected_sectors=list(set(sectors)),
            source_count=1,
            confidence=0.70,
        )

        impact_channels = [
            f"Event: {input.event_type.value} ({input.severity})",
            f"Channels: {', '.join(channels)}",
            "→ Macro signals (confidence, trade, energy)",
            "→ GDP components (exports, investment, consumption)",
            "→ Country spillovers (all GCC)",
            "→ Sector exposure + decisions",
        ]

        return GeopoliticalOutput(
            generated_scenario=scenario,
            impact_channels=impact_channels,
            explanation=LanguageVariant(
                en=f"Geopolitical analysis: {input.event_type.value} at {input.severity}. "
                   f"Impact channels: {', '.join(channels)}. Feed into pipeline for full analysis.",
                ar=f"تحليل جيوسياسي: {input.event_type.value} بشدة {input.severity}.",
            ),
        )
