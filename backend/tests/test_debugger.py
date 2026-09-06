"""
CodeMentor AI — Debug Mode Engine Tests (Phase A13).

Verifies the 5 curated debug challenges, intentional failure of buggy starters,
100% pass verification of corrected fixes, syntax and runtime diagnostics,
Phase A12 ProgressTracker integration with category 'debug', and REST API routes.
"""

import pytest
from app import create_app
from app.services.debugger import (
    get_debug_challenges,
    get_debug_challenge,
)
from app.services.evaluator import evaluate_task
from app.services.progress import get_progress_tracker


@pytest.fixture
def client():
    """Create Flask test client and reset tracker before each test."""
    app = create_app("testing")
    app.config["TESTING"] = True
    tracker = get_progress_tracker()
    tracker.reset()
    with app.test_client() as client:
        yield client
    tracker.reset()


def test_challenge_catalog_contains_5_curated_challenges():
    challenges = get_debug_challenges()
    assert len(challenges) == 5
    ids = {ch.id for ch in challenges}
    assert ids == {
        "debug_syntax_colon",
        "debug_type_concat",
        "debug_off_by_one",
        "debug_even_odd_inverted",
        "debug_name_error_casing",
    }
    for ch in challenges:
        assert ch.buggy_code
        assert len(ch.test_cases) >= 1
        assert ch.hints.level_1_nudge
        assert ch.hints.level_2_strategy
        assert ch.hints.level_3_clue


def test_challenge_data_models():
    ch = get_debug_challenge("debug_syntax_colon")
    assert ch is not None
    data = ch.to_dict(include_test_cases=True)
    assert data["id"] == "debug_syntax_colon"
    assert data["bug_type"] == "syntax"
    assert "test_cases" in data
    assert data["category"] == "debug"

    task_def = ch.to_task_definition()
    assert task_def.id == ch.id
    assert task_def.starter_code == ch.buggy_code


def test_get_debug_challenge_lookup():
    assert get_debug_challenge("debug_off_by_one") is not None
    assert get_debug_challenge("non_existent_debug_id") is None


# ───── Intentional Failure & Fix Verification for all 5 Challenges ─────

def test_debug_syntax_colon_failure_and_fix():
    ch = get_debug_challenge("debug_syntax_colon")
    task_def = ch.to_task_definition()

    # 1. Unmodified buggy code fails (SyntaxError)
    res_buggy = evaluate_task(ch.buggy_code, task_def)
    assert res_buggy.passed_all is False
    assert res_buggy.status in ("error", "failed")

    # 2. Corrected code passes 100%
    fixed_code = (
        "score = int(input())\n"
        "if score >= 50:\n"
        "    print(\"Passed\")\n"
        "else:\n"
        "    print(\"Failed\")\n"
    )
    res_fixed = evaluate_task(fixed_code, task_def)
    assert res_fixed.passed_all is True
    assert res_fixed.score_percentage == 100.0


def test_debug_type_concat_failure_and_fix():
    ch = get_debug_challenge("debug_type_concat")
    task_def = ch.to_task_definition()

    # 1. Unmodified buggy code fails (concatenates '5' + '10' -> '510')
    res_buggy = evaluate_task(ch.buggy_code, task_def)
    assert res_buggy.passed_all is False

    # 2. Corrected code passes 100%
    fixed_code = (
        "a = int(input())\n"
        "b = int(input())\n"
        "print(a + b)\n"
    )
    res_fixed = evaluate_task(fixed_code, task_def)
    assert res_fixed.passed_all is True
    assert res_fixed.score_percentage == 100.0


def test_debug_off_by_one_failure_and_fix():
    ch = get_debug_challenge("debug_off_by_one")
    task_def = ch.to_task_definition()

    # 1. Unmodified buggy code fails (stops at 9)
    res_buggy = evaluate_task(ch.buggy_code, task_def)
    assert res_buggy.passed_all is False

    # 2. Corrected code passes 100%
    fixed_code = (
        "for i in range(1, 11):\n"
        "    print(i)\n"
    )
    res_fixed = evaluate_task(fixed_code, task_def)
    assert res_fixed.passed_all is True
    assert res_fixed.score_percentage == 100.0


