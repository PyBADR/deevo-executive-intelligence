"""
Deevo Intelligence API — FastAPI application.

GCC Executive Economic Intelligence Platform.
12-stage intelligence pipeline with scoring, risk, KPIs, dependency analysis,
and simulation capabilities (policy, geopolitics, supply chain, aviation, oil, financial).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routes import (
    health_router, scenarios_router, intelligence_router,
    countries_router, sectors_router, decisions_router,
    graph_router, narratives_router, scoring_router,
    simulation_router, ingestion_router,
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "GCC Executive Economic Intelligence API. "
        "Deterministic, explainable, sovereign-grade intelligence pipeline: "
        "Scenarios → Macro Signals → GDP Impact → Country Impact (Public/Private) → "
        "4-Tier Sector Exposure → Decisions → Explanations → Graph → "
        "Scoring → Risk Register → KPIs → GCC Dependency Analysis → Narrative."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(health_router)
app.include_router(scenarios_router)
app.include_router(intelligence_router)
app.include_router(countries_router)
app.include_router(sectors_router)
app.include_router(decisions_router)
app.include_router(graph_router)
app.include_router(narratives_router)
app.include_router(scoring_router)
app.include_router(simulation_router)
app.include_router(ingestion_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "pipeline": [
            "1. Scenario Engine → Macro Signals",
            "2. GDP Engine → Component Impacts (per country)",
            "3. Country Engine → Public/Private Split",
            "4. Sector Engine → 4-Tier Exposure (20 sectors)",
            "5. Decision Engine → Recommendations",
            "6. Explanation Engine → Structured Reasoning",
            "7. Graph Engine → Propagation Graph",
            "8. Scoring Engine → Composite Scores",
            "9. Risk Engine → Risk Register",
            "10. KPI Engine → Executive/Country/Sector KPIs",
            "11. GCC Dependency Engine → Cross-Country Spillovers",
            "12. Narrative Engine → Executive Brief",
        ],
        "simulation": [
            "POST /simulate/policy — Policy impact simulation",
            "POST /simulate/geopolitics — Geopolitical event analysis",
            "POST /simulate/supply-chain — Supply chain disruption modeling",
            "POST /simulate/aviation — Aviation shock simulation",
            "POST /simulate/oil-gdp — Oil → GDP → Budget engine",
            "POST /simulate/financial-contagion — Financial contagion modeling",
        ],
        "endpoints": {
            "scenarios": "/scenarios",
            "intelligence": "/intelligence/run/{scenario_id}",
            "countries": "/countries/{country_code}",
            "sectors": "/sectors/exposure",
            "decisions": "/decisions",
            "graph": "/graph/relationships",
            "narratives": "/narratives/{scenario_id}",
            "scores": "/scores/{scenario_id}",
            "risks": "/risks/{scenario_id}",
            "kpis": "/kpis/{scenario_id}",
            "dependency": "/dependency/{scenario_id}",
            "executive_snapshot": "/snapshot/executive/{scenario_id}",
            "docs": "/docs",
        },
        "ingestion": {
            "run": "POST /ingestion/run — Execute RSS ingestion cycle",
            "status": "GET /ingestion/status — Ingestion system state",
            "live_scenarios": "GET /scenarios/live — Live generated scenarios",
        },
    }
