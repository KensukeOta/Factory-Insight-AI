from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    ForeignKeyConstraint,
    UniqueConstraint,
)
from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Machine(SQLModel, table=True):
    __tablename__ = "machines"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    equipment_type: str
    status: str = Field(default="active")

    created_at: datetime = Field(default_factory=utc_now)

    sensor_readings: list["SensorReading"] = Relationship(back_populates="machine")
    predictions: list["Prediction"] = Relationship(back_populates="machine")
    maintenance_records: list["MaintenanceRecord"] = Relationship(
        back_populates="machine"
    )


class SensorReading(SQLModel, table=True):
    __tablename__ = "sensor_readings"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    machine_id: UUID = Field(
        foreign_key="machines.id",
        index=True,
    )

    product_type: str

    air_temperature: float
    process_temperature: float
    rotational_speed: int
    torque: float
    tool_wear: int

    measured_at: datetime = Field(default_factory=utc_now)

    machine: Machine = Relationship(back_populates="sensor_readings")
    predictions: list["Prediction"] = Relationship(
        back_populates="sensor_reading",
        sa_relationship_kwargs={
            "foreign_keys": "[Prediction.sensor_reading_id]",
        },
    )

    __table_args__ = (
        UniqueConstraint(
            "id",
            "machine_id",
            name="uq_sensor_reading_id_machine_id",
        ),
    )


class Prediction(SQLModel, table=True):
    __tablename__ = "predictions"
    __table_args__ = (
        CheckConstraint(
            "failure_probability >= 0 AND failure_probability <= 1",
            name="ck_prediction_probability_range",
        ),
        ForeignKeyConstraint(
            ["sensor_reading_id", "machine_id"],
            ["sensor_readings.id", "sensor_readings.machine_id"],
            name="fk_prediction_reading_machine",
        ),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    machine_id: UUID = Field(
        foreign_key="machines.id",
        index=True,
    )
    sensor_reading_id: UUID = Field(index=True)

    failure_probability: float
    predicted_failure: bool
    model_version: str

    predicted_at: datetime = Field(default_factory=utc_now)

    machine: Machine = Relationship(back_populates="predictions")
    sensor_reading: SensorReading = Relationship(
        back_populates="predictions",
        sa_relationship_kwargs={
            "foreign_keys": "[Prediction.sensor_reading_id]",
        },
    )


class MaintenanceRecord(SQLModel, table=True):
    __tablename__ = "maintenance_records"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    machine_id: UUID = Field(
        foreign_key="machines.id",
        index=True,
    )

    performed_at: datetime = Field(default_factory=utc_now)
    description: str

    machine: Machine = Relationship(back_populates="maintenance_records")
