"""
Phase A1 — Backend Tests

Tests for the health check endpoint.
Keep tests simple and focused on real requirements.
"""

import pytest
from app import create_app


@pytest.fixture
def client():
    """Create a Flask test client configured for testing."""
    app = create_app("testing")
    with app.test_client() as client:
        yield client


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_health_returns_json(self, client):
        response = client.get("/api/health")
        assert response.content_type == "application/json"

    def test_health_status_is_ok(self, client):
        data = client.get("/api/health").get_json()
        assert data["status"] == "ok"

    def test_health_service_field(self, client):
        data = client.get("/api/health").get_json()
        assert "service" in data

    def test_unknown_route_returns_json_404(self, client):
        response = client.get("/api/does-not-exist")
        assert response.status_code == 404
        data = response.get_json()
        assert data["status"] == 404
