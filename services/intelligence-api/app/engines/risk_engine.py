"""
Risk Engine — Generates structured risk register from intelligence context.

Every risk: named failure mode, estimated probability, mitigation direction,
propagation impact, connected to sectors and countries.
"""
from ..schemas.scenario import ScenarioInput, GCCCountryCode, SectorCode, LanguageVariant
from ..schemas.macro import MacroSignalSet, MacroSignalType
from ..schemas.gdp import GDPImpactResult
from ..schemas.country import CountryImpact
from ..schemas.sector import SectorExposureResult, SectorTier
from ..schemas.risk import (
    RiskEntry, RiskRegister, RiskSeverity, RiskCategory,
)


# ─── RISK RULES ──────────────────────────────────────────
# Condition-based risk detection with deterministic thresholds.
RISK_RULES = [
    {
        "condition": lambda ctx: ctx["macro"].overall_stress > 65,
        "id": "risk_macro_stress",
        "category": RiskCategory.MACRO_ECONOMIC,
        "title_en": "Elevated Macro Stress",
        "title_ar": "ضغط اقتصادي كلي مرتفع",
        "desc_en": "Overall macro stress exceeds 65/100, indicating broad-based economic pressure across multiple transmission channels.",
        "desc_ar": "يتجاوز الضغط الاقتصادي الكلي 65/100، مما يشير إلى ضغط اقتصادي واسع النطاق.",
        "severity": RiskSeverity.HIGH,
        "mitigation_en": "Activate cross-layer monitoring. Increase intelligence refresh frequency. Brief C-suite.",
        "mitigation_ar": "تفعيل المراقبة عبر الطبقات. زيادة تكرار تحديث المعلومات الاستخباراتية.",
        "propagation": ["GDP components", "Country impacts", "All sectors"],
        "drivers": ["Multiple macro signals elevated", "Cross-channel transmission"],
    },
    {
        "condition": lambda ctx: _max_tier1_exposure(ctx) > 70,
        "id": "risk_tier1_sovereign",
        "category": RiskCategory.SOVEREIGN,
        "title_en": "Tier 1 Sovereign Sector Under Stress",
        "title_ar": "قطاع سيادي من المستوى الأول تحت الضغط",
        "desc_en": "At least one Tier 1 critical sovereign sector (aviation, oil & gas, banking, ports, logistics, energy infra) has exposure above 70.",
        "desc_ar": "قطاع سيادي حرج واحد على الأقل لديه تعرض فوق 70.",
        "severity": RiskSeverity.CRITICAL,
        "mitigation_en": "Engage regulatory and sovereign channels. Activate contingency infrastructure protocols.",
        "mitigation_ar": "إشراك القنوات التنظيمية والسيادية. تفعيل بروتوكولات البنية التحتية الاحتياطية.",
        "propagation": ["GDP exports", "Government spending", "All downstream sectors"],
        "drivers": ["Critical infrastructure exposure", "Sovereign dependency"],
    },
    {
        "condition": lambda ctx: _avg_financing_pressure(ctx) > 55,
        "id": "risk_financial_contagion",
        "category": RiskCategory.FINANCIAL,
        "title_en": "Financial Contagion Risk",
        "title_ar": "مخاطر العدوى المالية",
        "desc_en": "Private-sector financing pressure averaged above 55 across GCC countries, indicating potential credit tightening and investment hesitation.",
        "desc_ar": "متوسط ضغوط التمويل في القطاع الخاص فوق 55 عبر دول الخليج.",
        "severity": RiskSeverity.HIGH,
        "mitigation_en": "Monitor credit spreads, bank lending conditions, and startup funding pipelines. Engage central bank intelligence.",
        "mitigation_ar": "مراقبة فروق الائتمان وظروف الإقراض المصرفي وخطوط تمويل الشركات الناشئة.",
        "propagation": ["Banking", "Insurance", "Fintech", "Capital Markets", "Startups"],
        "drivers": ["Credit tightening", "Liquidity stress", "Investment hesitation"],
    },
    {
        "condition": lambda ctx: _any_country_critical(ctx),
        "id": "risk_country_critical",
        "category": RiskCategory.SOVEREIGN,
        "title_en": "Country-Level Critical Risk",
        "title_ar": "مخاطر حرجة على مستوى الدولة",
        "desc_en": "At least one GCC country is at critical risk level, indicating severe economic pressure.",
        "desc_ar": "دولة خليجية واحدة على الأقل عند مستوى مخاطر حرج.",
        "severity": RiskSeverity.CRITICAL,
        "mitigation_en": "Activate country-specific risk protocols. Engage government relations and regional leadership.",
        "mitigation_ar": "تفعيل بروتوكولات المخاطر الخاصة بالدولة.",
        "propagation": ["All sectors in affected country", "Cross-border spillover"],
        "drivers": ["Country structural vulnerability", "Concentrated exposure"],
    },
    {
        "condition": lambda ctx: _trade_route_risk(ctx),
        "id": "risk_trade_corridor",
        "category": RiskCategory.GEOPOLITICAL,
        "title_en": "Trade Corridor Disruption Risk",
        "title_ar": "مخاطر اضطراب الممرات التجارية",
        "desc_en": "Trade risk and shipping pressure signals are both elevated, indicating active corridor disruption.",
        "desc_ar": "إشارات مخاطر التجارة وضغط الشحن مرتفعة، مما يشير إلى اضطراب نشط في الممرات.",
        "severity": RiskSeverity.HIGH,
        "mitigation_en": "Activate route monitoring. Prepare rerouting contingencies. Assess port and aviation dependencies.",
        "mitigation_ar": "تفعيل مراقبة المسارات. إعداد خطط إعادة التوجيه البديلة.",
        "propagation": ["Logistics", "Ports", "Aviation", "GDP exports"],
        "drivers": ["Shipping disruption", "Trade rerouting", "Corridor dependency"],
    },
    {
        "condition": lambda ctx: _regulatory_pressure_high(ctx),
        "id": "risk_regulatory",
        "category": RiskCategory.REGULATORY,
        "title_en": "Regulatory Compliance Pressure",
        "title_ar": "ضغوط الامتثال التنظيمي",
        "desc_en": "Regulatory pressure signal is elevated, creating compliance costs and operational adjustment requirements.",
        "desc_ar": "إشارة الضغط التنظيمي مرتفعة، مما يخلق تكاليف امتثال ومتطلبات تعديل تشغيلي.",
        "severity": RiskSeverity.MEDIUM,
        "mitigation_en": "Review compliance readiness. Prepare for licensing and regulatory framework changes.",
        "mitigation_ar": "مراجعة جاهزية الامتثال. الاستعداد لتغييرات الترخيص والإطار التنظيمي.",
        "propagation": ["Fintech", "Banking", "Capital Markets"],
        "drivers": ["Policy shifts", "Licensing changes", "Cross-border regulation"],
    },
]


