"""
CodeMentor AI — Phase A10 Tests: Custom Question Mode.

Validates custom question templates, schema validation, ad-hoc task evaluation,
crashes and diagnostics under custom criteria, AI Tutor context integration,
and REST API endpoints.
"""

import pytest
from flask import Flask
from app import create_app
from app.services.custom_question import (
    CUSTOM_QUESTION_TEMPLATES,
    validate_custom_question
)
from app.services.evaluator import TaskDefinition, evaluate_task
from app.services.ai.prompt_builder import build_tutor_prompt
from app.services.ai import ask_ai_tutor
from app.services.ai.providers.mock_provider import MockLLMClient


@pytest.fixture
def app() -> Flask:
    """Create a test application instance."""
    return create_app("testing")


@pytest.fixture
def client(app: Flask):
    """Test client for HTTP requests."""
    return app.test_client()


# ---------------------------------------------------------------------------
# 1. Custom Question Templates Tests
# ---------------------------------------------------------------------------

def test_templates_collection_valid():
    """Verify templates list contains standard starter challenges with valid schema."""
    assert len(CUSTOM_QUESTION_TEMPLATES) >= 4
    for template in CUSTOM_QUESTION_TEMPLATES:
        assert "id" in template
        assert "title" in template and len(template["title"]) > 0
        assert "description" in template and len(template["description"]) > 0
        assert "starter_code" in template
        assert isinstance(template.get("test_cases"), list)


# ---------------------------------------------------------------------------
# 2. Custom Question Validation Tests
# ---------------------------------------------------------------------------

def test_validate_valid_custom_question():
    """Verify validation passes for complete custom question."""
    payload = {
        "title": "Double the Number",
        "description": "Read an integer and print its double.",
        "starter_code": "n = int(input())\n",
        "test_cases": [
            {
                "id": "tc1",
                "description": "Double 5",
                "stdin": "5",
                "expected_output": "10",
                "match_mode": "trimmed"
            }
        ]
    }
    is_valid, err = validate_custom_question(payload)
    assert is_valid is True
    assert err is None


def test_validate_zero_test_cases_allowed():
    """Verify validation passes when student creates question without test cases."""
    payload = {
        "title": "Freeform Experiment",
        "description": "Just trying out code.",
        "test_cases": []
    }
    is_valid, err = validate_custom_question(payload)
    assert is_valid is True
    assert err is None


def test_validate_non_dict_rejected():
    """Verify non-dictionary payload fails validation."""
    is_valid, err = validate_custom_question("raw string")
    assert is_valid is False
    assert "JSON object" in err


def test_validate_missing_title_rejected():
    """Verify missing title fails validation."""
    is_valid, err = validate_custom_question({"description": "Some description"})
    assert is_valid is False
    assert "title" in err.lower()


def test_validate_empty_title_rejected():
    """Verify empty/whitespace title fails validation."""
    is_valid, err = validate_custom_question({"title": "   ", "description": "Some description"})
    assert is_valid is False
    assert "title" in err.lower()


def test_validate_missing_description_rejected():
    """Verify missing description fails validation."""
    is_valid, err = validate_custom_question({"title": "My Title"})
    assert is_valid is False
    assert "description" in err.lower()


def test_validate_invalid_test_cases_type():
    """Verify non-list test_cases fails validation."""
    payload = {
        "title": "Title",
        "description": "Desc",
        "test_cases": "not a list"
    }
    is_valid, err = validate_custom_question(payload)
    assert is_valid is False
    assert "must be a list" in err


def test_validate_invalid_match_mode():
    """Verify invalid match mode in test case is rejected."""
    payload = {
        "title": "Title",
        "description": "Desc",
        "test_cases": [
            {"stdin": "1", "expected_output": "2", "match_mode": "fuzzy_regex"}
        ]
    }
    is_valid, err = validate_custom_question(payload)
    assert is_valid is False
    assert "invalid match_mode" in err.lower()


# ---------------------------------------------------------------------------
# 3. Custom Question Evaluation Engine Tests
# ---------------------------------------------------------------------------

def test_evaluate_custom_question_all_passed():
    """Verify evaluation engine grades student code against custom test cases."""
    custom_task = TaskDefinition.from_dict({
        "id": "custom_star",
        "title": "Print Stars",
        "description": "Print N stars.",
        "test_cases": [
            {"id": "tc1", "description": "3 stars", "stdin": "3", "expected_output": "***", "match_mode": "trimmed"},
            {"id": "tc2", "description": "5 stars", "stdin": "5", "expected_output": "*****", "match_mode": "trimmed"}
        ]
    })
    code = "n = int(input())\nprint('*' * n)"
    result = evaluate_task(code=code, task=custom_task)

    assert result.passed_all is True
    assert result.passed_tests == 2
    assert result.total_tests == 2
    assert result.score_percentage == 100.0


def test_evaluate_custom_question_partial_failure():
    """Verify evaluation engine captures diffs when custom test case fails."""
    custom_task = TaskDefinition.from_dict({
        "id": "custom_calc",
        "title": "Triple the Number",
        "description": "Triple the input.",
        "test_cases": [
            {"id": "tc1", "description": "Triple 2", "stdin": "2", "expected_output": "6", "match_mode": "trimmed"},
            {"id": "tc2", "description": "Triple 4", "stdin": "4", "expected_output": "12", "match_mode": "trimmed"}
        ]
    })
    # Student incorrectly doubles instead of tripling
    code = "n = int(input())\nprint(n * 2)"
    result = evaluate_task(code=code, task=custom_task)

    assert result.passed_all is False
    assert result.passed_tests == 0
    assert result.score_percentage == 0.0
    assert len(result.test_results) == 2
    assert result.test_results[0].expected_output == "6"
    assert result.test_results[0].actual_output.strip() == "4"


