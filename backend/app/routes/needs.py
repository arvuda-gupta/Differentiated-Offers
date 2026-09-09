from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.database import get_connection
from app.models.need import Need, NeedCreate, NeedUpdate

router = APIRouter(
    prefix="/v1/needs",
    tags=["Needs Bank"]
)

@router.post("", response_model=Need)
def create_need(need: NeedCreate):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO needs_bank (
                    crop,
                    country,
                    category,
                    pain_value_eur_per_ha,
                    description,
                    source,
                    validated_at,
                    validator,
                    active
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    need.crop,
                    need.country,
                    need.category,
                    need.pain_value_eur_per_ha,
                    need.description,
                    need.source,
                    need.validated_at,
                    need.validator,
                    need.active,
                )
            )

            created_need = cursor.fetchone()

    return Need(**created_need)

@router.get("", response_model=list[Need])
def get_all_needs():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM needs_bank
                ORDER BY created_at DESC;
                """
            )

            needs = cursor.fetchall()

    return [Need(**need) for need in needs]

@router.get("/{pain_id}", response_model=Need)
def get_need(pain_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM needs_bank
                WHERE pain_id = %s;
                """,
                (pain_id,)
            )

            need = cursor.fetchone()

    if need is None:
        raise HTTPException(status_code=404, detail="Need not found")

    return Need(**need)

@router.patch("/{pain_id}", response_model=Need)
def update_need(pain_id: UUID, need: NeedUpdate):
    update_data = need.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    update_fields = []
    update_values = []

    for field, value in update_data.items():
        update_fields.append(f"{field} = %s")
        update_values.append(value)

    update_fields.append("updated_at = now()")
    update_values.append(pain_id)

    with get_connection() as conn:
        with conn.cursor() as cursor:
            query = f"""
            UPDATE needs_bank
            SET {", ".join(update_fields)}
            WHERE pain_id = %s
            RETURNING *;
            """

            cursor.execute(query, tuple(update_values))

            updated_need = cursor.fetchone()

    if updated_need is None:
        raise HTTPException(status_code=404, detail="Need not found")

    return Need(**updated_need)

@router.delete("/{pain_id}", response_model=Need)
def delete_need(pain_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM needs_bank
                WHERE pain_id = %s
                RETURNING *;
                """,
                (pain_id,)
            )

            deleted_need = cursor.fetchone()

    if deleted_need is None:
        raise HTTPException(status_code=404, detail="Need not found")

    return Need(**deleted_need)



