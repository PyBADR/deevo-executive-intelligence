"""
Decision Explanation Engine — Generates structured explanations for every recommendation.

Every decision must be traceable: what happened → why it matters → who is affected →
which GDP components moved → which sectors are under pressure → why this action →
what happens next.
"""
from ..schemas.scenario import ScenarioInput, GDPComponentCode, SectorCode, LanguageVariant
from ..schemas.macro import MacroSignalSet
from ..schemas.gdp import GDPImpactResult
from ..schemas.country import CountryImpact
from ..schemas.sector import SectorExposureResult
from ..schemas.decision import DecisionRecommendation, DecisionExplanation, ExplainedDecision


class ExplanationEngine:
    """
    For every DecisionRecommendation, generate a full DecisionExplanation
    with traceable reasoning chain.
    """

    def run(
        self,
        recommendations: list[DecisionRecommendation],
        scenario: ScenarioInput,
        macro_signals: MacroSignalSet,
        gdp_impacts: list[GDPImpactResult],
        country_impacts: list[CountryImpact],
        sector_exposures: SectorExposureResult,
    ) -> list[ExplainedDecision]:
        results = []
        for rec in recommendations:
            explanation = self._build_explanation(
                rec, scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures
            )
            results.append(ExplainedDecision(
                recommendation=rec,
                explanation=explanation,
            ))
        return results

    def _build_explanation(
        self,
        rec: DecisionRecommendation,
        scenario: ScenarioInput,
        macro_signals: MacroSignalSet,
        gdp_impacts: list[GDPImpactResult],
        country_impacts: list[CountryImpact],
        sector_exposures: SectorExposureResult,
    ) -> DecisionExplanation:
        # Identify affected GDP components (those with significant negative impact)
        affected_gdp: set[GDPComponentCode] = set()
        for gdp in gdp_impacts:
            for comp in gdp.components:
                if comp.impact_score < -0.15:
                    affected_gdp.add(comp.component)

        # Identify pressured sectors (top 4 by exposure)
        pressured_sectors = [
            e.sector_code for e in sorted(
                sector_exposures.exposures,
                key=lambda x: x.exposure_score,
                reverse=True,
            )[:4]
        ]

        # Identify affected entities from country impacts
        affected_entities = []
        for ci in country_impacts:
            if ci.risk_level in ("critical", "high", "elevated"):
                affected_entities.append(f"{ci.country_code.value} ({ci.risk_level})")

        # Top macro signals for reasoning
        top_signals = sorted(macro_signals.signals, key=lambda s: s.magnitude)[:3]
        signal_names = [s.type.value.replace("_", " ").title() for s in top_signals]

        # Construct what happened
        what_happened = LanguageVariant(
            en=f"{scenario.title.en}: {scenario.description.en}",
            ar=f"{scenario.title.ar}: {scenario.description.ar}" if scenario.title.ar else scenario.title.en,
        )

        # Construct why it matters
        gdp_names = [g.value.replace("_", " ").title() for g in affected_gdp]
        why_it_matters = LanguageVariant(
            en=f"This scenario generates {len(top_signals)} macro pressure signals "
               f"({', '.join(signal_names)}), which propagate into {len(affected_gdp)} GDP components "
               f"({', '.join(gdp_names)}), affecting {len(affected_entities)} GCC countries at elevated risk or higher. "
               f"The strongest sector transmission is into {', '.join(s.value for s in pressured_sectors[:3])}.",
            ar=f"يولد هذا السيناريو {len(top_signals)} إشارات ضغط اقتصادية كبرى "
               f"تنتقل إلى {len(affected_gdp)} مكونات من الناتج المحلي الإجمالي، "
               f"مؤثرة على {len(affected_entities)} دول خليجية بمستوى مخاطر مرتفع أو أعلى.",
        )

        # Why this recommendation
        why_this = LanguageVariant(
            en=f"Decision pressure score is {rec.pressure.score:.0f}/100 with {rec.priority.value} urgency. "
               f"Primary drivers: {', '.join(rec.pressure.primary_drivers)}. "
               f"This action addresses the strongest transmission channels before they compound into broader economic stress.",
            ar=f"درجة ضغط القرار {rec.pressure.score:.0f}/100 مع إلحاح {rec.priority.value}. "
               f"المحركات الرئيسية: {', '.join(rec.pressure.primary_drivers)}. "
               f"يعالج هذا الإجراء أقوى قنوات الانتقال قبل أن تتحول إلى ضغط اقتصادي أوسع.",
        )

        # Likely next developments
        next_devs = self._project_next_developments(scenario, macro_signals, sector_exposures)

        return DecisionExplanation(
            decision_id=rec.id,
            what_happened=what_happened,
            why_it_matters=why_it_matters,
            who_is_affected=affected_entities + rec.affected_entities,
            gdp_components_moved=list(affected_gdp),
            sectors_under_pressure=pressured_sectors,
            why_this_recommendation=why_this,
            likely_next_developments=next_devs,
            confidence=rec.confidence,
        )

    def _project_next_developments(
        self,
        scenario: ScenarioInput,
        macro_signals: MacroSignalSet,
        sector_exposures: SectorExposureResult,
    ) -> list[LanguageVariant]:
        """Generate likely next developments based on current intelligence."""
        developments = []

        # High stress → escalation likely
        if macro_signals.overall_stress > 60:
            developments.append(LanguageVariant(
                en="Macro stress above 60 indicates second-order effects may materialize within 2-4 weeks, particularly in financing and demand channels.",
                ar="الضغط الاقتصادي الكلي فوق 60 يشير إلى احتمال ظهور تأثيرات من الدرجة الثانية خلال 2-4 أسابيع، خاصة في قنوات التمويل والطلب.",
            ))

        # Top sector under pressure
        if sector_exposures.exposures:
            top = sector_exposures.exposures[0]
            developments.append(LanguageVariant(
                en=f"{top.sector_code.value.replace('_', ' ').title()} sector (exposure {top.exposure_score:.0f}) "
                   f"is likely to see operational adjustments, pricing reviews, and risk posture changes within the near term.",
                ar=f"من المرجح أن يشهد قطاع {top.sector_code.value} (التعرض {top.exposure_score:.0f}) "
                   f"تعديلات تشغيلية ومراجعات تسعير وتغييرات في وضع المخاطر على المدى القريب.",
            ))

        # Multi-country scenario
        if len(scenario.affected_countries) >= 4:
            developments.append(LanguageVariant(
                en="With 4+ GCC countries affected, cross-border coordination and policy alignment pressures are expected to increase.",
                ar="مع تأثر 4 دول خليجية أو أكثر، من المتوقع زيادة ضغوط التنسيق العابر للحدود ومواءمة السياسات.",
            ))

        # Default forward-look
        developments.append(LanguageVariant(
            en="Continue monitoring scenario evolution. Intelligence refresh recommended within 48 hours or upon material development.",
            ar="الاستمرار في مراقبة تطور السيناريو. يوصى بتحديث المعلومات الاستخباراتية خلال 48 ساعة أو عند أي تطور جوهري.",
        ))

        return developments[:4]
