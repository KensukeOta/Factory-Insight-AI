from datetime import datetime, timezone

import pytest
from sqlalchemy import event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select

from src.db.models import (
    Machine,
    MaintenanceRecord,
    Prediction,
    SensorReading,
)


@pytest.fixture
def engine():
    """Create an isolated in-memory SQLite database."""

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    SQLModel.metadata.create_all(engine)

    yield engine

    SQLModel.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def session(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture
def machine(session):
    machine = Machine(
        name="Demo Machine 001",
        equipment_type="Industrial Machine",
        status="active",
    )

    session.add(machine)
    session.commit()
    session.refresh(machine)

    return machine


@pytest.fixture
def sensor_reading(session, machine):
    reading = SensorReading(
        machine_id=machine.id,
        product_type="M",
        air_temperature=298.1,
        process_temperature=308.6,
        rotational_speed=1551,
        torque=42.8,
        tool_wear=120,
    )

    session.add(reading)
    session.commit()
    session.refresh(reading)

    return reading


def test_create_tables(engine):
    """Verify that all four tables are created."""

    from sqlalchemy import inspect

    tables = set(inspect(engine).get_table_names())

    assert {
        "machines",
        "sensor_readings",
        "predictions",
        "maintenance_records",
    }.issubset(tables)


def test_create_machine(session):
    """Verify that a machine can be created and retrieved."""

    machine = Machine(
        name="Machine A",
        equipment_type="Pump",
        status="active",
    )

    session.add(machine)
    session.commit()

    result = session.exec(select(Machine).where(Machine.name == "Machine A")).one()

    assert result.id == machine.id
    assert result.equipment_type == "Pump"
    assert result.status == "active"


def test_create_sensor_reading(session, machine):
    """Verify that sensor readings are linked to machines."""

    reading = SensorReading(
        machine_id=machine.id,
        product_type="M",
        air_temperature=298.1,
        process_temperature=308.6,
        rotational_speed=1551,
        torque=42.8,
        tool_wear=120,
    )

    session.add(reading)
    session.commit()

    result = session.exec(select(SensorReading)).one()

    assert result.machine_id == machine.id
    assert result.product_type == "M"
    assert result.rotational_speed == 1551
    assert result.torque == 42.8


def test_create_prediction(session, machine, sensor_reading):
    """Verify that prediction results can be saved."""

    prediction = Prediction(
        machine_id=machine.id,
        sensor_reading_id=sensor_reading.id,
        failure_probability=0.85,
        predicted_failure=True,
        model_version="lightgbm-v1",
    )

    session.add(prediction)
    session.commit()

    result = session.exec(select(Prediction)).one()

    assert result.machine_id == machine.id
    assert result.sensor_reading_id == sensor_reading.id
    assert result.failure_probability == 0.85
    assert result.predicted_failure is True


def test_create_maintenance_record(session, machine):
    """Verify that maintenance records can be saved."""

    record = MaintenanceRecord(
        machine_id=machine.id,
        performed_at=datetime.now(timezone.utc),
        description="Bearing inspection completed",
    )

    session.add(record)
    session.commit()

    result = session.exec(select(MaintenanceRecord)).one()

    assert result.machine_id == machine.id
    assert result.description == "Bearing inspection completed"


def test_sensor_reading_foreign_key_constraint(session):
    """Reject a sensor reading referencing a nonexistent machine."""

    from uuid import uuid4

    reading = SensorReading(
        machine_id=uuid4(),
        product_type="M",
        air_temperature=298.1,
        process_temperature=308.6,
        rotational_speed=1551,
        torque=42.8,
        tool_wear=120,
    )

    session.add(reading)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()


@pytest.mark.parametrize("probability", [-0.1, 1.1])
def test_prediction_probability_constraint(
    session,
    machine,
    sensor_reading,
    probability,
):
    """Reject probabilities outside the valid 0-1 range."""

    prediction = Prediction(
        machine_id=machine.id,
        sensor_reading_id=sensor_reading.id,
        failure_probability=probability,
        predicted_failure=True,
        model_version="lightgbm-v1",
    )

    session.add(prediction)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()


def test_prediction_rejects_mismatched_machine(
    session,
    machine,
    sensor_reading,
):
    """Reject predictions referencing readings from another machine."""

    another_machine = Machine(
        name="Another Machine",
        equipment_type="Pump",
        status="active",
    )

    session.add(another_machine)
    session.commit()
    session.refresh(another_machine)

    prediction = Prediction(
        machine_id=another_machine.id,
        sensor_reading_id=sensor_reading.id,
        failure_probability=0.85,
        predicted_failure=True,
        model_version="lightgbm-v1",
    )

    session.add(prediction)

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()
