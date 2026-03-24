from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from enum import Enum
from datetime import datetime


class SourceType(str, Enum):
    NEWS = "news"
    RESEARCH = "research"
    GOVERNMENT = "government"
    ACADEMIC = "academic"
    INDUSTRY = "industry"


class SourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    url: HttpUrl
    source_type: SourceType
    credibility_score: float = Field(ge=0.0, le=100.0)
    last_checked: datetime


class SourceCreate(SourceBase):
    pass


class Source(SourceBase):
    id: str = Field(..., alias="source_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
