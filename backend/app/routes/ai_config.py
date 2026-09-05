"""
CodeMentor AI — AI Connection & Configuration Routes (Phase A8).

GET  /api/ai/config — Retrieve current AI configuration (with masked secrets).
POST /api/ai/config — Update active AI provider and connection settings.
POST /api/ai/test   — Test connection health and measure latency for an AI provider.
"""

from flask import Blueprint, request, jsonify
from app.services.ai.config_service import get_ai_config_service

ai_config_bp = Blueprint("ai_config", __name__)


@ai_config_bp.route("/ai/config", methods=["GET"])
def get_config_route():
    """Return active AI settings with masked API keys."""
    service = get_ai_config_service()
    return jsonify({"config": service.get_config(mask_secrets=True)}), 200


@ai_config_bp.route("/ai/config", methods=["POST"])
def update_config_route():
    """
    Update active AI settings.

    Expected JSON body:
      {
        "provider": "ollama" | "cloud" | "mock",
        "ollama": { "base_url": "...", "model": "..." },
        "cloud": { "provider_name": "...", "base_url": "...", "api_key": "...", "model": "..." }
      }
    """
    if not request.is_json:
        return jsonify({
            "error": "Request body must be JSON with 'Content-Type: application/json'",
            "status": 400
        }), 400

    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({
            "error": "Malformed JSON payload in request body",
            "status": 400
        }), 400

    service = get_ai_config_service()
    updated = service.update_config(data)
    return jsonify({
        "success": True,
        "message": f"AI configuration updated to '{updated.get('provider')}' provider.",
        "config": updated
    }), 200


@ai_config_bp.route("/ai/test", methods=["POST"])
def test_connection_route():
    """
    Test connectivity, responsiveness, and latency for an AI provider.

    Optional JSON body to test prospective settings before saving:
      {
        "provider": "ollama",
        "ollama": { "base_url": "http://localhost:11434", "model": "llama3" }
      }
    """
    params = {}
    if request.is_json:
        data = request.get_json(silent=True)
        if isinstance(data, dict):
            params = data

    provider = params.get("provider")
    service = get_ai_config_service()
    test_result = service.test_connection(provider=provider, custom_params=params)

    # Return 200 even on connection test failure, with success: false in payload
    return jsonify(test_result), 200
