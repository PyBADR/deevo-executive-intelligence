"""Sector routes — cross-sector exposure analysis."""
from fastapi import APIRouter, HTTPException
from ..schemas.scenario import SectorCode
from ..core.seed_data import SEED_SCENARIOS
from ..engines.scenario_engine import ScenarioEngine
from ..engines.sector_engine import SectorEngine

router = APIRouter(prefix="/sectors", tags=["sectors"])

scenario_engine = ScenarioEngine()
sector_engine = SectorEngine()


@router.get("")
async def list_sectors():
    return [s.value for s in SectorCode]


@router.get("/exposure")
async def get_sector_exposure():
    """Get sector exposure for the default scenario."""
    if not SEED_SCENARIOS:
        raise HTTPException(status_code=404, detail="No scenarios")
    scenario = SEED_SCENARIOS[0]
    macro = scenario_engine.run(scenario)
    result = sector_engine.run(macro, scenario.id)
    return result.model_dump()
