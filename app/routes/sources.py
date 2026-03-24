from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.source import Source, SourceCreate
from app.models import sources_store

router = APIRouter(prefix="/sources", tags=["sources"])

@router.get("", response_model=List[Source])
async def list_sources():
    return list(sources_store.values())

@router.get("/{source_id}", response_model=Source)
async def get_source(source_id: str):
    if source_id not in sources_store:
        raise HTTPException(status_code=404, detail="Source not found")
    return sources_store[source_id]

@router.post("", response_model=Source)
async def create_source(source: SourceCreate):
    from datetime import datetime
    source_id = f"src_{len(sources_store) + 1}"
    new_source = Source(
        id=source_id,
        name=source.name,
        source_type=source.source_type,
        url=source.url,
        description=source.description,
        reliability=source.reliability,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    sources_store[source_id] = new_source
    return new_source
