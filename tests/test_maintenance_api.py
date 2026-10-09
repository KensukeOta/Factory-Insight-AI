from collections.abc import Generator
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from src.api.dependencies import get_db_session
from src.api.main import app
from src.db import models  # noqa: F401


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create an isolated test client with an in-memory SQLite database."""

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


@pytest.fixture
def machine_id(client: TestClient) -> str:
    """Create a machine for maintenance API tests."""

    response = client.post(
        "/api/machines",
        json={
            "name": "Maintenance Test Machine",
            "equipment_type": "Motor",
        },
    )

    assert response.status_code == 201

    return response.json()["id"]


def test_create_maintenance_record(client: TestClient, machine_id: str):
    response = client.post(
        f"/api/machines/{machine_id}/maintenance",
        json={
            "description": "モーターの定期点検を実施",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["machine_id"] == machine_id
    assert data["description"] == "モーターの定期点検を実施"
    assert "id" in data
    assert "performed_at" in data


def test_list_maintenance_records(client: TestClient, machine_id: str):
    descriptions = [
        "モーターの清掃",
        "潤滑油の補充",
    ]

    for description in descriptions:
        response = client.post(
            f"/api/machines/{machine_id}/maintenance",
            json={"description": description},
        )
        assert response.status_code == 201

    response = client.get(f"/api/machines/{machine_id}/maintenance")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert {record["description"] for record in data} == set(descriptions)


def test_get_maintenance_record(client: TestClient, machine_id: str):
    create_response = client.post(
        f"/api/machines/{machine_id}/maintenance",
        json={
            "description": "ベルト交換",
        },
    )

    assert create_response.status_code == 201

    record_id = create_response.json()["id"]

    response = client.get(f"/api/maintenance/{record_id}")

    assert response.status_code == 200
    assert response.json()["id"] == record_id
    assert response.json()["machine_id"] == machine_id
    assert response.json()["description"] == "ベルト交換"


def test_create_maintenance_machine_not_found(client: TestClient):
    response = client.post(
        f"/api/machines/{uuid4()}/maintenance",
        json={
            "description": "定期点検",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Machine not found"


def test_list_maintenance_machine_not_found(client: TestClient):
    response = client.get(f"/api/machines/{uuid4()}/maintenance")

    assert response.status_code == 404
    assert response.json()["detail"] == "Machine not found"


def test_get_maintenance_record_not_found(client: TestClient):
    response = client.get(f"/api/maintenance/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Maintenance record not found"


@pytest.mark.parametrize(
    "description",
    [
        "",
        "A" * 2001,
    ],
)
def test_create_maintenance_invalid_description(
    client: TestClient,
    machine_id: str,
    description: str,
):
    response = client.post(
        f"/api/machines/{machine_id}/maintenance",
        json={
            "description": description,
        },
    )

    assert response.status_code == 422


def test_create_maintenance_missing_description(
    client: TestClient,
    machine_id: str,
):
    response = client.post(
        f"/api/machines/{machine_id}/maintenance",
        json={},
    )

    assert response.status_code == 422


def test_maintenance_invalid_uuid(client: TestClient):
    response = client.get("/api/maintenance/invalid-uuid")

    assert response.status_code == 422


def test_maintenance_records_are_isolated_by_machine(client: TestClient):
    first_machine = client.post(
        "/api/machines",
        json={
            "name": "Machine A",
            "equipment_type": "Motor",
        },
    )
    second_machine = client.post(
        "/api/machines",
        json={
            "name": "Machine B",
            "equipment_type": "Pump",
        },
    )

    assert first_machine.status_code == 201
    assert second_machine.status_code == 201

    first_id = first_machine.json()["id"]
    second_id = second_machine.json()["id"]

    create_response = client.post(
        f"/api/machines/{first_id}/maintenance",
        json={
            "description": "Machine Aの点検",
        },
    )

    assert create_response.status_code == 201

    first_records = client.get(f"/api/machines/{first_id}/maintenance")
    second_records = client.get(f"/api/machines/{second_id}/maintenance")

    assert first_records.status_code == 200
    assert second_records.status_code == 200

    assert len(first_records.json()) == 1
    assert second_records.json() == []


def test_maintenance_records_sorted_newest_first(
    client: TestClient,
    machine_id: str,
):
    descriptions = [
        "1回目の点検",
        "2回目の点検",
        "3回目の点検",
    ]

    created_records = []

    for description in descriptions:
        response = client.post(
            f"/api/machines/{machine_id}/maintenance",
            json={"description": description},
        )

        assert response.status_code == 201
        created_records.append(response.json())

    response = client.get(f"/api/machines/{machine_id}/maintenance")

    assert response.status_code == 200

    records = response.json()
    assert len(records) == 3

    performed_at_values = [record["performed_at"] for record in records]

    assert performed_at_values == sorted(
        performed_at_values,
        reverse=True,
    )
