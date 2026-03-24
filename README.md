# Deevo Executive Intelligence

**Sovereign-Grade GCC Economic Intelligence Platform**

Built by **Bader Alabddan** · [GitHub: PyBADR](https://github.com/PyBADR) · Discord: Baderalabddan

---

## What Is This

Deevo Executive Intelligence is a deterministic AI decision platform that analyzes global economic scenarios and computes their impact across 6 GCC countries, 20 industry sectors, and 5 GDP components. Every score, risk assessment, and recommendation is traceable through a 12-stage intelligence pipeline — zero hallucination, zero fabricated data.

This is not a dashboard. This is a **decision interface** for sovereign wealth funds, insurance executives, and government economic advisors.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Executive Dashboard                        │
│                  Next.js 14 + TypeScript                     │
│                                                               │
│  Command Center │ Country │ Sector │ Decisions │ Narrative    │
│  Alert Center   │ SaaS Packaging Layer                       │
├─────────────────────────────────────────────────────────────┤
│                      FastAPI Backend                          │
│              37 endpoints · Pydantic v2 schemas               │
├─────────────────────────────────────────────────────────────┤
│              12-Stage Intelligence Pipeline                   │
│                                                               │
│  Scenario → Macro → GDP → Country → Sector → Decision →     │
│  Explanation → Graph → Scoring → Risk → KPI → Narrative      │
├─────────────────────────────────────────────────────────────┤
│               Data Layer: PostgreSQL + GRDB                  │
│           SHA-256 audit trails · Multi-tenant ready          │
└─────────────────────────────────────────────────────────────┘
```

## Intelligence Pipeline (12 Stages)

| Stage | What It Does | Output |
|-------|-------------|--------|
| 1. Scenario | Ingests global economic events (tariffs, oil shocks, sanctions) | ScenarioResponse |
| 2. Macro | Computes macroeconomic transmission signals | MacroSignals |
| 3. GDP | Models impact on 5 GDP components per country | GDPImpactResult[] |
| 4. Country | Assesses 6 GCC countries with public/private sector split | CountryImpact[] |
| 5. Sector | Evaluates 20 sectors across 4 criticality tiers | SectorExposureResult |
| 6. Decision | Generates prioritized executive recommendations | DecisionRecommendation[] |
| 7. Explanation | Adds full reasoning chains (what/why/who/rationale) | ExplainedDecision[] |
| 8. Graph | Maps entity relationships and dependency networks | GraphRelationships |
| 9. Scoring | Computes composite intelligence score | CompositeScore |
| 10. Risk | Evaluates risk register with severity classification | RiskRegister |
| 11. KPI | Derives executive, country, and sector KPIs | KPIDashboard |
| 12. Narrative | Produces bilingual intelligence briefing | NarrativeBrief |

## GCC Coverage

- **Saudi Arabia (SA)** — Vision 2030 alignment, oil dependency, sovereign wealth
- **United Arab Emirates (AE)** — Diversification leadership, financial hub exposure
- **Kuwait (KW)** — Oil concentration, fiscal reserves sensitivity
- **Qatar (QA)** — LNG dominance, mega-event infrastructure
- **Bahrain (BH)** — Financial services concentration, fiscal vulnerability
- **Oman (OM)** — Fiscal reform trajectory, oil transition pressure

## Sector Model (4-Tier, 20-Sector)

- **Tier 1 — Critical Sovereign**: Energy, defense, healthcare, utilities, government services
- **Tier 2 — Financial & Economic**: Banking, insurance, real estate, capital markets, Islamic finance
- **Tier 3 — Market & Growth**: Retail, logistics, tourism, food & agriculture, manufacturing
- **Tier 4 — Future & Strategic**: Technology, education, media, professional services, telecommunications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python, Pydantic v2 |
| Database | PostgreSQL, GRDB 7.x |
| Pipeline | Deterministic 12-stage (no LLM in pipeline) |
| AI Agent | LangGraph, Ollama (Mac M4 Max GPU) |
| Deployment | Docker Compose (15 services), Vercel (frontend) |
| Audit | SHA-256 trails, human-in-the-loop governance |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend

```bash
cd services/intelligence-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd apps/executive-dashboard
npm install
cp .env.example .env.local
# Edit .env.local to set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Command Center | `/command-center` | Executive decision interface with score banner, KPI strip, decision queue, alerts |
| Country Intelligence | `/country` | 6 GCC countries with public/private split, GDP impact, sector linkage |
| Sector Intelligence | `/sector` | 4-tier, 20-sector exposure framework with criticality scoring |
| Decision Drilldown | `/decisions` | Full reasoning chains with urgency filters and pressure scoring |
| Executive Brief | `/narrative` | Plain-language intelligence briefing for government/investor audiences |
| Alert Center | `/alerts` | Real-time threshold monitoring with acknowledge/mute and severity filters |

## API Endpoints (37)

The FastAPI backend exposes endpoints for every pipeline stage:

- `POST /scenarios` — Submit new economic scenario
- `GET /scenarios/live` — List active scenarios
- `GET /snapshot/executive/{id}` — Full executive snapshot
- `GET /scores/{id}` — Composite intelligence score
- `GET /risks/{id}` — Risk register
- `GET /kpis/{id}` — KPI dashboard
- `GET /decisions` — Decision recommendations
- `GET /countries` — Country impact assessments
- `GET /sectors/exposure` — Sector exposure results
- `POST /ingestion/run` — Trigger pipeline ingestion
- `GET /ingestion/status` — Pipeline status
- `GET /health` — Service health check

## Design System

The frontend uses a premium dark executive theme:

- **Base**: `#060a14` deep navy background
- **Surface**: `#0c1222` card backgrounds
- **Gold accent**: `#d4a853` for classification markers
- **Typography**: Display (2.5rem), Headline (1.75rem), Metric (1.5rem)
- **Cards**: Glass-morphic with hover glow transitions
- **Alerts**: Severity-glow effects (critical/high/medium)
- **Animations**: Staggered fade-in, pressure bar fill, pulse effects

## SaaS Editions

| Edition | Price | Target |
|---------|-------|--------|
| Sovereign | $2,500/mo | Insurance companies, family offices |
| Enterprise | $12,000/mo | Sovereign wealth funds, central banks |
| Government | Custom | Ministries, regulators |

## Compliance

- **PDPL** (Saudi Personal Data Protection Law) — Data sovereignty ready
- **IFRS 17** — Insurance contract standards alignment
- **Multi-tenant** — Data isolation architecture
- **Audit trails** — SHA-256 hashed decision provenance

## Project Structure

```
deevo-executive-intelligence/
├── apps/
│   └── executive-dashboard/     # Next.js 14 frontend
│       ├── src/
│       │   ├── app/             # Pages (App Router)
│       │   ├── components/      # Dashboard + layout + card components
│       │   ├── config/          # Branding, navigation, alerts, SaaS, API
│       │   ├── lib/             # API client, hooks, context, alert engine
│       │   ├── types/           # TypeScript contracts (mirrors Pydantic)
│       │   └── styles/          # Global CSS + design tokens
│       └── next.config.js
├── services/
│   └── intelligence-api/        # FastAPI backend
│       ├── app/
│       │   ├── main.py
│       │   ├── routers/         # API route handlers
│       │   ├── schemas/         # Pydantic v2 models
│       │   ├── services/        # Business logic
│       │   └── pipeline/        # 12-stage intelligence engine
│       └── requirements.txt
├── docker-compose.yml
└── README.md
```

## License

Proprietary — Deevo Analytics. All rights reserved.

---

**Built by Bader Alabddan** · Deevo Analytics · Sovereign-Grade Decision Intelligence for GCC Markets
