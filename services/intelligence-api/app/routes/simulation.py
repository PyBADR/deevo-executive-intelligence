"""Simulation routes — policy, geopolitics, supply chain, aviation, oil, financial."""
from fastapi import APIRouter
from ..services.policy_simulator import PolicySimulator, PolicyInput
from ..services.geopolitics_engine import GeopoliticsEngine, GeopoliticalInput
from ..services.supply_chain_engine import SupplyChainEngine, RouteDisruptionInput
from ..services.aviation_simulator import AviationSimulator, AviationShockInput
from ..services.oil_gdp_engine import OilGDPEngine, OilShockInput
from ..services.financial_contagion_engine import FinancialContagionEngine, FinancialShockInput
from ..engines.intelligence_orchestrator import IntelligenceOrchestrator

router = APIRouter(prefix="/simulate", tags=["simulation"])
orchestrator = IntelligenceOrchestrator()
policy_sim = PolicySimulator()
geo_engine = GeopoliticsEngine()
supply_engine = SupplyChainEngine()
aviation_sim = AviationSimulator()
oil_engine = OilGDPEngine()
financial_engine = FinancialContagionEngine()


@router.post("/policy")
async def simulate_policy(input: PolicyInput):
    """Simulate policy impact → generate scenario → run full pipeline."""
    result = policy_sim.run(input)
    pipeline = orchestrator.run_extended(result.generated_scenario)
    return {"simulation": result.model_dump(), "intelligence": pipeline}


@router.post("/geopolitics")
async def simulate_geopolitics(input: GeopoliticalInput):
    """Simulate geopolitical event → full pipeline."""
    result = geo_engine.run(input)
    pipeline = orchestrator.run_extended(result.generated_scenario)
    return {"simulation": result.model_dump(), "intelligence": pipeline}


@router.post("/supply-chain")
async def simulate_supply_chain(input: RouteDisruptionInput):
    """Simulate supply chain disruption → full pipeline."""
    result = supply_engine.run(input)
    pipeline = orchestrator.run_extended(result.generated_scenario)
    return {"simulation": result.model_dump(), "intelligence": pipeline}


@router.post("/aviation")
async def simulate_aviation(input: AviationShockInput):
    """Simulate aviation shock → full pipeline."""
    result = aviation_sim.run(input)
    pipeline = orchestrator.run_extended(result.generated_scenario)
    return {"simulation": result.model_dump(), "intelligence": pipeline}


@router.post("/oil-gdp")
async def simulate_oil_gdp(input: OilShockInput):
    """Simulate oil price shock → sovereign impact → full pipeline."""
    result = oil_engine.run(input)
    pipeline = orchestrator.run_extended(result.generated_scenario)
    return {"simulation": result.model_dump(), "intelligence": pipeline}


@router.post("/financial-contagion")
async def simulate_financial(input: FinancialShockInput):
    """Simulate financial contagion → full pipeline."""
    result = financial_engine.run(input)
    pipeline = orchestrator.run_extended(result.generated_scenario)
    return {"simulation": result.model_dump(), "intelligence": pipeline}
