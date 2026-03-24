"""
Scoring Engine — Deterministic, weighted, explainable scoring.

Computes composite scores from all pipeline layers:
macro stress → GDP impact → country sensitivity → sector exposure → decision pressure.
Every score is traceable to its source components.
"""
from ..schemas.scenario import ScenarioInput, LanguageVariant
from ..schemas.macro import MacroSignalSet
from ..schemas.gdp import GDPImpactResult
from ..schemas.country import CountryImpact
from ..schemas.sector import SectorExposureResult
from ..schemas.decision import DecisionRecommendation
from ..schemas.scoring import (
    ScoreCategory, ScoreComponent, ScoreResult, CompositeScore,
)


# ─── SCORE WEIGHTS ────────────────────────────────────────
# How much each layer contributes to the composite score.
LAYER_WEIGHTS = {
    "macro": 0.20,
    "gdp": 0.20,
    "country": 0.20,
    "sector": 0.25,
    "decision": 0.15,
}


class ScoringEngine:
    """
    Builds a fully explainable composite score from all intelligence layers.
    """

    def run(
        self,
        scenario: ScenarioInput,
        macro_signals: MacroSignalSet,
        gdp_impacts: list[GDPImpactResult],
        country_impacts: list[CountryImpact],
        sector_exposures: SectorExposureResult,
        decisions: list[DecisionRecommendation],
    ) -> CompositeScore:
        sub_scores = []

        # 1. Macro score
        macro_score = self._score_macro(macro_signals)
        sub_scores.append(macro_score)

        # 2. GDP score
        gdp_score = self._score_gdp(gdp_impacts)
        sub_scores.append(gdp_score)

        # 3. Country score
        country_score = self._score_countries(country_impacts)
        sub_scores.append(country_score)

        # 4. Sector score
        sector_score = self._score_sectors(sector_exposures)
        sub_scores.append(sector_score)

        # 5. Decision pressure score
        decision_score = self._score_decisions(decisions)
        sub_scores.append(decision_score)

        # Composite
        overall = sum(
            s.score * LAYER_WEIGHTS.get(s.category.value, 0.2)
            for s in sub_scores
        )
        avg_confidence = sum(s.confidence for s in sub_scores) / max(len(sub_scores), 1)

        return CompositeScore(
            scenario_id=scenario.id,
            overall_score=round(min(overall, 100.0), 1),
            sub_scores=sub_scores,
            explanation=LanguageVariant(
                en=f"Composite intelligence score: {overall:.0f}/100. "
                   f"Macro={macro_score.score:.0f}, GDP={gdp_score.score:.0f}, "
                   f"Country={country_score.score:.0f}, Sector={sector_score.score:.0f}, "
                   f"Decision={decision_score.score:.0f}.",
                ar=f"النتيجة الاستخباراتية المركبة: {overall:.0f}/100.",
            ),
            confidence=round(avg_confidence, 3),
        )

    def _score_macro(self, macro: MacroSignalSet) -> ScoreResult:
        components = []
        for s in macro.signals:
            components.append(ScoreComponent(
                name=s.type.value,
                raw_value=abs(s.magnitude) * 100,
                weight=1.0 / max(len(macro.signals), 1),
                weighted_value=abs(s.magnitude) * 100 / max(len(macro.signals), 1),
                source_layer="scenario_engine",
            ))
        score = macro.overall_stress
        return ScoreResult(
            id="score_macro",
            category=ScoreCategory.MACRO,
            label=LanguageVariant(en="Macro Stress Score", ar="نتيجة الضغط الاقتصادي الكلي"),
            score=round(score, 1),
            components=components,
            confidence=round(sum(s.confidence for s in macro.signals) / max(len(macro.signals), 1), 3),
            explanation=LanguageVariant(
                en=f"Overall macro stress at {score:.0f}/100 across {len(macro.signals)} signals.",
                ar=f"الضغط الاقتصادي الكلي عند {score:.0f}/100 عبر {len(macro.signals)} إشارة.",
            ),
        )

    def _score_gdp(self, gdp_impacts: list[GDPImpactResult]) -> ScoreResult:
        if not gdp_impacts:
            return ScoreResult(
                id="score_gdp", category=ScoreCategory.GDP,
                label=LanguageVariant(en="GDP Impact Score", ar="نتيجة تأثير الناتج المحلي"),
                score=0, components=[], confidence=0,
                explanation=LanguageVariant(en="No GDP data.", ar="لا توجد بيانات."),
            )
        components = []
        for g in gdp_impacts:
            val = abs(g.aggregate_impact) * 100
            components.append(ScoreComponent(
                name=g.country_code.value,
                raw_value=val,
                weight=1.0 / len(gdp_impacts),
                weighted_value=val / len(gdp_impacts),
                source_layer="gdp_engine",
            ))
        avg = sum(c.weighted_value for c in components)
        return ScoreResult(
            id="score_gdp", category=ScoreCategory.GDP,
            label=LanguageVariant(en="GDP Impact Score", ar="نتيجة تأثير الناتج المحلي"),
            score=round(min(avg * 2.5, 100), 1),
            components=components,
            confidence=0.78,
            explanation=LanguageVariant(
                en=f"GDP pressure across {len(gdp_impacts)} countries, avg impact {avg:.1f}.",
                ar=f"ضغط الناتج المحلي عبر {len(gdp_impacts)} دول.",
            ),
        )

    def _score_countries(self, countries: list[CountryImpact]) -> ScoreResult:
        if not countries:
            return ScoreResult(
                id="score_country", category=ScoreCategory.COUNTRY,
                label=LanguageVariant(en="Country Sensitivity Score", ar="نتيجة حساسية الدول"),
                score=0, components=[], confidence=0,
                explanation=LanguageVariant(en="No country data.", ar="لا توجد بيانات."),
            )
        components = []
        for c in countries:
            components.append(ScoreComponent(
                name=c.country_code.value,
                raw_value=c.macro_sensitivity,
                weight=1.0 / len(countries),
                weighted_value=c.macro_sensitivity / len(countries),
                source_layer="country_engine",
            ))
        score = sum(c.weighted_value for c in components)
        return ScoreResult(
            id="score_country", category=ScoreCategory.COUNTRY,
            label=LanguageVariant(en="Country Sensitivity Score", ar="نتيجة حساسية الدول"),
            score=round(score, 1),
            components=components,
            confidence=round(sum(c.confidence for c in countries) / len(countries), 3),
            explanation=LanguageVariant(
                en=f"Average country sensitivity: {score:.0f}/100 across {len(countries)} GCC countries.",
                ar=f"متوسط حساسية الدول: {score:.0f}/100 عبر {len(countries)} دول خليجية.",
            ),
        )

    def _score_sectors(self, sectors: SectorExposureResult) -> ScoreResult:
        components = []
        for e in sectors.exposures:
            components.append(ScoreComponent(
                name=e.sector_code.value,
                raw_value=e.criticality_adjusted_score,
                weight=1.0 / max(len(sectors.exposures), 1),
                weighted_value=e.criticality_adjusted_score / max(len(sectors.exposures), 1),
                source_layer="sector_engine",
            ))
        score = sum(c.weighted_value for c in components) if components else 0
        return ScoreResult(
            id="score_sector", category=ScoreCategory.SECTOR,
            label=LanguageVariant(en="Sector Exposure Score", ar="نتيجة تعرض القطاعات"),
            score=round(score, 1),
            components=components,
            confidence=0.80,
            explanation=LanguageVariant(
                en=f"Weighted sector exposure: {score:.0f}/100 across {len(sectors.exposures)} sectors (tier-adjusted).",
                ar=f"التعرض القطاعي الموزون: {score:.0f}/100 عبر {len(sectors.exposures)} قطاع.",
            ),
        )

    def _score_decisions(self, decisions: list[DecisionRecommendation]) -> ScoreResult:
        if not decisions:
            return ScoreResult(
                id="score_decision", category=ScoreCategory.DECISION,
                label=LanguageVariant(en="Decision Pressure Score", ar="نتيجة ضغط القرار"),
                score=0, components=[], confidence=0,
                explanation=LanguageVariant(en="No decisions triggered.", ar="لم يتم تفعيل قرارات."),
            )
        components = []
        for d in decisions:
            components.append(ScoreComponent(
                name=d.id,
                raw_value=d.pressure.score,
                weight=1.0 / len(decisions),
                weighted_value=d.pressure.score / len(decisions),
                source_layer="decision_engine",
            ))
        score = sum(c.weighted_value for c in components)
        return ScoreResult(
            id="score_decision", category=ScoreCategory.DECISION,
            label=LanguageVariant(en="Decision Pressure Score", ar="نتيجة ضغط القرار"),
            score=round(score, 1),
            components=components,
            confidence=round(sum(d.confidence for d in decisions) / len(decisions), 3),
            explanation=LanguageVariant(
                en=f"Average decision pressure: {score:.0f}/100 from {len(decisions)} active decisions.",
                ar=f"متوسط ضغط القرار: {score:.0f}/100 من {len(decisions)} قرار نشط.",
            ),
        )
