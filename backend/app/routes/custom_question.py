"""
CodeMentor AI — Custom Question Routes (Phase A10).

Endpoints supporting student-authored challenges in Custom Question Mode:
- GET  /api/custom-questions/templates — Starter challenge ideas & templates.
- POST /api/custom-questions/validate  — Validate custom question definition.
- POST /api/custom-questions/evaluate  — Grade code against student-defined criteria.
"""

from flask import Blueprint, request, jsonify
from app.services.custom_question import (
    CUSTOM_QUESTION_TEMPLATES,
    validate_custom_question
)
from app.services.evaluator import TaskDefinition, evaluate_task

custom_question_bp = Blueprint("custom_question", __name__)


@custom_question_bp.route("/custom-questions/templates", methods=["GET"])
def get_templates():
    """Return pre-defined starter challenge templates for Custom Question Mode."""
    return jsonify({"templates": CUSTOM_QUESTION_TEMPLATES}), 200


@custom_question_bp.route("/custom-questions/validate", methods=["POST"])
def validate_question():
    """
    Validate a student-defined custom question object.

    Expected JSON body:
      {
        "question": {
          "title": "Star Pattern",
          "description": "...",
          "test_cases": [...]
        }
      }
    """
    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({
            "valid": False,
            "error": "Request body must be valid JSON"
        }), 400

    question_data = data.get("question", data)
    is_valid, err_msg = validate_custom_question(question_data)

    if not is_valid:
        return jsonify({
            "valid": False,
            "error": err_msg
        }), 400

    return jsonify({
        "valid": True,
        "message": "Custom question definition is valid"
    }), 200


@custom_question_bp.route("/custom-questions/evaluate", methods=["POST"])
def evaluate_custom():
    """
    Evaluate Python code against a student's custom question definition.

    Expected JSON body:
      {
        "code": "n = int(input())...",
        "question": {
          "id": "custom_question",
          "title": "Star Pattern",
          "description": "...",
          "test_cases": [...]
        }
      }
    """
    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be valid JSON",
            "status": 400
        }), 400

    if "code" not in data:
        return jsonify({
            "error": "Missing required field: 'code'",
            "status": 400
        }), 400

    code = data.get("code")
    if not isinstance(code, str):
        return jsonify({
            "error": "Field 'code' must be a string",
            "status": 400
        }), 400

    question_data = data.get("question")
    if not question_data or not isinstance(question_data, dict):
        return jsonify({
            "error": "Missing or invalid 'question' object in request body",
            "status": 400
        }), 400

    is_valid, err_msg = validate_custom_question(question_data)
    if not is_valid:
        return jsonify({
            "error": f"Invalid custom question: {err_msg}",
            "status": 400
        }), 400

    # Ensure question has an ID
    if not question_data.get("id"):
        question_data["id"] = "custom_question"

    task = TaskDefinition.from_dict(question_data)
    result = evaluate_task(code=code, task=task)
    return jsonify(result.to_dict()), 200
