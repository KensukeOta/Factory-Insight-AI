from datetime import datetime
from uuid import UUID

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class MachineCreate(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    equipment_type: str = Field(min_length=1, max_length=100)


class MachineRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    equipment_type: str
    status: str
    created_at: datetime
