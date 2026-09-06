"""
Phase A14 — Part A Integration & Testing.

Comprehensive end-to-end integration tests validating the complete Part A engine.

Covers:
1. The Primary Master PRD Flow:
   Custom Question -> Code Editor -> Code Runner -> Error/Output ->
   Diagnostic/Evaluation -> Hint OR AI Tutor -> Help Counter -> Score/Progress
2. Cross-Mode Session Continuity:
   Task Evaluation Mode, Custom Question Mode, and Debug Mode functioning
   seamlessly in a single continuous session with shared help counter and progress engine.
3. Real User Action Driven State Updates:
   A11 Help Counter and A12 Progress & Score Tracker updates triggered by
   realistic student action workflows.
4. Sandbox Safety and Timeout Recovery:
   Subprocess isolation handling infinite loops and runtime errors without
   degrading subsequent evaluation or assistance requests.
5. All 11 Integrated Part A Subsystems:
   Runner (A3), Diagnostics (A4), Evaluator (A5), Hints (A6), AI Tutor (A7),
   AI Config (A8), AI Error Explainer (A9), Custom Questions (A10),
   Help Counter (A11), Progress & Score Engine (A12), and Debugger (A13).
"""

import pytest
from app import create_app
from app.services.help_counter import get_help_counter_session
from app.services.progress import get_progress_tracker


@pytest.fixture
def client():
    """Create Flask test client and reset session stores."""
    app = create_app("testing")
    with app.test_client() as client:
        # Clean session state before test
        get_help_counter_session().reset()
        get_progress_tracker().reset()
        yield client


