from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from app.models import init_mock_data
from app.routes import (
    scenarios, countries, sectors, gdp,
    signals, decisions, narratives, graphs, sources, kpis
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup/shutdown"""
    # Startup
    init_mock_data()
    print("Mock data initialized")
    yield
    # Shutdown
    print("Application shutting down")


# Create FastAPI application instance
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_credentials,
    allow_methods=settings.cors_methods,
    allow_headers=settings.cors_headers,
)

# Include routers
app.include_router(scenarios.router, prefix=f"{settings.api_prefix}/scenarios", tags=["scenarios"])
app.include_router(countries.router, prefix=f"{settings.api_prefix}/countries", tags=["countries"])
app.include_router(sectors.router, prefix=f"{settings.api_prefix}/sectors", tags=["sectors"])
app.include_router(gdp.router, prefix=f"{settings.api_prefix}/gdp", tags=["gdp"])
app.include_router(signals.router, prefix=f"{settings.api_prefix}/signals", tags=["signals"])
app.include_router(decisions.router, prefix=f"{settings.api_prefix}/decisions", tags=["decisions"])
app.include_router(narratives.router, prefix=f"{settings.api_prefix}/narratives", tags=["narratives"])
app.include_router(graphs.router, prefix=f"{settings.api_prefix}/graphs", tags=["graphs"])
app.include_router(sources.router, prefix=f"{settings.api_prefix}/sources", tags=["sources"])
app.include_router(kpis.router, prefix=f"{settings.api_prefix}/kpis", tags=["kpis"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Deevo Executive Intelligence API", "version": settings.app_version}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
