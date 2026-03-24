"""
Financial Contagion Model — Propagation across financial sectors and countries.

Models: credit stress → liquidity → rate changes → market shocks.
Propagation: banks → insurance → fintech → capital markets → startups.
"""
from pydantic import BaseModel, Field
from ..schemas.scenario import (
    ScenarioInput, ScenarioCategory, ScenarioSeverity,
    GCCCountryCode, SectorCode, LanguageVariant,
)


class FinancialShockInput(BaseModel):
    credit_stress: float = Field(ge=0, le=100, description="Credit stress level 0-100")
    liquidity_tightening: float = Field(ge=0, le=100, default=0)
    rate_increase_bps: float = Field(ge=0, le=500, default=0)
    market_shock_pct: float = Field(ge=0, le=50, default=0)


class SectorContagion(BaseModel):
    sector_code: SectorCode
    contagion_score: float = Field(ge=0, le=100)
    funding_pressure: float = Field(ge=0, le=100)
    investment_slowdown: float = Field(ge=0, le=100)
    explanation: LanguageVariant


class FinancialContagionOutput(BaseModel):
    generated_scenario: ScenarioInput
    sector_contagions: list[SectorContagion]
    cross_country_links: list[dict]
    aggregate_contagion: float = Field(ge=0, le=100)
    explanation: LanguageVariant


# ─── Sector Financial Sensitivity ────────────────────────
FINANCIAL_SENSITIVITY = {
    SectorCode.BANKING:          {"credit": 0.95, "liquidity": 0.90, "rate": 0.85, "market": 0.70},
    SectorCode.INSURANCE:        {"credit": 0.55, "liquidity": 0.50, "rate": 0.60, "market": 0.65},
    SectorCode.FINTECH:          {"credit": 0.70, "liquidity": 0.75, "rate": 0.50, "market": 0.60},
    SectorCode.CAPITAL_MARKETS:  {"credit": 0.65, "liquidity": 0.70, "rate": 0.80, "market": 0.90},
    SectorCode.STARTUP_ECOSYSTEM:{"credit": 0.60, "liquidity": 0.80, "rate": 0.45, "market": 0.55},
    SectorCode.SOVEREIGN_WEALTH: {"credit": 0.30, "liquidity": 0.25, "rate": 0.40, "market": 0.70},
    SectorCode.GOVERNMENT_FINANCE:{"credit": 0.40, "liquidity": 0.35, "rate": 0.50, "market": 0.30},
}

# Cross-country financial linkage (how much one country's financial stress affects another)
CROSS_COUNTRY_FINANCIAL = {
    (GCCCountryCode.AE, GCCCountryCode.BH): 0.65,
    (GCCCountryCode.SA, GCCCountryCode.BH): 0.60,
    (GCCCountryCode.AE, GCCCountryCode.SA): 0.50,
    (GCCCountryCode.SA, GCCCountryCode.AE): 0.45,
    (GCCCountryCode.QA, GCCCountryCode.AE): 0.40,
    (GCCCountryCode.KW, GCCCountryCode.SA): 0.35,
    (GCCCountryCode.AE, GCCCountryCode.OM): 0.35,
    (GCCCountryCode.BH, GCCCountryCode.AE): 0.30,
}


class FinancialContagionEngine:
    """Models financial shock propagation across sectors and countries."""

    def run(self, input: FinancialShockInput) -> FinancialContagionOutput:
        credit = input.credit_stress / 100
        liquidity = input.liquidity_tightening / 100
        rate = min(input.rate_increase_bps / 300, 1.0)
        market = input.market_shock_pct / 30

        composite = (credit * 0.35 + liquidity * 0.25 + rate * 0.20 + market * 0.20) * 100

        severity = (
            ScenarioSeverity.CRITICAL if composite > 70
            else ScenarioSeverity.HIGH if composite > 45
            else ScenarioSeverity.MEDIUM if composite > 20
            else ScenarioSeverity.LOW
        )

        contagions = []
        for sector, sens in FINANCIAL_SENSITIVITY.items():
            score = (
                credit * sens["credit"] * 35
                + liquidity * sens["liquidity"] * 25
                + rate * sens["rate"] * 20
                + market * sens["market"] * 20
            )
            funding = min(score * 1.1, 100)
            invest_slow = min(score * 0.9, 100)

            contagions.append(SectorContagion(
                sector_code=sector,
                contagion_score=round(min(score, 100), 1),
                funding_pressure=round(funding, 1),
                investment_slowdown=round(invest_slow, 1),
                explanation=LanguageVariant(
                    en=f"{sector.value}: contagion {score:.0f}/100, funding pressure {funding:.0f}, "
                       f"investment slowdown {invest_slow:.0f}.",
                    ar=f"{sector.value}: عدوى {score:.0f}/100.",
                ),
            ))

        contagions.sort(key=lambda c: c.contagion_score, reverse=True)

        # Cross-country links
        links = []
        for (src, tgt), weight in CROSS_COUNTRY_FINANCIAL.items():
            link_score = round(composite * weight / 100 * 100, 1)
            if link_score > 5:
                links.append({
                    "source": src.value, "target": tgt.value,
                    "weight": weight, "contagion_score": link_score,
                })

        scenario = ScenarioInput(
            id="sim_financial_contagion",
            title=LanguageVariant(
                en=f"Financial Stress (Credit {input.credit_stress:.0f}, Liquidity {input.liquidity_tightening:.0f})",
                ar=f"ضغط مالي (ائتمان {input.credit_stress:.0f}، سيولة {input.liquidity_tightening:.0f})",
            ),
            description=LanguageVariant(
                en=f"Financial contagion simulation: credit {input.credit_stress:.0f}/100, "
                   f"liquidity tightening {input.liquidity_tightening:.0f}/100, "
                   f"rate +{input.rate_increase_bps:.0f}bps, market shock {input.market_shock_pct:.0f}%.",
                ar=f"محاكاة العدوى المالية.",
            ),
            category=ScenarioCategory.FINANCIAL,
            severity=severity,
            affected_countries=list(GCCCountryCode),
            affected_sectors=[c.sector_code for c in contagions[:5]],
            source_count=1,
            confidence=0.75,
        )

        agg = sum(c.contagion_score for c in contagions) / max(len(contagions), 1)

        return FinancialContagionOutput(
            generated_scenario=scenario,
            sector_contagions=contagions,
            cross_country_links=links,
            aggregate_contagion=round(agg, 1),
            explanation=LanguageVariant(
                en=f"Financial contagion: aggregate {agg:.0f}/100. "
                   f"Banking most exposed ({contagions[0].contagion_score:.0f}). "
                   f"{len(links)} cross-country financial links active.",
                ar=f"العدوى المالية: إجمالي {agg:.0f}/100.",
            ),
        )