class TestPRDMasterIntegrationFlow:
    """
    Validates the exact Master PRD main integration flow:
    Custom Question -> Code Editor -> Runner -> Error/Output ->
    Diagnostic/Evaluation -> Hint OR AI Tutor -> Help Counter -> Score/Progress.
    """

    def test_complete_prd_master_flow(self, client):
        # ------------------------------------------------------------------
        # Step 1: Student defines a Custom Question with test cases (Phase A10)
        # ------------------------------------------------------------------
        custom_question = {
            "id": "custom_sum_evens",
            "title": "Sum of Even Numbers up to N",
            "description": "Read an integer N from input and print the sum of all positive even integers <= N.",
            "starter_code": "n = int(input())\n# calculate and print sum of evens\n",
            "test_cases": [
                {
                    "id": "tc_1",
                    "description": "N = 6 -> 2 + 4 + 6 = 12",
                    "stdin": "6",
                    "expected_output": "12",
                    "match_mode": "trimmed"
                },
                {
                    "id": "tc_2",
                    "description": "N = 10 -> 2+4+6+8+10 = 30",
                    "stdin": "10",
                    "expected_output": "30",
                    "match_mode": "trimmed"
                }
            ]
        }

        val_resp = client.post("/api/custom-questions/validate", json=custom_question)
        assert val_resp.status_code == 200
        val_data = val_resp.get_json()
        assert val_data["valid"] is True

        # ------------------------------------------------------------------
        # Step 2: Student enters code with intentional syntax error & runs it (A2 + A3)
        # ------------------------------------------------------------------
        buggy_syntax_code = (
            "n = int(input())\n"
            "for i in range(1, n + 1)\n"  # Missing colon!
            "    pass"
        )

        run_resp = client.post("/api/run", json={"code": buggy_syntax_code, "stdin": "6"})
        assert run_resp.status_code == 200
        run_data = run_resp.get_json()
        assert run_data["status"] == "syntax_error"
        assert "SyntaxError" in run_data["stderr"]

        # ------------------------------------------------------------------
        # Step 3: Diagnostic Engine provides plain-English explanation (Phase A4)
        # ------------------------------------------------------------------
        assert "diagnostic" in run_data
        diagnostic = run_data["diagnostic"]
        assert diagnostic["has_diagnostic"] is True
        assert diagnostic["category"] == "syntax"
        assert diagnostic["error_type"] == "SyntaxError"
        assert diagnostic["line_number"] == 2
        assert "colon" in diagnostic["hint"].lower() or "syntax" in diagnostic["friendly_explanation"].lower()

        # ------------------------------------------------------------------
        # Step 4: Student requests AI Error Explanation (Phase A9)
        #         and logs the assistance event (Phase A11)
        # ------------------------------------------------------------------
        ai_explain_payload = {
            "code": buggy_syntax_code,
            "error_type": diagnostic["error_type"],
            "error_message": diagnostic["friendly_explanation"],
            "line_number": diagnostic["line_number"],
            "traceback": run_data["stderr"],
            "diagnostic": diagnostic
        }
        explain_resp = client.post("/api/ai/explain-error", json=ai_explain_payload)
        assert explain_resp.status_code == 200
        explain_data = explain_resp.get_json()
        assert "headline" in explain_data
        assert "what_it_means" in explain_data or "what_happened" in explain_data
        assert "how_to_think_about_it" in explain_data

        # Log AI Error Explanation event
        help_log_resp = client.post("/api/help-counter/record", json={
            "event_type": "ai_error_explain",
            "details": {
                "error_type": "SyntaxError",
                "line_number": 2,
                "task_id": "custom_sum_evens"
            }
        })
        assert help_log_resp.status_code == 200

        help_summary = client.get("/api/help-counter/summary").get_json()["summary"]
        assert help_summary["ai_error_explanations"] == 1
        assert help_summary["total_assists"] == 1

        # ------------------------------------------------------------------
        # Step 5: Student fixes syntax, but introduces off-by-one logic bug & evaluates (Phase A5)
        # ------------------------------------------------------------------
        buggy_logic_code = (
            "n = int(input())\n"
            "total = 0\n"
            "for i in range(1, n):\n"  # Off-by-one: excludes n!
            "    if i % 2 == 0:\n"
            "        total += i\n"
            "print(total)\n"
        )

        eval_resp = client.post("/api/custom-questions/evaluate", json={
            "code": buggy_logic_code,
            "question": custom_question
        })
        assert eval_resp.status_code == 200
        eval_data = eval_resp.get_json()
        assert eval_data["passed_all"] is False
        assert eval_data["passed_tests"] == 0
        assert eval_data["score_percentage"] == 0.0
        assert len(eval_data["test_results"]) == 2
        # First test expected 12, but actual was 6 (for n=6, loop only went to 5 -> 2+4 = 6)
        assert eval_data["test_results"][0]["passed"] is False
        assert eval_data["test_results"][0]["expected_output"] == "12"
        assert eval_data["test_results"][0]["actual_output"].strip() == "6"

        # ------------------------------------------------------------------
        # Step 6: Student consults Socratic AI Tutor (Phase A7)
        #         and logs tutor assistance event (Phase A11)
        # ------------------------------------------------------------------
        tutor_payload = {
            "code": buggy_logic_code,
            "question": "Why is my sum 6 instead of 12 for N=6?",
            "task": custom_question,
            "evaluation_result": eval_data
        }
        tutor_resp = client.post("/api/tutor/ask", json=tutor_payload)
        assert tutor_resp.status_code == 200
        tutor_data = tutor_resp.get_json()
        assert tutor_data["success"] is True
        assert len(tutor_data["socratic_guidance"]) > 10

        # Log AI Tutor Ask event
        client.post("/api/help-counter/record", json={
            "event_type": "ai_tutor_ask",
            "details": {
                "task_id": "custom_sum_evens",
                "question": "Why is my sum 6 instead of 12 for N=6?"
            }
        })

        help_summary_step6 = client.get("/api/help-counter/summary").get_json()["summary"]
        assert help_summary_step6["ai_tutor_queries"] == 1
        assert help_summary_step6["ai_error_explanations"] == 1
        assert help_summary_step6["total_assists"] == 2

        # ------------------------------------------------------------------
        # Step 7: Student corrects logic to range(1, n + 1) and re-evaluates (Phase A5)
        # ------------------------------------------------------------------
        correct_code = (
            "n = int(input())\n"
            "total = 0\n"
            "for i in range(1, n + 1):\n"
            "    if i % 2 == 0:\n"
            "        total += i\n"
            "print(total)\n"
        )

        eval_resp_fixed = client.post("/api/custom-questions/evaluate", json={
            "code": correct_code,
            "question": custom_question
        })
        assert eval_resp_fixed.status_code == 200
        eval_data_fixed = eval_resp_fixed.get_json()
        assert eval_data_fixed["passed_all"] is True
        assert eval_data_fixed["passed_tests"] == 2
        assert eval_data_fixed["score_percentage"] == 100.0

        # ------------------------------------------------------------------
        # Step 8: Progress & Score Engine records attempt (Phase A12)
        # ------------------------------------------------------------------
        record_resp = client.post("/api/progress/record-attempt", json={
            "task_id": custom_question["id"],
            "task_title": custom_question["title"],
            "category": "custom",
            "score_percentage": eval_data_fixed["score_percentage"],
            "passed_all": eval_data_fixed["passed_all"],
            "passed_tests": eval_data_fixed["passed_tests"],
            "total_tests": eval_data_fixed["total_tests"]
        })
        assert record_resp.status_code == 200
        record_data = record_resp.get_json()
        assert record_data["success"] is True
        assert record_data["task"]["passed"] is True
        assert record_data["task"]["best_score"] == 100.0

        # ------------------------------------------------------------------
        # Step 9: Final Progress Summary verification (Phase A12)
        # ------------------------------------------------------------------
        progress_resp = client.get("/api/progress/summary")
        assert progress_resp.status_code == 200
        summary_data = progress_resp.get_json()["summary"]
        assert summary_data["tasks_completed"] >= 1
        tasks_map = summary_data["tasks"]
        matching_task = tasks_map.get("custom_sum_evens")
        assert matching_task is not None
        assert matching_task["passed"] is True
        assert matching_task["best_score"] == 100.0


