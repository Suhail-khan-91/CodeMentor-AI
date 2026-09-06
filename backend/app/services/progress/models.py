"""
CodeMentor AI — Progress & Score Engine Models (Phase A12).

Data structures for tracking student task completion, attempts,
scores, pass/fail status, and assistance usage correlation.
Strictly in-memory / session-scoped for Part A.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


def current_iso_time() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class AttemptRecord:
    """Record of a single task evaluation attempt."""
    attempt_id: str
    task_id: str
    task_title: str
    category: str  # 'starter' | 'custom'
    score_percentage: float
    passed_all: bool
    passed_tests: int
    total_tests: int
    timestamp: str = field(default_factory=current_iso_time)
    assistance_snapshot: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "attempt_id": self.attempt_id,
            "task_id": self.task_id,
            "task_title": self.task_title,
            "category": self.category,
            "score_percentage": round(self.score_percentage, 2),
            "passed_all": self.passed_all,
            "passed_tests": self.passed_tests,
            "total_tests": self.total_tests,
            "timestamp": self.timestamp,
            "assistance_snapshot": self.assistance_snapshot,
        }


@dataclass
class TaskProgressRecord:
    """Cumulative progress metrics for a specific programming task."""
    task_id: str
    title: str
    category: str = "starter"  # 'starter' | 'custom'
    status: str = "not_attempted"  # 'not_attempted' | 'in_progress' | 'completed'
    passed: bool = False
    attempts_count: int = 0
    best_score: float = 0.0
    latest_score: float = 0.0
    first_attempt_at: Optional[str] = None
    last_attempt_at: Optional[str] = None
    completed_at: Optional[str] = None
    attempts: List[AttemptRecord] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "title": self.title,
            "category": self.category,
            "status": self.status,
            "passed": self.passed,
            "attempts_count": self.attempts_count,
            "best_score": round(self.best_score, 2),
            "latest_score": round(self.latest_score, 2),
            "first_attempt_at": self.first_attempt_at,
            "last_attempt_at": self.last_attempt_at,
            "completed_at": self.completed_at,
            "attempts": [a.to_dict() for a in self.attempts[-10:]],  # keep last 10 attempts
        }


@dataclass
class ProgressSummary:
    """Aggregated global progress metrics across all tasks in the session."""
    total_tasks_available: int
    tasks_attempted: int
    tasks_completed: int
    completion_percentage: float
    total_attempts: int
    average_best_score: float
    total_assists_linked: int
    tasks: Dict[str, Dict[str, Any]] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_tasks_available": self.total_tasks_available,
            "tasks_attempted": self.tasks_attempted,
            "tasks_completed": self.tasks_completed,
            "completion_percentage": round(self.completion_percentage, 1),
            "total_attempts": self.total_attempts,
            "average_best_score": round(self.average_best_score, 1),
            "total_assists_linked": self.total_assists_linked,
            "tasks": self.tasks,
        }
