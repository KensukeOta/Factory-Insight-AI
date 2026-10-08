import numpy as np
import pandas as pd

NUMERIC_FEATURES = [
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]",
    "Power [W]",
    "Wear-Torque",
    "Temperature difference [K]",
]

CATEGORICAL_FEATURES = [
    "Type",
]

MODEL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def add_derived_features(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """Add derived features used by the failure prediction model."""

    featured_df = df.copy()

    featured_df["Power [W]"] = (
        2
        * np.pi
        * featured_df["Rotational speed [rpm]"]
        * featured_df["Torque [Nm]"]
        / 60
    )

    featured_df["Wear-Torque"] = (
        featured_df["Tool wear [min]"] * featured_df["Torque [Nm]"]
    )

    featured_df["Temperature difference [K]"] = (
        featured_df["Process temperature [K]"] - featured_df["Air temperature [K]"]
    )

    return featured_df


def select_model_features(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """Select features used by the failure prediction model."""

    return df[MODEL_FEATURES].copy()


def prepare_features(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """Generate and select all features required by the model."""

    featured_df = add_derived_features(df)

    return select_model_features(featured_df)