class TestCrossModeIntegrationContinuity:
    """
    Validates cross-mode integration continuity across:
    1. Task Evaluation Mode (Starter Tasks)
    2. Debug Mode (Curated Broken Code)
    3. Custom Question Mode (User-authored challenges)
    in a single continuous session with cumulative assistance and score tracking.
    """

    def test_single_session_cross_mode_aggregation(self, client):
        # 1. Mode A: Task Evaluation Mode (Phase A5 + A6 + A11 + A12)
        tasks_resp = client.get("/api/tasks")
        assert tasks_resp.status_code == 200
        starter_task = tasks_resp.get_json()["tasks"][0]  # task_hello

        # Partial attempt
        bad_task_code = "print('hi')"
        eval_starter = client.post("/api/evaluate", json={
            "code": bad_task_code,
            "task": starter_task
        }).get_json()
        assert eval_starter["passed_all"] is False

        # Request progressive hints
        hints_resp = client.post("/api/hints", json={
            "code": bad_task_code,
            "task_id": starter_task["id"],
            "evaluation_result": eval_starter
        })
        assert hints_resp.status_code == 200
        assert hints_resp.get_json()["has_hints"] is True

        # Unlock 2 tiers of hints and record events
        client.post("/api/help-counter/record", json={
            "event_type": "hint_reveal",
            "details": {"task_id": starter_task["id"], "level": 1}
        })
        client.post("/api/help-counter/record", json={
            "event_type": "hint_reveal",
            "details": {"task_id": starter_task["id"], "level": 2}
        })

        # Correct starter task
        good_task_code = "print('Hello, World!')"
        eval_starter_good = client.post("/api/evaluate", json={
            "code": good_task_code,
            "task": starter_task
        }).get_json()
        assert eval_starter_good["passed_all"] is True

        # Record starter task progress
        client.post("/api/progress/record-attempt", json={
            "task_id": starter_task["id"],
            "task_title": starter_task["title"],
            "category": "starter",
            "score_percentage": 100.0,
            "passed_all": True,
            "passed_tests": eval_starter_good["total_tests"],
            "total_tests": eval_starter_good["total_tests"]
        })

        # 2. Mode B: Debug Mode (Phase A13)
        debug_challenges = client.get("/api/debug/challenges").get_json()["challenges"]
        assert len(debug_challenges) >= 5
        challenge = debug_challenges[0]  # debug_syntax_colon

        # Evaluate broken code
        eval_broken_debug = client.post("/api/debug/evaluate", json={
            "challenge_id": challenge["id"],
            "code": challenge["buggy_code"]
        }).get_json()
        assert eval_broken_debug["evaluation"]["passed_all"] is False

        # Repair broken code
        repaired_debug_code = (
            "score = int(input())\n"
            "if score >= 50:\n"
            "    print(\"Passed\")\n"
            "else:\n"
            "    print(\"Failed\")\n"
        )
        eval_fixed_debug = client.post("/api/debug/evaluate", json={
            "challenge_id": challenge["id"],
            "code": repaired_debug_code
        }).get_json()
        assert eval_fixed_debug["evaluation"]["passed_all"] is True
        assert eval_fixed_debug["evaluation"]["score_percentage"] == 100.0

        # 3. Mode C: Custom Question Mode (Phase A10)
        templates_resp = client.get("/api/custom-questions/templates")
        assert templates_resp.status_code == 200
        template = templates_resp.get_json()["templates"][0]  # template_star_triangle

        # Solve template
        template_solution = (
            "n = int(input())\n"
            "for i in range(1, n + 1):\n"
            "    print('*' * i)\n"
        )
        eval_tpl = client.post("/api/custom-questions/evaluate", json={
            "code": template_solution,
            "question": template
        }).get_json()
        assert eval_tpl["passed_all"] is True

        client.post("/api/progress/record-attempt", json={
            "task_id": template["id"],
            "task_title": template["title"],
            "category": "custom",
            "score_percentage": 100.0,
            "passed_all": True,
            "passed_tests": eval_tpl["total_tests"],
            "total_tests": eval_tpl["total_tests"]
        })

        # 4. Verify Cumulative Aggregation in Help Counter (Phase A11)
        help_summary = client.get("/api/help-counter/summary").get_json()["summary"]
        assert help_summary["hints"]["total"] == 2
        assert help_summary["total_assists"] == 2

        # 5. Verify Cumulative Aggregation in Progress Tracker (Phase A12)
        progress_summary = client.get("/api/progress/summary").get_json()["summary"]
        tasks_map = progress_summary["tasks"]

        # All 3 modes should have completed tasks
        starter_done = any(t["category"] == "starter" and t["passed"] for t in tasks_map.values())
        debug_done = any(t["category"] == "debug" and t["passed"] for t in tasks_map.values())
        custom_done = any(t["category"] == "custom" and t["passed"] for t in tasks_map.values())
        assert starter_done is True
        assert debug_done is True
        assert custom_done is True
        assert progress_summary["tasks_completed"] >= 3


