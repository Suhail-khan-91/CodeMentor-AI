"""
CodeMentor AI — Code Runner Route (Phase A3).

POST /api/run
Receives Python source code and returns structured execution results.
"""

from flask import Blueprint, request, jsonify
from app.services.runner import get_runner
from app.services.diagnostics import diagnose_error

runner_bp = Blueprint("runner", __name__)


@runner_bp.route("/run", methods=["POST"])
def run_code():
    """
    Execute user-submitted Python code and return structured results with diagnostics.

    Expected JSON body:
      {
        "code": "print('hello')",
        "stdin": ""  (optional)
      }

    Returns structured ExecutionResult + CodeDiagnostic as JSON (HTTP 200).
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
    response_data = result.to_dict()

    # Generate diagnostic if execution failed or timed out (Phase A4)
    if result.status != "success":
        diagnostic = diagnose_error(
            code=code,
            error_type=result.error_type,
            error_message=result.error_message,
            line_number=result.line_number,
            stderr=result.stderr,
            timed_out=result.timed_out
        )
        response_data["diagnostic"] = diagnostic.to_dict()
    else:
        response_data["diagnostic"] = None

    return jsonify(response_data), 200
