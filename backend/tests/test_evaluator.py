"""
CodeMentor AI — Task Evaluator Tests (Phase A5).

Comprehensive unit and integration tests for test case comparison, evaluation service,
error diagnostics integration, and evaluation API routes.
"""

import pytest
from app import create_app
from app.services.evaluator.comparer import compare_output
from app.services.evaluator.base import TaskDefinition, TestCase
from app.services.evaluator.evaluator_service import evaluate_task
from app.services.evaluator.sample_tasks import SAMPLE_TASKS, get_task_by_id


@pytest.fixture
def app():
    """Create and configure a testing Flask app instance."""
    return create_app("testing")


@pytest.fixture
def client(app):
    """Create a Flask test client."""
    return app.test_client()


# =====================================================================
# Unit Tests — Output Comparer
# =====================================================================

def test_compare_trimmed_success():
    assert compare_output("Hello, World!\n", "Hello, World!", "trimmed") is True
    assert compare_output("  42  \n", "42", "trimmed") is True
    assert compare_output("Line 1\nLine 2\n", "Line 1\nLine 2", "trimmed") is True


def test_compare_trimmed_failure():
    assert compare_output("Wrong Answer\n", "Hello, World!", "trimmed") is False


def test_compare_exact_success():
    assert compare_output("Exact string", "Exact string", "exact") is True


def test_compare_exact_failure():
    assert compare_output("Exact string\n", "Exact string", "exact") is False


def test_compare_ignore_case_success():
    assert compare_output("YES\n", "yes", "ignore_case") is True
    assert compare_output("Even", "EVEN", "ignore_case") is True


def test_compare_numeric_float_success():
    assert compare_output("3.14159", "3.1416", "numeric_float") is True
    assert compare_output("Result: 45.00001", "Result: 45.0", "numeric_float") is True


def test_compare_numeric_float_failure():
    assert compare_output("3.14", "3.50", "numeric_float") is False


# =====================================================================
# Unit Tests — Task Evaluator Service
# =====================================================================

def test_evaluate_all_passed():
    task = TaskDefinition(
        id="test_greet",
        title="Greeting Test",
        description="Greets user",
        test_cases=[
            TestCase(id="t1", description="Alice", stdin="Alice", expected_output="Hello, Alice!"),
            TestCase(id="t2", description="Bob", stdin="Bob", expected_output="Hello, Bob!"),
        ]
    )
    code = "name = input()\nprint(f'Hello, {name}!')"
    result = evaluate_task(code=code, task=task)

    assert result.passed_all is True
    assert result.status == "passed"
    assert result.total_tests == 2
    assert result.passed_tests == 2
    assert result.score_percentage == 100.0
    assert len(result.test_results) == 2
    assert result.test_results[0].passed is True
    assert result.test_results[1].passed is True


def test_evaluate_partial_failure():
    task = TaskDefinition(
        id="test_eo",
        title="Even/Odd",
        description="Check even or odd",
        test_cases=[
            TestCase(id="t1", description="Even", stdin="4", expected_output="Even"),
            TestCase(id="t2", description="Odd", stdin="5", expected_output="Odd"),
        ]
    )
    # Hardcoded solution that always prints Even
    code = "print('Even')"
    result = evaluate_task(code=code, task=task)

    assert result.passed_all is False
    assert result.status == "failed"
    assert result.total_tests == 2
    assert result.passed_tests == 1
    assert result.score_percentage == 50.0
    assert result.test_results[0].passed is True
    assert result.test_results[1].passed is False
    assert result.test_results[1].actual_output.strip() == "Even"
    assert result.test_results[1].expected_output == "Odd"


def test_evaluate_runtime_error_with_diagnostic():
    task = TaskDefinition(
        id="test_div",
        title="Division",
        description="Divides 100 by input",
        test_cases=[
            TestCase(id="t1", description="Valid input (5)", stdin="5", expected_output="20.0", match_mode="numeric_float"),
            TestCase(id="t2", description="Zero input (0)", stdin="0", expected_output="Cannot divide"),
        ]
    )
    # Unsafe division without checking for zero
    code = "x = int(input())\nprint(100 / x)"
    result = evaluate_task(code=code, task=task)

    assert result.passed_all is False
    assert result.status == "error"
    assert result.passed_tests == 1
    assert result.test_results[0].passed is True
    assert result.test_results[1].passed is False
    assert result.test_results[1].status == "error"
    assert result.test_results[1].diagnostic is not None
    assert result.test_results[1].diagnostic["error_type"] == "ZeroDivisionError"
    assert "Division by Zero" in result.test_results[1].diagnostic["title"]


