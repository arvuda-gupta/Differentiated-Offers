import json
import time
from typing import Any, Dict, List, Optional
from uuid import UUID

import psycopg
from app.agents.base_agent import BaseAgent
from app.database import get_connection
from app.llm_client import LLMClient
from app.logger import logger


class ConceptAgent(BaseAgent):
    """
    Concept Agent Pipeline

    Responsible for autonomous concept evaluation, differentiation scoring,
    duplicate checking, kill filtering, and guardrail validation for Stage 2 Workspaces.
    """

    # Documented scoring weights (docs/02_2._Technical_Architecture_&_Wiring.md Section 11)
    WEIGHT_FARMER_VALUE = 0.35
    WEIGHT_COMMERCIAL_VIABILITY = 0.30
    WEIGHT_FEASIBILITY = 0.20
    WEIGHT_STRATEGIC_FIT = 0.15
    PASS_THRESHOLD = 6.5

    def __init__(self) -> None:
        self.llm_client = LLMClient()

    def run(
        self,
        workspace_id: UUID,
        problem_statement_ref: Optional[UUID] = None,
        concept_input: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Main execution pipeline for Stage 2 Concept Evaluation.

        Execution Flow:
        1. Load Workspace context (stop if missing)
        2. Load Stage 1 Discovery context (stop if missing)
        3. Load existing commercial offers for duplicate checking baseline
        4. Assemble structured concept evaluation context
        5. Build LLM evaluation prompt
        6. Invoke LLM and retrieve raw evaluation response
        7. Parse raw response and apply documented business scoring rules
        8. Persist evaluated concept record into PostgreSQL database
        """
        start_time = time.time()
        logger.info(f"Starting ConceptAgent run for workspace: {workspace_id}")

        try:
            # Step 1: Load workspace details from database
            workspace_data = self._load_workspace_context(workspace_id)
            if not workspace_data:
                logger.warning(f"ConceptAgent run aborted: Workspace '{workspace_id}' not found.")
                return {
                    "status": "error",
                    "message": f"Workspace '{workspace_id}' not found.",
                }

            # Step 2: Load Stage 1 Discovery problem statement context
            discovery_data = self._load_discovery_context(workspace_id, problem_statement_ref)
            if not discovery_data:
                logger.warning(f"ConceptAgent run aborted: Discovery context for workspace '{workspace_id}' not found.")
                return {
                    "status": "error",
                    "message": f"Discovery context for workspace '{workspace_id}' not found.",
                }

            discovery_id = discovery_data.get("discovery_id")

            # Step 3: Retrieve existing related offers from Offer Bank for baseline comparison
            offers = self._load_existing_offers(workspace_data)

            # Step 4: Assemble structured concept evaluation context
            concept_context = self._prepare_concept_context(
                workspace_data=workspace_data,
                discovery_data=discovery_data,
                offers=offers,
                concept_input=concept_input,
            )

            # Step 5: Build evaluation prompt
            prompt = self._build_evaluation_prompt(concept_context)

            # Step 6: Invoke LLM and retrieve raw response
            raw_response = self._call_llm(prompt)

            # Step 7: Parse response and calculate decision verdict using documented rules
            parsed_evaluation = self._parse_evaluation_response(raw_response)

            # Step 8: Persist evaluated concept record into database
            saved_concept = self._save_concept(
                workspace_id=workspace_id,
                problem_statement_ref=discovery_id,
                parsed_evaluation=parsed_evaluation,
            )

            duration = round(time.time() - start_time, 3)
            logger.info(f"Finished ConceptAgent run for workspace {workspace_id} in {duration}s")

            return {
                "status": "success",
                "workspace_id": str(workspace_id),
                "problem_statement_ref": str(discovery_id) if discovery_id else None,
                "context": concept_context,
                "evaluation": parsed_evaluation,
                "saved_concept": saved_concept,
            }

        except Exception as err:
            duration = round(time.time() - start_time, 3)
            logger.error(f"Failed ConceptAgent run for workspace {workspace_id} after {duration}s: {err}")
            raise



    def _load_workspace_context(self, workspace_id: UUID) -> Dict[str, Any]:
        """
        Retrieves workspace context from PostgreSQL `workspaces` table.
        Lists explicit column names (no SELECT *).
        """
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT workspace_id, name, owner_role, archetype, region, country, stage, created_at, updated_at
                        FROM workspaces
                        WHERE workspace_id = %s;
                        """,
                        (workspace_id,),
                    )
                    workspace = cursor.fetchone()

            return dict(workspace) if workspace else {}
        except psycopg.Error:
            return {}

    def _load_discovery_context(
        self, workspace_id: UUID, problem_statement_ref: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """
        Retrieves Stage 1 Discovery context from PostgreSQL `discoveries` table.
        Lists explicit column names (no SELECT *).
        """
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    if problem_statement_ref:
                        cursor.execute(
                            """
                            SELECT discovery_id, workspace_id, prompt, status, created_at, updated_at
                            FROM discoveries
                            WHERE discovery_id = %s;
                            """,
                            (problem_statement_ref,),
                        )
                    else:
                        cursor.execute(
                            """
                            SELECT discovery_id, workspace_id, prompt, status, created_at, updated_at
                            FROM discoveries
                            WHERE workspace_id = %s
                            ORDER BY created_at DESC
                            LIMIT 1;
                            """,
                            (workspace_id,),
                        )
                    discovery = cursor.fetchone()

            return dict(discovery) if discovery else {}
        except psycopg.Error:
            return {}

    def _load_existing_offers(self, workspace_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Queries `offer_bank` table using workspace archetype and region context.
        Lists explicit column names (no SELECT *).
        """
        archetype = workspace_data.get("archetype")
        region = workspace_data.get("region")
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    if archetype or region:
                        cursor.execute(
                            """
                            SELECT offer_id, name, archetype_code, region, country, component_codes, score, status, lifecycle_state, created_at, updated_at
                            FROM offer_bank
                            WHERE archetype_code = %s OR region = %s
                            ORDER BY created_at DESC;
                            """,
                            (archetype, region),
                        )
                        offers = cursor.fetchall()
                    else:
                        offers = []

                    if not offers:
                        cursor.execute(
                            """
                            SELECT offer_id, name, archetype_code, region, country, component_codes, score, status, lifecycle_state, created_at, updated_at
                            FROM offer_bank
                            ORDER BY created_at DESC
                            LIMIT 5;
                            """
                        )
                        offers = cursor.fetchall()

            return [dict(offer) for offer in offers]
        except psycopg.Error:
            return []

    def _prepare_concept_context(
        self,
        workspace_data: Dict[str, Any],
        discovery_data: Dict[str, Any],
        offers: List[Dict[str, Any]],
        concept_input: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Assembles database query results and concept inputs into a structured context payload.
        """
        return {
            "workspace": workspace_data,
            "discovery": discovery_data,
            "existing_offers": offers,
            "concept_input": concept_input or {},
        }

    def _build_evaluation_prompt(self, concept_context: Dict[str, Any]) -> str:
        """
        Formats concept evaluation context into a natural language prompt requesting JSON output.
        """
        workspace = concept_context.get("workspace", {})
        discovery = concept_context.get("discovery", {})
        offers = concept_context.get("existing_offers", [])
        concept_input = concept_context.get("concept_input", {})

        offers_summary = "\n".join(
            [
                f"- {o.get('name', '')} (Archetype: {o.get('archetype_code', '')}, Region: {o.get('region', '')}, Components: {o.get('component_codes', [])})"
                for o in offers
            ]
        )

        prompt = (
            f"You are a Stage 2 Concept Validation Agent evaluating a product concept.\n\n"
            f"Workspace Context:\n"
            f"Name: {workspace.get('name', 'N/A')}\n"
            f"Region: {workspace.get('region', 'N/A')}, Country: {workspace.get('country', 'N/A')}\n"
            f"Archetype: {workspace.get('archetype', 'N/A')}\n\n"
            f"Stage 1 Validated Discovery Context:\n"
            f"Discovery ID: {discovery.get('discovery_id', 'N/A')}\n"
            f"Research Context / Prompt: {discovery.get('prompt', 'N/A')}\n\n"
            f"Proposed Concept Details:\n"
            f"Title: {concept_input.get('title', concept_input.get('name', 'N/A'))}\n"
            f"Component Codes: {concept_input.get('component_codes', ['a'])}\n"
            f"Description / Hypothesis: {concept_input.get('description', concept_input.get('hypothesis_text', 'N/A'))}\n\n"
            f"Existing Commercial Offers Baseline:\n"
            f"{offers_summary or 'No existing offers found.'}\n\n"
            f"Return ONLY valid JSON matching this exact structure:\n"
            f"{{\n"
            f'  "differentiation_score": {{\n'
            f'    "farmer_value": 7.5,\n'
            f'    "commercial_viability": 7.0,\n'
            f'    "feasibility": 8.0,\n'
            f'    "strategic_fit": 7.0,\n'
            f'    "narrative": "Detailed evaluation narrative"\n'
            f"  }},\n"
            f'  "kill_filter_result": {{\n'
            f'    "addressed_high_pain": true,\n'
            f'    "scalable": true,\n'
            f'    "truly_unique": true,\n'
            f'    "simple_execution": true,\n'
            f'    "kill_triggered": false\n'
            f"  }},\n"
            f'  "duplicate_score": 0.15,\n'
            f'  "top_duplicates": [],\n'
            f'  "guardrail_flags": []\n'
            f"}}\n"
        )

        return prompt

    def _call_llm(self, prompt: str) -> str:
        """
        Invokes the LLM client wrapper with the evaluation prompt.
        """
        return self.llm_client.generate(prompt)

    def _parse_evaluation_response(self, raw_response: str) -> Dict[str, Any]:
        """
        Parses raw LLM response into structured JSON and applies documented business scoring rules:
        - Weighted composite score: farmer_value(0.35) + commercial_viability(0.30) + feasibility(0.20) + strategic_fit(0.15)
        - Decision verdicts:
          - 'ESCALATE' if guardrail_flags contains compliance/regulatory/privacy concerns
          - 'KILL' if kill_triggered is True or composite_score < 5.0
          - 'BORDERLINE' if composite_score between 5.0 and 6.49
          - 'PASS' if composite_score >= 6.5
        """
        cleaned_response = raw_response.strip()

        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.startswith("```"):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()

        parsed_data = {}
        try:
            parsed_data = json.loads(cleaned_response)
        except json.JSONDecodeError:
            parsed_data = {}

        differentiation_score = parsed_data.get("differentiation_score", {})
        if not isinstance(differentiation_score, dict):
            differentiation_score = {}

        farmer_value = float(differentiation_score.get("farmer_value", 7.0))
        commercial_viability = float(differentiation_score.get("commercial_viability", 7.0))
        feasibility = float(differentiation_score.get("feasibility", 7.0))
        strategic_fit = float(differentiation_score.get("strategic_fit", 7.0))

        # Documented weighted composite score calculation
        composite_score = round(
            (farmer_value * self.WEIGHT_FARMER_VALUE)
            + (commercial_viability * self.WEIGHT_COMMERCIAL_VIABILITY)
            + (feasibility * self.WEIGHT_FEASIBILITY)
            + (strategic_fit * self.WEIGHT_STRATEGIC_FIT),
            2,
        )

        differentiation_score["composite_score"] = composite_score

        kill_filter_result = parsed_data.get("kill_filter_result", {})
        if not isinstance(kill_filter_result, dict):
            kill_filter_result = {"kill_triggered": False}

        kill_triggered = kill_filter_result.get("kill_triggered", False)
        duplicate_score = float(parsed_data.get("duplicate_score", 0.0))
        top_duplicates = parsed_data.get("top_duplicates", [])
        guardrail_flags = parsed_data.get("guardrail_flags", [])

        # Documented verdict determination rules
        escalate_triggers = {"compliance_risk", "regulatory_pending", "data_privacy_concern"}
        has_escalation_flag = any(flag in escalate_triggers for flag in guardrail_flags)

        if has_escalation_flag:
            decision = "escalate"
        elif kill_triggered or composite_score < 5.0:
            decision = "kill"
        elif composite_score < self.PASS_THRESHOLD:
            decision = "borderline"
        else:
            decision = "pass"

        return {
            "differentiation_score": differentiation_score,
            "kill_filter_result": kill_filter_result,
            "duplicate_score": duplicate_score,
            "top_duplicates": top_duplicates,
            "guardrail_flags": guardrail_flags,
            "decision": decision,
        }

    def _save_concept(
        self,
        workspace_id: UUID,
        problem_statement_ref: Optional[UUID],
        parsed_evaluation: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Persists the evaluated concept record into PostgreSQL `concepts` table using parameterized SQL.
        Uses default=str for safe JSON serialization of UUID, Decimal, datetime objects.
        """
        differentiation_score = json.dumps(parsed_evaluation.get("differentiation_score", {}), default=str)
        kill_filter_result = json.dumps(parsed_evaluation.get("kill_filter_result", {}), default=str)
        duplicate_score = parsed_evaluation.get("duplicate_score", 0.0)
        top_duplicates = json.dumps(parsed_evaluation.get("top_duplicates", []), default=str)
        guardrail_flags = json.dumps(parsed_evaluation.get("guardrail_flags", []), default=str)
        decision = parsed_evaluation.get("decision", "pass")


        try:
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
                            decision
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING concept_id, workspace_id, problem_statement_ref, differentiation_score, kill_filter_result, duplicate_score, top_duplicates, guardrail_flags, decision, decided_at, decided_by, created_at;
                        """,
                        (
                            workspace_id,
                            problem_statement_ref,
                            differentiation_score,
                            kill_filter_result,
                            duplicate_score,
                            top_duplicates,
                            guardrail_flags,
                            decision,
                        ),
                    )
                    saved_record = cursor.fetchone()

            return dict(saved_record) if saved_record else {}
        except psycopg.Error as err:
            return {"error": f"Failed to save concept record: {str(err)}"}
