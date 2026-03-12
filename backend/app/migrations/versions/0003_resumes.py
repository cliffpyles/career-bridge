"""resumes and resume_versions tables

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-12 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "resumes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("sections", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_resumes_id"), "resumes", ["id"], unique=False)
    op.create_index(op.f("ix_resumes_user_id"), "resumes", ["user_id"], unique=False)
    op.create_index(op.f("ix_resumes_name"), "resumes", ["name"], unique=False)

    op.create_table(
        "resume_versions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("resume_id", sa.Uuid(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("sections", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_resume_versions_id"), "resume_versions", ["id"], unique=False)
    op.create_index(
        op.f("ix_resume_versions_resume_id"),
        "resume_versions",
        ["resume_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_resume_versions_resume_id"), table_name="resume_versions")
    op.drop_index(op.f("ix_resume_versions_id"), table_name="resume_versions")
    op.drop_table("resume_versions")
    op.drop_index(op.f("ix_resumes_name"), table_name="resumes")
    op.drop_index(op.f("ix_resumes_user_id"), table_name="resumes")
    op.drop_index(op.f("ix_resumes_id"), table_name="resumes")
    op.drop_table("resumes")
