"""
CodeMentor AI — Phase A9 Tests: AI Error Explanation Engine.

Validates prompt assembly, deterministic mock explanations across syntax and
runtime error categories, live client parsing, graceful failure degradation,
anti-solution compliance, and the REST API endpoints.
"""

import pytest
from flask import Flask
from app import create_app
from app.services.ai.base import AIErrorExplanationResponse, BaseLLMClient, AITutorResponse
from app.services.ai.error_explainer import (
    build_error_explanation_prompt,
    get_deterministic_mock_explanation,
    AIErrorExplainer,
    explain_error_with_ai
)
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
# 1. Prompt Assembly Tests
# ---------------------------------------------------------------------------

def test_build_prompt_basic():
    """Verify basic prompt formatting with code and error info."""
    code = "x = 10\nprint(y)"
    system_prompt, user_prompt = build_error_explanation_prompt(
        code=code,
        error_type="NameError",
        error_message="name 'y' is not defined",
        line_number=2
    )
    assert "CodeMentor AI's Error Explainer" in system_prompt
    assert "ANTI-SOLUTION POLICY" in system_prompt
    assert "STRUCTURED JSON OUTPUT" in system_prompt

    assert "1 | x = 10" in user_prompt
    assert "2 | print(y)" in user_prompt
    assert "### ERROR TYPE: NameError" in user_prompt
    assert "### ERROR MESSAGE: name 'y' is not defined" in user_prompt
    assert "### FAILING LINE NUMBER: 2" in user_prompt


def test_build_prompt_with_traceback_and_diagnostic():
    """Verify prompt seamlessly incorporates traceback and Phase A4 diagnostic."""
    diag = {
        "has_diagnostic": True,
        "category": "runtime",
        "title": "Variable 'y' Not Found",
        "friendly_explanation": "You tried to use a variable named 'y' before creating it.",
        "hint": "Check spelling or assign y = ... earlier."
    }
    tb = "Traceback (most recent call last):\n  File '<string>', line 2\nNameError: name 'y' is not defined"
    _, user_prompt = build_error_explanation_prompt(
        code="print(y)",
        error_type="NameError",
        error_message="name 'y' is not defined",
        line_number=1,
        traceback=tb,
        diagnostic=diag
    )
    assert "### PYTHON TRACEBACK:" in user_prompt
    assert "### PHASE A4 DETERMINISTIC DIAGNOSTIC CONTEXT:" in user_prompt
    assert "Variable 'y' Not Found" in user_prompt
    assert "Check spelling or assign y" in user_prompt


# ---------------------------------------------------------------------------
# 2. Deterministic Mock Explanation Tests
# ---------------------------------------------------------------------------

def test_mock_explanation_syntax_colon():
    """Verify mock explanation for missing colon syntax errors."""
    res = get_deterministic_mock_explanation(
        code="if x > 5\n    print(x)",
        error_type="SyntaxError",
        error_message="expected ':'",
        line_number=1
    )
    assert "colon" in res["headline"].lower()
    assert "colon" in res["what_it_means"].lower()
    assert len(res["concepts_to_review"]) > 0


def test_mock_explanation_syntax_assignment_in_condition():
    """Verify mock explanation for '=' instead of '=='."""
    res = get_deterministic_mock_explanation(
        code="if x = 5:\n    print(x)",
        error_type="SyntaxError",
        error_message="cannot assign to expression here. Maybe you meant '==' instead of '='?",
        line_number=1
    )
    assert "=" in res["headline"]
    assert "==" in res["headline"]
    assert "assign" in res["what_it_means"].lower()


def test_mock_explanation_syntax_unclosed_quote():
    """Verify mock explanation for unterminated string literals."""
    res = get_deterministic_mock_explanation(
        code='print("hello)',
        error_type="SyntaxError",
        error_message="unterminated string literal",
        line_number=1
    )
    assert "quote" in res["headline"].lower()
    assert "matching quotes" in res["what_it_means"].lower()


