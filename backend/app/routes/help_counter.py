"""
CodeMentor AI — Help Usage Counter Routes (Phase A11).

Provides endpoints for tracking and summarizing student assistance usage
across deterministic hints (A6), AI Tutor questions (A7), and AI Error Explanations (A9):
- GET  /api/help-counter/summary — Retrieve categorical breakdown & total count.
- POST /api/help-counter/record  — Record an assistance event.
- POST /api/help-counter/reset   — Reset session assistance counters.
- GET  /api/help-counter/events  — Retrieve recently logged assistance events.
"""

from flask import Blueprint, request, jsonify
from app.services.help_counter import (
    get_help_counter_session,
    VALID_ASSIST_TYPES
)

help_counter_bp = Blueprint("help_counter", __name__)


@help_counter_bp.route("/help-counter/summary", methods=["GET"])
def get_summary():
    """Retrieve current assistance metrics and breakdown for the active session."""
    session = get_help_counter_session()
    return jsonify({
        "success": True,
        "summary": session.get_summary()
    }), 200


@help_counter_bp.route("/help-counter/record", methods=["POST"])
def record_event():
    """
    Record an assistance event in the session.

    Expected JSON body:
      {
        "event_type": "hint_reveal" | "ai_tutor_ask" | "ai_error_explain",
        "details": {
          "level": 1,
          "task_id": "task_greeting",
          "error_type": "SyntaxError"
        }
      }
    """
    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Request body must be valid JSON",
            "status": 400
        }), 400

    event_type = data.get("event_type")
    if not event_type or not isinstance(event_type, str):
        return jsonify({
            "success": False,
            "error": "Field 'event_type' is required and must be a string",
            "status": 400
        }), 400

    event_type = event_type.strip()
    if event_type not in VALID_ASSIST_TYPES:
        return jsonify({
            "success": False,
            "error": f"Invalid event_type '{event_type}'. Must be one of {sorted(list(VALID_ASSIST_TYPES))}",
            "status": 400
        }), 400

    details = data.get("details", {})
    if not isinstance(details, dict):
        details = {}

    session = get_help_counter_session()
    summary = session.record_event(event_type, details)

    return jsonify({
        "success": True,
        "event_type": event_type,
        "summary": summary
    }), 200


@help_counter_bp.route("/help-counter/reset", methods=["POST"])
def reset_counter():
    """Reset all assistance counters and logs for a new session."""
    session = get_help_counter_session()
    session.reset()
    return jsonify({
        "success": True,
        "message": "Session help counter reset successfully",
        "summary": session.get_summary()
    }), 200


@help_counter_bp.route("/help-counter/events", methods=["GET"])
def get_events():
    """Retrieve logged assistance events in the active session."""
    session = get_help_counter_session()
    limit = request.args.get("limit", 50)
    try:
        limit_int = int(limit)
    except (ValueError, TypeError):
        limit_int = 50

    return jsonify({
        "success": True,
        "events": session.get_events(limit=limit_int)
    }), 200
