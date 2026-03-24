from typing import List, Dict, Any
from app.schemas.scenario import Scenario
from app.schemas.signal import Signal
from app.schemas.decision import Decision
from app.models import scenarios_store, signals_store, decisions_store
from datetime import datetime

class IntelligenceService:
    @staticmethod
    def get_executive_summary() -> Dict[str, Any]:
        return {
            "total_scenarios": len(scenarios_store),
            "total_signals": len(signals_store),
            "pending_decisions": len([d for d in decisions_store.values() if d.status == "PENDING"]),
            "critical_scenarios": len([s for s in scenarios_store.values() if s.severity == "CRITICAL"]),
            "generated_at": datetime.utcnow()
        }
    
    @staticmethod
    def correlate_signals_to_scenarios() -> Dict[str, List[str]]:
        correlation = {}
        for scenario_id, scenario in scenarios_store.items():
            related_signals = [s.id for s in signals_store.values() 
                             if s.severity == scenario.severity]
            correlation[scenario_id] = related_signals
        return correlation
    
    @staticmethod
    def get_risk_assessment() -> Dict[str, Any]:
        high_severity_scenarios = [s for s in scenarios_store.values() 
                                   if s.severity in ["CRITICAL", "HIGH"]]
        high_confidence_signals = [s for s in signals_store.values() 
                                   if s.confidence >= 0.8]
        
        return {
            "overall_risk": "HIGH" if high_severity_scenarios else "MEDIUM",
            "critical_scenarios_count": len(high_severity_scenarios),
            "high_confidence_signals_count": len(high_confidence_signals),
            "assessment_date": datetime.utcnow()
        }
    
    @staticmethod
    def get_recommended_actions() -> List[Dict[str, Any]]:
        critical_scenarios = [s for s in scenarios_store.values() if s.severity == "CRITICAL"]
        recommendations = []
        
        for scenario in critical_scenarios:
            recommendations.append({
                "scenario_id": scenario.id,
                "scenario_name": scenario.name,
                "recommended_action": f"Immediate review required for {scenario.name}",
                "priority": "URGENT"
            })
        
        return recommendations
