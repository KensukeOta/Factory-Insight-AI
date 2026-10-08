import numpy as np
import pandas as pd

from src.predict import (
    predict_failure,
    predict_failure_probability,
)


class DummyProbabilityModel:
    def predict_proba(
        self,
        X: pd.DataFrame,
    ) -> np.ndarray:
        probabilities = np.array([0.2, 0.8])

        return np.column_stack(
            [
                1 - probabilities,
                probabilities,
            ]
        )


def make_sample_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Type": ["L", "M"],
            "Air temperature [K]": [
                300.0,
                301.0,
            ],
            "Process temperature [K]": [
                310.0,
                311.0,
            ],
            "Rotational speed [rpm]": [
                1500,
                1400,
            ],
            "Torque [Nm]": [
                40.0,
                60.0,
            ],
            "Tool wear [min]": [
                100,
                200,
            ],
        }
    )


def test_predict_failure_probability():
    model = DummyProbabilityModel()
    df = make_sample_data()

    result = predict_failure_probability(
        model,
        df,
    )

    np.testing.assert_allclose(
        result,
        [0.2, 0.8],
    )


def test_predict_failure():
    model = DummyProbabilityModel()
    df = make_sample_data()

    result = predict_failure(
        model,
        df,
        threshold=0.5,
    )

    np.testing.assert_array_equal(
        result["predicted_failure"],
        [0, 1],
    )

    np.testing.assert_allclose(
        result["failure_probability"],
        [0.2, 0.8],
    )
