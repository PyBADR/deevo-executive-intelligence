"""
Graph Engine — Builds relationship nodes and edges for propagation visualization.

Creates a traceable graph: scenario → macro signals → GDP components →
countries (public/private) → sectors → decisions.
"""
from ..schemas.scenario import ScenarioInput, LanguageVariant
from ..schemas.macro import MacroSignalSet
from ..schemas.gdp import GDPImpactResult
from ..schemas.country import CountryImpact
from ..schemas.sector import SectorExposureResult
from ..schemas.decision import DecisionRecommendation
from ..schemas.graph import (
    RelationshipNode, RelationshipEdge, PropagationResult,
    NodeType, EdgeType,
)


class GraphEngine:
    """
    Builds a full propagation graph from the intelligence pipeline output.
    Supports 2D graph views now and 3D strategic views later.
    """

    def run(
        self,
        scenario: ScenarioInput,
        macro_signals: MacroSignalSet,
        gdp_impacts: list[GDPImpactResult],
        country_impacts: list[CountryImpact],
        sector_exposures: SectorExposureResult,
        decisions: list[DecisionRecommendation],
    ) -> PropagationResult:
        nodes: list[RelationshipNode] = []
        edges: list[RelationshipEdge] = []
        path: list[str] = []

        # ── 1. Scenario node ──────────────────────────────
        scenario_node_id = f"scenario_{scenario.id}"
        nodes.append(RelationshipNode(
            id=scenario_node_id,
            type=NodeType.SCENARIO,
            label=scenario.title,
            metadata={"severity": scenario.severity.value, "confidence": scenario.confidence},
        ))
        path.append(scenario_node_id)

        # ── 2. Macro signal nodes ─────────────────────────
        for signal in macro_signals.signals:
            if abs(signal.magnitude) < 0.1:
                continue
            sig_id = f"signal_{signal.type.value}"
            nodes.append(RelationshipNode(
                id=sig_id,
                type=NodeType.MACRO_SIGNAL,
                label=LanguageVariant(
                    en=signal.type.value.replace("_", " ").title(),
                    ar=signal.explanation.ar[:40] if signal.explanation.ar else signal.type.value,
                ),
                metadata={"magnitude": signal.magnitude},
            ))
            edge_type = EdgeType.INCREASES if signal.magnitude < 0 else EdgeType.REDUCES
            edges.append(RelationshipEdge(
                source_id=scenario_node_id,
                target_id=sig_id,
                type=edge_type,
                weight=abs(signal.magnitude),
                label=LanguageVariant(
                    en=f"{'increases' if signal.magnitude < 0 else 'reduces'} {signal.type.value.replace('_', ' ')}",
                    ar="يزيد" if signal.magnitude < 0 else "يقلل",
                ),
            ))
            path.append(sig_id)

        # ── 3. GDP component nodes ────────────────────────
        gdp_node_ids: set[str] = set()
        for gdp in gdp_impacts:
            for comp in gdp.components:
                if abs(comp.impact_score) < 0.1:
                    continue
                comp_id = f"gdp_{comp.component.value}"
                if comp_id not in gdp_node_ids:
                    nodes.append(RelationshipNode(
                        id=comp_id,
                        type=NodeType.GDP_COMPONENT,
                        label=LanguageVariant(
                            en=comp.component.value.replace("_", " ").title(),
                            ar=comp.explanation.ar[:30] if comp.explanation.ar else comp.component.value,
                        ),
                        metadata={"impact_score": comp.impact_score},
                    ))
                    gdp_node_ids.add(comp_id)

                # Connect signals → GDP
                for signal in macro_signals.signals:
                    if signal.type.value in comp.drivers:
                        sig_id = f"signal_{signal.type.value}"
                        edges.append(RelationshipEdge(
                            source_id=sig_id,
                            target_id=comp_id,
                            type=EdgeType.PRESSURES if comp.impact_score < 0 else EdgeType.SUPPORTS,
                            weight=abs(comp.impact_score),
                            label=LanguageVariant(
                                en=f"pressures {comp.component.value.replace('_', ' ').lower()}",
                                ar="يضغط على",
                            ),
                        ))

        for gid in gdp_node_ids:
            path.append(gid)

        # ── 4. Country nodes with public/private ──────────
        for ci in country_impacts:
            country_id = f"country_{ci.country_code.value}"
            nodes.append(RelationshipNode(
                id=country_id,
                type=NodeType.COUNTRY,
                label=LanguageVariant(en=ci.country_code.value, ar=ci.narrative.ar[:20]),
                metadata={"risk_level": ci.risk_level, "macro_sensitivity": ci.macro_sensitivity},
            ))

            # GDP → Country edges
            gdp_result = ci.gdp_impact
            for comp in gdp_result.components:
                if abs(comp.impact_score) >= 0.1:
                    comp_id = f"gdp_{comp.component.value}"
                    edges.append(RelationshipEdge(
                        source_id=comp_id,
                        target_id=country_id,
                        type=EdgeType.AFFECTS,
                        weight=abs(comp.impact_score),
                        label=LanguageVariant(en=f"affects {ci.country_code.value}", ar="يؤثر على"),
                    ))

            # Public sector node
            pub_id = f"public_{ci.country_code.value}"
            nodes.append(RelationshipNode(
                id=pub_id,
                type=NodeType.PUBLIC_SECTOR,
                label=LanguageVariant(
                    en=f"{ci.country_code.value} Public Sector",
                    ar=f"القطاع العام - {ci.country_code.value}",
                ),
                metadata={"spending_pressure": ci.public_sector.spending_pressure},
            ))
            edges.append(RelationshipEdge(
                source_id=country_id, target_id=pub_id,
                type=EdgeType.AFFECTS, weight=ci.public_sector.spending_pressure / 100,
                label=LanguageVariant(en="public sector impact", ar="تأثير القطاع العام"),
            ))

            # Private sector node
            priv_id = f"private_{ci.country_code.value}"
            nodes.append(RelationshipNode(
                id=priv_id,
                type=NodeType.PRIVATE_SECTOR,
                label=LanguageVariant(
                    en=f"{ci.country_code.value} Private Sector",
                    ar=f"القطاع الخاص - {ci.country_code.value}",
                ),
                metadata={"operating_pressure": ci.private_sector.operating_cost_pressure},
            ))
            edges.append(RelationshipEdge(
                source_id=country_id, target_id=priv_id,
                type=EdgeType.AFFECTS, weight=ci.private_sector.operating_cost_pressure / 100,
                label=LanguageVariant(en="private sector impact", ar="تأثير القطاع الخاص"),
            ))

            path.append(country_id)

        # ── 5. Sector nodes ───────────────────────────────
        for exp in sector_exposures.exposures:
            if exp.exposure_score < 30:
                continue
            sec_id = f"sector_{exp.sector_code.value}"
            nodes.append(RelationshipNode(
                id=sec_id,
                type=NodeType.SECTOR,
                label=LanguageVariant(
                    en=exp.sector_code.value.replace("_", " ").title(),
                    ar=exp.narrative.ar[:25] if exp.narrative.ar else exp.sector_code.value,
                ),
                metadata={"exposure_score": exp.exposure_score},
            ))
            # Connect GDP components → Sectors
            for gdp_comp in exp.gdp_linkage:
                comp_id = f"gdp_{gdp_comp.value}"
                if comp_id in gdp_node_ids:
                    edges.append(RelationshipEdge(
                        source_id=comp_id, target_id=sec_id,
                        type=EdgeType.PRESSURES, weight=exp.exposure_score / 100,
                        label=LanguageVariant(en=f"exposes {exp.sector_code.value.lower()}", ar="يعرّض"),
                    ))
            path.append(sec_id)

        # ── 6. Decision nodes ─────────────────────────────
        for dec in decisions:
            dec_id = f"decision_{dec.id}"
            nodes.append(RelationshipNode(
                id=dec_id,
                type=NodeType.DECISION,
                label=dec.title,
                metadata={"confidence": dec.confidence, "urgency": dec.priority.value},
            ))
            # Connect sectors → decisions
            for exp in sector_exposures.exposures[:4]:
                sec_id = f"sector_{exp.sector_code.value}"
                edges.append(RelationshipEdge(
                    source_id=sec_id, target_id=dec_id,
                    type=EdgeType.TRIGGERS, weight=dec.pressure.score / 100,
                    label=LanguageVariant(en="triggers decision", ar="يستدعي قراراً"),
                ))
            path.append(dec_id)

        return PropagationResult(
            nodes=nodes,
            edges=edges,
            propagation_path=path,
        )
