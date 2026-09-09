from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NeedCreate(BaseModel):
    crop: str
    country: str
    category: str
    pain_value_eur_per_ha: float
    description: str
    source: str
    validated_at: datetime | None = None
    validator: str | None = None
    active: bool = True


class NeedUpdate(BaseModel):
    crop: str | None = None
    country: str | None = None
    category: str | None = None
    pain_value_eur_per_ha: float | None = None
    description: str | None = None
    source: str | None = None
    validated_at: datetime | None = None
    validator: str | None = None
    active: bool | None = None


class Need(BaseModel):
    pain_id: UUID
    crop: str
    country: str
    category: str
    pain_value_eur_per_ha: float
    description: str
    source: str
    validated_at: datetime | None
    validator: str | None
    active: bool
    created_at: datetime
    updated_at: datetime