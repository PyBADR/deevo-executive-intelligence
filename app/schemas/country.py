from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class GCCCountryCode(str, Enum):
    SA = "SA"
    AE = "AE"
    KW = "KW"
    QA = "QA"
    BH = "BH"
    OM = "OM"


class CountryBase(BaseModel):
    code: GCCCountryCode
    name: str = Field(..., min_length=1, max_length=100)
    region: str = Field(..., min_length=1, max_length=100)
    stability_index: float = Field(ge=0.0, le=100.0)
    political_risk: float = Field(ge=0.0, le=100.0)


class CountryCreate(CountryBase):
    pass


class Country(CountryBase):
    id: str = Field(..., alias="country_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
