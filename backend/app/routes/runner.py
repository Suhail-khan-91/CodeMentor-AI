"""
CodeMentor AI — Code Runner Route (Phase A3).

POST /api/run
Receives Python source code and returns structured execution results.
"""

from flask import Blueprint, request, jsonify
from app.services.runner import get_runner

runner_bp = Blueprint("runner", __name__)


@runner_bp.route("/run", methods=["POST"])
def run_code():
    """
    Execute user-submitted Python code and return structured results.

    Expected JSON body:
      {
        "code": "print('hello')",
        "stdin": ""  (optional)
      }

    Returns structured ExecutionResult as JSON (HTTP 200).
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

    stdin = data.get("stdin", "")
    if not isinstance(stdin, str):
        return jsonify({
            "error": "Field 'stdin' must be a string if provided",
            "status": 400
        }), 400

    runner = get_runner()
    result = runner.run(code=code, stdin=stdin)

    return jsonify(result.to_dict()), 200