class TestUserActionDrivenStateUpdates:
    """
    Verifies that A11 Help Counter and A12 Progress & Score Tracker
    accurately update based on user action sequences.
    """

    def test_progressive_score_updates_preserve_best(self, client):
        task_id = "test_score_progression"

        # Attempt 1: 50%
        r1 = client.post("/api/progress/record-attempt", json={
            "task_id": task_id,
            "task_title": "Score Progression Task",
            "category": "custom",
            "score_percentage": 50.0,
            "passed_all": False,
            "passed_tests": 1,
            "total_tests": 2
        }).get_json()["task"]
        assert r1["attempts_count"] == 1
        assert r1["best_score"] == 50.0
        assert r1["passed"] is False

        # Attempt 2: 100%
        r2 = client.post("/api/progress/record-attempt", json={
            "task_id": task_id,
            "task_title": "Score Progression Task",
            "category": "custom",
            "score_percentage": 100.0,
            "passed_all": True,
            "passed_tests": 2,
            "total_tests": 2
        }).get_json()["task"]
        assert r2["attempts_count"] == 2
        assert r2["best_score"] == 100.0
        assert r2["passed"] is True

        # Attempt 3: 75% (preserves 100.0 best score)
        r3 = client.post("/api/progress/record-attempt", json={
            "task_id": task_id,
            "task_title": "Score Progression Task",
            "category": "custom",
            "score_percentage": 75.0,
            "passed_all": False,
            "passed_tests": 1,
            "total_tests": 2
        }).get_json()["task"]
        assert r3["attempts_count"] == 3
        assert r3["best_score"] == 100.0  # preserved!
        assert r3["passed"] is True

    def test_help_counter_audit_log_captures_user_actions(self, client):
        # 1. Reveal hint
        client.post("/api/help-counter/record", json={
            "event_type": "hint_reveal",
            "details": {"task_id": "t1", "level": 1}
        })
        # 2. Ask tutor
        client.post("/api/help-counter/record", json={
            "event_type": "ai_tutor_ask",
            "details": {"task_id": "t1", "question": "Help me think"}
        })
        # 3. Explain error
        client.post("/api/help-counter/record", json={
            "event_type": "ai_error_explain",
            "details": {"error_type": "ValueError"}
        })

        events_resp = client.get("/api/help-counter/events")
        assert events_resp.status_code == 200
        events = events_resp.get_json()["events"]
        assert len(events) == 3
        event_types = [e["event_type"] for e in events]
        assert event_types == ["hint_reveal", "ai_tutor_ask", "ai_error_explain"]


