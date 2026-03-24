"""Scoring, risk, and KPI routes."""
from fastapi import APIRouter, HTTPException
from ..core.seed_data import SEED_SCENARIOS
from ..engines.intelligence_orchestrator import IntelligenceOrchestrator

router = APIRouter(tags=["scoring"])
orchestrator = IntelligenceOrchestrator()


def _find_scenario(scenario_id: str):
    for s in SEED_SCENARIOS:
        if s.id == scenario_id:
            return s
    raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")


@router.get("/scores/{scenario_id}")
async def get_scores(scenario_id: str):
    """Get composite scores for a scenario."""
    scenario = _find_scenario(scenario_id)
    result = orchestrator.run_extended(scenario)
    return result["scores"]


@router.get("/risks/{scenario_id}")
async def get_risks(scenario_id: str):
    """Get risk register for a scenario."""
    scenario = _find_scenario(scenario_id)
    result = orchestrator.run_extended(scenario)
    return result["risk_register"]


@router.get("/kpis/{scenario_id}")
async def get_kpis(scenario_id: str):
    """Get full KPI dashboard for a scenario."""
    scenario = _find_scenario(scenario_id)
    result = orchestrator.run_extended(scenario)
    return result["kpi_dashboard"]


@router.get("/dependency/{scenario_id}")
async def get_dependency(scenario_id: str):
    """Get cross-GCC dependency analysis."""
    scenario = _find_scenario(scenario_id)
    result = orchestrator.run_extended(scenario)
    return result["dependency_analysis"]


@router.get("/snapshot/executive/{scenario_id}")
async def get_executive_snapshot(scenario_id: str):
    """Get complete executive intelligence snapshot."""
    scenario = _find_scenario(scenario_id)
    return orchestrator.run_extended(scenario)
