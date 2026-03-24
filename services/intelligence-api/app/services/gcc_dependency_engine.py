"""
Cross-GCC Dependency Matrix — Models inter-country economic dependencies.

Captures: trade routes, energy exports, financial flows, logistics corridors,
tourism flows, cross-border investments. Produces spillover effect scores
and cross-country propagation analysis.
"""
from ..schemas.scenario import GCCCountryCode, LanguageVariant
from ..schemas.macro import MacroSignalSet
from ..schemas.country import CountryImpact
from pydantic import BaseModel, Field


# ─── Output Schema ────────────────────────────────────────
class SpilloverEffect(BaseModel):
    source_country: GCCCountryCode
    target_country: GCCCountryCode
    channel: str  # trade, energy, finance, logistics, tourism, investment
    spillover_score: float = Field(ge=0.0, le=100.0)
    explanation: LanguageVariant


class DependencyResult(BaseModel):
    spillovers: list[SpilloverEffect]
    aggregate_interconnection: float = Field(ge=0.0, le=100.0)
    most_exposed_country: GCCCountryCode
    explanation: LanguageVariant


# ─── Dependency Weight Matrix ────────────────────────────
# dependency_weight_matrix[source][target] per channel
# Values 0-1: how much source country's stress spills into target.
TRADE_DEPENDENCY = {
    GCCCountryCode.SA: {GCCCountryCode.AE: 0.60, GCCCountryCode.BH: 0.50, GCCCountryCode.KW: 0.30, GCCCountryCode.QA: 0.25, GCCCountryCode.OM: 0.35},
    GCCCountryCode.AE: {GCCCountryCode.SA: 0.55, GCCCountryCode.BH: 0.40, GCCCountryCode.KW: 0.25, GCCCountryCode.QA: 0.30, GCCCountryCode.OM: 0.45},
    GCCCountryCode.KW: {GCCCountryCode.SA: 0.30, GCCCountryCode.AE: 0.25, GCCCountryCode.BH: 0.15, GCCCountryCode.QA: 0.20, GCCCountryCode.OM: 0.15},
    GCCCountryCode.QA: {GCCCountryCode.SA: 0.25, GCCCountryCode.AE: 0.35, GCCCountryCode.BH: 0.20, GCCCountryCode.KW: 0.15, GCCCountryCode.OM: 0.20},
    GCCCountryCode.BH: {GCCCountryCode.SA: 0.70, GCCCountryCode.AE: 0.35, GCCCountryCode.KW: 0.20, GCCCountryCode.QA: 0.15, GCCCountryCode.OM: 0.10},
    GCCCountryCode.OM: {GCCCountryCode.AE: 0.50, GCCCountryCode.SA: 0.30, GCCCountryCode.QA: 0.20, GCCCountryCode.KW: 0.10, GCCCountryCode.BH: 0.10},
}

ENERGY_DEPENDENCY = {
    GCCCountryCode.SA: {GCCCountryCode.AE: 0.30, GCCCountryCode.BH: 0.60, GCCCountryCode.KW: 0.15, GCCCountryCode.QA: 0.10, GCCCountryCode.OM: 0.20},
    GCCCountryCode.AE: {GCCCountryCode.SA: 0.15, GCCCountryCode.BH: 0.10, GCCCountryCode.KW: 0.10, GCCCountryCode.QA: 0.15, GCCCountryCode.OM: 0.25},
    GCCCountryCode.KW: {GCCCountryCode.SA: 0.20, GCCCountryCode.AE: 0.15, GCCCountryCode.BH: 0.10, GCCCountryCode.QA: 0.10, GCCCountryCode.OM: 0.10},
    GCCCountryCode.QA: {GCCCountryCode.SA: 0.15, GCCCountryCode.AE: 0.30, GCCCountryCode.BH: 0.10, GCCCountryCode.KW: 0.15, GCCCountryCode.OM: 0.15},
    GCCCountryCode.BH: {GCCCountryCode.SA: 0.65, GCCCountryCode.AE: 0.15, GCCCountryCode.KW: 0.05, GCCCountryCode.QA: 0.10, GCCCountryCode.OM: 0.05},
    GCCCountryCode.OM: {GCCCountryCode.AE: 0.30, GCCCountryCode.SA: 0.20, GCCCountryCode.QA: 0.15, GCCCountryCode.KW: 0.05, GCCCountryCode.BH: 0.05},
}

