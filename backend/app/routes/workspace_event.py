from uuid import UUID

from fastapi import APIRouter, HTTPException
from psycopg.types.json import Jsonb

from app.database import get_connection
from app.models.workspace_event import (
    WorkspaceEvent,
    WorkspaceEventCreate,
    WorkspaceEventUpdate,
)

router = APIRouter(
    prefix="/v1/workspace-events",
    tags=["Workspace Events"],
)


@router.post("", response_model=WorkspaceEvent)
def create_workspace_event(event: WorkspaceEventCreate):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO workspace_events (
                    workspace_id,
                    event_type,
                    payload,
                    actor
                )
                VALUES (%s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    event.workspace_id,
                    event.event_type,
                    Jsonb(event.payload) if event.payload is not None else None,
                    event.actor,
                ),
            )

            created_event = cursor.fetchone()

    return WorkspaceEvent(**created_event)


@router.get("", response_model=list[WorkspaceEvent])
def get_all_workspace_events():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM workspace_events
                ORDER BY occurred_at DESC;
                """
            )

            events = cursor.fetchall()

    return [WorkspaceEvent(**event) for event in events]


@router.get("/{event_id}", response_model=WorkspaceEvent)
def get_workspace_event(event_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM workspace_events
                WHERE event_id = %s;
                """,
                (event_id,),
            )

            event = cursor.fetchone()

    if event is None:
        raise HTTPException(status_code=404, detail="Workspace event not found")

    return WorkspaceEvent(**event)


@router.patch("/{event_id}", response_model=WorkspaceEvent)
def update_workspace_event(event_id: UUID, event: WorkspaceEventUpdate):
    update_data = event.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    update_fields = []
    update_values = []

    for field, value in update_data.items():
        if field == "payload" and value is not None:
            value = Jsonb(value)

        update_fields.append(f"{field} = %s")
        update_values.append(value)

    update_values.append(event_id)

    with get_connection() as conn:
        with conn.cursor() as cursor:
            query = f"""
            UPDATE workspace_events
            SET {", ".join(update_fields)}
            WHERE event_id = %s
            RETURNING *;
            """

            cursor.execute(query, tuple(update_values))

            updated_event = cursor.fetchone()

    if updated_event is None:
        raise HTTPException(status_code=404, detail="Workspace event not found")

    return WorkspaceEvent(**updated_event)


@router.delete("/{event_id}", response_model=WorkspaceEvent)
def delete_workspace_event(event_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM workspace_events
                WHERE event_id = %s
                RETURNING *;
                """,
                (event_id,),
            )

            deleted_event = cursor.fetchone()

    if deleted_event is None:
        raise HTTPException(status_code=404, detail="Workspace event not found")

    return WorkspaceEvent(**deleted_event)