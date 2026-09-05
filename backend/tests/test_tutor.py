"""
CodeMentor AI — AI Tutor Engine Automated Test Suite (Phase A7).

Tests AI Tutor models, Socratic prompt assembly, provider abstraction (Mock, Ollama, Cloud),
A6 integration, safety/anti-solution constraints, and REST API routes.
"""

import pytest
from app import create_app
from app.services.ai.base import AITutorResponse, BaseLLMClient
from app.services.ai.prompt_builder import build_tutor_prompt, SYSTEM_PROMPT
from app.services.ai.providers import (
    MockLLMClient, OllamaLLMClient, CloudLLMClient, get_llm_provider
)
from app.services.ai.tutor_engine import AITutorEngine
from app.services.ai import ask_ai_tutor
from app.services.evaluator.base import TaskDefinition, EvaluationResult, TestCaseResult
from app.services.evaluator.sample_tasks import get_task_by_id


@pytest.fixture
def client():
    app = create_app("testing")
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_engine():
    return AITutorEngine(client=MockLLMClient())


# =====================================================================
# 1. MODEL & DATA STRUCTURE TESTS
# =====================================================================

def test_ai_tutor_response_model():
    resp = AITutorResponse(
        success=True,
        status="success",
        socratic_guidance="Notice that input returns a string.",
        conceptual_nudge="Strings and integers behave differently with operators.",
        strategy="Convert string to int before performing calculation.",
        structural_clue="val = int(input())",
        source="ai_tutor",
        provider="mock",
        model="mock-socratic-tutor"
    )
    d = resp.to_dict()
    assert d["success"] is True
    assert d["status"] == "success"
    assert d["source"] == "ai_tutor"
    assert d["provider"] == "mock"
    assert "input returns a string" in d["socratic_guidance"]
    assert "val = int(input())" in d["structural_clue"]


# =====================================================================
# 2. PROMPT BUILDER & CONTEXT ASSEMBLY TESTS
# =====================================================================

def test_prompt_builder_task_and_code():
    task = get_task_by_id("task_even_odd")
    code = "num = input()\nif num % 2 == 0: print('Even')"
    sys_p, user_p = build_tutor_prompt(code=code, task=task)

    assert "NEVER provide the complete copy-paste solution" in sys_p
    assert "CURRENT TASK:" in user_p
    assert "Even or Odd" in user_p
    assert "num = input()" in user_p


def test_prompt_builder_with_diagnostic_and_question():
    diag = {
        "has_diagnostic": True,
        "error_type": "TypeError",
        "title": "Unsupported Operand",
        "friendly_explanation": "Cannot use % on str",
        "line_number": 2
    }
    sys_p, user_p = build_tutor_prompt(
        code="x = '5'\ny = x % 2",
        diagnostic=diag,
        student_question="Why doesn't modulo work here?"
    )

    assert "RUNTIME/SYNTAX DIAGNOSTIC:" in user_p
    assert "TypeError" in user_p
    assert "Why doesn't modulo work here?" in user_p


def test_prompt_builder_with_evaluation_failure():
    eval_res = EvaluationResult(
        passed_all=False,
        status="failed",
        total_tests=2,
        passed_tests=1,
        score_percentage=50.0,
        total_execution_time_ms=12.0,
        summary_message="1/2 passed",
        test_results=[
            TestCaseResult(
                test_case_id="tc1",
                description="Check even",
                passed=False,
                status="failed",
                actual_output="Odd",
                expected_output="Even",
                stdin="4",
                is_hidden=False,
                execution_time_ms=6.0
            )
        ]
    )
    sys_p, user_p = build_tutor_prompt(code="print('Odd')", evaluation_result=eval_res)
    assert "TEST EVALUATION:" in user_p
    assert "Expected: 'Even'" in user_p
    assert "Actual: 'Odd'" in user_p


# =====================================================================
# 3. MOCK LLM PROVIDER & SAFETY/ANTI-SOLUTION CONSTRAINTS
# =====================================================================

