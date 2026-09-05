"""
CodeMentor AI — AI Tutor Routes (Phase A7).

POST /api/tutor/ask — Ask the AI Tutor for Socratic, contextual guidance.
"""

from flask import Blueprint, request, jsonify
from app.services.ai import ask_ai_tutor
from app.services.evaluator import TaskDefinition, get_task_by_id

tutor_bp = Blueprint("tutor", __name__)


@tutor_bp.route("/tutor/ask", methods=["POST"])
def ask_tutor_route():
    """
    Generate contextual Socratic tutoring guidance for student code and question.

    Expected JSON body:
      {
        "code": "num = input()",
        "task_id": "task_even_odd",         # optional
        "task": { ... },                   # optional
        "question": "Why am I getting a TypeError?", # optional
        "diagnostic": { ... },             # optional A4 diagnostic dict
        "evaluation_result": { ... },      # optional A5 evaluation dict
        "execution_details": { ... }       # optional A3 runner dict
      }

    Returns structured AITutorResponse (HTTP 200).
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

    student_question = data.get("question")
    if student_question is not None and not isinstance(student_question, str):
        return jsonify({
            "error": "Field 'question' must be a string if provided",
            "status": 400
        }), 400

    # 1. Resolve task definition
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
    eval_dict = data.get("evaluation_result")
    if isinstance(eval_dict, dict):
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

    diagnostic = data.get("diagnostic") if isinstance(data.get("diagnostic"), dict) else None
    exec_details = data.get("execution_details") if isinstance(data.get("execution_details"), dict) else None

    # 3. Ask AI Tutor
    tutor_response = ask_ai_tutor(
        code=code,
        task=task,
        execution_details=exec_details,
        evaluation_result=eval_res,
        diagnostic=diagnostic,
        student_question=student_question
    )

    return jsonify(tutor_response.to_dict()), 200