def test_evaluate_custom_question_runtime_crash():
    """Verify evaluation engine captures runtime error and attaches A4 diagnostic."""
    custom_task = TaskDefinition.from_dict({
        "id": "custom_divide",
        "title": "Divide by N",
        "description": "Divide 100 by N.",
        "test_cases": [
            {"id": "tc1", "description": "Divide by 0", "stdin": "0", "expected_output": "Error", "match_mode": "trimmed"}
        ]
    })
    code = "n = int(input())\nprint(100 / n)"
    result = evaluate_task(code=code, task=custom_task)

    assert result.passed_all is False
    assert result.test_results[0].status == "error"
    assert result.test_results[0].diagnostic is not None
    assert result.test_results[0].diagnostic.get("error_type") == "ZeroDivisionError"


def test_evaluate_custom_question_empty_test_cases():
    """Verify custom question with 0 test cases evaluates without error."""
    custom_task = TaskDefinition.from_dict({
        "id": "custom_empty",
        "title": "No Test Cases",
        "description": "Just run the code.",
        "test_cases": []
    })
    result = evaluate_task(code="print('done')", task=custom_task)
    assert result.passed_all is True
    assert result.total_tests == 0
    assert "no test cases" in result.summary_message.lower()


# ---------------------------------------------------------------------------
# 4. AI Tutor Integration with Custom Question
# ---------------------------------------------------------------------------

def test_tutor_prompt_incorporates_custom_question():
    """Verify Socratic prompt builder marks student-authored custom challenge."""
    custom_task = TaskDefinition.from_dict({
        "id": "custom_question",
        "title": "Reverse Words",
        "description": "Reverse words in a sentence.",
        "starter_code": "s = input()\n"
    })
    _, user_prompt = build_tutor_prompt(
        code="s = input()\nprint(s)",
        task=custom_task,
        student_question="How do I split words?"
    )
    assert "Student's Custom Question" in user_prompt
    assert "Reverse Words" in user_prompt
    assert "Reverse words in a sentence." in user_prompt
    assert "How do I split words?" in user_prompt


def test_ask_ai_tutor_with_custom_question():
    """Verify AI Tutor generates Socratic response for custom question."""
    custom_task = TaskDefinition.from_dict({
        "id": "custom_question_stars",
        "title": "Star Pattern",
        "description": "Print a triangle of stars.",
        "test_cases": [
            {"id": "tc1", "description": "3 rows", "stdin": "3", "expected_output": "*\n**\n***", "match_mode": "trimmed"}
        ]
    })
    eval_res = evaluate_task(code="print('*')", task=custom_task)

    response = ask_ai_tutor(
        code="print('*')",
        task=custom_task,
        evaluation_result=eval_res,
        client_override=MockLLMClient()
    )
    assert response.success is True
    assert response.status == "success"
    assert len(response.socratic_guidance) > 0
    assert response.provider == "mock"


# ---------------------------------------------------------------------------
# 5. REST API Endpoint Tests
# ---------------------------------------------------------------------------

def test_api_get_templates_success(client):
    """Verify GET /api/custom-questions/templates returns 200 OK and template list."""
    resp = client.get("/api/custom-questions/templates")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "templates" in data
    assert len(data["templates"]) >= 4
    assert any(t["id"] == "template_star_triangle" for t in data["templates"])


def test_api_validate_question_success(client):
    """Verify POST /api/custom-questions/validate succeeds with valid question."""
    payload = {
        "question": {
            "title": "Double It",
            "description": "Read number and double it.",
            "test_cases": [
                {"description": "Double 2", "stdin": "2", "expected_output": "4", "match_mode": "trimmed"}
            ]
        }
    }
    resp = client.post("/api/custom-questions/validate", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["valid"] is True


def test_api_validate_question_missing_title(client):
    """Verify POST /api/custom-questions/validate returns 400 when title is missing."""
    payload = {
        "question": {
            "description": "Missing title description"
        }
    }
    resp = client.post("/api/custom-questions/validate", json=payload)
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["valid"] is False
    assert "title" in data["error"].lower()


def test_api_validate_question_non_json(client):
    """Verify POST /api/custom-questions/validate returns 400 for non-JSON."""
    resp = client.post("/api/custom-questions/validate", data="not json", content_type="text/plain")
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["valid"] is False


def test_api_evaluate_custom_success(client):
    """Verify POST /api/custom-questions/evaluate runs code against custom criteria."""
    payload = {
        "code": "n = int(input())\nprint(n * 2)",
        "question": {
            "title": "Double Number",
            "description": "Double the input.",
            "test_cases": [
                {"description": "Double 3", "stdin": "3", "expected_output": "6", "match_mode": "trimmed"},
                {"description": "Double 7", "stdin": "7", "expected_output": "14", "match_mode": "trimmed"}
            ]
        }
    }
    resp = client.post("/api/custom-questions/evaluate", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["passed_all"] is True
    assert data["passed_tests"] == 2
    assert data["score_percentage"] == 100.0


def test_api_evaluate_custom_missing_code(client):
    """Verify POST /api/custom-questions/evaluate returns 400 when code is missing."""
    payload = {
        "question": {
            "title": "Test",
            "description": "Desc"
        }
    }
    resp = client.post("/api/custom-questions/evaluate", json=payload)
    assert resp.status_code == 400
    data = resp.get_json()
    assert "code" in data["error"].lower()


def test_api_evaluate_custom_missing_question(client):
    """Verify POST /api/custom-questions/evaluate returns 400 when question is missing."""
    payload = {
        "code": "print(1)"
    }
    resp = client.post("/api/custom-questions/evaluate", json=payload)
    assert resp.status_code == 400
    data = resp.get_json()
    assert "question" in data["error"].lower()
