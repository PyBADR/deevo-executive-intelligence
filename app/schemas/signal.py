from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class SignalType(str, Enum):
    MARKET = "market"
    GEOPOLITICAL = "geopolitical"
    REGULATORY = "regulatory"
    TECHNOLOGICAL = "technological"
    SOCIAL = "social"


class SignalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=2000)
    signal_type: SignalType
    relevance_score: float = Field(ge=0.0, le=100.0)
    source: str = Field(..., min_length=1, max_length=255)
    date_detected: datetime


class SignalCreate(SignalBase):
    pass


class Signal(SignalBase):
    id: str = Field(..., alias="signal_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
