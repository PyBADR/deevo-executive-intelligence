from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class SectorCode(str, Enum):
    ENERGY = "energy"
    FINANCE = "finance"
    HEALTHCARE = "healthcare"
    TECHNOLOGY = "technology"
    RETAIL = "retail"
    REAL_ESTATE = "real_estate"
    MANUFACTURING = "manufacturing"
    AGRICULTURE = "agriculture"


class SectorBase(BaseModel):
    code: SectorCode
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    growth_rate: float = Field(ge=-100.0, le=100.0)
    market_size: float = Field(ge=0.0)
    employment_count: int = Field(ge=0)


class SectorCreate(SectorBase):
    pass


class Sector(SectorBase):
    id: str = Field(..., alias="sector_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
