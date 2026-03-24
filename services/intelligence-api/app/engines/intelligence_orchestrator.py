"""
Intelligence Orchestrator — Full pipeline with scoring, risk, KPIs, and dependency analysis.

ScenarioInput
  → Scenario Engine (macro signals)
  → GDP Engine (component impacts per country)
  → Country Engine (public/private split per country)
  → Sector Engine (4-tier exposure)
  → Decision Engine (recommendations)
  → Explanation Engine (structured reasoning)
  → Graph Engine (propagation graph)
  → Scoring Engine (composite scores)
  → Risk Engine (risk register)
  → KPI Engine (executive/country/sector KPIs)
  → GCC Dependency Engine (cross-country spillovers)
  → IntelligenceSnapshot (fully typed)
"""
from datetime import datetime, timezone
from ..schemas.scenario import ScenarioInput, GCCCountryCode
from ..schemas.narrative import (
    IntelligenceSnapshot, NarrativeBlock, NarrativeType,
)
from ..schemas.macro import MacroSignalSet
from ..schemas.gdp import GDPImpactResult
from ..schemas.country import CountryImpact
from ..schemas.sector import SectorExposureResult
from ..schemas.decision import ExplainedDecision, DecisionRecommendation
from ..schemas.graph import PropagationResult
from ..schemas.scoring import CompositeScore
from ..schemas.risk import RiskRegister
from ..schemas.kpi import KPIDashboard
from ..schemas.scenario import LanguageVariant

from .scenario_engine import ScenarioEngine
from .gdp_engine import GDPEngine
from .country_engine import CountryEngine
from .sector_engine import SectorEngine
from .decision_engine import DecisionEngine
from .explanation_engine import ExplanationEngine
from .graph_engine import GraphEngine
from .scoring_engine import ScoringEngine
from .risk_engine import RiskEngine
from .kpi_engine import KPIEngine
from ..services.gcc_dependency_engine import GCCDependencyEngine, DependencyResult


