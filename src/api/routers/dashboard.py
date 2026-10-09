from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlmodel import Session, select

from src.api.dependencies import get_db_session
from src.api.schemas import (
    DashboardSummary,
    HighRiskMachineRead,
    RecentPredictionRead,
)
from src.db.models import Machine, Prediction

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


def get_latest_predictions(session: Session) -> list[Prediction]:
    """Get the latest prediction for each machine."""

    predictions = session.exec(
        select(Prediction).order_by(
            Prediction.predicted_at.desc(),
            Prediction.id.desc(),
        )
    ).all()

    latest_by_machine = {}

    for prediction in predictions:
        if prediction.machine_id not in latest_by_machine:
            latest_by_machine[prediction.machine_id] = prediction

    return list(latest_by_machine.values())


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    session: Session = Depends(get_db_session),
):
    total_machines = session.exec(select(func.count()).select_from(Machine)).one()

    active_machines = session.exec(
        select(func.count()).select_from(Machine).where(Machine.status == "active")
    ).one()

    total_predictions = session.exec(select(func.count()).select_from(Prediction)).one()

    latest_predictions = get_latest_predictions(session)

    high_risk_machines = sum(
        prediction.predicted_failure for prediction in latest_predictions
    )

    return DashboardSummary(
        total_machines=total_machines,
        active_machines=active_machines,
        high_risk_machines=high_risk_machines,
        total_predictions=total_predictions,
    )


@router.get(
    "/high-risk-machines",
    response_model=list[HighRiskMachineRead],
)
def get_high_risk_machines(
    session: Session = Depends(get_db_session),
):
    latest_predictions = get_latest_predictions(session)

    high_risk_predictions = [
        prediction for prediction in latest_predictions if prediction.predicted_failure
    ]

    high_risk_predictions.sort(
        key=lambda prediction: prediction.failure_probability,
        reverse=True,
    )

    machines = {machine.id: machine for machine in session.exec(select(Machine)).all()}

    return [
        HighRiskMachineRead(
            machine_id=prediction.machine_id,
            machine_name=machines[prediction.machine_id].name,
            equipment_type=machines[prediction.machine_id].equipment_type,
            failure_probability=prediction.failure_probability,
            predicted_at=prediction.predicted_at,
        )
        for prediction in high_risk_predictions
    ]


@router.get(
    "/recent-predictions",
    response_model=list[RecentPredictionRead],
)
def get_recent_predictions(
    session: Session = Depends(get_db_session),
):
    statement = (
        select(Prediction, Machine.name)
        .join(Machine, Prediction.machine_id == Machine.id)
        .order_by(
            Prediction.predicted_at.desc(),
            Prediction.id.desc(),
        )
        .limit(10)
    )

    results = session.exec(statement).all()

    return [
        RecentPredictionRead(
            id=prediction.id,
            machine_id=prediction.machine_id,
            machine_name=machine_name,
            failure_probability=prediction.failure_probability,
            predicted_failure=prediction.predicted_failure,
            predicted_at=prediction.predicted_at,
        )
        for prediction, machine_name in results
    ]
