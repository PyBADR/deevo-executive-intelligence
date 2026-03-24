"""Country routes — GCC country intelligence."""
from fastapi import APIRouter, HTTPException
from ..schemas.scenario import GCCCountryCode
from ..core.seed_data import SEED_SCENARIOS
from ..engines.scenario_engine import ScenarioEngine
from ..engines.gdp_engine import GDPEngine
from ..engines.country_engine import CountryEngine

router = APIRouter(prefix="/countries", tags=["countries"])

scenario_engine = ScenarioEngine()
gdp_engine = GDPEngine()
country_engine = CountryEngine()


@router.get("")
async def list_countries():
    return [c.value for c in GCCCountryCode]


@router.get("/{country_code}")
async def get_country_intelligence(country_code: str):
    """Get country intelligence using the default scenario."""
    try:
        cc = GCCCountryCode(country_code.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid country code: {country_code}")

    if not SEED_SCENARIOS:
        raise HTTPException(status_code=404, detail="No scenarios")

    scenario = SEED_SCENARIOS[0]
    macro = scenario_engine.run(scenario)
    gdp = gdp_engine.run(macro, [cc])
    impacts = country_engine.run(macro, gdp, [cc])

    if impacts:
        return impacts[0].model_dump()
    raise HTTPException(status_code=404, detail=f"No intelligence for {country_code}")
