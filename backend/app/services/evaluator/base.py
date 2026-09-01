"""
CodeMentor AI — Task Evaluation Data Models (Phase A5).

Defines structured models for test cases, task definitions, and evaluation results.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class TestCase:
    """Definition of a single test case for a task."""
    __test__ = False  # Prevent pytest from treating this as a test class
    id: str
    description: str
    stdin: str = ""
    expected_output: str = ""
    is_hidden: bool = False
    match_mode: str = "trimmed"  # "trimmed" | "exact" | "ignore_case" | "numeric_float"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TestCase":
        return cls(
            id=str(data.get("id", "tc")),
            description=str(data.get("description", "")),
            stdin=str(data.get("stdin", "")),
            expected_output=str(data.get("expected_output", "")),
            is_hidden=bool(data.get("is_hidden", False)),
            match_mode=str(data.get("match_mode", "trimmed"))
        )

    def to_dict(self, hide_secrets: bool = False) -> Dict[str, Any]:
        return {
            "id": self.id,
            "description": self.description,
            "stdin": "" if (hide_secrets and self.is_hidden) else self.stdin,
            "expected_output": "" if (hide_secrets and self.is_hidden) else self.expected_output,
            "is_hidden": self.is_hidden,
            "match_mode": self.match_mode
        }


@dataclass
class TaskDefinition:
    """Definition of a programming challenge/task."""
    id: str
    title: str
    description: str
    starter_code: str = ""
    test_cases: List[TestCase] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TaskDefinition":
        raw_tcs = data.get("test_cases", [])
        test_cases = [
            tc if isinstance(tc, TestCase) else TestCase.from_dict(tc)
            for tc in raw_tcs
        ]
        return cls(
            id=str(data.get("id", "task")),
            title=str(data.get("title", "Untitled Task")),
            description=str(data.get("description", "")),
            starter_code=str(data.get("starter_code", "")),
            test_cases=test_cases
        )

    def to_dict(self, hide_secrets: bool = False) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "starter_code": self.starter_code,
            "test_cases": [tc.to_dict(hide_secrets=hide_secrets) for tc in self.test_cases]
        }


@dataclass
class TestCaseResult:
    """Result of running code against a single test case."""
    __test__ = False  # Prevent pytest from treating this as a test class
    test_case_id: str
    description: str
    passed: bool
    status: str              # "passed" | "failed" | "error" | "timeout"
    actual_output: str
    expected_output: str
    stdin: str
    is_hidden: bool
    execution_time_ms: float
    error_message: Optional[str] = None
    diagnostic: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        # For hidden test cases that failed, we protect the expected/actual/stdin values
        show_details = not self.is_hidden

        return {
            "test_case_id": self.test_case_id,
            "description": self.description,
            "passed": self.passed,
            "status": self.status,
            "actual_output": self.actual_output if show_details else "[Hidden Test Case Output]",
            "expected_output": self.expected_output if show_details else "[Hidden Expected Output]",
            "stdin": self.stdin if show_details else "[Hidden Stdin]",
            "is_hidden": self.is_hidden,
            "execution_time_ms": round(self.execution_time_ms, 2),
            "error_message": self.error_message if show_details else "Error in hidden test case",
            "diagnostic": self.diagnostic
        }


@dataclass
class EvaluationResult:
    """Overall evaluation outcome across all test cases for a task."""
    passed_all: bool
    status: str              # "passed" | "failed" | "error" | "timeout"
    total_tests: int
    passed_tests: int
    score_percentage: float
    total_execution_time_ms: float
    test_results: List[TestCaseResult]
    summary_message: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed_all": self.passed_all,
            "status": self.status,
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "score_percentage": round(self.score_percentage, 1),
            "total_execution_time_ms": round(self.total_execution_time_ms, 2),
            "summary_message": self.summary_message,
            "test_results": [tr.to_dict() for tr in self.test_results]
        }
