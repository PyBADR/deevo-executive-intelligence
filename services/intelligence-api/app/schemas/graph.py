"""Graph schemas — relationship nodes, edges, and propagation paths."""
from enum import Enum
from pydantic import BaseModel, Field
from .scenario import LanguageVariant


class NodeType(str, Enum):
    SCENARIO = "scenario"
    MACRO_SIGNAL = "macro_signal"
    GDP_COMPONENT = "gdp_component"
    COUNTRY = "country"
    PUBLIC_SECTOR = "public_sector"
    PRIVATE_SECTOR = "private_sector"
    SECTOR = "sector"
    DECISION = "decision"


class EdgeType(str, Enum):
    AFFECTS = "affects"
    INCREASES = "increases"
    REDUCES = "reduces"
    PRESSURES = "pressures"
    TRIGGERS = "triggers"
    SUPPORTS = "supports"


class RelationshipNode(BaseModel):
    id: str
    type: NodeType
    label: LanguageVariant
    metadata: dict = Field(default_factory=dict)


class RelationshipEdge(BaseModel):
    source_id: str
    target_id: str
    type: EdgeType
    weight: float = Field(ge=0.0, le=1.0)
    label: LanguageVariant
    explanation: str = ""


class PropagationResult(BaseModel):
    """Full graph output with nodes, edges, and ordered propagation path."""
    nodes: list[RelationshipNode]
    edges: list[RelationshipEdge]
    propagation_path: list[str]
