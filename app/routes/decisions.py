from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.decision import Decision, DecisionCreate
from app.models import decisions_store

router = APIRouter(prefix="/decisions", tags=["decisions"])

@router.get("", response_model=List[Decision])
async def list_decisions():
    return list(decisions_store.values())

@router.get("/{decision_id}", response_model=Decision)
async def get_decision(decision_id: str):
    if decision_id not in decisions_store:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decisions_store[decision_id]

@router.post("", response_model=Decision)
async def create_decision(decision: DecisionCreate):
    from datetime import datetime
    decision_id = f"dec_{len(decisions_store) + 1}"
    new_decision = Decision(
        id=decision_id,
        title=decision.title,
        description=decision.description,
        status=decision.status,
        priority=decision.priority,
        owner=decision.owner,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    decisions_store[decision_id] = new_decision
    return new_decision
