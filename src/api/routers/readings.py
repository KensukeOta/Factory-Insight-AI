from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.api.dependencies import get_db_session
from src.api.schemas import SensorReadingCreate, SensorReadingRead
from src.db.models import Machine, SensorReading

router = APIRouter(
    prefix="/api/machines/{machine_id}/readings",
    tags=["Sensor Readings"],
)


@router.post(
    "",
    response_model=SensorReadingRead,
    status_code=status.HTTP_201_CREATED,
)
def create_sensor_reading(
    machine_id: UUID,
    payload: SensorReadingCreate,
    session: Session = Depends(get_db_session),
):
    machine = session.get(Machine, machine_id)

    if machine is None:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    reading = SensorReading(
        machine_id=machine_id,
        **payload.model_dump(),
    )

    session.add(reading)
    session.commit()
    session.refresh(reading)

    return reading


@router.get(
    "",
    response_model=list[SensorReadingRead],
)
def list_sensor_readings(
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
        select(SensorReading)
        .where(SensorReading.machine_id == machine_id)
        .order_by(SensorReading.measured_at.desc())
    )

    return session.exec(statement).all()
