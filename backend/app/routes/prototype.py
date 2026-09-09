from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException
from psycopg.types.json import Jsonb

from app.agents import PrototypeAgent
from app.database import get_connection
from app.models.prototype import (
    Prototype,
    PrototypeCreate,
    PrototypeUpdate,
)

router = APIRouter(
    prefix="/v1/prototypes",
    tags=["Prototypes"],
)


@router.post("/activate/{concept_id}")
def activate_prototype(
    concept_id: UUID,
    status: str = "draft",
    artifact_uri: Optional[str] = None,
):
    agent = PrototypeAgent()
    result = agent.run(
        concept_id=concept_id,
        status=status,
        artifact_uri=artifact_uri,
    )

    if result.get("status") == "error":
        raise HTTPException(
            status_code=404,
            detail=result.get("message", "Concept for prototype generation not found"),
        )

    return result



@router.post("", response_model=Prototype)
def create_prototype(prototype: PrototypeCreate):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO prototypes (
                    concept_id,
                    status,
                    artifact_uri,
                    evaluation_summary
                )
                VALUES (%s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    prototype.concept_id,
                    prototype.status,
                    prototype.artifact_uri,
                    Jsonb(prototype.evaluation_summary)
                    if prototype.evaluation_summary is not None
                    else None,
                ),
            )

            created_prototype = cursor.fetchone()

    return Prototype(**created_prototype)


@router.get("", response_model=list[Prototype])
def get_all_prototypes():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM prototypes
                ORDER BY created_at DESC;
                """
            )

            prototypes = cursor.fetchall()

    return [Prototype(**prototype) for prototype in prototypes]


@router.get("/{prototype_id}", response_model=Prototype)
def get_prototype(prototype_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM prototypes
                WHERE prototype_id = %s;
                """,
                (prototype_id,),
            )

            prototype = cursor.fetchone()

    if prototype is None:
        raise HTTPException(status_code=404, detail="Prototype not found")

    return Prototype(**prototype)


@router.patch("/{prototype_id}", response_model=Prototype)
def update_prototype(prototype_id: UUID, prototype: PrototypeUpdate):
    update_data = prototype.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    update_fields = []
    update_values = []

    for field, value in update_data.items():
        if field == "evaluation_summary" and value is not None:
            value = Jsonb(value)

        update_fields.append(f"{field} = %s")
        update_values.append(value)

    update_values.append(prototype_id)

    with get_connection() as conn:
        with conn.cursor() as cursor:
            query = f"""
            UPDATE prototypes
            SET {", ".join(update_fields)}
            WHERE prototype_id = %s
            RETURNING *;
            """

            cursor.execute(query, tuple(update_values))

            updated_prototype = cursor.fetchone()

    if updated_prototype is None:
        raise HTTPException(status_code=404, detail="Prototype not found")

    return Prototype(**updated_prototype)


@router.delete("/{prototype_id}", response_model=Prototype)
def delete_prototype(prototype_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM prototypes
                WHERE prototype_id = %s
                RETURNING *;
                """,
                (prototype_id,),
            )

            deleted_prototype = cursor.fetchone()

    if deleted_prototype is None:
        raise HTTPException(status_code=404, detail="Prototype not found")

    return Prototype(**deleted_prototype)