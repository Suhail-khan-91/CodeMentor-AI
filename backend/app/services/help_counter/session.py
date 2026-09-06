"""
CodeMentor AI — Help & AI Usage Counter Service (Phase A11).

Maintains in-memory, session-scoped tracking of student assistance usage:
- Phase A6: Deterministic rule-based hint reveals (Levels 1, 2, 3)
- Phase A7: Socratic AI Tutor queries
- Phase A9: AI Error Explanation requests

Strictly scoped to session tracking for Part A without database persistence,
scoring penalties, or user profiles.
"""

import time
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional

VALID_ASSIST_TYPES = {"hint_reveal", "ai_tutor_ask", "ai_error_explain"}


@dataclass
class AssistEvent:
    """Individual assistance event logged during the session."""
    id: str
    event_type: str
    timestamp: float
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "event_type": self.event_type,
            "timestamp": self.timestamp,
            "details": self.details
        }


class HelpCounterSession:
    """In-memory session manager for tracking student help usage."""

    def __init__(self):
        self.reset()

    def reset(self) -> None:
        """Reset all categorical counters and event logs for a fresh session."""
        self._hints_l1: int = 0
        self._hints_l2: int = 0
        self._hints_l3: int = 0
        self._ai_tutor_queries: int = 0
        self._ai_error_explanations: int = 0
        self._events: List[AssistEvent] = []

    def record_event(self, event_type: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Record a student assistance event and increment category counters.

        :param event_type: One of 'hint_reveal', 'ai_tutor_ask', 'ai_error_explain'.
        :param details: Optional context metadata (e.g. level, task_id, error_type).
        :return: Updated summary dictionary.
        """
        if event_type not in VALID_ASSIST_TYPES:
            raise ValueError(f"Invalid event_type '{event_type}'. Must be one of {sorted(list(VALID_ASSIST_TYPES))}")

        details = details or {}
        event_id = f"evt_{len(self._events) + 1}_{int(time.time() * 1000)}"
        event = AssistEvent(
            id=event_id,
            event_type=event_type,
            timestamp=time.time(),
            details=details
        )
        self._events.append(event)

        if event_type == "hint_reveal":
            level = details.get("level", 1)
            try:
                level_int = int(level)
            except (ValueError, TypeError):
                level_int = 1

            if level_int == 1:
                self._hints_l1 += 1
            elif level_int == 2:
                self._hints_l2 += 1
            elif level_int == 3:
                self._hints_l3 += 1
            else:
                self._hints_l1 += 1
        elif event_type == "ai_tutor_ask":
            self._ai_tutor_queries += 1
        elif event_type == "ai_error_explain":
            self._ai_error_explanations += 1

        return self.get_summary()

    def get_summary(self) -> Dict[str, Any]:
        """Compute and return cumulative assistance counts and breakdowns."""
        total_hints = self._hints_l1 + self._hints_l2 + self._hints_l3
        total_assists = total_hints + self._ai_tutor_queries + self._ai_error_explanations

        return {
            "total_assists": total_assists,
            "hints": {
                "total": total_hints,
                "level_1_nudge": self._hints_l1,
                "level_2_strategy": self._hints_l2,
                "level_3_structure": self._hints_l3
            },
            "ai_tutor_queries": self._ai_tutor_queries,
            "ai_error_explanations": self._ai_error_explanations,
            "total_events_logged": len(self._events)
        }

    def get_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Return the most recent assistance events."""
        return [e.to_dict() for e in self._events[-limit:]]


# Global in-memory singleton for active session
_HELP_COUNTER_INSTANCE: Optional[HelpCounterSession] = None


def get_help_counter_session() -> HelpCounterSession:
    """Retrieve or initialize the active help counter session."""
    global _HELP_COUNTER_INSTANCE
    if _HELP_COUNTER_INSTANCE is None:
        _HELP_COUNTER_INSTANCE = HelpCounterSession()
    return _HELP_COUNTER_INSTANCE
