# Deevo Executive Intelligence Backend

A FastAPI-based backend service for executive intelligence and decision support.

## Features

- RESTful API endpoints for scenarios, countries, sectors, GDP data, signals, decisions, narratives, graphs, sources, and KPIs
- In-memory data storage for development and testing
- Comprehensive data validation using Pydantic v2
- Async/await support for high-performance request handling
- CORS middleware for cross-origin requests
- Startup data loading for sample data
- Health check endpoint

## Project Structure

```
app/
├── __init__.py          # FastAPI application factory
├── config.py            # Configuration settings
├── models.py            # In-memory data stores
├── schemas/             # Pydantic data models
│   ├── scenario.py
│   ├── country.py
│   ├── sector.py
│   ├── gdp.py
│   ├── signal.py
│   ├── decision.py
│   ├── narrative.py
│   ├── graph.py
│   ├── source.py
│   ├── kpi.py
│   └── __init__.py
├── routes/              # API endpoint handlers
│   ├── scenarios.py
│   ├── countries.py
│   ├── sectors.py
│   ├── gdp.py
│   ├── signals.py
│   ├── decisions.py
│   ├── narratives.py
│   ├── graphs.py
│   ├── sources.py
│   ├── kpis.py
│   └── __init__.py
├── services/            # Business logic layer
│   ├── scenarios_service.py
│   ├── intelligence_service.py
│   ├── data_service.py
│   └── __init__.py
└── tests/               # Unit tests

main.py                 # Application entry point
requirements.txt        # Python dependencies
.env                   # Environment variables
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Interactive API documentation is available at `http://localhost:8000/docs`

## Available Endpoints

- `/api/v1/scenarios` - Scenario management
- `/api/v1/countries` - Country data
- `/api/v1/sectors` - Sector information
- `/api/v1/gdp` - GDP records
- `/api/v1/signals` - Intelligence signals
- `/api/v1/decisions` - Decision tracking
- `/api/v1/narratives` - Narrative content
- `/api/v1/graphs` - Graph specifications
- `/api/v1/sources` - Information sources
- `/api/v1/kpis` - Key performance indicators
- `/health` - Health check endpoint
