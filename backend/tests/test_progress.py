"""
CodeMentor AI — Progress & Score Engine Tests (Phase A12).

Verifies task progress tracking, attempts accumulation, score recording,
pass/fail transitions, completion rates, custom task handling, resets, and REST API routes.
"""

import pytest
from app import create_app
from app.services.progress import get_progress_tracker, ProgressTracker


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


def test_tracker_initial_state():
    tracker = ProgressTracker()
    summary = tracker.get_summary().to_dict()

    assert summary["total_tasks_available"] == 5
    assert summary["tasks_attempted"] == 0
    assert summary["tasks_completed"] == 0
    assert summary["completion_percentage"] == 0.0
    assert summary["total_attempts"] == 0
    assert summary["average_best_score"] == 0.0
    assert "task_hello" in summary["tasks"]
    assert summary["tasks"]["task_hello"]["status"] == "not_attempted"
    assert summary["tasks"]["task_hello"]["passed"] is False


def test_record_first_attempt_partial_score():
    tracker = ProgressTracker()
    res = tracker.record_attempt(
        task_id="task_greeting",
        score_percentage=66.7,
        passed_all=False,
        passed_tests=2,
        total_tests=3,
        task_title="2. Personalized Greeting"
    )

    task = res["task"]
    assert task["task_id"] == "task_greeting"
    assert task["status"] == "in_progress"
    assert task["passed"] is False
    assert task["attempts_count"] == 1
    assert task["best_score"] == 66.7
    assert task["latest_score"] == 66.7
    assert task["first_attempt_at"] is not None
    assert task["last_attempt_at"] is not None
    assert task["completed_at"] is None

    summary = res["summary"]
    assert summary["tasks_attempted"] == 1
    assert summary["tasks_completed"] == 0
    assert summary["total_attempts"] == 1
    assert summary["average_best_score"] == 66.7


def test_record_passing_attempt():
    tracker = ProgressTracker()
    res = tracker.record_attempt(
        task_id="task_hello",
        score_percentage=100.0,
        passed_all=True,
        passed_tests=1,
        total_tests=1,
        task_title="1. Hello, World!"
    )

    task = res["task"]
    assert task["status"] == "completed"
    assert task["passed"] is True
    assert task["best_score"] == 100.0
    assert task["completed_at"] is not None

    summary = res["summary"]
    assert summary["tasks_completed"] == 1
    assert summary["completion_percentage"] == 20.0  # 1 of 5 starter tasks = 20%


def test_subsequent_attempt_preserves_best_score():
    tracker = ProgressTracker()
    # First attempt: passed with 100%
    tracker.record_attempt(
        task_id="task_sum_two",
        score_percentage=100.0,
        passed_all=True,
        passed_tests=3,
        total_tests=3,
        task_title="Sum of Two Numbers"
    )

    # Second attempt: lower score (e.g. experimented with something that broke a test)
    res = tracker.record_attempt(
        task_id="task_sum_two",
        score_percentage=33.3,
        passed_all=False,
        passed_tests=1,
        total_tests=3,
        task_title="Sum of Two Numbers"
    )

    task = res["task"]
    assert task["attempts_count"] == 2
    assert task["best_score"] == 100.0
    assert task["latest_score"] == 33.3
    # Status remains completed because student already solved it
    assert task["status"] == "completed"
    assert task["passed"] is True


def test_custom_question_progress_tracking():
    tracker = ProgressTracker()
    res = tracker.record_attempt(
        task_id="custom_reverse_words",
        score_percentage=100.0,
        passed_all=True,
        passed_tests=2,
        total_tests=2,
        task_title="Reverse Words in a Sentence",
        category="custom",
        assistance_snapshot={"total_assists": 2}
    )

    task = res["task"]
    assert task["task_id"] == "custom_reverse_words"
    assert task["category"] == "custom"
    assert task["status"] == "completed"
    assert task["passed"] is True

    summary = res["summary"]
    assert summary["tasks_completed"] == 1
    assert summary["tasks_attempted"] == 1


def test_completion_and_average_score_calculations():
    tracker = ProgressTracker()
    # Task 1: 100%
    tracker.record_attempt("task_hello", 100.0, True, 1, 1)
    # Task 2: 50%
    tracker.record_attempt("task_greeting", 50.0, False, 1, 2)

    summary = tracker.get_summary().to_dict()
    assert summary["tasks_attempted"] == 2
    assert summary["tasks_completed"] == 1
    assert summary["completion_percentage"] == 20.0  # 1/5 = 20%
    assert summary["total_attempts"] == 2
    assert summary["average_best_score"] == 75.0  # (100 + 50) / 2 = 75.0


def test_tracker_reset():
    tracker = ProgressTracker()
    tracker.record_attempt("task_hello", 100.0, True, 1, 1)
    tracker.record_attempt("custom_123", 100.0, True, 1, 1, category="custom")

    tracker.reset()
    summary = tracker.get_summary().to_dict()

    assert summary["tasks_attempted"] == 0
    assert summary["tasks_completed"] == 0
    assert summary["completion_percentage"] == 0.0
    assert "custom_123" not in summary["tasks"]
    assert summary["tasks"]["task_hello"]["status"] == "not_attempted"


# ───── REST API Route Tests ─────

def test_api_get_summary(client):
    res = client.get("/api/progress/summary")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "summary" in data
    assert data["summary"]["total_tasks_available"] == 5


def test_api_record_attempt_success(client):
    payload = {
        "task_id": "task_hello",
        "score_percentage": 100.0,
        "passed_all": True,
        "passed_tests": 1,
        "total_tests": 1,
        "task_title": "1. Hello, World!",
        "category": "starter",
        "assistance_snapshot": {"total_assists": 0}
    }
    res = client.post("/api/progress/record-attempt", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["task"]["status"] == "completed"
    assert data["task"]["passed"] is True
    assert data["summary"]["tasks_completed"] == 1


def test_api_record_attempt_missing_task_id(client):
    payload = {
        "score_percentage": 100.0,
        "passed_all": True
    }
    res = client.post("/api/progress/record-attempt", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
    assert "task_id" in data["error"]


def test_api_record_attempt_invalid_score(client):
    payload = {
        "task_id": "task_hello",
        "score_percentage": "not_a_number",
        "passed_all": True
    }
    res = client.post("/api/progress/record-attempt", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
    assert "score_percentage" in data["error"]


def test_api_record_attempt_non_json(client):
    res = client.post(
        "/api/progress/record-attempt",
        data="not json",
        content_type="text/plain"
    )
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False


def test_api_get_task_progress_found(client):
    # Record an attempt first
    client.post("/api/progress/record-attempt", json={
        "task_id": "task_hello",
        "score_percentage": 100.0,
        "passed_all": True
    })

    res = client.get("/api/progress/task/task_hello")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["task"]["task_id"] == "task_hello"
    assert data["task"]["passed"] is True


def test_api_get_task_progress_not_found(client):
    res = client.get("/api/progress/task/unknown_task_xyz")
    assert res.status_code == 404
    data = res.get_json()
    assert data["success"] is False


def test_api_reset_progress(client):
    client.post("/api/progress/record-attempt", json={
        "task_id": "task_hello",
        "score_percentage": 100.0,
        "passed_all": True
    })

    res = client.post("/api/progress/reset")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["summary"]["tasks_completed"] == 0
    assert data["summary"]["total_attempts"] == 0
