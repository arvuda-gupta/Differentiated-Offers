from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class WorkspaceCreate(BaseModel):
    name: str
    owner_role: str
    archetype: str
    region: str
    country: str | None = None

class WorkspaceUpdate(BaseModel):
    name: str | None = None
    owner_role: str | None = None
    archetype: str | None = None
    region: str | None = None
    country: str | None = None

class Workspace(BaseModel):
    workspace_id: UUID
    name: str
    owner_role: str
    archetype: str
    region: str
    country: str | None = None
    stage: str
    created_at: datetime
    updated_at: datetime