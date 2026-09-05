"""
CodeMentor AI — Hint System Data Models (Phase A6).

Defines structured models for tiered hints, deterministic hint rules, and hint responses.
Compatible with future Phase A7 AI Tutor through standardized 3-tier schema and source tracking.
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, Callable, List
from app.services.evaluator.base import EvaluationResult, TaskDefinition


@dataclass
class TieredHint:
    """Standardized 3-tier progressive hint package."""
    level_1_nudge: str        # Conceptual Nudge (mental model, zero syntax)
    level_2_strategy: str     # Strategy / Approach (algorithmic guidance)
    level_3_clue: str         # Structural Clue (skeleton pattern, never complete solution)
    rule_id: str
    rule_name: str
    source: str = "rule_based"  # "rule_based" (A6) | "ai_tutor" (A7 future)
    matched_mistake: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "level_1_nudge": self.level_1_nudge,
            "level_2_strategy": self.level_2_strategy,
            "level_3_clue": self.level_3_clue,
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "source": self.source,
            "matched_mistake": self.matched_mistake
        }


@dataclass
class HintRule:
    """Definition of a deterministic rule-based hint pattern."""
    id: str
    name: str
    description: str
    task_id: Optional[str] = None     # None = general rule, or specific task ID (e.g. "task_even_odd")
    priority: int = 100               # Higher priority rules evaluated first (1-1000)
    level_1_nudge: str = ""
    level_2_strategy: str = ""
    level_3_clue: str = ""
    matcher: Optional[Callable[[str, Optional[EvaluationResult], Optional[TaskDefinition]], bool]] = None

    def matches(
        self,
        code: str,
        evaluation_result: Optional[EvaluationResult] = None,
        task: Optional[TaskDefinition] = None
    ) -> bool:
        """Evaluate if the student code and evaluation result trigger this rule."""
        if self.task_id and task and task.id != self.task_id:
            return False
        if self.matcher:
            try:
                return self.matcher(code, evaluation_result, task)
            except Exception:
                return False
        return False

    def to_tiered_hint(self) -> TieredHint:
        return TieredHint(
            level_1_nudge=self.level_1_nudge,
            level_2_strategy=self.level_2_strategy,
            level_3_clue=self.level_3_clue,
            rule_id=self.id,
            rule_name=self.name,
            source="rule_based",
            matched_mistake=self.description
        )


@dataclass
class HintResponse:
    """Response returned to client containing progressive hints."""
    has_hints: bool
    rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    matched_mistake: Optional[str] = None
    hints: Optional[Dict[str, str]] = None
    source: str = "rule_based"
    total_levels: int = 3

    def to_dict(self) -> Dict[str, Any]:
        return {
            "has_hints": self.has_hints,
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "matched_mistake": self.matched_mistake,
            "hints": self.hints,
            "source": self.source,
            "total_levels": self.total_levels
        }