def test_mock_provider_socratic_response():
    client = MockLLMClient()
    resp = client.generate("system", "### STUDENT QUESTION: How do I read numbers?")
    assert resp.success is True
    assert resp.status == "success"
    assert resp.source == "ai_tutor"
    assert len(resp.socratic_guidance) > 10
    assert len(resp.conceptual_nudge) > 5
    assert len(resp.strategy) > 5


def test_mock_provider_anti_solution_check():
    """Verify mock provider clues use skeletons/placeholders and do NOT emit full solutions."""
    client = MockLLMClient()
    resp = client.generate("system", "SyntaxError on line 3")
    assert "..." in resp.structural_clue or "#" in resp.structural_clue


# =====================================================================
# 4. PROVIDER FACTORY & UNREACHABLE GRACEFUL HANDLING
# =====================================================================

def test_provider_factory_defaults_to_mock():
    client = get_llm_provider("mock")
    assert isinstance(client, MockLLMClient)
    assert client.is_available() is True


def test_provider_factory_cloud_unconfigured_fails_gracefully():
    # Cloud with empty API key
    client = CloudLLMClient(api_key="")
    assert client.is_available() is False
    resp = client.generate("system", "user")
    assert resp.success is False
    assert resp.status == "unavailable"
    assert "not yet configured" in resp.socratic_guidance.lower()


def test_provider_factory_ollama_unreachable_fails_gracefully():
    # Ollama on non-existent port
    client = OllamaLLMClient(base_url="http://localhost:59999", timeout_seconds=0.5)
    assert client.is_available() is False
    resp = client.generate("system", "user")
    assert resp.success is False
    assert resp.status == "unavailable"
    assert "unreachable" in resp.socratic_guidance.lower()


# =====================================================================
# 5. TUTOR ENGINE ORCHESTRATION & A6 INTEGRATION
# =====================================================================

def test_tutor_engine_integrates_a6_hints(mock_engine):
    task = get_task_by_id("task_greeting")
    # Code with known mistake: prompt inside input()
    code = "name = input('Enter name: ')\nprint('Hello, ' + name + '!')"
    resp = mock_engine.ask_tutor(code=code, task=task)
    assert resp.success is True
    assert resp.status == "success"
    assert resp.source == "ai_tutor"


def test_ask_ai_tutor_convenience_helper():
    resp = ask_ai_tutor(code="print('test')", student_question="What is this?")
    assert resp.success is True
    assert resp.provider == "mock"


# =====================================================================
# 6. REST API ROUTE TESTS (POST /api/tutor/ask)
# =====================================================================

def test_api_tutor_ask_success(client):
    payload = {
        "code": "num = input()\nprint(num % 2)",
        "task_id": "task_even_odd",
        "question": "Why does modulo fail?"
    }
    res = client.post("/api/tutor/ask", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["source"] == "ai_tutor"
    assert "socratic_guidance" in data
    assert "conceptual_nudge" in data
    assert "strategy" in data
    assert "structural_clue" in data


def test_api_tutor_ask_free_play(client):
    payload = {
        "code": "x = 10\ny = 0\nprint(x / y)"
    }
    res = client.post("/api/tutor/ask", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True


def test_api_tutor_ask_missing_code(client):
    res = client.post("/api/tutor/ask", json={"question": "Help!"})
    assert res.status_code == 400
    data = res.get_json()
    assert "Missing required field: 'code'" in data["error"]


def test_api_tutor_ask_invalid_task_id(client):
    res = client.post("/api/tutor/ask", json={"code": "pass", "task_id": "nonexistent_task"})
    assert res.status_code == 404
    data = res.get_json()
    assert "not found" in data["error"].lower()


def test_api_tutor_ask_non_json(client):
    res = client.post("/api/tutor/ask", data="plain string", content_type="text/plain")
    assert res.status_code == 400
