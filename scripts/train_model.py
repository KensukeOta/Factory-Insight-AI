from pathlib import Path

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

from src.features import prepare_features
from src.model import save_model, train_model
from src.predict import (
    DEFAULT_THRESHOLD,
    predict_failure,
)

ROOT_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = ROOT_DIR / "data" / "raw" / "ai4i2020.csv"
MODEL_PATH = ROOT_DIR / "models" / "failure_model.joblib"


def main() -> None:
    df = pd.read_csv(DATA_PATH)

    X = prepare_features(df)
    y = df["Machine failure"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = train_model(
        X_train,
        y_train,
    )

    save_model(
        model,
        MODEL_PATH,
    )

    results = predict_failure(
        model,
        df.loc[X_test.index],
        threshold=DEFAULT_THRESHOLD,
    )

    y_proba = results["failure_probability"]
    y_pred = results["predicted_failure"]

    print(f"Model saved to: {MODEL_PATH}")
    print(f"Threshold: {DEFAULT_THRESHOLD:.6f}")

    print(f"Precision: {precision_score(y_test, y_pred):.6f}")
    print(f"Recall: {recall_score(y_test, y_pred):.6f}")
    print(f"F1: {f1_score(y_test, y_pred):.6f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_proba):.6f}")
    print(f"Average Precision: {average_precision_score(y_test, y_proba):.6f}")

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))


if __name__ == "__main__":
    main()
