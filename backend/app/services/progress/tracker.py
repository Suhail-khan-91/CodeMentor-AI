"""
CodeMentor AI — Progress Tracker Service (Phase A12).

In-memory session manager for tracking student task completion, attempts,
scores, and assistance correlation for Part A.
"""

import threading
import uuid
from typing import Dict, Any, Optional
from app.services.evaluator.sample_tasks import SAMPLE_TASKS
from app.services.progress.models import (
    AttemptRecord,
    TaskProgressRecord,
    ProgressSummary,
    current_iso_time,
)
from app.services.help_counter.session import get_help_counter_session


class ProgressTracker:
    """Thread-safe, in-memory progress and score tracking service."""

    def __init__(self):
        self._lock = threading.Lock()
        self._tasks: Dict[str, TaskProgressRecord] = {}
        self.reset()

    def reset(self) -> None:
        """Reset all task progress, attempts, and scores back to initial state."""
        with self._lock:
            self._tasks.clear()
            # Seed with official starter tasks from Phase A5
            for task in SAMPLE_TASKS:
                self._tasks[task.id] = TaskProgressRecord(
                    task_id=task.id,
                    title=task.title,
                    category="starter",
                    status="not_attempted",
                    passed=False,
                    attempts_count=0,
                    best_score=0.0,
                    latest_score=0.0,
                )

    def record_attempt(
        self,
        task_id: str,
        score_percentage: float,
        passed_all: bool,
        passed_tests: int,
        total_tests: int,
        task_title: Optional[str] = None,
        category: str = "starter",
        assistance_snapshot: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Record a student task evaluation attempt.

        :param task_id: Identifier for the task (e.g. 'task_hello' or custom ID)
        :param score_percentage: Score attained (0.0 to 100.0)
        :param passed_all: True if all test cases passed
        :param passed_tests: Number of test cases that passed
        :param total_tests: Total number of test cases evaluated
        :param task_title: Optional human-readable title
        :param category: 'starter' or 'custom'
        :param assistance_snapshot: Snapshot of assistance metrics at time of evaluation
        :return: Dict containing updated task progress and summary
        """
        if not task_id or not isinstance(task_id, str):
            raise ValueError("Invalid task_id: must be a non-empty string.")

        score_percentage = float(max(0.0, min(100.0, score_percentage)))
        now = current_iso_time()

        if assistance_snapshot is None:
            try:
                assistance_snapshot = get_help_counter_session().get_summary()
            except Exception:
                assistance_snapshot = {}

        attempt = AttemptRecord(
            attempt_id=f"att_{uuid.uuid4().hex[:8]}",
            task_id=task_id,
            task_title=task_title or task_id,
            category=category,
            score_percentage=score_percentage,
            passed_all=bool(passed_all),
            passed_tests=max(0, int(passed_tests)),
            total_tests=max(0, int(total_tests)),
            timestamp=now,
            assistance_snapshot=assistance_snapshot,
        )

        with self._lock:
            if task_id not in self._tasks:
                self._tasks[task_id] = TaskProgressRecord(
                    task_id=task_id,
                    title=task_title or task_id,
                    category=category,
                    status="not_attempted",
                    passed=False,
                    attempts_count=0,
                    best_score=0.0,
                    latest_score=0.0,
                )

            record = self._tasks[task_id]
            if task_title and record.title == record.task_id:
                record.title = task_title
            record.category = category

            record.attempts_count += 1
            if record.first_attempt_at is None:
                record.first_attempt_at = now
            record.last_attempt_at = now

            record.latest_score = score_percentage
            record.best_score = max(record.best_score, score_percentage)

            if passed_all:
                record.passed = True
                record.status = "completed"
                if record.completed_at is None:
                    record.completed_at = now
            elif record.status != "completed":
                record.status = "in_progress"

            record.attempts.append(attempt)
            task_dict = record.to_dict()

        summary_dict = self.get_summary().to_dict()
        return {
            "task": task_dict,
            "summary": summary_dict,
        }

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve progress record for a specific task."""
        with self._lock:
            record = self._tasks.get(task_id)
            return record.to_dict() if record else None

    def get_summary(self) -> ProgressSummary:
        """Calculate and return aggregated progress summary across all tasks."""
        with self._lock:
            total_starter = sum(1 for r in self._tasks.values() if r.category == "starter")
            tasks_attempted = sum(1 for r in self._tasks.values() if r.attempts_count > 0)
            starter_completed = sum(
                1 for r in self._tasks.values() if r.category == "starter" and r.passed
            )
            total_completed = sum(1 for r in self._tasks.values() if r.passed)
            total_attempts = sum(r.attempts_count for r in self._tasks.values())

            attempted_tasks = [r for r in self._tasks.values() if r.attempts_count > 0]
            avg_best_score = (
                sum(r.best_score for r in attempted_tasks) / len(attempted_tasks)
                if attempted_tasks
                else 0.0
            )

            # Completion percentage based on starter tasks (or capped at 100.0)
            completion_pct = (
                (starter_completed / total_starter * 100.0) if total_starter > 0 else 0.0
            )

            tasks_map = {tid: r.to_dict() for tid, r in self._tasks.items()}

        try:
            help_summary = get_help_counter_session().get_summary()
            total_assists = help_summary.get("total_assists", 0)
        except Exception:
            total_assists = 0

        return ProgressSummary(
            total_tasks_available=total_starter,
            tasks_attempted=tasks_attempted,
            tasks_completed=total_completed,
            completion_percentage=completion_pct,
            total_attempts=total_attempts,
            average_best_score=avg_best_score,
            total_assists_linked=total_assists,
            tasks=tasks_map,
        )


# Global singleton instance for in-memory session tracking
_progress_tracker = ProgressTracker()


def get_progress_tracker() -> ProgressTracker:
    """Get the active singleton ProgressTracker instance."""
    return _progress_tracker
