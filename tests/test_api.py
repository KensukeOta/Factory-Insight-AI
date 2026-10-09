from collections.abc import Generator
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from src.api.dependencies import get_db_session
from src.api.main import app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create an isolated API client with an in-memory SQLite database."""

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
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db_session, None)
        engine.dispose()


def test_health_check(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_machine(client: TestClient):
    response = client.post(
        "/api/machines",
        json={
            "name": "Demo Machine 001",
            "equipment_type": "Industrial Machine",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Demo Machine 001"
    assert data["equipment_type"] == "Industrial Machine"
    assert data["status"] == "active"
    assert "id" in data
    assert "created_at" in data


def test_list_machines(client: TestClient):
    client.post(
        "/api/machines",
        json={
            "name": "Machine A",
            "equipment_type": "Pump",
        },
    )

    client.post(
        "/api/machines",
        json={
            "name": "Machine B",
            "equipment_type": "Motor",
        },
    )

    response = client.get("/api/machines")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert {machine["name"] for machine in data} == {
        "Machine A",
        "Machine B",
    }


def test_get_machine(client: TestClient):
    create_response = client.post(
        "/api/machines",
        json={
            "name": "Machine A",
            "equipment_type": "Pump",
        },
    )

    assert create_response.status_code == 201

    machine_id = create_response.json()["id"]

    response = client.get(f"/api/machines/{machine_id}")

    assert response.status_code == 200
    assert response.json()["id"] == machine_id
    assert response.json()["name"] == "Machine A"


def test_get_machine_not_found(client: TestClient):
    machine_id = uuid4()

    response = client.get(f"/api/machines/{machine_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Machine not found"}


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "", "equipment_type": "Pump"},
        {"name": "Machine A", "equipment_type": ""},
        {"name": "A" * 101, "equipment_type": "Pump"},
        {"name": "Machine A"},
    ],
)
def test_create_machine_invalid_payload(
    client: TestClient,
    payload: dict,
):
    response = client.post("/api/machines", json=payload)

    assert response.status_code == 422


def test_get_machine_invalid_uuid(client: TestClient):
    response = client.get("/api/machines/invalid-uuid")

    assert response.status_code == 422


def test_machine_data_isolation(client: TestClient):
    response = client.get("/api/machines")

    assert response.status_code == 200
    assert response.json() == []
