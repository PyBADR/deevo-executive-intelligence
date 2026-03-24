from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class DecisionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"


class DecisionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=2000)
    recommendation: str = Field(..., min_length=1, max_length=2000)
    status: DecisionStatus = Field(default=DecisionStatus.PENDING)
    priority: int = Field(ge=1, le=5)
    owner: str = Field(..., min_length=1, max_length=100)


class DecisionCreate(DecisionBase):
    pass


class Decision(DecisionBase):
    id: str = Field(..., alias="decision_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
