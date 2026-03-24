from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class NarrativeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1, max_length=5000)
    theme: str = Field(..., min_length=1, max_length=100)
    key_points: List[str] = Field(default_factory=list)
    related_scenarios: List[str] = Field(default_factory=list)


class NarrativeCreate(NarrativeBase):
    pass


class Narrative(NarrativeBase):
    id: str = Field(..., alias="narrative_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
