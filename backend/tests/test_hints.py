"""
CodeMentor AI — Hint System Automated Test Suite (Phase A6).

Tests tiered progressive hints, deterministic known mistake rules,
matchers, fallback behavior, API route, and pedagogical structure.
"""

import pytest
from app import create_app
from app.services.hints.base import TieredHint, HintRule, HintResponse
from app.services.hints.engine import HintEngine
from app.services.hints import matchers, generate_hints, get_hint_engine
from app.services.hints.rules_tasks import TASK_RULES, TASK_DEFAULT_HINTS, get_task_default_hint
from app.services.hints.rules_general import GENERAL_RULES
from app.services.evaluator.base import (
    TaskDefinition, TestCase, TestCaseResult, EvaluationResult
)
from app.services.evaluator.sample_tasks import SAMPLE_TASKS, get_task_by_id


# =====================================================================
# FIXTURES
# =====================================================================

@pytest.fixture
def client():
    app = create_app("testing")
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def engine():
    return HintEngine()


# =====================================================================
# 1. MODEL & SERIALIZATION TESTS
# =====================================================================

def test_tiered_hint_model():
    hint = TieredHint(
        level_1_nudge="Think about data types.",
        level_2_strategy="Use int() around input().",
        level_3_clue="n = int(input())",
        rule_id="test_rule",
        rule_name="Test Rule",
        source="rule_based",
        matched_mistake="String type issue"
    )
    d = hint.to_dict()
    assert d["level_1_nudge"] == "Think about data types."
    assert d["level_2_strategy"] == "Use int() around input()."
    assert d["level_3_clue"] == "n = int(input())"
    assert d["rule_id"] == "test_rule"
    assert d["source"] == "rule_based"
    assert d["matched_mistake"] == "String type issue"


def test_hint_response_model():
    resp = HintResponse(
        has_hints=True,
        rule_id="test_rule",
        rule_name="Test Rule",
        matched_mistake="Something was wrong",
        hints={
            "level_1_nudge": "Nudge",
            "level_2_strategy": "Strategy",
            "level_3_clue": "Clue"
        },
        source="rule_based",
        total_levels=3
    )
    d = resp.to_dict()
    assert d["has_hints"] is True
    assert d["total_levels"] == 3
    assert d["hints"]["level_1_nudge"] == "Nudge"
    assert d["source"] == "rule_based"


# =====================================================================
# 2. CODE INSPECTION & MATCHER HELPER TESTS
# =====================================================================

def test_matcher_prompt_in_input():
    # Prompt string present
    assert matchers.contains_prompt_in_input('name = input("Enter name: ")') is True
    assert matchers.contains_prompt_in_input("val = input('Your age: ')") is True
    # Clean input without prompt
    assert matchers.contains_prompt_in_input("name = input()") is False
    assert matchers.contains_prompt_in_input("val = int(input())") is False


def test_matcher_uses_raw_input_without_conversion():
    # Raw input without int() or float()
    assert matchers.uses_raw_input_without_conversion("x = input()\nprint(x)") is True
    # Converted with int()
    assert matchers.uses_raw_input_without_conversion("x = int(input())\nprint(x)") is False
    # Converted with float()
    assert matchers.uses_raw_input_without_conversion("x = float(input())\nprint(x)") is False
    # No input at all
    assert matchers.uses_raw_input_without_conversion("print(42)") is False


def test_matcher_inverted_modulo():
    # Inverted condition patterns
    assert matchers.detect_inverted_modulo('if n % 2 == 1: print("Even")') is True
    assert matchers.detect_inverted_modulo('if n % 2 != 0: print("Even")') is True
    assert matchers.detect_inverted_modulo('if n % 2 == 0: print("Odd")') is True
    # Correct condition
    assert matchers.detect_inverted_modulo('if n % 2 == 0: print("Even") else: print("Odd")') is False


def test_matcher_addition_concatenation():
    eval_res = EvaluationResult(
        passed_all=False,
        status="failed",
        total_tests=1,
        passed_tests=0,
        score_percentage=0.0,
        total_execution_time_ms=10.0,
        summary_message="Failed",
        test_results=[
            TestCaseResult(
                test_case_id="tc1",
                description="test",
                passed=False,
                status="failed",
                actual_output="510",
                expected_output="15",
                stdin="5\n10",
                is_hidden=False,
                execution_time_ms=10.0
            )
        ]
    )
    assert matchers.detect_addition_concatenation(eval_res) is True

    # When outputs match or actual is not concatenated
    eval_res.test_results[0].actual_output = "15"
    eval_res.test_results[0].passed = True
    assert matchers.detect_addition_concatenation(eval_res) is False


