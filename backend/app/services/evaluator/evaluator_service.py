"""
CodeMentor AI — Task Evaluation Service (Phase A5).

Executes student code across test cases, compares actual vs expected outputs,
invokes diagnostics on crash, and computes structured evaluation metrics.
"""

from typing import Optional, List, Dict, Any
from app.services.runner import get_runner, BaseRunner
from app.services.diagnostics import diagnose_error
from app.services.evaluator.base import (
    TaskDefinition, TestCase, TestCaseResult, EvaluationResult
)
from app.services.evaluator.comparer import compare_output


class TaskEvaluator:
    """Orchestrates test case evaluation against student code."""

    def __init__(self, runner: Optional[BaseRunner] = None):
        self._runner = runner

    def _get_active_runner(self) -> BaseRunner:
        return self._runner or get_runner()

    def evaluate(self, code: str, task: TaskDefinition) -> EvaluationResult:
        """
        Evaluate Python code against all test cases defined in a task.

        :param code: Python source code submitted by the user.
        :param task: TaskDefinition containing test cases.
        :return: Structured EvaluationResult.
        """
        runner = self._get_active_runner()
        test_results: List[TestCaseResult] = []
        total_time_ms = 0.0

        if not task.test_cases:
            return EvaluationResult(
                passed_all=True,
                status="passed",
                total_tests=0,
                passed_tests=0,
                score_percentage=100.0,
                total_execution_time_ms=0.0,
                test_results=[],
                summary_message="Task has no test cases defined."
            )

        for tc in task.test_cases:
            run_res = runner.run(code=code, stdin=tc.stdin)
            total_time_ms += run_res.execution_time_ms

            # 1. Timeout occurred
            if run_res.timed_out or run_res.status == "timeout":
                diag = diagnose_error(
                    code=code,
                    error_type="TimeoutError",
                    error_message=run_res.error_message or "Execution timed out",
                    line_number=run_res.line_number,
                    stderr=run_res.stderr,
                    timed_out=True
                )
                test_results.append(TestCaseResult(
                    test_case_id=tc.id,
                    description=tc.description,
                    passed=False,
                    status="timeout",
                    actual_output=run_res.stdout,
                    expected_output=tc.expected_output,
                    stdin=tc.stdin,
                    is_hidden=tc.is_hidden,
                    execution_time_ms=run_res.execution_time_ms,
                    error_message=run_res.stderr or "Execution exceeded maximum time limit (5.0s)",
                    diagnostic=diag.to_dict()
                ))
                continue

            # 2. Crash / Syntax / Runtime Error occurred
            if run_res.status != "success":
                diag = diagnose_error(
                    code=code,
                    error_type=run_res.error_type,
                    error_message=run_res.error_message,
                    line_number=run_res.line_number,
                    stderr=run_res.stderr,
                    timed_out=False
                )
                test_results.append(TestCaseResult(
                    test_case_id=tc.id,
                    description=tc.description,
                    passed=False,
                    status="error",
                    actual_output=run_res.stdout,
                    expected_output=tc.expected_output,
                    stdin=tc.stdin,
                    is_hidden=tc.is_hidden,
                    execution_time_ms=run_res.execution_time_ms,
                    error_message=run_res.stderr,
                    diagnostic=diag.to_dict()
                ))
                continue

            # 3. Successful execution — compare actual output vs expected output
            is_match = compare_output(
                actual=run_res.stdout,
                expected=tc.expected_output,
                match_mode=tc.match_mode
            )

            test_results.append(TestCaseResult(
                test_case_id=tc.id,
                description=tc.description,
                passed=is_match,
                status="passed" if is_match else "failed",
                actual_output=run_res.stdout,
                expected_output=tc.expected_output,
                stdin=tc.stdin,
                is_hidden=tc.is_hidden,
                execution_time_ms=run_res.execution_time_ms,
                error_message=None,
                diagnostic=None
            ))

        total_tests = len(test_results)
        passed_tests = sum(1 for r in test_results if r.passed)
        passed_all = (passed_tests == total_tests and total_tests > 0)
        score_percentage = (passed_tests / total_tests) * 100.0 if total_tests > 0 else 0.0

        # Determine overall evaluation status
        if passed_all:
            overall_status = "passed"
            summary_message = f"All {total_tests} test cases passed successfully! (Score: 100%)"
        elif any(r.status == "timeout" for r in test_results):
            overall_status = "timeout"
            summary_message = f"{passed_tests}/{total_tests} test cases passed. One or more test cases timed out."
        elif any(r.status == "error" for r in test_results):
            overall_status = "error"
            summary_message = f"{passed_tests}/{total_tests} test cases passed. A runtime/syntax error occurred."
        else:
            overall_status = "failed"
            summary_message = f"{passed_tests}/{total_tests} test cases passed. Output did not match expected result."

        return EvaluationResult(
            passed_all=passed_all,
            status=overall_status,
            total_tests=total_tests,
            passed_tests=passed_tests,
            score_percentage=score_percentage,
            total_execution_time_ms=total_time_ms,
            test_results=test_results,
            summary_message=summary_message
        )


def evaluate_task(code: str, task: TaskDefinition, runner: Optional[BaseRunner] = None) -> EvaluationResult:
    """Helper shortcut function to evaluate code against a task."""
    evaluator = TaskEvaluator(runner=runner)
    return evaluator.evaluate(code=code, task=task)
