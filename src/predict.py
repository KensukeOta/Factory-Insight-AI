from typing import Protocol

import numpy as np
import pandas as pd

from src.features import prepare_features

DEFAULT_THRESHOLD = 0.4802020202020202


class ProbabilityModel(Protocol):
    def predict_proba(
        self,
        X: pd.DataFrame,
    ) -> np.ndarray: ...


def predict_failure_probability(
    model: ProbabilityModel,
    df: pd.DataFrame,
) -> np.ndarray:
    """Predict failure probabilities for equipment."""

    X = prepare_features(df)

    probabilities = model.predict_proba(X)

    return probabilities[:, 1]


def predict_failure(
    model: ProbabilityModel,
    df: pd.DataFrame,
    threshold: float = DEFAULT_THRESHOLD,
) -> pd.DataFrame:
    """Predict failure probability and binary failure label."""

    probabilities = predict_failure_probability(
        model,
        df,
    )

    predictions = (probabilities >= threshold).astype(int)

    return pd.DataFrame(
        {
            "failure_probability": probabilities,
            "predicted_failure": predictions,
        },
        index=df.index,
    )
