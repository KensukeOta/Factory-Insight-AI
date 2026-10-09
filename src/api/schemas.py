from datetime import datetime
from typing import Literal
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


class SensorReadingCreate(SQLModel):
    product_type: Literal["L", "M", "H"]
    air_temperature: float = Field(ge=0)
    process_temperature: float = Field(ge=0)
    rotational_speed: int = Field(gt=0)
    torque: float = Field(ge=0)
    tool_wear: int = Field(ge=0)


class SensorReadingRead(SensorReadingCreate):
    id: UUID
    machine_id: UUID
    measured_at: datetime


class PredictionRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    machine_id: UUID
    sensor_reading_id: UUID
    failure_probability: float
    predicted_failure: bool
    model_version: str
    predicted_at: datetime
