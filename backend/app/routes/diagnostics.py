"""
CodeMentor AI — Diagnostics Route (Phase A4).

POST /api/diagnose
Receives code and error metadata, returning beginner-friendly educational diagnostics.
"""

from flask import Blueprint, request, jsonify
from app.services.diagnostics import diagnose_error
from app.services.runner.parser import parse_traceback

diagnostics_bp = Blueprint("diagnostics", __name__)


@diagnostics_bp.route("/diagnose", methods=["POST"])
def get_diagnosis():
    """
    Generate educational diagnostic for submitted code and error details.

    Expected JSON body:
      {
        "code": "print(10 / 0)",
        "error_type": "ZeroDivisionError",   (optional)
        "error_message": "division by zero", (optional)
        "line_number": 1,                    (optional)
        "stderr": "...",                     (optional)
        "timed_out": false                   (optional)
      }

    Returns structured CodeDiagnostic as JSON (HTTP 200).
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

    stderr = data.get("stderr", "")
    error_type = data.get("error_type")
    error_message = data.get("error_message")
    line_number = data.get("line_number")
    timed_out = bool(data.get("timed_out", False))

    # If error_type is not provided but stderr is available, parse it
    if not error_type and stderr:
        parsed = parse_traceback(stderr)
        error_type = parsed["error_type"]
        error_message = error_message or parsed["error_message"]
        line_number = line_number if line_number is not None else parsed["line_number"]

    diagnostic = diagnose_error(
        code=code,
        error_type=error_type,
        error_message=error_message,
        line_number=line_number,
        stderr=stderr,
        timed_out=timed_out
    )

    return jsonify(diagnostic.to_dict()), 200
