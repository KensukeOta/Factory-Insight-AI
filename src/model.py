from pathlib import Path

import joblib
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.features import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
)


def build_model() -> Pipeline:
    """Build the final LightGBM pipeline."""

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                "passthrough",
                NUMERIC_FEATURES,
            ),
            (
                "cat",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                CATEGORICAL_FEATURES,
            ),
        ]
    )

    classifier = LGBMClassifier(
        n_estimators=300,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
        n_jobs=-1,
        verbosity=-1,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


def train_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
) -> Pipeline:
    """Train the final LightGBM pipeline."""

    model = build_model()

    model.fit(X_train, y_train)

    return model


def save_model(
    model: Pipeline,
    path: str | Path,
) -> None:
    """Save a trained model."""

    path = Path(path)

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(model, path)


def load_model(
    path: str | Path,
) -> Pipeline:
    """Load a trained model from a trusted file."""

    return joblib.load(path)