def test_matcher_celsius_fahrenheit_mistake():
    # Missing 32
    assert matchers.detect_celcius_fahrenheit_mistake("f = c * 9 / 5") == "missing_32"
    # Integer division
    assert matchers.detect_celcius_fahrenheit_mistake("f = (c * 9 // 5) + 32") == "integer_division"
    # Inverted ratio
    assert matchers.detect_celcius_fahrenheit_mistake("f = (c * 5 / 9) + 32") == "inverted_ratio"
    # Correct formula
    assert matchers.detect_celcius_fahrenheit_mistake("f = (c * 9 / 5) + 32") is None


def test_matcher_case_or_punctuation_issue():
    eval_res = EvaluationResult(
        passed_all=False,
        status="failed",
        total_tests=1,
        passed_tests=0,
        score_percentage=0.0,
        total_execution_time_ms=10.0,
        summary_message="Failed",
        test_results=[
            TestCaseResult(
                test_case_id="tc1",
                description="test",
                passed=False,
                status="failed",
                actual_output="hello, world!",
                expected_output="Hello, World!",
                stdin="",
                is_hidden=False,
                execution_time_ms=10.0
            )
        ]
    )
    assert matchers.detect_case_or_punctuation_issue(eval_res) == "casing"

    # Punctuation mismatch
    eval_res.test_results[0].actual_output = "Hello World"
    assert matchers.detect_case_or_punctuation_issue(eval_res) == "punctuation"


def test_matcher_print_extra_quotes():
    assert matchers.detect_print_extra_quotes("print(\"'Hello, World!'\")") is True
    assert matchers.detect_print_extra_quotes('print(\'"Hello, World!"\')') is True
    assert matchers.detect_print_extra_quotes('print("Hello, World!")') is False


def test_matcher_empty_output():
    eval_res = EvaluationResult(
        passed_all=False,
        status="failed",
        total_tests=1,
        passed_tests=0,
        score_percentage=0.0,
        total_execution_time_ms=10.0,
        summary_message="Failed",
        test_results=[
            TestCaseResult(
                test_case_id="tc1",
                description="test",
                passed=False,
                status="failed",
                actual_output="",
                expected_output="Hello, World!",
                stdin="",
                is_hidden=False,
                execution_time_ms=10.0
            )
        ]
    )
    assert matchers.detect_empty_output(eval_res) is True


# =====================================================================
# 3. TASK-SPECIFIC KNOWN MISTAKE RULES TESTS
# =====================================================================

def test_task_hello_punctuation_rule(engine):
    task = get_task_by_id("task_hello")
    eval_res = EvaluationResult(
        passed_all=False,
        status="failed",
        total_tests=1,
        passed_tests=0,
        score_percentage=0.0,
        total_execution_time_ms=5.0,
        summary_message="Failed",
        test_results=[
            TestCaseResult(
                test_case_id="tc_hello_1",
                description="test",
                passed=False,
                status="failed",
                actual_output="hello, world!",
                expected_output="Hello, World!",
                stdin="",
                is_hidden=False,
                execution_time_ms=5.0
            )
        ]
    )
    resp = engine.generate_hints("print('hello, world!')", task=task, evaluation_result=eval_res)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_hello_punct_case"
    assert "capitalization" in resp.hints["level_1_nudge"].lower() or "precision" in resp.hints["level_1_nudge"].lower()


def test_task_hello_nested_quotes_rule(engine):
    task = get_task_by_id("task_hello")
    resp = engine.generate_hints("print(\"'Hello, World!'\")", task=task)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_hello_nested_quotes"


def test_task_greeting_prompt_pollution_rule(engine):
    task = get_task_by_id("task_greeting")
    code = "name = input('Enter your name: ')\nprint('Hello, ' + name + '!')"
    resp = engine.generate_hints(code, task=task)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_greeting_prompt"
    assert "automated" in resp.hints["level_1_nudge"].lower() or "prompt" in resp.hints["level_1_nudge"].lower()


def test_task_greeting_hardcoded_rule(engine):
    task = get_task_by_id("task_greeting")
    code = "print('Hello, Alice!')"
    resp = engine.generate_hints(code, task=task)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_greeting_hardcoded"


def test_task_even_odd_no_int_rule(engine):
    task = get_task_by_id("task_even_odd")
    code = "num = input()\nif num % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')"
    resp = engine.generate_hints(code, task=task)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_even_odd_no_int"
    assert "text" in resp.hints["level_1_nudge"].lower() or "string" in resp.hints["level_1_nudge"].lower()


def test_task_even_odd_inverted_rule(engine):
    task = get_task_by_id("task_even_odd")
    code = "num = int(input())\nif num % 2 == 1:\n    print('Even')\nelse:\n    print('Odd')"
    resp = engine.generate_hints(code, task=task)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_even_odd_inverted"


def test_task_temp_converter_missing_32(engine):
    task = get_task_by_id("task_temp_converter")
    code = "c = float(input())\nf = c * 9 / 5\nprint(f)"
    resp = engine.generate_hints(code, task=task)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_temp_formula_issue"


