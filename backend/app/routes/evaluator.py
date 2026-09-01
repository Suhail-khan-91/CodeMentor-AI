"""
CodeMentor AI — Task Evaluator Routes (Phase A5).

POST /api/evaluate — Evaluate student code against a task definition.
GET  /api/tasks     — Retrieve available sample practice tasks.
GET  /api/tasks/:id — Retrieve a specific task by ID.
"""

from flask import Blueprint, request, jsonify
from app.services.evaluator import (
    TaskDefinition, evaluate_task, SAMPLE_TASKS, get_task_by_id
)

evaluator_bp = Blueprint("evaluator", __name__)


@evaluator_bp.route("/tasks", methods=["GET"])
def get_tasks():
    """Return all available sample tasks with test case definitions."""
    tasks_data = [t.to_dict(hide_secrets=True) for t in SAMPLE_TASKS]
    return jsonify({"tasks": tasks_data}), 200


@evaluator_bp.route("/tasks/<task_id>", methods=["GET"])
def get_single_task(task_id: str):
    """Return a single sample task by its identifier."""
    task = get_task_by_id(task_id)
    if not task:
        return jsonify({"error": f"Task '{task_id}' not found", "status": 404}), 404
    return jsonify({"task": task.to_dict(hide_secrets=True)}), 200


@evaluator_bp.route("/evaluate", methods=["POST"])
def evaluate_code():
    """
    Evaluate user-submitted Python code against a task or test case suite.

    Expected JSON body:
      {
        "code": "print('hello')",
        "task": { ... } OR "task_id": "task_greeting"
      }

    Returns structured EvaluationResult as JSON (HTTP 200).
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

    # 1. Check if task object provided directly
    task_data = data.get("task")
    if isinstance(task_data, dict):
        task = TaskDefinition.from_dict(task_data)
    elif "task_id" in data:
        task_id = str(data["task_id"])
        task = get_task_by_id(task_id)
        if not task:
            return jsonify({
                "error": f"Task ID '{task_id}' not found in sample tasks",
                "status": 404
            }), 404
    else:
        return jsonify({
            "error": "Either 'task' object or 'task_id' must be provided in request body",
            "status": 400
        }), 400

    result = evaluate_task(code=code, task=task)
    return jsonify(result.to_dict()), 200
