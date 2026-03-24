"""
Supply Chain Rerouting Engine — Models alternative trade/logistics paths under disruption.

route disruption → alternative paths → cost/time increase → sector + GDP impact.
"""
from pydantic import BaseModel, Field
from ..schemas.scenario import (
    ScenarioInput, ScenarioCategory, ScenarioSeverity,
    GCCCountryCode, SectorCode, LanguageVariant,
)


class RouteDisruptionInput(BaseModel):
    disrupted_route: str = Field(description="e.g., 'Red Sea', 'Strait of Hormuz', 'Suez Canal'")
    severity: str = Field(pattern="^(low|medium|high|extreme)$")
    duration_weeks: int = Field(ge=1, le=52)


class RouteImpact(BaseModel):
    country_code: GCCCountryCode
    logistics_pressure: float = Field(ge=0, le=100)
    trade_delay_factor: float = Field(ge=1.0, description="1.0 = no delay, 2.0 = double")
    cost_increase_pct: float = Field(ge=0)
    gdp_export_impact_pct: float
    explanation: LanguageVariant


class SupplyChainOutput(BaseModel):
    generated_scenario: ScenarioInput
    route_impacts: list[RouteImpact]
    rerouting_options: list[str]
    explanation: LanguageVariant


# ─── Route Profiles ──────────────────────────────────────
ROUTE_PROFILES = {
    "Red Sea": {
        "description": "Red Sea / Bab-el-Mandeb corridor",
        "dependency": {
            GCCCountryCode.SA: 0.65, GCCCountryCode.AE: 0.80,
            GCCCountryCode.BH: 0.40, GCCCountryCode.QA: 0.50,
            GCCCountryCode.KW: 0.45, GCCCountryCode.OM: 0.55,
        },
        "reroute_cost_mult": 1.45,
        "reroute_delay_mult": 1.60,
        "alternatives": ["Cape of Good Hope (adds 10-14 days)", "Air freight (5x cost)", "Overland via Turkey/Jordan"],
    },
    "Strait of Hormuz": {
        "description": "Strait of Hormuz — oil and LNG chokepoint",
        "dependency": {
            GCCCountryCode.SA: 0.55, GCCCountryCode.AE: 0.70,
            GCCCountryCode.BH: 0.45, GCCCountryCode.QA: 0.85,
            GCCCountryCode.KW: 0.90, GCCCountryCode.OM: 0.80,
        },
        "reroute_cost_mult": 2.00,
        "reroute_delay_mult": 2.50,
        "alternatives": ["Saudi East-West pipeline", "UAE Fujairah bypass", "Strategic reserve drawdown"],
    },
    "Suez Canal": {
        "description": "Suez Canal — Europe/Asia trade gateway",
        "dependency": {
            GCCCountryCode.SA: 0.50, GCCCountryCode.AE: 0.75,
            GCCCountryCode.BH: 0.30, GCCCountryCode.QA: 0.40,
            GCCCountryCode.KW: 0.35, GCCCountryCode.OM: 0.45,
        },
        "reroute_cost_mult": 1.35,
        "reroute_delay_mult": 1.50,
        "alternatives": ["Cape of Good Hope", "Trans-Siberian rail", "Air freight"],
    },
}

SEVERITY_MULT = {"low": 0.3, "medium": 0.6, "high": 0.85, "extreme": 1.0}
SEVERITY_MAP = {"low": ScenarioSeverity.LOW, "medium": ScenarioSeverity.MEDIUM, "high": ScenarioSeverity.HIGH, "extreme": ScenarioSeverity.CRITICAL}


class SupplyChainEngine:
    """Models supply chain disruption and rerouting impacts."""

    def run(self, input: RouteDisruptionInput) -> SupplyChainOutput:
        route = ROUTE_PROFILES.get(input.disrupted_route, ROUTE_PROFILES["Red Sea"])
        sev_mult = SEVERITY_MULT[input.severity]
        duration_mult = min(input.duration_weeks / 12, 1.5)

        impacts = []
        for country, dep in route["dependency"].items():
            effective = dep * sev_mult * duration_mult
            logistics = min(effective * 100, 100)
            delay = 1.0 + (route["reroute_delay_mult"] - 1.0) * effective
            cost = (route["reroute_cost_mult"] - 1.0) * effective * 100
            gdp_pct = -effective * 0.02

            impacts.append(RouteImpact(
                country_code=country,
                logistics_pressure=round(logistics, 1),
                trade_delay_factor=round(delay, 2),
                cost_increase_pct=round(cost, 1),
                gdp_export_impact_pct=round(gdp_pct, 4),
                explanation=LanguageVariant(
                    en=f"{country.value}: logistics pressure {logistics:.0f}/100, "
                       f"delay ×{delay:.1f}, cost +{cost:.0f}%, GDP export impact {gdp_pct:.2f}%.",
                    ar=f"{country.value}: ضغط لوجستي {logistics:.0f}/100.",
                ),
            ))

        impacts.sort(key=lambda i: i.logistics_pressure, reverse=True)

        scenario = ScenarioInput(
            id=f"sim_supply_{input.disrupted_route.replace(' ', '_').lower()}",
            title=LanguageVariant(
                en=f"Supply Chain Disruption: {input.disrupted_route} ({input.severity})",
                ar=f"اضطراب سلسلة الإمداد: {input.disrupted_route} ({input.severity})",
            ),
            description=LanguageVariant(
                en=f"{route['description']} disrupted at {input.severity} severity for {input.duration_weeks} weeks.",
                ar=f"اضطراب {route['description']} بشدة {input.severity} لمدة {input.duration_weeks} أسبوع.",
            ),
            category=ScenarioCategory.TRADE,
            severity=SEVERITY_MAP[input.severity],
            affected_countries=list(GCCCountryCode),
            affected_sectors=[
                SectorCode.LOGISTICS, SectorCode.PORTS_MARITIME, SectorCode.AVIATION,
                SectorCode.OIL_GAS, SectorCode.ECOMMERCE, SectorCode.MANUFACTURING,
            ],
            source_count=1,
            confidence=0.78,
        )

        return SupplyChainOutput(
            generated_scenario=scenario,
            route_impacts=impacts,
            rerouting_options=route["alternatives"],
            explanation=LanguageVariant(
                en=f"Supply chain simulation: {input.disrupted_route} disrupted ({input.severity}, {input.duration_weeks}w). "
                   f"Most affected: {impacts[0].country_code.value} ({impacts[0].logistics_pressure:.0f}/100).",
                ar=f"محاكاة سلسلة الإمداد: {input.disrupted_route} ({input.severity}).",
            ),
        )
