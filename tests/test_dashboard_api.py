from collections.abc import Generator
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from src.api.dependencies import get_db_session
from src.api.main import app
from src.db.models import Machine, Prediction, SensorReading


@pytest.fixture
def db_context() -> Generator[tuple[TestClient, object], None, None]:
    """Create an isolated API client and database engine."""

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

    def override_get_db_session() -> Generator[Session, None, None]:
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db_session] = override_get_db_session

    try:
        with TestClient(app) as client:
            yield client, engine
    finally:
        app.dependency_overrides.pop(get_db_session, None)
        engine.dispose()


def add_machine(
    engine,
    name: str,
    status: str = "active",
) -> Machine:
    with Session(engine) as session:
        machine = Machine(
            name=name,
            equipment_type="Motor",
            status=status,
        )
        session.add(machine)
        session.commit()
        session.refresh(machine)
        return machine


def add_prediction(
    engine,
    machine: Machine,
    probability: float,
    predicted_failure: bool,
    predicted_at: datetime,
) -> Prediction:
    with Session(engine) as session:
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
        session.flush()

        prediction = Prediction(
            machine_id=machine.id,
            sensor_reading_id=reading.id,
            failure_probability=probability,
            predicted_failure=predicted_failure,
            model_version="1.0.0",
            predicted_at=predicted_at,
        )
        session.add(prediction)
        session.commit()
        session.refresh(prediction)
        return prediction


def test_dashboard_summary_empty(db_context):
    client, _ = db_context

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json() == {
        "total_machines": 0,
        "active_machines": 0,
        "high_risk_machines": 0,
        "total_predictions": 0,
    }


def test_dashboard_summary_counts(db_context):
    client, engine = db_context

    machine_a = add_machine(engine, "Machine A")
    machine_b = add_machine(engine, "Machine B")
    add_machine(engine, "Machine C", status="inactive")

    now = datetime.now(timezone.utc)

    add_prediction(engine, machine_a, 0.8, True, now)
    add_prediction(engine, machine_b, 0.2, False, now)

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json() == {
        "total_machines": 3,
        "active_machines": 2,
        "high_risk_machines": 1,
        "total_predictions": 2,
    }


def test_summary_uses_latest_prediction(db_context):
    client, engine = db_context

    machine = add_machine(engine, "Machine A")
    now = datetime.now(timezone.utc)

    add_prediction(
        engine,
        machine,
        0.9,
        True,
        now - timedelta(days=1),
    )
    add_prediction(
        engine,
        machine,
        0.1,
        False,
        now,
    )

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json()["high_risk_machines"] == 0
    assert response.json()["total_predictions"] == 2


def test_high_risk_machines_empty(db_context):
    client, _ = db_context

    response = client.get("/api/dashboard/high-risk-machines")

    assert response.status_code == 200
    assert response.json() == []


def test_high_risk_machines_sorted_by_probability(db_context):
    client, engine = db_context

    machine_a = add_machine(engine, "Machine A")
    machine_b = add_machine(engine, "Machine B")
    machine_c = add_machine(engine, "Machine C")

    now = datetime.now(timezone.utc)

    add_prediction(engine, machine_a, 0.7, True, now)
    add_prediction(engine, machine_b, 0.9, True, now)
    add_prediction(engine, machine_c, 0.2, False, now)

    response = client.get("/api/dashboard/high-risk-machines")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert [item["machine_name"] for item in data] == [
        "Machine B",
        "Machine A",
    ]
    assert [item["failure_probability"] for item in data] == [
        pytest.approx(0.9),
        pytest.approx(0.7),
    ]


def test_high_risk_machines_use_latest_prediction(db_context):
    client, engine = db_context

    machine = add_machine(engine, "Machine A")
    now = datetime.now(timezone.utc)

    add_prediction(
        engine,
        machine,
        0.9,
        True,
        now - timedelta(days=1),
    )
    add_prediction(
        engine,
        machine,
        0.1,
        False,
        now,
    )

    response = client.get("/api/dashboard/high-risk-machines")

    assert response.status_code == 200
    assert response.json() == []


def test_high_risk_machines_no_duplicates(db_context):
    client, engine = db_context

    machine = add_machine(engine, "Machine A")
    now = datetime.now(timezone.utc)

    add_prediction(
        engine,
        machine,
        0.7,
        True,
        now - timedelta(days=1),
    )
    add_prediction(
        engine,
        machine,
        0.9,
        True,
        now,
    )

    response = client.get("/api/dashboard/high-risk-machines")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["machine_id"] == str(machine.id)
    assert data[0]["failure_probability"] == pytest.approx(0.9)


def test_recent_predictions_empty(db_context):
    client, _ = db_context

    response = client.get("/api/dashboard/recent-predictions")

    assert response.status_code == 200
    assert response.json() == []


def test_recent_predictions_limit_10(db_context):
    client, engine = db_context

    machine = add_machine(engine, "Machine A")
    now = datetime.now(timezone.utc)

    for i in range(15):
        add_prediction(
            engine,
            machine,
            probability=0.1 + i * 0.01,
            predicted_failure=False,
            predicted_at=now + timedelta(minutes=i),
        )

    response = client.get("/api/dashboard/recent-predictions")

    assert response.status_code == 200
    assert len(response.json()) == 10


def test_recent_predictions_sorted_newest_first(db_context):
    client, engine = db_context

    machine = add_machine(engine, "Machine A")
    now = datetime.now(timezone.utc)

    add_prediction(
        engine,
        machine,
        0.1,
        False,
        now - timedelta(days=2),
    )
    add_prediction(
        engine,
        machine,
        0.2,
        False,
        now - timedelta(days=1),
    )
    add_prediction(
        engine,
        machine,
        0.9,
        True,
        now,
    )

    response = client.get("/api/dashboard/recent-predictions")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 3
    assert [item["failure_probability"] for item in data] == [
        pytest.approx(0.9),
        pytest.approx(0.2),
        pytest.approx(0.1),
    ]


def test_recent_predictions_include_machine_name(db_context):
    client, engine = db_context

    machine = add_machine(engine, "Production Motor")
    now = datetime.now(timezone.utc)

    add_prediction(engine, machine, 0.8, True, now)

    response = client.get("/api/dashboard/recent-predictions")

    assert response.status_code == 200
    assert response.json()[0]["machine_name"] == "Production Motor"
    assert response.json()[0]["machine_id"] == str(machine.id)
