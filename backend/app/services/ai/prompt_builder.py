"""
CodeMentor AI — AI Tutor Prompt Engineering & Context Assembly (Phase A7).

Builds pedagogical, Socratic prompts that ground the LLM in student code,
task requirements, execution tracebacks, test case diffs, and A6 rule insights.
Enforces strict anti-solution safeguards so the student learns by doing.
"""

from typing import Optional, Dict, Any
from app.services.evaluator.base import TaskDefinition, EvaluationResult


SYSTEM_PROMPT = """You are CodeMentor AI, a patient, world-class Python tutor for beginners.

Your core mission is to help students learn by discovering solutions themselves.

PEDAGOGICAL & SAFETY RULES (MANDATORY):
1. NEVER provide the complete copy-paste solution to the user's task or write the full script for them.
2. Adopt a Socratic, encouraging tone: explain the underlying mental model and ask reflective guiding questions.
3. If an error or test failure occurred, explain *why* Python behaves that way instead of merely saying what line to change.
4. Structure your response into clean sections:
   - Socratic Guidance: A warm explanation of what is happening with a reflective question.
   - Conceptual Nudge: A high-level conceptual hint with zero code syntax.
   - Strategy: The logical step-by-step approach to solve it.
   - Structural Clue: A syntax pattern or skeleton snippet (use placeholders like `...` — NEVER write the completed answer).
"""


def build_tutor_prompt(
    code: str,
    task: Optional[TaskDefinition] = None,
    execution_details: Optional[Dict[str, Any]] = None,
    evaluation_result: Optional[EvaluationResult] = None,
    diagnostic: Optional[Dict[str, Any]] = None,
    rule_hints: Optional[Dict[str, Any]] = None,
    student_question: Optional[str] = None
) -> tuple[str, str]:
    """
    Assemble the full system prompt and user context prompt.

    :return: Tuple of (system_prompt, user_prompt)
    """
    context_parts = []

    # 1. Task Context
    if task:
        context_parts.append(f"### CURRENT TASK:\nTitle: {task.title}\nDescription: {task.description}")
        if task.starter_code:
            context_parts.append(f"Starter Code Template:\n```python\n{task.starter_code}\n```")
    else:
        context_parts.append("### MODE: Free Play (Isolated Script Execution)")

    # 2. Student's Current Code
    clean_code = code if code.strip() else "# [No code written yet]"
    context_parts.append(f"### STUDENT CODE:\n```python\n{clean_code}\n```")

    # 3. Execution / Error Details (Phase A3 / A4)
    if diagnostic and diagnostic.get("has_diagnostic"):
        err_type = diagnostic.get("error_type", "Error")
        title = diagnostic.get("title", "")
        exp = diagnostic.get("friendly_explanation", "")
        line = diagnostic.get("line_number")
        context_parts.append(
            f"### RUNTIME/SYNTAX DIAGNOSTIC:\nType: {err_type}\nSummary: {title}\n"
            f"Explanation: {exp}\nLine Number: {line}"
        )
    elif execution_details:
        status = execution_details.get("status", "unknown")
        stdout = execution_details.get("stdout", "").strip()
        stderr = execution_details.get("stderr", "").strip()
        if status != "success":
            context_parts.append(f"### EXECUTION STATUS: {status}\nError Output:\n{stderr or stdout}")
        elif stdout:
            context_parts.append(f"### PROGRAM OUTPUT (stdout):\n{stdout}")

    # 4. Task Evaluation Results (Phase A5)
    if evaluation_result:
        failed_tests = [tr for tr in evaluation_result.test_results if not tr.passed]
        if failed_tests:
            context_parts.append(
                f"### TEST EVALUATION:\nScore: {evaluation_result.score_percentage}% "
                f"({evaluation_result.passed_tests}/{evaluation_result.total_tests} passed)\n"
                f"Failed Test Cases Summary:"
            )
            for i, ft in enumerate(failed_tests[:2], start=1):  # Max 2 to keep context concise
                if not ft.is_hidden:
                    context_parts.append(
                        f"  - Test {i}: '{ft.description}'\n"
                        f"    Expected: '{ft.expected_output.strip()}'\n"
                        f"    Actual: '{ft.actual_output.strip() if ft.actual_output else '[empty]'}'"
                    )
                else:
                    context_parts.append(f"  - Test {i}: Hidden test case failed.")

    # 5. Deterministic Rule Insights (Phase A6)
    if rule_hints and rule_hints.get("has_hints"):
        rule_name = rule_hints.get("rule_name", "Known Mistake")
        mistake = rule_hints.get("matched_mistake", "")
        context_parts.append(f"### KNOWN PATTERN DETECTED BY RULE ENGINE:\nPattern: {rule_name}\nDetail: {mistake}")

    # 6. Student Question
    if student_question and student_question.strip():
        context_parts.append(f"### STUDENT QUESTION / INQUIRY:\n\"{student_question.strip()}\"")
    else:
        context_parts.append(
            "### STUDENT REQUEST:\nThe student is stuck. Provide contextual Socratic guidance and a progressive hint "
            "to help them take the next step without revealing the full answer."
        )

    user_prompt = "\n\n".join(context_parts)
    return SYSTEM_PROMPT, user_prompt
