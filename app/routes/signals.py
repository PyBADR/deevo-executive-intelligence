from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.signal import Signal, SignalCreate
from app.models import signals_store

router = APIRouter(prefix="/signals", tags=["signals"])

@router.get("", response_model=List[Signal])
async def list_signals():
    return list(signals_store.values())

@router.get("/{signal_id}", response_model=Signal)
async def get_signal(signal_id: str):
    if signal_id not in signals_store:
        raise HTTPException(status_code=404, detail="Signal not found")
    return signals_store[signal_id]

@router.post("", response_model=Signal)
async def create_signal(signal: SignalCreate):
    from datetime import datetime
    signal_id = f"sig_{len(signals_store) + 1}"
    new_signal = Signal(
        id=signal_id,
        signal_type=signal.signal_type,
        title=signal.title,
        description=signal.description,
        severity=signal.severity,
        confidence=signal.confidence,
        source=signal.source,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    signals_store[signal_id] = new_signal
    return new_signal
