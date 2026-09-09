import json
import unittest
import urllib.error
import urllib.request
import uuid

import time

BASE_URL = "http://127.0.0.1:8000"


class TestFastAPIIntegration(unittest.TestCase):
    """Integration test suite for all FastAPI endpoints over HTTP."""

    def _post(self, path: str, payload: dict | None = None) -> tuple[int, dict]:
        url = f"{BASE_URL}{path}"
        data_bytes = json.dumps(payload).encode("utf-8") if payload is not None else b""
        headers = {"Content-Type": "application/json"}

        for attempt in range(5):
            try:
                req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=10) as response:
                    body = json.loads(response.read().decode("utf-8"))
                    return response.status, body
            except urllib.error.HTTPError as err:
                body = json.loads(err.read().decode("utf-8"))
                return err.code, body
            except (urllib.error.URLError, ConnectionRefusedError, TimeoutError):
                if attempt < 4:
                    time.sleep(1)
                    continue
                raise
        return 500, {}


    def test_01_create_workspace_success_and_invalid(self) -> None:
        """Test workspace creation endpoint success and payload validation."""
        # Success case
        status, body = self._post(
            "/v1/workspaces",
            {
                "name": "Integration Test WS",
                "owner_role": "lead",
                "archetype": "Product Plus",
                "region": "Continental",
                "country": "FR",
            },
        )
        self.assertEqual(status, 200)
        self.assertIn("workspace_id", body)

        # Invalid payload (422 Unprocessable Entity)
        status, _ = self._post("/v1/workspaces", {"name": 123})
        self.assertIn(status, [400, 422])

    def test_02_activate_discovery_endpoint(self) -> None:
        """Test Discovery Agent endpoint success and 404 missing workspace."""
        # Create workspace first
        _, ws = self._post(
            "/v1/workspaces",
            {
                "name": "Discovery Route WS",
                "owner_role": "lead",
                "archetype": "Product Plus",
                "region": "Continental",
                "country": "FR",
            },
        )
        ws_id = ws["workspace_id"]

        # Success case
        status, body = self._post(f"/v1/workspace/{ws_id}/activate-discovery")
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "success")

        # 404 Not Found case
        fake_id = str(uuid.uuid4())
        status, body = self._post(f"/v1/workspace/{fake_id}/activate-discovery")
        self.assertEqual(status, 404)
        self.assertIn("detail", body)

    def test_03_activate_concept_endpoint(self) -> None:
        """Test Concept Agent endpoint success and 404 missing workspace."""
        _, ws = self._post(
            "/v1/workspaces",
            {
                "name": "Concept Route WS",
                "owner_role": "lead",
                "archetype": "Product Plus",
                "region": "Continental",
                "country": "FR",
            },
        )
        ws_id = ws["workspace_id"]
        self._post(f"/v1/workspace/{ws_id}/activate-discovery")

        # Success case
        status, body = self._post(
            f"/v1/concepts/activate/{ws_id}",
            {
                "title": "Route Concept Test",
                "component_codes": ["a", "b"],
                "description": "Concept description",
            },
        )
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "success")
        self.assertIn("saved_concept", body)

        # 404 Not Found case
        fake_id = str(uuid.uuid4())
        status, body = self._post(f"/v1/concepts/activate/{fake_id}")
        self.assertEqual(status, 404)

    def test_04_activate_prototype_endpoint(self) -> None:
        """Test Prototype Agent endpoint success and 404 missing concept."""
        _, ws = self._post(
            "/v1/workspaces",
            {
                "name": "Prototype Route WS",
                "owner_role": "lead",
                "archetype": "Product Plus",
                "region": "Continental",
                "country": "FR",
            },
        )
        ws_id = ws["workspace_id"]
        self._post(f"/v1/workspace/{ws_id}/activate-discovery")
        _, conc = self._post(f"/v1/concepts/activate/{ws_id}")
        cid = conc["saved_concept"]["concept_id"]

        # Success case
        status, body = self._post(f"/v1/prototypes/activate/{cid}")
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "success")
        self.assertIn("saved_prototype", body)

        # 404 Not Found case
        fake_cid = str(uuid.uuid4())
        status, body = self._post(f"/v1/prototypes/activate/{fake_cid}")
        self.assertEqual(status, 404)


if __name__ == "__main__":
    unittest.main()

