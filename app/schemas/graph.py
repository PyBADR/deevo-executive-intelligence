from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


class GraphType(str, Enum):
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    SCATTER = "scatter"
    HEATMAP = "heatmap"


class GraphBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=1000)
    graph_type: GraphType
    data: Dict[str, Any] = Field(default_factory=dict)
    x_axis: str = Field(..., min_length=1, max_length=100)
    y_axis: str = Field(..., min_length=1, max_length=100)


class GraphCreate(GraphBase):
    pass


class Graph(GraphBase):
    id: str = Field(..., alias="graph_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