class IntelligenceOrchestrator:
    """
    Single entry point that orchestrates all intelligence engines
    and returns a complete IntelligenceSnapshot.
    """

    def __init__(self):
        self.scenario_engine = ScenarioEngine()
        self.gdp_engine = GDPEngine()
        self.country_engine = CountryEngine()
        self.sector_engine = SectorEngine()
        self.decision_engine = DecisionEngine()
        self.explanation_engine = ExplanationEngine()
        self.graph_engine = GraphEngine()
        self.scoring_engine = ScoringEngine()
        self.risk_engine = RiskEngine()
        self.kpi_engine = KPIEngine()
        self.dependency_engine = GCCDependencyEngine()

    def run(self, scenario: ScenarioInput) -> IntelligenceSnapshot:
        """Execute the full intelligence pipeline. Returns typed IntelligenceSnapshot."""
        countries = scenario.affected_countries or list(GCCCountryCode)

        # Phase 1: Scenario → Macro Signals
        macro_signals: MacroSignalSet = self.scenario_engine.run(scenario)

        # Phase 2: Macro Signals → GDP Impacts (per country)
        gdp_impacts: list[GDPImpactResult] = self.gdp_engine.run(macro_signals, countries)

        # Phase 3: GDP + Macro → Country Impacts (public/private)
        country_impacts: list[CountryImpact] = self.country_engine.run(
            macro_signals, gdp_impacts, countries
        )

        # Phase 4: Macro → Sector Exposures (4-tier)
        sector_exposures: SectorExposureResult = self.sector_engine.run(
            macro_signals, scenario.id, scenario.affected_sectors or None
        )

        # Phase 5: Full context → Decisions
        recommendations: list[DecisionRecommendation] = self.decision_engine.run(
            scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures
        )

        # Phase 6: Decisions → Explanations
        explained_decisions: list[ExplainedDecision] = self.explanation_engine.run(
            recommendations, scenario, macro_signals, gdp_impacts,
            country_impacts, sector_exposures
        )

        # Phase 7: All → Graph
        graph: PropagationResult = self.graph_engine.run(
            scenario, macro_signals, gdp_impacts, country_impacts,
            sector_exposures, recommendations
        )

        # Phase 8: Scoring
        scores: CompositeScore = self.scoring_engine.run(
            scenario, macro_signals, gdp_impacts, country_impacts,
            sector_exposures, recommendations
        )

        # Phase 9: Risk Register
        risk_register: RiskRegister = self.risk_engine.run(
            scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures
        )

        # Phase 10: KPIs (executive, country, sector)
        kpi_dashboard: KPIDashboard = self.kpi_engine.run(
            scenario, macro_signals, country_impacts, sector_exposures,
            recommendations, risk_register
        )

        # Phase 11: GCC Dependency Analysis
        dependency: DependencyResult = self.dependency_engine.run(
            country_impacts, macro_signals
        )

        # Phase 12: Generate narrative
        narrative: NarrativeBlock = self._generate_narrative(
            scenario, macro_signals, country_impacts, sector_exposures
        )

        # Assemble snapshot — fully typed, no model_dump()
        return IntelligenceSnapshot(
            scenario_id=scenario.id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            macro_signals=macro_signals,
            gdp_impacts=gdp_impacts,
            country_impacts=country_impacts,
            sector_exposures=sector_exposures,
            decisions=explained_decisions,
            graph=graph,
            kpis=kpi_dashboard.executive_kpis,
            narrative=narrative,
            # Extended outputs accessible via dedicated routes
        )

    def run_extended(self, scenario: ScenarioInput) -> dict:
        """Full pipeline with ALL outputs including scoring, risk, KPIs, dependency."""
        countries = scenario.affected_countries or list(GCCCountryCode)

        macro_signals = self.scenario_engine.run(scenario)
        gdp_impacts = self.gdp_engine.run(macro_signals, countries)
        country_impacts = self.country_engine.run(macro_signals, gdp_impacts, countries)
        sector_exposures = self.sector_engine.run(macro_signals, scenario.id, scenario.affected_sectors or None)
        recommendations = self.decision_engine.run(scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures)
        explained_decisions = self.explanation_engine.run(recommendations, scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures)
        graph = self.graph_engine.run(scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures, recommendations)
        scores = self.scoring_engine.run(scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures, recommendations)
        risk_register = self.risk_engine.run(scenario, macro_signals, gdp_impacts, country_impacts, sector_exposures)
        kpi_dashboard = self.kpi_engine.run(scenario, macro_signals, country_impacts, sector_exposures, recommendations, risk_register)
        dependency = self.dependency_engine.run(country_impacts, macro_signals)
        narrative = self._generate_narrative(scenario, macro_signals, country_impacts, sector_exposures)

        return {
            "scenario_id": scenario.id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "macro_signals": macro_signals.model_dump(),
            "gdp_impacts": [g.model_dump() for g in gdp_impacts],
            "country_impacts": [c.model_dump() for c in country_impacts],
            "sector_exposures": sector_exposures.model_dump(),
            "decisions": [d.model_dump() for d in explained_decisions],
            "graph": graph.model_dump(),
            "scores": scores.model_dump(),
            "risk_register": risk_register.model_dump(),
            "kpi_dashboard": kpi_dashboard.model_dump(),
            "dependency_analysis": dependency.model_dump(),
            "narrative": narrative.model_dump(),
        }

    def _generate_narrative(
        self,
        scenario: ScenarioInput,
        macro: MacroSignalSet,
        countries: list[CountryImpact],
        sectors: SectorExposureResult,
    ) -> NarrativeBlock:
        """Generate the executive narrative block."""
        top_signals = sorted(macro.signals, key=lambda s: s.magnitude)[:3]
        signal_names = [s.type.value.replace("_", " ") for s in top_signals]
        top_sectors = [e.sector_code.value.replace("_", " ").lower() for e in sectors.exposures[:3]]
        top_countries = [c.country_code.value for c in countries[:3]]

        body_en = (
            f"Current regional stress from {scenario.title.en.lower()} increases "
            f"{', '.join(signal_names)} first, which directly affects GDP components "
            f"across {', '.join(top_countries)}. The strongest immediate transmission is into "
            f"{', '.join(top_sectors)}. Public-sector resilience remains meaningful across the GCC, "
            f"but private-sector pressure is accelerating faster in sectors tied to trade, credit, "
            f"operating margins, and demand continuity. Decision logic prioritizes "
            f"Tier 1 sovereign sector exposure, trade corridor dependencies, and "
            f"country-level private/public differentiation."
        )

        body_ar = (
            f"تزيد الضغوط الإقليمية من {scenario.title.ar or scenario.title.en} "
            f"من {', '.join(signal_names)} أولاً، مؤثرة على مكونات الناتج المحلي "
            f"عبر {', '.join(top_countries)}. أقوى انتقال فوري إلى "
            f"{', '.join(top_sectors)}."
        )

        return NarrativeBlock(
            id=f"narrative_{scenario.id}",
            scenario_id=scenario.id,
            type=NarrativeType.ANALYSIS,
            title=LanguageVariant(
                en=f"Intelligence Brief: {scenario.title.en}",
                ar=f"موجز استخباراتي: {scenario.title.ar or scenario.title.en}",
            ),
            body=LanguageVariant(en=body_en, ar=body_ar),
            key_points=[
                LanguageVariant(en="4-tier sector model: Tier 1 sovereign sectors dominate decision priority.", ar="نموذج قطاعي من 4 مستويات: القطاعات السيادية تسيطر على أولوية القرار."),
                LanguageVariant(en="Cross-GCC dependency analysis identifies spillover channels.", ar="تحليل الاعتماد المتبادل يحدد قنوات الانتقال."),
                LanguageVariant(en="Every score, risk, and KPI is deterministic and traceable.", ar="كل نتيجة ومخاطرة ومؤشر حتمي وقابل للتتبع."),
                LanguageVariant(en="Scoring integrates macro, GDP, country, sector, and decision layers.", ar="التقييم يدمج الطبقات الاقتصادية والقطرية والقطاعية."),
            ],
            sources=[f"Scenario: {scenario.id}", "Pipeline v3.0 (scoring + risk + KPI + dependency)"],
            created_at=datetime.now(timezone.utc).isoformat(),
        )
