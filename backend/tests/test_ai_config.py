"""
CodeMentor AI — AI Connection & Configuration Test Suite (Phase A8).

Tests runtime AI configuration management, secret masking, connection health probes
(Mock, Ollama, Cloud), and REST API routes.
"""

import pytest
from app import create_app
from app.services.ai.config_service import (
    AIConfigService, mask_api_key, get_ai_config_service
)


@pytest.fixture
def client():
    app = create_app("testing")
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def service():
    return AIConfigService()


# =====================================================================
# 1. SECRET MASKING & CONFIG MODEL TESTS
# =====================================================================

def test_mask_api_key():
    assert mask_api_key("") == ""
    assert mask_api_key("   ") == ""
    assert mask_api_key("short") == "••••••••"
    assert mask_api_key("12345678") == "••••••••"
    masked = mask_api_key("sk-proj-1234567890abcdef")
    assert masked == "sk-...cdef"
    assert "1234567890" not in masked


def test_get_config_masks_secrets_by_default(service):
    # Set a dummy secret key
    service._config["cloud"]["api_key"] = "sk-secret-key-1234567890"
    cfg = service.get_config(mask_secrets=True)

    assert cfg["cloud"]["api_key"].startswith("sk-...")
    assert "secret-key" not in cfg["cloud"]["api_key"]
    assert cfg["cloud"]["has_api_key"] is True

    # When mask_secrets=False (internal use)
    unmasked = service.get_config(mask_secrets=False)
    assert unmasked["cloud"]["api_key"] == "sk-secret-key-1234567890"


# =====================================================================
# 2. CONFIG UPDATE & PRESERVATION TESTS
# =====================================================================

def test_update_config_provider_and_urls(service):
    update_payload = {
        "provider": "ollama",
        "ollama": {
            "base_url": "http://127.0.0.1:11434",
            "model": "mistral"
        }
    }
    result = service.update_config(update_payload)
    assert result["provider"] == "ollama"
    assert result["ollama"]["base_url"] == "http://127.0.0.1:11434"
    assert result["ollama"]["model"] == "mistral"


def test_update_config_preserves_key_when_masked_passed(service):
    # Initial setup
    service._config["cloud"]["api_key"] = "sk-original-secret-key-9999"

    # User submits form without altering the masked key
    update_payload = {
        "cloud": {
            "api_key": "sk-...9999",
            "model": "gpt-4o"
        }
    }
    service.update_config(update_payload)
    # Original unmasked key must still be preserved internally
    assert service._config["cloud"]["api_key"] == "sk-original-secret-key-9999"
    assert service._config["cloud"]["model"] == "gpt-4o"


def test_update_config_clears_key_when_explicitly_empty(service):
    service._config["cloud"]["api_key"] = "sk-original-secret-key-9999"
    service.update_config({"cloud": {"api_key": ""}})
    assert service._config["cloud"]["api_key"] == ""


# =====================================================================
# 3. CONNECTION TEST PROBE TESTS
# =====================================================================

def test_test_connection_mock(service):
    res = service.test_connection(provider="mock")
    assert res["success"] is True
    assert res["status"] == "connected"
    assert res["provider"] == "mock"
    assert res["latency_ms"] > 0
    assert "ready" in res["message"].lower()


def test_test_connection_ollama_unreachable(service):
    custom = {
        "ollama": {
            "base_url": "http://localhost:59998",
            "model": "llama3"
        }
    }
    res = service.test_connection(provider="ollama", custom_params=custom)
    assert res["success"] is False
    assert res["status"] == "unreachable"
    assert "could not connect to ollama" in res["message"].lower()


def test_test_connection_cloud_missing_key(service):
    custom = {
        "cloud": {
            "api_key": "",
            "base_url": "https://api.openai.com/v1"
        }
    }
    res = service.test_connection(provider="cloud", custom_params=custom)
    assert res["success"] is False
    assert res["status"] == "missing_api_key"
    assert "missing" in res["message"].lower()


def test_test_connection_invalid_provider(service):
    res = service.test_connection(provider="nonexistent_provider")
    assert res["success"] is False
    assert res["status"] == "invalid_provider"


# =====================================================================
# 4. REST API ROUTE TESTS (GET/POST /api/ai/config, POST /api/ai/test)
# =====================================================================

def test_api_get_config(client):
    res = client.get("/api/ai/config")
    assert res.status_code == 200
    data = res.get_json()
    assert "config" in data
    assert "provider" in data["config"]
    assert "ollama" in data["config"]
    assert "cloud" in data["config"]


def test_api_update_config_success(client):
    payload = {
        "provider": "mock",
        "ollama": {"model": "llama3:latest"}
    }
    res = client.post("/api/ai/config", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["config"]["provider"] == "mock"


def test_api_update_config_non_json(client):
    res = client.post("/api/ai/config", data="plain text", content_type="text/plain")
    assert res.status_code == 400


def test_api_test_connection_mock(client):
    res = client.post("/api/ai/test", json={"provider": "mock"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["status"] == "connected"


def test_api_test_connection_cloud_without_key(client):
    res = client.post("/api/ai/test", json={"provider": "cloud", "cloud": {"api_key": ""}})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is False
    assert data["status"] == "missing_api_key"
