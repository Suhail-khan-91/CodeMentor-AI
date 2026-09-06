"""
CodeMentor AI — Phase A11 Tests: Help / AI Usage Counter.

Validates session-based tracking of assistance usage:
- Phase A6 deterministic hint reveals (Levels 1, 2, 3)
- Phase A7 Socratic AI Tutor queries
- Phase A9 AI Error Explanations
- Session resets, event logging, and REST API endpoints.
"""

import pytest
from flask import Flask
from app import create_app
from app.services.help_counter import (
    HelpCounterSession,
    get_help_counter_session
)


@pytest.fixture
def app() -> Flask:
    """Create a test application instance."""
    return create_app("testing")


@pytest.fixture
def client(app: Flask):
    """Test client for HTTP requests."""
    # Reset singleton session before tests
    get_help_counter_session().reset()
    return app.test_client()


# ---------------------------------------------------------------------------
# 1. HelpCounterSession Unit Tests
# ---------------------------------------------------------------------------

def test_session_initial_state():
    """Verify clean initial state of session counter."""
    session = HelpCounterSession()
    summary = session.get_summary()

    assert summary["total_assists"] == 0
    assert summary["hints"]["total"] == 0
    assert summary["hints"]["level_1_nudge"] == 0
    assert summary["hints"]["level_2_strategy"] == 0
    assert summary["hints"]["level_3_structure"] == 0
    assert summary["ai_tutor_queries"] == 0
    assert summary["ai_error_explanations"] == 0
    assert summary["total_events_logged"] == 0
    assert len(session.get_events()) == 0


def test_record_hint_reveals_levels():
    """Verify progressive hint reveals increment corresponding level counters."""
    session = HelpCounterSession()

    session.record_event("hint_reveal", {"level": 1, "task_id": "task_greeting"})
    session.record_event("hint_reveal", {"level": 2, "task_id": "task_greeting"})
    session.record_event("hint_reveal", {"level": 3, "task_id": "task_greeting"})
    session.record_event("hint_reveal", {"level": 1, "task_id": "task_calc"})

    summary = session.get_summary()
    assert summary["hints"]["level_1_nudge"] == 2
    assert summary["hints"]["level_2_strategy"] == 1
    assert summary["hints"]["level_3_structure"] == 1
    assert summary["hints"]["total"] == 4
    assert summary["total_assists"] == 4
    assert summary["total_events_logged"] == 4


def test_record_ai_tutor_queries():
    """Verify AI Tutor questions increment the tutor query counter."""
    session = HelpCounterSession()

    session.record_event("ai_tutor_ask", {"question": "Why is range(1, 10) not 10?"})
    session.record_event("ai_tutor_ask", {"question": "How to convert string to int?"})

    summary = session.get_summary()
    assert summary["ai_tutor_queries"] == 2
    assert summary["total_assists"] == 2


def test_record_ai_error_explanations():
    """Verify AI Error Explanations increment the error explanation counter."""
    session = HelpCounterSession()

    session.record_event("ai_error_explain", {"error_type": "SyntaxError", "line": 2})
    session.record_event("ai_error_explain", {"error_type": "TypeError", "line": 5})
    session.record_event("ai_error_explain", {"error_type": "NameError", "line": 1})

    summary = session.get_summary()
    assert summary["ai_error_explanations"] == 3
    assert summary["total_assists"] == 3


def test_combined_assistance_tracking():
    """Verify aggregate assistance score matches total sum across all categories."""
    session = HelpCounterSession()

    session.record_event("hint_reveal", {"level": 1})
    session.record_event("hint_reveal", {"level": 2})
    session.record_event("ai_tutor_ask", {"question": "Help me"})
    session.record_event("ai_error_explain", {"error_type": "ZeroDivisionError"})

    summary = session.get_summary()
    assert summary["hints"]["total"] == 2
    assert summary["ai_tutor_queries"] == 1
    assert summary["ai_error_explanations"] == 1
    assert summary["total_assists"] == 4
    assert summary["total_events_logged"] == 4


def test_invalid_event_type_raises():
    """Verify invalid event_type raises ValueError."""
    session = HelpCounterSession()
    with pytest.raises(ValueError) as exc:
        session.record_event("cheat_code")
    assert "Invalid event_type" in str(exc.value)


