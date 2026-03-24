from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class SeverityLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ScenarioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=2000)
    severity: SeverityLevel = Field(default=SeverityLevel.MEDIUM)
    probability: float = Field(ge=0.0, le=1.0)
    impact: float = Field(ge=0.0, le=1.0)
    timeline: str = Field(..., min_length=1, max_length=100)


class ScenarioCreate(ScenarioBase):
    pass


class Scenario(ScenarioBase):
    id: str = Field(..., alias="scenario_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