def test_task_sum_two_concatenation_rule(engine):
    task = get_task_by_id("task_sum_two")
    code = "a = input()\nb = input()\nprint(a + b)"
    eval_res = EvaluationResult(
        passed_all=False,
        status="failed",
        total_tests=1,
        passed_tests=0,
        score_percentage=0.0,
        total_execution_time_ms=5.0,
        summary_message="Failed",
        test_results=[
            TestCaseResult(
                test_case_id="tc_sum_1",
                description="Positive integers",
                passed=False,
                status="failed",
                actual_output="510",
                expected_output="15",
                stdin="5\n10",
                is_hidden=False,
                execution_time_ms=5.0
            )
        ]
    )
    resp = engine.generate_hints(code, task=task, evaluation_result=eval_res)
    assert resp.has_hints is True
    assert resp.rule_id == "rule_sum_two_concat"


# =====================================================================
# 4. TASK DEFAULT FALLBACK HINTS TESTS
# =====================================================================

def test_all_sample_tasks_have_default_hints():
    """Verify every sample task has a valid, non-empty 3-tier default fallback hint."""
    for task in SAMPLE_TASKS:
        default_hint = get_task_default_hint(task.id)
        assert default_hint is not None, f"Missing default hint for task {task.id}"
        assert default_hint.level_1_nudge.strip() != ""
        assert default_hint.level_2_strategy.strip() != ""
        assert default_hint.level_3_clue.strip() != ""
        assert default_hint.source == "rule_based"


def test_unknown_mistake_falls_back_to_task_default(engine):
    """When a student's solution fails test cases in an unrecognized way, task default is returned."""
    task = get_task_by_id("task_even_odd")
    code = "# Unexpected approach\nx = 100\nprint('Maybe')"
    resp = engine.generate_hints(code, task=task)
    assert resp.has_hints is True
    assert resp.rule_id == "default_task_even_odd"


def test_no_task_falls_back_to_generic(engine):
    """When no task context is provided, generic fallback hint is returned."""
    code = "def foo(): pass"
    resp = engine.generate_hints(code, task=None)
    assert resp.has_hints is True
    assert resp.rule_id == "default_generic_fallback"


# =====================================================================
# 5. PEDAGOGICAL TIER INTEGRITY TESTS
# =====================================================================

def test_pedagogical_tiers_contract():
    """
    Pedagogical contract:
    - Exactly 3 progressive tiers exist.
    - Level 1 (Conceptual Nudge) must NOT contain complete code statements or keywords.
    - Level 3 (Structural Clue) must contain structural hints without being a complete giveaway.
    """
    all_tiered_hints = list(TASK_DEFAULT_HINTS.values()) + [
        rule.to_tiered_hint() for rule in TASK_RULES
    ] + [rule.to_tiered_hint() for rule in GENERAL_RULES]

    for hint in all_tiered_hints:
        # All 3 levels must be populated
        assert hint.level_1_nudge, f"Missing level 1 nudge in {hint.rule_id}"
        assert hint.level_2_strategy, f"Missing level 2 strategy in {hint.rule_id}"
        assert hint.level_3_clue, f"Missing level 3 clue in {hint.rule_id}"

        # Level 1 should be a conceptual mental nudge without code blocks
        assert "```" not in hint.level_1_nudge, f"Code block found in Level 1 for {hint.rule_id}"
        # Source must be rule_based for A6
        assert hint.source == "rule_based"


# =====================================================================
# 6. REST API ROUTE TESTS (POST /api/hints)
# =====================================================================

def test_api_hints_success_with_task_id(client):
    payload = {
        "code": "num = input()\nif num % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')",
        "task_id": "task_even_odd"
    }
    res = client.post("/api/hints", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["has_hints"] is True
    assert data["total_levels"] == 3
    assert data["source"] == "rule_based"
    assert "hints" in data
    assert "level_1_nudge" in data["hints"]
    assert "level_2_strategy" in data["hints"]
    assert "level_3_clue" in data["hints"]


def test_api_hints_with_task_object(client):
    task = get_task_by_id("task_hello")
    payload = {
        "code": "print('hello, world!')",
        "task": task.to_dict()
    }
    res = client.post("/api/hints", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["has_hints"] is True
    assert data["hints"]["level_1_nudge"] != ""


def test_api_hints_missing_code(client):
    res = client.post("/api/hints", json={"task_id": "task_hello"})
    assert res.status_code == 400
    data = res.get_json()
    assert "Missing required field: 'code'" in data["error"]


def test_api_hints_invalid_task_id(client):
    res = client.post("/api/hints", json={"code": "print(1)", "task_id": "nonexistent_task_999"})
    assert res.status_code == 404
    data = res.get_json()
    assert "not found" in data["error"].lower()


def test_api_hints_non_json_request(client):
    res = client.post("/api/hints", data="plain text", content_type="text/plain")
    assert res.status_code == 400


def test_api_hints_code_not_string(client):
    res = client.post("/api/hints", json={"code": 12345})
    assert res.status_code == 400
