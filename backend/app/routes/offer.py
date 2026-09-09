from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.database import get_connection
from app.models.offer import Offer, OfferCreate, OfferUpdate


router = APIRouter(
    prefix="/v1/offers",
    tags=["Offer Bank"]
)


@router.post("", response_model=Offer)
def create_offer(offer: OfferCreate):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO offer_bank (
                    name,
                    archetype_code,
                    region,
                    country,
                    component_codes,
                    score,
                    status,
                    lifecycle_state
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    offer.name,
                    offer.archetype_code,
                    offer.region,
                    offer.country,
                    offer.component_codes,
                    offer.score,
                    offer.status,
                    offer.lifecycle_state,
                ),
            )

            created_offer = cursor.fetchone()

    return Offer(**created_offer)


@router.get("", response_model=list[Offer])
def get_all_offers():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM offer_bank
                ORDER BY created_at DESC;
                """
            )

            offers = cursor.fetchall()

    return [Offer(**offer) for offer in offers]


@router.get("/{offer_id}", response_model=Offer)
def get_offer(offer_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM offer_bank
                WHERE offer_id = %s;
                """,
                (offer_id,),
            )

            offer = cursor.fetchone()

    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")

    return Offer(**offer)


@router.patch("/{offer_id}", response_model=Offer)
def update_offer(offer_id: UUID, offer: OfferUpdate):
    update_data = offer.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    update_fields = []
    update_values = []

    for field, value in update_data.items():
        update_fields.append(f"{field} = %s")
        update_values.append(value)

    update_fields.append("updated_at = now()")
    update_values.append(offer_id)

    with get_connection() as conn:
        with conn.cursor() as cursor:
            query = f"""
            UPDATE offer_bank
            SET {", ".join(update_fields)}
            WHERE offer_id = %s
            RETURNING *;
            """

            cursor.execute(query, tuple(update_values))

            updated_offer = cursor.fetchone()

    if updated_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")

    return Offer(**updated_offer)


@router.delete("/{offer_id}", response_model=Offer)
def delete_offer(offer_id: UUID):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM offer_bank
                WHERE offer_id = %s
                RETURNING *;
                """,
                (offer_id,),
            )

            deleted_offer = cursor.fetchone()

    if deleted_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")

    return Offer(**deleted_offer)