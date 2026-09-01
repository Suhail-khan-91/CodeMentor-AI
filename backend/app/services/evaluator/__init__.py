"""
CodeMentor AI — Task Evaluation Package (Phase A5).

Evaluates student Python code against test cases and produces structured pass/fail results.
"""

from app.services.evaluator.base import (
    TestCase, TaskDefinition, TestCaseResult, EvaluationResult
)
from app.services.evaluator.comparer import compare_output
from app.services.evaluator.sample_tasks import SAMPLE_TASKS, get_task_by_id
from app.services.evaluator.evaluator_service import TaskEvaluator, evaluate_task

__all__ = [
    "TestCase",
    "TaskDefinition",
    "TestCaseResult",
    "EvaluationResult",
    "compare_output",
    "SAMPLE_TASKS",
    "get_task_by_id",
    "TaskEvaluator",
    "evaluate_task"
]
