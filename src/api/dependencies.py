from collections.abc import Generator
from functools import lru_cache
from pathlib import Path

from sqlmodel import Session

from src.db.database import create_db_engine
from src.model import load_model

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "failure_model.joblib"


@lru_cache
def get_engine():
    return create_db_engine()


@lru_cache(maxsize=1)
def get_prediction_model():
    """Load and cache the trained model."""
    return load_model(MODEL_PATH)


def get_db_session() -> Generator[Session, None, None]:
    with Session(get_engine()) as session:
        yield session
