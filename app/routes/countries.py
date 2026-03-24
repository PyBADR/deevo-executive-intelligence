from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.country import Country, CountryCreate
from app.models import countries_store

router = APIRouter(prefix="/countries", tags=["countries"])

@router.get("", response_model=List[Country])
async def list_countries():
    return list(countries_store.values())

@router.get("/{country_code}", response_model=Country)
async def get_country(country_code: str):
    if country_code not in countries_store:
        raise HTTPException(status_code=404, detail="Country not found")
    return countries_store[country_code]

@router.post("", response_model=Country)
async def create_country(country: CountryCreate):
    from datetime import datetime
    new_country = Country(
        country_code=country.country_code,
        name=country.name,
        region=country.region,
        stability_index=country.stability_index,
        political_risk=country.political_risk,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    countries_store[country.country_code] = new_country
    return new_country
