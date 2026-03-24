"""
Decision Engine — Generates structured, explainable recommendations.

Takes the full intelligence context (scenario, GDP, country, sector)
and produces prioritized decision recommendations with reasoning.
Tier 1 sectors dominate decision priority.
"""
import uuid
from ..schemas.scenario import ScenarioInput, GDPComponentCode, SectorCode, LanguageVariant
from ..schemas.macro import MacroSignalSet
from ..schemas.gdp import GDPImpactResult
from ..schemas.country import CountryImpact
from ..schemas.sector import SectorExposureResult, SectorTier
from ..schemas.decision import (
    DecisionPressure, DecisionRecommendation, DecisionUrgency
)


# ─── Decision Templates ───────────────────────────────────
# Rule-based templates triggered by conditions in the intelligence context.
DECISION_RULES = [
    {
        "condition": lambda ctx: _max_sector_exposure(ctx) > 60 and _any_tier1_in_top(ctx),
        "title_en": "Activate Critical Infrastructure Protection Protocol",
        "title_ar": "تفعيل بروتوكول حماية البنية التحتية الحرجة",
        "action_en": "Engage Tier 1 sovereign sector monitoring: aviation, oil & gas, banking, ports, logistics, energy infrastructure. Escalate corridor dependency alerts and trigger contingency routing reviews across all GCC operations.",
        "action_ar": "تفعيل مراقبة القطاعات السيادية من المستوى الأول: الطيران، النفط والغاز، البنوك، الموانئ، اللوجستيات، البنية التحتية للطاقة. تصعيد تنبيهات الاعتماد على الممرات وإجراء مراجعات التوجيه البديل.",
        "urgency": DecisionUrgency.IMMEDIATE,
        "stakeholders": ["Supply Chain", "Operations", "Risk Management", "C-Suite", "Regulators"],
        "drivers": ["Tier 1 sovereign sector pressure", "Trade route disruption", "Critical infrastructure exposure"],
    },
    {
        "condition": lambda ctx: _avg_private_pressure(ctx) > 55,
        "title_en": "Rebalance Private-Sector Monitoring",
        "title_ar": "إعادة توازن مراقبة القطاع الخاص",
        "action_en": "Increase monitoring granularity for private-sector financing, demand, and investment sentiment by country and sector. Deploy early-warning indicators across Tier 2-3 financial and market sectors.",
        "action_ar": "زيادة دقة مراقبة التمويل والطلب ومعنويات الاستثمار في القطاع الخاص حسب الدولة والقطاع. نشر مؤشرات الإنذار المبكر عبر القطاعات المالية والسوقية.",
        "urgency": DecisionUrgency.SHORT_TERM,
        "stakeholders": ["Investment Teams", "Risk", "Strategy", "Portfolio Management"],
        "drivers": ["Private investment softening", "Financing tightness", "Demand uncertainty"],
    },
    {
        "condition": lambda ctx: _sector_in_top(ctx, "BANKING") or _sector_in_top(ctx, "CAPITAL_MARKETS"),
        "title_en": "Protect Financial System Decisions",
        "title_ar": "حماية قرارات النظام المالي",
        "action_en": "Introduce sector-specific stress narratives into credit committees, claims reviews, and underwriting decisions. Tighten scenario-based portfolio monitoring across banking, insurance, and capital markets.",
        "action_ar": "إدخال سرديات الضغط القطاعي في لجان الائتمان ومراجعات المطالبات وقرارات الاكتتاب. تشديد مراقبة المحافظ عبر البنوك والتأمين وأسواق المال.",
        "urgency": DecisionUrgency.IMMEDIATE,
        "stakeholders": ["Banking", "Insurance", "Capital Markets", "Credit Risk", "Underwriting", "CFO"],
        "drivers": ["Credit tightening", "Claims pressure", "Risk repricing", "Liquidity stress"],
    },
    {
        "condition": lambda ctx: _gdp_component_hit(ctx, GDPComponentCode.NET_EXPORTS, -0.3),
        "title_en": "Strengthen Export Corridor Intelligence",
        "title_ar": "تعزيز استخبارات ممرات التصدير",
        "action_en": "Deploy real-time corridor monitoring and establish alternative routing playbooks for top export channels. Engage aviation, ports, and logistics sectors for operational contingency.",
        "action_ar": "نشر مراقبة فورية للممرات وإنشاء خطط توجيه بديلة لقنوات التصدير الرئيسية. إشراك قطاعات الطيران والموانئ واللوجستيات.",
        "urgency": DecisionUrgency.IMMEDIATE,
        "stakeholders": ["Trade", "Energy", "Government Affairs", "Operations", "Aviation", "Ports"],
        "drivers": ["Export volume risk", "Corridor disruption", "Revenue concentration"],
    },
    {
        "condition": lambda ctx: _avg_macro_sensitivity(ctx) > 65,
        "title_en": "Activate Cross-GCC Coordination Protocol",
        "title_ar": "تفعيل بروتوكول التنسيق عبر دول الخليج",
        "action_en": "Initiate cross-country intelligence sharing on shared exposure vectors. Align risk posture across GCC operations to prevent fragmented responses. Coordinate sovereign wealth and government finance actions.",
        "action_ar": "بدء تبادل المعلومات الاستخباراتية بين الدول حول متجهات التعرض المشتركة. مواءمة وضع المخاطر عبر العمليات الخليجية.",
        "urgency": DecisionUrgency.SHORT_TERM,
        "stakeholders": ["Regional Leadership", "Risk", "Government Relations", "Strategy", "SWFs"],
        "drivers": ["Multi-country exposure", "Spillover risk", "Policy coordination gap"],
    },
    {
        "condition": lambda ctx: _gdp_component_hit(ctx, GDPComponentCode.HOUSEHOLD_CONSUMPTION, -0.25),
        "title_en": "Monitor Consumer Demand Resilience",
        "title_ar": "مراقبة مرونة الطلب الاستهلاكي",
        "action_en": "Track consumer confidence, discretionary spending patterns, and cost pass-through indicators. Prepare demand-side scenario plans for retail, e-commerce, and tourism sectors.",
        "action_ar": "تتبع ثقة المستهلك وأنماط الإنفاق التقديري ومؤشرات انتقال التكاليف. إعداد خطط سيناريو جانب الطلب لقطاعات التجزئة والتجارة الإلكترونية والسياحة.",
        "urgency": DecisionUrgency.MEDIUM_TERM,
        "stakeholders": ["Retail", "Consumer Finance", "Tourism", "Marketing", "Strategy"],
        "drivers": ["Confidence erosion", "Inflation pass-through", "Spending contraction"],
    },
    {
        "condition": lambda ctx: _sector_in_top(ctx, "AVIATION") or _sector_in_top(ctx, "PORTS_MARITIME"),
        "title_en": "Engage Aviation & Maritime Contingency Planning",
        "title_ar": "تفعيل التخطيط الاحتياطي للطيران والنقل البحري",
        "action_en": "Activate route sensitivity analysis for aviation and maritime corridors. Assess cargo dependency, tourism flows, and geopolitical exposure. Prepare rerouting options.",
        "action_ar": "تفعيل تحليل حساسية المسارات للممرات الجوية والبحرية. تقييم الاعتماد على الشحن وتدفقات السياحة والتعرض الجيوسياسي.",
        "urgency": DecisionUrgency.IMMEDIATE,
        "stakeholders": ["Aviation Authority", "Port Authority", "Trade", "Tourism", "Logistics"],
        "drivers": ["Route sensitivity", "Corridor dependency", "Cargo/tourism disruption"],
    },
    {
        "condition": lambda ctx: _sector_in_top(ctx, "OIL_GAS") and _gdp_component_hit(ctx, GDPComponentCode.GOVERNMENT_SPENDING, -0.2),
        "title_en": "Activate Sovereign Fiscal Stress Protocol",
        "title_ar": "تفعيل بروتوكول الضغط المالي السيادي",
        "action_en": "Oil & gas exposure combined with government spending pressure requires immediate fiscal buffer assessment. Engage sovereign wealth funds and government finance teams.",
        "action_ar": "التعرض النفطي مع ضغوط الإنفاق الحكومي يتطلب تقييماً فورياً للاحتياطيات المالية. إشراك صناديق الثروة السيادية وفرق المالية الحكومية.",
        "urgency": DecisionUrgency.IMMEDIATE,
        "stakeholders": ["Finance Ministry", "SWFs", "Central Bank", "Budget", "C-Suite"],
        "drivers": ["Oil revenue sensitivity", "Fiscal buffer strain", "Spending reallocation"],
    },
]