def test_session_reset():
    """Verify reset clears all metrics and logs."""
    session = HelpCounterSession()
    session.record_event("hint_reveal", {"level": 1})
    session.record_event("ai_tutor_ask")
    assert session.get_summary()["total_assists"] == 2

    session.reset()
    clean = session.get_summary()
    assert clean["total_assists"] == 0
    assert clean["hints"]["total"] == 0
    assert clean["ai_tutor_queries"] == 0
    assert clean["total_events_logged"] == 0
    assert len(session.get_events()) == 0


def test_get_events_limit():
    """Verify get_events returns limited slice of events."""
    session = HelpCounterSession()
    for i in range(10):
        session.record_event("ai_tutor_ask", {"idx": i})

    events = session.get_events(limit=3)
    assert len(events) == 3
    assert events[-1]["details"]["idx"] == 9


# ---------------------------------------------------------------------------
# 2. REST API Endpoint Tests
# ---------------------------------------------------------------------------

def test_api_get_summary(client):
    """Verify GET /api/help-counter/summary returns 200 OK and structure."""
    resp = client.get("/api/help-counter/summary")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "summary" in data
    assert "total_assists" in data["summary"]
    assert "hints" in data["summary"]


def test_api_record_hint_reveal(client):
    """Verify POST /api/help-counter/record registers hint reveal."""
    payload = {
        "event_type": "hint_reveal",
        "details": {"level": 2, "task_id": "task_temp"}
    }
    resp = client.post("/api/help-counter/record", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert data["summary"]["hints"]["level_2_strategy"] == 1
    assert data["summary"]["total_assists"] == 1


def test_api_record_ai_tutor_ask(client):
    """Verify POST /api/help-counter/record registers AI Tutor question."""
    payload = {
        "event_type": "ai_tutor_ask",
        "details": {"question": "How to iterate over list?"}
    }
    resp = client.post("/api/help-counter/record", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert data["summary"]["ai_tutor_queries"] == 1
    assert data["summary"]["total_assists"] == 1


def test_api_record_ai_error_explain(client):
    """Verify POST /api/help-counter/record registers AI Error Explanation."""
    payload = {
        "event_type": "ai_error_explain",
        "details": {"error_type": "IndexError"}
    }
    resp = client.post("/api/help-counter/record", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert data["summary"]["ai_error_explanations"] == 1
    assert data["summary"]["total_assists"] == 1


def test_api_record_missing_event_type(client):
    """Verify POST /api/help-counter/record returns 400 when event_type is missing."""
    resp = client.post("/api/help-counter/record", json={"details": {}})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["success"] is False
    assert "event_type" in data["error"].lower()


def test_api_record_invalid_event_type(client):
    """Verify POST /api/help-counter/record returns 400 for invalid event_type."""
    resp = client.post("/api/help-counter/record", json={"event_type": "unknown_action"})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["success"] is False
    assert "invalid event_type" in data["error"].lower()


def test_api_record_non_json(client):
    """Verify POST /api/help-counter/record returns 400 for non-JSON."""
    resp = client.post("/api/help-counter/record", data="raw", content_type="text/plain")
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["success"] is False


def test_api_reset_counter(client):
    """Verify POST /api/help-counter/reset resets session metrics."""
    # First record an assist
    client.post("/api/help-counter/record", json={"event_type": "ai_tutor_ask"})
    mid_resp = client.get("/api/help-counter/summary").get_json()
    assert mid_resp["summary"]["total_assists"] == 1

    # Now reset
    reset_resp = client.post("/api/help-counter/reset")
    assert reset_resp.status_code == 200
    data = reset_resp.get_json()
    assert data["success"] is True
    assert data["summary"]["total_assists"] == 0

    # Verify subsequent GET shows 0
    final_resp = client.get("/api/help-counter/summary").get_json()
    assert final_resp["summary"]["total_assists"] == 0


def test_api_get_events(client):
    """Verify GET /api/help-counter/events returns logged list."""
    client.post("/api/help-counter/record", json={"event_type": "hint_reveal", "details": {"level": 1}})
    client.post("/api/help-counter/record", json={"event_type": "ai_tutor_ask"})

    resp = client.get("/api/help-counter/events?limit=10")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert len(data["events"]) == 2
    assert data["events"][0]["event_type"] == "hint_reveal"
    assert data["events"][1]["event_type"] == "ai_tutor_ask"
