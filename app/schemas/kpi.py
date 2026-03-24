from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class KPIBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=1000)
    current_value: float
    target_value: float
    unit: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=100)
    trend: str = Field(..., min_length=1, max_length=50)


class KPICreate(KPIBase):
    pass


class KPI(KPIBase):
    id: str = Field(..., alias="kpi_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