class TestRunnerIntegrationSafety:
    """
    Verifies sandbox safety and error recovery when running within
    integrated workflows.
    """

    def test_infinite_loop_timeout_does_not_crash_platform(self, client):
        # Infinite loop run
        timeout_code = "while True:\n    pass"
        resp = client.post("/api/run", json={"code": timeout_code})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "timeout"
        assert "timed out" in data["stderr"].lower()

        # Subsequent evaluation should work immediately
        task_code = "print('hello')"
        subsequent_run = client.post("/api/run", json={"code": task_code})
        assert subsequent_run.status_code == 200
        assert subsequent_run.get_json()["status"] == "success"
        assert subsequent_run.get_json()["stdout"].strip() == "hello"


class TestPlatformA14Integrity:
    """
    Verifies that all Part A subsystems and routes are registered and healthy.
    """

    def test_health_reports_phase_a14(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "ok"
        assert data["service"] == "CodeMentor AI Backend"
        assert data["phase"] == "A14"

    def test_all_11_subsystems_reachable(self, client):
        """Confirm all 11 Part A subsystem endpoints respond correctly."""
        # 1. Runner (A3)
        assert client.post("/api/run", json={"code": "print(1)"}).status_code == 200
        # 2. Diagnostics (A4)
        assert client.post("/api/diagnose", json={"status": "syntax_error", "stderr": "SyntaxError: invalid syntax", "code": "x="}).status_code == 200
        # 3. Evaluator (A5)
        assert client.get("/api/tasks").status_code == 200
        # 4. Hints (A6)
        assert client.post("/api/hints", json={"code": "print(1)", "task_id": "task_hello"}).status_code == 200
        # 5. AI Tutor (A7)
        assert client.post("/api/tutor/ask", json={"code": "x = 1"}).status_code == 200
        # 6. AI Config (A8)
        assert client.get("/api/ai/config").status_code == 200
        # 7. AI Error Explainer (A9)
        assert client.post("/api/ai/explain-error", json={"code": "x=", "error_type": "SyntaxError", "error_message": "invalid syntax"}).status_code == 200
        # 8. Custom Questions (A10)
        assert client.get("/api/custom-questions/templates").status_code == 200
        # 9. Help Counter (A11)
        assert client.get("/api/help-counter/summary").status_code == 200
        # 10. Progress Tracker (A12)
        assert client.get("/api/progress/summary").status_code == 200
        # 11. Debugger (A13)
        assert client.get("/api/debug/challenges").status_code == 200
