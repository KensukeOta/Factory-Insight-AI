from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.api.dependencies import get_db_session
from src.api.schemas import MachineCreate, MachineRead
from src.db.models import Machine

router = APIRouter(prefix="/api/machines", tags=["Machines"])


@router.post(
    "",
    response_model=MachineRead,
    status_code=status.HTTP_201_CREATED,
)
def create_machine(
    payload: MachineCreate,
    session: Session = Depends(get_db_session),
):
    machine = Machine(
        name=payload.name,
        equipment_type=payload.equipment_type,
    )

    session.add(machine)
    session.commit()
    session.refresh(machine)

    return machine


@router.get("", response_model=list[MachineRead])
def list_machines(
    session: Session = Depends(get_db_session),
):
    return session.exec(select(Machine)).all()


@router.get("/{machine_id}", response_model=MachineRead)
def get_machine(
    machine_id: UUID,
    session: Session = Depends(get_db_session),
):
    machine = session.get(Machine, machine_id)

    if machine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found",
        )

    return machine
