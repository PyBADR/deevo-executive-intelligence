from typing import List, Optional
from app.schemas.scenario import Scenario, ScenarioCreate
from app.models import scenarios_store
from datetime import datetime

class ScenariosService:
    @staticmethod
    def get_all_scenarios() -> List[Scenario]:
        return list(scenarios_store.values())
    
    @staticmethod
    def get_scenario_by_id(scenario_id: str) -> Optional[Scenario]:
        return scenarios_store.get(scenario_id)
    
    @staticmethod
    def create_scenario(scenario_data: ScenarioCreate) -> Scenario:
        scenario_id = f"scn_{len(scenarios_store) + 1}"
        new_scenario = Scenario(
            id=scenario_id,
            name=scenario_data.name,
            description=scenario_data.description,
            severity=scenario_data.severity,
            probability=scenario_data.probability,
            impact=scenario_data.impact,
            timeline=scenario_data.timeline,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        scenarios_store[scenario_id] = new_scenario
        return new_scenario
    
    @staticmethod
    def get_scenarios_by_severity(severity: str) -> List[Scenario]:
        return [s for s in scenarios_store.values() if s.severity == severity]
    
    @staticmethod
    def get_high_impact_scenarios() -> List[Scenario]:
        return [s for s in scenarios_store.values() if s.impact >= 0.7]
