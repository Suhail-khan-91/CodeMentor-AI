"""
CodeMentor AI — Debug Mode REST API Routes (Phase A13).

Provides endpoints for:
- Listing curated debugging challenges
- Fetching specific challenge details and starter buggy code
- Evaluating repaired code against test cases with A12 progress recording
"""

from flask import Blueprint, jsonify, request
from app.services.debugger import get_debug_challenges, get_debug_challenge
from app.services.evaluator import evaluate_task
from app.services.progress import get_progress_tracker

debugger_bp = Blueprint("debugger", __name__)


@debugger_bp.route("/debug/challenges", methods=["GET"])
def list_debug_challenges():
    """Retrieve all curated Debug Mode challenges."""
    challenges = get_debug_challenges()
    return jsonify({
        "success": True,
        "challenges": [ch.to_dict(include_test_cases=False) for ch in challenges]
    }), 200


@debugger_bp.route("/debug/challenges/<challenge_id>", methods=["GET"])
def get_challenge_detail(challenge_id: str):
    """Retrieve a single Debug Mode challenge by ID."""
    challenge = get_debug_challenge(challenge_id)
    if not challenge:
        return jsonify({
            "success": False,
            "error": f"Debug challenge '{challenge_id}' not found."
        }), 404

    return jsonify({
        "success": True,
        "challenge": challenge.to_dict(include_test_cases=True)
    }), 200


@debugger_bp.route("/debug/evaluate", methods=["POST"])
def evaluate_debug_challenge():
    """
    Evaluate student's repaired Python code against challenge test cases.

    Expected JSON body:
    {
        "challenge_id": "debug_off_by_one",
        "code": "for i in range(1, 11):\n    print(i)\n"
    }
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Request body must be valid JSON."
        }), 400

    data = request.get_json() or {}
    challenge_id = data.get("challenge_id")
    if not challenge_id or not isinstance(challenge_id, str):
        return jsonify({
            "success": False,
            "error": "Field 'challenge_id' must be a non-empty string."
        }), 400

    code = data.get("code")
    if code is None or not isinstance(code, str):
        return jsonify({
            "success": False,
            "error": "Field 'code' must be a string."
        }), 400

    challenge = get_debug_challenge(challenge_id.strip())
    if not challenge:
        return jsonify({
            "success": False,
            "error": f"Debug challenge '{challenge_id}' not found."
        }), 404

    # Evaluate code against challenge test cases using Phase A5 Evaluation Engine
    task_def = challenge.to_task_definition()
    eval_result = evaluate_task(code=code, task=task_def)

    # Record evaluation attempt in Phase A12 Progress & Score Engine (category: 'debug')
    tracker = get_progress_tracker()
    tracker.record_attempt(
        task_id=challenge.id,
        score_percentage=eval_result.score_percentage,
        passed_all=eval_result.passed_all,
        passed_tests=eval_result.passed_tests,
        total_tests=eval_result.total_tests,
        task_title=challenge.title,
        category="debug",
    )

    return jsonify({
        "success": True,
        "challenge_id": challenge.id,
        "challenge_title": challenge.title,
        "evaluation": eval_result.to_dict(),
        "hints": challenge.hints.to_dict(),
    }), 200
