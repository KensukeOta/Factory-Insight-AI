from collections.abc import Generator
from uuid import uuid4

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from src.api.dependencies import get_db_session, get_prediction_model
from src.api.main import app
from src.db import models  # noqa: F401
from src.predict import DEFAULT_THRESHOLD


class FakePredictionModel:
    """Return a fixed probability without loading the real model."""

    def __init__(self, probability: float = 0.7):
        self.probability = probability
        self.received_features = None

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        self.received_features = X.copy()
        n_samples = len(X)

        return np.column_stack(
            [
                np.full(n_samples, 1 - self.probability),
                np.full(n_samples, self.probability),
            ]
        )


@pytest.fixture
def api_client() -> Generator[tuple[TestClient, FakePredictionModel], None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    fake_model = FakePredictionModel()

    def override_session() -> Generator[Session, None, None]:
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db_session] = override_session
    app.dependency_overrides[get_prediction_model] = lambda: fake_model

    try:
        with TestClient(app) as client:
            yield client, fake_model
    finally:
        app.dependency_overrides.pop(get_db_session, None)
        app.dependency_overrides.pop(get_prediction_model, None)
        engine.dispose()


@pytest.fixture
def machine_and_reading(api_client):
    client, _ = api_client

    machine_response = client.post(
        "/api/machines",
        json={
            "name": "Test Machine",
            "equipment_type": "Motor",
        },
    )
    assert machine_response.status_code == 201

    machine_id = machine_response.json()["id"]

    reading_response = client.post(
        f"/api/machines/{machine_id}/readings",
        json={
            "product_type": "M",
            "air_temperature": 298.1,
            "process_temperature": 308.6,
            "rotational_speed": 1551,
            "torque": 42.8,
            "tool_wear": 120,
        },
    )
    assert reading_response.status_code == 201

    reading_id = reading_response.json()["id"]

    return machine_id, reading_id


def test_create_sensor_reading(api_client, machine_and_reading):
    client, _ = api_client
    machine_id, reading_id = machine_and_reading

    response = client.get(f"/api/machines/{machine_id}/readings")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == reading_id
    assert response.json()[0]["product_type"] == "M"


def test_create_reading_machine_not_found(api_client):
    client, _ = api_client

    response = client.post(
        f"/api/machines/{uuid4()}/readings",
        json={
            "product_type": "M",
            "air_temperature": 298.1,
            "process_temperature": 308.6,
            "rotational_speed": 1551,
            "torque": 42.8,
            "tool_wear": 120,
        },
    )

    assert response.status_code == 404


@pytest.mark.parametrize(
    "invalid_field,invalid_value",
    [
        ("product_type", "X"),
        ("air_temperature", -1),
        ("rotational_speed", 0),
        ("torque", -1),
        ("tool_wear", -1),
    ],
)
def test_create_reading_invalid_input(
    api_client,
    machine_and_reading,
    invalid_field,
    invalid_value,
):
    client, _ = api_client
    machine_id, _ = machine_and_reading

    payload = {
        "product_type": "M",
        "air_temperature": 298.1,
        "process_temperature": 308.6,
        "rotational_speed": 1551,
        "torque": 42.8,
        "tool_wear": 120,
    }
    payload[invalid_field] = invalid_value

    response = client.post(
        f"/api/machines/{machine_id}/readings",
        json=payload,
    )

    assert response.status_code == 422


def test_create_prediction(api_client, machine_and_reading):
    client, fake_model = api_client
    machine_id, reading_id = machine_and_reading

    response = client.post(f"/api/readings/{reading_id}/predict")

    assert response.status_code == 201

    data = response.json()

    assert data["machine_id"] == machine_id
    assert data["sensor_reading_id"] == reading_id
    assert data["failure_probability"] == pytest.approx(0.7)
    assert data["predicted_failure"] is True
    assert data["model_version"] == "1.0.0"
    assert "id" in data
    assert "predicted_at" in data

    assert fake_model.received_features is not None


@pytest.mark.parametrize(
    "probability",
    [
        DEFAULT_THRESHOLD - 0.01,
        DEFAULT_THRESHOLD,
        DEFAULT_THRESHOLD + 0.01,
    ],
)
def test_prediction_threshold(
    api_client,
    machine_and_reading,
    probability,
):
    client, fake_model = api_client
    _, reading_id = machine_and_reading

    fake_model.probability = probability

    response = client.post(f"/api/readings/{reading_id}/predict")

    assert response.status_code == 201
    assert response.json()["failure_probability"] == pytest.approx(probability)
    assert response.json()["predicted_failure"] == (probability >= DEFAULT_THRESHOLD)


def test_prediction_is_saved(api_client, machine_and_reading):
    client, _ = api_client
    machine_id, reading_id = machine_and_reading

    create_response = client.post(f"/api/readings/{reading_id}/predict")
    assert create_response.status_code == 201

    prediction_id = create_response.json()["id"]

    response = client.get(f"/api/machines/{machine_id}/predictions")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == prediction_id


def test_predict_reading_not_found(api_client):
    client, _ = api_client

    response = client.post(f"/api/readings/{uuid4()}/predict")

    assert response.status_code == 404
    assert response.json()["detail"] == "Sensor reading not found"


def test_list_predictions_machine_not_found(api_client):
    client, _ = api_client

    response = client.get(f"/api/machines/{uuid4()}/predictions")

    assert response.status_code == 404
    assert response.json()["detail"] == "Machine not found"
