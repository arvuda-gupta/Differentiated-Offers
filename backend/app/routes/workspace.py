import random
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.database import get_connection
from app.models.workspace import (
    Workspace,
    WorkspaceCreate,
    WorkspaceUpdate,
)

router = APIRouter()


@router.post("/v1/workspace")
@router.post("/v1/workspaces")
def create_workspace(workspace: WorkspaceCreate):
    days_ago = random.randint(30, 365)
    hours_offset = random.randint(0, 23)
    minutes_offset = random.randint(0, 59)
    created_at = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=hours_offset, minutes=minutes_offset)
    updated_at = created_at + timedelta(hours=random.randint(1, 48), minutes=random.randint(0, 59))

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO workspaces (
                    name,
                    owner_role,
                    archetype,
                    region,
                    country,
                    created_at,
                    updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    workspace.name,
                    workspace.owner_role,
                    workspace.archetype,
                    workspace.region,
                    workspace.country,
                    created_at,
                    updated_at,
                ),
            )

            created_workspace = cursor.fetchone()

    return Workspace(**created_workspace)


@router.get("/v1/workspace/{workspace_id}")
@router.get("/v1/workspaces/{workspace_id}")
def get_workspace(workspace_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM workspaces
                WHERE workspace_id = %s;
                """,
                (workspace_id,),
            )

            workspace = cursor.fetchone()

    if workspace is None:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return Workspace(**workspace)


@router.get("/v1/workspace")
@router.get("/v1/workspaces")
def get_workspaces():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM workspaces;
                """
            )

            workspaces = cursor.fetchall()

    return [Workspace(**workspace) for workspace in workspaces]


@router.patch("/v1/workspace/{workspace_id}")
@router.patch("/v1/workspaces/{workspace_id}")
def update_workspace(workspace_id: UUID, workspace_update: WorkspaceUpdate):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            update_data = workspace_update.model_dump(exclude_none=True)

            set_clause = ", ".join(f"{field} = %s" for field in update_data.keys())

            values = list(update_data.values())
            values.append(workspace_id)

            cursor.execute(
                f"""
                UPDATE workspaces
                SET {set_clause}
                WHERE workspace_id = %s
                RETURNING *;
                """,
                values,
            )

            updated_workspace = cursor.fetchone()

    if updated_workspace is None:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return Workspace(**updated_workspace)


@router.delete("/v1/workspace/{workspace_id}")
@router.delete("/v1/workspaces/{workspace_id}")
def delete_workspace(workspace_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM workspaces
                WHERE workspace_id = %s
                RETURNING *;
                """,
                (workspace_id,),
            )

            deleted_workspace = cursor.fetchone()

    if deleted_workspace is None:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return Workspace(**deleted_workspace)