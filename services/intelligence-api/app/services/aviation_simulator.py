"""
Aviation Shock Simulator — Models aviation disruption impact.

Chain: Aviation → Logistics → Trade → GDP → Sector → Decision.
Includes route sensitivity, corridor dependency, tourism/cargo dependency.
"""
from pydantic import BaseModel, Field
from ..schemas.scenario import (
    ScenarioInput, ScenarioCategory, ScenarioSeverity,
    GCCCountryCode, SectorCode, LanguageVariant,
)


class AviationShockInput(BaseModel):
    severity: str = Field(pattern="^(low|medium|high|extreme)$")
    affected_region: str = "GCC"
    duration_weeks: int = Field(ge=1, le=52)
    cargo_disrupted: bool = True
    passenger_disrupted: bool = True


class AviationImpactOutput(BaseModel):
    generated_scenario: ScenarioInput
    impact_chain: list[str]
    explanation: LanguageVariant


# ─── Country Aviation Profiles ───────────────────────────
AVIATION_PROFILES = {
    GCCCountryCode.AE: {"hub_importance": 0.95, "cargo_dependency": 0.90, "tourism_dependency": 0.85, "transit_share": 0.88},
    GCCCountryCode.QA: {"hub_importance": 0.85, "cargo_dependency": 0.70, "tourism_dependency": 0.65, "transit_share": 0.75},
    GCCCountryCode.SA: {"hub_importance": 0.70, "cargo_dependency": 0.55, "tourism_dependency": 0.60, "transit_share": 0.50},
    GCCCountryCode.BH: {"hub_importance": 0.45, "cargo_dependency": 0.40, "tourism_dependency": 0.50, "transit_share": 0.35},
    GCCCountryCode.KW: {"hub_importance": 0.40, "cargo_dependency": 0.35, "tourism_dependency": 0.30, "transit_share": 0.25},
    GCCCountryCode.OM: {"hub_importance": 0.50, "cargo_dependency": 0.45, "tourism_dependency": 0.55, "transit_share": 0.40},
}

SEVERITY_MAP = {"low": ScenarioSeverity.LOW, "medium": ScenarioSeverity.MEDIUM, "high": ScenarioSeverity.HIGH, "extreme": ScenarioSeverity.CRITICAL}
SEVERITY_CONFIDENCE = {"low": 0.85, "medium": 0.78, "high": 0.72, "extreme": 0.65}


class AviationSimulator:
    """Simulates aviation disruption → economic impact across GCC."""

    def run(self, input: AviationShockInput) -> AviationImpactOutput:
        sev = SEVERITY_MAP[input.severity]
        conf = SEVERITY_CONFIDENCE[input.severity]

        # Determine most affected countries by hub importance
        sorted_countries = sorted(
            AVIATION_PROFILES.items(), key=lambda x: x[1]["hub_importance"], reverse=True
        )
        affected = [c for c, _ in sorted_countries]

        # Generate scenario
        sectors = [SectorCode.AVIATION, SectorCode.LOGISTICS, SectorCode.PORTS_MARITIME, SectorCode.TOURISM]
        if input.cargo_disrupted:
            sectors.extend([SectorCode.ECOMMERCE, SectorCode.MANUFACTURING])
        if input.passenger_disrupted:
            sectors.extend([SectorCode.RETAIL])

        scenario = ScenarioInput(
            id="sim_aviation_disruption",
            title=LanguageVariant(
                en=f"Aviation Disruption ({input.severity.title()}, {input.duration_weeks}w)",
                ar=f"اضطراب الطيران ({input.severity}، {input.duration_weeks} أسبوع)",
            ),
            description=LanguageVariant(
                en=f"Aviation disruption at {input.severity} severity for {input.duration_weeks} weeks "
                   f"affecting {input.affected_region}. Cargo: {'disrupted' if input.cargo_disrupted else 'operational'}. "
                   f"Passenger: {'disrupted' if input.passenger_disrupted else 'operational'}.",
                ar=f"اضطراب جوي بشدة {input.severity} لمدة {input.duration_weeks} أسبوع.",
            ),
            category=ScenarioCategory.TRADE,
            severity=sev,
            affected_countries=affected,
            affected_sectors=list(set(sectors)),
            source_count=1,
            confidence=conf,
        )

        chain = [
            f"1. Aviation disruption ({input.severity})",
            "2. → Logistics corridor pressure (cargo delays, rerouting)",
            "3. → Trade flow disruption (export/import delays)",
            "4. → GDP impact (Net Exports ↓, Household Consumption ↓)",
            "5. → Sector exposure (Aviation, Logistics, Tourism, Retail)",
            "6. → Decision: Activate aviation contingency + route monitoring",
        ]

        return AviationImpactOutput(
            generated_scenario=scenario,
            impact_chain=chain,
            explanation=LanguageVariant(
                en=f"Aviation shock simulation: {input.severity} severity, {input.duration_weeks} weeks. "
                   f"UAE (hub {AVIATION_PROFILES[GCCCountryCode.AE]['hub_importance']}) most exposed.",
                ar=f"محاكاة صدمة الطيران: شدة {input.severity}، {input.duration_weeks} أسبوع.",
            ),
        )
