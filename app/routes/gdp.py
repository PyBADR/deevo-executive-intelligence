from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.gdp import GDP, GDPCreate
from app.models import gdp_store

router = APIRouter(prefix="/gdp", tags=["gdp"])

@router.get("", response_model=List[GDP])
async def list_gdp():
    return list(gdp_store.values())

@router.get("/{gdp_id}", response_model=GDP)
async def get_gdp(gdp_id: str):
    if gdp_id not in gdp_store:
        raise HTTPException(status_code=404, detail="GDP record not found")
    return gdp_store[gdp_id]

@router.post("", response_model=GDP)
async def create_gdp(gdp: GDPCreate):
    from datetime import datetime
    gdp_id = f"gdp_{len(gdp_store) + 1}"
    new_gdp = GDP(
        id=gdp_id,
        country_code=gdp.country_code,
        year=gdp.year,
        gdp_value=gdp.gdp_value,
        gdp_per_capita=gdp.gdp_per_capita,
        growth_rate=gdp.growth_rate,
        currency=gdp.currency,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    gdp_store[gdp_id] = new_gdp
    return new_gdp
