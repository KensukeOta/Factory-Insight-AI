from uuid import UUID

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from sklearn.pipeline import Pipeline
from sqlmodel import Session, select

from src.api.dependencies import get_db_session, get_prediction_model
from src.api.schemas import PredictionRead
from src.db.models import Machine, Prediction, SensorReading
from src.predict import predict_failure

router = APIRouter(tags=["Predictions"])

MODEL_VERSION = "1.0.0"


@router.post(
    "/api/readings/{reading_id}/predict",
    response_model=PredictionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_prediction(
    reading_id: UUID,
    session: Session = Depends(get_db_session),
    model: Pipeline = Depends(get_prediction_model),
):
    reading = session.get(SensorReading, reading_id)

    if reading is None:
        raise HTTPException(
            status_code=404,
            detail="Sensor reading not found",
        )

    input_data = pd.DataFrame(
        [
            {
                "Type": reading.product_type,
                "Air temperature [K]": reading.air_temperature,
                "Process temperature [K]": reading.process_temperature,
                "Rotational speed [rpm]": reading.rotational_speed,
                "Torque [Nm]": reading.torque,
                "Tool wear [min]": reading.tool_wear,
            }
        ]
    )

    result = predict_failure(model, input_data)

    failure_probability = float(result.iloc[0]["failure_probability"])
    predicted_failure = bool(result.iloc[0]["predicted_failure"])

    prediction = Prediction(
        machine_id=reading.machine_id,
        sensor_reading_id=reading.id,
        failure_probability=failure_probability,
        predicted_failure=predicted_failure,
        model_version=MODEL_VERSION,
    )

    session.add(prediction)
    session.commit()
    session.refresh(prediction)

    return prediction


@router.get(
    "/api/machines/{machine_id}/predictions",
    response_model=list[PredictionRead],
)
def list_predictions(
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
        select(Prediction)
        .where(Prediction.machine_id == machine_id)
        .order_by(Prediction.predicted_at.desc())
    )

    return session.exec(statement).all()
