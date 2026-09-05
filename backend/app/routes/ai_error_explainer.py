"""
CodeMentor AI — AI Error Explainer Routes (Phase A9).

Provides the POST /api/ai/explain-error endpoint for on-demand, beginner-friendly
AI explanations of syntax errors and runtime exceptions.
"""

from flask import Blueprint, request, jsonify
from app.services.ai.error_explainer import explain_error_with_ai

ai_error_explainer_bp = Blueprint("ai_error_explainer", __name__)


@ai_error_explainer_bp.route("/ai/explain-error", methods=["POST"])
def explain_error():
    """
    Generate an on-demand, beginner-friendly AI explanation for a Python error.

    Request JSON payload:
    {
        "code": "print(x + 1)",
        "error_type": "NameError",
        "error_message": "name 'x' is not defined",
        "line_number": 1,
        "traceback": "...",
        "diagnostic": { ... }
    }

    Response JSON:
    {
        "success": true,
        "status": "success",
        "error_type": "NameError",
        "headline": "Python encountered a NameError because 'x' hasn't been defined yet.",
        "what_it_means": "...",
        "why_it_happened": "...",
        "how_to_think_about_it": "...",
        "concepts_to_review": ["Variables", "Scope"],
        "line_number": 1,
        "source": "ai_error_explainer",
        "provider": "mock",
        "model": "mock-socratic-tutor"
    }
    """
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({
            "success": False,
            "error": "Request body must be valid JSON",
            "status": "bad_request"
        }), 400


    code = data.get("code", "")
    error_type = data.get("error_type", "")
    error_message = data.get("error_message", "")
    line_number = data.get("line_number")
    traceback = data.get("traceback")
    diagnostic = data.get("diagnostic")

    # Validate that we have at least code or an error description
    if not code and not error_type and not error_message and not diagnostic:
        return jsonify({
            "success": False,
            "error": "Either 'code', 'error_type', 'error_message', or 'diagnostic' must be provided",
            "status": "bad_request"
        }), 400

    # If line_number is provided, ensure it is an integer or None
    if line_number is not None:
        try:
            line_number = int(line_number)
        except (ValueError, TypeError):
            line_number = None

    try:
        response = explain_error_with_ai(
            code=code,
            error_type=error_type,
            error_message=error_message,
            line_number=line_number,
            traceback=traceback,
            diagnostic=diagnostic
        )
        return jsonify(response.to_dict()), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "status": "error",
            "error": "Failed to generate AI error explanation",
            "message": str(e)
        }), 500