FINANCIAL_DEPENDENCY = {
    GCCCountryCode.SA: {GCCCountryCode.AE: 0.55, GCCCountryCode.BH: 0.50, GCCCountryCode.KW: 0.35, GCCCountryCode.QA: 0.30, GCCCountryCode.OM: 0.25},
    GCCCountryCode.AE: {GCCCountryCode.SA: 0.45, GCCCountryCode.BH: 0.55, GCCCountryCode.KW: 0.30, GCCCountryCode.QA: 0.35, GCCCountryCode.OM: 0.30},
    GCCCountryCode.KW: {GCCCountryCode.SA: 0.35, GCCCountryCode.AE: 0.30, GCCCountryCode.BH: 0.25, GCCCountryCode.QA: 0.20, GCCCountryCode.OM: 0.15},
    GCCCountryCode.QA: {GCCCountryCode.AE: 0.40, GCCCountryCode.SA: 0.30, GCCCountryCode.BH: 0.20, GCCCountryCode.KW: 0.20, GCCCountryCode.OM: 0.15},
    GCCCountryCode.BH: {GCCCountryCode.SA: 0.60, GCCCountryCode.AE: 0.50, GCCCountryCode.KW: 0.25, GCCCountryCode.QA: 0.20, GCCCountryCode.OM: 0.10},
    GCCCountryCode.OM: {GCCCountryCode.AE: 0.40, GCCCountryCode.SA: 0.25, GCCCountryCode.QA: 0.15, GCCCountryCode.KW: 0.10, GCCCountryCode.BH: 0.10},
}

CHANNEL_MATRICES = {
    "trade": TRADE_DEPENDENCY,
    "energy": ENERGY_DEPENDENCY,
    "finance": FINANCIAL_DEPENDENCY,
}


class GCCDependencyEngine:
    """Computes cross-GCC spillover effects from country-level intelligence."""

    def run(
        self,
        country_impacts: list[CountryImpact],
        macro_signals: MacroSignalSet,
    ) -> DependencyResult:
        impact_map = {c.country_code: c for c in country_impacts}
        spillovers: list[SpilloverEffect] = []

        for channel_name, matrix in CHANNEL_MATRICES.items():
            for source, targets in matrix.items():
                source_impact = impact_map.get(source)
                if not source_impact:
                    continue
                source_stress = source_impact.macro_sensitivity / 100.0

                for target, dep_weight in targets.items():
                    if source == target:
                        continue
                    spill_score = round(source_stress * dep_weight * 100, 1)
                    if spill_score < 5:
                        continue

                    spillovers.append(SpilloverEffect(
                        source_country=source,
                        target_country=target,
                        channel=channel_name,
                        spillover_score=min(spill_score, 100.0),
                        explanation=LanguageVariant(
                            en=f"{source.value} {channel_name} stress ({source_impact.macro_sensitivity:.0f}) "
                               f"spills into {target.value} with dependency weight {dep_weight:.2f}, "
                               f"generating {spill_score:.0f}/100 spillover pressure.",
                            ar=f"ضغط {channel_name} من {source.value} ينتقل إلى {target.value} "
                               f"بوزن اعتماد {dep_weight:.2f}، مما يولد ضغط انتقال {spill_score:.0f}/100.",
                        ),
                    ))

        spillovers.sort(key=lambda s: s.spillover_score, reverse=True)

        # Find most exposed
        country_totals: dict[GCCCountryCode, float] = {}
        for s in spillovers:
            country_totals[s.target_country] = country_totals.get(s.target_country, 0) + s.spillover_score
        most_exposed = max(country_totals, key=country_totals.get) if country_totals else GCCCountryCode.BH

        agg = sum(s.spillover_score for s in spillovers) / max(len(spillovers), 1)

        return DependencyResult(
            spillovers=spillovers[:20],  # top 20
            aggregate_interconnection=round(agg, 1),
            most_exposed_country=most_exposed,
            explanation=LanguageVariant(
                en=f"Cross-GCC dependency analysis: {len(spillovers)} spillover channels active. "
                   f"Most exposed: {most_exposed.value}. Average spillover: {agg:.0f}/100.",
                ar=f"تحليل الاعتماد المتبادل بين دول الخليج: {len(spillovers)} قناة انتقال نشطة. "
                   f"الأكثر تعرضاً: {most_exposed.value}.",
            ),
        )