def _max_tier1_exposure(ctx: dict) -> float:
    se = ctx.get("sectors")
    if not se:
        return 0
    tier1 = [e for e in se.exposures if e.tier == SectorTier.CRITICAL_SOVEREIGN]
    return max((e.criticality_adjusted_score for e in tier1), default=0)


def _avg_financing_pressure(ctx: dict) -> float:
    countries = ctx.get("countries", [])
    if not countries:
        return 0
    return sum(c.private_sector.financing_pressure for c in countries) / len(countries)


def _any_country_critical(ctx: dict) -> bool:
    return any(c.risk_level == "critical" for c in ctx.get("countries", []))


def _trade_route_risk(ctx: dict) -> bool:
    macro = ctx.get("macro")
    if not macro:
        return False
    trade = next((s for s in macro.signals if s.type == MacroSignalType.TRADE_RISK), None)
    ship = next((s for s in macro.signals if s.type == MacroSignalType.SHIPPING_PRESSURE), None)
    return bool(trade and ship and abs(trade.magnitude) > 0.5 and abs(ship.magnitude) > 0.4)


def _regulatory_pressure_high(ctx: dict) -> bool:
    macro = ctx.get("macro")
    if not macro:
        return False
    reg = next((s for s in macro.signals if s.type == MacroSignalType.REGULATORY_PRESSURE), None)
    return bool(reg and abs(reg.magnitude) > 0.3)


