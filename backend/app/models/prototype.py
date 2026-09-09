from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PrototypeCreate(BaseModel):
    concept_id: UUID
    status: str
    artifact_uri: Optional[str] = None
    evaluation_summary: Optional[dict] = None


class PrototypeUpdate(BaseModel):
    status: Optional[str] = None
    artifact_uri: Optional[str] = None
    evaluation_summary: Optional[dict] = None


class Prototype(BaseModel):
    prototype_id: UUID
    concept_id: UUID
    status: str
    artifact_uri: Optional[str]
    evaluation_summary: Optional[dict]
    created_at: datetime