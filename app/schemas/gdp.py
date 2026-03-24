from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GDPBase(BaseModel):
    country_code: str = Field(..., min_length=2, max_length=2)
    year: int = Field(ge=1900, le=2100)
    gdp_value: float = Field(gt=0.0)
    gdp_per_capita: float = Field(gt=0.0)
    growth_rate: float = Field(ge=-100.0, le=100.0)
    currency: str = Field(default="USD", min_length=3, max_length=3)


class GDPCreate(GDPBase):
    pass


class GDP(GDPBase):
    id: str = Field(..., alias="gdp_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
