from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ConceptCreate(BaseModel):
    workspace_id: UUID
    problem_statement_ref: Optional[UUID] = None
    differentiation_score: Optional[dict] = None
    kill_filter_result: Optional[dict] = None
    duplicate_score: Optional[Decimal] = None
    top_duplicates: Optional[dict] = None
    guardrail_flags: Optional[dict] = None
    decision: Optional[str] = None
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None


class ConceptUpdate(BaseModel):
    problem_statement_ref: Optional[UUID] = None
    differentiation_score: Optional[dict] = None
    kill_filter_result: Optional[dict] = None
    duplicate_score: Optional[Decimal] = None
    top_duplicates: Optional[dict] = None
    guardrail_flags: Optional[dict] = None
    decision: Optional[str] = None
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None


class Concept(BaseModel):
    concept_id: UUID
    workspace_id: UUID
    problem_statement_ref: Optional[UUID]
    differentiation_score: Optional[dict]
    kill_filter_result: Optional[dict]
    duplicate_score: Optional[Decimal]
    top_duplicates: Optional[dict]
    guardrail_flags: Optional[dict]
    decision: Optional[str]
    decided_at: Optional[datetime]
    decided_by: Optional[str]
    created_at: datetime