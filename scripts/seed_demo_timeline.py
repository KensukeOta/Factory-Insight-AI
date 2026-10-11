import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import pandas as pd

API_BASE_URL = "http://localhost:8000"
DATA_PATH = Path("data/raw/ai4i2020.csv")
MANIFEST_PATH = Path("backups/demo_timeline_manifest.json")

DEMO_TIMELINES = {
    "Demo Normal 001": [7423, 7256, 6675, 9666],
    "Demo Normal 002": [5550, 9339, 3857, 5308],
    "Demo High Risk 001": [4755, 5989, 7885, 4284],
    "Demo High Risk 002": [4903, 8197, 9672, 7012],
}


def api_request(method: str, path: str, payload: dict | None = None):
    data = None
    headers = {}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(
        f"{API_BASE_URL}{path}",
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(request, timeout=30) as response:
            return json.load(response)
    except HTTPError as exc:
        detail = exc.read().decode("utf-8")
        raise RuntimeError(f"{method} {path}: HTTP {exc.code} {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"API connection failed: {exc}") from exc


def reading_payload(row: pd.Series) -> dict:
    return {
        "product_type": str(row["Type"]),
        "air_temperature": float(row["Air temperature [K]"]),
        "process_temperature": float(row["Process temperature [K]"]),
        "rotational_speed": int(row["Rotational speed [rpm]"]),
        "torque": float(row["Torque [Nm]"]),
        "tool_wear": int(row["Tool wear [min]"]),
    }


def save_manifest(manifest: dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)

    temp_path = MANIFEST_PATH.with_suffix(".tmp")
    temp_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temp_path.replace(MANIFEST_PATH)


def main() -> None:
    if MANIFEST_PATH.exists():
        raise RuntimeError(
            f"{MANIFEST_PATH} already exists. "
            "Do not rerun without checking the previous operation."
        )

    df = pd.read_csv(DATA_PATH)
    machines = api_request("GET", "/api/machines")

    expected_names = set(DEMO_TIMELINES)
    actual_names = {machine["name"] for machine in machines}

    if actual_names != expected_names or len(machines) != 4:
        raise RuntimeError(
            f"Expected exactly the four demo machines. Found: {sorted(actual_names)}"
        )

    if df["UDI"].duplicated().any():
        raise RuntimeError("Duplicate UDI values in dataset")

    rows_by_udi = df.set_index("UDI")

    manifest = {"records": []}
    save_manifest(manifest)

    for machine_name, udis in DEMO_TIMELINES.items():
        machine = next(item for item in machines if item["name"] == machine_name)
        machine_id = machine["id"]

        existing_readings = api_request("GET", f"/api/machines/{machine_id}/readings")
        existing_predictions = api_request(
            "GET", f"/api/machines/{machine_id}/predictions"
        )

        if len(existing_readings) != 1 or len(existing_predictions) != 1:
            raise RuntimeError(f"Unexpected existing history for {machine_name}")

        for order, udi in enumerate(udis, start=1):
            row = rows_by_udi.loc[udi]
            payload = reading_payload(row)

            reading = api_request(
                "POST",
                f"/api/machines/{machine_id}/readings",
                payload,
            )

            # Record the reading immediately so partial failures are traceable.
            record = {
                "machine_name": machine_name,
                "machine_id": machine_id,
                "udi": udi,
                "order": order,
                "reading_id": reading["id"],
                "prediction_id": None,
            }
            manifest["records"].append(record)
            save_manifest(manifest)

            prediction = api_request(
                "POST",
                f"/api/readings/{reading['id']}/predict",
            )

            record["prediction_id"] = prediction["id"]
            record["failure_probability"] = prediction["failure_probability"]
            record["predicted_failure"] = prediction["predicted_failure"]
            save_manifest(manifest)

            print(
                f"{machine_name} | UDI={udi} | "
                f"故障確率={prediction['failure_probability']:.4%}"
            )

    print("\n16件の追加登録が完了しました。")
    print(f"マニフェスト: {MANIFEST_PATH}")
    print("※ 日時の調整はまだ実施していません。")


if __name__ == "__main__":
    main()
