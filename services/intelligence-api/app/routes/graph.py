"""Graph routes — propagation graph and relationships."""
from fastapi import APIRouter, HTTPException
from ..core.seed_data import SEED_SCENARIOS
from ..engines.intelligence_orchestrator import IntelligenceOrchestrator

router = APIRouter(prefix="/graph", tags=["graph"])
orchestrator = IntelligenceOrchestrator()


@router.get("/propagation/{scenario_id}")
async def get_propagation_graph(scenario_id: str):
    """Get the propagation graph for a scenario."""
    scenario = None
    for s in SEED_SCENARIOS:
        if s.id == scenario_id:
            scenario = s
            break
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
    result = orchestrator.run(scenario)
    return result.graph


@router.get("/relationships")
async def get_relationships():
    """Get full relationship graph for the default scenario."""
    if not SEED_SCENARIOS:
        raise HTTPException(status_code=404, detail="No scenarios")
    result = orchestrator.run(SEED_SCENARIOS[0])
    return result.graph
