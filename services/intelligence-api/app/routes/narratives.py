"""Narrative routes — bilingual intelligence narratives."""
from fastapi import APIRouter, HTTPException
from ..core.seed_data import SEED_SCENARIOS
from ..engines.intelligence_orchestrator import IntelligenceOrchestrator

router = APIRouter(prefix="/narratives", tags=["narratives"])
orchestrator = IntelligenceOrchestrator()


@router.get("")
async def get_narratives():
    """Get narratives for all scenarios."""
    narratives = []
    for scenario in SEED_SCENARIOS:
        result = orchestrator.run(scenario)
        narratives.append(result.narrative)
    return narratives


@router.get("/{scenario_id}")
async def get_narrative(scenario_id: str):
    """Get narrative for a specific scenario."""
    scenario = None
    for s in SEED_SCENARIOS:
        if s.id == scenario_id:
            scenario = s
            break
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
    result = orchestrator.run(scenario)
    return result.narrative
