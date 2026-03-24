"""
Oil → GDP → Budget Engine — Sovereign economic engine.

Models: oil price change → government revenue → budget flexibility →
public spending → GDP exports → currency pressure → sovereign stability.
"""
from pydantic import BaseModel, Field
from ..schemas.scenario import (
    ScenarioInput, ScenarioCategory, ScenarioSeverity,
    GCCCountryCode, SectorCode, LanguageVariant,
)


class OilShockInput(BaseModel):
    oil_price_change_pct: float = Field(description="Oil price change %. Negative = decline.")
    export_disruption_pct: float = Field(ge=0, le=100, default=0)
    production_shift_pct: float = Field(default=0, description="Positive=increase, negative=cut")


class SovereignImpact(BaseModel):
    country_code: GCCCountryCode
    revenue_impact_pct: float
    budget_flexibility: float = Field(ge=0, le=100)
    public_spending_pressure: float = Field(ge=0, le=100)
    gdp_export_impact: float
    sovereign_stability: float = Field(ge=0, le=100)
    explanation: LanguageVariant


class OilGDPOutput(BaseModel):
    generated_scenario: ScenarioInput
    sovereign_impacts: list[SovereignImpact]
    explanation: LanguageVariant


# ─── Country Oil Profiles ────────────────────────────────
OIL_PROFILES = {
    GCCCountryCode.SA: {"oil_gdp_share": 0.42, "oil_revenue_share": 0.62, "fiscal_breakeven": 78.0, "reserve_months": 36},
    GCCCountryCode.AE: {"oil_gdp_share": 0.26, "oil_revenue_share": 0.35, "fiscal_breakeven": 60.0, "reserve_months": 48},
    GCCCountryCode.KW: {"oil_gdp_share": 0.52, "oil_revenue_share": 0.90, "fiscal_breakeven": 55.0, "reserve_months": 60},
    GCCCountryCode.QA: {"oil_gdp_share": 0.38, "oil_revenue_share": 0.55, "fiscal_breakeven": 48.0, "reserve_months": 42},
    GCCCountryCode.BH: {"oil_gdp_share": 0.18, "oil_revenue_share": 0.75, "fiscal_breakeven": 95.0, "reserve_months": 6},
    GCCCountryCode.OM: {"oil_gdp_share": 0.30, "oil_revenue_share": 0.68, "fiscal_breakeven": 73.0, "reserve_months": 18},
}


class OilGDPEngine:
    """Models oil price/production shocks into sovereign economic impacts."""

    def run(self, input: OilShockInput) -> OilGDPOutput:
        price_pct = input.oil_price_change_pct
        export_pct = input.export_disruption_pct
        prod_pct = input.production_shift_pct

        is_negative = price_pct < 0 or export_pct > 10
        severity = (
            ScenarioSeverity.CRITICAL if abs(price_pct) > 30 or export_pct > 30
            else ScenarioSeverity.HIGH if abs(price_pct) > 15 or export_pct > 15
            else ScenarioSeverity.MEDIUM if abs(price_pct) > 5
            else ScenarioSeverity.LOW
        )

        impacts = []
        for country, profile in OIL_PROFILES.items():
            rev_impact = price_pct * profile["oil_revenue_share"] + prod_pct * profile["oil_gdp_share"] * 0.5
            budget_flex = max(0, min(100, 50 + profile["reserve_months"] * 1.0 - abs(rev_impact) * 0.8))
            spending_pressure = max(0, min(100, abs(rev_impact) * profile["oil_revenue_share"] * 100 * 0.5))
            gdp_export_impact = price_pct * profile["oil_gdp_share"] / 100 + export_pct * -0.01
            stability = max(0, min(100, budget_flex * 0.6 + (100 - spending_pressure) * 0.4))

            impacts.append(SovereignImpact(
                country_code=country,
                revenue_impact_pct=round(rev_impact, 2),
                budget_flexibility=round(budget_flex, 1),
                public_spending_pressure=round(spending_pressure, 1),
                gdp_export_impact=round(gdp_export_impact, 4),
                sovereign_stability=round(stability, 1),
                explanation=LanguageVariant(
                    en=f"{country.value}: Revenue impact {rev_impact:+.1f}%, budget flexibility {budget_flex:.0f}/100, "
                       f"spending pressure {spending_pressure:.0f}/100, stability {stability:.0f}/100.",
                    ar=f"{country.value}: تأثير الإيرادات {rev_impact:+.1f}%، مرونة الميزانية {budget_flex:.0f}/100.",
                ),
            ))

        impacts.sort(key=lambda i: i.sovereign_stability)

        scenario = ScenarioInput(
            id="sim_oil_gdp_shock",
            title=LanguageVariant(
                en=f"Oil Price Shock ({price_pct:+.0f}%)",
                ar=f"صدمة أسعار النفط ({price_pct:+.0f}%)",
            ),
            description=LanguageVariant(
                en=f"Oil price change {price_pct:+.1f}%, export disruption {export_pct:.0f}%, "
                   f"production shift {prod_pct:+.1f}%.",
                ar=f"تغير أسعار النفط {price_pct:+.1f}%، اضطراب التصدير {export_pct:.0f}%.",
            ),
            category=ScenarioCategory.ENERGY,
            severity=severity,
            affected_countries=list(GCCCountryCode),
            affected_sectors=[
                SectorCode.OIL_GAS, SectorCode.GOVERNMENT_FINANCE,
                SectorCode.SOVEREIGN_WEALTH, SectorCode.BANKING,
                SectorCode.ENERGY_INFRASTRUCTURE,
            ],
            source_count=1,
            confidence=0.80,
        )

        return OilGDPOutput(
            generated_scenario=scenario,
            sovereign_impacts=impacts,
            explanation=LanguageVariant(
                en=f"Oil-GDP simulation: price {price_pct:+.1f}%, exports disrupted {export_pct:.0f}%. "
                   f"Most vulnerable: {impacts[0].country_code.value} (stability {impacts[0].sovereign_stability:.0f}).",
                ar=f"محاكاة النفط-الناتج المحلي: السعر {price_pct:+.1f}%.",
            ),
        )
