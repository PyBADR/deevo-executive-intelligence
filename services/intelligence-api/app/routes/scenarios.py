"""Scenario routes — list, get, and create scenarios."""
from fastapi import APIRouter, HTTPException
from ..core.seed_data import SEED_SCENARIOS

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("")
async def list_scenarios():
    return [s.model_dump() for s in SEED_SCENARIOS]


@router.get("/{scenario_id}")
async def get_scenario(scenario_id: str):
    for s in SEED_SCENARIOS:
        if s.id == scenario_id:
            return s.model_dump()
    raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")