def test_debug_even_odd_inverted_failure_and_fix():
    ch = get_debug_challenge("debug_even_odd_inverted")
    task_def = ch.to_task_definition()

    # 1. Unmodified buggy code fails (inverts Even and Odd)
    res_buggy = evaluate_task(ch.buggy_code, task_def)
    assert res_buggy.passed_all is False

    # 2. Corrected code passes 100%
    fixed_code = (
        "num = int(input())\n"
        "if num % 2 == 0:\n"
        "    print(\"Even\")\n"
        "else:\n"
        "    print(\"Odd\")\n"
    )
    res_fixed = evaluate_task(fixed_code, task_def)
    assert res_fixed.passed_all is True
    assert res_fixed.score_percentage == 100.0


def test_debug_name_error_casing_failure_and_fix():
    ch = get_debug_challenge("debug_name_error_casing")
    task_def = ch.to_task_definition()

    # 1. Unmodified buggy code crashes with NameError (diagnosed by A4)
    res_buggy = evaluate_task(ch.buggy_code, task_def)
    assert res_buggy.passed_all is False
    assert len(res_buggy.test_results) > 0
    assert res_buggy.test_results[0].diagnostic is not None
    diag = res_buggy.test_results[0].diagnostic
    error_type = diag.get("error_type") if isinstance(diag, dict) else diag.error_type
    assert error_type == "NameError"

    # 2. Corrected code passes 100%
    fixed_code = (
        "total = 10 + 20 + 30\n"
        "print(total)\n"
    )
    res_fixed = evaluate_task(fixed_code, task_def)
    assert res_fixed.passed_all is True
    assert res_fixed.score_percentage == 100.0


# ───── REST API Route Tests ─────

def test_api_get_debug_challenges(client):
    res = client.get("/api/debug/challenges")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["challenges"]) == 5
    assert data["challenges"][0]["category"] == "debug"


def test_api_get_single_challenge_found(client):
    res = client.get("/api/debug/challenges/debug_off_by_one")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["challenge"]["id"] == "debug_off_by_one"
    assert "test_cases" in data["challenge"]


def test_api_get_single_challenge_not_found(client):
    res = client.get("/api/debug/challenges/non_existent_debug")
    assert res.status_code == 404
    data = res.get_json()
    assert data["success"] is False


def test_api_evaluate_debug_challenge_success_records_progress(client):
    tracker = get_progress_tracker()
    tracker.reset()

    fixed_code = (
        "for i in range(1, 11):\n"
        "    print(i)\n"
    )
    payload = {
        "challenge_id": "debug_off_by_one",
        "code": fixed_code,
    }
    res = client.post("/api/debug/evaluate", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["evaluation"]["passed_all"] is True
    assert data["evaluation"]["score_percentage"] == 100.0
    assert "hints" in data

    # Verify Phase A12 Progress Tracker updated with category 'debug'
    prog = tracker.get_task("debug_off_by_one")
    assert prog is not None
    assert prog["category"] == "debug"
    assert prog["passed"] is True
    assert prog["best_score"] == 100.0
    assert prog["status"] == "completed"


def test_api_evaluate_missing_challenge_id(client):
    res = client.post("/api/debug/evaluate", json={"code": "print(1)"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
    assert "challenge_id" in data["error"]


def test_api_evaluate_missing_code(client):
    res = client.post("/api/debug/evaluate", json={"challenge_id": "debug_off_by_one"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
    assert "code" in data["error"]


def test_api_evaluate_invalid_challenge_id(client):
    res = client.post("/api/debug/evaluate", json={
        "challenge_id": "unknown_challenge_id",
        "code": "print(1)"
    })
    assert res.status_code == 404
    data = res.get_json()
    assert data["success"] is False


def test_api_evaluate_non_json(client):
    res = client.post(
        "/api/debug/evaluate",
        data="plain text",
        content_type="text/plain"
    )
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
