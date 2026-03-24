from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.narrative import Narrative, NarrativeCreate
from app.models import narratives_store

router = APIRouter(prefix="/narratives", tags=["narratives"])

@router.get("", response_model=List[Narrative])
async def list_narratives():
    return list(narratives_store.values())

@router.get("/{narrative_id}", response_model=Narrative)
async def get_narrative(narrative_id: str):
    if narrative_id not in narratives_store:
        raise HTTPException(status_code=404, detail="Narrative not found")
    return narratives_store[narrative_id]

@router.post("", response_model=Narrative)
async def create_narrative(narrative: NarrativeCreate):
    from datetime import datetime
    narrative_id = f"nar_{len(narratives_store) + 1}"
    new_narrative = Narrative(
        id=narrative_id,
        title=narrative.title,
        content=narrative.content,
        theme=narrative.theme,
        key_points=narrative.key_points,
        related_scenarios=narrative.related_scenarios,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    narratives_store[narrative_id] = new_narrative
    return new_narrative
