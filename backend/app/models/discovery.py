from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

class DiscoveryCreate(BaseModel):
    workspace_id: UUID
    prompt: str

class DiscoveryUpdate(BaseModel):
    prompt: str | None = None
    status: str | None = None


class Discovery(BaseModel):
    discovery_id: UUID
    workspace_id: UUID
    prompt: str
    status: str
    created_at: datetime
    updated_at: datetime