def test_mock_explanation_indentation_error():
    """Verify mock explanation for IndentationError."""
    res = get_deterministic_mock_explanation(
        code="if True:\nprint(1)",
        error_type="IndentationError",
        error_message="expected an indented block after 'if' statement on line 1",
        line_number=2
    )
    assert "indented" in res["headline"].lower()
    assert "spacing" in res["what_it_means"].lower() or "indentation" in res["what_it_means"].lower()


def test_mock_explanation_name_error_casing():
    """Verify mock explanation for casing typos on built-in functions."""
    res = get_deterministic_mock_explanation(
        code="Print('hello')",
        error_type="NameError",
        error_message="name 'Print' is not defined",
        line_number=1
    )
    assert "case-sensitive" in res["headline"].lower()
    assert "lowercase" in res["how_to_think_about_it"].lower()


def test_mock_explanation_name_error_undefined():
    """Verify mock explanation for undefined variables."""
    res = get_deterministic_mock_explanation(
        code="total = score + 5",
        error_type="NameError",
        error_message="name 'score' is not defined",
        line_number=1
    )
    assert "score" in res["headline"]
    assert "defined" in res["headline"] or "created" in res["headline"]


def test_mock_explanation_type_error_concatenation():
    """Verify mock explanation for string and int addition."""
    res = get_deterministic_mock_explanation(
        code='msg = "Age: " + 25',
        error_type="TypeError",
        error_message='can only concatenate str (not "int") to str',
        line_number=1
    )
    assert "combine" in res["headline"].lower() or "text" in res["headline"].lower()
    assert "concatenation" in res["what_it_means"].lower()


def test_mock_explanation_zero_division():
    """Verify mock explanation for ZeroDivisionError."""
    res = get_deterministic_mock_explanation(
        code="res = 10 / 0",
        error_type="ZeroDivisionError",
        error_message="division by zero",
        line_number=1
    )
    assert "zero" in res["headline"].lower()
    assert "division by zero" in res["what_it_means"].lower()


def test_mock_explanation_index_error():
    """Verify mock explanation for IndexError."""
    res = get_deterministic_mock_explanation(
        code="items = [1, 2]\nprint(items[5])",
        error_type="IndexError",
        error_message="list index out of range",
        line_number=2
    )
    assert "index" in res["headline"].lower()
    assert "0-based" in res["why_it_happened"] or "0-based" in str(res["concepts_to_review"])


def test_mock_explanation_timeout_error():
    """Verify mock explanation for TimeoutError / infinite loop."""
    res = get_deterministic_mock_explanation(
        code="while True:\n    pass",
        error_type="TimeoutError",
        error_message="Execution timed out after 5.0 seconds",
        line_number=1
    )
    assert "time limit" in res["headline"].lower() or "stopped" in res["headline"].lower()
    assert "infinite loop" in res["why_it_happened"].lower()


def test_mock_explanation_general_fallback():
    """Verify fallback response for arbitrary error types."""
    res = get_deterministic_mock_explanation(
        code="custom()",
        error_type="CustomAppError",
        error_message="something went wrong in module",
        line_number=1
    )
    assert "CustomAppError" in res["headline"]
    assert "what_it_means" in res
    assert "how_to_think_about_it" in res


# ---------------------------------------------------------------------------
# 3. AIErrorExplainer Engine & Pedagogical Policy Tests
# ---------------------------------------------------------------------------

def test_explainer_with_mock_client():
    """Verify explain_error_with_ai returns structured response with Mock client."""
    response = explain_error_with_ai(
        code="print(x)",
        error_type="NameError",
        error_message="name 'x' is not defined",
        line_number=1,
        client_override=MockLLMClient()
    )
    assert response.success is True
    assert response.status == "success"
    assert response.error_type == "NameError"
    assert "x" in response.headline
    assert response.provider == "mock"
    assert len(response.concepts_to_review) > 0
    assert response.line_number == 1

    # Verify anti-solution: no complete solution given
    data_dict = response.to_dict()
    assert "def " not in data_dict["headline"]
    assert "x = " not in data_dict["headline"]