def _max_sector_exposure(ctx: dict) -> float:
    se = ctx.get("sector_exposures")
    if not se:
        return 0
    return max((e.criticality_adjusted_score for e in se.exposures), default=0)


def _any_tier1_in_top(ctx: dict) -> bool:
    se = ctx.get("sector_exposures")
    if not se:
        return False
    top3 = se.exposures[:3]
    return any(e.tier == SectorTier.CRITICAL_SOVEREIGN for e in top3)


def _top_sectors(ctx: dict) -> list[str]:
    se = ctx.get("sector_exposures")
    if not se:
        return []
    return [e.sector_code.value for e in se.exposures[:5]]


def _sector_in_top(ctx: dict, code: str) -> bool:
    return code in _top_sectors(ctx)


def _avg_private_pressure(ctx: dict) -> float:
    countries = ctx.get("country_impacts", [])
    if not countries:
        return 0
    return sum(
        (c.private_sector.operating_cost_pressure + c.private_sector.financing_pressure) / 2
        for c in countries
    ) / len(countries)


def _avg_macro_sensitivity(ctx: dict) -> float:
    countries = ctx.get("country_impacts", [])
    if not countries:
        return 0
    return sum(c.macro_sensitivity for c in countries) / len(countries)


def _gdp_component_hit(ctx: dict, component: GDPComponentCode, threshold: float) -> bool:
    for gdp in ctx.get("gdp_impacts", []):
        for comp in gdp.components:
            if comp.component == component and comp.impact_score <= threshold:
                return True
    return False


