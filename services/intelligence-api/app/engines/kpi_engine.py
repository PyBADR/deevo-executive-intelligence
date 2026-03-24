"""
KPI Engine — Executive, Country, and Sector KPI generation.

KPIs: Sector Risk Index, Critical Infrastructure Stability,
Financial System Pressure, Market Activity Score, Strategic Sector Confidence.
Plus per-country and per-sector KPI breakdowns.
"""
from ..schemas.scenario import ScenarioInput, LanguageVariant, GCCCountryCode
from ..schemas.macro import MacroSignalSet
from ..schemas.country import CountryImpact
from ..schemas.sector import SectorExposureResult, SectorTier
from ..schemas.decision import DecisionRecommendation
from ..schemas.risk import RiskRegister
from ..schemas.kpi import (
    ExecutiveKPI, CountryKPI, SectorKPI, KPITrend, KPIDashboard,
)


class KPIEngine:
    """
    Generates executive, country-level, and sector-level KPIs
    from the full intelligence context.
    """

    def run(
        self,
        scenario: ScenarioInput,
        macro: MacroSignalSet,
        country_impacts: list[CountryImpact],
        sector_exposures: SectorExposureResult,
        decisions: list[DecisionRecommendation],
        risk_register: RiskRegister,
    ) -> KPIDashboard:
        exec_kpis = self._executive_kpis(macro, country_impacts, sector_exposures, decisions, risk_register)
        country_kpis = self._country_kpis(country_impacts)
        sector_kpis = self._sector_kpis(sector_exposures)

        return KPIDashboard(
            scenario_id=scenario.id,
            executive_kpis=exec_kpis,
            country_kpis=country_kpis,
            sector_kpis=sector_kpis,
            headline=LanguageVariant(
                en=f"Intelligence dashboard: {len(exec_kpis)} executive KPIs, {len(country_kpis)} country KPIs, {len(sector_kpis)} sector KPIs.",
                ar=f"لوحة المعلومات الاستخباراتية: {len(exec_kpis)} مؤشرات تنفيذية، {len(country_kpis)} مؤشرات دول، {len(sector_kpis)} مؤشرات قطاعية.",
            ),
        )

    def _executive_kpis(
        self, macro, countries, sectors, decisions, risks
    ) -> list[ExecutiveKPI]:
        kpis = []

        # 1. Macro Stress Index
        kpis.append(ExecutiveKPI(
            id="kpi_macro_stress",
            name=LanguageVariant(en="Macro Stress Index", ar="مؤشر الضغط الاقتصادي الكلي"),
            value=round(macro.overall_stress, 1),
            unit="index",
            trend=KPITrend(direction="up", change_pct=round(macro.overall_stress * 0.08, 1)),
            category="economic",
            explanation=LanguageVariant(
                en=f"Overall macro stress at {macro.overall_stress:.0f}/100 from {len(macro.signals)} signals.",
                ar=f"الضغط الاقتصادي الكلي عند {macro.overall_stress:.0f}/100.",
            ),
        ))

        # 2. Sector Risk Index (tier-weighted)
        tier1 = [e for e in sectors.exposures if e.tier == SectorTier.CRITICAL_SOVEREIGN]
        tier1_avg = sum(e.criticality_adjusted_score for e in tier1) / max(len(tier1), 1)
        kpis.append(ExecutiveKPI(
            id="kpi_sector_risk",
            name=LanguageVariant(en="Sector Risk Index", ar="مؤشر مخاطر القطاعات"),
            value=round(tier1_avg, 1),
            unit="index",
            trend=KPITrend(direction="up", change_pct=round(tier1_avg * 0.06, 1)),
            category="risk",
            explanation=LanguageVariant(
                en=f"Tier 1 sovereign sector average exposure: {tier1_avg:.0f}/100 across {len(tier1)} critical sectors.",
                ar=f"متوسط تعرض القطاعات السيادية من المستوى الأول: {tier1_avg:.0f}/100.",
            ),
        ))

        # 3. Critical Infrastructure Stability
        infra_stability = max(100 - tier1_avg, 0)
        kpis.append(ExecutiveKPI(
            id="kpi_infra_stability",
            name=LanguageVariant(en="Critical Infrastructure Stability", ar="استقرار البنية التحتية الحرجة"),
            value=round(infra_stability, 1),
            unit="index",
            trend=KPITrend(
                direction="down" if tier1_avg > 50 else "stable",
                change_pct=round(-tier1_avg * 0.05, 1),
            ),
            category="infrastructure",
            explanation=LanguageVariant(
                en=f"Infrastructure stability at {infra_stability:.0f}/100. Inverse of Tier 1 sector pressure.",
                ar=f"استقرار البنية التحتية عند {infra_stability:.0f}/100.",
            ),
        ))

        # 4. Financial System Pressure
        fin_sectors = [e for e in sectors.exposures if e.tier == SectorTier.FINANCIAL_ECONOMIC]
        fin_avg = sum(e.criticality_adjusted_score for e in fin_sectors) / max(len(fin_sectors), 1)
        kpis.append(ExecutiveKPI(
            id="kpi_financial_pressure",
            name=LanguageVariant(en="Financial System Pressure", ar="ضغط النظام المالي"),
            value=round(fin_avg, 1),
            unit="index",
            trend=KPITrend(direction="up", change_pct=round(fin_avg * 0.07, 1)),
            category="financial",
            explanation=LanguageVariant(
                en=f"Tier 2 financial sector average exposure: {fin_avg:.0f}/100.",
                ar=f"متوسط تعرض القطاعات المالية: {fin_avg:.0f}/100.",
            ),
        ))

        # 5. Market Activity Score
        mkt_sectors = [e for e in sectors.exposures if e.tier == SectorTier.MARKET_GROWTH]
        mkt_avg = sum(e.criticality_adjusted_score for e in mkt_sectors) / max(len(mkt_sectors), 1)
        activity = max(100 - mkt_avg, 0)
        kpis.append(ExecutiveKPI(
            id="kpi_market_activity",
            name=LanguageVariant(en="Market Activity Score", ar="نتيجة نشاط السوق"),
            value=round(activity, 1),
            unit="index",
            trend=KPITrend(
                direction="down" if mkt_avg > 40 else "stable",
                change_pct=round(-mkt_avg * 0.04, 1),
            ),
            category="economic",
            explanation=LanguageVariant(
                en=f"Market activity score at {activity:.0f}/100. Reflects Tier 3 sector resilience.",
                ar=f"نشاط السوق عند {activity:.0f}/100.",
            ),
        ))

        # 6. Strategic Sector Confidence
        strat_sectors = [e for e in sectors.exposures if e.tier == SectorTier.FUTURE_STRATEGIC]
        strat_avg = sum(e.criticality_adjusted_score for e in strat_sectors) / max(len(strat_sectors), 1)
        confidence = max(100 - strat_avg * 1.2, 0)
        kpis.append(ExecutiveKPI(
            id="kpi_strategic_confidence",
            name=LanguageVariant(en="Strategic Sector Confidence", ar="ثقة القطاعات الاستراتيجية"),
            value=round(confidence, 1),
            unit="index",
            trend=KPITrend(
                direction="down" if strat_avg > 30 else "stable",
                change_pct=round(-strat_avg * 0.03, 1),
            ),
            category="opportunity",
            explanation=LanguageVariant(
                en=f"Strategic sector confidence at {confidence:.0f}/100. Tier 4 future sectors.",
                ar=f"ثقة القطاعات الاستراتيجية عند {confidence:.0f}/100.",
            ),
        ))

        # 7. Decision Pressure
        dp = sum(d.pressure.score for d in decisions) / max(len(decisions), 1) if decisions else 0
        kpis.append(ExecutiveKPI(
            id="kpi_decision_pressure",
            name=LanguageVariant(en="Decision Pressure", ar="ضغط القرار"),
            value=round(dp, 1),
            unit="index",
            trend=KPITrend(direction="up", change_pct=5.2),
            category="risk",
            explanation=LanguageVariant(
                en=f"Average decision pressure: {dp:.0f}/100 from {len(decisions)} active decisions.",
                ar=f"متوسط ضغط القرار: {dp:.0f}/100.",
            ),
        ))

        # 8. Risk Severity
        kpis.append(ExecutiveKPI(
            id="kpi_risk_severity",
            name=LanguageVariant(en="Aggregate Risk Severity", ar="شدة المخاطر الإجمالية"),
            value=round(risks.aggregate_risk_score, 1),
            unit="index",
            trend=KPITrend(direction="up" if risks.aggregate_risk_score > 50 else "stable", change_pct=3.1),
            category="risk",
            explanation=LanguageVariant(
                en=f"Aggregate risk: {risks.aggregate_risk_score:.0f}/100. {risks.critical_count} critical, {risks.high_count} high.",
                ar=f"المخاطر الإجمالية: {risks.aggregate_risk_score:.0f}/100.",
            ),
        ))

        return kpis

    def _country_kpis(self, countries: list[CountryImpact]) -> list[CountryKPI]:
        kpis = []
        for c in countries:
            # Macro sensitivity
            kpis.append(CountryKPI(
                country_code=c.country_code, kpi_id=f"kpi_{c.country_code.value}_macro",
                name=LanguageVariant(en=f"{c.country_code.value} Macro Sensitivity", ar=f"حساسية {c.country_code.value}"),
                value=round(c.macro_sensitivity, 1), unit="index",
                trend=KPITrend(direction="up", change_pct=round(c.macro_sensitivity * 0.05, 1)),
                explanation=LanguageVariant(
                    en=f"{c.country_code.value} macro sensitivity: {c.macro_sensitivity:.0f}, risk: {c.risk_level}.",
                    ar=f"حساسية {c.country_code.value}: {c.macro_sensitivity:.0f}.",
                ),
            ))
            # Private sector pressure
            pp = c.private_sector.operating_cost_pressure
            kpis.append(CountryKPI(
                country_code=c.country_code, kpi_id=f"kpi_{c.country_code.value}_private",
                name=LanguageVariant(en=f"{c.country_code.value} Private Pressure", ar=f"ضغط القطاع الخاص - {c.country_code.value}"),
                value=round(pp, 1), unit="index",
                trend=KPITrend(direction="up", change_pct=round(pp * 0.04, 1)),
                explanation=LanguageVariant(
                    en=f"{c.country_code.value} private sector operating pressure: {pp:.0f}/100.",
                    ar=f"ضغط القطاع الخاص في {c.country_code.value}: {pp:.0f}/100.",
                ),
            ))
        return kpis

    def _sector_kpis(self, sectors: SectorExposureResult) -> list[SectorKPI]:
        kpis = []
        for e in sectors.exposures:
            kpis.append(SectorKPI(
                sector_code=e.sector_code, kpi_id=f"kpi_{e.sector_code.value}_exposure",
                name=LanguageVariant(
                    en=f"{e.sector_code.value.replace('_', ' ').title()} Exposure",
                    ar=f"تعرض {e.sector_code.value}",
                ),
                value=round(e.criticality_adjusted_score, 1), unit="index",
                trend=KPITrend(direction="up", change_pct=round(e.criticality_adjusted_score * 0.05, 1)),
                explanation=LanguageVariant(
                    en=f"Tier {e.tier.value} sector exposure: {e.criticality_adjusted_score:.0f}/100.",
                    ar=f"تعرض القطاع من المستوى {e.tier.value}: {e.criticality_adjusted_score:.0f}/100.",
                ),
            ))
        return kpis