class FakeJSONLLMClient(BaseLLMClient):
    """Fake client returning valid structured JSON."""
    def __init__(self):
        self.model_name = "test-gpt"

    def is_available(self) -> bool:
        return True

    def generate(self, system_prompt: str, user_prompt: str, context=None) -> AITutorResponse:
        content = (
            '{\n'
            '  "headline": "You have a NameError on line 1.",\n'
            '  "what_it_means": "Python does not know what this name refers to.",\n'
            '  "why_it_happened": "The variable was not declared beforehand.",\n'
            '  "how_to_think_about_it": "Think about where you should assign it.",\n'
            '  "concepts_to_review": ["Variables", "Scope"]\n'
            '}'
        )
        return AITutorResponse(
            success=True,
            status="success",
            socratic_guidance=content,
            provider="cloud",
            model=self.model_name
        )


def test_explainer_with_live_json_client():
    """Verify JSON parsing from an LLM client."""
    client = FakeJSONLLMClient()
    explainer = AIErrorExplainer(client=client)
    response = explainer.explain_error(
        code="print(a)",
        error_type="NameError",
        error_message="name 'a' is not defined",
        line_number=1
    )
    assert response.success is True
    assert response.headline == "You have a NameError on line 1."
    assert response.what_it_means == "Python does not know what this name refers to."
    assert response.concepts_to_review == ["Variables", "Scope"]
    assert response.provider == "cloud"


class FailingLLMClient(BaseLLMClient):
    """Fake client that simulates connection failure."""
    def __init__(self):
        self.model_name = "failing-model"

    def is_available(self) -> bool:
        return False

    def generate(self, system_prompt: str, user_prompt: str, context=None) -> AITutorResponse:
        return AITutorResponse(
            success=False,
            status="unavailable",
            socratic_guidance="Could not reach provider.",
            provider="cloud",
            model=self.model_name,
            error_message="Connection refused"
        )


def test_explainer_graceful_degradation_on_failure():
    """Verify graceful fallback when LLM client is unreachable."""
    client = FailingLLMClient()
    explainer = AIErrorExplainer(client=client)
    response = explainer.explain_error(
        code="print(x)",
        error_type="NameError",
        error_message="name 'x' is not defined",
        line_number=1
    )
    assert response.success is False
    assert response.status == "unavailable"
    # Even on failure, beginner explanation is populated from fallback
    assert "x" in response.headline
    assert response.error_message == "Connection refused"


# ---------------------------------------------------------------------------
# 4. REST API Endpoint Tests (POST /api/ai/explain-error)
# ---------------------------------------------------------------------------

def test_api_explain_error_success(client):
    """Verify successful POST request returns 200 OK and structured explanation."""
    payload = {
        "code": "x = 5\nprint(y)",
        "error_type": "NameError",
        "error_message": "name 'y' is not defined",
        "line_number": 2,
        "diagnostic": {
            "has_diagnostic": True,
            "category": "runtime",
            "title": "Variable 'y' Not Found",
            "friendly_explanation": "y was not found.",
            "hint": "Assign y before using it."
        }
    }
    resp = client.post("/api/ai/explain-error", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()

    assert data["success"] is True
    assert data["status"] == "success"
    assert data["error_type"] == "NameError"
    assert "headline" in data
    assert "what_it_means" in data
    assert "why_it_happened" in data
    assert "how_to_think_about_it" in data
    assert isinstance(data["concepts_to_review"], list)
    assert data["line_number"] == 2


def test_api_explain_error_missing_json(client):
    """Verify 400 when body is not JSON."""
    resp = client.post("/api/ai/explain-error", data="raw string", content_type="text/plain")
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["success"] is False


def test_api_explain_error_empty_payload(client):
    """Verify 400 when payload is completely empty."""
    resp = client.post("/api/ai/explain-error", json={})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["success"] is False
