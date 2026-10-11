from pathlib import Path

import pandas as pd

from src.model import load_model
from src.predict import predict_failure

DATA_PATH = Path("data/raw/ai4i2020.csv")
MODEL_PATH = Path("models/failure_model.joblib")

EXCLUDED_UDIS = {840, 921, 7168, 7510}

PROBABILITY_RANGES = [
    ("ほぼ0%", 0.0, 0.001),
    ("0.1%〜1%", 0.001, 0.01),
    ("1%〜10%", 0.01, 0.10),
    ("10%〜30%", 0.10, 0.30),
    ("30%〜48%", 0.30, 0.48),
    ("48%〜70%", 0.48, 0.70),
    ("70%〜90%", 0.70, 0.90),
    ("90%〜99%", 0.90, 0.99),
    ("99%以上", 0.99, 1.01),
]

DISPLAY_COLUMNS = [
    "UDI",
    "Type",
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]",
    "Machine failure",
    "failure_probability",
]


def main() -> None:
    df = pd.read_csv(DATA_PATH)
    model = load_model(MODEL_PATH)

    predictions = predict_failure(model, df)

    analyzed = pd.concat(
        [df, predictions],
        axis=1,
    )

    analyzed = analyzed[~analyzed["UDI"].isin(EXCLUDED_UDIS)].copy()

    print("\n=== 故障確率別のデモ候補 ===")

    for label, lower, upper in PROBABILITY_RANGES:
        candidates = analyzed[
            (analyzed["failure_probability"] >= lower)
            & (analyzed["failure_probability"] < upper)
        ].copy()

        print(f"\n【{label}】該当件数: {len(candidates)}")

        if candidates.empty:
            continue

        midpoint = (lower + min(upper, 1.0)) / 2

        candidates["distance"] = (candidates["failure_probability"] - midpoint).abs()

        selected = candidates.sort_values(["distance", "UDI"]).head(5)

        print(
            selected[DISPLAY_COLUMNS].to_string(
                index=False,
                formatters={
                    "failure_probability": lambda x: f"{x:.4%}",
                },
            )
        )


if __name__ == "__main__":
    main()
