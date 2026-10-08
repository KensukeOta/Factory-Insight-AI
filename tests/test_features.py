from pathlib import Path

import numpy as np
import pandas as pd

from src.features import (
    MODEL_FEATURES,
    add_derived_features,
    prepare_features,
)


def make_sample_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Type": ["L"],
            "Air temperature [K]": [300.0],
            "Process temperature [K]": [310.0],
            "Rotational speed [rpm]": [1500],
            "Torque [Nm]": [40.0],
            "Tool wear [min]": [100],
        }
    )


def test_add_derived_features():
    df = make_sample_data()

    result = add_derived_features(df)

    expected_power = 2 * np.pi * 1500 * 40.0 / 60

    assert np.isclose(
        result.loc[0, "Power [W]"],
        expected_power,
    )

    assert result.loc[0, "Wear-Torque"] == 4000.0

    assert (
        result.loc[
            0,
            "Temperature difference [K]",
        ]
        == 10.0
    )


def test_add_derived_features_does_not_modify_original():
    df = make_sample_data()

    add_derived_features(df)

    assert "Power [W]" not in df.columns
    assert "Wear-Torque" not in df.columns
    assert "Temperature difference [K]" not in df.columns


def test_prepare_features():
    df = make_sample_data()

    result = prepare_features(df)

    assert list(result.columns) == MODEL_FEATURES
    assert len(result) == 1


def test_prepare_features_matches_ai4i_dataset():
    """Verify feature engineering against the original AI4I dataset."""

    data_path = Path(__file__).resolve().parents[1] / "data" / "raw" / "ai4i2020.csv"

    df = pd.read_csv(data_path)

    # 元データから1行取得
    sample = df.iloc[[0]].copy()

    # Notebookで使用した計算式による期待値
    speed = sample.iloc[0]["Rotational speed [rpm]"]
    torque = sample.iloc[0]["Torque [Nm]"]
    wear = sample.iloc[0]["Tool wear [min]"]
    air_temp = sample.iloc[0]["Air temperature [K]"]
    process_temp = sample.iloc[0]["Process temperature [K]"]

    expected_power = 2 * np.pi * speed * torque / 60
    expected_wear_torque = wear * torque
    expected_temp_diff = process_temp - air_temp

    # モジュールで特徴量生成
    result = prepare_features(sample)

    assert list(result.columns) == MODEL_FEATURES

    np.testing.assert_allclose(
        result["Power [W]"].iloc[0],
        expected_power,
    )

    np.testing.assert_allclose(
        result["Wear-Torque"].iloc[0],
        expected_wear_torque,
    )

    np.testing.assert_allclose(
        result["Temperature difference [K]"].iloc[0],
        expected_temp_diff,
    )

    # カテゴリカル変数が保持されていること
    assert result["Type"].iloc[0] == sample["Type"].iloc[0]
