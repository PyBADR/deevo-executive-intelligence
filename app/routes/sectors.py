from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.sector import Sector, SectorCreate
from app.models import sectors_store

router = APIRouter(prefix="/sectors", tags=["sectors"])

@router.get("", response_model=List[Sector])
async def list_sectors():
    return list(sectors_store.values())

@router.get("/{sector_code}", response_model=Sector)
async def get_sector(sector_code: str):
    if sector_code not in sectors_store:
        raise HTTPException(status_code=404, detail="Sector not found")
    return sectors_store[sector_code]

@router.post("", response_model=Sector)
async def create_sector(sector: SectorCreate):
    from datetime import datetime
    new_sector = Sector(
        sector_code=sector.sector_code,
        name=sector.name,
        description=sector.description,
        market_size=sector.market_size,
        growth_rate=sector.growth_rate,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    sectors_store[sector.sector_code] = new_sector
    return new_sector
