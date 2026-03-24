from fastapi import APIRouter
from app.routes.scenarios import router as scenarios_router
from app.routes.countries import router as countries_router
from app.routes.sectors import router as sectors_router
from app.routes.gdp import router as gdp_router
from app.routes.signals import router as signals_router
from app.routes.decisions import router as decisions_router
from app.routes.narratives import router as narratives_router
from app.routes.graphs import router as graphs_router
from app.routes.sources import router as sources_router
from app.routes.kpis import router as kpis_router

api_router = APIRouter()

api_router.include_router(scenarios_router)
api_router.include_router(countries_router)
api_router.include_router(sectors_router)
api_router.include_router(gdp_router)
api_router.include_router(signals_router)
api_router.include_router(decisions_router)
api_router.include_router(narratives_router)
api_router.include_router(graphs_router)
api_router.include_router(sources_router)
api_router.include_router(kpis_router)
