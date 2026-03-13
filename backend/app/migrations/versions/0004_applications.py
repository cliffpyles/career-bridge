"""applications and application_events tables

Revision ID: 0004
Revises: 0003
Create Date: 2026-03-13 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "applications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("company", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("applied_date", sa.Date(), nullable=False),
        sa.Column("next_action", sa.String(), nullable=True),
        sa.Column("next_action_date", sa.Date(), nullable=True),
        sa.Column("resume_id", sa.Uuid(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_applications_id"), "applications", ["id"], unique=False)
    op.create_index(op.f("ix_applications_user_id"), "applications", ["user_id"], unique=False)
    op.create_index(op.f("ix_applications_company"), "applications", ["company"], unique=False)
    op.create_index(op.f("ix_applications_role"), "applications", ["role"], unique=False)
    op.create_index(op.f("ix_applications_status"), "applications", ["status"], unique=False)
    op.create_index(
        op.f("ix_applications_next_action_date"),
        "applications",
        ["next_action_date"],
        unique=False,
    )
    op.create_index(op.f("ix_applications_resume_id"), "applications", ["resume_id"], unique=False)

    op.create_table(
        "application_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("application_id", sa.Uuid(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_application_events_id"), "application_events", ["id"], unique=False)
    op.create_index(
        op.f("ix_application_events_application_id"),
        "application_events",
        ["application_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_application_events_event_type"),
        "application_events",
        ["event_type"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_application_events_event_type"), table_name="application_events")
    op.drop_index(op.f("ix_application_events_application_id"), table_name="application_events")
    op.drop_index(op.f("ix_application_events_id"), table_name="application_events")
    op.drop_table("application_events")

    op.drop_index(op.f("ix_applications_resume_id"), table_name="applications")
    op.drop_index(op.f("ix_applications_next_action_date"), table_name="applications")
    op.drop_index(op.f("ix_applications_status"), table_name="applications")
    op.drop_index(op.f("ix_applications_role"), table_name="applications")
    op.drop_index(op.f("ix_applications_company"), table_name="applications")
    op.drop_index(op.f("ix_applications_user_id"), table_name="applications")
    op.drop_index(op.f("ix_applications_id"), table_name="applications")
    op.drop_table("applications")
