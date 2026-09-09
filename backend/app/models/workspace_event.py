from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class WorkspaceEventCreate(BaseModel):
    workspace_id: UUID
    event_type: str
    payload: Optional[dict] = None
    actor: str


class WorkspaceEventUpdate(BaseModel):
    event_type: Optional[str] = None
    payload: Optional[dict] = None
    actor: Optional[str] = None


class WorkspaceEvent(BaseModel):
    event_id: UUID
    workspace_id: UUID
    event_type: str
    payload: Optional[dict]
    actor: str
    occurred_at: datetime