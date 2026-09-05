"""
CodeMentor AI — Hint API Routes (Phase A6).

POST /api/hints — Evaluate student code and test outcomes to return 3-tier progressive hints.
"""

from flask import Blueprint, request, jsonify
from app.services.hints import generate_hints
from app.services.evaluator import TaskDefinition, get_task_by_id

hints_bp = Blueprint("hints", __name__)


@hints_bp.route("/hints", methods=["POST"])
def get_hints():
    """
    Generate progressive 3-tier hints for code and task context.

    Expected JSON body:
      {
        "code": "print('hello')",
        "task_id": "task_hello",          # optional
        "task": { ... },                 # optional full TaskDefinition dict
        "evaluation_result": { ... }      # optional EvaluationResult dict
      }

    Returns structured HintResponse (HTTP 200).
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

    # 1. Resolve task definition if provided
    task = None
    if "task" in data and isinstance(data["task"], dict):
        task = TaskDefinition.from_dict(data["task"])
    elif "task_id" in data and data["task_id"]:
        task_id = str(data["task_id"])
        task = get_task_by_id(task_id)
        if not task:
            return jsonify({
                "error": f"Task ID '{task_id}' not found",
                "status": 404
            }), 404

    # 2. Resolve evaluation result if provided
    eval_res = None
    if "evaluation_result" in data and isinstance(data["evaluation_result"], dict):
        # Optional reconstruct if needed, or pass dict directly
        eval_dict = data["evaluation_result"]
        # Basic check to create EvaluationResult if needed
        from app.services.evaluator.base import EvaluationResult, TestCaseResult
        try:
            raw_trs = eval_dict.get("test_results", [])
            test_results = [
                TestCaseResult(
                    test_case_id=tr.get("test_case_id", ""),
                    description=tr.get("description", ""),
                    passed=bool(tr.get("passed", False)),
                    status=tr.get("status", "failed"),
                    actual_output=tr.get("actual_output", ""),
                    expected_output=tr.get("expected_output", ""),
                    stdin=tr.get("stdin", ""),
                    is_hidden=bool(tr.get("is_hidden", False)),
                    execution_time_ms=float(tr.get("execution_time_ms", 0.0)),
                    error_message=tr.get("error_message"),
                    diagnostic=tr.get("diagnostic")
                )
                for tr in raw_trs
            ]
            eval_res = EvaluationResult(
                passed_all=bool(eval_dict.get("passed_all", False)),
                status=str(eval_dict.get("status", "failed")),
                total_tests=int(eval_dict.get("total_tests", len(test_results))),
                passed_tests=int(eval_dict.get("passed_tests", 0)),
                score_percentage=float(eval_dict.get("score_percentage", 0.0)),
                total_execution_time_ms=float(eval_dict.get("total_execution_time_ms", 0.0)),
                test_results=test_results,
                summary_message=str(eval_dict.get("summary_message", ""))
            )
        except Exception:
            eval_res = None

    hint_response = generate_hints(code=code, task=task, evaluation_result=eval_res)
    return jsonify(hint_response.to_dict()), 200
