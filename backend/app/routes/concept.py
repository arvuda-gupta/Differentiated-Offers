from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException
from psycopg.types.json import Jsonb

from app.agents import ConceptAgent
from app.database import get_connection
from app.models.concept import (
    Concept,
    ConceptCreate,
    ConceptUpdate,
)

router = APIRouter(
    prefix="/v1/concepts",
    tags=["Concepts"],
)


@router.post("/activate/{workspace_id}")
def activate_concept(
    workspace_id: UUID,
    problem_statement_ref: Optional[UUID] = None,
    concept_input: Optional[Dict[str, Any]] = None,
):
    agent = ConceptAgent()
    result = agent.run(
        workspace_id=workspace_id,
        problem_statement_ref=problem_statement_ref,
        concept_input=concept_input,
    )

    if result.get("status") == "error":
        raise HTTPException(
            status_code=404,
            detail=result.get("message", "Concept evaluation context not found"),
        )

    return result



@router.post("", response_model=Concept)
def create_concept(concept: ConceptCreate):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO concepts (
                    workspace_id,
                    problem_statement_ref,
                    differentiation_score,
                    kill_filter_result,
                    duplicate_score,
                    top_duplicates,
                    guardrail_flags,
                    decision,
                    decided_at,
                    decided_by
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    concept.workspace_id,
                    concept.problem_statement_ref,
                    Jsonb(concept.differentiation_score) if concept.differentiation_score is not None else None,
                    Jsonb(concept.kill_filter_result) if concept.kill_filter_result is not None else None,
                    concept.duplicate_score,
                    Jsonb(concept.top_duplicates) if concept.top_duplicates is not None else None,
                    Jsonb(concept.guardrail_flags) if concept.guardrail_flags is not None else None,
                    concept.decision,
                    concept.decided_at,
                    concept.decided_by,
                ),
            )

            created_concept = cursor.fetchone()

    return Concept(**created_concept)


@router.get("", response_model=list[Concept])
def get_all_concepts():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM concepts
                ORDER BY created_at DESC;
                """
            )

            concepts = cursor.fetchall()

    return [Concept(**concept) for concept in concepts]


@router.get("/{concept_id}", response_model=Concept)
def get_concept(concept_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM concepts
                WHERE concept_id = %s;
                """,
                (concept_id,),
            )

            concept = cursor.fetchone()

    if concept is None:
        raise HTTPException(status_code=404, detail="Concept not found")

    return Concept(**concept)


@router.patch("/{concept_id}", response_model=Concept)
def update_concept(concept_id: UUID, concept: ConceptUpdate):
    update_data = concept.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    update_fields = []
    update_values = []

    for field, value in update_data.items():
        if field in [
            "differentiation_score",
            "kill_filter_result",
            "top_duplicates",
            "guardrail_flags",
        ] and value is not None:
            value = Jsonb(value)

        update_fields.append(f"{field} = %s")
        update_values.append(value)

    update_values.append(concept_id)

    with get_connection() as conn:
        with conn.cursor() as cursor:
            query = f"""
            UPDATE concepts
            SET {", ".join(update_fields)}
            WHERE concept_id = %s
            RETURNING *;
            """

            cursor.execute(query, tuple(update_values))

            updated_concept = cursor.fetchone()

    if updated_concept is None:
        raise HTTPException(status_code=404, detail="Concept not found")

    return Concept(**updated_concept)


@router.delete("/{concept_id}", response_model=Concept)
def delete_concept(concept_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM concepts
                WHERE concept_id = %s
                RETURNING *;
                """,
                (concept_id,),
            )

            deleted_concept = cursor.fetchone()

    if deleted_concept is None:
        raise HTTPException(status_code=404, detail="Concept not found")

    return Concept(**deleted_concept)