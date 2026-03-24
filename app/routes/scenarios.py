from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.scenario import Scenario, ScenarioCreate, SeverityLevel
from app.models import scenarios_store

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("", response_model=List[Scenario])
async def list_scenarios():
    return list(scenarios_store.values())


@router.get("/{scenario_id}", response_model=Scenario)
async def get_scenario(scenario_id: str):
    if scenario_id not in scenarios_store:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenarios_store[scenario_id]


@router.post("", response_model=Scenario)
async def create_scenario(scenario: ScenarioCreate):
    scenario_id = f"scn_{len(scenarios_store) + 1}"
    from datetime import datetime
    new_scenario = Scenario(
        id=scenario_id,
        name=scenario.name,
        description=scenario.description,
        severity=scenario.severity,
        probability=scenario.probability,
        impact=scenario.impact,
        timeline=scenario.timeline,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    scenarios_store[scenario_id] = new_scenario
    return new_scenario