def test_evaluate_syntax_error():
    task = TaskDefinition(
        id="test_syntax",
        title="Syntax Check",
        description="Any task",
        test_cases=[TestCase(id="t1", description="Test 1", stdin="", expected_output="Output")]
    )
    code = "if 5 > 2 print('broken')"
    result = evaluate_task(code=code, task=task)

    assert result.passed_all is False
    assert result.status == "error"
    assert result.test_results[0].diagnostic is not None
    assert "Missing Colon" in result.test_results[0].diagnostic["title"]


def test_evaluate_hidden_test_case_masking():
    task = TaskDefinition(
        id="test_hidden",
        title="Hidden Test",
        description="Has hidden test",
        test_cases=[
            TestCase(id="t1", description="Public", stdin="1", expected_output="1", is_hidden=False),
            TestCase(id="t2", description="Secret", stdin="SECRET", expected_output="SECRET", is_hidden=True),
        ]
    )
    # Wrong code
    code = "print('WRONG')"
    result = evaluate_task(code=code, task=task)
    dict_res = result.to_dict()

    assert dict_res["passed_all"] is False
    # Hidden test case outputs must be masked
    hidden_tc = dict_res["test_results"][1]
    assert hidden_tc["is_hidden"] is True
    assert "Hidden" in hidden_tc["expected_output"]
    assert "Hidden" in hidden_tc["actual_output"]
    assert "Hidden" in hidden_tc["stdin"]


def test_evaluate_empty_test_cases():
    task = TaskDefinition(id="empty", title="Empty", description="No tests", test_cases=[])
    result = evaluate_task(code="print('hi')", task=task)
    assert result.passed_all is True
    assert result.total_tests == 0


def test_sample_tasks_collection():
    assert len(SAMPLE_TASKS) >= 4
    for task in SAMPLE_TASKS:
        assert task.id.startswith("task_")
        assert len(task.test_cases) > 0
        found = get_task_by_id(task.id)
        assert found is not None
        assert found.id == task.id


# =====================================================================
# Integration Tests — Evaluator Routes
# =====================================================================

def test_api_get_tasks(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert "tasks" in data
    assert len(data["tasks"]) >= 4
    # Ensure hidden test case secret details are masked in task list
    for t in data["tasks"]:
        for tc in t["test_cases"]:
            if tc["is_hidden"]:
                assert tc["stdin"] == ""
                assert tc["expected_output"] == ""


def test_api_get_single_task(client):
    response = client.get("/api/tasks/task_greeting")
    assert response.status_code == 200
    data = response.get_json()
    assert data["task"]["id"] == "task_greeting"
    assert "Personalized Greeting" in data["task"]["title"]


def test_api_get_single_task_not_found(client):
    response = client.get("/api/tasks/non_existent_task")
    assert response.status_code == 404


def test_api_evaluate_with_task_id(client):
    payload = {
        "code": "name = input()\nprint(f'Hello, {name}!')",
        "task_id": "task_greeting"
    }
    response = client.post("/api/evaluate", json=payload)
    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert data["passed_all"] is True
    assert data["status"] == "passed"
    assert data["score_percentage"] == 100.0
    assert data["total_tests"] == 3
    assert data["passed_tests"] == 3


def test_api_evaluate_with_custom_task_object(client):
    payload = {
        "code": "a = int(input())\nb = int(input())\nprint(a + b)",
        "task": {
            "id": "custom_sum",
            "title": "Sum",
            "description": "Sum 2 numbers",
            "test_cases": [
                {"id": "tc1", "description": "1+2", "stdin": "1\n2", "expected_output": "3", "is_hidden": False},
                {"id": "tc2", "description": "10+20", "stdin": "10\n20", "expected_output": "30", "is_hidden": False}
            ]
        }
    }
    response = client.post("/api/evaluate", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["passed_all"] is True
    assert data["passed_tests"] == 2


def test_api_evaluate_missing_code(client):
    response = client.post("/api/evaluate", json={"task_id": "task_greeting"})
    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field: 'code'" in data["error"]


def test_api_evaluate_missing_task(client):
    response = client.post("/api/evaluate", json={"code": "print('hi')"})
    assert response.status_code == 400
    data = response.get_json()
    assert "Either 'task' object or 'task_id'" in data["error"]
