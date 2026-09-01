"""
CodeMentor AI — Health check route.

GET /api/health
Returns a simple JSON response confirming the backend is running.
"""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Lightweight liveness check used by the frontend to verify connectivity."""
    return jsonify({
        "status": "ok",
        "service": "CodeMentor AI Backend",
        "phase": "A1"
    }), 200


@health_bp.app_errorhandler(404)
def not_found(error):
    """Return a JSON 404 instead of HTML so the frontend can handle it cleanly."""
    return jsonify({"error": "Endpoint not found", "status": 404}), 404


@health_bp.app_errorhandler(500)
def internal_error(error):
    """Return a JSON 500 for unexpected server errors."""
    return jsonify({"error": "Internal server error", "status": 500}), 500
