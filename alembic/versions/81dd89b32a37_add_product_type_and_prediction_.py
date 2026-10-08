"""add product type and prediction consistency constraint

Revision ID: 81dd89b32a37
Revises: dc3a8adb81c7
Create Date: 2026-10-08 22:02:44.015738

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '81dd89b32a37'
down_revision: Union[str, Sequence[str], None] = 'dc3a8adb81c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "sensor_readings",
        sa.Column(
            "product_type",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "uq_sensor_reading_id_machine_id",
        "sensor_readings",
        ["id", "machine_id"],
    )

    op.drop_constraint(
        "predictions_sensor_reading_id_fkey",
        "predictions",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "fk_prediction_reading_machine",
        "predictions",
        "sensor_readings",
        ["sensor_reading_id", "machine_id"],
        ["id", "machine_id"],
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_prediction_reading_machine",
        "predictions",
        type_="foreignkey",
    )

    op.create_foreign_key(
        "predictions_sensor_reading_id_fkey",
        "predictions",
        "sensor_readings",
        ["sensor_reading_id"],
        ["id"],
    )

    op.drop_constraint(
        "uq_sensor_reading_id_machine_id",
        "sensor_readings",
        type_="unique",
    )

    op.drop_column(
        "sensor_readings",
        "product_type",
    )
    # ### end Alembic commands ###
