import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import pandas as pd

API_BASE_URL = "http://localhost:8000"
DATA_PATH = Path("data/raw/ai4i2020.csv")

DEMO_MACHINES = [
    {
        "name": "Demo Normal 001",
        "equipment_type": "AI4I Synthetic Machine",
        "udi": 840,
    },
    {
        "name": "Demo Normal 002",
        "equipment_type": "AI4I Synthetic Machine",
        "udi": 921,
    },
    {
        "name": "Demo High Risk 001",
        "equipment_type": "AI4I Synthetic Machine",
        "udi": 7168,
    },
    {
        "name": "Demo High Risk 002",
        "equipment_type": "AI4I Synthetic Machine",
        "udi": 7510,
    },
]


def api_request(method: str, path: str, payload: dict | None = None):
    url = f"{API_BASE_URL}{path}"

    data = None
    headers = {}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(
        url,
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(request, timeout=30) as response:
            return json.load(response)
    except HTTPError as exc:
        detail = exc.read().decode("utf-8")
        raise RuntimeError(
            f"API request failed: {method} {path} status={exc.code} detail={detail}"
        ) from exc
    except URLError as exc:
        raise RuntimeError(f"Cannot connect to API: {url}") from exc


def build_reading_payload(row: pd.Series) -> dict:
    return {
        "product_type": str(row["Type"]),
        "air_temperature": float(row["Air temperature [K]"]),
        "process_temperature": float(row["Process temperature [K]"]),
        "rotational_speed": int(row["Rotational speed [rpm]"]),
        "torque": float(row["Torque [Nm]"]),
        "tool_wear": int(row["Tool wear [min]"]),
    }


def main() -> None:
    df = pd.read_csv(DATA_PATH)

    existing_machines = api_request("GET", "/api/machines")

    for demo in DEMO_MACHINES:
        name = demo["name"]
        udi = demo["udi"]

        print(f"\n=== {name} (UDI: {udi}) ===")

        existing = next(
            (machine for machine in existing_machines if machine["name"] == name),
            None,
        )

        if existing is not None:
            print("登録済みのためスキップします。")
            continue

        rows = df.loc[df["UDI"] == udi]

        if len(rows) != 1:
            raise RuntimeError(
                f"Expected exactly one row for UDI={udi}, found {len(rows)}"
            )

        row = rows.iloc[0]

        machine = api_request(
            "POST",
            "/api/machines",
            {
                "name": name,
                "equipment_type": demo["equipment_type"],
            },
        )

        machine_id = machine["id"]

        reading = api_request(
            "POST",
            f"/api/machines/{machine_id}/readings",
            build_reading_payload(row),
        )

        prediction = api_request(
            "POST",
            f"/api/readings/{reading['id']}/predict",
        )

        actual_failure = int(row["Machine failure"])
        probability = prediction["failure_probability"]
        predicted_failure = prediction["predicted_failure"]

        print(f"設備ID: {machine_id}")
        print(f"正解ラベル: {actual_failure}")
        print(f"故障確率: {probability:.6%}")
        print(
            "予測判定:",
            "高リスク" if predicted_failure else "低リスク",
        )

    print("\nデモデータの登録処理が完了しました。")


if __name__ == "__main__":
    main()