class DecisionEngine:
    """
    Rule-based decision engine. Evaluates intelligence context against
    decision rules and produces prioritized, explained recommendations.
    Tier 1 sectors dominate decision priority.
    """

    def run(
        self,
        scenario: ScenarioInput,
        macro_signals: MacroSignalSet,
        gdp_impacts: list[GDPImpactResult],
        country_impacts: list[CountryImpact],
        sector_exposures: SectorExposureResult,
    ) -> list[DecisionRecommendation]:
        ctx = {
            "scenario": scenario,
            "macro_signals": macro_signals,
            "gdp_impacts": gdp_impacts,
            "country_impacts": country_impacts,
            "sector_exposures": sector_exposures,
        }

        recommendations = []
        for rule in DECISION_RULES:
            if rule["condition"](ctx):
                pressure_score = self._compute_pressure(ctx, rule["drivers"])
                rec = DecisionRecommendation(
                    id=str(uuid.uuid4())[:8],
                    scenario_id=scenario.id,
                    title=LanguageVariant(en=rule["title_en"], ar=rule["title_ar"]),
                    action=LanguageVariant(en=rule["action_en"], ar=rule["action_ar"]),
                    priority=rule["urgency"],
                    confidence=round(min(scenario.confidence + 0.1, 0.95), 3),
                    affected_entities=rule["stakeholders"],
                    pressure=DecisionPressure(
                        score=pressure_score,
                        urgency=rule["urgency"],
                        affected_stakeholders=rule["stakeholders"],
                        primary_drivers=rule["drivers"],
                    ),
                )
                recommendations.append(rec)

        return sorted(recommendations, key=lambda r: r.pressure.score, reverse=True)

    def _compute_pressure(self, ctx: dict, drivers: list[str]) -> float:
        base = ctx["macro_signals"].overall_stress
        country_factor = _avg_macro_sensitivity(ctx) / 100
        # Tier 1 boost: if any Tier 1 sector is in top exposures
        tier1_boost = 10.0 if _any_tier1_in_top(ctx) else 0.0
        return round(min(base * 0.6 + country_factor * 40 + tier1_boost, 100.0), 1)
