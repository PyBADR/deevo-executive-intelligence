from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.graph import Graph, GraphCreate
from app.models import graphs_store

router = APIRouter(prefix="/graphs", tags=["graphs"])

@router.get("", response_model=List[Graph])
async def list_graphs():
    return list(graphs_store.values())

@router.get("/{graph_id}", response_model=Graph)
async def get_graph(graph_id: str):
    if graph_id not in graphs_store:
        raise HTTPException(status_code=404, detail="Graph not found")
    return graphs_store[graph_id]

@router.post("", response_model=Graph)
async def create_graph(graph: GraphCreate):
    from datetime import datetime
    graph_id = f"grph_{len(graphs_store) + 1}"
    new_graph = Graph(
        id=graph_id,
        title=graph.title,
        description=graph.description,
        graph_type=graph.graph_type,
        data=graph.data,
        x_axis=graph.x_axis,
        y_axis=graph.y_axis,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    graphs_store[graph_id] = new_graph
    return new_graph
