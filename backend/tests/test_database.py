import json
import unittest
import uuid

import psycopg
from app.database import get_connection


class TestDatabaseValidation(unittest.TestCase):
    """Database validation test suite verifying parameterized SQL, constraints, and transactions."""

    def _create_test_workspace(self, conn) -> tuple[uuid.UUID, str]:
        ws_id = uuid.uuid4()
        name = f"DB Test WS {ws_id}"
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO workspaces (workspace_id, name, owner_role, archetype, region, country, stage)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING workspace_id, name;
                """,
                (ws_id, name, "lead", "Product Plus", "Continental", "FR", "Stage 1"),
            )
            row = cursor.fetchone()
            return row["workspace_id"], row["name"]

    def _create_test_concept(self, conn, workspace_id: uuid.UUID) -> uuid.UUID:
        concept_id = uuid.uuid4()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO concepts (concept_id, workspace_id, decision)
                VALUES (%s, %s, %s)
                RETURNING concept_id;
                """,
                (concept_id, workspace_id, "pass"),
            )
            row = cursor.fetchone()
            return row["concept_id"]

    def test_01_parameterized_query_execution(self) -> None:
        """Verify that get_connection executes parameterized SQL queries cleanly."""
        with get_connection() as conn:
            ws_id, name = self._create_test_workspace(conn)
            self.assertIsNotNone(ws_id)
            self.assertTrue(name.startswith("DB Test WS"))

    def test_02_concepts_check_constraint_enforcement(self) -> None:
        """Verify that concepts_decision_check constraint rejects invalid uppercase/unknown decisions."""
        with get_connection() as conn:
            ws_id, _ = self._create_test_workspace(conn)
            with conn.cursor() as cursor:
                # Valid lowercase decision passes
                cursor.execute(
                    """
                    INSERT INTO concepts (workspace_id, decision)
                    VALUES (%s, %s)
                    RETURNING concept_id;
                    """,
                    (ws_id, "pass"),
                )
                self.assertIsNotNone(cursor.fetchone())

                # Invalid uppercase decision fails check constraint
                with self.assertRaises(psycopg.Error):
                    cursor.execute(
                        """
                        INSERT INTO concepts (workspace_id, decision)
                        VALUES (%s, %s);
                        """,
                        (ws_id, "INVALID_DECISION"),
                    )

    def test_03_prototypes_check_constraint_enforcement(self) -> None:
        """Verify that prototypes_status_check constraint rejects invalid status values."""
        with get_connection() as conn:
            ws_id, _ = self._create_test_workspace(conn)
            concept_id = self._create_test_concept(conn, ws_id)
            with conn.cursor() as cursor:
                # Valid status passes
                cursor.execute(
                    """
                    INSERT INTO prototypes (concept_id, status)
                    VALUES (%s, %s)
                    RETURNING prototype_id;
                    """,
                    (concept_id, "draft"),
                )
                self.assertIsNotNone(cursor.fetchone())

                # Invalid status fails check constraint
                with self.assertRaises(psycopg.Error):
                    cursor.execute(
                        """
                        INSERT INTO prototypes (concept_id, status)
                        VALUES (%s, %s);
                        """,
                        (concept_id, "INVALID_STATUS"),
                    )

    def test_04_jsonb_serialization_safety(self) -> None:
        """Verify that json.dumps with default=str safely serializes non-primitive types into JSONB columns."""
        with get_connection() as conn:
            ws_id, _ = self._create_test_workspace(conn)
            payload = {
                "test_id": uuid.uuid4(),
                "timestamp": "2026-07-27T18:00:00Z",
            }
            json_str = json.dumps(payload, default=str)

            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO workspace_events (workspace_id, event_type, payload, actor)
                    VALUES (%s, %s, %s, %s)
                    RETURNING event_id, payload;
                    """,
                    (ws_id, "test_event", json_str, "UnitTest"),
                )
                event = cursor.fetchone()
                self.assertIsNotNone(event)
                self.assertIn("test_id", event["payload"])


if __name__ == "__main__":
    unittest.main()
