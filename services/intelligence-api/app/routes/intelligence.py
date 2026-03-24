"""Intelligence route — runs the full pipeline for a scenario."""
from fastapi import APIRouter, HTTPException
from ..core.seed_data import SEED_SCENARIOS
from ..engines.intelligence_orchestrator import IntelligenceOrchestrator

router = APIRouter(prefix="/intelligence", tags=["intelligence"])
orchestrator = IntelligenceOrchestrator()


@router.get("/run/{scenario_id}")
async def run_intelligence(scenario_id: str):
    """Execute the full intelligence pipeline for a scenario."""
    scenario = None
    for s in SEED_SCENARIOS:
        if s.id == scenario_id:
            scenario = s
            break
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")

    result = orchestrator.run(scenario)
    return result


@router.get("/run")
async def run_default_intelligence():
    """Run the pipeline for the first (default) scenario."""
    if not SEED_SCENARIOS:
        raise HTTPException(status_code=404, detail="No scenarios available")
    return orchestrator.run(SEED_SCENARIOS[0])
