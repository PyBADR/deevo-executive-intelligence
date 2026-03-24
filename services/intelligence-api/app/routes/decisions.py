"""Decision routes — explainable decision recommendations."""
from fastapi import APIRouter, HTTPException
from ..core.seed_data import SEED_SCENARIOS
from ..engines.intelligence_orchestrator import IntelligenceOrchestrator

router = APIRouter(prefix="/decisions", tags=["decisions"])
orchestrator = IntelligenceOrchestrator()


@router.get("")
async def get_decisions():
    """Get decisions for the default scenario via full pipeline."""
    if not SEED_SCENARIOS:
        raise HTTPException(status_code=404, detail="No scenarios")
    result = orchestrator.run(SEED_SCENARIOS[0])
    return result.decisions
