import unittest
from unittest.mock import MagicMock, patch
import uuid

from app.agents import (
    BaseAgent,
    ConceptAgent,
    DiscoveryAgent,
    PrototypeAgent,
)
from app.routes.workspace import create_workspace
from app.models.workspace import WorkspaceCreate


class TestBaseAgent(unittest.TestCase):
    """Unit tests for BaseAgent abstract class behavior."""

    def test_base_agent_instantiation_raises(self) -> None:
        """Verify that BaseAgent cannot be instantiated directly."""
        with self.assertRaises(TypeError):
            BaseAgent()  # type: ignore[abstract]


class TestSpecialistAgents(unittest.TestCase):
    """Unit tests for Phase 1 specialist domain agents with mocked LLM calls."""

    @classmethod
    def setUpClass(cls) -> None:
        """Create sample workspace for agent tests."""
        ws_in = WorkspaceCreate(
            name="UnitTest Workspace",
            owner_role="lead",
            archetype="Product Plus",
            region="Continental",
            country="FR",
        )
        cls.ws = create_workspace(ws_in)
        cls.ws_id = cls.ws.workspace_id

    @patch("app.llm_client.LLMClient.generate")
    def test_discovery_agent_run(self, mock_llm_generate: MagicMock) -> None:
        """Test DiscoveryAgent pipeline execution with mocked LLM response."""
        mock_llm_generate.return_value = '{"problem_statement": "Pain validated", "opportunity_summary": "High value", "key_findings": ["F1"], "recommended_archetype": "Product Plus"}'
        agent = DiscoveryAgent()
        result = agent.run(self.ws_id)

        self.assertEqual(result.get("status"), "success")
        self.assertEqual(result.get("workspace_id"), str(self.ws_id))
        self.assertIn("discovery", result)
        self.assertIn("saved_discovery", result)
        self.assertIn("discovery_id", result["saved_discovery"])

    def test_discovery_agent_nonexistent_workspace(self) -> None:
        """Test DiscoveryAgent gracefully handles invalid/missing workspace UUIDs."""
        agent = DiscoveryAgent()
        fake_id = uuid.uuid4()
        result = agent.run(fake_id)

        self.assertEqual(result.get("status"), "error")
        self.assertIn("not found", result.get("message", "").lower())

    @patch("app.llm_client.LLMClient.generate")
    def test_concept_agent_run(self, mock_llm_generate: MagicMock) -> None:
        """Test ConceptAgent pipeline execution, scoring, and verdict determination."""
        mock_llm_generate.return_value = '{"differentiation_score": {"farmer_value": 8.0, "commercial_viability": 7.5, "feasibility": 8.0, "strategic_fit": 7.0}, "kill_filter_result": {"kill_triggered": false}, "duplicate_score": 0.1, "guardrail_flags": []}'

        # Ensure discovery exists first
        disc_agent = DiscoveryAgent()
        disc_agent.run(self.ws_id)

        agent = ConceptAgent()
        result = agent.run(
            self.ws_id,
            concept_input={
                "title": "UnitTest Concept",
                "component_codes": ["a", "b"],
                "description": "Test concept description",
            },
        )

        self.assertEqual(result.get("status"), "success")
        self.assertIn("evaluation", result)
        self.assertEqual(result["evaluation"].get("decision"), "pass")
        self.assertIn("saved_concept", result)
        self.assertIn("concept_id", result["saved_concept"])

    @patch("app.llm_client.LLMClient.generate")
    def test_prototype_agent_run(self, mock_llm_generate: MagicMock) -> None:
        """Test PrototypeAgent pipeline execution and blueprint persistence."""
        mock_llm_generate.return_value = '{"value_proposition": "UnitTest Value Prop", "component_breakdown": {"core_product": "Input A"}}'

        disc_agent = DiscoveryAgent()
        disc_agent.run(self.ws_id)
        concept_agent = ConceptAgent()
        concept_res = concept_agent.run(self.ws_id)
        cid = concept_res["saved_concept"]["concept_id"]
        if isinstance(cid, str):
            cid = uuid.UUID(cid)

        agent = PrototypeAgent()
        result = agent.run(cid, status="draft")

        self.assertEqual(result.get("status"), "success")
        self.assertEqual(result.get("concept_id"), str(cid))
        self.assertIn("saved_prototype", result)
        self.assertIn("prototype_id", result["saved_prototype"])


if __name__ == "__main__":
    unittest.main()

