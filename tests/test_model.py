from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from src.model import (
    build_model,
    load_model,
    save_model,
    train_model,
)
from src.predict import DEFAULT_THRESHOLD, predict_failure


def make_sample_data():
    X = pd.DataFrame(
        {
            "Type": ["L", "M", "H", "L", "M", "H"],
            "Air temperature [K]": [300, 301, 299, 302, 300, 298],
            "Process temperature [K]": [310, 311, 309, 312, 310, 308],
            "Rotational speed [rpm]": [1500, 1400, 1600, 1300, 1450, 1550],
            "Torque [Nm]": [40, 50, 30, 60, 45, 35],
            "Tool wear [min]": [100, 150, 80, 200, 120, 90],
            "Power [W]": [6283.19, 7330.38, 5026.55, 8168.14, 6832.96, 5681.05],
            "Wear-Torque": [4000, 7500, 2400, 12000, 5400, 3150],
            "Temperature difference [K]": [10, 10, 10, 10, 10, 10],
        }
    )

    y = pd.Series([0, 0, 0, 1, 0, 1])

    return X, y


def test_build_model():
    model = build_model()

    assert isinstance(model, Pipeline)
    assert "preprocessor" in model.named_steps
    assert "classifier" in model.named_steps


def test_train_model():
    X, y = make_sample_data()

    model = train_model(X, y)

    probabilities = model.predict_proba(X)

    assert probabilities.shape == (6, 2)
    assert np.all((probabilities >= 0) & (probabilities <= 1))


def test_save_and_load_model(tmp_path):
    X, y = make_sample_data()

    model = train_model(X, y)

    path = tmp_path / "failure_model.joblib"

    save_model(model, path)

    loaded_model = load_model(path)

    original_probabilities = model.predict_proba(X)
    loaded_probabilities = loaded_model.predict_proba(X)

    np.testing.assert_allclose(
        original_probabilities,
        loaded_probabilities,
    )


def test_saved_model_reproduces_final_results():
    """Verify saved model reproduces the final test metrics."""

    root_dir = Path(__file__).resolve().parents[1]

    data_path = root_dir / "data" / "raw" / "ai4i2020.csv"
    model_path = root_dir / "models" / "failure_model.joblib"

    df = pd.read_csv(data_path)

    y = df["Machine failure"]

    _, X_test, _, y_test = train_test_split(
        df,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = load_model(model_path)

    results = predict_failure(
        model,
        X_test,
        threshold=DEFAULT_THRESHOLD,
    )

    y_proba = results["failure_probability"].to_numpy()
    y_pred = results["predicted_failure"].to_numpy()

    # Issue #4 / #5で確定した評価結果
    np.testing.assert_allclose(
        precision_score(y_test, y_pred),
        0.949153,
        atol=1e-6,
    )

    np.testing.assert_allclose(
        recall_score(y_test, y_pred),
        0.823529,
        atol=1e-6,
    )

    np.testing.assert_allclose(
        f1_score(y_test, y_pred),
        0.881890,
        atol=1e-6,
    )

    np.testing.assert_allclose(
        roc_auc_score(y_test, y_proba),
        0.981953,
        atol=1e-6,
    )

    np.testing.assert_allclose(
        average_precision_score(y_test, y_proba),
        0.891839,
        atol=1e-6,
    )

    np.testing.assert_array_equal(
        confusion_matrix(y_test, y_pred),
        [[1929, 3], [12, 56]],
    )