class RiskEngine:
    """
    Generates structured risk register from intelligence context.
    """

    def run(
        self,
        scenario: ScenarioInput,
        macro_signals: MacroSignalSet,
        gdp_impacts: list[GDPImpactResult],
        country_impacts: list[CountryImpact],
        sector_exposures: SectorExposureResult,
    ) -> RiskRegister:
        ctx = {
            "scenario": scenario,
            "macro": macro_signals,
            "gdp": gdp_impacts,
            "countries": country_impacts,
            "sectors": sector_exposures,
        }

        risks: list[RiskEntry] = []
        for rule in RISK_RULES:
            if rule["condition"](ctx):
                likelihood = self._estimate_likelihood(ctx, rule)
                impact = self._estimate_impact(ctx, rule)
                sev_mult = {"critical": 1.0, "high": 0.8, "medium": 0.6, "low": 0.3}
                risk_score = round(
                    impact * likelihood * sev_mult.get(rule["severity"].value, 0.5) * 100, 1
                )

                risks.append(RiskEntry(
                    id=rule["id"],
                    category=rule["category"],
                    title=LanguageVariant(en=rule["title_en"], ar=rule["title_ar"]),
                    description=LanguageVariant(en=rule["desc_en"], ar=rule["desc_ar"]),
                    severity=rule["severity"],
                    likelihood=round(likelihood, 3),
                    impact_score=round(impact * 100, 1),
                    risk_score=min(risk_score, 100.0),
                    affected_countries=scenario.affected_countries,
                    affected_sectors=scenario.affected_sectors[:5],
                    mitigation=LanguageVariant(en=rule["mitigation_en"], ar=rule["mitigation_ar"]),
                    propagation_targets=rule["propagation"],
                    drivers=rule["drivers"],
                ))

        risks.sort(key=lambda r: r.risk_score, reverse=True)
        agg = sum(r.risk_score for r in risks) / max(len(risks), 1)
        critical = sum(1 for r in risks if r.severity == RiskSeverity.CRITICAL)
        high = sum(1 for r in risks if r.severity == RiskSeverity.HIGH)

        return RiskRegister(
            scenario_id=scenario.id,
            risks=risks,
            aggregate_risk_score=round(agg, 1),
            critical_count=critical,
            high_count=high,
            explanation=LanguageVariant(
                en=f"{len(risks)} risks identified. {critical} critical, {high} high. Aggregate risk: {agg:.0f}/100.",
                ar=f"تم تحديد {len(risks)} مخاطر. {critical} حرجة، {high} مرتفعة. المخاطر الإجمالية: {agg:.0f}/100.",
            ),
        )

    def _estimate_likelihood(self, ctx: dict, rule: dict) -> float:
        base = min(ctx["macro"].overall_stress / 100, 1.0)
        conf = ctx["scenario"].confidence
        return round(min(base * 0.6 + conf * 0.4, 1.0), 3)

    def _estimate_impact(self, ctx: dict, rule: dict) -> float:
        sev_map = {"critical": 0.95, "high": 0.75, "medium": 0.50, "low": 0.25}
        base = sev_map.get(rule["severity"].value, 0.5)
        country_adj = len(ctx.get("countries", [])) / 6.0 * 0.2
        return round(min(base + country_adj, 1.0), 3)
