import json
from pathlib import Path
from uuid import UUID

MANIFEST_PATH = Path("backups/demo_timeline_manifest.json")
OUTPUT_PATH = Path("backups/adjust_demo_timeline.sql")

EXPECTED_MACHINES = {
    "Demo Normal 001",
    "Demo Normal 002",
    "Demo High Risk 001",
    "Demo High Risk 002",
}


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    records = manifest["records"]

    if len(records) != 16:
        raise RuntimeError(f"Expected 16 records, found {len(records)}")

    machine_names = {record["machine_name"] for record in records}
    if machine_names != EXPECTED_MACHINES:
        raise RuntimeError("Unexpected machine names in manifest")

    if len({record["reading_id"] for record in records}) != 16:
        raise RuntimeError("Duplicate reading IDs")

    if len({record["prediction_id"] for record in records}) != 16:
        raise RuntimeError("Duplicate prediction IDs")

    for record in records:
        UUID(record["machine_id"])
        UUID(record["reading_id"])
        UUID(record["prediction_id"])

        if record["order"] not in {1, 2, 3, 4}:
            raise RuntimeError("Invalid timeline order")

    lines = [
        "BEGIN;",
        "",
        "CREATE TEMP TABLE timeline_updates (",
        "    machine_id UUID NOT NULL,",
        "    reading_id UUID PRIMARY KEY,",
        "    prediction_id UUID UNIQUE NOT NULL,",
        "    timeline_order INTEGER NOT NULL",
        ") ON COMMIT DROP;",
        "",
        "INSERT INTO timeline_updates VALUES",
    ]

    values = []

    for record in records:
        values.append(
            "("
            f"'{record['machine_id']}', "
            f"'{record['reading_id']}', "
            f"'{record['prediction_id']}', "
            f"{record['order']}"
            ")"
        )

    lines.append(",\n".join(values) + ";")
    lines.extend(
        [
            "",
            "DO $$",
            "DECLARE",
            "    matched_count INTEGER;",
            "BEGIN",
            "    SELECT COUNT(*) INTO matched_count",
            "    FROM timeline_updates t",
            "    JOIN sensor_readings sr",
            "      ON sr.id = t.reading_id",
            "     AND sr.machine_id = t.machine_id",
            "    JOIN predictions p",
            "      ON p.id = t.prediction_id",
            "     AND p.sensor_reading_id = t.reading_id",
            "     AND p.machine_id = t.machine_id;",
            "",
            "    IF matched_count <> 16 THEN",
            "        RAISE EXCEPTION",
            "            'Expected 16 matching reading/prediction pairs, found %',",
            "            matched_count;",
            "    END IF;",
            "END $$;",
            "",
            "CREATE TEMP TABLE timeline_baselines ON COMMIT DROP AS",
            "SELECT",
            "    m.id AS machine_id,",
            "    p.predicted_at AS baseline_at",
            "FROM machines m",
            "JOIN predictions p ON p.machine_id = m.id",
            "WHERE m.id IN (SELECT DISTINCT machine_id FROM timeline_updates)",
            "  AND p.id NOT IN (SELECT prediction_id FROM timeline_updates);",
            "",
            "DO $$",
            "BEGIN",
            "    IF (SELECT COUNT(*) FROM timeline_baselines) <> 4 THEN",
            "        RAISE EXCEPTION 'Expected exactly 4 baseline predictions';",
            "    END IF;",
            "END $$;",
            "",
            "UPDATE sensor_readings sr",
            "SET measured_at = b.baseline_at",
            "    - ((5 - t.timeline_order) * INTERVAL '1 day')",
            "FROM timeline_updates t",
            "JOIN timeline_baselines b ON b.machine_id = t.machine_id",
            "WHERE sr.id = t.reading_id",
            "  AND sr.machine_id = t.machine_id;",
            "",
            "UPDATE predictions p",
            "SET predicted_at = b.baseline_at",
            "    - ((5 - t.timeline_order) * INTERVAL '1 day')",
            "FROM timeline_updates t",
            "JOIN timeline_baselines b ON b.machine_id = t.machine_id",
            "WHERE p.id = t.prediction_id",
            "  AND p.machine_id = t.machine_id",
            "  AND p.sensor_reading_id = t.reading_id;",
            "",
            "COMMIT;",
        ]
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        "\n".join(lines) + "\n",
        encoding="utf-8",
    )

    print(f"SQL generated: {OUTPUT_PATH}")
    print(f"Target records: {len(records)}")


if __name__ == "__main__":
    main()
