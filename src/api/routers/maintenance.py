from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.api.dependencies import get_db_session
from src.api.schemas import MaintenanceRecordCreate, MaintenanceRecordRead
from src.db.models import Machine, MaintenanceRecord

router = APIRouter(tags=["Maintenance"])


@router.post(
    "/api/machines/{machine_id}/maintenance",
    response_model=MaintenanceRecordRead,
    status_code=status.HTTP_201_CREATED,
)
def create_maintenance_record(
    machine_id: UUID,
    payload: MaintenanceRecordCreate,
    session: Session = Depends(get_db_session),
):
    machine = session.get(Machine, machine_id)

    if machine is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    record = MaintenanceRecord(
        machine_id=machine_id,
        description=payload.description,
    )

    session.add(record)
    session.commit()
    session.refresh(record)

    return record


@router.get(
    "/api/machines/{machine_id}/maintenance",
    response_model=list[MaintenanceRecordRead],
)
def list_maintenance_records(
    machine_id: UUID,
    session: Session = Depends(get_db_session),
):
    machine = session.get(Machine, machine_id)

    if machine is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    statement = (
        select(MaintenanceRecord)
        .where(MaintenanceRecord.machine_id == machine_id)
        .order_by(
            MaintenanceRecord.performed_at.desc(),
            MaintenanceRecord.id.desc(),
        )
    )

    return session.exec(statement).all()


@router.get(
    "/api/maintenance/{record_id}",
    response_model=MaintenanceRecordRead,
)
def get_maintenance_record(
    record_id: UUID,
    session: Session = Depends(get_db_session),
):
    record = session.get(MaintenanceRecord, record_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return record
