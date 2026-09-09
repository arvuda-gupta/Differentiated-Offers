from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class OfferCreate(BaseModel):
    name: str
    archetype_code: str
    region: str
    country: Optional[str] = None
    component_codes: list[str]
    score: Optional[Decimal] = None
    status: str = "active"
    lifecycle_state: str = "live"


class OfferUpdate(BaseModel):
    name: Optional[str] = None
    archetype_code: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    component_codes: Optional[list[str]] = None
    score: Optional[Decimal] = None
    status: Optional[str] = None
    lifecycle_state: Optional[str] = None


class Offer(BaseModel):
    offer_id: UUID
    name: str
    archetype_code: str
    region: str
    country: Optional[str]
    component_codes: list[str]
    score: Optional[Decimal]
    status: str
    lifecycle_state: str
    created_at: datetime
    updated_at: datetime