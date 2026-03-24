from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.kpi import KPI, KPICreate
from app.models import kpis_store

router = APIRouter(prefix="/kpis", tags=["kpis"])

@router.get("", response_model=List[KPI])
async def list_kpis():
    return list(kpis_store.values())

@router.get("/{kpi_id}", response_model=KPI)
async def get_kpi(kpi_id: str):
    if kpi_id not in kpis_store:
        raise HTTPException(status_code=404, detail="KPI not found")
    return kpis_store[kpi_id]

@router.post("", response_model=KPI)
async def create_kpi(kpi: KPICreate):
    from datetime import datetime
    kpi_id = f"kpi_{len(kpis_store) + 1}"
    new_kpi = KPI(
        id=kpi_id,
        name=kpi.name,
        description=kpi.description,
        current_value=kpi.current_value,
        target_value=kpi.target_value,
        unit=kpi.unit,
        category=kpi.category,
        trend=kpi.trend,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    kpis_store[kpi_id] = new_kpi
    return new_kpi
