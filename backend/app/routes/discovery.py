from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.agents import DiscoveryAgent
from app.database import get_connection
from app.models.discovery import (
    Discovery,
    DiscoveryCreate,
    DiscoveryUpdate,
)

router = APIRouter()


@router.post("/v1/workspace/{workspace_id}/activate-discovery")
def activate_discovery(workspace_id: UUID):
    agent = DiscoveryAgent()
    result = agent.run(workspace_id)

    if result.get("status") == "error":
        raise HTTPException(
            status_code=404,
            detail=result.get("message", "Workspace not found"),
        )

    return result


@router.post("/v1/discovery")
def create_discovery(discovery: DiscoveryCreate):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO discoveries (
                    workspace_id,
                    prompt,
                    status
                )
                VALUES (%s, %s, %s)
                RETURNING *;
                """,
                (
                    discovery.workspace_id,
                    discovery.prompt,
                    "pending"
                )
            )

            created_discovery = cursor.fetchone()
    return Discovery(**created_discovery)

@router.get("/v1/discovery/{discovery_id}")
def get_discovery(discovery_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM discoveries
                WHERE discovery_id = %s;
                """,
                (discovery_id,)
            )

            discovery = cursor.fetchone()

            if discovery is None:
                raise HTTPException(
                    status_code=404,
                    detail="Discovery not found"
                )

    return Discovery(**discovery)

@router.get("/v1/discoveries")
def get_discoveries():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM discoveries;
                """
            )

            discoveries = cursor.fetchall()

    return [
        Discovery(**discovery)
        for discovery in discoveries
    ]
@router.patch("/v1/discovery/{discovery_id}")
def update_discovery(
    discovery_id: UUID,
    discovery_update: DiscoveryUpdate,
):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM discoveries
                WHERE discovery_id = %s;
                """,
                (discovery_id,)
            )

            discovery = cursor.fetchone()

            if discovery is None:
                raise HTTPException(
                    status_code=404,
                    detail="Discovery not found"
                )

            update_data = {}

            if discovery_update.prompt is not None:
                update_data["prompt"] = discovery_update.prompt

            if discovery_update.status is not None:
                update_data["status"] = discovery_update.status
            update_fields = []
            update_values = []
            for field, value in update_data.items():
                    update_fields.append(f"{field} = %s")
                    update_values.append(value)
            query = f"""
            UPDATE discoveries
            SET {", ".join(update_fields)}
            WHERE discovery_id = %s
            RETURNING *;
            """
            cursor.execute(
                query,
                tuple(update_values)
            )

            updated_discovery = cursor.fetchone()

    return Discovery(**updated_discovery)

@router.delete("/v1/discovery/{discovery_id}")
def delete_discovery(
    discovery_id: UUID,
):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM discoveries
                WHERE discovery_id = %s;
                """,
                (discovery_id,)
            )

            discovery = cursor.fetchone()

            if discovery is None:
                raise HTTPException(
                    status_code=404,
                    detail="Discovery not found"
                )

            cursor.execute(
                """
                DELETE FROM discoveries
                WHERE discovery_id = %s
                RETURNING *;
                """,
                (discovery_id,)
            )

            deleted_discovery = cursor.fetchone()

    return Discovery(**deleted_discovery)