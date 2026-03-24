from typing import Dict, List, Any

# In-memory data stores
scenarios_db: Dict[str, Any] = {}
countries_db: Dict[str, Any] = {}
sectors_db: Dict[str, Any] = {}
gdp_data_db: Dict[str, Any] = {}
signals_db: Dict[str, Any] = {}
decisions_db: Dict[str, Any] = {}
narratives_db: Dict[str, Any] = {}
graphs_db: Dict[str, Any] = {}
sources_db: Dict[str, Any] = {}
kpis_db: Dict[str, Any] = {}

def init_mock_data():
    """Initialize with mock data on startup"""
    global scenarios_db, countries_db, sectors_db, gdp_data_db, signals_db
    global decisions_db, narratives_db, graphs_db, sources_db, kpis_db
    
    scenarios_db = {
        "scenario_1": {
            "id": "scenario_1",
            "name": "Global Economic Expansion 2026",
            "description": "Optimistic growth scenario",
            "probability": 0.65
        }
    }
    
    countries_db = {
        "US": {
            "code": "US",
            "name": "United States",
            "region": "North America"
        },
        "CN": {
            "code": "CN",
            "name": "China",
            "region": "Asia"
        }
    }
    
    sectors_db = {
        "TECH": {
            "code": "TECH",
            "name": "Technology",
            "description": "Software and IT services"
        },
        "FIN": {
            "code": "FIN",
            "name": "Finance",
            "description": "Banking and financial services"
        }
    }
    
    gdp_data_db = {
        "US_2026": {
            "country_code": "US",
            "year": 2026,
            "gdp_usd_trillion": 31.4,
            "growth_rate": 0.025
        }
    }
    
    signals_db = {
        "signal_1": {
            "id": "signal_1",
            "name": "Tech IPO Activity",
            "severity": "high",
            "confidence": 0.85
        }
    }
    
    decisions_db = {
        "decision_1": {
            "id": "decision_1",
            "title": "Invest in AI startups",
            "status": "approved",
            "priority": 1
        }
    }
    
    narratives_db = {
        "narrative_1": {
            "id": "narrative_1",
            "title": "Tech sector transformation",
            "content": "Analysis of AI disruption",
            "scenario_id": "scenario_1"
        }
    }
    
    graphs_db = {
        "graph_1": {
            "id": "graph_1",
            "title": "GDP Growth Trends",
            "type": "line",
            "data_points": 12
        }
    }
    
    sources_db = {
        "source_1": {
            "id": "source_1",
            "title": "Bloomberg Intelligence Report",
            "url": "https://example.com/report",
            "credibility": 0.95
        }
    }
    
    kpis_db = {
        "kpi_1": {
            "id": "kpi_1",
            "name": "Market Volatility Index",
            "current_value": 18.5,
            "target_value": 15.0
        }
    }
