from typing import Dict, Any
from datetime import datetime
from app.models import (
    scenarios_store, countries_store, sectors_store, gdp_store,
    signals_store, decisions_store, narratives_store, graphs_store,
    sources_store, kpis_store
)
from app.schemas.scenario import Scenario, SeverityLevel
from app.schemas.country import Country, GCCCountryCode
from app.schemas.sector import Sector, SectorCode
from app.schemas.signal import Signal, SignalType
from app.schemas.decision import Decision, DecisionStatus
from app.schemas.kpi import KPI

class DataService:
    @staticmethod
    def load_sample_data() -> Dict[str, int]:
        """Load sample data into all stores"""
        count = 0
        
        # Load sample scenarios
        scenarios_store["scn_1"] = Scenario(
            id="scn_1",
            name="Geopolitical Tension Escalation",
            description="Rising tensions in Middle East region",
            severity=SeverityLevel.HIGH,
            probability=0.65,
            impact=0.8,
            timeline="Q2 2026",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        count += 1
        
        # Load sample countries
        countries_store["SA"] = Country(
            country_code=GCCCountryCode.SA,
            name="Saudi Arabia",
            region="Middle East",
            stability_index=0.65,
            political_risk=0.45,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        count += 1
        
        # Load sample sectors
        sectors_store["ENERGY"] = Sector(
            sector_code=SectorCode.ENERGY,
            name="Energy",
            description="Oil, gas, and renewable energy sector",
            market_size=2500000000000,
            growth_rate=0.035,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        count += 1
        
        # Load sample signals
        signals_store["sig_1"] = Signal(
            id="sig_1",
            signal_type=SignalType.GEOPOLITICAL,
            title="Regional Tensions Rise",
            description="Increased military activity reported",
            severity=SeverityLevel.HIGH,
            confidence=0.85,
            source="NEWS",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        count += 1
        
        # Load sample decisions
        decisions_store["dec_1"] = Decision(
            id="dec_1",
            title="Strategic Portfolio Adjustment",
            description="Review energy sector exposure",
            status=DecisionStatus.PENDING,
            priority="HIGH",
            owner="Executive Team",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        count += 1
        
        # Load sample KPIs
        kpis_store["kpi_1"] = KPI(
            id="kpi_1",
            name="Market Volatility Index",
            description="Measure of market stability",
            current_value=32.5,
            target_value=25.0,
            unit="points",
            category="Market",
            trend="INCREASING",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        count += 1
        
        return {"total_records_loaded": count}
    
    @staticmethod
    def get_data_summary() -> Dict[str, int]:
        """Get summary of all stored data"""
        return {
            "scenarios": len(scenarios_store),
            "countries": len(countries_store),
            "sectors": len(sectors_store),
            "gdp_records": len(gdp_store),
            "signals": len(signals_store),
            "decisions": len(decisions_store),
            "narratives": len(narratives_store),
            "graphs": len(graphs_store),
            "sources": len(sources_store),
            "kpis": len(kpis_store)
        }
    
    @staticmethod
    def clear_all_data() -> Dict[str, str]:
        """Clear all data stores"""
        scenarios_store.clear()
        countries_store.clear()
        sectors_store.clear()
        gdp_store.clear()
        signals_store.clear()
        decisions_store.clear()
        narratives_store.clear()
        graphs_store.clear()
        sources_store.clear()
        kpis_store.clear()
        
        return {"status": "All data cleared"}
