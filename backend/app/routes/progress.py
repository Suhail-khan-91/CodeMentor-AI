"""
CodeMentor AI — Progress & Score Engine Routes (Phase A12).

REST API endpoints for retrieving student progress summaries, recording
evaluation attempts, inspecting task-specific progress, and resetting scores.
"""

from flask import Blueprint, jsonify, request
from app.services.progress import get_progress_tracker

progress_bp = Blueprint("progress", __name__)


@progress_bp.route("/progress/summary", methods=["GET"])
def get_progress_summary():
    """Retrieve global progress summary, completion %, and task breakdown."""
    tracker = get_progress_tracker()
    summary = tracker.get_summary().to_dict()
    return jsonify({
        "success": True,
        "summary": summary
    }), 200


@progress_bp.route("/progress/record-attempt", methods=["POST"])
def record_task_attempt():
    """
    Record an evaluation attempt for a starter task or custom question.

    Expected JSON body:
    {
        "task_id": "task_hello",
        "score_percentage": 100.0,
        "passed_all": true,
        "passed_tests": 1,
        "total_tests": 1,
        "task_title": "1. Hello, World!",
        "category": "starter",
        "assistance_snapshot": { ... }
    }
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Request body must be valid JSON."
        }), 400

    data = request.get_json() or {}
    task_id = data.get("task_id")
    if not task_id or not isinstance(task_id, str):
        return jsonify({
            "success": False,
            "error": "Field 'task_id' must be a non-empty string."
        }), 400

    score_val = data.get("score_percentage")
    if score_val is None or not isinstance(score_val, (int, float)):
        return jsonify({
            "success": False,
            "error": "Field 'score_percentage' must be a number between 0 and 100."
        }), 400

    passed_all = data.get("passed_all", False)
    passed_tests = data.get("passed_tests", 0)
    total_tests = data.get("total_tests", 0)
    task_title = data.get("task_title")
    category = data.get("category", "starter")
    assistance_snapshot = data.get("assistance_snapshot")

    tracker = get_progress_tracker()
    try:
        res = tracker.record_attempt(
            task_id=task_id.strip(),
            score_percentage=float(score_val),
            passed_all=bool(passed_all),
            passed_tests=int(passed_tests),
            total_tests=int(total_tests),
            task_title=task_title.strip() if isinstance(task_title, str) else None,
            category="custom" if category == "custom" else "starter",
            assistance_snapshot=assistance_snapshot if isinstance(assistance_snapshot, dict) else None,
        )
        return jsonify({
            "success": True,
            "task": res["task"],
            "summary": res["summary"]
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to record progress attempt: {str(e)}"
        }), 500


@progress_bp.route("/progress/task/<task_id>", methods=["GET"])
def get_task_progress(task_id: str):
    """Retrieve progress records and recent attempts for a specific task."""
    tracker = get_progress_tracker()
    task = tracker.get_task(task_id)
    if not task:
        return jsonify({
            "success": False,
            "error": f"Task '{task_id}' not found in progress records."
        }), 404

    return jsonify({
        "success": True,
        "task": task
    }), 200


@progress_bp.route("/progress/reset", methods=["POST"])
def reset_progress():
    """Reset all progress and score records back to initial state."""
    tracker = get_progress_tracker()
    tracker.reset()
    summary = tracker.get_summary().to_dict()
    return jsonify({
        "success": True,
        "message": "Progress and scores reset successfully.",
        "summary": summary
    }), 200
