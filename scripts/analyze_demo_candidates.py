from pathlib import Path

import pandas as pd

from src.model import load_model
from src.predict import DEFAULT_THRESHOLD, predict_failure

DATA_PATH = Path("data/raw/ai4i2020.csv")
MODEL_PATH = Path("models/failure_model.joblib")

DISPLAY_COLUMNS = [
    "UDI",
    "Product ID",
    "Type",
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]",
    "Machine failure",
    "failure_probability",
    "predicted_failure",
]


def main() -> None:
    df = pd.read_csv(DATA_PATH)
    model = load_model(MODEL_PATH)

    results = predict_failure(model, df)

    analyzed = pd.concat(
        [df, results],
        axis=1,
    )

    print("\n=== データセット概要 ===")
    print(f"総件数: {len(analyzed)}")
    print(f"実際の正常データ: {(analyzed['Machine failure'] == 0).sum()}")
    print(f"実際の故障データ: {(analyzed['Machine failure'] == 1).sum()}")
    print(f"予測閾値: {DEFAULT_THRESHOLD:.4%}")

    print("\n=== モデルの予測結果 ===")
    print(f"低リスク予測: {(analyzed['predicted_failure'] == 0).sum()}")
    print(f"高リスク予測: {(analyzed['predicted_failure'] == 1).sum()}")

    print("\n=== 故障確率の分布 ===")
    print(
        analyzed["failure_probability"]
        .describe(percentiles=[0.5, 0.9, 0.95, 0.99])
        .to_string()
    )

    print("\n=== 高リスク予測の上位5件 ===")
    high_risk = (
        analyzed[analyzed["predicted_failure"] == 1]
        .sort_values("failure_probability", ascending=False)
        .head(5)
    )

    print(
        high_risk[DISPLAY_COLUMNS].to_string(
            index=False,
        )
    )

    print("\n=== 低リスク予測の下位5件 ===")
    low_risk = (
        analyzed[analyzed["predicted_failure"] == 0]
        .sort_values("failure_probability", ascending=True)
        .head(5)
    )

    print(
        low_risk[DISPLAY_COLUMNS].to_string(
            index=False,
        )
    )

    print("\n=== 正解ラベルと予測結果のクロス集計 ===")
    print(
        pd.crosstab(
            analyzed["Machine failure"],
            analyzed["predicted_failure"],
            rownames=["実際の故障"],
            colnames=["故障予測"],
        )
    )


if __name__ == "__main__":
    main()
