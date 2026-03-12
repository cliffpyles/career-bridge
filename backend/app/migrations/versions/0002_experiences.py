"""experiences table

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-12 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "experiences",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("organization", sa.String(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("impact_metrics", sa.Text(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_experiences_id"), "experiences", ["id"], unique=False)
    op.create_index(op.f("ix_experiences_user_id"), "experiences", ["user_id"], unique=False)
    op.create_index(op.f("ix_experiences_type"), "experiences", ["type"], unique=False)
    op.create_index(op.f("ix_experiences_title"), "experiences", ["title"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_experiences_title"), table_name="experiences")
    op.drop_index(op.f("ix_experiences_type"), table_name="experiences")
    op.drop_index(op.f("ix_experiences_user_id"), table_name="experiences")
    op.drop_index(op.f("ix_experiences_id"), table_name="experiences")
    op.drop_table("experiences")
