"""
Ingestion Routes — Live scenario generation from RSS feeds.

Endpoints:
  POST /ingestion/run       — Execute one ingestion cycle
  GET  /ingestion/status     — Current ingestion system state
  GET  /scenarios/live       — Live scenarios from last ingestion run
"""
from fastapi import APIRouter

from ..services.scheduler import IngestionScheduler
from ..schemas.ingestion import IngestionRunResult, IngestionStatusResponse

router = APIRouter(tags=["ingestion"])

# Singleton scheduler instance — shared across requests
_scheduler = IngestionScheduler()


@router.post("/ingestion/run", response_model=IngestionRunResult)
async def run_ingestion():
    """
    Execute one full ingestion cycle:
    RSS → Normalize → Cluster → Deduplicate → ScenarioInput → Full Pipeline.

    Returns run statistics including feeds fetched, items processed,
    clusters formed, scenarios generated, and any errors.
    """
    result = _scheduler.run_once()
    return result


@router.get("/ingestion/status", response_model=IngestionStatusResponse)
async def get_ingestion_status():
    """
    Current state of the ingestion system.

    Returns: status (idle/running/completed/failed), last run result,
    total runs, total scenarios generated, active feeds, cache size.
    """
    return _scheduler.status


@router.get("/scenarios/live")
async def get_live_scenarios():
    """
    Live scenarios generated from the most recent ingestion run.

    Each scenario includes:
    - scenario_type (category)
    - severity
    - affected countries
    - linked sectors
    - confidence
    - sources (feed names)
    - explanation (from pipeline)

    Returns empty list if no ingestion has been run yet.
    """
    scenarios = _scheduler.last_scenarios
    outputs = _scheduler.last_outputs

    live_results = []
    for i, scenario in enumerate(scenarios):
        output = outputs[i] if i < len(outputs) else None

        live_entry = {
            "scenario_id": scenario.id,
            "title": scenario.title.model_dump(),
            "scenario_type": scenario.category.value,
            "severity": scenario.severity.value,
            "affected_countries": [c.value for c in scenario.affected_countries],
            "linked_sectors": [s.value for s in scenario.affected_sectors],
            "confidence": scenario.confidence,
            "source_count": scenario.source_count,
            "created_at": scenario.created_at,
        }

        if output:
            # Attach pipeline summary
            live_entry["pipeline"] = {
                "overall_score": output.get("scores", {}).get("overall_score"),
                "aggregate_risk_score": output.get("risk_register", {}).get("aggregate_risk_score"),
                "decisions_count": len(output.get("decisions", [])),
                "sectors_exposed": len(output.get("sector_exposures", {}).get("exposures", [])),
                "macro_stress": output.get("macro_signals", {}).get("overall_stress"),
                "narrative_title": output.get("narrative", {}).get("title", {}).get("en", ""),
            }

        live_results.append(live_entry)

    return {
        "count": len(live_results),
        "source": "live_ingestion",
        "scenarios": live_results,
    }
